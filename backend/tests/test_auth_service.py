"""Tests for authentication service."""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.user import User, UserRole
from schemas.auth_schema import GoogleLogin, UserLogin, UserRegister
from services.auth_service import AuthService


class TestUserRegistration:
    """Test user registration functionality."""

    def test_register_new_user(self, db: Session):
        """Test successful user registration."""
        auth_service = AuthService(db)
        
        user_data = UserRegister(
            email="newuser@example.com",
            username="newuser",
            full_name="New User",
            password="SecurePass123!",
            role="student",
        )
        
        result = auth_service.register_user(user_data)
        
        # Check result structure
        assert "user" in result
        assert "tokens" in result
        
        # Check user data
        user = result["user"]
        assert user.email == "newuser@example.com"
        assert user.username == "newuser"
        assert user.full_name == "New User"
        assert user.role == UserRole.STUDENT
        assert user.is_active is True
        assert user.hashed_password is not None
        
        # Check tokens
        tokens = result["tokens"]
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["token_type"] == "bearer"

    def test_register_duplicate_email(self, db: Session, test_user: User):
        """Test registration with duplicate email."""
        auth_service = AuthService(db)
        
        user_data = UserRegister(
            email=test_user.email,  # Duplicate email
            username="different",
            full_name="Different User",
            password="SecurePass123!",
            role="student",
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.register_user(user_data)
        
        assert exc_info.value.status_code == 400
        assert "Email already registered" in str(exc_info.value.detail)

    def test_register_duplicate_username(self, db: Session, test_user: User):
        """Test registration with duplicate username."""
        auth_service = AuthService(db)
        
        user_data = UserRegister(
            email="different@example.com",
            username=test_user.username,  # Duplicate username
            full_name="Different User",
            password="SecurePass123!",
            role="student",
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.register_user(user_data)
        
        assert exc_info.value.status_code == 400
        assert "Username already taken" in str(exc_info.value.detail)

    def test_register_with_different_roles(self, db: Session):
        """Test registration with different user roles."""
        auth_service = AuthService(db)
        
        roles = ["student", "teacher", "parent"]
        
        for i, role in enumerate(roles):
            user_data = UserRegister(
                email=f"user{i}@example.com",
                username=f"user{i}",
                full_name=f"User {i}",
                password="SecurePass123!",
                role=role,
            )
            
            result = auth_service.register_user(user_data)
            assert result["user"].role.value == role

    def test_register_password_is_hashed(self, db: Session):
        """Test that password is properly hashed during registration."""
        auth_service = AuthService(db)
        
        plain_password = "PlainPassword123!"
        user_data = UserRegister(
            email="hash@example.com",
            username="hashuser",
            full_name="Hash User",
            password=plain_password,
            role="student",
        )
        
        result = auth_service.register_user(user_data)
        user = result["user"]
        
        # Password should be hashed, not stored as plain text
        assert user.hashed_password != plain_password
        assert user.hashed_password.startswith("$2b$")


class TestUserLogin:
    """Test user login functionality."""

    def test_login_success(self, db: Session, test_user: User, test_password: str):
        """Test successful login."""
        auth_service = AuthService(db)
        
        login_data = UserLogin(
            email=test_user.email,
            password=test_password,
        )
        
        result = auth_service.login_user(login_data)
        
        # Check result structure
        assert "user" in result
        assert "tokens" in result
        
        # Check user
        assert result["user"].id == test_user.id
        assert result["user"].email == test_user.email
        
        # Check tokens
        tokens = result["tokens"]
        assert "access_token" in tokens
        assert "refresh_token" in tokens

    def test_login_wrong_password(self, db: Session, test_user: User):
        """Test login with incorrect password."""
        auth_service = AuthService(db)
        
        login_data = UserLogin(
            email=test_user.email,
            password="WrongPassword123!",
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login_user(login_data)
        
        assert exc_info.value.status_code == 401
        assert "Incorrect email or password" in str(exc_info.value.detail)

    def test_login_nonexistent_user(self, db: Session):
        """Test login with non-existent email."""
        auth_service = AuthService(db)
        
        login_data = UserLogin(
            email="nonexistent@example.com",
            password="Password123!",
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login_user(login_data)
        
        assert exc_info.value.status_code == 401
        assert "Incorrect email or password" in str(exc_info.value.detail)

    def test_login_oauth_only_user(self, db: Session, test_google_user: User):
        """Test login with OAuth-only user (no password)."""
        auth_service = AuthService(db)
        
        login_data = UserLogin(
            email=test_google_user.email,
            password="AnyPassword123!",
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login_user(login_data)
        
        assert exc_info.value.status_code == 400
        assert "login with Google" in str(exc_info.value.detail)

    def test_login_inactive_user(self, db: Session, test_user: User, test_password: str):
        """Test login with inactive user account."""
        auth_service = AuthService(db)
        
        # Deactivate user
        test_user.is_active = False
        db.commit()
        
        login_data = UserLogin(
            email=test_user.email,
            password=test_password,
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login_user(login_data)
        
        assert exc_info.value.status_code == 403
        assert "inactive" in str(exc_info.value.detail).lower()


class TestGoogleOAuth:
    """Test Google OAuth login functionality."""

    def test_google_login_new_user(self, db: Session):
        """Test Google OAuth login with new user."""
        auth_service = AuthService(db)
        
        google_data = GoogleLogin(token="fake_token")
        google_user_info = {
            "sub": "google123",
            "email": "newgoogle@example.com",
            "name": "Google User",
            "picture": "https://example.com/photo.jpg",
        }
        
        result = auth_service.login_with_google(google_data, google_user_info)
        
        # Check result
        assert "user" in result
        assert "tokens" in result
        
        # Check user was created
        user = result["user"]
        assert user.email == "newgoogle@example.com"
        assert user.google_id == "google123"
        assert user.full_name == "Google User"
        assert user.profile_picture == "https://example.com/photo.jpg"
        assert user.role == UserRole.STUDENT
        assert user.hashed_password is None  # OAuth user has no password

    def test_google_login_existing_google_user(self, db: Session, test_google_user: User):
        """Test Google OAuth login with existing Google user."""
        auth_service = AuthService(db)
        
        google_data = GoogleLogin(token="fake_token")
        google_user_info = {
            "sub": test_google_user.google_id,
            "email": test_google_user.email,
            "name": test_google_user.full_name,
        }
        
        result = auth_service.login_with_google(google_data, google_user_info)
        
        # Should return existing user
        assert result["user"].id == test_google_user.id
        assert result["user"].google_id == test_google_user.google_id

    def test_google_login_link_existing_email(self, db: Session, test_user: User):
        """Test Google OAuth linking to existing email account."""
        auth_service = AuthService(db)
        
        # User exists with email but no Google ID
        assert test_user.google_id is None
        
        google_data = GoogleLogin(token="fake_token")
        google_user_info = {
            "sub": "newgoogle456",
            "email": test_user.email,  # Same email as existing user
            "name": "Google Name",
            "picture": "https://example.com/new.jpg",
        }
        
        result = auth_service.login_with_google(google_data, google_user_info)
        
        # Should link Google account to existing user
        user = result["user"]
        assert user.id == test_user.id
        assert user.google_id == "newgoogle456"
        assert user.profile_picture == "https://example.com/new.jpg"
        assert user.is_verified is True

    def test_google_login_inactive_user(self, db: Session, test_google_user: User):
        """Test Google OAuth login with inactive account."""
        auth_service = AuthService(db)
        
        # Deactivate user
        test_google_user.is_active = False
        db.commit()
        
        google_data = GoogleLogin(token="fake_token")
        google_user_info = {
            "sub": test_google_user.google_id,
            "email": test_google_user.email,
            "name": test_google_user.full_name,
        }
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login_with_google(google_data, google_user_info)
        
        assert exc_info.value.status_code == 403
        assert "inactive" in str(exc_info.value.detail).lower()

    def test_google_login_username_collision(self, db: Session, test_user: User):
        """Test Google OAuth with username that already exists."""
        auth_service = AuthService(db)
        
        google_data = GoogleLogin(token="fake_token")
        # Email username would be 'test' but 'testuser' exists
        google_user_info = {
            "sub": "google789",
            "email": "test@different.com",  # Username 'test' would collide
            "name": "Test User",
        }
        
        result = auth_service.login_with_google(google_data, google_user_info)
        
        # Should create user with modified username
        user = result["user"]
        assert user.username != test_user.username
        assert user.username.startswith("test")  # Should be test1, test2, etc.


class TestGetCurrentUser:
    """Test getting current authenticated user."""

    def test_get_current_user_success(self, db: Session, test_user: User):
        """Test getting current user with valid ID."""
        auth_service = AuthService(db)
        
        user = auth_service.get_current_user(test_user.id)
        
        assert user.id == test_user.id
        assert user.email == test_user.email

    def test_get_current_user_with_string_id(self, db: Session, test_user: User):
        """Test getting current user with string UUID."""
        auth_service = AuthService(db)
        
        user = auth_service.get_current_user(str(test_user.id))
        
        assert user.id == test_user.id

    def test_get_current_user_not_found(self, db: Session):
        """Test getting non-existent user."""
        auth_service = AuthService(db)
        
        import uuid
        fake_id = uuid.uuid4()
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.get_current_user(fake_id)
        
        assert exc_info.value.status_code == 404
        assert "not found" in str(exc_info.value.detail).lower()

    def test_get_current_user_inactive(self, db: Session, test_user: User):
        """Test getting inactive user."""
        auth_service = AuthService(db)
        
        # Deactivate user
        test_user.is_active = False
        db.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.get_current_user(test_user.id)
        
        assert exc_info.value.status_code == 403
        assert "inactive" in str(exc_info.value.detail).lower()

