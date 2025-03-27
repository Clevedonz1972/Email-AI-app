from typing import Dict, List, Optional
from datetime import datetime, timedelta
from backend.models.user import UserPreferences
from backend.utils.logger import logger, log_accessibility_event
from backend.services.ai_assistant import AIAssistant

class UserAdaptationService:
    """Service for continuous learning and adaptation to user needs."""

    def __init__(self):
        self.ai_assistant = AIAssistant()
        self._adaptation_thresholds = {
            "stress_pattern": 5,  # Number of high-stress events to trigger adaptation
            "feature_suggestion": 3,  # Number of similar actions to suggest a feature
            "quiet_hours": 2  # Number of late responses to suggest quiet hours adjustment
        }

    async def analyze_user_patterns(
        self,
        user_id: int,
        interaction_history: List[Dict],
        current_preferences: UserPreferences
    ) -> Dict:
        """Analyze user interaction patterns and suggest adaptations."""
        try:
            patterns = {
                "stress_patterns": await self._analyze_stress_patterns(interaction_history),
                "usage_patterns": self._analyze_usage_patterns(interaction_history),
                "response_patterns": self._analyze_response_patterns(interaction_history),
                "feature_engagement": self._analyze_feature_engagement(interaction_history)
            }

            # Get AI insights on patterns
            ai_insights = await self.ai_assistant.analyze_patterns(patterns)
            
            # Generate adaptation suggestions
            suggestions = await self._generate_adaptation_suggestions(
                patterns,
                ai_insights,
                current_preferences
            )

            return {
                "patterns": patterns,
                "insights": ai_insights,
                "suggestions": suggestions
            }

        except Exception as e:
            logger.error(f"Error analyzing user patterns: {str(e)}")
            return {"error": "Unable to analyze patterns"}

    async def suggest_features(
        self,
        user_id: int,
        current_preferences: UserPreferences,
        recent_interactions: List[Dict]
    ) -> List[Dict]:
        """Suggest features based on user behavior and needs."""
        try:
            # Analyze recent interactions
            interaction_patterns = self._analyze_interaction_patterns(recent_interactions)
            
            # Get personalized suggestions
            suggestions = []
            
            # Check for stress-related features
            if interaction_patterns.get("high_stress_frequency", 0) > self._adaptation_thresholds["stress_pattern"]:
                suggestions.append({
                    "feature": "stress_monitoring",
                    "description": "Enable advanced stress monitoring to better manage email stress",
                    "benefit": "Get personalized suggestions for handling stressful emails",
                    "setup_complexity": "low"
                })

            # Check for timing-based features
            if interaction_patterns.get("late_night_activity", False):
                suggestions.append({
                    "feature": "quiet_hours",
                    "description": "Set up quiet hours to maintain work-life balance",
                    "benefit": "Reduce after-hours stress from emails",
                    "setup_complexity": "low"
                })

            # Suggest integrations with other apps
            if not current_preferences.app_integrations.get("calendar", False):
                suggestions.append({
                    "feature": "calendar_integration",
                    "description": "Connect your calendar to better manage email-related tasks",
                    "benefit": "Automatically schedule follow-ups and deadlines",
                    "setup_complexity": "medium"
                })

            return suggestions

        except Exception as e:
            logger.error(f"Error suggesting features: {str(e)}")
            return []

    async def adapt_preferences(
        self,
        user_id: int,
        current_preferences: UserPreferences,
        adaptation_data: Dict
    ) -> UserPreferences:
        """Adapt user preferences based on usage patterns and feedback."""
        try:
            updated_preferences = current_preferences.copy()

            # Adapt stress sensitivity
            if adaptation_data.get("stress_patterns"):
                self._adapt_stress_sensitivity(updated_preferences, adaptation_data["stress_patterns"])

            # Adapt notification settings
            if adaptation_data.get("response_patterns"):
                self._adapt_notification_settings(updated_preferences, adaptation_data["response_patterns"])

            # Adapt accessibility settings
            if adaptation_data.get("accessibility_needs"):
                await self._adapt_accessibility_settings(updated_preferences, adaptation_data["accessibility_needs"])

            # Log adaptations
            log_accessibility_event(
                "preferences_adapted",
                {"adaptations": adaptation_data}
            )

            return updated_preferences

        except Exception as e:
            logger.error(f"Error adapting preferences: {str(e)}")
            return current_preferences

    def _analyze_interaction_patterns(self, interactions: List[Dict]) -> Dict:
        """Analyze user interaction patterns."""
        patterns = {
            "high_stress_frequency": 0,
            "late_night_activity": False,
            "feature_usage": {},
            "response_times": []
        }

        for interaction in interactions:
            # Count high-stress emails
            if interaction.get("stress_level") == "HIGH":
                patterns["high_stress_frequency"] += 1

            # Check for late-night activity
            timestamp = datetime.fromisoformat(interaction["timestamp"])
            if timestamp.hour >= 20 or timestamp.hour < 6:
                patterns["late_night_activity"] = True

            # Track feature usage
            if feature := interaction.get("feature_used"):
                patterns["feature_usage"][feature] = patterns["feature_usage"].get(feature, 0) + 1

            # Track response times
            if "response_time" in interaction:
                patterns["response_times"].append(interaction["response_time"])

        return patterns

    def _adapt_stress_sensitivity(self, preferences: UserPreferences, stress_patterns: Dict):
        """Adapt stress sensitivity based on patterns."""
        high_stress_ratio = stress_patterns.get("high_stress_ratio", 0)
        
        if high_stress_ratio > 0.7:  # More than 70% high-stress emails
            preferences.stress_sensitivity = "HIGH"
            preferences.ai_assistance["level"] = "high"
        elif high_stress_ratio < 0.3:  # Less than 30% high-stress emails
            preferences.stress_sensitivity = "LOW"
            preferences.ai_assistance["level"] = "balanced"

    def _adapt_notification_settings(self, preferences: UserPreferences, response_patterns: Dict):
        """Adapt notification settings based on response patterns."""
        if response_patterns.get("late_responses", 0) > self._adaptation_thresholds["quiet_hours"]:
            # Extend quiet hours
            preferences.notifications["quiet_hours"]["start"] = "19:00"  # Earlier start
            preferences.notifications["quiet_hours"]["end"] = "09:00"    # Later end

    async def _adapt_accessibility_settings(self, preferences: UserPreferences, accessibility_needs: Dict):
        """Adapt accessibility settings based on user needs."""
        if accessibility_needs.get("cognitive_load_issues"):
            preferences.accessibility.update({
                "reduce_cognitive_load": True,
                "simplified_layout": True,
                "break_into_sections": True
            })

        if accessibility_needs.get("visual_strain"):
            preferences.accessibility.update({
                "high_contrast": True,
                "large_text": True,
                "text_scale": 125
            }) 