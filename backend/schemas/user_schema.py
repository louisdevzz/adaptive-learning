"""User schemas for admin user management."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from models.user import UserRole


class UserListItem(BaseModel):
    """Schema for user list item."""

    id: UUID
    email: str
    username: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    full_name: Optional[str] = None
    meta_data: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class UserDetailResponse(BaseModel):
    """Schema for detailed user response."""

    id: UUID
    email: str
    username: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    full_name: Optional[str] = None
    image: Optional[str] = None
    meta_data: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    """Schema for paginated user list response."""

    total: int
    page: int
    page_size: int
    items: list[UserListItem]


class UserStatsResponse(BaseModel):
    """Schema for user statistics."""

    total_users: int
    total_students: int
    total_teachers: int
    total_parents: int
    total_admins: int
    active_users: int
    inactive_users: int
    new_users_this_month: int


class UserCreateRequest(BaseModel):
    """Schema for creating a new user (admin only)."""

    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Username")
    password: str = Field(..., min_length=6, description="User password")
    full_name: Optional[str] = Field(None, max_length=255, description="Full name")
    role: UserRole = Field(default=UserRole.STUDENT, description="User role")
    meta_data: Optional[dict[str, Any]] = Field(None, description="Role-specific metadata")


class UserUpdateRequest(BaseModel):
    """Schema for updating user (admin only)."""

    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    meta_data: Optional[dict[str, Any]] = None


class ResetPasswordRequest(BaseModel):
    """Schema for resetting user password (admin only)."""

    new_password: str = Field(..., min_length=6, description="New password (minimum 6 characters)")
