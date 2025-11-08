"""Section API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import RequireTeacher, get_current_user
from core.database import get_db
from models.user import User
from schemas.section_schema import (
    SectionCreate,
    SectionResponse,
    SectionUpdate,
    SectionWithKnowledgePoints,
)
from services.section_service import SectionService

router = APIRouter(prefix="/sections", tags=["Sections"])


@router.post("/", response_model=SectionResponse, dependencies=[RequireTeacher])
def create_section(
    section_data: SectionCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new section (teacher/admin only)."""
    service = SectionService(db)
    return service.create_section(section_data)


@router.get("/module/{module_id}", response_model=list[SectionResponse])
def list_sections_by_module(
    module_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all sections for a module."""
    service = SectionService(db)
    return service.list_by_module(module_id)


@router.get("/{section_id}", response_model=SectionWithKnowledgePoints)
def get_section(
    section_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get section details with knowledge points."""
    service = SectionService(db)
    return service.get_section_with_knowledge_points(section_id)


@router.put("/{section_id}", response_model=SectionResponse, dependencies=[RequireTeacher])
def update_section(
    section_id: UUID,
    section_data: SectionUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    """Update a section (teacher/admin only)."""
    service = SectionService(db)
    return service.update_section(section_id, section_data)


@router.delete("/{section_id}", dependencies=[RequireTeacher])
def delete_section(
    section_id: UUID,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a section (teacher/admin only)."""
    service = SectionService(db)
    return service.delete_section(section_id)
