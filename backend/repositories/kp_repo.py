"""Knowledge Point repository for database access."""

from uuid import UUID

from sqlalchemy.orm import Session

from models.knowledge_point import KnowledgePoint
from repositories.base_repo import BaseRepository


class KnowledgePointRepository(BaseRepository[KnowledgePoint]):
    """Repository for Knowledge Point model."""

    def __init__(self, db: Session):
        """Initialize knowledge point repository."""
        super().__init__(KnowledgePoint, db)

    def get_by_section(self, section_id: UUID | str) -> list[KnowledgePoint]:
        """
        Get all knowledge points for a section.

        Args:
            section_id: Section ID

        Returns:
            List of knowledge points ordered by their order field
        """
        normalized_section_id = self._normalize_id(section_id)
        return (
            self.db.query(KnowledgePoint)
            .filter(KnowledgePoint.section_id == normalized_section_id)
            .order_by(KnowledgePoint.order)
            .all()
        )

    def get_by_difficulty(
        self, difficulty: str, skip: int = 0, limit: int = 100
    ) -> list[KnowledgePoint]:
        """
        Get knowledge points by difficulty level.

        Args:
            difficulty: Difficulty level (easy, medium, hard)
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of knowledge points
        """
        return (
            self.db.query(KnowledgePoint)
            .filter(KnowledgePoint.difficulty == difficulty)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_by_title(
        self, search_term: str, skip: int = 0, limit: int = 100
    ) -> list[KnowledgePoint]:
        """
        Search knowledge points by title.

        Args:
            search_term: Search term
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of matching knowledge points
        """
        return (
            self.db.query(KnowledgePoint)
            .filter(KnowledgePoint.title.ilike(f"%{search_term}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_next_order(self, section_id: UUID | str) -> int:
        """
        Get the next order number for a new knowledge point in a section.

        Args:
            section_id: Section ID

        Returns:
            Next order number
        """
        normalized_section_id = self._normalize_id(section_id)
        max_order = (
            self.db.query(KnowledgePoint.order)
            .filter(KnowledgePoint.section_id == normalized_section_id)
            .order_by(KnowledgePoint.order.desc())
            .first()
        )
        return (max_order[0] + 1) if max_order else 0
