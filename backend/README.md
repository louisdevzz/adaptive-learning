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
- ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=sqlalchemy&logoColor=white) **SQLAlchemy** - ORM for database interactions
- ![Alembic](https://img.shields.io/badge/Alembic-6BA81E?logo=alembic&logoColor=white) **Alembic** - Database migration tool
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white) **PostgreSQL** - Primary database for user data, content, and analytics
- ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white) **Redis** - Caching and session management
- ![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white) **OpenAI API** - Chat + Embeddings for AI-powered content generation
- ![Pydantic](https://img.shields.io/badge/Pydantic-E92063?logo=pydantic&logoColor=white) **Pydantic v2** - Data validation using Python type annotations
- ![OpenSearch](https://img.shields.io/badge/OpenSearch-005EB8?logo=opensearch&logoColor=white) **OpenSearch** - Full-text search and analytics
- ![Sentry](https://img.shields.io/badge/Sentry-362D59?logo=sentry&logoColor=white) **Sentry** - Error tracking and monitoring
- ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white) **JWT** - Authentication with access/refresh tokens
- **Python 3.10+** - Core programming language

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API routes and endpoints
│   │   └── v1/                 # API version 1
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── students.py     # Student management
│   │       ├── content.py      # Learning content
│   │       ├── analytics.py    # Learning analytics
│   │       └── ai.py           # AI-powered features
│   ├── core/                   # Core functionality
│   │   ├── config.py           # Configuration settings
│   │   ├── security.py         # Security utilities
│   │   └── database.py         # Database connection
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py
│   │   ├── content.py
│   │   └── analytics.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── user.py
│   │   ├── content.py
│   │   └── analytics.py
│   ├── services/               # Business logic
│   │   ├── adaptive.py         # Adaptive learning algorithms
│   │   ├── openai.py           # OpenAI integration
│   │   └── analytics.py        # Analytics processing
│   └── utils/                  # Utility functions
├── alembic/                    # Database migrations
├── tests/                      # Test files
├── main.py                     # Application entry point
├── pyproject.toml              # Project dependencies
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- Python 3.10 or higher
- PostgreSQL 14 or higher
- OpenAI API key

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   # Using pip
   pip install -r requirements.txt

   # Using poetry (recommended)
   poetry install

   # Using uv (fast)
   uv pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/adaptive_learning

   # Redis
   REDIS_URL=redis://localhost:6379/0

   # OpenAI
   OPENAI_API_KEY=sk-...

   # OpenSearch
   OPENSEARCH_URL=http://localhost:9200
   OPENSEARCH_USER=admin
   OPENSEARCH_PASSWORD=admin

   # Security
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Sentry
   SENTRY_DSN=https://...@sentry.io/...
   SENTRY_ENVIRONMENT=development

   # Application
   DEBUG=True
   API_V1_PREFIX=/api/v1
   CORS_ORIGINS=["http://localhost:5173"]

   # RBAC Roles
   ROLES=["admin", "teacher", "student", "parent"]
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

### Authentication
- `POST /api/v1/auth/register` - Register new user (with role assignment)
- `POST /api/v1/auth/login` - Login user (returns access + refresh tokens)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user (invalidate tokens)
- `GET /api/v1/auth/me` - Get current authenticated user

### Students
- `GET /api/v1/students/me` - Get current student profile
- `PUT /api/v1/students/me` - Update student profile
- `GET /api/v1/students/{id}/progress` - Get learning progress

### Content
- `GET /api/v1/content/` - List available content
- `GET /api/v1/content/{id}` - Get specific content
- `POST /api/v1/content/generate` - Generate AI content
- `GET /api/v1/content/recommend` - Get personalized recommendations

### Analytics
- `GET /api/v1/analytics/progress` - Get student progress
- `POST /api/v1/analytics/track` - Track learning activity
- `GET /api/v1/analytics/insights` - Get learning insights

### AI Features
- `POST /api/v1/ai/explain` - Get AI explanation of concept
- `POST /api/v1/ai/quiz` - Generate adaptive quiz
- `POST /api/v1/ai/feedback` - Get personalized feedback

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
- **Access tokens** - Short-lived (30 minutes), for API authentication
- **Refresh tokens** - Long-lived (7 days), for obtaining new access tokens
- Tokens stored in Redis for fast validation and revocation
- Automatic token refresh mechanism

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

### Redis Caching
Used for:
- Session management
- Token storage and validation
- API response caching
- Rate limiting

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

### Health Checks

- `GET /health` - Application health status
- `GET /api/v1/health` - Detailed health check

## Troubleshooting

### Common Issues

1. **Database connection error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL configuration
   - Ensure database exists

2. **OpenAI API errors**
   - Verify API key is valid
   - Check API quota/limits
   - Ensure proper error handling

3. **Migration conflicts**
   - Run `alembic history` to check status
   - Use `alembic downgrade` if needed
   - Recreate migration if necessary

## Contributing

See the main [README.md](../README.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
