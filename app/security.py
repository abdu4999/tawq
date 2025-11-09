from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
settings = get_settings()


class CredentialsException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    expire_delta = timedelta(minutes=expires_minutes or settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": datetime.utcnow() + expire_delta}
    return jwt.encode(payload, settings.access_token_secret, algorithm="HS256")


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.access_token_secret, algorithms=["HS256"])
    except JWTError as exc:
        raise CredentialsException() from exc
    subject = payload.get("sub")
    if subject is None:
        raise CredentialsException()
    return subject
