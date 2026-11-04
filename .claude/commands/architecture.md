---
description: Stage 3 — architecture, data model and stack (Opus)
argument-hint: [constraints, e.g. hosting or budget]
---
Delegate to the `architect` subagent:

"Read the approved `docs/02-prd/PRD.md`. Write `docs/03-architecture/architecture.md`
(stack choice with reasons, component diagram in Mermaid, data model / ERD, API style, auth and
RBAC model, audit logging, environments, CI/CD, testing strategy, observability) and an ADR for
each major decision. Constraints: $ARGUMENTS. Explain trade-offs in plain language for a
non-programmer owner."

Show me the summary and the decisions that need my sign-off.

When I approve, commit `docs/03-architecture` with the message "Stage 3: architecture approved".
