from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from .client import MOCK_EMAILS

app = FastAPI()

class EmailUpdate(BaseModel):
    priority: Optional[str]
    is_read: Optional[bool]

@app.get("/api/emails")
async def get_emails(limit: int = 50, offset: int = 0):
    return MOCK_EMAILS[offset:offset+limit]

@app.patch("/api/emails/{email_id}/read")
async def mark_email_read(email_id: str):
    email = next((e for e in MOCK_EMAILS if e["id"] == email_id), None)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    email["is_read"] = True
    return {"success": True}

@app.patch("/api/emails/{email_id}/priority")
async def update_email_priority(email_id: str, update: EmailUpdate):
    email = next((e for e in MOCK_EMAILS if e["id"] == email_id), None)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    if update.priority:
        email["priority"] = update.priority
    return {"success": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 