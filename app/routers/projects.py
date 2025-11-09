from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .. import models
from ..dependencies import get_current_active_user
from ..db import get_session

router = APIRouter(prefix="/projects", tags=["projects"])


def ensure_manager(user: models.User) -> None:
    if user.role not in {models.Role.ADMIN, models.Role.SUPERVISOR}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager access required")


@router.post("/", response_model=models.Project)
def create_project(
    project: models.ProjectBase,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_manager(current_user)
    db_project = models.Project(**project.model_dump(), owner_id=current_user.id)
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project


@router.get("/", response_model=List[models.Project])
def list_projects(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    if current_user.role == models.Role.EMPLOYEE:
        employee = current_user.employee_profile
        if not employee:
            return []
        assignment_ids = [assignment.project_id for assignment in employee.assignments]
        if not assignment_ids:
            return []
        return session.exec(select(models.Project).where(models.Project.id.in_(assignment_ids))).all()
    return session.exec(select(models.Project)).all()


@router.post("/{project_id}/assign", response_model=models.ProjectAssignment)
def assign_employee(
    project_id: int,
    payload: models.ProjectAssignmentCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_manager(current_user)
    project = session.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    employee = session.get(models.EmployeeProfile, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    assignment = models.ProjectAssignment(
        project_id=project_id,
        employee_id=payload.employee_id,
        role_description=payload.role_description,
    )
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    return assignment


@router.get("/{project_id}", response_model=models.Project)
def get_project(
    project_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    project = session.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if current_user.role == models.Role.EMPLOYEE:
        if not any(a.employee_id == current_user.employee_profile.id for a in project.assignments):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return project
