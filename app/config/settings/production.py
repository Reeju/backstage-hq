from .base import *  # noqa: F403
from .base import env

DEBUG = False
# No default: a missing DATABASE_URL must fail loudly.
DATABASES = {"default": env.db("DATABASE_URL")}
SECRET_KEY = env("SECRET_KEY")  # required, no default
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# HSTS preload is deferred until the production domain is final; owner decision 2026-11-11.
# Silences only that warning; the rest of `check --deploy` stays strict.
SILENCED_SYSTEM_CHECKS = ["security.W021"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# TLS ends at the load balancer / platform proxy.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
