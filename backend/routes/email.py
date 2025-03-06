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
    EmailReplyResponse,
    EmailReplyRequest,
    EmailReplyConfirmation
)
from backend.auth.security import get_current_user, get_current_active_user
from backend.database import get_db
from backend.ai.handlers import AIHandler
from backend.utils.logger import logger, log_error, log_accessibility_event
from backend.config import settings
from backend.services.stress_analysis import analyze_email_stress
from backend.services.openai_service import analyze_content

router = APIRouter(tags=["emails"])
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
    current_user: User = Depends(get_current_active_user),
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
            category_id=None,  # We'll set this based on rules later
            stress_level=analysis.stress_level,
            priority=analysis.priority,
            summary=analysis.summary,
            action_items=analysis.action_items,
            sentiment_score=analysis.sentiment_score,
            is_processed=True,
        )

        db.add(new_email)
        db.commit()
        db.refresh(new_email)

        # Schedule background processing if needed
        background_tasks.add_task(process_email_background, new_email.id, db)

        return new_email

    except HTTPException:
        # Let HTTP exceptions pass through
        raise
    except Exception as e:
        logger.error(
            f"Error creating email: {str(e)}",
            extra={"user_id": current_user.id, "email_subject": email_data.subject},
        )
        raise HTTPException(status_code=500, detail="Failed to process email")


