# CampusCloud — Pending Tasks

> Last Updated: 2026-04-28 | See [PROJECT_TRACKER.md](./PROJECT_TRACKER.md) for completed work.

---

## Priority Legend

| Icon | Meaning |
|------|---------|
| 🔴 | High Priority |
| 🟡 | Medium Priority |
| 🟢 | Low Priority |

---

## ⚠️ In Progress

### Task 30 — Frontend: Teacher Module

**Module:** `frontend/src/features/teacher/`
**Priority:** 🔴 High
**Status:** API and hooks scaffolded; UI pages incomplete

**What needs to be done:**
- [ ] `TeachersPage.tsx` — table with pagination, column definitions
- [ ] `TeacherForm.tsx` — create teacher form with validation
- [ ] Wire form to `useCreateTeacher` mutation hook
- [ ] Display success/error toast notifications

**Backend ready:** ✅ `POST /teachers`, `GET /teachers`, `GET /teachers/{id}`

---

### Task 31 — Frontend: Academic Module

**Module:** `frontend/src/features/academic/`
**Priority:** 🔴 High
**Status:** Tabbed page scaffolded; class/subject/section forms not complete

**What needs to be done:**
- [ ] Classes tab — table + create form
- [ ] Subjects tab — table + create form
- [ ] Sections tab — table + create form (with class dropdown)
- [ ] Shared `academicApi.ts` functions for all three resources

**Backend ready:** ✅ All six academic endpoints

---

### Task 32 — Frontend UX Hardening

**Module:** All frontend features
**Priority:** 🔴 High
**Status:** Partial — some pages lack error states and loading indicators

**What needs to be done:**
- [ ] Add error boundary components for graceful failure
- [ ] Show loading spinners on all data fetching operations
- [ ] Display field-level validation messages from server (400 errors)
- [ ] Confirm dialogs for destructive actions
- [ ] Handle expired JWT gracefully (auto-logout and redirect to `/login`)
- [ ] Implement toast notifications consistently across all mutations

---

## ❌ Pending (Not Started)

### Task 33 — Frontend: Attendance Module

**Module:** `frontend/src/features/attendance/`
**Priority:** 🔴 High

**What needs to be done:**
- [ ] `AttendancePage.tsx` — date picker + class/section selector
- [ ] Student list with status selector (PRESENT / ABSENT / LATE / EXCUSED)
- [ ] Bulk mark attendance for a class (mark all at once)
- [ ] Attendance report view (filter by student or date range)
- [ ] `attendanceApi.ts` — POST + GET implementations
- [ ] `useMarkAttendance`, `useAttendanceByDate` hooks

**Backend ready:** ✅ `POST /attendances`, `GET /attendances/{id}`, `GET /attendances?date=`

---

### Task 34 — Frontend: Fees Module

**Module:** `frontend/src/features/fees/`
**Priority:** 🔴 High

**What needs to be done:**
- [ ] Fee assignment form (student selector, title, amount, due date)
- [ ] Fee list per student with status badge (PENDING / PARTIALLY_PAID / PAID / OVERDUE)
- [ ] Record payment form (amount, method, reference number)
- [ ] Payment history view
- [ ] `feesApi.ts` — all three fee endpoints
- [ ] `useFeeAssignments`, `useRecordPayment` hooks

**Backend ready:** ✅ `POST /fees/assignments`, `POST /fees/payments`, `GET /fees/students/{id}/assignments`

---

### Task 35 — Frontend: Marks / Exams Module

**Module:** `frontend/src/features/marks/`
**Priority:** 🔴 High

**What needs to be done:**
- [ ] Exam scheduling form (title, date, class, section, subject, max marks)
- [ ] Exam list per class
- [ ] Result entry form (student, marks, grade, remarks)
- [ ] Results table per exam
- [ ] `examApi.ts` — all four exam endpoints
- [ ] `useExams`, `useCreateExam`, `useExamResults`, `useCreateResult` hooks

**Backend ready:** ✅ `POST /exams`, `GET /exams/classes/{id}`, `POST /exams/results`, `GET /exams/{id}/results`

---

### Task 36 — Frontend: Homework Module

**Module:** `frontend/src/features/homework/`
**Priority:** 🟡 Medium

