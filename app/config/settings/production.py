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
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# TLS ends at the load balancer / platform proxy.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
