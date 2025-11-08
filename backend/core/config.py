"""Application configuration using Pydantic Settings."""

from typing import Any, List, Optional
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "Adaptive Learning Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ["*"]
    CORS_HEADERS: List[str] = ["*"]

    # Database
    DATABASE_URL: PostgresDsn
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    DB_ECHO: bool = False

    # Security
    SECRET_KEY: str  # Validated below
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None
    GOOGLE_DEFAULT_ROLE: str = "student"  # Default role for Google OAuth users

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.7

    # Mastery Thresholds
    MASTERY_THRESHOLD_LOW: float = 0.4
    MASTERY_THRESHOLD_MEDIUM: float = 0.7
    MASTERY_THRESHOLD_HIGH: float = 0.9

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Roles
    ROLES: List[str] = ["admin", "teacher", "student", "parent"]

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """
        Validate SECRET_KEY meets security requirements.
        
        Requirements:
        - Minimum 32 characters
        - Not a common/default value
        - Not empty or whitespace only
        """
        if not v or not v.strip():
            raise ValueError(
                "SECRET_KEY cannot be empty. "
                "Generate a secure key using: openssl rand -hex 32"
            )
        
        # Remove whitespace for length check
        v = v.strip()
        
        if len(v) < 32:
            raise ValueError(
                f"SECRET_KEY must be at least 32 characters (got {len(v)}). "
                "Generate a secure key using: openssl rand -hex 32"
            )
        
        # Check for common/insecure defaults
        insecure_keys = [
            "your-secret-key-here",
            "your-secret-key",
            "secret",
            "secretkey",
            "mysecretkey",
            "change-me",
            "changeme",
            "secret-key",
            "my-secret-key",
            "supersecret",
            "12345678901234567890123456789012",  # Sequential numbers
        ]
        
        if v.lower() in insecure_keys:
            raise ValueError(
                f"SECRET_KEY '{v}' is insecure. "
                "Generate a secure key using: openssl rand -hex 32"
            )
        
        # Warn if key appears to be a common pattern (optional, just log)
        if v.lower().startswith(("test", "dev", "demo")) and len(v) < 40:
            import logging
            logging.warning(
                f"SECRET_KEY appears to be a test/dev key. "
                "Use a cryptographically secure key in production!"
            )
        
        return v
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: PostgresDsn) -> PostgresDsn:
        """Validate DATABASE_URL is properly configured."""
        if not v:
            raise ValueError(
                "DATABASE_URL is required. "
                "Example: postgresql://user:password@localhost:5432/dbname"
            )
        return v

    @property
    def database_url_sync(self) -> str:
        """Get synchronous database URL string."""
        return str(self.DATABASE_URL).replace("+asyncpg", "")

    @property
    def redis_config(self) -> dict[str, Any]:
        """Get Redis configuration."""
        return {
            "url": self.REDIS_URL,
            "decode_responses": True,
            "encoding": "utf-8",
        }


# Global settings instance
settings = Settings()
