# Iteration 01: Walking skeleton

| | |
|---|---|
| Status | **Approved** 2026-11-10 (commit 1cbe513). **Revised for CR-001 on 2026-11-11**, pending the owner's review: sections 1–7 and 10–12 and tickets T-00, T-03, T-04, T-07, T-09, T-10, T-11, T-13 to T-17 changed; T-18 added. Nothing in `app/` exists yet. |
| Inputs | Approved docs as of commit 7505cd5: `docs/PLAYBOOK.md`, `docs/01-usecases/use-cases.md`, `docs/02-prd/PRD.md`, `docs/03-architecture/architecture.md` and ADR-001 to ADR-020, `docs/04-design/`. **Added for CR-001:** `docs/change-requests/001-global-market-and-infrastructure-value.md` (adopted; GQ1–GQ10), the PRD and use-case edits GL1–GL24, architecture changes C1–C13 with ADR-021 to ADR-023, and `docs/03-architecture/provider-comparison-2026-11.md`. |
| Tickets | `T-00.md` to `T-18.md` in this folder (T-00 is a documentation fix, T-17 is spikes with no app code, T-18 is new for CR-001) |
| Phase | **V0** of the validation phase (PRD 4.5): the owner alone, on staging, with dummy data and personal accounts. |

---

## 1. Goal

(Revised for CR-001, 2026-11-11.) By the end of this iteration the owner can open BackstageHQ on their
phone, on the staging site, choose India, sign up with their email and an emailed code (only if their
address is invited), set up an authenticator app and save 10 backup codes, fill in the business details
their first invoice will need, and land on an empty but real "Today" screen in their own private
workspace. Someone from another country, or someone not invited, gets the waitlist or an "invite-only"
page instead. Behind that thin slice sits everything later work hangs on: every record is tied to one
workspace and the database itself refuses to show it to anyone else; the workspace knows its country,
currency and time zone and never assumes India; bank and PAN numbers are stored locked; every change
goes through one door that checks permission and writes the activity log; background jobs run; logs
never contain secrets; every push to GitHub is checked automatically; and every merge deploys itself
to a staging setup that costs about US$27 a month.

## 2. Why this goal

- The playbook's first example iteration is "sign-up, the creator's account and settings (the
  skeleton everything hangs on)", and PRD section 4.1 makes every MVP flow depend on it.
- The architecture's rules (section 4) say every later feature uses the same Action runner,
  permission check, workspace isolation and encryption helper. If those are built late, every
  earlier feature has to be redone. Building them first, with nothing on top, is the cheapest
  moment to get them right and to test them hard.
- "CI from iteration 1" is a playbook rule and architecture section 20.1. The pipeline, the
  AC-traceability report and the staging deploy are cheapest to set up while the code is tiny.
- CR-001 changes the cheapest places to get the global basics right: email-first sign-in, the
  authenticator, the workspace country with no India fallback, and invite-only access all touch the
  first screens, so they belong here, not in a later rework. (Revised for CR-001.)
- The three iteration-1 spikes (Q-H1, Q-T1, Q-V3) cost little now and decide designs that staging and
  later iterations depend on (the low-cost host, the send gate, the forwarding address).
- What is **not** chosen: anything that needs Gmail. Google's Gmail verification can take 12 weeks
  (PRD Q14), so Gmail work is scheduled later, while verification runs.

## 3. The demo the owner will see at the end

(Revised for CR-001, 2026-11-11.) Done on the staging site, on a phone (or a desktop browser narrowed
to phone width). Use a dummy PAN such as `ABCDE1234F`; staging never holds real creator data
(architecture section 19). Your test email address must be invited (`manage.py invites add`) and
verified in the SES sandbox (T-15), which is the staging allow-list.

