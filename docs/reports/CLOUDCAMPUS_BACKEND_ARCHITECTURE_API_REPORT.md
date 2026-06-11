# CloudCampus Backend Architecture and API Report

Generated on: 2026-06-11
Branch reviewed: `world-ready-teacher-finance-admin-scale-foundation`
Current repository shape: backend-only production deployment structure

## 1. Executive Summary

CloudCampus is currently a Java 21 Spring Boot backend for a school ERP SaaS platform. The `main` branch has intentionally been reduced to backend-only code so frontend, mobile, broader infrastructure, and performance surfaces can be reintroduced later in separate phases.

The backend is already more than a simple starter service. It contains multi-tenant onboarding, school administration, user/session management, RBAC-style access control, academic setup, student/staff/parent workflows, finance, attendance, homework, exams, notices, reports, AI governance, dashboard summaries, platform administration, OpenAPI contract generation, deployment scripts, Docker Compose files, and CI.

Current verified state:

- Backend tests: `214` passing after the current authorization/correlation and teacher-flow hardening slices.
- OpenAPI generation: verified by `OpenApiContractTest`.
- Generated API contract: committed at `docs/api/openapi.yaml`.
- API examples and docs: committed under `docs/api/`.
- Request context: implemented through `RequestContext`, request-scoped authenticated-user caching, effective role/permission snapshots, and `RequestContextResolverTest`.
- Correlation IDs: centralized through `CorrelationIdFilter`, returned as `X-Correlation-Id`, stored in MDC during request handling, and consumed by `RequestContext`.
- Route authorization metadata: centralized through `RoutePolicyRegistry`, enforced at runtime by `RoutePolicyEnforcementInterceptor`, and verified by `RouteAuthorizationMatrixTest`.
- Authorization guard foundation: implemented through `AuthorizationGuard` with negative tests for tenant, school, parent-child, student-self, teacher-assignment, and finance boundaries.
- Teacher portal object authorization: teacher assignment, attendance, homework, exam, notice, and timetable flows now accept `RequestContext` at the controller/service boundary where relevant and use `AuthorizationGuard` plus assignment checks for class/section/subject scope.
- Docker image build: verified.
- Docker Compose config validation: verified.
- Human documentation is intentionally consolidated into the API guide, production readiness guide, and this backend architecture/report. Generated API artifacts remain under `docs/api/`.
- Current production readiness: structurally ready, with API contract discipline now in place; still needs real production secrets, HTTPS/load balancer, registry publishing, external monitoring, SMTP, and tested backup restore.

World-ready planning target:

- Target scale: `10,000+` schools and `10 million` students.
- Keep the modular monolith as the main deployable until measured traffic proves a service split is worth the operational cost.
- Main pressure points at that scale are attendance, audit logs, notification deliveries, report exports, AI audits, fee/payment flows, and student search.
- The highest-value next foundations are finance/admin object-level authorization migration, PostgreSQL-scale data design, async workers, observability, backup/restore drills, and object storage.

## 2. Technology Stack

| Area | Current Choice |
| --- | --- |
| Language | Java 21 |
| Framework | Spring Boot 3.5.14 |
| Web | Spring Web MVC |
| Persistence | Spring Data JPA / Hibernate |
| Database migrations | Flyway |
| Production database | PostgreSQL |
| Local/test database | H2 in PostgreSQL compatibility mode |
| Auth crypto | Spring Security Crypto |
| API contract | Springdoc OpenAPI |
| Metrics | Spring Boot Actuator + Prometheus registry |
| Build | Maven |
| Container | Multi-stage Dockerfile |
| Orchestration | Docker Compose for local/staging/prod |
| CI | GitHub Actions backend workflow |

## 3. Repository Structure

```text
CloudCampus/
  backend/
    Dockerfile
    pom.xml
    src/main/java/com/cloudcampus/
    src/main/resources/
    src/test/java/com/cloudcampus/
  docs/
    api/
      examples/
      openapi.yaml
    deployment/
    reports/
  scripts/
    deploy/
  .github/
    workflows/backend-ci.yml
  docker-compose.local.yml
  docker-compose.staging.yml
  docker-compose.prod.yml
  .env.example
  .env.staging.example
  .env.production.example
  Makefile
  README.md
```

Important deployment files:

- `backend/Dockerfile`: multi-stage backend image build and runtime healthcheck.
- `docker-compose.local.yml`: local backend + PostgreSQL.
- `docker-compose.staging.yml`: staging backend + PostgreSQL with production-like hardening.
- `docker-compose.prod.yml`: production backend + PostgreSQL with read-only backend filesystem, tmpfs, log rotation, private network, and no-new-privileges.
- `scripts/deploy/preflight.sh`: validates production readiness inputs before deployment.
- `scripts/deploy/smoke.sh`: verifies deployed service readiness.
- `scripts/deploy/backup-postgres.sh`: PostgreSQL backup helper.
- `Makefile`: standard entry points for tests, image build, compose validation, preflight, and smoke checks.
- `docs/api/openapi.yaml`: generated OpenAPI contract for frontend/mobile and integration teams.
- `docs/api/examples/`: representative request/response examples for major role flows.

## 4. Runtime Configuration

Main config file: `backend/src/main/resources/application.yml`

Key configuration groups:

- `spring.datasource.*`: database URL, driver, username, password.
- `spring.flyway.enabled`: migration execution.
- `spring.mail.*`: SMTP delivery settings.
- `spring.jpa.hibernate.ddl-auto=validate`: schema must match Flyway migrations.
- `management.endpoints.web.exposure.include=health,info,prometheus`: operational endpoints.
- `cloudcampus.auth.jwt-secret`: JWT signing secret.
- `cloudcampus.auth.access-token-ttl-minutes`: access token TTL.
- `cloudcampus.cors.allowed-origins`: allowed browser origins.
- `cloudcampus.notifications.email.*`: email mode, from address, base URL, production log-mode gate.
- `springdoc.api-docs.enabled`: OpenAPI JSON/YAML exposure.
- `springdoc.swagger-ui.enabled`: Swagger UI gate, disabled by default and enabled only in local/dev/staging profiles.

Production-sensitive environment variables:

- `CLOUDCAMPUS_JDBC_URL`
- `CLOUDCAMPUS_JDBC_DRIVER`
- `CLOUDCAMPUS_JDBC_USERNAME`
- `CLOUDCAMPUS_JDBC_PASSWORD`
- `CLOUDCAMPUS_AUTH_JWT_SECRET`
- `CLOUDCAMPUS_CORS_ALLOWED_ORIGINS`
- `CLOUDCAMPUS_EMAIL_MODE`
- `CLOUDCAMPUS_EMAIL_FROM`
- `CLOUDCAMPUS_APP_BASE_URL`
- `CLOUDCAMPUS_SMTP_HOST`
- `CLOUDCAMPUS_SMTP_PORT`
- `CLOUDCAMPUS_SMTP_USERNAME`
- `CLOUDCAMPUS_SMTP_PASSWORD`
- `JAVA_OPTS`

## 5. High-Level Architecture

CloudCampus currently follows a modular monolith architecture:

- One deployable Spring Boot backend.
- Domain modules separated by Java packages.
- Shared database with Flyway migrations.
- Controllers expose role-oriented REST API namespaces.
- OpenAPI exposes contract metadata, role namespace groupings, JWT bearer security, and standard error schemas.
- Services hold business workflows.
- Repositories encapsulate persistence.
- Entities map to relational tables.
- Audit/outbox patterns exist for traceability and future async delivery.

This is a strong structure for the current stage because it keeps development velocity high while still preserving boundaries that can later be split into services if scale demands it.

Primary layers:

