---
description: Stage 6 — full review of an iteration before release (Opus)
argument-hint: <iteration folder>
---
Delegate to the `reviewer` subagent: review every change made for the tickets in $ARGUMENTS
against their acceptance criteria and the approved docs, run the full test suite, and write
`$ARGUMENTS/review.md`. Then give me the verdict, the blocking findings, and a plain-language
demo script I can follow to check the iteration myself.
