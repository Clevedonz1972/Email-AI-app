from pydantic import BaseModel, Field
from typing import Dict, Optional, List
from datetime import time


class AccessibilityPreferences(BaseModel):
    high_contrast: bool = Field(default=False)
    large_text: bool = Field(default=False)
    reduced_motion: bool = Field(default=False)
    text_scale: int = Field(default=100, ge=50, le=200)


class NotificationPreferences(BaseModel):
    email_notifications: bool = Field(default=True)
    push_notifications: bool = Field(default=False)
    quiet_hours_start: time = Field(default=time(22, 0))  # 10 PM
    quiet_hours_end: time = Field(default=time(7, 0))     # 7 AM


class AIAssistancePreferences(BaseModel):
    assistance_level: str = Field(default="balanced", pattern="^(low|balanced|high)$")
    auto_categorize: bool = Field(default=True)
    stress_monitoring: bool = Field(default=True)


class PreferencesUpdate(BaseModel):
    accessibility: Optional[AccessibilityPreferences] = None
    notifications: Optional[NotificationPreferences] = None
    ai_assistance: Optional[AIAssistancePreferences] = None


class PreferencesResponse(BaseModel):
    accessibility: AccessibilityPreferences
    notifications: NotificationPreferences
    ai_assistance: AIAssistancePreferences
