"""Background tasks for asynchronous operations like indexing."""

import logging
from typing import Optional
from sqlalchemy.orm import Session

from services.search_service import search_service

logger = logging.getLogger(__name__)


async def index_course_background(db: Session, course_id: str) -> None:
    """
    Background task to index a course in OpenSearch.
    
    Args:
        db: Database session
        course_id: Course ID to index
    """
    try:
        logger.info(f"Background task: Indexing course {course_id}")
        success = await search_service.index_course(db, course_id)
        
        if success:
            logger.info(f"Successfully indexed course {course_id}")
        else:
            logger.warning(f"Failed to index course {course_id}")
            
    except Exception as e:
        logger.error(f"Error in background task indexing course {course_id}: {e}")


async def index_module_background(db: Session, module_id: str) -> None:
    """
    Background task to index a module in OpenSearch.
    
    Args:
        db: Database session
        module_id: Module ID to index
    """
    try:
        logger.info(f"Background task: Indexing module {module_id}")
        success = await search_service.index_module(db, module_id)
        
        if success:
            logger.info(f"Successfully indexed module {module_id}")
        else:
            logger.warning(f"Failed to index module {module_id}")
            
    except Exception as e:
        logger.error(f"Error in background task indexing module {module_id}: {e}")


async def index_section_background(db: Session, section_id: str) -> None:
    """
    Background task to index a section in OpenSearch.
    
    Args:
        db: Database session
        section_id: Section ID to index
    """
    try:
        logger.info(f"Background task: Indexing section {section_id}")
        success = await search_service.index_section(db, section_id)
        
        if success:
            logger.info(f"Successfully indexed section {section_id}")
        else:
            logger.warning(f"Failed to index section {section_id}")
            
    except Exception as e:
        logger.error(f"Error in background task indexing section {section_id}: {e}")


async def index_knowledge_point_background(db: Session, kp_id: str) -> None:
    """
    Background task to index a knowledge point in OpenSearch.
    
    Args:
        db: Database session
        kp_id: Knowledge point ID to index
    """
    try:
        logger.info(f"Background task: Indexing knowledge point {kp_id}")
        success = await search_service.index_knowledge_point(db, kp_id)
        
        if success:
            logger.info(f"Successfully indexed knowledge point {kp_id}")
        else:
            logger.warning(f"Failed to index knowledge point {kp_id}")
            
    except Exception as e:
        logger.error(f"Error in background task indexing KP {kp_id}: {e}")


async def update_course_index_background(
    db: Session,
    course_id: str,
    updates: Optional[dict] = None
) -> None:
    """
    Background task to update a course in OpenSearch.
    
    If updates are provided, only update those fields.
    Otherwise, reindex the entire course.
    
    Args:
        db: Database session
        course_id: Course ID to update
        updates: Optional dictionary of fields to update
    """
    try:
        logger.info(f"Background task: Updating course {course_id} in index")
        
        if updates:
            # Partial update
            success = await search_service.opensearch_service.update_document(
                content_type="courses",
                doc_id=course_id,
                updates=updates
            )
        else:
            # Full reindex
            success = await search_service.index_course(db, course_id)
        
        if success:
            logger.info(f"Successfully updated course {course_id} in index")
        else:
            logger.warning(f"Failed to update course {course_id} in index")
            
    except Exception as e:
        logger.error(f"Error updating course {course_id} in index: {e}")


async def delete_from_index_background(
    content_type: str,
    doc_id: str
) -> None:
    """
    Background task to delete a document from OpenSearch.
    
    Args:
        content_type: Type of content (courses, modules, sections, knowledge_points)
        doc_id: Document ID to delete
    """
    try:
        logger.info(f"Background task: Deleting {content_type} {doc_id} from index")
        success = await search_service.opensearch_service.delete_document(
            content_type=content_type,
            doc_id=doc_id
        )
        
        if success:
            logger.info(f"Successfully deleted {content_type} {doc_id} from index")
        else:
            logger.warning(f"Failed to delete {content_type} {doc_id} from index")
            
    except Exception as e:
        logger.error(f"Error deleting {content_type} {doc_id} from index: {e}")

