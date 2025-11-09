from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Tawq Impact Platform"
    database_url: str = "sqlite:///./tawq.db"
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    supabase_db_url: Optional[str] = None
    access_token_secret: str = "change-me"
    access_token_expire_minutes: int = 60 * 24

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def resolved_database_url(self) -> str:
        """Return the database URL with Supabase taking precedence when configured."""

        if self.supabase_db_url:
            return self.supabase_db_url
        return self.database_url


@lru_cache()
def get_settings() -> Settings:
    return Settings()
