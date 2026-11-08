# ADR-003: PostgreSQL as the only datastore

**Status:** Proposed

## Context
Money records need transactions and exact numbers. Jobs, the activity log and the records they
describe must change together. Every extra system (Redis, a message broker, a search engine) adds
cost, backups and failure modes.

## Decision
PostgreSQL 17 on RDS holds all records, the job queue (ADR-006), the activity log, sessions, rate-limit
counters (Django database cache) and full-text search. No Redis, no separate queue, no search engine
in the MVP. pgvector is available later if drafting needs similarity search.

## Options considered
| Option | For | Against |
|---|---|---|
| **Postgres only (chosen)** | One thing to back up, secure and monitor; jobs and changes in one transaction; RLS for isolation | Must watch load as we grow; queue polling adds some database work |
| Postgres + Redis | Fast cache and queue | Another system; job queued outside the transaction can be lost or run for a change that rolled back |
| Aurora Serverless | Scales automatically | Higher minimum cost; little benefit at this size |

## Consequences
- Simpler operations and one restore drill covers everything.
- At a few thousand creators we may add a cache or move the queue. The `jobs` wrapper keeps that change
  inside one module.
