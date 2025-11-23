"""Authentication schemas for user login, registration, and token management."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")


class UserRegister(BaseModel):
    """Schema for user registration."""

    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Username")
    password: str = Field(..., min_length=6, description="User password")
    full_name: Optional[str] = Field(None, min_length=1, max_length=255, description="User full name")
    role: Optional[str] = Field(None, min_length=1, max_length=50, description="User role (defaults to 'student')")
    image: Optional[str] = Field(None, description="Profile image URL")
    meta_data: Optional[dict] = Field(None, description="Additional profile metadata")


class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")


class UserResponse(BaseModel):
    """Schema for user response."""

    id: UUID
    email: str
    username: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PasswordChange(BaseModel):
    """Schema for password change."""

    old_password: str = Field(..., min_length=6, description="Current password")
    new_password: str = Field(..., min_length=6, description="New password")


class PasswordReset(BaseModel):
    """Schema for password reset."""

    email: EmailStr = Field(..., description="User email address")


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""

    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=6, description="New password")


class GoogleLogin(BaseModel):
    """Schema for Google OAuth login."""

    token: str = Field(..., description="Google OAuth ID token")


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str = Field(..., description="Refresh token")
