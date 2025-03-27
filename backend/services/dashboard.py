from typing import Dict, List, Optional
from datetime import datetime, timedelta
from backend.models.user import UserPreferences
from backend.utils.logger import logger
from backend.services.ai_assistant import AIAssistant

class DashboardService:
    """Service for providing unified dashboard views across all wellness apps."""

    def __init__(self):
        self.ai_assistant = AIAssistant()
        self._supported_apps = {
            "email": {
                "priority": 1,
                "metrics": ["stress_level", "response_time", "unread_count"],
                "summary_type": "stress_focused"
            },
            # Ready for future apps
            "finance": {
                "priority": 2,
                "metrics": ["spending_health", "budget_status", "upcoming_bills"],
                "summary_type": "financial_wellness"
            },
            "health": {
                "priority": 3,
                "metrics": ["activity_level", "rest_quality", "wellness_score"],
                "summary_type": "health_focused"
            },
            "education": {
                "priority": 4,
                "metrics": ["learning_progress", "study_time", "comprehension"],
                "summary_type": "learning_focused"
            }
        }

    async def get_unified_dashboard(
        self,
        user_id: int,
        active_apps: List[str],
        preferences: UserPreferences
    ) -> Dict:
        """Get unified dashboard data across all active apps."""
        try:
            dashboard_data = {
                "summary": await self._generate_wellness_summary(user_id, active_apps),
                "quick_actions": self._get_personalized_actions(active_apps, preferences),
                "app_metrics": {},
                "insights": [],
                "notifications": []
            }

            # Gather data from each active app
            for app in active_apps:
                if app in self._supported_apps:
                    app_data = await self._get_app_metrics(user_id, app)
                    dashboard_data["app_metrics"][app] = app_data
                    
                    # Add app-specific insights
                    insights = await self._generate_app_insights(app_data, preferences)
                    dashboard_data["insights"].extend(insights)

            # Get AI-powered holistic insights
            holistic_insights = await self.ai_assistant.generate_holistic_insights(
                dashboard_data["app_metrics"]
            )
            dashboard_data["insights"].extend(holistic_insights)

            return dashboard_data

        except Exception as e:
            logger.error(f"Error generating unified dashboard: {str(e)}")
            return self._get_safe_default_dashboard()

    async def get_app_summary(
        self,
        user_id: int,
        app_name: str,
        timeframe: str = "today"
    ) -> Dict:
        """Get detailed summary for a specific app."""
        try:
            if app_name not in self._supported_apps:
                return {"error": "App not supported"}

            app_config = self._supported_apps[app_name]
            
            summary = {
                "metrics": await self._get_app_metrics(user_id, app_name, timeframe),
                "trends": await self._calculate_trends(user_id, app_name, timeframe),
                "suggestions": await self._get_app_suggestions(user_id, app_name),
                "quick_actions": self._get_app_quick_actions(app_name)
            }

            return summary

        except Exception as e:
            logger.error(f"Error getting app summary: {str(e)}")
            return {"error": "Unable to generate app summary"}

    async def _generate_wellness_summary(
        self,
        user_id: int,
        active_apps: List[str]
    ) -> Dict:
        """Generate overall wellness summary across all apps."""
        summary = {
            "overall_status": "stable",
            "focus_areas": [],
            "achievements": [],
            "upcoming_actions": []
        }

        for app in active_apps:
            if app == "email":
                email_status = await self._get_email_wellness(user_id)
                summary["focus_areas"].extend(email_status["focus_areas"])
                summary["achievements"].extend(email_status["achievements"])

            # Ready for future apps
            elif app == "finance":
                finance_status = await self._get_financial_wellness(user_id)
                summary["focus_areas"].extend(finance_status["focus_areas"])
                summary["achievements"].extend(finance_status["achievements"])

        return summary

    def _get_personalized_actions(
        self,
        active_apps: List[str],
        preferences: UserPreferences
    ) -> List[Dict]:
        """Get personalized quick actions across all apps."""
        actions = []

        # Email app actions
        if "email" in active_apps:
            actions.extend([
                {
                    "id": "review_high_stress",
                    "app": "email",
                    "title": "Review High-Stress Emails",
                    "priority": "high" if preferences.stress_sensitivity == "HIGH" else "medium"
                },
                {
                    "id": "schedule_breaks",
                    "app": "email",
                    "title": "Schedule Email Breaks",
                    "priority": "medium"
                }
            ])

        # Ready for future apps
        if "finance" in active_apps:
            actions.extend([
                {
                    "id": "review_budget",
                    "app": "finance",
                    "title": "Quick Budget Check",
                    "priority": "medium"
                }
            ])

        return actions

    async def _get_app_metrics(
        self,
        user_id: int,
        app_name: str,
        timeframe: str = "today"
    ) -> Dict:
        """Get key metrics for a specific app."""
        if app_name == "email":
            return await self._get_email_metrics(user_id, timeframe)
        # Ready for future apps
        elif app_name == "finance":
            return await self._get_finance_metrics(user_id, timeframe)
        return {}

    async def _get_email_metrics(self, user_id: int, timeframe: str) -> Dict:
        """Get email-specific metrics."""
        return {
            "stress_level": {
                "current": "LOW",
                "trend": "improving",
                "change": -15
            },
            "response_time": {
                "average": "2h",
                "trend": "stable"
            },
            "unread_count": {
                "total": 5,
                "high_priority": 1
            }
        }

    async def _generate_app_insights(
        self,
        app_data: Dict,
        preferences: UserPreferences
    ) -> List[Dict]:
        """Generate insights for a specific app."""
        insights = []
        
        # Process email insights
        if "stress_level" in app_data:
            stress_trend = app_data["stress_level"]["trend"]
            if stress_trend == "improving":
                insights.append({
                    "type": "positive",
                    "message": "Your email stress levels are improving",
                    "details": "Keep using stress reduction techniques"
                })
            elif stress_trend == "worsening":
                insights.append({
                    "type": "action_needed",
                    "message": "Email stress has increased",
                    "suggestion": "Consider enabling additional stress management features"
                })

        return insights

    def _get_safe_default_dashboard(self) -> Dict:
        """Get safe default dashboard data if there's an error."""
        return {
            "summary": {
                "overall_status": "stable",
                "focus_areas": [],
                "achievements": []
            },
            "quick_actions": [],
            "app_metrics": {},
            "insights": [],
            "notifications": []
        } 