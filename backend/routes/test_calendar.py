from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/test/calendar",
    tags=["test_calendar"],
)

@router.get("/events", response_model=List[Dict[str, Any]])
async def get_test_calendar_events():
    """Return some mock calendar events for testing purposes"""
    
    now = datetime.now()
    tomorrow = now + timedelta(days=1)
    next_week = now + timedelta(days=7)
    
    return [
        {
            "id": "event1",
            "title": "Team Meeting",
            "start": tomorrow.replace(hour=14, minute=0).isoformat(),
            "end": tomorrow.replace(hour=15, minute=0).isoformat(),
            "location": "Conference Room A",
            "description": "Weekly team sync-up"
        },
        {
            "id": "event2",
            "title": "Project Deadline",
            "start": next_week.replace(hour=17, minute=0).isoformat(),
            "end": next_week.replace(hour=17, minute=0).isoformat(),
            "description": "Final submission due"
        },
        {
            "id": "event3",
            "title": "Lunch with Sarah",
            "start": (now + timedelta(days=2)).replace(hour=12, minute=30).isoformat(),
            "end": (now + timedelta(days=2)).replace(hour=13, minute=30).isoformat(),
            "location": "Cafe Downtown",
            "description": "Discuss project proposal"
        }
    ] 