"""Knowledge Point Relation model for knowledge graph connections."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.knowledge_point import KnowledgePoint

import enum


class RelationType(str, enum.Enum):
    """Knowledge point relation type enumeration."""

    # Structural relationships
    PREREQUISITE = "prerequisite"  # A must be learned before B
    COREQUISITE = "corequisite"  # A and B should be learned together

    # Semantic relationships
    RELATED_TO = "related_to"  # General connection
    PART_OF = "part_of"  # A is part of a larger concept B
    EXAMPLE_OF = "example_of"  # A is an example of B
    APPLICATION_OF = "application_of"  # A applies concept B
    CONTRASTS_WITH = "contrasts_with"  # A contrasts with B
    EXTENDS = "extends"  # A extends/builds upon B

    # Difficulty relationships
    SIMPLER_THAN = "simpler_than"  # A is simpler than B
    MORE_COMPLEX_THAN = "more_complex_than"  # A is more complex than B

    # Subject relationships
    ANALOGOUS_TO = "analogous_to"  # A is analogous to B (cross-domain)
    DEPENDS_ON = "depends_on"  # A depends on understanding B


class KnowledgePointRelation(Base):
    """Knowledge point relation model for knowledge graph semantic connections."""

    __tablename__ = "kp_relations"
    __table_args__ = (
        UniqueConstraint(
            "kp_id", "related_kp_id", "relation_type",
            name="uq_kp_relation"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    related_kp_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    relation_type: Mapped[RelationType] = mapped_column(
        Enum(RelationType), nullable=False, index=True
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
    source_kp: Mapped["KnowledgePoint"] = relationship(
        "KnowledgePoint",
        foreign_keys=[kp_id],
        back_populates="outgoing_relations",
    )
    target_kp: Mapped["KnowledgePoint"] = relationship(
        "KnowledgePoint",
        foreign_keys=[related_kp_id],
        back_populates="incoming_relations",
    )

    def __repr__(self) -> str:
        """String representation of KnowledgePointRelation."""
        return (
            f"<KnowledgePointRelation(id={self.id}, "
            f"kp_id={self.kp_id}, related_kp_id={self.related_kp_id}, "
            f"type={self.relation_type})>"
        )