| # | Step | Screen (mockup) | Proves |
|---|---|---|---|
| 1 | Open the staging address. The screen shows "Sign up or sign in" with an **email** field and "Where is your business based?" with India suggested and "My country is not listed". There is no phone option and no "Continue with Google" yet (iteration 2). | S-01 as amended | NFR-007, FR-001 AC3 |
| 2 | Choose "My country is not listed". You get "BackstageHQ is not available in your country yet" and a form for email and country only. Submit it: no account is created. | S-01 waitlist state | FR-005 AC2 |
| 3 | Back on sign-in, type an address that is **not invited** and tap **Send code**. You see "BackstageHQ is invite-only for now" with the waitlist, and no email arrives. | S-01 invite-only state | FR-006 AC1 |
| 4 | Type your invited address, keep India, tap **Send code**. A 6-digit code arrives by email. Type a wrong code once: "That code is not right. You have 4 tries left." | S-01 Code and Wrong-code states | FR-001 AC2 |
| 5 | Type the right code. Your workspace is created with you as owner, country India, currency INR, time zone Asia/Kolkata, and **Profile setup** opens. | S-01 to S-02 | FR-001 AC1, FR-005 AC1, FR-006 AC2 |
| 6 | Type a PAN in the wrong format and tap **Save and continue**. You see "That PAN does not look right..." and nothing is saved. | S-02, Error state | FR-003 AC2 |
| 7 | Fix the PAN, fill in legal name, business type, state, bank account (holder, number, IFSC); leave GSTIN empty. Optionally add an opening total. | S-02, Normal state | FR-003, FR-023 |
| 8 | In the **Set up an authenticator app** card, scan the QR code (or tap "Open in authenticator app", or copy the setup key) in Google or Microsoft Authenticator, type the 6-digit code. Ten backup codes appear once; save them and tick "I have saved these codes". **Save and continue** only works after this. | S-02 as amended | FR-002 AC3 |
| 9 | You land on **Today**: "Welcome, <your name>. Nothing to do yet." Desktop width shows the side menu; phone width shows the bottom bar. Menu items for screens not built yet are hidden, and so is the search box. | S-05, Empty state | Shell |
| 10 | Open **Activity log**. You see plain-words entries: "You created this workspace", "You added your bank account for invoices", "You added your PAN", "You set up an authenticator app". | S-20 (read-only list) | FR-003 AC4 (first half), FR-213 |
| 11 | Open **Settings: profile**. Your legal name, state and "GST threshold used: Rs 20,00,000" (try Mizoram: Rs 10,00,000) are shown. PAN shows as `ABCDE****F`, bank as `****7890`, each with "Change (needs a second check, coming in iteration 2)". Change the trading name and tap **Save**; a new log entry appears. | S-21 | FR-003 AC3, FR-004 AC3 groundwork |
| 12 | Edit the address bar: replace the workspace ID in `/w/<id>/...` with any other ID. You get "Page not found", never someone else's data. | — | NFR-001, NFR-023 |
| 13 | Sign out. Sign in again on the same browser with an email code: no extra check (if you ticked "Remember this device"). | S-01 | FR-002 AC2 |
| 14 | Open a private/incognito window (a "new device") and sign in with an email code. You see "One more check" offering **the authenticator code or a backup code**, never another email code. Use a backup code: you are in, and the log shows "New sign-in on <browser>" and "A backup code was used (9 left)". Sign out and try the **same backup code** again in another private window: it is refused. | S-01, New-device state | FR-002 AC1, AC4, AC5, NFR-032 |
| 15 | On GitHub, open the last pull request: every check is green (lint, types, tests on real Postgres with row-level security and roles bootstrapped without superuser, architecture contracts, migration round trip, dependency audit, secrets scan). Open the **AC traceability** report: every acceptance criterion this iteration claims has a test, and the "Deferred for the validation phase" list shows NFR-028 (edge rule) and NFR-042. | — | Playbook "CI from iteration 1", architecture 20.1, ADR-023 |
| 16 | Merge it. Within about 15 minutes staging redeploys by itself on DigitalOcean; `https://<staging>/health/ready` shows the new commit. | — | ADR-019, ADR-022 |
| 17 | Read the spike results (`spike-results.md` in this folder): three yes/no answers with evidence (Q-H1 DigitalOcean fit, Q-T1 Gmail Message-ID, Q-V3 SES receiving), and what changes if any answer was "no". | — | Q-H1, Q-T1, Q-V3 |

## 4. Scope

### In

(Revised for CR-001, 2026-11-11.)

| Area | IDs | Notes |
|---|---|---|
| Sign up and sign in by email code; no phone option while the switch is off | FR-001 AC1, AC2, AC3 | Google sign-in moves to iteration 2 |
| Country of the workspace; waitlist for countries not supported | FR-005 AC1, AC2, AC3 | AC4 (no country change after the first invoice) with invoices, iteration 4; AC5 (remove link) with the first waitlist email |
| Invite-only access and the staff log | FR-006 AC1, AC2, AC3, AC4 | Staff screen for invites: iteration 11 |
| Second factor on a new device; an authenticator and backup codes always exist | FR-002 AC1, AC2, AC3, AC4, AC5 | Phone as a second method only when a country is switched on |
| Business profile with only what the first invoice needs; fields from the country's rule set | FR-003 AC2, AC3, AC5; AC1 and AC4 in part | AC1 is completed when invoices exist (iteration 4); AC4's "later change needs a second check" in iteration 2 |
| Opening total for the year (stored) | FR-023 (data only) | AC1 needs invoices (iteration 4) |
| Sensitive fields read-only for anyone but the owner | FR-004 AC3 (groundwork) | Changing them with a second check: iteration 2 |
| Activity log: append-only, same transaction, hash chain; read-only list | FR-213 AC2; AC1 in part; NFR-032 in part | Undo and filters later (FR-214) |
| Workspace isolation (three locks), with no `BYPASSRLS` role | NFR-001, NFR-023 (foundation) | Search, export, notifications, assistant parts come with those features |
| Rules by country, fail closed | NFR-022 (in part) | Tax figures and invoices in iteration 4 |
| Encryption of PAN, GSTIN, bank numbers and the authenticator seed | NFR-004 | Files and token vault later |
| Sessions: server-side, 30 days of inactivity | NFR-027 in part | "Devices and sessions" card and "Sign out everywhere": iteration 2 |
| Abuse limits on sign-in and codes | NFR-028 in part | App counters only; the edge rule is **deferred** for the validation phase (PRD 4.5) |
| No secrets or personal data in technical logs or Sentry | NFR-025 | Tokens do not exist yet; the filter and its test do |
| Background jobs, worker, heartbeat | NFR-012 (foundation) | |
| Health checks, outside uptime check on staging | NFR-042 (foundation) | Measured, not a target, in the validation phase (deferred flag) |
| Phone-first, accessible screens | NFR-007, NFR-041 | Playwright + axe on the sign-up flow |
| Permission policy and matrix (owner, assistant overlay, never-delegable rows) | PRD section 7.2 foundation (section 5.P) | Manager and helper rules run in v1 |
| CI, AC traceability (with deferred flags), staging deploy | Playbook; architecture 20.1, 20.2, 20.3; ADR-017, ADR-019, ADR-023 | Production arrives in the validation-hardening slice (14a) |
| Spikes | Q-H1, Q-T1, Q-V3 | Research only, no app code |

