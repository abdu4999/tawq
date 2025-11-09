from __future__ import annotations

from typing import Annotated, List

from fastapi import APIRouter, Depends

from .. import models
from ..dependencies import get_current_active_user, get_user_service
from ..services.users import UserService


class UserController:
    """User controller bridging HTTP routes with the user service."""

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/users", tags=["users"])
        self.router.get("/me", response_model=models.UserRead)(self.read_current_user)
        self.router.get("/", response_model=List[models.UserRead])(self.list_users)
        self.router.patch("/{user_id}", response_model=models.UserRead)(self.update_user)
        self.router.post("/{user_id}/activate", response_model=models.UserRead)(self.activate_user)
        self.router.post("/{user_id}/deactivate", response_model=models.UserRead)(self.deactivate_user)

    def read_current_user(
        self,
        user_service: Annotated[UserService, Depends(get_user_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.UserRead:
        return user_service.read_current_user(current_user)

    def list_users(
        self,
        user_service: Annotated[UserService, Depends(get_user_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> List[models.UserRead]:
        user_service.ensure_admin(current_user)
        return user_service.list_users()

    def update_user(
        self,
        user_id: int,
        payload: models.UserUpdate,
        user_service: Annotated[UserService, Depends(get_user_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.UserRead:
        user_service.ensure_admin(current_user)
        return user_service.update_user(user_id, payload)

    def activate_user(
        self,
        user_id: int,
        user_service: Annotated[UserService, Depends(get_user_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.UserRead:
        user_service.ensure_admin(current_user)
        return user_service.activate_user(user_id, True)

    def deactivate_user(
        self,
        user_id: int,
        user_service: Annotated[UserService, Depends(get_user_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.UserRead:
        user_service.ensure_admin(current_user)
        return user_service.activate_user(user_id, False)


def get_controller() -> UserController:
    return UserController()
