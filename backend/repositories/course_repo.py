"""Course repository for database access."""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload, selectinload

from core.config import settings
from core.errors import errors
from models.course import Course
from models.module import Module
from models.section import Section
from models.knowledge_point import KnowledgePoint
from repositories.base_repo import BaseRepository


class CourseRepository(BaseRepository[Course]):
    """Repository for Course model with optimized relationship loading."""

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

    def get_published(
        self, 
        skip: int = 0, 
        limit: int = 100,
        with_modules: bool = False
    ) -> list[Course]:
        """
        Get all published courses with optional eager loading of modules.

        Args:
            skip: Number of records to skip (must be non-negative)
            limit: Maximum number of records to return (capped at MAX_PAGE_SIZE)
            with_modules: Whether to eager load modules (prevents N+1 queries)

        Returns:
            List of published courses
            
        Note:
            - Pagination is enforced: limit is capped at MAX_PAGE_SIZE (100)
            - Use with_modules=True when you need to access course modules
              to prevent N+1 query problems.
              
        Raises:
            ValueError: If skip or limit is negative
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError(errors.VALIDATION_SKIP_NEGATIVE)
        
        if limit < 0:
            raise ValueError(errors.VALIDATION_LIMIT_NEGATIVE)
        
        # Enforce maximum page size
        limit = min(limit, settings.MAX_PAGE_SIZE)
        
        query = (
            self.db.query(Course)
            .filter(Course.is_published == True)
        )
        
        # Eager load modules if requested to prevent N+1 queries
        if with_modules:
            query = query.options(selectinload(Course.modules))
        
        return query.offset(skip).limit(limit).all()

    def get_featured(self, limit: int = 10) -> list[Course]:
        """
        Get featured courses with validated pagination.

        Args:
            limit: Maximum number of courses to return (capped at MAX_PAGE_SIZE)

        Returns:
            List of featured courses
            
        Raises:
            ValueError: If limit is negative
        """
        # Validate pagination parameter
        if limit < 0:
            raise ValueError(errors.VALIDATION_LIMIT_NEGATIVE)
        
        # Enforce maximum page size
        limit = min(limit, settings.MAX_PAGE_SIZE)
        
        return (
            self.db.query(Course)
            .filter(Course.is_featured == True, Course.is_published == True)
            .limit(limit)
            .all()
        )

    def get_with_full_hierarchy(self, course_id: UUID | str) -> Optional[Course]:
        """
        Get course with complete hierarchy (modules -> sections -> knowledge points).
        
        This uses eager loading to prevent N+1 queries when accessing
        the entire course structure.

        Args:
            course_id: Course ID

        Returns:
            Course instance with full hierarchy or None if not found
            
        Note:
            This performs deep eager loading and may be slower for large courses.
            Use only when you need the complete course structure.
        """
        normalized_course_id = self._normalize_id(course_id)
        return (
            self.db.query(Course)
            .filter(Course.id == normalized_course_id)
            .options(
                selectinload(Course.modules).selectinload(Module.sections).selectinload(Section.knowledge_points)
            )
            .first()
        )

    def search_by_title(
        self, 
        search_term: str, 
        skip: int = 0, 
        limit: int = 100,
        with_modules: bool = False
    ) -> list[Course]:
        """
        Search courses by title with optional eager loading.

        Args:
            search_term: Search term
            skip: Number of records to skip (must be non-negative)
            limit: Maximum number of records to return (capped at MAX_PAGE_SIZE)
            with_modules: Whether to eager load modules (prevents N+1 queries)

        Returns:
            List of matching courses
            
        Raises:
            ValueError: If skip or limit is negative
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError(errors.VALIDATION_SKIP_NEGATIVE)
        
        if limit < 0:
            raise ValueError(errors.VALIDATION_LIMIT_NEGATIVE)
        
        # Enforce maximum page size
        limit = min(limit, settings.MAX_PAGE_SIZE)
        
        query = (
            self.db.query(Course)
            .filter(Course.title.ilike(f"%{search_term}%"), Course.is_published == True)
        )
        
        # Eager load modules if requested
        if with_modules:
            query = query.options(selectinload(Course.modules))
        
        return query.offset(skip).limit(limit).all()
