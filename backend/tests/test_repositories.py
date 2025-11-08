"""Tests for repository layer."""

import uuid

import pytest
from sqlalchemy.orm import Session

from models.course import Course
from models.knowledge_point import KnowledgePoint
from models.module import Module
from models.section import Section
from models.user import User, UserRole
from repositories.course_repo import CourseRepository
from repositories.kp_repo import KnowledgePointRepository
from repositories.module_repo import ModuleRepository
from repositories.section_repo import SectionRepository
from repositories.user_repo import UserRepository


class TestUserRepository:
    """Test UserRepository methods."""

    def test_get_by_email(self, db: Session, test_user: User):
        """Test getting user by email."""
        repo = UserRepository(db)
        
        user = repo.get_by_email(test_user.email)
        
        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    def test_get_by_email_not_found(self, db: Session):
        """Test getting non-existent user by email."""
        repo = UserRepository(db)
        
        user = repo.get_by_email("nonexistent@example.com")
        
        assert user is None

    def test_get_by_username(self, db: Session, test_user: User):
        """Test getting user by username."""
        repo = UserRepository(db)
        
        user = repo.get_by_username(test_user.username)
        
        assert user is not None
        assert user.id == test_user.id
        assert user.username == test_user.username

    def test_get_by_username_not_found(self, db: Session):
        """Test getting non-existent user by username."""
        repo = UserRepository(db)
        
        user = repo.get_by_username("nonexistent")
        
        assert user is None

    def test_get_by_google_id(self, db: Session, test_google_user: User):
        """Test getting user by Google ID."""
        repo = UserRepository(db)
        
        user = repo.get_by_google_id(test_google_user.google_id)
        
        assert user is not None
        assert user.id == test_google_user.id
        assert user.google_id == test_google_user.google_id

    def test_create_user(self, db: Session):
        """Test creating a new user."""
        repo = UserRepository(db)
        
        user = repo.create_user(
            email="new@example.com",
            username="newuser",
            full_name="New User",
            hashed_password="hashedpass",
            role=UserRole.STUDENT,
        )
        
        assert user.id is not None
        assert user.email == "new@example.com"
        assert user.username == "newuser"
        assert user.full_name == "New User"
        assert user.hashed_password == "hashedpass"
        assert user.role == UserRole.STUDENT
        assert user.is_active is True
        assert user.is_verified is False  # Not OAuth

    def test_create_oauth_user(self, db: Session):
        """Test creating OAuth user (auto-verified)."""
        repo = UserRepository(db)
        
        user = repo.create_user(
            email="oauth@example.com",
            username="oauthuser",
            full_name="OAuth User",
            google_id="google123",
            profile_picture="https://example.com/pic.jpg",
        )
        
        assert user.google_id == "google123"
        assert user.profile_picture == "https://example.com/pic.jpg"
        assert user.hashed_password is None
        assert user.is_verified is True  # OAuth users auto-verified

    def test_update_last_login(self, db: Session, test_user: User):
        """Test updating last login timestamp."""
        repo = UserRepository(db)
        
        # Initially None
        assert test_user.last_login is None
        
        updated_user = repo.update_last_login(test_user.id)
        
        assert updated_user is not None
        assert updated_user.last_login is not None

    def test_verify_user(self, db: Session, test_user: User):
        """Test verifying a user."""
        repo = UserRepository(db)
        
        # Set as unverified first
        test_user.is_verified = False
        db.commit()
        
        updated_user = repo.verify_user(test_user.id)
        
        assert updated_user is not None
        assert updated_user.is_verified is True

    def test_deactivate_user(self, db: Session, test_user: User):
        """Test deactivating a user."""
        repo = UserRepository(db)
        
        assert test_user.is_active is True
        
        updated_user = repo.deactivate_user(test_user.id)
        
        assert updated_user is not None
        assert updated_user.is_active is False

    def test_get_by_role(self, db: Session, test_user: User, test_admin: User, test_teacher: User):
        """Test getting users by role."""
        repo = UserRepository(db)
        
        students = repo.get_by_role(UserRole.STUDENT)
        admins = repo.get_by_role(UserRole.ADMIN)
        teachers = repo.get_by_role(UserRole.TEACHER)
        
        assert len(students) == 1
        assert students[0].id == test_user.id
        
        assert len(admins) == 1
        assert admins[0].id == test_admin.id
        
        assert len(teachers) == 1
        assert teachers[0].id == test_teacher.id

    def test_get_by_id(self, db: Session, test_user: User):
        """Test getting user by ID."""
        repo = UserRepository(db)
        
        user = repo.get_by_id(test_user.id)
        
        assert user is not None
        assert user.id == test_user.id

    def test_get_by_id_with_string(self, db: Session, test_user: User):
        """Test getting user by string ID."""
        repo = UserRepository(db)
        
        user = repo.get_by_id(str(test_user.id))
        
        assert user is not None
        assert user.id == test_user.id


