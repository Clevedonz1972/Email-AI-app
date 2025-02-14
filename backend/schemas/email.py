from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from ..models.email import StressLevel, Priority

class EmailBase(BaseModel):
    subject: str
    content: str
    sender: Dict[str, str]
    recipient: Optional[Dict[str, str]]
    category: str = "inbox"

class EmailCreate(EmailBase):
    pass

class EmailUpdate(BaseModel):
    is_read: Optional[bool]
    category: Optional[str]
    priority: Optional[Priority]
    stress_level: Optional[StressLevel]

class EmailAnalysisResponse(BaseModel):
    stress_level: StressLevel
    priority: Priority
    summary: str
    action_items: List[str]
    sentiment_score: float

class EmailReplyResponse(BaseModel):
    content: str
    tone: str
    formality_level: int

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