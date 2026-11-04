---
description: Stage 1 — brainstorm personas and use cases (Opus)
argument-hint: <product idea or notes>
---
Delegate to the `product-strategist` subagent with this brief:

"Product notes from the owner: $ARGUMENTS

Produce `docs/01-usecases/use-cases.md` containing: problem statement, personas (solo creators at
different income levels at minimum; plus anyone they might share access with, such as a
part-time editor, accountant or manager, and outside parties like brands), the top user
journeys, and a use-case catalogue (UC-### ID, actor, goal, trigger, main flow, edge cases,
priority). Mark which use cases AI or automation handles. Include non-functional needs a creator
will care about (privacy, mobile, reliability, data export). End with open questions for the
owner."

When it returns, show me the summary and the open questions. Do not continue to the PRD
until I answer them and say the use cases are approved.

When I approve, commit `docs/01-usecases` with the message "Stage 1: use cases approved".
