# CloudCampus — Project Tracker


> Last Updated: 2026-05-05 | Reflects actual codebase state

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Completed | 50 |
| ⚠️ In Progress | 0 |
| ❌ Pending | 0 |

---

## Changelog

### 2026-05-05

- Commit: `6f7ef6c`  
	Message: Add dashboard and learning page updates across backend and frontend
- Added dedicated learning pages for parent and student workflows.
- Updated dashboard routes/layout and role-focused pages (student, parent, teacher).
- Updated backend auth/filter and exam/homework/timetable controllers to support the new UI flow.
- Updated dashboard seeding script to align demo/dev data with the latest dashboard behavior.

---

## ✅ Completed Features

### Infrastructure & Foundation

| # | Task | Module | Notes |
|---|------|--------|-------|
| 1 | Spring Boot 3.4.4 project setup | Infrastructure | Java 17, Maven, clean package structure |
| 2 | PostgreSQL multi-tenant schema-per-tenant design | Database | Flyway migrations V1, V2 |
| 3 | JWT authentication (HS256, 1-hour TTL) | Auth | JJWT 0.12.6, stateless |
| 4 | Spring Security configuration | Security | BCrypt, custom entry point and access denied handler |
| 5 | Multi-tenancy infrastructure | Tenant | `TenantContext`, `TenantRequestFilter`, Hibernate schema routing |
| 6 | Uniform `ApiResponse<T>` + `PageResponse<T>` | Common | All endpoints use this envelope |
| 7 | `GlobalExceptionHandler` | Common | Handles validation, business, and runtime errors |
| 8 | Swagger/OpenAPI 3.0 documentation | Config | `/swagger-ui.html`, `/v3/api-docs` |
| 9 | Docker + Docker Compose setup | Infrastructure | postgres:16, backend, frontend services |
| 10 | Build and dev scripts | Scripts | `build.sh`, `start-dev.sh` |

### Backend Domain Modules

| # | Task | Module | Key Features |
|---|------|--------|--------------|
| 11 | Tenant CRUD + schema provisioning | Tenant | `POST /tenants`, auto-creates 13 tables |
| 12 | User management | User | Create + list users, BCrypt hashing, role enum |
| 13 | Student enrollment | Student | UPPERCASE admission no, uniqueness, pagination |
| 14 | Teacher management | Teacher | UPPERCASE employee no, unique email, pagination |
| 15 | Academic structure (classes, subjects, sections) | Academic | Unique codes, FK relationships |
| 16 | Attendance tracking | Attendance | UNIQUE(student, date), status enum, future-date guard |
| 17 | Fee management | Fees | Assignment + payment, auto status transitions (PENDING→PARTIALLY_PAID→PAID) |
| 18 | Exam scheduling + results | Exam | Duplicate guard, marks overflow guard, one result per student per exam |
| 19 | Homework assignments | Homework | Per class/section, with due date |
| 20 | Timetable slots | Timetable | dayOfWeek (1–7), time validation |
| 21 | Parent portal (linked children) | Parent | `parent_students` table, `GET /me/children` |
| 22 | Dashboard (tenant summary + super admin summary) | Dashboard | KPI cards, branding |
| 23 | Bulk upload (Excel via Apache POI) | Bulk | Students, Teachers, Classes, Sections sheets |
| 24 | Unit tests (User, Exam, Fees services) | Testing | JUnit 5 + Mockito, 30 tests |
| 34 | Attendance UI | Frontend/Attendance | Date picker, class/section selector, bulk mark, report view |
| 35 | Fees UI | Frontend/Fees | Assignment form, payment form, status badge, payment history |
| 36 | Marks / Exams UI | Frontend/Marks | Exam form, results entry, results table per exam |
| 37 | Homework UI | Frontend/Homework | Homework list, create form, due-date highlighting |
| 38 | Timetable UI | Frontend/Timetable | Weekly grid view, slot create form, class/section filter |
| 39 | Parent Portal UI | Frontend/Parent | My children list, per-child fee/attendance/results view |
| 40 | Profile pages (all roles) | Frontend/Profile | View + edit own profile for every role |
| 41 | Ownership-aware authorization | Backend/Security | `OwnershipChecker` bean; role+ownership `@PreAuthorize` on Fees, Attendance, Exam results |
| 42 | Audit logging | Backend | `Auditable` MappedSuperclass, `JwtAuditorAware`, `@EnableJpaAuditing`; 10 entities updated; DDL columns added |
| 43 | Soft delete | Backend | `deleted_at` on User/Student/Teacher; soft-delete-aware repos; `DELETE /students/{id}`, `DELETE /teachers/{id}` |
| 44 | Integration tests (Testcontainers) | Testing | Failsafe plugin; `IntegrationTestBase`; 17 IT tests across tenant provisioning, student CRUD, fee payment status |
| 45 | Frontend UX hardening | Frontend (all) | `ConfirmDialog` component; delete student/teacher with confirm; 401 auto-redirect to correct login page |
| 46 | Bulk upload UI | Frontend/Bulk | File picker (.xlsx filter), drag-and-drop, upload progress bar, result card with per-row errors, sample download, instructions modal |
| 47 | Documentation update | Docs/Postman | 07_API_REFERENCE.md (8 new sections); 08_API.md (13 fixes, v1.1); Postman (16 folders, 49 endpoints, legacy folder removed) |
| 48 | Payment gateway integration (Razorpay) | Backend+Frontend | Flyway V4; `PaymentGatewayService`; `RazorpayPaymentGatewayServiceImpl`; `POST /subscribe/initiate`; `POST /payments/webhook` (HMAC-SHA256); "Pay Online" button + Razorpay checkout.js; `12_PAYMENT_FLOW.md` v2 |
| 49 | First-login credential enforcement | Backend/Security | `FirstLoginEnforcementFilter`; blocks non-credential endpoints until secure update is completed |
| 50 | OTP-based credential update flow | Backend/Auth | `POST /auth/credentials/send-otp`; `POST /auth/credentials/update`; OTP storage + validation + retry limits |
| 51 | Auto credential provisioning | Backend/User | Optional username/password on user create; generated credentials + notification dispatch |
| 52 | Parent links administration UI/API | Backend+Frontend | `GET /parents/links`; admin page for list/link/unlink parent-student pairs |
| 53 | Frontend test harness upgrades | Frontend/Testing | Vitest + Testing Library + jsdom setup and initial tests for endpoints and parent-link UI |

