"""Shared test fixtures and configuration."""

import uuid
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from core.database import Base, get_db
from core.security import get_password_hash
from main import app
from models.user import User, UserRole
from models.course import Course
from models.module import Module
from models.section import Section
from models.knowledge_point import KnowledgePoint


# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with in-memory database
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test.
    
    Yields:
        Database session
    """
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create session
    session = TestSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with database session override.
    
    Args:
        db: Test database session
        
    Yields:
        FastAPI test client
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_password() -> str:
    """Return a test password."""
    return "Test123!@#"


@pytest.fixture
def test_user(db: Session, test_password: str) -> User:
    """
    Create a test user.
    
    Args:
        db: Database session
        test_password: Test password
        
    Returns:
        Test user instance
    """
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash(test_password),
        role=UserRole.STUDENT,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db: Session, test_password: str) -> User:
    """
    Create a test admin user.
    
    Args:
        db: Database session
        test_password: Test password
        
    Returns:
        Test admin user instance
    """
    admin = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        username="admin",
        full_name="Admin User",
        hashed_password=get_password_hash(test_password),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def test_teacher(db: Session, test_password: str) -> User:
    """
    Create a test teacher user.
    
    Args:
        db: Database session
        test_password: Test password
        
    Returns:
        Test teacher user instance
    """
    teacher = User(
        id=uuid.uuid4(),
        email="teacher@example.com",
        username="teacher",
        full_name="Teacher User",
        hashed_password=get_password_hash(test_password),
        role=UserRole.TEACHER,
        is_active=True,
        is_verified=True,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@pytest.fixture
def test_google_user(db: Session) -> User:
    """
    Create a test Google OAuth user.
    
    Args:
        db: Database session
        
    Returns:
        Test Google user instance
    """
    user = User(
        id=uuid.uuid4(),
        email="google@example.com",
        username="googleuser",
        full_name="Google User",
        google_id="123456789",
        profile_picture="https://example.com/photo.jpg",
        role=UserRole.STUDENT,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_course(db: Session, test_teacher: User) -> Course:
    """
    Create a test course.
    
    Args:
        db: Database session
        test_teacher: Teacher user who created the course
        
    Returns:
        Test course instance
    """
    course = Course(
        id=uuid.uuid4(),
        title="Test Course",
        description="A test course for unit testing",
        created_by=test_teacher.id,
        is_published=True,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@pytest.fixture
def test_module(db: Session, test_course: Course) -> Module:
    """
    Create a test module.
    
    Args:
        db: Database session
        test_course: Course to add module to
        
    Returns:
        Test module instance
    """
    module = Module(
        id=uuid.uuid4(),
        course_id=test_course.id,
        title="Test Module",
        description="A test module",
        order_index=1,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@pytest.fixture
def test_section(db: Session, test_module: Module) -> Section:
    """
    Create a test section.
    
    Args:
        db: Database session
        test_module: Module to add section to
        
    Returns:
        Test section instance
    """
    section = Section(
        id=uuid.uuid4(),
        module_id=test_module.id,
        title="Test Section",
        content="Test section content",
        order_index=1,
    )
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@pytest.fixture
def test_knowledge_point(db: Session, test_section: Section) -> KnowledgePoint:
    """
    Create a test knowledge point.
    
    Args:
        db: Database session
        test_section: Section to add knowledge point to
        
    Returns:
        Test knowledge point instance
    """
    kp = KnowledgePoint(
        id=uuid.uuid4(),
        section_id=test_section.id,
        title="Test Knowledge Point",
        description="A test knowledge point",
        order_index=1,
    )
    db.add(kp)
    db.commit()
    db.refresh(kp)
    return kp


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    """
    Create authentication headers for test user.
    
    Args:
        test_user: Test user
        
    Returns:
        Dictionary with Authorization header
    """
    from core.security import create_access_token
    
    token = create_access_token({
        "sub": str(test_user.id),
        "email": test_user.email,
        "role": test_user.role.value,
    })
    
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin: User) -> dict[str, str]:
    """
    Create authentication headers for admin user.
    
    Args:
        test_admin: Test admin user
        
    Returns:
        Dictionary with Authorization header
    """
    from core.security import create_access_token
    
    token = create_access_token({
        "sub": str(test_admin.id),
        "email": test_admin.email,
        "role": test_admin.role.value,
    })
    
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def teacher_headers(test_teacher: User) -> dict[str, str]:
    """
    Create authentication headers for teacher user.
    
    Args:
        test_teacher: Test teacher user
        
    Returns:
        Dictionary with Authorization header
    """
    from core.security import create_access_token
    
    token = create_access_token({
        "sub": str(test_teacher.id),
        "email": test_teacher.email,
        "role": test_teacher.role.value,
    })
    
    return {"Authorization": f"Bearer {token}"}

