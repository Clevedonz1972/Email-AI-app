import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.models.user import User, UserPreferences
from backend.models.email import Email, StressLevel
from backend.models.feedback import QuickFeedback, DetailedFeedback, AccessibilityFeedback
from backend.services.stress_analysis import analyze_email_stress
from backend.services.notification import NotificationService
from backend.services.content import adapt_content

@pytest.fixture
def test_user_with_preferences(db: Session):
    """Create a test user with specific accessibility preferences"""
    user = User(
        email="test@example.com",
        full_name="Test User",
        is_active=True,
        preferences={
            "accessibility": {
                "high_contrast": True,
                "large_text": True,
                "reduced_motion": True,
                "text_scale": 120,
            },
            "simplified_view": {
                "enabled": True,
                "hide_metadata": False,
                "focus_mode": True,
                "auto_enable_on_stress": True
            }
        }
    )
    user.set_password("testpassword")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.mark.asyncio
async def test_complete_email_workflow(
    client: TestClient,
    db: Session,
    test_user_with_preferences: User
):
    """Test complete workflow from email receipt to user interaction"""
    # 1. Create and analyze email
    email_data = {
        "subject": "Urgent Project Deadline",
        "content": "We need this completed by tomorrow! This is extremely urgent and critical.",
        "sender": {"email": "manager@example.com", "name": "Project Manager"},
        "recipient": {"email": test_user_with_preferences.email, "name": test_user_with_preferences.full_name}
    }
    
    response = client.post(
        "/api/emails",
        json=email_data,
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert response.status_code == 200
    email_id = response.json()["id"]

    # 2. Verify stress analysis
    analysis_response = client.post(
        f"/api/emails/{email_id}/analyze",
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert analysis_response.status_code == 200
    analysis = analysis_response.json()
    assert analysis["stress_level"] == "HIGH"
    assert analysis["priority"] == "HIGH"

    # 3. Test content adaptation based on user preferences
    email = db.query(Email).filter(Email.id == email_id).first()
    adapted_content = await adapt_content(email.content, test_user_with_preferences.preferences)
    assert adapted_content["format"] == "high_contrast"
    assert "font_size" in adapted_content

    # 4. Test notification with accessibility preferences
    notification_service = NotificationService()
    notification_result = await notification_service.send_notification(
        test_user_with_preferences,
        {"type": "email_received", "email_id": email_id}
    )
    assert notification_result["status"] == "sent"
    assert "format_settings" in notification_result["message"]

    # 5. Submit feedback
    quick_feedback = QuickFeedback(
        user_id=test_user_with_preferences.id,
        email_id=email_id,
        type="stress_level",
        is_positive=True
    )
    db.add(quick_feedback)
    
    accessibility_feedback = AccessibilityFeedback(
        user_id=test_user_with_preferences.id,
        feature_type="high_contrast",
        is_helpful=True,
        suggestions="Works well but could be darker"
    )
    db.add(accessibility_feedback)
    db.commit()

    # 6. Verify feedback is recorded
    feedback_response = client.get(
        "/api/feedback/stats",
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert feedback_response.status_code == 200
    assert len(feedback_response.json()["quick_feedback"]) > 0

@pytest.mark.asyncio
async def test_stress_level_adaptation(
    client: TestClient,
    db: Session,
    test_user_with_preferences: User
):
    """Test system adaptation to user stress levels"""
    # Create multiple emails with varying stress levels
    emails_data = [
        {
            "subject": "Regular Update",
            "content": "Weekly progress report attached.",
            "stress_level": "LOW"
        },
        {
            "subject": "Important Meeting",
            "content": "Please prepare for tomorrow's presentation.",
            "stress_level": "MEDIUM"
        },
        {
            "subject": "Critical Issue",
            "content": "Production system down! Immediate attention required!",
            "stress_level": "HIGH"
        }
    ]

    for data in emails_data:
        email = Email(
            user_id=test_user_with_preferences.id,
            subject=data["subject"],
            content=data["content"],
            sender={"email": "test@example.com", "name": "Test Sender"},
            recipient={"email": test_user_with_preferences.email, "name": "Test User"},
            stress_level=data["stress_level"]
        )
        db.add(email)
    db.commit()

    # Test system adaptation
    response = client.get(
        "/api/emails",
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert response.status_code == 200
    emails = response.json()

    # Verify stress-based adaptations
    high_stress_email = next(e for e in emails if e["stress_level"] == "HIGH")
    assert high_stress_email["simplified_view_enabled"] == True

@pytest.mark.asyncio
async def test_accessibility_preference_sync(
    client: TestClient,
    db: Session,
    test_user_with_preferences: User
):
    """Test synchronization of accessibility preferences across components"""
    # Update user preferences
    new_preferences = {
        "accessibility": {
            "high_contrast": True,
            "large_text": True,
            "reduced_motion": True,
            "text_scale": 150,
        }
    }
    
    response = client.put(
        "/api/preferences",
        json=new_preferences,
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert response.status_code == 200
    
    # Verify preferences are applied to email view
    email_response = client.get(
        "/api/emails",
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert email_response.status_code == 200
    
    # Create feedback about accessibility
    feedback = DetailedFeedback(
        user_id=test_user_with_preferences.id,
        type="accessibility",
        feedback="High contrast mode is very helpful",
        rating=5.0
    )
    db.add(feedback)
    db.commit()
    
    # Verify feedback analytics
    analytics_response = client.get(
        "/api/feedback/analytics",
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert analytics_response.status_code == 200
    analytics = analytics_response.json()
    assert "accessibility" in analytics["feedback_by_type"]

@pytest.mark.asyncio
async def test_stress_monitoring_effectiveness(
    client: TestClient,
    db: Session,
    test_user_with_preferences: User
):
    """Test effectiveness of stress monitoring and adaptations"""
    # Create a series of emails over time
    timestamps = [
        datetime.utcnow() - timedelta(hours=i) for i in range(24, -1, -4)
    ]
    
    for i, timestamp in enumerate(timestamps):
        stress_level = "HIGH" if i % 3 == 0 else "MEDIUM" if i % 3 == 1 else "LOW"
        email = Email(
            user_id=test_user_with_preferences.id,
            subject=f"Test Email {i}",
            content=f"Test content {i}",
            sender={"email": "test@example.com", "name": "Test Sender"},
            recipient={"email": test_user_with_preferences.email, "name": "Test User"},
            stress_level=stress_level,
            timestamp=timestamp
        )
        db.add(email)
    db.commit()

    # Get stress analysis over time
    response = client.get(
        "/api/analytics/stress",
        params={"timeframe": "24h"},
        headers={"Authorization": f"Bearer {test_user_with_preferences.create_access_token()}"}
    )
    assert response.status_code == 200
    analysis = response.json()
    
    # Verify stress patterns are detected
    assert "stress_pattern" in analysis
    assert "peak_stress_hours" in analysis
    assert "adaptation_recommendations" in analysis 