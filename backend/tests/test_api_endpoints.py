"""Integration tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from models.course import Course
from models.module import Module
from models.section import Section
from models.user import User


class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_register_success(self, client: TestClient):
        """Test successful user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "full_name": "New User",
                "password": "SecurePass123!",
                "role": "student",
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        
        assert "user" in data
        assert "tokens" in data
        assert data["user"]["email"] == "newuser@example.com"
        assert data["tokens"]["access_token"]
        assert data["tokens"]["refresh_token"]

    def test_register_duplicate_email(self, client: TestClient, test_user: User):
        """Test registration with duplicate email."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user.email,
                "username": "different",
                "full_name": "Different User",
                "password": "SecurePass123!",
                "role": "student",
            },
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_register_invalid_email(self, client: TestClient):
        """Test registration with invalid email."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "username": "testuser",
                "full_name": "Test User",
                "password": "SecurePass123!",
                "role": "student",
            },
        )
        
        assert response.status_code == 422  # Validation error

    def test_login_success(self, client: TestClient, test_user: User, test_password: str):
        """Test successful login."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": test_password,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "user" in data
        assert "tokens" in data
        assert data["user"]["email"] == test_user.email
        assert data["tokens"]["access_token"]

    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login with wrong password."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "WrongPassword123!",
            },
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "Password123!",
            },
        )
        
        assert response.status_code == 401

    def test_get_me_authenticated(self, client: TestClient, auth_headers: dict):
        """Test getting current user info with valid token."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "email" in data
        assert "username" in data
        assert "role" in data

    def test_get_me_unauthenticated(self, client: TestClient):
        """Test getting current user without token."""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        
        assert response.status_code == 401

    def test_logout(self, client: TestClient, auth_headers: dict):
        """Test logout endpoint."""
        response = client.post("/api/v1/auth/logout", headers=auth_headers)
        
        assert response.status_code == 204