### Out (and where it goes)

- Google sign-in, account recovery (email code plus backup code; UC-001 edge case, E9), regenerating
  backup codes: iteration 2.
- Second check (S-29, now with the authenticator), changing bank/PAN/GSTIN (FR-004 AC1, AC2),
  "Devices and sessions" (S-21 card, NFR-027 full): iteration 2.
- Connect sources (S-03) and everything Gmail, Instagram, WhatsApp, forwarding: iterations 5, 8, 9.
- Rate card and terms (S-23), notification settings (S-24): iteration 2.
- Global search (FR-205, S-43): iteration 13. The search box is hidden until then.
- Billing and plans (FR-290 to FR-295): iteration 11, and not used in the validation phase. Every
  workspace behaves as "trialing" with no gating in this iteration.
- Phone codes, MSG91 and DLT: not needed until the owner switches phone codes on for a country.
- The V1 production setup and everything else needed before the first real creator: the
  validation-hardening slice, iteration 14a (section 12).

## 5. Tickets

(Revised for CR-001, 2026-11-11.)

| ID | Title | Tier | Depends on | FR / NFR |
|---|---|---|---|---|
| T-00 | Mark the approved architecture and ADRs as accepted (docs only) | B | owner approval | Open item 4 |
| T-01 | Project skeleton and local environment | B | — | NFR-042 (health), ADR-001, ADR-019 |
| T-02 | CI pipeline on every push | B | T-01 | Architecture 20.1, ADR-017, ADR-019 |
| T-03 | AC-traceability report, with deferred flags *(revised)* | B | T-01 | Architecture 20.1, 21; ADR-023 |
| T-04 | Tenancy: users, workspaces (with country, currency, time zone), memberships, roles without `BYPASSRLS`, forced RLS *(revised)* | A | T-01 | NFR-001, NFR-023, FR-005, ADR-004 |
| T-05 | Permission policy `authorize()` and the matrix file | A | T-04 | PRD 7.2, FR-004 AC3, ADR-008 |
| T-06 | Action runner and append-only activity log | A | T-05, T-07 | FR-213 AC1 (part), AC2, NFR-032, ADR-007, ADR-010 |
| T-07 | Field encryption with per-workspace keys and a platform key *(revised)* | A | T-04 | NFR-004, ADR-005 |
| T-08 | Background jobs, worker and heartbeat | B | T-04 | NFR-012, ADR-006 |
| T-09 | Structured logs, Sentry and redaction *(wording revised)* | B | T-01 | NFR-025, ADR-018 |
| T-10 | Email-code sign-up and sign-in, with the workspace country *(rewritten)* | A | T-06, T-07, T-08, T-09, T-13 | FR-001 AC1–AC3, FR-005 AC1, NFR-027 (part), NFR-028 (part), ADR-012 |
| T-11 | Authenticator app and backup codes as the second method, and the new-device check *(rewritten)* | A | T-07, T-10 | FR-002 AC1–AC5, NFR-004, NFR-032 |
| T-12 | App shell, empty Home and read-only activity log | B | T-06 | S-05, S-20, NFR-007, NFR-041 |
| T-13 | Business profile data, rules registry by country, and Actions *(revised)* | B | T-06, T-07 | FR-003 AC1 (part), AC2–AC5, FR-005 AC3, FR-023, NFR-004, NFR-022 |
| T-14 | Profile setup (S-02) and Settings: profile (S-21) screens *(revised)* | B | T-10, T-11, T-12, T-13 | FR-002 AC3, FR-003, FR-004 AC3, S-02, S-21 |
| T-15 | Staging on the low-cost V0 setup, in Terraform *(rewritten)* | A | T-04, T-17 (Q-H1); owner accounts | ADR-022, ADR-005, ADR-019, ADR-023, NFR-043 (part) |
| T-16 | Build the image and deploy to staging on merge *(rewritten)* | B | T-02, T-15 | Architecture 20.2, ADR-017, ADR-019, NFR-042 |
| T-17 | Spikes: Q-H1, Q-T1, Q-V3 *(rewritten)* | A | Q-H1: T-04; others: owner accounts | Architecture 28.2 |
| T-18 | Invite-only access, the waitlist and the staff log *(new)* | A | T-10, T-06 | FR-006 AC1–AC4, FR-005 AC2, ADR-023 |