```text
HTTP Controller
  -> Request DTO validation
  -> Authenticated user / active school resolution
  -> Service method
  -> Repository / database
  -> Audit log / outbox event where applicable
  -> Response DTO
```

Cross-cutting concerns:

- Tenant and school isolation.
- Role-specific endpoints.
- Audit coverage.
- Transactional outbox.
- Production readiness validation.
- Dashboard aggregation.
- AI entitlement and governance tracking.
- Report export jobs.

## 6. Domain Modules

### 6.1 Platform and Tenant

Packages:

- `com.cloudcampus.platform.tenant`
- `com.cloudcampus.platform.superadmin`
- `com.cloudcampus.platform.tenantadmin`
- `com.cloudcampus.platform.subscription`

Responsibilities:

- Tenant onboarding.
- Tenant status and settings.
- School creation and management.
- Subscription plan catalog.
- Tenant subscription assignment.
- Tenant invoices.
- Platform-wide metrics and search.
- Super admin control panels.
- Tenant admin reporting and usage views.

Main entities:

- `Tenant`
- `School`
- `TenantSettings`
- `SubscriptionPlan`
- `TenantSubscription`
- `TenantInvoice`
- `TenantSchoolLimit`
- `PlatformStats`
- `TenantStats`
- `SchoolStats`
- `PlatformSettings`

### 6.2 Identity, Auth, and Access Control

Packages:

- `com.cloudcampus.identity.auth`
- `com.cloudcampus.identity.auth.session`
- `com.cloudcampus.identity.auth.invitation`
- `com.cloudcampus.identity.accesscontrol`
- `com.cloudcampus.identity.accesscontrol.guard`
- `com.cloudcampus.identity.accesscontrol.policy`

Responsibilities:

- User accounts.
- Login.
- MFA challenge verification.
- Refresh token lifecycle.
- Password reset.
- Logout and access token revocation.
- Invitation acceptance.
- Active school switching.
- Role assignments.
- Permission catalog.
- Permission overrides.
- School access grants.
- Request-scoped authorization context.
- Declarative route policy metadata.
- Shared object authorization guard helpers.

Main entities:

- `UserAccount`
- `Invitation`
- `RefreshToken`
- `RevokedAccessToken`
- `PasswordResetToken`
- `MfaChallenge`
- `UserSchoolAccess`
- `Permission`
- `RolePermission`
- `UserRoleAssignment`
- `UserPermissionOverride`

### 6.3 Academic

Package:

- `com.cloudcampus.academic`

Responsibilities:

- Academic years.
- Class levels.
- Sections.
- Subjects.
- Class-subject assignments.
- Teacher assignments.
- Teacher assignment portal.

Main entities:

- `AcademicYear`
- `ClassLevel`
- `Section`
- `Subject`
- `ClassSubjectAssignment`
- `TeacherAssignment`

### 6.4 People

Packages:

- `com.cloudcampus.people.student`
- `com.cloudcampus.people.staff`
- `com.cloudcampus.people.parent`
- `com.cloudcampus.people.teacher`

Responsibilities:

- Student import and validation.
- Student login invitation.
- Student self profile.
- Staff provisioning.
- Staff/teacher directories.
- Parent-child links.
- Parent portal.
- Parent leave requests.
- Guardian links.

Main entities:

- `Student`
- `StudentImportJob`
- `StudentImportRow`
- `StudentImportError`
- `StudentUserLink`
- `StaffProfile`
- `ParentStudentLink`
- `StudentGuardian`
- `ParentLeaveRequest`

### 6.5 Operations

Packages:

- `com.cloudcampus.operations.attendance`
- `com.cloudcampus.operations.finance`
- `com.cloudcampus.operations.homework`
- `com.cloudcampus.operations.exam`
- `com.cloudcampus.operations.notice`
- `com.cloudcampus.operations.report`
- `com.cloudcampus.operations.bulk`
- `com.cloudcampus.operations.timetable`
- `com.cloudcampus.operations.document`
- `com.cloudcampus.operations.website`

Responsibilities:

- Attendance sessions and records.
- Fee demands, payments, receipts, and reports.
- Homework assignments and submissions.
- Exams, marks, roster, and published results.
- Notices and publication.
- Report exports and downloads.
- Bulk job lifecycle.
- Timetable entries.
- School documents.
- School website pages.

Main entities:

- `AttendanceSession`
- `AttendanceRecord`
- `FeeDemand`
- `FeePayment`
- `Homework`
- `HomeworkSubmission`
- `Exam`
- `ExamResult`
- `Notice`
- `ReportExportJob`
- `ReportExportFile`
- `BulkJob`
- `TimetableEntry`
- `SchoolDocument`
- `WebsitePage`

### 6.6 Intelligence and AI Governance

Package:

- `com.cloudcampus.intelligence.ai`

Responsibilities:

- Tenant AI entitlement.
- AI usage audit.
- Scoped knowledge retrieval.
- School admin knowledge documents.
- AI recommendations.
- Recommendation approval/reject/accept/execute/dismiss flows.
- Automation rules and runs.
- AI policy governance.

Main entities:

- `AiTenantEntitlement`
- `AiRequestAudit`
- `AiRetrievalAudit`
- `AiKnowledgeDocument`
- `AiRecommendation`
- `AutomationRule`
- `AutomationRun`
- `AiPolicy`

### 6.7 Audit, Events, Notifications, Health

Packages:

- `com.cloudcampus.audit`
- `com.cloudcampus.events.outbox`
- `com.cloudcampus.notification`
- `com.cloudcampus.common.health`

Responsibilities:

- Audit logs.
- Transactional outbox event recording.
- Invitation email delivery.
- Notification delivery records.
- System readiness endpoint.

Main entities:

- `AuditLog`
- `OutboxEvent`
- `NotificationDelivery`

## 7. API Design Overview

API version prefix: `/v1`

Generated contract:

- Runtime JSON: `/v3/api-docs`
- Runtime YAML: `/v3/api-docs.yaml`
- Committed contract: `docs/api/openapi.yaml`
- API guide: `docs/api/README.md` for contract usage, client generation, error codes, versioning, authentication, and examples.
- Swagger UI: disabled by default; enabled in `local`, `dev`, and `staging` profiles.
- Security scheme: HTTP bearer JWT.
- Standard error schema: `ApiErrorResponse`.

Role-oriented namespaces:

- `/v1/auth`: public authentication flows.
- `/v1/invitations`: invitation acceptance.
- `/v1/me`: current user and session actions.
- `/v1/system`: application readiness.
- `/v1/super-admin`: platform owner workflows.
- `/v1/tenant-admin`: tenant-level workflows.
- `/v1/school-admin`: school-level administration.
- `/v1/teacher`: teacher portal.
- `/v1/finance`: finance role portal.
- `/v1/parent`: parent portal.
- `/v1/student`: student portal.
- `/v1/ai`: AI usage, retrieval, and recommendation portal.

Common response patterns:

- Resource DTOs use explicit `Response` record/classes.
- Paged/list APIs commonly use `PageResponse`.
- Error payloads use `ApiErrorResponse`.
- Exceptions are centralized by `RestExceptionHandler`.
- OpenAPI groups are generated for `auth`, `me`, `system`, `super-admin`, `tenant-admin`, `school-admin`, `teacher`, `finance`, `parent`, `student`, and `ai`.
- Representative API examples live in `docs/api/examples/`.
- Public API routes are intentionally limited to login/MFA/refresh/password recovery, invitation acceptance, and system readiness.
- Protected API route metadata is declared in `RoutePolicyRegistry`, enforced by `RoutePolicyEnforcementInterceptor`, and checked by `RouteAuthorizationMatrixTest`.

Common error classes:

- `BadRequestException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`
- `TooManyRequestsException`

## 8. API Catalog

