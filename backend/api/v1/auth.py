"""Authentication API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from core.database import get_db
from models.user import User
from schemas.auth_schema import GoogleLogin, TokenResponse, UserLogin, UserRegister, UserResponse
from services.auth_service import AuthService
from utils.google_oauth import verify_google_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Register a new user with email and password.

    Returns user info and authentication tokens.
    """
    auth_service = AuthService(db)
    result = auth_service.register_user(user_data)

    return {
        "user": UserResponse.model_validate(result["user"]),
        "tokens": result["tokens"],
    }


@router.post("/login", response_model=dict)
def login(
    login_data: UserLogin,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Login with email and password.

    Returns user info and authentication tokens.
    """
    auth_service = AuthService(db)
    result = auth_service.login_user(login_data)

    return {
        "user": UserResponse.model_validate(result["user"]),
        "tokens": result["tokens"],
    }


@router.post("/google", response_model=dict)
def google_login(
    google_data: GoogleLogin,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Login or register with Google OAuth.

    Requires a valid Google OAuth ID token.
    Returns user info and authentication tokens.
    """
    # Verify Google token
    google_user_info = verify_google_token(google_data.token)
    if not google_user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
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
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Logout current user.

    Note: In a stateless JWT system, logout is typically handled on the client
    by removing the token. This endpoint is provided for consistency and
    could be extended to implement token blacklisting with Redis.
    """
    # TODO: Implement token blacklisting with Redis
    return None
