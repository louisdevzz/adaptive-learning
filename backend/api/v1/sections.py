"""Section API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends
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
from utils.background_tasks import (
    index_section_background,
    delete_from_index_background,
)

router = APIRouter(prefix="/sections", tags=["Sections"])


@router.post("/", response_model=SectionResponse, dependencies=[RequireTeacher])
async def create_section(
    section_data: SectionCreate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new section (teacher/admin only)."""
    service = SectionService(db)
    section = service.create_section(section_data)
    
    # Index section in OpenSearch in background
    background_tasks.add_task(index_section_background, db, str(section.id))
    
    return section


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
async def update_section(
    section_id: UUID,
    section_data: SectionUpdate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Update a section (teacher/admin only)."""
    service = SectionService(db)
    section = service.update_section(section_id, section_data)
    
    # Reindex section in OpenSearch in background
    background_tasks.add_task(index_section_background, db, str(section.id))
    
    return section


@router.delete("/{section_id}", dependencies=[RequireTeacher])
async def delete_section(
    section_id: UUID,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a section (teacher/admin only)."""
    service = SectionService(db)
    result = service.delete_section(section_id)
    
    # Delete section from OpenSearch in background
    background_tasks.add_task(delete_from_index_background, "sections", str(section_id))
    
    return result
