"""Mastery service for adaptive learning and progress tracking."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from repositories.kp_repo import KnowledgePointRepository
from repositories.mastery_repo import MasteryRepository
from schemas.mastery_schema import MasteryProgressRequest, MasteryRecommendation


class MasteryService:
    """Service for mastery tracking and adaptive learning."""

    def __init__(self, db: Session):
        """Initialize mastery service."""
        self.db = db
        self.mastery_repo = MasteryRepository(db)
        self.kp_repo = KnowledgePointRepository(db)

    def track_progress(self, user_id: UUID | str, progress_data: MasteryProgressRequest):
        """
        Track user's learning progress for a knowledge point.

        Args:
            user_id: User ID
            progress_data: Progress tracking data

        Returns:
            Updated mastery record
        """
        # Verify knowledge point exists
        kp = self.kp_repo.get_by_id(progress_data.knowledge_point_id)
        if not kp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Knowledge point not found",
            )

        # Update mastery record
        record = self.mastery_repo.update_progress(
            user_id=user_id,
            knowledge_point_id=progress_data.knowledge_point_id,
            is_correct=progress_data.is_correct,
            time_spent=progress_data.time_spent,
        )

        return record

    def get_user_mastery(self, user_id: UUID | str, knowledge_point_id: UUID | str):
        """Get user's mastery for a specific knowledge point."""
        record = self.mastery_repo.get_by_user_and_kp(user_id, knowledge_point_id)
        if not record:
            # Return empty record if no progress yet
            return {
                "mastery_level": 0.0,
                "attempts": 0,
                "mastery_category": "beginner",
            }
        return record

    def get_user_progress_summary(self, user_id: UUID | str):
        """Get overall progress summary for a user."""
        records = self.mastery_repo.get_user_progress(user_id)

        # Count by mastery category
        mastered = sum(1 for r in records if r.mastery_level >= settings.MASTERY_THRESHOLD_HIGH)
        in_progress = sum(
            1
            for r in records
            if settings.MASTERY_THRESHOLD_LOW
            <= r.mastery_level
            < settings.MASTERY_THRESHOLD_HIGH
        )
        beginner = sum(1 for r in records if r.mastery_level < settings.MASTERY_THRESHOLD_LOW)

        # Calculate overall mastery
        total_mastery = sum(r.mastery_level for r in records)
        overall_mastery = total_mastery / len(records) if records else 0.0

        # Total time spent
        total_time = sum(r.total_time_spent for r in records)

        # Last activity
        last_activity = max((r.last_practiced for r in records if r.last_practiced), default=None)

        return {
            "total_knowledge_points": len(records),
            "mastered_count": mastered,
            "in_progress_count": in_progress,
            "not_started_count": beginner,
            "overall_mastery": round(overall_mastery, 2),
            "total_time_spent": total_time,
            "last_activity": last_activity,
        }

    def get_learning_recommendations(self, user_id: UUID | str, limit: int = 5):
        """
        Get personalized learning recommendations based on mastery levels.

        Args:
            user_id: User ID
            limit: Maximum number of recommendations

        Returns:
            List of learning recommendations
        """
        recommendations_data = self.mastery_repo.get_recommendations(user_id, limit)

        recommendations = []
        for record, action, priority in recommendations_data:
            kp = self.kp_repo.get_by_id(record.knowledge_point_id)
            if kp:
                # Estimate time based on difficulty and current mastery
                base_time = 15  # minutes
                difficulty_multiplier = {"easy": 1.0, "medium": 1.5, "hard": 2.0}.get(
                    kp.difficulty or "medium", 1.5
                )
                mastery_multiplier = 1.0 + (1.0 - record.mastery_level)
                estimated_time = int(base_time * difficulty_multiplier * mastery_multiplier)

                recommendations.append(
                    MasteryRecommendation(
                        knowledge_point_id=kp.id,
                        title=kp.title,
                        current_mastery=record.mastery_level,
                        recommended_action=action,
                        priority=priority,
                        estimated_time=estimated_time,
                    )
                )

        return recommendations

    def get_weak_areas(self, user_id: UUID | str, threshold: float = 0.6):
        """
        Get knowledge points where user needs improvement.

        Args:
            user_id: User ID
            threshold: Mastery threshold below which areas are considered weak

        Returns:
            List of mastery records for weak areas
        """
        return self.mastery_repo.get_by_mastery_level(user_id, 0.0, threshold)
