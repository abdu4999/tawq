from __future__ import annotations

from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import get_db, init_db
from .models import Role
from .security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password,
)

init_db()
settings = get_settings()
app = FastAPI(title=settings.app_name)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

db = get_db()


@app.get("/")
def root(_: Request) -> Dict[str, Any]:
    return {"status": "ok", "message": "Tawq Impact Platform API"}


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(request: Request) -> Dict[str, Any]:
    payload = request.json or {}
    required_fields = ["email", "full_name", "password", "role"]
    for field in required_fields:
        if field not in payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Missing field: {field}")
    try:
        role = Role(payload.get("role", Role.EMPLOYEE.value))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role") from exc
    is_active = bool(payload.get("is_active", True))
    try:
        user = db.create_user(
            email=str(payload["email"]).lower(),
            full_name=str(payload["full_name"]),
            role=role,
            password_hash=hash_password(str(payload["password"])),
            is_active=is_active,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if "avatar_url" in payload:
        user.avatar_url = payload["avatar_url"]
    return user.to_dict()


@app.post("/auth/token")
def token(request: Request) -> Dict[str, str]:
    payload = request.form or request.json or {}
    username = payload.get("username") or payload.get("email")
    password = payload.get("password")
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")
    user = db.get_user_by_email(str(username).lower())
    if not user or not verify_password(str(password), user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive account")
    token_value = create_access_token(user.email)
    return {"access_token": token_value, "token_type": "bearer"}


@app.post("/projects/")
def create_project(request: Request) -> Dict[str, Any]:
    user = get_current_user(request.headers)
    require_roles(user, [Role.ADMIN, Role.SUPERVISOR])
    payload = request.json or {}
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing project name")
    project = db.create_project(
        name=str(name),
        description=payload.get("description"),
        goal_amount=float(payload["goal_amount"]) if payload.get("goal_amount") is not None else None,
        owner_id=user.id,
    )
    return project.to_dict()


@app.post("/projects/{project_id}/assign")
def assign_project(request: Request, project_id: str) -> Dict[str, Any]:
    user = get_current_user(request.headers)
    require_roles(user, [Role.ADMIN, Role.SUPERVISOR])
    try:
        project = db.projects[int(project_id)]
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from exc
    payload = request.json or {}
    employee_id = payload.get("employee_id")
    if employee_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing employee_id")
    employee_profile = db.employee_profiles.get(int(employee_id))
    if employee_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    assignment = db.assign_employee_to_project(project.id, employee_profile.id, payload.get("role_description"))
    return assignment.to_dict()


@app.post("/tasks/")
def create_task(request: Request) -> Dict[str, Any]:
    user = get_current_user(request.headers)
    require_roles(user, [Role.ADMIN, Role.SUPERVISOR])
    payload = request.json or {}
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing task title")
    priority = int(payload.get("priority", 2))
    project_id = payload.get("project_id")
    if project_id is not None and int(project_id) not in db.projects:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    task = db.create_task(
        title=str(title),
        description=payload.get("description"),
        priority=priority,
        target_revenue=float(payload["target_revenue"]) if payload.get("target_revenue") is not None else None,
        project_id=int(project_id) if project_id is not None else None,
        creator_id=user.id,
    )
    return task.to_dict()


@app.post("/tasks/{task_id}/assign")
def assign_task(request: Request, task_id: str) -> Dict[str, Any]:
    user = get_current_user(request.headers)
    require_roles(user, [Role.ADMIN, Role.SUPERVISOR])
    try:
        task = db.tasks[int(task_id)]
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found") from exc
    params = request.query_params or {}
    employee_id = params.get("employee_id")
    if employee_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing employee_id")
    employee_profile = db.employee_profiles.get(int(employee_id))
    if employee_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    updated = db.assign_task(task.id, employee_profile.id)
    return updated.to_dict()


@app.post("/tasks/{task_id}/logs", status_code=status.HTTP_201_CREATED)
def add_task_log(request: Request, task_id: str) -> Dict[str, Any]:
    user = get_current_user(request.headers)
    if not user.employee_profile_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only employees can submit logs")
    try:
        task = db.tasks[int(task_id)]
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found") from exc
    payload = request.json or {}
    log = db.add_task_log(
        task_id=task.id,
        employee_id=user.employee_profile_id,
        note=payload.get("note"),
        revenue=float(payload["revenue"]) if payload.get("revenue") is not None else None,
        blockers=payload.get("blockers"),
        needs=payload.get("needs"),
    )
    return log.to_dict()


@app.get("/analytics/leaderboard")
def leaderboard(request: Request) -> List[Dict[str, Any]]:
    user = get_current_user(request.headers)
    require_roles(user, [Role.ADMIN, Role.SUPERVISOR])
    rows: List[Dict[str, Any]] = []
    for profile_id, profile in db.employee_profiles.items():
        employee_user = db.get_user(profile.user_id)
        total_revenue = 0.0
        completed_tasks = 0
        for task in db.tasks.values():
            if task.owner_id == profile_id:
                total_revenue += task.current_revenue
                if task.status == "completed":
                    completed_tasks += 1
        rows.append(
            {
                "employee_id": profile_id,
                "employee_name": employee_user.full_name if employee_user else "Unknown",
                "total_revenue": total_revenue,
                "completed_tasks": completed_tasks,
            }
        )
    rows.sort(key=lambda entry: entry["total_revenue"], reverse=True)
    return rows
