# Global market and infrastructure value

Date: 2026-11-09
Status: Adopted. Owner adopted the direction on 2026-11-10 and accepted every recommendation in GQ1–GQ10 and the GL1–GL24 wording on 2026-11-11. Still open: the GQ7 monthly cap and review budget figures.

## Owner direction

BackstageHQ is not restricted to Indian creators; it can serve a global market.
Choose infrastructure and AI services for the best total cost while preserving
product quality, security, reliability, and the ability to build and maintain it well.
AWS, Bedrock, and India-only hosting are not requirements merely by preference.

This records the owner's new direction. The amendments below are proposals, not
silent replacements of the approved use cases, PRD, or architecture.

## Existing baseline and affected decisions

- Use cases D1 currently specify India-first and global in v2
  (`docs/01-usecases/use-cases.md:1741`). This proposal makes the global market
  direction explicit without silently advancing all international features into MVP.
- Use cases D11 already say there is no India data-residency promise in v1
  (`docs/01-usecases/use-cases.md:1751`); the PRD repeats this at line 1269.
  No product-level India-only constraint needs removing.
- The PRD excludes foreign-currency invoicing from MVP (line 85) and requires
  country-specific rules; these exclusions remain until separately revised.
- ADR-002 and architecture decision S1 select AWS Mumbai/Hyderabad; ADR-011
  and S2 select Bedrock India. Reopen their locality-based rationale and compare
  alternatives; do not assume AWS or Bedrock is either cheapest or disqualified.
- The PRD's M14 includes AI and hosting in its 30%-of-price target. The earlier
  proposal to count variable cost only is a separate, unresolved scope change.

## Proposed upstream wording

### Use cases: market scope

> BackstageHQ serves solo creators and creators without a professional business
> team across countries. India is a possible initial launch market, not a permanent
> eligibility restriction. Choose the first supported launch market(s) explicitly;
> global ambition does not imply worldwide tax, billing, or legal support at MVP.

### PRD: country support and infrastructure constraints

> Distinguish the addressable global market from countries supported at launch.
> Publish a supported-country matrix covering onboarding, billing, currency,
> invoicing, tax rules, payment integrations, and support. Never apply Indian tax
> or invoice rules by default to another country's workspace. Preserve the
> existing launch scope until a specific country expansion is approved.

> Infrastructure vendors, AI providers, and deployment regions are selected on
> total cost and demonstrated fitness for the product. India-only storage or AI
> processing is not assumed solely because India was the initial market focus.
> Preserve the existing cross-border rules and published storage/processing-region
> disclosures, along with applicable contractual data-handling requirements. Any
> actual change to those requirements needs an explicit approved PRD amendment.

> Existing acceptance criteria for security, tenant isolation, backup and restore,
> availability, latency, and AI accuracy remain minimum requirements. Savings do
> not justify weakening them. Any revision requires a separate explicit decision.

### Architecture: provider selection policy

> Choose the lowest total-cost option among candidates that meet the approved
> quality requirements. Count recurring service bills, engineering and maintenance
> effort, operational burden, and likely migration cost. Compare app hosting and
> AI inference independently; using one cloud does not mandate its AI service.
> Keep portable application boundaries without building a multi-cloud platform.

> Prefer one deployment region initially if it meets latency and data-handling
> requirements for supported markets. Add regions when measured demand or a
> binding requirement justifies the cost and complexity.

## Comparison required before replacing vendor decisions

- Hosting: compare the existing AWS design with a simpler managed platform
  (such as Render) and managed container hosting (such as Cloud Run), using the
  same app, durable worker, scheduler, database, storage, and recovery needs.
- AI: compare Bedrock with direct model APIs and suitable alternatives on the
  same labelled product tasks. Select model/provider/version by measured accuracy,
  latency, privacy terms, and cost per successful task, including retries and review.
  Do not automatically upgrade to the latest model without evaluation.
- Show a consistent workload at beta, 100, and 1,000 active creators, plus a heavy
  usage case. Reuse approved usage assumptions where available; label new ones.
