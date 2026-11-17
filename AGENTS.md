# BackstageHQ — The Business OS for Creators

SaaS for creators who work solo or without a professional team. BackstageHQ runs the business side
of a creator's work (leads and enquiries, brand deals, contracts, invoicing and payment follow-up,
tax, scheduling, email) and uses automation and AI to take that admin off their plate, so they can
spend their time on content. The user is the creator themselves, not an agency or brand managing
many creators. Target market, pricing and first wedge are still to be settled in Stage 1.

The product owner is not a programmer but reads code: explain decisions in plain language, show
diffs, and never skip the review gate.

## Where things live
- `docs/PLAYBOOK.md` — the stage-by-stage delivery flow. Follow it.
- `docs/01-usecases/` `docs/02-prd/` `docs/03-architecture/` `docs/04-design/` — approved inputs.
- `docs/iterations/NN-<name>/` — plan, tickets and review notes for each build iteration.
- Code goes in `app/` once Stage 5 starts.

A later stage never contradicts an approved earlier document. If it must, stop and propose an
edit to the earlier document first.

## Model routing (cost policy)

Prices per million tokens: Opus 5.5 $4 in / $20 out, Sonnet 5.5 $2 / $10, Haiku 5.5 $0.10 / $0.50.
Cache reads cost the same on Opus and Sonnet, and caches are per model, so the cheapest pattern
is: keep this main conversation on one model, and send work to subagents at the right tier.

| Tier | Model | Use for | Subagents |
|---|---|---|---|
| A — think | Opus | Brainstorming, use cases, PRD, architecture, data model, auth/permissions/payments/PII, a bug that survived two fix attempts, pre-merge review | `product-strategist`, `architect`, `reviewer` |
| B — build | Sonnet | Implementing a ticket that has acceptance criteria, UI from an approved mockup, tests, migrations that follow the approved schema | `builder`, `ux-designer`, `test-writer` |
| C — fetch | Haiku | Finding files, summarizing code/logs/docs, changelogs, READMEs, renames, boilerplate | `scout`, `doc-writer` |

Rules:
1. Decide the tier before starting. A `[router]` hint may be injected into the prompt; treat it as
   a suggestion and override it when the task says otherwise.
2. Do not read many files yourself to answer a question. Send a `scout` and work from its summary.
3. Escalate B → A when a builder fails the same acceptance criterion twice, or when the ticket
   turns out to need a design decision that no approved doc covers.
4. De-escalate A → B as soon as a decision is written down. Opus decides; Sonnet types.
5. Subagents return short summaries (what changed, files, open questions), never full file dumps.
6. Every iteration ends with the `reviewer` (Opus). Cheap building is only safe with an expensive gate.
7. Start a fresh conversation (`/clear`) between tickets; carry state in the iteration docs, not chat.
