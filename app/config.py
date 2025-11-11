from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Optional


@dataclass
class Settings:
    app_name: str = "Tawq Impact Platform"
    database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./tawq.db"))
    access_token_expire_minutes: int = field(default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")))
    supabase_url: Optional[str] = field(default_factory=lambda: os.getenv("SUPABASE_URL"))
    supabase_anon_key: Optional[str] = field(default_factory=lambda: os.getenv("SUPABASE_ANON_KEY"))
    supabase_service_role_key: Optional[str] = field(default_factory=lambda: os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
    supabase_db_url: Optional[str] = field(default_factory=lambda: os.getenv("SUPABASE_DB_URL"))

    @property
    def resolved_database_url(self) -> str:
        if self.supabase_db_url:
            return self.supabase_db_url
        return self.database_url


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
