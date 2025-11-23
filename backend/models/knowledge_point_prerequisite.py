"""Knowledge point prerequisite model for prerequisite relationships."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.knowledge_point import KnowledgePoint


class KnowledgePointPrerequisite(Base):
    """Knowledge point prerequisite model for explicit prerequisite relationships."""

    __tablename__ = "kp_prerequisites"
    __table_args__ = (
        UniqueConstraint(
            "kp_id", "prerequisite_kp_id", name="uq_kp_prerequisite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prerequisite_kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
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
    knowledge_point: Mapped["KnowledgePoint"] = relationship(
        "KnowledgePoint",
        foreign_keys=[kp_id],
        back_populates="prerequisite_relations",
    )
    prerequisite: Mapped["KnowledgePoint"] = relationship(
        "KnowledgePoint",
        foreign_keys=[prerequisite_kp_id],
        back_populates="required_by_relations",
    )

    def __repr__(self) -> str:
        """String representation of KnowledgePointPrerequisite."""
        return (
            f"<KnowledgePointPrerequisite(id={self.id}, kp_id={self.kp_id}, "
            f"prereq_id={self.prerequisite_kp_id})>"
        )
