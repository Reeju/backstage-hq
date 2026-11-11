# ADR-004: Tenant isolation with workspace ID on every row plus Postgres row-level security

**Status:** Accepted (approved with the architecture, commit 1abed76) · Amended for CR-001, C9

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
  No role of ours has `BYPASSRLS` at all (Amended for CR-001, C9; see below).
- **Lock 3, keys:** encrypted fields are bound to workspace and row (ADR-005).
- Cross-workspace scheduling uses a short list of `SECURITY DEFINER` functions that return IDs only;
  the follow-up job runs inside the workspace's RLS context.

**Appendix, allowed cross-workspace functions (initial):** `due_reminders()`, `due_digests()`,
`expiring_approvals()`, `due_deletions()`, `token_refresh_due()`, invariant monitor checks,
`user_workspace_ids(user_id)` (Amended for iteration 1, D2). Adding one needs a reviewer-approved
change to this list. `due_reminders()` also returns reminders `held` for the sending window
(architecture §13, AR2).

**User's workspaces (Amended for iteration 1, D2.)** `user_workspace_ids(user_id)` is a
`SECURITY DEFINER` function owned by `bhq_crossws`. It returns only the workspace IDs where that user
has an active membership. `bhq_web` and `bhq_worker` may execute it. Membership rows are behind RLS,
so this is the one narrow, ID-only way to read them before a workspace context exists (architecture
§11.3). It is needed after sign-in, and for security events that must be logged in the workspaces the
user owns.

**Aggregate exception (Amended after mockups, AR4):** `price_test_collected_rollup(month)` is the one
function that does not return IDs. It sums "collected after reminders" per price point inside the
database, writes `platform.price_test_rollup` (no workspace or user column) itself, and stores no
amount for a group of fewer than 5 creators. It returns only a row count. All these functions are
owned by the no-login role `bhq_crossws`; the worker may only execute them (architecture §11.2–11.3). The one exception is `user_workspace_ids`, which the web role may also execute. (Amended for iteration 1, D2.)

**Global search (Amended after mockups, AR5.)** The search index `search_entry` is an ordinary
business table: `workspace_id NOT NULL`, RLS enabled and forced, covered by the meta-test. Search runs
as `bhq_web` in the workspace's RLS context and uses no cross-workspace function, so nothing is added
to the appendix above. v1 role filtering (records a person may not open, and amounts for a person who
may not see them) is applied inside the search query, so result counts never include hidden records
(architecture §16A.4, ADR-020).

**No role bypasses RLS (Amended for CR-001, C9.)** Managed PostgreSQL services (DigitalOcean, Render,
Cloud SQL, RDS) do not give superuser, and only a superuser (or a role that already has the attribute)
can create a role with `BYPASSRLS`. So no role of ours has it, which also makes the design portable:
- `bhq_crossws` (no login) reads across workspaces through **role-scoped read policies**: a `SELECT`
  policy `crossws_read ... TO bhq_crossws USING (true)` on exactly the tables its functions read
  (today `workspaces_membership`; the tables of the later functions are listed with each function in the
  appendix above). Permissive policies combine with OR, so the policy opens rows to `bhq_crossws` only.
- No app role (`bhq_web`, `bhq_worker`, `bhq_eraser`) is ever a member of `bhq_crossws` or `bhq_backup`,
  because a policy `TO` a role also applies to its members. `bhq_migrator` gets membership in
  `bhq_crossws` **without inheritance** (`WITH INHERIT FALSE, SET TRUE`, PostgreSQL 16+) only so a
  migration can hand function ownership to it; a test proves `bhq_migrator` still sees no rows without a
  workspace context.
- `bhq_backup` (login, read-only, from V1): a `backup_read` `SELECT` policy `TO bhq_backup USING (true)`
  on every table, used only by the hourly backup job with `pg_dump --enable-row-security` (ADR-022). It
  has no write grants. Restores run as `bhq_migrator` into a fresh database with RLS temporarily not
  forced, then forced again before the meta-test runs; the runbook lives with the restore drill.
- Role bootstrap (`db_bootstrap_roles`) must work as a provider admin that has `CREATEROLE` but not
  superuser; CI runs it that way to prove it.
- The meta-test checks that every table with `workspace_id` has `workspace_isolation`, and that any other
  policy is one of the allowed role-scoped read policies (`crossws_read` only on tables in the appendix,
  `backup_read`), and that no role of ours has `rolbypassrls`.

## Options considered
| Option | For | Against |
|---|---|---|
| **Shared schema + RLS (chosen)** | Cheap; one migration run; database enforces isolation | Must remember `SET LOCAL` in every path (tested) |
| Schema per workspace | Strong separation | Thousands of schemas; slow migrations; manager switcher harder |
| Database per workspace | Strongest | Far too costly for solo creators |
| App filtering only | Simple | One bug leaks data |
| A `BYPASSRLS` role for cross-workspace functions (the original plan) | Simple to write | Cannot be created on managed PostgreSQL without superuser; replaced by role-scoped read policies (C9) |

## Consequences
- A meta-test fails if any table with `workspace_id` lacks forced RLS and a policy; cross-tenant tests
  run for every model.
- Slight overhead per query; negligible at this size.
