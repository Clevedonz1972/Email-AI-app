from pydantic import BaseModel, conint
from typing import Dict, Optional

class AccessibilityPreferences(BaseModel):
    high_contrast: bool = False
    large_text: bool = False
    reduced_motion: bool = False
    text_scale: conint(ge=50, le=200) = 100

class NotificationPreferences(BaseModel):
    email: bool = True
    push: bool = False
    quiet_hours: Dict[str, str] = {"start": "22:00", "end": "07:00"}

class AIPreferences(BaseModel):
    level: str = "balanced"
    auto_categorize: bool = True
    stress_monitoring: bool = True

class PreferencesUpdate(BaseModel):
    accessibility: Optional[AccessibilityPreferences]
    notifications: Optional[NotificationPreferences]
    ai_assistance: Optional[AIPreferences]

class PreferencesResponse(BaseModel):
    accessibility: AccessibilityPreferences
    notifications: NotificationPreferences
    ai_assistance: AIPreferences 