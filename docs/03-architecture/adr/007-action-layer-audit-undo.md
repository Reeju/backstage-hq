# ADR-007: One Action layer for every change (permission, audit, undo)

**Status:** Accepted (approved with the architecture, commit 1abed76)

## Context
Screens, the assistant (FR-232, FR-233), jobs and later managers all change the same records. Every
change must be permission-checked at the moment of action, logged with actor and on-whose-behalf
(FR-213, §12.4), and often undoable (FR-214, FR-238). If each path did this its own way, gaps would
appear.

## Decision
- Every write is an **Action**: a registered function that declares its name, action type
  (permission), input schema, whether it is internal or outbound, and its undo.
- The Action runner opens a transaction, sets the RLS workspace, calls `authorize()`, runs the change,
  writes the activity log entry with before-values, and queues any jobs. All of this happens in that
  one transaction.
- Reads that matter are **Selectors**, which redact by permission. Screens, the assistant, exports and
  the year-end pack all use the same Selectors, so their numbers match (FR-231 AC1, FR-155 AC1,
  FR-210 AC1).
- Assistant tools are generated from the Action and Selector registry.
- A guard makes saving a business model outside an Action fail in tests and development.

## Options considered
| Option | For | Against |
|---|---|---|
| **Central Action layer (chosen)** | One place for permission, log and undo; assistant gets tested tools for free | A little ceremony per change |
| Logging in model signals | Automatic | Misses actor and intent; hard to group assistant runs; easy to bypass |
| Event sourcing | Full history | Far more complex than needed |

## Consequences
- Builders follow one pattern for every ticket, which suits Sonnet builders.
- Undo of a run reverses log entries newest first and warns if a record's `version` changed since.
