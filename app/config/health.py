"""Health endpoints used by the load balancer and the outside uptime check."""

import json
import os

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def live(request: HttpRequest) -> JsonResponse:
    """Process is up. Never touches the database."""
    return JsonResponse({"status": "ok"})


def _unavailable(reason: str) -> HttpResponse:
    body = json.dumps({"status": "unavailable", "reason": reason}, separators=(",", ":"))
    return HttpResponse(body, status=503, content_type="application/json")


@require_GET
def ready(request: HttpRequest) -> HttpResponse:
    """Database reachable and no unapplied migrations."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        return _unavailable("database")
    try:
        executor = MigrationExecutor(connection)
        pending = executor.migration_plan(executor.loader.graph.leaf_nodes())
    except Exception:
        return _unavailable("migrations")
    if pending:
        return _unavailable("migrations")
    return JsonResponse({"status": "ok", "commit": os.environ.get("GIT_SHA", "unknown")})
