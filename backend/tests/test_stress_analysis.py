import pytest
from datetime import datetime, timedelta
from backend.models.email import StressLevel, Priority, EmailAnalysis
from backend.models.user import UserPreferences
from backend.services.stress_analysis import StressAnalyzer, analyze_email_stress
from backend.services.content import adapt_content
from backend.services.notification import NotificationService
from unittest.mock import patch, AsyncMock

@pytest.fixture
def user_preferences():
    """Create test user preferences with accessibility settings"""
    return UserPreferences(
        id=1,
        user_id=1,
        accessibility={
            "high_contrast": True,
            "large_text": True,
            "reduced_motion": True,
            "text_scale": 150
        },
        notifications={
            "email": True,
            "push": False,
            "quiet_hours": {"start": "22:00", "end": "07:00"}
        },
        ai_assistance={
            "level": "high",
            "auto_categorize": True,
            "stress_monitoring": True
        },
        stress_sensitivity="HIGH",
        anxiety_triggers=["deadline", "urgent", "asap"]
    )

@pytest.fixture
def stress_analyzer(user_preferences):
    """Create StressAnalyzer instance"""
    return StressAnalyzer(user_preferences)

@pytest.fixture
def test_email():
    """Create test email with stress indicators"""
    return {
        "id": "test_id",
        "subject": "Urgent Deadline Approaching",
        "content": "This is an URGENT email regarding the project deadline. Please respond ASAP.",
        "sender": {"email": "sender@test.com", "name": "Test Sender"},
        "timestamp": datetime.utcnow().isoformat()
    }

def test_check_content_triggers(stress_analyzer):
    """Test detection of stress triggers in content"""
    content = "This is an URGENT email with a DEADLINE that needs attention ASAP!"
    triggers = stress_analyzer._check_content_triggers(content)
    
    assert len(triggers["urgent_words"]) >= 2
    assert len(triggers["anxiety_triggers"]) >= 2
    assert triggers["has_deadlines"] is True

def test_stress_level_calculation(stress_analyzer):
    """Test stress level calculation with different content"""
    test_cases = [
        {
            "content": "Regular update on project progress.",
            "expected": StressLevel.LOW
        },
        {
            "content": "Please review this when you have time.",
            "expected": StressLevel.LOW
        },
        {
            "content": "Important deadline approaching next week.",
            "expected": StressLevel.MEDIUM
        },
        {
            "content": "URGENT: Critical issue needs immediate attention!",
            "expected": StressLevel.HIGH
        }
    ]
    
    for case in test_cases:
        triggers = stress_analyzer._check_content_triggers(case["content"])
        level = stress_analyzer._calculate_base_stress_level(triggers)
        assert level == case["expected"]

def test_sensitivity_adjustment(stress_analyzer):
    """Test stress level adjustment based on user sensitivity"""
    # Test high sensitivity adjustment
    base_levels = [StressLevel.LOW, StressLevel.MEDIUM, StressLevel.HIGH]
    stress_analyzer.stress_sensitivity = "HIGH"
    
    for base_level in base_levels:
        adjusted = stress_analyzer._adjust_for_user_sensitivity(base_level)
        if base_level != StressLevel.HIGH:
            assert adjusted.value > base_level.value

@pytest.mark.asyncio
async def test_analyze_email_stress_success(test_email, user_preferences):
    """Test successful email stress analysis with accessibility preferences"""
    mock_ai_response = {
        "stress_level": "MEDIUM",
        "priority": "HIGH",
        "summary": "Urgent project deadline",
        "action_items": ["Respond to email", "Review deadline"],
        "sentiment_score": -0.2
    }
    
    with patch("backend.services.openai_service.analyze_content", 
               return_value=mock_ai_response):
        result = await analyze_email_stress(test_email, user_preferences)
        
        assert isinstance(result, EmailAnalysis)
        assert result.stress_level == StressLevel.HIGH  # Adjusted for high sensitivity
        assert result.priority == Priority.HIGH
        assert len(result.action_items) >= 1
        assert result.sentiment_score < 0

@pytest.mark.asyncio
async def test_analyze_email_stress_with_accessibility(test_email, user_preferences):
    """Test stress analysis with different accessibility preferences"""
    # Test with reduced stress sensitivity
    user_preferences.stress_sensitivity = "LOW"
    user_preferences.accessibility["high_contrast"] = True
    
    mock_ai_response = {
        "stress_level": "HIGH",
        "priority": "HIGH",
        "summary": "Project deadline discussion",
        "action_items": ["Review deadline"],
        "sentiment_score": -0.1
    }
    
    with patch("backend.services.openai_service.analyze_content", 
               return_value=mock_ai_response):
        result = await analyze_email_stress(test_email, user_preferences)
        
        assert result.stress_level == StressLevel.MEDIUM  # Adjusted down
        assert "high_contrast" in result.explanation.lower()

@pytest.mark.asyncio
async def test_content_adaptation(test_email, user_preferences):
    """Test content adaptation based on accessibility preferences"""
    # Test with various accessibility settings
    test_cases = [
        {"high_contrast": True, "large_text": True},
        {"high_contrast": False, "large_text": True},
        {"high_contrast": True, "large_text": False}
    ]
    
    for case in test_cases:
        user_preferences.accessibility.update(case)
        adapted_content = await adapt_content(test_email["content"], 
                                           user_preferences.accessibility)
        
        assert isinstance(adapted_content, dict)
        assert "content" in adapted_content
        assert "format" in adapted_content
        assert adapted_content["format"] == ("high_contrast" if case["high_contrast"] else "normal")

