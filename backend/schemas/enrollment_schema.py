"""Enrollment schemas for course enrollment management."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class EnrollmentBase(BaseModel):
    """Base schema for Enrollment."""

    status: str = Field(
        default="active",
        pattern="^(active|completed|dropped|suspended)$",
        description="Enrollment status",
    )
    progress: float = Field(default=0.0, ge=0.0, le=100.0, description="Course progress percentage")


class EnrollmentCreate(BaseModel):
    """Schema for creating a new enrollment."""

    student_id: UUID = Field(..., description="Student user ID")
    course_id: UUID = Field(..., description="Course ID to enroll in")


class EnrollmentUpdate(BaseModel):
    """Schema for updating an existing enrollment."""

    status: Optional[str] = Field(None, pattern="^(active|completed|dropped|suspended)$")
    progress: Optional[float] = Field(None, ge=0.0, le=100.0)


class EnrollmentResponse(EnrollmentBase):
    """Schema for enrollment response."""

    id: UUID
    student_id: UUID
    course_id: UUID
    enrolled_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
