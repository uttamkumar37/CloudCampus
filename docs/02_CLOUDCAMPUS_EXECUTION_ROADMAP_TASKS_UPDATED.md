# CloudCampus — Enterprise Execution Roadmap

**Purpose:** Divides the entire CloudCampus enterprise SaaS ERP vision into small, trackable, AI-friendly implementation tasks.

---

## Progress Summary (as of 2026-05-12 — E19 Homework Management complete)

| Metric | Count |
|--------|-------|
| **Total tasks** | 193 |
| **Completed** | 63 (32.6%) |
| **In Progress** | 0 |
| **Not Started** | 132 |

### E19 Completions — Homework Management (CC-0702)

| Task | What was built |
|------|---------------|
| CC-0702 ✅ | Homework management — `V32` migration (`homework_assignments` table: tenant/school/academic-year/class/section/subject/staff FKs, nullable section (class-wide), `status` CHECK DRAFT/PUBLISHED/CLOSED, `attachment_urls` TEXT, 5 indexes); `HomeworkStatus` enum; `HomeworkAssignment` entity (tenant-filtered @FilterDef/@Filter, factory, publish/close methods); `HomeworkRepository` (filtered paginated JPQL with optional class/section/status, by-school+id); `HomeworkCreateRequest`/`HomeworkStatusUpdateRequest`/`HomeworkResponse` DTOs; `HomeworkService`/`HomeworkServiceImpl` (create with optional immediate publish, paginated list, getById, updateStatus with lifecycle guards — PUBLISHED assignments cannot be deleted, DRAFT→PUBLISHED→CLOSED transitions); `HomeworkController` (POST/GET/GET:id/PATCH:status/DELETE); frontend: `homework.ts` types, `homeworkApi.ts` (create/list/get/updateStatus/delete), `HomeworkListPage` (cascading filters + overdue badge + status advance + draft delete), `HomeworkCreatePage` (full form with publish toggle, due-date min tomorrow); "Homework" nav item; 2 routes wired; **268 modules, 0 errors** |

### E18 Completions — Timetable Management (CC-0701)

| Task | What was built |
|------|---------------|
| CC-0701 ✅ | Timetable management — `V31` migration (`timetable_slots` table: tenant/school/academic-year/class/section/subject/staff FKs, `day_of_week` CHECK constraint MON–SAT, `period_number` 1–12, optional start/end times, UNIQUE per section+day+period, 4 indexes); `DayOfWeek` enum; `TimetableSlot` entity (tenant-filtered @FilterDef/@Filter, factory, @PrePersist/@PreUpdate); `TimetableRepository` (by-class+section, section conflict lookup, teacher conflict JPQL, by-school+id); `TimetableSlotCreateRequest`/`TimetableSlotResponse` DTOs; `TimetableService`/`TimetableServiceImpl` (addSlot with dual conflict detection — section double-booking + teacher double-booking, listSlots, deleteSlot); `TimetableController` (POST/GET/DELETE:/slotId); frontend: `timetable.ts` types, `timetableApi.ts`, `TimetablePage` (academic-year→class→section cascading filters, weekly Mon–Sat × Period 1–8 grid, inline Add Slot form with conflict error display, slot delete); "Timetable" nav item; route wired; **265 modules, 0 errors** |

### E16 Completions — Marks Entry System (CC-1102)

| Task | What was built |
|------|---------------|
| CC-1102 ✅ | Marks entry — `V29` migration (`student_marks` table: tenant/exam/paper/student FKs, nullable `marks_obtained`, `is_absent`, `remarks`, `entered_by`, UNIQUE per paper+student, 4 indexes); `StudentMark` entity (tenant-filtered @FilterDef/@Filter, factory, `update()` method); `StudentMarkRepository` (by-paper, by-exam+student, upsert lookup, cascading deletes); `BulkMarksEntryRequest`/`MarksEntryRequest`/`StudentMarkResponse` DTOs; `MarksService`/`MarksServiceImpl` (bulk upsert, list, update, delete; validates marks ≤ total; absent=0); `MarksController` (POST /bulk, GET, PUT /:markId, DELETE /:markId); frontend: `marks.ts` types, `marksApi.ts`, `MarksEntryPage` (spreadsheet grid — absent checkbox, pass/fail color coding, live stats bar, Save All); "Enter Marks" link per paper in ExamDetailPage; route wired; **259 modules, 0 errors** |

### E15 Completions — Examination System (CC-1101)

| Task | What was built |
|------|---------------|
| CC-1101 ✅ | Exam creation — `V27` migration (exams table + 5 indexes); `V28` migration (exam_subjects table + 4 indexes); `ExamType` enum (UNIT_TEST/TERM/HALF_YEARLY/ANNUAL/MOCK/PRACTICAL); `ExamStatus` enum (DRAFT/SCHEDULED/ONGOING/COMPLETED/CANCELLED); `Exam` entity (tenant-isolated `@FilterDef`/`@Filter`, factory, status-transition methods); `ExamSubject` entity (paper per class/subject/date, room, invigilator); `ExamRepository` + `ExamSubjectRepository`; `ExamService`/`ExamServiceImpl` (create with optional inline subjects, list with filter by academicYear/status, getById with subjects, updateStatus lifecycle guard, addSubject, removeSubject); `ExamController` (POST/GET/GET:id/PATCH:status/POST:subjects/DELETE:subjects); frontend: `ExamListPage` (status step-advance inline), `ExamCreatePage` (dynamic subject papers array), `ExamDetailPage` (stepper, inline add/remove papers); nav item + 3 routes wired; **257 modules, 0 errors** |

### E12–E14 Completions — Communication System (CC-1001–CC-1004)

