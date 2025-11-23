"""Course API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies import RequireTeacher, get_current_user
from core.database import get_db
from models.user import User
from schemas.course_schema import CourseCreate, CourseListResponse, CourseResponse, CourseUpdate, CourseWithModules
from services.course_service import CourseService
from utils.background_tasks import (
    index_course_background,
    update_course_index_background,
    delete_from_index_background,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=CourseResponse, dependencies=[RequireTeacher])
async def create_course(
    course_data: CourseCreate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new course (teacher/admin only)."""
    # Override user_id from token (security measure)
    course_data.user_id = current_user.id

    service = CourseService(db)
    course = service.create_course(course_data)

    # Index course in OpenSearch in background
    background_tasks.add_task(index_course_background, db, str(course.id))

    return course


@router.get("/", response_model=CourseListResponse)
def list_courses(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    published_only: bool = Query(False),
):
    """List all courses with pagination."""
    service = CourseService(db)
    return service.list_courses(skip, limit, published_only)


@router.get("/code/{code}", response_model=CourseWithModules)
def get_course_by_code(
    code: str,
    db: Annotated[Session, Depends(get_db)]
):
    """Get course details by code with modules."""
    service = CourseService(db)
    return service.get_course_by_code(code)


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
async def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Update a course (teacher/admin only)."""
    service = CourseService(db)
    course = service.update_course(course_id, course_data)
    
    # Update course in OpenSearch in background
    background_tasks.add_task(update_course_index_background, db, str(course.id))
    
    return course


@router.delete("/{course_id}", dependencies=[RequireTeacher])
async def delete_course(
    course_id: UUID,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a course (teacher/admin only)."""
    service = CourseService(db)
    result = service.delete_course(course_id)
    
    # Delete course from OpenSearch in background
    background_tasks.add_task(delete_from_index_background, "courses", str(course_id))
    
    return result


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
