"""Service for semantic search operations combining embeddings and OpenSearch."""

from typing import List, Dict, Any, Optional
import logging
from sqlalchemy.orm import Session

from services.embedding_service import embedding_service
from services.opensearch_service import opensearch_service
from repositories.course_repo import CourseRepository
from repositories.module_repo import ModuleRepository
from repositories.section_repo import SectionRepository
from repositories.kp_repo import KnowledgePointRepository

logger = logging.getLogger(__name__)


class SearchService:
    """Service for semantic search operations."""

    def __init__(self):
        """Initialize search service."""
        self.embedding_service = embedding_service
        self.opensearch_service = opensearch_service
    
    async def initialize_indices(self) -> Dict[str, bool]:
        """
        Initialize all OpenSearch indices.
        
        Returns:
            Dictionary mapping content types to initialization success
        """
        return await self.opensearch_service.create_all_indices()
    
    async def index_course(
        self,
        db: Session,
        course_id: str
    ) -> bool:
        """
        Index a course in OpenSearch.
        
        Args:
            db: Database session
            course_id: Course ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"🔍 Starting indexing for course {course_id}")
            
            # Get course from database
            course_repo = CourseRepository(db)
            course = course_repo.get_by_id(course_id)
            
            if not course:
                logger.error(f"❌ Course {course_id} not found in database")
                return False
            
            # Prepare content for embedding
            content = f"{course.title}\n{course.description or ''}"
            content_length = len(content)
            
            logger.info(
                f"📝 Course content prepared | "
                f"Title: '{course.title}' | "
                f"Content length: {content_length} chars"
            )
            
            # Generate embedding
            embedding = await self.embedding_service.generate_embedding(content)
            
            if not embedding:
                logger.error(f"❌ Failed to generate embedding for course {course_id}")
                return False
            
            # Prepare metadata
            metadata = {
                "course_id": str(course.id),
                "difficulty": course.difficulty_level,
                "category": "course",
            }
            
            logger.info(f"💾 Indexing course into OpenSearch...")
            
            # Index in OpenSearch
            result = await self.opensearch_service.index_document(
                content_type="courses",
                doc_id=str(course.id),
                title=course.title,
                content=content,
                embedding=embedding,
                description=course.description,
                metadata=metadata
            )
            
            if result:
                logger.info(f"✅ Successfully indexed course {course_id} into OpenSearch")
            else:
                logger.error(f"❌ Failed to index course {course_id} into OpenSearch")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error indexing course {course_id}: {e}")
            return False
    
    async def index_module(
        self,
        db: Session,
        module_id: str
    ) -> bool:
        """
        Index a module in OpenSearch.
        
        Args:
            db: Database session
            module_id: Module ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"🔍 Starting indexing for module {module_id}")
            
            # Get module from database
            module_repo = ModuleRepository(db)
            module = module_repo.get_by_id(module_id)
            
            if not module:
                logger.error(f"❌ Module {module_id} not found in database")
                return False
            
            # Prepare content for embedding
            content = f"{module.title}\n{module.description or ''}"
            
            logger.info(f"📝 Module: '{module.title}' | Content: {len(content)} chars")
            
            # Generate embedding
            embedding = await self.embedding_service.generate_embedding(content)
            
            if not embedding:
                logger.error(f"❌ Failed to generate embedding for module {module_id}")
                return False
            
            # Prepare metadata
            metadata = {
                "course_id": str(module.course_id),
                "module_id": str(module.id),
                "category": "module",
            }
            
            logger.info(f"💾 Indexing module into OpenSearch...")
            
            # Index in OpenSearch
            result = await self.opensearch_service.index_document(
                content_type="modules",
                doc_id=str(module.id),
                title=module.title,
                content=content,
                embedding=embedding,
                description=module.description,
                metadata=metadata
            )
            
            if result:
                logger.info(f"✅ Successfully indexed module {module_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error indexing module {module_id}: {e}")
            return False
    
    async def index_section(
        self,
        db: Session,
        section_id: str
    ) -> bool:
        """
        Index a section in OpenSearch.
        
        Args:
            db: Database session
            section_id: Section ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"🔍 Starting indexing for section {section_id}")
            
            # Get section from database
            section_repo = SectionRepository(db)
            section = section_repo.get_by_id(section_id)
            
            if not section:
                logger.error(f"❌ Section {section_id} not found in database")
                return False
            
            # Prepare content for embedding
            content = f"{section.title}\n{section.content or ''}"
            
            logger.info(f"📝 Section: '{section.title}' | Content: {len(content)} chars")
            
            # Generate embedding
            embedding = await self.embedding_service.generate_embedding(content)
            
            if not embedding:
                logger.error(f"❌ Failed to generate embedding for section {section_id}")
                return False
            
            # Prepare metadata
            metadata = {
                "course_id": str(section.module.course_id) if section.module else None,
                "module_id": str(section.module_id),
                "section_id": str(section.id),
                "content_type": section.content_type,
                "category": "section",
            }
            
            logger.info(f"💾 Indexing section into OpenSearch...")
            
            # Index in OpenSearch
            result = await self.opensearch_service.index_document(
                content_type="sections",
                doc_id=str(section.id),
                title=section.title,
                content=content,
                embedding=embedding,
                description=section.content[:200] if section.content else "",
                metadata=metadata
            )
            
            if result:
                logger.info(f"✅ Successfully indexed section {section_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error indexing section {section_id}: {e}")
            return False
    
    async def index_knowledge_point(
        self,
        db: Session,
        kp_id: str
    ) -> bool:
        """
        Index a knowledge point in OpenSearch.
        
        Args:
            db: Database session
            kp_id: Knowledge point ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"🔍 Starting indexing for knowledge point {kp_id}")
            
            # Get knowledge point from database
            kp_repo = KnowledgePointRepository(db)
            kp = kp_repo.get_by_id(kp_id)
            
            if not kp:
                logger.error(f"❌ Knowledge point {kp_id} not found in database")
                return False
            
            # Prepare content for embedding
            content = f"{kp.title}\n{kp.description or ''}\n{kp.content or ''}"
            
            logger.info(f"📝 KP: '{kp.title}' | Content: {len(content)} chars")
            
            # Generate embedding
            embedding = await self.embedding_service.generate_embedding(content)
            
            if not embedding:
                logger.error(f"❌ Failed to generate embedding for KP {kp_id}")
                return False
            
            # Prepare metadata
            metadata = {
                "section_id": str(kp.section_id),
                "difficulty": kp.difficulty,
                "category": "knowledge_point",
            }
            
            if kp.section and kp.section.module:
                metadata["module_id"] = str(kp.section.module_id)
                metadata["course_id"] = str(kp.section.module.course_id)
            
            logger.info(f"💾 Indexing knowledge point into OpenSearch...")
            
            # Index in OpenSearch
            result = await self.opensearch_service.index_document(
                content_type="knowledge_points",
                doc_id=str(kp.id),
                title=kp.title,
                content=content,
                embedding=embedding,
                description=kp.description[:200] if kp.description else "",
                metadata=metadata
            )
            
            if result:
                logger.info(f"✅ Successfully indexed knowledge point {kp_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error indexing knowledge point {kp_id}: {e}")
            return False
    
    async def search(
        self,
        query: str,
        content_types: Optional[List[str]] = None,
        k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        use_hybrid: bool = True
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Perform semantic search across content types.
        
        Args:
            query: Search query
            content_types: List of content types to search (default: all)
            k: Number of results per content type
            filters: Optional metadata filters
            use_hybrid: Whether to use hybrid search (text + vector)
            
        Returns:
            Dictionary mapping content types to search results
        """
        if not content_types:
            content_types = ["courses", "modules", "sections", "knowledge_points"]
        
        # Generate query embedding
        query_embedding = await self.embedding_service.generate_query_embedding(query)
        
        if not query_embedding:
            logger.error("Failed to generate query embedding")
            return {}
        
        # Search across content types
        results = {}
        
        for content_type in content_types:
            try:
                if use_hybrid:
                    # Hybrid search (text + vector)
                    search_results = await self.opensearch_service.hybrid_search(
                        content_type=content_type,
                        query_text=query,
                        query_embedding=query_embedding,
                        k=k,
                        filters=filters
                    )
                else:
                    # Pure vector search
                    search_results = await self.opensearch_service.vector_search(
                        content_type=content_type,
                        query_embedding=query_embedding,
                        k=k,
                        filters=filters
                    )
                
                results[content_type] = search_results
                
            except Exception as e:
                logger.error(f"Error searching {content_type}: {e}")
                results[content_type] = []
        
        return results
    
    async def search_by_content_type(
        self,
        content_type: str,
        query: str,
        k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        use_hybrid: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search within a specific content type.
        
        Args:
            content_type: Content type to search
            query: Search query
            k: Number of results
            filters: Optional metadata filters
            use_hybrid: Whether to use hybrid search
            
        Returns:
            List of search results
        """
        results = await self.search(
            query=query,
            content_types=[content_type],
            k=k,
            filters=filters,
            use_hybrid=use_hybrid
        )
        
        return results.get(content_type, [])
    
    async def find_similar(
        self,
        content_type: str,
        doc_id: str,
        k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar documents to a given document.
        
        Args:
            content_type: Content type
            doc_id: Document ID
            k: Number of similar documents to return
            
        Returns:
            List of similar documents
        """
        try:
            # Get document from OpenSearch
            index_name = self.opensearch_service.indices.get(content_type)
            
            if not index_name:
                logger.error(f"Invalid content type: {content_type}")
                return []
            
            doc = self.opensearch_service.client.get(
                index=index_name,
                id=doc_id
            )
            
            embedding = doc["_source"]["embedding"]
            
            # Search for similar documents
            return await self.opensearch_service.vector_search(
                content_type=content_type,
                query_embedding=embedding,
                k=k + 1  # +1 to exclude self
            )
            
        except Exception as e:
            logger.error(f"Error finding similar documents: {e}")
            return []
    
    async def get_recommendations(
        self,
        db: Session,
        user_id: str,
        k: int = 10
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get personalized content recommendations for a user.
        
        This could be based on their mastery level, learning history, etc.
        
        Args:
            db: Database session
            user_id: User ID
            k: Number of recommendations per type
            
        Returns:
            Dictionary of recommended content by type
        """
        # TODO: Implement based on user's mastery and learning history
        # For now, return empty recommendations
        logger.info(f"Getting recommendations for user {user_id}")
        return {}
    
    async def reindex_all(self, db: Session) -> Dict[str, int]:
        """
        Reindex all content from database to OpenSearch.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with counts of indexed items per type
        """
        results = {
            "courses": 0,
            "modules": 0,
            "sections": 0,
            "knowledge_points": 0
        }
        
        try:
            # Index all courses
            course_repo = CourseRepository(db)
            courses = course_repo.get_all(skip=0, limit=1000)
            
            for course in courses:
                if await self.index_course(db, str(course.id)):
                    results["courses"] += 1
            
            # Index all modules
            module_repo = ModuleRepository(db)
            modules = module_repo.get_all(skip=0, limit=10000)
            
            for module in modules:
                if await self.index_module(db, str(module.id)):
                    results["modules"] += 1
            
            # Index all sections
            section_repo = SectionRepository(db)
            sections = section_repo.get_all(skip=0, limit=10000)
            
            for section in sections:
                if await self.index_section(db, str(section.id)):
                    results["sections"] += 1
            
            # Index all knowledge points
            kp_repo = KnowledgePointRepository(db)
            kps = kp_repo.get_all(skip=0, limit=10000)
            
            for kp in kps:
                if await self.index_knowledge_point(db, str(kp.id)):
                    results["knowledge_points"] += 1
            
            logger.info(f"Reindexing completed: {results}")
            return results
            
        except Exception as e:
            logger.error(f"Error during reindexing: {e}")
            return results


# Global search service instance
search_service = SearchService()

