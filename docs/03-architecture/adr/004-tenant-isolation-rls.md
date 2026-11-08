# ADR-004: Tenant isolation with workspace ID on every row plus Postgres row-level security

**Status:** Proposed

## Context
NFR-001 and NFR-023: one creator's data must never reach another creator, a manager's other
workspace, a search, a notification or the assistant. A single forgotten filter in app code must not
be enough to leak data.

## Decision
- Shared database and schema. Every business table has `workspace_id NOT NULL`.
- **Lock 1, app:** workspace in every URL (`/w/<id>/...`); membership checked per request; jobs carry
  the workspace; models refuse queries without a workspace context.
- **Lock 2, database:** RLS enabled and forced on every business table, policy
  `workspace_id = current_setting('app.workspace_id', true)::uuid`, set with `SET LOCAL` per
  transaction. Not set means no rows. The app's database roles do not own tables and cannot bypass RLS.
- **Lock 3, keys:** encrypted fields are bound to workspace and row (ADR-005).
- Cross-workspace scheduling uses a short list of `SECURITY DEFINER` functions that return IDs only;
  the follow-up job runs inside the workspace's RLS context.

**Appendix, allowed cross-workspace functions (initial):** `due_reminders()`, `due_digests()`,
`expiring_approvals()`, `due_deletions()`, `token_refresh_due()`, invariant monitor checks. Adding one
needs a reviewer-approved change to this list.

## Options considered
| Option | For | Against |
|---|---|---|
| **Shared schema + RLS (chosen)** | Cheap; one migration run; database enforces isolation | Must remember `SET LOCAL` in every path (tested) |
| Schema per workspace | Strong separation | Thousands of schemas; slow migrations; manager switcher harder |
| Database per workspace | Strongest | Far too costly for solo creators |
| App filtering only | Simple | One bug leaks data |

## Consequences
- A meta-test fails if any table with `workspace_id` lacks forced RLS and a policy; cross-tenant tests
  run for every model.
- Slight overhead per query; negligible at this size.
