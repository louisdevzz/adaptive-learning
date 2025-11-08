"""Rate limiting configuration and utilities."""

import logging
from typing import Callable

from fastapi import Request, Response
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from core.config import settings

# Setup logger
logger = logging.getLogger(__name__)


def get_client_identifier(request: Request) -> str:
    """
    Get client identifier for rate limiting.
    
    Uses X-Forwarded-For header if behind a proxy, otherwise uses remote address.
    Falls back to a default identifier if neither is available.
    
    Args:
        request: FastAPI request object
        
    Returns:
        Client identifier string
    """
    # Check for X-Forwarded-For header (when behind proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        client_ip = forwarded_for.split(",")[0].strip()
        return client_ip
    
    # Use X-Real-IP if available
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct connection IP
    return get_remote_address(request)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Custom handler for rate limit exceeded errors.
    
    Args:
        request: FastAPI request object
        exc: RateLimitExceeded exception
        
    Returns:
        JSON response with error details
    """
    client_id = get_client_identifier(request)
    logger.warning(
        f"Rate limit exceeded for client {client_id} on path {request.url.path}"
    )
    
    return Response(
        content='{"detail":"Rate limit exceeded. Please try again later."}',
        status_code=429,
        headers={
            "Content-Type": "application/json",
            "Retry-After": str(exc.retry_after) if hasattr(exc, 'retry_after') else "60",
            "X-RateLimit-Limit": str(exc.limit) if hasattr(exc, 'limit') else "Unknown",
            "X-RateLimit-Remaining": "0",
        },
    )


# Create limiter instance
limiter = Limiter(
    key_func=get_client_identifier,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
    storage_uri=settings.REDIS_URL,
    strategy="fixed-window",
    headers_enabled=True,
)


# Rate limit configurations for different endpoint types
class RateLimits:
    """Predefined rate limit configurations."""
    
    # Authentication endpoints (most restrictive)
    AUTH_LOGIN = "5/minute"  # 5 login attempts per minute
    AUTH_REGISTER = "3/minute"  # 3 registration attempts per minute
    AUTH_GOOGLE = "10/minute"  # 10 OAuth attempts per minute
    
    # Password operations (very restrictive)
    PASSWORD_RESET = "3/hour"  # 3 password resets per hour
    PASSWORD_CHANGE = "5/hour"  # 5 password changes per hour
    
    # Content operations (moderate)
    CONTENT_CREATE = "20/minute"  # 20 content creations per minute
    CONTENT_UPDATE = "30/minute"  # 30 content updates per minute
    CONTENT_DELETE = "10/minute"  # 10 deletions per minute
    
    # Read operations (least restrictive)
    CONTENT_READ = "100/minute"  # 100 reads per minute
    
    # API-wide default
    DEFAULT = f"{settings.RATE_LIMIT_PER_MINUTE}/minute"


def get_rate_limit_decorator(limit: str) -> Callable:
    """
    Get a rate limit decorator with the specified limit.
    
    Args:
        limit: Rate limit string (e.g., "5/minute", "100/hour")
        
    Returns:
        Decorator function
        
    Example:
        @get_rate_limit_decorator("5/minute")
        @router.post("/login")
        def login(...):
            pass
    """
    return limiter.limit(limit)

