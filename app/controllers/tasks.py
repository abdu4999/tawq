from __future__ import annotations

from typing import Annotated, List

from fastapi import APIRouter, Depends, status

from .. import models
from ..dependencies import get_current_active_user, get_task_service
from ..services.tasks import TaskService


class TaskController:
    """Controller that exposes task endpoints via the service layer."""

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/tasks", tags=["tasks"])
        self.router.post("/", response_model=models.Task)(self.create_task)
        self.router.get("/", response_model=List[models.Task])(self.list_tasks)
        self.router.post("/{task_id}/assign", response_model=models.Task)(self.assign_task)
        self.router.post(
            "/{task_id}/logs",
            response_model=models.TaskLog,
            status_code=status.HTTP_201_CREATED,
        )(self.add_task_log)
        self.router.post("/{task_id}/status", response_model=models.Task)(self.update_status)

    def create_task(
        self,
        payload: models.TaskBase,
        task_service: Annotated[TaskService, Depends(get_task_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.Task:
        return task_service.create_task(payload, current_user)

    def list_tasks(
        self,
        project_id: int | None = None,
        task_service: Annotated[TaskService, Depends(get_task_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> List[models.Task]:
        return task_service.list_tasks(project_id, current_user)

    def assign_task(
        self,
        task_id: int,
        employee_id: int,
        task_service: Annotated[TaskService, Depends(get_task_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.Task:
        return task_service.assign_task(task_id, employee_id, current_user)

    def add_task_log(
        self,
        task_id: int,
        payload: models.TaskLogCreate,
        task_service: Annotated[TaskService, Depends(get_task_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.TaskLog:
        return task_service.add_task_log(task_id, payload, current_user)

    def update_status(
        self,
        task_id: int,
        status_update: models.TaskStatusUpdate,
        task_service: Annotated[TaskService, Depends(get_task_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.Task:
        return task_service.update_status(task_id, status_update, current_user)


def get_controller() -> TaskController:
    return TaskController()
