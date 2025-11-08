"""Main FastAPI application entry point."""

import logging

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from api.v1 import api_router
from core.config import settings
from core.database import get_pool_status, log_pool_status, verify_db_connection
from core.rate_limit import limiter, rate_limit_exceeded_handler

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Adaptive Learning Platform API with AI-powered content generation",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Add rate limiter state to app
app.state.limiter = limiter

# Add rate limit exception handler
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)


# Health check endpoint
@app.get("/health", tags=["Health"])
@limiter.limit("60/minute")  # More permissive for health checks
def health_check(request: Request):
    """
    Health check endpoint with database connection and pool status.
    
    Args:
        request: Request object (required for rate limiting)
    
    Returns:
        Health status including database connectivity and connection pool metrics
    """
    db_healthy = verify_db_connection()
    pool_status = get_pool_status()
    
    # Determine overall health status
    status = "healthy"
    if not db_healthy:
        status = "unhealthy"
    elif pool_status["is_exhausted"]:
        status = "degraded"
    elif pool_status["utilization_percent"] > 80:
        status = "warning"
    
    return {
        "status": status,
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": {
            "connected": db_healthy,
            "pool": {
                "in_use": pool_status["checked_out"],
                "idle": pool_status["checked_in"],
                "total_limit": pool_status["total_limit"],
                "utilization_percent": pool_status["utilization_percent"],
                "is_exhausted": pool_status["is_exhausted"],
            }
        },
    }


# Include API routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Application startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"API docs available at: http://{settings.HOST}:{settings.PORT}/docs")
    
    # Verify database connection
    if verify_db_connection():
        logger.info("✓ Database connection is healthy")
        
        # Log initial connection pool status
        log_pool_status()
    else:
        logger.error("✗ Database connection failed - application may not function correctly")
    
    # Log rate limiting configuration
    logger.info(f"✓ Rate limiting enabled: {settings.RATE_LIMIT_PER_MINUTE} requests/minute")
    logger.info(f"   Using Redis storage: {settings.REDIS_URL}")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info(f"Shutting down {settings.APP_NAME}")


def main():
    """Run the application with uvicorn."""
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning",
    )


if __name__ == "__main__":
    main()