**Size.** 17 build tickets (T-01 to T-16 and T-18) is above the "8–15" range. T-00 is a five-minute
documentation edit and T-17 is research with no app code. **Cut line**, in this order, if the iteration
must shrink: (1) T-18 moves to iteration 2: on staging the SES sandbox already restricts who can
receive a code, and FR-006 is only needed before the first invited creator (V1) (its IDs, FR-006 AC1–AC4
and FR-005 AC2, then move from this iteration's `acs.yaml` to iteration 2's); (2) the read-only
activity log list (in T-12) and (3) the S-21 screen (in T-14) move to iteration 2. Nothing else can
move without breaking the demo.

**Tier A count.** Nine tickets are tier A (T-04, T-05, T-06, T-07, T-10, T-11, T-15, T-17, T-18). That is
expected for a foundation iteration: tenancy, permissions, encryption, sign-in, who may sign up, and
the infrastructure's security settings are exactly what CLAUDE.md routes to Opus. From iteration 2 on,
most tickets reuse these pieces and should be tier B.

## 6. Order and parallel work

(Revised for CR-001, 2026-11-11.)

```
T-00 (docs, any time before T-01)
T-01 ─┬─ T-02 ────────────────────────────────────────────────┐
      ├─ T-03                                                  │
      ├─ T-09 ───────────────┐                                 │
      └─ T-04 ─┬─ T-05 ─┐    │                                 │
               ├─ T-07 ─┴─ T-06 ─┬─ T-13 ─ T-10 ─┬─ T-11 ─┐     │
               ├─ T-08 ──────────┼────────┘      └─ T-18   │     │
               │                 └─ T-12 ──────────────────┴─ T-14
               └─ T-17 Q-H1 ─ T-15 ─────────────────────────────┴─ T-16
T-17 Q-T1 and Q-V3: any time, in parallel with everything
```

- **Lane 1, pipeline:** T-01, then T-02, T-03 and T-09 in parallel.
- **Lane 2, core:** T-04, then T-05, T-07 and T-08 in parallel, then T-06.
- **Lane 3, product:** after T-06: T-13 (and T-12 in parallel), then T-10, then T-11 and T-18 in
  parallel; T-14 last. T-10 now waits for T-13 because sign-up reads the country list and the
  country's currency and time zone from the rules registry.
- **Lane 4, infrastructure:** as soon as T-04 is merged, run spike Q-H1 (an afternoon, a few cents);
  if it says "yes", T-15 then T-16. If it says "no", the fallback (Render, Singapore) is proposed to the
  owner before T-15 starts.
- **Lane 5:** Q-T1 and Q-V3 whenever the owner's Google and AWS accounts are ready.
- Parallel tickets each run on their own branch. Tickets that add dependencies all touch
  `app/pyproject.toml` and `app/uv.lock`, and several touch `app/config/settings/base.py`: merge one at
  a time and rebase the next (conflicts are mechanical).
- **The custom user model must exist in the very first migration** (T-04). Django cannot switch to a
  custom user model later without a painful rebuild, so no ticket may run `migrate` with
  `django.contrib.auth`'s default user before T-04 lands. T-01 sets `AUTH_USER_MODEL` but creates no
  migrations.
- **Mockups.** T-10's and T-18's templates and T-14 wait for the owner-approved amendment of S-01
  (email field, country choice, invite-only and waitlist states) and S-02 (authenticator card,
  backup-codes step) (GQ10). Their logic and tests can be built first.

## 7. Risks and spikes

### Risks

(Revised for CR-001, 2026-11-11. R1, R2, R3 and R7 changed; R10 to R13 are new.)

