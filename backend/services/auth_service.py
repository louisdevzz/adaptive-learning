"""Authentication service for user registration and login."""

import logging
import uuid
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core.errors import errors
from core.security import create_token_pair, get_password_hash, verify_password
from models.user import UserRole
from repositories.user_repo import UserRepository
from schemas.auth_schema import GoogleLogin, UserLogin, UserRegister

# Setup logger
logger = logging.getLogger(__name__)


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: Session):
        """Initialize auth service."""
        self.db = db
        self.user_repo = UserRepository(db)

    def register_user(self, user_data: UserRegister) -> dict:
        """
        Register a new user with email and password.

        Args:
            user_data: User registration data

        Returns:
            Dict with user info and tokens

        Raises:
            HTTPException: If email or username already exists
        """
        # Check if email already exists
        existing_user = self.user_repo.get_by_email(user_data.email)
        if existing_user:
            logger.warning(
                f"Registration attempt with existing email: {user_data.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=errors.USER_EMAIL_EXISTS,
            )

        # Check if username already exists
        existing_username = self.user_repo.get_by_username(user_data.username)
        if existing_username:
            logger.warning(
                f"Registration attempt with existing username: {user_data.username}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=errors.USER_USERNAME_EXISTS,
            )

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Create user
        user = self.user_repo.create_user(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=UserRole(user_data.role),
        )

        logger.info(
            f"New user registered: {user.id} ({user.email}), role: {user.role.value}"
        )

        # Generate tokens
        tokens = create_token_pair(user.id, user.email, user.role.value)

        return {
            "user": user,
            "tokens": tokens,
        }

    def login_user(self, login_data: UserLogin) -> dict:
        """
        Login user with email and password.

        Args:
            login_data: User login credentials

        Returns:
            Dict with user info and tokens

        Raises:
            HTTPException: If credentials are invalid
        """
        # Get user by email
        user = self.user_repo.get_by_email(login_data.email)
        if not user:
            logger.warning(
                f"Failed login attempt: User not found for email {login_data.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=errors.AUTH_INVALID_CREDENTIALS,
            )

        # Check if user has a password (not OAuth-only user)
        if not user.hashed_password:
            logger.warning(
                f"Failed login attempt: OAuth-only account tried password login ({login_data.email})"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=errors.AUTH_GOOGLE_LOGIN_REQUIRED,
            )

        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            logger.warning(
                f"Failed login attempt: Invalid password for user {user.id} ({login_data.email})"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=errors.AUTH_INVALID_CREDENTIALS,
            )

        # Check if user is active
        if not user.is_active:
            logger.warning(
                f"Failed login attempt: Inactive account {user.id} ({login_data.email})"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=errors.USER_INACTIVE,
            )

        # Update last login
        self.user_repo.update_last_login(user.id)

        logger.info(f"Successful login: user {user.id} ({user.email})")

        # Generate tokens
        tokens = create_token_pair(user.id, user.email, user.role.value)

        return {
            "user": user,
            "tokens": tokens,
        }

    def login_with_google(self, google_data: GoogleLogin, google_user_info: dict) -> dict:
        """
        Login or register user with Google OAuth.

        Args:
            google_data: Google login data with token
            google_user_info: User info from Google (should be validated before calling)

        Returns:
            Dict with user info and tokens
        """
        google_id = google_user_info["sub"]
        email = google_user_info["email"]
        full_name = google_user_info.get("name", email.split("@")[0])
        profile_picture = google_user_info.get("picture")

        # Check if user exists by Google ID
        user = self.user_repo.get_by_google_id(google_id)

        if not user:
            # Check if user exists by email
            user = self.user_repo.get_by_email(email)

            if user:
                # Link Google account to existing user
                logger.info(
                    f"Linking Google account {google_id} to existing user {user.id} ({email})"
                )
                user.google_id = google_id
                user.profile_picture = profile_picture
                user.is_verified = True
                self.db.commit()
                self.db.refresh(user)
            else:
                # Create new user with Google OAuth
                username = email.split("@")[0]
                
                # Sanitize username: only allow alphanumeric and underscores
                username = "".join(c if c.isalnum() or c == "_" else "_" for c in username)
                
                # Ensure username is unique with maximum retry limit
                max_attempts = 100
                counter = 1
                original_username = username
                
                while self.user_repo.get_by_username(username) and counter < max_attempts:
                    username = f"{original_username}{counter}"
                    counter += 1
                
                # If we hit the retry limit, use UUID fallback
                if counter >= max_attempts:
                    # Generate a unique username with UUID suffix
                    unique_suffix = uuid.uuid4().hex[:6]
                    username = f"{original_username}_{unique_suffix}"
                    
                    # Final check - if still exists (extremely unlikely), use full UUID
                    if self.user_repo.get_by_username(username):
                        username = f"user_{uuid.uuid4().hex[:12]}"

                # Use configurable default role for Google OAuth users
                default_role = UserRole(settings.GOOGLE_DEFAULT_ROLE)
                
                user = self.user_repo.create_user(
                    email=email,
                    username=username,
                    full_name=full_name,
                    google_id=google_id,
                    profile_picture=profile_picture,
                    role=default_role,
                )

                logger.info(
                    f"New Google OAuth user registered: {user.id} ({email}), "
                    f"username: {username}, role: {default_role.value}"
                )

        # Check if user is active
        if not user.is_active:
            logger.warning(
                f"Failed Google login attempt: Inactive account {user.id} ({email})"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=errors.USER_INACTIVE,
            )

        # Update last login
        self.user_repo.update_last_login(user.id)

        logger.info(f"Successful Google OAuth login: user {user.id} ({email})")

        # Generate tokens
        tokens = create_token_pair(user.id, user.email, user.role.value)

        return {
            "user": user,
            "tokens": tokens,
        }

    def get_current_user(self, user_id: UUID | str):
        """
        Get current authenticated user.

        Args:
            user_id: User ID from JWT token

        Returns:
            User instance

        Raises:
            HTTPException: If user not found
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            logger.error(f"User not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.USER_NOT_FOUND,
            )

        if not user.is_active:
            logger.warning(f"Inactive user access attempt: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=errors.USER_INACTIVE,
            )

        return user
