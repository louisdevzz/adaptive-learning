# Adaptive Learning Backend - Setup Guide

This guide will help you set up and run the Adaptive Learning backend.

## Quick Start

```bash
# 1. Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Clone and navigate to backend directory
cd backend

# 3. Install dependencies
uv sync

# 4. Setup environment
cp .env.example .env
# Edit DATABASE_URL in .env with your Neon connection string

# 5. Run migrations
uv run alembic revision --autogenerate -m "Initial migration"
uv run alembic upgrade head

# 6. Start server
uv run uvicorn main:app --reload
```

Visit http://localhost:8000/docs to see the API documentation.

## Architecture Overview

The backend follows a clean architecture pattern with clear separation of concerns:

```
backend/
├── api/                      # API endpoints (FastAPI routes)
│   ├── v1/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── courses.py       # Course CRUD endpoints
│   │   ├── modules.py       # Module CRUD endpoints
│   │   ├── sections.py      # Section CRUD endpoints
│   │   └── knowledge_points.py  # Knowledge point + mastery tracking
│   └── dependencies.py      # Common dependencies (auth, role checks)
│
├── core/                    # Core configuration
│   ├── config.py           # Settings and configuration
│   ├── database.py         # Database connection and session
│   └── security.py         # JWT and password utilities
│
├── models/                  # SQLAlchemy ORM models
│   ├── user.py             # User model with roles
│   ├── course.py           # Course model
│   ├── module.py           # Module model
│   ├── section.py          # Section model
│   ├── knowledge_point.py  # Knowledge point model
│   └── mastery.py          # Mastery tracking model
│
├── schemas/                 # Pydantic validation schemas
│   ├── auth_schema.py      # Auth request/response schemas
│   ├── course_schema.py    # Course schemas
│   ├── module_schema.py    # Module schemas
│   ├── section_schema.py   # Section schemas
│   ├── kp_schema.py        # Knowledge point schemas
│   └── mastery_schema.py   # Mastery tracking schemas
│
├── repositories/            # Data access layer
│   ├── base_repo.py        # Base repository with common CRUD
│   ├── user_repo.py        # User data access
│   ├── course_repo.py      # Course data access
│   ├── module_repo.py      # Module data access
│   ├── section_repo.py     # Section data access
│   ├── kp_repo.py          # Knowledge point data access
│   └── mastery_repo.py     # Mastery tracking data access
│
├── services/                # Business logic layer
│   ├── auth_service.py     # Authentication logic
│   ├── course_service.py   # Course business logic
│   ├── module_service.py   # Module business logic
│   ├── section_service.py  # Section business logic
│   ├── kp_service.py       # Knowledge point logic
│   └── mastery_service.py  # Adaptive learning algorithms
│
├── utils/                   # Utility functions
│   └── google_oauth.py     # Google OAuth helpers
│
├── alembic/                 # Database migrations
│   ├── env.py              # Migration environment
│   ├── script.py.mako      # Migration template
│   └── versions/           # Migration files
│
├── main.py                  # FastAPI application entry point
├── pyproject.toml          # Dependencies
├── alembic.ini             # Alembic configuration
└── .env.example            # Environment variables template
```

## Prerequisites

- Python 3.10+
- uv (Python package installer) - https://github.com/astral-sh/uv
- Neon PostgreSQL (cloud database) - https://neon.tech OR local PostgreSQL 14+
- Redis (optional, for caching)
- Google OAuth credentials (for Google login)
- OpenAI API key (for AI features)

## Installation

### 1. Install uv (if not already installed)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or using Homebrew
brew install uv
```

### 2. Install Dependencies

```bash
# Install all dependencies (uv automatically creates virtual environment)
uv sync

# Or install separately
uv pip install -e .

# Install dev dependencies
uv pip install -e ".[dev]"
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and configure:
# - DATABASE_URL: Your PostgreSQL connection string
# - SECRET_KEY: Generate with `openssl rand -hex 32`
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
# - OPENAI_API_KEY
# - Other settings as needed
```

### 4. Set Up Database

#### Option A: Using Neon (Cloud PostgreSQL) - Recommended

1. Create an account at https://neon.tech
2. Create a new project
3. Copy the connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)
4. Paste it into the `.env` file:
   ```
   DATABASE_URL='postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require'
   ```

5. Generate migration from models (only needed once initially):
   ```bash
   uv run alembic revision --autogenerate -m "Initial migration"
   ```

6. Apply migrations to the database:
   ```bash
   uv run alembic upgrade head
   ```

7. Verify that tables were created:
   ```bash
   psql "your-neon-connection-string" -c "\dt"
   ```

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL:
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. Create the database:
   ```bash
   createdb adaptive_learning
   ```

3. Update `.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/adaptive_learning
   ```

4. Run migrations:
   ```bash
   uv run alembic revision --autogenerate -m "Initial migration"
   uv run alembic upgrade head
   ```

### 5. Run the Application

```bash
# Development mode (with auto-reload) - Recommended
uv run uvicorn main:app --reload --port 8000

