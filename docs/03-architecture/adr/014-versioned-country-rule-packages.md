# ADR-014: Versioned country rule packages

**Status:** Proposed

## Context
GST split and place of supply, TDS rates, thresholds and the tax year are rule-based, reviewed once by
a CA (D36), labelled "not advice", and every figure must show its rule version and records (FR-151
AC2). The 2025 Income-tax Act changed sections (A12). D1 and NFR-022 want other countries later without
touching deal, invoice or payment logic. D15 wants companies and LLPs later.

## Decision
- A pure-Python package `app/bhq/rules/` with one sub-package per country and version, e.g.
  `rules/india/v2026_1/` (amended for iteration 1, D1). It contains no Django imports (enforced by import-linter).
- The rest of the app calls a small interface (`tax_year_of`, `gst_split`, `place_of_supply`,
  `tds_rates`, `gst_threshold`, `invoice_required_fields`) chosen by the workspace's country and the
  document date.
- Every computed figure and every invoice stores `rule_set_version`.
- Rule tests are table-driven. CA-reviewed cases are kept as fixtures.
- Entity type (individual, sole proprietor; company and LLP later) is an input to the rules from day one.

## Options considered
| Option | For | Against |
|---|---|---|
| **Versioned pure-code packages (chosen)** | Testable, reviewable, diffable for the CA; old invoices keep old rules | Code change for each rule update |
| Rules in database tables | Editable without deploy | Hard to test and review; easy to break silently |
| Third-party tax API | Less work | Not available for creator TDS/GST in this form; cost; dependency |

## Consequences
- A rule change is a new version folder plus tests and a CA check, never an edit to an old version.
- Adding a country means a new package. No change to deals, invoices or payments.
