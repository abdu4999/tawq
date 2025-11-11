from __future__ import annotations

from functools import lru_cache
from typing import Optional

from .config import get_settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Optional[dict[str, str]]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None
    return {
        "url": settings.supabase_url,
        "service_role_key": settings.supabase_service_role_key,
        "anon_key": settings.supabase_anon_key,
    }
