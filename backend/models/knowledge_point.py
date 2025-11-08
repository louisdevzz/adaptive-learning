"""Knowledge Point model for granular learning concepts."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.mastery import MasteryRecord
    from models.section import Section


class KnowledgePoint(Base):
    """Knowledge Point model representing a specific learning concept."""

    __tablename__ = "knowledge_points"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    section_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("sections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # Index for faster JOIN and filtering operations
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Knowledge Point metadata
    difficulty: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # easy, medium, hard
    prerequisites: Mapped[list[str] | None] = mapped_column(
        JSON, nullable=True
    )  # JSON array of prerequisite KP IDs (UUIDs as strings)
    tags: Mapped[list[str] | None] = mapped_column(
        JSON, nullable=True
    )  # JSON array of tags for categorization

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
    section: Mapped["Section"] = relationship("Section", back_populates="knowledge_points")
    mastery_records: Mapped[list["MasteryRecord"]] = relationship(
        "MasteryRecord", back_populates="knowledge_point", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of KnowledgePoint."""
        return f"<KnowledgePoint(id={self.id}, title={self.title}, section_id={self.section_id})>"
