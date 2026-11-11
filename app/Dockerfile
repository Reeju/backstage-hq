# syntax=docker/dockerfile:1
ARG PYTHON_IMAGE=python:3.13-slim@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90

# ---- Stage 1: build the CSS with the Tailwind standalone CLI (no Node) ----
FROM ${PYTHON_IMAGE} AS tailwind
ARG TARGETARCH
ARG TAILWIND_VERSION=3.4.19
ARG TAILWIND_SHA256_ARM64=e5b2d27694daa80cc52ec29553ba2c6bd43d86bd51a9d633ed24058b9c05a676
ARG TAILWIND_SHA256_AMD64=4af3198c015616ea7d6617974ec3d70d987ecc00c1ca8463b0a30fd65cc7c06e
WORKDIR /build
RUN set -eu; \
    case "${TARGETARCH}" in \
      arm64) asset=tailwindcss-linux-arm64; sha="${TAILWIND_SHA256_ARM64}" ;; \
      amd64) asset=tailwindcss-linux-x64; sha="${TAILWIND_SHA256_AMD64}" ;; \
      *) echo "unsupported arch ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    python -c "import sys, urllib.request; urllib.request.urlretrieve(sys.argv[1], '/usr/local/bin/tailwindcss')" \
      "https://github.com/tailwindlabs/tailwindcss/releases/download/v${TAILWIND_VERSION}/${asset}"; \
    echo "${sha}  /usr/local/bin/tailwindcss" | sha256sum -c -; \
    chmod +x /usr/local/bin/tailwindcss
COPY tailwind ./tailwind
COPY bhq ./bhq
RUN tailwindcss -c tailwind/tailwind.config.js -i tailwind/input.css -o static/build/app.css --minify

# ---- Stage 2: shared Python base with uv ----
FROM ${PYTHON_IMAGE} AS base
COPY --from=ghcr.io/astral-sh/uv:0.10.11 /uv /usr/local/bin/uv
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_COMPILE_BYTECODE=0 \
    PATH="/opt/venv/bin:$PATH"
WORKDIR /app

# ---- Dev target (compose): includes dev dependencies, code is mounted ----
FROM base AS dev
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen
COPY . .

# ---- Final production image ----
FROM base AS final
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev
COPY . .
COPY --from=tailwind /build/static/build ./static/build
RUN DJANGO_SETTINGS_MODULE=config.settings.production \
    SECRET_KEY=build-only ALLOWED_HOSTS=localhost \
    DATABASE_URL=postgres://build:build@localhost:5432/build \
    python manage.py collectstatic --noinput
RUN useradd --system --uid 10001 --no-create-home bhq && chown -R bhq /app
USER bhq
ENV DJANGO_SETTINGS_MODULE=config.settings.production
EXPOSE 8000
CMD ["gunicorn", "config.wsgi", "--bind", "0.0.0.0:8000"]
