# Provider comparison for the validation phase and the full setup (November 2026)

| | |
|---|---|
| Status | **Proposed.** For owner approval with the CR-001 architecture changes (C1–C13, architecture section 27). |
| Date | Prices checked on **2026-11-11**. Every price is in US$ per month unless marked, list price, before tax. |
| Asked for by | `docs/change-requests/001-global-market-and-infrastructure-value.md`, section "Comparison required before replacing vendor decisions", and the adoption draft sections C and D (decisions GQ1–GQ10, adopted 2026-11-11). |
| Approved inputs | PRD section 4.5 (validation phase), section 10.1 (usage and AI cost assumptions), NFR-004, NFR-007, NFR-012, NFR-035, NFR-042, NFR-043; architecture sections 12, 13, 19, 22–24. |
| Tax | **Add 18% GST** to every bill below. Foreign cloud and SaaS providers charge it to Indian buyers (OIDAR rules); AWS India bills it through its Indian entity. |
| Exchange rate | ₹88 per US$, as in the architecture and PRD. |
| Source quality | "Official" means the provider's own page or docs; "secondary" means a third-party summary that should be re-checked at sign-up. Section 10 lists every source. |

---

## 1. Answer in one table

| Stage | Who and what | Recommended setup | Fixed cost / month (before GST) | AI / month (shown separately) |
|---|---|---|---|---|
| **V0** | Owner only, staging, dummy data, personal accounts | **DigitalOcean Bangalore** (App Platform web + worker, Managed PostgreSQL with 7-day point-in-time restore), **AWS Mumbai** for KMS and SES only, Cloudflare DNS, free monitoring tiers | **≈ $27 (₹2,400)**; about **$1–2** for the first ~2 months while sign-up credits last | $0 in iteration 1; $1–5 of owner testing once AI exists (iteration 8) |
| **V1** | Up to 10 invited creators, real data, separate production; staging keeps dummy data | Same providers, **second DigitalOcean project and second AWS account** for production, plus hourly encrypted backups to S3 in AWS (a second provider) and S3 + GuardDuty for files when uploads arrive | **≈ $65–85 (₹5,700–7,500)** for production and staging together | **$28–38** (direct Claude API) |
| **Full, 100 creators** | After the validation exit (GQ5) and the owner's decision to fund | **Stay on DigitalOcean and scale**: standby database node (high availability), 2 web containers, a larger worker, Cloudflare Pro in front, paid uptime and error tiers | **≈ $205–255 (₹18,000–22,500)** | **$170–230** (direct API; 60 paid, 40 free) |
| **Full, 1,000 creators** | Same, larger | Same, scaled up (larger database, 3 web, 2 workers) | **≈ $380–590 (₹33,000–52,000)** | **$1,700–2,300** (direct API) |

**AI provider per stage:** direct Claude API (Anthropic) for V0. For V1 and the full setup, the direct
API **only if** zero-data retention (or written terms that meet NFR-035) is in place for our account;
otherwise Claude on Amazon Bedrock behind the same gateway (about twice the AI bill, section 4.9). The
binding choice is made by the iteration-8 evaluation on labelled tasks (CR-001: cost per successful
task, not headline prices).

**Why this and not the approved AWS design.** The approved AWS design (ADR-002) costs about $60–85 a
month for staging alone and $195–285 for the lean beta, mostly fixed charges (load balancer, WAF,
public IP addresses, NAT avoidance, Secrets Manager) that buy little for 1–10 people. DigitalOcean's
Bangalore region gives a managed PostgreSQL with point-in-time restore included, always-on containers
from $5, migration jobs before each deploy, and data in India, for a third of the price. AWS stays
for the three things it is best and cheapest at for us: KMS keys, SES email and (later) S3 with
GuardDuty malware scanning. Nothing in the code depends on DigitalOcean (section 7).

**Recurring bills you are signing up to** (each one is marked "Yes" in section 8): DigitalOcean
($25 in V0), AWS KMS ($1 per key), the domain (~$10–12 a year), and from V1 the production
DigitalOcean project and per-use AI. Everything else in V0 is a free tier.

---

## 2. The quality bar every candidate must meet

CR-001 says savings never weaken these. A candidate that fails one is out, however cheap.

| Requirement | What it rules out |
|---|---|
| Tenant isolation with forced row-level security and non-superuser app roles (NFR-001, NFR-023, ADR-004) | Databases where we cannot create our own login roles. It also showed that **no managed PostgreSQL gives superuser**, so the design must not need a role with `BYPASSRLS` (change C9). |
| Encryption of PAN, GSTIN, bank and tokens under keys held in a key service (NFR-004, NFR-025, ADR-005) | A master key kept as an environment variable next to the database password, for real data. |
| At most 1 hour of money data lost, back within 8 hours, restore tested before the first real creator (NFR-043) | Databases with daily backups only and no point-in-time restore; free tiers with no backups (for V1). |
| Reminders and scheduled jobs on time (NFR-008, NFR-012); first tap usable in 3 s (NFR-007) | **Hosts that sleep when idle**, for the worker or the web app (PRD 4.5). |
| AI providers that do not train on our data and keep it no longer than needed (NFR-035) | Free AI tiers whose terms allow training; providers whose retention cannot be shortened (for real data). |
| No secrets or personal data in logs (NFR-025); a privacy page listing every provider and region (NFR-006) | Nothing by itself, but every provider below goes on the privacy page. |
| Accounts holding real data in the business's name or transferable to it (GQ8) | Personal-only services that cannot be transferred, for V1. |