### 8.1 Health and System

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/system/readiness` | Application readiness check. |
| GET | `/actuator/health` | Spring Boot health endpoint. |
| GET | `/actuator/health/readiness` | Kubernetes/Docker readiness probe. |
| GET | `/actuator/prometheus` | Prometheus metrics endpoint. |

### 8.2 Authentication and Current User

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/auth/login` | Login with email/password; may return MFA challenge. |
| POST | `/v1/auth/mfa/verify` | Verify MFA code and issue session tokens. |
| POST | `/v1/auth/refresh` | Rotate/refresh session tokens. |
| POST | `/v1/auth/forgot-password` | Start password reset flow. |
| POST | `/v1/auth/reset-password` | Complete password reset. |
| POST | `/v1/invitations/accept` | Accept invitation and activate user account. |
| GET | `/v1/me` | Current authenticated user profile. |
| GET | `/v1/me/schools` | Schools available to current user. |
| POST | `/v1/me/schools/{schoolId}/activate` | Switch active school context. |
| POST | `/v1/me/change-password` | Change current user's password. |
| POST | `/v1/me/logout` | Logout and revoke current token/session. |

Key DTOs:

- `LoginRequest`
- `MfaVerifyRequest`
- `RefreshRequest`
- `ForgotPasswordRequest`
- `ResetPasswordRequest`
- `ChangePasswordRequest`
- `LogoutRequest`
- `AuthSessionResponse`
- `CurrentUserResponse`
- `SchoolAccessResponse`

### 8.3 Dashboard APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/super-admin/dashboard/summary` | Platform dashboard summary. |
| GET | `/v1/tenant-admin/dashboard/summary` | Tenant dashboard summary. |
| GET | `/v1/school-admin/dashboard/summary` | School admin dashboard summary. |
| GET | `/v1/teacher/dashboard/summary` | Teacher dashboard summary. |
| GET | `/v1/finance/dashboard/summary` | Finance dashboard summary. |
| GET | `/v1/staff/dashboard/summary` | Staff dashboard summary. |
| GET | `/v1/parent/dashboard/summary` | Parent dashboard summary. |
| GET | `/v1/student/dashboard/summary` | Student dashboard summary. |

Key DTOs:

- `DashboardSummaryResponse`
- `DashboardMetricResponse`
- `DashboardItemResponse`

### 8.4 Super Admin Platform APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/super-admin/tenants/onboard` | Onboard a tenant. |
| GET | `/v1/super-admin/tenants` | List tenants. |
| GET | `/v1/super-admin/tenants/{tenantId}` | Tenant detail. |
| PATCH | `/v1/super-admin/tenants/{tenantId}/status` | Change tenant status. |
| PATCH | `/v1/super-admin/tenants/{tenantId}/settings` | Update tenant settings. |
| GET | `/v1/super-admin/tenants/{tenantId}/schools` | List schools in a tenant. |
| GET | `/v1/super-admin/tenants/{tenantId}/users` | List tenant users. |
| GET | `/v1/super-admin/tenants/{tenantId}/audit` | Tenant audit history. |
| GET | `/v1/super-admin/schools` | Platform-wide school list. |
| GET | `/v1/super-admin/schools/{schoolId}` | School detail. |
| GET | `/v1/super-admin/platform-metrics` | Platform metrics. |
| GET | `/v1/super-admin/platform-health` | Platform health summary. |
| GET | `/v1/super-admin/search` | Platform search. |
| GET | `/v1/super-admin/settings` | Platform settings. |
| PATCH | `/v1/super-admin/settings` | Update platform settings. |

### 8.5 Super Admin Revenue, Reports, Notifications

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/super-admin/revenue/summary` | Revenue summary. |
| GET | `/v1/super-admin/revenue/invoices` | Invoice list. |
| GET | `/v1/super-admin/revenue/trends` | Revenue trend data. |
| GET | `/v1/super-admin/revenue/tenants` | Tenant revenue breakdown. |
| GET | `/v1/super-admin/reports/summary` | Platform report summary. |
| GET | `/v1/super-admin/reports/tenants` | Tenant report aggregation. |
| GET | `/v1/super-admin/reports/schools` | School report aggregation. |
| GET | `/v1/super-admin/reports/exports` | List platform report export jobs. |
| POST | `/v1/super-admin/reports/exports` | Create platform report export job. |
| GET | `/v1/super-admin/reports/exports/{jobId}` | Get report export job. |
| GET | `/v1/super-admin/audit-logs` | Platform audit log query. |
| GET | `/v1/super-admin/notifications/summary` | Notification summary. |
| GET | `/v1/super-admin/notifications/deliveries` | Notification deliveries. |
| GET | `/v1/super-admin/notifications/deliveries/{deliveryId}` | Notification delivery detail. |

### 8.6 Super Admin Subscription APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/super-admin/subscriptions/plans` | List subscription plans. |
| POST | `/v1/super-admin/subscriptions/plans` | Create subscription plan. |
| PATCH | `/v1/super-admin/subscriptions/plans/{planId}` | Update subscription plan. |
| GET | `/v1/super-admin/subscriptions/tenants/{tenantId}` | Tenant subscription detail. |
| PUT | `/v1/super-admin/subscriptions/tenants/{tenantId}` | Assign/update tenant subscription. |
| GET | `/v1/super-admin/subscriptions/tenants/{tenantId}/invoices` | Tenant invoices. |

### 8.7 Super Admin Access Control APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/super-admin/users` | List users. |
| GET | `/v1/super-admin/users/{userId}` | User detail. |
| GET | `/v1/super-admin/users/{userId}/roles` | List user role assignments. |
| POST | `/v1/super-admin/users/{userId}/roles` | Assign role. |
| PATCH | `/v1/super-admin/users/{userId}/roles/{roleAssignmentId}` | Update role assignment. |
| DELETE | `/v1/super-admin/users/{userId}/roles/{roleAssignmentId}` | Remove role assignment. |
| GET | `/v1/super-admin/permissions` | Permission catalog. |
| GET | `/v1/super-admin/roles/{role}/permissions` | Role permission mapping. |
| GET | `/v1/super-admin/users/{userId}/permission-overrides` | User overrides. |
| POST | `/v1/super-admin/users/{userId}/permission-overrides` | Create override. |
| PATCH | `/v1/super-admin/users/{userId}/permission-overrides/{overrideId}` | Update override. |
| DELETE | `/v1/super-admin/users/{userId}/permission-overrides/{overrideId}` | Delete override. |
| POST | `/v1/super-admin/students/{studentId}/guardians` | Add guardian link. |
| PATCH | `/v1/super-admin/students/{studentId}/guardians/{guardianLinkId}` | Update guardian link. |
| DELETE | `/v1/super-admin/students/{studentId}/guardians/{guardianLinkId}` | Remove guardian link. |
| POST | `/v1/super-admin/teachers/{teacherUserId}/assignments` | Add teacher assignment. |
| PATCH | `/v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}` | Update teacher assignment. |
| DELETE | `/v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}` | Remove teacher assignment. |

