# Delivery playbook — building BackstageHQ with AI agents

The owner decides, the agents produce, and nothing moves to the next stage until the
owner approves the document it depends on. Each stage has one command, one output and one gate.

| # | Stage | Command | Model | Output | Gate (you approve) |
|---|---|---|---|---|---|
| 0 | Setup | — | — | git repo, this harness | Repo exists, `/cost` runs |
| 1 | Discovery & use cases | `/usecases <notes>` | Opus | `docs/01-usecases/use-cases.md` | Personas and use cases match how your business really works |
| 2 | PRD | `/prd` | Opus | `docs/02-prd/PRD.md` | MVP scope, permission matrix, acceptance criteria |
| 3 | Design mockups | `/mockups` | Sonnet | `docs/04-design/` clickable HTML | Click through every MVP screen |
| 4 | Architecture | `/architecture <constraints>` | Opus | `docs/03-architecture/` + ADRs | Stack, hosting, data model, cost of running it |

Mockups come before architecture so you can see the product early and fix the PRD while
changes are cheap; the architecture is then designed for the screens you approved. (The
folder numbers `03-architecture` / `04-design` are just names.) Every stage commits its
output to git when you approve it.
| 5 | Build iterations | `/plan-iteration 1 <goal>` then `/build <ticket>` per ticket | Opus plans, Sonnet builds | `docs/iterations/01-*/`, code in `app/` | The demo listed in the plan works |
| 6 | Review & harden | `/review docs/iterations/01-*` | Opus | `review.md` | Verdict APPROVE, no blocking findings |
| 7 | Release | deploy to staging, then production | Sonnet | release notes | You test staging yourself |

Repeat 5–7 for each iteration. Typical sequence for a creator admin:
1. Auth, organisations, roles and the audit log (the skeleton everything hangs on)
2. Creator directory: profiles, search, filters, bulk import
3. Onboarding and KYC / contract workflow
4. Campaigns and content approval
5. Payouts, invoices and tax documents
6. Analytics dashboards and exports
7. Hardening: SSO, rate limits, backups, load tests, accessibility pass

## Rules that keep quality high when you can't read every line
- **Small tickets.** One concern, a few files, finishes in one fresh session.
- **Tests are the contract.** Every acceptance criterion becomes a test; the builder runs them.
- **Expensive reviewer, cheap builder.** Every ticket passes the Opus `reviewer` before merge.
- **Commit per ticket** on a branch, so any bad change is one revert away.
- **Docs are the memory.** Decisions go into `docs/`, not chat. `/clear` between tickets.
- **Change requests go upstream.** A new idea mid-build updates the PRD first, then a ticket.
- **CI from iteration 1:** lint, type-check, tests and a dependency audit on every push.
- **Before real users:** an external security review and a backup/restore drill. AI review
  reduces risk; it does not replace a human sign-off for payouts and personal data.
