from __future__ import annotations

from collections import defaultdict
from statistics import mean
from typing import Dict, List

from fastapi import HTTPException
from sqlmodel import select

from .. import models
from .base import BaseService


class AnalyticsService(BaseService):
    """Aggregates domain analytics in an MVC-compliant service layer."""

    def leaderboard(self, current_user: models.User) -> List[models.LeaderboardEntry]:
        if current_user.role == models.Role.EMPLOYEE and not current_user.employee_profile:
            return []
        employees = self.session.exec(
            select(models.EmployeeProfile).where(models.EmployeeProfile.user.has(is_active=True))
        ).all()
        leaderboard_rows: List[models.LeaderboardEntry] = []
        for employee in employees:
            user = employee.user
            if not user:
                continue
            total_revenue = sum(log.revenue or 0 for log in employee.task_logs)
            completed_tasks = sum(
                1 for log in employee.task_logs if log.task and log.task.status == models.TaskStatus.COMPLETED
            )
            total_points = sum(incentive.points for incentive in employee.incentives)
            leaderboard_rows.append(
                models.LeaderboardEntry(
                    employee_id=employee.id,
                    employee_name=user.full_name,
                    total_points=total_points,
                    total_revenue=total_revenue,
                    completed_tasks=completed_tasks,
                )
            )
        leaderboard_rows.sort(key=lambda row: (row.total_points, row.total_revenue, row.completed_tasks), reverse=True)
        return leaderboard_rows

    def project_snapshot(self, project_id: int) -> Dict[str, object]:
        project = self.session.get(models.Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        revenue = sum(record.amount for record in project.revenue_records)
        expenses = sum(record.amount for record in project.expense_records)
        profit = revenue - expenses
        team = [
            assignment.employee.user.full_name
            for assignment in project.assignments
            if assignment.employee and assignment.employee.user
        ]
        return {
            "project": project,
            "metrics": {
                "revenue": revenue,
                "expenses": expenses,
                "profit": profit,
                "completion_rate": self._project_completion_rate(project),
            },
            "team": team,
        }

    def employee_insights(self, employee_id: int, current_user: models.User) -> Dict[str, object]:
        employee = self.session.get(models.EmployeeProfile, employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        if current_user.role == models.Role.EMPLOYEE and current_user.employee_profile.id != employee_id:
            raise HTTPException(status_code=403, detail="Access denied")
        revenue_by_week: Dict[str, float] = defaultdict(float)
        for log in employee.task_logs:
            iso_year, iso_week, _ = log.created_at.isocalendar()
            key = f"{iso_year}-W{iso_week:02d}"
            revenue_by_week[key] += log.revenue or 0
        recommendation_texts = self._generate_recommendations(employee)
        return {
            "employee": employee,
            "weekly_revenue": revenue_by_week,
            "avg_revenue": mean(revenue_by_week.values()) if revenue_by_week else 0,
            "recommendations": recommendation_texts,
        }

    def _project_completion_rate(self, project: models.Project) -> float:
        tasks = project.tasks or []
        if not tasks:
            return 0.0
        completed = sum(1 for task in tasks if task.status == models.TaskStatus.COMPLETED)
        return round(completed / len(tasks) * 100, 2)

    def _generate_recommendations(self, employee: models.EmployeeProfile) -> List[str]:
        revenue = sum(log.revenue or 0 for log in employee.task_logs[-5:])
        blockers = [log.blockers for log in employee.task_logs[-5:] if log.blockers]
        recommendations: List[str] = []
        if revenue < (employee.monthly_target or 10000) * 0.25:
            recommendations.append("ركز على المتبرعين ذوي العائد العالي هذا الأسبوع لرفع متوسط الإيراد.")
        if blockers:
            recommendations.append("عالج العوائق التالية بالتنسيق مع المشرف: " + "؛ ".join(blockers))
        if not recommendations:
            recommendations.append("استمر في نفس الوتيرة، قم بتوثيق قصص النجاح ومشاركتها مع الفريق.")
        return recommendations
