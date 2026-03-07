# AGENTS.md - Adaptive Learning Platform

> **Tài liệu dành cho AI Agents** - Hướng dẫn này giúp AI agents hiểu rõ cấu trúc, quy ước và cách làm việc với dự án.

---

## 📋 Tổng quan dự án

**Adaptive Learning Platform** là nền tảng học tập thông minh với khả năng cá nhân hóa lộ trình học cho từng học sinh. Hệ thống dựa trên các khái niệm cốt lõi:

| Khái niệm | Mô tả |
|-----------|-------|
| **Knowledge Point (KP)** | Đơn vị kiến thức nhỏ nhất (VD: "Nhân đa thức với đơn thức") |
| **Mastery** | Mức độ nắm vững kiến thức của học sinh (0-100%) |
| **Learning Path** | Lộ trình học động, tự điều chỉnh theo năng lực |
| **Course Structure** | Course → Module → Section → Knowledge Point |

---

## 🏗️ Cấu trúc dự án

```
adaptive-learning/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # JWT + Firebase Auth
│   │   ├── users/             # Quản lý user cơ bản
│   │   ├── students/          # Học sinh + tiến độ
│   │   ├── teachers/          # Giáo viên
│   │   ├── parents/           # Phụ huynh
│   │   ├── admins/            # Admin
│   │   ├── classes/           # Lớp học + enrollment
│   │   ├── courses/           # Khóa học, Module, Section
│   │   ├── knowledge-points/  # Knowledge Point + AI content
│   │   ├── question-bank/     # Ngân hàng câu hỏi
│   │   ├── assignments/       # Bài tập, bài kiểm tra
│   │   ├── student-progress/  # Theo dõi tiến độ
│   │   ├── learning-paths/    # Lộ trình học
│   │   ├── course-analytics/  # Phân tích khóa học
│   │   ├── dashboard/         # Dashboard data
│   │   ├── explorer/          # Public course explorer
│   │   ├── upload/            # File upload (R2)
│   │   └── firebase/          # Firebase Admin SDK
│   └── db/
│       ├── schema.ts          # Database schema (24 tables)
│       └── index.ts           # Database connection
│
└── app/                        # Next.js Frontend
    ├── src/
    │   ├── app/               # Next.js App Router
    │   │   ├── (auth)/dashboard/  # Dashboard pages
    │   │   ├── login/
    │   │   └── ...
    │   ├── components/
    │   │   ├── dashboards/    # Dashboard components
    │   │   └── ui/            # UI components
    │   ├── lib/
    │   │   └── api.ts         # API client
    │   ├── hooks/             # Custom hooks
    │   └── types/             # TypeScript types
    └── ...
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS 11, TypeScript, Drizzle ORM |
| **Database** | PostgreSQL (Neon Database) |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **UI** | HeroUI v2.8.5, TailwindCSS v4, Framer Motion |
| **Auth** | JWT + Firebase Admin SDK |
| **AI** | LangChain + OpenAI GPT-4o-mini + Google Gemini 1.5-flash |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **Package Manager** | pnpm (backend), npm (frontend) |

---

## 🔐 Xác thực & Phân quyền

### API Key
Tất cả API endpoints đều yêu cầu header `x-api-key`:
```
x-api-key: your-api-key-here
```

### Cookie-Based Authentication
- Login/Register trả về HTTP-only cookie `access_token`
- Cookie tự động gửi kèm mỗi request
- Không cần thêm Authorization header

### User Roles
| Role | Quyền |
|------|-------|
| `admin` | Full access, quản lý tất cả |
| `teacher` | Quản lý lớp học, khóa học, xem tiến độ |
| `student` | Học tập, làm bài tập, xem tiến độ |
| `parent` | Xem tiến độ con cái |

---

## 📊 Database Schema (24 tables)

### Users & Auth (5 tables)
- `users` - Base user (email, password, role)
- `students` - Student info (studentCode, gradeLevel, school)
- `teachers` - Teacher info (specialization, experience)
- `parents` - Parent info (phone, address)
- `parent_student_map` - Parent-Student relationship

### Courses (5 tables)
- `courses` - Khóa học
- `modules` - Module trong khóa học
- `sections` - Section trong module
- `teacher_course_map` - Teacher-Course assignment
- `course_analytics` - Analytics khóa học

### Knowledge Points (4 tables)
- `knowledge_point` - Đơn vị kiến thức
- `kp_prerequisites` - KP phụ thuộc
- `kp_resources` - Tài nguyên học tập
- `section_kp_map` - Section-KP mapping

### Questions & Assignments (7 tables)
- `question_bank` - Ngân hàng câu hỏi
- `question_metadata` - Metadata câu hỏi (IRT params)
- `kp_exercises` - Bài tập cho KP
- `assignments` - Bài tập/bài kiểm tra
- `assignment_items` - Câu hỏi trong assignment
- `section_assignments` - Auto-assign to section
- `assignment_targets` - Target (student/class/section)
- `assignment_attempts` - Lần làm bài
- `student_assignments` - Assignment của học sinh
- `student_assignment_results` - Kết quả làm bài
- `question_attempts` - Từng câu trả lởi

### Student Progress (5 tables)
- `student_kp_progress` - Mastery score theo KP
- `student_kp_history` - Lịch sử mastery thay đổi
- `student_mastery` - Tổng hợp mastery theo course
- `student_insights` - Phân tích học sinh
- `student_session` - Session tracking
- `time_on_task` - Thờigian làm bài
- `activity_log` - Hoạt động log

### Classes (4 tables)
- `classes` - Lớp học
- `class_enrollment` - Học sinh trong lớp
- `teacher_class_map` - Giáo viên dạy lớp
- `class_courses` - Khóa học gán cho lớp

### Learning Paths (3 tables)
- `learning_path` - Lộ trình học
- `learning_path_items` - Items trong path
- `recommendation_events` - Sự kiện gợi ý

---

## 🔌 API Patterns

### Response Format
```typescript
// Success
{
  // Data directly or wrapped
}

