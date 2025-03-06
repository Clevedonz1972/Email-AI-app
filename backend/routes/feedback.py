from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db
from ..models.user import User
from ..auth.security import get_current_active_user
from ..utils.logger import logger, log_accessibility_event

router = APIRouter(tags=["feedback"])

class QuickFeedback(BaseModel):
    type: str
    emailId: Optional[int]
    suggestionId: Optional[str]
    isPositive: bool
    timestamp: datetime

class DetailedFeedback(BaseModel):
    type: str
    emailId: Optional[int]
    suggestionId: Optional[str]
    feedback: str
    rating: Optional[float]
    timestamp: datetime

@router.post("/quick")
async def submit_quick_feedback(
    feedback: QuickFeedback,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Submit quick feedback (thumbs up/down)"""
    try:
        # Log the feedback
        logger.info(
            "Quick feedback received",
            extra={
                "user_id": current_user.id,
                "feedback_type": feedback.type,
                "is_positive": feedback.isPositive,
                "email_id": feedback.emailId,
                "suggestion_id": feedback.suggestionId,
            },
        )

        # Log accessibility event if feedback is about accessibility
        if feedback.type == "accessibility":
            log_accessibility_event(
                "accessibility_feedback_received",
                {
                    "is_positive": feedback.isPositive,
                    "email_id": feedback.emailId,
                },
            )

        # Store feedback in database
        # TODO: Implement feedback storage

        return {"status": "success", "message": "Feedback recorded"}
    except Exception as e:
        logger.error(f"Error recording quick feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to record feedback"
        )

@router.post("/detailed")
async def submit_detailed_feedback(
    feedback: DetailedFeedback,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Submit detailed feedback with comments and rating"""
    try:
        # Log the detailed feedback
        logger.info(
            "Detailed feedback received",
            extra={
                "user_id": current_user.id,
                "feedback_type": feedback.type,
                "rating": feedback.rating,
                "email_id": feedback.emailId,
                "suggestion_id": feedback.suggestionId,
            },
        )

        # Log accessibility event if feedback is about accessibility
        if feedback.type == "accessibility":
            log_accessibility_event(
                "detailed_accessibility_feedback",
                {
                    "feedback": feedback.feedback,
                    "rating": feedback.rating,
                    "email_id": feedback.emailId,
                },
            )

        # Store feedback in database
        # TODO: Implement feedback storage

        # If stress level feedback, update stress analysis model
        if feedback.type == "stress_level":
            # TODO: Implement stress model updating
            pass

        return {"status": "success", "message": "Detailed feedback recorded"}
    except Exception as e:
        logger.error(f"Error recording detailed feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to record detailed feedback"
        )

@router.get("/stats")
async def get_feedback_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get feedback statistics for admin/debugging purposes"""
    try:
        # TODO: Implement feedback statistics retrieval
        return {
            "total_feedback_count": 0,
            "positive_feedback_ratio": 0,
            "accessibility_feedback_count": 0,
            "stress_level_accuracy": 0,
        }
    except Exception as e:
        logger.error(f"Error retrieving feedback stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve feedback statistics"
        ) 