| Task | What was built |
|------|---------------|
| CC-1001 ✅ | SMS notification baseline — `NotificationService`, `NotificationLog` entity (V25 migration), SMS stub dispatch, `GET /notification-logs` with pagination |
| CC-1002 ✅ | Email integration — JavaMailSender wired; `NotificationTemplateCode` enum; `TemplateRenderer`; `POST /notifications/send-email` (202 Accepted); MailHog in docker-compose dev |
| CC-1003 ✅ | Push notification system — Firebase Admin SDK (v9.3.0); `FirebaseConfig`/`FirebaseProperties` (`@ConditionalOnProperty`); `PushService`/`PushServiceImpl`; device token fan-out; auto-prune `UNREGISTERED` tokens; `POST /notifications/send-push` (202 Accepted) |
| CC-1004 ✅ | WhatsApp integration — `WhatsAppMessageLog` entity + `V26` migration; `WhatsAppService`/`WhatsAppServiceImpl` (async stub, E14 labeled, BSP-swappable); `POST /whatsapp/send` + `GET /whatsapp/logs`; frontend `NotificationLogPage` (3 tabs: log/email/push) + `WhatsAppPage` (2 tabs: log/send); nav items + routes wired; **253 modules, 0 errors** |

### E11 Completions — Finance & Fees (CC-0901, CC-0902, CC-0905)

| Task | What was built |
|------|---------------|
| CC-0901 ✅ | Fee structure engine — `FeeCategory`, `FeeStructure` entities; `V22` + `V23` migrations; `FeeCategoryRepository`, `FeeStructureRepository`; category + structure APIs under `/v1/school-admin/schools/{schoolId}/fee-*`; `FeeFrequency` enum (ANNUAL/TERM/MONTHLY/ONE_TIME) |
| CC-0902 ✅ | Fee collection — `StudentFeeRecord` entity + `V24` migration; `FeePaymentRepository`, `StudentFeeRecordRepository`; `FeeService`/`FeeServiceImpl`; `applyPayment()` auto-recalculates PENDING→PARTIAL→PAID; waive record API; batch-load enrichment avoids N+1 |
| CC-0905 ✅ | Receipt generation — `FeePayment` entity (immutable); receipt numbers `RCT-YYYY-NNNNNNN` (sequential per year prefix); `FeeReceiptResponse` DTO with nested payment lines; `GET /fee-records/{id}/receipt` |
| Frontend ✅ | 4 pages: `FeeStructureListPage`, `FeeStructureCreatePage`, `FeeCollectionPage`, `StudentFeeDetailPage`; `financeApi.ts` (11 fns); "Fees"+"Fee Collection" nav (FINANCE feature flag); router routes; `npm run build` → **249 modules, 0 errors** |

### E10 Completions — Attendance Frontend

| Task | What was built |
|------|---------------|
| CC-0801 frontend ✅ | 3 pages: `AttendanceSessionListPage`, `AttendanceCreateSessionPage`, `AttendanceMarkPage` (bulk mark PRESENT/ABSENT/LATE); `attendanceApi.ts`; router + nav; **244 modules** build |

### E9 Completions — Staff Frontend

| Task | What was built |
|------|---------------|
| CC-0602 frontend ✅ | 3 pages: `StaffListPage`, `StaffCreatePage` (react-hook-form + Zod), `StaffProfilePage`; `staffApi.ts`; router + nav; **240 modules** build |

### E8 Completions — Student Frontend

| Task | What was built |
|------|---------------|
| CC-0502 frontend ✅ | `StudentAdmitPage` — multi-section admission form (personal, contact, academic) + Zod validation |
| CC-0503 frontend ✅ | `StudentProfilePage` — full profile view with parent links, certificates section |
| CC-0504 frontend ✅ | `StudentListPage` — filterable/searchable table with class/section/status filters |

### E7 Completions — School Admin Frontend

| Task | What was built |
|------|---------------|
| CC-0002 ✅ | Frontend scaffold — React 19 + TypeScript + Vite + TanStack Router + Zustand + TanStack Query v5 + react-hook-form v7 + Zod v4 + Axios + TailwindCSS 4 |
| CC-0401 ✅ | `SchoolAdminDashboardPage` — stats cards + welcome banner |
| CC-0402 frontend ✅ | `AcademicYearListPage` — create + list academic years |
| CC-0403 frontend ✅ | `ClassListPage` — create + list classes |
| CC-0404 frontend ✅ | `SectionListPage` — create + list sections |
| CC-0405 frontend ✅ | `SubjectListPage` — create + list subjects |
| CC-0408 ✅ | `SchoolAdminLayout` — sidebar nav with `useFeatureFlag` hook driving visibility |

### E1–E6 Completions — Backend: Academic, Student, Staff, Attendance

| Task | What was built |
|------|---------------|
| CC-0402 ✅ | `AcademicYear` entity + `V11` migration; `AcademicYearService`/`AcademicYearController` |
| CC-0403 ✅ | `Class` entity + `V12` migration; service + controller |
| CC-0404 ✅ | `Section` entity + `V13` migration; service + controller |
| CC-0405 ✅ | `Subject` entity + `V14` migration; service + controller |
| CC-0406 ✅ | `Department` entity + `V15` migration; service + controller |
| CC-0501 ✅ | `Student` entity + `V17` migration; `StudentRepository`; tenant-filtered |
| CC-0502–0504 ✅ | Student admission, profile, listing APIs — `StudentService`/`StudentController` |
| CC-0506 ✅ | `StudentParentLink` entity + `V18` migration; parent mapping APIs |
| CC-0601 ✅ | `Staff` entity + `V19` migration; `StaffRepository`; tenant-filtered |
| CC-0602 ✅ | Staff profile APIs — `StaffService`/`StaffController` |
| CC-0801 ✅ | Attendance backend — `AttendanceSession`+`AttendanceRecord` entities; `V20`+`V21` migrations; `AttendanceService`/`AttendanceController`; lock session, bulk mark |
| CC-0805 ✅ | Attendance reports — `GET /schools/{id}/attendance` with date/class/section filters |
| B4–B6 ✅ | `V8__add_indexes.sql` (composite indexes), `V9__soft_delete.sql` (deleted_at), `V10__create_device_tokens.sql`, `V16__create_school_settings.sql` |

