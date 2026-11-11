# ADR-011: AI gateway and Claude on Amazon Bedrock (India)

**Status:** Accepted (approved with the architecture, commit 1abed76) · Provider decision amended for CR-001, C8 (2026-11-11). The gateway decision is unchanged.

## Context
AI sorts mail, flags scams, extracts fields from emails, screenshots and PDFs (including Hindi and
Hinglish), drafts replies in the creator's voice, runs the assistant and cross-checks tax figures. The
PRD requires: no training on our data and short retention (NFR-035, FR-216), source links (NFR-014),
resistance to hidden instructions (FR-239), quality gates per release (NFR-046), cost metered per
creator (FR-295, M14), allowances (FR-234, FR-294), and graceful failure (NFR-045).

## Decision
- One module, `ai.gateway`, is the only code that calls a model (import-linter). It checks
  entitlements and allowances before calling, picks the model per purpose, uses prompt caching,
  validates JSON output, records tokens and cost in `ai_call`, and never logs content. A circuit breaker
  handles outages.
- Provider: **Claude on Amazon Bedrock with the India in-country profile.** Haiku 4.5 for sorting and
  scam signals. Sonnet 5 for extraction, drafts, the assistant and the tax cross-check. Model IDs are
  pinned in config. These are the versions offered in the India profile as of October 2026. We move
  to newer Haiku or Sonnet versions once they reach that profile and pass the eval suite.
- Calls that read outside content have no tools and return only allowed JSON fields. Only a signed-in
  person's chat starts an assistant run. Assistant tools are Actions (ADR-007); there is no send tool.
  Drafts may only address confirmed contacts.
- Eval sets with PRD thresholds gate every prompt or model change.

## Amendment for CR-001, C8 (2026-11-11)
The gateway, the no-tools rule for outside content, the eval gate and metering all stand. The
**provider** part changes, because CR-001 removes India processing as a requirement by itself and asks
for the provider with the lowest cost per successful task that meets NFR-035:
- **V0 (owner, dummy data): direct Claude API** (Anthropic), personal developer account, prepaid credits
  with a hard monthly spend limit. Models per purpose in settings: Haiku 5.5 for sorting and scam
  signals; Sonnet 5.5 for extraction, drafts, the assistant and the tax cross-check. About $2.80–3.80
  per paid creator a month versus $5.90–7.70 on Bedrock India (Haiku 4.5, Sonnet 5), mostly because the
  newest small model is not offered in the India profile (comparison §4.9).
- **V1 and the full setup: direct API only if our account has zero-data retention**, or written terms
  the owner accepts as meeting NFR-035 ("no longer than needed to answer"); standard API retention is
  30 days. Otherwise **Claude on Bedrock** (global or India profile) through the same gateway. The
  owner applies for zero-data retention now (open question Q-H2).
- **The binding choice is made by measurement** before iteration 8 ships anything to a creator: the
  eval suite runs the same labelled sets on both providers and compares accuracy, latency and cost per
  successful task including retries and review (CR-001). No automatic upgrade to a newer model without
  that run.
- The gateway gets a **provider adapter** (`bhq.ai.providers.anthropic`, `bhq.ai.providers.bedrock`).
  Only those adapters import a model SDK (import-linter). Switching is a settings change plus a passing
  eval run.
- Processing location is published on the privacy page: Anthropic (outside India) or AWS Mumbai and
  Hyderabad, whichever is in use (NFR-006). No India-processing promise is made (D11).

## Options considered
| Option | For | Against |
|---|---|---|
| Claude on Bedrock India (chosen originally; now the fallback, C8) | Processing in India; AWS terms (no training, not shared with model maker); one cloud contract; strong Hinglish and vision | New models may reach the India profile later; retention mode must be confirmed per model |
| **Anthropic API direct (chosen for CR-001, C8, subject to zero retention for real data)** | Newest and cheapest small model; about half the AI bill per paid creator; no AWS account needed | Processed outside India; standard retention 30 days unless zero-data retention is granted |
| Gemini on Vertex (Mumbai) | Often cheaper; in Mumbai | Second cloud; Hinglish drafting quality to be tested |
| Self-hosted open model | Full control | GPU cost and operations far beyond our scale |

## Consequences
- Switching provider is a change in one module, proven by the eval suite.
- Before beta, confirm the account's Bedrock retention mode for the chosen models does not require
  sharing data with the model maker (open question Q-V2).
- The tax cross-check uses the same model family as other features. D9's warning stands; the CA review
  (D36) remains the real safeguard.
