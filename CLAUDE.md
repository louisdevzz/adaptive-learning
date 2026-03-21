# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adaptive Learning Platform — a personalized learning system with separate **backend** (NestJS) and **frontend** (Next.js) applications. The backend runs on port 8000, frontend on port 3000.

## Development Commands

### Backend (`/backend`, uses pnpm)
```bash
cd backend
pnpm start:dev          # Dev server with watch mode (port 8000)
pnpm build              # Compile TypeScript
pnpm start:prod         # Run compiled dist/main
pnpm lint               # ESLint with autofix
pnpm format             # Prettier
pnpm test               # Jest unit tests
pnpm test:watch         # Jest watch mode
pnpm test:e2e           # End-to-end tests
pnpm db:generate        # Generate Drizzle migrations
pnpm db:push            # Push schema changes to database
pnpm db:studio          # Open Drizzle Studio GUI
```

### Frontend (`/app`, uses npm)
```bash
cd app
npm run dev             # Dev server (port 3000)
npm run build           # Production build
npm run lint            # ESLint
```

## Architecture

### Backend (`/backend`)
- **Framework:** NestJS 11 with TypeScript
- **Database:** PostgreSQL via Neon serverless, ORM is Drizzle (`backend/db/schema.ts` — 24 tables)
- **Auth:** JWT stored in HTTP-only cookies + Firebase Google sign-in. Guards: `JwtAuthGuard`, `RolesGuard`, `ApiKeyGuard`
- **API prefix:** All endpoints are under NestJS default routing. Global API key validation via `x-api-key` header
- **File storage:** Cloudflare R2 (S3-compatible) via AWS SDK
- **AI:** LangChain + OpenAI + Google Gemini for content generation (knowledge points)

**Module structure** — each feature is a NestJS module under `backend/src/`:
`auth`, `users`, `students`, `teachers`, `parents`, `admins`, `classes`, `courses`, `knowledge-points`, `question-bank`, `assignments`, `student-progress`, `learning-paths`, `course-analytics`, `dashboard`, `explorer`, `upload`, `firebase`

Each module follows the pattern: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.ts`

**Database schema** (`backend/db/schema.ts`): Users & roles, courses/modules/sections, knowledge points with prerequisites, question bank with IRT parameters, assignments, student progress/mastery tracking, classes with enrollment, analytics.

### Frontend (`/app`)
- **Framework:** Next.js 16 with App Router, React compiler enabled
- **UI:** HeroUI component library + TailwindCSS 4 + Framer Motion
- **State/Data:** SWR for data fetching, Axios API client (`app/src/lib/api.ts`)
- **Path alias:** `@/*` maps to `./src/*`

**Routing structure** (`app/src/app/`):
- `(auth)/dashboard/*` — protected dashboard pages (classes, courses, learning-path, my-courses, progress, reports, students, users)
- `login/` — login page
- Public pages: `/`, `/about`, `/contact`

**Middleware** (`app/src/middleware.ts`): Cookie-based auth check. Redirects unauthenticated users to `/login`, redirects authenticated users away from `/login`.

**Key files:**
- `app/src/lib/api.ts` — centralized Axios API client with all endpoint functions
- `app/src/hooks/useUser.ts` — SWR-based user profile hook with logout
- `app/src/types/` — TypeScript interfaces for all domain models

## Auth & Roles

Four roles: `admin`, `teacher`, `student`, `parent`. Role-based access is enforced at both:
- Backend: `@Roles()` decorator + `RolesGuard`
- Frontend: middleware route protection + conditional UI rendering

Auth flow: JWT in HTTP-only cookies (`access_token`), validated server-side. Google sign-in via Firebase Admin SDK.

## Environment Variables

Backend requires: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `API_KEY`, `PORT`, `CORS_ORIGIN`, Firebase credentials, R2 credentials, `OPENAI_API_KEY`. See `backend/.env.example`.

Frontend requires: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_KEY`. See `app/.env.example`.

## Testing

Backend uses Jest. Test files are `*.spec.ts` colocated with source files under `backend/src/`. No frontend test setup currently exists.
