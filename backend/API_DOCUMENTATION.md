# User Layer API Documentation

## Base URL
```
http://localhost:8000/api
```

## Table of Contents
- [API Key Requirement](#api-key-requirement)
- [Authentication](#authentication)
- [User Registration (Unified)](#user-registration-unified)
- [User Management](#user-management)

---

## API Key Requirement

**⚠️ IMPORTANT: All API endpoints require an API Key**

Every request to the API must include an `x-api-key` header with a valid API key.

### Required Header
```
x-api-key: your-api-key-here
```

### Error Response (Missing or Invalid API Key)
```json
{
  "statusCode": 401,
  "message": "API Key is required",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 401,
  "message": "Invalid API Key",
  "error": "Unauthorized"
}
```

### Configuration
Set the API key in your `.env` file:
```env
API_KEY=your-super-secret-api-key-change-this
```

---

## Authentication

### Cookie-Based Authentication

The API uses HTTP-only cookies for authentication, which is more secure than Bearer tokens.

**How it works:**
1. When you login or register, the server automatically sets an `access_token` cookie
2. The cookie is HTTP-only (cannot be accessed via JavaScript) and secure in production
3. Your browser automatically sends this cookie with every request
4. No need to manually include Authorization headers

**Required Headers:**
```
x-api-key: your-api-key-here
Cookie: access_token=<automatically_set_by_browser>
```

**Note:** All endpoints except `/auth/register` and `/auth/login` require authentication via the cookie.

---

## User Registration (Unified)

### Create User with Role-Specific Data

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Create a new user with role-specific information in a single request. Required fields change based on the `role`.

---

### 1. Register Student

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "role": "student",
  "avatarUrl": "https://example.com/avatar.jpg",

  "studentCode": "STU001",
  "gradeLevel": 7,
  "schoolName": "THCS ABC",
  "dateOfBirth": "2010-05-15",
  "gender": "male"
}
```

**Required Fields for Student:**
- `studentCode` - Mã học sinh
- `gradeLevel` - Khối lớp (6, 7, 8, 9...)
- `schoolName` - Tên trường
- `dateOfBirth` - Ngày sinh (ISO format: YYYY-MM-DD)
- `gender` - "male" | "female" | "other"

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-generated",
    "email": "student@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "student",
    "avatarUrl": "https://example.com/avatar.jpg",
    "info": {
      "id": "uuid-generated",
      "studentCode": "STU001",
      "gradeLevel": 7,
      "schoolName": "THCS ABC",
      "dateOfBirth": "2010-05-15",
      "gender": "male",
      "createdAt": "2025-12-08T...",
      "updatedAt": "2025-12-08T..."
    }
  }
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
```

---

### 2. Register Teacher

**Request Body:**
```json
{
  "email": "teacher@example.com",
  "password": "password123",
  "fullName": "Trần Thị B",
  "role": "teacher",
  "avatarUrl": "https://example.com/avatar.jpg",

  "specialization": ["math", "physics"],
  "experienceYears": 5,
  "certifications": ["Teaching License", "Math Certificate"],
  "phone": "+84123456789",
  "bio": "Experienced math teacher"
}
```

**Required Fields for Teacher:**
- `specialization` - Array of subjects
- `experienceYears` - Years of experience
- `certifications` - Array of certifications
- `phone` - Phone number

**Optional Fields:**
- `bio` - Teacher biography

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-generated",
    "email": "teacher@example.com",
    "fullName": "Trần Thị B",
    "role": "teacher",
    "avatarUrl": "https://example.com/avatar.jpg",
    "info": {
      "id": "uuid-generated",
      "specialization": ["math", "physics"],
      "experienceYears": 5,
      "certifications": ["Teaching License", "Math Certificate"],
      "phone": "+84123456789",
      "bio": "Experienced math teacher",
      "createdAt": "2025-12-08T...",
      "updatedAt": "2025-12-08T..."
    }
  }
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
```

---

### 3. Register Parent

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "password123",
  "fullName": "Lê Văn C",
  "role": "parent",
  "avatarUrl": "https://example.com/avatar.jpg",

  "parentPhone": "+84987654321",
  "address": "123 Đường ABC, Quận 1, TP HCM",
  "relationshipType": "father"
}
```

**Required Fields for Parent:**
- `parentPhone` - Parent's phone number
- `address` - Home address
- `relationshipType` - "father" | "mother" | "guardian"

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-generated",
    "email": "parent@example.com",
    "fullName": "Lê Văn C",
    "role": "parent",
    "avatarUrl": "https://example.com/avatar.jpg",
    "info": {
      "id": "uuid-generated",
      "phone": "+84987654321",
      "address": "123 Đường ABC, Quận 1, TP HCM",
      "relationshipType": "father",
      "createdAt": "2025-12-08T...",
      "updatedAt": "2025-12-08T..."
    }
  }
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
```

---

### 4. Register Admin

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "fullName": "Võ Hữu Nhân",
  "role": "admin",
  "avatarUrl": "https://example.com/avatar.jpg",

  "adminLevel": "super",
  "permissions": ["manage_users", "manage_courses", "view_reports"]
}
```

**Required Fields for Admin:**
- `adminLevel` - "super" | "system" | "support"
- `permissions` - Array of permission strings

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-generated",
    "email": "admin@example.com",
    "fullName": "Võ Hữu Nhân",
    "role": "admin",
    "avatarUrl": "https://example.com/avatar.jpg",
    "info": {
      "id": "uuid-generated",
      "adminLevel": "super",
      "permissions": ["manage_users", "manage_courses", "view_reports"],
      "createdAt": "2025-12-08T...",
      "updatedAt": "2025-12-08T..."
    }
  }
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
```

---

## Authentication Endpoints

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "admin",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `401 Unauthorized` - Account is inactive

---

### Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Clears the authentication cookie

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

### Get Current User Profile (Protected)

**Endpoint:** `GET /api/auth/me`

**Description:** Automatically uses the `access_token` cookie sent by your browser. No need to manually set headers.

**Response (200 OK) - Student:**
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "fullName": "Nguyễn Văn A",
  "role": "student",
  "avatarUrl": "https://example.com/avatar.jpg",
  "status": true,
  "createdAt": "2025-12-08T...",
  "updatedAt": "2025-12-08T...",
  "info": {
    "id": "uuid",
    "studentCode": "STU001",
    "gradeLevel": 7,
    "schoolName": "THCS ABC",
    "dateOfBirth": "2010-05-15",
    "gender": "male",
    "createdAt": "2025-12-08T...",
    "updatedAt": "2025-12-08T..."
  }
}
```

