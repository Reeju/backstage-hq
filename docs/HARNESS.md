# Cost-routing harness

Goal: pay Opus prices only where Opus changes the outcome (thinking, deciding, reviewing) and
run the high-volume work (typing code, reading files) on Sonnet and Haiku.

## Pieces
| File | What it does |
|---|---|
| `.claude/settings.json` | Main session uses `opusplan`: Opus while in plan mode, Sonnet when executing. Registers the router hook. |
| `CLAUDE.md` → *Model routing* | The policy every session reads: tiers, escalation and de-escalation rules. |
| `.claude/agents/*.md` | Eight subagents, each pinned to a model and effort level (see below). |
| `.claude/commands/*.md` | One command per delivery stage; each delegates to the right subagent. |
| `.claude/hooks/route.py` | On every prompt, keyword-classifies it and injects a one-line tier hint. Silent when unsure. Logs to `.claude/router.log`. |
| `scripts/cost_report.py` / `/cost` | Spend by model and main-vs-subagent, plus what it would have cost all on Opus or all on Sonnet. |

| Agent | Model / effort | Job |
|---|---|---|
| `product-strategist` | Opus / high | Use cases, PRD, brainstorming |
| `architect` | Opus / high | Design, data model, iteration plans, stubborn bugs |
| `reviewer` | Opus / high | Quality and security gate on every ticket |
| `builder` | Sonnet / medium | Implement one ticket |
| `ux-designer` | Sonnet / medium | Clickable HTML mockups |
| `test-writer` | Sonnet / low | Tests from acceptance criteria |
| `scout` | Haiku / low | Read-only search and summaries |
| `doc-writer` | Haiku / low | READMEs, changelogs, renames |

## Why it is built this way
- **Opus 5.5 is only 2× Sonnet 5.5** ($4/$20 vs $2/$10 per MTok) and cache reads cost the same
  ($0.20). Haiku 5.5 is 20× cheaper than Sonnet. So the biggest saving is moving *reading* to
  Haiku and *keeping context small*, not avoiding Opus for thinking.
- **Caches are per model.** Switching the main session's model mid-conversation re-sends the
  whole context at full price. That is why routing happens through subagents (each has its own
  short context) and the main model only switches once, at the plan→execute boundary.
- **Effort is a second dial.** Lower effort means fewer thinking tokens on the same model;
  scouts and doc writers run at `low`, reviewers and architects at `high`.
- **Judge cost per finished ticket, not per call.** A Sonnet build that needs three review rounds
  can cost more than one good Opus attempt. Escalation rules in CLAUDE.md cap that.

## Tuning
1. Run `/cost` weekly. If `opus main` dominates, you are doing build work in plan mode or not
   delegating; if `cache read` is huge, conversations are running too long — `/clear` more.
2. Read `.claude/router.log` for prompts that got no tier (`null`) or the wrong one, and adjust
   the regexes in `route.py`.
3. If reviews keep sending Sonnet work back on a kind of ticket, label that kind tier A in
   iteration plans. If Opus reviews always approve first time, consider `effort: medium` for
   the reviewer.
4. To see which model the main session is on, or change it for one session, use the model picker.

Cost figures from `/cost` are API list-price estimates; on a Pro/Max subscription they show
relative usage, not your bill.
