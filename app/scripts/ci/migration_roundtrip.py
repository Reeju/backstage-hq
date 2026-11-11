"""Migration round-trip check (ADR-017, architecture section 20.3).

1. migrate from empty;
2. migrate back: to the state recorded for the newest ``release/*`` git tag
   (``app/migrations-at-release.json`` as committed with that tag), or to ``zero``
   for every app when no release exists yet;
3. migrate forward again.

Any failing command makes the script exit non-zero. An irreversible migration fails step 2.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from collections.abc import Callable, Sequence

MANAGE = [sys.executable, "manage.py"]
RELEASE_STATE_PATH = "app/migrations-at-release.json"
PLAN_LINE = re.compile(r"^\[[ X]\]\s+(\S+)\.(\S+)")

Run = Callable[..., subprocess.CompletedProcess[str]]


def _run(cmd: Sequence[str], run: Run, capture: bool = False) -> str:
    print("+", " ".join(cmd), flush=True)
    result = run(list(cmd), check=True, text=True, capture_output=capture)
    return result.stdout if capture else ""


def apps_in_plan(run: Run) -> list[str]:
    """App labels with migrations, in apply order."""
    out = _run([*MANAGE, "showmigrations", "--plan"], run, capture=True)
    apps: list[str] = []
    for line in out.splitlines():
        match = PLAN_LINE.match(line.strip())
        if match and match.group(1) not in apps:
            apps.append(match.group(1))
    return apps


def previous_release_state(run: Run) -> dict[str, str] | None:
    """Migration state of the newest release/* tag, or None if there is no release yet."""
    tags = _run(
        ["git", "tag", "--list", "release/*", "--sort=-creatordate"], run, capture=True
    ).split()
    if not tags:
        return None
    raw = _run(["git", "show", f"{tags[0]}:{RELEASE_STATE_PATH}"], run, capture=True)
    state = json.loads(raw)
    return {str(app): str(name) for app, name in state.items()}


def roundtrip(run: Run = subprocess.run) -> None:
    _run([*MANAGE, "migrate", "--noinput"], run)

    state = previous_release_state(run)
    apps = apps_in_plan(run)
    # Reverse apply order so dependents are unapplied before what they depend on.
    for app in reversed(apps):
        target = "zero" if state is None else state.get(app, "zero")
        _run([*MANAGE, "migrate", "--noinput", app, target], run)

    _run([*MANAGE, "migrate", "--noinput"], run)


def main(run: Run = subprocess.run) -> int:
    try:
        roundtrip(run)
    except (subprocess.CalledProcessError, OSError, ValueError) as exc:
        print(f"migration round-trip FAILED: {exc}", file=sys.stderr)
        return 1
    print("migration round-trip OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
