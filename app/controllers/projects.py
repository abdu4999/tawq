from __future__ import annotations

from typing import Annotated, List

from fastapi import APIRouter, Depends

from .. import models
from ..dependencies import get_current_active_user, get_project_service
from ..services.projects import ProjectService


class ProjectController:
    """Controller responsible for project endpoints following the MVC pattern."""

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/projects", tags=["projects"])
        self.router.post("/", response_model=models.Project)(self.create_project)
        self.router.get("/", response_model=List[models.Project])(self.list_projects)
        self.router.post("/{project_id}/assign", response_model=models.ProjectAssignment)(self.assign_employee)
        self.router.get("/{project_id}", response_model=models.Project)(self.get_project)

    def create_project(
        self,
        project: models.ProjectBase,
        project_service: Annotated[ProjectService, Depends(get_project_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.Project:
        return project_service.create_project(project, current_user)

    def list_projects(
        self,
        project_service: Annotated[ProjectService, Depends(get_project_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> List[models.Project]:
        return project_service.list_projects(current_user)

    def assign_employee(
        self,
        project_id: int,
        payload: models.ProjectAssignmentCreate,
        project_service: Annotated[ProjectService, Depends(get_project_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.ProjectAssignment:
        return project_service.assign_employee(project_id, payload, current_user)

    def get_project(
        self,
        project_id: int,
        project_service: Annotated[ProjectService, Depends(get_project_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> models.Project:
        return project_service.get_project(project_id, current_user)


def get_controller() -> ProjectController:
    return ProjectController()
