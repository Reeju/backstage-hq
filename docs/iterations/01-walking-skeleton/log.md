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
  silenced in `production.py` (staging inherits; moved there in the follow-up below).
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
- **Owner steps: done 2026-11-17** (see "T-02 proof on GitHub" below).
- Carry-overs written into the tickets:
  - **T-04:** the `migrations` job migrates as `bhq_migrator`, and `tests` runs as the app role.
  - **T-14:** remove the nightly's exit-code-5 allowance once real e2e tests exist.
- Round-2 Low findings: fixed in the follow-up below.

## T-02 follow-up: round-2 Low findings — 2026-11-11

- Owner approved fixing them. Built by `builder` (Sonnet); reviewed by `reviewer` (Opus): **APPROVE**.
  The reviewer's optional notes from that round were applied too (last three bullets).
- `test_migrations_present.py` uses `MigrationLoader(...).migrated_apps`. Its second test points
  a real app at a `migrations/` folder without `__init__.py` and checks Django's loader marks it
  unmigrated.
- `pip_audit_ignores.py` rejects:
  - ids that don't match `^[A-Za-z0-9._-]+$`;
  - datetime expiries;
  - expiries more than 90 days out.

  Each rule has a test.
- `.gitleaks.toml`: the no-op `SECRET_KEY=change-me` allowlist is removed. A custom
  `aws-secret-access-key` rule (40 characters of `[A-Za-z0-9/+]`, entropy 4.0 or more, near
  aws/secret) is added. It also catches quoted JSON keys such as `"SecretAccessKey": "…"`.
- CI pins gitleaks to `8.30.1` (`GITLEAKS_VERSION`), the version the rule was tested with. The
  action's own default is 8.24.3.
- The W021 silence moved from `staging.py` to `production.py`. `check --deploy --fail-level
  WARNING` passes on both staging and production settings.
- Checks:
  - ruff, ruff format and mypy are clean;
  - pytest: 21 passed against compose Postgres;
  - actionlint is clean;
  - gitleaks 8.30.1 flags a random key in both env and JSON form, and the repo scans clean.

## T-02 proof on GitHub — 2026-11-17

- **Owner decision (2026-11-17):** the repo `Reeju/backstage-hq` stays **public**. The ticket assumed a
  private repo. Public gives unlimited Actions minutes and branch protection on GitHub Free, at the
  cost of the docs and code being readable by anyone.
  - History was scanned with gitleaks 8.30.1 before the first push: no leaks.
  - Commit author emails are public.
  - `provider-comparison-2026-11.md` assumed the 2,000-minute private allowance; that limit no
    longer applies.
- Pushed `main`; GitHub's own initial commit (a one-line README) was merged in, not overwritten.
  The personal account needs no `GITLEAKS_LICENSE`.
- **Green run** on `main`, all 7 jobs passed: https://github.com/Reeju/backstage-hq/actions/runs/44097845363
- **Red runs.** Each was a throwaway branch, deleted afterwards. The failing step was confirmed in the logs:
  - Model field without a migration: `migrations` failed at `makemigrations --check` ("Migrations for
    'redtest': + Add field extra"). https://github.com/Reeju/backstage-hq/actions/runs/44098182001
  - `RunPython` without `reverse_code`: `migrations` failed at the round trip, on the backwards step
    (`IrreversibleError … redtest.0002_irreversible is not reversible`). https://github.com/Reeju/backstage-hq/actions/runs/44098182751
  - Random 40-character key next to `aws_secret_access_key=`: `security` failed (gitleaks RuleID
    `aws-secret-access-key`). https://github.com/Reeju/backstage-hq/actions/runs/44098181942
  - `jinja2==2.10.1`: `deps` failed (pip-audit found 10 known vulnerabilities). https://github.com/Reeju/backstage-hq/actions/runs/44098182011
  - In the two migration runs, `lint` and `types` also went red. The cause was the throwaway app
    itself (a missing `__str__` and a mypy class-variable annotation), not the pipeline.
- **Branch protection on `main`:**
  - It requires all 7 checks: `lint`, `types`, `tests`, `contracts`, `migrations`, `deps`,
    `security`.
  - The branch must be up to date before merging.
  - No force pushes, no deletion.
  - `enforce_admins` is **off**, so the owner, as admin, can still push straight to `main`. Pull
    requests (including Dependabot's) cannot merge while red.
- Dependabot opened its first PRs straight away (django 6.1.3, gunicorn 27.0.1, ruff 0.17.5).
  None has been reviewed or merged.
- T-02 acceptance criteria all proven.
