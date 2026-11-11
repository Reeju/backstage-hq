# ADR-022: Low-cost hosting on DigitalOcean Bangalore with AWS for keys, email and files

**Status:** Accepted (approved with CR-001, 2026-11-11; changes C6, C7, C10). **Supersedes ADR-002** for the
validation phase (V0, V1) and as the recommended full setup up to about 1,000 creators. ADR-002's AWS
design stays as the documented target if a migration trigger below fires.

## Context
The validation phase (PRD 4.5) needs a staging setup for the owner (V0) and a separate low-cost
production for up to 10 invited creators (V1) that still meets every rule in "what must still hold":
isolation, encryption under a key service, at most 1 hour of data lost with a tested restore, an
always-on worker and web app, published providers and regions. The dated comparison
(`provider-comparison-2026-11.md`) priced AWS (ECS, Lightsail), Render, Google Cloud Run and
DigitalOcean for the same app, worker, scheduler, database, storage and recovery needs.

## Decision
**Compute and database: DigitalOcean, region BLR1 (Bangalore).**
- App Platform, one app per environment: service `web` (gunicorn), worker `worker`
  (`manage.py run_worker`), and a `PRE_DEPLOY` job `migrate` (`manage.py migrate --database migrator`)
  that must succeed before a new version receives traffic. Images are built once in CI (linux/amd64) and
  pushed to DigitalOcean Container Registry. Smallest plans in V0 (512 MiB each); 1 GiB in V1.
- Managed PostgreSQL 17, single node in V0 and V1 (1 GiB, point-in-time restore for 7 days), with
  **trusted sources** set to the app only, so the database is not reachable from the internet. The
  admin user (`doadmin`) is used only by an operator to run `db_bootstrap_roles`; the app connects as
  our own roles (ADR-004).
- Separate DigitalOcean projects for staging and production. Production lives in a team in the
  business's name or transferable to it (GQ8).

**Security services: AWS, region ap-south-1 (Mumbai), one account per environment.**
- KMS keys `data` (and `tokens` from iteration 5) for envelope encryption (ADR-005).
- SES for our own email: in staging the **sandbox** (delivers only to verified addresses) is the
  allow-list; production access is requested before V1.
- S3 + GuardDuty Malware Protection for files from iteration 8 (subject to Q-V5), and S3 for Terraform
  state and for the off-provider backups below.
- App Platform cannot assume AWS roles, so each component gets its own IAM user with least privilege,
  stored as an encrypted app secret: `web` (KMS `data` with an encryption-context condition), `worker`
  (KMS `data` and `tokens`, SES send from our domain, S3 backup write-only prefix). Keys are rotated
  every 90 days; CloudTrail alerts on use from unexpected sources.

**Edge and DNS: Cloudflare (free).** DNS for the app and SES records. Proxying and the edge rate rule
(NFR-028) are deferred in the validation phase (PRD 4.5) and switched on, with Cloudflare Pro managed
rules, for the full setup. The app reads the client IP from a configured header.

**Backups and recovery (C10).**
- Layer 1: DigitalOcean point-in-time restore (7 days; realistic loss of minutes).
- Layer 2 (from V1): a worker job writes an **hourly encrypted logical backup** (`pg_dump`, encrypted
  with a KMS data key) to S3 in AWS Mumbai, kept 14 days, using a read-only role `bhq_backup` with
  `pg_dump --enable-row-security` (ADR-004). This covers losing the DigitalOcean account or region with
  at most 1 hour of loss (NFR-043), and it is the path to any other PostgreSQL host.
- A restore drill of both layers into a fresh database, followed by the RLS meta-test, invoice-sequence
  and audit hash-chain checks, runs before the first real creator and then quarterly.

**Full setup (after the validation exit).** Stay on DigitalOcean and scale: standby database node, two
or more web containers, larger and split workers, Cloudflare Pro in front, paid uptime and error tiers.

**Migration triggers to a hyperscaler (ADR-002 design on AWS).** Any of: a binding requirement for India
processing with disaster recovery inside India (DigitalOcean has one Indian region); the security
review or a customer requires no stored cloud keys; measured uptime below 99.5% for two months because
of the platform; DigitalOcean's largest database plan is near; or the saving exceeds the migration cost.
The move is compute and database only (keys, email and files are already on AWS).

## Options considered
| Option | For | Against |
|---|---|---|
| **DigitalOcean BLR1 + AWS security services (chosen)** | About $27 a month for V0 and $65–85 for V1 including staging; India region; point-in-time restore included; pre-deploy migration job | Stored AWS credentials (no IAM roles); one Indian region |
| AWS ECS + RDS (ADR-002) | IAM roles; WAF; one vendor | $60–85 for staging alone; $195–285 lean beta |
| AWS Lightsail | One vendor, Mumbai, 7-day point-in-time restore | No one-off migration job; containers cannot use IAM roles either |
| Render (Singapore) | Slightly cheaper in V0 ($21.50); simple | No India region; 3-day point-in-time restore on the free workspace plan |
| Google Cloud Run + Cloud SQL (Mumbai) | Workload identity; native KMS and Pub/Sub | Always-on worker costs most here (about $45 a month for V0) |
| Supabase or Neon free | $0 | No backups or not enough compute for an always-on worker; Neon has no India region |

## Consequences
- The infrastructure code (`infra/`) uses three Terraform providers: DigitalOcean, AWS and Cloudflare.
  The App Platform app spec lives in the repo and is applied by the deploy workflow.
- Stored AWS credentials are a known, reviewed risk (architecture §25) until a trigger moves compute to
  a host with workload identity.
- Data is stored in India (Bangalore) with keys, email and backups in Mumbai; AI processing location
  depends on ADR-011. This is a published fact, not a residency promise (D11, NFR-006).
- Costs and plan sizes are in the comparison document; measured bills replace them (FR-295).
