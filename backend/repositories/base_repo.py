"""Base repository with common CRUD operations."""

from typing import Any, Generic, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from core.database import Base

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

    def get_by_id(self, id: UUID | str) -> Optional[ModelType]:
        """
        Get a single record by ID.

        Args:
            id: Record ID

        Returns:
            Model instance or None if not found
        """
        normalized_id = self._normalize_id(id)
        return self.db.query(self.model).filter(self.model.id == normalized_id).first()

    def get_all(
        self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None
    ) -> list[ModelType]:
        """
        Get all records with optional filtering and pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters to apply

        Returns:
            List of model instances
        """
        query = self.db.query(self.model)

        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)

        return query.offset(skip).limit(limit).all()

    def create(self, **kwargs: Any) -> ModelType:
        """
        Create a new record.

        Args:
            **kwargs: Field values for the new record

        Returns:
            Created model instance
        """
        db_obj = self.model(**kwargs)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: UUID | str, **kwargs: Any) -> Optional[ModelType]:
        """
        Update an existing record.

        Args:
            id: Record ID
            **kwargs: Fields to update

        Returns:
            Updated model instance or None if not found
        """
        db_obj = self.get_by_id(id)
        if db_obj is None:
            return None

        for key, value in kwargs.items():
            if hasattr(db_obj, key) and value is not None:
                setattr(db_obj, key, value)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: UUID | str) -> bool:
        """
        Delete a record.

        Args:
            id: Record ID

        Returns:
            True if deleted, False if not found
        """
        db_obj = self.get_by_id(id)
        if db_obj is None:
            return False

        self.db.delete(db_obj)
        self.db.commit()
        return True

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
