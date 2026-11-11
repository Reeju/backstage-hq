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
- Carry-overs (written into T-16 and T-04 as "Carry-over from the T-01 review" sections, owner-approved 2026-11-11):
  - **T-16 (major):** `/health/live` may get a 301 (SSL redirect) or 400 (DisallowedHost) from the
    App Platform probe. Add `SECURE_REDIRECT_EXEMPT = [r"^health/"]` and handle the probe's Host
    header.
  - **T-16:** drop `chown -R bhq /app` (keep code read-only to the runtime user); pin the uv image
    by digest.
  - **T-04:** run `migrate` with the migrator role (`--database migrator`), ideally as a one-shot
    compose service that `web` waits for.
- Note: port 5432 on the dev machine is held by another project's container; local runs used
  `DB_PORT=5433 WEB_PORT=8001`.

## T-02: CI pipeline on every push — 2026-11-11

- Built by `builder` (Sonnet); reviewed by `reviewer` (Opus), two rounds. Round 2 found all fixes
  correct; its only blocking item was this log entry. The Low findings below are open follow-ups.
- Round 1 (CHANGES REQUIRED), all fixed:
  - `uv lock --check` was a no-op under the workflow-wide `UV_FROZEN=1`; that step now sets `UV_FROZEN=0`.
  - gitleaks-action fails on PRs in a private repo with only `contents: read`; `security` now has
    `pull-requests: read` and `GITLEAKS_ENABLE_COMMENTS=false`.
  - `defaults.run.shell: bash` (pipefail) in both workflows, so a failing `uv export` can't hide
    behind pip-audit.
  - `makemigrations --check` ignores apps with no `migrations` package; added
    `app/tests/test_migrations_present.py`.
  - `bootstrap-roles` placeholder added to the `migrations` job too (T-04 carry-over).
  - Supply chain: `persist-credentials: false`; pinned `pip-audit==2.10.1`, `semgrep==1.185.0`
    (`--metrics=off`), uv `0.10.11`; actions pinned by SHA (checkout v7.0.1, setup-uv v10.3.3,
    gitleaks-action v3.0.0, verified with `git ls-remote`).
  - More `migration_roundtrip` tests (several tags, app missing from the JSON, `git show` failure).
  - `.gitleaks.toml` no longer allowlists the whole `app/.env.example`.
  - pip-audit exceptions live in `app/pip-audit-ignore.toml` (reason and expiry required, enforced by
    `app/scripts/ci/pip_audit_ignores.py`).
- **Owner decision (2026-11-11), HSTS:** `SECURE_HSTS_INCLUDE_SUBDOMAINS = True` in production
  (staging inherits); preload **off** until the production domain is final; `security.W021`
  silenced in staging settings only.
- Accepted deviations from the ticket:
  - pip-audit runs with `--no-deps --disable-pip` (`uvx pip-audit -r /dev/stdin` crashed building
    its venv; `uv export` already pins every transitive dependency);
  - semgrep reports WARNING and ERROR only ("any finding above low");
  - `terraform` left out of Dependabot until `/infra` exists (comment marks the spot).
- Local checks (no GitHub remote yet): ruff and format, mypy (24 files), pytest 17 passed against
  compose Postgres, lint-imports (1 contract), `makemigrations --check`, `migration_roundtrip.py`
  (zero path), `uv lock --check`, pip-audit (no known vulnerabilities), semgrep (0), gitleaks
  (clean; flags a fake `AKIA…` key), actionlint (clean), `check --deploy --fail-level WARNING`
  on staging (passes, 1 silenced). The reviewer also confirmed that an irreversible `RunPython`
  fails the round trip and a vulnerable pin (`django==4.2.0`) fails pip-audit.
- **Owner steps (pending; the ticket is not fully proven until done):**
  1. Push the repo to a private GitHub repo with Actions enabled.
  2. If it belongs to an organisation (not a personal account), add a `GITLEAKS_LICENSE` secret.
  3. Get one green run on `main`, then set branch protection on `main` requiring the 7 jobs:
     `lint`, `types`, `tests`, `contracts`, `migrations`, `deps`, `security`.
  4. Red runs on throwaway branches (link each here, then delete the branch):
     - a model field without a migration (`migrations`);
     - a `RunPython` without `reverse_code` (`migrations`);
     - a random 40-character string next to `aws_secret_access_key=` (`security`). Don't use
       AWS's documentation example key: gitleaks skips anything containing "EXAMPLE";
     - a vulnerable pin such as `django==4.2.0` (`deps`).
- Carry-overs written into the tickets:
  - **T-04:** the `migrations` job migrates as `bhq_migrator`, and `tests` runs as the app role.
  - **T-14:** remove the nightly's exit-code-5 allowance once real e2e tests exist.
- Open follow-ups from round 2 (Low, not yet done):
  - `test_migrations_present.py` passes for a `migrations/` folder without `__init__.py`; use
    `MigrationLoader(...).migrated_apps` instead. Fix before T-04 adds the first `bhq` app.
  - `pip_audit_ignores.py`: validate ids against `^[A-Za-z0-9._-]+$`, since they go unquoted
    into the shell; reject TOML datetimes in `expires`, which currently crash, though the job
    still fails closed.
  - `.gitleaks.toml`: the `SECRET_KEY=change-me` regex allowlist has no effect (gitleaks matches
    the secret, not the line). It's harmless; either remove it or add `regexTarget = "line"`.
    Consider a custom rule for AWS secret keys: gitleaks only catches them through
    `generic-api-key`, next to a keyword.
  - W021 is silenced in staging only; move the silence to `production.py` if T-15 or T-16 run
    `check --deploy` against production settings.
