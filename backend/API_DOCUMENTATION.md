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
- [Courses API](#courses-api)
- [Knowledge Points API](#knowledge-points-api)
- [Question Bank API](#question-bank-api)
- [Assignments API](#assignments-api)
- [Student Progress API](#student-progress-api)
- [Learning Paths API](#learning-paths-api)
- [Dashboard API](#dashboard-api)
- [Course Analytics API](#course-analytics-api)
- [Explorer API](#explorer-api)
- [Upload API](#upload-api)
- [Users API](#users-api)
- [Class Progress API](#class-progress-api)
- [Available Students API](#available-students-api)
- [API Summary](#api-summary)

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

**Session lifetime policy:**
- Login with `rememberMe = true` → cookie expires in **7 days**
- Login with `rememberMe = false` (or omitted) → cookie expires in **1 day**

**Credential behavior:**
- Email is normalized to lowercase (case-insensitive login)
- Password is case-sensitive

**Required Headers:**
```
x-api-key: your-api-key-here
Cookie: access_token=<automatically_set_by_browser>
```

**Note:** All endpoints except `/auth/register` and `/auth/login` require authentication via the cookie.

---

## User Registration (Unified)

### Create User with Role-Specific Data

**Endpoint:** `POST /api/auth/register`

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
  "password": "password123",
  "rememberMe": true
}
```

**Request Body Fields:**
- `email` (required)
- `password` (required)
- `rememberMe` (optional, boolean)

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
Set-Cookie: access_token=...; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=86400 (rememberMe=false)
Set-Cookie: access_token=...; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=604800 (rememberMe=true)
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `401 Unauthorized` - Account is inactive

---

### Google Login

**Endpoint:** `POST /api/auth/google`

**Request Body:**
```json
{
  "idToken": "firebase-google-id-token",
  "rememberMe": true
}
```

**Request Body Fields:**
- `idToken` (required)
- `rememberMe` (optional, boolean)

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "student",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "accessToken": "jwt-token"
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=...; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=86400 (rememberMe=false)
Set-Cookie: access_token=...; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=604800 (rememberMe=true)
```

**Error Responses:**
- `400 Bad Request` - Email not found in Google account
- `401 Unauthorized` - Invalid Google token or account inactive

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
**GET** `/api/students`

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
**GET** `/api/students/:id`

#### Update Student
**PATCH** `/api/students/:id`

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
**DELETE** `/api/students/:id`

**Response (200):**
```json
{
  "message": "Student deleted successfully"
}
```

---

### Teachers Management

#### Get All Teachers
**GET** `/api/teachers`

#### Get Teacher by ID
**GET** `/api/teachers/:id`

#### Update Teacher
**PATCH** `/api/teachers/:id`

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
**DELETE** `/api/teachers/:id`

---

### Parents Management

#### Get All Parents
**GET** `/api/parents`

#### Get Parent by ID
**GET** `/api/parents/:id`

#### Update Parent
**PATCH** `/api/parents/:id`

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
**DELETE** `/api/parents/:id`

---

#### Get Parent Students
**GET** `/api/parents/:id/students`

Returns all students linked to a parent.

**Response (200 OK):**
```json
[
  {
    "id": "student-uuid",
    "email": "student@example.com",
    "fullName": "Nguyễn Văn A",
    "studentInfo": {
      "studentCode": "STU001",
      "gradeLevel": 7,
      "schoolName": "THCS ABC"
    }
  }
]
```

---

#### Add Student to Parent
**POST** `/api/parents/:id/students/:studentId`

Links a student to a parent.

**Response (201 Created):**
```json
{
  "id": "mapping-uuid",
  "parentId": "parent-uuid",
  "studentId": "student-uuid",
  "createdAt": "2025-12-08T..."
}
```

---

#### Remove Student from Parent
**DELETE** `/api/parents/:id/students/:studentId`

Unlinks a student from a parent.

**Response (200 OK):**
```json
{
  "message": "Student removed from parent successfully"
}
```

---

### Admins Management

#### Get All Admins
**GET** `/api/admins`

#### Get Admin by ID
**GET** `/api/admins/:id`

#### Update Admin
**PATCH** `/api/admins/:id`

**Request Body (all fields optional):**
```json
{
  "fullName": "Võ Hữu Nhân Updated",
  "adminLevel": "system",
  "permissions": ["view_users", "manage_content"]
}
```

#### Delete Admin
**DELETE** `/api/admins/:id`

---

### General Users Management

#### Get User by ID
**GET** `/api/users/:id`

#### Update User (General Info)
**PATCH** `/api/users/:id`

**Request Body (all fields optional):**
```json
{
  "fullName": "Updated Name",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "status": true
}
```

#### Deactivate User (Soft Delete)
**DELETE** `/api/users/:id`

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
PORT=8000
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
**GET** `/api/classes`

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
**GET** `/api/classes/:id`

**Response (200 OK):** Same as create response with homeroom teacher info

---

#### Update Class
**PATCH** `/api/classes/:id`

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
**DELETE** `/api/classes/:id`

**Response (200 OK):**
```json
{
  "message": "Class deleted successfully"
}
```

---

### Class Enrollment (Students)

#### Enroll Student to Class
**POST** `/api/classes/:id/students`

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
**GET** `/api/classes/:id/students`

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

#### Get Available Students (Not Enrolled)
**GET** `/api/classes/:id/available-students`

Returns students who are NOT currently enrolled in the specified class.

**Response (200 OK):**
```json
[
  {
    "id": "student-uuid",
    "email": "student@example.com",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": "https://...",
    "studentInfo": {
      "id": "student-uuid",
      "studentCode": "STU001",
      "gradeLevel": 7,
      "schoolName": "THCS ABC",
      "dateOfBirth": "2010-05-15",
      "gender": "male"
    }
  }
]
```

---

#### Remove Student from Class
**DELETE** `/api/classes/:id/students/:studentId`

**Response (200 OK):**
```json
{
  "message": "Student removed from class successfully"
}
```

---

### Teacher-Class Assignment

#### Assign Teacher to Class
**POST** `/api/classes/:id/teachers`

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
**GET** `/api/classes/:id/teachers`

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
**DELETE** `/api/classes/:id/teachers/:teacherId`

**Response (200 OK):**
```json
{
  "message": "Teacher removed from class successfully"
}
```

---

### Class Courses Assignment

#### Assign Course to Class
**POST** `/api/classes/:id/courses`

**Request Body:**
```json
{
  "courseId": "course-uuid",
  "assignedBy": "teacher-uuid",
  "status": "active"
}
```

#### Get Class Courses
**GET** `/api/classes/:id/courses`

**Query Parameters:**
- `status` (optional) - Filter by status

#### Update Class Course Status
**PATCH** `/api/classes/:id/courses/:courseId/status`

**Request Body:**
```json
{
  "status": "active" | "inactive"
}
```

#### Remove Course from Class
**DELETE** `/api/classes/:id/courses/:courseId`

---

### Teacher-Course Assignment

#### Assign Course to Teacher
**POST** `/api/teachers/:id/courses`

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
**GET** `/api/teachers/:id/courses`

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
**DELETE** `/api/teachers/:id/courses/:courseId`

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
curl -X POST http://localhost:3000/api/classes \
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
curl -X POST http://localhost:3000/api/classes/CLASS_ID/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "studentId": "student-uuid",
    "status": "active"
  }'
```

### Assign Teacher to Class
```bash
curl -X POST http://localhost:3000/api/classes/CLASS_ID/teachers \
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
curl -X POST http://localhost:3000/api/teachers/TEACHER_ID/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": "course-uuid",
    "role": "collaborator"
  }'
```

### Get All Students in a Class
```bash
curl -X GET http://localhost:3000/api/classes/CLASS_ID/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Teachers in a Class
```bash
curl -X GET http://localhost:3000/api/classes/CLASS_ID/teachers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Courses for a Teacher
```bash
curl -X GET http://localhost:3000/api/teachers/TEACHER_ID/courses \
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

## File Upload (Cloudflare R2)

### Upload Avatar

**Endpoint:** `POST /api/upload/avatar`

**Description:** Upload an avatar image to Cloudflare R2 storage. The uploaded file will be stored securely and a public URL will be returned.

**Headers:**
```
x-api-key: your-api-key-here
Cookie: access_token=<automatically_set_by_browser>
Content-Type: multipart/form-data
```

**Request:**
- Method: `POST`
- Body: Form data with file field named `file`

**Supported File Types:**
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

**File Size Limit:** 5MB maximum

**Response (200 OK):**
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://your-bucket.r2.dev/avatars/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
}
```

**Error Responses:**

**400 Bad Request - No file provided:**
```json
{
  "statusCode": 400,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

**400 Bad Request - Invalid file type:**
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
  "error": "Bad Request"
}
```

**400 Bad Request - File too large:**
```json
{
  "statusCode": 400,
  "message": "File size exceeds 5MB limit",
  "error": "Bad Request"
}
```

**400 Bad Request - Upload failed:**
```json
{
  "statusCode": 400,
  "message": "Failed to upload file: <error details>",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

### Upload General File

**Endpoint:** `POST /api/upload/file`

**Description:** Upload any file to Cloudflare R2 storage. Same validation rules apply as avatar upload.

**Headers:**
```
x-api-key: your-api-key-here
Cookie: access_token=<automatically_set_by_browser>
Content-Type: multipart/form-data
```

**Request:**
- Method: `POST`
- Body: Form data with file field named `file`

**Response (200 OK):**
```json
{
  "message": "File uploaded successfully",
  "url": "https://your-bucket.r2.dev/<folder>/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
}
```

---

### Testing Upload Endpoints

#### Upload Avatar with cURL
```bash
curl -X POST http://localhost:8000/api/upload/avatar \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt \
  -F "file=@/path/to/your/avatar.jpg"
```

#### Upload Avatar with JavaScript (Frontend)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/api/upload/avatar', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key-here',
  },
  credentials: 'include', // Important: sends cookies
  body: formData,
});

const data = await response.json();
console.log('Avatar URL:', data.url);
```

#### Update User Avatar after Upload
```bash
# 1. First upload the avatar
curl -X POST http://localhost:8000/api/upload/avatar \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt \
  -F "file=@avatar.jpg"

# Response: { "url": "https://your-bucket.r2.dev/avatars/..." }

# 2. Then update user with the new avatar URL
curl -X PATCH http://localhost:8000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -b cookies.txt \
  -d '{
    "avatarUrl": "https://your-bucket.r2.dev/avatars/..."
  }'
```

---

### Cloudflare R2 Configuration

To enable file uploads, configure the following environment variables in your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**How to get Cloudflare R2 credentials:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket (or use existing)
4. Generate API tokens with read/write permissions
5. Set up a public domain for your bucket (optional but recommended)

**Required permissions for R2 API token:**
- Object Read
- Object Write

---


## Courses API

### Courses

#### Create Course
**POST** `/api/courses`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "title": "Toán 7",
  "description": "Khóa học Toán lớp 7",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "subject": "math",
  "gradeLevel": 7,
  "active": true,
  "visibility": "public"
}
```

#### Get All Courses
**GET** `/api/courses`

**Query Parameters:**
- `gradeLevel` (optional) - Filter by grade level
- `subject` (optional) - Filter by subject
- `active` (optional) - Filter by active status (true/false)

#### Get Course by ID
**GET** `/api/courses/:id`

#### Get Course Structure
**GET** `/api/courses/:id/structure`

Returns full course structure with modules, sections, and knowledge points.

#### Get Course for Learning
**GET** `/api/courses/:id/learn`

Returns course content optimized for student learning.

#### Update Course
**PATCH** `/api/courses/:id`

**Roles:** `admin`, `teacher`

#### Delete Course
**DELETE** `/api/courses/:id`

**Roles:** `admin`, `teacher`

#### Assign Teacher to Course
**POST** `/api/courses/:courseId/teachers/:teacherId`

**Roles:** `admin`

**Request Body:**
```json
{
  "role": "creator" | "collaborator"
}
```

#### Get Course Teachers
**GET** `/api/courses/:courseId/teachers`

**Roles:** `admin`, `teacher`

---

### Modules

#### Create Module
**POST** `/api/courses/modules`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "courseId": "course-uuid",
  "title": "Đại số",
  "description": "Module đại số",
  "orderIndex": 1
}
```

#### Get Modules by Course
**GET** `/api/courses/:courseId/modules`

#### Get Module by ID
**GET** `/api/courses/modules/:moduleId`

#### Update Module
**PATCH** `/api/courses/modules/:moduleId`

**Roles:** `admin`, `teacher`

#### Delete Module
**DELETE** `/api/courses/modules/:moduleId`

**Roles:** `admin`, `teacher`

---

### Sections

#### Create Section
**POST** `/api/courses/sections`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "moduleId": "module-uuid",
  "title": "Phương trình bậc nhất",
  "orderIndex": 1,
  "knowledgePoints": [
    {
      "title": "Khái niệm phương trình",
      "description": "...",
      "content": {},
      "difficultyLevel": 1
    }
  ]
}
```

#### Get Sections by Module
**GET** `/api/courses/modules/:moduleId/sections`

#### Get Section by ID
**GET** `/api/courses/sections/:sectionId`

#### Get Section Knowledge Points
**GET** `/api/courses/sections/:sectionId/knowledge-points`

#### Update Section
**PATCH** `/api/courses/sections/:sectionId`

**Roles:** `admin`, `teacher`

#### Delete Section
**DELETE** `/api/courses/sections/:sectionId`

**Roles:** `admin`, `teacher`

---

## Knowledge Points API

#### Create Knowledge Point
**POST** `/api/knowledge-points`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "title": "Nhân đa thức với đơn thức",
  "description": "Quy tắc nhân đa thức...",
  "content": {
    "theory": "...",
    "visualization": {},
    "questions": []
  },
  "difficultyLevel": 2,
  "prerequisites": ["kp-uuid-1", "kp-uuid-2"]
}
```

#### Get All Knowledge Points
**GET** `/api/knowledge-points`

#### Get Knowledge Point by ID
**GET** `/api/knowledge-points/:id`

#### Get Knowledge Point with Details
**GET** `/api/knowledge-points/:id/details`

#### Update Knowledge Point
**PATCH** `/api/knowledge-points/:id`

**Roles:** `admin`, `teacher`

#### Delete Knowledge Point
**DELETE** `/api/knowledge-points/:id`

**Roles:** `admin`, `teacher`

### Section Assignments

#### Assign KP to Section
**POST** `/api/knowledge-points/assign-to-section`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "sectionId": "section-uuid",
  "kpId": "kp-uuid",
  "orderIndex": 1
}
```

#### Remove KP from Section
**DELETE** `/api/knowledge-points/sections/:sectionId/kps/:kpId`

**Roles:** `admin`, `teacher`

#### Get KPs by Section
**GET** `/api/knowledge-points/sections/:sectionId/kps`

### Prerequisites

#### Get Prerequisites
**GET** `/api/knowledge-points/:id/prerequisites`

#### Get Dependents
**GET** `/api/knowledge-points/:id/dependents`

### Resources

#### Get Resources
**GET** `/api/knowledge-points/:id/resources`

### AI Content Generation

#### Generate Content
**POST** `/api/knowledge-points/generate-content`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "topic": "Phương trình bậc nhất",
  "description": "...",
  "contentType": "visualization",
  "aiModel": "openai" | "gemini"
}
```

---

## Question Bank API

#### Create Question
**POST** `/api/question-bank`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "questionText": "1 + 1 = ?",
  "options": ["1", "2", "3", "4"],
  "correctAnswer": "2",
  "questionType": "multiple_choice",
  "isActive": true,
  "metadata": {
    "difficulty": 5,
    "discrimination": 0.5,
    "skillId": "kp-uuid",
    "tags": ["math", "basic"],
    "estimatedTime": 30
  }
}
```

**Question Types:** `multiple_choice`, `true_false`, `fill_in_blank`, `short_answer`

#### Get All Questions
**GET** `/api/question-bank`

**Query Parameters:**
- `questionType` (optional)
- `isActive` (optional) - true/false

#### Get Question by ID
**GET** `/api/question-bank/:id`

#### Get Question with Metadata
**GET** `/api/question-bank/:id/with-metadata`

#### Update Question
**PATCH** `/api/question-bank/:id`

**Roles:** `admin`, `teacher`

#### Delete Question
**DELETE** `/api/question-bank/:id`

**Roles:** `admin`

### KP Assignments

#### Assign Question to KP
**POST** `/api/question-bank/assign-to-kp`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "kpId": "kp-uuid",
  "questionId": "question-uuid",
  "difficulty": 3
}
```

#### Remove Question from KP
**DELETE** `/api/question-bank/kps/:kpId/questions/:questionId`

**Roles:** `admin`, `teacher`

#### Get Questions by KP
**GET** `/api/question-bank/kps/:kpId/questions`

### Metadata

#### Get Question Metadata
**GET** `/api/question-bank/:id/metadata`

**Roles:** `admin`, `teacher`

### AI Question Generation

#### Generate Question
**POST** `/api/question-bank/generate`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "knowledgePointTitle": "Phương trình bậc nhất",
  "knowledgePointDescription": "...",
  "aiModel": "openai" | "gemini",
  "questionType": "multiple_choice",
  "difficulty": 5,
  "skillId": "kp-uuid"
}
```

---

## Assignments API

#### Create Assignment
**POST** `/api/assignments`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "teacherId": "teacher-uuid",
  "title": "Bài tập tuần 1",
  "description": "...",
  "assignmentType": "practice",
  "dueDate": "2025-12-31T23:59:59Z",
  "isPublished": true
}
```

**Assignment Types:** `practice`, `quiz`, `exam`, `homework`, `test`, `adaptive`

#### Get All Assignments
**GET** `/api/assignments`

**Query Parameters:**
- `teacherId` (optional)
- `isPublished` (optional) - true/false

#### Get Assignment by ID
**GET** `/api/assignments/:id`

#### Get Assignment with Details
**GET** `/api/assignments/:id/details`

#### Update Assignment
**PATCH** `/api/assignments/:id`

**Roles:** `admin`, `teacher`

#### Delete Assignment
**DELETE** `/api/assignments/:id`

**Roles:** `admin`, `teacher`

### Student Assignments

#### Assign to Students
**POST** `/api/assignments/assign-to-students`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "assignmentId": "assignment-uuid",
  "studentIds": ["student-uuid-1", "student-uuid-2"],
  "startTime": "2025-12-01T00:00:00Z"
}
```

#### Get Student Assignment
**GET** `/api/assignments/students/:studentId/assignments/:assignmentId`

#### Start Assignment
**POST** `/api/assignments/student-assignments/:studentAssignmentId/start`

**Roles:** `student`

#### Submit Assignment
**POST** `/api/assignments/submit`

**Roles:** `student`

**Request Body:**
```json
{
  "studentAssignmentId": "uuid",
  "answers": [
    {
      "questionId": "question-uuid",
      "answer": "selected answer"
    }
  ],
  "timeSpent": 300
}
```

#### Get Student Assignments
**GET** `/api/assignments/students/:studentId`

**Roles:** `student`, `teacher`, `admin`, `parent`

#### Get Assignment Results
**GET** `/api/assignments/:assignmentId/results`

**Roles:** `teacher`, `admin`

### Section Assignments

#### Assign to Section
**POST** `/api/assignments/assign-to-section`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "sectionId": "section-uuid",
  "assignmentId": "assignment-uuid",
  "autoAssign": true
}
```

#### Get Section Assignments
**GET** `/api/assignments/sections/:sectionId/assignments`

#### Remove Section Assignment
**DELETE** `/api/assignments/sections/:sectionId/assignments/:assignmentId`

**Roles:** `admin`, `teacher`

### Assignment Targets

#### Create Target
**POST** `/api/assignments/targets`

**Roles:** `admin`, `teacher`

**Request Body:**
```json
{
  "assignmentId": "assignment-uuid",
  "targetType": "student" | "class" | "group" | "section",
  "targetId": "uuid"
}
```

#### Get Assignment Targets
**GET** `/api/assignments/:assignmentId/targets`

**Roles:** `admin`, `teacher`

#### Remove Target
**DELETE** `/api/assignments/targets/:targetId`

**Roles:** `admin`, `teacher`

### Assignment Attempts

#### Create Attempt
**POST** `/api/assignments/attempts`

**Roles:** `student`

**Request Body:**
```json
{
  "studentAssignmentId": "uuid",
  "attemptStatus": "in_progress"
}
```

#### Update Attempt
**PATCH** `/api/assignments/attempts/:attemptId`

**Roles:** `student`

#### Get Attempts
**GET** `/api/assignments/student-assignments/:studentAssignmentId/attempts`

**Roles:** `student`, `teacher`, `admin`

---

## Student Progress API

#### Update KP Progress
**POST** `/api/student-progress/kp-progress`

**Roles:** `admin`, `teacher`, `student`

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "kpId": "kp-uuid",
  "masteryScore": 85,
  "confidence": 90,
  "lastAttemptId": "attempt-uuid"
}
```

#### Get Student KP Progress
**GET** `/api/student-progress/students/:studentId/kps/:kpId`

#### Get All Student Progress
**GET** `/api/student-progress/students/:studentId/all-progress`

#### Get KP History
**GET** `/api/student-progress/students/:studentId/kps/:kpId/history`

#### Get Student Mastery
**GET** `/api/student-progress/students/:studentId/mastery/:courseId`

#### Get All Student Mastery
**GET** `/api/student-progress/students/:studentId/mastery`

#### Get Student Insights
**GET** `/api/student-progress/students/:studentId/insights`

**Roles:** `admin`, `teacher`, `student`, `parent`

### Question Attempts

#### Submit Question Attempt
**POST** `/api/student-progress/submit-question`

**Roles:** `admin`, `teacher`, `student`

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "questionId": "question-uuid",
  "assignmentId": "assignment-uuid",
  "selectedAnswer": "answer",
  "isCorrect": true,
  "timeSpent": 45,
  "kpId": "kp-uuid"
}
```

#### Get Student Question Attempts
**GET** `/api/student-progress/students/:studentId/kps/:kpId/attempts`

**Roles:** `admin`, `teacher`, `student`

---

## Learning Paths API

#### Create Learning Path
**POST** `/api/learning-paths`

**Roles:** `admin`, `teacher`, `student`

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "createdBy": "teacher",
  "title": "Lộ trình ôn thi",
  "description": "...",
  "status": "active"
}
```

