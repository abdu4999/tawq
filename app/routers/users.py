from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .. import models
from ..dependencies import get_current_active_user
from ..db import get_session

router = APIRouter(prefix="/users", tags=["users"])


def ensure_admin(user: models.User) -> None:
    if user.role != models.Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")


@router.get("/me", response_model=models.UserRead)
def read_current_user(current_user: Annotated[models.User, Depends(get_current_active_user)]):
    return _serialize_user(current_user)


@router.get("/", response_model=List[models.UserRead])
def list_users(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_admin(current_user)
    users = session.exec(select(models.User)).all()
    return [_serialize_user(user) for user in users]


@router.patch("/{user_id}", response_model=models.UserRead)
def update_user(
    user_id: int,
    payload: models.UserUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_admin(current_user)
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


@router.post("/{user_id}/activate", response_model=models.UserRead)
def activate_user(
    user_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_admin(current_user)
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    session.add(user)
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


@router.post("/{user_id}/deactivate", response_model=models.UserRead)
def deactivate_user(
    user_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_admin(current_user)
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    session.add(user)
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


def _serialize_user(user: models.User) -> models.UserRead:
    employee_profile_id = user.employee_profile.id if user.employee_profile else None
    supervisor_profile_id = user.supervisor_profile.id if user.supervisor_profile else None
    return models.UserRead(
        **user.model_dump(exclude={"hashed_password"}),
        id=user.id,
        employee_profile_id=employee_profile_id,
        supervisor_profile_id=supervisor_profile_id,
    )
