"""Authentication API endpoints."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from core.config import settings
from core.database import get_db
from core.errors import errors
from core.rate_limit import RateLimits, limiter
from core.token_blacklist import token_blacklist
from models.user import User
from schemas.auth_schema import GoogleLogin, TokenResponse, UserLogin, UserRegister, UserResponse
from services.auth_service import AuthService
from utils.google_oauth import verify_google_token

# Setup logger
logger = logging.getLogger(__name__)

# Security scheme for extracting bearer token
security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookies(response: Response, tokens: dict) -> None:
    """Set authentication cookies with HttpOnly flag."""
    # Set access token cookie
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=settings.COOKIE_DOMAIN,
    )

    # Set refresh token cookie
    if tokens.get("refresh_token"):
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            path="/api/v1/auth",  # Only send to auth endpoints
            domain=settings.COOKIE_DOMAIN,
        )


def clear_auth_cookies(response: Response) -> None:
    """Clear authentication cookies."""
    response.delete_cookie(
        key="access_token",
        path="/",
        domain=settings.COOKIE_DOMAIN,
    )
    response.delete_cookie(
        key="refresh_token",
        path="/api/v1/auth",
        domain=settings.COOKIE_DOMAIN,
    )


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
@limiter.limit(RateLimits.AUTH_REGISTER)
def register(
    request: Request,
    response: Response,
    user_data: UserRegister,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Register a new user with email and password.

    Rate limit: 3 requests per minute per IP to prevent abuse.

    Returns user info. Tokens are set as HttpOnly cookies.
    """
    auth_service = AuthService(db)
    result = auth_service.register_user(user_data)

    # Set authentication cookies
    set_auth_cookies(response, result["tokens"])

    return {
        "user": UserResponse.model_validate(result["user"]),
        "message": "Registration successful",
    }


@router.post("/login", response_model=dict)
@limiter.limit(RateLimits.AUTH_LOGIN)
def login(
    request: Request,
    response: Response,
    login_data: UserLogin,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Login with email and password.

    Rate limit: 5 requests per minute per IP to prevent brute-force attacks.

    Returns user info. Tokens are set as HttpOnly cookies.
    """
    auth_service = AuthService(db)
    result = auth_service.login_user(login_data)

    # Set authentication cookies
    set_auth_cookies(response, result["tokens"])

    return {
        "user": UserResponse.model_validate(result["user"]),
        "message": "Login successful",
    }


@router.post("/google", response_model=dict)
@limiter.limit(RateLimits.AUTH_GOOGLE)
def google_login(
    request: Request,
    response: Response,
    google_data: GoogleLogin,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Login or register with Google OAuth.

    Rate limit: 10 requests per minute per IP.

    Requires a valid Google OAuth ID token.
    Returns user info. Tokens are set as HttpOnly cookies.
    """
    # Verify Google token
    google_user_info = verify_google_token(google_data.token)
    if not google_user_info:
        logger.warning("Failed Google OAuth attempt: Invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=errors.AUTH_GOOGLE_TOKEN_INVALID,
        )

    # Login or register user
    auth_service = AuthService(db)
    result = auth_service.login_with_google(google_data, google_user_info)

    # Set authentication cookies
    set_auth_cookies(response, result["tokens"])

    return {
        "user": UserResponse.model_validate(result["user"]),
        "message": "Login successful",
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get current authenticated user information.

    Requires valid authentication token.
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    current_user: Annotated[User, Depends(get_current_user)],
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)] = None,
    access_token: Annotated[Optional[str], Cookie()] = None,
):
    """
    Logout current user by blacklisting their access token and clearing cookies.

    The token will be added to a Redis-based blacklist and will be invalid
    for all subsequent requests until it naturally expires.

    Args:
        response: Response object for clearing cookies
        current_user: Current authenticated user
        credentials: Bearer token credentials (optional)
        access_token: Access token from cookie (optional)

    Returns:
        No content (204)
    """
    # Get token from cookie first, then fallback to Bearer header
    token = access_token
    if not token and credentials:
        token = credentials.credentials

    if token:
        # Blacklist the current access token
        success = token_blacklist.blacklist_token(token, str(current_user.id))

        if not success:
            logger.error(
                f"Failed to blacklist token for user {current_user.id} during logout"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=errors.LOGOUT_FAILED,
            )

    # Clear authentication cookies
    clear_auth_cookies(response)

    logger.info(f"User {current_user.id} logged out successfully")
    return None


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("3/hour")  # Very restrictive - logout from all devices is sensitive
def logout_all_devices(
    request: Request,
    response: Response,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Logout from all devices by invalidating all user's tokens.

    Rate limit: 3 requests per hour to prevent abuse.

    This will blacklist all active tokens for the current user,
    effectively logging them out from all devices.

    Args:
        request: Request object (required for rate limiting)
        response: Response object (required for rate limiting)
        current_user: Current authenticated user

    Returns:
        No content (204)
    """
    success = token_blacklist.blacklist_all_user_tokens(str(current_user.id))

    if not success:
        logger.error(
            f"Failed to revoke all tokens for user {current_user.id} during logout-all"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=errors.LOGOUT_ALL_FAILED,
        )

    # Clear authentication cookies for current device
    clear_auth_cookies(response)

    logger.info(f"User {current_user.id} logged out from all devices successfully")
    return None
