# ADR-005: Encryption of sensitive fields, files and connection tokens

**Status:** Accepted (approved with the architecture, commit 1abed76) · Amended for CR-001, C7

## Context
NFR-004 (encrypted in storage and transit) and NFR-025 (tokens encrypted, kept separately, never seen by
staff or logs). PAN, bank and income data and Gmail access are high-value targets (R8).

## Decision
- Disk encryption on RDS and S3 (KMS) and TLS everywhere.
- App-level AES-256-GCM for PAN, GSTIN, bank account numbers, message bodies, outbound bodies,
  sensitive undo values and all stored files. Each workspace has its own data key, wrapped by the KMS
  key `data`. The associated data (workspace, table, column, row) stops a ciphertext working in
  another row.
- Connection tokens live in a separate `vault` schema, encrypted under a different KMS key
  (`tokens`). Only the worker's IAM role can decrypt it, and only the worker's database role can read
  the schema.
- KMS keys are multi-Region (Mumbai primary, Hyderabad replica) so DR restores can decrypt.
- Uploads go to a quarantine bucket first. GuardDuty Malware Protection for S3 scans them before they
  are encrypted and moved (NFR-031).
- One small `files.crypto` module is the only code that touches KMS (checked by import-linter).

**Amended for CR-001, C7 (2026-11-11).**
- The key service is **AWS KMS in Mumbai**, used from DigitalOcean (ADR-022). The app cannot assume an
  IAM role there, so each component has its own least-privilege IAM user stored as an encrypted app
  secret: `web` may use only the `data` key, `worker` also `tokens`; key policies require an encryption
  context naming a workspace or the platform scope. Credentials rotate every 90 days; CloudTrail alerts
  on unexpected use. When compute moves to a host with workload identity, the stored credentials go.
- Disk encryption: DigitalOcean encrypts managed databases and their backups at rest with keys it
  manages (not our KMS key `rds`, which exists only on the AWS reference design). Field-level
  encryption above is what protects PAN, bank numbers, bodies and tokens if a backup leaks.
- **User-level secrets** (the authenticator seed, ADR-012) belong to no workspace, so they are encrypted
  with a **platform data key** (`platform_key` table, one row per key version), wrapped by KMS key
  `data` with encryption context `{"scope": "platform"}`. Associated data binds the user ID, table and
  column. Backup codes are not encrypted but stored as keyed hashes (HMAC with the code pepper).
- Multi-Region keys are not used in the validation phase: the hourly off-provider backup is encrypted
  under a key in the same Mumbai account, and a region loss of AWS Mumbai alone does not lose data
  (the database is in Bangalore). Revisit at a hyperscaler move.
- The `KmsClient` adapter takes a generic encryption context (not only a workspace ID), so other key
  services can be added without touching callers.
- Malware scanning keeps GuardDuty for S3 (Mumbai, subject to Q-V5); if unavailable, a ClamAV container
  is the fallback, and uploads stay off for real creators until a scanner works (PRD 4.5).

## Options considered
| Option | For | Against |
|---|---|---|
| **Disk + app-level field encryption + token vault (chosen)** | A database dump or backup leak exposes no PAN, bank numbers, bodies or tokens | Encrypted fields cannot be searched; small KMS cost |
| Disk encryption only | Simplest | Anyone with database access reads everything |
| Encrypt every column | Maximum secrecy | Lists and search impossible; slow; complex |
| ClamAV container instead of GuardDuty | No per-GB fee | A server to keep updated, 2 GB of memory always on |

## Consequences
- Brand names, business subjects and amounts stay plaintext for lists and search, protected by RLS and
  disk encryption. This is a deliberate trade-off.
- **Global search (Amended after mockups, AR5.)** The search index copies only plaintext fields
  (names, email addresses and handles, business subjects, document and PO numbers, payment references,
  file names, amounts). It never reads an encrypted column or file content, so message, DM, draft and
  file text cannot be searched in the MVP (PRD FR-205, Q23); the fallback is a "Search in Gmail" link.
  File names stay plaintext so they can be listed and searched. A test writes a marker word into every
  encrypted column and checks search never finds it (architecture §12, §16A.1).
- Losing the KMS keys would lose the data, so keys are never scheduled for deletion without a two-person
  change.
- Backups are not "crypto-shredded" on deletion. Erasure relies on deleting rows and letting 14-day
  backups expire (NFR-005).