#### Get All Learning Paths
**GET** `/api/learning-paths`

**Query Parameters:**
- `studentId` (optional)
- `status` (optional)

#### Get Learning Path by ID
**GET** `/api/learning-paths/:id`

#### Get Learning Path with Items
**GET** `/api/learning-paths/:id/with-items`

#### Update Learning Path
**PATCH** `/api/learning-paths/:id`

**Roles:** `admin`, `teacher`, `student`

#### Delete Learning Path
**DELETE** `/api/learning-paths/:id`

**Roles:** `admin`, `teacher`

### Learning Path Items

#### Update Item Status
**PATCH** `/api/learning-paths/:pathId/items/:itemId/status`

**Roles:** `student`, `teacher`, `admin`

**Request Body:**
```json
{
  "status": "not_started" | "in_progress" | "completed"
}
```

#### Get Path Items
**GET** `/api/learning-paths/:pathId/items`

---

## Dashboard API

#### Get Teacher Stats
**GET** `/api/dashboard/teacher-stats`

**Roles:** `teacher`

#### Get Admin Stats
**GET** `/api/dashboard/stats`

**Roles:** `admin`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `gradeLevel` (optional)

#### Get Top Courses
**GET** `/api/dashboard/top-courses`

**Roles:** `admin`

**Query Parameters:**
- `limit` (optional) - default: 5

