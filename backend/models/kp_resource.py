"""KnowledgePoint-Resource junction table."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.knowledge_point import KnowledgePoint
    from models.resource import Resource


class KnowledgePointResource(Base):
    """Junction table linking knowledge points to resources."""

    __tablename__ = "kp_resources"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("resources.id", ondelete="CASCADE"),
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
    knowledge_point: Mapped["KnowledgePoint"] = relationship("KnowledgePoint", back_populates="kp_resources")
    resource: Mapped["Resource"] = relationship("Resource", back_populates="kp_resources")

    def __repr__(self) -> str:
        """String representation of KnowledgePointResource."""
        return f"<KnowledgePointResource(id={self.id}, kp_id={self.kp_id}, resource_id={self.resource_id})>"
