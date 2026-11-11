# ADR-010: Append-only activity log

**Status:** Accepted (approved with the architecture, commit 1abed76)

## Context
FR-213, NFR-032 to NFR-034: one log per workspace, plain words, real actor and on whose behalf, nobody
can edit or delete entries, entries removed only with the workspace, and staff and system actions
included.

## Decision
- `activity_log` is written by the Action runner in the same transaction as the change.
- App database roles have INSERT and SELECT only. A trigger refuses UPDATE and DELETE. Only the
  `bhq_eraser` role (deletion job) may delete, and only a whole workspace.
- Each entry stores the previous entry's hash and its own. A nightly job verifies the chain.
- A `visibility` tag lets non-owners see only entries their permissions allow (v1).
- Technical logs (CloudWatch) are separate and contain no personal data.

## Options considered
| Option | For | Against |
|---|---|---|
| **Table in Postgres, DB-enforced append-only, hash chain (chosen)** | Same transaction as the change; simple to query and export | Grows with use (small at this scale) |
| Separate log service or ledger database | Strong immutability | Not transactional with changes; extra cost |
| Application logs as audit | No extra work | Not product data; not exportable; not reliable |

## Consequences
- "If it happened, it is logged" holds by construction.
- The log is included in the full export (NFR-033).