| # | Risk | Effect | Mitigation |
|---|---|---|---|
| R1 | **Changed.** Phone codes turn out to be needed after all (GL-A2 fails: creators drop out at authenticator setup), and India needs DLT registration, which takes one to three weeks | SMS cannot be switched on quickly | DLT is **off the critical path**: no MSG91 or DLT work now. The `SmsClient` interface and the per-country switch exist (T-10), so switching on is one provider client plus registration. The owner starts DLT only if V1 measurements say so |
| R2 | **Changed.** SES starts in sandbox mode, which only delivers to verified addresses | On staging this is wanted: it **is** the allow-list (CR-001 C). The risk moves to V1: production access may be refused or slow | Verify the owner's test addresses in staging (T-15). Request SES production access in the validation-hardening slice with at least two weeks' lead; fallback Resend or Postmark is a settings change through django-anymail |
| R3 | **Changed.** DigitalOcean turns out not to fit (spike Q-H1: region, PostgreSQL 17, roles without superuser, restore, logging settings) | T-15 and T-16 would build the wrong thing | Q-H1 runs before T-15 (lane 4). T-01 to T-14 and T-18 are host-neutral. Fallback Render (Singapore) is priced in the comparison and uses the same image and settings |
| R4 | Row-level security traps: a superuser or table owner silently bypasses it; an empty setting cast to UUID errors; a session-level `SET` leaks across pooled connections; **managed PostgreSQL cannot create `BYPASSRLS` roles** (new) | A false sense of isolation, 500 errors, or a bootstrap that fails on the real host | T-04 pins all of them: app roles are `NOSUPERUSER NOBYPASSRLS`, tables use `FORCE`, the policy uses `NULLIF(...,'')`, only `set_config(..., true)` is allowed, no role has `BYPASSRLS` (role-scoped read policies instead, C9), and CI bootstraps roles as a non-superuser admin. Q-H1 repeats the tests on DigitalOcean, including a transaction-mode pool |
| R5 | Python package names in architecture section 5 collide with the standard library | — | **Resolved** by D1 (applied 2026-11-10) |
| R6 | Procrastinate is a smaller project (ADR-006) | Library stalls | All code uses our `bhq.jobs` wrapper, so a swap touches one module |
| R7 | **Resolved.** ARM64 images on GitHub-hosted runners were slow | — | App Platform runs linux/amd64, so images are amd64 (T-16) |
| R8 | Iteration size (17 build tickets) | Iteration runs long | Cut line in section 5; lanes run in parallel |
| R9 | **Changed.** The S-01 and S-02 mockups predate CR-001 (no email field, country choice, invite-only, waitlist or authenticator card) | Builders guess the layout | The `ux-designer` amends S-01 and S-02 first (owner approval, GQ10). T-10, T-18 and T-14 specify the content and build logic and tests before the templates |
| R10 | **New.** Creators drop out at authenticator setup (PRD R18, GL-A2) | Fewer V1 creators finish sign-up | Not testable in V0 (the owner alone). Setup offers QR, "Open in authenticator app" and "Copy setup key"; V1 measures it; fallback SMS for India (R1) |
| R11 | **New.** AWS credentials are stored on DigitalOcean (no IAM roles there) | A leaked key could use the KMS key or send email | One IAM user per component with least privilege; KMS use only with an encryption context; 90-day rotation; secrets only in GitHub environments and App Platform encrypted variables; CloudTrail alerting and the external review in 14a; removed by the hyperscaler migration trigger (ADR-022) |
| R12 | **New.** Free-tier limits: GitHub Actions 2,000 minutes a month for private repositories; DigitalOcean Container Registry Starter holds 500 MiB | CI or deploys stop, or a small bill appears | Cache dependencies, run e2e nightly not per push, path filters for docs-only changes; registry cleanup keeps the newest 3 tags (T-16). Budget about US$5 a month if either is exceeded |
| R13 | **New.** Accounts are personal (GQ8) | Real data in personal accounts, or a painful move later | Personal accounts hold only staging (dummy data). V1 production is created in business-owned (or transferable) DigitalOcean and AWS accounts in 14a, from the same Terraform modules |

### Spikes (all in T-17)

| Spike | Question | What it decides | If the answer is "no" |
|---|---|---|---|
| Q-H1 (new) | Does DigitalOcean Bangalore fit: App Platform and PostgreSQL 17 in BLR1, role bootstrap and RLS tests without superuser, `btree_gin`, logging settings, transaction pooling with our workspace setting, point-in-time restore to a new cluster, `pg_dump --enable-row-security` round trip, client IP header? | ADR-022 for V0 and V1; T-15's settings; T-10's `CLIENT_IP_HEADER`; the 14a restore runbook | Render (Singapore) with the same checks; proposed edit to ADR-022 and architecture 3A. Before T-15 |
| Q-T1 | Does Gmail keep our own `Message-ID` on `users.messages.send`, so a retry can find the message with `rfc822msgid:` before sending again? | The send gate's "effectively once" design (architecture section 13, ADR-009), built in iteration 5 | Fall back to recording a content fingerprint and, before any retry, searching Sent for the same recipient and subject in the last 24 hours and comparing the fingerprint. Needs an architecture section 13 / ADR-009 edit before iteration 5 is planned |
| Q-V3 | Does SES email receiving work in ap-south-1? | Sign-off S7: SES or Postmark for the forwarding address (FR-011) | Use Postmark inbound (US) or SES receiving in another region, and list it on the privacy page (NFR-006). Our own outgoing email stays on SES Mumbai. Decided before iteration 5 |
| Q-V2, Q-V5 (moved) | Bedrock retention terms; GuardDuty for S3 in Mumbai | AI fallback (now part of Q-H2) and malware scanning | Moved to before iteration 8, when AI and files arrive (architecture 28.2) |

## 8. Open items carried in from earlier stages

