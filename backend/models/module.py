"""Module model for course structure."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.course import DifficultyLevel

if TYPE_CHECKING:
    from models.course import Course
    from models.section import Section


class Module(Base):
    """Module model representing a course module/chapter."""

    __tablename__ = "modules"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    module_number: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty_level: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel), nullable=False, index=True
    )
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
    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    sections: Mapped[list["Section"]] = relationship(
        "Section", back_populates="module", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of Module."""
        return f"<Module(id={self.id}, name={self.name}, course_id={self.course_id})>"
