"""Section schemas for CRUD operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any, TYPE_CHECKING, Optional
from uuid import UUID

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from schemas.kp_schema import KnowledgePointResponse


class SectionBase(BaseModel):
    """Base schema for Section."""

    name: str = Field(..., min_length=1, description="Section name")
    description: Optional[str] = Field(None, description="Section description")
    section_number: int = Field(..., ge=1, description="Section number/order")
    estimated_hours: Optional[int] = Field(None, ge=0, description="Estimated hours to complete")
    difficulty_level: int = Field(default=3, ge=1, le=5, description="Difficulty level (1-5)")
    objectives: Optional[dict[str, Any]] = Field(None, description="Learning objectives (JSON)")
    is_active: bool = Field(default=True, description="Whether section is active")


class SectionCreate(SectionBase):
    """Schema for creating a new section."""

    module_id: UUID = Field(..., description="Module ID this section belongs to")


class SectionUpdate(BaseModel):
    """Schema for updating an existing section."""

    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    section_number: Optional[int] = Field(None, ge=1)
    estimated_hours: Optional[int] = Field(None, ge=0)
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    objectives: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None


class SectionResponse(SectionBase):
    """Schema for section response."""

    id: UUID
    module_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SectionWithKnowledgePoints(SectionResponse):
    """Schema for section with nested knowledge points."""

    knowledge_points: list[KnowledgePointResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}
