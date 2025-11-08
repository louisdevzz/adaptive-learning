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

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    slug: str = Field(..., min_length=1, max_length=255)
    difficulty_level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    estimated_hours: Optional[int] = Field(None, ge=0)
    thumbnail_url: Optional[str] = None
    is_published: bool = False
    is_featured: bool = False


class CourseCreate(CourseBase):
    """Schema for creating a new course."""

    pass


class CourseUpdate(BaseModel):
    """Schema for updating an existing course."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    difficulty_level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    estimated_hours: Optional[int] = Field(None, ge=0)
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseWithModules(CourseResponse):
    """Schema for course with nested modules."""

    modules: list[ModuleResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class CourseListResponse(BaseModel):
    """Schema for paginated course list."""

    total: int
    page: int
    page_size: int
    courses: list[CourseResponse]
