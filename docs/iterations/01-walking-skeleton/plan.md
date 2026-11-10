# Iteration 01: Walking skeleton

| | |
|---|---|
| Status | **Draft for owner approval.** Not committed. Nothing in `app/` exists yet. |
| Inputs | Approved docs as of commit 7505cd5: `docs/PLAYBOOK.md`, `docs/01-usecases/use-cases.md`, `docs/02-prd/PRD.md`, `docs/03-architecture/architecture.md` and ADR-001 to ADR-020, `docs/04-design/` |
| Not an input | `docs/change-requests/001-global-market-and-infrastructure-value.md` (unadopted). Its effect on this plan is in section 10. |
| Tickets | `T-00.md` to `T-17.md` in this folder (T-00 is a documentation fix, T-17 is a spike with no app code) |

---

## 1. Goal

By the end of this iteration a real creator can open BackstageHQ on their phone, on the staging
site, sign up with their mobile number and a text-message code, prove a second way to sign in (their
email), fill in the business details their first invoice will need, and land on an empty but real
"Today" screen in their own private workspace. Behind that thin slice sits everything later work
hangs on: every record is tied to one workspace and the database itself refuses to show it to
anyone else; bank and PAN numbers are stored locked; every change goes through one door that checks
permission and writes the activity log; background jobs run; logs never contain secrets; and every
push to GitHub is checked automatically, while every merge deploys itself to staging.

## 2. Why this goal

- The playbook's first example iteration is "sign-up, the creator's account and settings (the
  skeleton everything hangs on)", and PRD section 4.1 makes every MVP flow depend on it.
- The architecture's rules (section 4) say every later feature uses the same Action runner,
  permission check, workspace isolation and encryption helper. If those are built late, every
  earlier feature has to be redone. Building them first, with nothing on top, is the cheapest
  moment to get them right and to test them hard.
- "CI from iteration 1" is a playbook rule and architecture section 20.1. The pipeline, the
  AC-traceability report and the staging deploy are cheapest to set up while the code is tiny.
- The four iteration-1 spikes (architecture section 28.2) cost little now and decide designs that
  later iterations depend on (send gate, AI provider terms, forwarding address, malware scanning).
- What is **not** chosen: anything that needs Gmail. Google's Gmail verification can take 12 weeks
  (PRD Q14), so Gmail work is scheduled later, while verification runs.

## 3. The demo the owner will see at the end

Done on the staging site, on a phone (or a desktop browser narrowed to phone width). Use a dummy
PAN such as `ABCDE1234F`; staging never holds real creator data (architecture section 19).

