import json
import subprocess
from typing import Any

from scripts.ci import migration_roundtrip as rt

PLAN = "[X]  contenttypes.0001_initial\n[X]  auth.0001_initial\n[X]  auth.0002_x\n"


class FakeRun:
    def __init__(self, tags: str = "", state: dict[str, str] | None = None, fail_on: str = ""):
        self.tags, self.state, self.fail_on = tags, state, fail_on
        self.calls: list[list[str]] = []

    def __call__(self, cmd: list[str], **kwargs: Any) -> subprocess.CompletedProcess[str]:
        self.calls.append(cmd)
        if self.fail_on and self.fail_on in cmd:
            raise subprocess.CalledProcessError(1, cmd)
        out = ""
        if "showmigrations" in cmd:
            out = PLAN
        elif cmd[:2] == ["git", "tag"]:
            out = self.tags
        elif cmd[:2] == ["git", "show"]:
            out = json.dumps(self.state)
        return subprocess.CompletedProcess(cmd, 0, stdout=out)

    def migrates(self) -> list[list[str]]:
        return [c[2:] for c in self.calls if "migrate" in c]


def test_roundtrip_from_zero_when_no_release_tag():
    run = FakeRun()
    assert rt.main(run) == 0
    assert run.migrates() == [
        ["migrate", "--noinput"],
        ["migrate", "--noinput", "auth", "zero"],
        ["migrate", "--noinput", "contenttypes", "zero"],
        ["migrate", "--noinput"],
    ]


def test_roundtrip_to_previous_release_state():
    run = FakeRun(
        tags="release/2026-11-01\n",
        state={"auth": "0001_initial", "contenttypes": "0001_initial"},
    )
    assert rt.main(run) == 0
    assert ["git", "show", "release/2026-11-01:app/migrations-at-release.json"] in run.calls
    assert run.migrates() == [
        ["migrate", "--noinput"],
        ["migrate", "--noinput", "auth", "0001_initial"],
        ["migrate", "--noinput", "contenttypes", "0001_initial"],
        ["migrate", "--noinput"],
    ]


def test_exits_nonzero_on_failure():
    run = FakeRun(fail_on="zero")  # a migration that cannot be reversed
    assert rt.main(run) == 1
    # It stops at the failing step and never migrates forward again.
    assert run.migrates()[-1] == ["migrate", "--noinput", "auth", "zero"]


def test_picks_newest_tag_and_passes_sort_args():
    run = FakeRun(
        tags="release/2026-11-20\nrelease/2026-11-01\n",
        state={"auth": "0001_initial", "contenttypes": "0001_initial"},
    )
    assert rt.main(run) == 0
    assert ["git", "tag", "--list", "release/*", "--sort=-creatordate"] in run.calls
    assert ["git", "show", "release/2026-11-20:app/migrations-at-release.json"] in run.calls
    assert not any("release/2026-11-01" in " ".join(c) for c in run.calls)


def test_app_missing_from_release_json_goes_to_zero():
    run = FakeRun(tags="release/a\n", state={"auth": "0001_initial"})
    assert rt.main(run) == 0
    assert ["migrate", "--noinput", "contenttypes", "zero"] in run.migrates()
    assert ["migrate", "--noinput", "auth", "0001_initial"] in run.migrates()


def test_returns_1_when_release_json_cannot_be_read():
    run = FakeRun(tags="release/a\n", fail_on="show")
    assert rt.main(run) == 1
    assert run.migrates() == [["migrate", "--noinput"]]
