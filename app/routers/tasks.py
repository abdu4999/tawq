from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .. import models
from ..dependencies import get_current_active_user
from ..db import get_session

router = APIRouter(prefix="/tasks", tags=["tasks"])


def ensure_can_manage(user: models.User) -> None:
    if user.role not in {models.Role.ADMIN, models.Role.SUPERVISOR}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


@router.post("/", response_model=models.Task)
def create_task(
    payload: models.TaskBase,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_can_manage(current_user)
    task = models.Task(**payload.model_dump(), creator_id=current_user.id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("/", response_model=List[models.Task])
def list_tasks(
    project_id: int | None = None,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    statement = select(models.Task)
    if project_id:
        statement = statement.where(models.Task.project_id == project_id)
    tasks = session.exec(statement).all()
    if current_user.role == models.Role.EMPLOYEE:
        employee_id = current_user.employee_profile.id if current_user.employee_profile else None
        if employee_id is None:
            return []
        tasks = [task for task in tasks if task.owner_id == employee_id or any(log.employee_id == employee_id for log in task.logs)]
    return tasks


@router.post("/{task_id}/assign", response_model=models.Task)
def assign_task(
    task_id: int,
    employee_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    ensure_can_manage(current_user)
    task = session.get(models.Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    employee = session.get(models.EmployeeProfile, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    task.owner_id = employee_id
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.post("/{task_id}/logs", response_model=models.TaskLog, status_code=status.HTTP_201_CREATED)
def add_task_log(
    task_id: int,
    payload: models.TaskLogCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    task = session.get(models.Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role == models.Role.EMPLOYEE:
        employee_profile = current_user.employee_profile
        if not employee_profile or (task.owner_id and task.owner_id != employee_profile.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        employee_id = employee_profile.id
    else:
        employee_id = payload.employee_id or task.owner_id
        if not employee_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Employee required")
    log = models.TaskLog(
        task_id=task_id,
        employee_id=employee_id,
        note=payload.note,
        revenue=payload.revenue,
        blockers=payload.blockers,
        needs=payload.needs,
    )
    if payload.revenue:
        task.current_revenue += payload.revenue
    session.add(log)
    session.add(task)
    session.commit()
    session.refresh(log)
    return log


@router.post("/{task_id}/status", response_model=models.Task)
def update_status(
    task_id: int,
    status_update: models.TaskStatusUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    task = session.get(models.Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role == models.Role.EMPLOYEE:
        employee_profile = current_user.employee_profile
        if not employee_profile or task.owner_id != employee_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    task.status = status_update.status
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
