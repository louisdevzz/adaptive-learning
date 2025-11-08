"""Module service for business logic."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.module_repo import ModuleRepository
from schemas.module_schema import ModuleCreate, ModuleUpdate


class ModuleService:
    """Service for module operations."""

    def __init__(self, db: Session):
        """Initialize module service."""
        self.db = db
        self.repo = ModuleRepository(db)

    def create_module(self, module_data: ModuleCreate):
        """Create a new module."""
        # Auto-assign order if not specified
        if module_data.order == 0:
            module_data.order = self.repo.get_next_order(module_data.course_id)

        return self.repo.create(**module_data.model_dump())

    def get_module(self, module_id: UUID | str):
        """Get module by ID."""
        module = self.repo.get_by_id(module_id)
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found",
            )
        return module

    def get_module_with_sections(self, module_id: UUID | str):
        """Get module with all sections."""
        module = self.repo.get_with_sections(module_id)
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found",
            )
        return module

    def update_module(self, module_id: UUID | str, module_data: ModuleUpdate):
        """Update a module."""
        module = self.repo.update(module_id, **module_data.model_dump(exclude_unset=True))
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found",
            )
        return module

    def delete_module(self, module_id: UUID | str):
        """Delete a module."""
        success = self.repo.delete(module_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found",
            )
        return {"message": "Module deleted successfully"}

    def list_by_course(self, course_id: UUID | str):
        """List all modules for a course."""
        return self.repo.get_by_course(course_id)
