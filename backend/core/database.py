"""Database configuration and session management."""

import logging
from typing import Generator, Optional

from sqlalchemy import create_engine, event, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import Pool

from core.config import settings

# Setup logger
logger = logging.getLogger(__name__)


# Create Base class for declarative models (SQLAlchemy 2.0+ style)
class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


# Create SQLAlchemy engine with error handling
try:
    engine = create_engine(
        settings.database_url_sync,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=settings.DB_POOL_RECYCLE,
        echo=settings.DB_ECHO,
        pool_pre_ping=True,  # Enable connection health checks
    )
    
    # Validate database connection on startup
    logger.info("Validating database connection...")
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    logger.info("Database connection validated successfully")
    
except SQLAlchemyError as e:
    logger.error(f"Failed to create database engine: {e}")
    logger.error(f"DATABASE_URL: {settings.DATABASE_URL}")
    raise RuntimeError(
        f"Database connection failed. Please check your DATABASE_URL configuration. Error: {e}"
    ) from e
except Exception as e:
    logger.error(f"Unexpected error creating database engine: {e}")
    raise RuntimeError(
        f"Failed to initialize database connection: {e}"
    ) from e

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    Yields:
        Database session

    Usage:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    
    Raises:
        RuntimeError: If database session cannot be created
    """
    db = None
    try:
        db = SessionLocal()
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database session error: {e}")
        if db:
            db.rollback()
        raise RuntimeError(f"Database session error: {e}") from e
    finally:
        if db:
            db.close()


def init_db() -> None:
    """
    Initialize database by creating all tables.

    This should only be used in development.
    In production, use Alembic migrations instead.
    
    Raises:
        RuntimeError: If database initialization fails
    """
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Failed to initialize database: {e}")
        raise RuntimeError(f"Database initialization failed: {e}") from e


def verify_db_connection() -> bool:
    """
    Verify database connection is active and healthy.
    
    Returns:
        True if connection is healthy, False otherwise
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError as e:
        logger.error(f"Database connection check failed: {e}")
        return False


def get_pool_status() -> dict:
    """
    Get current connection pool status and metrics.
    
    Returns:
        Dictionary with pool statistics including:
        - size: Current size of the pool
        - checked_in: Number of connections currently checked in (idle)
        - checked_out: Number of connections currently checked out (in use)
        - overflow: Number of overflow connections (beyond pool_size)
        - total_connections: Total connections (pool + overflow)
        - pool_size_limit: Maximum pool size
        - overflow_limit: Maximum overflow connections
        - total_limit: Maximum total connections (pool + overflow)
        - utilization_percent: Percentage of pool in use
        - is_exhausted: Whether pool is at maximum capacity
    """
    pool = engine.pool
    
    # Get pool statistics
    size = pool.size()
    checked_in = pool.checkedin()
    checked_out = pool.checkedout()
    overflow = pool.overflow()
    
    # Calculate limits
    pool_size_limit = settings.DB_POOL_SIZE
    overflow_limit = settings.DB_MAX_OVERFLOW
    total_limit = pool_size_limit + overflow_limit
    total_connections = size + overflow
    
    # Calculate utilization percentage
    utilization_percent = (checked_out / total_limit * 100) if total_limit > 0 else 0
    
    # Check if pool is exhausted
    is_exhausted = total_connections >= total_limit
    
    status = {
        "size": size,
        "checked_in": checked_in,
        "checked_out": checked_out,
        "overflow": overflow,
        "total_connections": total_connections,
        "pool_size_limit": pool_size_limit,
        "overflow_limit": overflow_limit,
        "total_limit": total_limit,
        "utilization_percent": round(utilization_percent, 2),
        "is_exhausted": is_exhausted,
    }
    
    # Log warning if utilization is high
    if utilization_percent > 80:
        logger.warning(
            f"Connection pool utilization high: {utilization_percent:.1f}% "
            f"({checked_out}/{total_limit} connections in use)"
        )
    
    if is_exhausted:
        logger.error(
            f"Connection pool EXHAUSTED! All {total_limit} connections are in use. "
            f"This may cause timeouts and performance degradation."
        )
    
    return status


def log_pool_status() -> None:
    """
    Log current connection pool status for monitoring purposes.
    
    This should be called periodically or on-demand for health checks.
    """
    status = get_pool_status()
    logger.info(
        f"Connection Pool Status: "
        f"{status['checked_out']}/{status['total_limit']} in use "
        f"({status['utilization_percent']}% utilization), "
        f"pool_size={status['size']}, "
        f"overflow={status['overflow']}, "
        f"idle={status['checked_in']}"
    )


# Pool event listeners for monitoring
@event.listens_for(Pool, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """
    Listen for connection checkout events.
    
    This fires when a connection is retrieved from the pool.
    Useful for tracking pool usage patterns.
    """
    # Only log if pool utilization is high to avoid spam
    status = get_pool_status()
    if status["utilization_percent"] > 70:
        logger.debug(
            f"Connection checked out from pool. "
            f"Current utilization: {status['utilization_percent']}%"
        )


@event.listens_for(Pool, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """
    Listen for connection checkin events.
    
    This fires when a connection is returned to the pool.
    """
    # Only log during high utilization
    status = get_pool_status()
    if status["utilization_percent"] > 70:
        logger.debug(
            f"Connection returned to pool. "
            f"Current utilization: {status['utilization_percent']}%"
        )


@event.listens_for(Pool, "connect")
def receive_connect(dbapi_conn, connection_record):
    """
    Listen for new connection creation events.
    
    This fires when a new database connection is established.
    """
    logger.debug("New database connection established")


@event.listens_for(Pool, "close")
def receive_close(dbapi_conn, connection_record):
    """
    Listen for connection close events.
    
    This fires when a connection is permanently closed.
    """
    logger.debug("Database connection closed")


@event.listens_for(Pool, "invalidate")
def receive_invalidate(dbapi_conn, connection_record, exception):
    """
    Listen for connection invalidation events.
    
    This fires when a connection is invalidated due to an error.
    """
    logger.warning(
        f"Database connection invalidated. Exception: {exception if exception else 'None'}"
    )
