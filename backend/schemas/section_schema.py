"""Section schemas for CRUD operations."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from schemas.kp_schema import KnowledgePointResponse


class SectionBase(BaseModel):
    """Base schema for Section."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    order: int = Field(default=0, ge=0)
    content_type: Optional[str] = Field(None, pattern="^(text|video|quiz|exercise)$")
    estimated_minutes: Optional[int] = Field(None, ge=0)
    video_url: Optional[str] = None


class SectionCreate(SectionBase):
    """Schema for creating a new section."""

    module_id: UUID


class SectionUpdate(BaseModel):
    """Schema for updating an existing section."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = Field(None, ge=0)
    content_type: Optional[str] = Field(None, pattern="^(text|video|quiz|exercise)$")
    estimated_minutes: Optional[int] = Field(None, ge=0)
    video_url: Optional[str] = None


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