### 8.8 Super Admin AI Governance APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/super-admin/ai/tenants/{tenantId}/entitlement` | Get tenant AI entitlement. |
| PUT | `/v1/super-admin/ai/tenants/{tenantId}/entitlement` | Update tenant AI entitlement. |
| GET | `/v1/super-admin/ai/recommendations` | List AI recommendations. |
| POST | `/v1/super-admin/ai/recommendations` | Create AI recommendation. |
| GET | `/v1/super-admin/ai/recommendations/{id}` | AI recommendation detail. |
| POST | `/v1/super-admin/ai/recommendations/{id}/approve` | Approve recommendation. |
| POST | `/v1/super-admin/ai/recommendations/{id}/reject` | Reject recommendation. |
| POST | `/v1/super-admin/ai/recommendations/{id}/execute` | Execute recommendation. |
| GET | `/v1/super-admin/ai/automation-rules` | List automation rules. |
| POST | `/v1/super-admin/ai/automation-rules` | Create automation rule. |
| PATCH | `/v1/super-admin/ai/automation-rules/{id}` | Update automation rule. |
| GET | `/v1/super-admin/ai/automation-runs` | List automation runs. |
| GET | `/v1/super-admin/ai/policies` | List AI policies. |
| GET | `/v1/super-admin/ai/policies/{tenantId}` | Tenant AI policy. |
| PUT | `/v1/super-admin/ai/policies/{tenantId}` | Update tenant AI policy. |
| GET | `/v1/super-admin/ai/usage/summary` | AI usage summary. |
| GET | `/v1/super-admin/ai/usage/tenants` | Tenant AI usage breakdown. |
| GET | `/v1/super-admin/ai/entitlements` | AI entitlement list. |

### 8.9 Tenant Admin APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/tenant-admin/schools` | List tenant schools. |
| POST | `/v1/tenant-admin/schools` | Create school. |
| PATCH | `/v1/tenant-admin/schools/{schoolId}` | Update school. |
| POST | `/v1/tenant-admin/schools/{schoolId}/deactivate` | Deactivate school. |
| POST | `/v1/tenant-admin/schools/{schoolId}/admins/invite` | Invite school admin. |
| GET | `/v1/tenant-admin/schools/{schoolId}/admins` | List school admins. |
| POST | `/v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation` | Resend admin invitation. |
| DELETE | `/v1/tenant-admin/schools/{schoolId}/admins/{userId}/access` | Revoke admin access. |
| GET | `/v1/tenant-admin/settings` | Tenant settings. |
| PATCH | `/v1/tenant-admin/settings` | Update tenant settings. |
| GET | `/v1/tenant-admin/subscription/usage` | Tenant subscription usage. |
| GET | `/v1/tenant-admin/reports/summary` | Tenant report summary. |
| GET | `/v1/tenant-admin/reports/schools/{schoolId}/summary` | School-level tenant report summary. |

### 8.10 School Admin Settings and Academic APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/school-admin/settings` | School settings. |
| PATCH | `/v1/school-admin/settings` | Update school settings. |
| POST | `/v1/school-admin/academic-years` | Create academic year. |
| GET | `/v1/school-admin/academic-years` | List academic years. |
| POST | `/v1/school-admin/academic-years/{academicYearId}/activate` | Activate academic year. |
| POST | `/v1/school-admin/classes` | Create class level. |
| GET | `/v1/school-admin/classes` | List class levels. |
| POST | `/v1/school-admin/sections` | Create section. |
| GET | `/v1/school-admin/sections` | List sections. |
| POST | `/v1/school-admin/subjects` | Create subject. |
| GET | `/v1/school-admin/subjects` | List subjects. |
| POST | `/v1/school-admin/class-subjects` | Assign subject to class. |
| GET | `/v1/school-admin/class-subjects` | List class-subject assignments. |
| POST | `/v1/school-admin/teacher-assignments` | Assign teacher. |
| GET | `/v1/school-admin/teacher-assignments` | List teacher assignments. |
| GET | `/v1/teacher/assignments` | Teacher assignment portal list. |

### 8.11 Student, Staff, Parent APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/school-admin/students/import/template` | Student import template. |
| POST | `/v1/school-admin/students/import/validate` | Validate import rows. |
| POST | `/v1/school-admin/students/import` | Import students synchronously. |
| POST | `/v1/school-admin/students/import/jobs` | Start student import job. |
| GET | `/v1/school-admin/students/import/jobs/{bulkJobId}` | Student import job detail. |
| GET | `/v1/school-admin/students` | List students. |
| POST | `/v1/school-admin/students/{studentId}/login-invitation` | Invite student login. |
| GET | `/v1/student/profile` | Student self profile. |
| GET | `/v1/school-admin/staff` | Staff directory. |
| GET | `/v1/school-admin/teachers` | Teacher directory. |
| POST | `/v1/school-admin/staff/provision` | Provision staff account/profile. |
| POST | `/v1/school-admin/parent-links` | Link parent to student. |
| GET | `/v1/school-admin/parents` | Parent directory. |
| GET | `/v1/parent/children` | Parent's children. |
| GET | `/v1/parent/children/{studentId}` | Parent child detail. |
| POST | `/v1/parent/children/{studentId}/leave-requests` | Create leave request. |
| GET | `/v1/parent/children/{studentId}/leave-requests` | Parent leave request list. |
| GET | `/v1/school-admin/parent-leave-requests` | School admin leave request list. |
| PATCH | `/v1/school-admin/parent-leave-requests/{leaveRequestId}` | Decide leave request. |

### 8.12 Attendance APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/school-admin/attendance/sessions` | Create attendance session. |
| GET | `/v1/school-admin/attendance/sessions` | List attendance sessions. |
| GET | `/v1/school-admin/attendance/sessions/{sessionId}` | Attendance session detail. |
| POST | `/v1/teacher/attendance/sessions` | Teacher creates attendance session. |
| GET | `/v1/teacher/attendance/sessions` | Teacher attendance sessions. |
| GET | `/v1/teacher/attendance/sessions/{sessionId}` | Teacher attendance session detail. |
| GET | `/v1/parent/children/{studentId}/attendance` | Parent child attendance. |
| GET | `/v1/student/attendance` | Student attendance. |

### 8.13 Finance APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/school-admin/fees/demands` | Create fee demand. |
| POST | `/v1/finance/fees/demands` | Finance creates fee demand. |
| GET | `/v1/school-admin/fees/demands` | School admin fee demands. |
| GET | `/v1/finance/fees/demands` | Finance fee demands. |
| GET | `/v1/school-admin/fees/demands/{demandId}` | School admin fee demand detail. |
| GET | `/v1/finance/fees/demands/{demandId}` | Finance fee demand detail. |
| GET | `/v1/finance/receipts` | Finance receipts. |
| GET | `/v1/finance/reports/summary` | Finance report summary. |
| GET | `/v1/finance/reports/collections` | Collection report. |
| POST | `/v1/school-admin/fees/demands/{demandId}/payments` | Record payment as school admin. |
| POST | `/v1/finance/fees/demands/{demandId}/payments` | Record payment as finance. |
| GET | `/v1/parent/children/{studentId}/fees` | Parent child fee demands. |
| POST | `/v1/parent/children/{studentId}/fees/{demandId}/payments` | Parent payment action. |
| GET | `/v1/student/fees` | Student fee demands. |

### 8.14 Homework APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/school-admin/homework` | Create homework as school admin. |
| GET | `/v1/school-admin/homework` | List homework as school admin. |
| GET | `/v1/school-admin/homework/{homeworkId}` | Homework detail as school admin. |
| POST | `/v1/teacher/homework` | Create homework as teacher. |
| GET | `/v1/teacher/homework` | Teacher homework list. |
| GET | `/v1/teacher/homework/{homeworkId}` | Teacher homework detail. |
| GET | `/v1/parent/children/{studentId}/homework` | Parent child homework. |
| GET | `/v1/student/homework` | Student homework. |
| POST | `/v1/student/homework/{homeworkId}/submissions` | Student homework submission. |

