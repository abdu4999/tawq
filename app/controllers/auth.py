from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from .. import models
from ..dependencies import get_auth_service
from ..services.auth import AuthService


class AuthController:
    """Controller coordinating authentication endpoints with the service layer."""

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/auth", tags=["auth"])
        self.router.post(
            "/register",
            response_model=models.UserRead,
            status_code=status.HTTP_201_CREATED,
        )(self.register_user)
        self.router.post("/token")(self.login)

    def register_user(
        self,
        user_in: models.UserCreate,
        auth_service: Annotated[AuthService, Depends(get_auth_service)],
    ) -> models.UserRead:
        return auth_service.register_user(user_in)

    def login(
        self,
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        auth_service: Annotated[AuthService, Depends(get_auth_service)],
    ) -> dict[str, str]:
        return auth_service.login(form_data)


def get_controller() -> AuthController:
    return AuthController()