@router.get("", response_model=List[EmailResponse])
async def get_emails(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category_id: Optional[int] = None,
    stress_level: Optional[StressLevel] = None,
    priority: Optional[Priority] = None,
    is_archived: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[Email]:
    """Get user's emails with optional filtering."""
    query = db.query(Email).filter(
        Email.user_id == current_user.id,
        Email.is_deleted == False,
        Email.is_archived == is_archived,
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
    current_user: User = Depends(get_current_active_user),
) -> Email:
    """Get a specific email."""
    email = (
        db.query(Email)
        .filter(
            Email.id == email_id,
            Email.user_id == current_user.id,
            Email.is_deleted == False,
        )
        .first()
    )

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email


@router.put("/{email_id}", response_model=EmailResponse)
async def update_email(
    email_id: int,
    email_update: EmailUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Email:
    """Update an email."""
    email = (
        db.query(Email)
        .filter(
            Email.id == email_id,
            Email.user_id == current_user.id,
            Email.is_deleted == False,
        )
        .first()
    )

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
    current_user: User = Depends(get_current_active_user),
):
    """Soft delete an email."""
    email = (
        db.query(Email)
        .filter(
            Email.id == email_id,
            Email.user_id == current_user.id,
            Email.is_deleted == False,
        )
        .first()
    )

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    email.is_deleted = True
    db.commit()
    return {"message": "Email deleted successfully"}


@router.get("/{email_id}/analysis", response_model=EmailAnalysisResponse)
async def get_email_analysis(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get AI analysis for a specific email."""
    email = (
        db.query(Email)
        .filter(Email.id == email_id, Email.user_id == current_user.id)
        .first()
    )

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    try:
        # Get fresh analysis if requested
        analysis = await ai_handler.analyze_email(email.content)

        return EmailAnalysisResponse(
            stress_level=analysis.stress_level,
            priority=analysis.priority,
            summary=analysis.summary,
            action_items=analysis.action_items,
            sentiment_score=analysis.sentiment_score,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error analyzing email: {str(e)}",
            extra={"email_id": email_id, "user_id": current_user.id},
        )
        raise HTTPException(status_code=500, detail="Failed to analyze email")


@router.post("/{email_id}/reply", response_model=EmailReplyResponse)
async def generate_email_reply(
    email_id: int = Path(..., gt=0),
    tone: EmailTone = EmailTone.PROFESSIONAL,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate an AI reply suggestion for an email."""
    email = (
        db.query(Email)
        .filter(Email.id == email_id, Email.user_id == current_user.id)
        .first()
    )

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    try:
        reply = await ai_handler.generate_reply(email.content, tone=tone)
        return {
            "content": reply.content,
            "tone": reply.tone,
            "formality_level": reply.formality_level,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error generating reply: {str(e)}",
            extra={"email_id": email_id, "user_id": current_user.id},
        )
        raise HTTPException(status_code=500, detail="Failed to generate reply")


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
        logger.error(
            f"Background processing failed: {str(e)}", extra={"email_id": email_id}
        )
        # Don't raise HTTP exception in background task


@router.post("/{email_id}/analyze", response_model=EmailAnalysisResponse)
async def analyze_email(
    background_tasks: BackgroundTasks,
    email_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Analyze an email's content."""
    try:
        email = await get_email(email_id, current_user.id, db)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")

        analysis = await ai_handler.analyze_email(email.content)
        if analysis:
            await update_email_analytics(email_id, analysis.dict(), db)
            return analysis
        raise HTTPException(status_code=500, detail="Failed to analyze email")
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze email")


# Replace the direct imports with ai_handler method calls
async def summarize_email(content: str):
    return await ai_handler.analyze_email(content)


async def generate_reply(
    content: str,
    tone: str = "professional",
    preferences: dict = None
) -> dict:
    """Generate reply suggestions with accessibility considerations"""
    try:
        # Adjust prompt based on user preferences
        accessibility_context = {
            "tone": tone,
            "preferences": preferences,
            "simplify_language": preferences.get("cognitive_load_reduction", True),
            "stress_sensitive": preferences.get("stress_sensitivity", "MEDIUM")
        }
        
        response = await analyze_content(
            content,
            context=accessibility_context
        )
        
        return {
            "suggestions": response["suggestions"],
            "tone_analysis": response["tone_analysis"],
            "stress_level": response["stress_level"],
            "simplified_version": response.get("simplified_version")
        }
    except Exception as e:
        log_error(e, {"action": "generate_reply"})
        raise


async def analyze_priority(content: str):
    analysis = await ai_handler.analyze_email(content)
    return {"priority": analysis.priority, "stress_level": analysis.stress_level}


async def get_email(email_id: int, user_id: int, db: Session) -> Email:
    """Helper function to get email by ID and user ID"""
    email = (
        db.query(Email)
        .filter(Email.id == email_id, Email.user_id == user_id)
        .first()
    )

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email


async def update_email_analytics(email_id: int, analysis: Dict, db: Session):
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
        logger.error(
            f"Failed to update email analytics: {str(e)}", extra={"email_id": email_id}
        )


@router.post("/{email_id}/reply-suggestions", response_model=EmailReplyResponse)
async def get_reply_suggestions(
    email_id: int = Path(..., gt=0),
    tone: Optional[str] = Query("professional", description="Desired tone of reply"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get AI-generated reply suggestions with accessibility considerations"""
    try:
        # Get original email
        email = await get_email(email_id, current_user.id, db)
        
        # Get user's accessibility preferences
        preferences = current_user.preferences or {}
        
        # Generate reply suggestions
        suggestions = await generate_reply(
            email.content,
            tone=tone,
            preferences=preferences
        )
        
        # Log accessibility event
        log_accessibility_event(
            "reply_suggestions_generated",
            {"email_id": email_id, "tone": tone}
        )
        
        return suggestions
    except Exception as e:
        log_error(e, {"email_id": email_id, "action": "reply_suggestions"})
        raise HTTPException(
            status_code=500,
            detail="Failed to generate reply suggestions"
        )

@router.post("/{email_id}/reply/preview", response_model=EmailReplyResponse)
async def preview_reply(
    email_id: int,
    reply_data: EmailReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Preview and analyze reply before sending"""
    try:
        # Get original email
        email = await get_email(email_id, current_user.id, db)
        
        # Analyze reply content
        analysis = await analyze_content(reply_data.content)
        
        # Check for potential stress triggers
        if analysis["stress_level"] == "HIGH":
            log_accessibility_event(
                "high_stress_reply_detected",
                {"email_id": email_id, "stress_level": "HIGH"}
            )
        
        return {
            "content": reply_data.content,
            "analysis": analysis,
            "original_email_id": email_id,
            "preview_token": generate_preview_token(email_id, current_user.id)
        }
    except Exception as e:
        log_error(e, {"email_id": email_id, "action": "reply_preview"})
        raise HTTPException(
            status_code=500,
            detail="Failed to preview reply"
        )

@router.post("/{email_id}/reply/send", response_model=EmailResponse)
async def send_reply(
    email_id: int,
    confirmation: EmailReplyConfirmation,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Send reply after confirmation"""
    try:
        # Verify preview token
        verify_preview_token(
            confirmation.preview_token,
            email_id,
            current_user.id
        )
        
        # Get original email
        original_email = await get_email(email_id, current_user.id, db)
        
        # Create reply email
        reply = Email(
            subject=f"Re: {original_email.subject}",
            content=confirmation.content,
            user_id=current_user.id,
            sender={"email": current_user.email, "name": current_user.full_name},
            recipient=original_email.sender,
            in_reply_to=email_id
        )
        
        db.add(reply)
        db.commit()
        db.refresh(reply)
        
        # Process reply in background
        background_tasks.add_task(
            process_email_background,
            reply.id,
            db
        )
        
        # Log accessibility event
        log_accessibility_event(
            "reply_sent",
            {"email_id": email_id, "reply_id": reply.id}
        )
        
        return reply
    except Exception as e:
        log_error(e, {"email_id": email_id, "action": "send_reply"})
        raise HTTPException(
            status_code=500,
            detail="Failed to send reply"
        )

def generate_preview_token(email_id: int, user_id: int) -> str:
    """Generate secure token for reply preview"""
    # Implementation of secure token generation
    pass

def verify_preview_token(token: str, email_id: int, user_id: int) -> bool:
    """Verify preview token before sending"""
    # Implementation of token verification
    pass
