"""Section service for business logic."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.section_repo import SectionRepository
from schemas.section_schema import SectionCreate, SectionUpdate


class SectionService:
    """Service for section operations."""

    def __init__(self, db: Session):
        """Initialize section service."""
        self.db = db
        self.repo = SectionRepository(db)

    def create_section(self, section_data: SectionCreate):
        """Create a new section."""
        if section_data.order == 0:
            section_data.order = self.repo.get_next_order(section_data.module_id)

        return self.repo.create(**section_data.model_dump())

    def get_section(self, section_id: UUID | str):
        """Get section by ID."""
        section = self.repo.get_by_id(section_id)
        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found",
            )
        return section

    def get_section_with_knowledge_points(self, section_id: UUID | str):
        """Get section with all knowledge points."""
        section = self.repo.get_with_knowledge_points(section_id)
        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found",
            )
        return section

    def update_section(self, section_id: UUID | str, section_data: SectionUpdate):
        """Update a section."""
        section = self.repo.update(section_id, **section_data.model_dump(exclude_unset=True))
        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found",
            )
        return section

    def delete_section(self, section_id: UUID | str):
        """Delete a section."""
        success = self.repo.delete(section_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found",
            )
        return {"message": "Section deleted successfully"}

    def list_by_module(self, module_id: UUID | str):
        """List all sections for a module."""
        return self.repo.get_by_module(module_id)
