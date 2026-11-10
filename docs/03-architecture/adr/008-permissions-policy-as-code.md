# ADR-008: Permissions as action types and rules, evaluated as code at the moment of action

**Status:** Proposed

## Context
PRD §7 defines roles, checkboxes, rules (amount limit, own-deals scope, hide values, end date), a
never-delegable list (FR-268), and assistant rules (FR-235). Checks happen at the moment of action,
including at send time (FR-236 AC3). The MVP has only the owner, but the foundation must be tested now
(PRD §5.P).

## Decision
- Role presets are only starting sets of action types. The truth is `permission_grant` rows plus rule
  columns on `membership`.
- One function, `authorize(actor, workspace, action_type, resource, context)`, returns ALLOW, QUEUE,
  STEP_UP or DENY. The stricter rule wins.
- The never-delegable list is fixed in code and cannot be granted.
- The assistant acts as `Actor(kind=assistant, on_behalf_of=person)`. Its rights are the person's
  rights intersected with the FR-235 table. It can never approve or send.
- The PRD §7.2 matrix is kept as a data file (`app/bhq/workspaces/matrix.yaml`; amended for iteration 1, D1) and every row is a test.

## Options considered
| Option | For | Against |
|---|---|---|
| **Policy as plain code + matrix tests (chosen)** | Readable, fast, fully tested; no new system | We maintain it ourselves |
| Fixed roles only | Simplest | Cannot express checkboxes and ₹ limits |
| Policy engine (OPA, Cedar) | Powerful, separate language | A new language and service to learn and run; overkill for one product |

## Consequences
- v1 manager features become new screens and grants, not a rebuild.
- Field-level hiding lives in Selectors, so the assistant cannot reveal what a screen hides.