- Include production and staging, database and restore capability, background
  work, files, bandwidth, logs, monitoring, keys, email/SMS, and support charges.
  Show AI and billing/payment fees separately so the total product cost is visible.
- Show fixed costs, usage costs, and fully allocated cost per paying creator
  separately. Do not silently redefine the existing M14 cost target.
- Record dated official prices, regions, currencies, taxes, and exclusions.
  Separate temporary credits from steady-state costs. Verify feature availability
  and required paid plans; a free tier is not evidence of production suitability.
- Explain the cheapest qualifying candidate, any reason to pay more, and the
  migration trigger. Do not select a winner from headline compute/token prices.

## Reference sources for the comparison

Official pages checked on 2026-11-09; these are inputs, not a completed estimate:

- [Cloud Run pricing](https://cloud.google.com/run/pricing)
- [Cloud Run billing modes](https://docs.cloud.google.com/run/docs/configuring/billing-settings)
- [Render pricing](https://render.com/pricing)
- [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- [Direct Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

## Review and application

Review the upstream wording first, then apply approved changes to use cases and
PRD before revising dependent architecture decisions. Re-evaluate hosting, AI,
residency, backups, encryption/key services, email, authentication messaging, and
subscription billing where they depend on the previous regional/vendor assumptions.
Existing vendor choices remain the recorded baseline while this amendment is
under review; they must be reconsidered before infrastructure is provisioned.
No new provider or launch country is selected by this proposal.

## Adoption draft (2026-11-10)

**Status of this section: proposal from the product side, for the owner to approve.** Nothing below
has been applied to `docs/01-usecases/use-cases.md`, `docs/02-prd/PRD.md` or the iteration-1
tickets. The architect handles hosting, AI, email and SMS vendors afterwards, within these rules.

The owner's direction of 2026-11-10, in their words:

> "This is going to be for global audience. Think build in India for the world. Staging email could
> work. Let's build the first few versions with minimum external costs — let's start with a personal
> developer account for access or personal phone SIM — but definitely keep provisions for the
> full-blown implementation with actual accesses later when we validate the idea with real persons
> when I have a working product. Then we can think of investing actual serious funds."

So the owner adopts the global direction of this change request and adds a new constraint: a
**low-cost validation phase** comes before real money is spent. The staging-only fallback that
emails sign-in codes to allow-listed addresses is already approved (iteration 1 plan, risk R1).

### A. Brief check

| Question | Answer |
|---|---|
| Who is the user in the validation phase? | The owner, then a handful of real creators the owner invites. Most will be P2 Arjun-type Indian creators. |
| What job are they doing? | The same as the MVP: get paid without typing or chasing. The validation phase tests whether the loop is useful on their real work, not whether they will pay at scale. |
| What breaks today in our plan? | (1) Sign-in is built on Indian SMS, which needs DLT registration, costs money per message and differs per country. (2) Every screen assumes Indian tax, PAN, rupees and IST. (3) The approved docs say no real creator data before the hardening iteration and an external review, which conflicts with "real persons on a cheap setup" unless we define the phase carefully. |
| What does the creator care about here? | Their deal values, bank and PAN details being safe even though "it is only a test"; reminders actually firing; not losing data when we move to the paid setup; and being able to export and leave. |

### B. Market scope and first supported country

**Wording.** "BackstageHQ is built in India for creators worldwide. The addressable market is
global. Countries are supported one at a time: a country is supported only when its onboarding,
currency, invoice format, tax rules, payment detection, billing and support are all in place and
approved. India is the first supported country."

**Recommendation: India is the only supported country in the validation phase and the MVP beta.**
A second country is chosen after the MVP beta, from waitlist demand (below) and an approved rule set.

| Reason | Detail |
|---|---|
| The product's value is Indian today | GST threshold, TDS chasing, PAN/GSTIN invoices, UPI, Indian bank alert emails and Hinglish drafts are the features that beat a free spreadsheet. A creator elsewhere would get a weaker product. |
| The owner can recruit here | The beta relies on intros and communities (PRD R12). |
| The CA review is already planned for India | Q15/Q20. Each new country needs its own accountant review and invoice rules. |
| It keeps the cost low | One rule set, one currency, one time zone, one legal regime during the cheap phase. |

**What "never apply Indian rules by default to another country's workspace" means at MVP:**

| # | Rule |
|---|---|
| 1 | Every workspace has a **country**, chosen by the creator at sign-up (suggested from the browser, never silently assumed). Currency, time zone, identifiers (PAN, GSTIN, IFSC), the state list, tax rules and invoice format all come from that country's rule set. |
| 2 | No code path falls back to India. If a workspace's country has no rule set, the rule lookup fails closed: nothing is calculated, shown or sent. |
| 3 | Indian fields (PAN, GSTIN, state, IFSC, GST threshold, TDS, "₹", Indian digit grouping, IST) appear only in Indian workspaces. |
| 4 | Time-based rules (brand sending window, quiet hours, lock-out times) use the workspace's time zone, IST for India. |
| 5 | The country can be changed until the first invoice is issued; after that only through support, because it changes tax rules on issued documents. |
| 6 | Tests prove it with a test-only fake country rule set (there is no second real country at MVP). |

**What a creator from an unsupported country sees: a waitlist.** At sign-up, the country list shows
India plus "My country is not listed". Choosing that shows "BackstageHQ is not available in your
country yet", with a form for email and country only, and a consent line. No workspace is created.
- Why not a **limited mode without tax features**: their invoices would still need that country's
  legal invoice fields, VAT or sales-tax rules and currency, so "generic" is not legally safe; their
  support load and data-protection duties (for example GDPR for EU residents) begin on day one; and
  their results would distort the price test (metrics M12–M14).
- Why not **generic invoices for everyone**: same reasons, plus it trains creators to trust an
  invoice we have not had checked.
- The waitlist gives the measured demand that this change request asks for before adding a country.

### C. Sign-in that works globally and costs close to nothing

SMS codes cost money per message, the price varies by country, India needs DLT registration (sender
ID and template), other countries have their own registration, and SMS is open to SIM-swap fraud.

**Recommendation (validation phase and MVP):**

| Step | Method | Cost | Works in every country |
|---|---|---|---|
| First factor (sign up, sign in) | **Email code** (6 digits, 5 minutes, same lock-out rules as today). **Google sign-in** added as an alternative in iteration 2, as already planned (basic profile only, no Gmail access). | Close to zero: transactional email | Yes |
| Second factor (new device, and the "second check" for bank/PAN/GSTIN changes) | **Authenticator app code** (Google Authenticator, Microsoft Authenticator or similar), plus 10 one-time **backup codes** shown once at setup | Zero | Yes, works offline |
| Phone code by SMS | **Built behind a switch, off.** Switched on per country once a paid SMS provider exists and, for India, DLT registration is done. When on, it can be a first factor or a second factor. | Per message, per country | Country by country |

Rules that go with it:
- **Independence rule.** An email code and Google sign-in on the same address count as the **same
  kind** (both open with the same Google account). So the second factor is always the authenticator
  app, a backup code or (when switched on) a phone code; never email-plus-Google on one address.
- **Phone-only creators** (P1 Riya) cannot scan a QR code shown on their own screen. Setup must offer
  "Open in authenticator app" and "Copy setup key" as well as the QR code.
- **Passkeys** (sign in with the phone's screen lock) are a better experience and also free; propose
  them as a Could for v1, once the authenticator flow is proven.
- **Staging.** Email codes are the sign-in path. The email provider's sandbox or test mode, which
  only delivers to verified addresses, doubles as the allow-list. The approved SMS email-relay stays
  available only if the phone switch is tested on staging.
- **The owner's personal SIM** is a test handset only: it may receive test SMS on staging or act as
  a test WhatsApp number. It is never a creator-facing number (see section D).

Trade-off the owner should know: Indian creators are used to phone OTPs, and an authenticator app is
one extra step at setup. The validation phase measures it (assumption GL-A2 below). If it fails, the
fallback is to switch SMS on for India as the second factor, which needs DLT registration and a
small per-message cost.

### D. The validation phase

**Definition.** A phase before the MVP closed paid beta in which the owner and a small number of
invited real creators use a working BackstageHQ on the cheapest setup that still protects their data.
It ends when the owner decides to fund the full setup.

| Item | Proposal |
|---|---|
| Who | The owner, then **up to 10 invited creators in India** (allow-listed by email address). |
| Two steps | **V0, owner only, dummy data:** staging, personal developer accounts, the owner's SIM, free tiers; anything cheap is fine because no real creator data exists. **V1, invited creators, real data:** a separate low-cost **production** environment, never staging (architecture section 19: staging never holds real creator data). |
| Price to the creator | Free during the phase (no payment gateway). Owner decision on a pre-pay ask at the end (open question GQ6). |
| Gmail | Google "testing mode" (free, up to 100 named test users; the creator sees an "unverified app" warning and reconnects every 7 days, PRD 12.1). Forwarding address as the always-on fallback. No paid security assessment yet. |
| Instagram DMs | Meta development mode with the creators added as testers, if Meta allows it for this API (to verify); otherwise the screenshot fallback (FR-052). |
| WhatsApp forward-to number | Testing only, on a Meta test number or a spare SIM (a number on the WhatsApp Business Platform stops working in the normal WhatsApp app, so not the owner's everyday number). Real creators use email forward and upload until the permanent business number exists, because changing the number later breaks what they saved. |
| AI | Paid-per-use API on a developer account is fine **only if** its terms say no training and short retention (NFR-035). Free AI tiers whose terms allow training on inputs are never used with real creator data. |
| Accounts | Personal developer accounts are fine for V0. Accounts that hold real creator data in V1 should be in the business's name or transferable to it (open question GQ8). |
| Hosting, database, email | The architect picks the cheapest option that meets "what must still hold". A host that sleeps when idle is not allowed for the worker (reminders) or the web app (NFR-007 on the first tap). |

**What must still hold in V1 (no exceptions; CR-001: savings never weaken these):**
tenant isolation (NFR-001, NFR-023), encryption of stored data and of PAN/GSTIN/bank (NFR-004), the
second factor (FR-002), no secrets or personal data in logs (NFR-025), the send gate and zero
send-gate breaches (metric M10), zero reminder misfires (NFR-008), scheduled jobs on time
(NFR-012), backups with no more than 1 hour lost and a tested restore before the first real
creator (NFR-043), the activity log (NFR-032), export and deletion (UC-130, UC-132, NFR-005), the
privacy page listing every provider and region used, including free tiers (NFR-006), AI terms
(NFR-035), breach readiness (NFR-037), the external security review before real users (NFR-029,
scoped to what is live), and the CA sign-off before any real invoice (Q20).

**What cannot be met in the validation phase, and how each is handled.** Each is **deferred with a
flag**, not dropped: it is listed in the AC-traceability file as `deferred: validation-phase (GLn)`,
the traceability report shows it, and the exit checklist cannot pass while any flag remains.

| Requirement | Validation-phase treatment | Back on at |
|---|---|---|
| NFR-042 uptime 99.5% a month | Measured and alerted by the outside monitor, not a target | Full setup (MVP beta) |
| NFR-028 abuse limits (edge/WAF rate rule part) | In-app limits hold; the edge rule is deferred. The allow-list closes sign-up to strangers | Full setup |
| FR-001 phone sign-up; FR-002 AC4 as worded; I-06 | Replaced by email first and authenticator second (GL12, GL13). Phone switch off | When the owner switches SMS on for a country |
| NFR-010 and metric M1 (15 minutes after Gmail) | Measured only for creators on Gmail testing mode; weekly reconnects noted | Gmail verification |
| NFR-038 DMs in 5 minutes; FR-012 | Only for creators Meta lets us add as testers; otherwise screenshot fallback | Meta app review |
| FR-013 WhatsApp forward-to number | Owner testing only; creators use email forward and upload | Permanent business number |
| FR-292 pay for a subscription; I-09; FR-291 trial | No billing; manual if the owner chooses a pre-pay | Full setup |
| Metrics M12, M13, M14 | Not measured (no payments). Variable cost per creator is still recorded as an estimate | MVP beta |
| NFR-031 malware check on uploads | Holds if uploads are on; if scanning is not ready, uploads stay off for real creators | When scanning exists |

**Exit trigger to the paid full setup (proposal; the owner sets the numbers, GQ5):** both of
(a) **at least 6 of the 10 creators active every week for 4 weeks in a row**, and at least 5 saying
they would pay one of the test prices (or pre-paying); and (b) the owner decides to fund the full
setup. Separately, the phase must end before any of these is needed: more than 10 creators, more
than 100 Gmail test users, creators outside the allow-list, real SMS, or taking payment through a
gateway. Exit work: switch the deferred flags back on one by one, move accounts to the business's
name, and migrate data with a tested restore. Each move is listed in the hardening iteration.

### E. Proposed edits to the use cases and the PRD

**About the IDs.** The PRD already uses G1–G8 for goals (section 2.1) and G1–G29 for the designer's
gaps (section 14A), so a third "G" series would be ambiguous. These edits are numbered **GL1–GL24**
("global"); open questions are **GQ1–GQ10**; new assumptions are **GL-A1–GL-A3**. Rename if you
prefer.

**Use-case document (`docs/01-usecases/use-cases.md`)**

| Edit | Where | Proposed new wording (short form) | Why |
|---|---|---|---|
| GL1 | Section 3 intro, line 96 ("v1 is **India-first** (D1)") | "BackstageHQ is **built in India for creators worldwide** (D1). India is the first supported country for the validation phase, the MVP and v1; other countries are added one at a time. It is built for individuals and sole proprietors (D15)." | Owner direction |
| GL2 | Decision D1, line 1765 | "Global addressable market, built from India. A country is supported only when its rule set (currency, invoice format, tax, identifiers, time zone), billing and support are approved. India is first. Indian rules never apply by default to another country's workspace (NFR-022)." Impact column: add UC-001 and NFR-022 (Must). | Replaces "global in v2" |
| GL3 | New decision D41 (section 11) | "A low-cost **validation phase** comes before the MVP beta: the owner and up to 10 invited creators, free, on the cheapest setup that keeps every security, isolation, encryption, backup and privacy rule. Exit when usage and pay signals are met and the owner funds the full setup (PRD 4.5)." | Owner direction |
| GL4 | UC-001 main flow and edge cases, lines 450–457 | Main flow: "1. Choose your country, then sign up with an email code or Google. 2. Set up an authenticator app as your second sign-in method. 3. For India: legal name, PAN, state, bank account, GSTIN if registered…". Edge cases add: "Country not supported yet: join the waitlist, no workspace. Phone sign-in only where switched on." | Sign-in and country |
| GL5 | NFR-022, line 1689 | Priority **Should to Must**. "Every workspace has a country. Tax rules, invoice formats, currency, identifiers and time zone come from that country's rule set. No rule falls back to India. Adding a country needs no change to deal, invoice or payment logic." | "Never apply Indian rules by default" must be testable |
| GL6 | Out-of-scope row, line 1727 ("Global tax and currency… v2") and P4 risk, line 113 ("Fully global creators are v2") | "Countries other than India: added one at a time after the MVP beta, from waitlist demand and an approved rule set." | Replaces "v2" |

**PRD (`docs/02-prd/PRD.md`)**

| Edit | Where | Proposed new wording (short form) | Why |
|---|---|---|---|
| GL7 | Section 0, "Words used" | Add **Validation phase** (as section D above) and **Supported country** (a country whose onboarding, currency, invoicing, tax rules, payment detection, billing and support are approved). | New terms |
| GL8 | Section 0, "Second check" | "A one-time code from the creator's **second method** (authenticator app, a backup code, or a phone code where switched on), needed for sensitive actions." | An email code cannot be the second check when email is the first factor |
| GL9 | Section 2.2, non-goals | Add: "Supporting countries other than India in the validation phase and the MVP." Keep "foreign-currency invoicing" and "promise that data stays in India". | Keeps scope honest |
| GL10 | Section 4.1, release table | New first row: **Validation phase** · owner plus up to 10 invited creators in India · "the loop is useful on real work, on a low-cost setup, with every safety rule intact" · exit test: section 4.5 trigger. | New phase |
| GL11 | New section 4.4 "Supported countries" | A matrix: rows onboarding, currency, invoicing, tax rules, payment detection, billing, support, sign-in methods; columns India (validation phase / MVP) and "all other countries: waitlist". | CR-001 asks for the matrix |
| GL12 | FR-001 | "Sign up with an **email code**, or with Google (iteration 2). **Phone code** sign-in is built behind a per-country switch, off until SMS is set up." AC1: "Given a new invited person in a supported country, when they sign up with their email and the correct code, then a workspace is created with them as owner and profile setup opens." AC2 unchanged. New AC3: "Given phone sign-in is off for a country, when the sign-in screen opens, then no phone option is shown." | Section C |
| GL13 | FR-002 and the M1 block "Always a second method" | "Every creator sets up an **authenticator app** during profile setup and is shown 10 backup codes once; where phone codes are switched on, a verified phone also counts. This step cannot be skipped." AC3: "Given a creator who signed up with an email code or Google, when profile setup finishes, then an authenticator app (or a verified phone where switched on) is on the account and backup codes were shown once." AC4: "Given a new-device sign-in with an email code or Google, when the second factor is asked, then the choices are the authenticator code, a backup code or (where switched on) a phone code, never an email code or Google for the same address." New AC5: "Given a backup code already used, when entered again, then it is refused." AC1, AC2 unchanged. | Section C |
| GL14 | New FR-005 **Country of the workspace** · Must · Validation phase and MVP · UC-001, D1, NFR-022 · Free | ACs in the block after this table. | Section B |
| GL15 | New FR-006 **Invite-only access in the validation phase** · Must · Validation phase · D41 · Free | ACs in the block after this table. | Section D |
| GL16 | FR-003 | "The profile fields come from the workspace country's rule set. **For India:** legal name, PAN, state, bank account (IFSC), GSTIN if registered…" New AC5: "Given a workspace whose country is not India, when profile setup or settings open, then no PAN, GSTIN, Indian state or GST threshold is shown or applied." AC1–AC4 unchanged for India. | Section B, rule 3 |
| GL17 | FR-123, line 782; M9; Q10 | "Mon–Sat 10:00–18:00 **in the workspace's time zone (IST for India)**." Same for quiet hours (FR-202). | Section B, rule 4 |
| GL18 | Section 9: I-02, I-06, I-07, I-09 | I-06: "Optional. Off until switched on per country; India needs DLT registration, other countries their own. Fallback: email code and authenticator." I-02: "Google sign-in, basic profile only." I-07: "Our email sender now also carries sign-in codes, so deliverability (SPF, DKIM, DMARC) is a Must." I-09: "Not used in the validation phase." | Section C and D |
| GL19 | Section 8 intro | Add: "In the validation phase the exceptions listed in section 4.5 apply, each flagged in the AC-traceability file. Every other NFR holds." | Deferred, not dropped |
| GL20 | New section 4.5 "Validation phase" | Section D of this draft: who, limits, what must still hold, the exceptions table, the exit trigger. | Section D |
| GL21 | Section 10.1, "Hosting, storage, SMS…" row | "SMS: zero while phone codes are off. Email codes: close to zero." Add a line: "Validation-phase fixed cost: monthly cap set by the owner (GQ7), reported in FR-295 style." | Cost visibility |
| GL22 | Section 11, risks | New R18: "Creators drop out at authenticator setup" (M, M; measure in the validation phase; fallback: SMS for India). New R19: "Real creator data held on free tiers or personal accounts that do not meet our rules" (L, H; section 4.5 'must still hold'; architect checks each tier's terms). | New risks |
| GL23 | Section 12, assumptions | GL-A1: "Free tiers and developer accounts used in V1 allow production use with personal data, and their data-handling terms meet NFR-035 and DPDP." GL-A2: "At least 8 of 10 validation creators set up an authenticator app without help." GL-A3: "Meta development mode lets invited creators connect Instagram DMs as testers." Update A8: "DLT registration only needed when phone codes are switched on for India." | To verify |
| GL24 | Section 15 | Add GQ1–GQ10 (section G below) as Q26–Q35. | Decision record |

**ACs for the two new requirements**

FR-005 Country of the workspace · Must · Validation phase and MVP
- AC1: Given a person signing up, when they choose India, then the workspace is created with country
  India, currency INR, time zone Asia/Kolkata and the current Indian rule set.
- AC2: Given a person who chooses "My country is not listed", when they continue, then no workspace
  is created and they can join the waitlist with only their email and country.
- AC3: Given a workspace whose country has no rule set (test-only), when any tax, invoice or
  currency rule is looked up, then it fails with an error and nothing is calculated, shown or sent;
  it never falls back to India.
- AC4: Given a workspace that has issued an invoice, when the owner tries to change the country,
  then it is refused with "Contact support to change your country."
- AC5: Given a waitlist entry, when the person uses the remove link in any waitlist email, then the
  entry is deleted within 7 days.

FR-006 Invite-only access in the validation phase · Must · Validation phase
- AC1: Given the validation phase is on and an email address is not invited, when a sign-in code is
  requested, then no email is sent and the page says "BackstageHQ is invite-only for now", with the
  waitlist.
- AC2: Given an invited address, when the person signs up, then FR-001 AC1 applies.
- AC3: Given the owner adds or removes an invited address, when done, then it takes effect within 5
  minutes without a code change, and the change is in the staff log.
- AC4: Given the validation phase is switched off, when anyone in a supported country signs up, then
  no invite check is made.

### F. Impact on iteration 1 tickets (product side only)

| Ticket | What changes in behaviour | Acceptance criteria |
|---|---|---|
| T-10 (now "Email-code sign-up and sign-in") | The sign-in screen asks for email, not phone. It adds a country choice (India, or "My country is not listed" leading to the waitlist) and the invite-only check. The code, lock-out, send limits and sessions stay as written. The SMS part shrinks to the `SmsClient` interface and the fake client for tests; the MSG91 client waits until the phone switch is turned on, so DLT is off the critical path. "Only Indian mobile numbers…" is removed. Lock-out time is shown in the workspace's time zone, not "IST". The "email already used by another account" rule moves here (email is now the sign-in identity). | FR-001 AC1 reworded (GL12); AC2 unchanged; add FR-005 AC1–AC2, FR-006 AC1–AC2, FR-001 AC3 (no phone option when off); the "4 code requests" limit applies per email; the production check now refuses the fake email and relay backends, not only SMS. |
| T-11 (now "Authenticator app as the second method, and the new-device check") | The second method is an authenticator app with 10 backup codes, not a verified email. Setup shows a QR code plus "Open in authenticator app" and "Copy setup key" for phone-only creators. The new-device check offers the authenticator code or a backup code, never an email code. Wrong authenticator codes count toward the same 5-try lock. A code cannot be used twice. | FR-002 AC1, AC2 unchanged; AC3, AC4 reworded and AC5 added (GL13); the "email already used" AC moves to T-10; add "backup codes are stored only as hashes and shown once". |
| T-13 | Rules are looked up by the workspace's country through one entry point, never a hard-coded India import. The Indian rule set also states currency, time zone and the required identifiers. A test-only fake country proves nothing Indian leaks. The workspace needs country, currency and time-zone fields (this touches T-04; the architect to confirm where). | Add FR-005 AC3 and FR-003 AC5 (GL16). FR-003 AC2, AC3 and AC4 unchanged for India. |
| T-14 | S-02 shows the Indian fields only for an Indian workspace (all of them at MVP). The "Add a second way to sign in" card becomes "Set up an authenticator app" with the backup codes step; its text no longer says "We will email you a code". S-21 shows "GST threshold used" only for India. The end-to-end test signs in with an emailed code and generates the authenticator code from the test secret. | FR-002 AC3 reworded; "Save and continue only works once the authenticator is confirmed"; axe checks also cover the authenticator and backup-code steps. |

Plan-level effects (`docs/iterations/01-walking-skeleton/plan.md`): demo steps 1–2, 7, 12 and 13
change from phone and email codes to email code and authenticator; risk R1 (DLT) leaves the
critical path; risk R2 (email sandbox) becomes the allow-list mechanism on staging; the owner action
"MSG91 and DLT registration: start now" becomes "not needed until phone codes are switched on". The
S-01 and S-02 mockups are approved documents and need a small amendment (email field, country
choice, waitlist state, authenticator card) before T-10 and T-14 are built. The hardening iteration
(14) must be split: a "validation hardening" slice (restore drill, scoped external review, privacy
page, breach readiness) moves before the first real creator.

**Correction to the baseline note above.** The "Existing baseline" list says M14 includes AI and
hosting. The PRD already counts variable cost only (edit P2, PRD section 3 and NFR-018). Nothing
here changes M14.

### G. Owner decisions (all recommendations accepted 2026-11-11; GQ5 uses the numbers shown; GQ7 figures still to be set)

| # | Decision | Recommendation |
|---|---|---|
| GQ1 | First supported country for the validation phase and the MVP beta? | **India only.** Choose the second country after the beta, from waitlist demand. |
| GQ2 | What does a creator from another country see? | **A waitlist** (email and country only). Not a limited mode and not generic invoices. |
| GQ3 | Sign-in methods? | **Email code first** (Google added in iteration 2), **authenticator app second** with backup codes, **SMS built behind a switch, off**. Alternative: keep SMS as the Indian second factor now, which needs DLT registration and per-message cost. |
| GQ4 | Who is in the validation phase? | **You, then up to 10 invited Indian creators**, allow-listed, free of charge. |
| GQ5 | Exit trigger to the paid full setup? | **6 of 10 creators active every week for 4 weeks, and 5 who would pay or pre-pay, plus your decision to fund it.** You set the numbers. |
| GQ6 | Free, or ask validation creators to pre-pay for the beta at the end? | **Free during the phase, with a pre-pay ask at the end** (manual invoice). That is a real willingness-to-pay signal without a payment gateway. |
| GQ7 | Monthly spending cap for the validation phase, and budget for the scoped external security review and the CA review that must happen before the first real creator and the first real invoice? | **Set a cap; I have not assumed a figure.** I recommend keeping both reviews before real creators, as the approved PRD requires. |
| GQ8 | Whose name are the accounts in once real creator data exists (personal developer accounts or a company)? This also decides who is the "data fiduciary" under India's DPDP Act. | **Personal accounts for V0 only; accounts holding real creator data in the business's name or transferable to it.** Whether a company exists yet is your call. |
| GQ9 | Gmail in the validation phase: testing mode (free, weekly reconnect, "unverified app" warning) or forwarding only? | **Testing mode plus forwarding.** It tests the import moment (D3) without paying for the Google security assessment. |
| GQ10 | Approve the mockup amendment for S-01 and S-02 and the ticket changes in section F before T-10 starts? | **Yes.** T-01 to T-03, T-05 to T-09 and T-12 are not affected and can start now; T-04 only gains the workspace country, currency and time-zone fields (architect to confirm). |