### Session 5 Completions (2026-05-12) — Phase B1, B2, B3 Complete

| Task | What was built |
|------|---------------|
| CC-0213 ✅ | `School` entity + `V6__create_schools.sql`; `SchoolRepository`, `SchoolStatus` enum; auto-created by `TenantServiceImpl` on tenant onboarding (code = "MAIN") |
| CC-0203 ✅ | Hibernate `@Filter` + `@FilterDef` tenant isolation — `TenantFilter` constants, `TenantFilterAspect` (`@Before` AOP on all `JpaRepository` methods); `@Filter` on `School`, `User`, `AuditLog`; `@ParamDef` type `UUID.class` for PostgreSQL |
| CC-0210 ✅ | Tenant isolation test suite — `TenantIsolationTest` (6 tests, Testcontainers PG16 + Redis7); Docker API 1.41 compat; all 6 tests **pass** |

### Session 4 Completions (2026-05-12) — Phase A Complete

| Task | What was built |
|------|---------------|
| CC-0103 ✅ | `POST /v1/auth/login` — `AuthController`, `AuthServiceImpl`; constant-time BCrypt dummy hash prevents user enumeration |
| CC-0104 ✅ | `POST /v1/auth/logout` — refresh token revocation via Redis delete |
| CC-0105 ✅ | Redis refresh token system + `POST /v1/auth/refresh` — opaque UUID tokens, 30-day TTL, rotation on every use |
| CC-1801 ✅ | Brute-force protection — `LoginRateLimiterService` (Redis sliding window), `TooManyRequestsException` (429), `RateLimitProperties` |
| CC-1802 ✅ | `AuditLogService` (`@Async("auditExecutor")`, `REQUIRES_NEW` tx) — `AuditLog` entity, `AuditAction` enum; wired for LOGIN_SUCCESS/FAILED/BLOCKED, LOGOUT, TOKEN_REFRESHED |
| CC-0113 ✅ | Full RBAC enforcement in `SecurityConfig` — `/v1/super-admin/**` → SUPER_ADMIN, `/v1/admin/**` → TENANT_ADMIN+, `/v1/school-admin/**` → SCHOOL_ADMIN+, `anyRequest().authenticated()` |
| CC-0114 ✅ | `JsonAuthEntryPoint` — JSON `ApiResponse` 401/403 for unauthenticated/unauthorized requests |

> Update these counts whenever task statuses change.

---

## Task Template (Standard Format)

```
CC-XXXX | Title | P0/P1/P2/P3 | STATUS
Depends on: CC-YYYY, CC-ZZZZ
Scope:
  - API endpoints:
  - UI screens:
  - DB entities/migrations:
Definition of Done:
  - Unit tests:
  - Integration tests:
  - Audit logs:
  - Metrics/alerts:
  - Tenant isolation verified:
Notes/Risks:
```

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| `NOT_STARTED` | Task not started |
| `PLANNED` | Planned for execution |
| `IN_PROGRESS` | Currently developing |
| `BLOCKED` | Waiting for dependency |
| `TESTING` | Under QA/testing |
| `COMPLETED` | Production ready |
| `OPTIMIZATION_PENDING` | Optimization required |
| `SCALING_PENDING` | Scaling improvements pending |
| `FUTURE_SCOPE` | Future roadmap |

---

## Priority Definitions

| Priority | Meaning |
|----------|---------|
| **P0** | Critical foundation — blocks everything else |
| **P1** | High importance — ships in current milestone |
| **P2** | Medium importance — ships in next milestone |
| **P3** | Optional / future enhancement |

---

## Execution Phases

| Phase | Domain |
|-------|--------|
| 1 | Foundation Architecture |
| 2 | Authentication & Security |
| 3 | Multi-Tenant Engine |
| 4 | Super Admin System |
| 5 | School Admin System |
| 6 | Student Management |
| 7 | Staff & HRMS |
| 8 | Academic Management |
| 9 | Attendance System |
| 10 | Finance & Fees |
| 11 | Communication System |
| 12 | Examination System |
| 13 | Online Learning |
| 14 | Mobile App APIs |
| 15 | Reporting & Analytics |
| 16 | Infrastructure & DevOps |
| 17 | AI & Automation |
| 18 | Performance Optimization |
| 19 | Security Hardening |
| 20 | Enterprise Scale Preparation |
| 21 | Website Builder & Digital Experience Platform |

---

## Phase 1 — Foundation Architecture

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0001 | Setup backend project structure | P0 | ✅ COMPLETED | Spring Boot 3.4.5, Java 21 |
| CC-0002 | Setup frontend architecture | P0 | ✅ COMPLETED | React 19 + TypeScript + Vite + TanStack Query v5 + Zustand + Zod v4 + TailwindCSS 4 |
| CC-0003 | Setup modular package structure | P0 | ✅ COMPLETED | `common/`, `tenant/`, `auth/`, `config/` packages |
| CC-0004 | Setup environment management | P0 | ✅ COMPLETED | `application.yml` + `application-dev.yml` with profile separation |
| CC-0005 | Setup logging framework | P0 | ✅ COMPLETED | `logback-spring.xml` — JSON async prod, readable dev |
| CC-0006 | Setup exception handling system | P0 | ✅ COMPLETED | `RestExceptionHandler`, `ForbiddenException`, `ConflictException`, `TenantSuspendedException` |
| CC-0007 | Setup API response standardization | P0 | ✅ COMPLETED | `ApiResponse`, `ApiError`, `PageResponse` |
| CC-0008 | Setup DTO architecture | P0 | ✅ COMPLETED | Request/response DTO separation per module |
| CC-0009 | Setup validation framework | P0 | ✅ COMPLETED | `@Pattern`, `@Size`, `@NotBlank` on all DTOs |
| CC-0010 | Setup configuration management | P0 | ✅ COMPLETED | `JwtProperties` (`@ConfigurationProperties`), `SecurityConfig` |
| CC-0011 | Setup tenant-aware architecture | P0 | ✅ COMPLETED | `TenantContextFilter`, `HeaderTenantResolver`, `RequestContext` (userId slot added, VThread docs) |
| CC-0012 | Setup feature flag architecture | P0 | ✅ COMPLETED | V3 migration + 13 seed features + `FeatureFlagService` + `@RequiresFeature` AOP + Redis cache + `useFeatureFlag` hook (frontend) |
| CC-0013 | API versioning + pagination standard | P0 | ✅ COMPLETED | `/v1/` URI versioning, `PageResponse<T>` with `page`/`size`/`totalElements`/`totalPages` |
| CC-0014 | Global error schema standardization | P0 | ✅ COMPLETED | `ApiError` with `correlationId`, `status`, `code`, `message`, `timestamp` |
| CC-0015 | Request correlation IDs + structured logs | P0 | ✅ COMPLETED | `CorrelationIdFilter` with sanitization (`^[a-zA-Z0-9\-]{1,64}$`), MDC propagation |
| CC-0016 | Health/readiness endpoints + probes | P0 | ✅ COMPLETED | `/actuator/health/liveness`, `/actuator/health/readiness` |
| CC-0017 | Observability baseline (metrics + tracing) | P0 | 🔄 IN_PROGRESS | Prometheus + Micrometer done; OpenTelemetry tracing + Grafana dashboards pending |
| CC-0018 | DB migrations strategy (Flyway/Liquibase) | P0 | ✅ COMPLETED | Flyway 10 with `flyway-database-postgresql`; V1–V5 migrations applied |
| CC-0019 | Seed data + template bootstrapping | P1 | NOT_STARTED | — |

