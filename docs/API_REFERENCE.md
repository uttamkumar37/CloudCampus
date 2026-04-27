# CampusCloud — API Reference

> Quick-reference table of all REST endpoints. For full request/response details see [API.md](./API.md).

**Base URL:** `http://localhost:8080/api/v1`

---

## Authentication

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/auth/login` | Login and get JWT token | No | Optional* | All |
| GET | `/auth/me` | Get current user profile | Yes | Yes | All |

> *Omit `X-Tenant-ID` for Super Admin login. Include it for tenant user login.

---

## Tenant Management

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/tenants` | Create new school tenant | Yes | No | SUPER_ADMIN |
| GET | `/tenants` | List all tenants | Yes | No | SUPER_ADMIN |
| GET | `/tenants/{tenantId}` | Get tenant by business ID | Yes | No | SUPER_ADMIN |

---

## User Management

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/users` | Create staff user account | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| GET | `/users` | List users (paginated) | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |

---

## Students

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/students` | Enroll new student | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/students` | List students (paginated) | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/students/{id}` | Get student by UUID | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |

---

## Teachers

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/teachers` | Create teacher record | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| GET | `/teachers` | List teachers (paginated) | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/teachers/{id}` | Get teacher by UUID | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |

---

## Academic (Classes, Subjects, Sections)

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/academics/classes` | Create class | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| GET | `/academics/classes` | List all classes | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| POST | `/academics/subjects` | Create subject | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| GET | `/academics/subjects` | List all subjects | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| POST | `/academics/sections` | Create section | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| GET | `/academics/sections` | List all sections | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |

---

## Attendance

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/attendances` | Mark student attendance | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/attendances/{id}` | Get attendance record | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT |
| GET | `/attendances?date=YYYY-MM-DD` | List attendance by date | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT |

---

## Fees

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/fees/assignments` | Assign fee to student | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| POST | `/fees/payments` | Record fee payment | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| GET | `/fees/students/{studentId}/assignments` | Get student fee history | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT |

---

## Exams

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/exams` | Schedule exam | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/exams/classes/{classId}` | Get exams for class | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT |
| POST | `/exams/results` | Enter exam result | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/exams/{examId}/results` | Get results for exam | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT |

---

## Homework

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/homework` | Create homework assignment | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/homework/classes/{classId}` | Get homework for class | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT |

---

## Timetable

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/timetable/slots` | Create timetable slot | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER |
| GET | `/timetable/classes/{classId}/sections/{sectionId}` | Get timetable | Yes | Yes | All authenticated |

---

## Parent Portal

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| GET | `/parents/me/children` | Get linked children | Yes | Yes | PARENT |

---

## Dashboard

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| GET | `/dashboard/tenant-summary` | Tenant KPI summary | Yes | Yes | All authenticated |
| GET | `/dashboard/branding` | Tenant branding info | Yes | Yes | All authenticated |
| GET | `/dashboard/super-admin-summary` | Platform-wide stats | Yes | No | SUPER_ADMIN |

---

## Bulk Upload

| Method | Endpoint | Description | Auth | X-Tenant-ID | Roles |
|--------|----------|-------------|------|-------------|-------|
| POST | `/bulk/upload` | Upload Excel (.xlsx) file | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |
| GET | `/bulk/sample` | Download Excel template | Yes | Yes | SUPER_ADMIN, SCHOOL_ADMIN |

---

## Key Enum Values

### User Roles

| Value | Description |
|-------|-------------|
| `SUPER_ADMIN` | Platform-level administrator (manages all tenants) |
| `SCHOOL_ADMIN` | School-level administrator (manages own school) |
| `TEACHER` | Teacher (marks attendance, enters results, assigns homework) |
| `STUDENT` | Student (read-only: own data, homework, timetable) |
| `PARENT` | Parent (view linked child's data and fee status) |

### Attendance Status

| Value | Description |
|-------|-------------|
| `PRESENT` | Student was present |
| `ABSENT` | Student was absent |
| `LATE` | Student arrived late |
| `EXCUSED` | Excused absence |

### Fee Assignment Status

| Value | Description |
|-------|-------------|
| `PENDING` | No payments recorded yet |
| `PARTIALLY_PAID` | Some payment made, balance remains |
| `PAID` | Fully paid |
| `OVERDUE` | Past due date with unpaid balance |

### Gender

| Value |
|-------|
| `MALE` |
| `FEMALE` |
| `OTHER` |

### Day of Week (Timetable)

| Value | Day |
|-------|-----|
| `1` | Monday |
| `2` | Tuesday |
| `3` | Wednesday |
| `4` | Thursday |
| `5` | Friday |
| `6` | Saturday |
| `7` | Sunday |

---

## Pagination Query Parameters

All paginated endpoints (`GET /students`, `GET /teachers`, `GET /users`) accept:

| Parameter | Type | Default | Example |
|-----------|------|---------|---------|
| `page` | int | `0` | `page=2` |
| `size` | int | `20` | `size=50` |
| `sort` | string | varies | `sort=lastName,asc` |

---

## Interactive Documentation

Swagger UI is available when the backend is running:

```
http://localhost:8080/swagger-ui.html
```
