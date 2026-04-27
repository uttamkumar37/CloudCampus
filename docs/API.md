# CampusCloud — API Reference

Complete HTTP API reference for all modules. All endpoints return `ApiResponse<T>`.

**Base URL:** `http://localhost:8080/api/v1`

**Required headers (all tenant-scoped endpoints):**
```
Authorization: Bearer <token>
X-Tenant-ID:   <schema_name>
Content-Type:  application/json
```

---

## Table of Contents

1. [Response Envelope](#1-response-envelope)
2. [Auth](#2-auth)
3. [Tenant Management](#3-tenant-management)
4. [Users](#4-users)
5. [Students](#5-students)
6. [Teachers](#6-teachers)
7. [Academic Structure](#7-academic-structure)
8. [Attendance](#8-attendance)
9. [Fees](#9-fees)
10. [Exams & Results](#10-exams--results)
11. [Enums](#11-enums)
12. [Error Reference](#12-error-reference)

---

## 1. Response Envelope

Every response — success or error — uses this wrapper:

```json
{
  "success":   true,
  "message":   "Human-readable description",
  "data":      { ... },
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

On error: `success: false`, `data: null`, `message` describes the violation.

### Paginated Response

List endpoints wrap `data` in `PageResponse<T>`:

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "content": [ { ... }, { ... } ],
    "page":          0,
    "size":          20,
    "totalElements": 87,
    "totalPages":    5,
    "last":          false
  },
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

**Pagination query parameters (all list endpoints):**

| Parameter | Default | Description |
|---|---|---|
| `page` | `0` | Zero-based page index |
| `size` | `20` | Items per page |
| `sort` | `createdAt,desc` | Sort field and direction |

---

## 2. Auth

### POST /api/v1/auth/login

No authentication required. No `X-Tenant-ID` required.

**Request body:**

```json
{
  "username": "superadmin",
  "password": "your-password"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `username` | string | Yes | Trimmed; case-insensitive match |
| `password` | string | Yes | Plaintext; validated against BCrypt hash |

**Response 200:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token":    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcmFkbWluIiwicm9sZSI6IlJPTEVfU1VQRVJfQURNSU4iLCJpYXQiOjE3NDU3NDQ4MDAsImV4cCI6MTc0NTc0ODQwMH0.SIGNATURE",
    "username": "superadmin",
    "role":     "SUPER_ADMIN"
  },
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

| Response field | Description |
|---|---|
| `token` | JWT — include as `Authorization: Bearer <token>` on all subsequent requests |
| `username` | Authenticated username |
| `role` | One of: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `PARENT` |

**Error 400:** Invalid credentials

**Token expiry:** Configured by `JWT_ACCESS_TOKEN_EXPIRATION_MS` (default 3600000 ms = 1 hour). Re-call this endpoint to get a new token.

---

## 3. Tenant Management

All endpoints require `SUPER_ADMIN` role. No `X-Tenant-ID` needed for these endpoints.

### POST /api/v1/tenants

Creates a new school tenant and provisions its PostgreSQL schema + 11 domain tables.

**Request body:**

```json
{
  "name":       "Greenwood High School",
  "schemaName": "greenwood"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `name` | string | Yes | Must be globally unique |
| `schemaName` | string | Yes | Must be globally unique; used as PostgreSQL schema name; lowercase, no spaces |

**Response 200:**

```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "id":         "550e8400-e29b-41d4-a716-446655440000",
    "name":       "Greenwood High School",
    "schemaName": "greenwood",
    "active":     true,
    "createdAt":  "2026-04-27T10:00:00.000Z"
  }
}
```

**Error 400:** Duplicate name or schema name

**Side effects:** Creates PostgreSQL schema `greenwood` and runs 11 `CREATE TABLE IF NOT EXISTS` statements in a single transaction. See the full SQL in [README.md](../README.md#5-multi-tenancy).

---

### GET /api/v1/tenants

Returns all tenants.

**Response 200:**

```json
{
  "success": true,
  "message": "Tenants retrieved successfully",
  "data": [
    {
      "id":         "550e8400-e29b-41d4-a716-446655440000",
      "name":       "Greenwood High School",
      "schemaName": "greenwood",
      "active":     true,
      "createdAt":  "2026-04-27T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/v1/tenants/{id}

Returns a single tenant by UUID.

**Path param:** `id` — UUID of the tenant

**Response 200:** Same `TenantResponse` object as create.

**Error 400:** Tenant not found

---

## 4. Users

Minimum role: `SCHOOL_ADMIN` for write; `SCHOOL_ADMIN` for read. Requires `X-Tenant-ID`.

### POST /api/v1/users

Creates a new staff user account in the tenant schema.

**Request body:**

```json
{
  "fullName": "Jane Smith",
  "username": "janesmith",
  "email":    "jane@greenwood.edu",
  "password": "SecurePass123!",
  "role":     "SCHOOL_ADMIN"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `fullName` | string | Yes | 1–255 chars |
| `username` | string | Yes | Stored lowercase; must be unique within tenant |
| `email` | string | Yes | Stored lowercase; must be unique within tenant |
| `password` | string | Yes | Stored as BCrypt hash; never returned |
| `role` | string | Yes | `SUPER_ADMIN` \| `SCHOOL_ADMIN` \| `TEACHER` \| `STUDENT` \| `PARENT` |

**Response 200:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id":        "uuid",
    "fullName":  "Jane Smith",
    "username":  "janesmith",
    "email":     "jane@greenwood.edu",
    "role":      "SCHOOL_ADMIN",
    "active":    true,
    "createdAt": "2026-04-27T10:00:00.000Z"
  }
}
```

**Note:** `password` is never included in any response.

**Error 400:** Duplicate username | Duplicate email | Missing tenant context

---

### GET /api/v1/users

Returns paginated list of users in the tenant.

**Query params:** `page`, `size`, `sort` (see [Section 1](#1-response-envelope))

**Response 200:** `PageResponse<UserResponse>`

---

## 5. Students

Write: min `SCHOOL_ADMIN`. Read: min `TEACHER`. Requires `X-Tenant-ID`.

### POST /api/v1/students

Enrolls a new student.

**Request body:**

```json
{
  "admissionNo":  "STU2026001",
  "firstName":    "Alice",
  "lastName":     "Johnson",
  "dateOfBirth":  "2010-06-15",
  "gender":       "FEMALE",
  "email":        "alice@greenwood.edu",
  "phone":        "+1-555-0100"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `admissionNo` | string | Yes | Stored UPPERCASE; must be unique within tenant |
| `firstName` | string | Yes | 1–100 chars |
| `lastName` | string | Yes | 1–100 chars |
| `dateOfBirth` | string | No | ISO 8601 date: `yyyy-MM-dd` |
| `gender` | string | No | `MALE` \| `FEMALE` \| `OTHER` |
| `email` | string | No | Optional student email |
| `phone` | string | No | Optional phone number |

**Response 200:**

```json
{
  "success": true,
  "message": "Student enrolled successfully",
  "data": {
    "id":          "uuid",
    "admissionNo": "STU2026001",
    "firstName":   "Alice",
    "lastName":    "Johnson",
    "dateOfBirth": "2010-06-15",
    "gender":      "FEMALE",
    "email":       "alice@greenwood.edu",
    "phone":       "+1-555-0100",
    "active":      true,
    "createdAt":   "2026-04-27T10:00:00.000Z"
  }
}
```

**Error 400:** Duplicate admission number | Missing tenant context

---

### GET /api/v1/students

Paginated list of students.

**Query params:** `page`, `size`, `sort`

**Response 200:** `PageResponse<StudentResponse>`

---

### GET /api/v1/students/{id}

**Path param:** `id` — student UUID

**Response 200:** `StudentResponse` object

**Error 400:** Student not found

---

## 6. Teachers

Write: min `SCHOOL_ADMIN`. Read: min `TEACHER`. Requires `X-Tenant-ID`.

### POST /api/v1/teachers

Adds a teacher record.

**Request body:**

```json
{
  "employeeNo": "EMP2026001",
  "firstName":  "Robert",
  "lastName":   "Williams",
  "email":      "r.williams@greenwood.edu",
  "phone":      "+1-555-0200",
  "hireDate":   "2026-01-15"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `employeeNo` | string | Yes | Stored UPPERCASE; must be unique within tenant |
| `firstName` | string | Yes | 1–100 chars |
| `lastName` | string | Yes | 1–100 chars |
| `email` | string | Yes | Stored lowercase; must be unique within tenant |
| `phone` | string | No | Optional phone number |
| `hireDate` | string | No | ISO 8601 date: `yyyy-MM-dd` |

**Response 200:**

```json
{
  "success": true,
  "message": "Teacher added successfully",
  "data": {
    "id":         "uuid",
    "employeeNo": "EMP2026001",
    "firstName":  "Robert",
    "lastName":   "Williams",
    "email":      "r.williams@greenwood.edu",
    "phone":      "+1-555-0200",
    "hireDate":   "2026-01-15",
    "active":     true,
    "createdAt":  "2026-04-27T10:00:00.000Z"
  }
}
```

**Error 400:** Duplicate employee number | Duplicate email | Missing tenant context

---

### GET /api/v1/teachers

Paginated list of teachers.

**Query params:** `page`, `size`, `sort`

**Response 200:** `PageResponse<TeacherResponse>`

---

### GET /api/v1/teachers/{id}

**Path param:** `id` — teacher UUID

**Response 200:** `TeacherResponse` object

**Error 400:** Teacher not found

---

## 7. Academic Structure

Write: min `SCHOOL_ADMIN`. Read: min `TEACHER`. Requires `X-Tenant-ID`.

All three sub-resources follow the same pattern.

### POST /api/v1/academic/classes

**Request body:**

```json
{
  "name": "Grade 10",
  "code": "G10"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `name` | string | Yes | 1–100 chars |
| `code` | string | Yes | 1–20 chars; must be unique within tenant |

**Response 200:**

```json
{
  "data": {
    "id":        "uuid",
    "name":      "Grade 10",
    "code":      "G10",
    "active":    true,
    "createdAt": "2026-04-27T10:00:00.000Z"
  }
}
```

**Error 400:** Duplicate code

---

### GET /api/v1/academic/classes

Returns list of all classes. No pagination (typically small dataset).

**Response 200:** `List<SchoolClassResponse>`

---

### POST /api/v1/academic/subjects

**Request body:**

```json
{
  "name": "Mathematics",
  "code": "MATH101"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `name` | string | Yes | 1–100 chars |
| `code` | string | Yes | 1–20 chars; must be unique within tenant |

**Response 200:** `SubjectResponse` with `id`, `name`, `code`, `active`, `createdAt`

---

### GET /api/v1/academic/subjects

Returns list of all subjects.

**Response 200:** `List<SubjectResponse>`

---

### POST /api/v1/academic/sections

Creates a section within an existing class.

**Request body:**

```json
{
  "name":    "Section A",
  "classId": "uuid-of-existing-class"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `name` | string | Yes | 1–50 chars |
| `classId` | UUID | Yes | Must reference an existing class in the same tenant |

**Response 200:**

```json
{
  "data": {
    "id":        "uuid",
    "name":      "Section A",
    "classId":   "uuid-of-class",
    "active":    true,
    "createdAt": "2026-04-27T10:00:00.000Z"
  }
}
```

**Error 400:** Class not found

---

### GET /api/v1/academic/sections

Returns list of all sections.

**Response 200:** `List<SectionResponse>`

---

## 8. Attendance

Minimum role: `TEACHER`. Requires `X-Tenant-ID`.

### POST /api/v1/attendance

Marks attendance for a student on a given date.

**Request body:**

```json
{
  "studentId":      "uuid",
  "classId":        "uuid",
  "sectionId":      "uuid",
  "attendanceDate": "2026-04-27",
  "status":         "PRESENT",
  "remarks":        "On time"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `studentId` | UUID | Yes | Must reference an existing student |
| `classId` | UUID | Yes | Must reference an existing class |
| `sectionId` | UUID | Yes | Must reference an existing section |
| `attendanceDate` | string | Yes | ISO 8601 date: `yyyy-MM-dd` |
| `status` | string | Yes | `PRESENT` \| `ABSENT` \| `LATE` \| `EXCUSED` |
| `remarks` | string | No | Free-text note |

**Response 200:**

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "id":             "uuid",
    "studentId":      "uuid",
    "classId":        "uuid",
    "sectionId":      "uuid",
    "attendanceDate": "2026-04-27",
    "status":         "PRESENT",
    "remarks":        "On time",
    "createdAt":      "2026-04-27T10:00:00.000Z"
  }
}
```

**Error 400:** Attendance already marked for this student on this date (`UNIQUE(student_id, attendance_date)`)

---

### GET /api/v1/attendance/{id}

**Path param:** `id` — attendance record UUID

**Response 200:** `AttendanceResponse` object

**Error 400:** Record not found

---

### GET /api/v1/attendance/date/{date}

Returns all attendance records for a given date.

**Path param:** `date` — ISO 8601 date: `yyyy-MM-dd`

**Response 200:** `List<AttendanceResponse>`

---

## 9. Fees

Minimum role: `SCHOOL_ADMIN`. Requires `X-Tenant-ID`.

### POST /api/v1/fees/assignments

Assigns a fee item to a student.

**Request body:**

```json
{
  "studentId": "uuid",
  "feeTitle":  "Term 1 Tuition Fee",
  "amount":    5000.00,
  "dueDate":   "2026-05-31"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `studentId` | UUID | Yes | Must reference an existing student |
| `feeTitle` | string | Yes | 1–255 chars |
| `amount` | decimal | Yes | Positive amount; stored as NUMERIC(12,2) |
| `dueDate` | string | Yes | ISO 8601 date: `yyyy-MM-dd` |

**Response 200:**

```json
{
  "success": true,
  "message": "Fee assigned successfully",
  "data": {
    "id":        "uuid",
    "studentId": "uuid",
    "feeTitle":  "Term 1 Tuition Fee",
    "amount":    5000.00,
    "dueDate":   "2026-05-31",
    "status":    "PENDING",
    "createdAt": "2026-04-27T10:00:00.000Z"
  }
}
```

Initial `status` is always `PENDING`.

**Error 400:** Student not found | Missing tenant context

---

### GET /api/v1/fees/assignments/student/{studentId}

Returns all fee assignments for a student.

**Path param:** `studentId` — student UUID

**Response 200:** `List<FeeAssignmentResponse>`

---

### POST /api/v1/fees/payments

Records a payment against a fee assignment.

**Request body:**

```json
{
  "feeAssignmentId": "uuid",
  "amountPaid":      2500.00,
  "paymentDate":     "2026-04-27",
  "paymentMethod":   "BANK_TRANSFER",
  "referenceNo":     "TXN20260427001"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `feeAssignmentId` | UUID | Yes | Must reference an existing fee assignment |
| `amountPaid` | decimal | Yes | Must not exceed remaining unpaid balance |
| `paymentDate` | string | Yes | ISO 8601 date: `yyyy-MM-dd` |
| `paymentMethod` | string | No | Free-text (e.g. `CASH`, `BANK_TRANSFER`, `CARD`) |
| `referenceNo` | string | No | Transaction reference |

**Response 200:**

```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "id":               "uuid",
    "feeAssignmentId":  "uuid",
    "amountPaid":       2500.00,
    "paymentDate":      "2026-04-27",
    "paymentMethod":    "BANK_TRANSFER",
    "referenceNo":      "TXN20260427001",
    "createdAt":        "2026-04-27T10:00:00.000Z"
  }
}
```

**Status transitions after payment:**

| Condition | Resulting status |
|---|---|
| `totalPaid + amountPaid < assignment.amount` | `PARTIALLY_PAID` |
| `totalPaid + amountPaid == assignment.amount` | `PAID` |
| `totalPaid + amountPaid > assignment.amount` | **400** — overpayment rejected |

**Error 400:** Fee assignment not found | Overpayment (`amountPaid > remaining`) | Missing tenant context

---

## 10. Exams & Results

Minimum role: `TEACHER`. Requires `X-Tenant-ID`.

### POST /api/v1/exams

Schedules a new exam.

**Request body:**

```json
{
  "title":     "Mid-Term Mathematics",
  "examDate":  "2026-05-15",
  "classId":   "uuid",
  "sectionId": "uuid",
  "subjectId": "uuid",
  "maxMarks":  100
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `title` | string | Yes | 1–255 chars |
| `examDate` | string | Yes | ISO 8601 date: `yyyy-MM-dd` |
| `classId` | UUID | Yes | Must reference an existing class |
| `sectionId` | UUID | Yes | Must reference an existing section |
| `subjectId` | UUID | Yes | Must reference an existing subject |
| `maxMarks` | integer | Yes | Positive integer; marks cap for results |

**Response 200:**

```json
{
  "success": true,
  "message": "Exam scheduled successfully",
  "data": {
    "id":        "uuid",
    "title":     "Mid-Term Mathematics",
    "examDate":  "2026-05-15",
    "classId":   "uuid",
    "sectionId": "uuid",
    "subjectId": "uuid",
    "maxMarks":  100,
    "active":    true,
    "createdAt": "2026-04-27T10:00:00.000Z"
  }
}
```

**Uniqueness:** The combination `(title, examDate, classId, sectionId, subjectId)` must be unique.

**Error 400:** Duplicate exam schedule | Missing tenant context

---

### GET /api/v1/exams/class/{classId}

Returns all exams for a class.

**Path param:** `classId` — class UUID

**Response 200:** `List<ExamResponse>`

---

### POST /api/v1/exams/results

Enters a result for a student in an exam.

**Request body:**

```json
{
  "examId":        "uuid",
  "studentId":     "uuid",
  "marksObtained": 87,
  "grade":         "A",
  "remarks":       "Excellent performance"
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `examId` | UUID | Yes | Must reference an existing exam |
| `studentId` | UUID | Yes | One result per student per exam |
| `marksObtained` | decimal | Yes | Must be `>= 0` and `<= exam.maxMarks` |
| `grade` | string | No | Letter grade (e.g. `A`, `B+`) — not validated by API |
| `remarks` | string | No | Teacher notes |

**Response 200:**

```json
{
  "success": true,
  "message": "Result entered successfully",
  "data": {
    "id":             "uuid",
    "examId":         "uuid",
    "studentId":      "uuid",
    "marksObtained":  87,
    "grade":          "A",
    "remarks":        "Excellent performance",
    "published":      false,
    "createdAt":      "2026-04-27T10:00:00.000Z"
  }
}
```

`published` defaults to `false`. Publication endpoint is a future task.

**Error 400:** Exam not found | Duplicate result (same student + exam) | `marksObtained > exam.maxMarks` | Missing tenant context

---

### GET /api/v1/exams/results/exam/{examId}

Returns all results for an exam.

**Path param:** `examId` — exam UUID

**Response 200:** `List<ExamResultResponse>`

---

## 11. Enums

### UserRole

| Value | Description |
|---|---|
| `SUPER_ADMIN` | Platform administrator; manages tenants |
| `SCHOOL_ADMIN` | School administrator; manages all school data |
| `TEACHER` | Teacher; marks attendance, enters results |
| `STUDENT` | Student account (ownership model — roadmap) |
| `PARENT` | Parent account (ownership model — roadmap) |

### Gender

| Value |
|---|
| `MALE` |
| `FEMALE` |
| `OTHER` |

### AttendanceStatus

| Value | Description |
|---|---|
| `PRESENT` | Student was present |
| `ABSENT` | Student was absent |
| `LATE` | Student arrived late |
| `EXCUSED` | Absence was excused |

### FeeStatus

| Value | Description |
|---|---|
| `PENDING` | No payment received |
| `PARTIALLY_PAID` | Some payment received |
| `PAID` | Fully paid |

---

## 12. Error Reference

### Error Response Format

```json
{
  "success":   false,
  "message":   "Admission number STU001 already exists",
  "data":      null,
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

### HTTP Status Codes

| Status | When |
|---|---|
| `200 OK` | Successful response (both success and business errors use `ApiResponse`) |
| `400 Bad Request` | `IllegalArgumentException` — duplicate data, business rule violation, missing tenant, not found |
| `401 Unauthorized` | Missing or invalid JWT (Spring Security default response) |
| `403 Forbidden` | Valid JWT but insufficient role |
| `500 Internal Server Error` | Unhandled exception (logged server-side) |

### Common 400 Messages

| Message | Endpoint | Cause |
|---|---|---|
| `Username <x> already exists` | POST /users | Duplicate username in tenant |
| `Email <x> already exists` | POST /users, POST /teachers | Duplicate email in tenant |
| `Admission number <x> already exists` | POST /students | Duplicate admission number |
| `Employee number <x> already exists` | POST /teachers | Duplicate employee number |
| `Class code <x> already exists` | POST /academic/classes | Duplicate class code |
| `Subject code <x> already exists` | POST /academic/subjects | Duplicate subject code |
| `Attendance already marked for student <id> on date <d>` | POST /attendance | Duplicate attendance |
| `Overpayment: remaining balance is <n>` | POST /fees/payments | Payment exceeds balance |
| `An exam with these details already exists` | POST /exams | Duplicate exam schedule |
| `Result already exists for student <id> in exam <id>` | POST /exams/results | Duplicate result |
| `Marks <n> exceed maximum <m>` | POST /exams/results | Marks overflow |
| `No valid tenant context` | Any tenant-scoped | Missing or invalid `X-Tenant-ID` |

---

> See [README.md](../README.md) for full setup, auth workflow, and environment configuration.
> See [docs/ARCHITECTURE.md](ARCHITECTURE.md) for architecture deep-dive and design decisions.
