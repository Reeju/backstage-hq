from .production import *  # noqa: F403

# HSTS preload is deferred until the production domain is final; owner decision 2026-11-11.
# Silences only that warning; the rest of `check --deploy` stays strict.
SILENCED_SYSTEM_CHECKS = ["security.W021"]
