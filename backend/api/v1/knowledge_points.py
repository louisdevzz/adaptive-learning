"""Knowledge Point API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies import RequireStudent, RequireTeacher, get_current_user
from core.database import get_db
from models.user import User
from schemas.kp_schema import KnowledgePointCreate, KnowledgePointResponse, KnowledgePointUpdate
from schemas.mastery_schema import MasteryProgressRequest, MasteryRecordResponse, UserProgressSummary
from services.kp_service import KnowledgePointService
from services.mastery_service import MasteryService

router = APIRouter(prefix="/knowledge-points", tags=["Knowledge Points"])


@router.post("/", response_model=KnowledgePointResponse, dependencies=[RequireTeacher])
def create_knowledge_point(
    kp_data: KnowledgePointCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new knowledge point (teacher/admin only)."""
    service = KnowledgePointService(db)
    return service.create_knowledge_point(kp_data)


@router.get("/section/{section_id}", response_model=list[KnowledgePointResponse])
def list_knowledge_points_by_section(
    section_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all knowledge points for a section."""
    service = KnowledgePointService(db)
    return service.list_by_section(section_id)


@router.get("/{kp_id}", response_model=KnowledgePointResponse)
def get_knowledge_point(
    kp_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get knowledge point details."""
    service = KnowledgePointService(db)
    return service.get_knowledge_point(kp_id)


@router.put("/{kp_id}", response_model=KnowledgePointResponse, dependencies=[RequireTeacher])
def update_knowledge_point(
    kp_id: UUID,
    kp_data: KnowledgePointUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    """Update a knowledge point (teacher/admin only)."""
    service = KnowledgePointService(db)
    return service.update_knowledge_point(kp_id, kp_data)


@router.delete("/{kp_id}", dependencies=[RequireTeacher])
def delete_knowledge_point(
    kp_id: UUID,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a knowledge point (teacher/admin only)."""
    service = KnowledgePointService(db)
    return service.delete_knowledge_point(kp_id)


# Mastery tracking endpoints
@router.post("/progress", response_model=MasteryRecordResponse, dependencies=[RequireStudent])
def track_progress(
    progress_data: MasteryProgressRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Track learning progress for a knowledge point."""
    service = MasteryService(db)
    return service.track_progress(current_user.id, progress_data)


@router.get("/mastery/summary", response_model=UserProgressSummary, dependencies=[RequireStudent])
def get_progress_summary(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get overall progress summary for current user."""
    service = MasteryService(db)
    return service.get_user_progress_summary(current_user.id)


@router.get("/mastery/recommendations", dependencies=[RequireStudent])
def get_recommendations(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(5, ge=1, le=20),
):
    """Get personalized learning recommendations."""
    service = MasteryService(db)
    return service.get_learning_recommendations(current_user.id, limit)
