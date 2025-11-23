"""Resource schemas for learning materials."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ResourceBase(BaseModel):
    """Base schema for Resource."""

    title: str = Field(..., min_length=1, description="Resource title")
    type: str = Field(
        default="article",
        pattern="^(video|article|document|interactive|external_link|slide)$",
        description="Resource type",
    )
    url: str = Field(..., min_length=1, description="Resource URL")
    description: Optional[str] = Field(None, description="Resource description")
    metadata: Optional[dict[str, Any]] = Field(
        None, description="Resource metadata (duration, author, tags, etc.)"
    )


class ResourceCreate(ResourceBase):
    """Schema for creating a new resource."""

    pass


class ResourceUpdate(BaseModel):
    """Schema for updating an existing resource."""

    title: Optional[str] = Field(None, min_length=1)
    type: Optional[str] = Field(None, pattern="^(video|article|document|interactive|external_link|slide)$")
    url: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class ResourceResponse(ResourceBase):
    """Schema for resource response."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
