import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.models.user import User
from backend.models.email import Email
from backend.tasks.worker import process_email
from backend.database import SessionLocal
import json
import uuid

@pytest.fixture
def test_user(db: SessionLocal):
    """Create a test user with accessibility preferences"""
    unique_email = f"test_{uuid.uuid4()}@example.com"
    user = User(
        email=unique_email,
        full_name="Test User",
        password_hash="test_hash",
        is_active=True,
        preferences={
            "accessibility": {
                "screen_reader": True,
                "high_contrast": True,
                "large_text": True,
                "reduced_motion": True,
                "text_scale": 150
            },
            "notifications": {
                "high_stress_only": True,
                "quiet_hours": {
                    "start": "22:00",
                    "end": "07:00"
                }
            }
        }
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def mock_openai():
    """Mock OpenAI API responses"""
    async def mock_analyze(content: str):
        return {
            "stress_level": "HIGH",
            "priority": "HIGH",
            "summary": "Test summary with accessibility considerations",
            "action_items": ["Urgent response needed", "Schedule follow-up"],
            "sentiment_score": 0.2
        }
    return mock_analyze

@pytest.fixture
def mock_notification_service():
    """Mock notification service"""
    class MockNotificationService:
        def __init__(self):
            self.notifications = []
            
        def send_notification(self, user, data):
            self.notifications.append(data)
            
    return MockNotificationService()

@pytest.mark.asyncio
async def test_stress_analysis_with_accessibility(test_user, db, mock_openai, mock_notification_service):
    """Test email stress analysis with accessibility preferences"""
    # Create test email
    email = Email(
        user_id=test_user.id,
        subject="Test Email",
        content="This is a test email with high stress content",
        sender={"email": "sender@example.com", "name": "Sender"},
        recipient={"email": "recipient@example.com", "name": "Recipient"}
    )
    db.add(email)
    db.commit()
    
    # Process email
    await process_email(
        email_id=email.id,
        user_id=test_user.id,
        db_session=db,
        openai_client=mock_openai,
        notification_service=mock_notification_service
    )
    
    # Verify results
    db.refresh(email)
    assert email.stress_level == "HIGH"
    assert email.priority == "HIGH"
    assert len(mock_notification_service.notifications) == 1
    assert mock_notification_service.notifications[0]["type"] == "stress_alert"

@pytest.mark.asyncio
async def test_content_processing_with_accessibility(test_user, db, mock_openai, mock_notification_service):
    """Test content processing with accessibility preferences"""
    # Create test email
    email = Email(
        user_id=test_user.id,
        subject="Test Email",
        content="This is a test email for content processing",
        sender={"email": "sender@example.com", "name": "Sender"},
        recipient={"email": "recipient@example.com", "name": "Recipient"}
    )
    db.add(email)
    db.commit()
    
    # Process email
    await process_email(
        email_id=email.id,
        user_id=test_user.id,
        db_session=db,
        openai_client=mock_openai,
        notification_service=mock_notification_service
    )
    
    # Verify results
    db.refresh(email)
    assert email.is_processed
    assert "accessibility considerations" in email.summary.lower()
    assert len(email.action_items) > 0

@pytest.mark.asyncio
async def test_notification_preferences_integration(test_user, db, mock_openai, mock_notification_service):
    """Test notification preferences with accessibility settings"""
    # Create test email
    email = Email(
        user_id=test_user.id,
        subject="Test Email",
        content="This is a test email for notifications",
        sender={"email": "sender@example.com", "name": "Sender"},
        recipient={"email": "recipient@example.com", "name": "Recipient"}
    )
    db.add(email)
    db.commit()
    
    # Process email
    await process_email(
        email_id=email.id,
        user_id=test_user.id,
        db_session=db,
        openai_client=mock_openai,
        notification_service=mock_notification_service
    )
    
    # Verify notifications
    assert len(mock_notification_service.notifications) == 1
    notification = mock_notification_service.notifications[0]
    assert notification["type"] == "stress_alert"
    assert email.subject in notification["message"]

@pytest.mark.asyncio
async def test_content_adaptation(test_user, db, mock_openai, mock_notification_service):
    """Test content adaptation based on accessibility preferences"""
    # Create test email
    email = Email(
        user_id=test_user.id,
        subject="Test Email",
        content="This is a test email for content adaptation",
        sender={"email": "sender@example.com", "name": "Sender"},
        recipient={"email": "recipient@example.com", "name": "Recipient"}
    )
    db.add(email)
    db.commit()
    
    # Process email
    await process_email(
        email_id=email.id,
        user_id=test_user.id,
        db_session=db,
        openai_client=mock_openai,
        notification_service=mock_notification_service
    )
    
    # Verify content adaptation
    db.refresh(email)
    assert email.is_processed
    assert email.summary is not None
    assert email.action_items is not None

@pytest.mark.asyncio
async def test_stress_monitoring_over_time(test_user, db, mock_openai, mock_notification_service):
    """Test stress level monitoring over multiple emails"""
    # Create multiple test emails
    emails = []
    for i in range(5):
        email = Email(
            user_id=test_user.id,
            subject=f"Test Email {i}",
            content=f"This is test email content {i}",
            sender={"email": "sender@example.com", "name": "Sender"},
            recipient={"email": "recipient@example.com", "name": "Recipient"}
        )
        db.add(email)
        emails.append(email)
    db.commit()
    
    # Process all emails
    for email in emails:
        await process_email(
            email_id=email.id,
            user_id=test_user.id,
            db_session=db,
            openai_client=mock_openai,
            notification_service=mock_notification_service
        )
    
    # Verify stress monitoring
    for email in emails:
        db.refresh(email)
        assert email.stress_level == "HIGH"
        assert email.is_processed
    
    # Verify notifications were sent for all high-stress emails
    assert len(mock_notification_service.notifications) == len(emails) 