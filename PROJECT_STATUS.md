# 📊 Adaptive Learning Platform - Project Overview

> **Last Updated:** 21/03/2026

---

## 🎯 System Overview

**Adaptive Learning Platform** is an intelligent personalized learning platform based on:
- Breaking down knowledge into small units (Knowledge Points)
- Real-time Mastery Tracking
- Automatic content recommendations based on student ability

---

## 🏗️ System Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS 11, TypeScript, Drizzle ORM |
| **Database** | PostgreSQL (Neon Database) |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **UI Library** | HeroUI (v2.8.5), TailwindCSS v4 |
| **Authentication** | JWT + Firebase Admin |
| **AI Integration** | LangChain + OpenAI GPT-4o-mini + Google Gemini 1.5-flash |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **Cloud Services** | Firebase (Auth, Analytics, Realtime features) |

### Project Structure

```
adaptive-learning/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── users/             # User management
│   │   ├── students/          # Student management
│   │   ├── teachers/          # Teacher management
│   │   ├── parents/           # Parent management
│   │   ├── admins/            # Admin management
│   │   ├── classes/           # Class & enrollment
│   │   ├── courses/           # Course, Module, Section CRUD
│   │   ├── knowledge-points/  # Knowledge Point management + AI
│   │   ├── question-bank/     # Question management + AI
│   │   ├── assignments/       # Assignment system
│   │   ├── student-progress/  # Progress tracking
│   │   ├── learning-paths/    # Learning path generation
│   │   ├── course-analytics/  # Analytics
│   │   ├── dashboard/         # Dashboard data
│   │   ├── explorer/          # Course explorer
│   │   ├── upload/            # File upload service
│   │   └── firebase/          # Firebase integration
│   └── db/
│       └── schema.ts          # Database schema (956 lines, 24 tables)
│
└── app/                        # Next.js Frontend
    ├── src/
    │   ├── app/               # Next.js App Router
    │   │   ├── (auth)/dashboard/  # Dashboard pages
    │   │   ├── login/         # Login page
    │   │   ├── contact/       # Contact page
    │   │   └── about/         # About page
    │   ├── components/
    │   │   ├── layouts/       # Landing page sections
    │   │   ├── dashboards/    # Dashboard components
    │   │   ├── ui/            # UI components
    │   │   └── modals/        # Modal components
    │   ├── hooks/             # Custom hooks
    │   ├── lib/               # API clients
    │   ├── types/             # TypeScript types
    │   └── contexts/          # React contexts
    └── fonts/                 # Custom fonts (DIN Pro)
```

---

## 🆕 Recent Updates (2026-03-04)

### Role-Based Access Control (RBAC)
- **Route-level RBAC**: Implemented for all dashboard routes
  - `/dashboard/courses` - All authenticated users
  - `/dashboard/users` - Admin only
  - Automatic redirects for unauthorized access
  - Middleware-based protection

### Student Dashboard Enhancement
- **Complete Redesign**: All student pages redesigned with consistent UI
  - My Courses page with real data
  - Learning Path page (view-only for students)
  - Progress tracking page with visualizations
- **Real Data Integration**: Connected to live APIs
  - Dynamic progress metrics
  - Course enrollment status
  - Assignment tracking

### Class Management Improvements
- **Course Assignment UI**: New interface in class detail page
  - Assign/unassign courses to classes
  - View course status per class
  - Teacher-friendly workflow

### Course Settings Enhancement
- **Quick Edit Modal**: Edit course settings without leaving the page
  - Inline editing capability
  - Modal-based settings form
  - Improved user experience

### Reports & Analytics
- **Reports Page Redesign**: Complete overhaul with real data
  - Export functionality (PDF/Excel)
  - Interactive charts and visualizations
  - Filterable report types

### Documentation
- **AGENTS.md**: Comprehensive guide for AI agents
  - Project conventions
  - Development guidelines
  - API patterns

## 🆕 Recent Updates (2026-03-21)

### Monorepo & Package Management
- **pnpm Workspace Root Setup**
  - Added root workspace config (`pnpm-workspace.yaml`)
  - Added root-level scripts to run app/backend without `cd` into each folder
  - Consolidated lockfile management to root `pnpm-lock.yaml`

### Authentication Hardening
- **Remember-Me Session TTL**
  - `rememberMe=true`: cookie/session expiry in 7 days
  - `rememberMe=false`: cookie/session expiry in 1 day
  - Applied to both email/password login and Google login
