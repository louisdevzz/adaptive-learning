"""Module schemas for CRUD operations."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from schemas.section_schema import SectionResponse


class ModuleBase(BaseModel):
    """Base schema for Module."""

    name: str = Field(..., min_length=1, description="Module name")
    description: Optional[str] = Field(None, description="Module description")
    module_number: int = Field(..., ge=1, description="Module number/order")
    estimated_hours: Optional[int] = Field(None, ge=0, description="Estimated hours to complete")
    difficulty_level: int = Field(default=3, ge=1, le=5, description="Difficulty level (1-5)")
    is_active: bool = Field(default=True, description="Whether module is active")


class ModuleCreate(ModuleBase):
    """Schema for creating a new module."""

    course_id: UUID = Field(..., description="Course ID this module belongs to")


class ModuleUpdate(BaseModel):
    """Schema for updating an existing module."""

    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    module_number: Optional[int] = Field(None, ge=1)
    estimated_hours: Optional[int] = Field(None, ge=0)
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None


class ModuleResponse(ModuleBase):
    """Schema for module response."""

    id: UUID
    course_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ModuleWithSections(ModuleResponse):
    """Schema for module with nested sections."""

    sections: list[SectionResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ModuleListResponse(BaseModel):
    """Schema for paginated module list."""

    items: list[ModuleResponse]
    total: int
    page: int
    page_size: int
