"""Standardized error messages for consistent UX and i18n support."""

from typing import Final


class ErrorMessages:
    """Centralized error messages for the application."""
    
    # Authentication & Authorization
    AUTH_INVALID_CREDENTIALS: Final[str] = "Invalid email or password"
    AUTH_INVALID_TOKEN: Final[str] = "Invalid authentication token"
    AUTH_TOKEN_REVOKED: Final[str] = "Authentication token has been revoked"
    AUTH_TOKEN_EXPIRED: Final[str] = "Authentication token has expired"
    AUTH_INSUFFICIENT_PERMISSIONS: Final[str] = "Insufficient permissions to perform this action"
    AUTH_ADMIN_REQUIRED: Final[str] = "Administrator access required"
    AUTH_GOOGLE_TOKEN_INVALID: Final[str] = "Invalid Google authentication token"
    AUTH_GOOGLE_LOGIN_REQUIRED: Final[str] = "Please sign in with Google"
    
    # User Account
    USER_NOT_FOUND: Final[str] = "User account not found"
    USER_INACTIVE: Final[str] = "User account is inactive"
    USER_EMAIL_EXISTS: Final[str] = "Email address is already registered"
    USER_USERNAME_EXISTS: Final[str] = "Username is already taken"
    
    # Resources Not Found
    COURSE_NOT_FOUND: Final[str] = "Course not found"
    MODULE_NOT_FOUND: Final[str] = "Module not found"
    SECTION_NOT_FOUND: Final[str] = "Section not found"
    KNOWLEDGE_POINT_NOT_FOUND: Final[str] = "Knowledge point not found"
    
    # Resource Conflicts
    COURSE_SLUG_EXISTS: Final[str] = "A course with this identifier already exists"
    
    # System Errors
    SYSTEM_ERROR: Final[str] = "An internal error occurred. Please try again later"
    LOGOUT_FAILED: Final[str] = "Failed to sign out. Please try again"
    LOGOUT_ALL_FAILED: Final[str] = "Failed to sign out from all devices. Please try again"
    DATABASE_ERROR: Final[str] = "Database operation failed. Please try again"
    
    # Validation Errors
    VALIDATION_SKIP_NEGATIVE: Final[str] = "Page offset must be non-negative"
    VALIDATION_LIMIT_NEGATIVE: Final[str] = "Page limit must be non-negative"
    VALIDATION_USERNAME_INVALID: Final[str] = "Username must contain only letters, numbers, underscores, or hyphens"
    VALIDATION_PASSWORD_LENGTH_MIN: Final[str] = "Password must be at least 8 characters long"
    VALIDATION_PASSWORD_LENGTH_MAX: Final[str] = "Password must not exceed 72 characters"
    VALIDATION_PASSWORD_UPPERCASE: Final[str] = "Password must contain at least one uppercase letter"
    VALIDATION_PASSWORD_LOWERCASE: Final[str] = "Password must contain at least one lowercase letter"
    VALIDATION_PASSWORD_DIGIT: Final[str] = "Password must contain at least one digit"
    VALIDATION_PASSWORD_SPECIAL: Final[str] = "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;'`~)"
    VALIDATION_PASSWORD_COMMON: Final[str] = "Password is too common. Please choose a stronger password"
    VALIDATION_PASSWORD_SEQUENCE: Final[str] = "Password contains common patterns. Please choose a stronger password"
    VALIDATION_ROLE_INVALID: Final[str] = "Invalid user role"
    
    @staticmethod
    def role_invalid(allowed_roles: list[str]) -> str:
        """Generate role validation error with allowed values."""
        return f"Role must be one of: {', '.join(allowed_roles)}"


# Singleton instance
errors = ErrorMessages()

