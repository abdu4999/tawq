from __future__ import annotations

import hashlib
import secrets
import time
from typing import Iterable, Optional

from fastapi import HTTPException, status

from .config import get_settings
from .db import get_db
from .models import Role, User


class CredentialsException(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


_token_store: dict[str, tuple[str, float]] = {}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    settings = get_settings()
    expiry_minutes = expires_minutes or settings.access_token_expire_minutes
    token = secrets.token_hex(16)
    _token_store[token] = (subject, time.time() + expiry_minutes * 60)
    return token


def decode_access_token(token: str) -> str:
    record = _token_store.get(token)
    if not record:
        raise CredentialsException()
    subject, expires_at = record
    if time.time() > expires_at:
        _token_store.pop(token, None)
        raise CredentialsException()
    return subject


def get_current_user(headers: dict[str, str]) -> User:
    auth_header = headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise CredentialsException()
    token = auth_header.split(" ", 1)[1]
    email = decode_access_token(token)
    user = get_db().get_user_by_email(email)
    if not user or not user.is_active:
        raise CredentialsException()
    return user


def require_roles(user: User, roles: Iterable[Role]) -> None:
    if user.role not in roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
