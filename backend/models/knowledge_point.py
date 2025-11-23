"""Knowledge Point model for granular learning concepts."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.course import DifficultyLevel

if TYPE_CHECKING:
    from models.assessment_config import AssessmentConfig
    from models.knowledge_point_prerequisite import KnowledgePointPrerequisite
    from models.kp_exercise import KnowledgePointExercise
    from models.kp_question import KnowledgePointQuestion
    from models.kp_relation import KnowledgePointRelation
    from models.kp_resource import KnowledgePointResource
    from models.section import Section

import enum


class KnowledgePointType(str, enum.Enum):
    """Knowledge point type enumeration."""

    CONCEPT = "concept"
    RULE = "rule"
    FORMULA = "formula"
    PROBLEM_TYPE = "problem_type"


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
        index=True,
    )
    module_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    kp_type: Mapped[KnowledgePointType] = mapped_column(
        Enum(KnowledgePointType), default=KnowledgePointType.CONCEPT, nullable=False, index=True
    )
    learning_objectives: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    difficulty_level: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel), nullable=False, index=True
    )
    estimated_time: Mapped[dict | None] = mapped_column(JSON, nullable=True)

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

    # Junction tables
    kp_questions: Mapped[list["KnowledgePointQuestion"]] = relationship(
        "KnowledgePointQuestion", back_populates="knowledge_point", cascade="all, delete-orphan"
    )
    kp_exercises: Mapped[list["KnowledgePointExercise"]] = relationship(
        "KnowledgePointExercise", back_populates="knowledge_point", cascade="all, delete-orphan"
    )
    kp_resources: Mapped[list["KnowledgePointResource"]] = relationship(
        "KnowledgePointResource", back_populates="knowledge_point", cascade="all, delete-orphan"
    )

    # Prerequisite relationships
    prerequisite_relations: Mapped[list["KnowledgePointPrerequisite"]] = relationship(
        "KnowledgePointPrerequisite",
        foreign_keys="[KnowledgePointPrerequisite.kp_id]",
        back_populates="knowledge_point",
        cascade="all, delete-orphan",
    )
    required_by_relations: Mapped[list["KnowledgePointPrerequisite"]] = relationship(
        "KnowledgePointPrerequisite",
        foreign_keys="[KnowledgePointPrerequisite.prerequisite_kp_id]",
        back_populates="prerequisite",
        cascade="all, delete-orphan",
    )

    # Knowledge graph relations
    outgoing_relations: Mapped[list["KnowledgePointRelation"]] = relationship(
        "KnowledgePointRelation",
        foreign_keys="[KnowledgePointRelation.kp_id]",
        back_populates="source_kp",
        cascade="all, delete-orphan",
    )
    incoming_relations: Mapped[list["KnowledgePointRelation"]] = relationship(
        "KnowledgePointRelation",
        foreign_keys="[KnowledgePointRelation.related_kp_id]",
        back_populates="target_kp",
        cascade="all, delete-orphan",
    )

    # Assessment config
    assessment_config: Mapped["AssessmentConfig"] = relationship(
        "AssessmentConfig", back_populates="knowledge_point", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of KnowledgePoint."""
        return f"<KnowledgePoint(id={self.id}, name={self.name}, section_id={self.section_id})>"