### 8.15 Exam and Result APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/school-admin/exams` | Create exam. |
| GET | `/v1/school-admin/exams` | List exams. |
| GET | `/v1/school-admin/exams/{examId}` | Exam detail. |
| POST | `/v1/school-admin/exams/{examId}/results` | Enter exam results as school admin. |
| POST | `/v1/school-admin/exams/{examId}/publish` | Publish exam results. |
| GET | `/v1/teacher/exams` | Teacher exam list. |
| GET | `/v1/teacher/exams/{examId}` | Teacher exam detail. |
| GET | `/v1/teacher/exams/{examId}/roster` | Teacher exam roster. |
| POST | `/v1/teacher/exams/{examId}/results` | Enter exam results as teacher. |
| GET | `/v1/parent/children/{studentId}/results` | Parent child results. |
| GET | `/v1/student/results` | Student results. |

### 8.16 Notices, Reports, Bulk Jobs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/school-admin/notices` | Create notice. |
| GET | `/v1/school-admin/notices` | List notices. |
| GET | `/v1/school-admin/notices/{noticeId}` | Notice detail. |
| POST | `/v1/school-admin/notices/{noticeId}/publish` | Publish notice. |
| GET | `/v1/teacher/notices` | Teacher notices. |
| GET | `/v1/parent/children/{studentId}/notices` | Parent child notices. |
| GET | `/v1/student/notices` | Student notices. |
| POST | `/v1/school-admin/reports/exports` | Create school admin report export. |
| POST | `/v1/finance/reports/exports` | Create finance report export. |
| GET | `/v1/school-admin/reports/exports` | List school admin exports. |
| GET | `/v1/finance/reports/exports` | List finance exports. |
| GET | `/v1/school-admin/reports/exports/{exportId}` | School admin export detail. |
| GET | `/v1/finance/reports/exports/{exportId}` | Finance export detail. |
| GET | `/v1/school-admin/reports/exports/{exportId}/download` | Download school admin export. |
| GET | `/v1/finance/reports/exports/{exportId}/download` | Download finance export. |
| POST | `/v1/school-admin/bulk-jobs` | Create bulk job. |
| GET | `/v1/school-admin/bulk-jobs` | List bulk jobs. |
| GET | `/v1/school-admin/bulk-jobs/{bulkJobId}` | Bulk job detail. |
| POST | `/v1/school-admin/bulk-jobs/{bulkJobId}/cancel` | Cancel bulk job. |

### 8.17 Timetable, Documents, Website APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/school-admin/timetable` | Create timetable entry. |
| GET | `/v1/school-admin/timetable` | List timetable entries. |
| GET | `/v1/school-admin/timetable/{timetableEntryId}` | Timetable entry detail. |
| GET | `/v1/teacher/timetable` | Teacher timetable. |
| GET | `/v1/parent/children/{studentId}/timetable` | Parent child timetable. |
| GET | `/v1/student/timetable` | Student timetable. |
| POST | `/v1/school-admin/documents` | Create school document record. |
| GET | `/v1/school-admin/documents` | List school documents. |
| GET | `/v1/school-admin/documents/{documentId}` | School document detail. |
| POST | `/v1/school-admin/website/pages` | Create website page. |
| GET | `/v1/school-admin/website/pages` | List website pages. |
| GET | `/v1/school-admin/website/pages/{pageId}` | Website page detail. |
| POST | `/v1/school-admin/website/pages/{pageId}/publish` | Publish website page. |

### 8.18 AI Portal APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/ai/entitlement` | Current tenant/user AI entitlement. |
| POST | `/v1/ai/usage/audit` | Record AI usage audit. |
| POST | `/v1/ai/knowledge/search` | Scoped AI knowledge search. |
| POST | `/v1/school-admin/ai/knowledge-documents` | Add AI knowledge document. |
| GET | `/v1/school-admin/ai/knowledge-documents` | List AI knowledge documents. |
| GET | `/v1/ai/recommendations` | List AI recommendations for portal. |
| GET | `/v1/ai/recommendations/{id}` | AI recommendation detail. |
| POST | `/v1/ai/recommendations/{id}/approve` | Approve recommendation. |
| POST | `/v1/ai/recommendations/{id}/reject` | Reject recommendation. |
| POST | `/v1/ai/recommendations/{id}/accept` | Accept recommendation. |
| POST | `/v1/ai/recommendations/{id}/execute` | Execute recommendation. |
| POST | `/v1/ai/recommendations/{id}/dismiss` | Dismiss recommendation. |
| GET | `/v1/ai/automation-rules` | List automation rules. |
| PATCH | `/v1/ai/automation-rules/{id}` | Update automation rule. |
| GET | `/v1/ai/automation-runs` | List automation runs. |

## 9. Database and Migrations

Migration directory:

```text
backend/src/main/resources/db/migration/
```

Migration strategy:

- Flyway owns schema creation and evolution.
- JPA validates schema at startup using `ddl-auto=validate`.
- Tables use UUID primary keys in the domain model.
- Most domain tables include tenant and/or school foreign keys.
- Indexes exist for tenant, school, status, created date, and query-heavy reports.

Migration inventory:

| Version | Purpose |
| --- | --- |
| V1 | Baseline onboarding: tenants, schools, users, invitations, user school access. |
| V2 | Audit logs. |
| V3 | Auth session lifecycle: refresh tokens, revoked access tokens, password reset tokens. |
| V4 | MFA challenges. |
| V5 | Parent-child linking and students. |
| V6 | Academic lifecycle: academic years, classes, sections. |
| V7 | Student import foundation. |
| V8 | Academic assignment foundation: subjects, class subjects, teacher assignments. |
| V9 | Staff/teacher provisioning. |
| V10 | Transactional outbox. |
| V11 | Bulk jobs. |
| V12 | Student import jobs. |
| V13 | Student login provisioning. |
| V14 | Fee payment receipts. |
| V15 | Attendance foundation. |
| V16 | Homework foundation. |
| V17 | Exam result foundation. |
| V18 | Notice foundation. |
| V19 | Report export foundation. |
| V20 | Tenant school limits. |
| V21 | Tenant settings. |
| V22 | Notification delivery. |
| V23 | Subscription plan catalog. |
| V24 | Parent leave requests. |
| V25 | AI entitlement and audit foundation. |
| V26 | AI scoped knowledge retrieval. |
| V27 | Timetable, document, website foundation. |
| V28 | Super admin scale foundation, stats, indexes. |
| V29 | Access control and AI governance. |
| V30 | Remove guest enquiry management. |

Major tables:

- Platform: `tenants`, `schools`, `platform_stats`, `tenant_stats`, `school_stats`, `platform_settings`
- Identity: `user_accounts`, `invitations`, `refresh_tokens`, `revoked_access_tokens`, `password_reset_tokens`, `mfa_challenges`
- Access control: `permissions`, `role_permissions`, `user_roles`, `user_permission_overrides`, `user_school_access`
- Academic: `academic_years`, `class_levels`, `sections`, `subjects`, `class_subject_assignments`, `teacher_assignments`
- People: `students`, `student_user_links`, `parent_student_links`, `student_guardians`, `staff_profiles`, `parent_leave_requests`
- Operations: `attendance_sessions`, `attendance_records`, `fee_demands`, `fee_payments`, `homework_assignments`, `homework_submissions`, `exams`, `exam_results`, `notices`, `timetable_entries`, `school_documents`, `website_pages`
- Reporting/jobs: `bulk_jobs`, `report_export_jobs`, `report_export_files`
- AI: `ai_tenant_entitlements`, `ai_request_audits`, `ai_retrieval_audits`, `ai_knowledge_documents`, `ai_recommendations`, `automation_rules`, `automation_runs`, `ai_policies`
- Events/audit/notifications: `audit_logs`, `outbox_events`, `notification_deliveries`

Important constraints and patterns:

- Unique admission number per school.
- Unique parent-student link.
- Unique website slug per school.
- Unique report export file per report export job.
- Unique outbox event key.
- Permission codes are unique.
- Role-permission pairs are unique.
- Automation rule code is unique per tenant/school scope.
- AI policy scope is unique per tenant/school.

