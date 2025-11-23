"""Search schemas for OpenSearch integration."""

from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SearchQuery(BaseModel):
    """Schema for search query."""

    query: str = Field(..., min_length=1, description="Search query text")
    filters: Optional[dict[str, Any]] = Field(None, description="Search filters")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=10, ge=1, le=100, description="Items per page")


class SearchResult(BaseModel):
    """Schema for a single search result."""

    id: UUID
    type: str = Field(..., description="Result type (course, module, section, kp)")
    title: str = Field(..., description="Result title/name")
    description: Optional[str] = None
    score: float = Field(..., description="Search relevance score")
    highlight: Optional[dict[str, list[str]]] = Field(None, description="Highlighted matches")
    metadata: Optional[dict[str, Any]] = Field(None, description="Additional metadata")


class SearchResultItem(BaseModel):
    """Schema for a single search result item."""

    id: str
    score: float
    title: str
    description: Optional[str] = None
    content: str
    content_type: str
    metadata: Optional[dict[str, Any]] = None


class SearchResponse(BaseModel):
    """Schema for search response."""

    query: str = Field(..., description="Search query")
    results: dict[str, list[SearchResultItem]] = Field(
        default_factory=dict,
        description="Search results grouped by content type"
    )
    total_results: int = Field(..., description="Total number of results")
    search_time_ms: float = Field(..., description="Search time in milliseconds")


class IndexDocument(BaseModel):
    """Schema for indexing a document in OpenSearch."""

    id: UUID
    type: str = Field(..., description="Document type")
    title: str
    content: str
    metadata: Optional[dict[str, Any]] = None


class SearchRequest(BaseModel):
    """Schema for search request."""

    query: str = Field(..., min_length=1, description="Search query text")
    content_types: Optional[list[str]] = Field(
        default=["courses", "modules", "sections", "knowledge_points"],
        description="Content types to search"
    )
    k: int = Field(default=10, ge=1, le=100, description="Number of results to return")
    filters: Optional[dict[str, Any]] = Field(None, description="Search filters")
    search_mode: str = Field(default="text", description="Search mode: text, vector, or hybrid")


class SimilarDocumentsRequest(BaseModel):
    """Schema for finding similar documents."""

    content_type: str = Field(..., description="Content type")
    doc_id: str = Field(..., description="Document ID")
    k: int = Field(default=10, ge=1, le=100, description="Number of similar documents")


class SimilarDocumentsResponse(BaseModel):
    """Schema for similar documents response."""

    content_type: str
    doc_id: str
    similar_documents: list[SearchResultItem]


class IndexDocumentRequest(BaseModel):
    """Schema for indexing document request."""

    content_type: str = Field(..., description="Content type to index")
    doc_id: str = Field(..., description="Document ID")


class IndexDocumentResponse(BaseModel):
    """Schema for indexing document response."""

    success: bool
    doc_id: str
    content_type: str
    message: str


class ReindexRequest(BaseModel):
    """Schema for reindex request."""

    pass


class ReindexResponse(BaseModel):
    """Schema for reindex response."""

    success: bool
    counts: dict[str, int]
    total_indexed: int


class HealthCheckResponse(BaseModel):
    """Schema for health check response."""

    opensearch_status: str
    cluster_name: Optional[str] = None
    number_of_nodes: Optional[int] = None
    active_shards: Optional[int] = None
    indices: dict[str, bool]


class InitializeIndicesResponse(BaseModel):
    """Schema for initialize indices response."""

    success: bool
    indices: dict[str, bool]