| # | Item | Where it goes | Needs a document change? |
|---|---|---|---|
| 1a | Search entries removed at day 30 of account deletion (architecture 16A.5, 18.3) vs. "deleting the account removes the matching search entries in the same way" (PRD FR-205, read as within 1 minute) | **Deferred to iteration 13 (search).** Settle before that iteration is planned. Recommendation: day 30, because the owner can cancel deletion during the wait and the screens still show the data | Yes: PRD FR-205 "Keeping results current" wording |
| 1b | Unencrypted file names in the search index (for example "Aadhaar_Riya.pdf") | **Deferred to iteration 13.** Owner chooses: keep (file names are already plaintext in the `file` table for lists, so the index adds no new exposure) or move file search to v1 (the cut PRD section 14A already suggests). Recommendation: move file search to v1 | Yes if moved: PRD FR-205 table and section 4.2 |
| 1c | FR-205 says invoice numbers match "in part"; the architecture supports the start of a part only ("014" yes, "4/01" no) | **Deferred to iteration 13** | Yes: PRD FR-205 "How matching works" wording |
| 1d | Does the paid "Ask the assistant" row show on the no-results state? (PRD: "at the bottom of the results"; design system: "under results only") | **Deferred to iteration 13.** Recommendation: show it on no-results too, since that is when it helps most | Yes: PRD FR-205 "Plans" and the S-43 mockup state |
| 1e | Staff search runs on Enter only (architect addition in 16A.6, not in the PRD) | **Deferred to iteration 13** (staff access itself arrives in iteration 12) | Yes: PRD FR-205 note, or owner acceptance recorded in PRD section 15 |
| 2 | S-30's other figures (trials, conversions, retention, cost per creator) read across workspaces with no defined mechanism | **Deferred to iteration 11 (billing and price test).** Likely the same pattern as AR4: one `SECURITY DEFINER` aggregate per figure, writing per-price-point totals to a `platform` table, with the 5-creator minimum where a figure could reveal one creator | Yes: architecture 11.3, 18.1, 22 and the ADR-004 appendix |
| 3 | No invariant monitor pages on a reminder sent outside the brand sending window (metric M5 counts it as a misfire) | **Deferred to iteration 6 (reminders).** The send gate must record the window it checked on the gate decision, so a later edit to the window does not raise false alarms | Yes: architecture section 22, ADR-018 (add the check), section 6.5 (window snapshot on `gate_decision`) |
| 4 | Stale status labels: architecture.md section 0 says "Proposed. Draft for owner approval. Not committed." and every ADR says "Proposed", although approved in commit 1abed76 | **Partly done:** the architecture section 0 Status row was corrected in the CR-001 edit (C13, 2026-11-11). The ADR status lines remain for **T-00** (docs-only ticket, needs the owner's OK because it edits approved documents) | Yes: status lines only, no content |

## 9. Proposed edits to approved documents that this plan needs (applied 2026-11-10)

These are small and technical. None changes product behaviour. They need the owner's approval
because the documents are approved; they can go in the same documentation commit as T-00.

| # | Document | Proposed edit | Why |
|---|---|---|---|
| D1 | Architecture section 5 (and the paths in 5, 16A, 20.1, 21) | All modules live under one Python package: `app/bhq/<module>/` (for example `bhq.outbound.gate`, `bhq.files.crypto`, `app/bhq/workspaces/matrix.yaml`). The country rule package is `bhq/rules/india/v2026_1/` instead of `rules/in/v2026_1/`. Module names and boundaries are unchanged. Two non-domain packages are added: `app/config/` (Django settings, URLs, health, logging) and `bhq/common/` (tiny shared helpers with no tables: IDs, redaction, context processors) | `collections`, `profile` and `platform` are names of Python standard-library modules, so top-level packages with those names would break Python and its libraries; `in` is a reserved word and cannot be imported |
| D2 | ADR-004 appendix and architecture 11.3 | Add `user_workspace_ids(user_id)`: a `SECURITY DEFINER` function owned by `bhq_crossws`, returning only the workspace IDs where that user has an active membership; `bhq_web` and `bhq_worker` may execute it | After sign-in the app must find the user's workspace before any workspace context exists, and security events (lockouts, new-device sign-ins) must be logged in the workspaces the user owns. Membership rows are behind RLS, so this needs one narrow, ID-only function, the same pattern as the existing appendix |
| D3 | Architecture 10.2 | Add the action type `edit_business_profile` (legal name, state, trading name, handles, opening total). It is not in the delegable list, so only the owner holds it in the MVP; v1 decides whether a manager may be ticked for it. Also record PRD M2's rule: `change_payout_bank` and `change_pan_gstin` on a field never saved before return ALLOW (logged) instead of STEP_UP | S-21 is "Owner only" (PRD section 6) but no action type covers the non-sensitive profile fields; M2's first-entry rule needs a home in the policy |

## 10. Change request 001 (adopted 2026-11-11): what changed in this iteration

(Revised for CR-001, 2026-11-11. This section replaces "Change request 001 (unadopted)".) The owner
adopted CR-001 and every recommendation in GQ1–GQ10. Product wording is in the PRD and use cases
(GL1–GL24); the architecture side is C1–C13 (architecture section 27) with ADR-021 to ADR-023; prices
and the provider choice are in `docs/03-architecture/provider-comparison-2026-11.md`.

| Ticket | What changed | Why |
|---|---|---|
| T-00 | Architecture status row already fixed (C13); ADR-002 stays "Superseded"; ADR-021–023 marked Accepted only after the owner approves C1–C13 | Decision 5 of the old section 11 is settled |
| T-03 | Parses "Validation phase" releases; new `deferred:` list and `--exit-check`; claims updated (FR-001 AC3, FR-002 AC5, FR-003 AC5, FR-005 AC1–AC3, FR-006 AC1–AC4; NFR-028 edge rule and NFR-042 deferred) | PRD 4.5, ADR-023 |
| T-04 | Workspace `country_code`, `currency`, `timezone` with no defaults; `user.email` required; no role has `BYPASSRLS` (role-scoped `crossws_read` policy instead); roles bootstrapped and tested as a non-superuser admin | FR-005; C3, C4, C9 (managed PostgreSQL gives no superuser) |
| T-07 | KMS adapter takes a generic context; a platform data key encrypts user-level secrets (the authenticator seed) | C7 |
| T-09 | Wording: logs go to the platform's log forwarding, not CloudWatch | C11 |
| T-10 | Email code replaces the SMS code; country choice at sign-up sets currency and time zone; SMS shrinks to an interface, a fake client and a per-country switch that is off; lock-out time in the workspace's time zone; the email job and the "email already used" rule move here | Section F of CR-001; FR-001, FR-005 |
| T-11 | Authenticator app (QR, "Open in authenticator app", "Copy setup key") and 10 hashed backup codes replace the verified email; the new-device check offers authenticator or backup code, never email; shared lock | Section F; FR-002 AC3–AC5 |
| T-13 | One rules registry by country that fails closed; the Indian rule set declares currency, time zone, money format and identifiers; test-only fake country `XA` and unregistered `XB` | Section F; FR-005 AC3, FR-003 AC5, NFR-022 |
| T-14 | Fields from the rule set; "Set up an authenticator app" card with the backup-codes step; GST threshold only for India; e2e signs in with an emailed code and computes the authenticator code | Section F; FR-002 AC3, FR-003 AC5 |
| T-15 | Rewritten: DigitalOcean BLR1 (App Platform, Managed PostgreSQL), AWS Mumbai (KMS key, SES sandbox, Terraform state, budget), Cloudflare DNS; personal accounts; about US$27 a month | ADR-022; comparison §5.1 |
| T-16 | Rewritten: amd64 image to DigitalOcean Container Registry; App Platform spec rendered and applied with `doctl`; migrations as the `PRE_DEPLOY` job | ADR-019 as amended |
| T-17 | Q-H1 added and run first; Q-T1 and Q-V3 kept; Q-V2 and Q-V5 moved to before iteration 8 | C6, C8 |
| T-18 | New: invite-only check, waitlist, staff command and append-only staff log | Section F (FR-006, FR-005 AC2), split from T-10 to keep tickets one session each |
| T-01, T-02, T-05, T-06, T-08, T-12 | Unchanged | Host- and vendor-neutral |

## 11. What the owner must decide or set up

(Revised for CR-001, 2026-11-11.)

**Decisions** (1 and 2 approved by the owner on 2026-11-11, commits ecf9822 to 5dedb19; 3 and 4 still open)
1. Approve the CR-001 architecture changes C1–C13, ADR-021 to ADR-023 and the provider comparison
   (V0 and V1 on DigitalOcean Bangalore with AWS Mumbai for keys and email; direct Claude API for AI,
   conditional on zero-data retention for real data). Needed before T-15.
2. Approve the revised tickets in this plan (section 10) and the amended S-01 and S-02 mockups (GQ10).
   Needed before T-10's templates and T-14.
3. **GQ7:** the monthly spending cap for the validation phase. Planning figures with 18% GST: about
   ₹2,800 a month for V0; about ₹8,000–12,000 a month for V1 including AI. And the budget for the
   scoped external security review and the CA review before the first real creator and invoice.
4. **Q-H2:** apply now for zero-data retention on the Anthropic account that V1 will use (it takes
   time); if it is refused, decide whether 30-day retention meets NFR-035 for you or whether V1 uses
   Bedrock (about twice the AI cost).
5. Accept the cut line in section 5 if the iteration runs long (T-18 first, then the activity-log list,
   then S-21).

**Accounts to open now (V0): all personal, all free or nearly free**

| Account | Used for | Cost | Needed by |
|---|---|---|---|
| GitHub (Free), private repository with Actions | Code, CI, deploys | Free (2,000 Actions minutes a month) | T-02 |
| DigitalOcean (personal, card required) | Staging app, worker, PostgreSQL, container registry; a throwaway cluster for Q-H1 | About US$25 a month; a US$200 sign-up credit for 60 days may apply | T-17 Q-H1, T-15 |
| AWS (personal; upgrade the free plan to a paid plan early so it is not closed after 6 months) | KMS key, SES sandbox, Terraform state, budget alert; Q-V3 | About US$1 a month; sign-up credits apply | T-15, T-17 Q-V3 |
| Cloudflare (free) and a domain | DNS for `staging.<domain>` and SES records | Domain about US$10–12 a year | T-15 |
| Sentry (Developer, free) | Errors | Free | T-09, T-16 |
| Better Stack (free) | Uptime check from outside | Free | T-16 |
| Healthchecks.io (free) | Worker heartbeat | Free | T-08, T-16 |
| Google Cloud project (personal Google account) with the Gmail API, an OAuth client in testing mode, and two test Gmail accounts | Spike Q-T1 only, for now | Free | T-17 Q-T1 |
| Google Authenticator or Microsoft Authenticator on your phone | Your own second factor on staging | Free | Demo |

**Not needed now:** MSG91 and DLT registration, a business SIM or WhatsApp number (your personal SIM is
a test handset only, later), Razorpay, Meta developer app, Bedrock model access, Anthropic API credits
(from iteration 8), Postmark, Cloudflare Pro, any paid monitoring tier.

**Later, before the first invited creator (V1, validation hardening 14a), in the business's name or
transferable to it (GQ8):** a DigitalOcean team and project for production; a separate AWS account for
production (keys, SES production access, backups, files); an Anthropic API organisation with zero-data
retention (or the Bedrock fallback); a Google OAuth app in testing mode for the creators' Gmail (GQ9); a
Meta developer app in development mode; production Sentry and Better Stack projects; the domain moved to
the business; the external security reviewer and the CA engaged.

**Later, at the full setup (after the validation exit):** Razorpay, Cloudflare Pro, the standby
database node, paid uptime and error tiers, the Gmail security assessment (CASA), a permanent WhatsApp
business number, and MSG91 with DLT only if phone codes are switched on for India.

## 12. Next iterations (outline; each is planned properly when its turn comes)

(Revised for CR-001, 2026-11-11: iterations 2 and 8 adjusted; iteration 14 split into 14a and 14b.)

| # | Iteration | Main IDs | Notes |
|---|---|---|---|
| 02 | Account completion and settings | FR-001 (Google), FR-004 AC1–AC3, FR-003 AC4, NFR-027, S-29 (second check with the authenticator or a backup code), S-21 sessions card, regenerate backup codes and replace the authenticator, S-23 (FR-025 AC2–AC3, FR-026), S-24 (FR-202 settings), privacy page (NFR-006), audit hash-chain invariant check | Also account recovery (E9: email code plus backup code). T-18 lands here if it was cut |
| 03 | Brands, leads, deals and quotes by hand | FR-047–FR-050 (manual parts), FR-070–FR-072, FR-080–FR-083, FR-025 AC1, S-08, S-09, S-10 | No AI yet |
| 04 | Invoices, credit notes, money owed, GST threshold | FR-110–FR-116, FR-124, FR-125, FR-023 AC1, FR-003 AC1, FR-005 AC4, FR-150–FR-152, S-12–S-14, S-16, X-02 | CA sign-off (Q20) before any real invoice; currency from the workspace |
| 05 | Send gate, Gmail connection, approvals | FR-236, FR-237, FR-115, FR-049 (manual), FR-010, FR-015, FR-217, FR-214, S-11, S-17, S-20 (undo), forwarding address FR-011 | Uses Q-T1 and Q-V3; Gmail in testing mode plus forwarding (GQ9) |
| 06 | Reminders, Home and daily digest | FR-120–FR-123, FR-215, FR-200, FR-201, FR-202, S-05, S-22, X-01, invariant monitors M5 and M10 | Open item 3; sending window in the workspace time zone |
| 07 | Payments and TDS | FR-140–FR-147, S-15 | |
| 08 | Files, capture and the AI gateway | FR-014, FR-052, FR-013, NFR-031, S-28, AI gateway with provider adapters, evals | Settle Q-H2 and Q-V5 first; the eval compares the direct API and Bedrock on the labelled sets (cost per successful task) before anything reaches a creator |
| 09 | Inbox, sorting, scam flags, import | FR-040–FR-051, FR-020–FR-022, FR-012, FR-294, S-03, S-04, S-06, S-07 | |
| 10 | Assistant | FR-230–FR-239, S-18, S-19 | |
| 11 | Plans, billing and price test | FR-290–FR-295, S-27, S-30, staff sign-in, staff invite screen | Billing stays off in the validation phase (manual pre-pay ask, GQ6) |
| 12 | Trust and data | FR-210–FR-212, FR-216, NFR-030, S-25, S-26, deletion and retention jobs | |
| 13 | Global search | FR-205, NFR-047, NFR-048, S-43 | Should: slips first if the beta date is at risk. Open items 1a–1e |
| **14a** | **Validation hardening (new; before the first invited creator)** | Production on DigitalOcean and AWS in business-owned accounts from the same modules; `bhq_backup` role and the hourly encrypted off-provider backup; **restore drill** of both layers (NFR-043); log forwarding with 30-day retention and CloudTrail alerting; SES production access; scoped **external security review** of what is live (NFR-029); **privacy page** listing every provider and region including free tiers (NFR-006); **breach-readiness drill** (NFR-037); AI terms confirmed (NFR-035, Q-H2); GL-A1 terms check; deferred flags listed; CA sign-off before any real invoice (Q20) | Runs right before the first creator is invited; the owner chooses the point (likely after iteration 7, when the invoice-reminder-payment loop works) and may move later iterations after the first creators |
| **14b** | **Hardening for the full setup (after the validation exit, GQ5)** | Standby database and 2+ web containers; Cloudflare proxy, Pro managed rules and the edge rate rule (NFR-028); 1-minute uptime and NFR-042 as a target; load and accessibility passes; deferred flags cleared one by one and `acs.yaml --exit-check` green; `BHQ_INVITE_ONLY` off; billing on; SMS only if switched on | Only when the owner decides to fund the full setup |
