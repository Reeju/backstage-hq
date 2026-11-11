import sys
from collections.abc import Iterable

from django.apps import apps
from django.db.migrations.loader import MigrationLoader
from django.test import override_settings


def bhq_apps_without_migrations(
    app_names: Iterable[tuple[str, str]], migrated: set[str]
) -> list[str]:
    """Labels of `bhq.*` apps (given as (name, label)) that Django does not see as migrated."""
    return [label for name, label in app_names if name.startswith("bhq.") and label not in migrated]


def test_every_bhq_app_has_migrations():
    """`makemigrations --check` silently skips apps without a usable migrations package."""
    migrated = MigrationLoader(None, ignore_no_migrations=True).migrated_apps
    installed = [(c.name, c.label) for c in apps.get_app_configs()]
    assert bhq_apps_without_migrations(installed, migrated) == []


def test_check_catches_migrations_folder_without_init(tmp_path):
    pkg = tmp_path / "bhq_fake_app"
    (pkg / "migrations").mkdir(parents=True)
    (pkg / "__init__.py").write_text("")
    (pkg / "migrations" / "0001_initial.py").write_text("")  # no migrations/__init__.py
    sys.path.insert(0, str(tmp_path))
    try:
        # A folder without __init__.py is a namespace package, which Django's loader treats as
        # "unmigrated". Point a real app at it and check the loader (and so our test) sees that.
        with override_settings(MIGRATION_MODULES={"contenttypes": "bhq_fake_app.migrations"}):
            migrated = MigrationLoader(None, ignore_no_migrations=True).migrated_apps
        assert "contenttypes" not in migrated
        assert bhq_apps_without_migrations([("bhq.fake", "contenttypes")], migrated) == [
            "contenttypes"
        ]
    finally:
        sys.path.remove(str(tmp_path))
        for name in [n for n in sys.modules if n.startswith("bhq_fake_app")]:
            del sys.modules[name]
