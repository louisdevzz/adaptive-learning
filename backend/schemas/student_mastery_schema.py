"""Student Mastery schemas for CRUD operations."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class StudentMasteryBase(BaseModel):
    """Base schema for Student Mastery."""

    student_id: UUID
    knowledge_point_id: UUID
    section_id: UUID
    module_id: UUID
    course_id: UUID

    # Multi-dimensional scores (0-100)
    skill_score: float = Field(default=0.0, ge=0, le=100, description="Skill score (70% weight)")
    knowledge_score: float = Field(default=0.0, ge=0, le=100, description="Knowledge score (20% weight)")
    attitude_score: float = Field(default=0.0, ge=0, le=100, description="Attitude score (10% weight)")

    # Confidence and availability
    confidence: float = Field(default=0.0, ge=0, le=1, description="Statistical confidence")
    is_available: bool = Field(default=True, description="Is KP available/unlocked")
    is_started: bool = Field(default=False, description="Has started learning")

    @field_validator("skill_score", "knowledge_score", "attitude_score")
    @classmethod
    def validate_score(cls, v: float) -> float:
        """Validate that scores are between 0 and 100."""
        if not 0 <= v <= 100:
            raise ValueError("Score must be between 0 and 100")
        return v


class StudentMasteryCreate(StudentMasteryBase):
    """Schema for creating a new student mastery record."""

    pass


class StudentMasteryUpdate(BaseModel):
    """Schema for updating an existing student mastery record."""

    skill_score: Optional[float] = Field(None, ge=0, le=100)
    knowledge_score: Optional[float] = Field(None, ge=0, le=100)
    attitude_score: Optional[float] = Field(None, ge=0, le=100)
    confidence: Optional[float] = Field(None, ge=0, le=1)
    is_available: Optional[bool] = None
    is_started: Optional[bool] = None


class StudentMasteryResponse(BaseModel):
    """Schema for student mastery response."""

    id: UUID
    student_id: UUID
    knowledge_point_id: UUID
    section_id: UUID
    module_id: UUID
    course_id: UUID

    # Scores
    skill_score: float
    knowledge_score: float
    attitude_score: float
    combined_mastery: float
    mastery_group: str

    # Confidence and status
    confidence: float
    is_available: bool
    is_started: bool

    # Assessment tracking
    last_assessed: Optional[datetime]
    attempt_count: int
    total_time_spent: float
    time_spent_hours: float

    # Timestamps
    created_at: datetime
    updated_at: datetime

    # Computed properties
    is_mastered: bool

    model_config = {"from_attributes": True}


class MasteryHistoryResponse(BaseModel):
    """Schema for mastery history response."""

    id: UUID
    student_mastery_id: UUID

    # Snapshot scores
    skill_score: float
    knowledge_score: float
    attitude_score: float
    combined_mastery: float
    mastery_group: str

    # Change tracking
    change_type: str
    previous_combined_mastery: Optional[float]
    delta: float

    # Context
    confidence: float
    context_type: Optional[str]
    context_id: Optional[UUID]
    performance_data: Optional[dict]

    # Time tracking
    time_spent_seconds: int
    attempt_number: int

    # Metadata
    notes: Optional[str]
    recorded_by: Optional[str]
    recorded_at: datetime

    # Computed properties
    is_improvement: bool
    is_decline: bool

    model_config = {"from_attributes": True}


class StudentMasteryWithHistory(StudentMasteryResponse):
    """Schema for student mastery with history records."""

    history_records: list[MasteryHistoryResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class MasteryProgressResponse(BaseModel):
    """Schema for aggregated mastery progress."""

    student_id: UUID
    course_id: UUID
    module_id: Optional[UUID] = None
    section_id: Optional[UUID] = None

    # Aggregate statistics
    total_kps: int
    started_kps: int
    mastered_kps: int
    average_mastery: float
    average_confidence: float

    # Group distribution
    group_a_count: int
    group_b_count: int
    group_c_count: int
    group_d_count: int
    group_n_count: int

    # Time tracking
    total_time_hours: float
    total_attempts: int

    # Latest update
    last_updated: Optional[datetime]


class MasteryTrendResponse(BaseModel):
    """Schema for mastery trend over time."""

    student_id: UUID
    knowledge_point_id: UUID
    time_period: str  # "day", "week", "month"

    # Trend data points
    trend_data: list[dict]  # [{"date": "2024-01-01", "mastery": 75.5, "confidence": 0.8}]

    # Statistics
    initial_mastery: float
    current_mastery: float
    total_change: float
    average_growth_rate: float

    # Performance summary
    total_attempts: int
    total_time_hours: float
    improvement_count: int
    decline_count: int


class MasteryProgressRequest(BaseModel):
    """Schema for tracking mastery progress."""

    knowledge_point_id: UUID
    is_correct: bool
    time_spent: int = Field(..., description="Time spent in seconds")


class MasteryRecommendation(BaseModel):
    """Schema for learning recommendations."""

    knowledge_point_id: UUID
    name: str
    current_mastery: float
    recommended_action: str
    priority: int
    estimated_time: int = Field(..., description="Estimated time in minutes")


class UserProgressSummary(BaseModel):
    """Schema for user progress summary."""

    total_knowledge_points: int
    mastered_count: int
    in_progress_count: int
    not_started_count: int
    overall_mastery: float
    total_time_spent: int
    last_activity: Optional[datetime]
