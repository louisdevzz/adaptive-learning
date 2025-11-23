"""Resource model for learning materials."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.kp_resource import KnowledgePointResource

import enum


class ResourceType(str, enum.Enum):
    """Resource type enumeration."""

    VIDEO = "video"
    ARTICLE = "article"
    DOCUMENT = "document"
    INTERACTIVE = "interactive"
    EXTERNAL_LINK = "external_link"
    SLIDE = "slide"


class Resource(Base):
    """Resource model for learning materials."""

    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    title: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[ResourceType] = mapped_column(
        Enum(ResourceType), default=ResourceType.ARTICLE, nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Store additional info like duration, author, tags, etc.
    resource_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

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
    kp_resources: Mapped[list["KnowledgePointResource"]] = relationship(
        "KnowledgePointResource", back_populates="resource", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of Resource."""
        return f"<Resource(id={self.id}, title={self.title}, type={self.type})>"
