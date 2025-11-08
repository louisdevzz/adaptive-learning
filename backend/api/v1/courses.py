"""Course API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies import RequireTeacher, get_current_user
from core.database import get_db
from models.user import User
from schemas.course_schema import CourseCreate, CourseResponse, CourseUpdate, CourseWithModules
from services.course_service import CourseService

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=CourseResponse, dependencies=[RequireTeacher])
def create_course(
    course_data: CourseCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new course (teacher/admin only)."""
    service = CourseService(db)
    return service.create_course(course_data)


@router.get("/", response_model=list[CourseResponse])
def list_courses(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    published_only: bool = Query(False),
):
    """List all courses with pagination."""
    service = CourseService(db)
    return service.list_courses(skip, limit, published_only)


@router.get("/slug/{slug}", response_model=CourseWithModules)
def get_course_by_slug(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get course details by slug with modules."""
    service = CourseService(db)
    return service.get_course_by_slug(slug)


@router.get("/{course_id}", response_model=CourseWithModules)
def get_course(
    course_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get course details with modules."""
    service = CourseService(db)
    return service.get_course_with_modules(course_id)


@router.put("/{course_id}", response_model=CourseResponse, dependencies=[RequireTeacher])
def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    """Update a course (teacher/admin only)."""
    service = CourseService(db)
    return service.update_course(course_id, course_data)


@router.delete("/{course_id}", dependencies=[RequireTeacher])
def delete_course(
    course_id: UUID,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a course (teacher/admin only)."""
    service = CourseService(db)
    return service.delete_course(course_id)


@router.get("/search/", response_model=list[CourseResponse])
def search_courses(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """Search courses by title."""
    service = CourseService(db)
    return service.search_courses(q, skip, limit)