#### Get Difficult KPs
**GET** `/api/dashboard/difficult-kps`

**Roles:** `admin`

**Query Parameters:**
- `limit` (optional) - default: 5

#### Get Game Completions
**GET** `/api/dashboard/game-completions`

**Roles:** `admin`

**Query Parameters:**
- `limit` (optional) - default: 5

#### Get Class Distribution
**GET** `/api/dashboard/class-distribution`

**Roles:** `admin`

#### Get Learning Health
**GET** `/api/dashboard/learning-health`

**Roles:** `admin`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

#### Get Teacher Highlights
**GET** `/api/dashboard/teacher-highlights`

**Roles:** `admin`

**Query Parameters:**
- `limit` (optional) - default: 3

#### Get Low Progress Classes
**GET** `/api/dashboard/low-progress-classes`

**Roles:** `admin`

**Query Parameters:**
- `limit` (optional) - default: 3

---

## Course Analytics API

#### Get Course Analytics
**GET** `/api/course-analytics/courses/:courseId`

**Roles:** `admin`, `teacher`

#### Get Module Analytics
**GET** `/api/course-analytics/courses/:courseId/modules/:moduleId`

**Roles:** `admin`, `teacher`

---

## Explorer API

#### Get Public Courses
**GET** `/api/explorer/courses`