---

## 3. Workload and assumptions

Reused from the approved PRD section 10.1 (a typical paid creator per month): about 600 emails and 300
DMs, about 60 of them business; about 30 AI drafts; about 50 assistant requests. New assumptions are
labelled **CA-n** ("comparison assumption") and need measuring.

| # | Assumption | Used for |
|---|---|---|
| CA-1 | Tokens per task: sorting or scam check 1,200 in / 80 out; extraction 4,000 / 500; draft 6,000 / 600; assistant request 3 model calls of 6,000 / 300; tax, matching and digest 20 calls of 2,000 / 200 a month. Range low end assumes prompt caching on long system prompts; high end assumes none. | AI cost, section 4.9 |
| CA-2 | Full-setup mix: 60% paid, 40% free creators. Free creators use only scam flags, capped at 500 messages (FR-294). | Stage totals |
| CA-3 | Our own emails: about 60 per creator a month (codes, digest, alerts). | Email cost |
| CA-4 | Stored files: about 50 MB per creator a month; database about 50–100 MB per creator a year including the search index (architecture 16A.7). | Storage cost |
| CA-5 | **Heavy creator:** 3 times the messages (2,700), 150 extractions, 100 drafts, 150 assistant requests (at the allowance cap). | Heavy case, section 5.5 |
| CA-6 | V1 creators use the full feature set (the phase is free), so each is costed as a paid creator. | V1 AI cost |

---

## 4. Component by component

### 4.1 Hosting: web app and always-on worker

Same need for every candidate: one container image, a web service that never sleeps, a worker that
never sleeps, a one-off "migrate before switching" step, health checks, HTTPS, and a region near India.

| Candidate | Smallest qualifying shape | Price (checked 2026-11-11) | Region | For | Against |
|---|---|---|---|---|---|
| **AWS ECS Fargate + ALB (approved ADR-002)** | 1 web + 1 worker task, ALB, WAF, public IPs | Staging about **$60–85**; lean production about **$150–220** (architecture §24.1; Fargate and ALB Mumbai rates not re-confirmed today) | Mumbai | IAM roles (no stored keys), WAF, everything in one cloud | Fixed charges dominate at our size; more setup |
| AWS Lightsail containers | 2 × Nano (0.25 vCPU, 512 MB) | $7 each (secondary) | Mumbai | Same AWS account as KMS and SES | No "run a one-off migration job" step; containers cannot use IAM roles either; unclear private access to Lightsail databases |
| **Render** | Starter web + Starter background worker (512 MB) | $7 + $7 (secondary, several sources agree) | Singapore (no India region) | Very simple; pre-deploy command; Terraform provider | No India region; the free web tier sleeps (ruled out) |
| **Google Cloud Run** | Web with 1 minimum instance (request-based billing, idle rate) + a worker pool with 1 always-on instance | Instance-based $0.000018 per vCPU-second and $0.000002 per GiB-second, free tier 240,000 vCPU-s and 450,000 GiB-s a month (official); idle minimum instance about $0.0000025 per vCPU-second (secondary). Worker pools GA in 2026, reported ~40% cheaper (secondary). A 1-vCPU always-on worker is about **$15–28**; web about $7–10 | Mumbai (price tier of asia-south1 not confirmed) | Workload identity (no stored keys), native KMS and Pub/Sub for Gmail, $300 credit for 90 days | Always-on worker is the most expensive here; custom domain and edge rules need extra pieces |
| **DigitalOcean App Platform** | Web service + worker, 512 MiB shared CPU each | **$5 each** (official pricing table) | **Bangalore (BLR1)** (App Platform in BLR to confirm in spike Q-H1) | Cheapest always-on pair; pre-deploy jobs; worker components; rollback; data stays in India | No IAM roles: AWS credentials are stored as encrypted app secrets (mitigated, section 4.5) |

Ruled out: any free tier that sleeps (Render free, Koyeb free); self-managed VMs (Oracle Always Free,
Hetzner) because we would patch servers and build our own backups; Railway (no managed point-in-time
restore).

### 4.2 Database, backups and restore

| Candidate | Smallest qualifying size | Price | Point-in-time restore | Roles and RLS | Verdict |
|---|---|---|---|---|---|
| Amazon RDS PostgreSQL (approved) | db.t4g.micro single-AZ | $0.021/hour ≈ **$15** + storage (secondary) | Yes, up to 35 days | Master user is not superuser | Qualifies; staging-only price is fine, the rest of AWS is not |
| Lightsail managed PostgreSQL | 1 GB | $15 (secondary) | Yes, 7 days in 5-minute steps (official) | As RDS | Qualifies, but tied to Lightsail containers |
| **DigitalOcean Managed PostgreSQL** | 1 GiB, 1 vCPU, single node | **$15** (secondary; confirm at sign-up) | **Yes, 7 days, included** (official limits page) | Admin user `doadmin` is not superuser but has `BYPASSRLS` and `CREATEROLE` (community source); our roles need neither (C9) | **Chosen** |
| Render PostgreSQL | Basic-256mb (256 MB) / Basic-1gb | $6 (official) / $19 | Yes on paid plans: 3 days on the free Hobby workspace, 7 on Professional (official) | No superuser; `BYPASSRLS` roles cannot be created (Render staff) | Qualifies after change C9; Singapore |
| Cloud SQL for PostgreSQL | db-f1-micro (shared core) | about $9 in Mumbai (secondary) + storage | Yes | `cloudsqlsuperuser` is not superuser | Qualifies; pairs with Cloud Run |
| Supabase | Free / Pro $25 | Free has no backups; Pro has daily backups, point-in-time restore is a paid add-on | Free: no | Managed roles | Free is fine for dummy data only; Pro without the add-on fails NFR-043 |
| Neon | Free / Launch | Free: 100 compute-hours a month, which an always-on worker exceeds | Short window on free | `neon_superuser` has `BYPASSRLS` | No India region; worker keeps compute awake |

