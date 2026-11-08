# ADR-018: Observability and invariant monitors

**Status:** Proposed

## Context
NFR-012 (jobs on time, failures alerted), NFR-042 (uptime measured outside our hosting), NFR-025 (no
tokens in logs), and zero-tolerance metrics M5 (reminder misfires) and M10 (send-gate breaches).
A small team must learn about problems before creators do.

## Decision
- **Sentry** for errors and performance, with personal data off and a scrubber for tokens, PAN, bank
  numbers and message bodies.
- **CloudWatch** structured JSON logs (structlog) with request, job and workspace IDs, and a redaction
  filter. A CI test checks that tokens never reach logs. Logs kept 30 days.
- **Metrics:** job lag, job failures, Gmail sync lag, webhook failures, gate refusals, reminders sent
  and skipped, auto-matches and undos, AI cost and errors.
- **Outside uptime monitor** (e.g. Better Stack) and **outside heartbeat** (e.g. Healthchecks.io) for
  the scheduler.
- **Invariant monitors** every 15 minutes, paging on any hit: a sent message without a matching
  approval or opt-in; a reminder after a payment match or twice in one day; an invoice number gap; a
  double-counted payment; a broken audit hash chain.

## Options considered
| Option | For | Against |
|---|---|---|
| **Sentry + CloudWatch + outside checks + invariants (chosen)** | Cheap; catches both crashes and silent wrong behaviour | Several small tools |
| CloudWatch only | One vendor | Weaker error grouping; monitors inside the thing they watch |
| Full observability platform (Datadog) | Powerful | Cost far above our scale |
| Self-hosted GlitchTip instead of Sentry | Data stays with us | A server to run |

## Consequences
- Sentry is a processor outside India and is listed on the privacy page. It receives no personal data
  by design.
- The "zero, ever" promises are watched directly, not inferred from error rates.
