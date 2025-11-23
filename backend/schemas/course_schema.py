"""Course schemas for CRUD operations."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from schemas.module_schema import ModuleResponse


class CourseBase(BaseModel):
    """Base schema for Course."""

    name: str = Field(..., min_length=1, description="Course name")
    description: Optional[str] = Field(None, description="Course description")
    code: str = Field(..., min_length=1, max_length=50, description="Course code")
    grade_level: Optional[int] = Field(None, ge=1, le=12, description="Grade level (1-12)")
    academic_year: Optional[int] = Field(None, ge=2020, le=2100, description="Academic year")
    difficulty_level: int = Field(default=3, ge=1, le=5, description="Difficulty level (1-5)")
    is_active: bool = Field(default=True, description="Whether course is active")


class CourseCreate(CourseBase):
    """Schema for creating a new course."""

    user_id: Optional[UUID] = Field(None, description="User ID who created the course (auto-filled from token)")


class CourseUpdate(BaseModel):
    """Schema for updating an existing course."""

    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    grade_level: Optional[int] = Field(None, ge=1, le=12)
    academic_year: Optional[int] = Field(None, ge=2020, le=2100)
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response."""

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseWithModules(CourseResponse):
    """Schema for course with nested modules."""

    modules: list[ModuleResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class CourseListResponse(BaseModel):
    """Schema for paginated course list."""

    items: list[CourseResponse]
    total: int
