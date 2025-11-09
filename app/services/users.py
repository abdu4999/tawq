from __future__ import annotations

from typing import List

from fastapi import HTTPException, status
from sqlmodel import select

from .. import models
from .base import BaseService


class UserService(BaseService):
    """User domain service that exposes CRUD-style operations."""

    def ensure_admin(self, user: models.User) -> None:
        if user.role != models.Role.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    def serialize_user(self, user: models.User) -> models.UserRead:
        employee_profile_id = user.employee_profile.id if user.employee_profile else None
        supervisor_profile_id = user.supervisor_profile.id if user.supervisor_profile else None
        return models.UserRead(
            **user.model_dump(exclude={"hashed_password"}),
            id=user.id,
            employee_profile_id=employee_profile_id,
            supervisor_profile_id=supervisor_profile_id,
        )

    def read_current_user(self, current_user: models.User) -> models.UserRead:
        return self.serialize_user(current_user)

    def list_users(self) -> List[models.UserRead]:
        users = self.session.exec(select(models.User)).all()
        return [self.serialize_user(user) for user in users]

    def update_user(self, user_id: int, payload: models.UserUpdate) -> models.UserRead:
        user = self.session.get(models.User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(user, key, value)
        self.add_and_commit(user)
        return self.serialize_user(user)

    def activate_user(self, user_id: int, active: bool) -> models.UserRead:
        user = self.session.get(models.User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.is_active = active
        self.add_and_commit(user)
        return self.serialize_user(user)
