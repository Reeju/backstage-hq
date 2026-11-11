from unittest import mock

import pytest
from django.test import Client


@pytest.fixture
def client() -> Client:
    return Client()


def test_health_live_returns_ok(client: Client) -> None:
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.django_db
def test_health_ready_ok_when_db_up_and_migrated(
    client: Client, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("GIT_SHA", "abc123")
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "commit": "abc123"}


@pytest.mark.django_db
def test_health_ready_503_when_migrations_pending(client: Client) -> None:
    with mock.patch(
        "config.health.MigrationExecutor.migration_plan", return_value=[("app", "0001")]
    ):
        response = client.get("/health/ready")
    assert response.status_code == 503
    assert response.content == b'{"status":"unavailable","reason":"migrations"}'


def test_health_ready_503_when_database_down(client: Client) -> None:
    with mock.patch("config.health.connection.cursor", side_effect=RuntimeError("boom")):
        response = client.get("/health/ready")
    assert response.status_code == 503
    assert response.content == b'{"status":"unavailable","reason":"database"}'


def test_admin_not_routed(client: Client) -> None:
    assert client.get("/admin/").status_code == 404
    assert client.get("/admin/login/").status_code == 404


@pytest.mark.parametrize("path", ["/health/live", "/health/ready"])
def test_health_rejects_post(client: Client, path: str) -> None:
    assert client.post(path).status_code == 405
