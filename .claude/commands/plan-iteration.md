---
description: Stage 5a — plan the next build iteration as small tickets (Opus)
argument-hint: <iteration number> <goal>
---
Delegate to the `architect` subagent:

"Plan iteration $ARGUMENTS. Read the approved docs in `docs/` and the current code in `app/`
(use a summary from the `scout` if the code is large). Write `docs/iterations/<NN>-<slug>/plan.md`
with the goal, the demo I will see at the end, and tickets `T-01.md`, `T-02.md`, ... in the same
folder. Each ticket: linked FR IDs, files to touch, acceptance criteria, tests that prove it,
and a tier label (B for normal build work, A if it needs Opus judgement). Keep each ticket
small enough to finish in one fresh session."

Show me the plan and the ticket list. Wait for my approval before building.