class TestCourseRepository:
    """Test CourseRepository methods."""

    def test_get_by_slug(self, db: Session, test_course: Course):
        """Test getting course by slug."""
        repo = CourseRepository(db)
        
        # Set a slug
        test_course.slug = "test-course"
        db.commit()
        
        course = repo.get_by_slug("test-course")
        
        assert course is not None
        assert course.id == test_course.id

    def test_get_with_modules(self, db: Session, test_course: Course, test_module: Module):
        """Test getting course with modules."""
        repo = CourseRepository(db)
        
        course = repo.get_with_modules(test_course.id)
        
        assert course is not None
        assert len(course.modules) >= 1
        assert test_module.id in [m.id for m in course.modules]

    def test_get_published(self, db: Session, test_course: Course, test_teacher: User):
        """Test getting published courses."""
        repo = CourseRepository(db)
        
        # Create unpublished course
        unpublished = Course(
            id=uuid.uuid4(),
            title="Unpublished Course",
            description="Not published",
            created_by=test_teacher.id,
            is_published=False,
        )
        db.add(unpublished)
        db.commit()
        
        published_courses = repo.get_published()
        
        # Should only get published course
        assert len(published_courses) == 1
        assert published_courses[0].id == test_course.id
        assert published_courses[0].is_published is True

    def test_get_featured(self, db: Session, test_course: Course):
        """Test getting featured courses."""
        repo = CourseRepository(db)
        
        # Set course as featured
        test_course.is_featured = True
        db.commit()
        
        featured = repo.get_featured()
        
        assert len(featured) >= 1
        assert test_course.id in [c.id for c in featured]

    def test_search_by_title(self, db: Session, test_course: Course):
        """Test searching courses by title."""
        repo = CourseRepository(db)
        
        results = repo.search_by_title("Test")
        
        assert len(results) >= 1
        assert test_course.id in [c.id for c in results]

    def test_search_by_title_case_insensitive(self, db: Session, test_course: Course):
        """Test that search is case-insensitive."""
        repo = CourseRepository(db)
        
        results = repo.search_by_title("test")
        
        assert len(results) >= 1
        assert test_course.id in [c.id for c in results]

    def test_create(self, db: Session, test_teacher: User):
        """Test creating a course."""
        repo = CourseRepository(db)
        
        course = repo.create(
            title="New Course",
            description="A new course",
            created_by=test_teacher.id,
        )
        
        assert course.id is not None
        assert course.title == "New Course"
        assert course.description == "A new course"
        assert course.created_by == test_teacher.id

    def test_update(self, db: Session, test_course: Course):
        """Test updating a course."""
        repo = CourseRepository(db)
        
        updated = repo.update(test_course.id, title="Updated Title")
        
        assert updated is not None
        assert updated.title == "Updated Title"

    def test_delete(self, db: Session, test_course: Course):
        """Test deleting a course."""
        repo = CourseRepository(db)
        
        course_id = test_course.id
        success = repo.delete(course_id)
        
        assert success is True
        assert repo.get_by_id(course_id) is None


class TestModuleRepository:
    """Test ModuleRepository methods."""

    def test_get_by_course(self, db: Session, test_course: Course, test_module: Module):
        """Test getting modules by course."""
        repo = ModuleRepository(db)
        
        modules = repo.get_by_course(test_course.id)
        
        assert len(modules) >= 1
        assert test_module.id in [m.id for m in modules]

    def test_get_with_sections(self, db: Session, test_module: Module, test_section: Section):
        """Test getting module with sections."""
        repo = ModuleRepository(db)
        
        module = repo.get_with_sections(test_module.id)
        
        assert module is not None
        assert len(module.sections) >= 1
        assert test_section.id in [s.id for s in module.sections]

    def test_create(self, db: Session, test_course: Course):
        """Test creating a module."""
        repo = ModuleRepository(db)
        
        module = repo.create(
            course_id=test_course.id,
            title="New Module",
            description="A new module",
            order_index=2,
        )
        
        assert module.id is not None
        assert module.course_id == test_course.id
        assert module.title == "New Module"


