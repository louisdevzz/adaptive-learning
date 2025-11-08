"""Security utilities for authentication and authorization."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
from jose import JWTError, jwt

from core.config import settings

# bcrypt configuration
# Using 12 rounds as recommended by OWASP for good security/performance balance
BCRYPT_ROUNDS = 12


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token.

    Args:
        data: Data to encode in the token
        expires_delta: Custom expiration time delta

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT refresh token.

    Args:
        data: Data to encode in the token
        expires_delta: Custom expiration time delta

    Returns:
        Encoded JWT refresh token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[dict[str, Any]]:
    """
    Verify and decode JWT token.

    Args:
        token: JWT token to verify
        token_type: Expected token type (access or refresh)

    Returns:
        Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a bcrypt hash.

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise

    Note:
        bcrypt has a 72-byte password limit. Longer passwords are automatically
        truncated to first 72 bytes.
    """
    # Encode password to bytes (bcrypt works with bytes)
    # Truncate to 72 bytes as per bcrypt specification
    password_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")

    try:
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except (ValueError, TypeError):
        # Invalid hash format or encoding issue
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string (bcrypt format)

    Note:
        bcrypt has a 72-byte password limit. Longer passwords are automatically
        truncated to first 72 bytes. Consider validating password length at the
        API layer if this is a concern.

    Security:
        Uses 12 rounds (2^12 = 4096 iterations) which provides good security
        while maintaining reasonable performance (~100-300ms per hash).
    """
    # Encode password to bytes and truncate to 72 bytes (bcrypt limit)
    password_bytes = password.encode("utf-8")[:72]

    # Generate salt and hash password
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password_bytes, salt)

    # Return as string for database storage
    return hashed.decode("utf-8")


def create_token_pair(user_id: uuid.UUID | str, email: str, role: str) -> dict[str, str]:
    """
    Create access and refresh token pair for a user.

    Args:
        user_id: User ID (UUID or string representation)
        email: User email
        role: User role

    Returns:
        Dictionary with access_token and refresh_token
    """
    token_data = {"sub": str(user_id), "email": email, "role": role}

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": str(user_id)})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
