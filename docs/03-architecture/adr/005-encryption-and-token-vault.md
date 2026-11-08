# ADR-005: Encryption of sensitive fields, files and connection tokens

**Status:** Proposed

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
- Losing the KMS keys would lose the data, so keys are never scheduled for deletion without a two-person
  change.
- Backups are not "crypto-shredded" on deletion. Erasure relies on deleting rows and letting 14-day
  backups expire (NFR-005).
