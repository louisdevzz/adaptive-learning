"""Authentication service for user registration and login."""

import logging
import uuid
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.errors import errors
from core.security import create_token_pair, get_password_hash, verify_password
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
                "Registration attempt with existing email "
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

        # Create user with profile (automatically created)
        user = self.user_repo.create_user(
            email=user_data.email,
            username=user_data.username,
            hash_password=hashed_password,
            full_name=user_data.full_name,  # From user input or Google OAuth
            role=user_data.role or 'student',  # From user input, defaults to 'student'
            image=user_data.image,  # Profile image URL (optional)
            meta_data=user_data.meta_data,  # Additional metadata (optional)
        )

        logger.info(
            f"New user registered: user_id={user.id}, profile created automatically"
        )

        # Generate tokens
        tokens = create_token_pair(user.id, user.email, user.role)

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
                "Failed login attempt: User not found"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=errors.AUTH_INVALID_CREDENTIALS,
            )

        # Verify password
        if not verify_password(login_data.password, user.hash_password):
            logger.warning(
                f"Failed login attempt: Invalid password for user_id={user.id}"
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

        logger.info(f"Successful login: user_id={user.id}")

        # Generate tokens
        tokens = create_token_pair(user.id, user.email, user.role)

        return {
            "user": user,
            "tokens": tokens,
        }

    def login_with_google(self, google_data: GoogleLogin, google_user_info: dict) -> dict:
        """
        Login or register user with Google OAuth.

        Args:
            google_data: Google login data
            google_user_info: Verified Google user information

        Returns:
            Dict with user info and tokens
        """
        email = google_user_info.get("email")

        # Check if user exists
        user = self.user_repo.get_by_email(email)

        if user:
            # Existing user - login
            if not user.is_active:
                logger.warning(f"Inactive user Google login attempt: {email}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=errors.USER_INACTIVE,
                )

            # Update last login
            self.user_repo.update_last_login(user.id)

            logger.info(f"Google login: user_id={user.id}")
        else:
            # New user - register
            username = google_user_info.get("email").split("@")[0]
            # Ensure unique username
            counter = 1
            original_username = username
            while self.user_repo.get_by_username(username):
                username = f"{original_username}{counter}"
                counter += 1

            user = self.user_repo.create_user(
                email=email,
                username=username,
                hash_password=get_password_hash(str(uuid.uuid4())),  # Random password
                full_name=google_user_info.get("name"),
                role="student",  # Default role for Google OAuth users
            )
            logger.info(f"New Google user registered: user_id={user.id}")

        # Generate tokens
        tokens = create_token_pair(user.id, user.email, user.role)

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
