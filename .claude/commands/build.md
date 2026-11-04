---
description: Stage 5b — implement one ticket (Sonnet, escalates to Opus on repeat failure)
argument-hint: <path to ticket file>
---
1. Read the ticket at $ARGUMENTS.
2. If its tier is A, delegate to the `architect` subagent. Otherwise delegate to the `builder`
   subagent with the ticket path.
3. If the builder reports the same failure twice or a missing decision, delegate the problem
   to the `architect` subagent with the builder's report, then hand the fix back to a `builder`.
4. Delegate to the `reviewer` subagent with the ticket path and the diff.
5. If the verdict is CHANGES REQUIRED, send the findings to a `builder` and review again
   (at most two rounds, then stop and tell me).
6. On APPROVE, append a short entry to `docs/iterations/<that iteration>/log.md` and commit the
   ticket's changes with the message "<ticket id>: <ticket title>".
7. Tell me the result and how to see it working.
