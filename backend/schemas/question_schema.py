"""Question schemas for assessments."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class QuestionBase(BaseModel):
    """Base schema for Question."""

    content: str = Field(..., min_length=1, description="Question content/text")
    type: str = Field(
        default="multiple_choice",
        pattern="^(multiple_choice|true_false|short_answer|essay|fill_in_blank)$",
        description="Question type",
    )
    difficulty_level: str = Field(
        default="medium", pattern="^(easy|medium|hard)$", description="Difficulty level"
    )
    metadata: Optional[dict[str, Any]] = Field(
        None, description="Question metadata (options, answer, explanation, etc.)"
    )


class QuestionCreate(QuestionBase):
    """Schema for creating a new question."""

    pass


class QuestionUpdate(BaseModel):
    """Schema for updating an existing question."""

    content: Optional[str] = Field(None, min_length=1)
    type: Optional[str] = Field(None, pattern="^(multiple_choice|true_false|short_answer|essay|fill_in_blank)$")
    difficulty_level: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    metadata: Optional[dict[str, Any]] = None


class QuestionResponse(QuestionBase):
    """Schema for question response."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
