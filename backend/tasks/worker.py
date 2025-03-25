from celery import Celery
from datetime import datetime, timedelta
from sqlalchemy import func
from backend.config import settings
from backend.database import SessionLocal, engine, get_db
from backend.models.base import Base
from backend.models.email import Email, StressLevel, Priority
from backend.models.user import User
from backend.utils.openai import analyze_content
from backend.services.notification import NotificationService
import logging
from typing import Optional, Dict, Any
import asyncio
import json

# Initialize logging with more detailed format
logger = logging.getLogger(__name__)
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=settings.LOG_LEVEL
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize Celery
celery = Celery(
    'email_tasks',
    broker=f'redis://{settings.REDIS_HOST}:6379/0',
    backend=f'redis://{settings.REDIS_HOST}:6379/0'
)

# Configure Celery
celery.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Configure periodic tasks
celery.conf.beat_schedule = {
    "cleanup-old-emails": {
        "task": "backend.tasks.worker.cleanup_old_emails",
        "schedule": timedelta(days=1),
        "kwargs": {"days": 30},
    },
    "update-analytics": {
        "task": "backend.tasks.worker.update_email_analytics",
        "schedule": timedelta(hours=1),
    },
}

def get_db_session() -> SessionLocal:
    """Get database session with error handling"""
    try:
        db = SessionLocal()
        return db
    except Exception as e:
        logger.error(f"Failed to create database session: {str(e)}")
        raise

async def process_email(email_id: int, user_id: int, 
                      db_session: Optional[SessionLocal] = None,
                      openai_client: Any = None,
                      notification_service: Any = None):
    """Process a single email for stress analysis and notifications."""
    logger.info(f"Processing email {email_id} for user {user_id}")
    
    db = db_session or next(get_db())
    try:
        # Get email and user
        email = db.query(Email).filter(Email.id == email_id).first()
        user = db.query(User).filter(User.id == user_id).first()
        
        if not email or not user:
            logger.error(f"Email {email_id} or user {user_id} not found")
            return
            
        logger.debug(f"Analyzing content for email {email_id}")
        
        # Run analysis
        try:
            if openai_client:
                analysis = await openai_client(email.content)
            else:
                analysis = await analyze_content(email.content)
            
            # Update email with analysis results
            email.stress_level = analysis["stress_level"]
            email.priority = analysis["priority"]
            email.summary = analysis["summary"]
            email.action_items = analysis["action_items"]
            email.sentiment_score = analysis["sentiment_score"]
            email.is_processed = True
            
            # Send notification if needed
            if (email.stress_level == "HIGH" and 
                user.preferences.get("notifications", {}).get("high_stress_only", False)):
                if notification_service:
                    notification_service.send_notification(
                        user,
                        {
                            "type": "stress_alert",
                            "message": f"High stress email detected: {email.subject}"
                        }
                    )
                else:
                    NotificationService.send_notification(
                        user,
                        {
                            "type": "stress_alert",
                            "message": f"High stress email detected: {email.subject}"
                        }
                    )
            
            db.commit()
            logger.info(f"Successfully processed email {email_id}")
            
        except Exception as e:
            logger.error(f"Error processing email {email_id}: {str(e)}")
            db.rollback()
            raise
            
    except Exception as e:
        logger.error(f"Database error processing email {email_id}: {str(e)}")
        db.rollback()
        raise
    finally:
        if not db_session:
            db.close()

@celery.task
def cleanup_old_emails(days: int = 30):
    """Archive emails older than specified days."""
    db = next(get_db())
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        old_emails = db.query(Email).filter(Email.created_at < cutoff_date).all()
        
        for email in old_emails:
            email.is_archived = True
        
        db.commit()
        logger.info(f"Archived {len(old_emails)} old emails")
    except Exception as e:
        logger.error(f"Error archiving old emails: {str(e)}")
        db.rollback()
    finally:
        db.close()

@celery.task
def update_email_analytics(user_id: int):
    """Update analytics for user's emails."""
    db = next(get_db())
    try:
        # Get user's emails
        emails = db.query(Email).filter(Email.user_id == user_id).all()
        
        # Calculate analytics
        total_emails = len(emails)
        unread_emails = len([e for e in emails if not e.is_read])
        stress_levels = {
            "low": len([e for e in emails if e.stress_level == StressLevel.LOW]),
            "medium": len([e for e in emails if e.stress_level == StressLevel.MEDIUM]),
            "high": len([e for e in emails if e.stress_level == StressLevel.HIGH])
        }
        
        # Update user analytics
        user = db.query(User).get(user_id)
        if user:
            user.preferences["email_stats"] = {
                "total": total_emails,
                "unread": unread_emails,
                "stress_distribution": stress_levels
            }
            db.commit()
            logger.info(f"Updated analytics for user {user_id}")
    except Exception as e:
        logger.error(f"Error updating email analytics: {str(e)}")
        db.rollback()
    finally:
        db.close()

 