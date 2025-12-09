# 🔧 Adaptive Learning - Backend API

Backend API for Adaptive Learning Platform built with NestJS and PostgreSQL.

## 📖 Overview

Backend của Adaptive Learning Platform cung cấp RESTful API cho hệ thống học tập thích ứng. Hệ thống quản lý cấu trúc Course → Module → Section → Knowledge Point, theo dõi Mastery theo thời gian thực, và cung cấp các engine cho Recommendation, Assessment, và Learning Path generation.

## 🏗️ Architecture

### Core Components

- **Mastery Engine** - Tính toán và theo dõi mức độ nắm vững kiến thức
- **Recommendation Engine** - Gợi ý nội dung học tập phù hợp
- **Assessment Engine** - Tạo và chấm điểm bài tập, phân tích lỗi
- **Learning Path Generator** - Tạo lộ trình học cá nhân hóa

### Database Schema

```
Course
  └─ Module
      └─ Section
          └─ Knowledge Point (KP)
              ├─ KP Prerequisites (dependency graph)
              └─ KP Resources
```

### Mastery Tracking

- `student_kp_progress` - Theo dõi tiến độ của học sinh với từng KP
- `student_mastery` - Tổng hợp mastery score theo khóa học
- Real-time updates dựa trên hành vi học tập

## 🛠️ Tech Stack

- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe ORM
- **TypeScript** - Type-safe JavaScript
- **JWT** - Authentication & authorization
- **bcrypt** - Password hashing
- **Passport** - Authentication strategies
- **LangChain** - AI question generation framework
- **OpenAI** - GPT models for question generation
- **Google Gemini** - Gemini models for question generation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
DATABASE_URL=postgresql://user:password@localhost:5432/adaptive_learning
JWT_SECRET=your-secret-key
API_KEY=your-api-key
PORT=3000
CORS_ORIGIN=http://localhost:3000

# AI Question Generation (Optional but recommended)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
```

**Note:** For AI question generation feature, you need at least one of the following API keys:
- `OPENAI_API_KEY`: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `GOOGLE_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Database Setup

```bash
# Generate migrations (if needed)
pnpm run db:generate

# Push schema to database
pnpm run db:push

# Open Drizzle Studio (optional)
pnpm run db:studio
```

### Development

```bash
# Start development server with watch mode
pnpm run start:dev
```

API will be available at `http://localhost:8000/api`

### Production

```bash
# Build the project
pnpm run build

# Start production server
pnpm run start:prod
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── auth/               # Authentication module
│   ├── users/              # User management
│   ├── students/           # Student management
│   ├── teachers/           # Teacher management
│   ├── parents/            # Parent management
│   ├── admins/             # Admin management
│   ├── classes/            # Course/Class management
│   ├── common/             # Shared utilities
│   │   ├── decorators/     # Custom decorators
│   │   ├── guards/         # Auth guards
│   │   └── interfaces/     # Shared interfaces
│   └── enrollments/        # Enrollment management
├── db/
│   ├── schema.ts           # Drizzle schema definitions
│   └── index.ts            # Database connection
├── drizzle/                # Migration files
└── dist/                   # Compiled output
```

## 🔐 Authentication

The API uses JWT-based authentication with API key protection.

### Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Headers

All requests require:
```
x-api-key: YOUR_API_KEY
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🤖 AI Question Generation

The platform includes AI-powered question generation using LangChain. You can generate questions automatically based on knowledge points using either OpenAI GPT or Google Gemini models.

### Features

- **Multiple AI Models**: Switch between OpenAI GPT and Google Gemini
- **Question Types**: Support for multiple choice, true/false, fill-in-the-blank, and short answer questions
- **Difficulty Levels**: Generate questions with 5 difficulty levels (Rất dễ to Rất khó)
- **Auto-estimation**: AI automatically estimates:
  - Question discrimination (IRT parameter)
  - Estimated time to answer

### API Endpoint

```
POST /api/question-bank/generate
```

**Request Body:**
```json
{
  "knowledgePointTitle": "Khái niệm giới hạn",
  "knowledgePointDescription": "Mô tả về điểm kiến thức...",
  "aiModel": "openai" | "gemini",
  "questionType": "multiple_choice" | "true_false" | "fill_in_blank" | "short_answer",
  "difficulty": 1-5,
  "skillId": "optional-kp-id"
}
```

**Response:**
```json
{
  "questionText": "Câu hỏi được tạo...",
  "questionType": "multiple_choice",
  "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
  "correctAnswer": "Lựa chọn đúng",
  "difficulty": 3,
  "discrimination": 0.65,
  "estimatedTime": 120
}
```

### Setup

1. Get API keys from OpenAI or Google
2. Add keys to `.env` file:
   ```
   OPENAI_API_KEY=sk-...
   GOOGLE_API_KEY=...
   ```
3. The feature will be available in the Knowledge Point management UI

## 📊 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 🔄 Database Migrations

The project uses Drizzle ORM for database management.

```bash
# Generate migration from schema changes
pnpm run db:generate

# Apply migrations to database
pnpm run db:push

# Open Drizzle Studio (visual database editor)
pnpm run db:studio
```

## 📝 Scripts

- `pnpm run start` - Start production server
- `pnpm run start:dev` - Start development server with watch mode
- `pnpm run start:debug` - Start with debug mode
- `pnpm run build` - Build for production
- `pnpm run test` - Run unit tests
- `pnpm run test:e2e` - Run e2e tests
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm run db:generate` - Generate database migrations
- `pnpm run db:push` - Push schema to database
- `pnpm run db:studio` - Open Drizzle Studio

## 🚀 Deployment

When deploying to production:

1. Set up environment variables
2. Run database migrations
3. Build the project: `pnpm run build`
4. Start with: `pnpm run start:prod`

## 📄 License

This project is licensed under the MIT License.
