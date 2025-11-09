from __future__ import annotations

from typing import List

from fastapi import APIRouter

from .analytics import get_controller as get_analytics_controller
from .auth import get_controller as get_auth_controller
from .projects import get_controller as get_project_controller
from .tasks import get_controller as get_task_controller
from .users import get_controller as get_user_controller


def gather_routers() -> List[APIRouter]:
    """Instantiate controllers and return their routers for application mounting."""

    controllers = [
        get_auth_controller(),
        get_user_controller(),
        get_project_controller(),
        get_task_controller(),
        get_analytics_controller(),
    ]
    return [controller.router for controller in controllers]


__all__ = ["gather_routers"]
