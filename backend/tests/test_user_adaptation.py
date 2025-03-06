import pytest
from datetime import datetime, timedelta
from backend.models.user import UserPreferences
from backend.services.feedback import FeedbackService
from backend.services.adaptation import UserAdaptationService
from backend.services.onboarding import OnboardingService
from unittest.mock import patch, AsyncMock

@pytest.fixture
def test_user_preferences():
    """Create initial user preferences from onboarding"""
    return UserPreferences(
        id=1,
        user_id=1,
        onboarding_completed=True,
        initial_assessment={
            "anxiety_level": "moderate",
            "preferred_communication_style": "direct",
            "cognitive_load_preference": "reduced",
            "notification_sensitivity": "medium"
        },
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
        stress_sensitivity="MEDIUM"
    )

@pytest.mark.asyncio
async def test_initial_setup_flow():
    """Test the initial user setup and preference determination"""
    onboarding = OnboardingService()
    
    # Simulate user responses to onboarding questions
    onboarding_responses = {
        "work_environment": "high_pressure",
        "communication_preferences": ["written", "structured"],
        "stress_triggers": ["deadlines", "meetings"],
        "preferred_notification_times": ["morning", "early_afternoon"],
        "accessibility_needs": ["reduced_cognitive_load"],
        "daily_email_volume": "high"
    }
    
    # Process onboarding responses
    preferences = await onboarding.process_initial_setup(onboarding_responses)
    
    # Verify appropriate initial settings
    assert preferences.stress_sensitivity == "HIGH"  # Based on high-pressure environment
    assert preferences.accessibility["reduce_cognitive_load"] is True
    assert "deadline" in preferences.anxiety_triggers
    assert preferences.notifications["quiet_hours"]["start"] >= "16:00"  # No late day notifications

@pytest.mark.asyncio
async def test_progressive_customization(test_user_preferences):
    """Test system's ability to progressively reveal and suggest customization options"""
    adaptation_service = UserAdaptationService()
    
    # Simulate user interaction history
    usage_patterns = [
        {"action": "opened_email", "stress_level": "HIGH", "time": "2024-02-20T14:00:00"},
        {"action": "used_summary", "stress_level": "HIGH", "time": "2024-02-20T14:01:00"},
        {"action": "used_action_items", "stress_level": "HIGH", "time": "2024-02-20T14:02:00"},
        {"action": "marked_helpful", "feature": "summary", "time": "2024-02-20T14:03:00"}
    ]
    
    # Get customization suggestions based on usage
    suggestions = await adaptation_service.analyze_usage_patterns(
        test_user_preferences, 
        usage_patterns
    )
    
    # Verify appropriate suggestions
    assert len(suggestions) > 0
    assert any(s["feature"] == "enhanced_summaries" for s in suggestions)
    assert any(s["type"] == "accessibility" for s in suggestions)
    assert not any(s["type"] == "advanced" for s in suggestions)  # Don't suggest advanced features too early

@pytest.mark.asyncio
async def test_feedback_collection_and_adaptation():
    """Test continuous feedback collection and system adaptation"""
    feedback_service = FeedbackService()
    
    # Simulate user feedback over time
    feedback_entries = [
        {
            "timestamp": datetime.now() - timedelta(days=1),
            "feature": "stress_analysis",
            "helpful": True,
            "stress_reduced": True,
            "comments": "Helped me prioritize"
        },
        {
            "timestamp": datetime.now() - timedelta(hours=12),
            "feature": "action_items",
            "helpful": True,
            "stress_reduced": True,
            "comments": "Clear next steps"
        },
        {
            "timestamp": datetime.now() - timedelta(hours=6),
            "feature": "notification_timing",
            "helpful": False,
            "stress_reduced": False,
            "comments": "Too many notifications"
        }
    ]
    
    # Process feedback and get adaptation suggestions
    adaptations = await feedback_service.process_feedback_entries(feedback_entries)
    
    # Verify appropriate adaptations
    assert "notification_frequency" in adaptations
    assert adaptations["notification_frequency"] == "reduce"
    assert "enhance_action_items" in adaptations
    assert adaptations["stress_analysis"]["confidence_level"] > 0.8

@pytest.mark.asyncio
async def test_automatic_feature_progression():
    """Test automatic progression of feature complexity based on user comfort"""
    adaptation_service = UserAdaptationService()
    
    # Simulate user interaction over time
    interaction_history = [
        {"feature": "basic_summary", "success": True, "timestamp": datetime.now() - timedelta(days=5)},
        {"feature": "basic_summary", "success": True, "timestamp": datetime.now() - timedelta(days=4)},
        {"feature": "action_items", "success": True, "timestamp": datetime.now() - timedelta(days=3)},
        {"feature": "stress_analysis", "success": True, "timestamp": datetime.now() - timedelta(days=2)},
    ]
    
    # Get progression suggestions
    progression = await adaptation_service.analyze_feature_progression(interaction_history)
    
    # Verify appropriate progression
    assert progression["ready_for_advanced_features"] is True
    assert "stress_pattern_analysis" in progression["suggested_features"]
    assert progression["user_confidence_level"] > 0.8

@pytest.mark.asyncio
async def test_contextual_help_system():
    """Test the system's ability to provide contextual help and suggestions"""
    adaptation_service = UserAdaptationService()
    
    # Simulate different user contexts
    contexts = [
        {
            "action": "viewing_email",
            "stress_level": "HIGH",
            "time_spent": "long",
            "previous_actions": []
        },
        {
            "action": "checking_notifications",
            "unread_count": "high",
            "time_of_day": "evening",
            "previous_actions": ["dismissed_several"]
        }
    ]
    
    for context in contexts:
        help_suggestions = await adaptation_service.get_contextual_help(context)
        
        # Verify context-appropriate suggestions
        assert len(help_suggestions) > 0
        assert all(s["context_relevant"] for s in help_suggestions)
        assert any(s["type"] == "immediate_action" for s in help_suggestions)
        assert any(s["type"] == "learning_opportunity" for s in help_suggestions)

@pytest.mark.asyncio
async def test_stress_reduction_effectiveness():
    """Test the system's ability to measure and improve stress reduction effectiveness"""
    feedback_service = FeedbackService()
    
    # Simulate stress measurements over time
    stress_measurements = [
        {"timestamp": datetime.now() - timedelta(days=30), "baseline": True, "level": "HIGH"},
        {"timestamp": datetime.now() - timedelta(days=20), "level": "MEDIUM"},
        {"timestamp": datetime.now() - timedelta(days=10), "level": "MEDIUM"},
        {"timestamp": datetime.now() - timedelta(days=1), "level": "LOW"}
    ]
    
    effectiveness = await feedback_service.analyze_stress_reduction_effectiveness(
        stress_measurements
    )
    
    # Verify effectiveness metrics
    assert effectiveness["trend"] == "improving"
    assert effectiveness["reduction_percentage"] > 30
    assert len(effectiveness["contributing_factors"]) > 0
    assert effectiveness["user_satisfaction_correlation"] > 0.7 