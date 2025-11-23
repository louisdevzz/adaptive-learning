# Recent Changes Summary

## ✅ Completed Updates

### User & Profile System
- **User model** - Simplified (removed role, full_name, OAuth fields)
- **Profile model** - Created separate table for user profiles
- **user_repo.py** - **Automatically creates Profile when creating User**
- **profile_repo.py** - New repository for profile management
- **profile_service.py** - New service for profile CRUD operations
- **api/v1/profile.py** - New API endpoints:
  - `GET /profile/me` - Get current user's profile
  - `PUT /profile/me` - Update current user's profile
  - `GET /profile/{user_id}` - Get any user's profile (public)

### How User Registration Works Now:
```python
# When user registers:
1. User record is created (email, username, hash_password)
2. Profile record is automatically created (user_id, role from input or 'student', full_name from input)
3. User can update profile later via PUT /profile/me

# Example flow:
POST /auth/register → Creates User + Profile (with full_name and role from input)
PUT /profile/me → Updates full_name, role, image, meta_data
```

### User Registration Input:
- `email` (required) - User email address
- `username` (required) - Username (3-100 chars)
- `password` (required) - Password (min 6 chars)
- `full_name` (optional) - User's full name (will be stored in profile)
- `role` (optional) - User role (defaults to 'student' if not provided)

### Models Updated
- ✅ Removed 14 unnecessary models
- ✅ Created 7 new models (Profile, Question, Resource, junction tables, AssessmentConfig)
- ✅ Updated 6 core models (User, Course, Module, Section, KnowledgePoint, Exercise)

### Schemas Updated
- ✅ Created 6 new schemas (profile, question, exercise, resource, enrollment, search)
- ✅ Updated 5 existing schemas (auth, course, module, section, kp)

### Repositories Updated
- ✅ user_repo.py - Auto-creates profile on user creation
- ✅ profile_repo.py - New
- ✅ course_repo.py - Updated (slug→code, is_published→is_active)

### Services Updated
- ✅ auth_service.py - Simplified, uses new user/profile structure
- ✅ profile_service.py - New
- ✅ All services auto-updated: `title` → `name`, `is_published` → `is_active`

### Field Name Changes (Applied Globally)
- `title` → `name` (Course, Module, Section, KnowledgePoint)
- `hashed_password` → `hash_password` (User)
- `is_published` → `is_active` (Course)

---

## ⚠️ Next Steps

### 1. Database Migration
```bash
# Generate migration
uv run alembic revision --autogenerate -m "align_with_erd_diagram"

# Key changes to edit in migration:
# - Rename columns (title → name, hashed_password → hash_password)
# - Create profiles table
# - Create new tables (questions, resources, junction tables)
# - Drop old tables (achievements, quizzes, notifications, etc.)
# - Add new columns (user_id to courses, module_number, section_number, etc.)
```

### 2. Manual Service Reviews
Check business logic in:
- `course_service.py` - Ensure user_id is passed when creating
- `module_service.py` - Ensure module_number is required
- `section_service.py` - Ensure section_number is required
- `kp_service.py` - Ensure module_id, course_id are passed

### 3. API Routes
Add profile router to main app:
```python
# In main.py or api router
from api.v1 import profile
app.include_router(profile.router, prefix="/api/v1")
```

---

## Breaking Changes

### API Changes
- User registration no longer returns `full_name` or `role` in user object
- Access profile data via `/profile/me` endpoint
- Course endpoints use `name` instead of `title`
- Course endpoints use `is_active` instead of `is_published`

### Database Schema
- Users table: removed many fields, added `pin`
- Profiles table: new table with user profile data
- Courses, Modules, Sections, KPs: `title` → `name`
- Many tables removed (quizzes, achievements, notifications, etc.)

---

## Testing Checklist

- [ ] User registration creates both User and Profile
- [ ] Profile endpoints work (GET/PUT /profile/me)
- [ ] Course CRUD with new field names
- [ ] Module/Section/KP creation with required fields
- [ ] Database migration runs successfully
- [ ] All tests pass
