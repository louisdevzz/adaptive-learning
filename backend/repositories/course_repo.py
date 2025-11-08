"""Course repository for database access."""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from models.course import Course
from repositories.base_repo import BaseRepository


class CourseRepository(BaseRepository[Course]):
    """Repository for Course model."""

    def __init__(self, db: Session):
        """Initialize course repository."""
        super().__init__(Course, db)

    def get_by_slug(self, slug: str) -> Optional[Course]:
        """
        Get course by slug.

        Args:
            slug: Course slug

        Returns:
            Course instance or None if not found
        """
        return self.db.query(Course).filter(Course.slug == slug).first()

    def get_with_modules(self, course_id: UUID | str) -> Optional[Course]:
        """
        Get course with all its modules loaded.

        Args:
            course_id: Course ID

        Returns:
            Course instance with modules or None if not found
        """
        normalized_course_id = self._normalize_id(course_id)
        return (
            self.db.query(Course)
            .filter(Course.id == normalized_course_id)
            .options(joinedload(Course.modules))
            .first()
        )

    def get_published(self, skip: int = 0, limit: int = 100) -> list[Course]:
        """
        Get all published courses.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of published courses
        """
        return (
            self.db.query(Course)
            .filter(Course.is_published == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_featured(self, limit: int = 10) -> list[Course]:
        """
        Get featured courses.

        Args:
            limit: Maximum number of courses to return

        Returns:
            List of featured courses
        """
        return (
            self.db.query(Course)
            .filter(Course.is_featured == True, Course.is_published == True)
            .limit(limit)
            .all()
        )

    def search_by_title(self, search_term: str, skip: int = 0, limit: int = 100) -> list[Course]:
        """
        Search courses by title.

        Args:
            search_term: Search term
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of matching courses
        """
        return (
            self.db.query(Course)
            .filter(Course.title.ilike(f"%{search_term}%"), Course.is_published == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
