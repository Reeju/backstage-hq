# ADR-006: Background jobs in PostgreSQL with state-driven schedules

**Status:** Proposed

## Context
Reminders, syncs, imports, AI tasks and sends run in the background. The PRD demands zero double
reminders, none after a payment match (NFR-008, FR-123), jobs on time on 99.5% of days (NFR-012), and
"late only if still valid, never twice".

## Decision
- **Procrastinate** (job queue stored in PostgreSQL) behind our own thin `jobs` module. Jobs are queued
  in the same transaction as the change that caused them.
- Four queues with separate concurrency: `realtime`, `ai`, `bulk`, `scheduled`. Locks serialise work
  per mailbox and per brand's invoices.
- **Schedules come from state.** Periodic ticks ask "what is due and not yet done?" (e.g. reminders
  whose date has come, invoice unpaid, none sent today). Database uniqueness rules (`invoice, step`;
  `invoice, sent_on`; `workspace, date` for digests; `workspace, tax_year, point` for alerts) make
  doubles impossible. A missed tick catches up on the next one.
- Each tick pings an outside heartbeat. Silence pages us.

## Options considered
| Option | For | Against |
|---|---|---|
| **Procrastinate on Postgres (chosen)** | Transactional queueing; no extra system; periodic tasks and locks built in | Smaller community than Celery; project is seeking more maintainers |
| Celery + SQS | Very well known; managed broker | Queueing is outside the transaction (needs an outbox); SQS limits on delays and long jobs; more config |
| Celery + Redis | Well known | Another system to run and back up |
| One-off timers per reminder | Simple to picture | Timers get lost or fire after a payment; hard to reason about |

## Consequences
- Correctness comes from data and constraints, not from timers working perfectly.
- If Procrastinate stalls as a project, the `jobs` wrapper limits a move to Celery + SQS to one module
  plus an outbox table.
