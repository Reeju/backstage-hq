---
description: Stage 1 — brainstorm personas and use cases (Opus)
argument-hint: <product idea or notes>
---
Delegate to the `product-strategist` subagent with this brief:

"Product notes from the owner: $ARGUMENTS

Produce `docs/01-usecases/use-cases.md` containing: problem statement, personas (admin, ops,
finance, creator, auditor at minimum), the top user journeys, and a use-case catalogue
(UC-### ID, actor, goal, trigger, main flow, edge cases, priority). Include non-functional
needs an enterprise buyer will ask about. End with open questions for the owner."

When it returns, show me the summary and the open questions. Do not continue to the PRD
until I answer them and say the use cases are approved.
