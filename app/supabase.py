"""Supabase client helpers for integrating with the Tawq backend."""

from functools import lru_cache
from typing import Optional

from supabase import Client, create_client

from .config import get_settings


@lru_cache()
def get_supabase_client() -> Optional[Client]:
    """Return a configured Supabase client if the environment provides credentials."""

    settings = get_settings()
    if not settings.supabase_url:
        return None

    api_key = settings.supabase_service_role_key or settings.supabase_anon_key
    if not api_key:
        return None

    return create_client(settings.supabase_url, api_key)


__all__ = ["get_supabase_client"]