---

## Phase 2 — Authentication & Security

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0101 | User entity creation | P0 | ✅ COMPLETED | `User.java`, `UserRole` (7 roles), `UserStatus`, `UserRepository`; V5 migration |
| CC-0102 | JWT authentication setup | P0 | ✅ COMPLETED | `JwtUtil` + `JwtProperties` + `JwtAuthenticationFilter` done; filter registered in `SecurityConfig`; `SecurityContext` + `RequestContext` fully populated on valid token |
| CC-0103 | Login API | P0 | ✅ COMPLETED | `AuthController` + `AuthServiceImpl`; constant-time BCrypt dummy hash prevents user enumeration; returns `LoginResponse` with access + refresh tokens |
| CC-0104 | Logout API | P0 | ✅ COMPLETED | `POST /v1/auth/logout` — Redis refresh token delete; no-op if already expired |
| CC-0105 | Refresh token system | P0 | ✅ COMPLETED | `POST /v1/auth/refresh` — opaque UUID tokens stored in Redis (`rt:{uuid}` → userId), 30-day TTL, rotated on every use |
| CC-0106 | Password encryption | P0 | ✅ COMPLETED | `BCryptPasswordEncoder(12)` bean in `SecurityConfig`; `SuperAdminBootstrap` uses it |
| CC-0107 | Forgot password flow | P1 | NOT_STARTED | Depends on CC-0103, CC-1002 (email) |
| CC-0108 | OTP verification | P1 | NOT_STARTED | Redis-backed OTP with TTL |
| CC-0109 | Session management | P1 | NOT_STARTED | Stateless JWT; Redis for active token tracking |
| CC-0110 | Device tracking | P1 | NOT_STARTED | Device fingerprint + session binding |
| CC-0111 | Multi-device login control | P2 | NOT_STARTED | — |
| CC-0112 | Login audit logs | P1 | ✅ COMPLETED | `AuditLogService` (`@Async("auditExecutor")`) + `AuditLog` entity + `AuditAction` enum + `AuditLogRepository`; `AsyncConfig` named thread pool; wired for LOGIN_SUCCESS, LOGIN_FAILED, LOGIN_BLOCKED, LOGOUT, TOKEN_REFRESHED |
| CC-0113 | Role-based authorization | P0 | ✅ COMPLETED | `SecurityConfig` matchers — `/v1/super-admin/**` (SUPER_ADMIN), `/v1/admin/**` (TENANT_ADMIN+), `/v1/school-admin/**` (SCHOOL_ADMIN+), `anyRequest().authenticated()` |
| CC-0114 | Permission middleware | P0 | ✅ COMPLETED | `JsonAuthEntryPoint` — JSON `ApiResponse` 401/403 for Spring Security rejections |
| CC-0115 | API security middleware | P0 | NOT_STARTED | Depends on CC-0102, CC-0114 |
| CC-0116 | Password policy + account lockout | P1 | 🔄 IN_PROGRESS | `LoginRateLimiterService` (Redis sliding window, 429) + `RateLimitProperties` done (A4); full account lockout (N-strikes suspend) + complexity rules pending |
| CC-0117 | Session revocation strategy | P1 | NOT_STARTED | Redis token blacklist or JTI revocation |
| CC-0118 | Security headers + CORS policy | P1 | ✅ COMPLETED | `SecurityHeadersFilter` (7 headers), `SecurityConfig` CORS with origin allowlist |

---

