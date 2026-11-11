"""Turn pip-audit-ignore.toml into --ignore-vuln flags; fail on expired or reasonless entries."""

from __future__ import annotations

import datetime as dt
import sys
import tomllib
from pathlib import Path
from typing import Any


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
        if not reason:
            problems.append(f"{vuln_id}: missing reason")
        if not isinstance(expires, dt.date):
            problems.append(f"{vuln_id}: missing or invalid expiry date")
        elif expires < today:
            problems.append(f"{vuln_id}: expired on {expires}")
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
