import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test_tawq.db"

from app.main import app  # noqa: E402
from app.db import init_db  # noqa: E402

TEST_DB = Path("test_tawq.db")


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    if TEST_DB.exists():
        TEST_DB.unlink()
    init_db()
    yield
    if TEST_DB.exists():
        TEST_DB.unlink()


@pytest.fixture()
def client():
    return TestClient(app)


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_user(client: TestClient, **kwargs):
    response = client.post("/auth/register", json=kwargs)
    assert response.status_code == 201, response.text
    return response.json()


def login(client: TestClient, username: str, password: str) -> str:
    response = client.post(
        "/auth/token",
        data={"username": username, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def test_full_flow(client: TestClient):
    admin = register_user(
        client,
        email="admin@example.com",
        full_name="Admin User",
        password="secret",
        role="admin",
        is_active=True,
    )

    employee = register_user(
        client,
        email="employee@example.com",
        full_name="Employee User",
        password="secret",
        role="employee",
        is_active=True,
    )

    admin_token = login(client, admin["email"], "secret")

    project_payload = {
        "name": "Campaign A",
        "description": "Charity marketing campaign",
        "goal_amount": 100000,
    }
    response = client.post("/projects/", json=project_payload, headers=auth_header(admin_token))
    assert response.status_code == 200
    project = response.json()

    assignment_payload = {
        "employee_id": employee["employee_profile_id"],
        "role_description": "Lead fundraiser",
    }
    response = client.post(
        f"/projects/{project['id']}/assign",
        json=assignment_payload,
        headers=auth_header(admin_token),
    )
    assert response.status_code == 200

    task_payload = {
        "title": "Engage donors",
        "description": "Contact VIP donors",
        "priority": 3,
        "target_revenue": 50000,
        "project_id": project["id"],
    }
    response = client.post("/tasks/", json=task_payload, headers=auth_header(admin_token))
    assert response.status_code == 200
    task = response.json()

    response = client.post(
        f"/tasks/{task['id']}/assign",
        params={"employee_id": employee["employee_profile_id"]},
        headers=auth_header(admin_token),
    )
    assert response.status_code == 200

    employee_token = login(client, employee["email"], "secret")
    log_payload = {
        "note": "Closed donor deal",
        "revenue": 15000,
        "blockers": None,
        "needs": "Creative assets",
    }
    response = client.post(
        f"/tasks/{task['id']}/logs",
        json=log_payload,
        headers=auth_header(employee_token),
    )
    assert response.status_code == 201

    response = client.get("/analytics/leaderboard", headers=auth_header(admin_token))
    assert response.status_code == 200
    leaderboard = response.json()
    assert leaderboard[0]["total_revenue"] == 15000
    assert leaderboard[0]["completed_tasks"] == 0
