"""Module API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from api.dependencies import RequireTeacher, get_current_user
from core.database import get_db
from models.user import User
from schemas.module_schema import ModuleCreate, ModuleResponse, ModuleUpdate, ModuleWithSections
from services.module_service import ModuleService
from utils.background_tasks import (
    index_module_background,
    delete_from_index_background,
)

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.post("/", response_model=ModuleResponse, dependencies=[RequireTeacher])
async def create_module(
    module_data: ModuleCreate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new module (teacher/admin only)."""
    service = ModuleService(db)
    module = service.create_module(module_data)
    
    # Index module in OpenSearch in background
    background_tasks.add_task(index_module_background, db, str(module.id))
    
    return module


@router.get("/course/{course_id}", response_model=list[ModuleResponse])
def list_modules_by_course(
    course_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all modules for a course."""
    service = ModuleService(db)
    return service.list_by_course(course_id)


@router.get("/{module_id}", response_model=ModuleWithSections)
def get_module(
    module_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get module details with sections."""
    service = ModuleService(db)
    return service.get_module_with_sections(module_id)


@router.put("/{module_id}", response_model=ModuleResponse, dependencies=[RequireTeacher])
async def update_module(
    module_id: UUID,
    module_data: ModuleUpdate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Update a module (teacher/admin only)."""
    service = ModuleService(db)
    module = service.update_module(module_id, module_data)
    
    # Reindex module in OpenSearch in background
    background_tasks.add_task(index_module_background, db, str(module.id))
    
    return module


@router.delete("/{module_id}", dependencies=[RequireTeacher])
async def delete_module(
    module_id: UUID,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a module (teacher/admin only)."""
    service = ModuleService(db)
    result = service.delete_module(module_id)
    
    # Delete module from OpenSearch in background
    background_tasks.add_task(delete_from_index_background, "modules", str(module_id))
    
    return result
