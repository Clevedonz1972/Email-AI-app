from typing import Dict, List, Optional
from datetime import datetime, timedelta
from backend.models.user import UserPreferences
from backend.utils.logger import logger
from backend.services.ai_assistant import AIAssistant

class AppIntegrationService:
    """Service for managing integrations between wellness apps."""

    def __init__(self):
        self.ai_assistant = AIAssistant()
        self._integration_types = {
            "data_sharing": {
                "permission_required": True,
                "sync_frequency": "real_time"
            },
            "action_triggers": {
                "permission_required": True,
                "sync_frequency": "immediate"
            },
            "insights_sharing": {
                "permission_required": True,
                "sync_frequency": "daily"
            }
        }

    async def setup_app_integration(
        self,
        user_id: int,
        source_app: str,
        target_app: str,
        integration_type: str,
        settings: Dict
    ) -> Dict:
        """Set up integration between two apps."""
        try:
            # Validate integration type
            if integration_type not in self._integration_types:
                return {"error": "Invalid integration type"}

            # Create integration configuration
            integration_config = {
                "user_id": user_id,
                "source_app": source_app,
                "target_app": target_app,
                "type": integration_type,
                "settings": settings,
                "status": "active",
                "created_at": datetime.now().isoformat()
            }

            # Set up data sharing rules
            sharing_rules = await self._setup_data_sharing_rules(
                source_app,
                target_app,
                settings
            )
            integration_config["sharing_rules"] = sharing_rules

            # Configure triggers
            triggers = self._setup_action_triggers(
                source_app,
                target_app,
                settings
            )
            integration_config["triggers"] = triggers

            return integration_config

        except Exception as e:
            logger.error(f"Error setting up app integration: {str(e)}")
            return {"error": "Unable to set up integration"}

    async def process_cross_app_action(
        self,
        user_id: int,
        source_app: str,
        action_type: str,
        action_data: Dict
    ) -> List[Dict]:
        """Process actions that affect multiple apps."""
        try:
            affected_apps = await self._identify_affected_apps(
                source_app,
                action_type,
                action_data
            )

            results = []
            for app in affected_apps:
                # Process action for each affected app
                result = await self._process_app_specific_action(
                    user_id,
                    app,
                    action_type,
                    action_data
                )
                results.append(result)

            return results

        except Exception as e:
            logger.error(f"Error processing cross-app action: {str(e)}")
            return [{"error": "Unable to process cross-app action"}]

    async def get_integrated_insights(
        self,
        user_id: int,
        apps: List[str],
        timeframe: str = "week"
    ) -> Dict:
        """Get insights that combine data from multiple apps."""
        try:
            # Gather data from all specified apps
            app_data = {}
            for app in apps:
                data = await self._get_app_data(user_id, app, timeframe)
                app_data[app] = data

            # Generate cross-app insights
            insights = await self._generate_cross_app_insights(app_data)

            # Get AI-powered recommendations
            recommendations = await self.ai_assistant.get_holistic_recommendations(
                app_data,
                insights
            )

            return {
                "insights": insights,
                "recommendations": recommendations,
                "correlations": await self._find_cross_app_correlations(app_data)
            }

        except Exception as e:
            logger.error(f"Error getting integrated insights: {str(e)}")
            return {"error": "Unable to generate integrated insights"}

    async def _setup_data_sharing_rules(
        self,
        source_app: str,
        target_app: str,
        settings: Dict
    ) -> Dict:
        """Set up rules for sharing data between apps."""
        rules = {
            "shared_metrics": [],
            "update_frequency": "real_time",
            "data_retention": "30_days"
        }

        # Configure email-specific sharing
        if source_app == "email":
            rules["shared_metrics"].extend([
                "stress_level",
                "response_patterns",
                "peak_activity_times"
            ])

        # Configure finance-specific sharing
        if source_app == "finance":
            rules["shared_metrics"].extend([
                "spending_patterns",
                "stress_triggers",
                "financial_goals"
            ])

        return rules

    def _setup_action_triggers(
        self,
        source_app: str,
        target_app: str,
        settings: Dict
    ) -> List[Dict]:
        """Set up triggers for cross-app actions."""
        triggers = []

        # Email triggers
        if source_app == "email":
            triggers.extend([
                {
                    "event": "high_stress_detected",
                    "action": "suggest_wellness_break",
                    "target_app": "health",
                    "conditions": {"stress_level": "HIGH"}
                },
                {
                    "event": "deadline_detected",
                    "action": "create_calendar_event",
                    "target_app": "calendar",
                    "conditions": {"has_deadline": True}
                }
            ])

        # Finance triggers
        if source_app == "finance":
            triggers.extend([
                {
                    "event": "budget_alert",
                    "action": "create_notification",
                    "target_app": "all",
                    "conditions": {"threshold_exceeded": True}
                }
            ])

        return triggers

    async def _identify_affected_apps(
        self,
        source_app: str,
        action_type: str,
        action_data: Dict
    ) -> List[str]:
        """Identify apps affected by a cross-app action."""
        affected_apps = set()

        # Email-triggered effects
        if source_app == "email":
            if action_type == "high_stress":
                affected_apps.update(["health", "calendar"])
            elif action_type == "deadline":
                affected_apps.update(["calendar", "tasks"])

        # Finance-triggered effects
        elif source_app == "finance":
            if action_type == "budget_alert":
                affected_apps.update(["email", "health"])

        return list(affected_apps)

    async def _process_app_specific_action(
        self,
        user_id: int,
        app: str,
        action_type: str,
        action_data: Dict
    ) -> Dict:
        """Process an action for a specific app."""
        try:
            if app == "email":
                return await self._process_email_action(action_type, action_data)
            elif app == "finance":
                return await self._process_finance_action(action_type, action_data)
            elif app == "health":
                return await self._process_health_action(action_type, action_data)
            
            return {"error": "App not supported"}

        except Exception as e:
            logger.error(f"Error processing action for {app}: {str(e)}")
            return {"error": f"Unable to process action for {app}"} 