from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from models.email import Email, StressLevel, Priority
from models.user import User
from schemas.email import (
    EmailCreate,
    EmailResponse,
    EmailUpdate,
    EmailAnalysisResponse
)
from auth.security import get_current_active_user
from database import get_db
from ai.handlers import AIHandler

router = APIRouter(prefix="/emails", tags=["emails"])
ai_handler = AIHandler()

@router.post("", response_model=EmailResponse)
async def create_email(
    email_data: EmailCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Email:
    """Create a new email with AI analysis."""
    try:
        # Perform AI analysis
        analysis = await ai_handler.analyze_email(
            content=email_data.content,
            subject=email_data.subject
        )
        
        # Create email with analysis results
        email = Email(
            user_id=current_user.id,
            subject=email_data.subject,
            content=email_data.content,
            sender=email_data.sender,
            recipient=email_data.recipient,
            stress_level=analysis.stress_level,
            priority=analysis.priority,
            ai_summary=analysis.summary,
            action_items=analysis.action_items,
            sentiment_score=analysis.sentiment_score
        )
        
        db.add(email)
        db.commit()
        db.refresh(email)
        return email
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating email: {str(e)}"
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

@router.post("/{email_id}/analyze", response_model=EmailAnalysisResponse)
async def analyze_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> EmailAnalysisResponse:
    """Analyze an existing email."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id,
        Email.is_deleted == False
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    analysis = await ai_handler.analyze_email(
        content=email.content,
        subject=email.subject
    )
    
    # Update email with new analysis
    email.stress_level = analysis.stress_level
    email.priority = analysis.priority
    email.ai_summary = analysis.summary
    email.action_items = analysis.action_items
    email.sentiment_score = analysis.sentiment_score
    
    db.commit()
    db.refresh(email)
    
    return EmailAnalysisResponse(
        stress_level=analysis.stress_level,
        priority=analysis.priority,
        summary=analysis.summary,
        action_items=analysis.action_items,
        sentiment_score=analysis.sentiment_score
    ) 