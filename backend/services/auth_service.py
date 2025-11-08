"""Authentication service for user registration and login."""

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import create_token_pair, get_password_hash, verify_password
from models.user import UserRole
from repositories.user_repo import UserRepository
from schemas.auth_schema import GoogleLogin, UserLogin, UserRegister


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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Check if username already exists
        existing_username = self.user_repo.get_by_username(user_data.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
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
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        # Check if user has a password (not OAuth-only user)
        if not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please login with Google",
            )

        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        # Update last login
        self.user_repo.update_last_login(user.id)

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
                user.google_id = google_id
                user.profile_picture = profile_picture
                user.is_verified = True
                self.db.commit()
                self.db.refresh(user)
            else:
                # Create new user with Google OAuth
                username = email.split("@")[0]
                # Ensure username is unique
                counter = 1
                original_username = username
                while self.user_repo.get_by_username(username):
                    username = f"{original_username}{counter}"
                    counter += 1

                user = self.user_repo.create_user(
                    email=email,
                    username=username,
                    full_name=full_name,
                    google_id=google_id,
                    profile_picture=profile_picture,
                    role=UserRole.STUDENT,
                )

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        # Update last login
        self.user_repo.update_last_login(user.id)

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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        return user
