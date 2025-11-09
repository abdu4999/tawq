from __future__ import annotations

import enum
from datetime import date, datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class Role(str, enum.Enum):
    ADMIN = "admin"
    ACCOUNTANT = "accountant"
    SUPERVISOR = "supervisor"
    EMPLOYEE = "employee"


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    full_name: str
    role: Role = Field(default=Role.EMPLOYEE)
    is_active: bool = Field(default=True)
    avatar_url: Optional[str] = None


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    employee_profile: Optional["EmployeeProfile"] = Relationship(back_populates="user")
    supervisor_profile: Optional["SupervisorProfile"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    employee_profile_id: Optional[int] = None
    supervisor_profile_id: Optional[int] = None


class UserUpdate(SQLModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None
    avatar_url: Optional[str] = None


class EmployeeProfileBase(SQLModel):
    title: Optional[str] = None
    monthly_target: Optional[float] = None
    yearly_target: Optional[float] = None
    strengths: Optional[str] = None
    opportunities: Optional[str] = None


class EmployeeProfile(EmployeeProfileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    supervisor_id: Optional[int] = Field(default=None, foreign_key="supervisorprofile.id")

    user: User = Relationship(back_populates="employee_profile")
    supervisor: Optional["SupervisorProfile"] = Relationship(back_populates="team_members")
    assignments: List["ProjectAssignment"] = Relationship(back_populates="employee")
    task_logs: List["TaskLog"] = Relationship(back_populates="employee")
    incentives: List["Incentive"] = Relationship(back_populates="employee")


class EmployeeProfileRead(EmployeeProfileBase):
    id: int
    user_id: int
    supervisor_id: Optional[int]


class SupervisorProfileBase(SQLModel):
    title: Optional[str] = None


class SupervisorProfile(SupervisorProfileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")

    user: User = Relationship(back_populates="supervisor_profile")
    team_members: List[EmployeeProfile] = Relationship(back_populates="supervisor")


class SupervisorProfileRead(SupervisorProfileBase):
    id: int
    user_id: int


class ProjectBase(SQLModel):
    name: str
    description: Optional[str] = None
    goal_amount: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")

    assignments: List["ProjectAssignment"] = Relationship(back_populates="project")
    tasks: List["Task"] = Relationship(back_populates="project")
    revenue_records: List["RevenueRecord"] = Relationship(back_populates="project")
    expense_records: List["ExpenseRecord"] = Relationship(back_populates="project")


class ProjectAssignmentBase(SQLModel):
    employee_id: int
    role_description: Optional[str] = None


class ProjectAssignment(ProjectAssignmentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    employee_id: int = Field(foreign_key="employeeprofile.id")

    project: Project = Relationship(back_populates="assignments")
    employee: EmployeeProfile = Relationship(back_populates="assignments")


class ProjectAssignmentCreate(ProjectAssignmentBase):
    ...


class TaskPriority(int, enum.Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    due_date: Optional[date] = None
    target_revenue: Optional[float] = None
    project_id: Optional[int] = None


class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    creator_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner_id: Optional[int] = Field(default=None, foreign_key="employeeprofile.id")
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    current_revenue: float = Field(default=0)

    project: Optional[Project] = Relationship(back_populates="tasks")
    logs: List["TaskLog"] = Relationship(back_populates="task")


class TaskLogBase(SQLModel):
    note: Optional[str] = None
    revenue: Optional[float] = None
    blockers: Optional[str] = None
    needs: Optional[str] = None
    employee_id: Optional[int] = None


class TaskLog(TaskLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id")
    employee_id: int = Field(foreign_key="employeeprofile.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    task: Task = Relationship(back_populates="logs")
    employee: EmployeeProfile = Relationship(back_populates="task_logs")


class TaskLogCreate(TaskLogBase):
    ...


class TaskStatusUpdate(SQLModel):
    status: TaskStatus


class RevenueRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    employee_id: Optional[int] = Field(default=None, foreign_key="employeeprofile.id")
    amount: float
    source: Optional[str] = None
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

    project: Project = Relationship(back_populates="revenue_records")


class ExpenseRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    employee_id: Optional[int] = Field(default=None, foreign_key="employeeprofile.id")
    amount: float
    description: Optional[str] = None
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

    project: Project = Relationship(back_populates="expense_records")


class Incentive(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employeeprofile.id")
    description: str
    points: int = 0
    granted_at: datetime = Field(default_factory=datetime.utcnow)

    employee: EmployeeProfile = Relationship(back_populates="incentives")


class Recommendation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employeeprofile.id")
    task_id: Optional[int] = Field(default=None, foreign_key="task.id")
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LeaderboardEntry(SQLModel):
    employee_id: int
    employee_name: str
    total_points: int
    total_revenue: float
    completed_tasks: int
