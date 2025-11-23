"""Common dependencies for API endpoints."""

import logging
from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from core.database import get_db
from core.errors import errors
from core.security import verify_token
from core.token_blacklist import token_blacklist
from models.user import User, UserRole
from repositories.user_repo import UserRepository

# Setup logger
logger = logging.getLogger(__name__)

# Security scheme for JWT bearer token (optional, for backward compatibility)
security = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)] = None,
    access_token: Annotated[Optional[str], Cookie()] = None,
) -> User:
    """
    Get current authenticated user from JWT token.

    Supports both HttpOnly cookie and Bearer token authentication.
    Cookie takes precedence over Bearer token.

    Checks token validity, blacklist status, and user permissions.

    Args:
        request: HTTP request object
        db: Database session
        credentials: HTTP authorization credentials (optional, for backward compatibility)
        access_token: Access token from cookie (optional)

    Returns:
        Current user

    Raises:
        HTTPException: If token is invalid, blacklisted, or user not found
    """
    # Get token from cookie first, then fallback to Bearer header
    token = access_token
    if not token and credentials:
        token = credentials.credentials

    if not token:
        logger.warning("Authentication failed: No token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=errors.AUTH_INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if token is blacklisted
    if token_blacklist.is_blacklisted(token):
        logger.warning("Attempted access with blacklisted token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=errors.AUTH_TOKEN_REVOKED,
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify token
    payload = verify_token(token, "access")
    if not payload:
        logger.warning("Token validation failed: Invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=errors.AUTH_INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user ID from token
    user_id = payload.get("sub")
    if not user_id:
        logger.warning("Token validation failed: Missing user ID in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=errors.AUTH_INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)

    if not user:
        logger.warning(f"Token validation failed: User {user_id} not found in database")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=errors.USER_NOT_FOUND,
        )

    if not user.is_active:
        logger.warning(f"Token validation failed: Inactive user {user_id} attempted access")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=errors.USER_INACTIVE,
        )
    
    # Check user-specific revocation timestamp for "logout all devices"
    revocation_timestamp = token_blacklist.get_user_revocation_timestamp(user_id)
    if revocation_timestamp:
        token_issued_at = datetime.fromtimestamp(payload.get("iat", 0), tz=timezone.utc)
        if token_issued_at < revocation_timestamp:
            logger.warning(
                f"Token validation failed: Token issued before user {user_id} revocation timestamp"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=errors.AUTH_TOKEN_REVOKED,
                headers={"WWW-Authenticate": "Bearer"},
            )

    return user


def require_role(*allowed_roles: UserRole):
    """
    Dependency to require specific user roles.

    Args:
        *allowed_roles: Allowed user roles

    Returns:
        Dependency function

    Example:
        @app.get("/admin")
        def admin_only(user: User = Depends(require_role(UserRole.ADMIN))):
            return {"message": "Admin only"}
    """

    def role_checker(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.role not in allowed_roles:
            logger.warning(
                f"Permission denied: User {current_user.id} ({current_user.role.value}) "
                f"attempted to access resource requiring {[r.value for r in allowed_roles]}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=errors.AUTH_INSUFFICIENT_PERMISSIONS,
            )
        return current_user

    return role_checker


# Common dependencies for different roles
RequireAdmin = Depends(require_role(UserRole.ADMIN))
RequireTeacher = Depends(require_role(UserRole.ADMIN, UserRole.TEACHER))
RequireStudent = Depends(require_role(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT))
