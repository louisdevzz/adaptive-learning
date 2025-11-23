"""Profile API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from core.database import get_db
from models.user import User
from schemas.profile_schema import ProfileResponse, ProfileUpdate
from services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Get current user's profile.

    Returns:
        Profile information
    """
    service = ProfileService(db)
    return service.get_profile(current_user.id)


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Update current user's profile.

    Args:
        profile_data: Profile update data

    Returns:
        Updated profile information
    """
    service = ProfileService(db)
    return service.update_profile(current_user.id, profile_data)


@router.get("/{user_id}", response_model=ProfileResponse)
def get_user_profile(
    user_id: str,
    db: Session = Depends(get_db),
):
    """
    Get any user's profile (public endpoint).

    Args:
        user_id: User ID

    Returns:
        Profile information
    """
    service = ProfileService(db)
    return service.get_profile(user_id)
