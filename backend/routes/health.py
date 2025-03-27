from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
from backend.utils.cache import cache_service
from backend.tasks.worker import celery as celery_app

router = APIRouter()

@router.get("/")
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check endpoint that checks all services:
    - API status
    - Database connection
    - Redis connection
    - Celery worker status
    """
    health_status = {
        "status": "healthy",
        "components": {
            "api": "healthy",
            "database": "unhealthy",
            "redis": "unhealthy",
            "celery": "unhealthy"
        }
    }
    
    try:
        # Check database
        db.execute(text("SELECT 1"))
        health_status["components"]["database"] = "healthy"
    except Exception as e:
        health_status["components"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Redis
    try:
        if cache_service.redis and cache_service.redis.ping():
            health_status["components"]["redis"] = "healthy"
    except Exception as e:
        health_status["components"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Celery
    try:
        # Check if Celery workers are responding
        inspect = celery_app.control.inspect()
        if inspect.ping():
            health_status["components"]["celery"] = "healthy"
        else:
            health_status["components"]["celery"] = "unhealthy: no workers responding"
            health_status["status"] = "unhealthy"
    except Exception as e:
        health_status["components"]["celery"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    return health_status
