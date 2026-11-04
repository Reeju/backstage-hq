---
description: Stage 4 — clickable HTML mockups from the PRD screen list (Sonnet)
argument-hint: [screens to focus on, or blank for all MVP screens]
---
Delegate to the `ux-designer` subagent:

"Read `docs/02-prd/PRD.md` (and `docs/03-architecture/architecture.md` if it exists). Create clickable mockups
for: $ARGUMENTS (if blank, all MVP screens). Follow your instructions on states and the design system."

Then open `docs/04-design/index.html` in the browser so I can click through it, and list any PRD
gaps the designer found.

When I approve, commit `docs/04-design` with the message "Stage 4: mockups approved".