| # | Step | Screen (mockup) | Proves |
|---|---|---|---|
| 1 | Open the staging address. The sign-up screen shows "Sign up or sign in" with a mobile-number field. (No "Continue with Google" yet: that arrives in iteration 2.) | S-01, Phone state | NFR-007 |
| 2 | Type your mobile number, tap **Send code**. A 6-digit code arrives by text message (or, while SMS registration is pending, by email to your allow-listed address; see risk R1). | S-01, Code state | FR-001 |
| 3 | Type a wrong code once. You see "That code is not right. You have 4 tries left." | S-01, Wrong-code state | FR-001 AC2 |
| 4 | Type the right code. Your workspace is created with you as owner and **Profile setup** opens. | S-01 to S-02 | FR-001 AC1 |
| 5 | Type a PAN in the wrong format and tap **Save and continue**. You see "That PAN does not look right..." and nothing is saved. | S-02, Error state | FR-003 AC2 |
| 6 | Fix the PAN, fill in legal name, business type, state, bank account (holder, number, IFSC); leave GSTIN empty. Optionally add an opening total. | S-02, Normal state | FR-003, FR-023 |
| 7 | In the **Add a second way to sign in** card, type your email, tap **Send code**, type the emailed code. It shows "Verified". **Save and continue** only works once this is done. | S-02 (card added by PRD M1; not in the mockup) | FR-002 AC3 |
| 8 | You land on **Today**: "Welcome, <your name>. Nothing to do yet." Desktop width shows the side menu; phone width shows the bottom bar. Menu items for screens not built yet are hidden, and so is the search box. | S-05, Empty state | Shell |
| 9 | Open **Activity log**. You see plain-words entries: "You created this workspace", "You added your bank account for invoices", "You added your PAN", "You verified a second sign-in method". | S-20 (read-only list) | FR-003 AC4 (first half), FR-213 |
| 10 | Open **Settings: profile**. Your legal name, state and "GST threshold used: Rs 20,00,000" (try Mizoram: Rs 10,00,000) are shown. PAN shows as `ABCDE****F`, bank as `****7890`, each with "Change (needs a second check, coming in iteration 2)". Change the trading name and tap **Save**; a new log entry appears. | S-21 (business-profile and sensitive-details cards) | FR-003 AC3, FR-004 AC3 groundwork |
| 11 | Edit the address bar: replace the workspace ID in `/w/<id>/...` with any other ID. You get "Page not found", never someone else's data. | — | NFR-001, NFR-023 |
| 12 | Sign out. Sign in again on the same browser with your phone code: no extra check (if you ticked "Remember this device"). | S-01 | FR-002 AC2 |
| 13 | Open a private/incognito window (a "new device") and sign in with your phone code. You see "One more check" offering **only an email code** (never a second text message). Enter it and you are in; the log shows "New sign-in on <browser>". | S-01, New-device state | FR-002 AC1, AC4, NFR-032 |
| 14 | On GitHub, open the last pull request: every check is green (lint, types, tests on real Postgres with row-level security, architecture contracts, migration round trip, dependency audit, secrets scan). Open the **AC traceability** report: every acceptance criterion this iteration claims has a test named after it. | — | Playbook "CI from iteration 1", architecture 20.1 |
| 15 | Merge it. Within about 15 minutes staging redeploys by itself; `https://<staging>/health/ready` shows the new commit. | — | ADR-019 |
| 16 | Read the spike results (`spike-results.md` in this folder): four yes/no answers with evidence, and what changes if any answer was "no". | — | Q-T1, Q-V2, Q-V3, Q-V5 |

## 4. Scope

### In

| Area | IDs | Notes |
|---|---|---|
| Sign up and sign in by phone code | FR-001 AC1, AC2 | Google sign-in moves to iteration 2 |
| Second factor on a new device; a second method always exists | FR-002 AC1, AC2, AC3, AC4 | Second method in this iteration: verified email. "Or Google" arrives in iteration 2 with Google sign-in |
| Business profile with only what the first invoice needs | FR-003 AC2, AC3; AC1 and AC4 in part | AC1 is completed when invoices exist (iteration 4); AC4's "later change needs a second check" in iteration 2 |
| Opening total for the year (stored) | FR-023 (data only) | AC1 needs invoices (iteration 4) |
| Sensitive fields read-only for anyone but the owner | FR-004 AC3 (groundwork) | Changing them with a second check: iteration 2 |
| Activity log: append-only, same transaction, hash chain; read-only list | FR-213 AC2; AC1 in part; NFR-032 in part | Undo and filters later (FR-214) |
| Workspace isolation (three locks) | NFR-001, NFR-023 (foundation) | Search, export, notifications, assistant parts come with those features |
| Encryption of PAN, GSTIN, bank numbers | NFR-004 | Files and token vault later |
| Sessions: server-side, 30 days of inactivity | NFR-027 in part | "Devices and sessions" card and "Sign out everywhere": iteration 2 |
| Abuse limits on sign-in and codes | NFR-028 in part | App counters plus a WAF rate rule |
| No secrets or personal data in technical logs or Sentry | NFR-025 | Tokens do not exist yet; the filter and its test do |
| Background jobs, worker, heartbeat | NFR-012 (foundation) | |
| Health checks, outside uptime check on staging | NFR-042 (foundation) | |
| Phone-first, accessible screens | NFR-007, NFR-041 | Playwright + axe on the sign-up flow |
| Permission policy and matrix (owner, assistant overlay, never-delegable rows) | PRD section 7.2 foundation (section 5.P) | Manager and helper rules run in v1 |
| CI, AC traceability, staging deploy | Playbook; architecture 20.1, 20.2, 20.3; ADR-017, ADR-019 | Production environment is set up in the hardening iteration |
| Spikes | Q-T1, Q-V2, Q-V3, Q-V5 | Research only, no app code |

### Out (and where it goes)

