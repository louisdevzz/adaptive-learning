"""User repository for database access."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from core.errors import errors
from models.user import User
from models.profile import Profile
from repositories.base_repo import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model with authentication-specific methods."""

    def __init__(self, db: Session):
        """Initialize user repository."""
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address.

        Args:
            email: User email

        Returns:
            User instance or None if not found
        """
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.

        Args:
            username: Username

        Returns:
            User instance or None if not found
        """
        return self.db.query(User).filter(User.username == username).first()

    def create_user(
        self,
        email: str,
        username: str,
        hash_password: str,
        full_name: Optional[str] = None,
        role: Optional[str] = None,
        image: Optional[str] = None,
        meta_data: Optional[dict] = None,
    ) -> User:
        """
        Create a new user with profile.

        Args:
            email: User email
            username: Username
            hash_password: Hashed password
            full_name: Full name for profile (optional)
            role: User role for profile (optional, e.g., 'student', 'teacher', 'admin')
            image: Profile image URL (optional)
            meta_data: Additional profile metadata (optional)

        Returns:
            Created user instance with profile
        """
        # Create user
        user = User(
            email=email,
            username=username,
            hash_password=hash_password,
            role=role or 'student',  # Set role on User model
            is_active=True,
        )
        self.db.add(user)
        self.db.flush()  # Flush to get user.id before creating profile

        # Automatically create profile
        profile = Profile(
            user_id=user.id,
            full_name=full_name,
            role=role or 'student',  # Default to student if not specified
            image=image,
            meta_data=meta_data or {},
        )
        self.db.add(profile)

        self.db.commit()
        self.db.refresh(user)
        return user

    def update_last_login(self, user_id: UUID | str) -> Optional[User]:
        """
        Update user's last login timestamp.

        Args:
            user_id: User ID

        Returns:
            Updated user instance or None if not found
        """
        user = self.get_by_id(user_id)
        if user:
            self.db.commit()
            self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: UUID | str) -> Optional[User]:
        """
        Deactivate a user.

        Args:
            user_id: User ID

        Returns:
            Updated user instance or None if not found
        """
        user = self.get_by_id(user_id)
        if user:
            user.is_active = False
            self.db.commit()
            self.db.refresh(user)
        return user

    def activate_user(self, user_id: UUID | str) -> Optional[User]:
        """
        Activate a user.

        Args:
            user_id: User ID

        Returns:
            Updated user instance or None if not found
        """
        user = self.get_by_id(user_id)
        if user:
            user.is_active = True
            self.db.commit()
            self.db.refresh(user)
        return user