## Phase 3 — Multi-Tenant Engine

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0201 | Tenant entity design | P0 | ✅ COMPLETED | `Tenant.java` with `updatedAt`, immutable `code`, `@PrePersist`/`@PreUpdate` |
| CC-0202 | Tenant resolver middleware | P0 | ✅ COMPLETED | `HeaderTenantResolver`, `TenantContextFilter`, `RequestContext` |
| CC-0203 | Tenant-aware database filters | P0 | ✅ COMPLETED | `TenantFilter` constants + `TenantFilterAspect` (`@Before` AOP); `@Filter`+`@FilterDef(UUID)` on `User`, `School`, `AuditLog`; `@FilterDef` declared once on `User` (Hibernate 6 constraint) |
| CC-0204 | Tenant onboarding flow | P0 | 🔄 IN_PROGRESS | `SuperAdminTenantController` + `TenantServiceImpl` done; full onboarding wizard + validation pending |
| CC-0205 | Tenant suspension system | P1 | NOT_STARTED | `TenantSuspendedException` created; suspension API + enforcement pending |
| CC-0206 | Tenant branding engine | P1 | NOT_STARTED | — |
| CC-0207 | Tenant configuration engine | P0 | NOT_STARTED | — |
| CC-0208 | Tenant theme management | P2 | NOT_STARTED | — |
| CC-0209 | Tenant feature mapping | P0 | 🔄 IN_PROGRESS | `tenant_features` table (V3) + 13 seed features done; feature toggle API + service layer pending |
| CC-0210 | Tenant isolation automated test suite | P0 | ✅ COMPLETED | `TenantIsolationTest` — 6 Testcontainers tests (PostgreSQL 16 + Redis 7); all pass; `findByIdFiltered()` JPQL added to `SchoolRepository` |
| CC-0211 | Tenant-aware seed data (roles/menus) | P1 | NOT_STARTED | — |
| CC-0212 | Custom domain verification workflow | P2 | NOT_STARTED | DNS verification + SSL provisioning |
| CC-0213 | School/Campus entity design (multi-school ready) | P1 | ✅ COMPLETED | `School` entity + `V6__create_schools.sql`; `SchoolRepository`; auto-created by `TenantServiceImpl` on onboarding |
| CC-0214 | Cross-school access model (within tenant) | P1 | NOT_STARTED | Depends on CC-0213 |

---

## Phase 4 — Super Admin System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0301 | Super admin dashboard | P0 | NOT_STARTED | — |
| CC-0302 | Tenant listing page | P0 | NOT_STARTED | — |
| CC-0303 | Tenant profile management | P0 | NOT_STARTED | — |
| CC-0304 | Tenant create wizard | P0 | NOT_STARTED | — |
| CC-0305 | Tenant feature access UI | P0 | NOT_STARTED | — |
| CC-0306 | Feature catalog engine | P0 | NOT_STARTED | — |
| CC-0307 | Feature dependency engine | P0 | NOT_STARTED | — |
| CC-0308 | Subscription management UI | P1 | NOT_STARTED | — |
| CC-0309 | Tenant analytics dashboard | P1 | NOT_STARTED | — |
| CC-0310 | Global monitoring dashboard | P2 | NOT_STARTED | — |
| CC-0311 | Tenant merge/migration admin tool | P2 | NOT_STARTED | — |
| CC-0312 | Usage metering + limit enforcement | P1 | NOT_STARTED | — |

---

## Phase 5 — School Admin System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0401 | School dashboard | P0 | ✅ COMPLETED | `SchoolAdminDashboardPage` — stats cards + welcome banner |
| CC-0402 | Academic year management | P0 | ✅ COMPLETED | Backend + frontend: `AcademicYear` entity, V11 migration, service, controller, `AcademicYearListPage` |
| CC-0403 | Class management | P0 | ✅ COMPLETED | Backend + frontend: `Class` entity, V12, `ClassListPage` |
| CC-0404 | Section management | P0 | ✅ COMPLETED | Backend + frontend: `Section` entity, V13, `SectionListPage` |
| CC-0405 | Subject management | P0 | ✅ COMPLETED | Backend + frontend: `Subject` entity, V14, `SubjectListPage` |
| CC-0406 | Department management | P1 | ✅ COMPLETED | `Department` entity, V15, service, controller |
| CC-0407 | School settings module | P1 | 🔄 IN_PROGRESS | V16 schema done; full settings management UI pending |
| CC-0408 | Dynamic menu rendering | P0 | ✅ COMPLETED | `SchoolAdminLayout` with `useFeatureFlag` hook — feature-flag-driven sidebar nav |

---

## Phase 6 — Student Management

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0501 | Student entity | P0 | ✅ COMPLETED | `Student` entity + V17 migration; `StudentRepository`; tenant-filtered |
| CC-0502 | Student admission form | P0 | ✅ COMPLETED | Backend API + `StudentAdmitPage` (multi-section form, Zod validation) |
| CC-0503 | Student profile page | P0 | ✅ COMPLETED | Backend API + `StudentProfilePage` (profile view, parent links) |
| CC-0504 | Student listing filters | P0 | ✅ COMPLETED | Backend API + `StudentListPage` (filterable/searchable by class/section/status) |
| CC-0505 | Student document upload | P1 | NOT_STARTED | — |
| CC-0506 | Parent mapping system | P1 | ✅ COMPLETED | `StudentParentLink` entity + V18 migration; parent mapping APIs |
| CC-0507 | Student ID generation | P1 | NOT_STARTED | — |
| CC-0508 | Bulk student import | P1 | NOT_STARTED | — |

---

## Phase 7 — Staff & HRMS

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0601 | Staff entity | P0 | ✅ COMPLETED | `Staff` entity + V19 migration; `StaffRepository`; tenant-filtered |
| CC-0602 | Teacher profile management | P0 | ✅ COMPLETED | Backend API + `StaffListPage`, `StaffCreatePage`, `StaffProfilePage` |
| CC-0603 | Staff attendance system | P1 | NOT_STARTED | — |
| CC-0604 | Leave management | P1 | NOT_STARTED | — |
| CC-0605 | Payroll engine | P2 | NOT_STARTED | — |

---

## Phase 8 — Academic Management

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0701 | Timetable management | P1 | ✅ COMPLETED | V31 migration; TimetableSlot entity; conflict detection; weekly grid frontend |
| CC-0702 | Homework management | P1 | ✅ COMPLETED | V32 migration; HomeworkAssignment entity; DRAFT→PUBLISHED→CLOSED lifecycle; list + create pages |
| CC-0703 | Assignment engine | P1 | NOT_STARTED | — |
| CC-0704 | Lesson planning | P2 | NOT_STARTED | — |

---

