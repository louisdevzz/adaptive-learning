"""change json fields to json type

Revision ID: change_json_fields_001
Revises: add_fk_indexes_001
Create Date: 2025-11-09 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'change_json_fields_001'
down_revision: Union[str, None] = 'add_fk_indexes_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Change prerequisites and tags columns from Text to JSON type.
    
    This provides better type safety and validation for JSON data.
    """
    # Convert prerequisites from Text to JSON
    # First, handle existing data by converting valid JSON strings
    op.execute("""
        UPDATE knowledge_points 
        SET prerequisites = CASE 
            WHEN prerequisites IS NULL THEN NULL
            WHEN prerequisites = '' THEN NULL
            WHEN prerequisites::text ~ '^\\s*\\[.*\\]\\s*$' THEN prerequisites::jsonb
            ELSE '[]'::jsonb
        END::text
        WHERE prerequisites IS NOT NULL
    """)
    
    # Convert tags from Text to JSON  
    op.execute("""
        UPDATE knowledge_points 
        SET tags = CASE 
            WHEN tags IS NULL THEN NULL
            WHEN tags = '' THEN NULL
            WHEN tags::text ~ '^\\s*\\[.*\\]\\s*$' THEN tags::jsonb
            ELSE '[]'::jsonb
        END::text
        WHERE tags IS NOT NULL
    """)
    
    # Now alter the column types
    op.alter_column(
        'knowledge_points',
        'prerequisites',
        existing_type=sa.Text(),
        type_=postgresql.JSON(astext_type=sa.Text()),
        existing_nullable=True,
        postgresql_using='prerequisites::jsonb'
    )
    
    op.alter_column(
        'knowledge_points',
        'tags',
        existing_type=sa.Text(),
        type_=postgresql.JSON(astext_type=sa.Text()),
        existing_nullable=True,
        postgresql_using='tags::jsonb'
    )


def downgrade() -> None:
    """
    Revert JSON columns back to Text type.
    """
    # Convert back to Text
    op.alter_column(
        'knowledge_points',
        'prerequisites',
        existing_type=postgresql.JSON(astext_type=sa.Text()),
        type_=sa.Text(),
        existing_nullable=True,
        postgresql_using='prerequisites::text'
    )
    
    op.alter_column(
        'knowledge_points',
        'tags',
        existing_type=postgresql.JSON(astext_type=sa.Text()),
        type_=sa.Text(),
        existing_nullable=True,
        postgresql_using='tags::text'
    )