**Backups beyond the provider (V1 onward).** Provider point-in-time restore protects against bad
deploys, mistakes and a failed server, but not against losing the provider account or the region. So
from V1 a worker job writes an **hourly encrypted logical backup** of the database to S3 in AWS Mumbai
(a different company), kept 14 days. Cost: cents. It also is the migration path to any other
PostgreSQL (section 7) and the input to the restore drill. It uses a read-only role `bhq_backup` with
its own read policies and `pg_dump --enable-row-security`, because forced row-level security stops a
normal dump (change C10).

### 4.3 Durable worker and scheduler

The design does not change: Procrastinate keeps the job queue in PostgreSQL, jobs are queued in the
same transaction as the change, periodic ticks run inside the worker, and schedules come from data
(ADR-006). The only requirement on a host is "one container that never sleeps".

| Option | Cost | Verdict |
|---|---|---|
| **Worker component on the same platform as the web app** | $5 (DigitalOcean) / $7 (Render) / ~$15–28 (Cloud Run worker pool) / ~$10 (Fargate 0.25 vCPU) | **Chosen** (DigitalOcean) |
| Platform cron (Render cron jobs, Cloud Scheduler, App Platform scheduled jobs) instead of periodic ticks | Cheap | Not needed: periodic ticks already live in the worker, and two schedulers would disagree |
| Celery with Redis or SQS | Extra service | Rejected in ADR-006; still rejected |

The heartbeat (each tick pings an outside check) stays and is free (Healthchecks.io, 20 checks).

### 4.4 File storage and malware scanning (needed from iteration 8)

Files are encrypted by our app before storage (ADR-005), so the store only ever sees ciphertext,
except the short-lived quarantine copy before the scan.

| Option | Price | Malware scan | Verdict |
|---|---|---|---|
| **S3 in AWS Mumbai + GuardDuty Malware Protection for S3** | Storage $0.025/GB-month (approx.); scanning $0.09 per GB after the February 2025 cut (us-east-1, official) plus a per-object charge; **free tier 1 GB and 1,000 objects a month** (official) | Managed (to confirm in Mumbai, Q-V5) | **Chosen**: same as the approved design, pennies at V1 |
| DigitalOcean Spaces | $5 flat for 250 GiB (official) | None; we would run ClamAV (about 1.5 GB of memory, ~$12–25 a month) | Fallback if GuardDuty is not available in Mumbai |
| Cloudflare R2 | 10 GB free, then $0.015/GB, no egress fee (official) | None | Fallback for storage only |

### 4.5 Keys and encryption

