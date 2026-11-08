# ADR-015: Ingestion through Gmail push, Meta webhooks, WhatsApp and the forwarding address

**Status:** Proposed · Parts need owner sign-off (S7, S8 in `architecture.md` §26)

## Context
FR-010 (new email sorted within 5 minutes), FR-011 (forwarding address), FR-012/FR-051 (Instagram DMs),
FR-013 (WhatsApp forward number, answered within 1 minute), FR-020 (import with first results within
15 minutes), FR-043 (never change Gmail), FR-044 (keep only business content), NFR-026 (least access),
NFR-044 (outside service down).

## Decision
- **Gmail:** scopes `gmail.readonly` and `gmail.send` only. `users.watch` publishes to a Google Pub/Sub
  topic that pushes to `/hooks/gmail` (Google-signed). A backup poll every 4 minutes. Sync uses the
  `historyId` cursor. Watches are renewed daily.
- **Two-pass reading:** free header checks, then a cheap model on metadata and snippet, then full body
  only for business mail. Personal mail keeps only category, date and provider ID (see edit P1).
- **Import:** resumable chunks, recent and money-related mail first, a provisional "total owed" as soon
  as possible.
- **Instagram** (behind a feature flag until Meta approves) and **WhatsApp Cloud API**: signed
  webhooks to `/hooks/meta` and `/hooks/whatsapp`.
- **Forwarding address:** SES receiving to `/hooks/ses`. The sender must be a verified address of the
  creator and pass SPF/DKIM.
- All webhooks are stored once by provider event ID in `inbound_event`, then processed by a job.

## Options considered
| Option | For | Against |
|---|---|---|
| **Gmail push + backup poll (chosen)** | Fast and cheap; survives lost pings | Needs a Google Cloud project for Pub/Sub (needed for OAuth anyway) |
| Poll only | Simpler | More API calls; slower |
| Adding `gmail.modify` now | Allows labels later | Broader permission, bigger review, more creator fear |
| Postmark for inbound mail | Simple, reliable | Forwarded brand emails would pass through the US |

## Consequences
- Until Google verifies the app, Gmail tokens in testing mode expire weekly, so the beta runs
  forwarding-only (D33).
- Gmail labels (Later) will need a new Google review.
- If SES receiving is not available in Mumbai (Q-V3), we use Postmark and list it on the privacy page.
