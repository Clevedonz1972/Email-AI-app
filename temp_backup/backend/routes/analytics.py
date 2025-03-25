from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth.security import get_current_active_user
from backend.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/")
async def get_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user analytics data.
    """
    return {"message": "Analytics endpoint", "user_id": current_user.id} 