"""Pydantic schemas for search operations."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class SearchRequest(BaseModel):
    """Request schema for search."""
    
    query: str = Field(..., min_length=1, max_length=500, description="Search query")
    content_types: Optional[List[str]] = Field(
        default=None,
        description="Content types to search (courses, modules, sections, knowledge_points)"
    )
    k: int = Field(default=10, ge=1, le=100, description="Number of results per type")
    use_hybrid: bool = Field(
        default=True,
        description="Use hybrid search (text + vector) instead of pure vector search"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata filters"
    )


class SearchResultItem(BaseModel):
    """Single search result item."""
    
    id: str = Field(..., description="Document ID")
    score: float = Field(..., description="Relevance score")
    title: str = Field(..., description="Document title")
    description: str = Field(..., description="Document description")
    content: str = Field(..., description="Document content")
    content_type: str = Field(..., description="Type of content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Document metadata")


class SearchResponse(BaseModel):
    """Response schema for search."""
    
    query: str = Field(..., description="Original search query")
    results: Dict[str, List[SearchResultItem]] = Field(
        ...,
        description="Search results grouped by content type"
    )
    total_results: int = Field(..., description="Total number of results")
    search_time_ms: Optional[float] = Field(
        None,
        description="Search execution time in milliseconds"
    )


class SimilarDocumentsRequest(BaseModel):
    """Request schema for finding similar documents."""
    
    content_type: str = Field(
        ...,
        description="Content type (courses, modules, sections, knowledge_points)"
    )
    doc_id: str = Field(..., description="Document ID to find similar documents for")
    k: int = Field(default=5, ge=1, le=50, description="Number of similar documents")


class SimilarDocumentsResponse(BaseModel):
    """Response schema for similar documents."""
    
    content_type: str = Field(..., description="Content type")
    doc_id: str = Field(..., description="Original document ID")
    similar_documents: List[SearchResultItem] = Field(
        ...,
        description="Similar documents"
    )


class IndexDocumentRequest(BaseModel):
    """Request schema for indexing a document."""
    
    content_type: str = Field(
        ...,
        description="Content type (courses, modules, sections, knowledge_points)"
    )
    doc_id: str = Field(..., description="Document ID")


class IndexDocumentResponse(BaseModel):
    """Response schema for document indexing."""
    
    success: bool = Field(..., description="Whether indexing was successful")
    doc_id: str = Field(..., description="Document ID")
    content_type: str = Field(..., description="Content type")
    message: Optional[str] = Field(None, description="Optional message")


class ReindexRequest(BaseModel):
    """Request schema for reindexing."""
    
    content_types: Optional[List[str]] = Field(
        default=None,
        description="Content types to reindex (default: all)"
    )


class ReindexResponse(BaseModel):
    """Response schema for reindexing."""
    
    success: bool = Field(..., description="Whether reindexing was successful")
    counts: Dict[str, int] = Field(
        ...,
        description="Number of documents indexed per type"
    )
    total_indexed: int = Field(..., description="Total documents indexed")


class HealthCheckResponse(BaseModel):
    """Response schema for health check."""
    
    opensearch_status: str = Field(..., description="OpenSearch cluster status")
    cluster_name: Optional[str] = Field(None, description="Cluster name")
    number_of_nodes: Optional[int] = Field(None, description="Number of nodes")
    active_shards: Optional[int] = Field(None, description="Active shards")
    indices: Dict[str, bool] = Field(
        default_factory=dict,
        description="Status of indices"
    )


class InitializeIndicesResponse(BaseModel):
    """Response schema for index initialization."""
    
    success: bool = Field(..., description="Whether initialization was successful")
    indices: Dict[str, bool] = Field(
        ...,
        description="Initialization status per content type"
    )

