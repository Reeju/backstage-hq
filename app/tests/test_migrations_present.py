import importlib

from django.apps import apps


def test_every_bhq_app_has_a_migrations_module():
    """`makemigrations --check` silently skips apps without a migrations package."""
    for config in apps.get_app_configs():
        if config.name.startswith("bhq."):
            importlib.import_module(f"{config.name}.migrations")
