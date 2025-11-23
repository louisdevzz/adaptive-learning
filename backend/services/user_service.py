"""User service for admin user management."""

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.errors import errors
from core.security import get_password_hash
from models.user import User, UserRole
from models.profile import Profile
from repositories.user_repo import UserRepository
from schemas.user_schema import UserCreateRequest, UserUpdateRequest

# Setup logger
logger = logging.getLogger(__name__)


class UserService:
    """Service for user management operations."""

    def __init__(self, db: Session):
        """Initialize user service."""
        self.db = db
        self.user_repo = UserRepository(db)

    def get_users(
        self,
        page: int = 1,
        page_size: int = 20,
        role: Optional[UserRole] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> dict:
        """
        Get paginated list of users.

        Args:
            page: Page number
            page_size: Items per page
            role: Filter by role
            is_active: Filter by active status
            search: Search by email or username

        Returns:
            Dict with users and pagination info
        """
        query = self.db.query(User)

        # Apply filters
        if role:
            query = query.filter(User.role == role)
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (User.email.ilike(search_pattern)) |
                (User.username.ilike(search_pattern))
            )

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()

        # Map users with profile data
        items = []
        for user in users:
            user_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "full_name": user.profile.full_name if user.profile else None,
                "meta_data": user.profile.meta_data if user.profile else None,
            }
            items.append(user_data)

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    def get_user_by_id(self, user_id: UUID) -> dict:
        """
        Get user by ID with profile data.

        Args:
            user_id: User ID

        Returns:
            User data with profile

        Raises:
            HTTPException: If user not found
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.USER_NOT_FOUND,
            )

        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "full_name": user.profile.full_name if user.profile else None,
            "image": user.profile.image if user.profile else None,
            "meta_data": user.profile.meta_data if user.profile else None,
        }

    def get_user_stats(self) -> dict:
        """
        Get user statistics.

        Returns:
            User statistics
        """
        # Get counts by role
        total_users = self.db.query(func.count(User.id)).scalar() or 0
        total_students = self.db.query(func.count(User.id)).filter(User.role == UserRole.STUDENT).scalar() or 0
        total_teachers = self.db.query(func.count(User.id)).filter(User.role == UserRole.TEACHER).scalar() or 0
        total_parents = self.db.query(func.count(User.id)).filter(User.role == UserRole.PARENT).scalar() or 0
        total_admins = self.db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN).scalar() or 0

        # Active/inactive counts
        active_users = self.db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
        inactive_users = total_users - active_users

        # New users this month
        now = datetime.now(timezone.utc)
        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = self.db.query(func.count(User.id)).filter(
            User.created_at >= first_day_of_month
        ).scalar() or 0

        return {
            "total_users": total_users,
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_parents": total_parents,
            "total_admins": total_admins,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "new_users_this_month": new_users_this_month,
        }

    def create_user(self, data: UserCreateRequest) -> dict:
        """
        Create a new user (admin only).

        Args:
            data: User creation data

        Returns:
            Created user data

        Raises:
            HTTPException: If email or username already exists
        """
        # Check if email exists
        if self.user_repo.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=errors.USER_EMAIL_EXISTS,
            )

        # Check if username exists
        if self.user_repo.get_by_username(data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=errors.USER_USERNAME_EXISTS,
            )

        # Hash password
        hashed_password = get_password_hash(data.password)

        # Create user with profile
        user = self.user_repo.create_user(
            email=data.email,
            username=data.username,
            hash_password=hashed_password,
            full_name=data.full_name,
            role=data.role.value,
            meta_data=data.meta_data,
        )

        logger.info(f"Admin created new user: {user.id}")

        return self.get_user_by_id(user.id)

    def update_user(self, user_id: UUID, data: UserUpdateRequest) -> dict:
        """
        Update user (admin only).

        Args:
            user_id: User ID
            data: Update data

        Returns:
            Updated user data

        Raises:
            HTTPException: If user not found or validation fails
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.USER_NOT_FOUND,
            )

        # Check email uniqueness
        if data.email and data.email != user.email:
            existing = self.user_repo.get_by_email(data.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=errors.USER_EMAIL_EXISTS,
                )
            user.email = data.email

        # Check username uniqueness
        if data.username and data.username != user.username:
            existing = self.user_repo.get_by_username(data.username)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=errors.USER_USERNAME_EXISTS,
                )
            user.username = data.username

        # Update role
        if data.role:
            user.role = data.role

        # Update active status
        if data.is_active is not None:
            user.is_active = data.is_active

        # Update profile full_name
        if data.full_name is not None and user.profile:
            user.profile.full_name = data.full_name

        # Update profile meta_data
        if data.meta_data is not None and user.profile:
            user.profile.meta_data = data.meta_data

        self.db.commit()
        self.db.refresh(user)

        logger.info(f"Admin updated user: {user_id}")

        return self.get_user_by_id(user_id)

    def delete_user(self, user_id: UUID) -> bool:
        """
        Delete user (admin only).

        Args:
            user_id: User ID

        Returns:
            True if deleted

        Raises:
            HTTPException: If user not found
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.USER_NOT_FOUND,
            )

        self.db.delete(user)
        self.db.commit()

        logger.info(f"Admin deleted user: {user_id}")

        return True

    def toggle_user_status(self, user_id: UUID) -> dict:
        """
        Toggle user active status.

        Args:
            user_id: User ID

        Returns:
            Updated user data
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.USER_NOT_FOUND,
            )

        user.is_active = not user.is_active
        self.db.commit()
        self.db.refresh(user)

        logger.info(f"Admin toggled user status: {user_id} -> {user.is_active}")

        return self.get_user_by_id(user_id)

    def reset_password(self, user_id: UUID, new_password: str) -> dict:
        """
        Reset user password (admin only).

        Args:
            user_id: User ID
            new_password: New password

        Returns:
            Updated user data

        Raises:
            HTTPException: If user not found or password too short
        """
        if len(new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu phải có ít nhất 6 ký tự",
            )

        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=errors.USER_NOT_FOUND,
            )

        # Hash and update password
        hashed_password = get_password_hash(new_password)
        user.password_hash = hashed_password
        self.db.commit()
        self.db.refresh(user)

        logger.info(f"Admin reset password for user: {user_id}")

        return self.get_user_by_id(user_id)
