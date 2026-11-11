# Iteration 01 log

## T-00: Mark the approved architecture and ADRs as accepted (docs only) — 2026-11-11

- Built by `builder` (Sonnet); reviewed by `reviewer` (Opus): **APPROVE**, one round.
- Owner approvals used: architecture approved in commit 1abed76; C1–C13 and ADR-021 to ADR-023
  approved 2026-11-11 (plan section 11, decision 1). ADR-002 left as "Superseded by ADR-022".
  D1–D3 were already applied on 2026-11-10 (commit 704a504), so they are not in this change.
- Changed: `architecture.md` section 0 Status and Decisions rows and section 29 intro; the
  `**Status:**` line of ADR-001, ADR-003 to ADR-023. Nothing else.
- Manual check:
  - `grep -n "Status" docs/03-architecture/adr/*.md`: ADR-001, 003–020 read "Accepted (approved
    with the architecture, commit 1abed76)", with the CR-001 / AR5 amendment notes kept;
    ADR-021–023 read "Accepted (approved with CR-001, 2026-11-11; …)"; ADR-002 reads
    "Superseded by ADR-022". No status line says "Proposed".
  - `git diff --stat`: 23 files, 25 insertions, 25 deletions, all of them status lines (plus
    this log).
- Follow-ups noted by the reviewer (not in T-00's scope; they change wording beyond status
  lines, so they need the owner's OK):
  - `architecture.md` section 26 is still titled "Decisions needing owner sign-off", and inline
    "[Sign-off S#]" tags remain, although all sign-offs were given.
  - `architecture.md` line 2138 still says "CR-001 (proposed 2026-11-11; …)" as history text.
  - `plan.md` line 5 still says the CR-001 revision is "pending the owner's review", although
    section 11 records the approval.
  - `T-00.md` still says ADR-021 to ADR-023 "stay Proposed" until approval (now out of date).

## T-00 follow-up: leftover "pending" wordings — 2026-11-11

- Owner approved fixing the four follow-ups above. Wording only; no decision or table row changed.
- `architecture.md` section 26 renamed "Decisions signed off by the owner", with an intro line
  saying all items were signed off at commit 1abed76 and the CR-001 amended ones (S1, S2, S4, S6,
  S7) again on 2026-11-11. The inline "[Sign-off S#]" tags stay: they point to rows that still
  exist. Nothing linked to the old heading.
- `architecture.md` CR-001 history line: "proposed" → "raised", and records C1–C13 approval.
- `plan.md` Status row: "pending the owner's review" → approved the same day (section 11).
- `T-00.md`: a "Done" note at the top; the planned text below it is kept as history.
- ADR-002 status tail (owner approved): "Was: Proposed · Needs owner sign-off (S1 and S4…)" →
  "Was: Accepted (approved with the architecture, commit 1abed76; S1 and S4 signed off…)". It still
  starts "Superseded by ADR-022".

## T-01: Project skeleton and local environment — 2026-11-11

- Built by `builder` (Sonnet); reviewed by `reviewer` (Opus): **APPROVE** after two rounds.
- Round 1 (CHANGES REQUIRED): must-fix was `ruff format` on `config/settings/base.py`. Also fixed:
  compose ports bound to `127.0.0.1`; mailpit pinned to `v1.33.1`; production `DATABASE_URL` has
  no default (fails loudly); `staging.py` now imports `production.py` so the two cannot drift;
  `@require_GET` on health views (+405 test); `.gitignore` adds `app/staticfiles/`, `app/.coverage`;
  WhiteNoise test warning silenced.
- Checks: ruff, ruff format, mypy pass; pytest 7 passed against the compose DB; arm64 and amd64
  images build and run as uid 10001; `/health/live` 200, `/health/ready` 200 (503
  `{"status":"unavailable","reason":"database"}` with the DB stopped), `/admin/` 404.
- Accepted deviations from the ticket:
  - compose `web` runs `migrate` before `runserver`, else `/health/ready` stays 503 (contenttypes
    migrations) on a fresh clone;
  - host ports overridable with `DB_PORT` / `WEB_PORT`;
  - a `dev` Docker target used by compose;
  - an extra DB-down 503 test and a mypy override for `django-environ`;
  - Tailwind CLI v3.4.19 (the design config is v3 format).
- Carry-overs (not yet written into those tickets):
  - **T-16 (major):** `/health/live` may get a 301 (SSL redirect) or 400 (DisallowedHost) from the
    App Platform probe. Add `SECURE_REDIRECT_EXEMPT = [r"^health/"]` and handle the probe's Host
    header.
  - **T-16:** drop `chown -R bhq /app` (keep code read-only to the runtime user); pin the uv image
    by digest.
  - **T-04:** run `migrate` with the migrator role (`--database migrator`), ideally as a one-shot
    compose service that `web` waits for.
- Note: port 5432 on the dev machine is held by another project's container; local runs used
  `DB_PORT=5433 WEB_PORT=8001`.