## Phase 9 — Attendance System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0801 | Manual attendance | P0 | ✅ COMPLETED | Backend: `AttendanceSession`+`AttendanceRecord` entities, V20+V21 migrations, `AttendanceService`/`AttendanceController`; Frontend: session list, create session, mark attendance (PRESENT/ABSENT/LATE) |
| CC-0802 | QR attendance | P1 | NOT_STARTED | — |
| CC-0803 | GPS attendance | P2 | NOT_STARTED | — |
| CC-0804 | Biometric integration | P2 | NOT_STARTED | — |
| CC-0805 | Attendance reports | P1 | ✅ COMPLETED | `GET /schools/{id}/attendance` with date/class/section/status filters |

---

## Phase 10 — Finance & Fees

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0901 | Fee structure engine | P0 | ✅ COMPLETED | `FeeCategory`+`FeeStructure` entities; V22+V23 migrations; category + structure APIs; `FeeFrequency` enum; `FeeStructureListPage`+`FeeStructureCreatePage` |
| CC-0902 | Fee collection module | P0 | ✅ COMPLETED | `StudentFeeRecord` entity; V24 migration; `FeeServiceImpl` with `applyPayment()` auto-status; waive record; `FeeCollectionPage` with summary cards |
| CC-0903 | Online payment integration | P1 | NOT_STARTED | — |
| CC-0904 | Invoice generation | P1 | NOT_STARTED | — |
| CC-0905 | Receipt generation | P1 | ✅ COMPLETED | `FeePayment` entity; `RCT-YYYY-NNNNNNN` receipt numbers; `FeeReceiptResponse`; `StudentFeeDetailPage` with payment history |

---

## Phase 11 — Communication System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1001 | SMS integration | P1 | ✅ COMPLETED | SMS stub + `NotificationLog` entity (V25); `NotificationService`/`NotificationServiceImpl`; async REQUIRES_NEW tx |
| CC-1002 | Email integration | P1 | ✅ COMPLETED | JavaMailSender; `TemplateRenderer`; `NotificationTemplateCode` enum; send-email endpoint; MailHog dev |
| CC-1003 | Push notification system | P1 | ✅ COMPLETED | Firebase Admin SDK 9.3.0; `FirebaseConfig` (conditional); `PushService`; device token fan-out; auto-prune |
| CC-1004 | WhatsApp integration | P2 | ✅ COMPLETED | `WhatsAppMessageLog` (V26); async stub; send + log APIs; full frontend pages wired |

---

## Phase 12 — Examination System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1101 | Exam creation | P1 | ✅ COMPLETED | V27+V28 migrations; Exam+ExamSubject entities; service; controller; 3 frontend pages |
| CC-1102 | Marks entry system | P1 | ✅ COMPLETED | V29 migration; StudentMark entity; bulk upsert service; 4 endpoints; MarksEntryPage grid |
| CC-1103 | Result generation | P1 | DONE | V30 migration, ExamResult entity, ResultService, ResultController (generate/list/detail) |
| CC-1104 | Report card generation | P1 | DONE | ReportCardPage (per-subject breakdown, print support), ResultsPage ranked table, resultApi |

---

## Phase 13 — Online Learning

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1201 | Online classes | P2 | NOT_STARTED | — |
| CC-1202 | Video upload system | P2 | NOT_STARTED | MinIO available in dev |
| CC-1203 | Assignment submissions | P2 | NOT_STARTED | — |

---

## Phase 14 — Mobile App APIs

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1301 | Student app APIs | P1 | NOT_STARTED | — |
| CC-1302 | Parent app APIs | P1 | NOT_STARTED | — |
| CC-1303 | Teacher app APIs | P1 | NOT_STARTED | — |

---

## Phase 15 — Reporting & Analytics

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1401 | Attendance reports | P1 | NOT_STARTED | — |
| CC-1402 | Fee reports | P1 | NOT_STARTED | — |
| CC-1403 | Student performance reports | P1 | NOT_STARTED | — |
| CC-1404 | Cross-school comparison dashboards (within tenant) | P2 | NOT_STARTED | — |
| CC-1405 | Super Admin anonymized benchmarking (optional) | P3 | NOT_STARTED | — |

---

## Phase 16 — Infrastructure & DevOps

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1501 | Docker setup | P0 | ✅ COMPLETED | `docker-compose.yml` — PostgreSQL 16, Redis 7, MinIO, MailHog with health checks |
| CC-1502 | CI/CD pipeline | P1 | NOT_STARTED | — |
| CC-1503 | Redis integration | P1 | 🔄 IN_PROGRESS | Spring Data Redis dependency + `application.yml` config done; `RedisTemplate` usage pending |
| CC-1504 | Queue integration | P1 | NOT_STARTED | RabbitMQ planned |

---

## Phase 17 — AI & Automation

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1600 | AI gateway service (provider abstraction + routing) | P0 | NOT_STARTED | — |
| CC-1601 | Prompt & policy registry (versioning + rollout + rollback) | P0 | NOT_STARTED | — |
| CC-1602 | Embeddings + vector store integration | P0 | NOT_STARTED | — |
| CC-1603 | Tenant knowledge base (RAG ingestion + retrieval) | P1 | NOT_STARTED | — |
| CC-1604 | AI audit logs + tracing + usage analytics | P1 | NOT_STARTED | — |
| CC-1605 | AI usage metering + budgets + plan limits | P1 | NOT_STARTED | — |
| CC-1606 | AI evaluation dataset + regression checks per module | P1 | NOT_STARTED | — |
| CC-1607 | ERP in-app AI copilot (admin/teacher/parent/student) | P2 | NOT_STARTED | — |
| CC-1608 | AI analytics insights (attendance/fees/academics) | P2 | NOT_STARTED | — |
| CC-1609 | AI performance prediction | P3 | NOT_STARTED | — |

---

## Phase 18 — Performance Optimization

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1701 | Query optimization | P1 | NOT_STARTED | Slow query logging > 200ms already active |
| CC-1702 | API caching | P1 | NOT_STARTED | Redis configured; caching strategy pending |
| CC-1703 | Load testing | P1 | NOT_STARTED | — |
| CC-1704 | Stress testing | P1 | NOT_STARTED | — |
| CC-1705 | Caching strategy definition (what/where/TTL) | P1 | NOT_STARTED | — |

