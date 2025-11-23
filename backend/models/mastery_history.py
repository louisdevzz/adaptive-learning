"""Mastery History model for tracking student progress over time."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.student_mastery import MasteryGroup

if TYPE_CHECKING:
    from models.student_mastery import StudentMastery

import enum


class ChangeType(str, enum.Enum):
    """Type of mastery change event."""

    QUIZ_COMPLETED = "quiz_completed"
    EXERCISE_SUBMITTED = "exercise_submitted"
    VIDEO_WATCHED = "video_watched"
    CONTENT_READ = "content_read"
    PEER_INTERACTION = "peer_interaction"
    MANUAL_ADJUSTMENT = "manual_adjustment"
    SYSTEM_RECALCULATION = "system_recalculation"


class MasteryHistory(Base):
    """
    Mastery History model for tracking changes to student mastery over time.

    Stores snapshots of mastery scores whenever significant changes occur.
    """

    __tablename__ = "mastery_history"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    student_mastery_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("student_mastery.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Snapshot of scores at this point in time
    skill_score: Mapped[float] = mapped_column(Float, nullable=False)
    knowledge_score: Mapped[float] = mapped_column(Float, nullable=False)
    attitude_score: Mapped[float] = mapped_column(Float, nullable=False)
    combined_mastery: Mapped[float] = mapped_column(Float, nullable=False)
    mastery_group: Mapped[MasteryGroup] = mapped_column(
        Enum(MasteryGroup), nullable=False
    )

    # Change tracking
    change_type: Mapped[ChangeType] = mapped_column(
        Enum(ChangeType), nullable=False, index=True
    )
    previous_combined_mastery: Mapped[float | None] = mapped_column(Float, nullable=True)
    delta: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # Change amount

    # Confidence at this point
    confidence: Mapped[float] = mapped_column(Float, nullable=False)

    # Context of the change
    context_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # quiz, exercise, etc.
    context_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True
    )  # ID of quiz/exercise that caused change

    # Performance details (flexible JSON)
    performance_data: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )  # e.g., {"score": 85, "time_spent": 120, "hints_used": 2}

    # Time tracking
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)

    # Notes and metadata
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_by: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # system, teacher, auto

    # Timestamp
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships
    student_mastery: Mapped["StudentMastery"] = relationship(
        "StudentMastery", back_populates="history_records"
    )

    @property
    def is_improvement(self) -> bool:
        """Check if this record represents an improvement."""
        return self.delta > 0

    @property
    def is_decline(self) -> bool:
        """Check if this record represents a decline."""
        return self.delta < 0

    def __repr__(self) -> str:
        """String representation of MasteryHistory."""
        return (
            f"<MasteryHistory(id={self.id}, mastery_id={self.student_mastery_id}, "
            f"mastery={self.combined_mastery:.1f}%, delta={self.delta:+.1f}%, "
            f"type={self.change_type}, at={self.recorded_at})>"
        )
