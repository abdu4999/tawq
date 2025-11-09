from __future__ import annotations

from typing import List

from fastapi import HTTPException
from sqlmodel import select

from .. import models
from .base import BaseService


class ProjectService(BaseService):
    """Service layer for project domain logic."""

    def ensure_manager(self, user: models.User) -> None:
        if user.role not in {models.Role.ADMIN, models.Role.SUPERVISOR}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager access required")

    def create_project(self, payload: models.ProjectBase, current_user: models.User) -> models.Project:
        self.ensure_manager(current_user)
        db_project = models.Project(**payload.model_dump(), owner_id=current_user.id)
        return self.add_and_commit(db_project)

    def list_projects(self, current_user: models.User) -> List[models.Project]:
        if current_user.role == models.Role.EMPLOYEE:
            employee = current_user.employee_profile
            if not employee:
                return []
            assignment_ids = [assignment.project_id for assignment in employee.assignments]
            if not assignment_ids:
                return []
            return (
                self.session.exec(select(models.Project).where(models.Project.id.in_(assignment_ids))).all()
            )
        return self.session.exec(select(models.Project)).all()

    def assign_employee(
        self, project_id: int, payload: models.ProjectAssignmentCreate, current_user: models.User
    ) -> models.ProjectAssignment:
        self.ensure_manager(current_user)
        project = self.session.get(models.Project, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        employee = self.session.get(models.EmployeeProfile, payload.employee_id)
        if not employee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        assignment = models.ProjectAssignment(
            project_id=project_id,
            employee_id=payload.employee_id,
            role_description=payload.role_description,
        )
        return self.add_and_commit(assignment)

    def get_project(self, project_id: int, current_user: models.User) -> models.Project:
        project = self.session.get(models.Project, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if current_user.role == models.Role.EMPLOYEE:
            employee_profile = current_user.employee_profile
            if not employee_profile or not any(
                assignment.employee_id == employee_profile.id for assignment in project.assignments
            ):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return project
