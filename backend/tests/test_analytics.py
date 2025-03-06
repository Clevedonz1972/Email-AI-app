import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.models.email import Email
from backend.models.feedback import QuickFeedback, DetailedFeedback, AccessibilityFeedback

@pytest.fixture
def test_data(db: Session, test_user: User):
    """Create test data for analytics"""
    # Create emails with different stress levels
    now = datetime.utcnow()
    emails = []
    for i in range(10):
        stress_level = "HIGH" if i < 3 else "MEDIUM" if i < 6 else "LOW"
        email = Email(
            user_id=test_user.id,
            subject=f"Test Email {i}",
            content=f"Test content {i}",
            sender={"email": "test@example.com", "name": "Test Sender"},
            recipient={"email": test_user.email, "name": test_user.full_name},
            stress_level=stress_level,
            timestamp=now - timedelta(hours=i)
        )
        emails.append(email)
    
    # Create feedback
    quick_feedback = [
        QuickFeedback(
            user_id=test_user.id,
            type="stress_level",
            email_id=emails[0].id,
            is_positive=True
        ),
        QuickFeedback(
            user_id=test_user.id,
            type="accessibility",
            is_positive=False
        )
    ]
    
    detailed_feedback = [
        DetailedFeedback(
            user_id=test_user.id,
            type="accessibility",
            feedback="High contrast mode needs improvement",
            rating=3.5
        ),
        DetailedFeedback(
            user_id=test_user.id,
            type="stress_level",
            feedback="Good stress detection",
            rating=4.5
        )
    ]
    
    accessibility_feedback = [
        AccessibilityFeedback(
            user_id=test_user.id,
            feature_type="high_contrast",
            is_helpful=True,
            suggestions="Make contrast stronger"
        ),
        AccessibilityFeedback(
            user_id=test_user.id,
            feature_type="text_scale",
            is_helpful=True,
            suggestions="Add more size options"
        )
    ]
    
    db.add_all(emails + quick_feedback + detailed_feedback + accessibility_feedback)
    db.commit()
    
    return {
        "emails": emails,
        "quick_feedback": quick_feedback,
        "detailed_feedback": detailed_feedback,
        "accessibility_feedback": accessibility_feedback
    }

def test_stress_analytics_24h(client, test_user, test_data):
    """Test stress analytics for 24-hour period"""
    response = client.get(
        "/api/analytics/stress",
        params={"timeframe": "24h"},
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "stress_pattern" in data
    assert "stress_distribution" in data
    assert "peak_stress_hours" in data
    assert "adaptation_recommendations" in data
    
    # Verify stress distribution
    assert data["stress_distribution"]["HIGH"] == 3
    assert data["stress_distribution"]["MEDIUM"] == 3
    assert data["stress_distribution"]["LOW"] == 4

def test_stress_analytics_7d(client, test_user, test_data):
    """Test stress analytics for 7-day period"""
    response = client.get(
        "/api/analytics/stress",
        params={"timeframe": "7d"},
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["timeframe"] == "7d"
    assert "stress_pattern" in data

def test_feedback_analytics(client, test_user, test_data):
    """Test feedback analytics"""
    response = client.get(
        "/api/analytics/feedback",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify feedback statistics
    assert "feedback_by_type" in data
    assert "average_ratings" in data
    assert "accessibility_stats" in data
    
    # Check feedback counts
    assert data["total_feedback_count"] == 4  # 2 quick + 2 detailed
    
    # Verify accessibility stats
    assert data["accessibility_stats"]["total_issues"] == 2
    assert "feature_feedback" in data["accessibility_stats"]
    
    # Check average ratings
    assert "accessibility" in data["average_ratings"]
    assert "stress_level" in data["average_ratings"]

def test_unauthorized_access(client):
    """Test unauthorized access to analytics"""
    response = client.get("/api/analytics/stress")
    assert response.status_code == 401
    
    response = client.get("/api/analytics/feedback")
    assert response.status_code == 401

def test_stress_analytics_with_no_data(client, test_user):
    """Test stress analytics when no data is available"""
    response = client.get(
        "/api/analytics/stress",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["stress_pattern"] == "insufficient_data"
    assert data["total_emails_analyzed"] == 0

def test_feedback_analytics_with_no_data(client, test_user):
    """Test feedback analytics when no feedback is available"""
    response = client.get(
        "/api/analytics/feedback",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_feedback_count"] == 0
    assert len(data["feedback_by_type"]) == 0 