---

## Phase 19 — Security Hardening

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1801 | Rate limiting | P1 | ✅ COMPLETED | `LoginRateLimiterService` — Redis sliding window, 429 `TooManyRequestsException`, `RateLimitProperties` |
| CC-1802 | Security audit logging | P1 | ✅ COMPLETED | `AuditLogService` `@Async` writer wired for auth events; `AuditLog` entity + `AuditAction` enum |
| CC-1803 | Data encryption validation | P1 | NOT_STARTED | At-rest encryption for PII fields |
| CC-1804 | Tenant isolation verification | P0 | ✅ COMPLETED | `TenantIsolationTest` (6 tests, Testcontainers) — all pass |
| CC-1805 | Abuse prevention (throttles per tenant/user) | P1 | NOT_STARTED | — |
| CC-1806 | PII handling policy + retention | P1 | NOT_STARTED | GDPR/PDPA compliance |

---

## Phase 20 — Enterprise Scale Preparation

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1901 | Database partitioning | P1 | NOT_STARTED | Partition by `tenant_id` for large tables |
| CC-1902 | Read replica support | P1 | NOT_STARTED | — |
| CC-1903 | Horizontal scaling preparation | P2 | NOT_STARTED | — |
| CC-1904 | Backup automation | P1 | NOT_STARTED | — |
| CC-1905 | Backup/restore drill automation | P1 | NOT_STARTED | — |
| CC-1906 | Secrets management standard | P1 | NOT_STARTED | HashiCorp Vault or AWS Secrets Manager |

---

## Final Goal

> CloudCampus should become a **fully scalable enterprise-grade multi-tenant SaaS operating system** for educational institutions.

---

## Thin-Slice MVP Milestones

### M1 — Tenant Onboarding + Secure Access

- Tenant entity + resolver + tenant-aware DB filters (CC-0201, CC-0202, CC-0203)
- User + JWT + RBAC + permission middleware (CC-0101, CC-0102, CC-0113, CC-0114)
- Super Admin: create tenant + assign plan/features (CC-0304, CC-0305)

### M2 — School Admin Basics

- Academic year + class/section/subject (CC-0402–CC-0405)
- Student entity + admission + listing (CC-0501–CC-0504)
- Basic dashboard (CC-0401)

### M3 — Operational Core

- Manual attendance + attendance report (CC-0801, CC-0805)
- Fee structure + collection + receipt (CC-0901, CC-0902, CC-0905)
- SMS/email notification baseline (CC-1001, CC-1002)

### M4 — Enterprise Guardrails

- Audit logs + observability + backups (CC-1802, CC-1904)
- Rate limiting + tenant isolation test suite (CC-1801, CC-0210)

---

## Phase 21 — Website Builder & Digital Experience Platform

### Core Architecture

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2001 | Setup website builder architecture | P0 | NOT_STARTED |
| CC-2002 | Create dynamic page engine | P0 | NOT_STARTED |
| CC-2003 | Create dynamic section engine | P0 | NOT_STARTED |
| CC-2004 | Create navigation builder | P1 | NOT_STARTED |
| CC-2005 | Create theme engine | P1 | NOT_STARTED |
| CC-2006 | Create layout engine | P1 | NOT_STARTED |

### Content Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2010 | Blog management system | P1 | NOT_STARTED |
| CC-2011 | Events calendar module | P1 | NOT_STARTED |
| CC-2012 | Photo gallery module | P1 | NOT_STARTED |
| CC-2013 | Teacher profile pages | P1 | NOT_STARTED |
| CC-2014 | Student achievement showcase | P2 | NOT_STARTED |
| CC-2015 | Dynamic homepage sections | P1 | NOT_STARTED |

### Marketing Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2020 | SEO management engine | P1 | NOT_STARTED |
| CC-2021 | Meta tag management | P1 | NOT_STARTED |
| CC-2022 | Sitemap generation | P2 | NOT_STARTED |
| CC-2023 | Analytics integration | P1 | NOT_STARTED |
| CC-2024 | Inquiry form builder | P1 | NOT_STARTED |
| CC-2025 | Lead tracking system | P2 | NOT_STARTED |
| CC-2026 | CTA management engine | P2 | NOT_STARTED |

### Communication Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2030 | WhatsApp website integration | P2 | NOT_STARTED |
| CC-2031 | Newsletter integration | P2 | NOT_STARTED |
| CC-2032 | Social media embeds | P2 | NOT_STARTED |
| CC-2033 | Contact form workflows | P2 | NOT_STARTED |

### AI Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2040 | AI content generator | P3 | NOT_STARTED |
| CC-2041 | AI SEO assistant | P3 | NOT_STARTED |
| CC-2042 | AI page generator | P3 | NOT_STARTED |
| CC-2043 | AI admissions campaign generator | P3 | NOT_STARTED |

### Template Marketplace

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2050 | Template marketplace engine | P2 | NOT_STARTED |
| CC-2051 | Modern school template | P2 | NOT_STARTED |
| CC-2052 | International school template | P2 | NOT_STARTED |
| CC-2053 | College template | P2 | NOT_STARTED |
| CC-2054 | Coaching institute template | P2 | NOT_STARTED |

### Subscription & Feature Access

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2060 | Website feature subscription mapping | P1 | NOT_STARTED |
| CC-2061 | Website premium feature controls | P1 | NOT_STARTED |
| CC-2062 | Website plan upgrade flows | P2 | NOT_STARTED |
| CC-2063 | Dynamic website module visibility | P1 | NOT_STARTED |

### Performance & Infrastructure

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2070 | CDN integration | P1 | NOT_STARTED |
| CC-2071 | Image optimization pipeline | P1 | NOT_STARTED |
| CC-2072 | Static page optimization | P2 | NOT_STARTED |
| CC-2073 | Website cache optimization | P1 | NOT_STARTED |
| CC-2074 | Lazy loading implementation | P1 | NOT_STARTED |

