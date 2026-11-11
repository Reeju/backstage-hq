# ADR-001: Modular monolith in Python/Django with server-rendered HTMX pages

**Status:** Accepted (approved with the architecture, commit 1abed76)

## Context
BackstageHQ is a phone-first web app (NFR-007: usable in 3 s on a mid-range Android over 4G) built by
a small team of AI builders and read by a non-programmer owner. It needs sign-in, sessions, forms,
an admin area, reversible migrations (playbook rule) and heavy document work (PDF invoices, bank
statements, AIS files, Excel exports). A native app may come later (D39).

## Decision
One Django 5.2 LTS project in `app/`, split into modules that own their tables (see §5). Screens are
rendered on the server and made interactive with HTMX and a little Alpine.js. Tailwind for CSS. The
app is an installable web app (PWA) for push. Python 3.13.

## Options considered
| Option | For | Against |
|---|---|---|
| **Django + HTMX (chosen)** | Most readable code; sign-in, CSRF, admin, reversible migrations built in; best PDF/Excel/statement libraries; small pages load fast on phones; Stage 3 HTML mockups become templates almost directly | Rich interactions need care; fewer ready-made UI components than React |
| TypeScript + Next.js/React | One language front and back; huge component ecosystem | More moving parts (server components, caching rules); popular ORMs (Prisma) have no down-migrations; weaker document libraries |
| Django API + React SPA | Ready for a native app | Two codebases and two languages for a small team; slower first load on phones |
| Microservices | Independent scaling | Far too much operations work for this scale |

## Consequences
- Good: one language, one deployable, fast pages, the owner can read the code.
- Cost: a JSON API (`/api/v1`, Django Ninja) must be added when a native app or brand portal arrives.
  This is cheap because all logic lives in Actions and Selectors, not in views (ADR-007).
- Lock-in: changing language later means a rewrite. Django is among the most widely used frameworks,
  so this risk is low.
- If wrong: if HTMX cannot deliver a screen well, that one screen can use a small embedded JS
  component without changing the rest.
