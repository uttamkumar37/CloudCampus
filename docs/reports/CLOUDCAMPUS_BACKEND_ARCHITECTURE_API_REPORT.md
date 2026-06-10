# CloudCampus Backend Architecture and API Report

Generated on: 2026-06-10  
Branch reviewed: `main`  
Current repository shape: backend-only production deployment structure

## 1. Executive Summary

CloudCampus is currently a Java 21 Spring Boot backend for a school ERP SaaS platform. The `main` branch has intentionally been reduced to backend-only code so frontend, mobile, broader infrastructure, and performance surfaces can be reintroduced later in separate phases.

The backend is already more than a simple starter service. It contains multi-tenant onboarding, school administration, user/session management, RBAC-style access control, academic setup, student/staff/parent workflows, finance, attendance, homework, exams, notices, reports, AI governance, dashboard summaries, platform administration, deployment scripts, Docker Compose files, and CI.

Current verified state:

- Backend tests: `169` passing.
- Docker image build: verified.
- Docker Compose config validation: verified.
- Main branch push: completed.
- Current production readiness: structurally ready, but still needs real production secrets, HTTPS/load balancer, registry publishing, external monitoring, SMTP, and tested backup restore.

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
- Centralized unauthorized/forbidden exceptions.
- Production readiness validator that prevents unsafe configuration.

Security strengths:

- Production validator exists and is tested.
- Tenant/school isolation has dedicated tests.
- Hard-coded main-school resolution has tests.
- Spoofed tenant context has tests.
- School-scoped controller guard coverage exists.
- Passwords are not represented as plaintext in account model.
- Token hash fields are unique in persistence.

Security gaps to improve:

- Add a full Spring Security filter chain if not already planned, including route-level authorization rules.
- Generate OpenAPI security documentation for each endpoint.
- Add explicit permission annotations or a policy interceptor to avoid scattered manual authorization.
- Add refresh-token reuse detection alerts.
- Add account lockout and admin unlock workflow.
- Add audit event correlation IDs consistently across all write endpoints.
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

Future improvement:

- Introduce a single explicit `RequestContext` object that contains user, tenant, school, roles, permissions, correlation ID, and request source.
- Make all service methods accept the context instead of extracting request/user state independently.
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
- AI governance is modeled as a first-class area, not an afterthought.

## 16. Current Risks and Gaps

### High Priority

- No generated OpenAPI contract currently committed.
- Authorization rules should be made more declarative and centrally auditable.
- Production secrets and SMTP are placeholders until real values are configured.
- Real backup restore has not been proven in a staging restore drill.
- No external observability stack is committed.
- No frontend/mobile clients currently exist on `main`.

### Medium Priority

- API idempotency is not clearly standardized.
- Pagination/filter/sort conventions should be documented consistently.
- Error codes should be cataloged and versioned.
- Async report/export/outbox workers need production-level retry and failure handling.
- Database migration rollback strategy is not documented.
- Performance baseline and load tests were removed with the wider repo cleanup.

### Lower Priority

- Some empty package placeholders remain.
- API examples should be expanded for each client role.
- Architecture diagrams should be generated from this report.
- Developer onboarding docs can be improved after frontend/mobile return.

## 17. Recommended Future Improvement Roadmap

### Phase 1: API Contract and Developer Experience

- Add `springdoc-openapi` and generate `/v3/api-docs`.
- Commit `docs/api/openapi.yaml`.
- Add request/response examples for every endpoint group.
- Add a consistent error code catalog.
- Add API changelog and versioning policy.
- Add Postman/Bruno collection generated from OpenAPI.

### Phase 2: Security Hardening

- Centralize authorization with explicit permissions.
- Add permission annotations or route policy registry.
- Add automated tests proving every endpoint has an auth policy.
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
- Add error tracking integration.
- Add database migration pre-checks.

### Phase 4: Data and Performance

- Add load tests for login, dashboard, student list, fee list, and report export.
- Add query plan review for dashboard/report endpoints.
- Add database connection pool tuning.
- Add indexes based on real query logs.
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

1. Add OpenAPI generation and commit the generated API contract.
2. Create an API examples file for each role namespace.
3. Add a route authorization matrix test that fails if new endpoints are not registered.
4. Add production restore drill documentation.
5. Add structured JSON logging for production profile.
6. Add a real staging `.env` template with every required variable explained.
7. Add CI artifact upload for test reports and the built image metadata.

## 20. Final Assessment

CloudCampus backend is in a good position for future improvement. The strongest decision so far is keeping the backend-only `main` clean while preserving a production-oriented deployment structure. The codebase already has enough domain depth to support real product planning, and the next biggest unlock is API contract discipline: OpenAPI, examples, authorization matrix, and client generation.

Once those are in place, frontend and mobile can be added back with much less guessing and much lower integration risk.
