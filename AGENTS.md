# AGENTS.md - Adaptive Learning Platform

> **For AI Agents** — This guide helps AI agents understand the project structure, conventions, and how to work with the codebase.

---

## Project Overview

**Adaptive Learning Platform** is an AI-powered learning system that personalizes each student's learning journey. The system decomposes curriculum into atomic Knowledge Points, tracks mastery in real time, and uses AI to generate content, assess understanding, and adapt learning paths.

| Concept | Description |
|---------|-------------|
| **Knowledge Point (KP)** | Smallest unit of knowledge (e.g., "Polynomial multiplication with monomials") |
| **Mastery** | Dynamic estimate of student understanding per KP (0-100) |
| **Learning Path** | Personalized sequence of learning actions, adjusted based on mastery |
| **Course Structure** | Course → Module → Section → Knowledge Point |

### AI Integration

AI is used for three core functions:
1. **Content Generation** — Interactive HTML visualizations/games per KP topic via LangChain (OpenAI/Gemini/Kimi)
2. **Automated Grading** — Cron-based pipeline: extract text from PDF/DOCX submissions, grade against rubric, teacher reviews
3. **[Planned] Adaptation** — AI-powered diagnosis, recommendation, remediation, and learning path generation

---

## Project Structure

```
adaptive-learning/
├── backend/                    # NestJS API (port 8000)
│   ├── src/
│   │   ├── auth/              # JWT + Firebase Auth
│   │   ├── users/             # Base user CRUD
│   │   ├── students/          # Student profiles + dashboard stats
│   │   ├── teachers/          # Teacher profiles + class assignments
│   │   ├── parents/           # Parent profiles + children access
│   │   ├── admins/            # Admin management (super/system/support)
│   │   ├── classes/           # Classes + enrollment + teacher assignment
│   │   ├── courses/           # Courses, Modules, Sections
│   │   ├── knowledge-points/  # KPs + prerequisites + AI content generation
│   │   ├── question-bank/     # Question bank + IRT metadata
│   │   ├── assignments/       # Assignments + AI grading pipeline
│   │   ├── student-progress/  # Mastery tracking + attempts + time-on-task
│   │   ├── learning-paths/    # Learning path CRUD
│   │   ├── course-analytics/  # Per-course/module analytics
│   │   ├── dashboard/         # Role-aware dashboard + stats
│   │   ├── explorer/          # Public course browsing + cloning
│   │   ├── activity-log/      # Audit trail + session tracking
│   │   ├── notifications/     # Event-driven notifications
│   │   ├── upload/            # File upload (Cloudflare R2)
│   │   ├── firebase/          # Firebase Admin SDK
│   │   └── common/
│   │       └── ai/            # AI model factory (OpenAI/Gemini/Kimi)
│   └── db/
│       ├── schema.ts          # Drizzle schema (24 tables)
│       └── index.ts           # Database connection (Neon serverless)
│
└── app/                        # Next.js Frontend (port 3000)
    ├── src/
    │   ├── app/               # Next.js App Router
    │   │   ├── (auth)/dashboard/  # Protected dashboard pages
    │   │   ├── login/
    │   │   └── ...            # Public pages (/, /about, /contact)
    │   ├── components/        # React components
    │   ├── lib/
    │   │   └── api.ts         # Centralized Axios API client
    │   ├── hooks/             # Custom hooks (useUser, etc.)
    │   ├── contexts/          # React contexts
    │   └── types/             # TypeScript interfaces
    └── ...
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS 11, TypeScript, Drizzle ORM |
| **Database** | PostgreSQL (Neon Serverless) |
| **Frontend** | Next.js 16, React (with React Compiler), TypeScript |
| **UI** | HeroUI, TailwindCSS 4, Framer Motion |
| **Auth** | JWT (HTTP-only cookies) + Firebase Admin SDK (Google sign-in) |
| **AI** | LangChain + OpenAI (gpt-4o-mini) + Gemini (1.5-flash) + Kimi |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **Data Fetching** | SWR + Axios |
| **Package Manager** | pnpm (workspace root + backend), npm (frontend) |

---

## Authentication & Authorization

### API Key
All API endpoints require the `x-api-key` header:
```
x-api-key: your-api-key-here
```

### Cookie-Based Auth
- Login/Register sets an HTTP-only cookie `access_token`
- Cookie is sent automatically with every request
- No Authorization header needed

### User Roles
| Role | Access |
|------|--------|
| `admin` | Full system access (levels: super, system, support) |
| `teacher` | Manage courses, classes, assignments; view student progress |
| `student` | Study content, submit assignments, track own progress |
| `parent` | View children's progress, receive notifications |

### Guards
- `JwtAuthGuard` — Validates JWT from cookie
- `RolesGuard` — Enforces role-based access via `@Roles()` decorator
- `ApiKeyGuard` — Global API key validation

---

## Database Schema (24 tables)

### Users & Auth
- `users` — Base user (email, passwordHash, fullName, role, status)
- `user_roles` — Role + permissions JSON per user
- `students` — studentCode, gradeLevel, schoolName, dateOfBirth, gender
- `teachers` — specialization JSON, experienceYears, certifications JSON
- `parents` — phone, address, relationshipType
- `admins` — adminLevel (super/system/support), permissions JSON
- `parent_student_map` — Parent-student relationship

### Courses
- `courses` — title, subject, gradeLevel, visibility (public/private), originCourseId
- `modules` — courseId, title, orderIndex
- `sections` — moduleId, title, orderIndex
- `teacher_course_map` — teacherId, courseId, role (creator/collaborator)
- `course_analytics` — completionRate, averageMastery, highFailureKps JSON

### Knowledge Points
- `knowledge_point` — title, description, content JSON (slideUrl, youtubeUrl), difficultyLevel (1-5)
- `kp_prerequisites` — kpId → prerequisiteKpId (self-referential many-to-many)
- `kp_resources` — resourceType (video/article/interactive/quiz/other), url, orderIndex
- `section_kp_map` — sectionId → kpId with orderIndex
- `kp_exercises` — kpId → questionId with difficulty

### Questions & Assignments
- `question_bank` — questionText, options JSON, correctAnswer, questionType
- `question_metadata` — difficulty (1-10), discrimination (IRT 0-1), skillId (KP ref), tags JSON
- `assignments` — title, assignmentType, aiGradingEnabled, gradingRubric, dueDate
- `section_assignments` — Links assignments to sections
- `assignment_targets` — Polymorphic target (student/class/group/section)
- `student_assignments` — Per-student state: not_started/in_progress/submitted/graded
- `student_assignment_results` — totalScore, maxScore, accuracy, gradingSource (manual/ai_approved)
- `assignment_grading_runs` — AI grading job queue (status, provider, suggestedScore, feedback, confidence)
- `question_attempts` — Per-question answer record with isCorrect, timeSpent, kpId

### Student Progress
- `student_kp_progress` — Per-student per-KP masteryScore (0-100), confidence (0-100)
- `student_kp_history` — Immutable history: oldScore, newScore, source (assessment/practice/review)
- `student_mastery` — Per-student per-course aggregate: overallMasteryScore, strengths/weaknesses JSON
- `student_insights` — strengths, weaknesses, riskKps, learningPattern JSON, engagementScore
- `student_session` — Session lifecycle: startTime, endTime, deviceInfo, ipAddress
- `time_on_task` — Seconds spent per student per KP or section
- `activity_log` — Full audit: actorUserId, activityType, action, targetType, metadata JSON

### Classes
- `classes` — className, gradeLevel, schoolYear, homeroomTeacherId
- `class_enrollment` — classId + studentId + status (active/withdrawn/completed)
- `teacher_class_map` — teacherId + classId + role (homeroom/subject_teacher/assistant)
- `class_courses` — Links courses to classes

### Learning Paths
- `learning_path` — studentId, createdBy (system/teacher/student), title, status
- `learning_path_items` — itemType (kp/section/assignment), itemId, orderIndex, status
- `recommendation_events` — type (practice/review/advance), student action (accepted/rejected/ignored)

### Notifications
- `notifications` — recipientId, type, title, message, actionUrl, isRead

---

## API Patterns

### Response Format
```typescript
// Success — data returned directly or wrapped
{ ... }

