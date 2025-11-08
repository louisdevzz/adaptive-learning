# Adaptive Learning v3.0

An intelligent adaptive learning platform that personalizes educational content based on student performance and learning patterns.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![OpenSearch](https://img.shields.io/badge/OpenSearch-005EB8?style=for-the-badge&logo=opensearch&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Overview

Adaptive Learning v3.0 is a full-stack application that leverages AI to create personalized learning experiences. The system analyzes student interactions, adapts content difficulty, and provides intelligent recommendations to optimize learning outcomes.

## Architecture

```
User Query
    ↓
FastAPI Backend (Python)
    ↓
├── OpenAI Embeddings (vector search)
├── OpenSearch (semantic search)
├── PostgreSQL (structured data)
└── Redis (caching)
    ↓
Return Personalized Content
```

## Key Features

- **Adaptive Learning Paths** - Dynamically adjusts content based on student performance
- **Semantic Search** - OpenSearch with AI embeddings for intelligent content discovery
- **AI-Powered Content** - Uses OpenAI for content generation and embeddings
- **Real-time Analytics** - Track student progress and learning patterns
- **Personalized Recommendations** - Suggests next steps based on individual learning style
- **Interactive UI** - Modern, responsive interface built with React

## Tech Stack

### Backend
- **FastAPI** - Modern async Python web framework
- **PostgreSQL** - Primary database (Neon or local)
- **OpenSearch** - Vector search engine for semantic search
- **Redis** - Caching and session management
- **OpenAI** - Embeddings (text-embedding-3-small) and content generation
- **SQLAlchemy** - Async ORM
- **Alembic** - Database migrations

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS
- **Vite** - Build tool

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- OpenAI API key

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Copy environment file
cp .env.example .env
# Edit .env with your database URL and API keys

# Start infrastructure (PostgreSQL, Redis, OpenSearch)
cd docker
docker-compose -f docker-compose.full.yaml up -d

# Run migrations
cd ..
uv run alembic upgrade head

# Start backend server
uv run uvicorn main:app --reload
```

API will be available at http://localhost:8000/docs

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:5173

### Initialize OpenSearch

After backend is running:

```bash
# Initialize search indices
curl -X POST "http://localhost:8000/api/v1/search/initialize" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Index existing content
curl -X POST "http://localhost:8000/api/v1/search/reindex" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Documentation

- **[Backend Setup Guide](backend/SETUP.md)** - Detailed backend setup and configuration
- **[API Documentation](backend/API_GUIDES.md)** - Complete API reference
- **[Alembic Migrations](backend/alembic/README)** - Database migration guide

## Core Concepts

### Content Hierarchy
```
Course
  └─ Module (Chapter)
      └─ Section (Lesson)
          └─ Knowledge Point (Concept)
```

### User Roles
- **Admin** - Full system access
- **Teacher** - Create/manage content, view progress
- **Student** - Access content, track progress
- **Parent** - View child's progress (future)

### Search Capabilities
- **Vector Search** - Semantic search based on meaning
- **Hybrid Search** - Combined text + vector (30% text, 70% vector)
- **Filtered Search** - Filter by course, difficulty, content type
- **Similar Content** - Find related learning materials

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions and support, please open an issue in the GitHub repository.
