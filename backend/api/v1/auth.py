"""Authentication API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
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
security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
@limiter.limit(RateLimits.AUTH_REGISTER)
def register(
    request: Request,
    user_data: UserRegister,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Register a new user with email and password.

    Rate limit: 3 requests per minute per IP to prevent abuse.
    
    Returns user info and authentication tokens.
    """
    auth_service = AuthService(db)
    result = auth_service.register_user(user_data)

    return {
        "user": UserResponse.model_validate(result["user"]),
        "tokens": result["tokens"],
    }


@router.post("/login", response_model=dict)
@limiter.limit(RateLimits.AUTH_LOGIN)
def login(
    request: Request,
    login_data: UserLogin,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Login with email and password.

    Rate limit: 5 requests per minute per IP to prevent brute-force attacks.
    
    Returns user info and authentication tokens.
    """
    auth_service = AuthService(db)
    result = auth_service.login_user(login_data)

    return {
        "user": UserResponse.model_validate(result["user"]),
        "tokens": result["tokens"],
    }


@router.post("/google", response_model=dict)
@limiter.limit(RateLimits.AUTH_GOOGLE)
def google_login(
    request: Request,
    google_data: GoogleLogin,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Login or register with Google OAuth.

    Rate limit: 10 requests per minute per IP.
    
    Requires a valid Google OAuth ID token.
    Returns user info and authentication tokens.
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

    return {
        "user": UserResponse.model_validate(result["user"]),
        "tokens": result["tokens"],
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
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Logout current user by blacklisting their access token.
    
    The token will be added to a Redis-based blacklist and will be invalid
    for all subsequent requests until it naturally expires.
    
    Args:
        credentials: Bearer token credentials
        current_user: Current authenticated user
        
    Returns:
        No content (204)
    """
    token = credentials.credentials
    
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
    
    logger.info(f"User {current_user.id} logged out successfully")
    return None


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("3/hour")  # Very restrictive - logout from all devices is sensitive
def logout_all_devices(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Logout from all devices by invalidating all user's tokens.
    
    Rate limit: 3 requests per hour to prevent abuse.
    
    This will blacklist all active tokens for the current user,
    effectively logging them out from all devices.
    
    Args:
        request: Request object (required for rate limiting)
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
    
    logger.info(f"User {current_user.id} logged out from all devices successfully")
    return None