class TestCourseEndpoints:
    """Test course endpoints."""

    def test_list_courses(self, client: TestClient, db: Session, test_course: Course):
        """Test listing all courses."""
        response = client.get("/api/v1/courses/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_list_courses_published_only(self, client: TestClient, test_course: Course):
        """Test listing only published courses."""
        response = client.get("/api/v1/courses/?published_only=true")
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned courses should be published
        for course in data:
            assert course.get("is_published") is True

    def test_list_courses_pagination(self, client: TestClient, test_course: Course):
        """Test course list pagination."""
        response = client.get("/api/v1/courses/?skip=0&limit=5")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) <= 5

    def test_get_course_authenticated(self, client: TestClient, test_course: Course, auth_headers: dict):
        """Test getting course details with authentication."""
        response = client.get(
            f"/api/v1/courses/{test_course.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == str(test_course.id)
        assert data["title"] == test_course.title
        assert "modules" in data

    def test_get_course_unauthenticated(self, client: TestClient, test_course: Course):
        """Test that getting course requires authentication."""
        response = client.get(f"/api/v1/courses/{test_course.id}")
        
        assert response.status_code == 401

    def test_get_course_by_slug(self, client: TestClient, test_course: Course, auth_headers: dict, db: Session):
        """Test getting course by slug."""
        # Set a slug
        test_course.slug = "test-course"
        db.commit()
        
        response = client.get(
            "/api/v1/courses/slug/test-course",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == str(test_course.id)
        assert data["slug"] == "test-course"

    def test_create_course_as_teacher(self, client: TestClient, teacher_headers: dict):
        """Test creating course as teacher."""
        response = client.post(
            "/api/v1/courses/",
            headers=teacher_headers,
            json={
                "title": "New Course",
                "description": "A new test course",
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "New Course"
        assert data["description"] == "A new test course"

    def test_create_course_as_student(self, client: TestClient, auth_headers: dict):
        """Test that students cannot create courses."""
        response = client.post(
            "/api/v1/courses/",
            headers=auth_headers,
            json={
                "title": "New Course",
                "description": "A new test course",
            },
        )
        
        assert response.status_code == 403

    def test_update_course_as_teacher(self, client: TestClient, test_course: Course, teacher_headers: dict):
        """Test updating course as teacher."""
        response = client.put(
            f"/api/v1/courses/{test_course.id}",
            headers=teacher_headers,
            json={
                "title": "Updated Course Title",
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "Updated Course Title"

    def test_update_course_as_student(self, client: TestClient, test_course: Course, auth_headers: dict):
        """Test that students cannot update courses."""
        response = client.put(
            f"/api/v1/courses/{test_course.id}",
            headers=auth_headers,
            json={
                "title": "Updated Title",
            },
        )
        
        assert response.status_code == 403

    def test_delete_course_as_teacher(self, client: TestClient, test_course: Course, teacher_headers: dict):
        """Test deleting course as teacher."""
        response = client.delete(
            f"/api/v1/courses/{test_course.id}",
            headers=teacher_headers,
        )
        
        assert response.status_code == 200

    def test_delete_course_as_student(self, client: TestClient, test_course: Course, auth_headers: dict):
        """Test that students cannot delete courses."""
        response = client.delete(
            f"/api/v1/courses/{test_course.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 403

    def test_search_courses(self, client: TestClient, test_course: Course):
        """Test searching courses."""
        response = client.get("/api/v1/courses/search/?q=Test")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # Should find test course
        course_ids = [c["id"] for c in data]
        assert str(test_course.id) in course_ids

    def test_search_courses_no_query(self, client: TestClient):
        """Test search without query parameter."""
        response = client.get("/api/v1/courses/search/")
        
        assert response.status_code == 422  # Validation error


class TestModuleEndpoints:
    """Test module endpoints."""

    def test_list_modules_by_course(self, client: TestClient, test_course: Course, test_module: Module, auth_headers: dict):
        """Test listing modules for a course."""
        response = client.get(
            f"/api/v1/modules/course/{test_course.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        module_ids = [m["id"] for m in data]
        assert str(test_module.id) in module_ids

    def test_get_module(self, client: TestClient, test_module: Module, auth_headers: dict):
        """Test getting module details."""
        response = client.get(
            f"/api/v1/modules/{test_module.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == str(test_module.id)
        assert data["title"] == test_module.title

    def test_create_module_as_teacher(self, client: TestClient, test_course: Course, teacher_headers: dict):
        """Test creating module as teacher."""
        response = client.post(
            "/api/v1/modules/",
            headers=teacher_headers,
            json={
                "course_id": str(test_course.id),
                "title": "New Module",
                "description": "A new test module",
                "order_index": 2,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "New Module"
        assert data["course_id"] == str(test_course.id)

    def test_create_module_as_student(self, client: TestClient, test_course: Course, auth_headers: dict):
        """Test that students cannot create modules."""
        response = client.post(
            "/api/v1/modules/",
            headers=auth_headers,
            json={
                "course_id": str(test_course.id),
                "title": "New Module",
                "description": "A new test module",
                "order_index": 2,
            },
        )
        
        assert response.status_code == 403


class TestSectionEndpoints:
    """Test section endpoints."""

    def test_list_sections_by_module(self, client: TestClient, test_module: Module, test_section: Section, auth_headers: dict):
        """Test listing sections for a module."""
        response = client.get(
            f"/api/v1/sections/module/{test_module.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        section_ids = [s["id"] for s in data]
        assert str(test_section.id) in section_ids

    def test_get_section(self, client: TestClient, test_section: Section, auth_headers: dict):
        """Test getting section details."""
        response = client.get(
            f"/api/v1/sections/{test_section.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == str(test_section.id)
        assert data["title"] == test_section.title


class TestKnowledgePointEndpoints:
    """Test knowledge point endpoints."""

    def test_list_knowledge_points_by_section(self, client: TestClient, test_section: Section, test_knowledge_point, auth_headers: dict):
        """Test listing knowledge points for a section."""
        response = client.get(
            f"/api/v1/knowledge-points/section/{test_section.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_knowledge_point(self, client: TestClient, test_knowledge_point, auth_headers: dict):
        """Test getting knowledge point details."""
        response = client.get(
            f"/api/v1/knowledge-points/{test_knowledge_point.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == str(test_knowledge_point.id)
        assert data["title"] == test_knowledge_point.title


class TestCORSHeaders:
    """Test CORS configuration."""

    def test_cors_headers_on_preflight(self, client: TestClient):
        """Test CORS headers are present on OPTIONS request."""
        response = client.options(
            "/api/v1/courses/",
            headers={"Origin": "http://localhost:3000"},
        )
        
        # CORS should allow the request
        assert "access-control-allow-origin" in [h.lower() for h in response.headers.keys()]


class TestErrorHandling:
    """Test error handling."""

    def test_404_on_invalid_course_id(self, client: TestClient, auth_headers: dict):
        """Test 404 error for non-existent course."""
        import uuid
        fake_id = uuid.uuid4()
        
        response = client.get(
            f"/api/v1/courses/{fake_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 404

    def test_validation_error_on_invalid_uuid(self, client: TestClient, auth_headers: dict):
        """Test validation error for invalid UUID format."""
        response = client.get(
            "/api/v1/courses/not-a-uuid",
            headers=auth_headers,
        )
        
        assert response.status_code == 422

    def test_422_on_missing_required_fields(self, client: TestClient, teacher_headers: dict):
        """Test validation error when missing required fields."""
        response = client.post(
            "/api/v1/courses/",
            headers=teacher_headers,
            json={
                # Missing required 'title' field
                "description": "A course without title",
            },
        )
        
        assert response.status_code == 422

