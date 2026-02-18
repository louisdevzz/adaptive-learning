# 📊 Adaptive Learning Platform - Tổng Quan Dự Án

> **Ngày cập nhật:** 19/02/2026

---

## 🎯 Tổng Quan Hệ Thống

**Adaptive Learning Platform v3.0** là nền tảng học tập thông minh cá nhân hóa dựa trên:
- Phân rã kiến thức thành các đơn vị nhỏ (Knowledge Points)
- Theo dõi mức độ nắm vững (Mastery Tracking) theo thờigian thực
- Tự động đề xuất nội dung phù hợp với năng lực học sinh

---

## 🏗️ Kiến Trúc Hệ Thống

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

### Cấu Trúc Dự Án

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
│       └── schema.ts          # Database schema (956 dòng, 24 tables)
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

## ✅ Các Tính Năng Đã Hoàn Thành

### 1. 🔐 Hệ Thống Xác Thực (Authentication)

| Tính năng | Trạng thái | Chi tiết |
|-----------|------------|----------|
| JWT Authentication | ✅ Hoàn thành | Cookie-based, HTTP-only |
| Role-based Access | ✅ Hoàn thành | Admin, Teacher, Student, Parent |
| Google Sign-in | ✅ Hoàn thành | Firebase Admin SDK |
| API Key Protection | ✅ Hoàn thành | Global API key guard |

