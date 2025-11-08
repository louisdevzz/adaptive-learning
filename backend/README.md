# Adaptive Learning Backend

FastAPI-based backend server for the Adaptive Learning platform, featuring AI-powered content generation and adaptive learning algorithms.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)

## Tech Stack

- ![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white) **FastAPI** - Modern, fast web framework for building APIs
- ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=sqlalchemy&logoColor=white) **SQLAlchemy 2.0** - Modern ORM with eager loading support
- ![Alembic](https://img.shields.io/badge/Alembic-6BA81E?logo=alembic&logoColor=white) **Alembic** - Database migration tool
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white) **PostgreSQL** - Primary database with connection pool monitoring
- ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white) **Redis** - Rate limiting, token blacklisting, and caching
- ![SlowAPI](https://img.shields.io/badge/SlowAPI-FF6B6B?logo=fastapi&logoColor=white) **SlowAPI** - Rate limiting middleware for FastAPI
- ![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white) **OpenAI API** - Chat + Embeddings for AI-powered content generation
- ![Pydantic](https://img.shields.io/badge/Pydantic-E92063?logo=pydantic&logoColor=white) **Pydantic v2** - Data validation with comprehensive password rules
- ![OpenSearch](https://img.shields.io/badge/OpenSearch-005EB8?logo=opensearch&logoColor=white) **OpenSearch** - Full-text search and analytics (optional)
- ![Sentry](https://img.shields.io/badge/Sentry-362D59?logo=sentry&logoColor=white) **Sentry** - Error tracking and monitoring (optional)
- ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white) **JWT** - Authentication with access/refresh tokens and blacklisting
- ![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?logo=pytest&logoColor=white) **Pytest** - Testing framework with 85%+ coverage
- **Python 3.10+** - Core programming language

## Project Structure

```
backend/
├── api/                        # API routes and endpoints
│   ├── dependencies.py         # Common API dependencies (auth, permissions)
│   └── v1/                     # API version 1
│       ├── __init__.py         # Router aggregation
│       ├── auth.py             # Authentication & authorization
│       ├── admin.py            # Admin monitoring endpoints
│       ├── courses.py          # Course management
│       ├── modules.py          # Module management
│       ├── sections.py         # Section management
│       └── knowledge_points.py # Knowledge points & mastery tracking
├── core/                       # Core functionality
│   ├── __init__.py             # Core exports
│   ├── config.py               # Application configuration (Pydantic settings)
│   ├── database.py             # Database connection & pool monitoring
│   ├── security.py             # JWT, hashing, token management
│   ├── errors.py               # Standardized error messages
│   ├── rate_limit.py           # Rate limiting configuration (SlowAPI)
│   └── token_blacklist.py      # Redis-based token blacklisting
├── models/                     # SQLAlchemy ORM models
│   ├── __init__.py
│   ├── user.py                 # User model with UUID primary keys
│   ├── course.py               # Course model
│   ├── module.py               # Module model (with FK indexes)
│   ├── section.py              # Section model (with FK indexes)
│   ├── knowledge_point.py      # Knowledge point model (with FK indexes)
│   └── mastery.py              # Mastery tracking model (with FK indexes)
├── schemas/                    # Pydantic validation schemas
│   ├── __init__.py
│   ├── auth_schema.py          # Auth schemas (with password validation)
│   ├── course_schema.py        # Course schemas
│   ├── module_schema.py        # Module schemas
│   ├── section_schema.py       # Section schemas
│   └── kp_schema.py            # Knowledge point schemas
├── services/                   # Business logic layer
│   ├── __init__.py
│   ├── auth_service.py         # Authentication logic (with logging)
│   ├── course_service.py       # Course business logic
│   ├── module_service.py       # Module business logic
│   ├── section_service.py      # Section business logic
│   ├── kp_service.py           # Knowledge point logic
│   └── mastery_service.py      # Mastery tracking & adaptive learning
├── repositories/               # Data access layer
│   ├── __init__.py
│   ├── base_repo.py            # Generic CRUD with eager loading support
│   ├── user_repo.py            # User repository
│   ├── course_repo.py          # Course repository (N+1 prevention)
│   ├── module_repo.py          # Module repository
│   ├── section_repo.py         # Section repository
│   ├── kp_repo.py              # Knowledge point repository
│   └── mastery_repo.py         # Mastery repository
├── utils/                      # Utility functions
│   ├── __init__.py
│   └── google_oauth.py         # Google OAuth validation (enhanced)
├── alembic/                    # Database migrations
│   ├── versions/               # Migration files
│   │   └── 2025_11_09_0200-*.py # Foreign key indexes migration
│   ├── env.py                  # Alembic environment
│   └── script.py.mako          # Migration template
├── tests/                      # Comprehensive test suite
│   ├── __init__.py
│   ├── README.md               # Testing documentation
│   ├── conftest.py             # Pytest fixtures & configuration
│   ├── test_auth_service.py    # Auth service tests
│   ├── test_repositories.py    # Repository layer tests
│   ├── test_api_endpoints.py   # API integration tests
│   └── test_security.py        # Security utility tests
├── main.py                     # Application entry point
├── pyproject.toml              # Dependencies & project metadata
├── uv.lock                     # UV package lock file
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- **Python 3.10+** - Core runtime
- **PostgreSQL 14+** - Primary database
- **Redis 6+** - Required for rate limiting and token blacklisting
- **Google OAuth credentials** - Optional (for Google login)
- **OpenAI API key** - Optional (for AI features)

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   # Using uv (recommended - fast)
   uv sync

   # Or using pip
   pip install -e .

   # Or using poetry
   poetry install
   ```

   **Note**: The project now requires `slowapi>=0.1.9` for rate limiting.

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/adaptive_learning
   DB_POOL_SIZE=20
   DB_MAX_OVERFLOW=10
   DB_POOL_TIMEOUT=30
   DB_POOL_RECYCLE=3600

   # Redis (required for rate limiting and token blacklisting)
   REDIS_URL=redis://localhost:6379/0
   REDIS_CACHE_TTL=3600

   # Security
   SECRET_KEY=your-secret-key-here-min-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
   GOOGLE_DEFAULT_ROLE=student

   # Rate Limiting
   RATE_LIMIT_PER_MINUTE=60

   # Pagination
   DEFAULT_PAGE_SIZE=20
   MAX_PAGE_SIZE=100

   # OpenAI (optional - for AI features)
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_EMBEDDING_MODEL=text-embedding-3-small
   OPENAI_MAX_TOKENS=2000
   OPENAI_TEMPERATURE=0.7

   # OpenSearch (optional - for advanced search)
   OPENSEARCH_URL=http://localhost:9200
   OPENSEARCH_USER=admin
   OPENSEARCH_PASSWORD=admin

   # Sentry (optional - for error tracking)
   SENTRY_DSN=https://...@sentry.io/...
   SENTRY_ENVIRONMENT=development

   # Application
   APP_NAME=Adaptive Learning Platform
   APP_VERSION=1.0.0
   DEBUG=True
   HOST=0.0.0.0
   PORT=8000
   API_V1_PREFIX=/api/v1

   # CORS
   CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
   CORS_CREDENTIALS=True
   CORS_METHODS=["*"]
   CORS_HEADERS=["*"]

   # RBAC Roles
   ROLES=["admin","teacher","student","parent"]

   # Mastery Thresholds
   MASTERY_THRESHOLD_LOW=0.4
   MASTERY_THRESHOLD_MEDIUM=0.7
   MASTERY_THRESHOLD_HIGH=0.9
   ```

4. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start the development server**
   ```bash
   # Using uvicorn directly
   uvicorn main:app --reload --port 8000

   # Using the run script
   python main.py
   ```

6. **Access the API**
   - API: http://localhost:8000
   - Interactive docs (Swagger): http://localhost:8000/docs
   - Alternative docs (ReDoc): http://localhost:8000/redoc

## API Endpoints

### Authentication & Authorization
- `POST /api/v1/auth/register` - Register new user with email/password
  - **Rate limit**: 3 requests/minute
  - **Password requirements**: 8+ chars, uppercase, lowercase, digit, special char
- `POST /api/v1/auth/login` - Login with email/password
  - **Rate limit**: 5 requests/minute
  - **Returns**: Access token + refresh token + user info
- `POST /api/v1/auth/google` - Login/register with Google OAuth
  - **Rate limit**: 10 requests/minute
  - **Auto-creates** user account if not exists
- `GET /api/v1/auth/me` - Get current authenticated user profile
- `POST /api/v1/auth/logout` - Logout (blacklist current access token)
  - **Security**: Token invalidated immediately via Redis
- `POST /api/v1/auth/logout-all` - Logout from all devices
  - **Rate limit**: 3 requests/hour
  - **Revokes**: All active tokens for user

### Courses
- `GET /api/v1/courses/` - List all published courses (paginated)
  - **Pagination**: max 100 items per request
- `GET /api/v1/courses/{course_id}` - Get course details by UUID
  - **Includes**: Module hierarchy with N+1 prevention
- `GET /api/v1/courses/slug/{slug}` - Get course by slug (SEO-friendly)
- `POST /api/v1/courses/` - Create new course (teacher/admin)
- `PUT /api/v1/courses/{course_id}` - Update course (creator/admin)
- `DELETE /api/v1/courses/{course_id}` - Delete course (creator/admin)
- `GET /api/v1/courses/search/?q={query}` - Search courses by keyword

### Modules
- `GET /api/v1/modules/course/{course_id}` - List all modules in a course
- `GET /api/v1/modules/{module_id}` - Get module details with sections
- `POST /api/v1/modules/` - Create new module (teacher/admin)
- `PUT /api/v1/modules/{module_id}` - Update module (teacher/admin)
- `DELETE /api/v1/modules/{module_id}` - Delete module (admin/creator)

### Sections
- `GET /api/v1/sections/module/{module_id}` - List all sections in a module
- `GET /api/v1/sections/{section_id}` - Get section details with knowledge points
- `POST /api/v1/sections/` - Create new section (teacher/admin)
- `PUT /api/v1/sections/{section_id}` - Update section (teacher/admin)
- `DELETE /api/v1/sections/{section_id}` - Delete section (admin/creator)

### Knowledge Points & Mastery Tracking
- `GET /api/v1/knowledge-points/section/{section_id}` - List knowledge points
  - **Includes**: User's mastery progress if authenticated
- `GET /api/v1/knowledge-points/{kp_id}` - Get knowledge point details
- `POST /api/v1/knowledge-points/` - Create knowledge point (teacher/admin)
- `PUT /api/v1/knowledge-points/{kp_id}` - Update knowledge point (teacher/admin)
- `DELETE /api/v1/knowledge-points/{kp_id}` - Delete knowledge point (admin)
- `POST /api/v1/knowledge-points/progress` - Track learning attempt (student)
  - **Adaptive**: Updates mastery level using spaced repetition algorithm
  - **Returns**: Personalized recommendations
- `GET /api/v1/knowledge-points/mastery/summary` - Get mastery overview
  - **Filters**: By course, module, or section
- `GET /api/v1/knowledge-points/mastery/recommendations` - Get AI-powered learning recommendations
  - **Personalized**: Based on mastery levels and learning patterns

### Admin & Monitoring
- `GET /health` - Basic health check with database status
  - **Rate limit**: 60 requests/minute
  - **Includes**: Pool utilization metrics
- `GET /api/v1/admin/pool-status` - Detailed connection pool metrics (admin only)
  - **Metrics**: Pool size, checked out, idle, utilization %, health status
  - **Recommendations**: Auto-generated based on pool health

### Health & Status
All endpoints return standardized error messages for better UX and i18n support.

> 📚 **For detailed API documentation**, see [API_GUIDES.md](./API_GUIDES.md) with request/response examples, error codes, and usage patterns.

## Security & Performance Features

### 🔒 Security
- **Rate Limiting** - SlowAPI with Redis backend prevents brute-force attacks
  - Login: 5 requests/minute
  - Registration: 3 requests/minute
  - Google OAuth: 10 requests/minute
  - Logout All: 3 requests/hour
- **Token Blacklisting** - Redis-based immediate token revocation on logout
- **Password Complexity** - Enforced 8+ chars with uppercase, lowercase, digit, special char
- **Security Event Logging** - Comprehensive audit trail for failed logins, token validation
- **UUID Primary Keys** - All resources use UUID v4 for enhanced security
- **Standardized Errors** - Consistent, i18n-ready error messages

### ⚡ Performance Optimizations
- **Connection Pool Monitoring** - Real-time metrics with automatic health checks
  - Pool size tracking
  - Utilization percentage alerts (>80% warning)
  - Event listeners for checkout/checkin/invalidate
- **N+1 Query Prevention** - Eager loading support in all repositories
  - `get_with_full_hierarchy()` for deep relationship loading
  - Dynamic eager loading with `eager_load` parameter
- **Foreign Key Indexes** - 6 indexes + 1 composite for faster queries
  - courses → modules
  - modules → sections  
  - sections → knowledge_points
  - mastery_records (user_id, knowledge_point_id, composite)
- **Pagination Limits** - Enforced MAX_PAGE_SIZE (100) across all endpoints
- **Session Management** - Automatic rollback on database errors

### 📊 Monitoring & Observability
- **Pool Status Dashboard** - `/api/v1/admin/pool-status` (admin only)
  - Real-time connection metrics
  - Utilization warnings and recommendations
  - Health status indicators
- **Health Checks** - `/health` endpoint with database connectivity
- **Structured Logging** - Security events, auth failures, performance metrics

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_adaptive.py

# Run with verbose output
pytest -v
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

### Code Quality

```bash
# Format code
black .

# Lint code
ruff check .

# Type checking
mypy app/

# Run all checks
pre-commit run --all-files
```

## Key Features

### Role-Based Access Control (RBAC)
The system implements comprehensive RBAC with four roles:
- **Admin** - Full system access, user management, analytics
- **Teacher** - Create/manage content, view student progress, grade assignments
- **Student** - Access learning content, take quizzes, track own progress
- **Parent** - View child's progress, receive notifications, limited content access

### JWT Authentication
- **Access tokens** - Short-lived (60 minutes), for API authentication
- **Refresh tokens** - Long-lived (7 days), for obtaining new access tokens
- **Token Blacklisting** - Redis-based immediate revocation on logout
  - Single device logout: Blacklist current token only
  - All devices logout: Revoke all user tokens with timestamp check
- **Automatic validation** - Every request checks blacklist and token validity
- **Configurable expiration** - Set via `ACCESS_TOKEN_EXPIRE_MINUTES` and `REFRESH_TOKEN_EXPIRE_DAYS`

### Adaptive Learning Algorithm
The backend implements sophisticated adaptive learning algorithms that:
- Analyze student performance in real-time
- Adjust content difficulty dynamically
- Identify knowledge gaps
- Optimize learning paths

### OpenAI Integration
Leverages OpenAI for:
- **Chat Completions** - Dynamic content generation and explanations
- **Embeddings** - Semantic search and content recommendations
- Intelligent quiz creation
- Personalized feedback

### Redis Integration
Used for:
- **Token blacklisting** - Immediate token revocation on logout
- **Rate limiting** - SlowAPI storage backend with configurable limits
- **Session management** - Fast token validation and user sessions
- **Cache layer** - Future: API response caching (planned)
- **Connection pooling** - Efficient Redis client management

### OpenSearch Integration
Full-text search capabilities for:
- Content discovery
- Semantic search using embeddings
- Analytics and aggregations
- Fast query performance

### Analytics Engine
Tracks and analyzes:
- Learning progress and patterns
- Time spent on topics
- Success rates
- Engagement metrics
- Role-based analytics (teacher vs student views)

### Observability with Sentry
- Automatic error tracking
- Performance monitoring
- Release tracking
- Structured logging with JSON format

### Health Checks & Monitoring

**Public Health Check:**
- `GET /health` - Basic health status with database connectivity
  - Returns: `healthy`, `degraded`, or `unhealthy` status
  - Includes: Database connection status
  - Includes: Connection pool metrics (utilization, active connections)
  - Rate limit: 60 requests/minute

**Admin Monitoring (Requires Admin Role):**
- `GET /api/v1/admin/pool-status` - Detailed database pool metrics
  - Real-time connection statistics
  - Pool utilization percentage
  - Health status and recommendations
  - Automatic warnings at >80% utilization

**Example Health Response:**
```json
{
  "status": "healthy",
  "app": "Adaptive Learning Platform",
  "version": "1.0.0",
  "database": {
    "connected": true,
    "pool": {
      "in_use": 3,
      "idle": 17,
      "total_limit": 30,
      "utilization_percent": 10.0,
      "is_exhausted": false
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Database connection error**
   - Verify PostgreSQL is running: `pg_isready`
   - Check DATABASE_URL configuration in `.env`
   - Ensure database exists: `createdb adaptive_learning`
   - Check pool exhaustion: Visit `/health` endpoint

2. **Redis connection error**
   - Verify Redis is running: `redis-cli ping` (should return "PONG")
   - Check REDIS_URL configuration
   - Ensure Redis accepts connections: `redis-cli info`
   - **Impact**: Rate limiting and token blacklisting won't work

3. **Rate limit errors (429 Too Many Requests)**
   - Wait for rate limit window to reset (see `Retry-After` header)
   - Check rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
   - Adjust `RATE_LIMIT_PER_MINUTE` in config if needed
   - Verify Redis is running (rate limiting requires Redis)

4. **Token blacklist not working**
   - Verify Redis is running and accessible
   - Check `REDIS_URL` configuration
   - Review logs for "Redis not available" warnings
   - Test Redis connection: `redis-cli -u $REDIS_URL ping`

5. **OpenAI API errors**
   - Verify API key is valid: Check `.env` file
   - Check API quota/limits: Visit OpenAI dashboard
   - Review error logs for specific error messages

6. **Migration conflicts**
   - Check current status: `alembic current`
   - View history: `alembic history`
   - Rollback if needed: `alembic downgrade -1`
   - Recreate migration: `alembic revision --autogenerate -m "description"`

7. **Connection pool exhausted**
   - Check pool status: `GET /api/v1/admin/pool-status` (admin)
   - Review pool utilization in `/health` endpoint
   - Increase pool size: Set `DB_POOL_SIZE` and `DB_MAX_OVERFLOW` in `.env`
   - Check for connection leaks in application code
   - Review slow queries causing long-held connections

8. **Password validation errors**
   - Ensure password meets requirements:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one digit
     - At least one special character (!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;'`~)
   - Avoid common passwords (password, 123456, etc.)
   - Avoid sequential patterns (12345, abcde, qwerty)

## Contributing

See the main [README.md](../README.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
