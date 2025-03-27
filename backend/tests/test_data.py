from backend.models import User, Email
from backend.utils.password import get_password_hash
from backend.models.email import StressLevel, Priority
from datetime import datetime, timedelta
from typing import Dict, List
import json

def create_test_users(db_session):
    """Create test users with different accessibility needs"""
    users = {
        "adhd_user": User(
            email="adhd_test@example.com",
            password_hash=get_password_hash("test123"),
            full_name="ADHD Test User",
            is_active=True,
            preferences={
                "accessibility": {
                    "high_contrast": False,
                    "large_text": True,
                    "reduced_motion": True,
                    "text_scale": 150
                },
                "notifications": {
                    "email": True,
                    "push": False,
                    "quiet_hours": {"start": "22:00", "end": "07:00"}
                },
                "ai_assistance": {
                    "level": "high",
                    "auto_categorize": True,
                    "stress_monitoring": True
                }
            }
        ),
        "anxiety_user": User(
            email="anxiety_test@example.com",
            password_hash=get_password_hash("test123"),
            full_name="Anxiety Test User",
            is_active=True,
            preferences={
                "accessibility": {
                    "high_contrast": False,
                    "large_text": False,
                    "reduced_motion": True,
                    "text_scale": 100
                },
                "notifications": {
                    "email": False,
                    "push": False,
                    "quiet_hours": {"start": "21:00", "end": "09:00"}
                },
                "ai_assistance": {
                    "level": "balanced",
                    "auto_categorize": True,
                    "stress_monitoring": True
                }
            }
        ),
        "dyslexic_user": User(
            email="dyslexic_test@example.com",
            password_hash=get_password_hash("test123"),
            full_name="Dyslexic Test User",
            is_active=True,
            preferences={
                "accessibility": {
                    "high_contrast": True,
                    "large_text": True,
                    "reduced_motion": False,
                    "text_scale": 125
                },
                "notifications": {
                    "email": True,
                    "push": True,
                    "quiet_hours": {"start": "23:00", "end": "06:00"}
                },
                "ai_assistance": {
                    "level": "balanced",
                    "auto_categorize": True,
                    "stress_monitoring": False
                }
            }
        )
    }
    
    # Add users to session
    for user in users.values():
        db_session.add(user)
    db_session.commit()
    
    # Refresh users to get their IDs
    for user in users.values():
        db_session.refresh(user)
    
    return users

def create_test_emails(db_session, users):
    """Create test emails for each user"""
    emails = []
    
    # Create test emails for each user
    for user_key, user in users.items():
        email = Email(
            user_id=user.id,
            subject=f"Test Email for {user_key}",
            content=f"This is a test email content for {user_key}",
            sender={"email": "sender@example.com", "name": "Test Sender"},
            recipient={"email": user.email, "name": user.full_name},
            is_processed=False,
            stress_level="LOW",
            priority="MEDIUM",
            summary="This is a test email summary",
            action_items=["Test action item 1", "Test action item 2"],
            sentiment_score=0.8
        )
        emails.append(email)
        db_session.add(email)
    
    db_session.commit()
    
    # Refresh emails to get their IDs
    for email in emails:
        db_session.refresh(email)
    
    return emails

def setup_test_data(db):
    """Main function to set up all test data"""
    users = create_test_users(db)
    emails = create_test_emails(db, users)
    return {"users": users, "emails": emails} 