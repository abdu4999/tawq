from __future__ import annotations

import enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional


class Role(str, enum.Enum):
    ADMIN = "admin"
    ACCOUNTANT = "accountant"
    SUPERVISOR = "supervisor"
    EMPLOYEE = "employee"


@dataclass
class User:
    id: int
    email: str
    full_name: str
    role: Role
    is_active: bool
    hashed_password: str
    avatar_url: Optional[str] = None
    employee_profile_id: Optional[int] = None
    supervisor_profile_id: Optional[int] = None

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role.value,
            "is_active": self.is_active,
            "avatar_url": self.avatar_url,
            "employee_profile_id": self.employee_profile_id,
            "supervisor_profile_id": self.supervisor_profile_id,
        }


@dataclass
class EmployeeProfile:
    id: int
    user_id: int
    monthly_target: Optional[float] = None
    yearly_target: Optional[float] = None
    strengths: Optional[str] = None
    opportunities: Optional[str] = None


@dataclass
class SupervisorProfile:
    id: int
    user_id: int
    team_members: List[int] = field(default_factory=list)


@dataclass
class Project:
    id: int
    name: str
    description: Optional[str]
    goal_amount: Optional[float]
    owner_id: Optional[int]
    assignments: List[int] = field(default_factory=list)
    tasks: List[int] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "goal_amount": self.goal_amount,
            "owner_id": self.owner_id,
        }


@dataclass
class ProjectAssignment:
    id: int
    project_id: int
    employee_id: int
    role_description: Optional[str] = None

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "project_id": self.project_id,
            "employee_id": self.employee_id,
            "role_description": self.role_description,
        }


@dataclass
class Task:
    id: int
    title: str
    description: Optional[str]
    priority: int
    target_revenue: Optional[float]
    project_id: Optional[int]
    creator_id: Optional[int] = None
    owner_id: Optional[int] = None
    status: str = "pending"
    current_revenue: float = 0.0
    logs: List[int] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "target_revenue": self.target_revenue,
            "project_id": self.project_id,
            "owner_id": self.owner_id,
            "status": self.status,
            "current_revenue": self.current_revenue,
        }


@dataclass
class TaskLog:
    id: int
    task_id: int
    employee_id: int
    note: Optional[str]
    revenue: Optional[float]
    blockers: Optional[str]
    needs: Optional[str]

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "task_id": self.task_id,
            "employee_id": self.employee_id,
            "note": self.note,
            "revenue": self.revenue,
            "blockers": self.blockers,
            "needs": self.needs,
        }