## 10. Security Architecture

Current security-related behavior visible in code structure:

- JWT access tokens.
- Refresh token persistence and rotation.
- Access token revocation table.
- Password reset token table.
- MFA challenge table.
- Login rate limiter service.
- User status model.
- Role model.
- Permission catalog and overrides.
- School access repository and service.
- Active school switching endpoint.
- Tenant context spoofing filter.
- Correlation ID filter.
- Request context resolver.
- Route policy registry and enforcement interceptor.
- Authorization guard.
- Centralized unauthorized/forbidden exceptions.
- Production readiness validator that prevents unsafe configuration.

Security strengths:

- Production validator exists and is tested.
- Tenant/school isolation has dedicated tests.
- Hard-coded main-school resolution has tests.
- Spoofed tenant context has tests.
- School-scoped controller guard coverage exists.
- Route authorization matrix coverage exists for every `/v1` controller route.
- Runtime route policy enforcement now fail-closes unknown `/v1` routes, allows only explicitly public routes without authentication, and checks roles/permissions for protected route families.
- `AuthorizationGuardTest` covers negative security checks for tenant scope, active school scope, parent/student relationship, student self access, teacher class-section assignment, and finance permission boundaries.
- Teacher portal flow tests now cover class/subject assignment boundaries plus same-class section spoofing for attendance and section-scoped notice visibility.
- `RoutePolicyEnforcementInterceptorTest` covers public-route access, missing authentication, wrong role, required role, permission-only AI access, unknown-route fail-closed behavior, and tenant/school/finance role separation.
- `CorrelationIdFilterTest` covers generated, preserved, rejected, and MDC-cleared correlation IDs.
- Passwords are not represented as plaintext in account model.
- Token hash fields are unique in persistence.

### 10.1 Route Authorization Matrix

`RoutePolicyRegistry` is the current source of route-level authorization metadata. `RoutePolicyEnforcementInterceptor` applies that metadata to `/v1/**` requests before controller execution. It allows explicitly public routes, requires authenticated `RequestContext` for protected routes, checks route roles/permissions, enforces active-school access for school-scoped route families, and fail-closes unknown versioned routes.

| Route family | Policy posture | Scope notes |
| --- | --- | --- |
| `POST /v1/auth/login` | Public | Authenticates by credential material. |
| `POST /v1/auth/mfa/verify` | Public | Authenticates by MFA challenge material. |
| `POST /v1/auth/refresh` | Public | Authenticates by refresh token material. |
| `POST /v1/auth/forgot-password` | Public | Starts recovery by public identifier. |
| `POST /v1/auth/reset-password` | Public | Authenticates by reset token material. |
| `POST /v1/invitations/accept` | Public | Authenticates by invitation token material. |
| `GET /v1/system/readiness` | Public | Deployment readiness check. |
| `/v1/me` | Protected | Authenticated user/session state; authenticated guests may inspect their own session shape. |
| `/v1/me/**` | Protected | Current-user subresources and active-school changes remain school scoped; guests are not allowed. |
| `/v1/super-admin/**` | Protected | Super-admin platform control plane. |
| `/v1/tenant-admin/**` | Protected | Tenant-admin control plane; school path variables are object scoped. |
| `/v1/school-admin/**` | Protected | School-scoped administration; specialized finance, report, student, document, and AI subpaths carry more specific metadata. |
| `/v1/teacher/**` | Protected | Teacher role with class/section object guards. |
| `/v1/finance/**` | Protected | Finance staff or school admin with finance permissions and school access. |
| `/v1/parent/**` | Protected | Parent role with linked-child object guards. |
| `/v1/student/**` | Protected | Student role with active student-user link guards. |
| `/v1/staff/**` | Protected | Office/staff school namespace. |
| `/v1/ai/**` | Protected | Role and permission scoped AI portal/retrieval/usage surface. |

`RouteAuthorizationMatrixTest` asks Spring for the actual handler mappings and fails if any `/v1` route does not resolve to a public or protected policy. It also asserts that the public surface is exactly the approved set above, that the interceptor is registered in the real application context, and that exact policy matches such as `/v1/me` win over wildcard matches such as `/v1/me/**`.

`RoutePolicyEnforcementInterceptorTest` covers runtime behavior directly: public login remains accessible without authentication, protected routes require authentication, wrong-role access is denied, non-role-locked AI routes can be allowed by permission, unknown `/v1` paths fail closed, and tenant-admin, school-admin, and finance namespaces reject mismatched roles.

### 10.2 Authorization Guard Foundation

`AuthorizationGuard` centralizes common checks that should gradually replace repeated hand-written guard code in high-risk flows. The current helper covers:

- Authenticated context presence.
- Required roles and permissions.
- Tenant scope and active-school scope.
- User-school access grants.
- Grant-only school switching validation for active-school changes.
- Parent-to-student links.
- Student self-record links.
- Teacher class and section assignments.
- Student record visibility across school admin, staff, parent, student, and teacher roles.
- Teacher class, school, section, and subject scope checks through `requireTeacherAssignedToScope`.
- Fee demand/payment visibility across finance staff, school admin, parent, and student roles.

The guard is deliberately additive in this phase. Existing service-level checks remain in place; migrated workflows should adopt this guard one flow at a time and keep negative tests near each workflow. Active-school switching now resolves a `RequestContext`, checks tenant and user-school grant scope through `AuthorizationGuard`, and rejects inactive schools even when an old grant still exists. Parent-facing child detail, attendance, fees, homework, results, notices, timetable, and leave-request flows now receive `RequestContext` and authorize `studentId` path parameters through `AuthorizationGuard`. Student-facing profile, attendance, fee, homework, homework-submission, result, notice, and timetable flows now also receive `RequestContext`, require an active student-user link, and verify the linked student remains inside the authenticated tenant and active school. Teacher-facing assignment, attendance, homework, exam, notice, and timetable flows now receive `RequestContext` where relevant and enforce active-school, tenant, class, section, and subject boundaries through `AuthorizationGuard` plus assignment-aware service checks.

### 10.3 Correlation IDs

`CorrelationIdFilter` resolves one correlation ID per request before tenant context spoofing checks run. Safe caller-supplied IDs from `X-Correlation-Id`, `X-Correlation-ID`, `X-Request-Id`, or `X-Request-ID` are preserved if they match the safe character/length policy. Missing or unsafe values are replaced with a UUID. The resolved value is:

- Attached to the servlet request as `RequestContextAttributes.CORRELATION_ID`.
- Returned on every response as `X-Correlation-Id`.
- Stored in MDC as `correlationId` during request handling.
- Reused by `RequestContextFactory`.

Security gaps to improve:

- Add a full Spring Security filter chain if not already planned, complementing the route policy interceptor with framework-level auth rules.
- Enrich endpoint-level OpenAPI annotations over time with more operation summaries, examples, and permission descriptions.
- Add refresh-token reuse detection alerts.
- Add account lockout and admin unlock workflow.
- Persist correlation IDs consistently into audit logs, outbox events, report exports, and notification delivery records.
- Add rate limits beyond login for sensitive write endpoints.
- Add structured security event logs for SIEM integration.

## 11. Multi-Tenancy and School Isolation

The model uses tenant and school identifiers throughout the domain:

- `tenant_id` separates customer organizations.
- `school_id` separates schools within a tenant.
- Users can have school access grants.
- Active school context is selected through `/v1/me/schools/{schoolId}/activate`.
- Many APIs are role and school scoped.
- Tests specifically cover school access isolation and tenant context spoofing.

Implemented:

