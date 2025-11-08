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

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    order: int = Field(default=0, ge=0)
    estimated_minutes: Optional[int] = Field(None, ge=0)


class ModuleCreate(ModuleBase):
    """Schema for creating a new module."""

    course_id: UUID


class ModuleUpdate(BaseModel):
    """Schema for updating an existing module."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    order: Optional[int] = Field(None, ge=0)
    estimated_minutes: Optional[int] = Field(None, ge=0)


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
