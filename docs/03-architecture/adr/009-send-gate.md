# ADR-009: The send gate

**Status:** Proposed

## Context
The most important promise (D6, D22, FR-236, M10 "zero, ever"): nothing reaches a brand without a
recorded tap on that exact content by the owner or a currently authorised person, or the owner's
fixed-template reminder opt-in. The assistant can never approve. A manager whose permission is removed
before sending must be blocked. Reminders must go out once only, even after a crash (FR-123 AC3).

## Decision
- `outbound.gate` in the worker is the **only** code that may import the Gmail, Instagram and WhatsApp
  send clients. import-linter enforces this in CI (FR-236 AC4).
- Every outbound message is an `outbound_message` row. Approving stores an `approval` with a SHA-256
  fingerprint of recipients, sender account, subject, body and attachment hashes.
- At send time the gate locks the row and checks, in order: status; fingerprint unchanged; approver is a
  human; `authorize()` still allows the approver **now**; or, for template reminders, the owner's
  opt-in is on and the body equals the approved template with only the allowed fields filled;
  reminder rules (not paid or disputed or paused, none sent today, inside sending hours); plan
  entitlement; for assistant or automation drafts, recipients are confirmed contacts.
- Any failure: blocked, logged, returned to the owner's queue.
- Effectively-once sending: mark `sending`, set our own `Message-ID`, and before any retry search Gmail
  for it (`rfc822msgid:`). Found means sent.
- An invariant monitor pages on any sent message without a matching approval or opt-in.

## Options considered
| Option | For | Against |
|---|---|---|
| **One gate re-checking at send time (chosen)** | System-enforced; covers every drafter; testable | Every channel must be wired through it |
| Check at approval time only | Simpler | Misses edits after approval and revoked permissions |
| Trust the AI or the UI to ask first | Least code | A bug or a prompt injection sends mail |

## Consequences
- The Message-ID check must be confirmed in an iteration-1 spike (open question Q-T1). If Gmail rewrites
  it, we fall back to a custom header and a time-window search.
- Gate tickets are tier A (Opus review).
