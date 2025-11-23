"""Section model for module structure."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Text, Uuid
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.course import DifficultyLevel

if TYPE_CHECKING:
    from models.knowledge_point import KnowledgePoint
    from models.module import Module


class Section(Base):
    """Section model representing a module section/lesson."""

    __tablename__ = "sections"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    module_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    section_number: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty_level: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel), nullable=False, index=True
    )
    objectives: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
    module: Mapped["Module"] = relationship("Module", back_populates="sections")
    knowledge_points: Mapped[list["KnowledgePoint"]] = relationship(
        "KnowledgePoint",
        back_populates="section",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        """String representation of Section."""
        return f"<Section(id={self.id}, name={self.name}, module_id={self.module_id})>"
