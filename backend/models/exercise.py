"""Exercise model for practice problems and coding exercises."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Integer, Text, Uuid
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.kp_exercise import KnowledgePointExercise

import enum


class ExerciseDifficulty(str, enum.Enum):
    """Exercise difficulty enumeration."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Exercise(Base):
    """Exercise model for practice problems."""

    __tablename__ = "exercises"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty_level: Mapped[ExerciseDifficulty] = mapped_column(
        Enum(ExerciseDifficulty), default=ExerciseDifficulty.MEDIUM, nullable=False, index=True
    )

    # Store exercise details, test cases, hints, etc. as JSON
    exercise_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

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
    kp_exercises: Mapped[list["KnowledgePointExercise"]] = relationship(
        "KnowledgePointExercise", back_populates="exercise", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of Exercise."""
        return f"<Exercise(id={self.id}, title={self.title}, difficulty={self.difficulty_level})>"
