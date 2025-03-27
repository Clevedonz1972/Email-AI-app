from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
from backend.models.user import User
from backend.schemas.preferences import PreferencesUpdate, PreferencesResponse
from backend.auth.security import get_current_active_user
from backend.database import get_db

router = APIRouter(tags=["preferences"])


@router.get("", response_model=PreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_active_user),
) -> Dict:
    """Get user preferences."""
    return current_user.preferences or User.get_default_preferences()


@router.put("", response_model=PreferencesResponse)
async def update_preferences(
    preferences: PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Dict:
    """Update user preferences."""
    current_prefs = current_user.preferences or User.get_default_preferences()
    updated_prefs = {**current_prefs, **preferences.dict(exclude_unset=True)}

    current_user.preferences = updated_prefs
    db.commit()
    db.refresh(current_user)

    return updated_prefs
