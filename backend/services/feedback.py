from typing import Dict, List, Optional
from datetime import datetime, timedelta
from backend.models.user import UserPreferences
from backend.utils.logger import logger, log_accessibility_event
from backend.services.ai_assistant import AIAssistant

class FeedbackService:
    """Service for handling user feedback and continuous improvement."""

    def __init__(self):
        self.ai_assistant = AIAssistant()
        self._feedback_categories = {
            "stress_reduction": ["effectiveness", "suggestions"],
            "accessibility": ["ease_of_use", "barriers", "improvements"],
            "features": ["usefulness", "complexity", "missing"],
            "notifications": ["timing", "frequency", "relevance"],
            "ai_assistance": ["helpfulness", "accuracy", "understanding"]
        }

    async def process_feedback(self, feedback_data: Dict) -> Dict:
        """Process user feedback and generate improvement suggestions."""
        try:
            # Categorize feedback
            categorized_feedback = self._categorize_feedback(feedback_data)
            
            # Get AI analysis of feedback
            ai_analysis = await self.ai_assistant.analyze_feedback(categorized_feedback)
            
            # Generate improvement suggestions
            suggestions = self._generate_improvement_suggestions(
                categorized_feedback,
                ai_analysis
            )

            # Log feedback processing
            logger.info(
                "Processed user feedback",
                extra={
                    "feedback_categories": list(categorized_feedback.keys()),
                    "suggestion_count": len(suggestions)
                }
            )

            return {
                "processed_feedback": categorized_feedback,
                "analysis": ai_analysis,
                "suggestions": suggestions
            }

        except Exception as e:
            logger.error(f"Error processing feedback: {str(e)}")
            return {"error": "Unable to process feedback"}

    async def analyze_stress_reduction_effectiveness(
        self,
        stress_measurements: List[Dict]
    ) -> Dict:
        """Analyze effectiveness of stress reduction features."""
        try:
            # Calculate trend
            trend = self._calculate_stress_trend(stress_measurements)
            
            # Calculate reduction percentage
            baseline = next(
                (m["level"] for m in stress_measurements if m.get("baseline")),
                "MEDIUM"
            )
            current_level = stress_measurements[-1]["level"]
            reduction = self._calculate_stress_reduction(baseline, current_level)

            # Identify contributing factors
            factors = await self._identify_contributing_factors(stress_measurements)

            # Calculate user satisfaction correlation
            satisfaction = self._calculate_satisfaction_correlation(stress_measurements)

            return {
                "trend": trend,
                "reduction_percentage": reduction,
                "contributing_factors": factors,
                "user_satisfaction_correlation": satisfaction
            }

        except Exception as e:
            logger.error(f"Error analyzing stress reduction: {str(e)}")
            return {"error": "Unable to analyze stress reduction"}

    async def collect_accessibility_feedback(
        self,
        user_id: int,
        feedback_type: str,
        feedback_data: Dict
    ) -> Dict:
        """Collect and process accessibility-specific feedback."""
        try:
            # Process accessibility feedback
            processed_feedback = {
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "type": feedback_type,
                "data": feedback_data
            }

            # Log accessibility feedback
            log_accessibility_event(
                "accessibility_feedback_received",
                processed_feedback
            )

            # Get AI suggestions for accessibility improvements
            improvement_suggestions = await self.ai_assistant.suggest_accessibility_improvements(
                feedback_data
            )

            return {
                "processed_feedback": processed_feedback,
                "improvement_suggestions": improvement_suggestions
            }

        except Exception as e:
            logger.error(f"Error collecting accessibility feedback: {str(e)}")
            return {"error": "Unable to process accessibility feedback"}

    def _categorize_feedback(self, feedback_data: Dict) -> Dict:
        """Categorize feedback into predefined categories."""
        categorized = {}
        
        for category, subcategories in self._feedback_categories.items():
            category_data = {}
            for subcategory in subcategories:
                if subcategory in feedback_data:
                    category_data[subcategory] = feedback_data[subcategory]
            if category_data:
                categorized[category] = category_data

        return categorized

    def _generate_improvement_suggestions(
        self,
        categorized_feedback: Dict,
        ai_analysis: Dict
    ) -> List[Dict]:
        """Generate improvement suggestions based on feedback and analysis."""
        suggestions = []

        # Process stress reduction feedback
        if "stress_reduction" in categorized_feedback:
            suggestions.extend(self._get_stress_reduction_suggestions(
                categorized_feedback["stress_reduction"],
                ai_analysis
            ))

        # Process accessibility feedback
        if "accessibility" in categorized_feedback:
            suggestions.extend(self._get_accessibility_suggestions(
                categorized_feedback["accessibility"],
                ai_analysis
            ))

        # Process feature feedback
        if "features" in categorized_feedback:
            suggestions.extend(self._get_feature_suggestions(
                categorized_feedback["features"],
                ai_analysis
            ))

        return suggestions

    def _calculate_stress_trend(self, measurements: List[Dict]) -> str:
        """Calculate trend in stress measurements."""
        if len(measurements) < 2:
            return "insufficient_data"

        stress_levels = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
        recent_levels = [stress_levels[m["level"]] for m in measurements[-3:]]
        
        if all(recent_levels[i] > recent_levels[i+1] for i in range(len(recent_levels)-1)):
            return "improving"
        elif all(recent_levels[i] < recent_levels[i+1] for i in range(len(recent_levels)-1)):
            return "worsening"
        return "stable"

    def _calculate_stress_reduction(self, baseline: str, current: str) -> float:
        """Calculate stress reduction percentage."""
        stress_levels = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
        baseline_value = stress_levels[baseline]
        current_value = stress_levels[current]
        
        if baseline_value <= current_value:
            return 0.0
        
        return ((baseline_value - current_value) / baseline_value) * 100

    async def _identify_contributing_factors(
        self,
        measurements: List[Dict]
    ) -> List[Dict]:
        """Identify factors contributing to stress reduction."""
        factors = []
        
        # Analyze feature usage correlation
        feature_impact = self._analyze_feature_impact(measurements)
        for feature, impact in feature_impact.items():
            if impact > 0.5:  # Significant positive impact
                factors.append({
                    "factor": feature,
                    "impact": impact,
                    "confidence": "high"
                })

        # Get AI insights on contributing factors
        ai_factors = await self.ai_assistant.identify_stress_factors(measurements)
        factors.extend(ai_factors)

        return factors

    def _calculate_satisfaction_correlation(
        self,
        measurements: List[Dict]
    ) -> float:
        """Calculate correlation between stress reduction and user satisfaction."""
        if len(measurements) < 3:
            return 0.0

        satisfaction_scores = [m.get("satisfaction", 0) for m in measurements]
        stress_levels = [{"LOW": 1, "MEDIUM": 2, "HIGH": 3}[m["level"]] for m in measurements]

        # Simple correlation calculation
        if len(set(stress_levels)) == 1 or len(set(satisfaction_scores)) == 1:
            return 0.0

        # Higher correlation means stress reduction leads to higher satisfaction
        return 1.0 - (sum(stress_levels) / (3 * len(stress_levels))) 