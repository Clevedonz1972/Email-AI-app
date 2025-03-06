from fastapi import APIRouter
from ..services.database import get_db

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check API and database health"""
    try:
        db = get_db()
        await db.execute("SELECT 1")  # Test DB connection
        return {
            "status": "healthy",
            "database": "connected",
            "services": {"email_analysis": "ready", "auth": "ready"},
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
