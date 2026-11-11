# ADR-017: Reversible migrations with expand/contract

**Status:** Accepted (approved with the architecture, commit 1abed76)

## Context
The brief requires migrations that can roll back. Any release must be revertible in minutes without
losing money records.

## Decision
- Django migrations only. Every migration must be reversible; `RunPython` always has `reverse_code`.
- **Expand/contract:** first release adds new columns or tables and writes to both; a later release
  stops using and drops the old ones. The running version always works on the newer schema.
- Data-losing steps need a note in the ticket and only run in a contract release.
- Long backfills run as jobs, not inside migrations.
- CI applies all migrations from empty, then migrates down to the previous release and up again.
- Production takes an on-demand database snapshot before running migrations.

## Options considered
| Option | For | Against |
|---|---|---|
| **Reversible + expand/contract (chosen)** | Code rollback is a redeploy; schema rollback possible | Some changes take two releases |
| Forward-only migrations | Less work | A bad release can only be fixed forward or by restore |
| Restore from backup to roll back | Always possible | Loses data written since; slow |

## Consequences
- Rollback is "redeploy the previous image", which is fast and safe.
- Builders must follow the two-step pattern. The reviewer checks it.
