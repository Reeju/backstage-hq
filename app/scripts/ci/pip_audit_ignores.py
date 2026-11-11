"""Turn pip-audit-ignore.toml into --ignore-vuln flags; fail on expired or reasonless entries."""

from __future__ import annotations

import datetime as dt
import re
import sys
import tomllib
from pathlib import Path
from typing import Any

ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]+$")
MAX_DAYS = 90


def build_flags(data: dict[str, Any], today: dt.date) -> list[str]:
    flags: list[str] = []
    problems: list[str] = []
    for entry in data.get("ignore", []):
        vuln_id = str(entry.get("id", "")).strip()
        reason = str(entry.get("reason", "")).strip()
        expires = entry.get("expires")
        if not vuln_id:
            problems.append("an entry has no id")
            continue
        if not ID_PATTERN.match(vuln_id):
            problems.append(f"{vuln_id!r}: id may only contain letters, digits, '.', '_' and '-'")
            continue
        if not reason:
            problems.append(f"{vuln_id}: missing reason")
        # datetime is a subclass of date, so it must be rejected first.
        if isinstance(expires, dt.datetime) or not isinstance(expires, dt.date):
            problems.append(f"{vuln_id}: expires must be a plain date (YYYY-MM-DD)")
        elif expires < today:
            problems.append(f"{vuln_id}: expired on {expires}")
        elif expires > today + dt.timedelta(days=MAX_DAYS):
            problems.append(f"{vuln_id}: expiry {expires} is more than {MAX_DAYS} days away")
        flags += ["--ignore-vuln", vuln_id]
    if problems:
        raise ValueError("; ".join(problems))
    return flags


def main(argv: list[str], today: dt.date | None = None) -> int:
    path = Path(argv[0])
    try:
        data = tomllib.loads(path.read_text())
        flags = build_flags(data, today or dt.date.today())  # noqa: DTZ011
    except (OSError, ValueError) as exc:
        print(f"pip-audit ignore list invalid: {exc}", file=sys.stderr)
        return 1
    print(" ".join(flags))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
