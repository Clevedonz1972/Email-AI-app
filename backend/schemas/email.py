from pydantic import BaseModel, EmailStr, constr
from typing import List, Optional
from datetime import datetime
from models.email import StressLevel, Priority

class EmailBase(BaseModel):
    subject: constr(min_length=1, max_length=255)
    content: str
    sender: EmailStr
    recipient: EmailStr
    category_id: Optional[int] = None

class EmailCreate(EmailBase):
    pass

class EmailUpdate(BaseModel):
    subject: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[int] = None
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None

class EmailResponse(EmailBase):
    id: int
    user_id: int
    stress_level: Optional[StressLevel]
    priority: Optional[Priority]
    ai_summary: Optional[str]
    action_items: Optional[List[str]]
    sentiment_score: Optional[float]
    is_read: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class EmailAnalysisResponse(BaseModel):
    stress_level: StressLevel
    priority: Priority
    summary: str
    action_items: List[str]
    sentiment_score: float 