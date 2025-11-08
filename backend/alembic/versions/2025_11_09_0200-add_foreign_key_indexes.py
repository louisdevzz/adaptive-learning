"""Add foreign key indexes for improved query performance

Revision ID: add_fk_indexes_001
Revises: 15d298c7cdb5
Create Date: 2025-11-09 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_fk_indexes_001'
down_revision: Union[str, None] = '15d298c7cdb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add indexes on foreign key columns to improve query performance.
    
    These indexes significantly speed up:
    - JOIN operations between related tables
    - Queries filtering by foreign key values
    - CASCADE delete operations
    - Relationship loading in SQLAlchemy
    """
    # Add index on modules.course_id for faster course → modules queries
    op.create_index(
        'ix_modules_course_id',
        'modules',
        ['course_id'],
        unique=False
    )
    
    # Add index on sections.module_id for faster module → sections queries
    op.create_index(
        'ix_sections_module_id',
        'sections',
        ['module_id'],
        unique=False
    )
    
    # Add index on knowledge_points.section_id for faster section → knowledge points queries
    op.create_index(
        'ix_knowledge_points_section_id',
        'knowledge_points',
        ['section_id'],
        unique=False
    )
    
    # Add index on mastery_records.user_id for faster user → mastery records queries
    op.create_index(
        'ix_mastery_records_user_id',
        'mastery_records',
        ['user_id'],
        unique=False
    )
    
    # Add index on mastery_records.knowledge_point_id for faster KP → mastery records queries
    op.create_index(
        'ix_mastery_records_knowledge_point_id',
        'mastery_records',
        ['knowledge_point_id'],
        unique=False
    )
    
    # Add composite index on mastery_records for common queries
    # This helps queries that filter by both user_id and last_practiced
    op.create_index(
        'ix_mastery_records_user_last_practiced',
        'mastery_records',
        ['user_id', 'last_practiced'],
        unique=False
    )


def downgrade() -> None:
    """Remove the foreign key indexes."""
    # Drop composite index
    op.drop_index('ix_mastery_records_user_last_practiced', table_name='mastery_records')
    
    # Drop foreign key indexes
    op.drop_index('ix_mastery_records_knowledge_point_id', table_name='mastery_records')
    op.drop_index('ix_mastery_records_user_id', table_name='mastery_records')
    op.drop_index('ix_knowledge_points_section_id', table_name='knowledge_points')
    op.drop_index('ix_sections_module_id', table_name='sections')
    op.drop_index('ix_modules_course_id', table_name='modules')

