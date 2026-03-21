# Adaptive Learning Platform

> An AI-powered adaptive learning platform that personalizes each student's learning journey — decomposing knowledge into atomic units, tracking mastery in real time, and using AI to continuously adjust content, assessments, and learning paths based on learner behavior.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-FF6B6B?style=for-the-badge)
![LangChain](https://img.shields.io/badge/LangChain-AI-orange?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## What is Adaptive Learning?

### Traditional definition

Adaptive learning is typically understood as: track learner performance, estimate understanding, suggest the next lesson. This is a **reactive** model — the system only responds when new data arrives.

### Our definition

This project extends adaptive learning into a **closed-loop system** with AI at the center:

```
Student interacts with content
    ↓
Collect signals (scores, time, errors, behavior patterns)
    ↓
AI analyzes learner state (mastery, weaknesses, prerequisite gaps)
    ↓
AI decides next action + generates appropriate content
    ↓
Adjust learning path / create exercises / personalized feedback
    ↓
Student interacts again (loop repeats)
```

Key differences:

| Traditional adaptive learning | This project |
|---|---|
| Recommends next lesson based on fixed rules | AI analyzes context and decides the best action |
| Pre-made content, only changes order | AI generates new content tailored to specific mistakes |
| Measures mastery by test scores alone | Measures mastery from multiple signals: scores, time, history, prerequisites |
| One-directional: system → student | Closed-loop: student ↔ AI ↔ content |

### Five layers of adaptation

1. **Observation** — Capture all signals: attempts, scores, time on task, activity history, specific errors
2. **Diagnosis** — AI analyzes: estimate mastery, detect weak KPs, identify prerequisite gaps, recognize learning patterns
3. **Decision** — AI selects the optimal action: continue, review, fill prerequisite gaps, assess, adjust difficulty, branch
4. **Generation** — AI produces appropriate content: explanations, interactive visualizations, exercises at the right difficulty, personalized feedback
5. **Feedback Loop** — Update learner state after every interaction, continuously adjust the path

### Role of AI in the system

**Analysis & Diagnosis:**
- Estimate mastery from multiple signals (not just scores)
- Detect prerequisite gaps and misconceptions
- Identify each student's learning patterns
- Generate diagnostic reports for teachers

**Adaptive Content Generation:**
- Generate theory content and interactive visualizations per Knowledge Point
- Generate questions matched to current proficiency level
- Create supplementary exercises when weaknesses are detected
- Explain errors in a personalized way

**Automated Assessment:**
- Grade written assignments with detailed rubric-based analysis
- Classify understanding level through answer patterns
- Provide specific, actionable feedback

**Path Recommendation:**
- Decide next action: learn / practice / review / assess / remediate
- Automatically update Learning Paths based on current mastery
- Record every adaptation decision (auditable)

---

## Core Concepts

### Knowledge Point (KP)

The smallest unit of knowledge — each KP represents a specific skill or concept:

- "Polynomial multiplication with monomials"
- "Newton's First Law"
- "Identifying passive voice"

Each KP can link to: theory, videos, interactive visualizations, exercises, prerequisites, and mastery state.

### Mastery

A dynamic estimate of how well a student understands a KP. Mastery is not a fixed number — it changes continuously based on:

- Answer correctness
- Number of attempts and error patterns
- Time on task
- Difficulty of questions attempted
- Prerequisite readiness

### Learning Path

A personalized sequence of learning actions. Not just "next lesson" — it can include: learn new content, practice, review, assess, fill prerequisite gaps, or accelerate.

### Recommendation Event

A record of every adaptation decision made by the system. Important because adaptive learning must be **auditable** — the system should explain why it recommended a specific action.

---

## System Architecture

### Course Structure

```
Course → Module → Section → Knowledge Point
```

Each level supports: hierarchical content management, KP reuse across courses, precise linking to exercises and assessments.

### High-Level Architecture

```
Frontend (Next.js 16 + React + HeroUI)
    ↓
Backend API (NestJS 11)
    ├── Auth & Role Management (JWT + Firebase)
    ├── Curriculum Layer (Courses, Modules, Sections, KPs)
    ├── Learner State Layer (Progress, Mastery, Attempts, Time-on-task)
    ├── Assessment Layer (Question Bank, Assignments, AI Grading)
    ├── AI Generation Layer (Content, Visualizations, Questions)
    ├── Analytics Layer (Course Analytics, Dashboard, Insights)
    └── [Planned] Adaptation Layer (AI Recommendations, Learning Paths)
         ↓
    PostgreSQL (Neon Serverless) via Drizzle ORM
```

---

## Current Status

### Built and functional

**Curriculum & Knowledge Modeling**
- Full Course → Module → Section → Knowledge Point structure
- Prerequisite system (dependency graph between KPs)
- Resources (video, articles, interactive) attached to each KP
- Public course cloning (deep-copy entire structure + KPs + questions)

**Learner State Tracking**
- Mastery score (0-100) per KP per student
- Confidence score that increases with attempts
- Immutable mastery history (every score change is recorded)
- Question attempts with time tracking
- Time-on-task per KP and section
- Weekly activity (attempts + study minutes per day)

**AI Features (operational)**
- **Interactive content generation**: AI creates self-contained HTML visualizations/games per KP topic (scoped CSS + JS)
- **Automated grading**: Cron-based pipeline — downloads files from R2, extracts text (PDF/DOCX), AI grades against rubric, teacher reviews results. Supports OpenAI, Gemini, Kimi
- **Multi-provider AI**: Factory pattern supporting OpenAI (gpt-4o-mini), Gemini (gemini-1.5-flash), Kimi via LangChain

**Assessment & Assignments**
- Question bank (multiple choice, true/false, short answer) with IRT metadata (difficulty, discrimination)
- Assign to students/classes/sections, submit via file upload (R2), manual + AI grading
- Exercises linked to KPs by difficulty level

**Role-based System**
- 4 roles: Admin, Teacher, Student, Parent
- JWT cookies + Google Firebase sign-in
- Authorization at both backend (Guards + Decorators) and frontend (Middleware + conditional UI)
- Parent access to children's progress

**Analytics & Notifications**
- Dashboard analytics: completion rate, high-failure KPs, difficult modules, weekly performance
- Automatic notifications when mastery crosses thresholds (60%, 80%) or drops below 50%
- Comprehensive activity log (audit trail)

### Schema exists, logic not yet implemented

| Component | Schema | Logic needed |
|---|---|---|
| `student_mastery` (aggregate mastery per course) | Yes | Auto-computation service |
| `student_insights` (strengths, weaknesses, risk KPs) | Yes | AI-powered analysis |
| `recommendation_events` (adaptation decisions) | Yes | AI recommendation logic |
| `learning_path` created_by=system | Yes | AI auto-generation |
| IRT parameters in mastery calculation | Yes | Currently unused; mastery uses binary logic |
| Question difficulty auto-calibration | Yes | Currently hardcoded at difficulty=5 |

---

## Roadmap: AI-Powered Adaptive Learning

The current codebase has the full data foundation. Next steps are deeper AI integration to make the system truly adaptive:

### Phase 1: Advanced Mastery Engine
- Apply IRT parameters to mastery calculation (replace binary 0/100)
- Bayesian Knowledge Tracing or rule-based model
- Auto-update `student_mastery` and `student_insights`

### Phase 2: AI Diagnosis
- AI detects misconceptions and prerequisite gaps
- Analyze error patterns (not just right/wrong, but where and why)
- Generate diagnostic reports for teachers

### Phase 3: AI Recommendation
- AI decides next action: learn / practice / review / assess / remediate
- Auto-generate and update Learning Paths
- Record recommendation_events (auditable)

### Phase 4: AI Remediation
- AI generates explanations tailored to specific errors
- Create supplementary exercises at the right difficulty
- Adjust explanation style based on student's learning pattern

### Phase 5: Teacher Copilot
- AI summarizes class status for teachers
- Suggest interventions for struggling students
- Explain the reasoning behind each recommendation

---

## Tech Stack

### Backend
- **NestJS 11** — Node.js framework
- **PostgreSQL** (Neon Serverless) — Database
- **Drizzle ORM** — Type-safe ORM
- **TypeScript** — Type safety
- **JWT + Firebase Admin** — Authentication
- **LangChain** — AI orchestration (OpenAI + Gemini + Kimi)
- **Cloudflare R2** — File storage (S3-compatible)

### Frontend
- **Next.js 16** — React framework (App Router)
- **React** with React Compiler
- **HeroUI** — Component library
- **TailwindCSS 4** — Styling
- **Framer Motion** — Animations
- **SWR** — Data fetching
- **Axios** — HTTP client

---

## Project Structure

```
adaptive-learning/
├── app/                        # Next.js frontend
│   └── src/
│       ├── app/               # Pages (App Router)
│       │   ├── (auth)/dashboard/  # Protected dashboard pages
│       │   ├── login/         # Login page
│       │   └── ...            # Public pages (/, /about, /contact)
│       ├── components/        # React components
│       ├── hooks/             # Custom hooks (useUser, etc.)
│       ├── lib/               # API client, utilities
│       ├── contexts/          # React contexts
│       └── types/             # TypeScript interfaces
├── backend/                   # NestJS backend
│   ├── src/
│   │   ├── auth/             # JWT + Firebase Google sign-in
│   │   ├── users/            # User CRUD
│   │   ├── students/         # Student profiles + dashboard
│   │   ├── teachers/         # Teacher profiles
│   │   ├── parents/          # Parent profiles + children access
│   │   ├── admins/           # Admin management
│   │   ├── classes/          # Classes + enrollment + teacher assignment
│   │   ├── courses/          # Courses + modules + sections
│   │   ├── knowledge-points/ # KPs + prerequisites + AI content generation
│   │   ├── question-bank/    # Questions + IRT metadata
│   │   ├── assignments/      # Assignments + AI grading pipeline
│   │   ├── student-progress/ # Mastery tracking + attempts + time-on-task
│   │   ├── learning-paths/   # Learning path CRUD
│   │   ├── course-analytics/ # Analytics (completion, failure, difficulty)
│   │   ├── dashboard/        # Role-aware dashboard + stats
│   │   ├── explorer/         # Public course browsing + cloning
│   │   ├── activity-log/     # Audit trail + session tracking
│   │   ├── notifications/    # Event-driven notifications
│   │   ├── upload/           # Cloudflare R2 file storage
│   │   └── firebase/         # Firebase Admin SDK
│   └── db/
│       └── schema.ts         # Drizzle schema (24 tables)
└── docs/
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp backend/.env.example backend/.env
cp app/.env.example app/.env.local
# Edit .env files with your values

# Push database schema
pnpm db:push

# Start development (frontend + backend)
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Package Management

```bash
# Add dependency to frontend
pnpm --filter app add <package>

# Add dependency to backend
pnpm --filter backend-nestjs add <package>

# Add dev dependency to backend
pnpm --filter backend-nestjs add -D <package>
```

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full system management, users, analytics |
| **Teacher** | Create courses, manage classes, assign work, view student progress |
| **Student** | Study content, complete assignments, track own progress |
| **Parent** | View children's progress, receive notifications |

---

## License

MIT
