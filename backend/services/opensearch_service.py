"""Service for managing OpenSearch vector storage and operations."""

from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection, helpers
from opensearchpy.exceptions import OpenSearchException
import urllib3

from core.config import settings

# Disable SSL warnings for development (since we're using self-signed certificates)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)


class OpenSearchService:
    """Service for managing OpenSearch operations for vector storage."""

    def __init__(self):
        """Initialize OpenSearch client."""
        # Create OpenSearch client
        self.client = OpenSearch(
            hosts=[{"host": settings.OPENSEARCH_HOST, "port": settings.OPENSEARCH_PORT}],
            http_auth=(settings.OPENSEARCH_USER, settings.OPENSEARCH_PASSWORD) 
                if settings.OPENSEARCH_USER and settings.OPENSEARCH_PASSWORD else None,
            use_ssl=settings.OPENSEARCH_USE_SSL,
            verify_certs=settings.OPENSEARCH_VERIFY_CERTS,
            connection_class=RequestsHttpConnection,
            timeout=30,
        )
        
        self.index_prefix = settings.OPENSEARCH_INDEX_PREFIX
        self.embedding_dimension = settings.OPENAI_EMBEDDING_DIMENSION
        
        # Index names for different content types
        self.indices = {
            "courses": f"{self.index_prefix}_courses",
            "modules": f"{self.index_prefix}_modules",
            "sections": f"{self.index_prefix}_sections",
            "knowledge_points": f"{self.index_prefix}_knowledge_points",
        }
    
    def get_index_mapping(self) -> Dict[str, Any]:
        """
        Get the index mapping for vector storage.
        
        Returns:
            Index mapping configuration
        """
        return {
            "settings": {
                "index": {
                    "knn": True,  # Enable k-NN search
                    "number_of_shards": 1,
                    "number_of_replicas": 0,  # Set to 0 for development
                },
                "index.knn": True,
            },
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "content_type": {"type": "keyword"},
                    "title": {
                        "type": "text",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "description": {
                        "type": "text",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "content": {"type": "text"},
                    "metadata": {
                        "type": "object",
                        "enabled": True,
                        "properties": {
                            "course_id": {"type": "keyword"},
                            "module_id": {"type": "keyword"},
                            "section_id": {"type": "keyword"},
                            "difficulty": {"type": "keyword"},
                            "difficulty_level": {"type": "keyword"},
                            "level": {"type": "keyword"},
                            "content_type": {"type": "keyword"},
                            "tags": {"type": "keyword"},
                            "category": {"type": "keyword"},
                            "order": {"type": "integer"},
                        }
                    },
                    "embedding": {
                        "type": "knn_vector",
                        "dimension": self.embedding_dimension,
                        "method": {
                            "name": "hnsw",
                            "space_type": "cosinesimil",
                            "engine": "lucene",
                            "parameters": {
                                "ef_construction": 128,
                                "m": 16
                            }
                        }
                    },
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                }
            }
        }
    
    async def create_index(self, index_name: str) -> bool:
        """
        Create an index if it doesn't exist.
        
        Args:
            index_name: Name of the index to create
            
        Returns:
            True if created or already exists, False on error
        """
        try:
            if self.client.indices.exists(index=index_name):
                logger.info(f"Index {index_name} already exists")
                return True
            
            mapping = self.get_index_mapping()
            self.client.indices.create(index=index_name, body=mapping)
            logger.info(f"Created index: {index_name}")
            return True
            
        except OpenSearchException as e:
            logger.error(f"Error creating index {index_name}: {e}")
            return False
    
    async def create_all_indices(self) -> Dict[str, bool]:
        """
        Create all content type indices.
        
        Returns:
            Dictionary mapping index names to creation success status
        """
        results = {}
        for content_type, index_name in self.indices.items():
            results[content_type] = await self.create_index(index_name)
        return results
    
    async def delete_index(self, index_name: str) -> bool:
        """
        Delete an index.
        
        Args:
            index_name: Name of the index to delete
            
        Returns:
            True if deleted, False on error
        """
        try:
            if self.client.indices.exists(index=index_name):
                self.client.indices.delete(index=index_name)
                logger.info(f"Deleted index: {index_name}")
            return True
        except OpenSearchException as e:
            logger.error(f"Error deleting index {index_name}: {e}")
            return False
    
    async def index_document(
        self,
        content_type: str,
        doc_id: str,
        title: str,
        content: str,
        embedding: List[float],
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Index a document with its embedding.
        
        Args:
            content_type: Type of content (course, module, section, knowledge_point)
            doc_id: Unique document ID (from PostgreSQL)
            title: Document title
            content: Document content text
            embedding: Embedding vector
            description: Optional description
            metadata: Optional metadata dictionary
            
        Returns:
            True if successful, False otherwise
        """
        if content_type not in self.indices:
            logger.error(f"Invalid content type: {content_type}")
            return False
        
        index_name = self.indices[content_type]
        
        try:
            # Ensure index exists
            await self.create_index(index_name)
            
            # Prepare document
            document = {
                "id": doc_id,
                "content_type": content_type,
                "title": title,
                "description": description or "",
                "content": content,
                "embedding": embedding,
                "metadata": metadata or {},
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
            
            # Index document
            response = self.client.index(
                index=index_name,
                id=doc_id,
                body=document,
                refresh=True  # Make immediately searchable
            )
            
            logger.info(f"Indexed document {doc_id} in {index_name}: {response['result']}")
            return True
            
        except OpenSearchException as e:
            logger.error(f"Error indexing document {doc_id}: {e}")
            return False
    
    async def index_documents_bulk(
        self,
        content_type: str,
        documents: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """
        Index multiple documents in bulk.
        
        Args:
            content_type: Type of content
            documents: List of documents with keys: id, title, content, embedding, description, metadata
            
        Returns:
            Dictionary with success and failed counts
        """
        if content_type not in self.indices:
            logger.error(f"Invalid content type: {content_type}")
            return {"success": 0, "failed": len(documents)}
        
        index_name = self.indices[content_type]
        
        try:
            # Ensure index exists
            await self.create_index(index_name)
            
            # Prepare bulk actions
            actions = []
            for doc in documents:
                action = {
                    "_index": index_name,
                    "_id": doc["id"],
                    "_source": {
                        "id": doc["id"],
                        "content_type": content_type,
                        "title": doc.get("title", ""),
                        "description": doc.get("description", ""),
                        "content": doc.get("content", ""),
                        "embedding": doc.get("embedding", []),
                        "metadata": doc.get("metadata", {}),
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat(),
                    }
                }
                actions.append(action)
            
            # Execute bulk indexing
            success, failed = helpers.bulk(
                self.client,
                actions,
                raise_on_error=False,
                raise_on_exception=False
            )
            
            logger.info(f"Bulk indexed {success} documents, {len(failed)} failed")
            return {"success": success, "failed": len(failed)}
            
        except Exception as e:
            logger.error(f"Error in bulk indexing: {e}")
            return {"success": 0, "failed": len(documents)}
    
    async def update_document(
        self,
        content_type: str,
        doc_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """
        Update a document.
        
        Args:
            content_type: Type of content
            doc_id: Document ID
            updates: Dictionary of fields to update
            
        Returns:
            True if successful, False otherwise
        """
        if content_type not in self.indices:
            logger.error(f"Invalid content type: {content_type}")
            return False
        
        index_name = self.indices[content_type]
        
        try:
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.client.update(
                index=index_name,
                id=doc_id,
                body={"doc": updates},
                refresh=True
            )
            
            logger.info(f"Updated document {doc_id}: {response['result']}")
            return True
            
        except OpenSearchException as e:
            logger.error(f"Error updating document {doc_id}: {e}")
            return False
    
    async def delete_document(self, content_type: str, doc_id: str) -> bool:
        """
        Delete a document.
        
        Args:
            content_type: Type of content
            doc_id: Document ID
            
        Returns:
            True if successful, False otherwise
        """
        if content_type not in self.indices:
            logger.error(f"Invalid content type: {content_type}")
            return False
        
        index_name = self.indices[content_type]
        
        try:
            response = self.client.delete(
                index=index_name,
                id=doc_id,
                refresh=True
            )
            
            logger.info(f"Deleted document {doc_id}: {response['result']}")
            return True
            
        except OpenSearchException as e:
            logger.error(f"Error deleting document {doc_id}: {e}")
            return False
    
    async def vector_search(
        self,
        content_type: str,
        query_embedding: List[float],
        k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search using k-NN query.
        
        Uses the OpenSearch k-NN plugin for efficient vector similarity search.
        
        Args:
            content_type: Type of content to search
            query_embedding: Query embedding vector
            k: Number of results to return
            filters: Optional filters for metadata
            
        Returns:
            List of search results with scores
        """
        if content_type not in self.indices:
            logger.error(f"Invalid content type: {content_type}")
            return []
        
        index_name = self.indices[content_type]
        
        try:
            # Build k-NN query body
            query_body = {
                "size": k,
                "query": {
                    "knn": {
                        "embedding": {
                            "vector": query_embedding,
                            "k": k
                        }
                    }
                }
            }
            
            # Add filters if provided
            if filters:
                filter_clauses = []
                for field, value in filters.items():
                    if isinstance(value, list):
                        filter_clauses.append({"terms": {field: value}})
                    else:
                        filter_clauses.append({"term": {field: value}})
                
                # Wrap k-NN in bool query with filters
                query_body = {
                    "size": k,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "knn": {
                                        "embedding": {
                                            "vector": query_embedding,
                                            "k": k
                                        }
                                    }
                                }
                            ],
                            "filter": filter_clauses
                        }
                    }
                }
            
            # Execute search
            response = self.client.search(
                index=index_name,
                body=query_body
            )
            
            # Parse results
            results = []
            for hit in response["hits"]["hits"]:
                result = {
                    "id": hit["_source"]["id"],
                    "score": hit["_score"],
                    "title": hit["_source"]["title"],
                    "description": hit["_source"]["description"],
                    "content": hit["_source"]["content"],
                    "metadata": hit["_source"]["metadata"],
                    "content_type": hit["_source"]["content_type"],
                }
                results.append(result)
            
            logger.info(f"Vector search returned {len(results)} results")
            return results
            
        except OpenSearchException as e:
            logger.error(f"Error in vector search: {e}")
            return []
    
    async def hybrid_search(
        self,
        content_type: str,
        query_text: str,
        query_embedding: List[float],
        k: int = 10,
        text_weight: float = 0.3,
        vector_weight: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform hybrid search combining text and vector search.
        
        This performs two separate searches and combines the results:
        1. Text search using multi_match query
        2. Vector search using k-NN
        
        Args:
            content_type: Type of content to search
            query_text: Text query
            query_embedding: Query embedding vector
            k: Number of results to return
            text_weight: Weight for text search score
            vector_weight: Weight for vector search score
            filters: Optional filters for metadata
            
        Returns:
            List of search results with combined scores
        """
        if content_type not in self.indices:
            logger.error(f"Invalid content type: {content_type}")
            return []
        
        index_name = self.indices[content_type]
        
        try:
            # Perform text search
            text_results = await self._text_search(
                index_name=index_name,
                query_text=query_text,
                k=k * 2,  # Get more results to merge with vector search
                filters=filters
            )
            
            # Perform vector search
            vector_results = await self.vector_search(
                content_type=content_type,
                query_embedding=query_embedding,
                k=k * 2,
                filters=filters
            )
            
            # Combine and re-rank results
            combined = self._combine_search_results(
                text_results=text_results,
                vector_results=vector_results,
                text_weight=text_weight,
                vector_weight=vector_weight,
                k=k
            )
            
            logger.info(f"Hybrid search returned {len(combined)} results")
            return combined
            
        except OpenSearchException as e:
            logger.error(f"Error in hybrid search: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in hybrid search: {e}")
            return []
    
    async def _text_search(
        self,
        index_name: str,
        query_text: str,
        k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform text-only search.
        
        Args:
            index_name: Name of the index to search
            query_text: Text query
            k: Number of results to return
            filters: Optional filters for metadata
            
        Returns:
            List of search results
        """
        try:
            # Build text query
            query_body = {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "multi_match": {
                                    "query": query_text,
                                    "fields": ["title^3", "description^2", "content"],
                                    "type": "best_fields",
                                    "fuzziness": "AUTO"
                                }
                            }
                        ],
                        "filter": []
                    }
                }
            }
            
            # Add filters if provided
            if filters:
                for field, value in filters.items():
                    if isinstance(value, list):
                        query_body["query"]["bool"]["filter"].append(
                            {"terms": {field: value}}
                        )
                    else:
                        query_body["query"]["bool"]["filter"].append(
                            {"term": {field: value}}
                        )
            
            # Execute search
            response = self.client.search(
                index=index_name,
                body=query_body,
                size=k
            )
            
            # Parse results
            results = []
            for hit in response["hits"]["hits"]:
                result = {
                    "id": hit["_source"]["id"],
                    "score": hit["_score"],
                    "title": hit["_source"]["title"],
                    "description": hit["_source"]["description"],
                    "content": hit["_source"]["content"],
                    "metadata": hit["_source"]["metadata"],
                    "content_type": hit["_source"]["content_type"],
                }
                results.append(result)
            
            return results
            
        except OpenSearchException as e:
            logger.error(f"Error in text search: {e}")
            return []
    
    def _combine_search_results(
        self,
        text_results: List[Dict[str, Any]],
        vector_results: List[Dict[str, Any]],
        text_weight: float,
        vector_weight: float,
        k: int
    ) -> List[Dict[str, Any]]:
        """
        Combine and re-rank results from text and vector search.
        
        Uses normalized scores and weighted combination.
        
        Args:
            text_results: Results from text search
            vector_results: Results from vector search
            text_weight: Weight for text search scores
            vector_weight: Weight for vector search scores
            k: Number of final results to return
            
        Returns:
            Combined and re-ranked results
        """
        # If one search returned no results, return the other
        if not text_results and not vector_results:
            return []
        if not text_results:
            return vector_results[:k]
        if not vector_results:
            return text_results[:k]
        
        # Normalize scores to 0-1 range
        def normalize_scores(results: List[Dict[str, Any]]) -> Dict[str, float]:
            if not results:
                return {}
            
            if len(results) == 1:
                # If only one result, give it full score
                return {results[0]["id"]: 1.0}
            
            max_score = max(r["score"] for r in results)
            min_score = min(r["score"] for r in results)
            score_range = max_score - min_score
            
            if score_range == 0:
                # All scores are the same, give them equal weight
                return {r["id"]: 1.0 for r in results}
            
            return {
                r["id"]: (r["score"] - min_score) / score_range
                for r in results
            }
        
        text_scores = normalize_scores(text_results)
        vector_scores = normalize_scores(vector_results)
        
        # Combine scores
        combined_scores = {}
        all_ids = set(text_scores.keys()) | set(vector_scores.keys())
        
        for doc_id in all_ids:
            text_score = text_scores.get(doc_id, 0.0)
            vector_score = vector_scores.get(doc_id, 0.0)
            combined_scores[doc_id] = (
                text_weight * text_score + vector_weight * vector_score
            )
        
        # Create combined results with original scores preserved
        results_by_id = {}
        for result in text_results + vector_results:
            doc_id = result["id"]
            if doc_id not in results_by_id:
                results_by_id[doc_id] = result.copy()
                # Store both original score and combined score
                results_by_id[doc_id]["original_score"] = result["score"]
                results_by_id[doc_id]["score"] = combined_scores[doc_id]
        
        # Sort by combined score and return top k
        combined_results = sorted(
            results_by_id.values(),
            key=lambda x: x["score"],
            reverse=True
        )
        
        return combined_results[:k]
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check OpenSearch cluster health.
        
        Returns:
            Health status information
        """
        try:
            health = self.client.cluster.health()
            return {
                "status": health["status"],
                "cluster_name": health["cluster_name"],
                "number_of_nodes": health["number_of_nodes"],
                "active_shards": health["active_shards"],
            }
        except OpenSearchException as e:
            logger.error(f"Error checking health: {e}")
            return {"status": "error", "error": str(e)}


# Global OpenSearch service instance
opensearch_service = OpenSearchService()

