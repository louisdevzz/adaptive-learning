"""Profile repository for database access."""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from models.profile import Profile
from repositories.base_repo import BaseRepository


class ProfileRepository(BaseRepository[Profile]):
    """Repository for Profile model."""

    def __init__(self, db: Session):
        """Initialize profile repository."""
        super().__init__(Profile, db)

    def get_by_user_id(self, user_id: UUID | str) -> Optional[Profile]:
        """
        Get profile by user ID.

        Args:
            user_id: User ID

        Returns:
            Profile instance or None if not found
        """
        return self.db.query(Profile).filter(Profile.user_id == user_id).first()

    def create_profile(
        self,
        user_id: UUID,
        full_name: Optional[str] = None,
        image: Optional[str] = None,
        role: Optional[str] = None,
        meta_data: Optional[dict] = None,
    ) -> Profile:
        """
        Create a new profile.

        Args:
            user_id: User ID
            full_name: Full name
            image: Profile image URL
            role: User role
            meta_data: Additional metadata

        Returns:
            Created profile instance
        """
        profile = Profile(
            user_id=user_id,
            full_name=full_name,
            image=image,
            role=role,
            meta_data=meta_data,
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_profile(
        self,
        user_id: UUID | str,
        full_name: Optional[str] = None,
        image: Optional[str] = None,
        role: Optional[str] = None,
        meta_data: Optional[dict] = None,
    ) -> Optional[Profile]:
        """
        Update profile.

        Args:
            user_id: User ID
            full_name: Full name
            image: Profile image URL
            role: User role
            meta_data: Additional metadata

        Returns:
            Updated profile instance or None if not found
        """
        profile = self.get_by_user_id(user_id)
        if profile:
            if full_name is not None:
                profile.full_name = full_name
            if image is not None:
                profile.image = image
            if role is not None:
                profile.role = role
            if meta_data is not None:
                profile.meta_data = meta_data
            self.db.commit()
            self.db.refresh(profile)
        return profile