- `RequestContext` now contains user, tenant, active school, roles, permissions, correlation ID, request source, and super-admin flag.
- `AuthenticatedUserResolver` caches the authenticated user and context on the servlet request after the first token validation.
- `RequestContextResolver` exposes the cached context to future services/controllers without revalidating the bearer token.
- Context permissions are derived from existing role permissions and user permission overrides, with fetch queries to avoid per-permission lazy loading.
- `CorrelationIdFilter` resolves request correlation before tenant context spoofing rejection, so rejected client-supplied tenant/school headers can still be traced.
- `AuthorizationGuard` now provides reusable tenant, school, relationship, assignment, and finance checks for future service migration.
- Active-school activation now uses `RequestContextResolver` and `AuthorizationGuard` for tenant/grant validation, and it blocks deactivated schools with stale grants.
- Parent-facing student-resource flows now use `RequestContextResolver` at the controller boundary and `AuthorizationGuard` inside services for linked-child and active-school object checks.
- Student-facing self-service flows now use `RequestContextResolver` at the controller boundary and `AuthorizationGuard` inside services for active student-user link, tenant, and active-school object checks.
- Teacher-facing assignment, attendance, homework, exam, notice, and timetable flows now use `RequestContextResolver` at the controller boundary and assignment-aware `AuthorizationGuard` checks in service logic.

Future improvement:

- Continue migrating finance, school-admin, tenant-admin, and super-admin ID-based services to accept `RequestContext` directly instead of extracting request/user state independently.
- Add repository-level tenant/school guard helpers to reduce risk of missing filters.

## 12. Audit and Eventing

Audit:

- `AuditLog`
- `AuditLogService`
- `AuditAction`
- `AuditCoverageMatrixTest`

Eventing:

- `OutboxEvent`
- `OutboxEventRepository`
- `TransactionalOutboxService`
- `OutboxEventStatus`

Pattern:

- Domain actions can write audit logs.
- Important asynchronous side effects can be recorded into an outbox table.
- Outbox rows include status, attempts, next attempt, lock metadata, and payload.

Future improvement:

- Add an outbox worker that publishes to an external message broker or webhook dispatcher.
- Add dead-letter handling for permanently failed outbox events.
- Add idempotency keys on write APIs that can be retried by clients.
- Add event schema versioning.

## 13. Production Deployment Architecture

Current production deployment structure:

```text
Client / future frontend
  -> HTTPS reverse proxy or load balancer
  -> cloudcampus-backend container
  -> PostgreSQL
```

Current container hardening:

- Backend service can run read-only in production compose.
- `/tmp` is mounted as tmpfs.
- `no-new-privileges` enabled.
- Private Docker network exists.
- Log rotation enabled.
- Graceful shutdown period configured.
- JVM options configurable.
- Docker healthcheck targets readiness endpoint.

Required before real traffic:

- Store `.env.production` outside git.
- Use real secret manager or locked-down host env file.
- Put HTTPS in front of the backend.
- Publish images to a trusted registry.
- Use managed PostgreSQL or hardened self-managed PostgreSQL.
- Test backup and restore.
- Add monitoring and alerting.
- Configure domain-specific CORS.
- Configure SMTP or transactional email provider.

## 14. CI and Verification

Current CI:

- `.github/workflows/backend-ci.yml`
- Java 21 setup.
- Dedicated OpenAPI generation verification with `mvn -B -Dtest=OpenApiContractTest test`.
- Maven test.
- Docker Compose config validation.
- Docker image build.

Current local verification commands:

```bash
make test
make image
make compose-local
make compose-staging
make compose-prod
make preflight-prod
make smoke-local
```

Current test suite covers:

- Application boot.
- Production readiness validation.
- Auth session flow.
- Tenant context spoofing.
- School isolation.
- Controller guard coverage.
- Onboarding.
- Dashboard summaries.
- Academic lifecycle.
- Academic assignments.
- Staff provisioning.
- Student import.
- Student login provisioning.
- Parent-child linking.
- Parent leave requests.
- Fees.
- Attendance.
- Homework.
- Exams.
- Notices.
- Report exports.
- Outbox flow.
- AI governance.
- AI retrieval.
- Subscription.
- Super admin platform control.
- Tenant admin school/settings/reporting.
- School settings.
- Request context resolution, request-scoped caching, tenant/school UUID scope, role/permission snapshotting, and deny override behavior.
- Correlation ID generation, preservation, unsafe-value replacement, response header emission, and MDC cleanup.
- Route authorization metadata coverage for every `/v1` controller route, exact public-route surface, exact-match policy precedence, application-context interceptor registration, and runtime enforcement behavior.
- Authorization guard negative checks for high-risk tenant, school, parent/student, student self, teacher assignment, and finance boundaries.
- Teacher object-authorization checks for own assignments, assigned attendance/homework/exam flows, unassigned class/subject rejection, same-class section spoofing rejection, and section-scoped notice visibility.
- OpenAPI metadata, JWT scheme, grouped specs, YAML generation, and error schema generation.

## 15. Current Strengths

- Clear modular monolith package layout.
- Role-oriented API namespaces.
- Rich domain coverage for a school ERP.
- Flyway-first schema management.
- Multi-tenant and school-scoped design.
- Tests exist for many end-to-end flows.
- Production readiness validator exists.
- Deployment scripts and Makefile exist.
- Docker image build is verified.
- Actuator and Prometheus support exist.
- Audit and outbox foundations exist.
- Request context foundation now exists for centralized user, tenant, school, role, permission, correlation, and source metadata.
- Route authorization metadata is centrally declared, tested against Spring MVC handler mappings, and enforced before protected controller execution.
- Authorization guard foundation exists for reusable object-level security checks.
- Teacher portal workflows now use `RequestContext` and assignment-aware object checks across assignments, attendance, homework, exams, notices, and timetable.
- Correlation IDs are resolved once per request and exposed to logs, responses, and `RequestContext`.
- AI governance is modeled as a first-class area, not an afterthought.
- OpenAPI contract generation and API examples are now committed.
- CI verifies that the OpenAPI contract can be generated without boot errors.

## 16. Current Risks and Gaps

### High Priority

- Route-level authorization is now centrally enforced, and active-school switching plus parent-facing, student-facing, and teacher-facing flows have adopted `RequestContext` plus `AuthorizationGuard` where relevant; finance/admin ID-based endpoints still need broader service-level guard adoption for object boundaries.
- ID-based endpoints need broader adoption of `AuthorizationGuard` for finance, school-admin, tenant-admin, super-admin, report/export, bulk/import, document, and AI knowledge-document scope.
- Production secrets and SMTP are placeholders until real values are configured.
- Real backup restore has not been proven in a staging restore drill.
- No external observability stack is committed.
- No frontend/mobile clients currently exist on `main`.

### Medium Priority

- API idempotency is not clearly standardized.
- Pagination/filter/sort conventions should be documented consistently, with cursor pagination for large collections.
- Error codes and versioning now have first-pass docs in `docs/api/README.md`; they should be expanded as field-level validation and client contracts mature.
- Async report/export/outbox workers need production-level retry and failure handling.
- Database migration rollback strategy is not documented.
- Performance baseline and load tests were removed with the wider repo cleanup.
- PostgreSQL behavior should be proven with Testcontainers, query-plan review, realistic seed data, and partitioning strategy for hot tables.

### Lower Priority

- Some empty package placeholders remain.
- API examples now cover major role flows; coverage should be expanded toward every endpoint as frontend/mobile work starts.
- Architecture diagrams should be generated from this report.
- Developer onboarding docs can be improved after frontend/mobile return.

## 17. Recommended Future Improvement Roadmap

Scale target: 10,000+ schools and 10 million students. The roadmap keeps CloudCampus as a disciplined modular monolith first, then adds infrastructure around the backend before considering service splits.

### Phase 1: API Contract and Developer Experience

