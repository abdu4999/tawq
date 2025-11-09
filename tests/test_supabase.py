import app.config as app_config
import app.supabase as app_supabase


def test_resolved_database_url_prefers_supabase(monkeypatch):
    monkeypatch.setenv(
        "SUPABASE_DB_URL", "postgresql+psycopg://user:pass@host:5432/postgres"
    )
    app_config.get_settings.cache_clear()

    settings = app_config.get_settings()
    assert settings.resolved_database_url.startswith("postgresql+psycopg://")

    monkeypatch.delenv("SUPABASE_DB_URL", raising=False)
    app_config.get_settings.cache_clear()


def test_supabase_client_returns_none_without_configuration(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    monkeypatch.delenv("SUPABASE_ANON_KEY", raising=False)

    app_config.get_settings.cache_clear()
    app_supabase.get_supabase_client.cache_clear()

    assert app_supabase.get_supabase_client() is None
