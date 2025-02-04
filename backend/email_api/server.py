from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uvicorn
from datetime import datetime
from .client import MOCK_EMAILS
from ..ai.handlers import AIHandler
from backend.auth import router as auth_router

app = FastAPI(
    title="Neurodiverse Email API",
    description="Email management API designed for neurodivergent users",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Handler
ai_handler = AIHandler()

app.include_router(auth_router)

# Pydantic models for request/response validation
class EmailUpdate(BaseModel):
    priority: Optional[str] = Field(None, description="Email priority level")
    is_read: Optional[bool] = Field(None, description="Whether the email has been read")
    stress_level: Optional[str] = Field(None, description="User-perceived stress level")
    category: Optional[str] = Field(None, description="Email category")

class EmailPreferences(BaseModel):
    stress_level: Optional[str] = Field(None, description="Default stress level for similar emails")
    handling_strategy: Optional[str] = Field(None, description="Preferred way to handle similar emails")
    reminders: Optional[Dict] = Field(None, description="Reminder settings")
    auto_categorize: Optional[bool] = Field(None, description="Whether to auto-categorize similar emails")

class BatchAction(BaseModel):
    email_ids: List[str] = Field(..., description="List of email IDs to process")
    action: str = Field(..., description="Action to perform on emails")
    parameters: Optional[Dict] = Field(None, description="Additional parameters for the action")

# Helper function to get email by ID
def get_email_by_id(email_id: str):
    email = next((e for e in MOCK_EMAILS if e["id"] == email_id), None)
    if not email:
        raise HTTPException(status_code=404, detail={
            "message": "Email not found",
            "suggestions": ["Check the email ID", "Refresh your email list", "Contact support if the problem persists"]
        })
    return email

@app.get("/api/emails")
async def get_emails(
    limit: int = Query(50, description="Maximum number of emails to return"),
    offset: int = Query(0, description="Number of emails to skip"),
    folder: str = Query("inbox", description="Email folder to fetch from"),
    sort_by: str = Query("date", description="Sort criteria (date, priority, stress_level)"),
    stress_level: Optional[str] = Query(None, description="Filter by stress level"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Fetch emails with enhanced filtering and sorting options.
    Designed to help users manage their email load effectively.
    """
    filtered_emails = MOCK_EMAILS.copy()

    # Apply filters
    if stress_level:
        filtered_emails = [e for e in filtered_emails if e.get("stress_level") == stress_level]
    if category:
        filtered_emails = [e for e in filtered_emails if e.get("category") == category]

    # Sort emails
    if sort_by == "priority":
        filtered_emails.sort(key=lambda x: {"HIGH": 0, "MEDIUM": 1, "LOW": 2}.get(x["priority"], 3))
    elif sort_by == "stress_level":
        filtered_emails.sort(key=lambda x: {"HIGH": 0, "MEDIUM": 1, "LOW": 2}.get(x.get("stress_level"), 3))
    else:  # default to date
        filtered_emails.sort(key=lambda x: x["timestamp"], reverse=True)

    # Apply pagination
    paginated_emails = filtered_emails[offset:offset + limit]
    
    return {
        "emails": paginated_emails,
        "total": len(filtered_emails),
        "has_more": len(filtered_emails) > (offset + limit)
    }

@app.patch("/api/emails/{email_id}")
async def update_email(email_id: str, update: EmailUpdate):
    """
    Update email properties including stress level and category.
    Helps users manage and categorize their emails effectively.
    """
    email = get_email_by_id(email_id)
    
    if update.priority:
        email["priority"] = update.priority
    if update.is_read is not None:
        email["is_read"] = update.is_read
    if update.stress_level:
        email["stress_level"] = update.stress_level
    if update.category:
        email["category"] = update.category

    # If stress level is updated, trigger AI analysis for similar emails
    if update.stress_level:
        similar_emails = find_similar_emails(email)
        for similar in similar_emails:
            similar["stress_level"] = update.stress_level

    return {"success": True, "email": email}

@app.post("/api/emails/{email_id}/analyze")
async def analyze_email(email_id: str):
    """
    Perform AI analysis on an email to determine priority, stress level, and generate summaries.
    Helps users quickly understand and categorize their emails.
    """
    email = get_email_by_id(email_id)
    
    # Perform AI analysis
    summary_result = ai_handler.summarize_email(email["preview"])
    priority_result = ai_handler.analyze_priority(email["preview"])
    
    if summary_result["success"] and priority_result["success"]:
        email["ai_summary"] = summary_result["summary"]
        email["priority"] = priority_result["analysis"].split("\n")[0]  # First line contains priority
        
        return {
            "success": True,
            "analysis": {
                "summary": summary_result["summary"],
                "priority": priority_result["analysis"],
                "suggestions": generate_handling_suggestions(email)
            }
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to analyze email")

@app.post("/api/emails/batch")
async def batch_process(action: BatchAction):
    """
    Process multiple emails in a single operation.
    Helps users manage their inbox more efficiently.
    """
    processed = []
    errors = []
    
    for email_id in action.email_ids:
        try:
            email = get_email_by_id(email_id)
            if action.action == "mark_read":
                email["is_read"] = True
            elif action.action == "categorize" and action.parameters.get("category"):
                email["category"] = action.parameters["category"]
            elif action.action == "archive":
                email["folder"] = "archive"
            processed.append(email_id)
        except Exception as e:
            errors.append({"email_id": email_id, "error": str(e)})
    
    return {
        "success": len(errors) == 0,
        "processed": processed,
        "errors": errors
    }

@app.get("/api/analytics/emails")
async def get_email_analytics(user_id: str):
    """
    Get analytics about email patterns and stress levels.
    Helps users understand their email habits and stress triggers.
    """
    # In a real implementation, this would analyze actual user data
    return {
        "email_volume": {
            "daily_average": 25,
            "peak_times": ["9:00 AM", "2:00 PM"],
            "quiet_times": ["6:00 PM", "5:00 AM"]
        },
        "stress_patterns": {
            "high_stress_triggers": ["urgent", "deadline", "ASAP"],
            "low_stress_categories": ["newsletters", "updates"],
            "recommended_quiet_hours": ["7:00 PM", "8:00 AM"]
        },
        "success_metrics": {
            "emails_handled": 150,
            "average_response_time": "2.5 hours",
            "stress_reduction": "35%"
        }
    }

def generate_handling_suggestions(email: Dict) -> List[str]:
    """Generate personalized suggestions for handling an email"""
    suggestions = []
    
    if email.get("priority") == "HIGH":
        suggestions.append("Consider handling this email within the next 2 hours")
    if email.get("stress_level") == "HIGH":
        suggestions.append("Take a brief break before responding")
        suggestions.append("Consider using AI-generated response templates")
    if len(email.get("action_items", [])) > 2:
        suggestions.append("Break down tasks into smaller steps")
    
    return suggestions

def find_similar_emails(email: Dict) -> List[Dict]:
    """Find emails with similar characteristics for batch processing"""
    return [
        e for e in MOCK_EMAILS 
        if e["sender_email"] == email["sender_email"] 
        or e["category"] == email.get("category")
    ]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 