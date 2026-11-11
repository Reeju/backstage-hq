# ADR-023: Validation phase: environments, invite-only access and deferred flags

**Status:** Proposed (CR-001, changes C2 and C5; 2026-11-11)

## Context
PRD section 4.5 (GL20) adds a validation phase before the MVP beta: **V0** (owner only, dummy data,
staging, personal accounts) and **V1** (up to 10 invited creators in India, real data, a separate
low-cost production, never staging). FR-006 makes sign-up invite-only in that phase; FR-005 AC2 sends
people from unsupported countries to a waitlist. Some requirements are deferred with a flag, never
dropped, and the exit cannot pass while a flag remains.

## Decision
**Environments.**
| Environment | Phase | Data | Setup |
|---|---|---|---|
| Local, CI | All | Synthetic | Docker Compose, GitHub Actions (unchanged) |
| Staging | V0 onward | Dummy data only, for ever | DigitalOcean project `bhq-staging` + AWS staging account (ADR-022); personal accounts allowed |
| Production (low cost) | V1 | Real, up to 10 invited creators | DigitalOcean project `bhq-production` + AWS production account, in the business's name or transferable (GQ8) |
| Production (full) | After the exit | Real | Same production, scaled (ADR-022) |

Staging and production share Terraform modules and differ only in variables. Production never runs a
fake email, SMS or KMS backend (Django system checks fail the deploy).

**Invite-only access (FR-006).**
- Setting `BHQ_INVITE_ONLY` (default `true`; turned off at the full setup, FR-006 AC4).
- Table `invite` (platform-level, no workspace, outside RLS by design; readable and writable only by
  the app roles through the `accounts` module): normalised email (unique), who added it, when, when
  removed. Checked **before** a sign-up code is sent; a person not invited gets "BackstageHQ is
  invite-only for now" and the waitlist, and no email is sent (FR-006 AC1). Existing users are not
  re-checked at sign-in.
- Staff add and remove invites with a management command (a staff screen comes with staff sign-in,
  iteration 11). The change takes effect at once and is written to the **staff log** (FR-006 AC3).

**Staff log.** Table `staff_event` (platform-level, append-only like the activity log: insert and
select only, a trigger refuses update and delete): staff actor, action, a hashed subject, time. It
records staff actions that touch no workspace (invites now; more later). Staff actions inside a
workspace still go to that workspace's activity log (architecture §10.5).

**Waitlist (FR-005 AC2, AC5).** Table `waitlist_entry` (platform-level): email, country code, consent
text version and time, a hashed removal token. No workspace is created. Kept until the person's country
is supported and they are invited, or until they remove themselves (deleted within 7 days of using the
remove link, FR-005 AC5), and at most 24 months.

**Deferred flags.** Each validation-phase exception in PRD 4.5 is recorded in the iteration's
`acs.yaml` under `deferred:` with `reason: validation-phase (GL20)` and `back_on`. The AC-traceability
report shows them; its `--exit-check` mode fails while any remains. The validation exit (iteration
14b) runs that check.

**Validation-hardening slice (iteration 14a), before the first real creator.** Production created from
the same modules; restore drill of both backup layers (ADR-022); scoped external security review
(NFR-029); privacy page listing every provider and region including free tiers (NFR-006); breach
readiness drill (NFR-037); AI terms confirmed (NFR-035, Q-H2); SES production access; accounts moved to
the business's name (GQ8); CA sign-off before any real invoice (Q20).

## Options considered
| Option | For | Against |
|---|---|---|
| **Separate low-cost production for V1, invite list in the database, flags in `acs.yaml` (chosen)** | Real data never on staging; invites change without a deploy; deferrals are visible and block the exit | One more environment to pay for (~$40 a month) |
| Let invited creators use staging | Cheapest | Breaks architecture §19 (staging never holds real data) |
| Invite list in an environment variable | No table | Needs a redeploy (fails FR-006 AC3's "without a code change" in spirit) and leaves no staff log |
| Rely on the email provider's sandbox as the only allow-list | No code | Works for staging only; production must send to anyone invited |

## Consequences
- `invite`, `waitlist_entry` and `staff_event` are global tables outside RLS; the RLS meta-test lists
  them as known platform tables, and a test checks they hold no workspace data.
- Waitlist emails and the remove link (FR-005 AC5) are built when the first waitlist email is sent.
- The exit to the full setup is a checklist, not a single switch: flags cleared one by one, then
  `BHQ_INVITE_ONLY=false`.
