from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, List
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models.user import User
from backend.models.email import Email, StressLevel
from backend.auth.security import get_current_active_user
from sqlalchemy import func

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/stress")
async def get_stress_analytics(
    timeframe: str = Query("24h", description="Time frame for analysis (24h, 7d, 30d)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """Get stress level analytics and patterns"""
    # Calculate time range
    now = datetime.utcnow()
    if timeframe == "7d":
        start_time = now - timedelta(days=7)
    elif timeframe == "30d":
        start_time = now - timedelta(days=30)
    else:  # 24h default
        start_time = now - timedelta(hours=24)

    # Get emails within timeframe
    emails = db.query(Email).filter(
        Email.user_id == current_user.id,
        Email.timestamp >= start_time,
        Email.timestamp <= now
    ).order_by(Email.timestamp.asc()).all()

    # Analyze stress patterns
    stress_counts = {
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0
    }
    
    hourly_stress = {}
    peak_stress_hours = []
    
    for email in emails:
        # Count stress levels
        if email.stress_level:
            stress_counts[email.stress_level] += 1
        
        # Track hourly patterns
        hour = email.timestamp.hour
        if hour not in hourly_stress:
            hourly_stress[hour] = []
        hourly_stress[hour].append(email.stress_level)

    # Identify peak stress hours
    for hour, levels in hourly_stress.items():
        high_stress_ratio = levels.count("HIGH") / len(levels) if levels else 0
        if high_stress_ratio >= 0.5:  # If 50% or more emails are high stress
            peak_stress_hours.append(hour)

    # Determine overall stress pattern
    total_emails = sum(stress_counts.values())
    if total_emails > 0:
        high_stress_ratio = stress_counts["HIGH"] / total_emails
        pattern = (
            "high_stress" if high_stress_ratio > 0.5
            else "moderate_stress" if high_stress_ratio > 0.25
            else "low_stress"
        )
    else:
        pattern = "insufficient_data"

    # Generate recommendations
    recommendations = []
    if pattern == "high_stress":
        recommendations.extend([
            "Enable simplified view by default",
            "Increase break reminder frequency",
            "Consider enabling quiet hours"
        ])
    elif pattern == "moderate_stress":
        recommendations.extend([
            "Enable simplified view for high-stress emails",
            "Regular break reminders"
        ])

    if peak_stress_hours:
        recommendations.append(
            f"Consider scheduling quiet hours during peak stress times: {', '.join(map(str, peak_stress_hours))}:00"
        )

    return {
        "stress_pattern": pattern,
        "stress_distribution": stress_counts,
        "peak_stress_hours": peak_stress_hours,
        "adaptation_recommendations": recommendations,
        "timeframe": timeframe,
        "total_emails_analyzed": total_emails
    }

@router.get("/feedback")
async def get_feedback_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """Get analytics about user feedback"""
    from backend.models.feedback import QuickFeedback, DetailedFeedback, AccessibilityFeedback

    # Analyze quick feedback
    quick_feedback = db.query(QuickFeedback).filter(
        QuickFeedback.user_id == current_user.id
    ).all()

    # Analyze detailed feedback
    detailed_feedback = db.query(DetailedFeedback).filter(
        DetailedFeedback.user_id == current_user.id
    ).all()

    # Analyze accessibility feedback
    accessibility_feedback = db.query(AccessibilityFeedback).filter(
        AccessibilityFeedback.user_id == current_user.id
    ).all()

    # Calculate feedback statistics
    feedback_by_type = {}
    for feedback in quick_feedback:
        if feedback.type not in feedback_by_type:
            feedback_by_type[feedback.type] = {"positive": 0, "negative": 0}
        if feedback.is_positive:
            feedback_by_type[feedback.type]["positive"] += 1
        else:
            feedback_by_type[feedback.type]["negative"] += 1

    # Calculate average ratings from detailed feedback
    avg_ratings = {}
    for feedback in detailed_feedback:
        if feedback.type not in avg_ratings:
            avg_ratings[feedback.type] = []
        if feedback.rating is not None:
            avg_ratings[feedback.type].append(feedback.rating)

    for feedback_type, ratings in avg_ratings.items():
        avg_ratings[feedback_type] = sum(ratings) / len(ratings) if ratings else None

    # Analyze accessibility feedback
    accessibility_stats = {
        "total_issues": len(accessibility_feedback),
        "resolved_issues": len([f for f in accessibility_feedback if f.resolution_status == "resolved"]),
        "feature_feedback": {}
    }

    for feedback in accessibility_feedback:
        if feedback.feature_type not in accessibility_stats["feature_feedback"]:
            accessibility_stats["feature_feedback"][feedback.feature_type] = {
                "helpful": 0,
                "not_helpful": 0,
                "suggestions": []
            }
        
        stats = accessibility_stats["feature_feedback"][feedback.feature_type]
        if feedback.is_helpful:
            stats["helpful"] += 1
        else:
            stats["not_helpful"] += 1
        if feedback.suggestions:
            stats["suggestions"].append(feedback.suggestions)

    return {
        "feedback_by_type": feedback_by_type,
        "average_ratings": avg_ratings,
        "accessibility_stats": accessibility_stats,
        "total_feedback_count": len(quick_feedback) + len(detailed_feedback)
    } 