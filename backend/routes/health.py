from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.utils.cache import cache_service
from backend.worker import celery

router = APIRouter()

@router.get("/health")
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
        db.execute("SELECT 1")
        health_status["components"]["database"] = "healthy"
    except Exception as e:
        health_status["components"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Redis
    try:
        if cache_service.redis and await cache_service.redis.ping():
            health_status["components"]["redis"] = "healthy"
    except Exception as e:
        health_status["components"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Celery
    try:
        celery_inspect = celery.control.inspect()
        if celery_inspect.active():
            health_status["components"]["celery"] = "healthy"
    except Exception as e:
        health_status["components"]["celery"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    return health_status