- Completed: add `springdoc-openapi` and generate `/v3/api-docs`.
- Completed: commit `docs/api/openapi.yaml`.
- Completed: add request/response examples for every major role namespace.
- Completed: add a first-pass error code catalog.
- Completed: add API versioning policy.
- Completed: add frontend/mobile client generation guidance.
- Next: enrich per-operation OpenAPI annotations and examples for every endpoint.
- Add Postman/Bruno collection generated from OpenAPI.

### Phase 2: Security Hardening

- Completed: add a single `RequestContext` resolved once per request with user, tenant, school, roles, permissions, correlation ID, request source, and super-admin flag.
- Completed: cache authenticated user and request context on `HttpServletRequest` to avoid repeated token/database resolution in one request.
- Completed: add request-context tests for tenant/school UUID scope, role/permission snapshots, and permission-deny overrides.
- Completed: centralize route authorization metadata with `RoutePolicyRegistry`.
- Completed: add `RouteAuthorizationMatrixTest` proving every `/v1` endpoint has auth policy metadata and only approved endpoints are public.
- Completed: add `RoutePolicyEnforcementInterceptor` so `/v1/**` route metadata is enforced at runtime.
- Completed: add runtime route policy tests for public routes, missing auth, wrong role, required role, permission-based AI access, fail-closed unknown routes, exact-match precedence, and tenant/school/finance namespace separation.
- Completed: add `AuthorizationGuard` foundation and negative tests for high-risk boundaries.
- Completed: add centralized correlation ID filter and tests.
- Completed: migrate active-school switching to accept `RequestContext`, validate tenant/grant scope through `AuthorizationGuard`, and reject inactive schools with stale grants.
- Completed: migrate parent-facing child detail, attendance, fee, homework, result, notice, timetable, and leave-request flows to accept `RequestContext` and use `AuthorizationGuard` for student object authorization.
- Completed: migrate student-facing profile, attendance, fee, homework, homework-submission, result, notice, and timetable flows to accept `RequestContext` and use `AuthorizationGuard` for active student-user link, tenant, and active-school object authorization.
- Completed: migrate teacher assignment, attendance, homework, exam, notice, and timetable flows to accept `RequestContext` and use assignment-aware `AuthorizationGuard` checks for active school, class, section, and subject scope.
- Next: migrate finance, school-admin, tenant-admin, and super-admin ID-based flows to accept `RequestContext` and `AuthorizationGuard` directly.
- Add object-level authorization tests for every ID-based endpoint as services migrate.
- Add account lockout/unlock workflow.
- Add MFA enrollment/disable flow.
- Add refresh-token reuse detection.
- Add sensitive action re-authentication for super admin and finance.

### Phase 3: Production Operations

- Add image publishing to GitHub Container Registry or another registry.
- Add staging deployment workflow.
- Add production deployment workflow with manual approval.
- Add backup restore script and restore drill doc.
- Add Prometheus/Grafana or cloud monitoring guide.
- Add structured JSON logging.
- Add OpenTelemetry traces and correlation IDs.
- Add error tracking integration.
- Add database migration pre-checks.

### Phase 4: Data and Performance

- Add load tests for login, dashboard, student list, fee list, and report export.
- Add query plan review for dashboard/report endpoints.
- Add database connection pool tuning.
- Add indexes based on real query logs.
- Add PostgreSQL Testcontainers for Flyway and persistence correctness.
- Add cursor pagination for students, audit logs, receipts, attendance records, notifications, AI audits, and report/export lists.
- Add Redis or Valkey for rate limiting, idempotency keys, and short-lived caches.
- Add object storage for reports, imports, receipts, documents, and media.
- Add cache strategy for dashboard summary and static catalog data.
- Add archiving strategy for audit logs, AI audits, notification deliveries, and outbox events.

### Phase 5: Frontend and Mobile Reintroduction

- Reintroduce frontend as a separate app directory or separate repo.
- Generate typed API clients from OpenAPI.
- Build role-specific UI shells:
  - Super admin
  - Tenant admin
  - School admin
  - Teacher
  - Finance
  - Parent
  - Student
- Reintroduce mobile only after core API contract stabilizes.

### Phase 6: SaaS Scale

- Add tenant plan enforcement at service boundaries.
- Add per-tenant rate limiting.
- Add tenant usage metering.
- Add billing provider integration.
- Add support tooling for impersonation with strict audit.
- Add data export and tenant offboarding.
- Add disaster recovery runbook.

### Twelve-Month Scale Roadmap

| Period | Theme | Deliverables |
| --- | --- | --- |
| Months 1-2 | Contract and security foundation | Completed OpenAPI baseline, `RequestContext`, route policy metadata, runtime policy enforcement, authorization matrix, correlation ID filter, guard foundation, and teacher-flow object authorization; next deliver finance/admin object-level auth and PostgreSQL Testcontainers. |
| Months 3-4 | Scale foundation | Redis/Valkey, object storage, outbox/notification/report workers, cursor pagination, indexes, load tests, structured logs, and OpenTelemetry. |
| Months 5-6 | Production operations | Managed PostgreSQL, read replica, restore drills, CI/CD, registry, secrets manager, WAF/CDN, dashboards, alerts, and SLOs. |
| Months 7-9 | UX and client apps | Admin web app, teacher attendance flow, finance collection flow, parent mobile-first portal, student portal, localization, and accessibility. |
| Months 10-12 | SaaS scale | Tenant metering, plan enforcement, billing integration, support tools, audit archive, analytics database, search service, partitioned hot tables, and disaster recovery region. |

## 18. Suggested Architecture Diagrams to Add Later

Recommended diagrams:

- System context diagram.
- Container diagram.
- Module/package diagram.
- Auth/session sequence diagram.
- Tenant onboarding sequence diagram.
- Student import sequence diagram.
- Fee payment sequence diagram.
- Report export async sequence diagram.
- AI recommendation governance sequence diagram.
- Database ERD.

Suggested tool:

- Mermaid diagrams in Markdown for lightweight docs.
- Later, generate diagrams from OpenAPI and JPA metadata.

## 19. Immediate Next Actions

Best next engineering tasks:

1. Migrate finance fee/payment/receipt/report flows to accept `RequestContext` and `AuthorizationGuard` directly.
2. Add object-level authorization tests for every ID-based endpoint.
3. Persist correlation IDs into audit, outbox, report export, and notification delivery records.
4. Add PostgreSQL Testcontainers for migration and persistence correctness.
5. Add cursor pagination for large collections.
6. Add load tests for login, dashboard, student search, attendance, fee list, and report export.
7. Add Redis/Valkey for rate limiting, idempotency keys, and short-lived caches.
8. Add object storage abstraction for reports, imports, receipts, documents, and media.
9. Add outbox, report export, import, and notification workers with retry/dead-letter handling.
10. Add structured JSON logging, OpenTelemetry tracing, dashboards, and alerts.
11. Add production restore drill documentation.

## 20. Final Assessment

CloudCampus backend is in a good position for future improvement. The strongest decision so far is keeping the backend-only codebase clean while preserving a production-oriented deployment structure. The codebase already has enough domain depth to support real product planning. Recent updates now add API contract discipline plus centralized request/security foundations: generated OpenAPI, committed examples, merged API guidance, CI verification, request-scoped authenticated-user caching, effective role/permission snapshots, enforced route authorization metadata, correlation IDs, reusable authorization guard helpers, and teacher portal object authorization.

For a 10-million-student target, the next biggest unlock is service and scale discipline: finish finance/admin/super-admin adoption of `RequestContext` and `AuthorizationGuard`, add PostgreSQL-scale pagination/indexing, async workers, object storage, observability, restore drills, and negative tests for every cross-tenant, cross-school, finance, report/export, bulk/import, document, AI, and super-admin boundary.
