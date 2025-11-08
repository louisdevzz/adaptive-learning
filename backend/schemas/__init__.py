"""Schemas module for Pydantic validation models."""

from schemas.auth_schema import (
    GoogleLogin,
    PasswordChange,
    PasswordReset,
    PasswordResetConfirm,
    RefreshTokenRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from schemas.course_schema import (
    CourseCreate,
    CourseListResponse,
    CourseResponse,
    CourseUpdate,
    CourseWithModules,
)
from schemas.kp_schema import (
    KnowledgePointCreate,
    KnowledgePointResponse,
    KnowledgePointUpdate,
    KnowledgePointWithMastery,
)
from schemas.mastery_schema import (
    MasteryProgressRequest,
    MasteryRecommendation,
    MasteryRecordCreate,
    MasteryRecordResponse,
    MasteryRecordUpdate,
    UserProgressSummary,
)
from schemas.module_schema import (
    ModuleCreate,
    ModuleResponse,
    ModuleUpdate,
    ModuleWithSections,
)
from schemas.section_schema import (
    SectionCreate,
    SectionResponse,
    SectionUpdate,
    SectionWithKnowledgePoints,
)

__all__ = [
    # Auth
    "UserRegister",
    "UserLogin",
    "GoogleLogin",
    "TokenResponse",
    "RefreshTokenRequest",
    "UserResponse",
    "PasswordChange",
    "PasswordReset",
    "PasswordResetConfirm",
    # Course
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "CourseWithModules",
    "CourseListResponse",
    # Module
    "ModuleCreate",
    "ModuleUpdate",
    "ModuleResponse",
    "ModuleWithSections",
    # Section
    "SectionCreate",
    "SectionUpdate",
    "SectionResponse",
    "SectionWithKnowledgePoints",
    # Knowledge Point
    "KnowledgePointCreate",
    "KnowledgePointUpdate",
    "KnowledgePointResponse",
    "KnowledgePointWithMastery",
    # Mastery
    "MasteryRecordCreate",
    "MasteryRecordUpdate",
    "MasteryRecordResponse",
    "MasteryProgressRequest",
    "MasteryRecommendation",
    "UserProgressSummary",
]

# Rebuild models to resolve forward references
CourseWithModules.model_rebuild()
ModuleWithSections.model_rebuild()
SectionWithKnowledgePoints.model_rebuild()
