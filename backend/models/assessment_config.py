"""Assessment configuration model for knowledge points."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.knowledge_point import KnowledgePoint


class AssessmentConfig(Base):
    """Assessment configuration for knowledge points."""

    __tablename__ = "assessment_config"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    n_questions: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    passing_threshold: Mapped[float] = mapped_column(Float, default=0.7, nullable=False)

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
    knowledge_point: Mapped["KnowledgePoint"] = relationship("KnowledgePoint", back_populates="assessment_config")

    def __repr__(self) -> str:
        """String representation of AssessmentConfig."""
        return f"<AssessmentConfig(id={self.id}, kp_id={self.kp_id}, n_questions={self.n_questions})>"
