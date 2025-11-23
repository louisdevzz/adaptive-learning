"""Student Mastery model for comprehensive learning progress tracking."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.course import Course
    from models.knowledge_point import KnowledgePoint
    from models.mastery_history import MasteryHistory
    from models.module import Module
    from models.section import Section
    from models.user import User

import enum


class MasteryGroup(str, enum.Enum):
    """Mastery group enumeration based on combined mastery score."""

    A = "A"  # Excellent (>= 80%)
    B = "B"  # Good (>= 65%)
    C = "C"  # Average (>= 50%)
    D = "D"  # Below Average (>= 35%)
    N = "N"  # Not Started / Insufficient Data (< 35%)


class StudentMastery(Base):
    """
    Student Mastery model for comprehensive learning progress tracking.

    Tracks multi-dimensional mastery across skill, knowledge, and attitude.
    """

    __tablename__ = "student_mastery"
    __table_args__ = (
        UniqueConstraint("student_id", "knowledge_point_id", name="uq_student_kp_mastery"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )

    # Student and content references
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    knowledge_point_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Hierarchical references (denormalized for performance)
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

    # Multi-dimensional mastery scores (0-100)
    skill_score: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )  # 70% weight - Ability to apply/solve problems
    knowledge_score: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )  # 20% weight - Understanding theory
    attitude_score: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )  # 10% weight - Learning attitude/engagement

    # Combined mastery (weighted average)
    combined_mastery: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False, index=True
    )  # skill*0.7 + knowledge*0.2 + attitude*0.1

    # Mastery classification
    mastery_group: Mapped[MasteryGroup] = mapped_column(
        Enum(MasteryGroup), default=MasteryGroup.N, nullable=False, index=True
    )

    # Confidence and availability
    confidence: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )  # 0.0-1.0, statistical confidence in score
    is_available: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, index=True
    )  # False if KP is locked
    is_started: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )  # Has started learning

    # Assessment tracking
    last_assessed: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_time_spent: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )  # Total time in seconds

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
    student: Mapped["User"] = relationship(
        "User", foreign_keys=[student_id], back_populates="student_mastery_records"
    )
    knowledge_point: Mapped["KnowledgePoint"] = relationship(
        "KnowledgePoint", foreign_keys=[knowledge_point_id]
    )
    section: Mapped["Section"] = relationship("Section", foreign_keys=[section_id])
    module: Mapped["Module"] = relationship("Module", foreign_keys=[module_id])
    course: Mapped["Course"] = relationship("Course", foreign_keys=[course_id])

    # History tracking
    history_records: Mapped[list["MasteryHistory"]] = relationship(
        "MasteryHistory",
        back_populates="student_mastery",
        cascade="all, delete-orphan",
        order_by="MasteryHistory.recorded_at.desc()",
    )

    def update_combined_mastery(self) -> None:
        """Calculate and update combined mastery score using weighted average."""
        self.combined_mastery = (
            self.skill_score * 0.7 + self.knowledge_score * 0.2 + self.attitude_score * 0.1
        )
        self._update_mastery_group()

    def _update_mastery_group(self) -> None:
        """Update mastery group based on combined mastery score."""
        if self.combined_mastery >= 80:
            self.mastery_group = MasteryGroup.A
        elif self.combined_mastery >= 65:
            self.mastery_group = MasteryGroup.B
        elif self.combined_mastery >= 50:
            self.mastery_group = MasteryGroup.C
        elif self.combined_mastery >= 35:
            self.mastery_group = MasteryGroup.D
        else:
            self.mastery_group = MasteryGroup.N

    @property
    def time_spent_hours(self) -> float:
        """Get total time spent in hours."""
        return self.total_time_spent / 3600.0

    @property
    def is_mastered(self) -> bool:
        """Check if student has mastered this KP (>= 65%, group B or better)."""
        return self.combined_mastery >= 65.0

    def __repr__(self) -> str:
        """String representation of StudentMastery."""
        return (
            f"<StudentMastery(id={self.id}, student_id={self.student_id}, "
            f"kp_id={self.knowledge_point_id}, mastery={self.combined_mastery:.1f}%, "
            f"group={self.mastery_group})>"
        )