// Error
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Standard CRUD
```
GET    /api/{entities}          # List all
POST   /api/{entities}          # Create
GET    /api/{entities}/:id      # Get one
PATCH  /api/{entities}/:id      # Update
DELETE /api/{entities}/:id      # Delete
```

### Key Endpoints

**Auth:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google          # Firebase ID token → JWT cookie
POST /api/auth/logout
GET  /api/auth/me
```

**Knowledge Points:**
```
POST /api/knowledge-points/generate-content    # AI content generation
POST /api/knowledge-points/assign-to-section
GET  /api/knowledge-points/:id/prerequisites
GET  /api/knowledge-points/:id/dependents
```

**Student Progress:**
```
POST /api/student-progress/submit-question         # Submit answer, update mastery
POST /api/student-progress/submit-content-question  # Embedded quiz answers
POST /api/student-progress/track-time
GET  /api/student-progress/students/:id/all-progress
GET  /api/student-progress/students/:id/mastery/:courseId
GET  /api/student-progress/students/:id/weekly-activity
```

**Assignments:**
```
POST /api/assignments/assign-to-students
POST /api/assignments/submit                        # File upload submission
PATCH /api/assignments/student-assignments/:id/grade # Manual grading
GET  /api/assignments/student-assignments/:id/ai-suggestion  # AI grading result
```

**Classes:**
```
GET  /api/classes/:id/students
POST /api/classes/:id/students              # Enroll student
DELETE /api/classes/:id/students/:studentId  # Remove student
```

**Explorer:**
```
GET  /api/explorer/courses                  # Browse public courses
POST /api/explorer/courses/:id/clone        # Deep-clone course for teacher
```

---

## Frontend Patterns

### Page Component
```typescript
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