**Roles:** `admin`, `teacher`

**Query Parameters:**
- `gradeLevel` (optional)
- `subject` (optional)

#### Get Public Course Details
**GET** `/api/explorer/courses/:id`

**Roles:** `admin`, `teacher`

#### Clone Course
**POST** `/api/explorer/courses/:id/clone`

**Roles:** `admin`, `teacher`

Clones a public course to the teacher's account.

---

## Upload API

#### Upload Avatar
**POST** `/api/upload/avatar`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` - Image file

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://..."
}
```

#### Upload File
**POST** `/api/upload/file`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` - Any file type

**Response:**
```json
{
  "message": "File uploaded successfully",
  "url": "https://..."
}
```

---

## Users API

#### Get All Users
**GET** `/api/users`

#### Get User by ID
**GET** `/api/users/:id`

#### Get User Status
**GET** `/api/users/:id/status`

#### Get User Role
**GET** `/api/users/:id/role`

#### Get User Permissions
**GET** `/api/users/:id/permissions`

#### Update User
**PATCH** `/api/users/:id`

**Request Body:**
```json
{
  "fullName": "New Name",
  "avatarUrl": "https://...",
  "status": true
}
```

#### Update User Status
**PATCH** `/api/users/:id/status`

**Request Body:**
```json
{
  "status": false
}
```

#### Delete User
**DELETE** `/api/users/:id`

#### Reset Password
**POST** `/api/users/:id/reset-password`

**Roles:** `admin`

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

---

## Class Progress API

#### Get Class Progress
**GET** `/api/classes/:id/progress`

Returns aggregated progress for all students in a class.

**Response:**
```json
{
  "students": [
    {
      "id": "student-uuid",
      "name": "Nguyễn Văn A",
      "progress": 75,
      "masteredKps": 15,
      "totalKps": 20,
      "status": "good"
    }
  ],
  "summary": {
    "totalStudents": 30,
    "avgMastery": 68,
    "atRiskCount": 5,
    "excellentCount": 8,
    "totalKpsMastered": 450
  }
}
```

---

## Available Students API

#### Get Available Students for Class
**GET** `/api/classes/:id/available-students`

Returns students who are NOT currently enrolled in the specified class.

**Response:**
```json
[
  {
    "id": "student-uuid",
    "email": "student@example.com",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": "https://...",
    "studentInfo": {
      "id": "student-uuid",
      "studentCode": "STU001",
      "gradeLevel": 7,
      "schoolName": "THCS ABC",
      "dateOfBirth": "2010-05-15",
      "gender": "male"
    }
  }
]
```

---

## Dashboard Stats API

### Teacher Dashboard Stats
**GET** `/api/dashboard/teacher-stats`

**Roles:** `teacher`

Returns statistics specific to the authenticated teacher.

**Response:**
```json
{
  "totalStudents": 45,
  "totalClasses": 3,
  "totalCourses": 5,
  "activeAssignments": 12,
  "recentSubmissions": 8,
  "averageClassMastery": 72.5
}
```

### Student Dashboard Stats
**GET** `/api/dashboard/student-stats`

**Roles:** `student`

Returns statistics for the authenticated student.

**Response:**
```json
{
  "totalCourses": 4,
  "completedKps": 23,
  "totalKps": 45,
  "averageMastery": 78,
  "activeAssignments": 3,
  "overdueAssignments": 1,
  "learningStreak": 5
}
```

---

## Reports API

### Export Reports
**POST** `/api/reports/export`

**Roles:** `admin`, `teacher`

Export reports in various formats.

**Request Body:**
```json
{
  "reportType": "class_progress" | "student_progress" | "course_analytics",
  "format": "pdf" | "excel" | "csv",
  "filters": {
    "classId": "class-uuid",
    "startDate": "2026-01-01",
    "endDate": "2026-03-04"
  }
}
```

**Response:**
```json
{
  "downloadUrl": "https://r2.dev/reports/report-uuid.pdf",
  "expiresAt": "2026-03-04T12:00:00Z"
}
```

### Get Report Data
**GET** `/api/reports/data`

**Roles:** `admin`, `teacher`

Get raw report data for visualization.

**Query Parameters:**
- `type` - Report type
- `classId` (optional)
- `studentId` (optional)
- `courseId` (optional)

---

## Learning Paths API (Updated)

### Get My Learning Paths
**GET** `/api/learning-paths/me`

**Roles:** `student`

Get learning paths for the authenticated student.

### Get Learning Path Details
**GET** `/api/learning-paths/:id`

**Roles:** `student`, `teacher`, `admin`

### Get Learning Path Items
**GET** `/api/learning-paths/:id/items`

**Roles:** `student`, `teacher`, `admin`

### Update Learning Path Item Status
**PATCH** `/api/learning-paths/items/:itemId`

**Roles:** `student`

**Request Body:**
```json
{
  "status": "not_started" | "in_progress" | "completed",
  "progress": 75
}
```

---

## Student Course API

#### Get My Courses
**GET** `/api/students/me/courses`

**Roles:** `student`

#### Get My Courses with Progress
**GET** `/api/students/me/courses-with-progress`

**Roles:** `student`

#### Get Student Courses with Progress
**GET** `/api/students/:id/courses-with-progress`

---

## Frontend Route Access Control

### Route RBAC Implementation

The frontend implements role-based access control at the route level using Next.js middleware.

#### Protected Routes

| Route | Allowed Roles | Redirect If Unauthorized |
|-------|---------------|--------------------------|
| `/dashboard` | All authenticated users | `/login` |
| `/dashboard/courses` | All authenticated users | `/login` |
| `/dashboard/courses/create` | `admin`, `teacher` | `/dashboard/courses` |
| `/dashboard/courses/[id]/edit` | `admin`, `teacher` | `/dashboard/courses` |
| `/dashboard/classes` | All authenticated users | `/login` |
| `/dashboard/users` | `admin` only | `/dashboard` |
| `/dashboard/users/create` | `admin` only | `/dashboard` |
| `/dashboard/my-courses` | `student` | `/dashboard` |
| `/dashboard/learning-path` | `student` | `/dashboard` |
| `/dashboard/progress` | `student` | `/dashboard` |
| `/dashboard/reports` | `admin`, `teacher` | `/dashboard` |

#### Middleware Behavior
- Validates JWT token from cookies
- Checks user role against route requirements
- Redirects unauthorized users to appropriate pages
- API routes protected separately via JWT guard

#### Implementation Details
```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}

