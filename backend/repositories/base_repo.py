"""Base repository with common CRUD operations."""

import logging
from typing import Any, Generic, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.orm.strategy_options import _AbstractLoad

from core.config import settings
from core.database import Base
from core.errors import errors

# Setup logger
logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository class with common CRUD operations."""

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize repository.

        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    @staticmethod
    def _normalize_id(id_value: UUID | str) -> UUID:
        """Normalize incoming ID values to UUID."""
        if isinstance(id_value, UUID):
            return id_value
        return UUID(str(id_value))

    def get_by_id(
        self, 
        id: UUID | str, 
        eager_load: Optional[list[_AbstractLoad]] = None
    ) -> Optional[ModelType]:
        """
        Get a single record by ID with optional eager loading.

        Args:
            id: Record ID
            eager_load: Optional list of eager loading options to prevent N+1 queries
                       Example: [joinedload(Model.relationship)]

        Returns:
            Model instance or None if not found
            
        Note:
            Use eager_load to prevent N+1 query problems when accessing relationships.
        """
        normalized_id = self._normalize_id(id)
        query = self.db.query(self.model).filter(self.model.id == normalized_id)
        
        # Apply eager loading options
        if eager_load:
            for load_option in eager_load:
                query = query.options(load_option)
        
        return query.first()

    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        filters: Optional[dict[str, Any]] = None,
        eager_load: Optional[list[_AbstractLoad]] = None
    ) -> list[ModelType]:
        """
        Get all records with optional filtering, pagination, and eager loading.

        Args:
            skip: Number of records to skip (must be non-negative)
            limit: Maximum number of records to return (capped at MAX_PAGE_SIZE)
            filters: Optional filters to apply
            eager_load: Optional list of eager loading options to prevent N+1 queries
                       Example: [joinedload(Model.relationship)]

        Returns:
            List of model instances
            
        Note:
            - Pagination is enforced: limit is capped at MAX_PAGE_SIZE (100)
            - Use eager_load to prevent N+1 query problems when accessing relationships
            
        Raises:
            ValueError: If skip is negative
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError(errors.VALIDATION_SKIP_NEGATIVE)
        
        if limit < 0:
            raise ValueError(errors.VALIDATION_LIMIT_NEGATIVE)
        
        # Enforce maximum page size to prevent excessive data requests
        limit = min(limit, settings.MAX_PAGE_SIZE)
        
        query = self.db.query(self.model)

        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        
        # Apply eager loading options to prevent N+1 queries
        if eager_load:
            for load_option in eager_load:
                query = query.options(load_option)

        return query.offset(skip).limit(limit).all()

    def create(self, **kwargs: Any) -> ModelType:
        """
        Create a new record with proper error handling.

        Args:
            **kwargs: Field values for the new record

        Returns:
            Created model instance
            
        Raises:
            SQLAlchemyError: If database operation fails
        """
        try:
            db_obj = self.model(**kwargs)
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(
                f"Failed to create {self.model.__name__}: {e}",
                exc_info=True
            )
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                f"Unexpected error creating {self.model.__name__}: {e}",
                exc_info=True
            )
            raise

    def update(self, id: UUID | str, **kwargs: Any) -> Optional[ModelType]:
        """
        Update an existing record with proper error handling.

        Args:
            id: Record ID
            **kwargs: Fields to update

        Returns:
            Updated model instance or None if not found
            
        Raises:
            SQLAlchemyError: If database operation fails
        """
        try:
            db_obj = self.get_by_id(id)
            if db_obj is None:
                return None

            for key, value in kwargs.items():
                if hasattr(db_obj, key) and value is not None:
                    setattr(db_obj, key, value)

            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(
                f"Failed to update {self.model.__name__} with id {id}: {e}",
                exc_info=True
            )
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                f"Unexpected error updating {self.model.__name__} with id {id}: {e}",
                exc_info=True
            )
            raise

    def delete(self, id: UUID | str) -> bool:
        """
        Delete a record with proper error handling.

        Args:
            id: Record ID

        Returns:
            True if deleted, False if not found
            
        Raises:
            SQLAlchemyError: If database operation fails
        """
        try:
            db_obj = self.get_by_id(id)
            if db_obj is None:
                return False

            self.db.delete(db_obj)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(
                f"Failed to delete {self.model.__name__} with id {id}: {e}",
                exc_info=True
            )
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                f"Unexpected error deleting {self.model.__name__} with id {id}: {e}",
                exc_info=True
            )
            raise

    def count(self, filters: Optional[dict[str, Any]] = None) -> int:
        """
        Count records with optional filtering.

        Args:
            filters: Optional filters to apply

        Returns:
            Number of records
        """
        query = self.db.query(self.model)

        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)

        return query.count()

    def exists(self, id: UUID | str) -> bool:
        """
        Check if a record exists.

        Args:
            id: Record ID

        Returns:
            True if exists, False otherwise
        """
        normalized_id = self._normalize_id(id)
        return (
            self.db.query(self.model).filter(self.model.id == normalized_id).first()
            is not None
        )
