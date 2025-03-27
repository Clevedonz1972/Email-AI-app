from fastapi import APIRouter, Depends
from typing import List
from ..models.email import EmailMessage, EmailAnalysis
from ..services.stress_analysis import analyze_email_stress
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/api/emails")


@router.post("/analyze", response_model=EmailAnalysis)
async def analyze_email(
    email: EmailMessage, current_user=Depends(get_current_user)
) -> EmailAnalysis:
    """Analyze email content for stress levels and priority"""
    analysis = await analyze_email_stress(email, current_user.preferences)
    return analysis
