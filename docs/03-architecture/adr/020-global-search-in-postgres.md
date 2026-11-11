# ADR-020: Global search inside PostgreSQL

**Status:** Accepted (approved with the architecture, commit 1abed76) · Amended after mockups, AR5

## Context
The owner put global search in the MVP on 2026-11-10 (PRD FR-205, edit M30; Q21–Q25 accepted). It
must find messages, brands and contacts, leads and deals, quotes, invoices and credit notes, payments
and files by name, subject, number or amount; never another workspace (NFR-023), never personal
content that is not kept (FR-044), never encrypted text (ADR-005); answer within 1 s on desktop and
2 s on 4G (NFR-047); and never keep the typed words (NFR-048). It must match Devanagari and Roman text
each in its own script, word starts, partial invoice numbers and Indian amounts ("₹80k", "1.2L").
PostgreSQL has no Hindi language setting. Search is a Should, so it must stay small.

## Decision
- **One derived table, `search_entry`**, one row per searchable record, with ten foreign keys
  (`ON DELETE CASCADE`, exactly one set), a weighted `tsvector` of words, a `bigint[]` of exact
  amounts in paise, a date, the view permission and the own-deals scope. RLS forced like every
  business table (ADR-004).
- **Only plaintext business fields**, listed per module in its own `search.py`. Never `_enc` columns,
  file content, FR-044 or over-cap messages.
- **One word splitter in Python** (`search/tokenize.py`, no Django) for records and typed words; the
  words are stored with `array_to_tsvector`, so matching does not depend on the database locale.
  Behaves like the `simple` configuration: no stemming, no language, so each script matches itself.
  Typed words become word-start matches, all required.
- **Amounts read in Python** (`search/amounts.py`, no Django) into exact paise, matched against the
  amount array, kept apart from the words. No ranges (FR-205).
- **Kept current in the same transaction** by the Action runner (ADR-007); deletes cascade; only
  renames and new links go through a realtime job.
- **Role filter inside the query** from `workspaces.policy.search_scope(actor)`, so counts never
  include hidden records; no amount matching without amount visibility.
- **Words never kept:** `POST` only, redacted logs and Sentry, server-side parameter binding and RDS
  logging settings that hide parameters; staff searches go to the creator's activity log.
- Indexes: GIN on (`workspace_id`, words) and (`workspace_id`, amounts) with `btree_gin`.

## Options considered
| Option | For | Against |
|---|---|---|
| **One shared `search_entry` table (chosen)** | One query gives groups and counts; one RLS policy and one test; the searchable fields are listed in one place; derived, so rebuildable and safe to roll back | Brand names are copied into related entries, so a rename needs a short reindex job |
| A `tsvector` column on each table, searched with `UNION` | No copy of data | Seven or more queries to group and count; generated columns cannot include a related brand name; the field list is spread across tables |
| Trigram index (`pg_trgm`) as well | Matches inside words and small typos | Typo tolerance is out of MVP scope; a second, larger index per row; more false matches on short words |
| PostgreSQL language configurations (`english`, etc.) | Built in | No Hindi configuration; stemming would mangle names, handles and Hinglish |
| OpenSearch or another search service | Rich ranking, typo tolerance | A new system to run, secure, back up and keep isolated per workspace; real monthly cost; a second copy of creator data outside RLS |

## Consequences
- No new service and no AI: cost is a few MB of storage per creator (architecture §16A.7).
- The search table adds no new way to cross workspaces and no new readable copy of encrypted data.
- The word splitter is the single place that decides matching; changing it bumps `index_version`
  and a bulk job rebuilds entries.
- If search slows as data grows, split `search_entry` by workspace (hash partitions) before
  considering a search engine.
- Searching message, DM or file text would need a new decision that weakens ADR-005; not in the MVP
  (PRD Q23).
