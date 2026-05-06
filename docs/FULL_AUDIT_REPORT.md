# CloudCampus — Full Project Audit Report

**Date:** 2026-05-07  
**Analyst:** Senior Software Architect / QA / DevOps Review  
**Scope:** Complete codebase — backend (Spring Boot 3.4.4 / Java 17), frontend (React 19 / TypeScript / Vite), Docker, CI/CD, database migrations, security, API ↔ UI integration

---

## 1. Detected Architecture

```
CloudCampus (SaaS School Management Platform)
├── backend/               Spring Boot 3.4.4 · Java 17 · Maven
│   ├── auth/              JWT auth, OTP, credential update, first-login enforcement
│   ├── user/              UserAccount CRUD, provisioning
│   ├── tenant/            Multi-tenant schema management (Hibernate SCHEMA strategy)
│   ├── academic/          Classes, Sections, Subjects
│   ├── student/           Student CRUD + auto user provisioning
│   ├── teacher/           Teacher CRUD + auto user provisioning
│   ├── attendance/        Attendance marking + retrieval
│   ├── fees/              Fee assignment + payment recording
│   ├── exam/              Exam + ExamResult management
│   ├── homework/          Homework assignment management
│   ├── timetable/         Timetable slot management
│   ├── parent/            Parent–Student linking
│   ├── dashboard/         Role-based dashboard aggregation
│   ├── bulk/              Excel bulk upload (Apache POI)
│   ├── cms/               School website builder (CMS)
│   ├── subscription/      SaaS plans, Razorpay payment gateway
│   └── common/            ApiResponse, PageResponse, Auditable, GlobalExceptionHandler
│
├── frontend/              React 19 · TypeScript · Vite 8 · TanStack Query v5
│   └── features/          Feature-sliced architecture
│       ├── auth, student, teacher, academic, attendance, fees
│       ├── marks (exam), homework, timetable, parent
│       ├── dashboard, super-admin, bulk-upload
│       ├── website-builder, public-website, profile
│       └── components/ui/ (Button, Card, Modal, DataTable, etc.)
│
├── docker-compose.yml     PostgreSQL 16 + Backend + Frontend
├── .github/workflows/     ci.yml, ci-cd.yml, docker-publish.yml
└── docs/                  Architecture docs, API reference, Postman collection
```

**Multi-Tenancy:** Schema-per-tenant (Hibernate SCHEMA strategy). Each school gets its own PostgreSQL schema. The `public` schema holds tenants, subscriptions, payments, CMS/website tables.

**Auth Flow:** Login → JWT in HttpOnly cookie (`app_jwt`) + Bearer header dual support → TenantRequestFilter resolves schema → JwtAuthenticationFilter validates token → FirstLoginEnforcementFilter enforces credential update.

**Roles:** `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`

---

## 2. Module Inventory

| Module | Controllers | Services | Entities | Status |
|--------|-------------|----------|----------|--------|
| auth | AuthController | AuthServiceImpl, JwtServiceImpl, CredentialsUpdateService, OtpServiceImpl, DatabaseUserDetailsService | OneTimePassword | ✅ Solid |
| user | UserController | UserServiceImpl, UserAccountProvisioningService | UserAccount | ✅ Working |
| tenant | TenantController | TenantServiceImpl | Tenant | ✅ Working |
| academic | AcademicController | AcademicServiceImpl | SchoolClass, Section, Subject | ✅ Working |
| student | StudentController | StudentServiceImpl | Student | ✅ Working |
| teacher | TeacherController | TeacherServiceImpl | Teacher | ✅ Working |
| attendance | AttendanceController | AttendanceServiceImpl | AttendanceRecord | ⚠️ 1 issue |
| fees | FeesController | FeesServiceImpl | FeeAssignment, FeePayment | ⚠️ 1 DTO mismatch |
| exam | ExamController | ExamServiceImpl | Exam, ExamResult | ✅ Working |
| homework | HomeworkController | HomeworkServiceImpl | HomeworkAssignment | ✅ Working |
| timetable | TimetableController | TimetableServiceImpl | TimetableSlot | ⚠️ 1 DTO mismatch |
| parent | ParentController | ParentServiceImpl | ParentStudent | ✅ Working |
| dashboard | DashboardController | DashboardServiceImpl | — | ⚠️ N+1 queries |
| bulk | BulkUploadController | BulkUploadServiceImpl, BulkWorkflowServiceImpl | — | ✅ Working |
| cms | WebsiteCmsController, PublicWebsiteController | WebsiteCmsServiceImpl | WebsiteConfig, WebsiteSection, WebsiteGalleryItem, AdmissionLead | ✅ Working |
| subscription | 4 controllers | 5 services | SubscriptionPlan, TenantSubscription, PlatformPayment | ✅ Working |
| common | — | — | GlobalExceptionHandler, ApiResponse, PageResponse | ⚠️ Missing 404 handler |

