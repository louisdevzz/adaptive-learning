"""Section model for module structure."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

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
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)  # Main learning content
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Section metadata
    content_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # text, video, quiz, exercise
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    video_url: Mapped[str | None] = mapped_column(Text, nullable=True)

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
        order_by="KnowledgePoint.order",
    )

    def __repr__(self) -> str:
        """String representation of Section."""
        return f"<Section(id={self.id}, title={self.title}, module_id={self.module_id})>"
