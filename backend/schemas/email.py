from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..models.email import StressLevel, Priority


class EmailMessage(BaseModel):
    id: str
    subject: str
    content: str
    sender: Dict[str, str]
    timestamp: str


class EmailBase(BaseModel):
    subject: str
    content: str
    sender: Dict[str, str]
    recipient: Optional[Dict[str, str]]
    category_id: Optional[int] = None


class EmailCreate(EmailBase):
    pass


class EmailUpdate(BaseModel):
    is_read: Optional[bool]
    category_id: Optional[int]
    priority: Optional[Priority]
    stress_level: Optional[StressLevel]


class EmailAnalysisResponse(BaseModel):
    stress_level: StressLevel
    priority: Priority
    summary: str
    action_items: List[str]
    sentiment_score: float


class EmailReplyRequest(BaseModel):
    content: str = Field(..., min_length=1)
    tone: str = Field(default="professional")
    should_simplify: bool = Field(default=True)
    accessibility_preferences: Optional[Dict] = None


class EmailReplyConfirmation(BaseModel):
    content: str = Field(..., min_length=1)
    preview_token: str = Field(...)
    send_now: bool = Field(default=False)


class EmailReplyResponse(BaseModel):
    content: str
    analysis: Dict[str, Any]
    suggestions: Optional[List[str]]
    simplified_version: Optional[str]
    preview_token: Optional[str]
    stress_analysis: Optional[Dict[str, Any]]
    accessibility_notes: Optional[List[str]]


class EmailReplyPreview(BaseModel):
    original_email_id: int
    content: str
    analysis: Dict[str, Any]
    preview_token: str
    warnings: Optional[List[str]]
    accessibility_suggestions: Optional[List[str]]


class EmailResponse(EmailBase):
    id: int
    user_id: int
    timestamp: datetime
    is_read: bool
    is_processed: bool
    stress_level: Optional[StressLevel]
    priority: Optional[Priority]
    summary: Optional[str]
    action_items: Optional[List[str]]
    sentiment_score: Optional[float]

    class Config:
        orm_mode = True
