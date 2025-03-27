from typing import Dict, List, Optional
from datetime import datetime
from backend.models.user import UserPreferences
from backend.utils.logger import logger, log_accessibility_event
from backend.services.ai_assistant import AIAssistant

class OnboardingService:
    """Service for handling user onboarding with accessibility-first approach."""

    def __init__(self):
        self.ai_assistant = AIAssistant()
        self._setup_steps = self._initialize_setup_steps()

    def _initialize_setup_steps(self) -> List[Dict]:
        """Initialize the setup steps with clear progression."""
        return [
            {
                "id": "welcome",
                "type": "introduction",
                "skippable": False,
                "help_available": True,
                "description": "Welcome! Let's set up your email experience.",
                "estimated_time": "2 minutes"
            },
            {
                "id": "accessibility_check",
                "type": "accessibility",
                "skippable": False,
                "help_available": True,
                "description": "Do you have any accessibility preferences?",
                "options": ["high_contrast", "large_text", "screen_reader", "reduced_motion"],
                "ai_assistance": True
            },
            {
                "id": "communication_style",
                "type": "preference",
                "skippable": True,
                "help_available": True,
                "description": "How do you prefer to receive information?",
                "options": ["detailed", "summarized", "visual", "structured"]
            },
            {
                "id": "stress_profile",
                "type": "assessment",
                "skippable": True,
                "help_available": True,
                "description": "Let's understand what causes you stress.",
                "ai_assistance": True
            },
            {
                "id": "notification_preferences",
                "type": "preference",
                "skippable": True,
                "help_available": True,
                "description": "When should we notify you?",
                "options": ["morning", "afternoon", "custom"]
            }
        ]

    async def process_initial_setup(self, responses: Dict) -> UserPreferences:
        """Process initial setup responses and create user preferences."""
        try:
            # Log start of setup
            logger.info("Starting initial setup process", extra={"responses": responses})

            # Create base preferences
            preferences = self._create_base_preferences(responses)

            # Analyze work environment and adjust settings
            if responses.get("work_environment") == "high_pressure":
                preferences.stress_sensitivity = "HIGH"
                preferences.notifications["quiet_hours"]["end"] = "09:00"  # Later start
                preferences.accessibility["reduce_cognitive_load"] = True

            # Process communication preferences
            if "structured" in responses.get("communication_preferences", []):
                preferences.ai_assistance["auto_categorize"] = True
                preferences.accessibility["break_into_sections"] = True

            # Handle accessibility needs
            if "reduced_cognitive_load" in responses.get("accessibility_needs", []):
                await self._setup_cognitive_load_features(preferences)

            # Set up notification schedule
            await self._configure_notifications(preferences, responses)

            # Get AI suggestions for additional settings
            ai_suggestions = await self.ai_assistant.get_setup_suggestions(responses)
            self._apply_ai_suggestions(preferences, ai_suggestions)

            # Log successful setup
            log_accessibility_event(
                "onboarding_completed",
                {"preferences_set": preferences.dict()}
            )

            return preferences

        except Exception as e:
            logger.error(f"Error during initial setup: {str(e)}")
            # Return safe defaults
            return self._get_safe_default_preferences()

    async def get_help_content(self, step_id: str, context: Optional[Dict] = None) -> Dict:
        """Get contextual help content for setup steps."""
        try:
            base_help = self._get_base_help_content(step_id)
            
            if context and context.get("needs_extra_help"):
                # Get AI-generated additional help
                extra_help = await self.ai_assistant.generate_help_content(
                    step_id,
                    context
                )
                base_help["additional_guidance"] = extra_help
                base_help["examples"] = self._get_relevant_examples(step_id, context)

            return base_help

        except Exception as e:
            logger.error(f"Error getting help content: {str(e)}")
            return {"error": "Unable to load help content"}

    def _create_base_preferences(self, responses: Dict) -> UserPreferences:
        """Create base preferences from responses."""
        return UserPreferences(
            onboarding_completed=True,
            initial_assessment=responses,
            accessibility={
                "high_contrast": False,
                "large_text": False,
                "reduced_motion": False,
                "text_scale": 100
            },
            notifications={
                "email": True,
                "push": True,
                "quiet_hours": {"start": "22:00", "end": "07:00"}
            },
            ai_assistance={
                "level": "balanced",
                "auto_categorize": True,
                "stress_monitoring": True
            },
            stress_sensitivity="MEDIUM",
            app_integrations={
                "calendar": False,
                "tasks": False,
                "notes": False
            }
        )

    async def _setup_cognitive_load_features(self, preferences: UserPreferences):
        """Configure features for reduced cognitive load."""
        preferences.accessibility.update({
            "reduce_cognitive_load": True,
            "simplified_layout": True,
            "break_into_sections": True,
            "progressive_disclosure": True
        })
        preferences.ai_assistance["level"] = "high"

    async def _configure_notifications(self, preferences: UserPreferences, responses: Dict):
        """Configure notification settings based on user preferences."""
        notification_times = responses.get("preferred_notification_times", [])
        
        if "morning" in notification_times:
            preferences.notifications["morning_summary"] = True
            preferences.notifications["morning_summary_time"] = "09:00"
        
        if "early_afternoon" in notification_times:
            preferences.notifications["afternoon_summary"] = True
            preferences.notifications["afternoon_summary_time"] = "14:00"

        # Respect quiet hours
        if "evening" not in notification_times:
            preferences.notifications["quiet_hours"]["start"] = "16:00"

    def _get_safe_default_preferences(self) -> UserPreferences:
        """Get safe default preferences if setup fails."""
        return UserPreferences(
            onboarding_completed=True,
            accessibility={
                "high_contrast": False,
                "large_text": False,
                "reduced_motion": True,
                "text_scale": 100
            },
            notifications={
                "email": True,
                "push": False,
                "quiet_hours": {"start": "20:00", "end": "08:00"}
            },
            stress_sensitivity="MEDIUM"
        )

    def _get_base_help_content(self, step_id: str) -> Dict:
        """Get base help content for a setup step."""
        help_content = {
            "welcome": {
                "title": "Welcome to Your Email Assistant",
                "description": "This app helps manage email stress and improve productivity.",
                "video_tutorial": "welcome.mp4",
                "quick_tips": [
                    "Take your time with setup",
                    "All settings can be changed later",
                    "Help is always available"
                ]
            },
            "accessibility_check": {
                "title": "Accessibility Preferences",
                "description": "Let's make sure the app works well for you.",
                "examples": {
                    "high_contrast": "Makes text easier to read",
                    "large_text": "Increases text size",
                    "screen_reader": "Works with your screen reader"
                }
            }
            # Add more help content for other steps
        }
        return help_content.get(step_id, {"title": "Help", "description": "Contact support for help."}) 