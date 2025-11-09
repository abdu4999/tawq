from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from .. import models
from ..db import get_session
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=models.UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: models.UserCreate, session: Annotated[Session, Depends(get_session)]):
    existing = session.exec(select(models.User).where(models.User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = models.User(**user_in.model_dump(exclude={"password"}))
    user.hashed_password = hash_password(user_in.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    employee_profile_id = None
    supervisor_profile_id = None
    if user.role == models.Role.EMPLOYEE:
        profile = models.EmployeeProfile(user_id=user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
        employee_profile_id = profile.id
    elif user.role == models.Role.SUPERVISOR:
        profile = models.SupervisorProfile(user_id=user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
        supervisor_profile_id = profile.id
    return models.UserRead(
        **user.model_dump(exclude={"hashed_password"}),
        id=user.id,
        employee_profile_id=employee_profile_id,
        supervisor_profile_id=supervisor_profile_id,
    )


@router.post("/token")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: Annotated[Session, Depends(get_session)]):
    user = session.exec(select(models.User).where(models.User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive account")
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}
