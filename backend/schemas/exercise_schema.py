"""Exercise schemas for practice problems."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ExerciseBase(BaseModel):
    """Base schema for Exercise."""

    title: str = Field(..., min_length=1, description="Exercise title")
    description: str = Field(..., min_length=1, description="Exercise description")
    difficulty_level: str = Field(
        default="medium", pattern="^(easy|medium|hard)$", description="Difficulty level"
    )
    metadata: Optional[dict[str, Any]] = Field(
        None, description="Exercise metadata (test cases, hints, starter code, etc.)"
    )


class ExerciseCreate(ExerciseBase):
    """Schema for creating a new exercise."""

    pass


class ExerciseUpdate(BaseModel):
    """Schema for updating an existing exercise."""

    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = Field(None, min_length=1)
    difficulty_level: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    metadata: Optional[dict[str, Any]] = None


class ExerciseResponse(ExerciseBase):
    """Schema for exercise response."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