@pytest.mark.asyncio
async def test_stress_monitoring_over_time(test_email, user_preferences):
    """Test stress pattern monitoring over time"""
    # Create a series of emails over time
    test_emails = []
    for i in range(5):
        email = test_email.copy()
        email["id"] = f"test_{i}"
        email["timestamp"] = (datetime.utcnow() - timedelta(days=i)).isoformat()
        test_emails.append(email)
    
    mock_ai_response = {
        "stress_level": "MEDIUM",
        "priority": "MEDIUM",
        "summary": "Test email",
        "action_items": ["Action item"],
        "sentiment_score": 0.0
    }
    
    with patch("backend.services.openai_service.analyze_content", 
               return_value=mock_ai_response):
        results = []
        for email in test_emails:
            result = await analyze_email_stress(email, user_preferences)
            results.append(result)
        
        # Verify stress pattern analysis
        assert len(results) == 5
        assert all(isinstance(r.stress_level, StressLevel) for r in results)
        assert all(isinstance(r.timestamp, datetime) for r in results)

@pytest.mark.asyncio
async def test_cognitive_load_reduction(test_email, user_preferences):
    """Test content adaptation for cognitive load reduction"""
    # Simulate a user who needs reduced cognitive load
    user_preferences.accessibility.update({
        "reduce_cognitive_load": True,
        "simplified_layout": True,
        "break_into_sections": True
    })
    
    mock_ai_response = {
        "stress_level": "HIGH",
        "priority": "HIGH",
        "summary": "Project deadline discussion",
        "action_items": ["Review deadline", "Prepare report", "Schedule meeting"],
        "sentiment_score": -0.3
    }
    
    with patch("backend.services.openai_service.analyze_content", 
               return_value=mock_ai_response):
        result = await analyze_email_stress(test_email, user_preferences)
        
        # Verify content is broken down appropriately
        assert len(result.action_items) <= 3  # Limit number of action items
        assert len(result.summary) <= 100     # Keep summary concise
        assert result.explanation.count('.') <= 3  # Limit number of sentences

@pytest.mark.asyncio
async def test_anxiety_trigger_customization(test_email, user_preferences):
    """Test personalized anxiety trigger detection"""
    # Simulate different anxiety triggers for different users
    test_cases = [
        {
            "triggers": ["meeting", "presentation", "speak"],
            "content": "You'll need to give a presentation at tomorrow's meeting.",
            "expected_level": StressLevel.HIGH
        },
        {
            "triggers": ["urgent", "immediate", "asap"],
            "content": "Please review when you have time next week.",
            "expected_level": StressLevel.LOW
        },
        {
            "triggers": ["budget", "cost", "expense"],
            "content": "The project is over budget and needs immediate attention.",
            "expected_level": StressLevel.HIGH
        }
    ]
    
    for case in test_cases:
        user_preferences.anxiety_triggers = case["triggers"]
        test_email["content"] = case["content"]
        
        result = await analyze_email_stress(test_email, user_preferences)
        assert result.stress_level == case["expected_level"]

@pytest.mark.asyncio
async def test_notification_timing_adaptation(test_email, user_preferences):
    """Test adaptive notification timing based on user stress patterns"""
    notification_service = NotificationService()
    
    # Simulate different times of day
    test_times = [
        datetime.now().replace(hour=9),  # Morning
        datetime.now().replace(hour=12), # Noon
        datetime.now().replace(hour=17), # Evening
        datetime.now().replace(hour=23), # Night (quiet hours)
    ]
    
    for test_time in test_times:
        with patch("datetime.datetime.now", return_value=test_time):
            should_notify = await notification_service.check_notification_timing(user_preferences)
            
            if test_time.hour >= 22 or test_time.hour < 7:
                assert not should_notify, "Should respect quiet hours"
            else:
                assert should_notify, "Should allow notifications during active hours"

@pytest.mark.asyncio
async def test_stress_pattern_learning(test_email, user_preferences):
    """Test system's ability to learn and adapt to user's stress patterns"""
    # Simulate a series of emails over a week
    weekly_emails = []
    stress_patterns = {
        0: StressLevel.HIGH,   # Monday
        1: StressLevel.MEDIUM, # Tuesday
        2: StressLevel.MEDIUM, # Wednesday
        3: StressLevel.HIGH,   # Thursday
        4: StressLevel.LOW,    # Friday
    }
    
    for day, stress_level in stress_patterns.items():
        email = test_email.copy()
        email["timestamp"] = (datetime.now() - timedelta(days=day)).isoformat()
        weekly_emails.append((email, stress_level))
    
    results = []
    for email, expected_level in weekly_emails:
        mock_response = {
            "stress_level": expected_level.value,
            "priority": "MEDIUM",
            "summary": "Test email",
            "action_items": ["Action item"],
            "sentiment_score": -0.2
        }
        
        with patch("backend.services.openai_service.analyze_content", 
                  return_value=mock_response):
            result = await analyze_email_stress(email, user_preferences)
            results.append(result)
    
    # Verify pattern detection
    assert len(results) == len(stress_patterns)
    assert any(r.stress_level == StressLevel.HIGH for r in results)
    assert "pattern_detected" in results[-1].explanation.lower() 