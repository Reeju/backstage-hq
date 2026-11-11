# ADR-014: Versioned country rule packages

**Status:** Accepted (approved with the architecture, commit 1abed76) · Amended for CR-001, C3

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

**Workspace country and lookup (Amended for CR-001, C3).**
- Every workspace stores `country_code` (ISO 3166-1 alpha-2), `currency` (ISO 4217) and `timezone` (IANA),
  set at creation from the chosen country's rule set and never defaulted in the schema (FR-005 AC1).
- One entry point, `bhq.rules.registry.ruleset_for(country_code, on_date)`, returns the rule set in
  force or raises `UnsupportedCountry`. Nothing imports `bhq.rules.india` directly except the registry
  (import-linter). There is **no fallback to India**: an unknown country fails closed, so nothing is
  calculated, shown or sent (FR-005 AC3, NFR-022).
- Each rule set also declares its currency, time zone, money formatting (Indian digit grouping for
  India), the profile identifiers it needs (PAN, GSTIN, IFSC, state for India) and their validators, so
  screens show Indian fields only for Indian workspaces (FR-003 AC5).
- `supported_countries()` lists the countries offered at sign-up (India only). A test-only fake country
  with its own small rule set, registered only in test settings, proves no Indian field or rule leaks;
  a second test-only country with no rule set proves the lookup fails closed.
- Time-based rules (brand sending window, quiet hours, lock-out times shown to the creator) use the
  workspace time zone (IST for India).

## Options considered
| Option | For | Against |
|---|---|---|
| **Versioned pure-code packages (chosen)** | Testable, reviewable, diffable for the CA; old invoices keep old rules | Code change for each rule update |
| Rules in database tables | Editable without deploy | Hard to test and review; easy to break silently |
| Third-party tax API | Less work | Not available for creator TDS/GST in this form; cost; dependency |

## Consequences
- A rule change is a new version folder plus tests and a CA check, never an edit to an old version.
- Adding a country means a new package. No change to deals, invoices or payments.
