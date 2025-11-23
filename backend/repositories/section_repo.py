"""Section repository for database access."""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from models.section import Section
from repositories.base_repo import BaseRepository


class SectionRepository(BaseRepository[Section]):
    """Repository for Section model."""

    def __init__(self, db: Session):
        """Initialize section repository."""
        super().__init__(Section, db)

    def get_by_module(self, module_id: UUID | str) -> list[Section]:
        """
        Get all sections for a module.

        Args:
            module_id: Module ID

        Returns:
            List of sections ordered by their order field
        """
        normalized_module_id = self._normalize_id(module_id)
        return (
            self.db.query(Section)
            .filter(Section.module_id == normalized_module_id)
            .order_by(Section.section_number)
            .all()
        )

    def get_with_knowledge_points(self, section_id: UUID | str) -> Optional[Section]:
        """
        Get section with all its knowledge points loaded.

        Args:
            section_id: Section ID

        Returns:
            Section instance with knowledge points or None if not found
        """
        normalized_section_id = self._normalize_id(section_id)
        return (
            self.db.query(Section)
            .filter(Section.id == normalized_section_id)
            .options(joinedload(Section.knowledge_points))
            .first()
        )

    def get_next_order(self, module_id: UUID | str) -> int:
        """
        Get the next order number for a new section in a module.

        Args:
            module_id: Module ID

        Returns:
            Next order number
        """
        normalized_module_id = self._normalize_id(module_id)
        max_order = (
            self.db.query(Section.section_number)
            .filter(Section.module_id == normalized_module_id)
            .order_by(Section.section_number.desc())
            .first()
        )
        return (max_order[0] + 1) if max_order else 1
