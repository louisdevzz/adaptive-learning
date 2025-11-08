"""Token blacklist management using Redis."""

import logging
from datetime import datetime, timezone
from typing import Optional

import redis
from jose import JWTError, jwt

from core.config import settings

# Setup logger
logger = logging.getLogger(__name__)


class TokenBlacklist:
    """Token blacklist manager using Redis for storage."""

    def __init__(self):
        """Initialize Redis connection for token blacklist."""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            # Test connection
            self.redis_client.ping()
            logger.info("✓ Redis connection established for token blacklist")
        except redis.RedisError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            logger.warning("Token blacklisting will be disabled")
            self.redis_client = None

    def _get_token_key(self, token: str) -> str:
        """
        Generate Redis key for a token.
        
        Args:
            token: JWT token string
            
        Returns:
            Redis key string
        """
        return f"blacklist:token:{token[:32]}"  # Use first 32 chars as key

    def _get_user_tokens_key(self, user_id: str) -> str:
        """
        Generate Redis key for user's active tokens set.
        
        Args:
            user_id: User ID
            
        Returns:
            Redis key string
        """
        return f"blacklist:user:{user_id}:tokens"
    
    def _get_user_revocation_key(self, user_id: str) -> str:
        """
        Generate Redis key for user's revocation timestamp.
        
        Args:
            user_id: User ID
            
        Returns:
            Redis key string
        """
        return f"blacklist:user:{user_id}:revoked_at"

    def _get_token_expiry(self, token: str) -> Optional[int]:
        """
        Get token expiry time in seconds from now.
        
        Args:
            token: JWT token string
            
        Returns:
            Seconds until expiry, or None if token is invalid
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
                options={"verify_exp": False}  # Don't verify expiry yet
            )
            exp = payload.get("exp")
            if exp:
                expiry_time = datetime.fromtimestamp(exp, tz=timezone.utc)
                now = datetime.now(timezone.utc)
                seconds_until_expiry = int((expiry_time - now).total_seconds())
                
                # Return positive value or None if already expired
                return seconds_until_expiry if seconds_until_expiry > 0 else None
            return None
        except JWTError as e:
            logger.warning(f"Failed to decode token for expiry check: {e}")
            return None

    def blacklist_token(self, token: str, user_id: Optional[str] = None) -> bool:
        """
        Add a token to the blacklist.
        
        Args:
            token: JWT token to blacklist
            user_id: Optional user ID for tracking user's tokens
            
        Returns:
            True if successfully blacklisted, False otherwise
        """
        if not self.redis_client:
            logger.warning("Redis not available, token blacklisting skipped")
            return False

        try:
            # Get token expiry time
            ttl = self._get_token_expiry(token)
            if ttl is None or ttl <= 0:
                logger.info("Token already expired, no need to blacklist")
                return True

            token_key = self._get_token_key(token)
            
            # Store token in blacklist with expiry
            self.redis_client.setex(
                token_key,
                ttl,
                datetime.now(timezone.utc).isoformat()
            )
            
            # Also add to user's token set if user_id provided
            if user_id:
                user_tokens_key = self._get_user_tokens_key(user_id)
                self.redis_client.sadd(user_tokens_key, token[:32])
                self.redis_client.expire(user_tokens_key, ttl)
            
            logger.info(f"Token blacklisted successfully (TTL: {ttl}s)")
            return True
            
        except redis.RedisError as e:
            logger.error(f"Failed to blacklist token: {e}")
            return False

    def is_blacklisted(self, token: str) -> bool:
        """
        Check if a token is blacklisted.
        
        Args:
            token: JWT token to check
            
        Returns:
            True if token is blacklisted, False otherwise
        """
        if not self.redis_client:
            # Security: Fail closed in production when Redis is unavailable
            # This prevents bypassing token blacklist if Redis is down
            if not settings.DEBUG:
                logger.critical(
                    "Redis unavailable in production - FAILING CLOSED for security. "
                    "Token validation failed."
                )
                return True  # Treat as blacklisted to be safe
            else:
                # In development, allow access for easier testing
                logger.warning("Redis unavailable in dev mode - allowing access (fail open)")
                return False

        try:
            token_key = self._get_token_key(token)
            return self.redis_client.exists(token_key) > 0
        except redis.RedisError as e:
            logger.error(f"Failed to check token blacklist: {e}")
            # Fail closed in production for security
            if not settings.DEBUG:
                logger.critical("Redis error in production - FAILING CLOSED for security")
                return True  # Treat as blacklisted to be safe
            return False  # Fail open in development

    def blacklist_all_user_tokens(self, user_id: str) -> bool:
        """
        Blacklist all tokens for a user (useful for logout from all devices).
        
        Sets a revocation timestamp that invalidates all tokens issued before this time.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            logger.warning("Redis not available, cannot blacklist user tokens")
            return False

        try:
            # Set revocation timestamp to now
            revocation_key = self._get_user_revocation_key(user_id)
            revocation_time = datetime.now(timezone.utc).isoformat()
            
            # Store revocation timestamp with TTL equal to refresh token expiry
            # This ensures even refresh tokens are eventually invalidated
            ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
            self.redis_client.setex(revocation_key, ttl, revocation_time)
            
            # Also blacklist individual tokens if tracked
            user_tokens_key = self._get_user_tokens_key(user_id)
            tokens = self.redis_client.smembers(user_tokens_key)
            
            if tokens:
                # Delete all token keys
                for token_prefix in tokens:
                    token_key = f"blacklist:token:{token_prefix}"
                    self.redis_client.delete(token_key)
                
                # Delete the user's token set
                self.redis_client.delete(user_tokens_key)
                
                logger.info(
                    f"Revoked all tokens for user {user_id} at {revocation_time}. "
                    f"Individually blacklisted {len(tokens)} tracked tokens."
                )
            else:
                logger.info(f"Revoked all tokens for user {user_id} at {revocation_time}")
            
            return True
            
        except redis.RedisError as e:
            logger.error(f"Failed to blacklist user tokens: {e}")
            return False
    
    def get_user_revocation_timestamp(self, user_id: str) -> Optional[datetime]:
        """
        Get the revocation timestamp for a user.
        
        Tokens issued before this timestamp are considered invalid.
        
        Args:
            user_id: User ID
            
        Returns:
            Revocation timestamp as datetime, or None if not revoked
        """
        if not self.redis_client:
            return None
        
        try:
            revocation_key = self._get_user_revocation_key(user_id)
            timestamp_str = self.redis_client.get(revocation_key)
            
            if timestamp_str:
                return datetime.fromisoformat(timestamp_str)
            return None
            
        except (redis.RedisError, ValueError) as e:
            logger.error(f"Failed to get user revocation timestamp: {e}")
            return None
    
    def set_user_revocation_timestamp(
        self, 
        user_id: str, 
        timestamp: Optional[datetime] = None
    ) -> bool:
        """
        Set a revocation timestamp for a user.
        
        Args:
            user_id: User ID
            timestamp: Revocation timestamp (defaults to now if None)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            logger.warning("Redis not available, cannot set revocation timestamp")
            return False
        
        try:
            revocation_key = self._get_user_revocation_key(user_id)
            
            if timestamp is None:
                timestamp = datetime.now(timezone.utc)
            
            timestamp_str = timestamp.isoformat()
            
            # Store with TTL equal to refresh token expiry
            ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
            self.redis_client.setex(revocation_key, ttl, timestamp_str)
            
            logger.info(f"Set revocation timestamp for user {user_id}: {timestamp_str}")
            return True
            
        except redis.RedisError as e:
            logger.error(f"Failed to set user revocation timestamp: {e}")
            return False
    
    def clear_user_revocation(self, user_id: str) -> bool:
        """
        Clear the revocation timestamp for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            return False
        
        try:
            revocation_key = self._get_user_revocation_key(user_id)
            self.redis_client.delete(revocation_key)
            logger.info(f"Cleared revocation timestamp for user {user_id}")
            return True
            
        except redis.RedisError as e:
            logger.error(f"Failed to clear user revocation: {e}")
            return False

    def remove_from_blacklist(self, token: str) -> bool:
        """
        Remove a token from blacklist (e.g., if blacklisted by mistake).
        
        Args:
            token: JWT token to remove from blacklist
            
        Returns:
            True if successfully removed, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            token_key = self._get_token_key(token)
            self.redis_client.delete(token_key)
            logger.info("Token removed from blacklist")
            return True
        except redis.RedisError as e:
            logger.error(f"Failed to remove token from blacklist: {e}")
            return False

    def get_blacklist_info(self, token: str) -> Optional[dict]:
        """
        Get information about a blacklisted token.
        
        Args:
            token: JWT token
            
        Returns:
            Dictionary with blacklist info, or None if not blacklisted
        """
        if not self.redis_client:
            return None

        try:
            token_key = self._get_token_key(token)
            
            if self.redis_client.exists(token_key):
                blacklisted_at = self.redis_client.get(token_key)
                ttl = self.redis_client.ttl(token_key)
                
                return {
                    "blacklisted": True,
                    "blacklisted_at": blacklisted_at,
                    "expires_in_seconds": ttl,
                }
            
            return {"blacklisted": False}
            
        except redis.RedisError as e:
            logger.error(f"Failed to get blacklist info: {e}")
            return None

    def health_check(self) -> bool:
        """
        Check if Redis connection is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            return self.redis_client.ping()
        except redis.RedisError:
            return False


# Global token blacklist instance
token_blacklist = TokenBlacklist()