**Response (200 OK) - Admin:**
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "fullName": "Võ Hữu Nhân",
  "role": "admin",
  "avatarUrl": "https://example.com/avatar.jpg",
  "status": true,
  "createdAt": "2025-12-08T...",
  "updatedAt": "2025-12-08T...",
  "info": {
    "id": "uuid",
    "adminLevel": "super",
    "permissions": ["manage_users", "manage_courses", "view_reports"],
    "createdAt": "2025-12-08T...",
    "updatedAt": "2025-12-08T..."
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found

---

## User Management Endpoints

### Students Management

#### Get All Students
**GET** `/api/v1/students`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "student@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "student",
    "studentInfo": {
      "id": "uuid",
      "studentCode": "STU001",
      "gradeLevel": 7,
      "schoolName": "THCS ABC",
      "dateOfBirth": "2010-05-15",
      "gender": "male",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
]
```

#### Get Student by ID
**GET** `/api/v1/students/:id`

#### Update Student
**PATCH** `/api/v1/students/:id`

**Request Body (all fields optional):**
```json
{
  "fullName": "Nguyễn Văn A Updated",
  "studentCode": "STU002",
  "gradeLevel": 8,
  "schoolName": "THCS XYZ",
  "dateOfBirth": "2010-05-15",
  "gender": "male",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

#### Delete Student
**DELETE** `/api/v1/students/:id`

**Response (200):**
```json
{
  "message": "Student deleted successfully"
}
```

---

### Teachers Management

#### Get All Teachers
**GET** `/api/v1/teachers`

#### Get Teacher by ID
**GET** `/api/v1/teachers/:id`

#### Update Teacher
**PATCH** `/api/v1/teachers/:id`

**Request Body (all fields optional):**
```json
{
  "fullName": "Trần Thị B Updated",
  "specialization": ["math", "chemistry"],
  "experienceYears": 6,
  "certifications": ["New Certificate"],
  "phone": "+84999999999",
  "bio": "Updated bio"
}
```

#### Delete Teacher
**DELETE** `/api/v1/teachers/:id`

---

### Parents Management

#### Get All Parents
**GET** `/api/v1/parents`

#### Get Parent by ID
**GET** `/api/v1/parents/:id`

#### Update Parent
**PATCH** `/api/v1/parents/:id`

**Request Body (all fields optional):**
```json
{
  "fullName": "Lê Văn C Updated",
  "parentPhone": "+84888888888",
  "address": "456 New Address",
  "relationshipType": "guardian"
}
```

#### Delete Parent
**DELETE** `/api/v1/parents/:id`

---

### Admins Management

#### Get All Admins
**GET** `/api/v1/admins`

#### Get Admin by ID
**GET** `/api/v1/admins/:id`

#### Update Admin
**PATCH** `/api/v1/admins/:id`

**Request Body (all fields optional):**
```json
{
  "fullName": "Võ Hữu Nhân Updated",
  "adminLevel": "system",
  "permissions": ["view_users", "manage_content"]
}
```

#### Delete Admin
**DELETE** `/api/v1/admins/:id`

---

### General Users Management

#### Get User by ID
**GET** `/api/v1/users/:id`

#### Update User (General Info)
**PATCH** `/api/v1/users/:id`

**Request Body (all fields optional):**
```json
{
  "fullName": "Updated Name",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "status": true
}
```

#### Deactivate User (Soft Delete)
**DELETE** `/api/v1/users/:id`

**Response (200):**
```json
{
  "message": "User deactivated successfully"
}
```

---

## Common Fields (Required for All Roles)

```json
{
  "email": "string (email format)",
  "password": "string (minimum 6 characters)",
  "fullName": "string (not empty)",
  "role": "student | teacher | parent | admin",
  "avatarUrl": "string (optional)"
}
```

---

## Error Responses

### 400 Bad Request - Missing Required Fields
```json
{
  "statusCode": 400,
  "message": "Missing required student fields",
  "error": "Bad Request"
}
```

### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters",
    "studentCode should not be empty"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Student not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

---

## Testing with cURL

**Note:** All examples below require the `x-api-key` header.

### Register a Student
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "fullName": "Nguyễn Văn A",
    "role": "student",
    "studentCode": "STU001",
    "gradeLevel": 7,
    "schoolName": "THCS ABC",
    "dateOfBirth": "2010-05-15",
    "gender": "male"
  }'
```

### Register an Admin
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "fullName": "Võ Hữu Nhân",
    "role": "admin",
    "adminLevel": "super",
    "permissions": ["manage_users", "manage_courses"]
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```

**Note:** `-c cookies.txt` saves the cookie to a file for reuse in subsequent requests.

### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt
```

### Get Current User Profile
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt
```

**Note:** `-b cookies.txt` sends the saved cookie with the request.

### Get All Students
```bash
curl -X GET http://localhost:8000/api/students \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt
```

### Update Student
```bash
curl -X PATCH http://localhost:8000/api/students/STUDENT_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt \
  -d '{
    "gradeLevel": 8,
    "schoolName": "THCS XYZ"
  }'
```

### Delete Student
```bash
curl -X DELETE http://localhost:8000/api/students/STUDENT_ID \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt
```

---

## Validation Rules Summary

| Role | Required Fields |
|------|----------------|
| **student** | `studentCode`, `gradeLevel`, `schoolName`, `dateOfBirth`, `gender` |
| **teacher** | `specialization`, `experienceYears`, `certifications`, `phone` |
| **parent** | `parentPhone`, `address`, `relationshipType` |
| **admin** | `adminLevel`, `permissions` |

---

## Important Notes

- **Field Naming:** All fields use `camelCase` (e.g., `adminLevel`, not `admin_level`)
- **Authentication:** JWT token is returned after successful registration/login
- **Password Security:** Passwords are hashed using bcrypt with 10 salt rounds
- **Soft Delete:** DELETE endpoints for users set `status: false` instead of hard delete
- **Auto-generated Fields:** `id`, `createdAt`, `updatedAt` are automatically generated
- **Role-specific Info:** The `info` field in responses contains role-specific data based on user role
- **No Password in Response:** `passwordHash` is never returned in API responses

---

## Environment Variables

Make sure to set these in your `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/adaptive_learning
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## TypeScript Types

### RoleSpecificInfo Types

```typescript
interface StudentInfo {
  id: string;
  studentCode: string;
  gradeLevel: number;
  schoolName: string;
  dateOfBirth: string;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TeacherInfo {
  id: string;
  specialization: string[];
  experienceYears: number;
  certifications: string[];
  phone: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ParentInfo {
  id: string;
  phone: string;
  address: string;
  relationshipType: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminInfo {
  id: string;
  adminLevel: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

type RoleSpecificInfo = StudentInfo | TeacherInfo | ParentInfo | AdminInfo;
```

---

## Management Layer API

The Management Layer handles organizational structure: classes, student enrollments, and teacher assignments.

---

### Classes Management

#### Create Class
**POST** `/api/classes`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "className": "7A",
  "gradeLevel": 7,
  "schoolYear": "2024-2025",
  "homeroomTeacherId": "teacher-uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "className": "7A",
  "gradeLevel": 7,
  "schoolYear": "2024-2025",
  "homeroomTeacherId": "teacher-uuid",
  "createdAt": "2025-12-08T...",
  "updatedAt": "2025-12-08T..."
}
```

---

#### Get All Classes
**GET** `/api/v1/classes`

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "className": "7A",
    "gradeLevel": 7,
    "schoolYear": "2024-2025",
    "homeroomTeacherId": "teacher-uuid",
    "createdAt": "2025-12-08T...",
    "updatedAt": "2025-12-08T...",
    "homeroomTeacher": {
      "id": "teacher-uuid",
      "fullName": "Nguyễn Văn A",
      "email": "teacher@example.com"
    }
  }
]
```

---

#### Get Class by ID
**GET** `/api/v1/classes/:id`

**Response (200 OK):** Same as create response with homeroom teacher info

---

#### Update Class
**PATCH** `/api/v1/classes/:id`

**Request Body (all fields optional):**
```json
{
  "className": "7B",
  "gradeLevel": 7,
  "schoolYear": "2024-2025",
  "homeroomTeacherId": "new-teacher-uuid"
}
```

---

#### Delete Class
**DELETE** `/api/v1/classes/:id`

**Response (200 OK):**
```json
{
  "message": "Class deleted successfully"
}
```

---

### Class Enrollment (Students)

#### Enroll Student to Class
**POST** `/api/v1/classes/:id/students`

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "status": "active"
}
```

**Status Options:** `active`, `transferred`, `graduated`

**Response (201 Created):**
```json
{
  "id": "enrollment-uuid",
  "classId": "class-uuid",
  "studentId": "student-uuid",
  "status": "active",
  "enrolledAt": "2025-12-08T..."
}
```

---

#### Get All Students in Class
**GET** `/api/v1/classes/:id/students`

**Response (200 OK):**
```json
[
  {
    "enrollmentId": "enrollment-uuid",
    "status": "active",
    "enrolledAt": "2025-12-08T...",
    "student": {
      "id": "student-uuid",
      "email": "student@example.com",
      "fullName": "Nguyễn Văn B",
      "avatarUrl": "https://...",
      "studentInfo": {
        "id": "student-uuid",
        "studentCode": "STU001",
        "gradeLevel": 7,
        "schoolName": "THCS ABC",
        "dateOfBirth": "2010-05-15",
        "gender": "male",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
  }
]
```

---

#### Remove Student from Class
**DELETE** `/api/v1/classes/:id/students/:studentId`

**Response (200 OK):**
```json
{
  "message": "Student removed from class successfully"
}
```

---

### Teacher-Class Assignment

#### Assign Teacher to Class
**POST** `/api/v1/classes/:id/teachers`

**Request Body:**
```json
{
  "teacherId": "teacher-uuid",
  "role": "subject_teacher",
  "status": "active"
}
```

**Role Options:** `homeroom`, `subject_teacher`, `assistant`
**Status Options:** `active`, `archived`

**Response (201 Created):**
```json
{
  "id": "assignment-uuid",
  "classId": "class-uuid",
  "teacherId": "teacher-uuid",
  "role": "subject_teacher",
  "status": "active",
  "assignedAt": "2025-12-08T..."
}
```

---

#### Get All Teachers in Class
**GET** `/api/v1/classes/:id/teachers`

**Response (200 OK):**
```json
[
  {
    "assignmentId": "assignment-uuid",
    "role": "subject_teacher",
    "status": "active",
    "assignedAt": "2025-12-08T...",
    "teacher": {
      "id": "teacher-uuid",
      "email": "teacher@example.com",
      "fullName": "Trần Thị C",
      "avatarUrl": "https://...",
      "teacherInfo": {
        "id": "teacher-uuid",
        "specialization": ["math", "physics"],
        "experienceYears": 5,
        "certifications": ["Teaching License"],
        "phone": "+84123456789",
        "bio": "Experienced teacher",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
  }
]
```

---

#### Remove Teacher from Class
**DELETE** `/api/v1/classes/:id/teachers/:teacherId`

**Response (200 OK):**
```json
{
  "message": "Teacher removed from class successfully"
}
```

---

### Teacher-Course Assignment

#### Assign Course to Teacher
**POST** `/api/v1/teachers/:id/courses`

**Request Body:**
```json
{
  "courseId": "course-uuid",
  "role": "collaborator"
}
```

**Role Options:** `creator`, `collaborator`

**Response (201 Created):**
```json
{
  "id": "assignment-uuid",
  "teacherId": "teacher-uuid",
  "courseId": "course-uuid",
  "role": "collaborator",
  "assignedAt": "2025-12-08T..."
}
```

---

#### Get All Courses for Teacher
**GET** `/api/v1/teachers/:id/courses`

**Response (200 OK):**
```json
[
  {
    "assignmentId": "assignment-uuid",
    "role": "collaborator",
    "assignedAt": "2025-12-08T...",
    "course": {
      "id": "course-uuid",
      "title": "Toán 7",
      "description": "Toán học lớp 7",
      "thumbnailUrl": "https://...",
      "subject": "math",
      "gradeLevel": 7,
      "active": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
]
```

---

#### Remove Course from Teacher
**DELETE** `/api/v1/teachers/:id/courses/:courseId`

**Response (200 OK):**
```json
{
  "message": "Course removed from teacher successfully"
}
```

---

## Management Layer - Testing Examples

### Create a Class
```bash
curl -X POST http://localhost:3000/api/v1/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "className": "7A",
    "gradeLevel": 7,
    "schoolYear": "2024-2025",
    "homeroomTeacherId": "teacher-uuid"
  }'
```

### Enroll Student to Class
```bash
curl -X POST http://localhost:3000/api/v1/classes/CLASS_ID/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "studentId": "student-uuid",
    "status": "active"
  }'
```

### Assign Teacher to Class
```bash
curl -X POST http://localhost:3000/api/v1/classes/CLASS_ID/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "teacherId": "teacher-uuid",
    "role": "subject_teacher",
    "status": "active"
  }'
```

### Assign Course to Teacher
```bash
curl -X POST http://localhost:3000/api/v1/teachers/TEACHER_ID/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": "course-uuid",
    "role": "collaborator"
  }'
```

### Get All Students in a Class
```bash
curl -X GET http://localhost:3000/api/v1/classes/CLASS_ID/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Teachers in a Class
```bash
curl -X GET http://localhost:3000/api/v1/classes/CLASS_ID/teachers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Courses for a Teacher
```bash
curl -X GET http://localhost:3000/api/v1/teachers/TEACHER_ID/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Management Layer - Enums Reference

### EnrollmentStatus
- `active` - Student is currently enrolled
- `transferred` - Student transferred to another class
- `graduated` - Student has graduated

### TeacherClassRole
- `homeroom` - Homeroom teacher (chủ nhiệm)
- `subject_teacher` - Subject teacher (giáo viên bộ môn)
- `assistant` - Assistant teacher

### AssignmentStatus
- `active` - Assignment is currently active
- `archived` - Assignment has been archived

### TeacherCourseRole
- `creator` - Main teacher/creator of the course
- `collaborator` - Collaborating teacher

---
