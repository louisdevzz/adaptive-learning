"""KnowledgePoint-Question junction table."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.knowledge_point import KnowledgePoint
    from models.question import Question


class KnowledgePointQuestion(Base):
    """Junction table linking knowledge points to questions."""

    __tablename__ = "kp_questions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
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
    knowledge_point: Mapped["KnowledgePoint"] = relationship("KnowledgePoint", back_populates="kp_questions")
    question: Mapped["Question"] = relationship("Question", back_populates="kp_questions")

    def __repr__(self) -> str:
        """String representation of KnowledgePointQuestion."""
        return f"<KnowledgePointQuestion(id={self.id}, kp_id={self.kp_id}, question_id={self.question_id})>"
