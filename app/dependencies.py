from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from . import models
from .db import get_session
from .security import CredentialsException, decode_access_token, oauth2_scheme
from .services.analytics import AnalyticsService
from .services.auth import AuthService
from .services.projects import ProjectService
from .services.tasks import TaskService
from .services.users import UserService

SessionDep = Annotated[Session, Depends(get_session)]


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(session)


def get_user_service(session: SessionDep) -> UserService:
    return UserService(session)


def get_project_service(session: SessionDep) -> ProjectService:
    return ProjectService(session)


def get_task_service(session: SessionDep) -> TaskService:
    return TaskService(session)


def get_analytics_service(session: SessionDep) -> AnalyticsService:
    return AnalyticsService(session)


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