---

## 3. API ↔ UI Integration Map

| UI Page / Feature | Component | API Endpoint | Method | Status |
|-------------------|-----------|--------------|--------|--------|
| Login | LoginPage | `POST /api/v1/auth/login` | POST | ✅ WORKING |
| Logout | AuthProvider | `POST /api/v1/auth/logout` | POST | ✅ WORKING |
| My Profile | ProfilePage | `GET /api/v1/auth/me` | GET | ✅ WORKING |
| Change Password | ChangePasswordPage | `POST /api/v1/auth/change-password` | POST | ✅ WORKING |
| Send OTP | CredentialsUpdate | `POST /api/v1/auth/credentials/send-otp` | POST | ✅ WORKING |
| Update Credentials | CredentialsUpdate | `POST /api/v1/auth/credentials/update` | POST | ✅ WORKING |
| School Search (Login) | LoginPage | `GET /api/v1/tenants/schools/search` | GET | ✅ WORKING |
| School by Slug | LoginPage | `GET /api/v1/tenants/schools/{slug}` | GET | ✅ WORKING |
| Tenant Dashboard | DashboardPage | `GET /api/v1/dashboard/tenant-summary` | GET | ✅ WORKING |
| Super Admin Dashboard | SuperAdminDashboardPage | `GET /api/v1/dashboard/super-admin-summary` | GET | ✅ WORKING |
| Student Dashboard | StudentDashboardPage | `GET /api/v1/dashboard/student` | GET | ✅ WORKING |
| Teacher Dashboard | TeacherDashboardPage | `GET /api/v1/dashboard/teacher` | GET | ✅ WORKING |
| **Tenant Branding** | DashboardLayout | `GET /api/v1/dashboard/branding` | GET | ⚠️ NOT CONNECTED (endpoint exists, no ENDPOINT constant) |
| Tenants List | TenantsPage | `GET /api/v1/tenants` | GET | ✅ WORKING |
| Create Tenant | TenantsPage | `POST /api/v1/tenants` | POST | ✅ WORKING |
| Update Tenant Status | TenantsPage | `PATCH /api/v1/tenants/{id}/status` | PATCH | ✅ WORKING |
| Users List | UsersPage | `GET /api/v1/users` | GET | ✅ WORKING |
| Create User | UsersPage | `POST /api/v1/users` | POST | ✅ WORKING |
| Students List | StudentsPage | `GET /api/v1/students` | GET | ✅ WORKING |
| Create Student | StudentsPage | `POST /api/v1/students` | POST | ✅ WORKING |
| Update Student | StudentsPage | `PATCH /api/v1/students/{id}` | PATCH | ✅ WORKING |
| Delete Student | StudentsPage | `DELETE /api/v1/students/{id}` | DELETE | ✅ WORKING |
| **Student /me** | StudentLearningPage (indirect) | `GET /api/v1/students/me` | GET | ⚠️ NOT CONNECTED (no ENDPOINT constant; uses dashboard API instead) |
| **Student Details** | — | `GET /api/v1/students/{id}/details` | GET | ⚠️ NOT CONNECTED (no ENDPOINT constant, no UI page) |
| Teachers List | TeachersPage | `GET /api/v1/teachers` | GET | ✅ WORKING |
| Create Teacher | TeachersPage | `POST /api/v1/teachers` | POST | ✅ WORKING |
| Update Teacher | TeachersPage | `PATCH /api/v1/teachers/{id}` | PATCH | ✅ WORKING |
| Delete Teacher | TeachersPage | `DELETE /api/v1/teachers/{id}` | DELETE | ✅ WORKING |
| Academic Classes | AcademicPage | `GET/POST /api/v1/academics/classes` | GET/POST | ✅ WORKING |
| Academic Subjects | AcademicPage | `GET/POST /api/v1/academics/subjects` | GET/POST | ✅ WORKING |
| Academic Sections | AcademicPage | `GET/POST /api/v1/academics/sections` | GET/POST | ✅ WORKING |
| Mark Attendance | AttendanceHubPage | `POST /api/v1/attendances` | POST | ✅ WORKING |
| View Attendance | AttendanceHubPage | `GET /api/v1/attendances?date=` | GET | ✅ WORKING |
| **Get Attendance by ID** | — | `GET /api/v1/attendances/{id}` | GET | ⚠️ NOT CONNECTED (no UI calls this) |
| Assign Fee | FeesHubPage | `POST /api/v1/fees/assignments` | POST | ✅ WORKING |
| Record Payment | FeesHubPage | `POST /api/v1/fees/payments` | POST | ⚠️ PARTIALLY BROKEN (see Bug #5) |
| Student Fees | FeesHubPage | `GET /api/v1/fees/students/{id}/assignments` | GET | ✅ WORKING |
| Create Exam | MarksHubPage | `POST /api/v1/exams` | POST | ✅ WORKING |
| Exams by Class | MarksHubPage | `GET /api/v1/exams/classes/{classId}` | GET | ✅ WORKING |
| Create Exam Result | MarksHubPage | `POST /api/v1/exams/results` | POST | ✅ WORKING |
| Exam Results | MarksHubPage | `GET /api/v1/exams/{id}/results` | GET | ✅ WORKING |
| Create Homework | HomeworkPage | `POST /api/v1/homework` | POST | ✅ WORKING |
| Homework by Class | HomeworkPage | `GET /api/v1/homework/classes/{classId}` | GET | ✅ WORKING |
| Create Timetable Slot | TimetablePage | `POST /api/v1/timetable/slots` | POST | ⚠️ PARTIALLY BROKEN (see Bug #6) |
| Get Timetable | TimetablePage | `GET /api/v1/timetable/classes/{c}/sections/{s}` | GET | ✅ WORKING |
| Parent Links | ParentLinksAdminPage | `GET/POST /api/v1/parents/links` | GET/POST | ✅ WORKING |
| Unlink Parent | ParentLinksAdminPage | `DELETE /api/v1/parents/links/{id}` | DELETE | ✅ WORKING |
| My Children | MyChildrenPage | `GET /api/v1/parents/me/children` | GET | ✅ WORKING |
| Subscription Plans | SubscriptionPlansPage | `GET/POST /api/v1/plans` | GET/POST | ✅ WORKING |
| Tenant Subscription | TenantSubscriptionPage | `GET/POST/DELETE /api/v1/tenants/{id}/subscription` | ALL | ✅ WORKING |
| Initiate Payment | TenantSubscriptionPage | `POST /api/v1/tenants/{id}/subscribe/initiate` | POST | ✅ WORKING |
| Record Platform Payment | TenantSubscriptionPage | `POST /api/v1/payments` | POST | ✅ WORKING |
| Bulk Upload | BulkUploadPage | `POST /api/v1/bulk/upload` | POST | ✅ WORKING |
| Bulk Operations | BulkUploadPage | All `/api/v1/bulk/*` | Various | ✅ WORKING |
| Website Builder | WebsiteBuilderPage | All `/api/v1/cms/*` | Various | ✅ WORKING |
| Public Website | SchoolWebsitePage | `GET /api/v1/website/{slug}` | GET | ✅ WORKING |
| Submit Admission Lead | SchoolWebsitePage | `POST /api/v1/website/{slug}/leads` | POST | ✅ WORKING |

---

## 4. Bug Report

### 🔴 CRITICAL

**Bug #1 — Real credentials committed to version control**
- File: `.env` (root of project)
- Why: Real `DB_PASSWORD`, `JWT_SECRET`, `BOOTSTRAP_ADMIN_PASSWORD`, plain-text `EMAIL_PASSWORD` are committed to git. This is a severe security breach.
- Impact: Anyone with repository access can compromise the database, generate valid JWTs, and log in as super-admin.
- Fix: Remove `.env` from git history (`git filter-repo`), rotate all secrets immediately, ensure `.gitignore` includes `.env`.

**Bug #2 — `ddl-auto: update` conflicts with Flyway**
- File: `backend/src/main/resources/application.yml`
- Why: Both `spring.flyway.enabled: true` and `spring.jpa.hibernate.ddl-auto: update` are active. Flyway manages migrations through versioned scripts; Hibernate's `update` mode independently alters the schema when entity definitions change. This creates split-brain schema management — Flyway loses track of changes Hibernate makes, and future migrations may fail or produce duplicate/inconsistent columns.
- Fix: Change `ddl-auto` to `validate` (Flyway owns schema) or `none`.

**Bug #3 — All "not found" errors return HTTP 400 instead of 404**
- File: `GlobalExceptionHandler.java`
- Why: Every service method throws `IllegalArgumentException` for missing resources (e.g., "Student not found: …"). The handler maps `IllegalArgumentException` to `400 Bad Request`. Semantically, a missing resource should return `404 Not Found`. REST clients (and browser devtools) misread this as a bad request rather than a missing entity.
- Fix: Create a custom `ResourceNotFoundException extends RuntimeException` and add a `@ExceptionHandler` that returns `404`.

**Bug #4 — N+1 query problem in DashboardServiceImpl**
- File: `DashboardServiceImpl.java`
- Why: `buildStudentTimetableToday()` calls `subjectRepository.findById()` inside a for-loop over timetable slots. `buildTeacherDashboard()` calls `schoolClassRepository.findById()`, `sectionRepository.findById()`, and `subjectRepository.findById()` inside separate for-loops. With 20 timetable slots, this is 60 individual SQL queries. Also, `getSuperAdminDashboardSummary()` calls `tenantRepository.findAll()` and streams over it twice — one `count()` call is sufficient.
- Fix: Use `findAllById(ids)` for batch fetching, then join via Maps. Use `tenantRepository.count()` and `tenantRepository.countByActiveTrue()` instead of loading all tenants.

**Bug #5 — Fee payment `paymentMethod` DTO mismatch (null vs required)**
- File (backend): `FeePaymentCreateRequest.java` — `paymentMethod` is `@NotBlank`
- File (frontend): `fees/types.ts` — `RecordPaymentRequest.paymentMethod: string | null`
- Why: When the user submits a payment without a payment method, the frontend sends `null`, which fails backend validation with a cryptic 400. Conversely, the backend will reject even an empty string. The form initialises `paymentMethod: null`.
- Fix: Either make `paymentMethod` optional on backend (remove `@NotBlank`) or make it required on the frontend form (prevent null submission).

**Bug #6 — Timetable slot `sectionId` DTO mismatch (nullable vs required)**
- File (backend): `TimetableSlotRequest.java` — `@NotNull UUID sectionId`
- File (frontend): `timetable/types.ts` — `CreateTimetableSlotRequest.sectionId: string | null`
- Why: Frontend type allows null for `sectionId`, `subjectId`. If the user omits them, backend will respond 400. The UI may silently send null, breaking slot creation.
- Fix: Align frontend type to make `sectionId` and `subjectId` required (`string`, not `string | null`).

**Bug #7 — `FirstLoginEnforcementFilter` uses field injection (`@Autowired`)**
- File: `FirstLoginEnforcementFilter.java`
- Why: `userAccountRepository` and `objectMapper` are injected with `@Autowired(required = false)`. If these beans are not available (e.g., during tests or misconfiguration), the filter silently skips first-login enforcement — a security hole. Uses field injection contrary to Spring best practices.
- Fix: Use constructor injection via `@RequiredArgsConstructor` and make dependencies required.

---

### 🟡 MEDIUM

**Bug #8 — `AttendanceServiceImpl.getAttendanceByDate` loads all records then filters in memory**
- File: `AttendanceServiceImpl.java`
- Why: `findAllByAttendanceDate(date)` fetches every attendance record for a given day (could be thousands of students), then the student-ID filter runs in Java. This should be a targeted DB query.
- Fix: Add repository method `findAllByAttendanceDateAndStudentIdIn(date, Set<UUID>)` for filtered queries. Only apply in-memory filter for admin/teacher (no filter needed).

**Bug #9 — No token refresh mechanism**
- File: `api/client.ts`
- Why: JWT TTL is 1 hour (configurable, default 3600000ms). The 401 interceptor clears auth and redirects to login. There is no silent token refresh. Active users are forcefully logged out after 1 hour.
- Fix: Implement a short-lived access token + long-lived refresh token flow, or extend TTL with a sliding-window mechanism.

**Bug #10 — `getSuperAdminDashboardSummary()` loads ALL tenants into memory**
- File: `DashboardServiceImpl.java`
- Why: `tenantRepository.findAll()` is called to count tenants and find newest ones. At scale this is a full table scan.
- Fix: Use `tenantRepository.count()`, `tenantRepository.countByActiveTrue()`, `tenantRepository.countByCreatedAtAfter(monthStart)`, and a `Pageable` query for newest 6 tenants.

**Bug #11 — Missing ENDPOINT constants for 3 backend routes**
- File: `frontend/src/api/endpoints.ts`
- Endpoints not exposed: `GET /api/v1/students/me`, `GET /api/v1/students/{id}/details`, `GET /api/v1/dashboard/branding`
- Why: These backend endpoints are fully implemented but never called from the frontend because no ENDPOINT constant exists for them.
- Fix: Add constants and wire to components.

**Bug #12 — `src/App.tsx` is Vite scaffold — dead code**
- File: `frontend/src/App.tsx`
- Why: `main.tsx` imports from `./app/App` (the real application). The root `src/App.tsx` is leftover Vite scaffolding with a counter and logo demo that will never be rendered.
- Fix: Delete `src/App.tsx`, `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`.

**Bug #13 — Docker Compose frontend uses dev server**
- File: `docker-compose.yml`
- Why: The frontend service runs `npm run dev -- --host 0.0.0.0` — a Vite dev server with HMR and no optimisation. This is not production-ready, wastes resources, and exposes source maps.
- Fix: Create a `frontend/Dockerfile` using `npm run build` + nginx to serve the static build.

**Bug #14 — CORS `allowedOrigins` split may include whitespace**
- File: `CorsConfig.java`
- Why: `allowedOrigins.split(",")` will include leading/trailing spaces if `CORS_ALLOWED_ORIGINS=http://localhost:5173, http://127.0.0.1:5173`. The extra space becomes part of the origin string and the CORS check fails silently.
- Fix: Use `Arrays.stream(...).map(String::trim).toArray(String[]::new)`.

**Bug #15 — `docker-compose.yml` backend missing `CORS_ALLOWED_ORIGINS`**
- File: `docker-compose.yml`
- Why: The backend environment block does not set `CORS_ALLOWED_ORIGINS`, so the default value from `application.yml` (`http://localhost:5173,http://127.0.0.1:5173`) is used. This is fine locally but will break in any real deployment where the frontend is on a different origin.
- Fix: Add `CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:-http://localhost:5173,http://127.0.0.1:5173}` to the backend service env.

**Bug #16 — Missing database indexes on tenant-schema tables**
- Why: Tenant-schema tables (students, attendance_records, exam_results, fee_assignments, etc.) are created by Hibernate `ddl-auto: update` without explicit `@Index` annotations or Flyway index scripts. High-cardinality lookups (student by admission number, attendance by date+student, exam results by exam) will do full table scans.
- Fix: Add `@Table(indexes = {...})` annotations and/or Flyway migration scripts.

---

### 🔵 MINOR

**Bug #17 — CI workflow uses weak JWT secret**
- File: `.github/workflows/ci.yml`
- Why: `JWT_SECRET: 0123456789abcdef0123456789abcdef` — this is 32 chars but entirely predictable. While only used in CI, it's best practice to use `openssl rand -hex 32`.

**Bug #18 — `application.yml` missing SMTP/email config**
- Why: `application.yml` has no mail configuration. `LoggingNotificationService` logs credential emails instead of sending them. In production, credentials are never delivered. The `.env` file has `EMAIL_HOST`, `EMAIL_USERNAME`, `EMAIL_PASSWORD` but no Spring Mail auto-configuration properties in `application.yml`.
- Fix: Add `spring.mail.*` properties to `application.yml`.

**Bug #19 — Missing `@Schema` annotations on DTOs**
- Why: Most DTOs lack OpenAPI `@Schema` annotations, making Swagger documentation incomplete.
- Fix: Add `@Schema` annotations to all request/response DTOs.

**Bug #20 — `GlobalExceptionHandler` missing `UsernameNotFoundException` handler**
- Why: If `UserDetailsService.loadUserByUsername()` throws `UsernameNotFoundException` outside the auth filter (e.g., during a service call), it bubbles up to the generic 500 handler.
- Fix: Add an explicit handler returning `401 Unauthorized`.

---

## 5. Fix Plan (File-by-File)

### Fix A — `GlobalExceptionHandler.java` (Bugs #3, #20)
Add `ResourceNotFoundException`, handler for 404, handler for `UsernameNotFoundException`.

### Fix B — `ResourceNotFoundException.java` (new file, Bug #3)
Custom runtime exception used by all service "not found" branches.

### Fix C — `application.yml` (Bug #2, #18)
Change `ddl-auto` to `validate`. Add `spring.mail.*` config block.

### Fix D — `CorsConfig.java` (Bug #14)
Trim spaces when splitting `allowedOrigins`.

### Fix E — `docker-compose.yml` (Bug #13, #15)
Add `CORS_ALLOWED_ORIGINS`. Replace frontend dev command with build+nginx.

### Fix F — `frontend/Dockerfile` (Bug #13, new file)
Multi-stage build: Node to build → nginx to serve.

### Fix G — `frontend/src/api/endpoints.ts` (Bug #11)
Add missing ENDPOINT constants.

### Fix H — `frontend/src/features/fees/types.ts` (Bug #5)
Make `paymentMethod` required (not nullable) to match backend.

### Fix I — `frontend/src/features/timetable/types.ts` (Bug #6)
Make `sectionId` and `subjectId` required (not nullable).

### Fix J — `FirstLoginEnforcementFilter.java` (Bug #7)
Switch from field injection to constructor injection.

### Fix K — `DashboardServiceImpl.java` (Bug #4, #10)
Batch fetch with `findAllById`, use count queries for super-admin dashboard.

### Fix L — `AttendanceServiceImpl.java` (Bug #8)
Add `findAllByAttendanceDateAndStudentIdIn` repository method for filtered queries.

### Fix M — Service layer: replace `IllegalArgumentException("... not found")` with `ResourceNotFoundException` (Bug #3)
All services: StudentServiceImpl, TeacherServiceImpl, ExamServiceImpl, FeesServiceImpl, AttendanceServiceImpl, HomeworkServiceImpl, TimetableServiceImpl, ParentServiceImpl, AcademicServiceImpl.

### Fix N — Delete dead file `src/App.tsx` (Bug #12)

---

## 6. Project Health Report

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Architecture** | 8.5/10 | Clean modular layout, schema-per-tenant is solid, good SOLID adherence |
| **Code Quality** | 7.5/10 | Consistent patterns, good use of records/Lombok; N+1 and field injection issues |
| **Security** | 4/10 | Credentials committed to git, first-login filter fragile — MUST fix before production |
| **API Completeness** | 9/10 | 45 of 48 endpoints wired; 3 missing ENDPOINT constants |
| **UI Completeness** | 8.5/10 | All major features present; a few endpoints unused in UI |
| **Backend Tests** | 6/10 | Integration tests exist (Testcontainers); unit tests thin |
| **Frontend Tests** | 4/10 | Minimal; only endpoints.test.ts and ParentLinksAdminPage.test.tsx |
| **Docker / DevOps** | 6.5/10 | Backend Dockerfile excellent; frontend Dockerfile missing; compose uses dev server |
| **Documentation** | 8/10 | Comprehensive docs folder; Postman collection present |
| **Production Readiness** | 5/10 | Blocked by credentials leak, ddl-auto conflict, no email config |

### Overall: **6.8 / 10** — Solid foundation; 3 critical and 5 medium issues block production deployment.

---

## 7. Final Validation Checklist

- [ ] `.env` removed from git, all secrets rotated
- [ ] `ddl-auto: validate` (Flyway owns schema)
- [ ] `ResourceNotFoundException` + 404 handler added
- [ ] N+1 queries fixed in DashboardServiceImpl
- [ ] Fee payment DTO `paymentMethod` aligned
- [ ] Timetable slot DTO `sectionId`/`subjectId` aligned
- [ ] `FirstLoginEnforcementFilter` uses constructor injection
- [ ] Frontend Dockerfile created (nginx build)
- [ ] Missing ENDPOINT constants added
- [ ] CORS origin split trimmed
- [ ] `docker-compose.yml` frontend updated to production build
- [ ] All services use `ResourceNotFoundException` for missing entities
- [ ] Spring Mail config added to `application.yml`
- [ ] Database indexes added for high-cardinality lookups