export default function PageName() {
  const { user } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.endpoint.getAll().then(setData).finally(() => setLoading(false));
  }, []);
}
```

### API Client
```typescript
import { api } from "@/lib/api";

api.classes.getAll();
api.classes.enrollStudent(classId, { studentId, status: "active" });
api.students.getById(studentId);
```

### UI Libraries
- **HeroUI** — Component library (Button, Modal, Input, Table, etc.)
- **TailwindCSS 4** — Utility-first styling
- **Lucide React** — Icons
- **sonner** — Toast notifications
- **Framer Motion** — Animations

---

## Development Guidelines

### Backend
1. **Always use Drizzle ORM** — No raw SQL
2. **Validate with class-validator** — DTOs must have decorators
3. **Guards for security** — JwtAuthGuard + RolesGuard on all protected routes
4. **Service layer** — Business logic in services, not controllers
5. **NestJS module pattern** — `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.ts`

### Frontend
1. **"use client"** for interactive components
2. **Server components** by default for static content
3. **TypeScript strict** — No `any`
4. **Loading states** — Always handle loading and error states
5. **Path alias** — `@/*` maps to `./src/*`

### Git
- **Conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`
- **Branch naming**: `feature/description`, `fix/description`

---

## AI Integration Details

### Model Factory (`backend/src/common/ai/chat-model.factory.ts`)
- Supports 3 providers: `openai`, `gemini`, `kimi-code`
- Provider/model resolved from env vars or request body
- Default: OpenAI gpt-4o-mini

### Content Generation
- Endpoint: `POST /api/knowledge-points/generate-content`
- Input: topic, theoryContent, description, optional prompt
- Output: Self-contained HTML with scoped CSS (unique class prefixes) and IIFE JavaScript
- No external dependencies in generated content

### AI Grading Pipeline
- Cron job runs every minute, processes up to 5 pending jobs
- Downloads submission from R2 → extracts text (pdf-parse / mammoth)
- Grades via configured LLM at temperature 0.2
- Output: suggestedScore (0-10), feedback, criteriaBreakdown, confidence (0-100)
- Teacher must review and approve (grading source: `ai_approved`)
- Retries up to 2 times on failure

### Mastery Calculation (current)
- **Exercise mastery**: Binary — correct = 100%, incorrect = 0%
- **Content question mastery**: Incremental — each correct answer adds `100/totalQuestions`
- **Confidence**: Increases by 10% per attempt (max 100%)
- **[Planned]** IRT-based and Bayesian Knowledge Tracing models

---

## Common Issues & Solutions

### Backend
| Issue | Solution |
|-------|----------|
| Drizzle relation error | Check foreign key references, use `.leftJoin()` |
| JWT invalid | Check cookie, verify JWT_SECRET matches |
| API Key missing | Add `x-api-key` header to all requests |
| AI grading stuck | Check `assignment_grading_runs` for stale jobs (>10min) |

### Frontend
| Issue | Solution |
|-------|----------|
| Hydration mismatch | Ensure "use client" directive, check initial data |
| API 401 | Check login state, cookie settings, CORS_ORIGIN |
| Type error | Check interfaces in `types/` folder |

---

## Key File Locations

| Purpose | Path |
|---------|------|
| API Client | `app/src/lib/api.ts` |
| TypeScript Types | `app/src/types/*.ts` |
| User Hook | `app/src/hooks/useUser.ts` |
| Auth Middleware | `app/src/middleware.ts` |
| Backend DTOs | `backend/src/*/dto/*.dto.ts` |
| Database Schema | `backend/db/schema.ts` |
| AI Model Factory | `backend/src/common/ai/chat-model.factory.ts` |
| Environment | `backend/.env`, `app/.env.local` |

---

## Environment Variables

### Backend (`backend/.env`)
Required: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `API_KEY`, `PORT`, `CORS_ORIGIN`, Firebase credentials, R2 credentials, `OPENAI_API_KEY`

### Frontend (`app/.env.local`)
Required: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_KEY`

---

## References

- [README.md](./README.md) — Project overview and adaptive learning definition
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Feature status tracking
- [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) — API documentation

---

*Last Updated: 2026-03-21*
