# Backend Test Suite

Comprehensive test suite for the Adaptive Learning Platform backend.

## Overview

This test suite provides comprehensive coverage of:
- **Security utilities** - JWT tokens, password hashing, verification
- **Authentication service** - Registration, login, Google OAuth
- **Repository layer** - Database operations for all models
- **API endpoints** - Integration tests for all REST endpoints

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures and test configuration
├── test_security.py         # Security utility tests
├── test_auth_service.py     # Authentication service tests
├── test_repositories.py     # Repository layer tests
└── test_api_endpoints.py    # API integration tests
```

## Running Tests

### Prerequisites

Make sure you have the development dependencies installed:

```bash
# Using uv (recommended)
uv sync --dev

# Or using pip
pip install -e ".[dev]"
```

### Run All Tests

```bash
pytest
```

### Run Specific Test Files

```bash
# Security tests only
pytest tests/test_security.py

# Auth service tests only
pytest tests/test_auth_service.py

# Repository tests only
pytest tests/test_repositories.py

# API endpoint tests only
pytest tests/test_api_endpoints.py
```

### Run Specific Test Classes or Methods

```bash
# Run a specific test class
pytest tests/test_security.py::TestPasswordHashing

# Run a specific test method
pytest tests/test_security.py::TestPasswordHashing::test_hash_password
```

### Run Tests with Coverage

```bash
# Run with coverage report
pytest --cov=. --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Run Tests with Verbose Output

```bash
pytest -v
```

### Run Tests in Parallel

```bash
# Install pytest-xdist first
pip install pytest-xdist

# Run tests in parallel (4 workers)
pytest -n 4
```

## Test Configuration

The test configuration is defined in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
asyncio_mode = "auto"
```

## Fixtures

Common test fixtures are defined in `conftest.py`:

### Database Fixtures
- `db` - Fresh database session for each test
- `client` - FastAPI test client with database override

### User Fixtures
- `test_user` - Standard student user
- `test_admin` - Admin user
- `test_teacher` - Teacher user
- `test_google_user` - Google OAuth user
- `test_password` - Standard test password

### Course Content Fixtures
- `test_course` - Sample course
- `test_module` - Sample module
- `test_section` - Sample section
- `test_knowledge_point` - Sample knowledge point

### Authentication Fixtures
- `auth_headers` - Authorization headers for student user
- `admin_headers` - Authorization headers for admin user
- `teacher_headers` - Authorization headers for teacher user

## Writing New Tests

### Example Test Structure

```python
class TestYourFeature:
    """Test your feature functionality."""

    def test_basic_functionality(self, db: Session):
        """Test basic functionality."""
        # Arrange
        # ... setup test data
        
        # Act
        # ... perform action
        
        # Assert
        assert expected_result

    def test_edge_case(self, db: Session, test_user: User):
        """Test edge case with existing user."""
        # Use fixtures for common test data
        # ...
```

### Best Practices

1. **Use descriptive test names** - Test name should describe what it's testing
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Use fixtures** - Reuse common test data through fixtures
4. **Test one thing** - Each test should verify one behavior
5. **Use parametrize for similar tests** - Reduce code duplication
6. **Clean up resources** - Fixtures handle cleanup automatically

### Example with Parametrize

```python
import pytest

class TestRoles:
    @pytest.mark.parametrize("role", ["student", "teacher", "admin", "parent"])
    def test_role_creation(self, db: Session, role: str):
        """Test creating users with different roles."""
        # Test implementation
        pass
```

## Test Coverage

Current test coverage includes:

### Security Module (test_security.py)
- ✅ Password hashing and verification
- ✅ Access token creation and verification
- ✅ Refresh token creation and verification
- ✅ Token pair generation
- ✅ Edge cases (invalid tokens, expired tokens, etc.)

### Auth Service (test_auth_service.py)
- ✅ User registration (success and failures)
- ✅ User login (success and failures)
- ✅ Google OAuth login/registration
- ✅ Current user retrieval
- ✅ Account linking
- ✅ Username collision handling

### Repositories (test_repositories.py)
- ✅ User repository (CRUD operations)
- ✅ Course repository (CRUD operations, search, filtering)
- ✅ Module repository (CRUD operations, relationships)
- ✅ Section repository (CRUD operations, relationships)
- ✅ Knowledge Point repository (CRUD operations)
- ✅ Base repository methods (pagination, counting)

### API Endpoints (test_api_endpoints.py)
- ✅ Authentication endpoints (register, login, me, logout)
- ✅ Course endpoints (CRUD, search, permissions)
- ✅ Module endpoints (CRUD, permissions)
- ✅ Section endpoints (list, get)
- ✅ Knowledge Point endpoints (list, get)
- ✅ CORS configuration
- ✅ Error handling (404, 422, validation errors)

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          pip install -e ".[dev]"
      - name: Run tests
        run: |
          pytest --cov=. --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests Fail with Database Errors

The tests use an in-memory SQLite database, which should work out of the box. If you see database errors:

1. Check that all models are properly imported in `conftest.py`
2. Verify that `Base.metadata.create_all()` is being called
3. Ensure fixtures properly clean up after themselves

### Import Errors

If you see import errors:

1. Make sure you're in the backend directory
2. Ensure the package is installed in development mode: `pip install -e .`
3. Check your Python path includes the backend directory

### Fixture Not Found

If pytest can't find a fixture:

1. Check that `conftest.py` is in the correct location
2. Verify the fixture is properly defined with `@pytest.fixture`
3. Make sure you're not shadowing fixture names

## Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing Guide](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Testing Guide](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)

