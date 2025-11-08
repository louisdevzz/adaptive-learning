"""Google OAuth utilities for token validation."""

from typing import Optional

from google.auth.transport import requests
from google.oauth2 import id_token

from core.config import settings


def verify_google_token(token: str) -> Optional[dict]:
    """
    Verify Google OAuth token and return user info.

    Args:
        token: Google OAuth ID token

    Returns:
        User info dict or None if invalid

    Example return value:
        {
            "sub": "google_user_id",
            "email": "user@example.com",
            "name": "John Doe",
            "picture": "https://...",
            "email_verified": True
        }
    """
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)

        # Verify issuer
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            return None

        # Token is valid, return user info
        return idinfo

    except ValueError:
        # Invalid token
        return None
    except Exception:
        # Other errors
        return None


def validate_google_config() -> bool:
    """
    Check if Google OAuth is properly configured.

    Returns:
        True if configured, False otherwise
    """
    return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
