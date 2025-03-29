from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from prometheus_client import make_asgi_app
from prometheus_fastapi_instrumentator import Instrumentator
import sentry_sdk
from backend.routes import auth_router, email_router, health_router, preferences_router, asti_router
from backend.routes.analytics import router as analytics_router
from backend.routes.test_calendar import router as test_calendar_router
from backend.config import settings
from backend.utils.error_handlers import setup_error_handlers
from backend.utils.cache import cache_service
from backend.tasks.worker import celery as celery_app
from backend.database import Base, engine
from backend.utils.logger import setup_logger

# Initialize Sentry for error tracking
sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment=settings.ENVIRONMENT,
    traces_sample_rate=1.0,
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app with custom OpenAPI schema
app = FastAPI(
    title="Email AI App",
    description="An AI-powered email client with accessibility features",
    version="1.0.0",
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
)

# Initialize Prometheus instrumentation
instrumentator = Instrumentator().instrument(app)

# Add rate limiter to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)

# Set up error handlers
setup_error_handlers(app)

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Email AI App API",
        version="1.0.0",
        description="An AI-powered email client with accessibility features",
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Custom documentation endpoints
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Email AI App API Documentation",
        swagger_favicon_url="/static/favicon.ico",
    )

@app.get("/redoc", include_in_schema=False)
async def custom_redoc_html():
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="Email AI App API Documentation",
        redoc_favicon_url="/static/favicon.ico",
    )

# Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Root endpoint with rate limiting
@app.get("/")
@limiter.limit("60/minute")
async def root(request: Request):
    """
    Root endpoint returning welcome message.
    
    Returns:
        dict: Welcome message
    """
    return {"message": "Welcome to Email AI App API"}

# Include routers with consistent /api prefix
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["authentication"],
    responses={401: {"description": "Unauthorized"}},
)

app.include_router(
    email_router,
    prefix="/api/emails",
    tags=["emails"],
    responses={401: {"description": "Unauthorized"}},
)

app.include_router(
    preferences_router,
    prefix="/api/preferences",
    tags=["preferences"],
    responses={401: {"description": "Unauthorized"}},
)

app.include_router(
    health_router,
    prefix="/api/health",
    tags=["health"],
    responses={401: {"description": "Unauthorized"}},
)

app.include_router(analytics_router, prefix="/api")

# Include test calendar router
app.include_router(
    test_calendar_router,
    prefix="/api",
    tags=["test-calendar"],
    responses={401: {"description": "Unauthorized"}},
)

# Include ASTI router
app.include_router(
    asti_router,
    prefix="/api/asti",
    tags=["asti"],
    responses={401: {"description": "Unauthorized"}},
)

# Initialize logger
logger = setup_logger()

# Startup event to initialize services
@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup"""
    try:
        # Initialize Redis cache
        cache_service.init_cache()
        logger.info("Cache initialized successfully")
        
        # Initialize Prometheus metrics
        instrumentator.expose(app)
        
        # Initialize Celery tasks
        celery_app.conf.update(
            task_track_started=True,
            task_time_limit=900,  # 15 minutes
            worker_max_tasks_per_child=50,
            broker_connection_retry_on_startup=True
        )

    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

# Shutdown event to clean up resources
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on application shutdown"""
    logger.info("Application shutting down")
    # Close Redis connection
    if cache_service.redis:
        cache_service.redis.close()
