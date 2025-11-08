"""Mastery tracking schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MasteryRecordBase(BaseModel):
    """Base schema for Mastery Record."""

    knowledge_point_id: UUID
    mastery_level: float = Field(default=0.0, ge=0.0, le=1.0)


class MasteryRecordCreate(MasteryRecordBase):
    """Schema for creating a new mastery record."""

    pass


class MasteryRecordUpdate(BaseModel):
    """Schema for updating mastery record after practice."""

    is_correct: bool
    time_spent: int = Field(..., ge=0, description="Time spent in seconds")


class MasteryRecordResponse(MasteryRecordBase):
    """Schema for mastery record response."""

    id: UUID
    user_id: UUID
    attempts: int
    correct_answers: int
    incorrect_answers: int
    total_time_spent: int
    last_practiced: Optional[datetime] = None
    success_rate: float
    mastery_category: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MasteryProgressRequest(BaseModel):
    """Schema for tracking learning progress."""

    knowledge_point_id: UUID
    is_correct: bool
    time_spent: int = Field(..., ge=0)
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)


class MasteryRecommendation(BaseModel):
    """Schema for mastery-based learning recommendations."""

    knowledge_point_id: UUID
    title: str
    current_mastery: float
    recommended_action: str  # practice, review, advance
    priority: int  # 1-5, higher is more important
    estimated_time: int  # in minutes


class UserProgressSummary(BaseModel):
    """Schema for user's overall progress summary."""

    total_knowledge_points: int
    mastered_count: int
    in_progress_count: int
    not_started_count: int
    overall_mastery: float
    total_time_spent: int
    last_activity: Optional[datetime] = None
    recommendations: list[MasteryRecommendation] = Field(default_factory=list)
