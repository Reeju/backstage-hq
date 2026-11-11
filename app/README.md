# BackstageHQ app

Django 5.2 + HTMX, Python 3.13, managed with [uv](https://docs.astral.sh/uv/).

## Run locally (Docker)

1. Install Docker Desktop.
2. In this folder (`app/`): `docker compose up`
3. Open http://localhost:8000/health/live (expect `{"status":"ok"}`) and
   http://localhost:8000/health/ready (expect `"status":"ok"` once the database is up).
4. Test emails appear in Mailpit at http://localhost:8025.
5. Stop with `docker compose down` (add `-v` to also delete the local database).

If port 5432 or 8000 is already used on your machine, run e.g. `DB_PORT=5433 WEB_PORT=8001 docker compose up` instead.

## Run checks and tests (without Docker for the app)

1. `docker compose up -d db` (tests need the local database).
2. `uv sync --frozen`
3. `uv run ruff check`
4. `uv run mypy .`
5. `uv run pytest`

If you changed `DB_PORT`, also set `DATABASE_URL=postgres://bhq:bhq@localhost:<port>/bhq`.

## Styles

Tailwind runs as a standalone binary (no Node), downloaded and checksum-verified in the
`Dockerfile`. Output goes to `static/build/app.css` and is served by WhiteNoise.