### Frontend

| # | Task | Module | Notes |
|---|------|--------|-------|
| 25 | React 19 + TypeScript + Vite + Tailwind CSS setup | Frontend | Clean project structure |
| 26 | Auth module (login, JWT, route guards) | Auth | `useAuth` hook, `PrivateRoute`, `PublicRoute` |
| 27 | Dashboard page with KPI cards | Dashboard | `useTenantDashboardSummary` hook |
| 28 | Student module (list, create, pagination) | Student | Full CRUD UI with DataTable and form |
| 29 | Super Admin module (tenant list + create, user list) | Super Admin | Separate layout + routes |
| 30 | Subscription plans backend (entities, repos, DTOs, services, controllers) | Subscription | Flyway V3, 4 enums, 3 entities, 7 endpoints |
| 31 | Tenant subscription & payment backend | Subscription | Subscribe/cancel/record, SubscriptionGuardService (fail-open) |
| 32 | Subscription UI (Super Admin) | Frontend/Subscription | SubscriptionPlansPage, TenantSubscriptionPage, subscriptionApi, hooks |
| 33 | Role-based dashboards (Teacher, Student, Parent) | Frontend/Dashboard | Distinct views per role using existing summary data |

---

## ⚠️ In Progress

_None_

---

## ❌ Pending

_None — all planned tasks completed._

---

## Module Status Summary

| Module | Backend | Frontend |
|--------|---------|----------|
| Auth | ✅ Complete | ✅ Complete |
| Tenant Management | ✅ Complete | ✅ Complete |
| User Management | ✅ Complete | ✅ Complete |
| Students | ✅ Complete | ✅ Complete |
| Teachers | ✅ Complete | ✅ Complete |
| Academic (Classes/Subjects/Sections) | ✅ Complete | ✅ Complete |
| Attendance | ✅ Complete | ✅ Complete |
| Fees | ✅ Complete | ✅ Complete |
| Exams / Marks | ✅ Complete | ✅ Complete |
| Homework | ✅ Complete | ✅ Complete |
| Timetable | ✅ Complete | ✅ Complete |
| Parent Portal | ✅ Complete | ✅ Complete |
| Dashboard | ✅ Complete | ✅ Complete |
| Bulk Upload | ✅ Complete | ✅ Complete |
| Ownership Authorization | ✅ Complete | ✅ Complete |
| Audit Logging | ✅ Complete | N/A |
| Soft Delete | ✅ Complete | N/A |
| Integration Tests | ✅ Complete | N/A |
| Subscription Plans | ✅ Complete | ✅ Complete |
| Payment Gateway (Razorpay) | ✅ Complete | ✅ Complete |
| Tenant Subscriptions | ✅ Complete | ✅ Complete |
| Platform Payments | ✅ Complete | ✅ Complete |

---

## Architecture Decisions (Recorded)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy | Schema-per-tenant | Complete data isolation; no discriminator columns; straightforward backup per school |
| Authentication | Stateless JWT (HS256) | Scalable; no server-side session; standard for REST APIs |
| ORM | Spring Data JPA + Hibernate | Mature, well-supported; custom multi-tenancy hooks available |
| Migration | Flyway | Declarative SQL migrations; easy rollback tracking |
| API Contract | `ApiResponse<T>` envelope | Consistent client-side handling; standard error format |
| DTO pattern | Java records | Immutable, concise; auto-generates `equals`, `hashCode`, `toString` |
| Frontend state | TanStack Query | Server state separate from UI state; automatic caching and invalidation |
| Frontend routing | React Router v7 | File-based routing patterns; nested routes for layouts |