- Google sign-in, Google as second factor, account recovery (UC-001 edge case, E9): iteration 2.
- Second check (S-29), changing bank/PAN/GSTIN (FR-004 AC1, AC2), "Devices and sessions" (S-21 card,
  NFR-027 full): iteration 2.
- Connect sources (S-03) and everything Gmail, Instagram, WhatsApp, forwarding: iterations 5, 8, 9.
- Rate card and terms (S-23), notification settings (S-24): iteration 2.
- Global search (FR-205, S-43): iteration 13. The search box is hidden until then.
- Billing and plans (FR-290 to FR-295): iteration 11. Every workspace behaves as "trialing" with no
  gating in this iteration, because no paid feature exists yet.
- Production AWS account and deploy: iteration 14 (hardening), before any real creator.

## 5. Tickets

| ID | Title | Tier | Depends on | FR / NFR |
|---|---|---|---|---|
| T-00 | Mark the approved architecture and ADRs as accepted (docs only) | B | owner approval | Open item 4 |
| T-01 | Project skeleton and local environment | B | — | NFR-042 (health), ADR-001, ADR-019 |
| T-02 | CI pipeline on every push | B | T-01 | Architecture 20.1, ADR-017, ADR-019 |
| T-03 | AC-traceability report | B | T-01 | Architecture 20.1, 21 |
| T-04 | Tenancy: users, workspaces, memberships, database roles and forced RLS | A | T-01 | NFR-001, NFR-023, ADR-004 |
| T-05 | Permission policy `authorize()` and the matrix file | A | T-04 | PRD 7.2, FR-004 AC3, ADR-008 |
| T-06 | Action runner and append-only activity log | A | T-05, T-07 | FR-213 AC1 (part), AC2, NFR-032, ADR-007, ADR-010 |
| T-07 | Field encryption with per-workspace keys | A | T-04 | NFR-004, ADR-005 |
| T-08 | Background jobs, worker and heartbeat | B | T-04 | NFR-012, ADR-006 |
| T-09 | Structured logs, Sentry and redaction | B | T-01 | NFR-025, ADR-018 |
| T-10 | Phone sign-up and sign-in with SMS code | A | T-06, T-07, T-09 | FR-001 AC1, AC2, NFR-027 (part), NFR-028 (part), ADR-012 |
| T-11 | Second sign-in method (verified email) and new-device check | A | T-08, T-10 | FR-002 AC1–AC4, NFR-004, NFR-032 |
| T-12 | App shell, empty Home and read-only activity log | B | T-06 | S-05, S-20, NFR-007, NFR-041 |
| T-13 | Business profile data, rules package and Actions | B | T-06, T-07 | FR-003 AC1 (part), AC2, AC3, AC4 (part), FR-023, NFR-004 |
| T-14 | Profile setup (S-02) and Settings: profile (S-21) screens | B | T-11, T-12, T-13 | FR-002 AC3, FR-003, FR-004 AC3, S-02, S-21 |
| T-15 | Staging infrastructure in Terraform | A | T-04; CR-001 decision; owner prerequisites | ADR-002, ADR-005, ADR-019, NFR-043 (part) |
| T-16 | Build the image and deploy to staging on merge | B | T-02, T-15 | Architecture 20.2, ADR-017, ADR-019, NFR-042 |
| T-17 | Spikes: Q-T1, Q-V2, Q-V3, Q-V5 | A | owner prerequisites | Architecture 28.2 |

**Size.** 16 build tickets (T-01 to T-16) is at the top of the "8–15" range. T-00 is a five-minute
documentation edit and T-17 is research with no app code. If the iteration must shrink, the cut line
is: the read-only activity log list (in T-12) and the S-21 screen (in T-14) move to iteration 2;
nothing else can move without breaking the demo.

**Tier A count.** Eight tickets are tier A. That is expected for a foundation iteration: tenancy,
permissions, encryption and sign-in are exactly what CLAUDE.md routes to Opus. From iteration 2 on,
most tickets reuse these pieces and should be tier B.

## 6. Order and parallel work

