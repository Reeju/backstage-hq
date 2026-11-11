# ADR-021: Provider selection policy and swappable boundaries

**Status:** Proposed (CR-001, change C1; 2026-11-11)

## Context
CR-001 (adopted 2026-11-10/11) makes BackstageHQ "built in India for the world" and adds a low-cost
validation phase before real money is spent. The owner's direction: "build the first few versions with
minimum external costs ... but definitely keep provisions for the full-blown implementation". The
approved design chose AWS Mumbai (ADR-002) and Bedrock India (ADR-011) partly because of India
locality, which CR-001 says is not a requirement by itself. We need a rule for choosing providers now
and a way to change them later without a rewrite.

## Decision
**Selection policy (CR-001 wording, adopted).**
- Choose the lowest total-cost option among candidates that meet the approved quality requirements.
  Count recurring bills, engineering and maintenance effort, operational burden and likely migration
  cost. Compare app hosting and AI inference independently; using one cloud does not mandate its AI
  service. Keep portable application boundaries without building a multi-cloud platform.
- Prefer one deployment region at first if it meets latency and data-handling requirements for
  supported markets. Add regions when measured demand or a binding requirement justifies it.
- The quality bar is never traded for savings: tenant isolation, encryption under a key service,
  point-in-time restore with a tested restore, always-on worker and web app, AI terms (NFR-035), no
  personal data in logs. A free tier is not evidence of fitness for real data.
- Every provider and region in use, free tiers included, is listed on the privacy page (NFR-006).
- Prices are recorded with their date and source in a dated comparison
  (`docs/03-architecture/provider-comparison-2026-11.md`) and replaced by measured bills (FR-295).

**Swappable boundaries.** Every outside service sits behind one adapter or one setting, so moving from
the validation-phase setup to the full setup is configuration and infrastructure work, not a rewrite:

| Boundary | Adapter or switch |
|---|---|
| Host | One container image; configuration only from environment variables; health endpoints; platform details only in `infra/` and the deploy workflows |
| Database | Plain PostgreSQL 17, no provider-specific extensions; our own role bootstrap; no role needs `BYPASSRLS` (ADR-004, C9); an hourly provider-independent logical backup is the move path (ADR-022, C10) |
| Jobs | `bhq.jobs` wrapper over Procrastinate (ADR-006) |
| Keys | `KmsClient` adapter (`AwsKms`, `LocalKms`; others added as needed) and `rewrap_workspace_key` |
| Secrets | The app reads environment variables only; the platform injects them |
| Files and scanning | `bhq.files.storage` (S3 API with configurable endpoint) and a `MalwareScanner` adapter |
| Email out and in | django-anymail backend settings; one inbound webhook adapter per provider |
| SMS | `SmsClient` adapter; `PHONE_SIGNIN_COUNTRIES` (empty = off) |
| AI | Provider adapter inside `bhq.ai`; model per purpose in settings; switching needs the eval suite to pass |
| Monitoring | Sentry DSN, heartbeat URL, uptime monitor outside the host; logs to standard output |
| Edge | Outside the app (Cloudflare or a cloud WAF); client IP header is a setting |
| Validation phase | `BHQ_INVITE_ONLY` setting; deferred acceptance criteria flagged in `acs.yaml` (ADR-023) |

## Options considered
| Option | For | Against |
|---|---|---|
| **Cheapest qualifying provider per concern, with adapters (chosen)** | Lowest bill now; full setup later is configuration | A few more vendors to list and watch |
| Stay all-AWS as approved | One vendor, IAM roles everywhere | About 3–6 times the fixed bill at 1–10 creators (comparison §5) |
| Multi-cloud abstraction layer (Kubernetes, Terraform-only portability) | Maximum portability | Far more work than our size justifies; CR-001 says not to build one |

## Consequences
- The comparison document is the evidence for each choice and must be refreshed (new date) before any
  stage change.
- Code review checks that no provider SDK is imported outside its adapter (import-linter contracts).
- Adding a provider means adding it to the privacy page in the same change.