**What needs to be done:**
- [ ] Homework list per class (cards or table with title, due date)
- [ ] Create homework form (for TEACHER / ADMIN only)
- [ ] Due date highlighting (overdue in red)
- [ ] `homeworkApi.ts` — POST + GET
- [ ] `useHomework`, `useCreateHomework` hooks

**Backend ready:** ✅ `POST /homework`, `GET /homework/classes/{id}`

---

### Task 37 — Frontend: Timetable Module

**Module:** `frontend/src/features/timetable/`
**Priority:** 🟡 Medium

**What needs to be done:**
- [ ] Weekly grid view (7 columns for days, rows for time slots)
- [ ] Create timetable slot form (for ADMIN / TEACHER)
- [ ] Filter by class and section
- [ ] `timetableApi.ts` — POST + GET
- [ ] `useTimetable`, `useCreateSlot` hooks

**Backend ready:** ✅ `POST /timetable/slots`, `GET /timetable/classes/{id}/sections/{id}`

---

### Task 38 — Frontend: Parent Portal

**Module:** `frontend/src/features/parent/`
**Priority:** 🟡 Medium

**What needs to be done:**
- [ ] `MyChildrenPage.tsx` — list linked children with basic info
- [ ] Per-child view: fee status, attendance summary, recent results
- [ ] `parentApi.ts` — `GET /parents/me/children`
- [ ] `useMyChildren` hook

**Backend ready:** ✅ `GET /parents/me/children`

---

### Task 39 — Ownership-Aware Authorization (Backend)

**Module:** Backend Security
**Priority:** 🔴 High

**Problem:** Currently, a Student with a valid JWT can technically call `GET /fees/students/{anyStudentId}/assignments` and see another student's fees. The `@PreAuthorize` only checks role, not ownership.

**What needs to be done:**
- [ ] Add ownership check in `FeesServiceImpl`: if caller role is STUDENT, verify `studentId` matches JWT subject
- [ ] Apply similar ownership checks in `AttendanceService`, `ExamResultService`
- [ ] Consider a `@CurrentUser` annotation / argument resolver to inject authenticated user into service layer
- [ ] Add tests for ownership violation attempts

---

### Task 40 — Audit Logging

**Module:** Backend (all domain modules)
**Priority:** 🟡 Medium

**What needs to be done:**
- [ ] Add `created_by UUID` and `updated_by UUID` columns to domain tables
- [ ] Configure Spring Data JPA `@EnableJpaAuditing` with custom `AuditorAware<UUID>` that returns current user from JWT
- [ ] Add `@CreatedBy` and `@LastModifiedBy` annotations to entity fields
- [ ] Update Flyway migration scripts to add new columns

---

### Task 41 — Soft Delete

**Module:** Backend (Student, Teacher, User entities)
**Priority:** 🟡 Medium

**What needs to be done:**
- [ ] Add `deleted_at TIMESTAMPTZ` column to `students`, `teachers`, `users` tables
- [ ] Add Flyway migration for new columns
- [ ] Override repository queries to exclude `WHERE deleted_at IS NOT NULL`
- [ ] Replace hard delete with `deleted_at = now()` update
- [ ] Add `DELETE /students/{id}`, `DELETE /teachers/{id}` endpoints

---

### Task 42 — Integration Tests

**Module:** Testing
**Priority:** 🟡 Medium

**What needs to be done:**
- [ ] Add Testcontainers dependency to `pom.xml`
- [ ] Create `@SpringBootTest` base class with PostgreSQL container
- [ ] Write integration tests for tenant provisioning flow
- [ ] Write integration tests for student CRUD (full round-trip)
- [ ] Write integration tests for fee payment status transitions
- [ ] Add Maven Failsafe plugin for integration test lifecycle

---

### Task 43 — Frontend: Bulk Upload UI

**Module:** `frontend/src/features/bulk-upload/`
**Priority:** 🟢 Low

**What needs to be done:**
- [ ] File picker with `.xlsx` filter
- [ ] Upload progress indicator
- [ ] Result display (success count, error table with row/sheet/message)
- [ ] Download sample template button (`GET /bulk/sample`)
- [ ] `bulkApi.ts` — POST upload + GET sample

**Backend ready:** ✅ `POST /bulk/upload`, `GET /bulk/sample`
