"""Knowledge Point service for business logic."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.kp_repo import KnowledgePointRepository
from schemas.kp_schema import KnowledgePointCreate, KnowledgePointUpdate


class KnowledgePointService:
    """Service for knowledge point operations."""

    def __init__(self, db: Session):
        """Initialize knowledge point service."""
        self.db = db
        self.repo = KnowledgePointRepository(db)

    def create_knowledge_point(self, kp_data: KnowledgePointCreate):
        """Create a new knowledge point."""
        if kp_data.order == 0:
            kp_data.order = self.repo.get_next_order(kp_data.section_id)

        return self.repo.create(**kp_data.model_dump())

    def get_knowledge_point(self, kp_id: UUID | str):
        """Get knowledge point by ID."""
        kp = self.repo.get_by_id(kp_id)
        if not kp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Knowledge point not found",
            )
        return kp

    def update_knowledge_point(self, kp_id: UUID | str, kp_data: KnowledgePointUpdate):
        """Update a knowledge point."""
        kp = self.repo.update(kp_id, **kp_data.model_dump(exclude_unset=True))
        if not kp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Knowledge point not found",
            )
        return kp

    def delete_knowledge_point(self, kp_id: UUID | str):
        """Delete a knowledge point."""
        success = self.repo.delete(kp_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Knowledge point not found",
            )
        return {"message": "Knowledge point deleted successfully"}

    def list_by_section(self, section_id: UUID | str):
        """List all knowledge points for a section."""
        return self.repo.get_by_section(section_id)

    def search_knowledge_points(self, query: str, skip: int = 0, limit: int = 100):
        """Search knowledge points by title."""
        return self.repo.search_by_title(query, skip, limit)
