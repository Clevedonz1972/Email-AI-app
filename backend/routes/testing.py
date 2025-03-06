from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List
from datetime import datetime
from backend.database import get_db
from backend.models.user import User
from backend.models.testing import TestScenario, TestFeedback
from backend.auth.security import get_current_active_user
from sqlalchemy import func

router = APIRouter(prefix="/testing", tags=["testing"])

@router.get("/progress")
async def get_testing_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """Get user testing progress and metrics"""
    # Get completed scenarios
    completed_scenarios = db.query(TestScenario).filter(
        TestScenario.user_id == current_user.id,
        TestScenario.completed == True
    ).count()

    # Get feedback metrics
    feedback = db.query(TestFeedback).filter(
        TestFeedback.user_id == current_user.id
    ).all()

    # Calculate metrics
    total_feedback = len(feedback)
    issues_reported = len([f for f in feedback if f.is_issue])
    ratings = [f.rating for f in feedback if f.rating is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    return {
        "totalScenarios": 6,  # Total number of test scenarios
        "completedScenarios": completed_scenarios,
        "feedbackCount": total_feedback,
        "issuesReported": issues_reported,
        "averageRating": avg_rating
    }

@router.post("/complete")
async def mark_scenario_complete(
    scenario_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a test scenario as completed"""
    scenario = db.query(TestScenario).filter(
        TestScenario.user_id == current_user.id,
        TestScenario.scenario_id == scenario_id
    ).first()

    if not scenario:
        scenario = TestScenario(
            user_id=current_user.id,
            scenario_id=scenario_id,
            completed=True,
            completion_date=datetime.utcnow()
        )
        db.add(scenario)
    else:
        scenario.completed = True
        scenario.completion_date = datetime.utcnow()

    db.commit()
    return {"status": "success", "message": "Scenario marked as complete"}

@router.post("/feedback")
async def submit_test_feedback(
    feedback_data: Dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit feedback for a test scenario"""
    feedback = TestFeedback(
        user_id=current_user.id,
        scenario_id=feedback_data["scenarioId"],
        feedback_text=feedback_data["feedback"],
        is_issue="issue" in feedback_data["feedback"].lower(),
        submission_date=datetime.utcnow()
    )
    
    db.add(feedback)
    db.commit()
    
    return {"status": "success", "message": "Feedback submitted successfully"}

@router.get("/summary")
async def get_testing_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """Get summary of all testing data"""
    # Get scenario completion stats
    scenarios = db.query(TestScenario).filter(
        TestScenario.user_id == current_user.id
    ).all()
    
    # Get feedback stats
    feedback = db.query(TestFeedback).filter(
        TestFeedback.user_id == current_user.id
    ).all()
    
    # Organize feedback by scenario
    feedback_by_scenario = {}
    for f in feedback:
        if f.scenario_id not in feedback_by_scenario:
            feedback_by_scenario[f.scenario_id] = []
        feedback_by_scenario[f.scenario_id].append({
            "text": f.feedback_text,
            "is_issue": f.is_issue,
            "date": f.submission_date.isoformat()
        })
    
    return {
        "scenarios": [
            {
                "id": s.scenario_id,
                "completed": s.completed,
                "completion_date": s.completion_date.isoformat() if s.completion_date else None,
                "feedback": feedback_by_scenario.get(s.scenario_id, [])
            }
            for s in scenarios
        ],
        "total_feedback": len(feedback),
        "completion_rate": len([s for s in scenarios if s.completed]) / 6 * 100
    } 