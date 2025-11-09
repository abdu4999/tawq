from __future__ import annotations

from typing import List

from fastapi import HTTPException
from sqlmodel import select

from .. import models
from .base import BaseService


class TaskService(BaseService):
    """Service layer encapsulating task operations."""

    def ensure_can_manage(self, user: models.User) -> None:
        if user.role not in {models.Role.ADMIN, models.Role.SUPERVISOR}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    def create_task(self, payload: models.TaskBase, current_user: models.User) -> models.Task:
        self.ensure_can_manage(current_user)
        task = models.Task(**payload.model_dump(), creator_id=current_user.id)
        return self.add_and_commit(task)

    def list_tasks(self, project_id: int | None, current_user: models.User) -> List[models.Task]:
        statement = select(models.Task)
        if project_id:
            statement = statement.where(models.Task.project_id == project_id)
        tasks = self.session.exec(statement).all()
        if current_user.role == models.Role.EMPLOYEE:
            employee_id = current_user.employee_profile.id if current_user.employee_profile else None
            if employee_id is None:
                return []
            tasks = [
                task
                for task in tasks
                if task.owner_id == employee_id
                or any(log.employee_id == employee_id for log in task.logs)
            ]
        return tasks

    def assign_task(self, task_id: int, employee_id: int, current_user: models.User) -> models.Task:
        self.ensure_can_manage(current_user)
        task = self.session.get(models.Task, task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        employee = self.session.get(models.EmployeeProfile, employee_id)
        if not employee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        task.owner_id = employee_id
        return self.add_and_commit(task)

    def add_task_log(
        self, task_id: int, payload: models.TaskLogCreate, current_user: models.User
    ) -> models.TaskLog:
        task = self.session.get(models.Task, task_id)
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
        self.session.add(log)
        self.session.add(task)
        self.session.commit()
        self.session.refresh(log)
        return log

    def update_status(
        self, task_id: int, status_update: models.TaskStatusUpdate, current_user: models.User
    ) -> models.Task:
        task = self.session.get(models.Task, task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        if current_user.role == models.Role.EMPLOYEE:
            employee_profile = current_user.employee_profile
            if not employee_profile or task.owner_id != employee_profile.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        task.status = status_update.status
        return self.add_and_commit(task)
