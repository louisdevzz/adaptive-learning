"""Profile schemas for user profile management."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileBase(BaseModel):
    """Base schema for profile."""

    full_name: Optional[str] = Field(None, description="Full name of the user")
    image: Optional[str] = Field(None, description="Profile image URL")
    role: Optional[str] = Field(None, description="User role (student, teacher, admin)")
    meta_data: Optional[dict[str, Any]] = Field(None, description="Additional metadata")


class ProfileCreate(ProfileBase):
    """Schema for creating a profile."""

    user_id: UUID = Field(..., description="User ID this profile belongs to")


class ProfileUpdate(BaseModel):
    """Schema for updating a profile."""

    full_name: Optional[str] = None
    image: Optional[str] = None
    role: Optional[str] = None
    meta_data: Optional[dict[str, Any]] = None


class ProfileResponse(ProfileBase):
    """Schema for profile response."""

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
