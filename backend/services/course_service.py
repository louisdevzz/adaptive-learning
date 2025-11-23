"""Course service for business logic."""

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.course_repo import CourseRepository
from schemas.course_schema import CourseCreate, CourseUpdate


class CourseService:
    """Service for course operations."""

    def __init__(self, db: Session):
        """Initialize course service."""
        self.db = db
        self.repo = CourseRepository(db)

    def create_course(self, course_data: CourseCreate):
        """Create a new course."""
        # Check if code already exists
        existing = self.repo.get_by_code(course_data.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course with this code already exists",
            )

        return self.repo.create(**course_data.model_dump())

    def get_course(self, course_id: UUID | str):
        """Get course by ID."""
        course = self.repo.get_by_id(course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return course

    def get_course_by_code(self, code: str):
        """Get course by code."""
        course = self.repo.get_by_code(code)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return course

    def get_course_with_modules(self, course_id: UUID | str):
        """Get course with all modules."""
        course = self.repo.get_with_modules(course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return course

    def update_course(self, course_id: UUID | str, course_data: CourseUpdate):
        """Update a course."""
        course = self.repo.update(course_id, **course_data.model_dump(exclude_unset=True))
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return course

    def delete_course(self, course_id: UUID | str):
        """Delete a course."""
        success = self.repo.delete(course_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return {"message": "Course deleted successfully"}

    def list_courses(self, skip: int = 0, limit: int = 100, published_only: bool = False):
        """List all courses with pagination."""
        if published_only:
            items = self.repo.get_published(skip, limit)
        else:
            items = self.repo.get_all(skip, limit)

        total = self.repo.count_all(published_only)
        return {"items": items, "total": total}

    def search_courses(self, query: str, skip: int = 0, limit: int = 100):
        """Search courses by title."""
        return self.repo.search_by_title(query, skip, limit)
