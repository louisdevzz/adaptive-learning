"""Models module for SQLAlchemy ORM models."""

from models.assessment_config import AssessmentConfig
from models.course import Course, DifficultyLevel
from models.enrollment import Enrollment, EnrollmentStatus
from models.exercise import Exercise, ExerciseDifficulty
from models.knowledge_point import KnowledgePoint, KnowledgePointType
from models.knowledge_point_prerequisite import KnowledgePointPrerequisite
from models.kp_exercise import KnowledgePointExercise
from models.kp_question import KnowledgePointQuestion
from models.kp_relation import KnowledgePointRelation, RelationType
from models.kp_resource import KnowledgePointResource
from models.mastery_history import MasteryHistory
from models.module import Module
from models.profile import Profile
from models.question import Question, QuestionDifficulty, QuestionType
from models.resource import Resource, ResourceType
from models.section import Section
from models.student_mastery import MasteryGroup, StudentMastery
from models.user import User

__all__ = [
    # User models
    "User",
    "Profile",
    # Course hierarchy models
    "Course",
    "DifficultyLevel",
    "Module",
    "Section",
    "KnowledgePoint",
    "KnowledgePointType",
    # Assessment models
    "Question",
    "QuestionType",
    "QuestionDifficulty",
    "Exercise",
    "ExerciseDifficulty",
    "Resource",
    "ResourceType",
    # Junction tables
    "KnowledgePointQuestion",
    "KnowledgePointExercise",
    "KnowledgePointResource",
    "KnowledgePointPrerequisite",
    "KnowledgePointRelation",
    "RelationType",
    "AssessmentConfig",
    # Mastery and progress models
    "StudentMastery",
    "MasteryGroup",
    "MasteryHistory",
    "Enrollment",
    "EnrollmentStatus",
]
