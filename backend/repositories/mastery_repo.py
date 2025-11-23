"""Mastery repository for tracking student learning progress."""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import Integer, and_, func
from sqlalchemy.orm import Session, selectinload

from models.student_mastery import StudentMastery
from repositories.base_repo import BaseRepository


class MasteryRepository(BaseRepository[StudentMastery]):
    """Repository for Student Mastery model."""

    def __init__(self, db: Session):
        """Initialize mastery repository."""
        super().__init__(StudentMastery, db)

    def get_by_user_and_kp(
        self, user_id: UUID | str, knowledge_point_id: UUID | str
    ) -> StudentMastery | None:
        """
        Get mastery record for a specific user and knowledge point.

        Args:
            user_id: User ID
            knowledge_point_id: Knowledge Point ID

        Returns:
            Mastery record or None if not found
        """
        normalized_user_id = self._normalize_id(user_id)
        normalized_kp_id = self._normalize_id(knowledge_point_id)
        return (
            self.db.query(StudentMastery)
            .filter(
                and_(
                    StudentMastery.student_id == normalized_user_id,
                    StudentMastery.knowledge_point_id == normalized_kp_id,
                )
            )
            .first()
        )

    def get_user_progress(self, user_id: UUID | str) -> list[StudentMastery]:
        """
        Get all mastery records for a user with eager loading of knowledge points.

        Args:
            user_id: User ID

        Returns:
            List of mastery records
        """
        normalized_user_id = self._normalize_id(user_id)
        return (
            self.db.query(StudentMastery)
            .filter(StudentMastery.student_id == normalized_user_id)
            .options(selectinload(StudentMastery.knowledge_point))
            .order_by(StudentMastery.updated_at.desc())
            .all()
        )

    def get_user_progress_summary_aggregated(self, user_id: UUID | str) -> dict:
        """
        Get aggregated progress summary using database queries instead of in-memory.

        Args:
            user_id: User ID

        Returns:
            Dictionary with aggregated progress data
        """
        normalized_user_id = self._normalize_id(user_id)

        # Base query
        base_query = self.db.query(StudentMastery).filter(
            StudentMastery.student_id == normalized_user_id
        )

        # Get all aggregations in one query
        result = self.db.query(
            func.count(StudentMastery.id).label('total'),
            func.sum(
                func.cast(StudentMastery.combined_mastery >= 80.0, Integer)
            ).label('mastered'),
            func.sum(
                func.cast(
                    and_(
                        StudentMastery.combined_mastery >= 35.0,
                        StudentMastery.combined_mastery < 80.0
                    ),
                    Integer
                )
            ).label('in_progress'),
            func.sum(
                func.cast(StudentMastery.combined_mastery < 35.0, Integer)
            ).label('not_started'),
            func.avg(StudentMastery.combined_mastery).label('avg_mastery'),
            func.sum(StudentMastery.total_time_spent).label('total_time'),
            func.max(StudentMastery.updated_at).label('last_activity')
        ).filter(
            StudentMastery.student_id == normalized_user_id
        ).first()

        if not result or result.total == 0:
            return {
                "total_knowledge_points": 0,
                "mastered_count": 0,
                "in_progress_count": 0,
                "not_started_count": 0,
                "overall_mastery": 0.0,
                "total_time_spent": 0,
                "last_activity": None,
            }

        return {
            "total_knowledge_points": result.total or 0,
            "mastered_count": result.mastered or 0,
            "in_progress_count": result.in_progress or 0,
            "not_started_count": result.not_started or 0,
            "overall_mastery": round(float(result.avg_mastery or 0), 2),
            "total_time_spent": result.total_time or 0,
            "last_activity": result.last_activity,
        }

    def get_by_mastery_level(
        self, user_id: UUID | str, min_level: float, max_level: float
    ) -> list[StudentMastery]:
        """
        Get mastery records within a mastery level range.

        Args:
            user_id: User ID
            min_level: Minimum mastery level (0.0 to 100.0)
            max_level: Maximum mastery level (0.0 to 100.0)

        Returns:
            List of mastery records
        """
        normalized_user_id = self._normalize_id(user_id)
        return (
            self.db.query(StudentMastery)
            .filter(
                and_(
                    StudentMastery.student_id == normalized_user_id,
                    StudentMastery.combined_mastery >= min_level,
                    StudentMastery.combined_mastery < max_level,
                )
            )
            .all()
        )

    def update_progress(
        self, user_id: UUID | str, knowledge_point_id: UUID | str, is_correct: bool, time_spent: int
    ) -> StudentMastery:
        """
        Update or create mastery record after a learning activity.

        Args:
            user_id: User ID
            knowledge_point_id: Knowledge Point ID
            is_correct: Whether the answer was correct
            time_spent: Time spent in seconds

        Returns:
            Updated or created mastery record
        """
        normalized_user_id = self._normalize_id(user_id)
        normalized_kp_id = self._normalize_id(knowledge_point_id)
        record = self.get_by_user_and_kp(normalized_user_id, normalized_kp_id)

        if record is None:
            # Create new record - need to get hierarchical IDs from KP
            from models.knowledge_point import KnowledgePoint
            kp = self.db.query(KnowledgePoint).filter(KnowledgePoint.id == normalized_kp_id).first()
            if not kp:
                raise ValueError(f"Knowledge point {normalized_kp_id} not found")

            record = StudentMastery(
                student_id=normalized_user_id,
                knowledge_point_id=normalized_kp_id,
                section_id=kp.section_id,
                module_id=kp.module_id,
                course_id=kp.course_id,
                skill_score=0.0,
                knowledge_score=0.0,
                attitude_score=0.0,
                combined_mastery=0.0,
                attempt_count=0,
                total_time_spent=0,
                is_started=True,
            )
            self.db.add(record)

        # Update metrics
        record.attempt_count += 1
        record.total_time_spent += time_spent
        record.last_assessed = datetime.now(timezone.utc)

        # Update skill score based on correctness (simplified)
        if is_correct:
            record.skill_score = min(100.0, record.skill_score + 5.0)
        else:
            record.skill_score = max(0.0, record.skill_score - 3.0)

        # Update combined mastery
        record.update_combined_mastery()

        self.db.commit()
        self.db.refresh(record)
        return record

    def get_recommendations(
        self, user_id: UUID | str, limit: int = 5
    ) -> list[tuple[StudentMastery, str, int]]:
        """
        Get learning recommendations based on mastery levels.
        Uses eager loading to avoid N+1 queries.

        Args:
            user_id: User ID
            limit: Maximum number of recommendations

        Returns:
            List of tuples (mastery_record, recommended_action, priority)
        """
        # Use get_user_progress which already has eager loading
        records = self.get_user_progress(user_id)
        recommendations: list[tuple[StudentMastery, str, int]] = []

        for record in records:
            if record.combined_mastery < 35.0:
                recommendations.append((record, "practice", 5))  # High priority
            elif record.combined_mastery < 65.0:
                recommendations.append((record, "review", 3))  # Medium priority
            elif record.combined_mastery < 80.0:
                recommendations.append((record, "reinforce", 2))  # Low priority

        # Sort by priority (descending) and mastery level (ascending)
        recommendations.sort(key=lambda x: (-x[2], x[0].combined_mastery))
        return recommendations[:limit]