// Route-specific role checks
const routeRoles: Record<string, string[]> = {
  '/dashboard/users': ['admin'],
  '/dashboard/courses/create': ['admin', 'teacher'],
  // ... etc
}
```

---

## API Summary

### By Role Access

#### Admin Access
- All endpoints

#### Teacher Access
- `GET/POST/PATCH/DELETE /api/courses`
- `GET/POST/PATCH/DELETE /api/courses/modules/*`
- `GET/POST/PATCH/DELETE /api/courses/sections/*`
- `GET/POST/PATCH/DELETE /api/knowledge-points`
- `GET/POST/PATCH/DELETE /api/question-bank`
- `GET/POST/PATCH/DELETE /api/assignments`
- `GET/POST /api/classes`
- `GET /api/dashboard/teacher-stats`
- `GET /api/course-analytics/*`
- `GET /api/explorer/*`
- `GET /api/classes/:id/progress`

#### Student Access
- `GET /api/courses/:id/learn`
- `POST /api/assignments/student-assignments/:id/start`
- `POST /api/assignments/submit`
- `GET /api/assignments/students/:id`
- `POST /api/student-progress/submit-question`
- `GET /api/student-progress/students/:id/*`
- `GET /api/students/me/*`
- `PATCH /api/learning-paths/:id`

#### Parent Access
- `GET /api/assignments/students/:id`
- `GET /api/student-progress/students/:id/insights`

---

*Documentation Last Updated: 2026-03-04*