| Option | Price | For | Against | Verdict |
|---|---|---|---|---|
| **AWS KMS (Mumbai)** | $1 per key a month, 20,000 requests a month free, then $0.03 per 10,000 (official) | Already the `AwsKms` adapter in T-07; same AWS account as SES and S3; audit trail in CloudTrail | From DigitalOcean we must store an AWS access key (no IAM role) | **Chosen** |
| Google Cloud KMS | $0.06 per key version a month, $0.03 per 10,000 operations (official) | Cheapest key service | Another adapter; same stored-credential issue from DigitalOcean | Alternative |
| Master key in an environment variable (`LocalKms`) | $0 | Free | The key sits next to the database password; no audit trail; manual rotation | **Local and CI only** (already refused in staging and production by T-07's check) |
| Vault, Infisical and similar | Free to tens of dollars | Rich features | Another service to run or pay for | Not needed |

**The stored credential, and how it is limited.** Each component gets its own AWS user: the web
app may only use the `data` key; the worker may also use the `tokens` key and send email; both
need the encryption context that names a workspace (or the platform scope, change C7). Keys are
rotated every 90 days, CloudTrail sends an alert on use from an unexpected source, and the external
security review covers it. Moving to a host with workload identity (AWS, Google Cloud) removes the
stored key and is one of the migration triggers (section 7).

### 4.6 Email sending (sign-in codes, digests, alerts)

| Option | Price | For | Against | Verdict |
|---|---|---|---|---|
| **Amazon SES (Mumbai)** | $0.10 per 1,000 (secondary); the old SES free tier no longer applies to new accounts (secondary); new-account credits apply | Cheapest at every stage; its **sandbox only delivers to verified addresses**, which is exactly the staging allow-list CR-001 asks for; receiving for the forwarding address may also work (Q-V3) | Production access needs a request to AWS before V1 | **Chosen** |
| Resend | Free 3,000 a month, 100 a day (official daily cap); Pro about $20 for 50,000 (secondary) | Simple | 100 a day is tight once digests start; costs more at scale | Fallback |
| Postmark | Paid plans from about $15 (not re-checked) | Best-known deliverability; inbound included | Costs more | Fallback if SES production access is refused |

At 1,000 creators (CA-3) SES is about $6 a month. Switching is a settings change through
django-anymail (section 7).

### 4.7 SMS (built behind a switch, off)

| Option | Price | Verdict |
|---|---|---|
| MSG91 (India) | About ₹0.15–0.25 per OTP (secondary), plus small one-time DLT fees and 1–3 weeks of registration | **Off.** Only the `SmsClient` interface and a fake client are built now. Switched on per country if GL-A2 fails (creators drop out at authenticator setup) or the owner wants phone sign-in. At 1,000 creators and ~10 SMS each: about ₹2,000 a month |
| Twilio Verify, AWS SNS | Higher per message; India still needs DLT | Not chosen |

### 4.8 Monitoring, logs and CI

| Need | V0 and V1 | Full setup | Price |
|---|---|---|---|
| Errors | Sentry Developer (1 user, 5,000 errors a month; secondary) | Sentry Team when a second person joins | $0 → about $26–29 |
| Uptime (outside our host) | Better Stack free: 10 monitors, 3-minute checks (official) | Paid tier for 1-minute checks and on-call | $0 → about $20–30 |
| Scheduler heartbeat | Healthchecks.io free, 20 checks (secondary) | Same | $0 |
| Technical logs | App Platform's own logs (V0); from V1 forwarded to a log service with at least the 30-day retention of architecture 18.1 (Better Stack Logs is a built-in destination; free retention to confirm) | Same, paid tier if needed | $0–25 |
| Metrics and alarms | App Platform CPU and memory alerts (free) plus our own monitor jobs that alert on job lag and invariant hits | Same | $0 |
| CI | GitHub Free: 2,000 Actions minutes a month for private repositories (secondary) | GitHub Team if minutes run out | $0; overage risk if CI runs exceed ~2,000 minutes (risk R12 in the iteration plan) |
| Container registry | DigitalOcean Container Registry Starter (free, 500 MiB, one repository) | Basic at $5 if images outgrow it | $0 → $5 |
| Edge (TLS, rate rule, firewall) | Cloudflare free: DNS, one rate-limiting rule, a free subset of managed rules (official). The edge rule itself is a deferred item in the validation phase (PRD 4.5) | Cloudflare Pro for the full managed rule set | $0 → about $20–25 |

### 4.9 AI: Bedrock in India versus the direct Claude API

**Prices (per million tokens, input / output).** Direct API: Haiku 5.5 $0.10 / $0.50, Sonnet 5.5
$2 / $10, Opus 5.5 $4 / $20; batch requests 50% off (secondary, 2026-10-29, matching the figures in
`CLAUDE.md`). Bedrock India in-country profile offers Haiku 4.5, Sonnet 5 and Opus 5 (AWS, 2026-09-30);
their direct-API list prices are Haiku 4.5 $1 / $5 and Sonnet 5 $3 / $15 (secondary); regional and
geographic endpoints carry about a **10% premium** over global ones (Anthropic and AWS docs, shown for
earlier models; **assumed** here for India, to confirm).

**Cost per creator a month** (CA-1, before GST; low end with prompt caching):

| Work | Direct API (Haiku 5.5 + Sonnet 5.5) | Bedrock India (Haiku 4.5 + Sonnet 5, +10%) |
|---|---|---|
| Sorting and scam checks, ~900 messages | $0.10–0.14 (₹9–13) | $1.15–1.58 (₹100–139) |
| Extraction (60) and drafts (30) | $1.05–1.32 | $1.75–2.18 |
| Assistant, 50 requests | $1.55–2.25 | $2.80–3.70 |
| Tax cross-check, matching, digest | $0.12 | $0.20 |
| **Paid creator** | **$2.80–3.80 (₹245–335)** | **$5.90–7.70 (₹520–675)** |
| **Free creator** (500-message scam cap) | **$0.08 (₹7)** | **$0.88 (₹77)** |
| Heavy creator (CA-5) | $8.50–11.00 (₹750–970) | $17.00–22.00 (₹1,500–1,950) |

The direct API figures agree with the approved PRD estimate (₹220–330 per paid creator). Bedrock
India costs about **twice as much per paid creator and ten times per free creator**, because the
newest small model (Haiku 5.5) is not offered there.

| | Direct Claude API | Claude on Bedrock (India in-country) |
|---|---|---|
| Training on our data | No (Anthropic commercial terms) | No; not shared with the model maker (AWS) |
| Retention | Standard API retention is **30 days** (secondary); **zero-data retention by approval** (official docs) | Prompts are not stored unless we turn on invocation logging (AWS docs) |
| Processing location | Anthropic's global infrastructure (outside India) | Mumbai and Hyderabad |
| Newest models | First | Later, if at all |
| Account | API key with prepaid credits and a hard spend limit; no AWS needed | Needs model access in an AWS account |
| Effect on M14 at ₹999 | AI alone 25–34% of price | AI alone 52–68% of price |

**Recommendation.** Use the direct API from the first AI iteration, with one condition for real data:
the owner applies for **zero-data retention** now (approval takes time), because 30-day retention may
not meet NFR-035's "no longer than needed to answer". If it is refused and the owner does not accept
30 days in writing, V1 uses Bedrock (global or India) through the same gateway, and the extra cost is
visible in FR-295. The iteration-8 evaluation compares both on the labelled sets by accuracy, latency
and cost per successful task, as CR-001 requires, before anything ships to a creator.

---

## 5. Cost by stage

All figures are list prices before 18% GST. "Est." means a range built from the prices above.

### 5.1 V0: owner only, staging, dummy data

| Item | Provider | $/month | Recurring bill? |
|---|---|---|---|
| Web container (512 MiB) | DigitalOcean App Platform, BLR1 | 5.00 | Yes |
| Worker container (512 MiB) | DigitalOcean App Platform, BLR1 | 5.00 | Yes |
| PostgreSQL 17, 1 GiB, 7-day point-in-time restore | DigitalOcean Managed PostgreSQL, BLR1 | 15.00 | Yes |
| Key `data` (staging) | AWS KMS, Mumbai | 1.00 | Yes |
| Sign-in code emails (sandbox = allow-list) | Amazon SES, Mumbai | < 0.05 | Usage |
| Terraform state | S3, Mumbai | < 0.05 | Usage |
| Container registry | DigitalOcean Starter | 0 | No |
| DNS | Cloudflare free | 0 | No |
| Domain | Any registrar (Cloudflare Registrar sells at cost) | ~1.00 (≈ $10–12 a year) | Yes, yearly |
| Errors, uptime, heartbeat, CI | Sentry, Better Stack, Healthchecks.io, GitHub (free tiers) | 0 | No |
| **Total** | | **≈ $27 (₹2,400; ₹2,800 with GST)** | |

**Credits, not steady state:** DigitalOcean advertises a $200 credit for 60 days on App Platform
sign-up (official promotional page; terms vary); AWS gives new accounts $100 plus up to $100 more on
its 6-month free plan (official). With both, V0 costs about $1–2 a month (the domain) for roughly
the first two months. **Note:** the AWS free plan closes the account after 6 months unless it is
upgraded to a paid plan, so upgrade it early; credits still apply after upgrading.

**Cheaper options I rejected for V0:** Render ($21.50: Starter web and worker, $6 database, $1 key) is
$5.50 cheaper but has no India region and would make staging differ from production; Supabase free as
the staging database (V0 ≈ $12) saves $15 but loses parity with production in roles, connection limits
and the restore rehearsal; one combined web-and-worker container saves $5 but hides problems that the
two-service production setup will show.

### 5.2 V1: up to 10 invited creators, real data

| Item | $/month | Recurring bill? |
|---|---|---|
| V0 staging, unchanged | 27 | Yes |
| Production web (1 GiB) and worker (1 GiB), DigitalOcean BLR1 | 20–24 (1 GiB plan price to confirm) | Yes |
| Production PostgreSQL 1 GiB, 7-day point-in-time restore | 15 | Yes |
| Hourly encrypted backups to S3 (14 days), production keys `data` and `tokens`, SES production, S3 files + GuardDuty within free tier | 3–4 | Yes (keys); rest usage |
| Logs with ≥ 30-day retention | 0–25 | Possibly |
| **Fixed total, staging + production** | **≈ $65–85 (₹5,700–7,500)** | |
| AI, 10 creators on the full feature set (CA-6), direct API | 28–38 | Usage |
| AI, same, if Bedrock is needed | 59–77 | Usage |
| One-time, outside these figures (GQ7 budget) | Scoped external security review (NFR-029), CA review before any real invoice (Q20) | One-time |

No payment gateway fee (no billing in the validation phase) and no SMS (switch off).

### 5.3 Full setup, 100 creators (60 paid, 40 free)

| | DigitalOcean scaled (recommended) | AWS as approved (ADR-002 v1 posture) | Cloud Run + Cloud SQL (Mumbai) | Render (Singapore) |
|---|---|---|---|---|
| Web and worker | 2 × 1 GiB web + 1 × 2 GiB worker: $45–50 | $45–60 | $25–40 | $50–75 |
| Database with high availability | 2 GiB + standby node: ~$60 (est.) | $130–160 | ~$100–130 (est.) | ~$100–200 (est.) |
| Edge and firewall | Cloudflare Pro $20–25 | ALB + WAF $30–40 | Cloudflare Pro $20–25 | Cloudflare Pro $20–25 |
| Keys, email, files, backups | AWS ~$7 | ~$35–55 incl. Secrets Manager, CloudWatch, S3, GuardDuty | ~$5–10 | AWS ~$7 |
| Monitoring and logs | $45–85 | $40–80 | $45–85 | $45–85 |
| Staging | $27 | $45–65 | $40–50 | $21 |
| **Fixed total** | **≈ $205–255** | **≈ $370–525** | **≈ $240–340** | **≈ $250–410** |
| Fixed cost per paying creator (60) | $3.40–4.25 (₹300–375) | $6.15–8.75 | $4.00–5.65 | $4.15–6.85 |

| Usage costs at 100 creators | $/month |
|---|---|
| AI, direct API (60 × $2.80–3.80 + 40 × $0.08) | $170–230 |
| AI, Bedrock India (60 × $5.90–7.70 + 40 × $0.88) | $390–500 |
| Payment gateway fees, Razorpay ~2% of ₹499–999 plus GST on the fee (shown separately, as CR-001 asks) | $8–16 (₹720–1,440) |
| SMS if switched on for India | $2–4 |

**Fully allocated cost per paying creator** (fixed ÷ 60 + own AI + share of free creators' AI +
gateway fee): about **$6.40–8.40 (₹565–740)** on DigitalOcean with the direct API. M14 counts only
variable cost (PRD NFR-018, P2): **₹265–375 per paid creator, 27–38% of a ₹999 price and 53–75% of
₹499.** This comparison does not change M14; it shows the price and the assistant allowance still
decide whether M14 passes.

### 5.4 Full setup, 1,000 creators (600 paid, 400 free)

| | DigitalOcean scaled (recommended) | AWS as approved | Cloud Run + Cloud SQL |
|---|---|---|---|
| Web and workers | 3 × 2 GiB web + 2 × 2–4 GiB workers: $125–175 | $90–130 | $80–120 |
| Database (4 GiB, 2 vCPU, standby, ~100 GB) | $120–160 | $200–260 | $180–240 |
| Edge, keys, email, files (~600 GB a year), backups | $50–75 | $80–120 | $45–70 |
| Monitoring and logs, staging | $85–180 | $90–150 | $90–180 |
| **Fixed total** | **≈ $380–590** | **≈ $460–660** | **≈ $395–610** |
| Fixed cost per paying creator (600) | $0.63–0.98 (₹55–86) | $0.77–1.10 | $0.66–1.02 |
| AI, direct API | $1,700–2,300 | same | same |
| AI, Bedrock India | $3,900–5,000 | same | same |
| Gateway fees | $80–160 | same | same |

At 1,000 creators the host choice moves the bill by about $100 a month; the AI provider choice moves it
by about **$2,200–2,700 a month**. Hosting is no longer the decision that matters; AI is.

### 5.5 Heavy-usage creator

A heavy creator (CA-5) costs $8.50–11.00 a month in AI on the direct API, $17–22 on Bedrock India,
plus about $0.10 of storage and email. The assistant allowance (FR-234) is what keeps this bounded.

---

## 6. Free tiers and credits versus steady state

| Item | Credit or free tier | Lasts | Steady-state cost after |
|---|---|---|---|
| DigitalOcean | $200 promotional credit (App Platform page) | 60 days | $25 a month (V0) |
| AWS | $100 + up to $100 more | 6 months, or until spent; account closes unless upgraded | ~$1–2 (V0), ~$5 (V1) |
| Google Cloud (only for the Gmail project) | $300 trial | 90 days | ~$0 (Gmail API and Pub/Sub within free quotas) |
| AWS KMS requests | 20,000 a month | Always | $0.03 per 10,000 beyond |
| GuardDuty S3 scanning | 1 GB and 1,000 objects a month | Always | Per GB and per object |
| Sentry, Better Stack, Healthchecks.io, GitHub, Cloudflare, DOCR Starter | Free plans | While the plans exist | Paid tiers listed in 4.8, only at the full setup |
| Anthropic API | None (prepaid credits, minimum purchase) | — | Per use |

A free tier is not evidence that a service is fit for real data (CR-001). Every free tier above holds
either no creator data (monitoring receives none by design, ADR-018) or only dummy data (V0). The
services that hold real data in V1 (DigitalOcean, AWS, Anthropic) are paid plans with data-processing
terms, to be checked against GL-A1 before the first creator.

---

## 7. Recommendation per stage, migration trigger, and the switch that makes it cheap

| Stage | Recommendation | Moves to the next stage when | What is switched, without a rewrite |
|---|---|---|---|
| **V0** | DigitalOcean BLR1 (web, worker, PostgreSQL), AWS Mumbai (KMS `data`, SES sandbox), Cloudflare DNS, free monitoring, personal accounts | The validation-hardening slice (iteration 14a) passes and the owner invites the first creator | Same Terraform modules applied as a second environment (`env=production`) in a separate DigitalOcean project and AWS account; settings switches only |
| **V1** | Same providers, production separate from staging, hourly off-provider backups, direct Claude API if zero retention is granted (else Bedrock) | The validation exit (GQ5: 6 of 10 weekly active for 4 weeks, 5 would pay) **and** the owner funds the full setup; or earlier if more than 10 creators, more than 100 Gmail test users, real SMS or payments are needed | Database plan resize and standby node, more containers, Cloudflare proxy and Pro rules on, `BHQ_INVITE_ONLY` off, billing adapter on. **No data moves** if we stay on DigitalOcean |
| **Full, 100** | DigitalOcean scaled, AWS security services, Cloudflare Pro, paid monitoring | Database CPU above 60% for a week, connection limits reached, or job lag alarms | Vertical resize; split worker queues into separate components (already planned for iteration 9) |
| **Full, 1,000** | Same, larger | **Move to a hyperscaler (the ADR-002 AWS design)** if any of: a binding requirement for India processing with disaster recovery inside India (DigitalOcean has one Indian region); the security review or a customer requires no stored cloud keys; measured uptime below 99.5% for two months because of the platform; DigitalOcean's largest database plan is near; or the saving exceeds the migration cost | Container image unchanged; restore the hourly logical backup into RDS and run the RLS meta-test; KMS, SES and S3 are already on AWS, so only compute and database move (estimate 1–2 weeks) |

**Swappable boundaries (the "provisions for the full-blown implementation").** Each line is either an
adapter in code or a setting; none needs a rewrite.

| Boundary | Today (V0/V1) | Full or fallback | How it switches |
|---|---|---|---|
| Host | DigitalOcean App Platform | AWS ECS (ADR-002), Cloud Run | One container image, settings only from environment variables, health endpoints; platform details only in `infra/` and the deploy workflow |
| Database | DigitalOcean PostgreSQL 17 | RDS, Cloud SQL | Plain PostgreSQL, no provider extensions; our own role bootstrap; no `BYPASSRLS` needed (C9); hourly logical backup is the move path (C10) |
| Jobs | Procrastinate in PostgreSQL | Celery + SQS (only if Procrastinate stalls) | `bhq.jobs` wrapper (ADR-006) |
| Keys | AWS KMS via stored credentials | AWS KMS via IAM role; Google Cloud KMS | `KmsClient` adapter (T-07); `rewrap_workspace_key` re-wraps every data key in one job |
| Secrets | Encrypted environment variables on the platform | AWS Secrets Manager injection | The app reads environment variables only, never a secrets API |
| Files | S3 + GuardDuty (from iteration 8) | Spaces or R2 + ClamAV | `bhq.files.storage` (S3 API with a configurable endpoint) and a `MalwareScanner` adapter; uploads stay off if no scanner is ready (PRD 4.5) |
| Email out | SES via django-anymail | Postmark, Resend | `EMAIL_BACKEND` and `ANYMAIL` settings |
| Email in (forwarding address, iteration 5) | SES receiving if available in Mumbai (Q-V3) | Postmark inbound | One webhook adapter per provider at `/hooks/<provider>` |
| SMS | Off; fake client only | MSG91 for India | `SmsClient` adapter plus `PHONE_SIGNIN_COUNTRIES` setting |
| AI | Direct Claude API | Bedrock (India or global) | Provider adapter inside `bhq.ai`; model per purpose in settings; the eval suite must pass before a switch |
| Monitoring | Sentry free, Better Stack free, Healthchecks.io | Paid tiers, GlitchTip | DSN and URLs in settings; logs to standard output |
| Edge | Cloudflare DNS (proxy optional) | Cloudflare Pro or AWS WAF | Outside the app; client IP header is a setting |
| Validation phase | `BHQ_INVITE_ONLY=true`, deferred flags in `acs.yaml` | Off | Setting plus the AC-traceability exit check |

---

## 8. Everything with a recurring bill

| Bill | Starts | Amount | Who pays |
|---|---|---|---|
| DigitalOcean staging (web, worker, database) | V0 | ~$25 a month | Owner, personal |
| AWS KMS key(s) | V0 | $1 per key a month | Owner, personal (staging); business (production) |
| Domain | V0 | ~$10–12 a year | Owner |
| DigitalOcean production | V1 | ~$35–40 a month | Business (GQ8) |
| AWS production (keys, backups, email, files) | V1 | ~$3–5 a month | Business |
| Anthropic API | First AI iteration | Per use; set a hard monthly limit in the console | Owner (V0), business (V1) |
| Log retention tier | V1, if free retention is under 30 days | $0–25 a month | Business |
| GitHub Actions overage | If CI exceeds 2,000 minutes | ~$0.006–0.008 per minute (secondary) | Owner |
| Full-setup items: standby database, Cloudflare Pro, Sentry Team, paid uptime, Razorpay fees, MSG91 if on | After the validation exit | Section 5.3 | Business |

GQ7 (monthly cap for the validation phase) is the owner's figure. Planning numbers: about ₹2,800 a month
with GST for V0 and about ₹8,000–12,000 a month with GST for V1 including AI.

---

## 9. What still needs checking (and where it is checked)

| # | Question | Why it matters | Where |
|---|---|---|---|
| Q-H1 | DigitalOcean in Bangalore really fits: App Platform available in BLR1; PostgreSQL 17 and `btree_gin`; our role bootstrap runs as `doadmin` without superuser; statement and parameter logging can be kept off (NFR-048); transaction pooling works with our per-transaction workspace setting; point-in-time restore to a new cluster passes the RLS meta-test; `pg_dump --enable-row-security` and restore round trip; client IP header | If any fails, the fallback is Render (Singapore) for V0/V1, whose prices are in this document | Iteration 1, T-17 (before T-15) |
| Q-H2 | Zero-data retention for our Anthropic account; Bedrock India price and whether its models need the data-sharing mode (old Q-V2) | NFR-035 for V1 | Owner applies now; architect confirms before iteration 8 |
| Q-V3 | SES receiving in Mumbai | Forwarding address (FR-011) | Iteration 1, T-17 (desk check and console test) |
| Q-V5 | GuardDuty Malware Protection for S3 in Mumbai | Uploads (NFR-031) | Before iteration 8 |
| — | DigitalOcean 1 GiB / 2 GiB App Platform and database plan prices; Fargate and ALB Mumbai rates | Ranges above | At sign-up; replace ranges with measured bills (FR-295) |
| — | Data-processing terms of DigitalOcean, AWS and Anthropic meet GL-A1 and DPDP | Real data in V1 | Validation-hardening slice (14a) |

---

## 10. Sources (all read on 2026-11-11)

Hosting and database
- Render: [pricing (official)](https://render.com/pricing.md), [PostgreSQL recovery and backups (official)](https://render.com/docs/postgresql-backups), [no superuser on Render Postgres (Render community, staff reply)](https://community.render.com/t/postgres-user-postgres-is-not-available/21988), [cost guide (Render article)](https://render.com/articles/how-much-does-cloud-application-hosting-cost-for-small-businesses), [Render pricing 2026 (secondary)](https://www.activepieces.com/blog/render-pricing-2026-free-tier-workers-total-cost.md)
- Google Cloud Run: [pricing (official)](https://cloud.google.com/run/pricing), [billing settings (official)](https://docs.cloud.google.com/run/docs/configuring/cpu-allocation), [minimum instances (official)](https://docs.cloud.google.com/run/docs/configuring/min-instance), [worker pool cost practices (official)](https://docs.cloud.google.com/run/docs/configuring/workerpools/workerpools-cost-optimization), [worker pools GA (secondary)](https://machineherald-io.pages.dev/article/2026-05/20-google-cloud-run-worker-pools-reach-ga-with-open-source-crema-autoscaler-and-blackwell-gpu-support)
- Cloud SQL: [pricing (official)](https://cloud.google.com/sql/pricing?hl=en), [db-f1-micro by region (secondary)](https://www.bytebase.com/dbcost/cloudsql/instance/db-f1-micro/), [Cloud SQL users and roles (official)](https://docs.cloud.google.com/sql/docs/postgres/users?authuser=4)
- DigitalOcean: [App Platform pricing (official docs)](https://docs.digitalocean.com/products/app-platform/details/pricing), [App Platform pricing page (official)](https://www.digitalocean.com/pricing/app-platform), [$200 App Platform credit (official promo)](https://try.digitalocean.com/app-platform/), [Managed PostgreSQL limits incl. 7-day PITR (official)](https://docs.digitalocean.com/products/databases/postgresql/details/limits/), [PostgreSQL pricing (official)](https://docs.digitalocean.com/products/databases/postgresql/details/pricing/), [Managed PostgreSQL review with $15 plan (secondary)](https://infratally.com/articles/digitalocean-managed-postgres-deep-dive/), [modify user privileges (official)](https://docs.digitalocean.com/products/databases/postgresql/how-to/modify-user-privileges/), [doadmin role attributes (DigitalOcean community)](https://www.digitalocean.com/community/questions/granting-pg_read_all_data-to-a-new-user), [Spaces pricing (official)](https://docs.digitalocean.com/products/spaces/details/pricing), [Bangalore region (official blog)](https://www.digitalocean.com/blog/introducing-our-bangalore-region-blr1)
- AWS: [Free Tier credits and 6-month plan (official)](https://aws.amazon.com/about-aws/whats-new/2025/07/aws-free-tier-credits-month-free-plan), [Free Tier page (official)](https://aws.amazon.com/free), [Lightsail point-in-time restore (official)](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-creating-a-database-from-point-in-time-backup.html), [Lightsail pricing guide (secondary)](https://cloudburn.io/blog/amazon-lightsail-pricing), [RDS db.t4g.micro by region (secondary)](https://sparecores.com/database/aws/db.t4g.micro), [Fargate pricing (official)](https://aws.amazon.com/fargate/pricing/)
- Neon BYPASSRLS note: [Neon changelog (official)](https://neon.com/docs/changelog/2023-08-15); PostgreSQL role rules: [CREATE ROLE (PostgreSQL 17 docs)](https://www.postgresql.org/docs/17/sql-createrole.html)

Keys, email, files, edge
- [AWS KMS pricing (official)](https://aws.amazon.com/kms/pricing/), [Google Cloud KMS pricing (official)](https://cloud.google.com/kms/pricing)
- [Amazon SES pricing summary (secondary)](https://cloudburn.io/blog/amazon-ses-pricing), [SES free-tier change (secondary)](https://costbench.com/software/email-api/amazon-ses/free-plan/), [Resend pricing (official)](https://resend.com/pricing.md)
- [GuardDuty Malware Protection for S3 price cut (official)](https://aws.amazon.com/about-aws/whats-new/2025/02/amazon-guardduty-malware-protection-s3-price-reduction), [GuardDuty S3 malware pricing and free tier (official docs)](https://docs.aws.eu/guardduty/latest/ug/pricing-malware-protection-for-s3-guardduty.html)
- [Cloudflare rate limiting rules (official)](https://developers.cloudflare.com/waf/rate-limiting-rules/index.md), [Cloudflare WAF (official)](https://developers.cloudflare.com/waf/index.md), [Cloudflare R2 (official)](https://www.cloudflare.com/r2/)
- SMS: [MSG91 OTP pricing page (official)](https://msg91.com/pricing/otpwidget), [SMS OTP cost in India (secondary)](https://productgrowth.in/numbers/sms-otp-cost-india/)

Monitoring and CI
- [Sentry pricing 2026 (secondary)](https://www.activepieces.com/blog/sentry-pricing-2026-developer-team-business-plans.md), [Better Stack check frequency (official)](https://betterstack.com/docs/uptime/check-frequency/), [Healthchecks.io pricing (secondary)](https://www.capterra.com/p/249957/Healthchecksio/pricing/), [GitHub Actions free minutes (secondary)](https://cicdcalculator.com/github-actions-free-tier)

AI
- [Claude API pricing (official)](https://platform.claude.com/docs/en/about-claude/pricing), [Claude API pricing October 2026 (secondary)](https://benchlm.ai/blog/posts/claude-api-pricing), [Claude pricing mid-2026 incl. Haiku 4.5 and Sonnet 5 (secondary)](https://www.finout.io/blog/claude-pricing-in-2026-for-individuals-organizations-and-developers)
- [Amazon Bedrock pricing (official)](https://aws.amazon.com/bedrock/pricing/), [Claude in India on Bedrock (AWS blog)](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-expands-claude-model-availability-to-india-cross-region-inference/), [global vs geographic cross-Region inference (AWS docs)](https://docs.aws.amazon.com/bedrock/latest/userguide/global-cross-region-inference.html), [Claude on Amazon Bedrock (Anthropic docs)](https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock)
- [API and data retention (Anthropic docs)](https://platform.claude.com/docs/en/build-with-claude/api-and-data-retention), [zero data retention (Anthropic docs)](https://platform.claude.com/docs/en/build-with-claude/zero-data-retention), [Claude API data retention summary (secondary)](https://www.getvoibe.com/resources/claude-api-data-retention/), [Anthropic commercial terms, no training (secondary summary)](https://conductatlas.com/platform/anthropic/anthropic-commercial-terms/output-ownership-and-no-model-training/)
