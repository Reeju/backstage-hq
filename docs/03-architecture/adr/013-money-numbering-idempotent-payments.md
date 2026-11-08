# ADR-013: Money, invoice numbering and idempotent payment records

**Status:** Proposed

## Context
NFR-009 (exact money), FR-112 (gapless numbers per tax year, issued only on confirmation), FR-113
(locked after sending), FR-114 (credit notes), FR-143 to FR-147 (matching, never count twice, undo, TDS).
One wrong rupee breaks trust.

## Decision
- Money is `BIGINT` paise with a currency code on documents. No floats anywhere. Totals are computed
  from lines by one function.
- Numbers come from a `number_sequence` row per (workspace, document type, tax year), locked
  `FOR UPDATE` inside the confirm transaction. A rollback also rolls back the counter, so there are no
  gaps. Drafts have no number.
- On confirmation the invoice copies seller details (PAN, GSTIN, bank) from the profile and bill-to
  details into frozen snapshots, and stores the rule version. After sending it is locked. Changes go
  through credit notes with their own series.
- Each payment has a unique `dedupe_key` per source (Gmail message ID; statement line hash; manual
  entry ID). Statement lines that match an existing payment (amount, value date ±2 days, reference or
  payer) are linked, not added.
- Matches are `payment_allocation` rows. Undo sets `undone_at` rather than deleting, and is logged.
- PDFs are made by WeasyPrint once at confirmation. Their hash is part of the send fingerprint.

## Options considered
| Option | For | Against |
|---|---|---|
| **Integer paise + locked counter + dedupe keys (chosen)** | Exact; gapless; safe under retries | Concurrent confirms in one workspace wait briefly for the lock (fine) |
| Decimal columns | Also exact | Easy to mix with floats in code; integers are simpler to test |
| Postgres sequences for numbers | Fast | Sequences skip numbers on rollback, which breaks FR-112 |

## Consequences
- Property tests (Hypothesis) and concurrency tests prove gapless numbering and that allocations never
  exceed invoices.
- An invariant monitor pages on any number gap or double-counted payment.
