"""Mastery repository for tracking student learning progress."""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_
from sqlalchemy.orm import Session

from models.mastery import MasteryRecord
from repositories.base_repo import BaseRepository


class MasteryRepository(BaseRepository[MasteryRecord]):
    """Repository for Mastery Record model."""

    def __init__(self, db: Session):
        """Initialize mastery repository."""
        super().__init__(MasteryRecord, db)

    def get_by_user_and_kp(
        self, user_id: UUID | str, knowledge_point_id: UUID | str
    ) -> MasteryRecord | None:
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
            self.db.query(MasteryRecord)
            .filter(
                and_(
                    MasteryRecord.user_id == normalized_user_id,
                    MasteryRecord.knowledge_point_id == normalized_kp_id,
                )
            )
            .first()
        )

    def get_user_progress(self, user_id: UUID | str) -> list[MasteryRecord]:
        """
        Get all mastery records for a user.

        Args:
            user_id: User ID

        Returns:
            List of mastery records
        """
        normalized_user_id = self._normalize_id(user_id)
        return (
            self.db.query(MasteryRecord)
            .filter(MasteryRecord.user_id == normalized_user_id)
            .order_by(MasteryRecord.updated_at.desc())
            .all()
        )

    def get_by_mastery_level(
        self, user_id: UUID | str, min_level: float, max_level: float
    ) -> list[MasteryRecord]:
        """
        Get mastery records within a mastery level range.

        Args:
            user_id: User ID
            min_level: Minimum mastery level (0.0 to 1.0)
            max_level: Maximum mastery level (0.0 to 1.0)

        Returns:
            List of mastery records
        """
        normalized_user_id = self._normalize_id(user_id)
        return (
            self.db.query(MasteryRecord)
            .filter(
                and_(
                    MasteryRecord.user_id == normalized_user_id,
                    MasteryRecord.mastery_level >= min_level,
                    MasteryRecord.mastery_level < max_level,
                )
            )
            .all()
        )

    def update_progress(
        self, user_id: UUID | str, knowledge_point_id: UUID | str, is_correct: bool, time_spent: int
    ) -> MasteryRecord:
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
            # Create new record
            record = MasteryRecord(
                user_id=normalized_user_id,
                knowledge_point_id=normalized_kp_id,
                mastery_level=0.0,
                attempts=0,
                correct_answers=0,
                incorrect_answers=0,
                total_time_spent=0,
            )
            self.db.add(record)

        # Update metrics
        record.attempts += 1
        if is_correct:
            record.correct_answers += 1
        else:
            record.incorrect_answers += 1

        record.total_time_spent += time_spent
        record.last_practiced = datetime.now(timezone.utc)

        # Calculate new mastery level using exponential moving average
        # Gives more weight to recent performance
        success_rate = record.correct_answers / (record.correct_answers + record.incorrect_answers)

        # Weight factor (0.0 to 1.0) - higher means more weight on current performance
        weight = 0.3
        record.mastery_level = (weight * success_rate) + ((1 - weight) * record.mastery_level)

        # Ensure mastery level stays within bounds
        record.mastery_level = max(0.0, min(1.0, record.mastery_level))

        self.db.commit()
        self.db.refresh(record)
        return record

    def get_recommendations(
        self, user_id: UUID | str, limit: int = 5
    ) -> list[tuple[MasteryRecord, str, int]]:
        """
        Get learning recommendations based on mastery levels.

        Args:
            user_id: User ID
            limit: Maximum number of recommendations

        Returns:
            List of tuples (mastery_record, recommended_action, priority)
        """
        records = self.get_user_progress(user_id)
        recommendations: list[tuple[MasteryRecord, str, int]] = []

        for record in records:
            if record.mastery_level < 0.4:
                recommendations.append((record, "practice", 5))  # High priority
            elif record.mastery_level < 0.7:
                recommendations.append((record, "review", 3))  # Medium priority
            elif record.mastery_level < 0.9:
                recommendations.append((record, "reinforce", 2))  # Low priority

        # Sort by priority (descending) and mastery level (ascending)
        recommendations.sort(key=lambda x: (-x[2], x[0].mastery_level))
        return recommendations[:limit]