// Error
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common Endpoints Pattern
```
GET    /api/entities          # List all
POST   /api/entities          # Create
GET    /api/entities/:id      # Get one
PATCH  /api/entities/:id      # Update
DELETE /api/entities/:id      # Delete
```

### Class-specific Patterns
```
GET    /api/classes/:id/students              # Get enrolled students
GET    /api/classes/:id/available-students    # Get students NOT enrolled
POST   /api/classes/:id/students              # Enroll student
DELETE /api/classes/:id/students/:studentId   # Remove student
GET    /api/classes/:id/progress              # Class progress
```

---

## 🎨 Frontend Patterns

### Component Structure
```typescript
// Page component
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

export default function PageName() {
  const { user } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch data
  useEffect(() => {
    api.endpoint.getAll().then(setData).finally(() => setLoading(false));
  }, []);
  
  // Render
}
```

### API Client
```typescript
// All API calls go through api object
import { api } from "@/lib/api";

// Usage
api.classes.getAll();
api.classes.enrollStudent(classId, { studentId, status: "active" });
api.students.getById(studentId);
```

### UI Components
- Sử dụng **HeroUI** cho components (Button, Modal, Input, v.v.)
- Sử dụng **TailwindCSS** cho styling
- Icons từ **Lucide React**
- Toast notifications từ **sonner**

---

## 🔧 Development Guidelines

### Backend
1. **Always use Drizzle ORM** - Không viết raw SQL
2. **Validation with class-validator** - DTOs phải có decorator
3. **Guards cho security** - JWT + Roles
4. **Service layer** - Business logic trong service, không trong controller

### Frontend
1. **"use client"** cho interactive components
2. **Server components** mặc định cho static content
3. **TypeScript strict** - Không dùng `any`
4. **Loading states** - Luôn có loading và error states

### Git
1. **Conventional commits**:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `refactor:` Code refactoring
   - `chore:` Maintenance

2. **Branch naming**:
   - `feature/description`
   - `fix/description`
   - `docs/description`

---

## 🚨 Common Issues & Solutions

### Backend
| Issue | Solution |
|-------|----------|
| Drizzle relation error | Check foreign key, use `.leftJoin()` |
| JWT invalid | Check cookie, verify secret |
| API Key missing | Add `x-api-key` header |

### Frontend
| Issue | Solution |
|-------|----------|
| Hydration mismatch | Check "use client", initial data |
| API 401 | Check login, cookie settings |
| Type error | Check types in `types/` folder |

---

## 📝 File Locations

| Purpose | Path |
|---------|------|
| API Client | `app/src/lib/api.ts` |
| Types | `app/src/types/*.ts` |
| Backend DTOs | `backend/src/*/dto/*.dto.ts` |
| Database Schema | `backend/db/schema.ts` |
| Environment | `backend/.env`, `app/.env.local` |

---

## 🔗 Important Notes

1. **API Key Required** - Tất cả requests cần `x-api-key` header
2. **Role-based Access** - Teacher chỉ thấy data của mình
3. **Mastery Calculation** - Tự động tính toán qua `student_kp_progress`
4. **AI Integration** - LangChain + OpenAI/Gemini cho content generation
5. **File Upload** - S3-compatible (Cloudflare R2)

---

## 📚 References

- [README.md](./README.md) - Tổng quan dự án
- [CHANGELOGS.md](./CHANGELOGS.md) - Lịch sử thay đổi
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Trạng thái features
- [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) - API docs

---

*Last Updated: 2026-03-03*
