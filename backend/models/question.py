"""Question model for assessments."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Integer, Text, Uuid
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.kp_question import KnowledgePointQuestion

import enum


class QuestionType(str, enum.Enum):
    """Question type enumeration."""

    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"
    FILL_IN_BLANK = "fill_in_blank"


class QuestionDifficulty(str, enum.Enum):
    """Question difficulty enumeration."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Question(Base):
    """Question model for assessments."""

    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    content: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType), default=QuestionType.MULTIPLE_CHOICE, nullable=False, index=True
    )
    difficulty_level: Mapped[QuestionDifficulty] = mapped_column(
        Enum(QuestionDifficulty), default=QuestionDifficulty.MEDIUM, nullable=False, index=True
    )

    # Store question options, correct answer, explanations, etc. as JSON
    question_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

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
    kp_questions: Mapped[list["KnowledgePointQuestion"]] = relationship(
        "KnowledgePointQuestion", back_populates="question", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of Question."""
        return f"<Question(id={self.id}, type={self.type}, difficulty={self.difficulty_level})>"
