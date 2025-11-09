from __future__ import annotations

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from .. import models
from ..security import create_access_token, hash_password, verify_password
from .base import BaseService
from .users import UserService


class AuthService(BaseService):
    """Authentication service implementing registration and login flows."""

    def register_user(self, user_in: models.UserCreate) -> models.UserRead:
        existing = self.session.exec(select(models.User).where(models.User.email == user_in.email)).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user = models.User(**user_in.model_dump(exclude={"password"}))
        user.hashed_password = hash_password(user_in.password)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        if user.role == models.Role.EMPLOYEE:
            profile = models.EmployeeProfile(user_id=user.id)
            self.session.add(profile)
            self.session.commit()
            self.session.refresh(profile)
        elif user.role == models.Role.SUPERVISOR:
            profile = models.SupervisorProfile(user_id=user.id)
            self.session.add(profile)
            self.session.commit()
            self.session.refresh(profile)
        return UserService(self.session).serialize_user(user)

    def login(self, form_data: OAuth2PasswordRequestForm) -> dict[str, str]:
        user = self.session.exec(select(models.User).where(models.User.email == form_data.username)).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect username or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive account")
        token = create_access_token(user.email)
        return {"access_token": token, "token_type": "bearer"}