```
T-00 (docs, any time before T-01)
T-01 ─┬─ T-02 ─────────────────────────────────────┐
      ├─ T-03                                       │
      ├─ T-09 ───────────────┐                      │
      └─ T-04 ─┬─ T-05 ─┐    │                      │
               ├─ T-07 ─┴─ T-06 ─┬─ T-10 ─ T-11 ─┐  │
               ├─ T-08 ──────────┼────────┘      │  │
               │                 ├─ T-12 ────────┤  │
               │                 └─ T-13 ────────┴─ T-14
               └─ T-15 (after CR-001 decision) ─────┴─ T-16
T-17 (spikes) any time, in parallel with everything
```

- **Lane 1, pipeline:** T-01, then T-02, T-03 and T-09 in parallel.
- **Lane 2, core:** T-04, then T-05, T-07 and T-08 in parallel, then T-06.
- **Lane 3, product:** after T-06: T-10 then T-11; T-12 and T-13 in parallel with them; T-14 last.
- **Lane 4, infrastructure:** T-15 then T-16. T-15 can start as soon as T-04 exists (it uses the
  role bootstrap command), **but only after the owner decides how to treat CR-001** (section 10).
- **Lane 5:** T-17 whenever the owner's accounts are ready.
- Parallel tickets each run on their own branch. Tickets that add dependencies all touch
  `app/pyproject.toml` and `app/uv.lock`, and several touch `app/config/settings/base.py`: merge one at
  a time and rebase the next (conflicts are mechanical).
- **The custom user model must exist in the very first migration** (T-04). Django cannot switch to a
  custom user model later without a painful rebuild, so no ticket may run `migrate` with
  `django.contrib.auth`'s default user before T-04 lands. T-01 sets `AUTH_USER_MODEL` but creates no
  migrations.

## 7. Risks and spikes

### Risks

| # | Risk | Effect | Mitigation |
|---|---|---|---|
| R1 | Indian SMS rules: MSG91 needs DLT registration (entity, sender ID, template), which can take one to three weeks | No real text messages on staging for the demo | Owner starts registration now. T-10 builds a staging-only "email relay" SMS backend that emails codes to an allow-list of team addresses; a Django system check refuses it in production settings |
| R2 | SES starts in sandbox mode: it only sends to verified addresses | Email codes fail for unverified addresses | Verify the team's demo addresses in SES staging, or request production access early (T-15) |
| R3 | CR-001 is adopted after infrastructure is built | T-15, T-16 and most of T-17 wasted | Owner decides before T-15 starts (section 10). T-01 to T-14 are cloud-neutral |
| R4 | Row-level security traps: a superuser or table owner silently bypasses it; an empty setting cast to UUID errors; a session-level `SET` leaks across pooled connections | A false sense of isolation, or 500 errors | T-04 pins all three: app roles are `NOSUPERUSER NOBYPASSRLS`, tables use `FORCE`, the policy uses `NULLIF(...,'')`, only `set_config(..., true)` (transaction-local) is allowed, and tests prove each |
| R5 | Python package names in architecture section 5 collide with the standard library (`collections`, `profile`, `platform`), and `rules/in/` uses a reserved word | The first builder hits import errors or silently shadows Python's own modules | Proposed layout fix D1 in section 11, needed before T-01 |
| R6 | Procrastinate is a smaller project (ADR-006) | Library stalls | All code uses our `bhq.jobs` wrapper, so a swap touches one module |
| R7 | ARM64 images on GitHub-hosted runners | Slow builds through emulation | T-16 uses an ARM runner if the plan allows, otherwise buildx with QEMU and layer caching |
| R8 | Iteration size (16 build tickets) | Iteration runs long | Cut line in section 5; lanes run in parallel |
| R9 | The S-02 mockup predates PRD edit M1 and has no "second sign-in method" card | Builder guesses the layout | T-14 specifies it: one card using the existing `.card`, `.field` and code-entry pattern from S-01 and S-29 |

### Spikes (all in T-17)

