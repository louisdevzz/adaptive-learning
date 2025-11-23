# API Documentation

Comprehensive guide for all API endpoints in the Adaptive Learning Platform.

## Table of Contents

- [Authentication](#authentication)
- [Common Headers](#common-headers)
- [Error Responses](#error-responses)
- [UUID Format](#uuid-format)
- [Authentication Endpoints](#authentication-endpoints)
- [Profile Endpoints](#profile-endpoints)
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

## Authentication Endpoints

### 1. Register with Email/Password

Create a new user account. A profile is automatically created with the user.

**Endpoint:** `POST /api/v1/auth/register`

**Authentication:** None required

**Request Body:**

```json
{
  "email": "student@example.com",
  "username": "john_doe",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "role": "student",
  "image": "https://example.com/avatar.jpg",
  "meta_data": {
    "student_code": "HS2025-3848",
    "grade_level": 7,
    "class_id": "class_uuid_12",
    "learning_style": "visual",
    "interests": ["math", "robotics"],
    "behavior_score": 85,
    "notes": "Needs help with fractions"
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| username | string | Yes | Unique username (3-100 chars) |
| password | string | Yes | Password (min 6 chars) |
| full_name | string | No | User's full name (stored in profile) |
| role | string | No | User role: student, teacher, admin, parent (defaults to 'student') |
| image | string | No | Profile image URL |
| meta_data | object | No | Additional metadata based on role (see examples below) |

**Meta Data Examples by Role:**

**STUDENT:**
```json
{
  "student_code": "HS2025-3848",
  "grade_level": 7,
  "class_id": "class_uuid_12",
  "parents": ["parent_profile_uuid_1", "parent_profile_uuid_2"],
  "learning_style": "visual",
  "interests": ["math", "robotics"],
  "behavior_score": 85,
  "notes": "Needs help with fractions"
}
```

**TEACHER:**
```json
{
  "phone": "+84-0901234567",
  "address": "Hồ Chí Minh, Việt Nam",
  "bio": "Giáo viên Toán với hơn 4 năm kinh nghiệm",
  "specialization": ["math", "physics"],
  "grades": [6, 7, 8],
  "assigned_courses": ["course_uuid_1", "course_uuid_2"],
  "homeroom_class": "class_uuid_5"
}
```

**ADMIN:**
```json
{
  "permissions": ["manage_users", "manage_courses", "view_reports"],
  "admin_level": "super"
}
```

**PARENT:**
```json
{
  "children": [
    {
      "student_id": "profile_uuid_student_1",
      "relationship": "father"
    }
  ],
  "contact_number": "+84-0900000000",
  "occupation": "Engineer"
}
```

**Response:** `201 Created`

```json
{
  "user": {
    "id": "e5e108bd-fc41-484f-b423-2e12c23585be",
    "email": "student@example.com",
    "username": "john_doe",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800
  }
}
```


**Example (curl) - Student Registration:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "username": "john_doe",
    "password": "SecurePassword123!",
    "full_name": "John Doe",
    "role": "student",
    "image": "https://example.com/avatar.jpg",
    "meta_data": {
      "student_code": "HS2025-3848",
      "grade_level": 7,
      "learning_style": "visual",
      "interests": ["math", "robotics"]
    }
  }'
```

**Example (curl) - Teacher Registration:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "username": "nguyen_van_a",
    "password": "SecurePassword123!",
    "full_name": "Nguyễn Văn A",
    "role": "teacher",
    "image": "https://example.com/teacher-avatar.jpg",
    "meta_data": {
      "phone": "+84-0901234567",
      "address": "Hồ Chí Minh, Việt Nam",
      "bio": "Giáo viên Toán với hơn 4 năm kinh nghiệm",
      "specialization": ["math", "physics"],
      "grades": [6, 7, 8]
    }
  }'
```

**Example (curl) - Admin Registration:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin_user",
    "password": "SecurePassword123!",
    "full_name": "Võ Hữu Nhân",
    "role": "admin",
    "meta_data": {
      "permissions": ["manage_users", "manage_courses", "view_reports"],
      "admin_level": "super"
    }
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

## Profile Endpoints

### 1. Get My Profile

Get the current authenticated user's profile.

**Endpoint:** `GET /api/v1/profile/me`

**Authentication:** Required

**Response Examples by Role:**

**Student Profile Response:**
```json
{
  "id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
  "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "full_name": "John Doe",
  "image": "https://example.com/avatar.jpg",
  "role": "student",
  "meta_data": {
    "student_code": "HS2025-3848",
    "grade_level": 7,
    "class_id": "class_uuid_12",
    "learning_style": "visual",
    "interests": ["math", "robotics"],
    "behavior_score": 85
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Teacher Profile Response:**
```json
{
  "id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
  "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "full_name": "Nguyễn Văn A",
  "image": "https://example.com/teacher-avatar.jpg",
  "role": "teacher",
  "meta_data": {
    "phone": "+84-0901234567",
    "address": "Hồ Chí Minh, Việt Nam",
    "bio": "Giáo viên Toán với hơn 4 năm kinh nghiệm",
    "specialization": ["math", "physics"],
    "grades": [6, 7, 8],
    "assigned_courses": ["course_uuid_1", "course_uuid_2"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/profile/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Update My Profile

Update the current user's profile information.

**Endpoint:** `PUT /api/v1/profile/me`

**Authentication:** Required

**Request Body Examples:**

**Update Student Profile:**
```json
{
  "full_name": "John Doe Updated",
  "image": "https://example.com/new-avatar.jpg",
  "meta_data": {
    "student_code": "HS2025-3848",
    "grade_level": 8,
    "learning_style": "auditory",
    "interests": ["math", "robotics", "programming"],
    "behavior_score": 90,
    "notes": "Improving on fractions"
  }
}
```

**Update Teacher Profile:**
```json
{
  "full_name": "Nguyễn Văn A",
  "image": "https://example.com/new-teacher-avatar.jpg",
  "meta_data": {
    "phone": "+84-0901234567",
    "address": "Hồ Chí Minh, Việt Nam",
    "bio": "Giáo viên Toán với hơn 5 năm kinh nghiệm giảng dạy",
    "specialization": ["math", "physics", "computer_science"],
    "grades": [6, 7, 8, 9],
    "assigned_courses": ["course_uuid_1", "course_uuid_2", "course_uuid_3"],
    "homeroom_class": "class_uuid_7"
  }
}
```

**Update Parent Profile:**
```json
{
  "full_name": "Trần Thị B",
  "image": "https://example.com/parent-avatar.jpg",
  "meta_data": {
    "children": [
      {
        "student_id": "profile_uuid_student_1",
        "relationship": "mother"
      },
      {
        "student_id": "profile_uuid_student_2",
        "relationship": "mother"
      }
    ],
    "contact_number": "+84-0900000000",
    "occupation": "Doctor",
    "email_notifications": true
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | No | User's full name |
| image | string | No | Profile image URL |
| role | string | No | User role (student, teacher, admin, parent) - Cannot be changed after registration |
| meta_data | object | No | Additional profile information (JSON) - Structure varies by role |

**Response:** `200 OK`

```json
{
  "id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
  "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "full_name": "John Doe Updated",
  "image": "https://example.com/new-avatar.jpg",
  "role": "student",
  "meta_data": {
    "student_code": "HS2025-3848",
    "grade_level": 8,
    "learning_style": "auditory",
    "interests": ["math", "robotics", "programming"],
    "behavior_score": 90
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z"
}
```

**Example (curl) - Update Student:**

```bash
curl -X PUT http://localhost:8000/api/v1/profile/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe Updated",
    "meta_data": {
      "grade_level": 8,
      "behavior_score": 90
    }
  }'
```

**Example (curl) - Update Teacher:**

```bash
curl -X PUT http://localhost:8000/api/v1/profile/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "meta_data": {
      "bio": "Giáo viên Toán với hơn 5 năm kinh nghiệm",
      "specialization": ["math", "physics", "computer_science"],
      "assigned_courses": ["course_uuid_1", "course_uuid_2", "course_uuid_3"]
    }
  }'
```

---

### 3. Get User Profile (Public)

Get any user's profile by user ID (public endpoint).

**Endpoint:** `GET /api/v1/profile/{user_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | UUID | User ID |

**Response:** `200 OK`

```json
{
  "id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
  "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "full_name": "John Doe",
  "image": "https://example.com/avatar.jpg",
  "role": "student",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/profile/e5e108bd-fc41-484f-b423-2e12c23585be
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

Create a new course (teacher/admin only). The `user_id` is automatically extracted from the authentication token.

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
  "name": "Introduction to Python Programming",
  "description": "Learn Python from scratch with hands-on exercises",
  "code": "PYTHON-101",
  "grade_level": 10,
  "academic_year": 2025,
  "difficulty_level": 1,
  "is_active": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Course name |
| description | string | No | Course description |
| code | string | Yes | Unique course code (e.g., "MATH-101", "PYTHON-101") |
| grade_level | integer | No | Grade level (1-12) |
| academic_year | integer | No | Academic year (2020-2100) |
| difficulty_level | integer | No | Difficulty: 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert (default: 3) |
| is_active | boolean | No | Whether course is published/active (default: true) |

**Note:** `user_id` is NOT required in the request body. It is automatically set from the authenticated user's token for security purposes.

**Difficulty Levels:**
- `1`: BEGINNER - For beginners
- `2`: ELEMENTARY - Basic knowledge required
- `3`: INTERMEDIATE - Moderate experience needed
- `4`: ADVANCED - Advanced understanding required
- `5`: EXPERT - Expert level

**Response:** `201 Created`

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "name": "Introduction to Python Programming",
  "description": "Learn Python from scratch with hands-on exercises",
  "code": "PYTHON-101",
  "grade_level": 10,
  "academic_year": 2025,
  "difficulty_level": 1,
  "is_active": true,
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
    "name": "Introduction to Python Programming",
    "description": "Learn Python from scratch with hands-on exercises",
    "code": "PYTHON-101",
    "grade_level": 10,
    "academic_year": 2025,
    "difficulty_level": 1,
    "is_active": true
  }'
```

**Example - Math Course:**

```bash
curl -X POST http://localhost:8000/api/v1/courses/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Toán học lớp 7",
    "description": "Chương trình Toán học lớp 7 theo chương trình mới",
    "code": "TOAN-7",
    "grade_level": 7,
    "academic_year": 2025,
    "difficulty_level": 2,
    "is_active": true
  }'
```

**Error Responses:**

```json
// 403 - Insufficient permissions
{
  "detail": "Not enough permissions"
}

// 400 - Code already exists
{
  "detail": "Course with this code already exists"
}

// 422 - Validation error
{
  "detail": [
    {
      "loc": ["body", "difficulty_level"],
      "msg": "ensure this value is less than or equal to 5",
      "type": "value_error.number.not_le"
    }
  ]
}
```

---

### 2. List All Courses

Get a paginated list of all courses.

**Endpoint:** `GET /api/v1/courses/`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (starts from 1) |
| page_size | integer | 20 | Number of items per page (max: 100) |
| grade_level | integer | - | Filter by grade level (1-12) |
| difficulty_level | integer | - | Filter by difficulty (1-5) |
| academic_year | integer | - | Filter by academic year |
| is_active | boolean | - | Filter by active status |

**Request Example:**

```http
GET /api/v1/courses/?page=1&page_size=10&grade_level=7&difficulty_level=2
```

**Response:** `200 OK`

```json
{
  "total": 15,
  "page": 1,
  "page_size": 10,
  "courses": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
      "name": "Toán học lớp 7",
      "description": "Chương trình Toán học lớp 7 theo chương trình mới",
      "code": "TOAN-7",
      "grade_level": 7,
      "academic_year": 2025,
      "difficulty_level": 2,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
      "name": "Ngữ văn lớp 7",
      "description": "Chương trình Ngữ văn lớp 7",
      "code": "NVAN-7",
      "grade_level": 7,
      "academic_year": 2025,
      "difficulty_level": 2,
      "is_active": true,
      "created_at": "2024-01-16T09:00:00Z",
      "updated_at": "2024-01-16T09:00:00Z"
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET "http://localhost:8000/api/v1/courses/?page=1&page_size=10&grade_level=7"
```

**Example - Filter by difficulty and year:**

```bash
curl -X GET "http://localhost:8000/api/v1/courses/?difficulty_level=1&academic_year=2025&is_active=true"
```

---

### 3. Get Course by Code

Get detailed information about a course using its unique course code.

**Endpoint:** `GET /api/v1/courses/code/{code}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| code | string | Course code (e.g., "TOAN-7", "PYTHON-101") |

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "name": "Toán học lớp 7",
  "description": "Chương trình Toán học lớp 7 theo chương trình mới",
  "code": "TOAN-7",
  "grade_level": 7,
  "academic_year": 2025,
  "difficulty_level": 2,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "modules": [
    {
      "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Số nguyên",
      "description": "Các phép toán với số nguyên",
      "order": 1,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    },
    {
      "id": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
      "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Phân số",
      "description": "Các phép toán với phân số",
      "order": 2,
      "created_at": "2024-01-15T11:30:00Z",
      "updated_at": "2024-01-15T11:30:00Z"
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/courses/code/TOAN-7
```

**Error Responses:**

```json
// 404 - Course not found
{
  "detail": "Course not found"
}
```

**Note:** This endpoint is useful for accessing courses by their unique code identifier.

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
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "user_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "name": "Introduction to Python Programming",
  "description": "Learn Python from scratch with hands-on exercises",
  "code": "PYTHON-101",
  "grade_level": 10,
  "academic_year": 2025,
  "difficulty_level": 1,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "modules": [
    {
      "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Python Basics",
      "description": "Introduction to Python syntax and fundamentals",
      "order": 1,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    },
    {
      "id": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
      "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Control Flow",
      "description": "Learn about conditionals and loops",
      "order": 2,
      "created_at": "2024-01-15T11:30:00Z",
      "updated_at": "2024-01-15T11:30:00Z"
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/courses/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
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
  "name": "Introduction to Python Programming - Updated",
  "description": "Comprehensive Python course with new content",
  "level": "beginner",
  "duration_hours": 45,
  "is_active": true
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "Introduction to Python Programming - Updated",
  "description": "Comprehensive Python course with new content",
  "slug": "intro-python",
  "level": "beginner",
  "duration_hours": 45,
  "is_active": true,
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
    "name": "Introduction to Python Programming - Updated",
    "duration_hours": 45,
    "is_active": true
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
      "name": "Introduction to Python Programming",
      "description": "Learn Python from scratch",
      "slug": "intro-python",
      "level": "beginner"
    },
    {
      "id": 5,
      "name": "Advanced Python Techniques",
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
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Số nguyên",
  "description": "Tập hợp số nguyên và các phép toán",
  "module_number": 1,
  "estimated_hours": 8,
  "difficulty_level": 2,
  "is_active": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| course_id | UUID | Yes | ID of the parent course |
| name | string | Yes | Module name |
| description | string | No | Module description |
| module_number | integer | Yes | Module number/order (starts from 1) |
| estimated_hours | integer | No | Estimated hours to complete |
| difficulty_level | integer | No | Difficulty: 1-5 (default: 3) |
| is_active | boolean | No | Whether module is active (default: true) |

**Response:** `201 Created`

```json
{
  "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Số nguyên",
  "description": "Tập hợp số nguyên và các phép toán",
  "module_number": 1,
  "estimated_hours": 8,
  "difficulty_level": 2,
  "is_active": true,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Example (curl) - Math Module:**

```bash
curl -X POST http://localhost:8000/api/v1/modules/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Số nguyên",
    "description": "Tập hợp số nguyên và các phép toán",
    "module_number": 1,
    "estimated_hours": 8,
    "difficulty_level": 2,
    "is_active": true
  }'
```

**Example (curl) - Programming Module:**

```bash
curl -X POST http://localhost:8000/api/v1/modules/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
    "name": "Python Basics",
    "description": "Introduction to Python syntax and fundamentals",
    "module_number": 1,
    "estimated_hours": 10,
    "difficulty_level": 1,
    "is_active": true
  }'
```

---

### 2. List Modules by Course

Get all modules for a specific course.

**Endpoint:** `GET /api/v1/modules/course/{course_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| course_id | UUID | Course UUID |

**Response:** `200 OK`

```json
[
  {
    "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Số nguyên",
    "description": "Tập hợp số nguyên và các phép toán",
    "module_number": 1,
    "estimated_hours": 8,
    "difficulty_level": 2,
    "is_active": true,
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  {
    "id": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
    "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Phân số",
    "description": "Các phép toán với phân số",
    "module_number": 2,
    "estimated_hours": 10,
    "difficulty_level": 2,
    "is_active": true,
    "created_at": "2024-01-15T11:30:00Z",
    "updated_at": "2024-01-15T11:30:00Z"
  },
  {
    "id": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
    "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Số thập phân",
    "description": "Số thập phân và các phép toán",
    "module_number": 3,
    "estimated_hours": 12,
    "difficulty_level": 3,
    "is_active": true,
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
]
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/modules/course/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
```

---

### 3. Get Module Details

Get detailed information about a specific module including its sections.

**Endpoint:** `GET /api/v1/modules/{module_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| module_id | UUID | Module UUID |

**Response:** `200 OK`

```json
{
  "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Số nguyên",
  "description": "Tập hợp số nguyên và các phép toán",
  "module_number": 1,
  "estimated_hours": 8,
  "difficulty_level": 2,
  "is_active": true,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "sections": [
    {
      "id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
      "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "name": "Tập hợp số nguyên",
      "description": "Khái niệm và ký hiệu tập hợp số nguyên",
      "content": "Số nguyên bao gồm...",
      "section_number": 1,
      "estimated_minutes": 30,
      "is_active": true,
      "created_at": "2024-01-15T12:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z"
    },
    {
      "id": "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
      "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "name": "So sánh số nguyên",
      "description": "Cách so sánh các số nguyên",
      "content": "Trên trục số...",
      "section_number": 2,
      "estimated_minutes": 45,
      "is_active": true,
      "created_at": "2024-01-15T12:30:00Z",
      "updated_at": "2024-01-15T12:30:00Z"
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/modules/b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e
```

---

### 4. Update Module

Update an existing module (teacher/admin only).

**Endpoint:** `PUT /api/v1/modules/{module_id}`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "name": "Python Basics - Updated",
  "description": "Comprehensive introduction to Python fundamentals",
  "order": 1
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "course_id": 1,
  "name": "Python Basics - Updated",
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
    "name": "Python Basics - Updated",
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
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "name": "Tập hợp số nguyên",
  "description": "Khái niệm và ký hiệu tập hợp số nguyên",
  "section_number": 1,
  "estimated_hours": 2,
  "difficulty_level": 2,
  "objectives": {
    "knowledge": ["Hiểu khái niệm số nguyên", "Biết ký hiệu tập hợp Z"],
    "skills": ["So sánh số nguyên", "Biểu diễn trên trục số"],
    "attitude": ["Tư duy logic", "Chính xác trong tính toán"]
  },
  "is_active": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| module_id | UUID | Yes | ID of the parent module |
| name | string | Yes | Section name |
| description | string | No | Section description |
| section_number | integer | Yes | Section number/order (starts from 1) |
| estimated_hours | integer | No | Estimated hours to complete |
| difficulty_level | integer | No | Difficulty: 1-5 (default: 3) |
| objectives | object | No | Learning objectives (knowledge, skills, attitude) |
| is_active | boolean | No | Whether section is active (default: true) |

**Response:** `201 Created`

```json
{
  "id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "name": "Tập hợp số nguyên",
  "description": "Khái niệm và ký hiệu tập hợp số nguyên",
  "section_number": 1,
  "estimated_hours": 2,
  "difficulty_level": 2,
  "objectives": {
    "knowledge": ["Hiểu khái niệm số nguyên", "Biết ký hiệu tập hợp Z"],
    "skills": ["So sánh số nguyên", "Biểu diễn trên trục số"],
    "attitude": ["Tư duy logic", "Chính xác trong tính toán"]
  },
  "is_active": true,
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Example (curl) - Math Section:**

```bash
curl -X POST http://localhost:8000/api/v1/sections/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "name": "Tập hợp số nguyên",
    "description": "Khái niệm và ký hiệu tập hợp số nguyên",
    "section_number": 1,
    "estimated_hours": 2,
    "difficulty_level": 2,
    "objectives": {
      "knowledge": ["Hiểu khái niệm số nguyên"],
      "skills": ["So sánh số nguyên"]
    }
  }'
```

---

### 2. List Sections by Module

Get all sections for a specific module.

**Endpoint:** `GET /api/v1/sections/module/{module_id}`

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| module_id | UUID | Module UUID |

**Response:** `200 OK`

```json
[
  {
    "id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "name": "Tập hợp số nguyên",
    "description": "Khái niệm và ký hiệu tập hợp số nguyên",
    "section_number": 1,
    "estimated_hours": 2,
    "difficulty_level": 2,
    "objectives": {
      "knowledge": ["Hiểu khái niệm số nguyên", "Biết ký hiệu tập hợp Z"],
      "skills": ["So sánh số nguyên", "Biểu diễn trên trục số"]
    },
    "is_active": true,
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  {
    "id": "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
    "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "name": "So sánh số nguyên",
    "description": "Cách so sánh các số nguyên trên trục số",
    "section_number": 2,
    "estimated_hours": 2,
    "difficulty_level": 2,
    "objectives": {
      "knowledge": ["Biết cách so sánh số nguyên"],
      "skills": ["Sắp xếp số nguyên", "Tìm số lớn nhất, nhỏ nhất"]
    },
    "is_active": true,
    "created_at": "2024-01-15T12:30:00Z",
    "updated_at": "2024-01-15T12:30:00Z"
  }
]
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/sections/module/b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e
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
  "id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "name": "Tập hợp số nguyên",
  "description": "Khái niệm và ký hiệu tập hợp số nguyên",
  "section_number": 1,
  "estimated_hours": 2,
  "difficulty_level": 2,
  "objectives": {
    "knowledge": ["Hiểu khái niệm số nguyên", "Biết ký hiệu tập hợp Z"],
    "skills": ["So sánh số nguyên", "Biểu diễn trên trục số"]
  },
  "is_active": true,
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "knowledge_points": [
    {
      "id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
      "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
      "name": "Khái niệm số nguyên",
      "description": "Định nghĩa và ký hiệu số nguyên",
      "kp_number": 1,
      "difficulty_level": 1,
      "bloom_level": "remember",
      "estimated_minutes": 15,
      "is_active": true
    },
    {
      "id": "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e",
      "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
      "name": "Ký hiệu tập hợp Z",
      "description": "Cách ký hiệu tập hợp số nguyên",
      "kp_number": 2,
      "difficulty_level": 1,
      "bloom_level": "understand",
      "estimated_minutes": 20,
      "is_active": true
    }
  ]
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/sections/e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b
```

---

### 4. Update Section

Update an existing section (teacher/admin only).

**Endpoint:** `PUT /api/v1/sections/{section_id}`

**Authentication:** Required (teacher or admin)

**Request Body:**

```json
{
  "name": "Variables and Data Types - Expanded",
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
    "name": "Variables and Data Types - Expanded",
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
  "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Variable Declaration",
  "description": "Understanding how to declare and assign variables in Python",
  "code": "PYTHON-VAR-001",
  "kp_type": "concept",
  "learning_objectives": {
    "knowledge": ["Understand variable declaration syntax"],
    "skills": ["Declare and assign variables"],
    "attitude": ["Practice good naming conventions"]
  },
  "difficulty_level": 1,
  "estimated_time": {
    "minutes": 15,
    "practice_minutes": 30
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| section_id | UUID | Yes | ID of the parent section |
| module_id | UUID | Yes | ID of the parent module |
| course_id | UUID | Yes | ID of the parent course |
| name | string | Yes | Knowledge point name (max 255 chars) |
| description | string | No | Brief description |
| code | string | Yes | Unique knowledge point code (max 50 chars) |
| kp_type | string | No | Type: concept, rule, formula, problem_type (default: concept) |
| learning_objectives | object | No | Learning objectives (JSON) |
| difficulty_level | integer | No | Difficulty: 1-5 (default: 3) |
| estimated_time | object | No | Estimated time (JSON) |

**KP Types:**
- `concept`: Conceptual knowledge
- `rule`: Rules and principles
- `formula`: Mathematical formulas
- `problem_type`: Problem-solving patterns

**Response:** `201 Created`

```json
{
  "id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
  "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Variable Declaration",
  "description": "Understanding how to declare and assign variables in Python",
  "code": "PYTHON-VAR-001",
  "kp_type": "concept",
  "learning_objectives": {
    "knowledge": ["Understand variable declaration syntax"],
    "skills": ["Declare and assign variables"],
    "attitude": ["Practice good naming conventions"]
  },
  "difficulty_level": 1,
  "estimated_time": {
    "minutes": 15,
    "practice_minutes": 30
  },
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
    "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Variable Declaration",
    "description": "Understanding how to declare and assign variables",
    "code": "PYTHON-VAR-001",
    "kp_type": "concept",
    "difficulty_level": 1
  }'
```

---

### 2. List Knowledge Points for a Section

Get all knowledge points for a specific section.

**Endpoint:** `GET /api/v1/knowledge-points/section/{section_id}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| section_id | UUID | Section UUID |

**Response:** `200 OK`

```json
[
  {
    "id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
    "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Variable Declaration",
    "description": "Understanding how to declare variables",
    "code": "PYTHON-VAR-001",
    "kp_type": "concept",
    "learning_objectives": {
      "knowledge": ["Understand variable declaration syntax"],
      "skills": ["Declare and assign variables"]
    },
    "difficulty_level": 1,
    "estimated_time": {
      "minutes": 15,
      "practice_minutes": 30
    },
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  {
    "id": "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e",
    "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Data Types",
    "description": "Understanding different data types",
    "code": "PYTHON-VAR-002",
    "kp_type": "concept",
    "learning_objectives": {
      "knowledge": ["Understand different data types"],
      "skills": ["Use appropriate data types"]
    },
    "difficulty_level": 1,
    "estimated_time": {
      "minutes": 20,
      "practice_minutes": 40
    },
    "created_at": "2024-01-15T12:30:00Z",
    "updated_at": "2024-01-15T12:30:00Z"
  }
]
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/knowledge-points/section/e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Get Knowledge Point Details

Get detailed information about a specific knowledge point.

**Endpoint:** `GET /api/v1/knowledge-points/{kp_id}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| kp_id | UUID | Knowledge Point UUID |

**Response:** `200 OK`

```json
{
  "id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
  "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Variable Declaration",
  "description": "Understanding how to declare and assign variables in Python",
  "code": "PYTHON-VAR-001",
  "kp_type": "concept",
  "learning_objectives": {
    "knowledge": ["Understand variable declaration syntax", "Know variable naming rules"],
    "skills": ["Declare and assign variables", "Choose appropriate variable names"],
    "attitude": ["Practice good naming conventions", "Write clean code"]
  },
  "difficulty_level": 1,
  "estimated_time": {
    "minutes": 15,
    "practice_minutes": 30,
    "total_minutes": 45
  },
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/knowledge-points/a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Update Knowledge Point

Update an existing knowledge point (teacher/admin only).

**Endpoint:** `PUT /api/v1/knowledge-points/{kp_id}`

**Authentication:** Required (teacher or admin)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| kp_id | UUID | Knowledge Point UUID |

**Request Body:**

```json
{
  "name": "Variable Declaration and Assignment",
  "description": "Updated description with more detail and examples",
  "code": "PYTHON-VAR-001-V2",
  "kp_type": "concept",
  "learning_objectives": {
    "knowledge": ["Understand variable declaration", "Know assignment operators"],
    "skills": ["Declare variables", "Assign values", "Use multiple assignment"],
    "attitude": ["Practice good naming", "Write readable code"]
  },
  "difficulty_level": 2,
  "estimated_time": {
    "minutes": 20,
    "practice_minutes": 40
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Knowledge point name (max 255 chars) |
| description | string | No | Brief description |
| code | string | No | Knowledge point code (max 50 chars) |
| kp_type | string | No | Type: concept, rule, formula, problem_type |
| learning_objectives | object | No | Learning objectives (JSON) |
| difficulty_level | integer | No | Difficulty: 1-5 |
| estimated_time | object | No | Estimated time (JSON) |

**Response:** `200 OK`

```json
{
  "id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
  "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Variable Declaration and Assignment",
  "description": "Updated description with more detail and examples",
  "code": "PYTHON-VAR-001-V2",
  "kp_type": "concept",
  "learning_objectives": {
    "knowledge": ["Understand variable declaration", "Know assignment operators"],
    "skills": ["Declare variables", "Assign values", "Use multiple assignment"],
    "attitude": ["Practice good naming", "Write readable code"]
  },
  "difficulty_level": 2,
  "estimated_time": {
    "minutes": 20,
    "practice_minutes": 40
  },
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**Example (curl):**

```bash
curl -X PUT http://localhost:8000/api/v1/knowledge-points/a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Variable Declaration and Assignment",
    "description": "Updated description with more detail",
    "difficulty_level": 2
  }'
```

---

### 5. Delete Knowledge Point

Delete a knowledge point (teacher/admin only).

**Endpoint:** `DELETE /api/v1/knowledge-points/{kp_id}`

**Authentication:** Required (teacher or admin)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| kp_id | UUID | Knowledge Point UUID |

**Response:** `200 OK`

```json
{
  "message": "Knowledge point deleted successfully"
}
```

**Example (curl):**

```bash
curl -X DELETE http://localhost:8000/api/v1/knowledge-points/a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Error Responses:**

```json
// 404 - Knowledge point not found
{
  "detail": "Knowledge point not found"
}

// 403 - Insufficient permissions
{
  "detail": "Not enough permissions"
}
```

---

## Student Mastery Endpoints

### 6. Track Learning Progress

Record a learning activity for a knowledge point (student only).

**Endpoint:** `POST /api/v1/knowledge-points/progress`

**Authentication:** Required (student)

**Request Body:**

```json
{
  "knowledge_point_id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
  "is_correct": true,
  "time_spent": 120
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| knowledge_point_id | UUID | Yes | ID of the knowledge point |
| is_correct | boolean | Yes | Whether the attempt was correct |
| time_spent | integer | Yes | Time spent in seconds |

**Response:** `200 OK`

```json
{
  "id": "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f",
  "student_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
  "knowledge_point_id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
  "section_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
  "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "skill_score": 85.5,
  "knowledge_score": 78.0,
  "attitude_score": 82.0,
  "combined_mastery": 83.65,
  "mastery_group": "B",
  "confidence": 0.75,
  "is_available": true,
  "is_started": true,
  "last_assessed": "2024-01-15T14:30:00Z",
  "attempt_count": 6,
  "total_time_spent": 720.0,
  "time_spent_hours": 0.2,
  "is_mastered": false,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**Mastery Groups:**

| Group | Combined Mastery | Description |
|-------|-----------------|-------------|
| A | 90-100 | Mastered - Excellent understanding |
| B | 75-89 | Good - Strong understanding |
| C | 60-74 | Average - Acceptable understanding |
| D | < 60 | Needs Improvement - Requires more practice |
| N | 0 (not started) | Not Started - No attempts yet |

**Example (curl):**

```bash
curl -X POST http://localhost:8000/api/v1/knowledge-points/progress \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "knowledge_point_id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
    "is_correct": true,
    "time_spent": 120
  }'
```

**Error Responses:**

```json
// 404 - Knowledge point not found
{
  "detail": "Knowledge point not found"
}

// 403 - Not a student
{
  "detail": "This endpoint is only for students"
}
```

---

### 7. Get Progress Summary

Get overall progress summary for the current user (student only).

**Endpoint:** `GET /api/v1/knowledge-points/mastery/summary`

**Authentication:** Required (student)

**Response:** `200 OK`

```json
{
  "total_knowledge_points": 50,
  "mastered_count": 12,
  "in_progress_count": 25,
  "not_started_count": 13,
  "overall_mastery": 72.5,
  "total_time_spent": 18000,
  "last_activity": "2024-01-15T14:30:00Z"
}
```

**Parameters:**

| Field | Type | Description |
|-------|------|-------------|
| total_knowledge_points | integer | Total number of knowledge points |
| mastered_count | integer | Number of mastered KPs (Group A: ≥90) |
| in_progress_count | integer | Number of in-progress KPs (Groups B, C, D) |
| not_started_count | integer | Number of not started KPs (Group N) |
| overall_mastery | float | Overall mastery percentage (0-100) |
| total_time_spent | integer | Total time spent in seconds |
| last_activity | datetime | Last learning activity timestamp |

**Example (curl):**

```bash
curl -X GET http://localhost:8000/api/v1/knowledge-points/mastery/summary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Error Responses:**

```json
// 403 - Not a student
{
  "detail": "This endpoint is only for students"
}
```

---

### 8. Get Learning Recommendations

Get personalized learning recommendations based on mastery levels (student only).

**Endpoint:** `GET /api/v1/knowledge-points/mastery/recommendations`

**Authentication:** Required (student)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Maximum recommendations (default: 5, max: 20) |

**Request Example:**

```http
GET /api/v1/knowledge-points/mastery/recommendations?limit=5
```

**Response:** `200 OK`

```json
[
  {
    "knowledge_point_id": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
    "name": "Loops in Python",
    "current_mastery": 65.0,
    "recommended_action": "review",
    "priority": 1,
    "estimated_time": 20
  },
  {
    "knowledge_point_id": "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e",
    "name": "Functions and Parameters",
    "current_mastery": 55.0,
    "recommended_action": "practice",
    "priority": 2,
    "estimated_time": 30
  },
  {
    "knowledge_point_id": "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f",
    "name": "Object-Oriented Programming",
    "current_mastery": 0.0,
    "recommended_action": "start",
    "priority": 3,
    "estimated_time": 45
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| knowledge_point_id | UUID | Knowledge point UUID |
| name | string | Knowledge point name |
| current_mastery | float | Current mastery score (0-100) |
| recommended_action | string | Recommended action: review, practice, start |
| priority | integer | Priority level (1=highest) |
| estimated_time | integer | Estimated time in minutes |

**Recommended Actions:**
- `review`: Review previously learned material (mastery declining)
- `practice`: Practice to improve mastery (low performance)
- `start`: Start new knowledge point (prerequisites met)

**Example (curl):**

```bash
curl -X GET "http://localhost:8000/api/v1/knowledge-points/mastery/recommendations?limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Error Responses:**

```json
// 403 - Not a student
{
  "detail": "This endpoint is only for students"
}
```

---

## Student Mastery System

The adaptive learning system uses a multi-dimensional mastery model with the following components:

### Mastery Scores

Student mastery is calculated using three dimensions with weighted importance:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Skill Score | 70% | Practical application and problem-solving ability |
| Knowledge Score | 20% | Theoretical understanding and concept retention |
| Attitude Score | 10% | Learning attitude, consistency, and engagement |

**Combined Mastery Formula:**
```
Combined Mastery = (Skill Score × 0.7) + (Knowledge Score × 0.2) + (Attitude Score × 0.1)
```

### Mastery Groups

Students are categorized into mastery groups based on their combined mastery score:

| Group | Score Range | Status | Description |
|-------|-------------|--------|-------------|
| A | 90-100 | Mastered | Excellent understanding, ready to move forward |
| B | 75-89 | Good | Strong understanding, minor review may help |
| C | 60-74 | Average | Acceptable understanding, practice recommended |
| D | < 60 | Needs Improvement | Requires more practice and review |
| N | 0 | Not Started | No learning attempts recorded |

### Confidence Level

The system tracks statistical confidence (0.0 to 1.0) based on:
- Number of assessment attempts
- Consistency of performance
- Time between assessments
- Quality of responses

Higher confidence means the mastery score is more reliable.

### Factors Affecting Mastery:

1. **Performance**: Correct vs. incorrect attempts
2. **Time Efficiency**: Time spent relative to estimated time
3. **Consistency**: Regular practice over time
4. **Progress Velocity**: Rate of improvement
5. **Recency**: Recent performance weighted higher

---

## Search Endpoints

### 1. Semantic Search

Perform search across all content types with multiple search modes.

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
    "metadata.difficulty_level": 1
  },
  "search_mode": "text"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | Search query text |
| content_types | array | No | Types to search: courses, modules, sections, knowledge_points (default: all) |
| k | integer | No | Number of results per content type (default: 10) |
| filters | object | No | Filter conditions on metadata |
| search_mode | string | No | Search mode: text, vector, hybrid (default: text) |

**Search Modes:**
- `text` (default): Fast BM25 text search, FREE (no embedding cost)
- `vector`: Semantic search using embeddings (costs ~$0.02/1M tokens)
- `hybrid`: Combines text + vector for best results (most expensive)

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
          "difficulty_level": 1,
          "section_number": 1
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
          "module_id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
          "course_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
          "difficulty_level": 1,
          "kp_type": "concept"
        }
      }
    ]
  },
  "total_results": 15,
  "search_time_ms": 245.5
}
```

**Example (curl) - Text Search (Free):**

```bash
curl -X POST http://localhost:8000/api/v1/search/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to declare variables in Python?",
    "content_types": ["sections", "knowledge_points"],
    "k": 10,
    "search_mode": "text"
  }'
```

**Example (curl) - Hybrid Search:**

```bash
curl -X POST http://localhost:8000/api/v1/search/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "loops and iteration",
    "content_types": ["knowledge_points"],
    "k": 5,
    "search_mode": "hybrid",
    "filters": {
      "metadata.difficulty_level": 1
    }
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
        "module_id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
        "difficulty_level": 1,
        "section_number": 2
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
| search_mode | string | No | Search mode: text, vector, hybrid (default: text) |

**Request Example:**

```http
GET /api/v1/search/courses/e5e108bd-fc41-484f-b423-2e12c23585be/search?query=loops&k=10&search_mode=text
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
          "course_id": "e5e108bd-fc41-484f-b423-2e12c23585be",
          "module_number": 2,
          "difficulty_level": 2
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
          "module_id": "f7e8d9c0-b1a2-4d5e-9f8a-7b6c5d4e3f2a",
          "section_number": 1,
          "difficulty_level": 2
        }
      }
    ]
  },
  "total_results": 8,
  "search_time_ms": 156.3
}
```

**Example (curl) - Text Search:**

```bash
curl -X GET "http://localhost:8000/api/v1/search/courses/e5e108bd-fc41-484f-b423-2e12c23585be/search?query=loops&k=10&search_mode=text" \
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
