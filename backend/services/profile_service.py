"""Profile service for user profile management."""

import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.errors import errors
from repositories.profile_repo import ProfileRepository
from schemas.profile_schema import ProfileCreate, ProfileUpdate

# Setup logger
logger = logging.getLogger(__name__)


class ProfileService:
    """Service for profile operations."""

    def __init__(self, db: Session):
        """Initialize profile service."""
        self.db = db
        self.profile_repo = ProfileRepository(db)

    def get_profile(self, user_id: UUID | str):
        """
        Get user profile.

        Args:
            user_id: User ID

        Returns:
            Profile instance

        Raises:
            HTTPException: If profile not found
        """
        profile = self.profile_repo.get_by_user_id(user_id)
        if not profile:
            logger.error(f"Profile not found for user: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.PROFILE_NOT_FOUND,
            )
        return profile

    def update_profile(self, user_id: UUID | str, profile_data: ProfileUpdate):
        """
        Update user profile.

        Args:
            user_id: User ID
            profile_data: Profile update data

        Returns:
            Updated profile instance

        Raises:
            HTTPException: If profile not found
        """
        profile = self.profile_repo.update_profile(
            user_id=user_id,
            full_name=profile_data.full_name,
            image=profile_data.image,
            role=profile_data.role,
            meta_data=profile_data.meta_data,
        )

        if not profile:
            logger.error(f"Profile not found for user: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.PROFILE_NOT_FOUND,
            )

        logger.info(f"Profile updated for user: {user_id}")
        return profile

    def create_profile(self, profile_data: ProfileCreate):
        """
        Create a new profile (usually called automatically on user registration).

        Args:
            profile_data: Profile creation data

        Returns:
            Created profile instance

        Raises:
            HTTPException: If profile already exists
        """
        # Check if profile already exists
        existing_profile = self.profile_repo.get_by_user_id(profile_data.user_id)
        if existing_profile:
            logger.warning(f"Profile already exists for user: {profile_data.user_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=errors.PROFILE_ALREADY_EXISTS,
            )

        profile = self.profile_repo.create_profile(
            user_id=profile_data.user_id,
            full_name=profile_data.full_name,
            image=profile_data.image,
            role=profile_data.role,
            meta_data=profile_data.meta_data,
        )

        logger.info(f"Profile created for user: {profile_data.user_id}")
        return profile