class TestSectionRepository:
    """Test SectionRepository methods."""

    def test_get_by_module(self, db: Session, test_module: Module, test_section: Section):
        """Test getting sections by module."""
        repo = SectionRepository(db)
        
        sections = repo.get_by_module(test_module.id)
        
        assert len(sections) >= 1
        assert test_section.id in [s.id for s in sections]

    def test_get_with_knowledge_points(self, db: Session, test_section: Section, test_knowledge_point: KnowledgePoint):
        """Test getting section with knowledge points."""
        repo = SectionRepository(db)
        
        section = repo.get_with_knowledge_points(test_section.id)
        
        assert section is not None
        assert len(section.knowledge_points) >= 1
        assert test_knowledge_point.id in [kp.id for kp in section.knowledge_points]

    def test_create(self, db: Session, test_module: Module):
        """Test creating a section."""
        repo = SectionRepository(db)
        
        section = repo.create(
            module_id=test_module.id,
            title="New Section",
            content="New content",
            order_index=2,
        )
        
        assert section.id is not None
        assert section.module_id == test_module.id
        assert section.title == "New Section"


class TestKnowledgePointRepository:
    """Test KnowledgePointRepository methods."""

    def test_get_by_section(self, db: Session, test_section: Section, test_knowledge_point: KnowledgePoint):
        """Test getting knowledge points by section."""
        repo = KnowledgePointRepository(db)
        
        kps = repo.get_by_section(test_section.id)
        
        assert len(kps) >= 1
        assert test_knowledge_point.id in [kp.id for kp in kps]

    def test_create(self, db: Session, test_section: Section):
        """Test creating a knowledge point."""
        repo = KnowledgePointRepository(db)
        
        kp = repo.create(
            section_id=test_section.id,
            title="New KP",
            description="A new knowledge point",
            order_index=2,
        )
        
        assert kp.id is not None
        assert kp.section_id == test_section.id
        assert kp.title == "New KP"

    def test_update(self, db: Session, test_knowledge_point: KnowledgePoint):
        """Test updating a knowledge point."""
        repo = KnowledgePointRepository(db)
        
        updated = repo.update(test_knowledge_point.id, title="Updated KP")
        
        assert updated is not None
        assert updated.title == "Updated KP"

    def test_delete(self, db: Session, test_knowledge_point: KnowledgePoint):
        """Test deleting a knowledge point."""
        repo = KnowledgePointRepository(db)
        
        kp_id = test_knowledge_point.id
        success = repo.delete(kp_id)
        
        assert success is True
        assert repo.get_by_id(kp_id) is None


class TestBaseRepositoryMethods:
    """Test base repository methods that all repos inherit."""

    def test_get_all(self, db: Session, test_user: User, test_admin: User):
        """Test getting all records."""
        repo = UserRepository(db)
        
        all_users = repo.get_all()
        
        assert len(all_users) >= 2
        user_ids = [u.id for u in all_users]
        assert test_user.id in user_ids
        assert test_admin.id in user_ids

    def test_get_all_with_pagination(self, db: Session):
        """Test pagination in get_all."""
        repo = UserRepository(db)
        
        # Create multiple users
        for i in range(5):
            repo.create_user(
                email=f"user{i}@example.com",
                username=f"user{i}",
                full_name=f"User {i}",
                hashed_password="hash",
            )
        
        # Test pagination
        page1 = repo.get_all(skip=0, limit=2)
        page2 = repo.get_all(skip=2, limit=2)
        
        assert len(page1) == 2
        assert len(page2) == 2
        assert page1[0].id != page2[0].id

    def test_count(self, db: Session, test_user: User, test_admin: User):
        """Test counting records."""
        repo = UserRepository(db)
        
        count = repo.count()
        
        assert count >= 2