**File chính:**
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`
- `backend/src/common/guards/api-key.guard.ts`

### 2. 👥 Quản Lý Ngườii Dùng

| Entity | CRUD | Chi tiết bổ sung |
|--------|------|------------------|
| Users | ✅ Full CRUD | Base user với email, password, role |
| Students | ✅ Full CRUD | Student code, grade level, school |
| Teachers | ✅ Full CRUD | Specialization, certifications |
| Parents | ✅ Full CRUD | Phone, address, relationship |
| Admins | ✅ Full CRUD | Admin level, permissions |

**Đặc điểm:**
- Unified registration API cho tất cả roles
- Role-specific validation
- Soft delete (deactivate)

### 3. 🏫 Quản Lý Lớp Học (Classes)

| Tính năng | Trạng thái |
|-----------|------------|
| Class CRUD | ✅ Hoàn thành |
| Student Enrollment | ✅ Hoàn thành |
| Teacher Assignment | ✅ Hoàn thành |
| Class-Course Assignment | ✅ Hoàn thành |

**API Endpoints:**
- `POST /api/classes` - Tạo lớp
- `POST /api/classes/:id/students` - Enroll học sinh
- `POST /api/classes/:id/teachers` - Assign giáo viên
- `POST /api/classes/:id/courses` - Gán khóa học

### 4. 📚 Hệ Thống Khóa Học (Course System)

**Cấu trúc phân cấp:** `Course → Module → Section → Knowledge Point`

#### 4.1 Course Management
| Tính năng | Trạng thái |
|-----------|------------|
| Course CRUD | ✅ Hoàn thành |
| Role-based Access Control | ✅ Hoàn thành |
| Course Structure API | ✅ Hoàn thành |
| Teacher-Course Assignment | ✅ Hoàn thành |

#### 4.2 Module Management
| Tính năng | Trạng thái |
|-----------|------------|
| Module CRUD | ✅ Hoàn thành |
| Order Index Management | ✅ Hoàn thành |
| Course-based Filtering | ✅ Hoàn thành |

#### 4.3 Section Management
| Tính năng | Trạng thái |
|-----------|------------|
| Section CRUD | ✅ Hoàn thành |
| Auto-create with KPs | ✅ Hoàn thành |
| Bulk KP Creation | ✅ Hoàn thành |

### 5. 🧠 Knowledge Point System (Trọng tâm)

#### Core Features
| Tính năng | Trạng thái | Chi tiết |
|-----------|------------|----------|
| KP CRUD | ✅ Hoàn thành | Full lifecycle management |
| Prerequisites | ✅ Hoàn thành | Dependency graph |
| Section-KP Mapping | ✅ Hoàn thành | Many-to-many relationship |
| Difficulty Levels | ✅ Hoàn thành | 1-5 scale |
| Content Storage | ✅ Hoàn thành | Structured JSON |

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
| Tính năng | Trạng thái | AI Model |
|-----------|------------|----------|
| Theory-based Visualization | ✅ Hoàn thành | GPT-4o-mini / Gemini 1.5-flash |
| Interactive HTML Generation | ✅ Hoàn thành | Self-contained IIFE pattern |
| Question Generation | ✅ Hoàn thành | Multiple choice, True/False, Fill blank |
| Scoped CSS Output | ✅ Hoàn thành | Unique class prefix |

**File chính:**
- `backend/src/knowledge-points/knowledge-points.service.ts` (614 dòng)
- `backend/src/knowledge-points/dto/generate-content.dto.ts`

### 6. 📝 Question Bank System

| Tính năng | Trạng thái |
|-----------|------------|
| Question CRUD | ✅ Hoàn thành |
| Multiple Question Types | ✅ Hoàn thành | multiple_choice, true_false, fill_blank, short_answer |
| IRT Metadata | ✅ Hoàn thành | Difficulty (1-10), Discrimination (0-1) |
| KP Assignment | ✅ Hoàn thành | kp_exercises table |
| AI Question Generation | ✅ Hoàn thành | Full prompt engineering |

**Database Schema:**
- `question_bank` - Core question data
- `question_metadata` - IRT parameters
- `kp_exercises` - KP-Question mapping

### 7. 📊 Student Progress Tracking

| Tính năng | Trạng thái | Mô tả |
|-----------|------------|-------|
| Mastery Score | ✅ Hoàn thành | 0-100 scale per KP |
| Confidence Tracking | ✅ Hoàn thành | Confidence in mastery |
| Question Attempts | ✅ Hoàn thành | Full attempt history |
| Time on Task | ✅ Hoàn thành | Per KP and Section |
| Activity Log | ✅ Hoàn thành | All learning activities |
| Student Insights | ✅ Hoàn thành | Strengths, weaknesses, risk KPs |

**Tables:**
- `student_kp_progress` - Current mastery scores
- `student_kp_history` - Score history
- `student_mastery` - Overall course mastery
- `student_insights` - Analytics
- `question_attempts` - All attempts
- `time_on_task` - Time tracking
- `activity_log` - Activity tracking

### 8. 🎯 Assignment System

| Tính năng | Trạng thái |
|-----------|------------|
| Assignment CRUD | ✅ Hoàn thành |
| Multiple Assignment Types | ✅ Hoàn thành | practice, quiz, exam, homework, test, adaptive |
| Question Items | ✅ Hoàn thành |
| Student Assignments | ✅ Hoàn thành |
| Assignment Attempts | ✅ Hoàn thành |
| Auto-assignment | ✅ Hoàn thành | By section or student |

### 9. 🗂️ Learning Paths

| Tính năng | Trạng thái |
|-----------|------------|
| Learning Path CRUD | ✅ Hoàn thành |
| Path Items | ✅ Hoàn thành |
| Status Tracking | ✅ Hoàn thành | not_started, in_progress, completed |
| Recommendation Events | ✅ Hoàn thành | Track recommendations |

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

| Tính năng | Trạng thái |
|-----------|------------|
| R2/S3 Integration | ✅ Hoàn thành |
| Signed URL Generation | ✅ Hoàn thành |
| Direct Upload Support | ✅ Hoàn thành |

### 12. 🎨 Frontend UI

#### Landing Page
| Section | Trạng thái |
|---------|------------|
| Hero Section | ✅ Hoàn thành |
| Trusted By | ✅ Hoàn thành |
| Features | ✅ Hoàn thành |
| Solutions | ✅ Hoàn thành |
| Video Demo | ✅ Hoàn thành |
| Testimonials | ✅ Hoàn thành |
| FAQ | ✅ Hoàn thành |
| CTA | ✅ Hoàn thành |
| Footer | ✅ Hoàn thành |

#### Dashboard (Role-based)
| Role | Trạng thái |
|------|------------|
| Admin Dashboard | ✅ Hoàn thành |
| Teacher Dashboard | ✅ Hoàn thành |
| Student Dashboard | ✅ Hoàn thành |
| Parent Dashboard | ✅ Hoàn thành |

#### Course Management UI
| Tính năng | Trạng thái |
|-----------|------------|
| Course Explorer | ✅ Hoàn thành |
| Course Creation | ✅ Hoàn thành |
| Course Edit | ✅ Hoàn thành |
| Structure Tree | ✅ Hoàn thành |
| Knowledge Point Modal | ✅ Hoàn thành |
| Rich Text Editor | ✅ Hoàn thành |
| Thumbnail Upload | ✅ Hoàn thành |

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

### Class Management APIs
- `GET/POST /api/classes` - Class CRUD
- `POST /api/classes/:id/students` - Enroll student
- `DELETE /api/classes/:id/students/:studentId` - Remove student
- `POST /api/classes/:id/teachers` - Assign teacher
- `POST /api/classes/:id/courses` - Assign course

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

### Progress APIs
- `GET /api/student-progress/stats` - Get stats
- `GET /api/student-progress/mastery` - Get mastery
- `GET /api/student-progress/kp/:id` - Get KP progress
- `POST /api/student-progress/question-attempt` - Submit attempt

---

## 📈 Số Liệu Thống Kê

### Code Metrics
| Metric | Value |
|--------|-------|
| Modules | 18 |
| Controllers | 15 |
| Services | 15 |
| Database Tables | 24 |
| API Endpoints | 100+ |

### Test Coverage
- Backend: Jest configured (chưa có test files)
- Frontend: ESLint configured

---

## 🔄 CI/CD & DevOps

| Feature | Trạng thái |
|---------|------------|
| Environment Config | ✅ .env.example |
| Database Migrations | ✅ Drizzle Kit |
| Build Scripts | ✅ package.json |
| Linting | ✅ ESLint |
| Type Checking | ✅ TypeScript |

---

## 📝 Các Thay Đổi Gần Đây (Từ CHANGELOGS.md)

### [Unreleased] - 2026-01-04
- ✅ Knowledge Point Detail View
- ✅ Questions & Games System (4 types)
- ✅ Localized Resource Management
- ✅ AI Content Generation (Theory-based)
- ✅ Toast Migration (sonner → HeroUI)

### Previous
- ✅ AI Content Generation cho Knowledge Points
- ✅ Content Field cho Knowledge Points
- ✅ Removed Tags Field
- ✅ Removed Section Summary Field
- ✅ Course Management System
- ✅ User Management System

---

## 🎯 Các Tính Năng Chưa Hoàn Thành / Tương Lai

Dựa trên code review, các tính năng sau có thể cần phát triển thêm:

### Recommendation Engine
- [ ] Algorithm implementation (đã có bảng nhưng chưa có logic)
- [ ] Real-time recommendations
- [ ] Adaptive learning algorithm (IRT, Bayesian Knowledge Tracing)

### Assessment Engine
- [ ] Auto-grading for open-ended questions
- [ ] Diagnostic reports
- [ ] Error pattern analysis

### Analytics Dashboard
- [ ] Charts và visualizations
- [ ] Export reports
- [ ] Real-time analytics

### Real-time Features
- [ ] WebSocket cho notifications
- [ ] Live collaboration
- [ ] Real-time progress updates

### Gamification
- [ ] Badges/Achievements
- [ ] Leaderboards
- [ ] Points system

---

## 🔧 Hướng Dẫn Chạy Dự Án

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
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

---

## 📚 Tài Liệu Liên Quan

- `README.md` - Tổng quan dự án
- `CHANGELOGS.md` - Lịch sử thay đổi chi tiết
- `backend/API_DOCUMENTATION.md` - API documentation
- `backend/db/schema.ts` - Database schema

---

## 👥 Đóng Góp

Dự án được phát triển bởi Adaptive Learning Team.

---

*Cập nhật lần cuối: 19/02/2026*
