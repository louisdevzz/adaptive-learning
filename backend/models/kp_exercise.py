"""KnowledgePoint-Exercise junction table."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.exercise import Exercise
    from models.knowledge_point import KnowledgePoint


class KnowledgePointExercise(Base):
    """Junction table linking knowledge points to exercises."""

    __tablename__ = "kp_exercises"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

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
    knowledge_point: Mapped["KnowledgePoint"] = relationship("KnowledgePoint", back_populates="kp_exercises")
    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="kp_exercises")

    def __repr__(self) -> str:
        """String representation of KnowledgePointExercise."""
        return f"<KnowledgePointExercise(id={self.id}, kp_id={self.kp_id}, exercise_id={self.exercise_id})>"