### Analytics

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2080 | Visitor analytics | P2 | NOT_STARTED |
| CC-2081 | Conversion tracking | P2 | NOT_STARTED |
| CC-2082 | Lead analytics dashboard | P2 | NOT_STARTED |
| CC-2083 | SEO performance dashboard | P2 | NOT_STARTED |

---

---

## Next Session — Exact Implementation Order

Follow this order strictly. One task per session. Stop after each and confirm.

### 🔴 Phase A — Auth Enforcement (✅ COMPLETE)

| Session | Task ID | What to build | Status |
|---------|---------|--------------|--------|
| ✅ Done | CC-0102 | `JwtAuthenticationFilter` | ✅ DONE |
| ✅ Done | CC-0103 | `POST /v1/auth/login` | ✅ DONE |
| ✅ Done | CC-0105 | Redis refresh token system | ✅ DONE |
| ✅ Done | CC-1801 | Brute-force protection — Redis sliding window rate limiter | ✅ DONE |
| ✅ Done | CC-1802 | `AuditLogService` — `@Async` writer, log auth events | ✅ DONE |
| ✅ Done | CC-0113/CC-0114 | RBAC enforcement in `SecurityConfig` | ✅ DONE |

### 🟠 Phase B — Foundation Completeness (✅ COMPLETE)

| Session | Task ID | What to build | Status |
|---------|---------|---------------|--------|
| B1 | CC-0213 | `School` entity + `V6__create_schools.sql` + auto-create on tenant onboarding | ✅ DONE |
| B2 | CC-0203 | Hibernate `@Filter` tenant isolation on all entities | ✅ DONE |
| B3 | CC-0210 | Tenant isolation automated test suite (Testcontainers) | ✅ DONE |
| B4 | CC-0012 | `FeatureFlagService` + `@RequiresFeature` AOP + Redis cache + `useFeatureFlag` hook | ✅ DONE |
| B5 | V8 | `V8__add_indexes.sql` — composite indexes | ✅ DONE |
| B6 | V9 | `V9__soft_delete.sql` — `deleted_at` column | ✅ DONE |

### 🟡 Phase C — ERP Core (✅ COMPLETE — E1–E14)

| Session | Domain | What was built | Status |
|---------|--------|---------------|--------|
| E1–E3 | Academic backend | Academic years, classes, sections, subjects, departments (V11–V15) | ✅ DONE |
| E4 | Student backend | Student entity, admission, listing, parent mapping (V17–V18) | ✅ DONE |
| E5 | Staff backend | Staff entity, profiles (V19) | ✅ DONE |
| E6 | Attendance backend | Attendance sessions + records, mark/lock (V20–V21) | ✅ DONE |
| E7 | School admin frontend | React scaffold, dashboard, academic year/class/section/subject pages, feature-flag nav | ✅ DONE |
| E8 | Student frontend | Student admit, profile, listing pages | ✅ DONE |
| E9 | Staff frontend | Staff list, create, profile pages | ✅ DONE |
| E10 | Attendance frontend | Session list, create session, mark attendance pages | ✅ DONE |
| E11 | Finance (full-stack) | Fee categories, structures, collection, receipts — backend + 4 frontend pages | ✅ DONE |
| E12 | Communication backend | `NotificationService`, SMS stub, email (JavaMailSender), `NotificationLog` entity + V25 migration | ✅ DONE |
| E13 | Push notifications | Firebase Admin SDK 9.3.0, `PushService`/`PushServiceImpl`, device token fan-out, send-push endpoint | ✅ DONE |
| E14 | WhatsApp integration | `WhatsAppMessageLog` + V26 migration, async stub service, send + log APIs, `NotificationLogPage` (3 tabs) + `WhatsAppPage` (2 tabs); 253 modules 0 errors | ✅ DONE |
| E15 | Exam system | `Exam`+`ExamSubject` entities + V27+V28 migrations; service; 6 endpoints; `ExamListPage`+`ExamCreatePage`+`ExamDetailPage`; 257 modules 0 errors | ✅ DONE |
| E16 | Marks entry | `StudentMark` entity + V29 migration; `MarksService`; 4 endpoints; `MarksEntryPage` spreadsheet grid; 259 modules 0 errors | ✅ DONE |

### 🔵 Phase D — Communication & Notifications ✅ COMPLETE

| Session | Task ID | What to build | Status |
|---------|---------|---------------|--------|
| E12 | CC-1001/CC-1002 | SMS + Email notification baseline — `NotificationService`, templates, MailHog integration, notification dispatch API | ✅ DONE |
| E13 | CC-1003 | Push notification system — device token management, FCM/APNs dispatch | ✅ DONE |
| E14 | CC-1004 | WhatsApp integration | ✅ DONE |

### 🟣 Phase E — Examination System (E15 ✅ DONE)

| Session | Task ID | What to build | Status |
|---------|---------|---------------|--------|
| E15 | CC-1101 | Exam creation — `Exam` entity, scheduling, subjects assignment | ✅ DONE |
| E16 | CC-1102 | Marks entry system — marks recording per student per subject | ✅ DONE |
| E17 | CC-1103/CC-1104 | Result generation + report card generation | ✅ DONE |
| E18 | CC-0701 | Timetable management — weekly grid, conflict detection, backend + frontend | ✅ DONE |
| E19 | CC-0702 | Homework management — DRAFT→PUBLISHED→CLOSED lifecycle, list + create pages | ✅ DONE |

### ⚪ Phase F — Remaining Foundations (Parallel with E12+)

| Session | Task ID | What to build |
|---------|---------|---------------|
| F1 | EUP-006 | OpenAPI/Swagger setup (springdoc) |
| F2 | EUP-008 | Multi-stage `Dockerfile` (non-root user, layered JAR) |
| F3 | CC-1502 | GitHub Actions CI pipeline (build + test + Docker push) |
| F4 | CC-0107/CC-0108 | Forgot password / OTP reset flow |

---

*End of Roadmap — updated 2026-05-12 E19 Homework Management complete (63/193 tasks — 32.6%) — Next: E20*
