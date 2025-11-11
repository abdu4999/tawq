from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from .models import (
    EmployeeProfile,
    Project,
    ProjectAssignment,
    Role,
    SupervisorProfile,
    Task,
    TaskLog,
    User,
)


@dataclass
class Database:
    users: Dict[int, User] = field(default_factory=dict)
    users_by_email: Dict[str, int] = field(default_factory=dict)
    employee_profiles: Dict[int, EmployeeProfile] = field(default_factory=dict)
    supervisor_profiles: Dict[int, SupervisorProfile] = field(default_factory=dict)
    projects: Dict[int, Project] = field(default_factory=dict)
    assignments: Dict[int, ProjectAssignment] = field(default_factory=dict)
    tasks: Dict[int, Task] = field(default_factory=dict)
    task_logs: Dict[int, TaskLog] = field(default_factory=dict)
    _counters: Dict[str, int] = field(default_factory=dict)

    def reset(self) -> None:
        self.users.clear()
        self.users_by_email.clear()
        self.employee_profiles.clear()
        self.supervisor_profiles.clear()
        self.projects.clear()
        self.assignments.clear()
        self.tasks.clear()
        self.task_logs.clear()
        self._counters = {
            "user": 1,
            "employee_profile": 1,
            "supervisor_profile": 1,
            "project": 1,
            "assignment": 1,
            "task": 1,
            "task_log": 1,
        }

    # Utilities ---------------------------------------------------------

    def _next_id(self, key: str) -> int:
        current = self._counters[key]
        self._counters[key] += 1
        return current

    # User management ---------------------------------------------------

    def create_user(self, *, email: str, full_name: str, role: Role, password_hash: str, is_active: bool) -> User:
        if email in self.users_by_email:
            raise ValueError("Email already registered")
        user = User(
            id=self._next_id("user"),
            email=email,
            full_name=full_name,
            role=role,
            is_active=is_active,
            hashed_password=password_hash,
        )
        self.users[user.id] = user
        self.users_by_email[email] = user.id
        if role == Role.EMPLOYEE:
            profile = EmployeeProfile(id=self._next_id("employee_profile"), user_id=user.id)
            self.employee_profiles[profile.id] = profile
            user.employee_profile_id = profile.id
        elif role == Role.SUPERVISOR:
            profile = SupervisorProfile(id=self._next_id("supervisor_profile"), user_id=user.id)
            self.supervisor_profiles[profile.id] = profile
            user.supervisor_profile_id = profile.id
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        user_id = self.users_by_email.get(email)
        if user_id is None:
            return None
        return self.users[user_id]

    def get_user(self, user_id: int) -> Optional[User]:
        return self.users.get(user_id)

    # Project management -----------------------------------------------

    def create_project(self, *, name: str, description: Optional[str], goal_amount: Optional[float], owner_id: Optional[int]) -> Project:
        project = Project(
            id=self._next_id("project"),
            name=name,
            description=description,
            goal_amount=goal_amount,
            owner_id=owner_id,
        )
        self.projects[project.id] = project
        return project

    def assign_employee_to_project(self, project_id: int, employee_id: int, role_description: Optional[str]) -> ProjectAssignment:
        project = self.projects[project_id]
        assignment = ProjectAssignment(
            id=self._next_id("assignment"),
            project_id=project_id,
            employee_id=employee_id,
            role_description=role_description,
        )
        self.assignments[assignment.id] = assignment
        project.assignments.append(assignment.id)
        return assignment

    # Task management ---------------------------------------------------

    def create_task(
        self,
        *,
        title: str,
        description: Optional[str],
        priority: int,
        target_revenue: Optional[float],
        project_id: Optional[int],
        creator_id: Optional[int],
    ) -> Task:
        task = Task(
            id=self._next_id("task"),
            title=title,
            description=description,
            priority=priority,
            target_revenue=target_revenue,
            project_id=project_id,
            creator_id=creator_id,
        )
        self.tasks[task.id] = task
        if project_id:
            project = self.projects.get(project_id)
            if project:
                project.tasks.append(task.id)
        return task

    def assign_task(self, task_id: int, employee_id: int) -> Task:
        task = self.tasks[task_id]
        task.owner_id = employee_id
        return task

    def add_task_log(
        self,
        *,
        task_id: int,
        employee_id: int,
        note: Optional[str],
        revenue: Optional[float],
        blockers: Optional[str],
        needs: Optional[str],
    ) -> TaskLog:
        task = self.tasks[task_id]
        log = TaskLog(
            id=self._next_id("task_log"),
            task_id=task_id,
            employee_id=employee_id,
            note=note,
            revenue=revenue,
            blockers=blockers,
            needs=needs,
        )
        self.task_logs[log.id] = log
        task.logs.append(log.id)
        if revenue:
            task.current_revenue += float(revenue)
        return log


database = Database()
database.reset()


def init_db() -> None:
    database.reset()


def get_db() -> Database:
    return database
