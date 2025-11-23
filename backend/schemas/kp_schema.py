"""Knowledge Point schemas for CRUD operations."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class KnowledgePointBase(BaseModel):
    """Base schema for Knowledge Point."""

    name: str = Field(..., min_length=1, max_length=255, description="Knowledge point name")
    description: Optional[str] = Field(None, description="Knowledge point description")
    code: str = Field(..., min_length=1, max_length=50, description="Knowledge point code")
    kp_type: str = Field(default="concept", pattern="^(concept|rule|formula|problem_type)$")
    learning_objectives: Optional[dict[str, Any]] = Field(None, description="Learning objectives (JSON)")
    difficulty_level: int = Field(default=3, ge=1, le=5, description="Difficulty level (1-5)")
    estimated_time: Optional[dict[str, Any]] = Field(None, description="Estimated time (JSON)")


class KnowledgePointCreate(KnowledgePointBase):
    """Schema for creating a new knowledge point."""

    section_id: UUID = Field(..., description="Section ID this KP belongs to")
    module_id: UUID = Field(..., description="Module ID this KP belongs to")
    course_id: UUID = Field(..., description="Course ID this KP belongs to")


class KnowledgePointUpdate(BaseModel):
    """Schema for updating an existing knowledge point."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    kp_type: Optional[str] = Field(None, pattern="^(concept|rule|formula|problem_type)$")
    learning_objectives: Optional[dict[str, Any]] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    estimated_time: Optional[dict[str, Any]] = None


class KnowledgePointResponse(KnowledgePointBase):
    """Schema for knowledge point response."""

    id: UUID
    section_id: UUID
    module_id: UUID
    course_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class KnowledgePointWithMastery(KnowledgePointResponse):
    """Schema for knowledge point with user's mastery level."""

    mastery_level: Optional[float] = None
    mastery_group: Optional[str] = None
    last_assessed: Optional[datetime] = None

    model_config = {"from_attributes": True}
