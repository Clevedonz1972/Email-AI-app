from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Path
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum
import os

from backend.models.email import Email, StressLevel, Priority
from backend.models.user import User
from backend.schemas.email import (
    EmailCreate,
    EmailResponse,
    EmailUpdate,
    EmailAnalysisResponse,
    EmailReplyResponse
)
from backend.auth.security import get_current_user, get_current_active_user
from backend.database import get_db
from backend.ai.handlers import AIHandler
from backend.utils.logger import logger
from backend.config import settings

router = APIRouter(prefix="/emails", tags=["emails"])
testing_mode = os.getenv("TESTING") == "1"
ai_handler = AIHandler(testing=settings.TESTING)

class EmailTone(str, Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FRIENDLY = "friendly"
    FORMAL = "formal"

@router.post("", response_model=EmailResponse)
async def create_email(
    email_data: EmailCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Email:
    """Create a new email with AI analysis."""
    try:
        # Get AI analysis of the email
        analysis = await ai_handler.analyze_email(email_data.content)
        
        # Create new email with AI analysis results
        new_email = Email(
            user_id=current_user.id,
            subject=email_data.subject,
            content=email_data.content,
            sender=email_data.sender,
            recipient=email_data.recipient,
            timestamp=datetime.utcnow(),
            category=email_data.category,
            stress_level=analysis["stress_level"],
            priority=analysis["priority"],
            summary=analysis["summary"],
            action_items=analysis["action_items"],
            sentiment_score=analysis["sentiment_score"],
            is_processed=True
        )

        db.add(new_email)
        db.commit()
        db.refresh(new_email)

        # Schedule background processing if needed
        background_tasks.add_task(
            process_email_background,
            new_email.id,
            db
        )

        return new_email

    except HTTPException:
        # Let HTTP exceptions pass through
        raise
    except Exception as e:
        logger.error(f"Error creating email: {str(e)}", extra={
            "user_id": current_user.id,
            "email_subject": email_data.subject
        })
        raise HTTPException(
            status_code=500,
            detail="Failed to process email"
        )

@router.get("", response_model=List[EmailResponse])
async def get_emails(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category_id: Optional[int] = None,
    stress_level: Optional[StressLevel] = None,
    priority: Optional[Priority] = None,
    is_archived: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Email]:
    """Get user's emails with optional filtering."""
    query = db.query(Email).filter(
        Email.user_id == current_user.id,
        Email.is_deleted == False,
        Email.is_archived == is_archived
    )
    
    if category_id:
        query = query.filter(Email.category_id == category_id)
    if stress_level:
        query = query.filter(Email.stress_level == stress_level)
    if priority:
        query = query.filter(Email.priority == priority)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{email_id}", response_model=EmailResponse)
async def get_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Email:
    """Get a specific email."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id,
        Email.is_deleted == False
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email

@router.put("/{email_id}", response_model=EmailResponse)
async def update_email(
    email_id: int,
    email_update: EmailUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Email:
    """Update an email."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id,
        Email.is_deleted == False
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    for field, value in email_update.dict(exclude_unset=True).items():
        setattr(email, field, value)
    
    db.commit()
    db.refresh(email)
    return email

@router.delete("/{email_id}")
async def delete_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Soft delete an email."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id,
        Email.is_deleted == False
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    email.is_deleted = True
    db.commit()
    return {"message": "Email deleted successfully"}

@router.get("/{email_id}/analysis", response_model=EmailAnalysisResponse)
async def get_email_analysis(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get AI analysis for a specific email."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    try:
        # Get fresh analysis if requested
        analysis = await ai_handler.analyze_email(email.content)
        
        return EmailAnalysisResponse(
            stress_level=analysis["stress_level"],
            priority=analysis["priority"],
            summary=analysis["summary"],
            action_items=analysis["action_items"],
            sentiment_score=analysis["sentiment_score"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}", extra={
            "email_id": email_id,
            "user_id": current_user.id
        })
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze email"
        )

@router.post("/{email_id}/reply", response_model=EmailReplyResponse)
async def generate_email_reply(
    email_id: int = Path(..., gt=0),
    tone: EmailTone = EmailTone.PROFESSIONAL,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate an AI reply suggestion for an email."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    try:
        reply = await generate_reply(email.content, tone=tone)
        return {
            "content": reply["content"],
            "tone": reply["tone"],
            "formality_level": reply["formality_level"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating reply: {str(e)}", extra={
            "email_id": email_id,
            "user_id": current_user.id
        })
        raise HTTPException(
            status_code=500,
            detail="Failed to generate reply"
        )

async def process_email_background(email_id: int, db: Session):
    """Background task to process email with additional AI analysis."""
    try:
        email = db.query(Email).filter(Email.id == email_id).first()
        if not email:
            return

        # Get priority analysis
        priority_analysis = await analyze_priority(email.content)
        
        # Update email with additional analysis
        email.priority = priority_analysis["priority"]
        email.stress_level = priority_analysis["stress_level"]
        email.is_processed = True

        db.commit()

    except Exception as e:
        logger.error(f"Background processing failed: {str(e)}", extra={
            "email_id": email_id
        })
        # Don't raise HTTP exception in background task 

@router.post("/analyze")
async def analyze_email(
    email_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    try:
        email = await get_email(email_id, current_user.id)
        analysis = await ai_handler.analyze_email(email.content)
        
        background_tasks.add_task(
            update_email_analytics,
            email_id=email_id,
            analysis=analysis
        )
        
        return analysis
    except Exception as e:
        logger.error(f"Email analysis failed: {str(e)}", extra={
            "email_id": email_id,
            "user_id": current_user.id
        })
        raise HTTPException(
            status_code=500,
            detail="Analysis failed. Please try again."
        )

# Replace the direct imports with ai_handler method calls
async def summarize_email(content: str):
    return await ai_handler.analyze_email(content)

async def generate_reply(content: str, tone: str = "professional"):
    return await ai_handler.generate_reply(content, tone)

async def analyze_priority(content: str):
    analysis = await ai_handler.analyze_email(content)
    return {
        "priority": analysis.priority,
        "stress_level": analysis.stress_level
    }

async def get_email(email_id: int, user_id: int) -> Email:
    """Helper function to get email by ID and user ID"""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == user_id
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email

async def update_email_analytics(email_id: int, analysis: Dict):
    """Background task to update email analytics"""
    try:
        email = db.query(Email).filter(Email.id == email_id).first()
        if email:
            email.stress_level = analysis.get("stress_level")
            email.priority = analysis.get("priority")
            email.summary = analysis.get("summary")
            email.action_items = analysis.get("action_items", [])
            email.sentiment_score = analysis.get("sentiment_score")
            db.commit()
    except Exception as e:
        logger.error(f"Failed to update email analytics: {str(e)}", extra={
            "email_id": email_id
        }) 