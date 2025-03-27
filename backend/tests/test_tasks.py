import pytest
from datetime import datetime, timedelta
from sqlalchemy import func
from unittest.mock import patch, MagicMock
from backend.models.email import Email, StressLevel, Priority
from backend.models.user import User, UserPreferences
from backend.tasks.worker import process_email, cleanup_old_emails, update_email_analytics
from backend.database import SessionLocal
import uuid

@pytest.fixture
def mock_analysis():
    """Mock response from analyze_content"""
    return {
        "stress_level": StressLevel.LOW,
        "priority": Priority.MEDIUM,
        "summary": "Test summary",
        "action_items": ["Test action"],
        "sentiment_score": 0.5
    }

@pytest.fixture
def test_user(db):
    """Create a test user with a unique email"""
    unique_id = str(uuid.uuid4())
    user = User(
        email=f"test_{unique_id}@example.com",
        full_name=f"Test User {unique_id}",
        password_hash="test_hash",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_emails(db, test_user):
    """Create test emails"""
    emails = []
    now = datetime.utcnow()
    for i in range(5):
        email = Email(
            user_id=test_user.id,
            subject=f"Test Email {i}",
            content=f"Test content {i}",
            sender={"email": "sender@example.com", "name": "Sender"},
            recipient={"email": "recipient@example.com", "name": "Recipient"},
            timestamp=now - timedelta(days=i),
            created_at=now - timedelta(days=i),
            is_read=False,
            is_processed=True,
            is_archived=False,
            is_deleted=False,
            stress_level=StressLevel.LOW,
            priority=Priority.MEDIUM
        )
        emails.append(email)
        db.add(email)
    
    db.commit()
    for email in emails:
        db.refresh(email)
    return emails

@patch("backend.tasks.worker.analyze_content")
def test_process_email(mock_analyze, db, test_user, test_emails, mock_analysis):
    """Test email processing"""
    mock_analyze.return_value = mock_analysis
    email = test_emails[0]
    email.is_processed = False
    db.commit()
    
    result = process_email(email.id, test_user.id)
    
    db.refresh(email)
    
    assert email.is_processed is True
    assert email.stress_level == mock_analysis["stress_level"]
    assert email.priority == mock_analysis["priority"]
    assert email.summary == mock_analysis["summary"]
    assert email.action_items == mock_analysis["action_items"]
    assert email.sentiment_score == mock_analysis["sentiment_score"]

def test_process_email_not_found(db):
    """Test processing non-existent email"""
    with pytest.raises(ValueError, match="Email not found"):
        process_email(999, 999)

def test_cleanup_old_emails(db, test_user, test_emails):
    """Test cleaning up old emails"""
    # Set some emails as old
    now = datetime.utcnow()
    old_date = now - timedelta(days=31)
    for i, email in enumerate(test_emails[:3]):
        email.created_at = old_date
        email.timestamp = old_date
    db.commit()
    
    result = cleanup_old_emails(days=30)
    assert result["archived_count"] == 3
    
    # Verify emails are archived
    archived_count = db.query(Email).filter(
        Email.user_id == test_user.id,
        Email.is_archived == True
    ).count()
    assert archived_count == 3

def test_update_email_analytics(db, test_user, test_emails):
    """Test updating email analytics"""
    # Ensure no emails are archived and all are processed
    for email in test_emails:
        email.is_archived = False
        email.is_processed = True
        email.stress_level = StressLevel.LOW
        email.priority = Priority.MEDIUM
    db.commit()
    
    result = update_email_analytics(test_user.id)
    
    assert result["total_emails"] == 5
    assert result["unread_emails"] == 5
    assert result["stress_level_distribution"]["low"] == 5  # Use enum value
    assert result["priority_distribution"]["MEDIUM"] == 5  # Use enum value

def test_periodic_tasks(db, test_user, test_emails):
    """Test periodic tasks execution"""
    # Set one email as old
    now = datetime.utcnow()
    old_date = now - timedelta(days=31)
    test_emails[0].created_at = old_date
    test_emails[0].timestamp = old_date
    db.commit()
    
    # Run cleanup task
    cleanup_result = cleanup_old_emails(days=30)
    assert cleanup_result["archived_count"] == 1
    
    # Run analytics task
    analytics_result = update_email_analytics(test_user.id)
    assert analytics_result["total_emails"] == 4  # One email is archived
    assert analytics_result["unread_emails"] == 4

@patch("backend.tasks.worker.analyze_content")
def test_task_retry_on_failure(mock_analyze, db, test_user, test_emails):
    """Test task retry mechanism"""
    mock_analyze.side_effect = Exception("Test error")
    email = test_emails[0]
    
    with pytest.raises(Exception):
        process_email(email.id, test_user.id)

@pytest.fixture
def test_user_preferences(db, test_user):
    """Create test user preferences"""
    preferences = UserPreferences(
        user_id=test_user.id,
        accessibility={
            "high_contrast": True,
            "large_text": True,
            "reduced_motion": True,
            "text_scale": 150
        },
        stress_sensitivity="MEDIUM",
        anxiety_triggers=["deadline", "urgent"]
    )
    db.add(preferences)
    db.commit()
    db.refresh(preferences)
    return preferences

@patch("backend.tasks.worker.analyze_content")
def test_process_email_with_preferences(mock_analyze, db, test_user, test_emails, test_user_preferences):
    """Test email processing with user preferences"""
    email = test_emails[0]
    email.is_processed = False
    email.content = "URGENT: Deadline approaching for project delivery"
    db.commit()
    
    # Update mock analysis based on content and preferences
    mock_analysis = {
        "stress_level": StressLevel.HIGH,
        "priority": Priority.HIGH,
        "summary": "Deadline approaching for project delivery",
        "action_items": ["Review project status", "Prepare delivery"],
        "sentiment_score": 0.3
    }
    mock_analyze.return_value = mock_analysis
    
    result = process_email(email.id, test_user.id)
    
    db.refresh(email)
    assert email.stress_level == StressLevel.HIGH
    assert email.priority == Priority.HIGH
    assert "deadline" in email.summary.lower()

@patch("backend.tasks.worker.analyze_content")
def test_process_email_with_accessibility(mock_analyze, db, test_user, test_emails, test_user_preferences):
    """Test email processing with accessibility preferences"""
    email = test_emails[0]
    email.is_processed = False
    db.commit()
    
    # Mock analysis with simplified content for accessibility
    mock_analysis = {
        "stress_level": StressLevel.LOW,
        "priority": Priority.MEDIUM,
        "summary": "Simple summary for better readability",
        "action_items": ["Clear action item 1", "Clear action item 2"],
        "sentiment_score": 0.5
    }
    mock_analyze.return_value = mock_analysis
    
    result = process_email(email.id, test_user.id)
    
    db.refresh(email)
    assert len(email.summary) <= 100  # Ensure summary is concise
    assert all(len(item) <= 50 for item in email.action_items)  # Ensure action items are clear

def test_update_email_analytics_with_stress_levels(db, test_user, test_emails):
    """Test email analytics with different stress levels"""
    stress_levels = [StressLevel.LOW, StressLevel.MEDIUM, StressLevel.HIGH]
    for i, email in enumerate(test_emails):
        email.is_archived = False
        email.is_processed = True
        email.stress_level = stress_levels[i % len(stress_levels)]
    db.commit()
    
    result = update_email_analytics(test_user.id)
    
    distribution = result["stress_level_distribution"]
    assert sum(distribution.values()) == len(test_emails)
    assert all(level.lower() in distribution for level in ["low", "medium", "high"])

def test_update_email_analytics_with_priorities(db, test_user, test_emails):
    """Test email analytics with different priorities"""
    priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH]
    for i, email in enumerate(test_emails):
        email.is_archived = False
        email.is_processed = True
        email.priority = priorities[i % len(priorities)]
    db.commit()
    
    result = update_email_analytics(test_user.id)
    
    distribution = result["priority_distribution"]
    assert sum(distribution.values()) == len(test_emails)
    assert all(priority in distribution for priority in ["LOW", "MEDIUM", "HIGH"])

@patch("backend.tasks.worker.analyze_content")
def test_process_email_content_analysis(mock_analyze, db, test_user, test_emails):
    """Test detailed content analysis during email processing"""
    email = test_emails[0]
    email.is_processed = False
    email.content = """
    URGENT: Project Update Required
    
    Hi Team,
    We need to complete the following tasks by EOD:
    1. Update project timeline
    2. Schedule team meeting
    3. Review deliverables
    
    Please treat this as high priority.
    
    Thanks,
    Manager
    """
    db.commit()
    
    mock_analyze.return_value = {
        "stress_level": StressLevel.HIGH,
        "priority": Priority.HIGH,
        "summary": "Urgent project update required with three critical tasks",
        "action_items": [
            "Update project timeline",
            "Schedule team meeting",
            "Review deliverables"
        ],
        "sentiment_score": -0.2
    }
    
    result = process_email(email.id, test_user.id)
    
    db.refresh(email)
    assert email.stress_level == StressLevel.HIGH
    assert email.priority == Priority.HIGH
    assert len(email.action_items) == 3
    assert email.sentiment_score < 0  # Negative sentiment due to urgency 