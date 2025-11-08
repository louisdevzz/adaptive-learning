"""Knowledge Point schemas for CRUD operations."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class KnowledgePointBase(BaseModel):
    """Base schema for Knowledge Point."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    order: int = Field(default=0, ge=0)
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    prerequisites: Optional[str] = None  # JSON string of prerequisite IDs
    tags: Optional[str] = None  # JSON string of tags


class KnowledgePointCreate(KnowledgePointBase):
    """Schema for creating a new knowledge point."""

    section_id: UUID


class KnowledgePointUpdate(BaseModel):
    """Schema for updating an existing knowledge point."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = Field(None, ge=0)
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    prerequisites: Optional[str] = None
    tags: Optional[str] = None


class KnowledgePointResponse(KnowledgePointBase):
    """Schema for knowledge point response."""

    id: UUID
    section_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class KnowledgePointWithMastery(KnowledgePointResponse):
    """Schema for knowledge point with user's mastery level."""

    mastery_level: Optional[float] = None
    mastery_category: Optional[str] = None
    last_practiced: Optional[datetime] = None

    model_config = {"from_attributes": True}
