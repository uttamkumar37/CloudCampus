# CloudCampus — API Documentation


> Version: 1.1 | Last Updated: 2026-04-30 | Base URL: `http://localhost:8080/api/v1`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication APIs](#2-authentication-apis)
3. [Tenant Management APIs](#3-tenant-management-apis)
4. [User Management APIs](#4-user-management-apis)
5. [Student APIs](#5-student-apis)
6. [Teacher APIs](#6-teacher-apis)
7. [Academic APIs](#7-academic-apis)
8. [Attendance APIs](#8-attendance-apis)
9. [Fee APIs](#9-fee-apis)
10. [Exam APIs](#10-exam-apis)
11. [Homework APIs](#11-homework-apis)
12. [Timetable APIs](#12-timetable-apis)
13. [Parent APIs](#13-parent-apis)
14. [Dashboard APIs](#14-dashboard-apis)
15. [Bulk Upload APIs](#15-bulk-upload-apis)
16. [Subscription Plan APIs](#16-subscription-plan-apis)
17. [Tenant Subscription APIs](#17-tenant-subscription-apis)
18. [Platform Payment APIs](#18-platform-payment-apis)
19. [Error Reference](#19-error-reference)

---

## 1. Overview

### Base URL

```
http://localhost:8080/api/v1
```

### Required Headers

| Header | Required On | Example |
|--------|-------------|---------|
| `Authorization` | All authenticated endpoints | `Bearer eyJhbGci...` |
| `X-Tenant-Slug` | All tenant-scoped endpoints | `greenwood` |
| `Content-Type` | POST/PUT requests | `application/json` |

### Response Envelope

Every response is wrapped in `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { },
  "timestamp": "2026-04-28T10:00:00Z"
}
```

Paginated responses return `PageResponse<T>` inside `data`:

```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "last": false
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Validation error or bad request |
| `401` | Missing or invalid JWT |
| `403` | Insufficient role/permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate admission number) |
| `500` | Internal server error |

---

## 2. Authentication APIs

### 2.1 Login

> Authenticate a user and obtain a JWT token.
> For **Super Admin** login, omit `X-Tenant-Slug`.
> For **tenant users** (Admin, Teacher, etc.), include `X-Tenant-Slug`.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
X-Tenant-Slug: greenwood       (tenant users only; omit for Super Admin)
```

**Request Body:**
```json
{
  "username": "john.admin",
  "password": "SecretPass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "username": "john.admin",
    "role": "SCHOOL_ADMIN",
    "roles": ["SCHOOL_ADMIN"],
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "tenantId": "greenwood"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

---

### 2.2 Get Current User Profile

> Returns the profile of the currently authenticated user.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
X-Tenant-Slug: greenwood
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john.admin",
    "email": "john@greenwood.edu",
    "fullName": "John Smith",
    "role": "SCHOOL_ADMIN",
    "active": true,
    "tenantSchema": "greenwood"
  }
}
```

---

## 3. Tenant Management APIs

> These endpoints require the `SUPER_ADMIN` role.
> `X-Tenant-Slug` header is **not required** for these endpoints.

### 3.1 Create Tenant

> Provisions a new school tenant: creates a PostgreSQL schema and initializes all 13 domain tables.

**Endpoint:** `POST /tenants`

**Headers:**
```
Authorization: Bearer <superadmin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tenantId": "greenwood",
  "schoolName": "Greenwood High School",
  "schemaName": "greenwood",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#10b981"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantId` | string | Yes | Unique business identifier for the tenant |
| `schoolName` | string | Yes | Display name of the school |
| `schemaName` | string | Yes | PostgreSQL schema name (alphanumeric + underscore only) |
| `logoUrl` | string | No | URL to school logo |
| `primaryColor` | string | No | Brand color hex code (default: `#10b981`) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "id": "a3d5e7f9-...",
    "tenantId": "greenwood",
    "schoolName": "Greenwood High School",
    "schemaName": "greenwood",
    "active": true,
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#10b981",
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 3.2 List All Tenants

**Endpoint:** `GET /tenants`

**Headers:**
```
Authorization: Bearer <superadmin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a3d5e7f9-...",
      "tenantId": "greenwood",
      "schoolName": "Greenwood High School",
      "schemaName": "greenwood",
      "active": true,
      "createdAt": "2026-04-28T10:00:00Z"
    }
  ]
}
```

---

### 3.3 Get Tenant by ID

**Endpoint:** `GET /tenants/{tenantId}`

**Path Parameter:** `tenantId` — the business tenant ID (e.g., `greenwood`)

**Response (200 OK):** Same structure as single object in 3.2.

---

## 4. User Management APIs

> Requires: `X-Tenant-Slug` header. Role: `SUPER_ADMIN` or `SCHOOL_ADMIN`.

### 4.1 Create User

> Creates a staff user account within a tenant schema.

**Endpoint:** `POST /users`

**Headers:**
```
Authorization: Bearer <token>
X-Tenant-Slug: greenwood
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "username": "jane.doe",
  "email": "jane@greenwood.edu",
  "password": "SecurePass123!",
  "role": "TEACHER"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `fullName` | string | Yes | Display name |
| `username` | string | Yes | Login username (normalized to lowercase) |
| `email` | string | Yes | Email address (normalized to lowercase) |
| `password` | string | Yes | Plaintext (BCrypt hashed before storage) |
| `role` | enum | Yes | `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `PARENT` |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "Jane Doe",
    "username": "jane.doe",
    "email": "jane@greenwood.edu",
    "role": "TEACHER",
    "active": true,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 4.2 List Users (Paginated)

**Endpoint:** `GET /users`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | `0` | Zero-based page number |
| `size` | int | `20` | Items per page |
| `sort` | string | `username,asc` | Sort field and direction |

**Response (200 OK):** `PageResponse<UserResponse>`

---

## 5. Student APIs

> Requires: `X-Tenant-Slug` header.

### 5.1 Create Student

**Endpoint:** `POST /students`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN

**Headers:**
```
Authorization: Bearer <token>
X-Tenant-Slug: greenwood
Content-Type: application/json
```

**Request Body:**
```json
{
  "admissionNo": "ADM-2024-001",
  "firstName": "Alice",
  "lastName": "Johnson",
  "dateOfBirth": "2010-05-15",
  "gender": "FEMALE",
  "email": "alice@example.com",
  "phone": "+91-9876543210"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `admissionNo` | string | Yes | Normalized to UPPERCASE; must be unique |
| `firstName` | string | Yes | |
| `lastName` | string | Yes | |
| `dateOfBirth` | date | Yes | ISO 8601 (YYYY-MM-DD) |
| `gender` | enum | Yes | `MALE`, `FEMALE`, `OTHER` |
| `email` | string | No | Optional |
| `phone` | string | No | Optional |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "admissionNo": "ADM-2024-001",
    "firstName": "Alice",
    "lastName": "Johnson",
    "dateOfBirth": "2010-05-15",
    "gender": "FEMALE",
    "email": "alice@example.com",
    "phone": "+91-9876543210",
    "active": true,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "message": "Admission number already exists"
}
```

---

### 5.2 Get Student by ID

**Endpoint:** `GET /students/{id}`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

**Response (200 OK):** Single `StudentResponse` object.

---

### 5.3 List Students (Paginated)

**Endpoint:** `GET /students`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

**Query Parameters:** `page`, `size`, `sort` (default: `lastName,asc`)

**Response (200 OK):** `PageResponse<StudentResponse>`

---

### 5.4 Delete Student

**Endpoint:** `DELETE /students/{id}`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN

**Path Parameter:** `id` — UUID of the student

**Response (204 No Content):** Empty body.

---

## 6. Teacher APIs

> Requires: `X-Tenant-Slug` header.

### 6.1 Create Teacher

**Endpoint:** `POST /teachers`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN

**Request Body:**
```json
{
  "employeeNo": "EMP-001",
  "firstName": "Robert",
  "lastName": "Wilson",
  "email": "robert@greenwood.edu",
  "phone": "+91-9876543211",
  "hireDate": "2022-08-01"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `employeeNo` | string | Yes | Normalized to UPPERCASE; must be unique |
| `firstName` | string | Yes | |
| `lastName` | string | Yes | |
| `email` | string | Yes | Normalized to lowercase; must be unique |
| `phone` | string | No | |
| `hireDate` | date | Yes | ISO 8601 (YYYY-MM-DD) |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "employeeNo": "EMP-001",
    "firstName": "Robert",
    "lastName": "Wilson",
    "email": "robert@greenwood.edu",
    "phone": "+91-9876543211",
    "hireDate": "2022-08-01",
    "active": true,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 6.2 Get Teacher by ID

**Endpoint:** `GET /teachers/{id}`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

---

### 6.3 List Teachers (Paginated)

**Endpoint:** `GET /teachers`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

**Query Parameters:** `page`, `size`, `sort` (default: `lastName,asc`)

---

### 6.4 Delete Teacher

**Endpoint:** `DELETE /teachers/{id}`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN

**Path Parameter:** `id` — UUID of the teacher

**Response (204 No Content):** Empty body.

---

## 7. Academic APIs

> Requires: `X-Tenant-Slug` header.
> Write operations: SUPER_ADMIN, SCHOOL_ADMIN
> Read operations: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

### 7.1 Create Class

**Endpoint:** `POST /academics/classes`

**Request Body:**
```json
{
  "name": "Grade 10",
  "code": "G10"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Grade 10",
    "code": "G10",
    "active": true,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 7.2 List Classes

**Endpoint:** `GET /academics/classes`

**Response (200 OK):** `List<ClassResponse>`

---

### 7.3 Create Subject

**Endpoint:** `POST /academics/subjects`

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MATH"
}
```

**Response (201 Created):** `SubjectResponse` with `id`, `name`, `code`, `active`, `createdAt`.

---

### 7.4 List Subjects

**Endpoint:** `GET /academics/subjects`

**Response (200 OK):** `List<SubjectResponse>`

---

### 7.5 Create Section

**Endpoint:** `POST /academics/sections`

**Request Body:**
```json
{
  "name": "Section A",
  "classId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):** `SectionResponse` with `id`, `name`, `classId`, `active`, `createdAt`.

---

### 7.6 List Sections

**Endpoint:** `GET /academics/sections`

**Response (200 OK):** `List<SectionResponse>`

---

## 8. Attendance APIs

> Requires: `X-Tenant-Slug` header.

### 8.1 Mark Attendance

**Endpoint:** `POST /attendances`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

**Request Body:**
```json
{
  "studentId": "550e8400-...",
  "classId": "a1b2c3d4-...",
  "sectionId": "e5f6a7b8-...",
  "attendanceDate": "2026-04-28",
  "status": "PRESENT",
  "remarks": "On time",
  "markedByUserId": "c9d0e1f2-..."
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `studentId` | UUID | Yes | |
| `classId` | UUID | Yes | |
| `sectionId` | UUID | Yes | |
| `attendanceDate` | date | Yes | ISO 8601; cannot be future date |
| `status` | enum | Yes | `PRESENT`, `ABSENT`, `LATE`, `EXCUSED` |
| `remarks` | string | No | |
| `markedByUserId` | UUID | No | User who marked attendance |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "studentId": "550e8400-...",
    "classId": "a1b2c3d4-...",
    "sectionId": "e5f6a7b8-...",
    "attendanceDate": "2026-04-28",
    "status": "PRESENT",
    "remarks": "On time",
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

**Error (409):** Duplicate attendance for same student + date.

---

### 8.2 Get Attendance by ID

**Endpoint:** `GET /attendances/{attendanceId}`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

---

### 8.3 List Attendance by Date

**Endpoint:** `GET /attendances?date=2026-04-28`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

**Query Parameter:** `date` — ISO 8601 date string

**Response (200 OK):** `List<AttendanceResponse>`

---

## 9. Fee APIs

> Requires: `X-Tenant-Slug` header.

### 9.1 Assign Fee to Student

**Endpoint:** `POST /fees/assignments`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN

**Request Body:**
```json
{
  "studentId": "550e8400-...",
  "feeTitle": "Term 1 Tuition Fee",
  "amount": 15000.00,
  "dueDate": "2026-05-31"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "studentId": "550e8400-...",
    "feeTitle": "Term 1 Tuition Fee",
    "amount": 15000.00,
    "dueDate": "2026-05-31",
    "status": "PENDING",
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

Fee status lifecycle:
```
PENDING → PARTIALLY_PAID → PAID
PENDING → OVERDUE  (if due date passes without full payment)
```

---

### 9.2 Record Fee Payment

**Endpoint:** `POST /fees/payments`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN

**Request Body:**
```json
{
  "feeAssignmentId": "a1b2c3d4-...",
  "amountPaid": 8000.00,
  "paymentDate": "2026-04-28",
  "paymentMethod": "CASH",
  "referenceNo": "RCP-20260428-001",
  "receivedByUserId": "c9d0e1f2-..."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `feeAssignmentId` | UUID | Yes | Must exist |
| `amountPaid` | decimal | Yes | Cannot exceed remaining balance |
| `paymentDate` | date | Yes | |
| `paymentMethod` | string | No | e.g., `CASH`, `BANK_TRANSFER`, `CHEQUE` |
| `referenceNo` | string | No | Receipt / transaction reference |
| `receivedByUserId` | UUID | No | Staff member who received payment |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "feeAssignmentId": "a1b2c3d4-...",
    "amountPaid": 8000.00,
    "paymentDate": "2026-04-28",
    "paymentMethod": "CASH",
    "referenceNo": "RCP-20260428-001",
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

**Business rules:**
- Payment amount cannot exceed remaining balance
- Fee assignment status auto-transitions:
  - Partial payment → `PARTIALLY_PAID`
  - Full payment → `PAID`
  - Overpayment → rejected with error

---

### 9.3 Get Fee Assignments for Student

**Endpoint:** `GET /fees/students/{studentId}/assignments`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER (STUDENT and PARENT can access only their own data via ownership check)

**Response (200 OK):** `List<FeeAssignmentResponse>`

---

## 10. Exam APIs

> Requires: `X-Tenant-Slug` header.

### 10.1 Create Exam

**Endpoint:** `POST /exams`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

**Request Body:**
```json
{
  "title": "Mid-Term Mathematics",
  "examDate": "2026-05-15",
  "classId": "550e8400-...",
  "sectionId": "a1b2c3d4-...",
  "subjectId": "e5f6a7b8-...",
  "maxMarks": 100.0
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | |
| `examDate` | date | Yes | ISO 8601 |
| `classId` | UUID | Yes | |
| `sectionId` | UUID | Yes | |
| `subjectId` | UUID | Yes | |
| `maxMarks` | decimal | Yes | Must be > 0 |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Mid-Term Mathematics",
    "examDate": "2026-05-15",
    "classId": "550e8400-...",
    "sectionId": "a1b2c3d4-...",
    "subjectId": "e5f6a7b8-...",
    "maxMarks": 100.0,
    "active": true,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

**Error (409):** Duplicate exam schedule (same title + date + class + section + subject).

---

### 10.2 Get Exams for Class

**Endpoint:** `GET /exams/classes/{classId}`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

**Response (200 OK):** `List<ExamResponse>`

---

### 10.3 Enter Exam Result

**Endpoint:** `POST /exams/results`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

**Request Body:**
```json
{
  "examId": "550e8400-...",
  "studentId": "a1b2c3d4-...",
  "marksObtained": 87.5,
  "grade": "A",
  "remarks": "Excellent performance",
  "published": false
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `examId` | UUID | Yes | |
| `studentId` | UUID | Yes | |
| `marksObtained` | decimal | Yes | Cannot exceed `exam.maxMarks` |
| `grade` | string | No | e.g., `A`, `B+`, `C` |
| `remarks` | string | No | |
| `published` | boolean | No | Default: false |

**Business rules:**
- `marksObtained` cannot exceed `maxMarks`
- Only one result per student per exam (UNIQUE constraint)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "examId": "550e8400-...",
    "studentId": "a1b2c3d4-...",
    "marksObtained": 87.5,
    "grade": "A",
    "remarks": "Excellent performance",
    "published": false,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 10.4 Get Results for Exam

**Endpoint:** `GET /exams/{examId}/results`

**Role Access:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

**Response (200 OK):** `List<ExamResultResponse>`

---

## 11. Homework APIs

> Requires: `X-Tenant-Slug` header.

### 11.1 Create Homework Assignment

**Endpoint:** `POST /homework`

**Role Access:** SCHOOL_ADMIN, TEACHER

**Request Body:**
```json
{
  "title": "Chapter 5 Exercises",
  "instructions": "Complete problems 1–20 on page 87",
  "classId": "550e8400-...",
  "sectionId": "a1b2c3d4-...",
  "dueDate": "2026-05-02"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | Max 200 characters |
| `instructions` | string | No | Free-text instructions for students |
| `classId` | UUID | Yes | |
| `sectionId` | UUID | No | Optional — targets all sections if omitted |
| `dueDate` | date | No | ISO 8601 (YYYY-MM-DD) |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Chapter 5 Exercises",
    "instructions": "Complete problems 1–20 on page 87",
    "classId": "550e8400-...",
    "sectionId": "a1b2c3d4-...",
    "assignedByUserId": "c9d0e1f2-...",
    "dueDate": "2026-05-02",
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 11.2 Get Homework for Class

**Endpoint:** `GET /homework/classes/{classId}`

**Role Access:** SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

**Response (200 OK):** `List<HomeworkResponse>`

---

## 12. Timetable APIs

> Requires: `X-Tenant-Slug` header.

### 12.1 Create Timetable Slot

**Endpoint:** `POST /timetable/slots`

**Role Access:** SCHOOL_ADMIN, TEACHER

**Request Body:**
```json
{
  "classId": "550e8400-...",
  "sectionId": "a1b2c3d4-...",
  "subjectId": "e5f6a7b8-...",
  "teacherId": "f1a2b3c4-...",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "09:00",
  "label": "Mathematics - Period 1"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `classId` | UUID | Yes | |
| `sectionId` | UUID | Yes | |
| `subjectId` | UUID | Yes | |
| `teacherId` | UUID | No | Optional — assigned teacher |
| `dayOfWeek` | short | Yes | 1 = Monday … 7 = Sunday |
| `startTime` | time | Yes | HH:mm format; must be < endTime |
| `endTime` | time | Yes | HH:mm format |
| `label` | string | No | Max 80 characters |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "classId": "550e8400-...",
    "sectionId": "a1b2c3d4-...",
    "subjectId": "e5f6a7b8-...",
    "teacherId": "f1a2b3c4-...",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "09:00",
    "label": "Mathematics - Period 1",
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 12.2 Get Timetable for Class & Section

**Endpoint:** `GET /timetable/classes/{classId}/sections/{sectionId}`

**Role Access:** SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

**Response (200 OK):** `List<TimetableSlotResponse>`

---

## 13. Parent APIs

> Requires: `X-Tenant-Slug` header. Role: `PARENT` only.

### 13.1 Get My Children

> Returns the list of students linked to the currently authenticated parent.

**Endpoint:** `GET /parents/me/children`

**Headers:**
```
Authorization: Bearer <parent_token>
X-Tenant-Slug: greenwood
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "550e8400-...",
      "firstName": "Alice",
      "lastName": "Johnson",
      "admissionNo": "ADM-2024-001"
    }
  ]
}
```

---

## 14. Dashboard APIs

> Requires: `X-Tenant-Slug` header (except super-admin summary).

### 14.1 Get Tenant Dashboard Summary

**Endpoint:** `GET /dashboard/tenant-summary`

**Role Access:** SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "branding": {
      "tenantId": "greenwood",
      "schoolName": "Greenwood High School",
      "logoUrl": "https://example.com/logo.png",
      "primaryColor": "#10b981"
    },
    "totalStudents": 350,
    "totalTeachers": 28,
    "attendancePercentage": 94.5,
    "feesCollected": 1250000.00,
    "attendanceTrend": [
      { "label": "Mon", "value": 95.0 },
      { "label": "Tue", "value": 93.0 }
    ],
    "monthlyFeeCollection": [
      { "label": "Jan", "value": 150000.0 },
      { "label": "Feb", "value": 140000.0 }
    ],
    "recentActivity": [
      {
        "title": "New student enrolled",
        "description": "Alice Johnson was enrolled in Grade 10",
        "type": "STUDENT",
        "occurredAt": "2026-04-28T08:30:00Z"
      }
    ],
    "quickInsights": [
      "94.5% average attendance this week",
      "3 fee payments due today"
    ]
  }
}
```

---

### 14.2 Get Tenant Branding

**Endpoint:** `GET /dashboard/branding`

**Role Access:** SCHOOL_ADMIN, TEACHER, STUDENT, PARENT

**Response (200 OK):** Returns the full `TenantResponse` for the current tenant.

```json
{
  "success": true,
  "data": {
    "id": "a3d5e7f9-...",
    "tenantId": "greenwood",
    "schoolName": "Greenwood High School",
    "schemaName": "greenwood",
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#10b981",
    "active": true,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 14.3 Get Super Admin Dashboard Summary

**Endpoint:** `GET /dashboard/super-admin-summary`

**Role Access:** SUPER_ADMIN only (no `X-Tenant-Slug` required)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalTenants": 15,
    "activeTenants": 14,
    "tenantsCreatedThisMonth": 3,
    "inactiveTenants": 1,
    "newestTenants": [
      {
        "id": "a3d5e7f9-...",
        "tenantId": "greenwood",
        "schoolName": "Greenwood High School",
        "schemaName": "greenwood",
        "active": true,
        "createdAt": "2026-04-28T10:00:00Z"
      }
    ]
  }
}
```

---

## 15. Bulk Upload APIs

> Requires: `X-Tenant-Slug` header. Role: SCHOOL_ADMIN.

### 15.1 Upload Excel File

> Accepts an Excel workbook (`.xlsx`) with sheets for Students, Teachers, Classes, and Sections.

**Endpoint:** `POST /bulk/upload`

**Headers:**
```
Authorization: Bearer <token>
X-Tenant-Slug: greenwood
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | `.xlsx` workbook |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRows": 50,
    "successCount": 48,
    "failedCount": 2,
    "errors": [
      {
        "sheet": "Students",
        "row": 5,
        "message": "Duplicate admission number: ADM-2024-010"
      },
      {
        "sheet": "Teachers",
        "row": 3,
        "message": "Email is required"
      }
    ]
  }
}
```

---

### 15.2 Download Sample Template

> Returns a downloadable Excel template with correct sheet structure.

**Endpoint:** `GET /bulk/sample`

**Headers:**
```
Authorization: Bearer <token>
X-Tenant-Slug: greenwood
```

**Response:** Binary file download (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

---

---

## 16. Subscription Plan APIs

Base path: `/api/v1/plans` | Auth: Bearer token

---

### 16.1 List Active Plans (Public)

```
GET /api/v1/plans
```

No authentication required.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "PRO",
      "price": 7999.00,
      "billingCycleDays": 30,
      "maxStudents": 1500,
      "maxTeachers": 150,
      "description": "For large schools",
      "active": true,
      "features": ["STUDENT_MANAGEMENT", "BULK_UPLOAD", "PARENT_PORTAL"],
      "createdAt": "2026-04-28T10:00:00Z"
    }
  ]
}
```

---

### 16.2 Get Plan by ID

```
GET /api/v1/plans/{id}
Authorization: Bearer <token>
```

---

### 16.3 Create Plan (Super Admin)

```
POST /api/v1/plans
Authorization: Bearer <superadmin-token>
```

**Request:**
```json
{
  "name": "PRO",
  "price": 7999.00,
  "billingCycleDays": 30,
  "maxStudents": 1500,
  "maxTeachers": 150,
  "description": "For large schools",
  "features": ["STUDENT_MANAGEMENT", "TEACHER_MANAGEMENT", "BULK_UPLOAD", "PARENT_PORTAL"]
}
```

---

## 17. Tenant Subscription APIs

Base path: `/api/v1/tenants/{tenantId}` | Auth: SUPER_ADMIN Bearer token

---

### 17.1 Subscribe Tenant to Plan

```
POST /api/v1/tenants/{tenantId}/subscribe
Authorization: Bearer <superadmin-token>
```

**Request:**
```json
{
  "planId": "uuid-of-plan",
  "durationDays": 365
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "greenwood",
    "plan": { "name": "PRO", ... },
    "startDate": "2026-04-28",
    "endDate": "2027-04-28",
    "status": "ACTIVE",
    "paymentStatus": "PENDING"
  }
}
```

---

### 17.2 Get Active Subscription

```
GET /api/v1/tenants/{tenantId}/subscription
Authorization: Bearer <superadmin-token>
```

Returns `data: null` if no active subscription exists.

---

### 17.3 Cancel Subscription

```
DELETE /api/v1/tenants/{tenantId}/subscription
Authorization: Bearer <superadmin-token>
```

Sets `status = CANCELLED` on the active subscription.

---

## 18. Platform Payment APIs

Base path: `/api/v1/payments` | Auth: SUPER_ADMIN Bearer token

---

### 18.1 Record Payment

```
POST /api/v1/payments
Authorization: Bearer <superadmin-token>
```

**Request:**
```json
{
  "tenantId": "greenwood",
  "subscriptionId": "uuid-optional",
  "amount": 7999.00,
  "paymentDate": "2026-04-28",
  "paymentMethod": "BANK_TRANSFER",
  "referenceNo": "TXN-2026-001",
  "notes": "Annual PRO plan payment"
}
```

When `subscriptionId` is provided, `TenantSubscription.paymentStatus` is automatically updated to `PAID`.

---

### 18.2 Get Payments by Tenant

```
GET /api/v1/payments/tenant/{tenantId}
Authorization: Bearer <superadmin-token>
```

Returns all payments for the tenant in reverse chronological order.

---

## 19. Error Reference

### 16.1 Standard Error Response

```json
{
  "success": false,
  "message": "Human-readable error description",
  "data": null,
  "timestamp": "2026-04-28T10:00:00Z"
}
```

### 16.2 Validation Error (400)

Returned when `@Valid` constraints fail:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      { "field": "admissionNo", "message": "must not be blank" },
      { "field": "gender", "message": "must be MALE, FEMALE, or OTHER" }
    ]
  }
}
```

### 16.3 Common Error Messages

| HTTP Status | Message | Cause |
|-------------|---------|-------|
| 401 | `Invalid username or password` | Wrong credentials on login |
| 401 | `JWT token is expired` | Token past expiry time |
| 401 | `Authorization header missing` | No Bearer token sent |
| 403 | `Access denied` | Role not permitted for this endpoint |
| 404 | `Student not found` | UUID does not exist in tenant schema |
| 409 | `Admission number already exists` | Duplicate `admissionNo` |
| 409 | `Duplicate exam schedule` | Same title+date+class+section+subject |
| 409 | `Result already exists for this student` | UNIQUE(exam_id, student_id) violated |
| 422 | `Marks obtained exceed maximum marks` | `marksObtained > exam.maxMarks` |
| 422 | `No balance to receive` | Payment exceeds remaining fee balance |
| 500 | `Tenant context not set` | Missing `X-Tenant-Slug` on tenant-scoped endpoint |
