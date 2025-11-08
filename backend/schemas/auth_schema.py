"""Authentication schemas for login, registration, and token management."""

import re
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from core.errors import errors

# Common weak passwords to reject
COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "letmein",
    "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine", "ashley",
    "bailey", "shadow", "superman", "password1", "qwerty123", "admin", "welcome",
}


class UserRegister(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(default="student")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if not v.isalnum() and "_" not in v and "-" not in v:
            raise ValueError(errors.VALIDATION_USERNAME_INVALID)
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Validate password complexity requirements.
        
        Requirements:
        - At least 8 characters long
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        - Not a common weak password
        """
        # Check minimum length (redundant with Field validation, but explicit)
        if len(v) < 8:
            raise ValueError(errors.VALIDATION_PASSWORD_LENGTH_MIN)
        
        # Check maximum length
        if len(v) > 100:
            raise ValueError(errors.VALIDATION_PASSWORD_LENGTH_MAX)
        
        # Check for at least one uppercase letter
        if not any(c.isupper() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_UPPERCASE)
        
        # Check for at least one lowercase letter
        if not any(c.islower() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_LOWERCASE)
        
        # Check for at least one digit
        if not any(c.isdigit() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_DIGIT)
        
        # Check for at least one special character
        special_chars = r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;'`~]"
        if not re.search(special_chars, v):
            raise ValueError(errors.VALIDATION_PASSWORD_SPECIAL)
        
        # Check against common weak passwords
        if v.lower() in COMMON_PASSWORDS:
            raise ValueError(errors.VALIDATION_PASSWORD_COMMON)
        
        # Check for sequences (e.g., "12345", "abcde")
        if any(v.lower().find(seq) != -1 for seq in ["12345", "abcde", "qwerty"]):
            raise ValueError(errors.VALIDATION_PASSWORD_SEQUENCE)
        
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        """Validate role."""
        allowed_roles = ["admin", "teacher", "student", "parent"]
        if v not in allowed_roles:
            raise ValueError(errors.role_invalid(allowed_roles))
        return v


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class GoogleLogin(BaseModel):
    """Schema for Google OAuth login."""

    token: str = Field(..., description="Google OAuth token")


class TokenResponse(BaseModel):
    """Schema for token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str


class UserResponse(BaseModel):
    """Schema for user response (used in auth endpoints)."""

    id: UUID
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    profile_picture: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PasswordChange(BaseModel):
    """Schema for password change."""

    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        """
        Validate new password complexity requirements.
        
        Same requirements as registration password.
        """
        # Check minimum length
        if len(v) < 8:
            raise ValueError(errors.VALIDATION_PASSWORD_LENGTH_MIN)
        
        # Check maximum length
        if len(v) > 100:
            raise ValueError(errors.VALIDATION_PASSWORD_LENGTH_MAX)
        
        # Check for at least one uppercase letter
        if not any(c.isupper() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_UPPERCASE)
        
        # Check for at least one lowercase letter
        if not any(c.islower() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_LOWERCASE)
        
        # Check for at least one digit
        if not any(c.isdigit() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_DIGIT)
        
        # Check for at least one special character
        special_chars = r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;'`~]"
        if not re.search(special_chars, v):
            raise ValueError(errors.VALIDATION_PASSWORD_SPECIAL)
        
        # Check against common weak passwords
        if v.lower() in COMMON_PASSWORDS:
            raise ValueError(errors.VALIDATION_PASSWORD_COMMON)
        
        return v


class PasswordReset(BaseModel):
    """Schema for password reset."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        """
        Validate new password complexity requirements.
        
        Same requirements as registration password.
        """
        # Check minimum length
        if len(v) < 8:
            raise ValueError(errors.VALIDATION_PASSWORD_LENGTH_MIN)
        
        # Check maximum length
        if len(v) > 100:
            raise ValueError(errors.VALIDATION_PASSWORD_LENGTH_MAX)
        
        # Check for at least one uppercase letter
        if not any(c.isupper() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_UPPERCASE)
        
        # Check for at least one lowercase letter
        if not any(c.islower() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_LOWERCASE)
        
        # Check for at least one digit
        if not any(c.isdigit() for c in v):
            raise ValueError(errors.VALIDATION_PASSWORD_DIGIT)
        
        # Check for at least one special character
        special_chars = r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;'`~]"
        if not re.search(special_chars, v):
            raise ValueError(errors.VALIDATION_PASSWORD_SPECIAL)
        
        # Check against common weak passwords
        if v.lower() in COMMON_PASSWORDS:
            raise ValueError(errors.VALIDATION_PASSWORD_COMMON)
        
        return v
