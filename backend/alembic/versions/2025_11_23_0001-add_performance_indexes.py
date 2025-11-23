"""Add performance indexes for dashboard and mastery queries.

Revision ID: add_performance_indexes
Revises: 871042bcebd7
Create Date: 2025-11-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_performance_indexes'
down_revision: Union[str, None] = '871042bcebd7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add composite indexes for better query performance."""

    # Composite index for student mastery lookups with ordering
    # Used by: get_user_progress(), get_learning_recommendations()
    op.create_index(
        'idx_student_mastery_student_lookup',
        'student_mastery',
        ['student_id', 'combined_mastery', 'updated_at'],
        unique=False
    )

    # Index for mastery group filtering
    # Used by: get_user_progress_summary() aggregations
    op.create_index(
        'idx_student_mastery_student_group',
        'student_mastery',
        ['student_id', 'mastery_group'],
        unique=False
    )

    # Index for course-based mastery queries
    # Used by: course progress calculations
    op.create_index(
        'idx_student_mastery_course_lookup',
        'student_mastery',
        ['student_id', 'course_id', 'combined_mastery'],
        unique=False
    )


def downgrade() -> None:
    """Remove performance indexes."""
    op.drop_index('idx_student_mastery_course_lookup', table_name='student_mastery')
    op.drop_index('idx_student_mastery_student_group', table_name='student_mastery')
    op.drop_index('idx_student_mastery_student_lookup', table_name='student_mastery')
