"""Service for generating text embeddings using OpenAI."""

from typing import List, Optional
import logging
from openai import OpenAI, OpenAIError
import tiktoken

from core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings using OpenAI API."""

    def __init__(self):
        """Initialize the embedding service."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured")
        
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_EMBEDDING_MODEL
        self.dimension = settings.OPENAI_EMBEDDING_DIMENSION
        
        # Initialize tokenizer for counting tokens
        try:
            self.encoding = tiktoken.encoding_for_model(self.model)
        except KeyError:
            # Fallback to cl100k_base encoding if model not found
            self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def count_tokens(self, text: str) -> int:
        """
        Count the number of tokens in a text.
        
        Args:
            text: The text to count tokens for
            
        Returns:
            Number of tokens
        """
        return len(self.encoding.encode(text))
    
    def truncate_text(self, text: str, max_tokens: int = 8191) -> str:
        """
        Truncate text to fit within token limit.
        
        Args:
            text: The text to truncate
            max_tokens: Maximum number of tokens (default 8191 for text-embedding-3-small)
            
        Returns:
            Truncated text
        """
        tokens = self.encoding.encode(text)
        if len(tokens) <= max_tokens:
            return text
        
        # Truncate and decode
        truncated_tokens = tokens[:max_tokens]
        return self.encoding.decode(truncated_tokens)
    
    async def generate_embedding(
        self,
        text: str,
        truncate: bool = True
    ) -> Optional[List[float]]:
        """
        Generate embedding vector for a single text.
        
        Args:
            text: The text to generate embedding for
            truncate: Whether to automatically truncate text if too long
            
        Returns:
            Embedding vector as list of floats, or None if error
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            return None
        
        try:
            # Count tokens before truncation
            original_tokens = self.count_tokens(text)
            
            # Truncate if needed
            if truncate:
                text = self.truncate_text(text)
            
            # Count actual tokens used
            tokens_used = self.count_tokens(text)
            
            # Calculate cost (text-embedding-3-small: $0.02 per 1M tokens)
            cost_usd = (tokens_used / 1_000_000) * 0.02
            
            # Generate embedding
            response = self.client.embeddings.create(
                input=text,
                model=self.model
            )
            
            embedding = response.data[0].embedding
            
            # Log detailed information
            logger.info(
                f"📊 Embedding generated | "
                f"Tokens: {tokens_used:,} "
                f"(original: {original_tokens:,}) | "
                f"Cost: ${cost_usd:.6f} | "
                f"Dimension: {len(embedding)}"
            )
            
            return embedding
            
        except OpenAIError as e:
            logger.error(f"OpenAI API error generating embedding: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error generating embedding: {e}")
            return None
    
    async def generate_embeddings_batch(
        self,
        texts: List[str],
        truncate: bool = True
    ) -> List[Optional[List[float]]]:
        """
        Generate embeddings for multiple texts in a batch.
        
        Args:
            texts: List of texts to generate embeddings for
            truncate: Whether to automatically truncate texts if too long
            
        Returns:
            List of embedding vectors (None for failed embeddings)
        """
        if not texts:
            return []
        
        try:
            # Filter and truncate texts
            processed_texts = []
            indices = []
            total_tokens = 0
            
            for i, text in enumerate(texts):
                if text and text.strip():
                    if truncate:
                        text = self.truncate_text(text)
                    processed_texts.append(text)
                    indices.append(i)
                    total_tokens += self.count_tokens(text)
            
            if not processed_texts:
                logger.warning("No valid texts provided for batch embedding")
                return [None] * len(texts)
            
            # Calculate cost
            cost_usd = (total_tokens / 1_000_000) * 0.02
            
            # Generate embeddings in batch
            response = self.client.embeddings.create(
                input=processed_texts,
                model=self.model
            )
            
            # Create result list with None for invalid inputs
            results: List[Optional[List[float]]] = [None] * len(texts)
            
            # Fill in successful embeddings
            for idx, embedding_data in zip(indices, response.data):
                results[idx] = embedding_data.embedding
            
            logger.info(
                f"📊 Batch embeddings generated | "
                f"Count: {len(processed_texts)} | "
                f"Total tokens: {total_tokens:,} | "
                f"Cost: ${cost_usd:.6f}"
            )
            return results
            
        except OpenAIError as e:
            logger.error(f"OpenAI API error generating batch embeddings: {e}")
            return [None] * len(texts)
        except Exception as e:
            logger.error(f"Unexpected error generating batch embeddings: {e}")
            return [None] * len(texts)
    
    async def generate_query_embedding(self, query: str) -> Optional[List[float]]:
        """
        Generate embedding for a search query.
        This is a convenience method that's semantically clearer for search queries.
        
        Args:
            query: The search query
            
        Returns:
            Embedding vector as list of floats, or None if error
        """
        return await self.generate_embedding(query, truncate=True)


# Global embedding service instance
embedding_service = EmbeddingService()

