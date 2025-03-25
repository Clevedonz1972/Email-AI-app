from typing import Dict, List, Optional
from enum import Enum
from pydantic import BaseModel
import re
from backend.utils.logger import logger, log_error

class StressLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class StressAnalysisResult(BaseModel):
    stress_level: StressLevel
    factors: List[str]
    recommendations: List[str]
    score: float  # 0-100 scale
    
class StressAnalyzer:
    """Analyzes email content for stress factors and provides recommendations"""
    
    # Patterns that might indicate stress or urgency
    URGENT_PATTERNS = [
        r'\bASAP\b', 
        r'\burgent\b', 
        r'\bimmediately\b',
        r'\bemergency\b',
        r'\bcrisis\b',
        r'deadline.*today',
        r'due.*hours',
    ]
    
    # Phrases that might add emotional load
    EMOTIONAL_PHRASES = [
        r'\bdisappointed\b',
        r'\bfailure\b',
        r'\bworried\b',
        r'\bconcerned\b',
        r'\bfrustr\w+\b',
        r'\banxi\w+\b',
        r'\bstress\w+\b',
    ]
    
    def __init__(self, user_preferences: Optional[Dict] = None):
        """
        Initialize with optional user preferences for personalized analysis
        """
        self.user_preferences = user_preferences or {}
        self.anxiety_triggers = self.user_preferences.get('anxiety_triggers', [])
        
    def analyze(self, content: str, subject: str = "") -> StressAnalysisResult:
        """
        Analyze email content and subject for stress factors
        Returns a StressAnalysisResult with stress level assessment and recommendations
        """
        combined_text = f"{subject} {content}".lower()
        
        # Calculate stress metrics
        urgency_score = self._calculate_urgency(combined_text)
        emotional_score = self._calculate_emotional_load(combined_text)
        trigger_score = self._check_personal_triggers(combined_text)
        complexity_score = self._calculate_complexity(content)
        
        # Weight the factors (can be adjusted)
        weighted_score = (
            urgency_score * 0.4 + 
            emotional_score * 0.3 + 
            trigger_score * 0.2 + 
            complexity_score * 0.1
        ) * 100  # Scale to 0-100
        
        # Determine stress level
        stress_level = self._determine_stress_level(weighted_score)
        
        # Collect factors that contributed to the score
        factors = self._collect_stress_factors(
            combined_text, 
            urgency_score, 
            emotional_score,
            trigger_score,
            complexity_score
        )
        
        # Generate recommendations based on the analysis
        recommendations = self._generate_recommendations(stress_level, factors)
        
        return StressAnalysisResult(
            stress_level=stress_level,
            factors=factors,
            recommendations=recommendations,
            score=weighted_score
        )
    
    def _calculate_urgency(self, text: str) -> float:
        """Calculate urgency score based on patterns"""
        score = 0.0
        for pattern in self.URGENT_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            score += len(matches) * 0.1  # Each match adds to the score
        
        # Cap at 1.0
        return min(score, 1.0)
    
    def _calculate_emotional_load(self, text: str) -> float:
        """Calculate emotional load score based on emotional phrases"""
        score = 0.0
        for pattern in self.EMOTIONAL_PHRASES:
            matches = re.findall(pattern, text, re.IGNORECASE)
            score += len(matches) * 0.15  # Emotional content weighted slightly higher
        
        # Cap at 1.0
        return min(score, 1.0)
    
    def _check_personal_triggers(self, text: str) -> float:
        """Check for personal anxiety triggers from user preferences"""
        if not self.anxiety_triggers:
            return 0.0
            
        score = 0.0
        for trigger in self.anxiety_triggers:
            if trigger.lower() in text:
                score += 0.25  # Personal triggers have higher weight
        
        # Cap at 1.0
        return min(score, 1.0)
    
    def _calculate_complexity(self, text: str) -> float:
        """Calculate complexity based on sentence length and structure"""
        sentences = re.split(r'[.!?]', text)
        if not sentences:
            return 0.0
            
        # Average sentence length as a complexity factor
        avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # Normalize to 0-1 scale (assuming >25 words is complex)
        complexity = min(avg_length / 25, 1.0)
        
        return complexity
    
    def _determine_stress_level(self, score: float) -> StressLevel:
        """Convert numerical score to StressLevel enum"""
        if score < 30:
            return StressLevel.LOW
        elif score < 70:
            return StressLevel.MEDIUM
        else:
            return StressLevel.HIGH
    
    def _collect_stress_factors(
        self, 
        text: str, 
        urgency_score: float, 
        emotional_score: float,
        trigger_score: float,
        complexity_score: float
    ) -> List[str]:
        """Collect specific factors that contributed to the stress score"""
        factors = []
        
        # Check urgency patterns
        if urgency_score > 0.2:
            for pattern in self.URGENT_PATTERNS:
                if re.search(pattern, text, re.IGNORECASE):
                    factors.append(f"Contains urgent language: '{re.search(pattern, text, re.IGNORECASE).group(0)}'")
                    break
        
        # Check emotional content
        if emotional_score > 0.3:
            for pattern in self.EMOTIONAL_PHRASES:
                if re.search(pattern, text, re.IGNORECASE):
                    factors.append(f"Contains emotionally loaded language: '{re.search(pattern, text, re.IGNORECASE).group(0)}'")
                    break
        
        # Check personal triggers
        if trigger_score > 0:
            factors.append("Contains personal anxiety triggers")
        
        # Check complexity
        if complexity_score > 0.7:
            factors.append("Contains complex sentence structures")
            
        return factors
    
    def _generate_recommendations(self, stress_level: StressLevel, factors: List[str]) -> List[str]:
        """Generate helpful recommendations based on the stress analysis"""
        recommendations = []
        
        if stress_level == StressLevel.HIGH:
            recommendations.append("Consider scheduling dedicated time to address this email")
            recommendations.append("Break down any requests into smaller, manageable tasks")
            
        if "Contains urgent language" in str(factors):
            recommendations.append("Assess the true urgency - is an immediate response actually required?")
            
        if "Contains emotionally loaded language" in str(factors):
            recommendations.append("Focus on the factual content rather than emotional tone")
            
        if "Contains complex sentence structures" in str(factors):
            recommendations.append("Use tools to simplify the content for clearer understanding")
            
        if "Contains personal anxiety triggers" in str(factors):
            recommendations.append("Consider having a trusted colleague review the email first")
            
        # Add general recommendation if list is empty
        if not recommendations:
            recommendations.append("This email appears to be low-stress. Handle it according to your normal workflow.")
            
        return recommendations

def analyze_email_stress(content: str, subject: str = "", user_preferences: Optional[Dict] = None) -> Dict:
    """
    Analyze email for stress factors and provide recommendations
    
    Args:
        content: The email body text
        subject: The email subject line
        user_preferences: Optional user preferences containing anxiety triggers
        
    Returns:
        Dictionary with stress analysis results
    """
    try:
        analyzer = StressAnalyzer(user_preferences)
        result = analyzer.analyze(content, subject)
        
        return {
            "stress_level": result.stress_level,
            "factors": result.factors,
            "recommendations": result.recommendations,
            "score": result.score
        }
    except Exception as e:
        error_msg = log_error(e, "Error in stress analysis")
        logger.error(f"Failed to analyze email stress: {error_msg}")
        
        # Return a fallback result
        return {
            "stress_level": StressLevel.LOW,
            "factors": ["Unable to analyze stress factors due to an error"],
            "recommendations": ["Proceed normally, but contact support if stress analysis is critical"],
            "score": 0.0,
            "error": str(e)
        } 