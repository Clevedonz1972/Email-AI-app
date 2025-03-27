from typing import Dict, List, Any, Optional
from ..models.email import EmailMessage, EmailAnalysis, StressLevel, Priority
from ..models.user import UserPreferences
from .openai_service import analyze_content
from ..utils.logger import logger, log_error, log_accessibility_event
from datetime import datetime, timedelta
import logging

class StressAnalyzer:
    """Analyzes email content for stress indicators and user-specific triggers."""
    
    def __init__(self, user_preferences: UserPreferences):
        self.stress_sensitivity = user_preferences.stress_sensitivity
        self.anxiety_triggers = user_preferences.anxiety_triggers
        self.logger = logging.getLogger(__name__)
    
    def _check_content_triggers(self, content: str) -> Dict[str, Any]:
        """Check content for stress triggers and urgent words."""
        urgent_words = ["urgent", "asap", "immediately", "critical", "emergency"]
        found_urgent = [word for word in urgent_words if word.lower() in content.lower()]
        found_triggers = [trigger for trigger in self.anxiety_triggers if trigger.lower() in content.lower()]
        
        return {
            "urgent_words": found_urgent,
            "anxiety_triggers": found_triggers,
            "has_deadlines": bool(self._extract_dates(content))
        }
    
    def _extract_dates(self, content: str) -> List[datetime]:
        """Extract potential deadline dates from content."""
        # TODO: Implement sophisticated date extraction
        return []
    
    def _calculate_base_stress_level(self, triggers: Dict[str, Any]) -> StressLevel:
        """Calculate base stress level from triggers."""
        if len(triggers["urgent_words"]) >= 2 or (triggers["has_deadlines"] and triggers["anxiety_triggers"]):
            return StressLevel.HIGH
        elif triggers["urgent_words"] or triggers["anxiety_triggers"]:
            return StressLevel.MEDIUM
        return StressLevel.LOW
    
    def _adjust_for_user_sensitivity(self, base_level: StressLevel) -> StressLevel:
        """Adjust stress level based on user sensitivity."""
        if self.stress_sensitivity == "HIGH":
            if base_level == StressLevel.LOW:
                return StressLevel.MEDIUM
            elif base_level == StressLevel.MEDIUM:
                return StressLevel.HIGH
        elif self.stress_sensitivity == "LOW":
            if base_level == StressLevel.HIGH:
                return StressLevel.MEDIUM
            elif base_level == StressLevel.MEDIUM:
                return StressLevel.LOW
        return base_level

async def analyze_email_stress(email: EmailMessage, user_preferences: UserPreferences) -> EmailAnalysis:
    """Analyze email stress levels considering user preferences and accessibility needs."""
    analyzer = StressAnalyzer(user_preferences)
    
    try:
        # Initial analysis of content triggers
        triggers = analyzer._check_content_triggers(email.content)
        base_stress = analyzer._calculate_base_stress_level(triggers)
        adjusted_stress = analyzer._adjust_for_user_sensitivity(base_stress)
        
        # Context for AI analysis
        context = {
            "user_sensitivity": user_preferences.stress_sensitivity,
            "anxiety_triggers": user_preferences.anxiety_triggers,
            "initial_analysis": {
                "triggers": triggers,
                "base_stress": base_stress.value,
                "adjusted_stress": adjusted_stress.value
            }
        }
        
        # Get AI analysis
        ai_analysis = await analyze_content(email.content, context=context)
        
        # Convert string values to enums
        stress_level = StressLevel[ai_analysis["stress_level"].upper()]
        priority = Priority[ai_analysis["priority"].upper()]
        
        analysis = EmailAnalysis(
            email_id=email.id,
            stress_level=stress_level,
            priority=priority,
            summary=ai_analysis["summary"],
            action_items=ai_analysis["action_items"],
            sentiment_score=float(ai_analysis["sentiment_score"]),
            action_required=True,  # Default to True for new emails
            explanation=f"Stress level: {stress_level.value}, Priority: {priority.value}",
            timestamp=datetime.utcnow()
        )
        
        # Log high stress emails for accessibility considerations
        if analysis.stress_level == StressLevel.HIGH:
            log_accessibility_event(
                "high_stress_email_detected",
                {"email_id": email.id, "stress_level": analysis.stress_level.value}
            )
        
        return analysis
        
    except Exception as e:
        log_error(f"Error analyzing email stress: {str(e)}")
        
        # Return safe defaults on error
        return EmailAnalysis(
            email_id=email.id,
            stress_level=StressLevel.MEDIUM,
            priority=Priority.MEDIUM,
            summary="Error occurred during analysis",
            action_items=[],
            sentiment_score=0.0,
            action_required=False,
            explanation="Analysis failed - using default values",
            timestamp=datetime.utcnow()
        )