| Spike | Question | What it decides | If the answer is "no" |
|---|---|---|---|
| Q-T1 | Does Gmail keep our own `Message-ID` on `users.messages.send`, so a retry can find the message with `rfc822msgid:` before sending again? | The send gate's "effectively once" design (architecture section 13, ADR-009), built in iteration 5 | Fall back to recording a content fingerprint and, before any retry, searching Sent for the same recipient and subject in the last 24 hours and comparing the fingerprint. Needs an architecture section 13 / ADR-009 edit before iteration 5 is planned |
| Q-V2 | Can Haiku 4.5 and Sonnet 5 in Bedrock's India profile run without the account's data-sharing mode with the model maker? | Whether ADR-011 (S2) holds and NFR-035 can be met as written | Choose a model version that can, or reopen S2 (Anthropic API with zero retention, or Gemini on Vertex). Not needed until the AI iteration (8); must be settled before beta |
| Q-V3 | Does SES email receiving work in ap-south-1? | Sign-off S7: SES or Postmark for the forwarding address (FR-011) | Use Postmark inbound (US) or SES receiving in another region, and list it on the privacy page (NFR-006). Our own outgoing email stays on SES Mumbai. Decided before iteration 5 |
| Q-V5 | Is GuardDuty Malware Protection for S3 available in ap-south-1? | ADR-005 malware scanning (NFR-031) | ClamAV container (ADR-005's alternative): about 2 GB of memory and signature updates to run. Decided before iteration 8 |

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
| 4 | Stale status labels: architecture.md section 0 says "Proposed. Draft for owner approval. Not committed." and every ADR says "Proposed", although approved in commit 1abed76 | **T-00** (docs-only ticket, needs the owner's OK because it edits approved documents) | Yes: status lines only, no content |

## 9. Proposed edits to approved documents that this plan needs (applied 2026-11-10)

These are small and technical. None changes product behaviour. They need the owner's approval
because the documents are approved; they can go in the same documentation commit as T-00.

| # | Document | Proposed edit | Why |
|---|---|---|---|
| D1 | Architecture section 5 (and the paths in 5, 16A, 20.1, 21) | All modules live under one Python package: `app/bhq/<module>/` (for example `bhq.outbound.gate`, `bhq.files.crypto`, `app/bhq/workspaces/matrix.yaml`). The country rule package is `bhq/rules/india/v2026_1/` instead of `rules/in/v2026_1/`. Module names and boundaries are unchanged. Two non-domain packages are added: `app/config/` (Django settings, URLs, health, logging) and `bhq/common/` (tiny shared helpers with no tables: IDs, redaction, context processors) | `collections`, `profile` and `platform` are names of Python standard-library modules, so top-level packages with those names would break Python and its libraries; `in` is a reserved word and cannot be imported |
| D2 | ADR-004 appendix and architecture 11.3 | Add `user_workspace_ids(user_id)`: a `SECURITY DEFINER` function owned by `bhq_crossws`, returning only the workspace IDs where that user has an active membership; `bhq_web` and `bhq_worker` may execute it | After sign-in the app must find the user's workspace before any workspace context exists, and security events (lockouts, new-device sign-ins) must be logged in the workspaces the user owns. Membership rows are behind RLS, so this needs one narrow, ID-only function, the same pattern as the existing appendix |
| D3 | Architecture 10.2 | Add the action type `edit_business_profile` (legal name, state, trading name, handles, opening total). It is not in the delegable list, so only the owner holds it in the MVP; v1 decides whether a manager may be ticked for it. Also record PRD M2's rule: `change_payout_bank` and `change_pan_gstin` on a field never saved before return ALLOW (logged) instead of STEP_UP | S-21 is "Owner only" (PRD section 6) but no action type covers the non-sensitive profile fields; M2's first-entry rule needs a home in the policy |

## 10. Change request 001 (unadopted): impact on this iteration

This plan follows the approved baseline (AWS Mumbai, ADR-002; Bedrock India, ADR-011). CR-001 is a
proposal only, but its own text says the vendor choices "must be reconsidered before infrastructure
is provisioned". If the owner later adopts it:

| Ticket | Effect if CR-001 is adopted |
|---|---|
| T-15 Staging infrastructure | **Wasted.** Every resource is AWS-specific (ECS, ALB, WAF, RDS, KMS, SES, IAM, OIDC) |
| T-16 Deploy to staging | **Mostly rework.** The Dockerfile survives; ECR, ECS and OIDC steps are replaced |
| T-17 Spikes | **Q-V2, Q-V3, Q-V5 wasted** if Bedrock or AWS are dropped; Q-T1 (Gmail) survives |
| T-07 Field encryption | Small rework: replace the `AwsKms` adapter (about one file); the envelope design survives |
| T-10, T-11 SMS and email codes | Small rework if "authentication messaging" changes provider or opens non-Indian numbers: one client class each, plus phone-number rules |
| T-09 Logs | Minor: CloudWatch-specific settings only |
| T-01 to T-06, T-08, T-12 to T-14 | Unaffected: Django, PostgreSQL row-level security, the Action runner and the screens run on any host |

**Recommendation:** start T-01 to T-14 now, and decide before T-15 whether CR-001 is (a) rejected or
parked until after the beta, or (b) settled first. Settling it first delays only lanes 4 and 5 by
the length of the comparison work.

## 11. Before T-01: what the owner must decide or set up

**Decisions**
1. Approve documentation edits D1 to D3 (section 9) and T-00. D1 is needed before T-01; D2 before
   T-04; D3 before T-05.
2. CR-001: rejected/parked, or settled before T-15 (section 10).
3. Accept the scope split: Google sign-in, the second check and "Devices and sessions" move to
   iteration 2.
4. Accept the staging-only SMS fallback (risk R1) while DLT registration is pending.
5. For T-00: should ADR-002 and ADR-011 read "Accepted" or "Accepted (under review, CR-001)"?

**Accounts and lead-time items (owner actions)**
- A private GitHub repository with Actions enabled, and this repo pushed to it (there is no git
  remote today). Needed for T-02.
- An AWS Organization with a separate staging account; a domain name for staging, with DNS in
  Route 53. Needed for T-15.
- MSG91 account and DLT registration (entity, sender ID, one OTP template). Start now.
- Sentry project (staging), Healthchecks.io check, Better Stack (or similar) uptime monitor. Needed
  for T-09 and T-16.
- For T-17: a Google Cloud project with the Gmail API and a test Gmail account (testing mode), and
  Bedrock model access requested in the staging account in ap-south-1.

## 12. Next iterations (outline; each is planned properly when its turn comes)

| # | Iteration | Main IDs | Notes |
|---|---|---|---|
| 02 | Account completion and settings | FR-001 (Google), FR-002 AC4 (Google), FR-004 AC1–AC3, FR-003 AC4, NFR-027, S-29, S-21 sessions card, S-23 (FR-025 AC2–AC3, FR-026), S-24 (FR-202 settings), privacy page (NFR-006), audit hash-chain invariant check | Also account recovery (E9) |
| 03 | Brands, leads, deals and quotes by hand | FR-047–FR-050 (manual parts), FR-070–FR-072, FR-080–FR-083, FR-025 AC1, S-08, S-09, S-10 | No AI yet |
| 04 | Invoices, credit notes, money owed, GST threshold | FR-110–FR-116, FR-124, FR-125, FR-023 AC1, FR-003 AC1, FR-150–FR-152, S-12–S-14, S-16, X-02 | CA sign-off (Q20) before any real invoice |
| 05 | Send gate, Gmail connection, approvals | FR-236, FR-237, FR-115, FR-049 (manual), FR-010, FR-015, FR-217, FR-214, S-11, S-17, S-20 (undo), forwarding address FR-011 | Uses Q-T1 and Q-V3; Gmail in testing mode until verified |
| 06 | Reminders, Home and daily digest | FR-120–FR-123, FR-215, FR-200, FR-201, FR-202, S-05, S-22, X-01, invariant monitors M5 and M10 | Open item 3 |
| 07 | Payments and TDS | FR-140–FR-147, S-15 | |
| 08 | Files, capture and the AI gateway | FR-014, FR-052, FR-013, NFR-031, S-28, AI gateway and evals | Uses Q-V2 and Q-V5 |
| 09 | Inbox, sorting, scam flags, import | FR-040–FR-051, FR-020–FR-022, FR-012, FR-294, S-03, S-04, S-06, S-07 | |
| 10 | Assistant | FR-230–FR-239, S-18, S-19 | |
| 11 | Plans, billing and price test | FR-290–FR-295, S-27, S-30, staff sign-in | Open item 2 |
| 12 | Trust and data | FR-210–FR-212, FR-216, NFR-030, S-25, S-26, deletion and retention jobs | |
| 13 | Global search | FR-205, NFR-047, NFR-048, S-43 | Should: slips first if the beta date is at risk. Open items 1a–1e |
| 14 | Hardening and production | NFR-029, NFR-043 drill, NFR-028, NFR-037 drill, load and accessibility passes, production account | Before any real creator |
