from __future__ import annotations

from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends

from .. import models
from ..dependencies import get_analytics_service, get_current_active_user
from ..services.analytics import AnalyticsService


class AnalyticsController:
    """Controller exposing analytics endpoints via dedicated service class."""

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/analytics", tags=["analytics"])
        self.router.get("/leaderboard", response_model=List[models.LeaderboardEntry])(self.leaderboard)
        self.router.get("/project/{project_id}/snapshot")(self.project_snapshot)
        self.router.get("/employee/{employee_id}/insights")(self.employee_insights)

    def leaderboard(
        self,
        analytics_service: Annotated[AnalyticsService, Depends(get_analytics_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> List[models.LeaderboardEntry]:
        return analytics_service.leaderboard(current_user)

    def project_snapshot(
        self,
        project_id: int,
        analytics_service: Annotated[AnalyticsService, Depends(get_analytics_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> Dict[str, object]:
        # Access control is handled inside the service when fetching the project data.
        return analytics_service.project_snapshot(project_id)

    def employee_insights(
        self,
        employee_id: int,
        analytics_service: Annotated[AnalyticsService, Depends(get_analytics_service)],
        current_user: Annotated[models.User, Depends(get_current_active_user)],
    ) -> Dict[str, object]:
        return analytics_service.employee_insights(employee_id, current_user)


def get_controller() -> AnalyticsController:
    return AnalyticsController()
