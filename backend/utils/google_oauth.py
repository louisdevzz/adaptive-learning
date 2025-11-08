"""Google OAuth utilities for token validation."""

import logging
from typing import Optional

import google.auth.exceptions
from google.auth.transport import requests
from google.oauth2 import id_token

from core.config import settings

# Setup logger
logger = logging.getLogger(__name__)


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
    # Check if Google OAuth is configured
    if not settings.GOOGLE_CLIENT_ID:
        logger.error("Google OAuth is not configured: GOOGLE_CLIENT_ID is missing")
        return None

    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Verify issuer
        if idinfo.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
            logger.warning(
                f"Invalid token issuer: {idinfo.get('iss')}. "
                "Expected 'accounts.google.com' or 'https://accounts.google.com'"
            )
            return None

        # Verify audience (client ID)
        if idinfo.get("aud") != settings.GOOGLE_CLIENT_ID:
            logger.warning(
                f"Token audience mismatch. Expected {settings.GOOGLE_CLIENT_ID}"
            )
            return None

        # Check if email is verified
        if not idinfo.get("email_verified", False):
            logger.warning(
                f"Email not verified for Google user: {idinfo.get('email', 'unknown')}"
            )
            # Still return the info, but the calling code should handle this

        # Token is valid, return user info
        logger.info(f"Successfully verified Google token for user: {idinfo.get('email', 'unknown')}")
        return idinfo

    except ValueError as e:
        # Invalid token format or signature
        logger.warning(f"Invalid Google token format or signature: {e}")
        return None
    
    except google.auth.exceptions.GoogleAuthError as e:
        # Google authentication specific errors
        logger.error(f"Google authentication error: {e}")
        return None
    
    except KeyError as e:
        # Missing required fields in token
        logger.error(f"Missing required field in Google token: {e}")
        return None
    
    except Exception as e:
        # Catch any other unexpected errors but log them
        logger.error(f"Unexpected error verifying Google token: {type(e).__name__}: {e}")
        # Re-raise in development, return None in production
        if settings.DEBUG:
            raise
        return None


def validate_google_config() -> bool:
    """
    Check if Google OAuth is properly configured.

    Returns:
        True if configured, False otherwise
    """
    is_configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    
    if not is_configured:
        missing = []
        if not settings.GOOGLE_CLIENT_ID:
            missing.append("GOOGLE_CLIENT_ID")
        if not settings.GOOGLE_CLIENT_SECRET:
            missing.append("GOOGLE_CLIENT_SECRET")
        
        logger.warning(f"Google OAuth not fully configured. Missing: {', '.join(missing)}")
    
    return is_configured


def get_google_oauth_url() -> Optional[str]:
    """
    Get Google OAuth authorization URL.
    
    Returns:
        OAuth URL or None if not configured
    """
    if not validate_google_config():
        return None
    
    if not settings.GOOGLE_REDIRECT_URI:
        logger.warning("GOOGLE_REDIRECT_URI not configured")
        return None
    
    # Construct OAuth URL
    oauth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    
    return oauth_url
