"""Admin API endpoints for system monitoring and management."""

from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from core.database import get_db, get_pool_status, log_pool_status
from core.errors import errors
from models.user import User, UserRole
from schemas.user_schema import (
    ResetPasswordRequest,
    UserCreateRequest,
    UserDetailResponse,
    UserListResponse,
    UserStatsResponse,
    UserUpdateRequest,
)
from services.user_service import UserService

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """
    Dependency to require admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if they are an admin
        
    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=errors.AUTH_ADMIN_REQUIRED,
        )
    return current_user


@router.get("/pool-status", response_model=dict)
def get_connection_pool_status(
    current_user: Annotated[User, Depends(require_admin)],
):
    """
    Get detailed connection pool status and metrics.
    
    Requires admin role.
    
    Returns:
        Detailed pool statistics including:
        - Current pool size
        - Connections in use (checked out)
        - Idle connections (checked in)
        - Overflow connections
        - Pool limits and configuration
        - Utilization percentage
        - Health indicators
    """
    # Log pool status when accessed by admin
    log_pool_status()
    
    status = get_pool_status()
    
    return {
        "pool_metrics": {
            "current_state": {
                "size": status["size"],
                "checked_out": status["checked_out"],
                "checked_in": status["checked_in"],
                "overflow": status["overflow"],
                "total_connections": status["total_connections"],
            },
            "limits": {
                "pool_size": status["pool_size_limit"],
                "max_overflow": status["overflow_limit"],
                "total_limit": status["total_limit"],
            },
            "health": {
                "utilization_percent": status["utilization_percent"],
                "is_exhausted": status["is_exhausted"],
                "status": (
                    "critical" if status["is_exhausted"]
                    else "warning" if status["utilization_percent"] > 80
                    else "healthy"
                ),
            },
        },
        "recommendations": _get_pool_recommendations(status),
    }


def _get_pool_recommendations(status: dict) -> list[str]:
    """
    Generate recommendations based on pool status.

    Args:
        status: Pool status dictionary

    Returns:
        List of recommendations
    """
    recommendations = []

    if status["is_exhausted"]:
        recommendations.append(
            "CRITICAL: Pool is exhausted. Consider increasing DB_POOL_SIZE "
            "or DB_MAX_OVERFLOW in configuration."
        )
        recommendations.append(
            "Check for connection leaks or long-running queries that are not "
            "releasing connections."
        )
    elif status["utilization_percent"] > 80:
        recommendations.append(
            "WARNING: Pool utilization is high (>80%). Monitor for potential "
            "capacity issues."
        )
        recommendations.append(
            "Consider reviewing query performance and connection handling."
        )
    elif status["utilization_percent"] > 50:
        recommendations.append(
            "Pool utilization is moderate. Continue monitoring during peak loads."
        )
    else:
        recommendations.append(
            "Pool health is good. Current configuration appears adequate."
        )

    # Check for idle overflow connections
    if status["overflow"] > 0 and status["checked_out"] < status["pool_size_limit"]:
        recommendations.append(
            f"There are {status['overflow']} overflow connections but only "
            f"{status['checked_out']} connections in use. This may indicate "
            "a previous spike in demand."
        )

    return recommendations


# ============== User Management Endpoints ==============

@router.get("/users", response_model=UserListResponse)
def get_users(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by email or username"),
):
    """
    Get paginated list of users (admin only).

    Supports filtering by role, active status, and search.
    """
    user_service = UserService(db)
    return user_service.get_users(
        page=page,
        page_size=page_size,
        role=role,
        is_active=is_active,
        search=search,
    )


@router.get("/users/stats", response_model=UserStatsResponse)
def get_user_stats(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Get user statistics (admin only).

    Returns counts by role, active/inactive users, and new users this month.
    """
    user_service = UserService(db)
    return user_service.get_user_stats()


@router.get("/users/{user_id}", response_model=UserDetailResponse)
def get_user(
    user_id: UUID,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Get user by ID (admin only).
    """
    user_service = UserService(db)
    return user_service.get_user_by_id(user_id)


@router.post("/users", response_model=UserDetailResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreateRequest,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Create a new user (admin only).
    """
    user_service = UserService(db)
    return user_service.create_user(data)


@router.put("/users/{user_id}", response_model=UserDetailResponse)
def update_user(
    user_id: UUID,
    data: UserUpdateRequest,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Update user (admin only).
    """
    user_service = UserService(db)
    return user_service.update_user(user_id, data)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Delete user (admin only).
    """
    user_service = UserService(db)
    user_service.delete_user(user_id)
    return None


@router.post("/users/{user_id}/toggle-status", response_model=UserDetailResponse)
def toggle_user_status(
    user_id: UUID,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Toggle user active status (admin only).
    """
    user_service = UserService(db)
    return user_service.toggle_user_status(user_id)


@router.post("/users/{user_id}/reset-password", response_model=UserDetailResponse)
def reset_user_password(
    user_id: UUID,
    data: ResetPasswordRequest,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Reset user password (admin only).

    Admin can reset any user's password without requiring the old password.
    """
    user_service = UserService(db)
    return user_service.reset_password(user_id, data.new_password)