- **Email Case Consistency**
  - Email normalized to lowercase on create/update/find
  - Login no longer fails due to uppercase/lowercase email variations
  - Password remains case-sensitive by design

### Frontend Login UX
- **Google Popup Close Handling**
  - Fixed stuck loading when Google popup is closed by user
  - Gracefully handles Firebase `auth/popup-closed-by-user`

---

## ✅ Completed Features

### 1. 🔐 Authentication System

| Feature | Status | Details |
|---------|--------|---------|
| JWT Authentication | ✅ Complete | Cookie-based, HTTP-only |
| Role-based Access | ✅ Complete | Admin, Teacher, Student, Parent |
| Google Sign-in | ✅ Complete | Firebase Admin SDK |
| API Key Protection | ✅ Complete | Global API key guard |

**Key Files:**
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`
- `backend/src/common/guards/api-key.guard.ts`

### 2. 👥 User Management

| Entity | CRUD | Additional Details |
|--------|------|-------------------|
| Users | ✅ Full CRUD | Base user with email, password, role |
| Students | ✅ Full CRUD | Student code, grade level, school |
| Teachers | ✅ Full CRUD | Specialization, certifications |
| Parents | ✅ Full CRUD | Phone, address, relationship |
| Admins | ✅ Full CRUD | Admin level, permissions |

**Features:**
- Unified registration API for all roles
- Role-specific validation
- Soft delete (deactivate)

### 3. 🏫 Class Management

| Feature | Status |
|---------|--------|
| Class CRUD | ✅ Complete |
| Student Enrollment | ✅ Complete |
| Available Students List | ✅ Complete |
| Teacher Assignment | ✅ Complete |
| Class-Course Assignment | ✅ Complete |
| Class Progress Tracking | ✅ Complete |
| Teacher Class Filtering | ✅ Complete |

**API Endpoints:**
- `POST /api/classes` - Create class
- `POST /api/classes/:id/students` - Enroll student
- `DELETE /api/classes/:id/students/:studentId` - Remove student
- `POST /api/classes/:id/teachers` - Assign teacher
- `POST /api/classes/:id/courses` - Assign course
- `GET /api/classes/:id/progress` - Get class progress

### 4. 📚 Course System

**Hierarchy:** `Course → Module → Section → Knowledge Point`

#### 4.1 Course Management
| Feature | Status |
|---------|--------|
| Course CRUD | ✅ Complete |
| Role-based Access Control | ✅ Complete |
| Course Structure API | ✅ Complete |
| Teacher-Course Assignment | ✅ Complete |

#### 4.2 Module Management
| Feature | Status |
|---------|--------|
| Module CRUD | ✅ Complete |
| Order Index Management | ✅ Complete |
| Course-based Filtering | ✅ Complete |

#### 4.3 Section Management
| Feature | Status |
|---------|--------|
| Section CRUD | ✅ Complete |
| Auto-create with KPs | ✅ Complete |
| Bulk KP Creation | ✅ Complete |

### 5. 🧠 Knowledge Point System

#### Core Features
| Feature | Status | Details |
|---------|--------|---------|
| KP CRUD | ✅ Complete | Full lifecycle management |
| Prerequisites | ✅ Complete | Dependency graph |
| Section-KP Mapping | ✅ Complete | Many-to-many relationship |
| Difficulty Levels | ✅ Complete | 1-5 scale |
| Content Storage | ✅ Complete | Structured JSON |

#### Content Structure (JSON)
```typescript
{
  theory: string,           // HTML content
  visualization: string,    // Interactive HTML
  questions: [              // Embedded questions
    {
      type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'game',
      questionText: string,
      options?: string[],
      correctAnswer?: string,
      explanation?: string,
      gameType?: 'flashcard' | 'matching' | 'sorting',
      orderIndex: number
    }
  ]
}
```

#### AI Content Generation ✅
| Feature | Status | AI Model |
|---------|--------|----------|
| Theory-based Visualization | ✅ Complete | GPT-4o-mini / Gemini 1.5-flash |
| Interactive HTML Generation | ✅ Complete | Self-contained IIFE pattern |
| Question Generation | ✅ Complete | Multiple choice, True/False, Fill blank |
| Scoped CSS Output | ✅ Complete | Unique class prefix |

**Key Files:**
- `backend/src/knowledge-points/knowledge-points.service.ts` (614 lines)
- `backend/src/knowledge-points/dto/generate-content.dto.ts`

### 6. 📝 Question Bank System

| Feature | Status |
|---------|--------|
| Question CRUD | ✅ Complete |
| Multiple Question Types | ✅ Complete | multiple_choice, true_false, fill_blank, short_answer |
| IRT Metadata | ✅ Complete | Difficulty (1-10), Discrimination (0-1) |
| KP Assignment | ✅ Complete | kp_exercises table |
| AI Question Generation | ✅ Complete | Full prompt engineering |

**Database Schema:**
- `question_bank` - Core question data
- `question_metadata` - IRT parameters
- `kp_exercises` - KP-Question mapping

### 7. 📊 Student Progress Tracking

| Feature | Status | Description |
|---------|--------|-------------|
| Mastery Score | ✅ Complete | 0-100 scale per KP |
| Confidence Tracking | ✅ Complete | Confidence in mastery |
| Question Attempts | ✅ Complete | Full attempt history |
| Time on Task | ✅ Complete | Per KP and Section |
| Activity Log | ✅ Complete | All learning activities |
| Student Insights | ✅ Complete | Strengths, weaknesses, risk KPs |

**Tables:**
- `student_kp_progress` - Current mastery scores
- `student_kp_history` - Score history
- `student_mastery` - Overall course mastery
- `student_insights` - Analytics
- `question_attempts` - All attempts
- `time_on_task` - Time tracking
- `activity_log` - Activity tracking

### 8. 🎯 Assignment System

| Feature | Status |
|---------|--------|
| Assignment CRUD | ✅ Complete |
| Multiple Assignment Types | ✅ Complete | practice, quiz, exam, homework, test, adaptive |
| Question Items | ✅ Complete |
| Student Assignments | ✅ Complete |
| Assignment Attempts | ✅ Complete |
| Auto-assignment | ✅ Complete | By section or student |

### 9. 🗂️ Learning Paths

| Feature | Status |
|---------|--------|
| Learning Path CRUD | ✅ Complete |
| Path Items | ✅ Complete |
| Status Tracking | ✅ Complete | not_started, in_progress, completed |
| Recommendation Events | ✅ Complete | Track recommendations |

### 10. 🤖 AI Integration

#### Implemented AI Features
| Feature | Model | Status |
|---------|-------|--------|
| Content Generation | GPT-4o-mini / Gemini 1.5-flash | ✅ |
| Question Generation | GPT-4o-mini / Gemini 1.5-flash | ✅ |
| Interactive Visualization | GPT-4o-mini / Gemini 1.5-flash | ✅ |

**Prompt Engineering:**
- IIFE JavaScript pattern
- Scoped CSS with unique prefixes
- Self-contained HTML output
- Function definition before usage

### 11. 📤 File Upload System

| Feature | Status |
|---------|--------|
| R2/S3 Integration | ✅ Complete |
| Signed URL Generation | ✅ Complete |
| Direct Upload Support | ✅ Complete |

### 12. 🎨 Frontend UI

#### Landing Page (Redesign)
| Section | Status |
|---------|--------|
| Hero Section | ✅ Complete (Redesigned) |
| Trusted By | ✅ Complete |
| Features | ✅ Complete |
| Solutions | ✅ Complete |
| Video Demo | ✅ Complete |
| Testimonials | ✅ Complete |
| FAQ | ✅ Complete |
| CTA | ✅ Complete |
| Footer | ✅ Complete |

#### Dashboard (Role-based)
| Role | Status |
|------|--------|
| Admin Dashboard | ✅ Complete |
| Teacher Dashboard | ✅ Complete |
| Student Dashboard | ✅ Complete |
| Parent Dashboard | ✅ Complete |

#### Course Management UI
| Feature | Status |
|---------|--------|
| Course Explorer | ✅ Complete |
| Course Creation | ✅ Complete |
| Course Edit | ✅ Complete |
| Structure Tree | ✅ Complete |
| Knowledge Point Modal | ✅ Complete |
| Rich Text Editor | ✅ Complete |
| Thumbnail Upload | ✅ Complete |

### 13. 🔥 Firebase Integration

| Feature | Status |
|---------|--------|
| Firebase Auth | ✅ Complete |
| Firebase Analytics | ✅ Complete |
| Enhanced Dashboard | ✅ Complete |
| Realtime Features | 🚧 Basic |

---

## 📊 Database Schema (24 Tables)

### Users & Authentication (6 tables)
- `users` - Base user data
- `user_roles` - Role permissions
- `admins` - Admin specific data
- `students` - Student specific data
- `teachers` - Teacher specific data
- `parents` - Parent specific data
- `parent_student_map` - Parent-student relationships

### Course Structure (6 tables)
- `courses` - Course data
- `modules` - Module within course
- `sections` - Section within module
- `knowledge_point` - Knowledge points
- `kp_prerequisites` - KP dependencies
- `kp_resources` - Learning resources
- `section_kp_map` - Section-KP relationship
- `teacher_course_map` - Teacher assignments

### Questions & Assessments (6 tables)
- `question_bank` - Question repository
- `question_metadata` - IRT parameters
- `kp_exercises` - KP-Question mapping
- `assignments` - Assignment header
- `assignment_items` - Questions in assignment
- `section_assignments` - Section-Assignment link
- `assignment_targets` - Target students/classes
- `assignment_attempts` - Student attempts
- `student_assignments` - Student assignment status
- `student_assignment_results` - Results

### Progress & Analytics (6 tables)
- `question_attempts` - All question attempts
- `student_kp_progress` - Current mastery
- `student_kp_history` - Mastery history
- `student_mastery` - Overall mastery
- `student_insights` - Analytics
- `student_session` - Session tracking
- `time_on_task` - Time spent
- `activity_log` - Activity tracking
- `course_analytics` - Course-level stats

### Classes & Learning Paths (4 tables)
- `classes` - Class data
- `class_enrollment` - Student enrollment
- `teacher_class_map` - Teacher assignments
- `class_courses` - Class-Course links
- `learning_path` - Learning paths
- `learning_path_items` - Path items
- `recommendation_events` - Recommendation tracking

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| JWT Authentication | Cookie-based, HTTP-only |
| API Key Protection | Global guard, x-api-key header |
| Role-based Access | @Roles decorator + RolesGuard |
| Password Hashing | bcrypt (10 salt rounds) |
| CORS | Configurable origins |
| Input Validation | class-validator |
| SQL Injection Prevention | Drizzle ORM parameterized queries |
| Email Normalization | Lowercase normalization at service layer |
| Session Lifetime Policy | 1 day default / 7 days with remember-me |

---

## 🚀 API Endpoints (100+ endpoints)

### Auth APIs
- `POST /api/auth/register` - Unified registration
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get profile
- `POST /api/auth/google` - Google login

### User Management APIs
- `GET/POST /api/students` - Student CRUD
- `GET/POST /api/teachers` - Teacher CRUD
- `GET/POST /api/parents` - Parent CRUD
- `GET/POST /api/admins` - Admin CRUD
- `GET/PATCH /api/users/:id` - General user operations
- `POST /api/users/:id/reset-password` - Admin password reset (admin only)

### Class Management APIs
- `GET/POST /api/classes` - Class CRUD
- `POST /api/classes/:id/students` - Enroll student
- `GET /api/classes/:id/students` - Get enrolled students
- `GET /api/classes/:id/available-students` - Get students not enrolled (for adding)
- `DELETE /api/classes/:id/students/:studentId` - Remove student
- `POST /api/classes/:id/teachers` - Assign teacher
- `POST /api/classes/:id/courses` - Assign course
- `GET /api/classes/:id/progress` - Get class progress

### Course APIs
- `GET/POST /api/courses` - Course CRUD
- `GET/PATCH/DELETE /api/courses/:id` - Course operations
- `GET /api/courses/:id/structure` - Full structure
- `GET /api/courses/:id/learning` - Learning view
- `GET /api/courses/:id/teachers` - Course teachers

### Module APIs
- `POST /api/courses/modules` - Create module
- `GET /api/courses/:id/modules` - List modules
- `GET/PATCH/DELETE /api/courses/modules/:id` - Module operations

### Section APIs
- `POST /api/courses/sections` - Create section (with KPs)
- `GET /api/courses/modules/:id/sections` - List sections
- `GET/PATCH/DELETE /api/courses/sections/:id` - Section operations
- `GET /api/courses/sections/:id/knowledge-points` - Get KPs

### Knowledge Point APIs
- `GET/POST /api/knowledge-points` - KP CRUD
- `GET/PATCH/DELETE /api/knowledge-points/:id` - KP operations
- `GET /api/knowledge-points/:id/details` - Full details
- `GET /api/knowledge-points/:id/prerequisites` - Get prerequisites
- `GET /api/knowledge-points/:id/dependents` - Get dependents
- `GET /api/knowledge-points/:id/resources` - Get resources
- `POST /api/knowledge-points/generate-content` - AI generation
- `POST /api/knowledge-points/assign-to-section` - Assign to section

### Question Bank APIs
- `GET/POST /api/question-bank` - Question CRUD
- `GET/PATCH/DELETE /api/question-bank/:id` - Question operations
- `GET /api/question-bank/:id/metadata` - Get metadata
- `POST /api/question-bank/assign-to-kp` - Assign to KP
- `GET /api/knowledge-points/:id/questions` - Get by KP
- `POST /api/question-bank/generate` - AI question generation

### Assignment APIs
- `GET/POST /api/assignments` - Assignment CRUD
- `GET/PATCH/DELETE /api/assignments/:id` - Assignment operations
- `POST /api/assignments/:id/assign-to-section` - Assign to section
- `POST /api/assignments/:id/assign-to-student` - Assign to student
- `POST /api/assignments/attempts` - Create attempt
- `POST /api/assignments/submit` - Submit assignment

### Dashboard APIs
- `GET /api/dashboard/teacher-stats` - Teacher statistics (teacher only)
- `GET /api/dashboard/stats` - Admin statistics (admin only)
- `GET /api/dashboard/top-courses` - Top courses
- `GET /api/dashboard/difficult-kps` - Difficult KPs

### Progress APIs
- `GET /api/student-progress/stats` - Get stats
- `GET /api/student-progress/mastery` - Get mastery
- `GET /api/student-progress/kp/:id` - Get KP progress
- `POST /api/student-progress/question-attempt` - Submit attempt

---

## 📈 Statistics

### Code Metrics
| Metric | Value |
|--------|-------|
| Modules | 18 |
| Controllers | 15 |
| Services | 15 |
| Database Tables | 24 |
| API Endpoints | 100+ |

### Test Coverage
- Backend: Jest configured (no test files yet)
- Frontend: ESLint configured

---

## 🔄 CI/CD & DevOps

| Feature | Status |
|---------|--------|
| Environment Config | ✅ .env.example |
| Database Migrations | ✅ Drizzle Kit |
| Build Scripts | ✅ package.json |
| Linting | ✅ ESLint |
| Type Checking | ✅ TypeScript |

---

## 🎯 Upcoming Features / Future

Based on code review, the following features may need further development:

### Recommendation Engine
- [ ] Algorithm implementation (tables exist but no logic)
- [ ] Real-time recommendations
- [ ] Adaptive learning algorithm (IRT, Bayesian Knowledge Tracing)

### Assessment Engine
- [ ] Auto-grading for open-ended questions
- [ ] Diagnostic reports
- [ ] Error pattern analysis

### Analytics Dashboard
- [ ] Charts and visualizations
- [ ] Export reports
- [ ] Real-time analytics

### Real-time Features
- [ ] WebSocket for notifications
- [ ] Live collaboration
- [ ] Real-time progress updates

### Gamification
- [ ] Badges/Achievements
- [ ] Leaderboards
- [ ] Points system

---

## 🔧 Running the Project

### Workspace (Recommended)
```bash
pnpm install
cp backend/.env.example backend/.env
cp app/.env.example app/.env.local
pnpm db:push
pnpm dev
```

Run each app independently from root:
```bash
pnpm dev:app
pnpm dev:backend
```

### Backend
```bash
cd backend
pnpm install
cp .env.example .env
# Edit .env with your credentials
pnpm run db:push
pnpm run start:dev
```

### Frontend
```bash
cd app
pnpm install
cp .env.example .env.local
# Edit .env.local with your API URL
pnpm run dev
```

---

## 📚 Related Documentation

- `README.md` - Project overview
- `CHANGELOGS.md` - Detailed change history
- `backend/API_DOCUMENTATION.md` - API documentation
- `backend/db/schema.ts` - Database schema

---

## 👥 Contributors

Project developed by Adaptive Learning Team.

---

*Last Updated: 21/03/2026*
