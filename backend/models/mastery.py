"""Mastery model for tracking student learning progress."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.knowledge_point import KnowledgePoint
    from models.user import User


class MasteryRecord(Base):
    """
    Mastery Record model for tracking student mastery of knowledge points.

    Stores the learning progress and performance metrics for each student-knowledge point pair.
    """

    __tablename__ = "mastery_records"
    __table_args__ = (
        UniqueConstraint("user_id", "knowledge_point_id", name="uq_user_knowledge_point"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # Index for faster user queries
    )
    knowledge_point_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # Index for faster knowledge point queries
    )

    # Mastery metrics
    mastery_level: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )  # 0.0 to 1.0
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct_answers: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    incorrect_answers: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Time tracking
    total_time_spent: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )  # In seconds
    last_practiced: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mastery_records")
    knowledge_point: Mapped["KnowledgePoint"] = relationship(
        "KnowledgePoint", back_populates="mastery_records"
    )

    @property
    def success_rate(self) -> float:
        """Calculate success rate (0.0 to 1.0)."""
        if self.attempts == 0:
            return 0.0
        return self.correct_answers / (self.correct_answers + self.incorrect_answers)

    @property
    def mastery_category(self) -> str:
        """Get mastery category based on mastery level."""
        if self.mastery_level < 0.4:
            return "beginner"
        elif self.mastery_level < 0.7:
            return "intermediate"
        elif self.mastery_level < 0.9:
            return "advanced"
        else:
            return "expert"

    def __repr__(self) -> str:
        """String representation of MasteryRecord."""
        return (
            f"<MasteryRecord(id={self.id}, user_id={self.user_id}, "
            f"kp_id={self.knowledge_point_id}, mastery={self.mastery_level:.2f})>"
        )
