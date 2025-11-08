"""API endpoints for semantic search operations."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import time
import logging

from api.dependencies import get_db, get_current_user, require_role
from schemas.search_schema import (
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    SimilarDocumentsRequest,
    SimilarDocumentsResponse,
    IndexDocumentRequest,
    IndexDocumentResponse,
    ReindexRequest,
    ReindexResponse,
    HealthCheckResponse,
    InitializeIndicesResponse,
)
from services.search_service import search_service
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("/", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    """
    Perform semantic search across content.
    
    Searches through courses, modules, sections, and knowledge points
    using semantic similarity (vector search) combined with text search.
    """
    try:
        start_time = time.time()
        
        # Perform search
        results = await search_service.search(
            query=request.query,
            content_types=request.content_types,
            k=request.k,
            filters=request.filters,
            use_hybrid=request.use_hybrid
        )
        
        # Convert to response format
        formatted_results = {}
        total_results = 0
        
        for content_type, items in results.items():
            formatted_items = [
                SearchResultItem(
                    id=item["id"],
                    score=item["score"],
                    title=item["title"],
                    description=item["description"],
                    content=item["content"],
                    content_type=item["content_type"],
                    metadata=item["metadata"]
                )
                for item in items
            ]
            formatted_results[content_type] = formatted_items
            total_results += len(formatted_items)
        
        search_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return SearchResponse(
            query=request.query,
            results=formatted_results,
            total_results=total_results,
            search_time_ms=search_time
        )
        
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.post("/similar", response_model=SimilarDocumentsResponse)
async def find_similar(
    request: SimilarDocumentsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SimilarDocumentsResponse:
    """
    Find similar documents to a given document.
    
    Uses vector similarity to find related content.
    """
    try:
        # Find similar documents
        similar = await search_service.find_similar(
            content_type=request.content_type,
            doc_id=request.doc_id,
            k=request.k
        )
        
        # Format results (exclude the original document)
        formatted_similar = [
            SearchResultItem(
                id=item["id"],
                score=item["score"],
                title=item["title"],
                description=item["description"],
                content=item["content"],
                content_type=item["content_type"],
                metadata=item["metadata"]
            )
            for item in similar
            if item["id"] != request.doc_id
        ][:request.k]  # Limit to k results after filtering
        
        return SimilarDocumentsResponse(
            content_type=request.content_type,
            doc_id=request.doc_id,
            similar_documents=formatted_similar
        )
        
    except Exception as e:
        logger.error(f"Error finding similar documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to find similar documents: {str(e)}"
        )


@router.post("/index", response_model=IndexDocumentResponse)
async def index_document(
    request: IndexDocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "teacher"])),
) -> IndexDocumentResponse:
    """
    Index a single document in OpenSearch.
    
    Only admins and teachers can index content.
    """
    try:
        # Map content type to indexing function
        index_functions = {
            "courses": search_service.index_course,
            "modules": search_service.index_module,
            "sections": search_service.index_section,
            "knowledge_points": search_service.index_knowledge_point,
        }
        
        index_func = index_functions.get(request.content_type)
        
        if not index_func:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type: {request.content_type}"
            )
        
        # Index the document
        success = await index_func(db, request.doc_id)
        
        return IndexDocumentResponse(
            success=success,
            doc_id=request.doc_id,
            content_type=request.content_type,
            message="Document indexed successfully" if success else "Failed to index document"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error indexing document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index document: {str(e)}"
        )


@router.post("/reindex", response_model=ReindexResponse)
async def reindex_all(
    request: ReindexRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
) -> ReindexResponse:
    """
    Reindex all content in OpenSearch.
    
    Only admins can trigger reindexing. This is a long-running operation.
    """
    try:
        logger.info(f"Starting reindexing triggered by user {current_user.id}")
        
        # Reindex all content
        counts = await search_service.reindex_all(db)
        
        total_indexed = sum(counts.values())
        
        return ReindexResponse(
            success=True,
            counts=counts,
            total_indexed=total_indexed
        )
        
    except Exception as e:
        logger.error(f"Error during reindexing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reindexing failed: {str(e)}"
        )


@router.get("/health", response_model=HealthCheckResponse)
async def health_check(
    current_user: User = Depends(require_role(["admin"])),
) -> HealthCheckResponse:
    """
    Check OpenSearch cluster health.
    
    Only admins can check system health.
    """
    try:
        # Check OpenSearch health
        health = await search_service.opensearch_service.health_check()
        
        # Check indices
        indices_status = {}
        for content_type, index_name in search_service.opensearch_service.indices.items():
            try:
                exists = search_service.opensearch_service.client.indices.exists(
                    index=index_name
                )
                indices_status[content_type] = exists
            except:
                indices_status[content_type] = False
        
        return HealthCheckResponse(
            opensearch_status=health.get("status", "unknown"),
            cluster_name=health.get("cluster_name"),
            number_of_nodes=health.get("number_of_nodes"),
            active_shards=health.get("active_shards"),
            indices=indices_status
        )
        
    except Exception as e:
        logger.error(f"Error checking health: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )


@router.post("/initialize", response_model=InitializeIndicesResponse)
async def initialize_indices(
    current_user: User = Depends(require_role(["admin"])),
) -> InitializeIndicesResponse:
    """
    Initialize OpenSearch indices.
    
    Creates all required indices if they don't exist.
    Only admins can initialize indices.
    """
    try:
        logger.info(f"Initializing indices triggered by user {current_user.id}")
        
        results = await search_service.initialize_indices()
        
        success = all(results.values())
        
        return InitializeIndicesResponse(
            success=success,
            indices=results
        )
        
    except Exception as e:
        logger.error(f"Error initializing indices: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize indices: {str(e)}"
        )


@router.get("/courses/{course_id}/search")
async def search_in_course(
    course_id: str,
    query: str,
    k: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    """
    Search within a specific course.
    
    Searches modules, sections, and knowledge points within the given course.
    """
    try:
        start_time = time.time()
        
        # Search with course filter
        filters = {"metadata.course_id": course_id}
        
        results = await search_service.search(
            query=query,
            content_types=["modules", "sections", "knowledge_points"],
            k=k,
            filters=filters,
            use_hybrid=True
        )
        
        # Convert to response format
        formatted_results = {}
        total_results = 0
        
        for content_type, items in results.items():
            formatted_items = [
                SearchResultItem(
                    id=item["id"],
                    score=item["score"],
                    title=item["title"],
                    description=item["description"],
                    content=item["content"],
                    content_type=item["content_type"],
                    metadata=item["metadata"]
                )
                for item in items
            ]
            formatted_results[content_type] = formatted_items
            total_results += len(formatted_items)
        
        search_time = (time.time() - start_time) * 1000
        
        return SearchResponse(
            query=query,
            results=formatted_results,
            total_results=total_results,
            search_time_ms=search_time
        )
        
    except Exception as e:
        logger.error(f"Error searching in course: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )

