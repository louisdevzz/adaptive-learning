"""Module repository for database access."""

from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from models.module import Module
from repositories.base_repo import BaseRepository


class ModuleRepository(BaseRepository[Module]):
    """Repository for Module model."""

    def __init__(self, db: Session):
        """Initialize module repository."""
        super().__init__(Module, db)

    def get_by_course(self, course_id: UUID | str) -> list[Module]:
        """
        Get all modules for a course.

        Args:
            course_id: Course ID

        Returns:
            List of modules ordered by their order field
        """
        normalized_course_id = self._normalize_id(course_id)
        return (
            self.db.query(Module)
            .filter(Module.course_id == normalized_course_id)
            .order_by(Module.order)
            .all()
        )

    def get_with_sections(self, module_id: UUID | str) -> Optional[Module]:
        """
        Get module with all its sections loaded.

        Args:
            module_id: Module ID

        Returns:
            Module instance with sections or None if not found
        """
        normalized_module_id = self._normalize_id(module_id)
        return (
            self.db.query(Module)
            .filter(Module.id == normalized_module_id)
            .options(joinedload(Module.sections))
            .first()
        )

    def get_next_order(self, course_id: UUID | str) -> int:
        """
        Get the next order number for a new module in a course.

        Args:
            course_id: Course ID

        Returns:
            Next order number
        """
        normalized_course_id = self._normalize_id(course_id)
        max_order = (
            self.db.query(Module.order)
            .filter(Module.course_id == normalized_course_id)
            .order_by(Module.order.desc())
            .first()
        )
        return (max_order[0] + 1) if max_order else 0

    def list_all(
        self,
        page: int = 1,
        page_size: int = 100,
        course_id: UUID | str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        """
        List all modules with pagination and filtering.

        Args:
            page: Page number (1-based)
            page_size: Number of items per page
            course_id: Optional filter by course ID
            is_active: Optional filter by active status

        Returns:
            Dict with total, page, page_size, and items
        """
        query = self.db.query(Module)

        # Apply filters
        if course_id is not None:
            normalized_course_id = self._normalize_id(course_id)
            query = query.filter(Module.course_id == normalized_course_id)

        if is_active is not None:
            query = query.filter(Module.is_active == is_active)

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        items = (
            query
            .order_by(Module.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }
