# Iteration 01: how to run the build (Claude Code)

Written 2026-11-11, after the plan and CR-001 changes were approved. One ticket per fresh session.

## Before the first session
- Docker Desktop running (`docker info` works). `uv` is installed; T-01 needs Python 3.13
  (`uv python install 3.13` if uv does not fetch it by itself).
- No accounts are needed for T-00 to T-01. GitHub is needed from T-02 (CI).

## Each session
1. Start a new session in Claude Code, in this project folder, on the `main` branch (or `/clear`).
2. Type `/build docs/iterations/01-walking-skeleton/T-NN.md` with the next ticket.
3. The command sends a tier B ticket to the `builder` (Sonnet) and a tier A ticket to the `architect`
   (Opus), then runs the `reviewer` (Opus). On APPROVE it appends to `log.md` in this folder and
   commits "<ticket id>: <ticket title>".
4. Read the result and the diff it shows, then `/clear` before the next ticket.

## Ticket order (plan section 6)
1. T-00: mark the architecture, ADR-001 to ADR-020 and the new ADR-021 to ADR-023 Accepted (C1–C13
   were approved 2026-11-11; ADR-002 stays "Superseded by ADR-022"). Docs only.
2. T-01: project skeleton (`docker compose up` works locally).
3. T-04 (tier A): workspaces and row-level security. Must come before any `migrate`.
4. Then, one at a time: T-02, T-03, T-09 (needs GitHub for T-02), T-05, T-07, T-08, T-06,
   T-13, T-12, T-10, T-11, T-18, T-14.
5. Infrastructure once accounts exist: T-17 spike Q-H1, then T-15, then T-16.
6. Close the iteration with `/review`.

## Owner items still open
- GQ7: the monthly spending cap (planning figure about Rs 2,800 a month for V0, with GST).
- Q-H2: apply for zero-data retention on Anthropic before V1.
- Accounts in plan section 11: GitHub before T-02; DigitalOcean, AWS, Cloudflare and a domain before
  T-17 Q-H1 and T-15; Sentry, Better Stack and Healthchecks.io before T-16.
