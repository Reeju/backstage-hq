# ADR-011: AI gateway and Claude on Amazon Bedrock (India)

**Status:** Proposed · Needs owner sign-off (S2 in `architecture.md` §26)

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

## Options considered
| Option | For | Against |
|---|---|---|
| **Claude on Bedrock India (chosen)** | Processing in India; AWS terms (no training, not shared with model maker); one cloud contract; strong Hinglish and vision | New models may reach the India profile later; retention mode must be confirmed per model |
| Anthropic API direct | Newest models first | Processing in the US; zero retention needs a separate agreement |
| Gemini on Vertex (Mumbai) | Often cheaper; in Mumbai | Second cloud; Hinglish drafting quality to be tested |
| Self-hosted open model | Full control | GPU cost and operations far beyond our scale |

## Consequences
- Switching provider is a change in one module, proven by the eval suite.
- Before beta, confirm the account's Bedrock retention mode for the chosen models does not require
  sharing data with the model maker (open question Q-V2).
- The tax cross-check uses the same model family as other features. D9's warning stands; the CA review
  (D36) remains the real safeguard.
