# ADR-018: Observability and invariant monitors

**Status:** Proposed · Amended for CR-001, C11

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

**Amended for CR-001, C11 (2026-11-11).** On DigitalOcean (ADR-022) there is no CloudWatch:
- **Logs:** structlog JSON to standard output, unchanged. App Platform keeps recent logs; from V1 they
  are forwarded to a log service with at least 30 days' retention (architecture §18.1), chosen from App
  Platform's built-in destinations (Better Stack Logs first; a paid tier if its free retention is
  shorter). The redaction filter and its CI test are unchanged; the destination never sees tokens, codes
  or typed search words.
- **Metrics and alarms:** App Platform's CPU, memory and restart alerts (free) plus our own monitor
  jobs (job lag per queue, invariant monitors) that page through the alerting integration (Better Stack
  incident email and phone, or a Healthchecks.io "fail" ping). Dashboards come with the full setup.
- **Uptime:** Better Stack free (outside our host; 3-minute checks) in the validation phase, where uptime
  is measured but not a target (PRD 4.5); 1-minute checks at the full setup.
- **Heartbeat:** Healthchecks.io free, unchanged.
- **Errors:** Sentry Developer (free) until a second person needs access.
- Every one of these is on the privacy page; none receives personal data by design.

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
