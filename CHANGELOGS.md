# Changelogs - Adaptive Learning Platform

## [Unreleased] - 2026-03-21

### Added
- **pnpm Workspace at Root**: Standardized monorepo package management from root
  - Added `pnpm-workspace.yaml` with `app` and `backend` packages
  - Added root `package.json` scripts for `dev`, `dev:app`, `dev:backend`, `build`, `lint`, `test`, and DB tasks
  - Added root `.npmrc` for workspace lockfile and shared hoisting behavior

### Changed
- **Session Policy for Login**: Implemented explicit remember-me behavior
  - `rememberMe = true` → auth/session cookie expiry is **7 days**
  - `rememberMe = false` → auth/session cookie expiry is **1 day**
  - Applied consistently for email login and Google login
- **Email Normalization**: Unified email handling in auth/user services
  - Emails are normalized to lowercase before lookup/create/update
  - Login is now case-insensitive by email
  - Password matching remains case-sensitive
- **Workspace Lockfile Strategy**: Moved to a single root `pnpm-lock.yaml`
  - Removed package-level lockfiles from `app/` and `backend/`

### Fixed
- **Google Login UX**: Fixed loading state when user closes Google popup
  - Prevents stuck loading when popup is dismissed
  - Handles Firebase `auth/popup-closed-by-user` without showing failure state
- **UI Interaction Consistency**
  - Added pointer cursor for notification trigger and class workspace tab buttons
  - Removed development-only middleware cookie debug logs

### Documentation
- Updated `README.md`, `PROJECT_STATUS.md`, and `backend/API_DOCUMENTATION.md` to reflect:
  - Root workspace workflow with pnpm
  - Remember-me cookie TTL policy
  - Email normalization and authentication behavior

## [Unreleased] - 2026-03-04

### Added
- **AGENTS.md Documentation**: Added comprehensive guidance document for AI agents
  - Project structure and conventions
  - Tech stack details
  - API patterns and security guidelines
  - Frontend/backend development guidelines

- **RBAC for Dashboard Routes**: Role-based access control implementation
  - `/dashboard/courses` - Accessible by all authenticated users
  - `/dashboard/users` - Restricted to admin only
  - Proper role checking and redirects

- **Course Assignment UI**: New course assignment interface in class detail page
  - Assign courses to classes
  - View assigned courses with status
  - Manage course-class relationships

- **Course Settings Modal**: Edit course settings directly from course edit page
  - Edit button with modal popup
  - Quick settings modification
  - Improved UX for course management

- **Student Dashboard Redesign**: Complete redesign of student-facing pages
  - Redesigned `my-courses` page with new UI
  - Redesigned `learning-path` page
  - Redesigned `progress` page
  - Consistent design with admin/teacher pages

- **Real Data Integration**: Student dashboard now uses real data
  - Connected to backend APIs
  - Dynamic content based on student progress
  - Real-time statistics

- **Reports Page Redesign**: Complete reports page overhaul
  - Real data from analytics APIs
  - Export functionality for reports
  - Enhanced visualizations

### Changed
- **Learning Paths API**: Updated to match new database schema
  - API endpoints alignment
  - Frontend component updates
  - Removed create/delete features for students (view-only)

- **UI Consistency**: Design unification across all pages
  - Removed shadows for cleaner look
  - Consistent styling with admin/teacher pages
  - Improved visual hierarchy

### Fixed
- **Student Dashboard Stats API**: Resolved build errors
  - TypeScript type issues fixed
  - API response handling improved
  - Error boundaries added

### Documentation
- **API Documentation**: Updated with complete endpoints
  - All new endpoints documented
  - Request/response examples added
  - Role-based access documented

---

## [Unreleased] - 2026-03-03

### Added
- **Available Students API**: New endpoint to get students not enrolled in a specific class
  - API endpoint: `GET /api/classes/:id/available-students` (teacher/admin access)
  - Returns all students who are not currently enrolled in the specified class
  - Fixed issue where teachers couldn't see available students to add to their classes

- **Admin Password Reset**: Password reset functionality for users from user detail page (admin only)
  - API endpoint: `POST /api/users/:id/reset-password` (admin role required)
  - Frontend modal with password validation and generate random password feature
  - Integration with `users/resetPassword` API method
  
- **Teacher Dashboard Stats**: New endpoint for teacher-specific statistics
  - API endpoint: `GET /api/dashboard/teacher-stats` (teacher role required)
  - Frontend integration with teacher dashboard
  
- **Class Progress Tracking**: Progress monitoring for classes
  - API endpoint: `GET /api/classes/:id/progress`
  - Shows class-level progress metrics
  
- **Teacher Class Filtering**: Classes are now filtered by assigned teacher for teacher role
  - Teachers only see their assigned classes
  - Admins continue to see all classes

### Fixed
- **User Detail Password Reset**: Connected password reset functionality to backend API (previously was just a mock)

## [Unreleased] - 2026-02-20

### Added
- **UI/UX Redesign v3.0**: Complete redesign of Adaptive Learning Platform interface
- **Firebase Integration**: Firebase integration for enhanced dashboard features
- **Adaptive Learning Features**: Updated and improved adaptive learning features

### Fixed
- **Authentication**: Fixed login and access token handling issues
- **Middleware**: Fixed various middleware issues (domain, routing)
- **CORS**: Fixed CORS origin issues for production
- **TypeScript**: Fixed MetricCard component errors
- **Deployment**: Fixed frontend and project deployment issues

### Changed
- **Major UI Overhaul**: Complete UI restructuring with Firebase integration
- **Code Cleanup**: Cleaned up and optimized codebase

---

## [2026-01-04]

### Added
- **Knowledge Point Detail View**: View KP details with theory, visualization, questions, resources
- **Questions & Games System**: 4 question types (Multiple Choice, True/False, Fill in Blank, Interactive Games)
- **AI Content Generation**: OpenAI/Gemini integration to generate visualization content
- **Localized Resource Management**: Changed "Learning Resources" → "Documents", localize resource types
- **Dual Question System**: Supports both content questions (client-side) and question bank (server-side)

### Changed
- **Content Structure**: Changed from flexible JSON to structured object with theory, visualization, questions
- **Toast Migration**: Migrated from `sonner` to `@heroui/toast`
- **Course Structure API**: Returns full KP objects instead of just IDs

### Removed
- **Tags Field**: Removed `tags` field from Knowledge Point
- **Summary Field**: Removed `summary` field from Section
- **Examples Tab**: Merged into Theory tab

### Breaking Changes
- Content field structure changed - `examples` removed
- `generateContent` API only accepts `contentType: 'visualization'`
- Toast notifications migrated to HeroUI
- Course detail page prioritizes `content.questions` over question bank API

---

## [2025-12]

### Added
- **Course Management**: CRUD courses, modules, sections
- **Knowledge Points**: Create KPs with prerequisites, resources, difficulty levels
- **AI Content Generation**: Generate examples and visualizations with GPT-4o-mini/Gemini
- **Resource Management**: Upload files, manage learning resources

### Changed
- **Content Field**: Added required `content: json` field for knowledge points

---

## [2025-11]

### Added
- **Authentication**: JWT-based auth with roles (admin, teacher, student, parent)
- **User Management**: User profiles, parent-student relationships
- **Class Management**: Class system with grade levels, student enrollment
- **Role-based Access Control**: Role permissions for teacher/admin/student

---

## Previous

- Initial project setup
- Database schema design with PostgreSQL
- Backend API foundation (NestJS)
- Frontend foundation (Next.js + HeroUI)
