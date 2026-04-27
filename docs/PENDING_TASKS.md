# CampusCloud — Pending Tasks

All tasks from Task 25 onward are pending. Completed tasks are tracked in [PROJECT_TRACKER.md](PROJECT_TRACKER.md) Section 6.

**Last reviewed:** 2026-04-27

---

## Summary

| # | Task | Area | Effort | Priority |
|---|---|---|---|---|
| 25 | [Frontend Teacher Module](#task-25--frontend-teacher-module) | Frontend | Medium | High |
| 26 | [Frontend Academic Module](#task-26--frontend-academic-module) | Frontend | Medium | High |
| 27 | [Frontend UX Hardening](#task-27--frontend-ux-hardening) | Frontend | Medium | Medium |
| 28 | [Ownership-Aware Authorization](#task-28--ownership-aware-authorization) | Backend | High | High |
| 29 | [Security Error Response Consistency](#task-29--security-error-response-consistency) | Backend | Medium | Medium |
| 30 | [Audit Logging](#task-30--audit-logging) | Backend | Medium | Medium |
| 31 | [Soft Delete](#task-31--soft-delete) | Backend | Medium | Medium |
| 32 | [API Versioning Strategy](#task-32--api-versioning-strategy) | Backend | Low | Low |
| 33 | [Integration Tests](#task-33--integration-tests) | Testing | High | High |
| 34 | [Student Self-Registration Flow](#task-34--student-self-registration-flow) | Backend + Frontend | High | High |

---

## Task 25 — Frontend Teacher Module

**Area:** Frontend | **Effort:** Medium | **Priority:** High | **Status:** Not Started

**Goal:** Build the teacher list and create flow in the React SPA, mirroring the completed student module architecture.

**Subtasks:**
- [ ] Create `src/features/teacher/teacherApi.ts` — list, getById, create calls using `axiosClient`
- [ ] Create `src/features/teacher/types.ts` — `TeacherRequest` and `TeacherResponse` records matching backend DTOs
- [ ] Build `TeacherListPage.tsx` — paginated table with TanStack Query `useQuery`, reuse `DataTable`
- [ ] Build `TeacherCreatePage.tsx` — form with `employeeNo`, `firstName`, `lastName`, `email`, `phone`, `hireDate`; `useMutation` on submit
- [ ] Wire routes in `routes.tsx` — `/teachers` and `/teachers/new`
- [ ] Add navigation link in `DashboardLayout.tsx`

**Backend contract:**
- `GET /api/v1/teachers?page=0&size=20` — paginated `TeacherResponse`
- `POST /api/v1/teachers` — body: `{ employeeNo, firstName, lastName, email, phone?, hireDate? }`
- `GET /api/v1/teachers/{id}`
- Required role: `SCHOOL_ADMIN` (write), `TEACHER` (read)
- `employeeNo` stored UPPERCASE; `email` stored lowercase; both must be unique

**Files to create/modify:**
```
frontend/src/features/teacher/
  teacherApi.ts
  types.ts
  TeacherListPage.tsx
  TeacherCreatePage.tsx
frontend/src/app/routes.tsx        (add /teachers routes)
frontend/src/components/layout/DashboardLayout.tsx  (add nav link)
```

---

## Task 26 — Frontend Academic Module

**Area:** Frontend | **Effort:** Medium | **Priority:** High | **Status:** Not Started

**Goal:** Implement classes, subjects, and sections list + create flows under the `/academic` route.

**Subtasks:**
- [ ] Create `src/features/academic/academicApi.ts` — separate API calls for classes, subjects, sections
- [ ] Create `src/features/academic/types.ts` — `SchoolClassResponse`, `SubjectResponse`, `SectionResponse` + request types
- [ ] Build `AcademicPage.tsx` — tabbed layout with three tabs: Classes | Subjects | Sections
- [ ] Build create modal/drawer for each sub-resource
- [ ] Wire `/academic` route in `routes.tsx`

**Backend contract:**
- `GET /api/v1/academic/classes|subjects|sections` — list
- `POST /api/v1/academic/classes` — `{ name, code }`
- `POST /api/v1/academic/subjects` — `{ name, code }`
- `POST /api/v1/academic/sections` — `{ name, classId }`
- Required role: `SCHOOL_ADMIN` (write), `TEACHER` (read)
- `code` must be unique per entity

---

## Task 27 — Frontend UX Hardening

**Area:** Frontend | **Effort:** Medium | **Priority:** Medium | **Status:** Not Started

**Goal:** Harden the existing frontend with consistent error handling, loading states, and form validation.

**Subtasks:**
- [ ] Add a global toast notification system (react-hot-toast or similar) triggered on mutation success/error
- [ ] Add client-side form validation — required field checks + basic shape guards (email format, non-empty strings)
- [ ] Add button loading/disabled state during mutations (prevent double-submit)
- [ ] Add empty-state components to `DataTable` when no records are returned
- [ ] Add a global Axios response interceptor to handle `401` (auto logout + redirect to `/login`)
- [ ] Test all three complete flows: Student, Teacher, Academic end-to-end in the browser

---

## Task 28 — Ownership-Aware Authorization

**Area:** Backend | **Effort:** High | **Priority:** High | **Status:** Not Started

**Goal:** Allow `STUDENT` and `PARENT` roles to access their own data (exam results, fee assignments) without seeing other students' records.

**Subtasks:**
- [ ] Create `student_user_mapping` table in tenant schema: `(user_id UUID, student_id UUID, UNIQUE(user_id, student_id))`
- [ ] Add `StudentUserMappingRepository` + entity
- [ ] Extend `ExamService.getResultsByExam()` — if caller is STUDENT, filter to own results only
- [ ] Extend `FeesService.getFeeAssignmentsByStudent()` — if caller is PARENT/STUDENT, assert ownership before returning
- [ ] Add ownership check helper: `assertStudentOwnership(callerUserId, studentId)`
- [ ] Add service tests for ownership denial scenarios
- [ ] Add `POST /api/v1/students/{id}/link-user` endpoint for SCHOOL_ADMIN to map a student to a user

**Files to create/modify:**
```
src/main/java/com/campuscloud/student/
  entity/StudentUserMapping.java
  repository/StudentUserMappingRepository.java
src/main/java/com/campuscloud/exam/service/ExamServiceImpl.java
src/main/java/com/campuscloud/fees/service/FeesServiceImpl.java
src/main/java/com/campuscloud/tenant/TenantServiceImpl.java   (add table SQL)
src/test/java/com/campuscloud/exam/ExamServiceImplTest.java
src/test/java/com/campuscloud/fees/FeesServiceImplTest.java
```

---

## Task 29 — Security Error Response Consistency

**Area:** Backend | **Effort:** Medium | **Priority:** Medium | **Status:** Not Started

**Goal:** Make all `401` and `403` responses return the standard `ApiResponse` JSON format instead of Spring Security's default HTML/plain-text responses.

**Subtasks:**
- [ ] Implement `AuthenticationEntryPoint` returning `ApiResponse.error("Authentication required")` as JSON with HTTP 401
- [ ] Implement `AccessDeniedHandler` returning `ApiResponse.error("Access denied")` as JSON with HTTP 403
- [ ] Register both handlers in `SecurityConfig.exceptionHandling(...)`
- [ ] Add integration test verifying JSON response format on 401 and 403

**Files to create/modify:**
```
src/main/java/com/campuscloud/config/SecurityConfig.java
src/main/java/com/campuscloud/auth/handler/
  ApiAuthenticationEntryPoint.java
  ApiAccessDeniedHandler.java
```

---

## Task 30 — Audit Logging

**Area:** Backend | **Effort:** Medium | **Priority:** Medium | **Status:** Not Started

**Goal:** Track who created or last modified key records using Spring Data JPA auditing.

**Subtasks:**
- [ ] Add `@EnableJpaAuditing` to `SecurityConfig` (or new `AuditConfig`)
- [ ] Implement `AuditorAware<UUID>` — reads current user ID from `SecurityContextHolder`
- [ ] Add `@CreatedBy UUID createdByUserId` and `@LastModifiedDate Instant updatedAt` to `Student`, `Teacher`, `Exam`, `AttendanceRecord` entities
- [ ] Add corresponding columns to `CREATE TABLE` SQL in `TenantServiceImpl`
- [ ] Update response DTOs to include `createdByUserId` where relevant

---

## Task 31 — Soft Delete

**Area:** Backend | **Effort:** Medium | **Priority:** Medium | **Status:** Not Started

**Goal:** Never hard-delete records. Mark them deleted and exclude them from all queries.

**Subtasks:**
- [ ] Add `deleted_at TIMESTAMPTZ` column to `users`, `students`, `teachers` tables (via `TenantServiceImpl` + Flyway equivalent for existing tenants)
- [ ] Add `@Where(clause = "deleted_at IS NULL")` to entities (or use `Specification` queries)
- [ ] Add `DELETE /api/v1/students/{id}` — sets `deleted_at = now()`, does not remove the row
- [ ] Add `DELETE /api/v1/teachers/{id}` — same pattern
- [ ] Add `DELETE /api/v1/users/{id}` — same pattern
- [ ] Update unit tests to assert soft-deleted records are excluded from list results
- [ ] Minimum role for all DELETE endpoints: `SCHOOL_ADMIN`

---

## Task 32 — API Versioning Strategy

**Area:** Backend | **Effort:** Low | **Priority:** Low | **Status:** Not Started

**Goal:** Formalise the versioning approach so future breaking changes are handled cleanly.

**Subtasks:**
- [ ] Document that the current `/api/v1/` prefix is the official v1 contract — no changes to existing endpoints
- [ ] Add `@ApiVersion` annotation or `RequestMappingHandlerMapping` config for path-based routing to support future `/api/v2/` endpoints without breaking v1 consumers
- [ ] Update `SwaggerConfig` to group v1 endpoints under `v1` tag group
- [ ] Add version header `X-API-Version: 1` to all responses via a `ResponseAdvice`

---

## Task 33 — Integration Tests

**Area:** Testing | **Effort:** High | **Priority:** High | **Status:** Not Started

**Goal:** Add `@SpringBootTest` + Testcontainers integration tests that cover full request-response cycles.

**Subtasks:**
- [ ] Add `testcontainers-postgresql` dependency to `pom.xml`
- [ ] Create `AbstractIntegrationTest` base class — starts PostgreSQL container, runs Flyway, bootstraps test tenant
- [ ] Test: `POST /api/v1/tenants` → schema provisioned → `GET /api/v1/tenants/{id}` returns correct data
- [ ] Test: Full fee payment reconciliation — assign fee → partial payment → full payment → status = PAID
- [ ] Test: Exam marks overflow — `POST /api/v1/exams/results` with `marksObtained > maxMarks` returns 400
- [ ] Test: Duplicate attendance guard — second `POST /api/v1/attendance` for same student/date returns 400
- [ ] Test: JWT 401 — request without token returns 401 in `ApiResponse` format (after Task 29)
- [ ] Update `ci.yml` to run `mvn verify` (integration tests run in `failsafe` phase)

**Files to create:**
```
src/test/java/com/campuscloud/
  AbstractIntegrationTest.java
  tenant/TenantProvisioningIT.java
  fees/FeeReconciliationIT.java
  exam/ExamResultIT.java
  attendance/AttendanceDuplicateIT.java
```

---

## Task 34 — Student Self-Registration Flow

**Area:** Backend + Frontend | **Effort:** High | **Priority:** High | **Status:** Not Started

**Goal:** Allow a school admin to generate a one-time invite token for a student account, and let the student set their password via a secure link.

**Subtasks:**

*Backend:*
- [ ] Create `invite_tokens` table: `(id UUID, user_id UUID, token VARCHAR(64), expires_at TIMESTAMPTZ, used BOOLEAN DEFAULT FALSE)`
- [ ] Add `POST /api/v1/users/{id}/invite` (SCHOOL_ADMIN) — generates a random 64-char token, stores it, returns the token
- [ ] Add `POST /api/v1/auth/activate` (public) — accepts `{ token, newPassword }`, validates token not expired/used, sets password, marks token used
- [ ] Add expiry: tokens valid for 72 hours
- [ ] Add service tests for: expired token rejection, already-used token rejection, successful activation

*Frontend:*
- [ ] Create `/activate?token=<token>` public route — displays password-set form
- [ ] On submit: call `POST /api/v1/auth/activate`, redirect to `/login` on success
- [ ] Add "Send Invite" button to `TeacherListPage` / user detail page for SCHOOL_ADMIN role

**Files to create/modify:**
```
Backend:
  com.campuscloud.auth.controller.AuthController    (new endpoint)
  com.campuscloud.auth.service.InviteService        (new)
  com.campuscloud.tenant.TenantServiceImpl           (add invite_tokens table SQL)
Frontend:
  frontend/src/features/auth/ActivatePage.tsx
  frontend/src/app/routes.tsx                        (add /activate route)
```

---

## How to Pick Up a Task

1. Read the task section above for full subtask breakdown.
2. Read [docs/ARCHITECTURE.md](ARCHITECTURE.md) — especially the new-module checklist.
3. Read [docs/PROJECT_TRACKER.md](PROJECT_TRACKER.md) Section 9 ("Notes for Future AI") before writing any code.
4. Mark the task `IN_PROGRESS` in PROJECT_TRACKER.md Section 5.
5. After completion: update Sections 5, 6, 7, 8 in PROJECT_TRACKER.md and update the status in this file.

---

> Completed task log: [PROJECT_TRACKER.md](PROJECT_TRACKER.md) — Section 6
> API contracts for all endpoints: [API.md](API.md)
> Architecture + conventions: [ARCHITECTURE.md](ARCHITECTURE.md)