# Or using python directly
uv run python main.py
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register with email/password
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/google` - Login/register with Google OAuth
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Courses
- `POST /api/v1/courses/` - Create course (teacher/admin)
- `GET /api/v1/courses/` - List all courses
- `GET /api/v1/courses/{id}` - Get course with modules
- `PUT /api/v1/courses/{id}` - Update course (teacher/admin)
- `DELETE /api/v1/courses/{id}` - Delete course (teacher/admin)
- `GET /api/v1/courses/search/?q=query` - Search courses

### Modules
- `POST /api/v1/modules/` - Create module (teacher/admin)
- `GET /api/v1/modules/course/{course_id}` - List modules for a course
- `GET /api/v1/modules/{id}` - Get module with sections
- `PUT /api/v1/modules/{id}` - Update module (teacher/admin)
- `DELETE /api/v1/modules/{id}` - Delete module (teacher/admin)

### Sections
- `POST /api/v1/sections/` - Create section (teacher/admin)
- `GET /api/v1/sections/module/{module_id}` - List sections for a module
- `GET /api/v1/sections/{id}` - Get section with knowledge points
- `PUT /api/v1/sections/{id}` - Update section (teacher/admin)
- `DELETE /api/v1/sections/{id}` - Delete section (teacher/admin)

### Knowledge Points & Mastery
- `POST /api/v1/knowledge-points/` - Create knowledge point (teacher/admin)
- `GET /api/v1/knowledge-points/section/{section_id}` - List KPs for a section
- `GET /api/v1/knowledge-points/{id}` - Get knowledge point
- `PUT /api/v1/knowledge-points/{id}` - Update KP (teacher/admin)
- `DELETE /api/v1/knowledge-points/{id}` - Delete KP (teacher/admin)
- `POST /api/v1/knowledge-points/progress` - Track learning progress
- `GET /api/v1/knowledge-points/mastery/summary` - Get progress summary
- `GET /api/v1/knowledge-points/mastery/recommendations` - Get learning recommendations

## Key Features

### 1. Role-Based Access Control (RBAC)

Four user roles with different permissions:
- **Admin**: Full system access
- **Teacher**: Create/manage content, view student progress
- **Student**: Access learning content, track progress
- **Parent**: View child's progress (future feature)

### 2. JWT Authentication

- Access tokens (30 min expiry) for API authentication
- Refresh tokens (7 days expiry) for token renewal
- Secure password hashing with bcrypt
- Google OAuth integration

### 3. Adaptive Learning Algorithm

The mastery service tracks:
- Mastery level (0.0 to 1.0) per knowledge point
- Success rate and attempt count
- Time spent on each concept
- Personalized recommendations based on performance

### 4. Hierarchical Content Structure

```
Course
  └─ Module (Chapter)
      └─ Section (Lesson)
          └─ Knowledge Point (Concept)
```

### 5. Database Schema

Key relationships:
- Users have many MasteryRecords
- Courses have many Modules (ordered)
- Modules have many Sections (ordered)
- Sections have many KnowledgePoints (ordered)
- KnowledgePoints have many MasteryRecords

## Common Commands

```bash
# Start development server
uv run uvicorn main:app --reload

# Create new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Check migration status
uv run alembic current

# Rollback migration
uv run alembic downgrade -1

# Run tests
uv run pytest

# Format code
uv run black .

# Lint code
uv run ruff check .
```

## Development Workflow

### Running Migrations

```bash
# Create a new migration after model changes
uv run alembic revision --autogenerate -m "description"

# Review the generated migration file in alembic/versions/
# Then apply it:
uv run alembic upgrade head

# Check current migration version
uv run alembic current

# Rollback one migration
uv run alembic downgrade -1

# View migration history
uv run alembic history
```

### Testing

```bash
# Run tests
uv run pytest

# With coverage
uv run pytest --cov=. --cov-report=html
```

### Code Quality

```bash
# Format code
uv run black .

# Lint code
uv run ruff check .

# Type checking
uv run mypy .
```

## Deployment

### Environment Variables

Ensure all required environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Secret key for JWT
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - For OAuth
- `OPENAI_API_KEY` - For AI features
- Set `DEBUG=False` in production

### Running in Production

```bash
# Using uvicorn with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Or using gunicorn with uvicorn workers
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Database Connection Errors

**Neon (Cloud PostgreSQL):**
- Verify connection string has `sslmode=require`
- Check IP allowlist on Neon console (if any)
- Test connection: `psql "your-connection-string" -c "SELECT 1;"`
- Check Neon project status on the dashboard

**Local PostgreSQL:**
- Verify PostgreSQL is running: `brew services list | grep postgres`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb adaptive_learning`
- Check PostgreSQL logs: `tail -f /opt/homebrew/var/log/postgresql@14.log`

### Migration Errors

- **"No such file or directory: alembic/versions/"**: Empty folder, need to run `uv run alembic revision --autogenerate -m "Initial migration"`
- **"Target database is not up to date"**: Run `uv run alembic upgrade head`
- Check `alembic/env.py` imports all models
- Review migration file before applying
- Check migration status: `uv run alembic current`
- View all migrations: `uv run alembic history`

### Import Errors

- Ensure all `__init__.py` files exist
- Check Python path includes the backend directory
- Verify dependencies are installed: `uv sync`
- Clear Python cache: `find . -type d -name __pycache__ -exec rm -r {} +`

### uv-specific Issues

- **"command not found: uv"**: Install uv with `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Virtual environment issues**: Delete `.venv` and run `uv sync` again
- **Package not found**: Run `uv pip list` to view installed packages

## Next Steps

1. **Set up Redis** for caching and session management
2. **Implement OpenAI integration** for content generation
3. **Add email verification** for new users
4. **Implement password reset** functionality
5. **Add comprehensive tests** for all endpoints
6. **Set up CI/CD pipeline** for automated testing and deployment
7. **Add API rate limiting** with Redis
8. **Implement WebSocket support** for real-time updates

## Support

For issues or questions, please refer to the main README or create an issue in the repository.
