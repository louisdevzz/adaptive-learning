"""Tests for security utilities."""

import uuid
from datetime import timedelta

import pytest

from core.security import (
    create_access_token,
    create_refresh_token,
    create_token_pair,
    get_password_hash,
    verify_password,
    verify_token,
)


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_password(self):
        """Test password hashing."""
        password = "TestPassword123!@#"
        hashed = get_password_hash(password)
        
        # Hash should be different from password
        assert hashed != password
        
        # Hash should be bcrypt format (starts with $2b$)
        assert hashed.startswith("$2b$")
        
        # Hash should be reasonable length (around 60 characters)
        assert 50 < len(hashed) < 100

    def test_hash_different_each_time(self):
        """Test that same password generates different hashes (due to salt)."""
        password = "TestPassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Same password should generate different hashes
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)

    def test_verify_correct_password(self):
        """Test password verification with correct password."""
        password = "CorrectPassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_incorrect_password(self):
        """Test password verification with incorrect password."""
        password = "CorrectPassword123"
        hashed = get_password_hash(password)
        
        assert verify_password("WrongPassword", hashed) is False

    def test_verify_empty_password(self):
        """Test verification with empty password."""
        hashed = get_password_hash("test")
        assert verify_password("", hashed) is False

    def test_verify_invalid_hash(self):
        """Test verification with invalid hash."""
        assert verify_password("test", "invalid_hash") is False
        assert verify_password("test", "") is False

    def test_long_password_truncation(self):
        """Test that passwords longer than 72 bytes are truncated."""
        # Create a password longer than 72 bytes
        long_password = "a" * 100
        hashed = get_password_hash(long_password)
        
        # First 72 characters should verify
        assert verify_password(long_password[:72], hashed) is True
        
        # Full password should also verify (will be truncated)
        assert verify_password(long_password, hashed) is True


class TestAccessToken:
    """Test JWT access token creation and verification."""

    def test_create_access_token(self):
        """Test access token creation."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_verify_valid_access_token(self):
        """Test verification of valid access token."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        
        payload = verify_token(token, token_type="access")
        
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"
        assert payload["type"] == "access"
        assert "exp" in payload

    def test_verify_wrong_token_type(self):
        """Test that access token fails when verified as refresh token."""
        data = {"sub": "user123"}
        token = create_access_token(data)
        
        # Should fail when expecting refresh token
        payload = verify_token(token, token_type="refresh")
        assert payload is None

    def test_verify_invalid_token(self):
        """Test verification of invalid token."""
        payload = verify_token("invalid.token.here", token_type="access")
        assert payload is None

    def test_verify_empty_token(self):
        """Test verification of empty token."""
        payload = verify_token("", token_type="access")
        assert payload is None

    def test_custom_expiration(self):
        """Test access token with custom expiration."""
        data = {"sub": "user123"}
        custom_expires = timedelta(minutes=30)
        token = create_access_token(data, expires_delta=custom_expires)
        
        payload = verify_token(token, token_type="access")
        assert payload is not None
        assert payload["sub"] == "user123"


class TestRefreshToken:
    """Test JWT refresh token creation and verification."""

    def test_create_refresh_token(self):
        """Test refresh token creation."""
        data = {"sub": "user123"}
        token = create_refresh_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_verify_valid_refresh_token(self):
        """Test verification of valid refresh token."""
        data = {"sub": "user123"}
        token = create_refresh_token(data)
        
        payload = verify_token(token, token_type="refresh")
        
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["type"] == "refresh"
        assert "exp" in payload

    def test_verify_wrong_token_type(self):
        """Test that refresh token fails when verified as access token."""
        data = {"sub": "user123"}
        token = create_refresh_token(data)
        
        # Should fail when expecting access token
        payload = verify_token(token, token_type="access")
        assert payload is None

    def test_custom_expiration(self):
        """Test refresh token with custom expiration."""
        data = {"sub": "user123"}
        custom_expires = timedelta(days=14)
        token = create_refresh_token(data, expires_delta=custom_expires)
        
        payload = verify_token(token, token_type="refresh")
        assert payload is not None
        assert payload["sub"] == "user123"


class TestTokenPair:
    """Test token pair creation."""

    def test_create_token_pair_with_uuid(self):
        """Test token pair creation with UUID."""
        user_id = uuid.uuid4()
        email = "test@example.com"
        role = "student"
        
        tokens = create_token_pair(user_id, email, role)
        
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert "token_type" in tokens
        assert tokens["token_type"] == "bearer"

    def test_create_token_pair_with_string(self):
        """Test token pair creation with string ID."""
        user_id = "user123"
        email = "test@example.com"
        role = "teacher"
        
        tokens = create_token_pair(user_id, email, role)
        
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["token_type"] == "bearer"

    def test_verify_token_pair(self):
        """Test that both tokens in pair are valid."""
        user_id = uuid.uuid4()
        email = "test@example.com"
        role = "admin"
        
        tokens = create_token_pair(user_id, email, role)
        
        # Verify access token
        access_payload = verify_token(tokens["access_token"], token_type="access")
        assert access_payload is not None
        assert access_payload["sub"] == str(user_id)
        assert access_payload["email"] == email
        assert access_payload["role"] == role
        
        # Verify refresh token
        refresh_payload = verify_token(tokens["refresh_token"], token_type="refresh")
        assert refresh_payload is not None
        assert refresh_payload["sub"] == str(user_id)

    def test_token_pair_with_different_roles(self):
        """Test token pair creation with different user roles."""
        roles = ["student", "teacher", "admin", "parent"]
        
        for role in roles:
            user_id = uuid.uuid4()
            tokens = create_token_pair(user_id, f"{role}@example.com", role)
            
            access_payload = verify_token(tokens["access_token"], token_type="access")
            assert access_payload["role"] == role

    def test_token_pair_preserves_user_data(self):
        """Test that token pair correctly encodes user data."""
        user_id = uuid.uuid4()
        email = "detailed@example.com"
        role = "student"
        
        tokens = create_token_pair(user_id, email, role)
        
        access_payload = verify_token(tokens["access_token"], token_type="access")
        
        # Verify all user data is preserved
        assert access_payload["sub"] == str(user_id)
        assert access_payload["email"] == email
        assert access_payload["role"] == role
        assert access_payload["type"] == "access"

