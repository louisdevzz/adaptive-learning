"""User repository for database access."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from core.errors import errors
from models.user import User, UserRole
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

    def get_by_google_id(self, google_id: str) -> Optional[User]:
        """
        Get user by Google ID.

        Args:
            google_id: Google OAuth ID

        Returns:
            User instance or None if not found
        """
        return self.db.query(User).filter(User.google_id == google_id).first()

    def create_user(
        self,
        email: str,
        username: str,
        full_name: str,
        hashed_password: Optional[str] = None,
        role: UserRole = UserRole.STUDENT,
        google_id: Optional[str] = None,
        profile_picture: Optional[str] = None,
    ) -> User:
        """
        Create a new user.

        Args:
            email: User email
            username: Username
            full_name: Full name
            hashed_password: Hashed password (optional for OAuth users)
            role: User role
            google_id: Google OAuth ID (optional)
            profile_picture: Profile picture URL (optional)

        Returns:
            Created user instance
        """
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            hashed_password=hashed_password,
            role=role,
            google_id=google_id,
            profile_picture=profile_picture,
            is_active=True,
            is_verified=google_id is not None,  # Auto-verify OAuth users
        )
        self.db.add(user)
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
            user.last_login = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(user)
        return user

    def verify_user(self, user_id: UUID | str) -> Optional[User]:
        """
        Mark user as verified.

        Args:
            user_id: User ID

        Returns:
            Updated user instance or None if not found
        """
        user = self.get_by_id(user_id)
        if user:
            user.is_verified = True
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

    def get_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> list[User]:
        """
        Get users by role with validated pagination.

        Args:
            role: User role to filter by
            skip: Number of records to skip (must be non-negative)
            limit: Maximum number of records to return (capped at MAX_PAGE_SIZE)

        Returns:
            List of users with the specified role
            
        Raises:
            ValueError: If skip or limit is negative
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError(errors.VALIDATION_SKIP_NEGATIVE)
        
        if limit < 0:
            raise ValueError(errors.VALIDATION_LIMIT_NEGATIVE)
        
        # Enforce maximum page size
        from core.config import settings
        from core.errors import errors as err_msgs
        limit = min(limit, settings.MAX_PAGE_SIZE)
        
        return self.db.query(User).filter(User.role == role).offset(skip).limit(limit).all()
