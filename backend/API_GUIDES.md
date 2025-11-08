# API Documentation

Comprehensive guide for all API endpoints in the Adaptive Learning Platform.

## Table of Contents

- [Authentication](#authentication)
- [Common Headers](#common-headers)
- [Error Responses](#error-responses)
- [UUID Format](#uuid-format)
- [Authentication Endpoints](#authentication-endpoints)
- [Course Endpoints](#course-endpoints)
- [Module Endpoints](#module-endpoints)
- [Section Endpoints](#section-endpoints)
- [Knowledge Points & Mastery Endpoints](#knowledge-points--mastery-endpoints)
- [Search Endpoints](#search-endpoints)

## Base URL

```
http://localhost:8000
```

All API endpoints are prefixed with `/api/v1`

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Expiration
- **Access Token**: 30 minutes
- **Refresh Token**: 7 days

## Common Headers

### Required for all requests:
```http
Content-Type: application/json
```

### Required for authenticated requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

---

## UUID Format

**Important:** All resource IDs (users, courses, modules, sections, knowledge points, mastery records) use UUID v4 format instead of integers.

### UUID Format Example:
```
e5e108bd-fc41-484f-b423-2e12c23585be
```

### Key Points:
- **Format**: 8-4-4-4-12 hexadecimal characters
- **Case**: Lowercase (though case-insensitive)
- **Validation**: Must be a valid UUID v4
- **In URLs**: Use the full UUID string
- **In JSON**: String type, not integer

### Example ID Usage:

```json
{
  "id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "user_id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a"
}
```

---

## Authentication Endpoints

### 1. Register with Email/Password

Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Authentication:** None required

**Request Body:**

```json
{
  "email": "student@example.com",
  "username": "john_doe",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "role": "student"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| username | string | Yes | Unique username (3-50 chars) |
| password | string | Yes | Password (min 8 chars) |
| full_name | string | No | User's full name |
| role | string | Yes | One of: student, teacher, admin, parent |

**Response:** `201 Created`

```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "john_doe",
  "full_name": "John Doe",
  "role": "student",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "username": "john_doe",
    "password": "SecurePassword123!",
    "full_name": "John Doe",
    "role": "student"
  }'
```

**Error Responses:**

```json
// 400 - Email already exists
{
  "detail": "Email already registered"
}

// 400 - Username already exists
{
  "detail": "Username already taken"
}

// 422 - Validation error
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

### 2. Login with Email/Password

Authenticate and receive access tokens.

**Endpoint:** `POST /api/v1/auth/login`

**Authentication:** None required

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjQyMjQ...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjQyODQ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "username": "john_doe",
    "full_name": "John Doe",
    "role": "student"
  }
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123!"
  }'
```

**Error Responses:**

```json
// 401 - Invalid credentials
{
  "detail": "Incorrect email or password"
}

// 401 - Account disabled
{
  "detail": "Account is disabled"
}
```

---

### 3. Login with Google OAuth

Authenticate using Google OAuth.

**Endpoint:** `POST /api/v1/auth/google`

**Authentication:** None required

**Request Body:**

```json
{
  "token": "google_oauth_token_here",
  "role": "student"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Google OAuth token |
| role | string | No | User role (for new users) |

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "email": "user@gmail.com",
    "username": "user_gmail",
    "full_name": "Google User",
    "role": "student"
  }
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ya29.a0AfH6SMB...",
    "role": "student"
  }'
```

---

### 4. Get Current User

Retrieve authenticated user's information.

**Endpoint:** `GET /api/v1/auth/me`

**Authentication:** Required (any role)

**Request Headers:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "john_doe",
  "full_name": "John Doe",
  "role": "student",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Error Responses:**

```json
// 401 - Invalid or expired token
{
  "detail": "Could not validate credentials"
}
```

---

### 5. Logout

Invalidate the current session.

**Endpoint:** `POST /api/v1/auth/logout`

**Authentication:** Required

**Request Headers:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`

```json
{
  "message": "Successfully logged out"
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Course Endpoints

### 1. Create Course

Create a new course (teacher/admin only).

**Endpoint:** `POST /api/v1/courses/`

**Authentication:** Required (teacher or admin)

**Request Headers:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Introduction to Python Programming",
  "description": "Learn Python from scratch with hands-on exercises",
  "slug": "intro-python",
  "level": "beginner",
  "duration_hours": 40,
  "is_published": false
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Course title |
| description | string | Yes | Course description |
| slug | string | No | URL-friendly identifier (auto-generated if not provided) |
| level | string | No | beginner, intermediate, advanced |
| duration_hours | integer | No | Estimated hours to complete |
| is_published | boolean | No | Whether course is visible to students (default: false) |

**Response:** `201 Created`

```json
{
  "id": 1,
  "title": "Introduction to Python Programming",
  "description": "Learn Python from scratch with hands-on exercises",
  "slug": "intro-python",
  "level": "beginner",
  "duration_hours": 40,
  "is_published": false,
  "created_by": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/courses/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Python Programming",
    "description": "Learn Python from scratch with hands-on exercises",
    "slug": "intro-python",
    "level": "beginner",
    "duration_hours": 40
  }'
```

**Error Responses:**

```json
// 403 - Insufficient permissions
{
  "detail": "Not enough permissions"
}

// 400 - Slug already exists
{
  "detail": "Course with this slug already exists"
}
```

---

### 2. List All Courses

Get a paginated list of all published courses.

**Endpoint:** `GET /api/v1/courses/`

**Authentication:** Optional (public endpoint, but shows more info if authenticated)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | Number of records to skip |
| limit | integer | 20 | Maximum records to return (max: 100) |
| level | string | - | Filter by level (beginner, intermediate, advanced) |
| is_published | boolean | true | Filter by published status |

**Request Example:**

```http
GET /api/v1/courses/?skip=0&limit=10&level=beginner
```

**Response:** `200 OK`

```json
{
  "total": 15,
  "skip": 0,
  "limit": 10,
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Python Programming",
      "description": "Learn Python from scratch with hands-on exercises",
      "slug": "intro-python",
      "level": "beginner",
      "duration_hours": 40,
      "is_published": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Web Development with React",
      "description": "Build modern web applications with React",
      "slug": "react-web-dev",
      "level": "intermediate",
      "duration_hours": 50,
      "is_published": true,
      "created_at": "2024-01-16T09:00:00Z"
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET "http://localhost:8000/api/v1/courses/?skip=0&limit=10&level=beginner"
```

---

### 3. Get Course by Slug

Get detailed information about a course using its human-readable slug.

**Endpoint:** `GET /api/v1/courses/slug/{slug}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Course slug (e.g., "intro-python") |

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "title": "Introduction to Python Programming",
  "description": "Learn Python from scratch with hands-on exercises",
  "slug": "intro-python",
  "level": "beginner",
  "duration_hours": 40,
  "is_published": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "modules": [
    {
      "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "title": "Python Basics",
      "description": "Introduction to Python syntax and fundamentals",
      "order": 1,
      "sections_count": 5
    },
    {
      "id": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
      "title": "Control Flow",
      "description": "Learn about conditionals and loops",
      "order": 2,
      "sections_count": 4
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/courses/slug/intro-python
```

**Error Responses:**

```json
// 404 - Course not found
{
  "detail": "Course not found"
}
```

**Note:** This endpoint is useful for creating SEO-friendly URLs and sharing course links.

---

### 4. Get Course Details by ID

Get detailed information about a specific course including its modules using UUID.

**Endpoint:** `GET /api/v1/courses/{course_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| course_id | UUID | Course UUID |

**Response:** `200 OK`

```json
{
  "id": 1,
  "title": "Introduction to Python Programming",
  "description": "Learn Python from scratch with hands-on exercises",
  "slug": "intro-python",
  "level": "beginner",
  "duration_hours": 40,
  "is_published": true,
  "created_by": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "modules": [
    {
      "id": 1,
      "title": "Python Basics",
      "description": "Introduction to Python syntax and fundamentals",
      "order": 1,
      "sections_count": 5
    },
    {
      "id": 2,
      "title": "Control Flow",
      "description": "Learn about conditionals and loops",
      "order": 2,
      "sections_count": 4
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/courses/1
```

**Error Responses:**

```json
// 404 - Course not found
{
  "detail": "Course not found"
}
```

---

### 4. Update Course

Update an existing course (teacher/admin only).

**Endpoint:** `PUT /api/v1/courses/{course_id}`

**Authentication:** Required (teacher or admin, must be course creator)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| course_id | integer | Course ID |

**Request Body:**

```json
{
  "title": "Introduction to Python Programming - Updated",
  "description": "Comprehensive Python course with new content",
  "level": "beginner",
  "duration_hours": 45,
  "is_published": true
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "title": "Introduction to Python Programming - Updated",
  "description": "Comprehensive Python course with new content",
  "slug": "intro-python",
  "level": "beginner",
  "duration_hours": 45,
  "is_published": true,
  "created_by": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z"
}
```

**Example (curl):**

```bash
curl -X PUT http://localhost:8000/api/v1/courses/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Python Programming - Updated",
    "duration_hours": 45,
    "is_published": true
  }'
```

---

### 5. Delete Course

Delete a course (admin only, or teacher who created it).

**Endpoint:** `DELETE /api/v1/courses/{course_id}`

**Authentication:** Required (admin or course creator)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| course_id | integer | Course ID |

**Response:** `204 No Content`

**Example (curl):**

```bash
curl -X DELETE http://localhost:8000/api/v1/courses/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Error Responses:**

```json
// 403 - Not authorized to delete
{
  "detail": "Not authorized to delete this course"
}

// 404 - Course not found
{
  "detail": "Course not found"
}
```

---

### 6. Search Courses

Search courses by keyword.

**Endpoint:** `GET /api/v1/courses/search/`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| skip | integer | No | Number of records to skip |
| limit | integer | No | Maximum records to return |

**Request Example:**

```http
GET /api/v1/courses/search/?q=python&limit=5
```

**Response:** `200 OK`

```json
{
  "total": 3,
  "query": "python",
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Python Programming",
      "description": "Learn Python from scratch",
      "slug": "intro-python",
      "level": "beginner"
    },
    {
      "id": 5,
      "title": "Advanced Python Techniques",
      "description": "Master advanced Python concepts",
      "slug": "advanced-python",
      "level": "advanced"
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET "http://localhost:8000/api/v1/courses/search/?q=python&limit=5"
```

---

## Module Endpoints

### 1. Create Module

Create a new module within a course (teacher/admin only).

**Endpoint:** `POST /api/v1/modules/`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "course_id": 1,
  "title": "Python Basics",
  "description": "Introduction to Python syntax and fundamentals",
  "order": 1
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| course_id | integer | Yes | ID of the parent course |
| title | string | Yes | Module title |
| description | string | No | Module description |
| order | integer | No | Display order (auto-assigned if not provided) |

**Response:** `201 Created`

```json
{
  "id": 1,
  "course_id": 1,
  "title": "Python Basics",
  "description": "Introduction to Python syntax and fundamentals",
  "order": 1,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/modules/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1,
    "title": "Python Basics",
    "description": "Introduction to Python syntax and fundamentals",
    "order": 1
  }'
```

---

### 2. Get Module Details

Get all modules for a specific course.

**Endpoint:** `GET /api/v1/modules/course/{course_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| course_id | integer | Course ID |

**Response:** `200 OK`

```json
{
  "course_id": 1,
  "total_modules": 3,
  "modules": [
    {
      "id": 1,
      "title": "Python Basics",
      "description": "Introduction to Python syntax and fundamentals",
      "order": 1,
      "sections_count": 5
    },
    {
      "id": 2,
      "title": "Control Flow",
      "description": "Learn about conditionals and loops",
      "order": 2,
      "sections_count": 4
    },
    {
      "id": 3,
      "title": "Functions",
      "description": "Master Python functions",
      "order": 3,
      "sections_count": 6
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/modules/course/1
```

---

### 3. Get Module Details

Get detailed information about a specific module including its sections.

**Endpoint:** `GET /api/v1/modules/{module_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| module_id | integer | Module ID |

**Response:** `200 OK`

```json
{
  "id": 1,
  "course_id": 1,
  "title": "Python Basics",
  "description": "Introduction to Python syntax and fundamentals",
  "order": 1,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "sections": [
    {
      "id": 1,
      "title": "Variables and Data Types",
      "content_type": "text",
      "order": 1,
      "knowledge_points_count": 3
    },
    {
      "id": 2,
      "title": "Operators",
      "content_type": "text",
      "order": 2,
      "knowledge_points_count": 4
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/modules/1
```

---

### 4. Update Module

Update an existing module (teacher/admin only).

**Endpoint:** `PUT /api/v1/modules/{module_id}`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "title": "Python Basics - Updated",
  "description": "Comprehensive introduction to Python fundamentals",
  "order": 1
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "course_id": 1,
  "title": "Python Basics - Updated",
  "description": "Comprehensive introduction to Python fundamentals",
  "order": 1,
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Example (curl):**

```bash
curl -X PUT http://localhost:8000/api/v1/modules/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Basics - Updated",
    "description": "Comprehensive introduction to Python fundamentals"
  }'
```

---

### 5. Delete Module

Delete a module (admin only, or teacher who created the course).

**Endpoint:** `DELETE /api/v1/modules/{module_id}`

**Authentication:** Required (admin or course creator)

**Response:** `204 No Content`

**Example (curl):**

```bash
curl -X DELETE http://localhost:8000/api/v1/modules/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Section Endpoints

### 1. Create Section

Create a new section within a module (teacher/admin only).

**Endpoint:** `POST /api/v1/sections/`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "module_id": 1,
  "title": "Variables and Data Types",
  "content": "# Variables in Python\n\nVariables are containers for storing data values...",
  "content_type": "text",
  "order": 1
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| module_id | integer | Yes | ID of the parent module |
| title | string | Yes | Section title |
| content | string | No | Section content (supports Markdown) |
| content_type | string | No | text, video, quiz, exercise (default: text) |
| order | integer | No | Display order |

**Response:** `201 Created`

```json
{
  "id": 1,
  "module_id": 1,
  "title": "Variables and Data Types",
  "content": "# Variables in Python\n\nVariables are containers for storing data values...",
  "content_type": "text",
  "order": 1,
  "created_at": "2024-01-15T11:30:00Z",
  "updated_at": "2024-01-15T11:30:00Z"
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/sections/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": 1,
    "title": "Variables and Data Types",
    "content": "# Variables in Python\n\nVariables are containers...",
    "content_type": "text",
    "order": 1
  }'
```

---

### 2. m

Get all sections for a specific module.

**Endpoint:** `GET /api/v1/sections/module/{module_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| module_id | integer | Module ID |

**Response:** `200 OK`

```json
{
  "module_id": 1,
  "total_sections": 5,
  "sections": [
    {
      "id": 1,
      "title": "Variables and Data Types",
      "content_type": "text",
      "order": 1,
      "knowledge_points_count": 3
    },
    {
      "id": 2,
      "title": "Operators",
      "content_type": "text",
      "order": 2,
      "knowledge_points_count": 4
    },
    {
      "id": 3,
      "title": "Practice Quiz",
      "content_type": "quiz",
      "order": 3,
      "knowledge_points_count": 5
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/sections/module/1
```

---

### 3. Get Section Details

Get detailed information about a specific section including knowledge points.

**Endpoint:** `GET /api/v1/sections/{section_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| section_id | integer | Section ID |

**Response:** `200 OK`

```json
{
  "id": 1,
  "module_id": 1,
  "title": "Variables and Data Types",
  "content": "# Variables in Python\n\nVariables are containers for storing data values...",
  "content_type": "text",
  "order": 1,
  "created_at": "2024-01-15T11:30:00Z",
  "updated_at": "2024-01-15T11:30:00Z",
  "knowledge_points": [
    {
      "id": 1,
      "title": "Variable Declaration",
      "description": "How to declare variables in Python",
      "order": 1
    },
    {
      "id": 2,
      "title": "Data Types",
      "description": "Understanding int, float, string, boolean",
      "order": 2
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/sections/1
```

---

### 4. Update Section

Update an existing section (teacher/admin only).

**Endpoint:** `PUT /api/v1/sections/{section_id}`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "title": "Variables and Data Types - Expanded",
  "content": "# Updated content with more examples...",
  "order": 1
}
```

**Response:** `200 OK`

**Example (curl):**

```bash
curl -X PUT http://localhost:8000/api/v1/sections/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Variables and Data Types - Expanded",
    "content": "# Updated content..."
  }'
```

---

### 5. Delete Section

Delete a section (admin only, or teacher who created the course).

**Endpoint:** `DELETE /api/v1/sections/{section_id}`

**Authentication:** Required (admin or course creator)

**Response:** `204 No Content`

**Example (curl):**

```bash
curl -X DELETE http://localhost:8000/api/v1/sections/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Knowledge Points & Mastery Endpoints

### 1. Create Knowledge Point

Create a new knowledge point within a section (teacher/admin only).

**Endpoint:** `POST /api/v1/knowledge-points/`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "section_id": 1,
  "title": "Variable Declaration",
  "description": "Understanding how to declare and assign variables in Python",
  "content": "In Python, you can create a variable by simply assigning a value: x = 5",
  "difficulty_level": "beginner",
  "order": 1
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| section_id | integer | Yes | ID of the parent section |
| title | string | Yes | Knowledge point title |
| description | string | No | Brief description |
| content | string | No | Detailed content |
| difficulty_level | string | No | beginner, intermediate, advanced |
| order | integer | No | Display order |

**Response:** `201 Created`

```json
{
  "id": 1,
  "section_id": 1,
  "title": "Variable Declaration",
  "description": "Understanding how to declare and assign variables in Python",
  "content": "In Python, you can create a variable by simply assigning a value: x = 5",
  "difficulty_level": "beginner",
  "order": 1,
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/knowledge-points/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": 1,
    "title": "Variable Declaration",
    "description": "Understanding how to declare and assign variables",
    "difficulty_level": "beginner",
    "order": 1
  }'
```

---

### 2. List Knowledge Points for a Section

Get all knowledge points for a specific section.

**Endpoint:** `GET /api/v1/knowledge-points/section/{section_id}`

**Authentication:** Optional (authenticated users see mastery progress)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| section_id | integer | Section ID |

**Response:** `200 OK`

```json
{
  "section_id": 1,
  "total_knowledge_points": 3,
  "knowledge_points": [
    {
      "id": 1,
      "title": "Variable Declaration",
      "description": "Understanding how to declare variables",
      "difficulty_level": "beginner",
      "order": 1,
      "mastery_level": 0.85,
      "user_progress": {
        "attempts": 5,
        "successes": 4,
        "last_practiced": "2024-01-15T14:00:00Z"
      }
    },
    {
      "id": 2,
      "title": "Data Types",
      "description": "Understanding different data types",
      "difficulty_level": "beginner",
      "order": 2,
      "mastery_level": 0.60,
      "user_progress": {
        "attempts": 3,
        "successes": 2,
        "last_practiced": "2024-01-14T10:00:00Z"
      }
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/knowledge-points/section/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Get Knowledge Point Details

Get detailed information about a specific knowledge point.

**Endpoint:** `GET /api/v1/knowledge-points/{kp_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| kp_id | integer | Knowledge Point ID |

**Response:** `200 OK`

```json
{
  "id": 1,
  "section_id": 1,
  "title": "Variable Declaration",
  "description": "Understanding how to declare and assign variables in Python",
  "content": "In Python, you can create a variable by simply assigning a value: x = 5",
  "difficulty_level": "beginner",
  "order": 1,
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "user_mastery": {
    "mastery_level": 0.85,
    "attempts": 5,
    "successes": 4,
    "time_spent_minutes": 45,
    "last_practiced": "2024-01-15T14:00:00Z"
  }
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/knowledge-points/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Update Knowledge Point

Update an existing knowledge point (teacher/admin only).

**Endpoint:** `PUT /api/v1/knowledge-points/{kp_id}`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "title": "Variable Declaration and Assignment",
  "description": "Updated description with more detail",
  "content": "Extended content with examples...",
  "difficulty_level": "beginner"
}
```

**Response:** `200 OK`

**Example (curl):**

```bash
curl -X PUT http://localhost:8000/api/v1/knowledge-points/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Variable Declaration and Assignment",
    "description": "Updated description"
  }'
```

---

### 5. Delete Knowledge Point

Delete a knowledge point (admin only, or teacher who created the course).

**Endpoint:** `DELETE /api/v1/knowledge-points/{kp_id}`

**Authentication:** Required (admin or course creator)

**Response:** `204 No Content`

**Example (curl):**

```bash
curl -X DELETE http://localhost:8000/api/v1/knowledge-points/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 6. Track Learning Progress

Record a learning activity for a knowledge point (adaptive learning).

**Endpoint:** `POST /api/v1/knowledge-points/progress`

**Authentication:** Required (student)

**Request Body:**

```json
{
  "knowledge_point_id": 1,
  "is_correct": true,
  "time_spent_seconds": 120,
  "difficulty_rating": 3,
  "notes": "Good practice session"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| knowledge_point_id | integer | Yes | ID of the knowledge point |
| is_correct | boolean | Yes | Whether the attempt was successful |
| time_spent_seconds | integer | No | Time spent on this attempt |
| difficulty_rating | integer | No | User's difficulty rating (1-5) |
| notes | string | No | Optional notes |

**Response:** `200 OK`

```json
{
  "knowledge_point_id": 1,
  "mastery_level": 0.87,
  "previous_mastery": 0.85,
  "improvement": 0.02,
  "total_attempts": 6,
  "total_successes": 5,
  "success_rate": 0.833,
  "total_time_spent_minutes": 47,
  "recommendation": {
    "status": "proficient",
    "message": "Great progress! You're mastering this concept.",
    "next_action": "Move to the next knowledge point",
    "practice_more": false
  }
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/knowledge-points/progress \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "knowledge_point_id": 1,
    "is_correct": true,
    "time_spent_seconds": 120,
    "difficulty_rating": 3
  }'
```

---

### 7. Get Mastery Summary

Get overall mastery summary for a user (course, module, or overall).

**Endpoint:** `GET /api/v1/knowledge-points/mastery/summary`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| course_id | integer | No | Filter by course |
| module_id | integer | No | Filter by module |
| section_id | integer | No | Filter by section |

**Request Example:**

```http
GET /api/v1/knowledge-points/mastery/summary?course_id=1
```

**Response:** `200 OK`

```json
{
  "user_id": 1,
  "course_id": 1,
  "overall_mastery": 0.72,
  "total_knowledge_points": 50,
  "mastered_points": 36,
  "in_progress_points": 10,
  "not_started_points": 4,
  "total_time_spent_hours": 12.5,
  "total_attempts": 245,
  "success_rate": 0.78,
  "breakdown_by_difficulty": {
    "beginner": {
      "total": 20,
      "mastered": 18,
      "average_mastery": 0.89
    },
    "intermediate": {
      "total": 25,
      "mastered": 15,
      "average_mastery": 0.68
    },
    "advanced": {
      "total": 5,
      "mastered": 3,
      "average_mastery": 0.55
    }
  },
  "recent_activity": [
    {
      "knowledge_point_id": 15,
      "title": "List Comprehensions",
      "practiced_at": "2024-01-15T14:30:00Z",
      "mastery_change": 0.05
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET "http://localhost:8000/api/v1/knowledge-points/mastery/summary?course_id=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 8. Get Learning Recommendations

Get personalized learning recommendations based on mastery levels.

**Endpoint:** `GET /api/v1/knowledge-points/mastery/recommendations`

**Authentication:** Required (student)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| course_id | integer | No | Filter by course |
| limit | integer | No | Maximum recommendations (default: 10) |

**Request Example:**

```http
GET /api/v1/knowledge-points/mastery/recommendations?course_id=1&limit=5
```

**Response:** `200 OK`

```json
{
  "user_id": 1,
  "recommendations": [
    {
      "type": "review",
      "priority": "high",
      "knowledge_point": {
        "id": 8,
        "title": "Loops",
        "section_id": 3,
        "difficulty_level": "beginner"
      },
      "reason": "Mastery level declining (0.65 -> 0.52)",
      "current_mastery": 0.52,
      "target_mastery": 0.80,
      "estimated_time_minutes": 15
    },
    {
      "type": "practice",
      "priority": "medium",
      "knowledge_point": {
        "id": 12,
        "title": "Functions",
        "section_id": 4,
        "difficulty_level": "intermediate"
      },
      "reason": "Low success rate (45%)",
      "current_mastery": 0.48,
      "target_mastery": 0.70,
      "estimated_time_minutes": 25
    },
    {
      "type": "new",
      "priority": "low",
      "knowledge_point": {
        "id": 20,
        "title": "Classes and Objects",
        "section_id": 7,
        "difficulty_level": "intermediate"
      },
      "reason": "Ready for new content - prerequisites mastered",
      "prerequisites_mastered": true,
      "estimated_time_minutes": 30
    }
  ],
  "overall_recommendation": "Focus on reviewing 'Loops' to strengthen fundamentals before moving forward",
  "study_plan": {
    "suggested_daily_minutes": 45,
    "estimated_days_to_course_completion": 28
  }
}
```

**Example (curl):**

```bash
curl -X GET "http://localhost:8000/api/v1/knowledge-points/mastery/recommendations?course_id=1&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Mastery Levels

The adaptive learning system uses mastery levels (0.0 to 1.0) with the following thresholds:

| Level | Range | Status | Description |
|-------|-------|--------|-------------|
| Not Started | 0.0 | not_started | No practice attempts |
| Learning | 0.0 - 0.4 | learning | Initial learning phase |
| Developing | 0.4 - 0.7 | developing | Building competence |
| Proficient | 0.7 - 0.9 | proficient | Strong understanding |
| Mastered | 0.9 - 1.0 | mastered | Complete mastery |

### Factors Affecting Mastery:

1. **Success Rate**: Percentage of correct attempts
2. **Consistency**: Regular practice over time
3. **Time Spent**: Efficient vs. struggling
4. **Recency**: Recent performance weighted higher
5. **Difficulty**: Performance on harder questions

---

## Search Endpoints

### 1. Semantic Search

Perform semantic search across all content types using vector similarity and text search.

**Endpoint:** `POST /api/v1/search/`

**Authentication:** Required

**Request Headers:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "query": "How to declare variables in Python?",
  "content_types": ["courses", "modules", "sections", "knowledge_points"],
  "k": 10,
  "filters": {
    "metadata.level": "beginner"
  },
  "use_hybrid": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | Search query text |
| content_types | array | No | Types to search: courses, modules, sections, knowledge_points (default: all) |
| k | integer | No | Number of results per content type (default: 10) |
| filters | object | No | Filter conditions on metadata |
| use_hybrid | boolean | No | Use hybrid search (vector + text) (default: true) |

**Response:** `200 OK`

```json
{
  "query": "How to declare variables in Python?",
  "results": {
    "sections": [
      {
        "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        "score": 0.92,
        "title": "Variables and Data Types",
        "description": "Learn how to declare and use variables",
        "content": "In Python, variables are declared by assignment: x = 5",
        "content_type": "sections",
        "metadata": {
          "course_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
          "module_id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
          "level": "beginner",
          "order": 1
        }
      }
    ],
    "knowledge_points": [
      {
        "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
        "score": 0.89,
        "title": "Variable Declaration",
        "description": "Understanding variable declaration syntax",
        "content": "Variables in Python don't need explicit type declaration",
        "content_type": "knowledge_points",
        "metadata": {
          "section_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
          "difficulty_level": "beginner"
        }
      }
    ]
  },
  "total_results": 15,
  "search_time_ms": 245.5
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/search/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to declare variables in Python?",
    "content_types": ["sections", "knowledge_points"],
    "k": 10,
    "use_hybrid": true
  }'
```

**Error Responses:**

```json
// 401 - Unauthorized
{
  "detail": "Could not validate credentials"
}

// 500 - Search failed
{
  "detail": "Search failed: OpenSearch connection error"
}
```

---

### 2. Find Similar Documents

Find documents similar to a given document using vector similarity.

**Endpoint:** `POST /api/v1/search/similar`

**Authentication:** Required

**Request Body:**

```json
{
  "content_type": "sections",
  "doc_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "k": 5
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_type | string | Yes | Type of content: courses, modules, sections, knowledge_points |
| doc_id | string | Yes | UUID of the document to find similar to |
| k | integer | No | Number of similar documents to return (default: 5) |

**Response:** `200 OK`

```json
{
  "content_type": "sections",
  "doc_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "similar_documents": [
    {
      "id": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
      "score": 0.87,
      "title": "Variable Assignment",
      "description": "Learn about assigning values to variables",
      "content": "Assignment in Python uses the = operator...",
      "content_type": "sections",
      "metadata": {
        "course_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
        "module_id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a"
      }
    }
  ]
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/search/similar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "sections",
    "doc_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "k": 5
  }'
```

---

### 3. Search Within Course

Search for content within a specific course.

**Endpoint:** `GET /api/v1/search/courses/{course_id}/search`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| course_id | UUID | Course UUID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query text |
| k | integer | No | Number of results (default: 10) |

**Request Example:**

```http
GET /api/v1/search/courses/e5e108bd-fc41-484f-b423-2e12c23585be/search?query=loops&k=10
```

**Response:** `200 OK`

```json
{
  "query": "loops",
  "results": {
    "modules": [
      {
        "id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
        "score": 0.91,
        "title": "Control Flow",
        "description": "Learn about loops and conditionals",
        "content": "Loops allow you to repeat code execution...",
        "content_type": "modules",
        "metadata": {
          "course_id": "e5e108bd-fc41-484f-b423-2e12c23585be"
        }
      }
    ],
    "sections": [
      {
        "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        "score": 0.95,
        "title": "For Loops",
        "description": "Understanding for loops in Python",
        "content": "For loops iterate over sequences...",
        "content_type": "sections",
        "metadata": {
          "course_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
          "module_id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a"
        }
      }
    ]
  },
  "total_results": 8,
  "search_time_ms": 156.3
}
```

**Example (curl):**

```bash
curl -X GET "http://localhost:8000/api/v1/search/courses/e5e108bd-fc41-484f-b423-2e12c23585be/search?query=loops&k=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Index Document

Index a single document in OpenSearch (Admin/Teacher only).

**Endpoint:** `POST /api/v1/search/index`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "content_type": "sections",
  "doc_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_type | string | Yes | Type: courses, modules, sections, knowledge_points |
| doc_id | string | Yes | UUID of the document to index |

**Response:** `200 OK`

```json
{
  "success": true,
  "doc_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "content_type": "sections",
  "message": "Document indexed successfully"
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/search/index \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "sections",
    "doc_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
  }'
```

**Error Responses:**

```json
// 403 - Insufficient permissions
{
  "detail": "Not enough permissions"
}

// 400 - Invalid content type
{
  "detail": "Invalid content type: invalid_type"
}
```

---

### 5. Reindex All Content

Reindex all content in OpenSearch (Admin only).

**Endpoint:** `POST /api/v1/search/reindex`

**Authentication:** Required (admin only)

**Request Body:**

```json
{
  "content_types": ["courses", "modules", "sections", "knowledge_points"]
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_types | array | No | Types to reindex (default: all) |

**Response:** `200 OK`

```json
{
  "success": true,
  "counts": {
    "courses": 15,
    "modules": 45,
    "sections": 180,
    "knowledge_points": 520
  },
  "total_indexed": 760
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/search/reindex \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Note:** This is a long-running operation that may take several minutes depending on the amount of content.

**Error Responses:**

```json
// 403 - Insufficient permissions
{
  "detail": "Not enough permissions"
}

// 500 - Reindexing failed
{
  "detail": "Reindexing failed: Database connection error"
}
```

---

### 6. Health Check

Check OpenSearch cluster health (Admin only).

**Endpoint:** `GET /api/v1/search/health`

**Authentication:** Required (admin only)

**Response:** `200 OK`

```json
{
  "opensearch_status": "green",
  "cluster_name": "opensearch-cluster",
  "number_of_nodes": 1,
  "active_shards": 4,
  "indices": {
    "courses": true,
    "modules": true,
    "sections": true,
    "knowledge_points": true
  }
}
```

**Status Values:**

| Status | Description |
|--------|-------------|
| green | All shards allocated, cluster fully operational |
| yellow | All primary shards allocated, some replicas not allocated |
| red | Some primary shards not allocated, cluster partially operational |

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/search/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Error Responses:**

```json
// 403 - Insufficient permissions
{
  "detail": "Not enough permissions"
}

// 500 - Health check failed
{
  "detail": "Health check failed: Unable to connect to OpenSearch"
}
```

---

### 7. Initialize Indices

Initialize OpenSearch indices (Admin only).

**Endpoint:** `POST /api/v1/search/initialize`

**Authentication:** Required (admin only)

**Response:** `200 OK`

```json
{
  "success": true,
  "indices": {
    "courses": true,
    "modules": true,
    "sections": true,
    "knowledge_points": true
  }
}
```

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/search/initialize \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Note:** This endpoint creates all required indices with proper mappings if they don't already exist. It's safe to call multiple times.

**Error Responses:**

```json
// 403 - Insufficient permissions
{
  "detail": "Not enough permissions"
}

// 500 - Initialization failed
{
  "detail": "Failed to initialize indices: Mapping error"
}
```

---

## Search Features

### Semantic Search

The search system uses vector embeddings to understand the semantic meaning of queries:

- **Vector Search**: Uses sentence transformers to find conceptually similar content
- **Text Search**: Traditional keyword matching for exact terms
- **Hybrid Search**: Combines both approaches for best results

### Search Filters

Apply filters to narrow down search results:

```json
{
  "filters": {
    "metadata.level": "beginner",
    "metadata.course_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
    "metadata.difficulty_level": "intermediate"
  }
}
```

### Content Types

Search across different content types:

- **courses**: Course titles, descriptions
- **modules**: Module titles, descriptions
- **sections**: Section content, titles
- **knowledge_points**: Knowledge point content, descriptions

### Scoring

Results are ranked by relevance score (0.0 to 1.0):

| Score Range | Relevance |
|-------------|-----------|
| 0.9 - 1.0 | Highly relevant |
| 0.7 - 0.9 | Very relevant |
| 0.5 - 0.7 | Relevant |
| 0.3 - 0.5 | Somewhat relevant |
| < 0.3 | Low relevance |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Default**: 60 requests per minute per user
- **Burst**: Up to 100 requests in short bursts

**Rate limit headers in response:**

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642248000
```

When rate limit exceeded:

```json
// 429 - Too Many Requests
{
  "detail": "Rate limit exceeded. Try again in 30 seconds."
}
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 20, max: 100)

**Response Format:**

```json
{
  "total": 100,
  "skip": 20,
  "limit": 20,
  "items": [...]
}
```

---

## WebSocket Support (Future)

Real-time updates for:
- Live progress tracking
- Collaborative learning
- Instant feedback on exercises

**Endpoint:** `ws://localhost:8000/ws`

---

## Support

For API issues or questions:
- Check the interactive docs at `/docs`
- Review the ReDoc at `/redoc`
- Report issues on GitHub

---

**Last Updated:** 2024-01-15
**API Version:** 1.0.0
