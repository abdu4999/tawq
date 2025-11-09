from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from . import models
from .db import get_session
from .security import CredentialsException, decode_access_token, oauth2_scheme

SessionDep = Annotated[Session, Depends(get_session)]


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep) -> models.User:
    from sqlmodel import select

    email = decode_access_token(token)
    statement = select(models.User).where(models.User.email == email)
    user = session.exec(statement).first()
    if not user or not user.is_active:
        raise CredentialsException()
    return user


def get_current_active_user(current_user: Annotated[models.User, Depends(get_current_user)]) -> models.User:
    if not current_user.is_active:
        raise CredentialsException()
    return current_user
