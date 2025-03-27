from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class AccessibilityPreferences(BaseModel):
    high_contrast: bool = Field(default=False, description="Enable high contrast mode")
    large_text: bool = Field(default=False, description="Enable large text mode")
    reduced_motion: bool = Field(default=False, description="Reduce motion effects")
    text_scale: int = Field(
        default=100,
        ge=50,
        le=200,
        description="Text scale percentage (50-200%)"
    )

class NotificationPreferences(BaseModel):
    email: bool = Field(default=True, description="Enable email notifications")
    push: bool = Field(default=False, description="Enable push notifications")
    quiet_hours: Dict[str, str] = Field(
        default={"start": "22:00", "end": "07:00"},
        description="Quiet hours for notifications"
    )

    @validator("quiet_hours")
    def validate_quiet_hours(cls, v):
        try:
            # Validate time format
            datetime.strptime(v["start"], "%H:%M")
            datetime.strptime(v["end"], "%H:%M")
            return v
        except (ValueError, KeyError):
            raise ValueError("Invalid time format. Use HH:MM")

class AIAssistancePreferences(BaseModel):
    level: str = Field(
        default="balanced",
        description="AI assistance level (minimal/balanced/high)"
    )
    auto_categorize: bool = Field(
        default=True,
        description="Automatically categorize emails"
    )
    stress_monitoring: bool = Field(
        default=True,
        description="Monitor email stress levels"
    )

    @validator("level")
    def validate_level(cls, v):
        allowed = ["minimal", "balanced", "high"]
        if v.lower() not in allowed:
            raise ValueError(f"Level must be one of: {', '.join(allowed)}")
        return v.lower()

class UserPreferences(BaseModel):
    accessibility: AccessibilityPreferences = Field(
        default_factory=AccessibilityPreferences,
        description="Accessibility settings"
    )
    notifications: NotificationPreferences = Field(
        default_factory=NotificationPreferences,
        description="Notification preferences"
    )
    ai_assistance: AIAssistancePreferences = Field(
        default_factory=AIAssistancePreferences,
        description="AI assistance settings"
    )
    theme: str = Field(default="light", description="UI theme (light/dark/custom)")

    @validator("theme")
    def validate_theme(cls, v):
        allowed = ["light", "dark", "custom"]
        if v.lower() not in allowed:
            raise ValueError(f"Theme must be one of: {', '.join(allowed)}")
        return v.lower()

class EmailBase(BaseModel):
    subject: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    sender: Dict[str, str] = Field(
        ...,
        description="Email sender information (name and email)"
    )
    recipient: Dict[str, str] = Field(
        ...,
        description="Email recipient information (name and email)"
    )

    @validator("sender", "recipient")
    def validate_email_dict(cls, v):
        required = {"email", "name"}
        if not all(key in v for key in required):
            raise ValueError(f"Must include {required}")
        # Validate email format
        EmailStr.validate(v["email"])
        return v

class EmailCreate(EmailBase):
    category_id: Optional[int] = Field(None, description="Email category ID")
    priority: Optional[str] = Field(None, description="Email priority level")

class EmailUpdate(BaseModel):
    is_read: Optional[bool] = None
    category_id: Optional[int] = None
    is_archived: Optional[bool] = None
    is_deleted: Optional[bool] = None

class EmailAnalysisRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Email content to analyze")
    user_preferences: Optional[Dict] = Field(
        None,
        description="User preferences for analysis"
    )

class EmailReplyRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Original email content")
    tone: str = Field(
        default="professional",
        description="Desired tone of the reply"
    )
    formality_level: int = Field(
        default=2,
        ge=1,
        le=5,
        description="Formality level (1-5)"
    )

    @validator("tone")
    def validate_tone(cls, v):
        allowed = ["professional", "casual", "friendly", "formal"]
        if v.lower() not in allowed:
            raise ValueError(f"Tone must be one of: {', '.join(allowed)}")
        return v.lower()

# Add more validation models as needed 