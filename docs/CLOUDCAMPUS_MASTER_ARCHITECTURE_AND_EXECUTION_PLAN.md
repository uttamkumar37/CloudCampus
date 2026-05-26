# CloudCampus Master Architecture and Execution Plan

Validation date: 2026-05-26, Asia/Kolkata. Historical code audit was performed on branch `project-redesign` at commit `a3c4328`; current scaffold recheck was performed after the redesign cleanup.

Current redesign state: after cleanup, the legacy application source is deleted from the working tree and a clean CloudCampus monorepo scaffold has been created. STRUCT-002 added minimal backend, frontend, and mobile build manifests plus tested baseline app shells. ONB-001, AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005/SEC-004, ONB-002, ONB-003, ONB-004, SEC-001, SEC-003, PAR-001, ACA-001, STU-001, STAFF-001, ACA-002, AUD-001, EVT-001, BULK-001, STU-002, STU-003, FEE-001, CI-001, FRONT-AUTH-001, ATT-001, HOME-001, EXAM-001, NOTE-001, REP-001, MUL-001, MUL-002, MUL-003, MUL-004, MUL-005, MUL-006, and MUL-007 are verified in the current scaffold. SEC-006 is implemented as current-scaffold guard coverage: attendance, homework, exams/results, notices, and report exports now have guarded School Admin/Teacher or School Admin routes; homework, results, and notices also have parent/student visibility guards; no broad timetable/document/website business controllers exist yet; and a regression test fails future unguarded school-scoped controllers. SEC-002 remains PARTIAL until real route-level school object isolation exists across all rebuilt school modules, although PAR-001, STAFF-001, ACA-001, ACA-002, STU-001, BULK-001, STU-002, STU-003, FEE-001, ATT-001, HOME-001, EXAM-001, NOTE-001, and REP-001 now include route-level object isolation tests for their current routes. MUL-002 adds the first Tenant Admin multi-school creation path with server-derived tenant scope, durable school-limit guardrails, and audit coverage. MUL-003 verifies school switching across backend, web, and mobile shell role coverage. MUL-004 adds Tenant Admin combined tenant report summaries with school-safe drilldown. MUL-005 adds Tenant Admin School Admin invitation and `user_school_access` grant workflow for tenant schools. MUL-006 adds Tenant Admin school list/name-edit/deactivate and School Admin list/resend/revoke workflow with audit coverage and minimal web scaffolding. MUL-007 adds Tenant Admin tenant settings and subscription usage APIs, audit coverage, and minimal web scaffolding. The implementation audit below is retained as historical evidence from the pre-cleanup codebase; new implementation work must rebuild inside the scaffolded structure and update this document as reality changes.

## 1. Document Purpose and Rules

This document is the single source of truth for CloudCampus product architecture, tenant and school model, role hierarchy, security and isolation rules, product modules, scaling strategy, AI and data-science roadmap, implementation phases, task status, and validation evidence.

Rules:

- Every future task must map to a task ID in this file.
- Every completed task must update this file.
- No major feature should be added before critical tenant/school/security issues are fixed.
- Multi-school must not be called production-ready until school isolation is verified.
- AI must never bypass tenant, school, parent-child or role permissions.
- The agent must implement only one approved task at a time.

Current documentation state: this branch previously removed tracked Markdown/TXT planning files. This file intentionally reintroduces one Markdown file as the master source of truth for the redesign.

## 2. Executive Product Vision

CloudCampus is a production-grade, multi-tenant education operating system and School ERP SaaS platform for independent schools, education trusts and multi-campus school groups.

Long-term support:

- 1,00,000+ schools or tenant organisations.
- Millions of users.
- Small single-school customers.
- Large multi-school organisations.
- Student, parent, teacher, staff and administrator workflows.
- Subscription and monetisation.
- Website and branding.
- Analytics and reporting.
- Governed AI assistants.
- Future public APIs and integrations.

### Initial Sellable Product

Strong, secure single-school ERP with onboarding, admin, students, teachers, parents, attendance, fees, homework, exams, results and notices.

### Premium Multi-School Product

Tenant Admin manages many schools under one organisation with strict isolation, school switching, plan limits and combined reports.

### Future Intelligence Platform

Events, analytics, data lake/warehouse, dashboards, AI copilots, predictive insights and integrations.

## 3. Current Repository Assessment

Historical audit summary: before cleanup, the repository was a modular monolith with a substantial Spring Boot backend, React/Vite web frontend, and an Expo mobile app shell. It had useful SaaS foundations, but onboarding, school isolation, invitations, multi-school administration, bulk operations, and audit completeness needed hardening before paid or multi-school release.

Current scaffold summary: the redesign branch now contains the target top-level folders `backend`, `frontend`, `mobile`, `infra`, `docs`, `scripts`, `tests`, and `.github/workflows`, with domain/module placeholders and runnable baseline app shells ready for the first approved product task.

Active redesign scaffold reality:

| Active Area | Current Files Present | Build/Runtime Manifest | Current Implementation Reality | Required Next Step |
|---|---|---|---|---|
| Backend | `backend/src/main/java/com/cloudcampus/...` domain folders, onboarding/invitation/access/audit/entities and APIs, login/session APIs, parent-child linking APIs, staff/teacher provisioning API, academic lifecycle APIs, academic assignment APIs, student import validation/job APIs, student login invitation/self-profile APIs, bulk job APIs, fee demand/payment/receipt APIs, attendance APIs, homework APIs, exam/result APIs, notice APIs, report export APIs, Tenant Admin school creation/report/settings APIs, transactional outbox foundation, readiness controller, tenant context spoofing filter, tests | Present: `backend/pom.xml`, Flyway migrations, H2 dev/test datasource | Runnable Spring Boot 3.5.14 baseline with tenant + first school + School Admin invitation + access grant + onboarding audit log + signed stateless access token login/current-user/school activation APIs, refresh-token rotation, logout revocation, password reset/change lifecycle, privileged-user MFA challenge verification, in-process login rate limiting, SUPER_ADMIN-only tenant onboarding authorization, parent-child linking with parent invitation/access checks, School Admin staff/teacher portal-login provisioning, School Admin academic year/class/section lifecycle, class-subject/teacher assignment foundation, synchronous School Admin student import validation/import foundation, queued student-import job foundation, optional School Admin student-login invitation/provisioning with student self-profile, fee demand/payment/receipt lifecycle foundation, attendance session/record foundation for School Admin and teacher flows, homework publish/read/submission foundation for School Admin, Teacher, Parent, and Student flows, exam creation/marks/publish/result visibility foundation for School Admin, Teacher, Parent, and Student flows, school-scoped notice create/list/read/publish plus Teacher/Parent/Student visibility foundation, durable report export job/file foundation, Tenant Admin additional-school creation guarded by `tenant_school_limits`, Tenant Admin combined report summary and school-safe report drilldown, Tenant Admin tenant settings plus subscription usage summary, V10 transactional outbox events currently produced by audit recording, V11 durable generic bulk jobs with School Admin school-access guards, V12 student import jobs, V13 student login link, V14 fee payment receipts, V15 attendance tables, V16 homework tables, V17 exam/result tables, V18 notices, V19 report export jobs/files, V20 tenant school limits, and V21 tenant settings. Client-supplied tenant/school context headers are blocked on `/v1/**`. No production out-of-band MFA delivery, device-session management, broad school object authorization beyond rebuilt modules, outbox dispatcher, scheduled bulk/report worker runtime, object-storage export delivery, payment gateway/webhook integration, finance-only role, parent/student attendance portal routes, or attendance/homework/exam/notice frontend/mobile UX yet. | Required now: implement only the next approved task. |
| Frontend | `frontend/src/app`, `frontend/src/shared`, role-based feature folders, auth state provider, protected panels, school selector, Super Admin onboarding screen, invitation acceptance screen, minimal login/MFA panel, Tenant Admin school creation/management/report/settings scaffolds, School Admin parent-link scaffold, School Admin staff provisioning scaffold, School Admin academic setup scaffold, School Admin academic assignment scaffold, School Admin student import/login scaffold, School Admin bulk jobs scaffold, School Admin fee lifecycle scaffold, School Admin report exports scaffold, tests | Present: `frontend/package.json`, `vite.config.ts`, `tsconfig.json` | Runnable React/Vite baseline with typed onboarding, invitation, login, MFA verification, current-user hydration, allowed-school loading, active-school activation, protected role panels, Tenant Admin school creation, Tenant Admin school management/admin management, Tenant Admin combined report summary/drilldown, Tenant Admin settings/usage panel, parent-linking, staff provisioning, academic setup, academic assignment, student import, queued student import jobs, student login invitation, bulk job, fee demand/payment, and report export API clients. Super Admin onboarding, Tenant Admin school creation/management/report/settings, parent linking, staff provisioning, academic setup, academic assignment, student import, queued student import jobs, student login invitation, bulk jobs, fee lifecycle, and report export actions send the stored Bearer token and show login-required states when missing. Access and refresh tokens are stored in `sessionStorage` for the scaffold only. Full dashboards and mobile auth are not rebuilt yet. | Required now: implement only the next approved task. |
| Mobile | `mobile/App.tsx`, `mobile/src`, role-based feature folders, Expo shell, tests | Present: `mobile/package.json`, `app.json`, `tsconfig.json` | Runnable Expo/React Native baseline shell. No real parent/teacher/student workflow yet. | Required before pilot: wire real role flows after backend onboarding and auth foundations. |
| Infrastructure | Docker, Kubernetes, Terraform, monitoring, backup, Nginx, load-test folders with placeholders | No active compose/k8s/terraform manifests in current scaffold | Scaffold only. No deployable stack exists after cleanup. | Required before pilot: add local/dev infra after baseline app manifests. |
| CI/CD | `.github/workflows/ci.yml` plus `.github/workflows/.gitkeep` | GitHub Actions workflow present for backend, frontend, and mobile scaffold gates | Current CI runs backend Maven tests, frontend `npm ci`/tests/typecheck/build, and mobile `npm ci`/typecheck/tests on push, pull request, and manual dispatch. No deploy, image publish, security nightly, OpenAPI publish, DR drill, or lint job exists yet. | Required before pilot: add lint/security/deploy gates after manifests and policies exist. |
| Documentation | Master plan plus docs subfolders | This Markdown file | Single source of truth exists. | Required now: update this file after every approved task. |

Historical pre-cleanup audit summary. These rows describe the deleted legacy application unless explicitly marked as current scaffold evidence.

| Area | Historical Technology | Current Status | Recommendation |
|---|---|---|---|
| Backend | Spring Boot 3.5.14, Java 21, Maven, Spring Security, JPA, Flyway, Redis, RabbitMQ, MinIO, Spring AI | HISTORICAL PARTIAL. Current scaffold is Spring Boot 3.5.14 with JPA/Flyway/H2, onboarding, invitation/auth/session/MFA flows, parent-child linking, staff/teacher provisioning, academic lifecycle, academic assignment, student import, student import jobs, bulk jobs, fee demand/payment/receipt lifecycle, audit log, transactional outbox foundation, and current route guards. | Required now: rebuild one approved baseline/security task at a time in the scaffold. |
| Frontend | React 19, Vite 8, TypeScript 6, React Router 7, TanStack Query/Table, Zustand, Tailwind v4, Vitest | HISTORICAL PARTIAL. Current scaffold is React/Vite with onboarding, invitation, login/MFA, current-user auth state, role-guarded panels, school selector, Tenant Admin school/admin/report/settings scaffolds, parent-link, staff provisioning, academic setup, academic assignment, student import, queued student import jobs, bulk jobs, and fee lifecycle screens. | Required before pilot: full dashboards, Tenant Admin product workflows, finance scopes, and production-grade token storage/session UX. |
| Mobile | Expo 52, React Native 0.76, TypeScript, Axios, SecureStore | HISTORICAL PARTIAL. Current scaffold is an Expo shell and shell-model test only. | Required before pilot: real parent/teacher/student flows after backend auth context exists. |
| Database | PostgreSQL 16/pgvector, Flyway V1 to V93, pooled tables with tenant columns | HISTORICAL PARTIAL. Current scaffold has Flyway V1-V21 for tenants, schools, users, invitations, school access, audit logs, refresh/session lifecycle, MFA challenges, parent-child linking, academic year/class/section lifecycle, student import fields/class-section references, subjects, class-subject assignments, teacher assignments, staff profiles, transactional outbox events, durable generic bulk jobs, student import jobs, student-login profile links, fee demands/payments/receipts, attendance sessions/records, homework assignments/submissions, exams/results, notices, report export jobs/files, tenant school limits, and tenant settings. | Required now: add direct tenant/school scope per rebuilt business module. |
| Cache | Redis via Spring Data Redis | HISTORICAL PARTIAL. Current scaffold has no Redis dependency. | Required before pilot: define cache safety rules and failure modes per security-critical path. |
| Queue/Eventing | RabbitMQ for notification queues; `@Async` executors; ShedLock schedulers | HISTORICAL PARTIAL. Current scaffold has V10 `outbox_events`, `TransactionalOutboxService`, idempotent producer keys, event lifecycle states, V11 `bulk_jobs`, and V12 `student_import_jobs`; no queue dispatcher/runtime or scheduled bulk worker is wired yet. | Required before paid commercial release: add outbox dispatcher, scheduled bulk/report workers, and idempotent consumers. |
| File Storage | MinIO SDK, upload audit, quarantine policy, quota service | HISTORICAL PARTIAL. Current scaffold has no object-storage runtime. | Required before pilot: verify signed URL access rules and document retention when rebuilt. |
| Monitoring | Actuator, Micrometer Prometheus, OpenTelemetry/Tempo, Grafana, Loki, Alertmanager | HISTORICAL PARTIAL. Current scaffold exposes actuator health/readiness only. | Required before pilot: define alerts, SLOs, log retention, tenant-safe dashboards. |
| CI/CD | GitHub Actions CI, Docker publish, security nightly, OpenAPI publish, DR drill, deploy placeholder | PARTIAL in historical audit; current scaffold now has `ci.yml` for backend/frontend/mobile tests and builds. Deploy workflow was previously placeholder and is not rebuilt. | Required before pilot: add security scans, lint policy, image/build publish, and real staging deploy later. |
| Deployment | Docker Compose, backend/frontend Dockerfiles, local Nginx TLS proxy, starter Kubernetes YAML | PARTIAL. Good local stack and starter k8s manifest. No complete production IaC. | Required before pilot: managed DB/object storage/secrets/backups/HTTPS/alerts. |

Module rows below are current only where they explicitly say "Current scaffold"; otherwise they are historical product inventory retained for rebuild planning.

| Module | Backend Status | Frontend Status | Mobile Status | Security Status | Missing Work |
|---|---|---|---|---|---|
| Tenant management | PARTIAL. Current scaffold has SUPER_ADMIN-protected `POST /v1/super-admin/tenants/onboard` with first real school input, TENANT_ADMIN-protected additional-school creation within a durable school limit, Tenant Admin school list/name-edit/deactivate, Tenant Admin school-admin invite/grant/list/resend/revoke workflow for tenant schools, and Tenant Admin tenant settings plus subscription usage summary. Historical broader tenant status/feature/subscription pieces are not rebuilt yet. | PARTIAL. Super Admin onboarding form and Tenant Admin school creation, School Admin invite, school management, admin management, report, settings, and usage forms exist, send Bearer auth, and show login-required states. Tenant list/detail not rebuilt yet. | MISSING. | PARTIAL. Visible `MAIN` onboarding is removed, onboarding audit exists, `X-Tenant-ID`/school context headers are rejected, only authenticated `SUPER_ADMIN` can create tenants, only authenticated `TENANT_ADMIN` can manage schools/admin grants/settings/usage for their own tenant within current guardrails, same-tenant schools can receive Tenant Admin-created School Admin grants, primary schools cannot be deactivated, and last School Admin access grant cannot be revoked. | Tenant list/detail, subscription assignment UI/API, plan catalog, invoices/billing, full Super Admin/Tenant Admin route shell, production email delivery for invitations. |
| Authentication | PARTIAL. Invitation token hash, expiry, BCrypt set-password, user activation, signed stateless access token login, refresh-token rotation, logout/access-token revocation, forgot/reset password, change password, `/v1/me`, `/v1/me/schools`, school activation, privileged-user MFA challenge verification, and in-process login rate limiting exist. Device/session management and production out-of-band MFA delivery are not rebuilt yet. | PARTIAL. Invitation acceptance, login/MFA panels, auth state provider, current-user and school hydration, logout, role-guarded panels, and school activation UX exist. Auth API client supports login, MFA verification, refresh, logout, reset, change-password, current user, school list, and activation. Full dashboards and production-grade session UX are not rebuilt yet. | PARTIAL. Mobile shell only. | PARTIAL. Secure invitation acceptance, server-derived login identity, refresh rotation, logout revocation, privileged MFA challenge/reuse checks, login rate limiting, and frontend route denial states exist; real second-factor delivery is scaffold-only. | Out-of-band MFA delivery, device-session management, full dashboards, mobile auth. |
| User and roles | PARTIAL. Roles: `SUPER_ADMIN`, `TENANT_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, `STUDENT`. | PARTIAL. Web role type now matches backend roles and tests lock the list. Tenant Admin is recognised and can access the current school-creation scaffold; finance/accountant role is not present because backend does not define one. | PARTIAL. Role stored as string. | PARTIAL. No accountant/finance staff role. | Add finance/other staff role model and permission matrix. |
| School access | PARTIAL. Current scaffold grants first School Admin `user_school_access` during onboarding, has `SchoolAccessService.requireSchoolAdminAccess` to deny unassigned same-tenant and cross-tenant schools, supports `/v1/me/schools/{schoolId}/activate`, filters malformed cross-tenant grants from initial active-school selection, adds Tenant Admin school creation and school-admin grant workflow without trusting frontend tenant ids, and enforces object-school checks in rebuilt parent, staff provisioning, academic, assignment, student-import, bulk-job, fee, attendance, homework, exam/result, notice, and report export routes. | PARTIAL. Web scaffold loads `/v1/me/schools`, auto-activates a single assigned school, lets multi-school users select and activate a school, updates token/session context from the backend response, shows activation-denied errors, and includes minimal Tenant Admin create-school and invite-School-Admin panels. | PARTIAL. Mobile shell role model now includes backend role codes and school-switching readiness markers; full mobile auth/switching screens are not rebuilt. | PARTIAL. Cross-school denial is tested at service guard, activation API, parent-child, staff provisioning, academic lifecycle, academic assignment, student-import, bulk-job, fee, attendance, homework, exam/result, notice, and report export route levels; Tenant Admin school creation and School Admin grants derive tenant from the authenticated user and block spoofing headers; MUL-003 adds explicit multi-school switch and malformed grant tests; remaining product modules need their own route tests when rebuilt. | Richer school switching UX, remaining controller/object-route integration tests. |
| School settings | PARTIAL. Settings controller/service/defaults. | PARTIAL. School settings route. | MISSING. | PARTIAL. School path interceptor covers `/schools/{schoolId}` paths. | Verify object routes and audit changes. |
| Academic year | VERIFIED for current scaffold foundation. `AcademicYear` entity, repository, service, controller, activation lifecycle, audit events, and route tests exist. Historical broader academic settings are not rebuilt. | PARTIAL. Minimal School Admin academic setup scaffold/API client exists; no dashboard routing/table UX yet. | MISSING. | VERIFIED for current routes. Creation/listing use authenticated active school; activation/class/section/assignment flows load the object's actual school and verify `user_school_access`; cross-school object use is denied in tests. | Richer UX, pagination, student enrollment links, promotions. |
| Classes and sections | VERIFIED for current scaffold foundation. `ClassLevel`, `Section`, `Subject`, `ClassSubjectAssignment`, and `TeacherAssignment` entities, repositories, services, controllers, DB uniqueness, and route tests exist. | PARTIAL. Minimal creation/assignment forms exist. | MISSING. | VERIFIED for current assignment routes. Class creation is scoped to the accessed academic year's school; section creation is scoped to the accessed class's school; class-subject and teacher assignment use object-school checks. | Pagination, student enrollment links, timetable integration. |
| Subjects | VERIFIED for current scaffold foundation. Subject CRUD/list and class-subject assignment APIs exist with object-school checks. | PARTIAL. Minimal academic assignment screen exists. | MISSING. | VERIFIED for current routes. Subject create/list use active school; class-subject assignment verifies class and subject actual schools. | Full subject catalog UX, edit/delete lifecycle, timetable integration. |
| Staff | PARTIAL. Current scaffold has `staff_profiles`, `POST /v1/school-admin/staff/provision`, portal-login-required `STAFF`/`TEACHER` user creation/reuse, invitation creation, and school access grants. Historical full staff CRUD, attendance, leave, departments/designations lifecycle are not rebuilt. | PARTIAL. Minimal School Admin staff provisioning scaffold exists. | MISSING. | VERIFIED for current provisioning route. Uses active authenticated school and `SchoolAccessService`; rejects unsafe roles, profile-only requests, duplicate employee numbers, and non-School Admin callers. | Full staff CRUD/edit, attendance, leave, multi-school staff assignment, finance role. |
| Teacher | PARTIAL. Current scaffold has teacher invitation/provisioning, teacher assignment persistence, `GET /v1/teacher/assignments`, teacher attendance session submit/list/read routes, teacher homework publish/list/read routes, and teacher exam list/read/marks routes scoped to assigned class-subjects; historical dashboard, timetable, lesson plans, online classes, and videos are not rebuilt. | PARTIAL. Staff provisioning scaffold can invite teachers; academic assignment scaffold can assign them. No teacher dashboard UX. | PARTIAL. API snapshot cards only. | PARTIAL/VERIFIED for current provisioning, assignment, attendance, homework, and exam marks routes. Teacher listing requires authenticated `TEACHER`; unassigned class filters, unassigned attendance, unassigned homework, and unassigned exam/result routes are denied in tests. Future timetable APIs still need assignment checks. | Teacher dashboard, assignment-scoped timetable, richer attendance/homework/exam UX. |
| Student | PARTIAL. Current scaffold has `Student` with admission, class/section, roll number, date of birth, gender, guardian contact fields, nullable linked login user, synchronous import validation/import APIs, queued import job APIs, internal import-job processor method, School Admin list API, optional student login invitation API, student self-profile API, authenticated own-fee demand listing, own homework listing/submission, and own published-result listing. Historical documents, profile 360, and attendance self APIs are not rebuilt. | PARTIAL. Minimal School Admin student import scaffold exists with validate/import/queue/student-login-invite actions; full student admin list/profile/screens and homework/result UI are not rebuilt. | PARTIAL. API snapshot cards only. | PARTIAL. Import/list/job routes use active authenticated school and verify class/section actual school; cross-school class/section import and queued jobs are denied. Student login provisioning verifies the student's actual school, grants `STUDENT` school access, and student self-profile/fees/homework/results resolve through the authenticated linked user. | Student CRUD/edit, documents, profile, scheduled async worker, promotions, attendance portal, broader student portal UX. |
| Parent | PARTIAL. Current scaffold has `POST /v1/school-admin/parent-links`, parent invitation creation, `ParentStudentLink`, `GET /v1/parent/children`, `GET /v1/parent/children/{studentId}`, parent linked-child fee list/payment endpoints, parent linked-child homework listing, and parent linked-child published-result listing. | PARTIAL. Minimal School Admin parent-link form exists; full parent portal/dashboard not rebuilt. | PARTIAL. Mobile shell only. | PARTIAL. Parent provisioning by email with invitation, linked-child-only access, linked-child fee/payment access, linked-child homework visibility, and linked-child published result visibility are verified for current scaffold; parent leave/child detail modules are not rebuilt. | Parent dashboard, richer payments UI, leave request flow, multi-child UX, parent homework/result UI. |
| Attendance | VERIFIED for current scaffold foundation. V15 adds `attendance_sessions` and `attendance_records`; School Admin can create/list/read attendance sessions for active-school class/section/subject/student records; Teacher can create/list/read attendance only for assigned class-subject scope. Parent/student read routes, staff attendance, QR attendance, edits, and reports are not rebuilt. | MISSING for attendance UI. Existing School Admin scaffold does not include attendance screens yet. | PARTIAL. Snapshot card only. | VERIFIED for current attendance routes. School Admin routes use authenticated active school and object-school checks; teacher routes require `AcademicAssignmentService.requireTeacherAssignment`; tests deny School Admin A creating/reading School B attendance inputs and teacher unassigned-class access. | Frontend/mobile attendance UX, parent/student visibility, edit workflow, reports, QR/spike checks, staff attendance. |
| Homework | VERIFIED for current scaffold foundation. V16 adds `homework_assignments` and `homework_submissions`; School Admin can publish/list/read homework for active-school class/section/subject; Teacher can publish/list/read homework only for assigned class-subject; Parent can list linked child's homework; Student can list and submit own visible homework. Edits, review/grade workflow, file attachments, notifications, and dashboards are not rebuilt. | MISSING for homework UI. Existing web scaffold does not include homework screens yet. | PARTIAL. Snapshot card only. | VERIFIED for current homework routes. School Admin routes use authenticated active school and object-school checks; teacher routes require `AcademicAssignmentService.requireTeacherAssignment`; parent routes require `ParentStudentLink`; student routes resolve the authenticated linked `STUDENT` profile. Tests deny cross-school homework creation/read, teacher unassigned homework access, parent unlinked-child access, and student submission to unassigned homework. | Frontend/mobile homework UX, attachments, review/grading, resubmission policy, notifications, reports. |
| Leave | PARTIAL. Staff/teacher leave and school-admin leave management. | PARTIAL. Teacher leave and admin leave pages. | MISSING. | PARTIAL. Some `MAIN` fallback in staff leave. | Remove `MAIN`, add parent/student leave API if required. |
| Exams and results | VERIFIED for current scaffold foundation. V17 adds `exams` and `exam_results`; School Admin can create/list/read exams, record marks, and publish results; Teacher can list/read exams and record marks only for assigned class-subject scope; Parent/Student can see only published results for linked/own student. Historical report cards, grade formulas, scheduling, retests, and analytics are not rebuilt. | MISSING for exam/result UI. Existing web scaffold does not include exam screens yet. | PARTIAL. Snapshot card only. | VERIFIED for current exam/result routes. School Admin routes use authenticated active school and object-school checks; teacher routes require `AcademicAssignmentService.requireTeacherAssignment`; parent routes require `ParentStudentLink`; student routes resolve `students.user_id`; unpublished results are hidden from parent/student. | Frontend/mobile exam UX, report cards, grading schemes, edit/republish workflow, result analytics, notifications. |
| Fees and payments | VERIFIED for current scaffold foundation. `fee_demands` and `fee_payments` support School Admin demand creation/list/read/payment, parent linked-child fee list/payment, student own-fee list, receipt numbers, paid/partial status, and audit events. Historical fee categories/structures, concessions, refunds, reconciliation, Razorpay/webhooks, finance reports, and finance-only role are not rebuilt. | PARTIAL. Minimal School Admin fee lifecycle scaffold exists for demand creation and payment recording; parent/student payment UI is not rebuilt. | PARTIAL. Snapshot card only. | VERIFIED for current routes. School Admin demand/payment routes verify active school or the object's actual `school_id`; parent routes require linked child; student route resolves the authenticated linked profile; tests deny cross-school demand create/read/pay, unlinked parent access, mismatched child-demand payment, and overpayment. | Fee category/structure setup, concessions/refunds, reconciliation, webhooks ops, accountant/finance role, parent/student portal UX. |
| Notices | VERIFIED for current scaffold foundation. V18 adds school-scoped `notices`; School Admin can create/list/read/publish notices for active-school scope with optional class/section targeting; Teacher can read published notices only for assigned school/class scope; Parent can read linked-child published notices; Student can read own published notices. Tenant/organisation-wide notices are intentionally deferred. | MISSING for notice UI. Existing web scaffold does not include notice screens yet. | PARTIAL. Mobile notices remain shell/planned only. | VERIFIED for current routes. School Admin routes use authenticated active school or object actual `school_id` through `SchoolAccessService`; teacher routes derive scope from `TeacherAssignment`; parent routes require `ParentStudentLink`; student routes resolve `students.user_id`; drafts are hidden from non-admin audiences. | Frontend/mobile notice UX, tenant/organisation-wide notices, notification delivery, edit/unpublish lifecycle. |
| Timetable | PARTIAL. Admin, teacher, student timetable. | PARTIAL. Screens exist. | PARTIAL. Snapshot cards. | PARTIAL/UNSAFE. Student/teacher controllers still fall back to `MAIN`. | Remove `MAIN`, validate assignment/school. |
| Documents | PARTIAL. Student documents, storage service, upload audit. | PARTIAL. Student profile/doc integration. | MISSING. | PARTIAL. Quarantine/audit exist. | Signed URL authorization and retention rules. |
| Website builder/public website | PARTIAL. School website builder, school public pages, and custom domain support existed historically. | PARTIAL. Website builder and public routes existed historically. | MISSING. | PARTIAL. Public endpoints must remain read-only and tenant-safe. | Multi-school branding model and publishing controls. |
| Subscription | PARTIAL. Current scaffold has durable `tenant_school_limits` for Tenant Admin school-count enforcement and `GET /v1/tenant-admin/subscription/usage` for server-derived school/admin/teacher/staff/student usage summary. Broader plans, tenant subscription lifecycle, invoices, feature flags, and usage limits are not rebuilt yet. | PARTIAL. Tenant Admin school creation displays returned school usage, and the Tenant Admin settings panel displays subscription usage. Upgrade page and feature-gated nav are not rebuilt. | PARTIAL. Feature list stored historically only. | PARTIAL. School-count limits are enforced for Tenant Admin school creation; usage is read from server-derived tenant identity; student/staff/feature limits are not rebuilt yet. | Add Super Admin subscription assignment UI/API, plan catalog, tenant subscription lifecycle, invoices, and enforce student/staff/feature limits everywhere. |
| Reports | VERIFIED for current scaffold foundation. V19 adds durable report export jobs/files linked to `bulk_jobs`; School Admin can request/list/read/download school-scoped CSV exports for student directory and fee demands. MUL-004 adds Tenant Admin combined tenant summary and school-safe drilldown over current student and fee read models. Rich reporting read models are not rebuilt. | PARTIAL. Minimal School Admin report export scaffold can request/list/download exports with Bearer token. Minimal Tenant Admin reports scaffold can load combined summary and per-school drilldown with Bearer token. | MISSING. | VERIFIED for current report-export and Tenant Admin summary routes. School Admin routes use authenticated active school or object actual `school_id`; cross-school read/download is denied; non-School Admin callers are rejected. Tenant Admin report routes derive tenant from authenticated identity and reject unauthenticated/non-Tenant Admin callers plus cross-tenant school drilldown. | Object storage delivery, scheduled worker, richer report catalog/read models, mobile/report dashboard UX. |
| Notifications | PARTIAL. Email/push notification logs, RabbitMQ queues. | PARTIAL. Notification log page, WhatsApp. | PARTIAL. Device registration API possible. | PARTIAL. Queue consumer ACK behavior needs review. | Outbox, retry semantics, delivery status guarantees. |
| AI/RAG if present | PARTIAL. AI usage, prompts, knowledge base, embeddings, copilot, Spring AI/pgvector. | PARTIAL. Super-admin AI usage/prompts/knowledge and school-admin copilot. | MISSING. | PARTIAL. Tests exist for tenant isolation/prompt injection, but entitlement and human approval incomplete. | AI budgets, school/role scoped retrieval, model execution audit. |
| Audit log | VERIFIED for current scaffold mutation coverage. Current scaffold persists onboarding audit events for tenant creation, school creation, School Admin invitation, school access grant, Tenant Admin additional-school creation, Tenant Admin-created School Admin invitation/access grant, Tenant Admin school updates/deactivation/admin resend/revoke, Tenant Admin settings update, invitation acceptance, MFA challenge create/verify, refresh rotation, logout, password reset request/completion, password change, school context activation, parent invitation, parent-child link, staff invitation, staff profile creation, academic year creation/activation, class creation, section creation, subject creation, class-subject assignment, teacher assignment, student import, student import job queueing, student login enablement/invitation, bulk job creation/cancellation, fee demand creation, fee payment recording, receipt issue, attendance submission, homework publish, homework submission, exam creation, exam marks recording, exam result publication, notice creation, notice publication, report export request, and report export completion with authenticated actor id and role. Historical wider audit viewer/services are not rebuilt yet. | MISSING. | MISSING. | VERIFIED for current scaffold. `AuditCoverageMatrixTest` fails future mutation controllers not added to the audit matrix and verifies mapped services call `auditLogService.record` with typed actions. Raw invitation tokens, raw refresh/access tokens, reset tokens, MFA codes, passwords, student names in import rows, raw student invitation tokens, bulk input/error file references, raw payment gateway references, individual attendance-status details, homework instructions, homework submission content, exam titles, raw marks values, notice titles, notice bodies, report file names supplied by users, generated report content, spoofed tenant ids from school-creation/settings requests, raw Tenant Admin-created School Admin invitation tokens, and raw tenant billing/support email addresses in settings audit metadata are not stored in verified audit metadata. | Audit viewer/API, production delivery logs, failed-login/security telemetry. |
| Monitoring | PARTIAL. Actuator, Prometheus/Grafana/Loki/Tempo config. | N/A. | N/A. | PARTIAL. Tenant-safe metrics policy not complete. | Alerts, dashboards, production runbooks. |
| Backup/restore | PARTIAL. pgbackup container and monthly DR drill workflow. | N/A. | N/A. | PARTIAL. Restore drill exists in CI workflow. | Production backup encryption, restore RTO/RPO validation. |

| Finding ID | Problem | Evidence / File Path | Risk | Required Fix | Status |
|---|---|---|---|---|---|
| CF-001 | Tenant creation creates a customer-visible default school with code `MAIN` and no first real school input. | Historical audit evidence: `TenantServiceImpl.create` created `MAIN`. Current scaffold evidence: `TenantOnboardingFlowTest` verifies real school code and rejects reserved `MAIN`. | New customers must never start with a technical placeholder. | Required now: keep first real school input and do not reintroduce `MAIN` dependency. | COMPLETE for current scaffold; keep regression tests. |
| CF-002 | Tenant onboarding does not create/invite a School Admin or grant school access. | Current scaffold evidence: onboarding response includes School Admin invitation, user id, and school access; `TenantOnboardingFlowTest` verifies persisted grant and onboarding audit events. | Customer cannot professionally enter product after tenant creation without invitation and access. | Required now: keep onboarding regression coverage; next harden authenticated actor context. | COMPLETE for current scaffold; broader auth/audit hardening remains. |
| CF-003 | Invitation accept/set-password flow is missing. | Current scaffold evidence: `POST /v1/invitations/accept`, BCrypt password hash, invitation status transition, and active user assertion in `TenantOnboardingFlowTest`. | Staff, parent, student, and school admin provisioning must be secure and self-service. | Required now: extend invitation lifecycle later for resend/cancel and audit. | COMPLETE for School Admin onboarding; broader invitation lifecycle pending. |
| CF-004 | Hard-coded `MAIN` remains in business flows. | Historical deleted-code evidence listed `AuthServiceImpl`, timetable, leave, fees, attendance, results, and public site controllers. Current scaffold recheck found no active business logic with hard-coded `MAIN`; only safe onboarding rejection/test/docs references remain. `HardCodedMainSchoolResolutionTest` now blocks `MAIN`, `resolveMainSchool`, `defaultSchool`, and explicit primary-school fallback markers outside the onboarding reserved-code guard. | Multi-school and parent/student flows may resolve the wrong school if the historical fallback is reintroduced while rebuilding modules. | Keep regression test; future rebuilt parent/student/teacher/staff flows must resolve school from authenticated selected school, linked child/own record, or assignment. | COMPLETE for current scaffold; regression protected. |
| CF-005 | School access enforcement is route-shape dependent. | Historical deleted-code evidence: `SchoolPathAccessInterceptor` only covered `/v1/school-admin/schools/*` paths. Current scaffold evidence: PAR-001 parent-child routes, STAFF-001 staff/teacher provisioning route, ACA-001 academic year/class/section routes, ACA-002 subject/class-subject/teacher assignment routes, STU-001 student import/list routes, BULK-001 bulk-job routes, STU-003 student login/self-profile routes, FEE-001 fee demand/payment/receipt routes, ATT-001 attendance routes, HOME-001 homework routes, EXAM-001 exam/result routes, NOTE-001 notice routes, and REP-001 report export routes are guarded and tested. No rebuilt timetable, documents, or website controllers exist; `SchoolScopedControllerGuardCoverageTest` fails any future school-scoped controller without an approved backend guard marker. | Product-level cross-school API isolation remains unproven across the full ERP until each real route exists, but current rebuilt school-scoped routes have route-level negative coverage. | Keep `SchoolAccessService` as the central guard for School Admin routes; parent/student routes must prove parent-child linkage or own profile; teacher/staff routes must prove assignment/object school. Add route-level negative tests when each business controller is rebuilt. | PARTIAL, P0 |
| CF-006 | `TENANT_ADMIN` backend role exists but Tenant Admin product surface is incomplete. | Backend enum includes `TENANT_ADMIN`; web `UserRole` includes it; MUL-002 adds `POST /v1/tenant-admin/schools` and a minimal protected web school-creation scaffold with plan-limit enforcement; MUL-004 adds `GET /v1/tenant-admin/reports/summary` and `GET /v1/tenant-admin/reports/schools/{schoolId}/summary` plus a minimal protected web reports scaffold; MUL-005 adds `POST /v1/tenant-admin/schools/{schoolId}/admins/invite`; MUL-006 adds `GET /v1/tenant-admin/schools`, `PATCH /v1/tenant-admin/schools/{schoolId}`, `POST /v1/tenant-admin/schools/{schoolId}/deactivate`, `GET /v1/tenant-admin/schools/{schoolId}/admins`, `POST /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation`, and `DELETE /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access` plus minimal web management forms; MUL-007 adds `GET/PATCH /v1/tenant-admin/settings` and `GET /v1/tenant-admin/subscription/usage` plus a minimal web settings/usage panel. Remaining Tenant Admin plan/subscription assignment, invoices/billing, richer portal navigation, and polished dashboard UX are absent. | Multi-school organisation admin now has guarded school creation, school list/name-edit/deactivate, School Admin grant/invitation/list/resend/revoke, combined reporting, tenant settings update, and subscription usage visibility, but cannot fully administer billing/subscription plans or a polished organisation portal yet. | Required before multi-school release: add Tenant Admin portal shell/navigation, Super Admin subscription assignment/plan catalog, billing/invoices, production invitation delivery, and richer school switching/dashboard UX. | PARTIAL, P1 |
| CF-007 | Accountant/finance staff is not a login role. | Backend `UserRole` lacks `ACCOUNTANT`/`FINANCE_STAFF`; staff type has `ACCOUNTANT` in frontend/staff data only. | Finance users may need overly broad school admin rights. | Required before paid commercial release: add finance role/permissions independent from academic admin. | MISSING, P1 |
| CF-008 | Student and staff creation create profiles, not login accounts. | Historical deleted-code evidence: `StudentServiceImpl.admit` and `StaffServiceImpl.create` created profiles with nullable `user_id`. Current scaffold evidence: STAFF-001 creates portal-login-required `STAFF`/`TEACHER` users, invitations, `user_school_access`, and linked `staff_profiles`. STU-003 adds optional student-login provisioning for existing/imported student profiles, links `students.user_id`, grants `STUDENT` school access, and uses the standard invitation/set-password flow. | Teacher and optional student login no longer depend on manual user creation in the current scaffold. Student import still creates profiles first by design, then School Admin may enable login for target grades. | Broaden staff/student CRUD later; build full student portal modules after login foundation. | COMPLETE for current scaffold optional-login foundation, P1 |
| CF-009 | Parent linking requires an existing parent user; no parent invitation/provisioning. | Historical deleted-code evidence: `ParentLinkServiceImpl.addLink` checked `UserRole.PARENT` by `parentUserId`. Current scaffold evidence: `ParentLinkService` creates or reuses a `PARENT` user by tenant/email, creates an invitation for inactive parents, and links the parent to the student's actual tenant/school. | Parent onboarding is blocked without a create/find/invite flow. | Required before pilot: create/find parent by email/mobile and send invitation. | COMPLETE for current scaffold foundation; broader parent portal remains. |
| CF-010 | Bulk student import and promotions are synchronous. | Historical deleted-code evidence: `StudentServiceImpl.bulkAdmit` looped rows. Current scaffold evidence: STU-001 intentionally keeps the legacy-compatible synchronous validated import, capped at 500 rows. BULK-001 adds durable generic `bulk_jobs`; STU-002 adds `student_import_jobs`, queued import API, persisted rows, internal processor, progress updates, row-level validation error JSON/reference, and partial-completion handling. Promotions are not rebuilt and no scheduled worker/dispatcher is wired yet. | Large schools now have a durable student-import job foundation, but production-scale async processing still needs a scheduler/worker runtime, object-storage error files, and idempotency hardening before paid commercial release. | Required before paid commercial release: add scheduled worker/dispatcher, object-storage error artifacts, retry/idempotency policy, and promotion jobs on top of `BulkJob`. | PARTIAL, P1 |
| CF-011 | Report export jobs are in-memory. | Historical deleted-code evidence: legacy report export jobs used JVM memory. Current scaffold evidence: REP-001 adds V19 `report_export_jobs` and `report_export_files`, links exports to durable `bulk_jobs`, stores generated CSV content/checksum/size durably, and verifies route-level school isolation. | Current scaffold no longer depends on in-memory report export state. Object storage and scheduled worker runtime are still future production hardening. | Required before paid commercial release: move generated files from DB CLOB scaffold storage to object storage, add scheduled workers, and add richer report read models. | COMPLETE for current scaffold foundation; object-storage hardening remains, P1 |
| CF-012 | Transactional outbox/domain event foundation is missing. | Current scaffold evidence: V10 `outbox_events` table, `OutboxEvent`, `OutboxEventRepository`, `TransactionalOutboxService`, audit-to-outbox producer wiring, idempotent producer key behavior, lifecycle state methods, and `TransactionalOutboxFlowTest` rollback/idempotency/status coverage. | Async jobs, analytics, and integrations still need a dispatcher and idempotent consumers before high-volume production fan-out. | Required before paid commercial release: add an outbox dispatcher/worker, delivery backoff policy, and consumer idempotency per integration. | COMPLETE for current scaffold foundation, P1 |
| CF-013 | Audit logging is useful but incomplete. | Historical deleted-code evidence showed mixed audit coverage. Current scaffold evidence: `AuditCoverageMatrixTest` inventories every current mutation controller and verifies mapped services write typed audit actions; auth/session/invitation mutations now persist audit rows without raw secret material. | Future rebuilt modules could introduce untraceable sensitive mutations if they bypass the matrix. | Keep `AuditCoverageMatrixTest` updated with each new mutation controller; add runtime audit assertions for new sensitive flows. | COMPLETE for current scaffold, P1 |
| CF-014 | Frontend role model is out of sync with backend. | Current web scaffold evidence: `frontend/src/features/auth/api/authApi.ts` exports `BACKEND_USER_ROLES` with `SUPER_ADMIN`, `TENANT_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, and `STUDENT`; `authApi.test.ts` locks the list. Mobile still stores role as an unconstrained string. | Web users are no longer denied because of missing backend roles; mobile can still drift until typed. | Required before pilot: align mobile roles with backend and product matrix; add finance role only after backend defines it. | COMPLETE for web scaffold; PARTIAL overall because mobile remains, P1 |
| CF-015 | Mobile app contains demo tenant/credential defaults. | `mobile/app.json` default tenant; `mobile/src/screens/LoginScreen.tsx` demo username/password. | Demo data can leak into pilot UX or production build. | Required before pilot: move demo defaults behind dev-only mode. | PARTIAL, P2 |
| CF-016 | Frontend lint gate is absent in the current scaffold. | Historical deleted-code evidence had `npm run lint` failing in `frontend/src/shared/ui/ConfirmDialog.tsx:39`; current `frontend/package.json` has no lint script and CI intentionally omits lint. | CI can now prove build/typecheck/tests, but style/static-analysis regressions are not gated. | Required before pilot: add ESLint/format policy for the current scaffold and wire it into CI. | PARTIAL, P2 |

Recommendation labels used in this document:

- Required now: blocks architecture baseline or critical security/onboarding.
- Required before pilot: blocks first real customer usage.
- Required before multi-school release: blocks premium multi-school product.
- Required before paid commercial release: blocks billing, compliance, or production operations.
- Future scale/AI enhancement: should be designed for, but not built before core ERP readiness.

## 4. Core Business Model

Final model:

```text
CloudCampus Platform
`-- Tenant = Paying Customer Organisation / Trust / Independent School
    |-- Subscription
    |-- Feature Entitlements
    |-- Tenant Admin Users
    |-- Organisation Branding
    |-- Billing
    `-- Schools = Branches / Campuses
        |-- School Admin Users
        |-- Teachers and Staff
        |-- Students and Parents
        |-- Academic Configuration
        |-- Attendance
        |-- Fees
        |-- Exams and Results
        |-- Homework
        |-- Notices
        `-- Website / School Branding
```

Rules:

| Customer Scenario | Correct Model |
|---|---|
| One independent school | One tenant with one school |
| One trust with multiple branches | One tenant with multiple schools |
| Same brand but separate owners/billing | Separate tenants |
| Junior and senior buildings sharing operations | One school with wings/departments |
| Separate campuses with different admins/fees/admissions | Multiple schools under one tenant |
| Large enterprise requiring isolation | Dedicated database/cell option later |

Historical code reality from pre-cleanup audit: the database already had `tenants`, `schools`, and many school-scoped tables. The product flow still treated `MAIN` as a bootstrap default in multiple places, so this model remains the target and is not yet implemented in the current scaffold.

## 5. Role Hierarchy and Access Flow

Defined product roles:

- `SUPER_ADMIN`
- `TENANT_ADMIN`
- `SCHOOL_ADMIN`
- `TEACHER`
- `ACCOUNTANT` / `FINANCE_STAFF`
- `PARENT`
- `STUDENT`
- `OTHER_STAFF`

Current code roles: backend and web frontend currently have `SUPER_ADMIN`, `TENANT_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, `STUDENT`. Mobile still stores role as a plain string in the shell.

| Role | Created By | Access Scope | Key Responsibilities | Login Required |
|---|---|---|---|---|
| SUPER_ADMIN | CloudCampus bootstrap/platform owner | Platform-level control plane | Create tenants, assign plans, control tenant status/features, platform health/support | Yes |
| TENANT_ADMIN | Super Admin or Tenant Admin | One tenant and authorised schools | Manage organisation schools, assign School Admins, combined reports, subscription/usage | Yes |
| SCHOOL_ADMIN | Super Admin/Tenant Admin | One assigned school or explicitly assigned schools | Academic setup, imports, fees, attendance, exams, notices, website, reports | Yes |
| TEACHER | School Admin | Assigned school/classes/subjects | Attendance, homework, assignments, marks, lesson plans, class work | Yes if portal required |
| ACCOUNTANT / FINANCE_STAFF | School Admin/Tenant Admin | Finance scope for assigned school(s) | Fee structures, payments, receipts, finance reports | Yes |
| PARENT | School Admin invitation or parent self-claim after verification | Linked children only | View child attendance/homework/results/fees/notices, pay fees, leave requests | Yes |
| STUDENT | School Admin invitation/enablement | Own data only | View homework, timetable, results, notices, resources; submit homework | Optional by age |
| OTHER_STAFF | School Admin | Profile only unless assigned portal work | Non-academic staff profile and attendance; login only for business workflows | Optional |

Rules:

SUPER_ADMIN:

- CloudCampus owner.
- Creates tenants.
- Assigns plans.
- Controls tenant status and features.
- Views platform-level health.
- Must not casually access private school data without audited support reason.

TENANT_ADMIN:

- Organisation-level admin.
- Required for multi-school customers.
- Manages schools under one tenant.
- Assigns School Admins.
- Views combined organisation reports.
- Cannot access other tenants.

SCHOOL_ADMIN:

- Manages assigned school or explicitly assigned schools.
- Creates academic setup.
- Imports students/staff.
- Manages fees, attendance, homework, exams, notices.
- Cannot access other schools without explicit assignment.

TEACHER:

- Assigned to school/classes/subjects.
- Can mark attendance, create homework and enter marks only for assigned scope.

ACCOUNTANT:

- Handles fee structures, payments, receipts and finance reports.
- Should not automatically receive academic admin rights.

PARENT:

- One account can link to multiple children.
- Can view only linked children.
- If children are in different schools, data must resolve using selected child's actual school.

STUDENT:

- Can view only own data.
- Login optional for small children.

OTHER_STAFF:

- Profile can exist without login.
- Login only when business work requires access.

## 6. End-to-End Onboarding and User Flow

### 6.1 Super Admin Creates Tenant

Recommended production flow:

```text
Super Admin logs in
-> Creates Customer / Tenant
-> Selects Subscription Plan and Limits
-> Adds First Real School Details
-> Adds Primary Administrator Details
-> System Creates Tenant
-> System Creates First Real School
-> System Seeds Default School Setup
-> System Creates Secure Admin Invitation
-> System Grants School Access
-> System Records Audit Event
```

Important:

- Do not expose technical `MAIN` school to customer.
- Replace customer-visible `MAIN` with real first school.
- If internal default remains temporarily, use `is_primary_school` flag.
- Do not depend on hard-coded `MAIN` in business logic.

Historical implementation from pre-cleanup audit: `TenantServiceImpl.create` created a tenant and default active school with code `MAIN`, initialized defaults/bootstrap, and returned `TenantResponse`. It did not collect first school/admin details or create an admin invitation. Status: UNSAFE for production onboarding.

### 6.2 Tenant Admin Adds Multiple Schools

```text
Tenant Admin logs in
-> Views organisation schools
-> Clicks Add School
-> System validates active subscription and allowed school count
-> Creates school
-> Seeds defaults
-> Invites/assigns School Admin
-> Writes audit log
```

Historical implementation from pre-cleanup audit: backend role existed, but no clear Tenant Admin school creation API or web portal was found. Status: MISSING for premium multi-school release.

### 6.3 School Admin Initial Setup

Use this order:

1. Review school profile.
2. Confirm academic year.
3. Create classes.
4. Create sections.
5. Create subjects.
6. Map subjects to class/section.
7. Create/import staff.
8. Assign teachers and class teachers.
9. Import students.
10. Link parents/guardians.
11. Configure fees.
12. Configure attendance rules.
13. Configure exams/results.
14. Publish notices.
15. Start daily operations.

Historical implementation from pre-cleanup audit: most setup modules existed, but imports were synchronous, staff/student login provisioning was incomplete, and audit coverage was partial.

### 6.4 Teacher Provisioning

```text
School Admin creates staff profile
-> Selects portal login required = Yes/No
-> If yes, sends invitation
-> Teacher sets password
-> Assignments are granted
-> Teacher accesses only assigned work
```

Historical implementation from pre-cleanup audit: staff profiles existed with nullable `user_id`; teacher role/users could exist from seed/demo/admin operations, but no general invitation workflow was found.

### 6.5 Student Provisioning

```text
School Admin creates/imports student
-> Assigns school, academic year, class and section
-> Links parent/guardian
-> Optionally enables student login
```

Student login recommendation:

| Student Level | Login Recommendation |
|---|---|
| LKG to Class 2 | Prefer parent access only |
| Class 3 to Class 5 | Optional |
| Class 6 to Class 12 | Recommended |

Historical implementation from pre-cleanup audit: student profile creation existed; student login provisioning and invitation were not complete.

### 6.6 Parent Provisioning

```text
Student created
-> Parent email/mobile captured
-> System checks existing parent
-> Existing parent: link child
   New parent: send invitation
-> Parent sets password
-> Parent views linked children only
```

Historical implementation from pre-cleanup audit: `ParentLinkServiceImpl` linked an existing `PARENT` user by `parentUserId`; parent invitation/create-or-link flow was missing.

### 6.7 School Switching

```text
User logs in
-> System resolves authorised schools
-> One school: activate automatically
   Multiple schools: show selector
-> User selects school
-> Backend validates access
-> Active school context/token generated
-> Every operation uses authorised active school
```

Historical implementation from pre-cleanup audit: `/v1/me/schools` and `/v1/me/schools/{schoolId}/activate` existed. Web had `schoolAccessApi`, mobile had `activateSchool`. Full portal UX and route-wide object authorization were incomplete.

## 7. Access-Control Matrix

This matrix is target behavior. Rows marked "Support only" require explicit support reason/audit, not casual unrestricted access.

| Capability | Super Admin | Tenant Admin | School Admin | Teacher | Accountant | Parent | Student |
|---|---:|---:|---:|---:|---:|---:|---:|
| Create Tenant | Yes | No | No | No | No | No | No |
| Assign Subscription | Yes | View/Request | No | No | No | No | No |
| Add School | Support/Admin | Yes within plan | No | No | No | No | No |
| Assign School Admin | Yes | Yes | No | No | No | No | No |
| Configure Academic Year | Support only | Optional | Yes | No | No | No | No |
| Create Classes/Sections | Support only | Optional | Yes | No | No | No | No |
| Import Students | Support only | Optional | Yes | No | No | No | No |
| Add Teachers | Support only | Optional | Yes | No | No | No | No |
| Take Attendance | No | View Reports | Override/View | Assigned Classes | No | View Child | View Own |
| Create Homework | No | View Reports | Manage | Assigned Classes | No | View Child | View Own |
| Enter Marks | No | View Reports | Review/Publish | Assigned Subject | No | View Child | View Own |
| Manage Fees | Support only | Combined Reports | Yes | No | Yes | Pay/View | View |
| Publish Notices | Support only | Organisation Notices | School Notices | Limited | No | View | View |
| View Combined Reports | Platform Summary | Yes | Assigned School Only | Limited | Finance Only | No | No |
| Use AI Assistant | Policy Control | Organisation Scope | School Scope | Assigned Scope | Finance Scope | Child Scope | Own Scope |

Current code deltas: backend has no `ACCOUNTANT` login role; Tenant Admin is incomplete in frontend; School Admin and Tenant Admin are allowed on several school-admin endpoints, but school-level enforcement is incomplete for object routes.

## 8. Tenant, School and Data Isolation Architecture

Historical implementation from pre-cleanup audit:

- Model: pooled tables, not schema-per-tenant.
- Tenant scope: many entities use `tenant_id` and `@Filter(name = TenantFilter.NAME, condition = "tenant_id = :tenantId")`.
- Tenant context: JWT `tenant_id` claim is set by `JwtAuthenticationFilter`; `TenantContextFilter` falls back to `X-Tenant-Id`/`X-School-Id` only when JWT did not set context.
- School context: JWT `school_id` claim exists; school activation issues a new access token through `/v1/me/schools/{schoolId}/activate`.
- School grants: `user_school_access` table exists with user, school, tenant, primary flag, granted metadata.
- School path enforcement: `SchoolPathAccessInterceptor` validates `/v1/school-admin/schools/{schoolId}/...` paths against tenant and user school access.
- Parent-child validation: `ParentPortalServiceImpl` validates linked child before child attendance/homework/results/timetable/fees.
- Teacher assignment validation: tests and teacher attendance flow show assigned-class checks.

Current risks:

- `X-Tenant-Id` and `X-School-Id` fallback can be useful for login/public flows, but must never be trusted for authenticated business authorization.
- Hibernate filters do not protect native SQL, explicit cross-entity joins, or entities without the filter.
- Some business rows have indirect scope only, for example `FeePayment` points to `StudentFeeRecord`.
- Several controllers still use hard-coded `MAIN`.
- School isolation is not route-complete because object routes outside `/schools/{schoolId}` need explicit school access checks.

Long-term target:

- Do not make schema-per-tenant irreversible for 1,00,000+ tenants.
- Plan for pooled/cell-based model.
- Every business row should contain `tenant_id` and `school_id` where relevant.
- Large enterprise customers may later get dedicated database/cell.

Mandatory scope fields:

- `tenant_id`
- `school_id`
- `academic_year_id` where relevant
- `created_at`
- `created_by`
- `updated_at`
- `version/status`

Entities requiring school scope:

- students
- student_enrolments
- staff_assignments
- classes
- sections
- subjects
- attendance
- homework
- exams
- results
- fees
- receipts
- payments
- notices
- timetables
- leave_requests
- documents
- website_content

Non-negotiable security rules:

- Never trust tenantId from frontend.
- Never trust schoolId from frontend without verification.
- Never trust role from browser.
- Tenant context must come from authenticated identity/server-side resolution.
- School context must be validated against `user_school_access`.
- Parent data must validate parent-child link.
- Teacher data must validate assignment.
- School Admin must be limited to assigned schools.
- No business logic must depend on hard-coded `MAIN`.
- Every sensitive mutation must create audit log.

## 9. Large-Scale Cell Architecture

Future model:

```text
Global Control Plane
|-- Tenant Registry
|-- Subscription and Billing
|-- Feature Entitlements
|-- Global Identity / Routing
`-- Platform Monitoring

Operational Cell 1
|-- Backend compute
|-- Database
|-- Redis
|-- Queue/workers
|-- File processing
`-- Cell monitoring

Operational Cell 2
`-- Additional tenants

Dedicated Enterprise Cell
`-- Very large customer / regulated customer
```

Future tenant registry:

```text
tenant_registry
- tenant_id
- tenant_code
- cell_id
- status
- subscription_plan_id
- isolation_type
- region
- created_at
```

Guidance:

- Do not implement complex cells too early.
- Do not design APIs/data in a way that blocks this future.
- Normal tenants should eventually share pooled infrastructure.
- Large tenants can move to dedicated cells later.
- Required now: keep tenant IDs stable, avoid tenant-specific code paths, and do not assume all tenants live in one permanent database.
- Future scale/AI enhancement: implement tenant registry and routing only when operational scale demands it.

## 10. Recommended Domain Modules

Backend should be modular monolith first, not premature microservices.

Recommended modules:

```text
platform
|-- superadmin
|-- tenant
|-- subscription
|-- entitlement
|-- identity
|-- accesscontrol
|-- audit
|-- school
|-- academic
|-- admission
|-- student
|-- parent
|-- staff
|-- teacher
|-- attendance
|-- homework
|-- leave
|-- exam
|-- result
|-- finance
|-- payment
|-- notification
|-- document
|-- website
|-- report
|-- integration
|-- analytics
`-- ai
```

| Module | Purpose | Main Entities | APIs Needed | Events Produced | Permissions | Current Status |
|---|---|---|---|---|---|---|
| superadmin | Platform control plane | Tenant, Feature, SubscriptionPlan, AuditLog | Tenant CRUD/status, subscriptions, usage, support audit | TenantCreated, TenantSuspended, SubscriptionChanged | SUPER_ADMIN | PARTIAL |
| tenant | Paying organisation model | Tenant, TenantConfig, TenantBranding | Tenant profile, branding, status | TenantUpdated | SUPER_ADMIN, TENANT_ADMIN | PARTIAL |
| subscription | Plans, invoices, limits | SubscriptionPlan, TenantSubscription, TenantInvoice | Plans, current subscription, upgrade/cancel, invoice PDF | SubscriptionLimitReached, InvoiceIssued | SUPER_ADMIN, TENANT_ADMIN/SCHOOL_ADMIN view | PARTIAL |
| entitlement | Feature flags and usage limits | Feature, TenantFeature, Usage metrics | Enable/disable feature, check usage | FeatureEnabled, UsageLimitReached | SUPER_ADMIN; enforced server-side | PARTIAL |
| identity | Auth, users, invitations | User, RefreshToken, DeviceSession, Invitation | Login/refresh/logout/change/forgot/reset/invitation | UserInvited, PasswordChanged | All roles by flow | PARTIAL |
| accesscontrol | School/role permissions | UserSchoolAccess, Permission, Role | My schools, activate school, grants | SchoolAccessGranted | SUPER_ADMIN, TENANT_ADMIN target | PARTIAL |
| audit | Immutable security trail | AuditLog, UploadAuditLog | School/tenant audit, platform audit | AuditRecorded | Scoped admins | PARTIAL |
| school | School profile/settings | School, SchoolSettings | School CRUD, settings, dashboard | SchoolCreated, SchoolUpdated | TENANT_ADMIN, SCHOOL_ADMIN | PARTIAL |
| academic | Academic configuration | AcademicYear, ClassLevel, Section, Subject | CRUD and lifecycle | AcademicYearCreated, ClassCreated | SCHOOL_ADMIN/TENANT_ADMIN | PARTIAL |
| admission | Student admission/import | Student, StudentEnrolment, BulkJob | Admit, import, promote, transfer | StudentAdmitted, StudentImported | SCHOOL_ADMIN | PARTIAL |
| student | Student records and self portal | Student, StudentDocument, StudentProfile360 | Profile, docs, own data | StudentUpdated, DocumentUploaded | SCHOOL_ADMIN, STUDENT, PARENT linked | PARTIAL |
| parent | Parent-child access | ParentStudentLink, Guardian | Children, child data, leave, payments | ParentLinked | PARENT, SCHOOL_ADMIN | PARTIAL |
| staff | Staff profiles | Staff, Department, Designation, StaffAttendance | Staff CRUD, attendance, status | StaffCreated, StaffStatusChanged | SCHOOL_ADMIN | PARTIAL |
| teacher | Teacher work scope | TeacherAssignment, Staff, Class/Subject assignments | Assignments, attendance, homework, marks | TeacherAssigned | TEACHER scoped | PARTIAL |
| attendance | Student/staff attendance | AttendanceSession, AttendanceRecord, StaffAttendance | Mark, edit, QR, reports | AttendanceSubmitted | SCHOOL_ADMIN/TEACHER scoped | PARTIAL |
| homework | Homework workflow | Homework, HomeworkSubmission | Publish, submit, review | HomeworkPublished, HomeworkSubmitted | SCHOOL_ADMIN/TEACHER/STUDENT/PARENT | PARTIAL |
| leave | Leave requests | LeaveRequest | Submit, approve/reject | LeaveRequested, LeaveApproved | TEACHER/STAFF/SCHOOL_ADMIN | PARTIAL |
| exam | Exam setup and marks | Exam, ExamSubject, StudentMark | Exam CRUD, marks entry | ExamCreated, MarksSubmitted | SCHOOL_ADMIN/TEACHER scoped | PARTIAL |
| result | Results/report cards | ExamResult, ReportCard | Publish/view results | ResultPublished | SCHOOL_ADMIN/STUDENT/PARENT | PARTIAL |
| finance | Fees and ledgers | FeeCategory, FeeStructure, StudentFeeRecord, FeePayment | Fee setup, demand, records | FeeDemandGenerated, PaymentRecorded | SCHOOL_ADMIN, ACCOUNTANT target | PARTIAL |
| payment | Online payments | PaymentOrder, PaymentGatewayEvent | Create/verify/webhook | PaymentReceived, ReceiptIssued | STUDENT/PARENT/SCHOOL_ADMIN/TENANT_ADMIN | PARTIAL |
| notification | Email/push/WhatsApp | NotificationLog, DeviceToken, WhatsAppMessageLog | Send, logs, device registration | NotificationSent | SCHOOL_ADMIN/TENANT_ADMIN/SUPER_ADMIN | PARTIAL |
| document | File storage | StudentDocument, MediaAsset, UploadAuditLog | Upload/download/presign/quota | DocumentUploaded | Scoped owner/admin | PARTIAL |
| website | Public school websites and branding | Website, WebsitePage, WebsiteSection, CustomDomain | Builder, publish, public read | WebsitePublished | SCHOOL_ADMIN/SUPER_ADMIN | PARTIAL |
| report | Operational reports | ReportExportJob, read models target | Reports/export jobs | ReportExportRequested | SCHOOL_ADMIN/TENANT_ADMIN target | PARTIAL |
| integration | External APIs/webhooks | IntegrationCredential, WebhookEvent target | Partner APIs/webhooks | IntegrationSynced | Tenant/school scoped | MISSING |
| analytics | Reporting/warehouse | DomainEvent, AnalyticsSnapshot target | Dashboards, snapshots | AnalyticsRefreshed | Scoped admins | PARTIAL |
| ai | Governed AI assistance | AiUsageLog, KnowledgeDocument, PromptTemplate | Copilot, prompts, usage, knowledge | AiRequestCompleted | Scope by role/tenant/school | PARTIAL |

## 11. Required Core Entities

Comparison against target entities:

| Group | Required Entities | Current Evidence | Status | Notes |
|---|---|---|---|---|
| Platform/Tenant | Tenant, SubscriptionPlan, TenantSubscription, FeatureEntitlement, TenantUsage, TenantBranding, TenantRegistry / CellAssignment future | Tenant, feature tables, subscriptions, invoices, tenant configs exist. Tenant registry/cell not found. | PARTIAL | Required now: keep tenant model. Future scale/AI enhancement: tenant registry/cells. |
| Identity/Access | User, Role, Permission, UserRole, UserSchoolAccess, Invitation, PasswordReset, LoginSession / RefreshToken, AuditLog | User enum, user table, user_school_access, Redis refresh tokens, device sessions, password reset, audit log exist. Invitation/Permission table missing. | PARTIAL | Required now: invitation and permission/access model. |
| School/Academic | School, SchoolSettings, AcademicYear, ClassLevel, Section, Subject, ClassSubjectAssignment, TeacherAssignment, Timetable | Current scaffold verifies school, academic year, class, section, subject, class-subject assignment, and teacher assignment models. Historical settings/timetable breadth is not rebuilt. | PARTIAL | Required before pilot: staff/teacher provisioning, timetable integration, and broader school access tests as modules return. |
| Student/Parent | Student, StudentEnrolment, Guardian / Parent, ParentStudentLink, StudentDocument, StudentTransfer, StudentPromotionBatch, LeaveRequest | Student, parent links, documents, profile 360, leave exist. Enrolment/promotion batch/transfer workflow not durable. | PARTIAL | Required before paid commercial release: enrolment history and batch jobs. |
| Staff | Staff, StaffSchoolAssignment, Department, Designation, StaffAttendance | Staff, department, staff attendance exist. StaffSchoolAssignment/designation model incomplete or not explicit. | PARTIAL | Required before multi-school release: staff multi-school assignments. |
| Learning/Assessment | Homework, HomeworkSubmission, Exam, ExamSchedule, MarksEntry, ResultPublication, ReportCard | Homework/submissions, exams, marks, results/report card pages exist. Exam schedule/publication workflow partial. | PARTIAL | Required before pilot: result publication/audit completeness. |
| Finance | FeeCategory, FeeStructure, StudentFeeAssignment, Invoice / Demand, Payment, Receipt, Refund, Concession, LedgerEntry | Fee categories/structures/records/payments/orders/receipts exist. Ledger/refund/concession explicit models need hardening. | PARTIAL | Required before paid commercial release: finance ledger and reconciliation model. |
| Communication | Notice, Notification, NotificationDelivery, Template, CommunicationPreference | Notice, NotificationLog, DeviceToken, templates in notification service, WhatsApp logs exist. Preferences/delivery model partial. | PARTIAL | Required before paid commercial release: communication preferences and delivery audit. |
| Website | PublicSite, Page, Section, Lead, AdmissionEnquiry, MediaAsset | Website/pages/sections/custom domains and school public website support existed historically. Leads/admission enquiry/media asset status partial. | PARTIAL | Required before paid commercial release: complete website monetisation and publishing governance if website builder is sold. |
| Analytics/AI Future | DomainEvent, UsageMetric, AnalyticsSnapshot, AiRequest, AiUsageBudget, AiFeedback, ModelExecutionAudit, KnowledgeDocument | AI usage logs, knowledge docs, prompt templates, vector store, analytics controllers exist. Domain event/outbox/budget/feedback/audit model incomplete. | PARTIAL | Future scale/AI enhancement after ERP isolation. |

Entity rule: business entities should directly include `tenant_id` and `school_id` where relevant. Indirect-only scope is not sufficient for high-risk flows such as payments, documents, reports, and AI retrieval.

## 12. API Flow Requirements

Do not blindly create duplicate APIs. First map existing APIs and mark them as EXISTING / PARTIAL / MISSING / REDESIGN.

| API Group | Target APIs | Current Mapping | Status | Required Work |
|---|---|---|---|---|
| Super Admin | `POST /v1/super-admin/tenants/onboard`, tenant list/detail/status/subscription/usage/audit | Current scaffold implements `POST /v1/super-admin/tenants/onboard` for tenant + first school + School Admin invitation + access grant. Other tenant list/detail/status/subscription/usage/audit APIs are not rebuilt yet. | PARTIAL | Required now: add onboarding audit and auth gating next. |
| Tenant Admin | `/v1/tenant-admin/schools`, school create/update/deactivate/admin invite/list/resend/revoke, reports/summary, usage | Current scaffold implements Tenant Admin school create/list/name-update/deactivate, School Admin invite/grant/list/resend/revoke, combined tenant report summary, and school-safe report drilldown. Usage/subscription and tenant settings are not rebuilt yet. | PARTIAL | Required before multi-school release: usage/subscription, tenant settings, polished portal shell, production invitation delivery. |
| Identity | Invitations, auth login/MFA/refresh/logout/forgot/reset, `/v1/me`, `/v1/me/schools`, activate school | Current scaffold implements invitation accept/set-password, login, privileged-user MFA challenge verification, signed stateless access token, refresh rotation, logout/access-token revocation, forgot/reset password, change password, `/v1/me`, `/v1/me/schools`, and school activation. Production out-of-band MFA delivery, device-session management, and full authenticated route UX are not rebuilt yet. | PARTIAL | Required before pilot: out-of-band MFA delivery/device-session policy if production privileged sessions are enabled, and full authenticated route UX. |
| School Admin | Academic/class/section/subject/import/staff/user invite/fees/attendance/homework/notices/reports | Current scaffold implements academic year/class/section, subject, class-subject assignment, teacher assignment, student import/list, staff/teacher provisioning, student-login invitation, fee demand/payment/receipt, bulk job, attendance session, homework publish/list/read, school notice create/list/read/publish, and report export request/list/read/download APIs under `/v1/school-admin`. Historical website and broader user invite APIs are not rebuilt. | PARTIAL | Required before pilot: broader dashboards, website content, frontend notice UX, richer reports, and school access validation per rebuilt module. |
| Teacher | Assignments, attendance, homework, marks, notices, submissions | Current scaffold implements `GET /v1/teacher/assignments`, attendance session create/list/read routes, homework publish/list/read routes, exam/result marks routes, and published notice listing with assignment-scope checks. Historical dashboard, lesson plans, online classes, videos, and submissions review are not rebuilt. | PARTIAL | Required before pilot: richer teacher portal UX and remaining assignment-scoped modules. |
| Parent | Children, child attendance/homework/results/fees/notices, leave requests, payments | Current scaffold implements parent invitation/linking, linked-child list/read, linked-child fee list/payment, linked-child homework listing, linked-child published result listing, and linked-child published notice listing. Child attendance/timetable, parent leave, and full payment/homework/result/notice UI are not rebuilt. | PARTIAL | Required before pilot: parent attendance/timetable/leave flows and richer payment/homework/result/notice UI. |
| Student | Profile, attendance, homework/submission, results, notices | Current scaffold implements optional student login, authenticated student self-profile, own-fee demand listing, own-homework listing/submission, own published-result listing, and own published-notice listing. Student attendance/timetable and mobile UX are not rebuilt. | PARTIAL | Required before pilot: student attendance/timetable flows and mobile UX. |

Target endpoint groups:

```text
Super Admin:
POST /v1/super-admin/tenants/onboard
GET  /v1/super-admin/tenants
GET  /v1/super-admin/tenants/{tenantId}
PATCH /v1/super-admin/tenants/{tenantId}/status
PUT  /v1/super-admin/tenants/{tenantId}/subscription
GET  /v1/super-admin/tenants/{tenantId}/usage
GET  /v1/super-admin/audit

Tenant Admin:
GET  /v1/tenant-admin/schools
POST /v1/tenant-admin/schools
GET  /v1/tenant-admin/schools/{schoolId}
PATCH /v1/tenant-admin/schools/{schoolId}
POST /v1/tenant-admin/schools/{schoolId}/deactivate
POST /v1/tenant-admin/schools/{schoolId}/admins/invite
GET  /v1/tenant-admin/schools/{schoolId}/admins
POST /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation
DELETE /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access
GET  /v1/tenant-admin/reports/summary
GET  /v1/tenant-admin/subscription/usage

Identity:
POST /v1/invitations/accept
POST /v1/auth/login
POST /v1/auth/refresh
POST /v1/auth/logout
POST /v1/auth/forgot-password
POST /v1/auth/reset-password
GET  /v1/me
GET  /v1/me/schools
POST /v1/me/schools/{schoolId}/activate
POST /v1/me/change-password
POST /v1/me/logout

School Admin:
GET/POST/PATCH /v1/school/academic-years
GET/POST/PATCH /v1/school/classes
GET/POST/PATCH /v1/school/sections
GET/POST/PATCH /v1/school/subjects
POST           /v1/school/students/import
GET            /v1/school/import-jobs/{jobId}
POST           /v1/school/staff
POST           /v1/school/users/invite

Teacher:
GET  /v1/teacher/assignments
POST /v1/teacher/attendance
POST /v1/teacher/homework
POST /v1/teacher/marks
GET  /v1/teacher/submissions

Parent:
GET  /v1/parent/children
GET  /v1/parent/children/{studentId}/attendance
GET  /v1/parent/children/{studentId}/homework
GET  /v1/parent/children/{studentId}/results
GET  /v1/parent/children/{studentId}/fees
POST /v1/parent/children/{studentId}/leave-requests
POST /v1/parent/payments

Student:
GET  /v1/student/profile
GET  /v1/student/attendance
GET  /v1/student/homework
POST /v1/student/homework/{homeworkId}/submission
GET  /v1/student/results
GET  /v1/student/notices
```

## 13. Bulk Operation and Large Data Design

Large schools require async bulk operations.

Use async job model for:

- Student import.
- Staff import.
- Marks import.
- Fee demand generation.
- Annual promotion.
- Student transfer.
- Notification sending.
- Report exports.
- Document processing.
- Analytics refresh.

Required flow:

```text
User uploads file / starts bulk action
-> Permission and file validation
-> Bulk job created
-> Worker processes in batches
-> Progress shown in UI
-> Row-level errors generated
-> User confirms where required
-> Audit event recorded
```

BulkJob model:

- id
- tenant_id
- school_id
- job_type
- requested_by
- status
- total_records
- processed_records
- success_records
- failed_records
- error_file_reference
- started_at
- completed_at

Statuses:

- QUEUED
- VALIDATING
- PROCESSING
- PARTIALLY_COMPLETED
- COMPLETED
- FAILED
- CANCELLED

Current scaffold implementation: BULK-001 adds Flyway V11 `bulk_jobs`, a `BulkJob` entity/repository/service/controller, school-guarded School Admin create/list/read/cancel APIs, persisted progress/status lifecycle methods for future workers, `BULK_JOB_CREATED` and `BULK_JOB_CANCELLED` audit rows, direct `BulkJobCreated`, `BulkJobCancelled`, and `BulkJobStatusChanged` outbox events, and a minimal web bulk jobs scaffold. STU-002 adds Flyway V12 `student_import_jobs`, queued student import APIs, persisted submitted rows, an internal processor method, row-level validation errors persisted as JSON with an error reference, and partial-completion progress updates. Status: PARTIAL for the full async product because scheduled workers, object-storage error files, report integration, retry policy, and promotion jobs are still not implemented.

Historical implementation from pre-cleanup audit: student bulk import looped synchronously with row errors; report export jobs were async but in-memory; no generic durable `BulkJob` model was found.

## 14. Event-Driven and Async Foundation

Keep modular monolith first but design with events.

Use:

- Transactional Outbox.
- Event Publisher.
- Async Consumers / Workers.
- Idempotency.
- Retry and dead-letter handling.
- Audit and correlation IDs.

Historical implementation from pre-cleanup audit:

- RabbitMQ durable notification exchange/queues and DLQ exist.
- Async executors exist for audit, notification, and report export.
- Payment webhook idempotency exists.
- ShedLock-backed scheduled jobs exist for retention/demo/fee reminder-style work.
- No transactional outbox model was found.

| Event | Producer | Consumers | Required Data | Sensitive Data Rules | Idempotency Requirement |
|---|---|---|---|---|---|
| TenantCreated | Tenant onboarding | Billing, audit, analytics | tenant_id, plan, actor | No private school data | tenant_id unique |
| TenantActivated | Tenant admin | Audit, notifications | tenant_id, actor, reason | No PII | status transition idempotent |
| SchoolCreated | Tenant Admin onboarding | Defaults, audit, subscription usage | tenant_id, school_id, actor | No student data | school_id unique |
| SchoolAdminInvited | Identity | Email, audit | invitation_id, school_id, role | Mask email in broad logs | invitation_id unique |
| StudentAdmitted | Student | Parent link, analytics | tenant_id, school_id, student_id | No full PII in event body | student_id unique |
| StudentImported | Bulk job | Analytics, notifications | job_id, counts | Error files access controlled | job_id unique |
| StudentPromoted | Bulk job | Analytics, audit | batch_id, source/target class | No PII | batch_id unique |
| StudentTransferred | Student | Audit, documents | student_id, from/to school | Minimize reason | transition idempotent |
| ParentLinked | Parent link | Notifications, audit | student_id, parent_user_id | Mask contact | link unique |
| TeacherAssigned | Staff/teacher | Teacher portal, notifications | teacher_user_id, class/subject | No student list | assignment unique |
| AttendanceSubmitted | Attendance | Parent notification, reports | session_id, counts | No individual status in broad event | session_id version |
| HomeworkPublished | Homework | Notification, mobile sync | homework_id, class/section | No private notes | homework_id version |
| HomeworkSubmitted | Student | Teacher review | submission_id | Document access scoped | submission_id unique |
| ExamCreated | Exam | Reports, notifications | exam_id, schedule | No marks | exam_id unique |
| MarksSubmitted | Marks | Results, audit | exam_id, subject, actor | Avoid raw marks in event if possible | marks batch version |
| ResultPublished | Result | Parent/student notification | exam_id, publish id | No full result payload | publish id unique |
| FeeDemandGenerated | Finance | Notifications, reports | demand batch_id | No full ledger in event | batch_id unique |
| PaymentReceived | Payment | Receipt, ledger, audit | payment_order_id, amount, gateway ref | Mask gateway payload | gateway event id |
| ReceiptIssued | Finance | Parent/student, ledger | receipt_id | No card/payment secrets | receipt_id unique |
| NoticePublished | Notice | Notifications, mobile | notice_id, target | No unpublished draft body | notice_id version |
| DocumentUploaded | Document | Audit, scanning | document_id, owner ref | No raw file path in broad logs | document_id unique |
| SubscriptionLimitReached | Entitlement | Admin alerts, billing | tenant_id, dimension | No PII | tenant + dimension + window |
| AiRequestCompleted | AI gateway | Usage, audit, feedback | ai_request_id, cost, scope | Mask prompt/response unless protected | ai_request_id unique |

## 15. Reports, Analytics and Data Platform

Do not run heavy analytics directly on operational tables forever.

Target:

```text
Operational DB
-> Domain Events / CDC
-> Reporting Read Model
-> Data Warehouse / Data Lake future
-> Dashboards, Analytics and AI
```

Historical implementation from pre-cleanup audit: school reports and CSV exports existed. Exports could be synchronous or in-memory async, and analytics/reporting relied on operational data.

Reporting scope:

| User Type | Reporting Scope |
|---|---|
| Teacher | Assigned classes/subjects |
| School Admin | Assigned school |
| Tenant Admin | All authorised schools in tenant |
| Super Admin | Platform usage/support-controlled view |

Future analytics:

- Student attendance trends.
- Fee collection.
- Result performance.
- Homework completion.
- Teacher workload.
- Admissions pipeline.
- Parent engagement.
- Tenant usage.
- Subscription revenue.
- Support issues.

Current scaffold implementation: REP-001 adds durable report export jobs/files with direct tenant and school scope, links each export to a `bulk_jobs` row, stores scaffold CSV files durably in `report_export_files`, exposes School Admin request/list/read/download APIs, adds a minimal web report exports panel, and verifies cross-school export denial. MUL-004 adds Tenant Admin combined summary and school-safe drilldown. Status: COMPLETE for current scaffold foundation; object-storage downloads, scheduled workers, and reporting read models for expensive analytics remain.

Required before paid commercial release: object-storage downloads, reporting read model for expensive analytics, scheduled report workers, and expanded tenant/school scoped report tests.

## 16. AI and Data Science Future Architecture

AI must be governed and permission-controlled.

Historical implementation from pre-cleanup audit:

- AI modules exist for usage, prompts, knowledge, embeddings, gateway/copilot/insights.
- Spring AI dependencies include OpenAI/Anthropic and pgvector.
- Tests exist for knowledge/embedding tenant isolation and prompt injection.
- School-admin AI copilot and super-admin AI pages exist.
- AI usage logging exists, but entitlement, budget, human approval, and model execution audit are not complete enough for production-sensitive use.

AI roadmap:

Stage 1: Low-risk productivity AI

- Notice drafting.
- Homework drafting.
- Lesson-plan drafting.
- Report explanation.
- Notice translation.
- Admission enquiry assistant.
- School policy Q&A from approved docs.

Stage 2: Analytics assistance

- Attendance-risk alerts.
- Fee overdue-risk indicators.
- Weak-topic summaries.
- Teacher workload insights.
- Admission funnel analysis.
- School comparison dashboards.

Stage 3: Personalised learning

- Student practice questions.
- Learning recommendations.
- Doubt-solving assistant.
- Parent monthly summary.
- Study planner.

Stage 4: Ecosystem

- Government reporting integrations.
- Voice assistant.
- Regional language support.
- Document intelligence.
- Transport integrations.
- Biometric/QR integrations.
- Partner APIs.

AI rules:

- No AI request may bypass tenant/school permissions.
- Parent AI output uses only linked-child data.
- Teacher AI output uses only assigned-class data.
- Sensitive personal data must be minimised/masked.
- AI-generated official actions require human approval.
- AI usage, cost and feedback must be logged.
- AI features must be enabled/disabled per tenant and subscription.
- Tenant-specific AI usage budget required.
- Knowledge documents must be access-controlled and versioned.

Future AI entities:

- AiFeatureEntitlement
- AiUsageBudget
- AiRequestAudit
- AiFeedback
- KnowledgeDocument
- KnowledgeCollection
- ModelConfiguration
- PromptTemplate
- PredictionResult
- PredictionReview

Recommendation: Future scale/AI enhancement after tenant/school isolation and audit coverage are verified.

## 17. Subscription, Limits and Monetisation

Billable dimensions:

- Number of schools.
- Number of active students.
- Number of staff users.
- Storage usage.
- Notification usage.
- Online payment usage.
- AI credits.
- Advanced reporting.
- Website builder.
- API integrations.
- Dedicated infrastructure.

Suggested plans:

| Feature | Starter | Growth | Premium | Enterprise |
|---|---:|---:|---:|---:|
| Schools | 1 | 3 | 10 | Custom |
| Active Students | 1,000 | 5,000 | 25,000 | Custom |
| Parent Portal | Yes | Yes | Yes | Yes |
| Online Fees | Optional | Yes | Yes | Yes |
| Website Builder | Basic | Yes | Advanced | Custom |
| Bulk Imports | Basic | Yes | Yes | Yes |
| AI Drafting | Limited | Limited | Included | Custom |
| Predictive Analytics | No | No | Yes | Yes |
| Public APIs | No | No | Limited | Yes |
| Dedicated Isolation | No | No | Optional | Yes |

Usage events:

- SchoolCreated
- StudentActivated
- UserActivated
- StorageConsumed
- NotificationSent
- PaymentProcessed
- AiRequestConsumed
- ReportExported

Historical implementation from pre-cleanup audit: subscriptions, invoices, feature flags, entitlement checks, and student/staff limits existed partially. Required before paid commercial release: complete metering, billing reconciliation, plan changes, suspended subscription behavior, and entitlement tests.

## 18. Security, Privacy and Compliance

Document current state and target state.

Authentication:

- JWT/access tokens: CURRENT PARTIAL. Current scaffold uses signed stateless access tokens with user, tenant, role, active school, jti, and expiry.
- Refresh token rotation: CURRENT PARTIAL. Current scaffold stores opaque refresh-token hashes in `refresh_tokens` and rotates on use.
- Secure password hashing: CURRENT PRESENT. BCrypt is used.
- Invitation/set-password: CURRENT PRESENT for School Admin onboarding.
- Forgot/reset password: CURRENT PARTIAL. Scaffold reset-token lifecycle exists; production delivery is missing.
- Forced password update for temporary credentials: CURRENT PARTIAL. User flag exists; force-change route guard is not rebuilt.
- MFA for privileged users: CURRENT PARTIAL. `SUPER_ADMIN`, `TENANT_ADMIN`, and `SCHOOL_ADMIN` require a one-time MFA challenge before token issuance; production out-of-band delivery is missing.
- Session revocation: CURRENT PARTIAL. Logout revokes the current access token hash and submitted refresh token; revoke-all/device inventory is not rebuilt.
- Rate limiting: CURRENT PARTIAL. Login has in-process per-email throttling; distributed/API-wide limits are not rebuilt.

Authorization:

- Role checks: CURRENT PARTIAL. URL and method-level checks exist.
- Permission checks: CURRENT PARTIAL/MISSING. No explicit permission table found.
- School access validation: CURRENT PARTIAL. Current rebuilt modules use active school context, object actual school, teacher assignment, parent-child link, or own student profile. Remaining unreconstructed modules must add route-level object checks when rebuilt.
- Tenant validation: CURRENT PARTIAL. JWT context and Hibernate filters exist.
- Parent-child validation: CURRENT PARTIAL. Parent portal service validates links.
- Teacher assignment validation: CURRENT PARTIAL. Some tests and controller checks exist.
- Feature entitlement checks: CURRENT PARTIAL. Feature flags and usage enforcer exist.
- Method-level security: CURRENT PRESENT. `@EnableMethodSecurity`, `@PreAuthorize` usage.

Data protection:

- Encryption in transit: TARGET via HTTPS/Nginx. Local Nginx TLS exists.
- Encryption at rest: TARGET. App encryption config exists; DB/storage at-rest policy must be production-managed.
- Secret management: PARTIAL. Secrets guard and `.env.example`; production vault not wired.
- Signed file URLs: PARTIAL. MinIO presign settings exist.
- Sensitive-data masking: PARTIAL. Sensitive data tests and demo anonymisation migrations exist.
- Backup encryption: PARTIAL. pgbackup uses GPG passphrase.
- Retention and deletion rules: PARTIAL. Retention service/scheduler exists.
- No insecure production demo data: PARTIAL. Demo seeds and mobile demo defaults must be gated.

Audit required for:

- Tenant creation/status change.
- School creation/status change.
- Admin invitations.
- User role changes.
- Student admissions/transfers/promotions.
- Attendance edits.
- Marks/result publication.
- Notice creation/publication.
- Fee changes/payments/refunds/receipts.
- Sensitive document access.
- AI use involving school/student data.
- Subscription changes.
- Support access.

Secure development:

- Input validation.
- Object-level authorization tests.
- Dependency scanning.
- Secret scanning.
- OWASP checks.
- Container scanning.
- API integration tests.
- Tenant isolation tests.
- School isolation tests.
- Backup/restore verification.

Required now: complete school isolation and invitation security before feature expansion.

## 19. Performance and Reliability

Plan for:

- Stateless backend instances.
- Proper indexing.
- Pagination for all large listings.
- Async bulk processing.
- Safe caching.
- Queue-based notifications.
- Async report exports.
- Object storage.
- Idempotent payments/webhooks.
- Tenant/school-safe metrics.
- Backups and restore drills.

Current strengths:

- Backend is stateless for access tokens; refresh state is Redis.
- Flyway migrations include performance indexes.
- RabbitMQ queue config and DLQ exist for notifications.
- Payment webhook idempotency exists.
- Docker Compose includes Postgres/Redis/RabbitMQ/MinIO/monitoring.
- DR drill workflow exists.

Current gaps:

- Student/staff list endpoints and many screens need robust pagination.
- Bulk imports/promotions are synchronous.
- Report export jobs are in-memory.
- Analytics/reporting are not isolated into read models.
- Large fan-out notification reliability needs outbox/idempotent delivery.

High-volume flows to test:

- Morning attendance.
- Student CSV import.
- Annual promotion.
- Fee demand creation.
- Payment callbacks.
- Result publication.
- Parent result viewing.
- Notification fan-out.
- Dashboard/report generation.

## 20. Frontend and Mobile Architecture

Required portals:

- Public Website.
- Super Admin Portal.
- Tenant Admin Portal.
- School Admin Portal.
- Teacher Portal.
- Parent Portal.
- Student Portal.
- Finance/Accountant views.

| Portal | Routes Found | Required Screens | Current Status | Missing Items | Permissions |
|---|---|---|---|---|---|
| Public Website | Historical routes included `/`, `/home`, `/features`, `/about`, `/contact`, `/sites/:tenantCode`, legal routes, and other marketing routes not required for ERP baseline | School websites, legal pages, public admissions/enquiry pages | PARTIAL | Public content governance, school publishing controls, production content process | Public read-only |
| Super Admin Portal | Historical `/super-admin/*` dashboard, tenants, analytics, comparison, AI prompts/knowledge/usage, audit | Tenant onboarding, plan assignment, feature flags, support audit, platform health | PARTIAL | Real onboard flow with first school/admin; support access reasons | `SUPER_ADMIN` |
| Tenant Admin Portal | Current scaffold has protected Tenant Admin school creation, school/admin management, combined report, and tenant settings/subscription usage panels; no full portal shell/list-detail workflow exists yet. | Schools, admins, combined reports, subscription usage, organisation branding | PARTIAL | Plan/subscription assignment, billing/invoices, organisation branding, richer navigation | `TENANT_ADMIN` |
| School Admin Portal | `/school-admin/*` dashboard, academic setup, students, staff, attendance, fees, notifications, WhatsApp, exams, timetable, homework, reports, notices, website, AI, audit, settings | Full single-school ERP | PARTIAL | School selector, object-level security UX, invite flows, bulk job progress | `SCHOOL_ADMIN` now; some backend allows `TENANT_ADMIN` |
| Teacher Portal | `/teacher/*` dashboard, timetable, attendance, homework, assignments, lesson plans, online classes, videos, notices, leave | Teacher daily work | PARTIAL | Marks flow alignment, richer mobile-first workflows | `TEACHER` |
| Parent Portal | `/parent/*` dashboard, child detail, notices | Children, attendance, homework, results, fees/payment, leave, notices | PARTIAL | Payment/leave UX and multi-child school context | `PARENT` |
| Student Portal | `/student/*` dashboard, homework, assignments, timetable, results, fees, attendance QR, notices, profile | Own data, homework submission, resources | PARTIAL | Optional login provisioning and self-only verification | `STUDENT` |
| Finance/Accountant | No dedicated finance role portal; fees live under school-admin | Fee setup, collection, receipts, finance reports, refunds | MISSING/PARTIAL | Accountant role, route guards, finance-only nav | Target `ACCOUNTANT` |

UX rules:

- Navigation must be permission-based.
- Tenant Admin must see school selector where required.
- School Admin must never see unauthorised schools.
- Every bulk job needs progress/error UI.
- Destructive action needs confirmation.
- Forms need clear validation.
- Mobile-first flows matter for parents and teachers.
- Public demo mode must never write into production data.

Mobile requirements:

- Parent: notices, fees, attendance, homework, results, leave.
- Teacher: attendance, homework, timetable, marks.
- Student: homework, notices, results, resources.

Current mobile scaffold: role-based feature folders exist, but no runnable mobile app manifest remains after cleanup. Historical mobile audit found Expo login, secure native session storage, school switching, and API snapshot cards for student/parent/teacher/school admin; it was not yet a full mobile product.

## 21. Infrastructure and Deployment Roadmap

Document current infra and target infra.

Target development stack:

- Docker Compose.
- PostgreSQL.
- Redis.
- RabbitMQ.
- MinIO.
- Mail testing.
- Monitoring if present.

Current scaffold infra: `infra/docker`, `infra/k8s`, `infra/terraform`, `infra/monitoring`, `infra/backup`, `infra/nginx`, and `infra/load-tests` folders exist, but active manifests are not present after cleanup. Historical pre-cleanup `docker-compose.yml` included local Nginx TLS proxy, Postgres pgvector, Redis, MinIO, MailHog, Prometheus, Alertmanager, Grafana, Tempo, Pushgateway, pgbackup, Loki, Promtail, and RabbitMQ, with exposed services bound to `127.0.0.1`.

First production pilot:

- Managed PostgreSQL.
- Secure backend deployment.
- Managed object storage.
- HTTPS/domain.
- Secrets management.
- Backup verification.
- Monitoring and alerts.
- CI/CD controls.

Growth:

- Horizontal backend scaling.
- Managed Redis.
- Managed queue/event service.
- Reporting database.
- Object storage lifecycle.
- Centralised logging.
- Rate limits/quotas.

National scale:

- Cell-based deployment.
- Global tenant registry.
- Multiple DB clusters.
- Tenant routing.
- Dedicated enterprise cells.
- Analytics/data lake.
- Governed AI gateway.
- Disaster recovery.

Current CI/CD: the current scaffold has `.github/workflows/ci.yml`, which runs backend, frontend, and mobile validation on push, pull request, and manual dispatch. It intentionally does not deploy, publish images, run security scans, publish OpenAPI, or run disaster-recovery drills yet.

Historical CI/CD evidence from the pre-cleanup audit:

- `ci.yml`: backend `mvn verify`, frontend build, secret scan. Comment said mobile job removed although mobile directory existed.
- `security-nightly.yml`: OWASP dependency check and Trivy backend image scan.
- `docker-publish.yml`: image publishing.
- `deploy.yml`: manual/release deploy workflow with real deploy steps still placeholder.
- `dr-drill.yml`: monthly restore validation workflow.
- `openapi-publish.yml`: OpenAPI publish workflow.

Required before pilot: managed production environment, secrets, deployment automation, HTTPS, backup restore proof, alerts.

## 22. Testing Strategy

Required tests:

Unit:

- Business rules.
- Fee calculations.
- Permission decisions.
- Promotion/transfer rules.

Integration:

- Auth/login.
- Tenant onboarding.
- School activation.
- Student import.
- Attendance.
- Payments.
- Parent-child access.

Security:

- Tenant A cannot see Tenant B.
- School A admin cannot see School B.
- Parent cannot see unlinked child.
- Teacher cannot access unassigned class.
- Student cannot access other student.
- Suspended subscription behaviour.
- Invalid school selection.
- Hard-coded `MAIN` removed.

Performance:

- Large student import.
- Attendance spike.
- Fee generation.
- Report export.
- Result publication.

End-to-end:

- Super Admin creates tenant/school.
- School Admin sets up school.
- Teacher marks attendance.
- Parent views child info.
- Student submits homework.
- Payment and receipt lifecycle.

Current evidence:

- Backend tests passed on 2026-05-26: 250 tests, 0 failures, 0 errors, 0 skipped across 42 Surefire XML reports.
- Test inventory includes tenant isolation, cross-tenant isolation, multi-school multi-tenant, role matrix, parent portal, payments/webhook idempotency, AI prompt injection, knowledge/embedding tenant isolation, storage, upload audit, security headers, rate limit coverage.
- Frontend tests exist for auth pages/store, protected route, school admin layout, tenant pages, analytics banner/tracker, app render.
- Mobile has typecheck but no test suite found.

Required now: add explicit school isolation tests for every object route and onboarding/invitation tests.

## 23. Migration and Backward Compatibility

Document:

- Current database design: pooled Postgres schema with Flyway V1 to V93, tenant rows and many school-scoped business tables.
- Required schema changes: invitation table, direct scope fields where missing, durable bulk jobs, outbox, optional role/permission tables, first-school onboarding metadata, finance ledger/refund/concession tables, tenant registry future.
- Backward compatibility risks: existing tenants may have `MAIN` school; demo migrations assume `MAIN`; existing school admin login may rely on `MAIN` fallback; frontend auth role type may reject backend roles.
- Data migration steps: add new columns/tables non-destructively, backfill from current school/tenant relationships, preserve `MAIN` as legacy code until business logic no longer depends on it, then migrate display names and add primary flag.
- Rollback plan: every migration must be reversible by data backup/restore or explicit rollback script; no destructive migration without approval.
- Feature flag rollout: new onboarding and school switching should be guarded until validated.
- Test evidence: run Flyway validation, backend integration tests, frontend build, school isolation tests, and migration smoke data checks.

Rules:

- No destructive migration without explicit approval.
- Do not delete old APIs/modules without documenting impact.
- For schema-per-tenant to pooled/cell future, first create architecture decision and migration plan.
- Keep existing demo/dev data compatible where reasonable.

## 24. Implementation Phases

PHASE 0: Repository Truth and Architecture Baseline

Goal:
Know what exists and establish one source of truth.

Status: IN_PROGRESS through this document. Critical baseline audit is complete; future tasks must keep this file updated.

PHASE 1: Correct Single-School Onboarding

Goal:
Create real customer, real school and secure admin access professionally.

Key outcome: Super Admin creates tenant + first real school + secure School Admin invitation + school access grant + audit event. Customer never sees technical `MAIN`.

PHASE 2: Security and School Isolation

Goal:
Prevent cross-tenant and cross-school data access.

Key outcome: no controller/service relies on `MAIN`; every school-scoped route validates tenant, school access, parent-child link, or teacher assignment.

PHASE 3: Strong Core School ERP

Goal:
One real school can operate using the product.

Key outcome: school admin setup, students, staff/teachers, parents, attendance, homework, exams/results, fees/payments, notices, documents and reports work end-to-end.

PHASE 4: Bulk Operations and Scale Foundation

Goal:
Large school operations are reliable and async.

Key outcome: durable bulk jobs, row errors, retry, audit, progress UI, object storage artifacts.

PHASE 5: Tenant Admin and Multi-School Product

Goal:
One organisation manages multiple schools safely.

Key outcome: Tenant Admin portal, school creation within plan, school switching, combined reports, cross-school access verified.

PHASE 6: Subscription, Billing and Commercial Readiness

Goal:
Product can be sold and operated commercially.

Key outcome: plans, limits, usage metering, invoices, payment reconciliation, support workflows, production ops.

PHASE 7: Analytics and AI Foundation

Goal:
Prepare governed intelligence without hurting operational ERP.

Key outcome: outbox/events, analytics read model, AI entitlement/budget/audit, scoped retrieval.

PHASE 8: Large-Scale / 1 Lakh+ Architecture

Goal:
Prepare national-scale deployment and enterprise isolation.

Key outcome: tenant registry, cell routing, operational migration playbooks, enterprise isolation option.

## 25. Detailed Task Register

Allowed statuses:

- NOT_STARTED
- IN_PROGRESS
- PARTIAL
- BLOCKED
- COMPLETED
- VERIFIED
- DEFERRED

## 25A. Completed Task Verification Recheck

Verification date: 2026-05-26, Asia/Kolkata. This recheck uses the current scaffold as source of truth and treats the pre-cleanup legacy code only as historical context.

| Task ID | Claimed status in the plan | Actual backend evidence | Actual frontend evidence | Actual migration/database evidence | Actual test evidence | Validation command run | Result | Remaining gap, if any | Risk if we move ahead without fixing it |
|---|---|---|---|---|---|---|---|---|---|
| STRUCT-001 | COMPLETED | Current top-level `backend`, `frontend`, `mobile`, `infra`, `docs`, `scripts`, `tests`, `.github` scaffold exists; backend source has 39 Java files across domain-oriented packages. Import scan shows simple scaffold dependencies and no compile-time break. | Feature folders and app/shared structure exist under `frontend/src`; onboarding and invitation pages are placed in feature modules. | No DB migration required for folder scaffold. | Build/test commands below pass after scaffold. | `find backend frontend mobile infra docs scripts tests .github -type d`; `find backend/src/main/java/com/cloudcampus -type f -name '*.java'`; `jdeps -q -recursive -verbose:package target/classes`; `cd backend && mvn -q test`; `cd frontend && npm run build`; `cd mobile && npm run typecheck` | VERIFIED | No automated architecture-cycle rule exists yet. | Dependency drift could creep in silently as modules are rebuilt. |
| STRUCT-002 | VERIFIED | `backend/pom.xml`, `CloudCampusApplication`, readiness API, JPA/Flyway baseline, and tests compile/run. | `frontend/package.json`, Vite app shell, app test, onboarding/invitation screens compile/build. | Flyway V1-V2 validate and apply in H2 test runtime. | Backend 12 tests pass; frontend 4 tests pass; mobile 1 test passes. | `cd backend && mvn -q test`; `cd frontend && npm run build`; `cd frontend && npm test`; `cd mobile && npm run typecheck`; `cd mobile && npm test` | VERIFIED | Frontend lint is not configured. | CI-001 now gates scaffold build/typecheck/tests; lint/static-analysis remains OPS-001. |
| ONB-001 | VERIFIED | `TenantOnboardingService` creates `School` from `firstSchool`, rejects reserved `MAIN`, and no legacy `TenantServiceImpl` create flow remains in current scaffold. AUTH-005/SEC-004 now requires authenticated `SUPER_ADMIN` for the onboarding endpoint. | `TenantOnboardingPage` requires first school code/name, blocks `MAIN` before API call, sends Bearer auth, and shows login-required state when no token exists. | V1 creates `tenants` and `schools` with unique `(tenant_id, code)`. | `TenantOnboardingFlowTest` verifies persisted real school, `MAIN` rejection, SUPER_ADMIN-only authorization, spoof rejection, and authenticated audit actor. Frontend tests verify `MAIN` rejection, login-required state, and token forwarding. | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build`; `rg -n "MAIN|TenantServiceImpl|/v1/super-admin/tenants/onboard" backend/src/main/java frontend/src docs/...` | VERIFIED | Legacy old tenant CRUD endpoint is intentionally superseded in the current scaffold, not kept backward-compatible. | Old clients depending on the deleted legacy tenant-create API would need migration before use. |
| ONB-002 | VERIFIED | Onboarding creates `UserAccount` with `SCHOOL_ADMIN` role and a pending `Invitation` with SHA-256 token hash; raw token is returned only once for delivery. | Onboarding result displays invitation readiness for the primary admin. | V1 creates `user_accounts` and `invitations` with `token_hash` unique and no raw-token column. | `TenantOnboardingFlowTest` verifies invitation/user/role/token presence and pending status. | `cd backend && mvn -q test`; `rg -n "rawToken|tokenHash|Invitation" backend/src/main/java backend/src/test/java` | VERIFIED | Email/SMS delivery is not implemented; token is returned to Super Admin response. | Manual token handling is operationally fragile until delivery is added. |
| ONB-003 | VERIFIED | Onboarding persists `UserSchoolAccess` for the first School Admin and `InvitationAcceptanceService` reports `schoolAccessGranted=true`. | Onboarding response type and result include school access state. | V1 creates `user_school_access` with tenant, school, user, role, primary flag and unique user-school grant. | `TenantOnboardingFlowTest` verifies persisted grant and acceptance response; `SchoolAccessIsolationTest` verifies grant works for assigned school. | `cd backend && mvn -q test`; `rg -n "UserSchoolAccess|schoolAccessGranted|requireSchoolAdminAccess" backend/src/main/java backend/src/test/java frontend/src` | VERIFIED | No school selector or Tenant Admin grant-management UI yet. | Multi-school operations cannot be safely administered yet. |
| ONB-004 | VERIFIED | `AuditLogService` records tenant creation, school creation, School Admin invitation, and school access grant during onboarding with authenticated Super Admin actor id and role. AUD-001 now adds current-scaffold mutation audit coverage beyond onboarding. | No audit UI in current scaffold. | V2 creates `audit_logs` with tenant/school/action/entity metadata indexes. | `TenantOnboardingFlowTest` asserts four onboarding audit actions, actor attribution, created tenant/school/invitation/access metadata, and no raw token/full email leakage. `AuditCoverageMatrixTest` inventories current mutation controllers. | `cd backend && mvn -q test`; `rg -n "AuditAction|audit_logs|SCHOOL_ADMIN_INVITED|SCHOOL_ACCESS_GRANTED" backend/src/main/java backend/src/test/java backend/src/main/resources/db/migration` | VERIFIED | No audit viewer/API yet; future rebuilt mutation controllers must be added to the audit matrix. | Future modules can become untraceable if their mutation routes bypass the matrix or skip runtime audit assertions. |
| AUTH-001 | VERIFIED | `POST /v1/invitations/accept` hashes submitted token, requires pending and unexpired invitation, stores BCrypt password hash, activates user, and rejects reuse/invalid/expired tokens. No logging statements store password/token. | `InvitationAcceptPage` submits token, display name, and password and shows access result. | V1 stores only `password_hash` and `token_hash`; no plain password/raw-token columns. | `TenantOnboardingFlowTest` now covers end-to-end acceptance, BCrypt hash, reuse rejection, invalid token rejection, and expired token rejection without activation. | `cd backend && mvn -q test`; `cd frontend && npm test`; `rg -n "password|token|LOGGER|System\\.out|println|BCrypt|PasswordEncoder" backend/src/main/java backend/src/test/java` | VERIFIED | Expired rejection does not persist `EXPIRED` status because the exception rolls back the in-transaction status mutation. | Operational cleanup/reporting may still see expired pending rows, though acceptance remains blocked. |
| AUTH-002 | VERIFIED | `POST /v1/auth/login` verifies BCrypt password for active users only and returns a signed stateless access token with server-derived `userId`, `tenantId`, `role`, and active school context after required MFA. `GET /v1/me`, `GET /v1/me/schools`, and `POST /v1/me/schools/{schoolId}/activate` resolve identity from the Bearer token and database state. AUTH-003 extends this with refresh/logout/password lifecycle hardening; AUTH-004 adds privileged MFA and rate limiting. | `LoginPage` and `authApi` provide minimal login/MFA/current-user/school API support and store scaffold tokens in `sessionStorage` after MFA verification. | AUTH-003 adds V3 session lifecycle tables; AUTH-004 adds V4 `mfa_challenges`. | `AuthSessionFlowTest` covers accepted invitation login through MFA, wrong password, inactive user, header/body/query spoof attempts, current-user identity, school list, unassigned school activation, cross-tenant activation, updated token context, refresh rotation, logout revocation, reset password, change password, MFA rejection/reuse, and rate limiting. Frontend login tests cover token storage and MFA checkpoint. | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build`; `rg -n "@RestController|@RequestMapping|@GetMapping|@PostMapping" backend/src/main/java/com/cloudcampus` | VERIFIED | Email-only login rejects ambiguous duplicate emails because tenant-qualified login is intentionally not trusted from the frontend. Production out-of-band MFA delivery is not rebuilt; scaffold returns the one-time code for manual delivery. | The remaining MFA delivery gap means privileged sessions still need a production delivery channel before real launch. |
| AUTH-004 | VERIFIED | `POST /v1/auth/login` now withholds access/refresh tokens for `SUPER_ADMIN`, `TENANT_ADMIN`, and `SCHOOL_ADMIN` until `POST /v1/auth/mfa/verify` validates a pending one-time MFA challenge. Codes are BCrypt-hashed in `mfa_challenges`, expire after 5 minutes, lock after repeated bad attempts, and cannot be reused. Login failures are throttled with an in-process 5-failure/15-minute limiter returning HTTP 429. | `authApi.verifyMfa` and `LoginPage` support the MFA checkpoint and do not store tokens until verification succeeds. | V4 creates `mfa_challenges` with tenant/user/status/attempt/expiry columns and no plain-code column. Rate limiter is in-memory scaffold state, not a persistent/distributed table. | `AuthSessionFlowTest` verifies privileged School Admin login requires MFA before session issuance, wrong MFA code is rejected, MFA reuse is rejected, and repeated wrong passwords are rate-limited. Frontend test verifies MFA challenge handling before token storage. | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | VERIFIED | Scaffold MFA delivery returns the raw one-time code in the login response because no email/SMS/authenticator provider exists yet; mobile was not touched. Device trust/session inventory remains unbuilt. | Moving to production without real out-of-band MFA delivery would make MFA a step-up ceremony, not a true second factor. |
| AUTH-005 / SEC-004 | VERIFIED | `POST /v1/super-admin/tenants/onboard` now resolves the Bearer token through `AuthenticatedUserResolver` and allows only active authenticated `SUPER_ADMIN` users. `SCHOOL_ADMIN`, `TENANT_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, and `STUDENT` are rejected. Request body and non-context headers cannot spoof role, tenant id, or user id. | Super Admin onboarding reads the scaffold access token from `sessionStorage`, sends `Authorization: Bearer ...`, and shows `Super Admin login is required.` when missing. | No schema change; existing `audit_logs.actor_id` and `actor_type` now store the authenticated Super Admin actor for onboarding. Added opt-in bootstrap runner only when `cloudcampus.bootstrap.super-admin.enabled=true`; it refuses `prod`/`production` profile and requires explicit email/password. | `TenantOnboardingFlowTest` verifies unauthenticated rejection, every non-super role rejection, SUPER_ADMIN success, role/user/body spoof rejection, and authenticated audit actor rows. Frontend tests verify login-required state and token forwarding. | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | VERIFIED | Production Super Admin creation still needs an operational runbook/secret delivery process; bootstrap is disabled unless explicitly configured. Production out-of-band MFA delivery and device/session management remain deferred. | Without the follow-up runbook, first-account creation is controlled by config but not yet operationalized for production. |
| SEC-001 | PARTIAL | `ClientTenantContextSpoofingFilter` rejects `X-Tenant-ID`, `X-School-ID`, and `X-Active-School-ID`; body `tenantId` noise is ignored by onboarding/login DTOs; `/v1/me` returns database-derived tenant and role even when query parameters attempt spoofing. Login and current-user APIs use signed Bearer token identity, not frontend tenant/school/role fields. `AuthenticatedUserResolver` and `AuthSessionService` now ignore cross-tenant school grants while resolving active school and allowed-school context. | Login panel submits only email/password and stores returned token; frontend was not touched for SEC-001. | No additional migration required. | `TenantContextSpoofingTest` covers header rejection and onboarding body spoof noise. `AuthSessionFlowTest` covers authenticated header/body/query spoof checks, Tenant A denied when trying to activate Tenant B school by URL/body/query, signed token tenant-claim mismatch rejection, and `/v1/me` plus `/v1/me/schools` not leaking a malformed cross-tenant school grant. | `cd backend && mvn -q test`; `rg -n "ClientTenantContextSpoofingFilter|X-Tenant-ID|tenantId|AuthSessionFlowTest|tenantConsistentAccessList" backend/src/main/java backend/src/test/java frontend/src` | VERIFIED | Current scaffold tenant-context and current-user/school object routes are verified. Future tenant-scoped business APIs must add their own Tenant A to Tenant B negative tests as each module is rebuilt. | If future business controllers skip the same server-derived tenant/object checks, cross-tenant data exposure could be reintroduced despite the scaffold foundation being verified. |
| SEC-002 | PARTIAL | `SchoolAccessService.requireSchoolAdminAccess` allows explicitly granted school and rejects unassigned same-tenant and cross-tenant schools. PAR-001 parent-child routes, STAFF-001 staff/teacher provisioning route, ACA-001 academic year/class/section routes, ACA-002 subject/class-subject/teacher assignment routes, STU-001 student import/list routes, BULK-001 bulk-job routes, STU-003 student login/self-profile routes, FEE-001 fee demand/payment routes, ATT-001 attendance routes, HOME-001 homework routes, EXAM-001 exam/result routes, NOTE-001 notice routes, and REP-001 report export routes now enforce route-level object school checks. Timetable/documents/website controllers do not exist in current scaffold. | Minimal parent-link, staff provisioning, academic setup, academic assignment, student import, bulk job, fee lifecycle, backend attendance, backend homework, backend exam/result, backend notice, and backend report export scaffolds exist; no full School Admin portal or cross-school manipulation UI exists. | V1 has `user_school_access`; V5 adds parent-child school-linked student anchors; V6 adds academic school-scoped tables; V7 adds student class/section import fields; V8 adds subjects, class-subject assignments, and teacher assignments; V9 adds staff profiles; V11 adds bulk jobs; V13 links student login users; V14 adds fee demand/payment tables; V15 adds attendance sessions/records; V16 adds homework assignments/submissions; V17 adds exams/results; V18 adds notices; V19 adds report export jobs/files. | `SchoolAccessIsolationTest` proves the guard at service level and parameterizes same-tenant denial across object types. `ParentChildLinkingFlowTest`, `StaffProvisioningFlowTest`, `AcademicLifecycleFlowTest`, `AcademicAssignmentFlowTest`, `StudentImportFlowTest`, `StudentImportJobFlowTest`, `StudentLoginProvisioningFlowTest`, `BulkJobFlowTest`, `FeeLifecycleFlowTest`, `AttendanceFlowTest`, `HomeworkFlowTest`, `ExamFlowTest`, `NoticeFlowTest`, and `ReportExportFlowTest` prove route-level object denial for current rebuilt modules. `SchoolScopedControllerGuardCoverageTest` verifies school-scoped controllers have approved guard markers. | `cd backend && mvn -q test`; `cd backend && mvn -q -Dtest=ReportExportFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `rg -n "@RestController|@Controller|@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@PatchMapping|@DeleteMapping" backend/src/main/java`; `find backend/src/main/java/com/cloudcampus -type d` | PARTIAL | Must add route-level negative tests for remaining rebuilt controllers, including timetable/document/website flows and parent/student object flows in each future module. Parent/student attendance routes are not rebuilt yet. | Current rebuilt routes are protected, but product-wide school isolation is still incomplete until every real data API is rebuilt with object-level checks. |
| ARCH-001 | VERIFIED | Current tenant/school creation flow is `POST /v1/super-admin/tenants/onboard`; historical `TenantServiceImpl.create`/`MAIN` behavior is documented as deleted legacy context. | Current frontend onboarding flow is documented and tested. | V1 schema matches current onboarding model. | Backend and frontend onboarding tests pass. | `rg -n "MAIN|TenantServiceImpl|/v1/super-admin/tenants/onboard" backend/src/main/java frontend/src docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`; `cd backend && mvn -q test` | VERIFIED | Broader tenant list/detail/status APIs are not rebuilt and remain planned separately. | Misreading historical rows as current implementation could lead to overestimating platform readiness. |
| ARCH-002 | VERIFIED | Current API inventory now includes readiness, SUPER_ADMIN tenant onboarding, invitation acceptance, auth/session/MFA/password lifecycle, current-user school APIs, parent-child linking/parent child read APIs, staff/teacher provisioning API, academic year/class/section APIs, subject/class-subject/teacher assignment APIs, student import/job/login APIs, bulk job APIs, fee demand/payment/receipt APIs, attendance APIs, homework APIs, and exam/result APIs; backend roles are `SUPER_ADMIN`, `TENANT_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, `STUDENT`. EVT-001 adds backend outbox infrastructure without adding public APIs. | Frontend current role usage covers onboarding, invitation, login/MFA, parent link, staff provisioning, academic setup, academic assignment, student import, bulk jobs, and fee lifecycle scaffold only; no attendance/homework/exam UI or full route guard inventory exists yet. | No dedicated migration required for inventory; feature migrations are V1-V17. | Build/tests validate current active routes and outbox foundation; `rg` inventory confirms active mappings. | `rg -n "@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping|@PatchMapping" backend/src/main/java`; `cat backend/src/main/java/com/cloudcampus/identity/auth/UserRole.java`; `cd backend && mvn -q test` | VERIFIED | Historical route inventory remains as rebuild reference, not current scaffold capability. | Product planning could assume deleted legacy APIs still exist if historical labels are ignored. |
| DOC-001 | VERIFIED | N/A. | N/A. | N/A. | Docs inventory shows only this master Markdown file. This update labels historical sections and downgrades overclaimed security tasks. | `find . -path './.git' -prune -o -path './node_modules' -prune -o -path './frontend/node_modules' -prune -o -path './mobile/node_modules' -prune -o -path './backend/target' -prune -o -type f \\( -name '*.md' -o -name '*.txt' \\) -print` | VERIFIED | Keep historical/current labels fresh after every rebuild task. | Stale docs can send engineering into the wrong module or security assumption. |

## 25B. SEC-003 Verification Notes

Search run on 2026-05-26:

`rg -n --hidden -i "\\bMAIN\\b|resolveMainSchool|resolveSchool|defaultSchool|primary school fallback|primary.*school.*fallback|hard-coded school|hardcoded school|school code assumption|school code" -g '!.git/**' -g '!**/node_modules/**' -g '!backend/target/**' -g '!frontend/dist/**' -g '!graphify-out/**'`

All current `MAIN` usages found:

| Location | Classification | Action |
|---|---|---|
| `backend/src/main/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingService.java` | Safe current code: reserved `MAIN` rejection for customer onboarding. | Kept. This is not school resolution. |
| `frontend/src/features/super-admin/pages/TenantOnboardingPage.tsx` | Safe current code: client-side reserved `MAIN` rejection. | Kept. Frontend build not required because frontend was not touched. |
| `backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java` | Safe test: verifies onboarding rejects `MAIN`. | Kept. |
| `backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java` | Safe test: regression scanner intentionally contains prohibited markers. | Added for SEC-003. |
| `backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java` | Safe test-data false positive: lowercase `same-tenant-main`, not hard-coded school resolution. | Kept. |
| `frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx` | Safe test: verifies client-side `MAIN` rejection. | Kept. |
| `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md` | Documentation/historical evidence. | Updated CF-004 and SEC-003 status/evidence. |
| `backend/src/main/java/com/cloudcampus/CloudCampusApplication.java`, `frontend/index.html`, `frontend/src/app/App.tsx`, `mobile/package.json`, `mobile/package-lock.json` | False positives for lowercase `main` entrypoints or words, not school code. | No change. |

No current active business logic files named in historical CF-004 exist in the scaffold. No current `resolveMainSchool`, `resolveSchool`, `defaultSchool`, or explicit primary-school fallback implementation was found in backend, frontend, or mobile source. Parent, student, and teacher source folders currently contain no business Java sources; `HardCodedMainSchoolResolutionTest` now fails if those rebuilt flows introduce a `MAIN` fallback.

Files changed for SEC-003:

- `backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

## 25C. SEC-006 Verification Notes

Verification run on 2026-05-26:

- `rg -n "@RestController|@Controller|@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@PatchMapping|@DeleteMapping" backend/src/main/java`
- `find backend/src/main/java/com/cloudcampus -type d \( -path '*people*' -o -path '*operations*' -o -path '*school*' \) | sort`
- `cd backend && mvn -q test`

Active controller inventory:

| Controller | Current scope | School access enforcement result |
|---|---|---|
| `SystemReadinessController` | Platform readiness only. | Not school-scoped. |
| `TenantOnboardingController` | Super Admin onboarding creates tenant, first real school, School Admin invitation, and `user_school_access`. | Not a school-scoped business route; uses persisted onboarding state and rejects client-created `MAIN`. |
| `InvitationController` | Invitation token acceptance and set-password. | Not a school-scoped business route; uses stored invitation/user/access state rather than frontend `schoolId`. |
| `SubjectController` | School Admin subject create/list. | Uses authenticated active school plus `SchoolAccessService.requireSchoolAdminAccess`; no frontend school id is trusted. |
| `ClassSubjectAssignmentController` | School Admin class-subject assignment create/list. | Loads class and subject objects from the database and verifies their actual schools through the central school access guard. |
| `TeacherAssignmentController` | School Admin teacher assignment create/list. | Loads the class-subject assignment's actual school, verifies School Admin access, and only assigns active same-tenant `TEACHER` users. |
| `TeacherAssignmentPortalController` | Teacher assignment list/filter. | Requires authenticated `TEACHER`; returns only assignments for the teacher and denies unassigned class filters. |
| `StaffProvisioningController` | School Admin staff/teacher portal-login provisioning. | Uses authenticated active school plus `SchoolAccessService`; creates/reuses server-side user, grants `user_school_access`, and ignores frontend tenant/school identity. |
| `FeeController` | School Admin fee demands/payments, parent linked-child fees/payments, and student own-fee listing. | School Admin routes use authenticated active school or object actual `school_id` through `SchoolAccessService`; parent routes require `ParentStudentLink`; student routes resolve `students.user_id`; frontend school/tenant ids are not trusted. |
| `AttendanceController` | School Admin attendance sessions and Teacher attendance sessions. | School Admin routes use authenticated active school plus object-school checks for class/section/subject/students; teacher routes require `AcademicAssignmentService.requireTeacherAssignment`; no frontend school id is trusted. |
| `HomeworkController` | School Admin/Teacher homework, Parent linked-child homework, and Student own homework/submission. | School Admin routes use authenticated active school plus object-school checks; teacher routes require `AcademicAssignmentService.requireTeacherAssignment`; parent routes require `ParentStudentLink`; student routes resolve `students.user_id`; no frontend school id is trusted. |
| `ExamController` | School Admin exam create/list/read/marks/publish, Teacher exam list/read/marks, Parent linked-child results, and Student own results. | School Admin routes use authenticated active school or object actual school through `SchoolAccessService`; teacher routes require `AcademicAssignmentService.requireTeacherAssignment`; parent routes require `ParentStudentLink`; student routes resolve `students.user_id`; unpublished results are hidden from parent/student; no frontend school id is trusted. |
| `NoticeController` | School Admin notice create/list/read/publish, Teacher notice list, Parent linked-child notices, and Student own notices. | School Admin routes use authenticated active school or object actual school through `SchoolAccessService`; teacher routes derive allowed schools/classes from active `TeacherAssignment` rows; parent routes require `ParentStudentLink`; student routes resolve `students.user_id`; drafts are hidden from non-admin audiences; no frontend school id is trusted. |
| `ReportExportController` | School Admin report export request/list/read/download. | Request/list use authenticated active school; read/download load the report export object's actual school and verify `SchoolAccessService.requireSchoolAdminAccess`; generated files are tied to the export job's tenant/school; no frontend school id is trusted. |
| `RestExceptionHandler` | Controller advice only. | Excluded from controller guard inventory. |

School-scoped business API inventory:

| Domain | Current Java API/controller status | Current guard evidence | Remaining route-level gap |
|---|---|---|---|
| Students | STU-001 current scaffold APIs exist for import template, import validation, synchronous import, and active-school student listing. Full CRUD/profile/student portal APIs are not rebuilt. | `StudentImportFlowTest` denies School Admin A validating/importing with Tenant/School B class/section ids; `SchoolAccessIsolationTest` still covers central guard denial for student object type. | Add read/update/delete/profile route negative tests when broader student APIs return. |
| Staff | STAFF-001 current scaffold API exists for portal-login-required `STAFF`/`TEACHER` provisioning. Full CRUD/attendance/leave APIs are not rebuilt. | `StaffProvisioningFlowTest` proves School Admin can provision staff/teacher from active school, unsafe roles/profile-only requests are rejected, duplicate employee number is rejected, non-School Admin callers are rejected, and provisioned teacher can log in and be assigned. | Add object-school route tests when broader staff CRUD/attendance/leave APIs return. |
| Teacher assignments | ACA-002 current scaffold APIs exist for subject create/list, class-subject create/list, School Admin teacher assignment create/list, and teacher own-assignment list/filter. | `AcademicAssignmentFlowTest` denies cross-school class/subject assignment, cross-school teacher assignment, non-teacher assignment, and teacher unassigned class access. ATT-001, HOME-001, and EXAM-001 consume assignments for teacher attendance/homework/marks routes. | Add assignment-scoped checks again when timetable and future teacher APIs consume assignments. |
| Attendance | ATT-001 current scaffold APIs exist for School Admin attendance session create/list/read and Teacher attendance session create/list/read. Parent/student attendance views, QR, staff attendance, edits, and reports are not rebuilt. | `AttendanceFlowTest` proves School Admin can submit/list/read attendance for active-school class/section/subject/students, rejects School B class/subject/student inputs, denies School Admin A reading School B sessions, allows an assigned teacher to submit/read attendance, and denies teacher access to an unassigned class. `SchoolScopedControllerGuardCoverageTest` includes `AttendanceController`. | Add parent/student linked/own attendance visibility, edit audit, staff attendance, QR, and reports route tests when those APIs return. |
| Homework | HOME-001 current scaffold APIs exist for School Admin homework create/list/read, Teacher homework create/list/read, Parent linked-child homework list, Student own-homework list, and Student homework submission. Attachments, review/grading, edits, and notifications are not rebuilt. | `HomeworkFlowTest` proves teacher assigned-scope publish/list/read, School Admin cross-school create/read denial, teacher unassigned class create/read denial, parent unlinked-child denial, student own visibility, student unassigned submission denial, duplicate submission rejection, and homework audit rows without instruction/submission content. `SchoolScopedControllerGuardCoverageTest` includes `HomeworkController`. | Add attachments, review/grading, resubmission policy, notifications, and frontend/mobile route tests when those surfaces return. |
| Exams | EXAM-001 current scaffold APIs exist for School Admin exam create/list/read/marks/publish and Teacher exam list/read/marks. | `ExamFlowTest` proves School Admin create/list/read/marks/publish for active-school class/section/subject/student scope, denies School Admin A creating/reading/recording/publishing School B exams/results, allows assigned Teacher marks entry, and denies Teacher unassigned exam/result access. `SchoolScopedControllerGuardCoverageTest` includes `ExamController`. | Add frontend/mobile UX, edits, retests, grading schemes, report cards, analytics, and richer publish lifecycle tests when those surfaces return. |
| Results | EXAM-001 current scaffold APIs exist for Parent linked-child published result listing and Student own published result listing. | `ExamFlowTest` proves parent/student cannot see draft results, parent unlinked-child access is denied, and student result listing returns only the authenticated linked student's published results. | Add result detail/report-card/export route tests when those APIs return. |
| Fees | FEE-001 current scaffold APIs exist for School Admin fee demand create/list/read, parent linked-child fee list, and student own-fee list. | `FeeLifecycleFlowTest` denies School Admin A creating a demand for School B student, reading School B demand, and paying School B demand; parent unlinked-child list is denied; student fees resolve through the authenticated linked `STUDENT` profile. | Add fee categories/structures/concessions/refunds/reports route tests when those APIs return. |
| Receipts/payments | FEE-001 current scaffold APIs exist for School Admin payment recording and parent linked-child payment with receipt numbers. | `FeeLifecycleFlowTest` verifies School Admin and parent payments update paid/partial status, parent mismatched child-demand payment is denied, overpayment is rejected, and receipt/payment audit rows omit raw gateway references. | Add gateway webhook, reconciliation, refund, and receipt lookup route tests when those APIs return. |
| Notices | NOTE-001 current scaffold APIs exist for School Admin notice create/list/read/publish, Teacher published-notice listing, Parent linked-child published-notice listing, and Student own published-notice listing. Tenant/organisation-wide notices are intentionally deferred. | `NoticeFlowTest` proves drafts are hidden from teacher/parent/student, published notices are visible to assigned Teacher/linked Parent/own Student only when audience and class/section scope match, School Admin A cannot create/read/publish School B notices, Teacher unassigned-class notices are filtered out, Parent unlinked-child access is denied, Student own-notice listing filters by the authenticated student's class/section, and notice audit rows omit notice title/body. `SchoolScopedControllerGuardCoverageTest` includes `NoticeController`. | Add frontend/mobile notice UX, tenant/organisation notice APIs, edit/unpublish lifecycle, delivery/notification integration, and public read behavior tests when those surfaces return. |
| Timetable | No rebuilt controller/API in current scaffold. Placeholder package only. | Central guard denial parameter covers timetable. | Add teacher/student assignment-school route tests when timetable API returns. |
| Documents | No rebuilt controller/API in current scaffold. Placeholder package only. | Central guard denial parameter covers documents. | Add signed URL/object-school tests when document API returns. |
| Reports | REP-001 current scaffold APIs exist for School Admin report export request/list/read/download, backed by durable `bulk_jobs`, `report_export_jobs`, and `report_export_files`. MUL-004 current scaffold APIs exist for Tenant Admin combined summary and school-safe drilldown. | `ReportExportFlowTest` proves School Admin can request/list/read/download durable student-directory and fee-demand CSV exports, download is blocked until the file is ready, generated file rows are persisted with checksum/size, School Admin A cannot read/download School B exports, non-School Admin callers are rejected, and report audit metadata excludes user-supplied file names and generated report content. `TenantAdminReportSummaryFlowTest` proves Tenant Admin combined summary, same-tenant school drilldown, cross-tenant drilldown denial, non-Tenant Admin denial, and spoofed tenant header rejection. `SchoolScopedControllerGuardCoverageTest` includes report controllers. | Add object-storage delivery, scheduled worker route/ops tests, richer report catalog/read models, and website/public report restrictions when those APIs return. |
| Website content | No rebuilt controller/API in current scaffold. Placeholder package only. | Central guard denial parameter covers website content. | Add tenant-safe public read and admin publish-scope tests when website API returns. |

Files changed for SEC-006:

- `backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java`
- `backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

SEC-006 result: PARTIAL for product readiness, because many real school-scoped business routes are still not rebuilt. COMPLETE for the current scaffold inventory through HOME-001, because current parent-child, academic lifecycle, academic assignment, teacher-assignment, student-import, student-login, bulk-job, fee, attendance, and homework routes are guarded and a regression test fails future unguarded school-scoped controllers. `SEC-002` remains PARTIAL for product-wide readiness because remaining modules still need route-level object isolation tests when rebuilt.

SEC-006 update after EXAM-001: current scaffold guard coverage now includes guarded exam/result routes as well as attendance and homework. `SEC-002` remains PARTIAL for product-wide readiness because notices, timetable, documents, reports, website content, parent/student attendance, and broader route surfaces still need route-level object isolation tests when rebuilt.

SEC-006 update after NOTE-001: current scaffold guard coverage now includes guarded notice routes. `SEC-002` remains PARTIAL for product-wide readiness because timetable, documents, reports, website content, parent/student attendance, tenant/organisation notices, and broader route surfaces still need route-level object isolation tests when rebuilt.

SEC-006 update after MUL-004: current scaffold guard coverage now includes guarded report export routes and Tenant Admin combined-report school drilldown denial. `SEC-002` remains PARTIAL for product-wide readiness because timetable, documents, website content, parent/student attendance, tenant/organisation notices, and broader route surfaces still need route-level object isolation tests when rebuilt.

## 25D. AUTH-002 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`
- `cd frontend && npm test`
- `cd frontend && npm run build`
- `rg -n "@RestController|@RequestMapping|@GetMapping|@PostMapping" backend/src/main/java/com/cloudcampus`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/auth/login` | Accepts email/password, verifies BCrypt hash, rejects inactive users, and returns a signed stateless Bearer token plus current user context after required MFA. | Loads user from `user_accounts`; derives tenant/role from the database; derives active/allowed schools from `user_school_access`. Frontend `tenantId`, `schoolId`, or `role` fields are ignored. |
| `GET /v1/me` | Returns current authenticated user identity, tenant, role, active school, and allowed schools. | Requires Bearer token; reloads user and school grants from the database; query/body-supplied tenant or role data is not trusted. |
| `GET /v1/me/schools` | Returns only schools granted to the authenticated user. | Reads `user_school_access` for the authenticated user id. |
| `POST /v1/me/schools/{schoolId}/activate` | Activates a granted school and returns a new token/context with that active school. | Verifies the school belongs to the user's tenant and that `user_school_access` grants the user that school. |

Files changed for AUTH-002:

- `backend/src/main/java/com/cloudcampus/common/exception/UnauthorizedException.java`
- `backend/src/main/java/com/cloudcampus/common/web/RestExceptionHandler.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/UserAccountRepository.java`
- `backend/src/main/java/com/cloudcampus/identity/accesscontrol/UserSchoolAccessRepository.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/*`
- `backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/features/auth/pages/LoginPage.tsx`
- `frontend/src/features/auth/pages/LoginPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Security decisions:

- Access tokens are HMAC-SHA256 signed JWT-style tokens using the scaffold property `cloudcampus.auth.jwt-secret` and default 60 minute TTL.
- Token claims contain server-derived `userId`, `tenantId`, `role`, and `activeSchoolId` where available.
- `/v1/me` and school activation reload user and school access from the database before returning context.
- Refresh tokens, token revocation/denylist, password reset, and change-password lifecycle were delivered in AUTH-003; privileged-user MFA challenge checks and login rate limiting were delivered in AUTH-004.
- Email-only login rejects ambiguous duplicate emails instead of accepting frontend-supplied tenant identity.

## 25E. AUTH-003 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`
- `cd frontend && npm test`
- `cd frontend && npm run build`
- `rg -n "@RestController|@RequestMapping|@GetMapping|@PostMapping" backend/src/main/java/com/cloudcampus`

APIs added or hardened:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/auth/refresh` | Accepts an opaque refresh token, requires it to be active and unexpired, rotates it to a new refresh token, and returns a new access token. | `refresh_tokens` stores only SHA-256 token hashes and status. Old refresh tokens move to `ROTATED` and cannot be reused. |
| `POST /v1/me/logout` | Revokes the current access token and optionally revokes the submitted refresh token. | `revoked_access_tokens` stores only access-token hashes until expiry; `AuthenticatedUserResolver` rejects revoked access tokens. |
| `POST /v1/auth/forgot-password` | Creates a short-lived reset token for an active user. | `password_reset_tokens` stores only SHA-256 token hashes. The scaffold returns the raw token for manual delivery until email is rebuilt. |
| `POST /v1/auth/reset-password` | Accepts one pending reset token, changes the BCrypt password hash, and marks the token used. | Reuse and expired/past-status reset tokens are rejected. |
| `POST /v1/me/change-password` | Requires Bearer auth and the current password before changing the BCrypt password hash. | Reloads the authenticated user inside the write transaction and verifies the existing hash. |

Files changed for AUTH-003:

- `backend/src/main/resources/db/migration/V3__auth_session_lifecycle.sql`
- `backend/src/main/java/com/cloudcampus/identity/auth/UserAccount.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/*`
- `backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/features/auth/pages/LoginPage.tsx`
- `frontend/src/features/auth/pages/LoginPage.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Security decisions:

- Refresh and reset tokens are opaque random tokens; only SHA-256 hashes are persisted.
- Refresh tokens are single-use and rotate on every refresh.
- Logout revokes the current access token hash and submitted refresh token.
- Access-token revocation is checked before authenticated `/v1/me` requests are resolved.
- Forgot-password returns the raw reset token only because the current scaffold has no email/SMS delivery service; production delivery and masking remain required.
- MFA and login rate limiting are not implemented in AUTH-003 and are split into a follow-up task so this task remains focused on durable session/password lifecycle.

## 25F. AUTH-004 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

APIs added or hardened:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/auth/login` | Verifies email/password, rate-limits repeated failed attempts, and requires MFA before issuing tokens for `SUPER_ADMIN`, `TENANT_ADMIN`, and `SCHOOL_ADMIN`. | Server-derived user role decides MFA; frontend-supplied tenant, school, and role remain ignored. |
| `POST /v1/auth/mfa/verify` | Accepts a challenge id and 6-digit code; returns access/refresh tokens only for a pending, unexpired, matching challenge. | `mfa_challenges` stores BCrypt code hashes, status, expiry, attempt count, and tenant/user references. |

Files changed for AUTH-004:

- `backend/src/main/resources/db/migration/V4__mfa_challenges.sql`
- `backend/src/main/java/com/cloudcampus/common/exception/TooManyRequestsException.java`
- `backend/src/main/java/com/cloudcampus/common/web/RestExceptionHandler.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/AuthSessionResponse.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/AuthSessionService.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/LoginRateLimiterService.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/MfaChallenge.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/MfaChallengeRepository.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/MfaChallengeStatus.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/MfaVerifyRequest.java`
- `backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/features/auth/pages/LoginPage.tsx`
- `frontend/src/features/auth/pages/LoginPage.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Security decisions:

- Privileged roles require MFA before any access or refresh token is issued.
- MFA codes are random 6-digit values, BCrypt-hashed at rest, expire after 5 minutes, and move out of `PENDING` after successful verification.
- Reused, expired, invalid, and locked challenges are rejected.
- Failed login attempts are limited per normalized email in the current JVM: 5 failures in 15 minutes triggers a 15-minute 429 block.
- `AuthSessionResponse.toString()` redacts access tokens, refresh tokens, MFA challenge ids, and MFA codes to reduce accidental framework-log leakage.
- The current scaffold returns the raw MFA code once in the login response for manual delivery/testing because no email, SMS, TOTP, or authenticator-app provider exists yet. This is documented as a production gap, not a production MFA delivery design.

## 25G. AUTH-005 / SEC-004 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

APIs protected:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/super-admin/tenants/onboard` | Requires a valid Bearer access token and active authenticated `SUPER_ADMIN`. All other roles are rejected. | `AuthenticatedUserResolver` verifies token signature, revocation, active user, tenant id, and role against database state. Controller ignores client-supplied role, tenant id, and user id fields. |

Files changed for AUTH-005 / SEC-004:

- `backend/src/main/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingController.java`
- `backend/src/main/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingService.java`
- `backend/src/main/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrap.java`
- `backend/src/main/java/com/cloudcampus/platform/tenant/TenantRepository.java`
- `backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java`
- `backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java`
- `backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java`
- `frontend/src/features/super-admin/api/onboardingApi.ts`
- `frontend/src/features/super-admin/pages/TenantOnboardingPage.tsx`
- `frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Security decisions:

- Tenant onboarding is no longer a public bootstrap endpoint.
- `TENANT_ADMIN` remains rejected for tenant onboarding until product policy explicitly grants a safe multi-school creation flow.
- Audit rows for tenant creation, school creation, School Admin invitation, and school access grant now store `actor_id` as the authenticated Super Admin user id and `actor_type` as `SUPER_ADMIN`; metadata includes actor role and created entity ids.
- Raw School Admin invitation tokens and passwords are still not logged.
- Super Admin bootstrap is opt-in only through `cloudcampus.bootstrap.super-admin.enabled=true`, refuses `prod`/`production`, and requires explicit email/password. No default production credentials are created.

## 25H. SEC-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`

APIs verified for current scaffold tenant isolation:

| API | Tenant isolation behavior verified |
|---|---|
| `POST /v1/auth/login` | Ignores client-supplied `tenantId`, `schoolId`, and `role`; returns server-derived identity only after credential and MFA checks. |
| `GET /v1/me` | Uses Bearer token plus database state; rejects a signed token whose tenant claim no longer matches the authenticated user; ignores spoofed query context. |
| `GET /v1/me/schools` | Returns only tenant-consistent schools from `user_school_access`; malformed cross-tenant grants are ignored and do not leak Tenant B school data. |
| `POST /v1/me/schools/{schoolId}/activate` | Denies Tenant A user activation of Tenant B school even when Tenant B ids are also supplied in query/body noise. |
| `/v1/**` context filter | Rejects `X-Tenant-ID`, `X-School-ID`, and `X-Active-School-ID` before controller logic. |

Files changed for SEC-001:

- `backend/src/main/java/com/cloudcampus/identity/auth/session/AuthenticatedUserResolver.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/AuthSessionService.java`
- `backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Tests added:

- Tenant A School Admin cannot activate Tenant B school through URL, query, or request-body spoofing.
- A signed access token with Tenant B claim for a Tenant A user is rejected because token claims must match database identity.
- `/v1/me` and `/v1/me/schools` do not expose Tenant B school data even if a malformed cross-tenant `user_school_access` row exists.

Status decision: `SEC-001` is VERIFIED for the current scaffold's authenticated tenant context and existing object routes. Future tenant-scoped business modules still need module-specific Tenant A to Tenant B negative tests when those APIs are rebuilt.

## 25I. PAR-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/school-admin/parent-links` | School Admin links a parent to an existing student by parent email/mobile. If the parent user does not exist in the tenant, creates an invited `PARENT` user and returns a one-time invitation token for scaffold delivery. If an active parent already exists, links without creating a new invitation. | Bearer token resolved by `AuthenticatedUserResolver`; student's actual `school_id` is loaded from the database; `SchoolAccessService.requireSchoolAdminAccess` verifies the School Admin's access before any parent user/link is created. Request `tenantId`, `schoolId`, or role noise is ignored. |
| `GET /v1/parent/children` | Returns only children linked to the authenticated parent. | Bearer token user must be role `PARENT`; `ParentStudentLink` rows must be tenant-consistent. |
| `GET /v1/parent/children/{studentId}` | Returns a linked child; rejects unlinked child access. | Parent-child link lookup by authenticated parent user id and student id; no frontend tenant/school context is trusted. |

Files changed for PAR-001:

- `backend/src/main/resources/db/migration/V5__parent_child_linking.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/people/student/Student.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentRepository.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentStudentLink.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentStudentLinkRepository.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentLinkRequest.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentLinkResponse.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentChildResponse.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentLinkService.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentLinkController.java`
- `backend/src/main/java/com/cloudcampus/people/parent/ParentPortalController.java`
- `backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/parent/api/parentLinksApi.ts`
- `frontend/src/features/parent/pages/SchoolAdminParentLinkPage.tsx`
- `frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `frontend/src/shared/styles/global.css`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Tests added:

- School Admin links a new parent by email/mobile, creates a `PARENT` user, creates a parent invitation, persists the parent-child link, records `PARENT_INVITED` and `PARENT_LINKED` audit rows, and does not log the raw invitation token.
- Parent accepts invitation, logs in, sees only linked children, can open the linked child, and is denied an unlinked child.
- School Admin A cannot link a parent to a student in Tenant/School B.
- Existing active parent is linked without creating a new invitation.
- Frontend parent-link form requires a stored School Admin token and forwards it as Bearer auth.

Status decision: `PAR-001` is VERIFIED for the current scaffold foundation. It intentionally does not implement student CRUD/import, academic class/section assignment, parent payments, parent leave requests, or a full authenticated parent dashboard.

## 25J. ACA-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/school-admin/academic-years` | Creates an academic year for the authenticated School Admin's active school; optionally activates it. | Bearer token resolved by `AuthenticatedUserResolver`; active school comes from the signed/server-derived session context; `SchoolAccessService.requireSchoolAdminAccess` verifies the grant. Request `tenantId`/`schoolId` noise is ignored. |
| `GET /v1/school-admin/academic-years` | Lists academic years for the authenticated School Admin's active school. | Active school from authenticated context plus `user_school_access`. |
| `POST /v1/school-admin/academic-years/{academicYearId}/activate` | Activates one academic year and closes other active years for the same school. | Loads the academic year's actual `school_id` and verifies School Admin access before mutation. |
| `POST /v1/school-admin/classes` and `GET /v1/school-admin/classes` | Creates/lists class levels for an academic year. | Loads the academic year's actual `school_id`; cross-school academic-year ids are rejected. |
| `POST /v1/school-admin/sections` and `GET /v1/school-admin/sections` | Creates/lists sections for a class level. | Loads the class level's actual `school_id`; cross-school class ids are rejected. |

Files changed for ACA-001:

- `backend/src/main/resources/db/migration/V6__academic_lifecycle.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicYearStatus.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicYear.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassLevel.java`
- `backend/src/main/java/com/cloudcampus/academic/Section.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicYearRepository.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassLevelRepository.java`
- `backend/src/main/java/com/cloudcampus/academic/SectionRepository.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicYearRequest.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicYearResponse.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassLevelRequest.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassLevelResponse.java`
- `backend/src/main/java/com/cloudcampus/academic/SectionRequest.java`
- `backend/src/main/java/com/cloudcampus/academic/SectionResponse.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicLifecycleService.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicYearController.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassLevelController.java`
- `backend/src/main/java/com/cloudcampus/academic/SectionController.java`
- `backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/academic/api/academicApi.ts`
- `frontend/src/features/academic/pages/AcademicSetupPage.tsx`
- `frontend/src/features/academic/pages/AcademicSetupPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Tests added:

- School Admin creates an academic year, activates a replacement year, observes the previous active year close, creates a class, creates a section, lists each resource, and audit rows include the authenticated actor.
- Invalid academic year dates are rejected and do not persist.
- School Admin A cannot create a class with Tenant/School B academic year and cannot create a section with Tenant/School B class.
- Frontend academic setup requires a stored School Admin token and forwards it to academic year/class/section API calls.

Status decision: `ACA-001` is VERIFIED for the current scaffold foundation. It intentionally does not implement subjects, class-subject mappings, teacher assignments, student enrollment into classes/sections, academic promotions, or a full School Admin dashboard.

## 25K. STU-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `GET /v1/school-admin/students/import/template` | Returns required/optional import columns and a sample row. | Bearer token resolved by `AuthenticatedUserResolver`; active school must be granted through `user_school_access`. |
| `POST /v1/school-admin/students/import/validate` | Validates rows without persistence: required admission/name/class/section, duplicate admission numbers in payload, existing admission numbers in school, ISO date format, guardian email format, and section-class match. | Active school from authenticated context; class and section are loaded from the database and must belong to the active school. Request `tenantId`/`schoolId` noise is ignored. |
| `POST /v1/school-admin/students/import` | Persists students only when validation passes; returns row errors and persists nothing when validation fails. | Same active-school and object-school checks as validation. Cross-school class/section ids are rejected with `FORBIDDEN`. |
| `GET /v1/school-admin/students` | Lists students for the authenticated School Admin's active school. | Active school from authenticated context plus `SchoolAccessService.requireSchoolAdminAccess`. |

Files changed for STU-001:

- `backend/src/main/resources/db/migration/V7__student_import_foundation.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/people/student/Student.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentRepository.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportRow.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportRequest.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportError.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportValidationResponse.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportResponse.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportTemplateResponse.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentResponse.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java`
- `backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/student/api/studentImportApi.ts`
- `frontend/src/features/student/pages/StudentImportPage.tsx`
- `frontend/src/features/student/pages/StudentImportPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `frontend/src/shared/styles/global.css`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Tests added:

- School Admin validates and imports students into the active school class/section, with lowercased guardian email and `STUDENT_IMPORTED` audit event that avoids student names.
- Validation catches missing full name, invalid date, invalid guardian email, duplicate admission number in payload, and existing school admission number; invalid import persists nothing.
- School Admin A cannot validate/import students using Tenant/School B class/section ids.
- Frontend student import form requires a stored School Admin token and forwards it to validate/import API calls.

Status decision: `STU-001` is VERIFIED for the current scaffold import-validation foundation. It intentionally does not implement full student CRUD/edit, CSV file upload, async bulk jobs, promotions/transfers, documents, or student self portal. Student login invitations are now covered by STU-003.

## 25L. ACA-002 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q -Dtest=AcademicAssignmentFlowTest test`
- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/school-admin/subjects` and `GET /v1/school-admin/subjects` | Creates/lists subjects for the authenticated School Admin's active school. | Bearer token resolved by `AuthenticatedUserResolver`; active school comes from server-derived session context; `SchoolAccessService.requireSchoolAdminAccess` verifies the grant. |
| `POST /v1/school-admin/class-subjects` and `GET /v1/school-admin/class-subjects?classLevelId=...` | Assigns a subject to a class and lists class-subject assignments. | Loads class and subject from the database and verifies both actual schools before mutation/listing. Request `tenantId`/`schoolId` noise is ignored. |
| `POST /v1/school-admin/teacher-assignments` and `GET /v1/school-admin/teacher-assignments?classLevelId=...` | Assigns an active same-tenant `TEACHER` user to a class-subject assignment and lists assignments. | Loads the class-subject assignment's actual school and verifies School Admin access; validates teacher user role/status/tenant from the database. |
| `GET /v1/teacher/assignments` | Lets a teacher list only their own assignments, optionally filtered by class. | Requires authenticated `TEACHER`; filter by unassigned class is rejected with 403. Future teacher modules can call `requireTeacherAssignment`. |

Files changed for ACA-002:

- `backend/src/main/resources/db/migration/V8__academic_assignment_foundation.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/academic/Subject.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassSubjectAssignment.java`
- `backend/src/main/java/com/cloudcampus/academic/TeacherAssignment.java`
- `backend/src/main/java/com/cloudcampus/academic/SubjectRepository.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassSubjectAssignmentRepository.java`
- `backend/src/main/java/com/cloudcampus/academic/TeacherAssignmentRepository.java`
- `backend/src/main/java/com/cloudcampus/academic/SubjectRequest.java`
- `backend/src/main/java/com/cloudcampus/academic/SubjectResponse.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassSubjectAssignmentRequest.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassSubjectAssignmentResponse.java`
- `backend/src/main/java/com/cloudcampus/academic/TeacherAssignmentRequest.java`
- `backend/src/main/java/com/cloudcampus/academic/TeacherAssignmentResponse.java`
- `backend/src/main/java/com/cloudcampus/academic/AcademicAssignmentService.java`
- `backend/src/main/java/com/cloudcampus/academic/SubjectController.java`
- `backend/src/main/java/com/cloudcampus/academic/ClassSubjectAssignmentController.java`
- `backend/src/main/java/com/cloudcampus/academic/TeacherAssignmentController.java`
- `backend/src/main/java/com/cloudcampus/academic/TeacherAssignmentPortalController.java`
- `backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/academic/api/academicAssignmentsApi.ts`
- `frontend/src/features/academic/pages/AcademicAssignmentsPage.tsx`
- `frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Tests added:

- School Admin creates a subject, assigns it to a class, assigns an active `TEACHER`, lists the assignment, and audit rows include `SUBJECT_CREATED`, `CLASS_SUBJECT_ASSIGNED`, and `TEACHER_ASSIGNED`.
- Teacher logs in through the existing MFA/session flow and sees only their own assignments.
- Teacher is denied when filtering by an unassigned class.
- School Admin A cannot assign Tenant/School B subject or class objects.
- School Admin A cannot assign a teacher to Tenant/School B class-subject assignment.
- Cross-tenant teacher user and non-teacher user assignment attempts are rejected.
- Frontend academic assignment scaffold requires a stored School Admin token and forwards it to subject/class-subject/teacher-assignment API calls.

Status decision: `ACA-002` is VERIFIED for the current scaffold assignment foundation. It intentionally does not implement staff/teacher invitation provisioning, timetable generation, teacher dashboard UX, attendance/homework/marks modules, or full subject edit/delete lifecycle.

## 25M. STAFF-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q -Dtest=StaffProvisioningFlowTest test`
- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

API added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/school-admin/staff/provision` | Provisions a portal-login-required `TEACHER` or `STAFF` user, creates a linked `staff_profiles` row, grants `user_school_access`, and returns a one-time invitation token when the account is not already active. | Bearer token resolved by `AuthenticatedUserResolver`; active school comes from server-derived session context; `SchoolAccessService.requireSchoolAdminAccess` verifies School Admin access. Request `tenantId`/`schoolId` noise is ignored. |

Files changed for STAFF-001:

- `backend/src/main/resources/db/migration/V9__staff_teacher_provisioning.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/people/staff/StaffProfile.java`
- `backend/src/main/java/com/cloudcampus/people/staff/StaffProfileRepository.java`
- `backend/src/main/java/com/cloudcampus/people/staff/StaffProvisioningRequest.java`
- `backend/src/main/java/com/cloudcampus/people/staff/StaffProvisioningResponse.java`
- `backend/src/main/java/com/cloudcampus/people/staff/StaffProvisioningService.java`
- `backend/src/main/java/com/cloudcampus/people/staff/StaffProvisioningController.java`
- `backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/staff/api/staffProvisioningApi.ts`
- `frontend/src/features/staff/pages/StaffProvisioningPage.tsx`
- `frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Tests added:

- School Admin provisions an invited `TEACHER`, with lowercased email, `staff_profiles` row, `user_school_access`, and one-time invitation response.
- Teacher accepts invitation, logs in, receives server-derived tenant/school context, can be assigned to a class-subject, and can list own teacher assignments.
- Provisioning rejects unsafe roles, `portalLoginRequired=false`, duplicate employee number, and non-School Admin callers.
- Audit rows include `STAFF_INVITED`, `STAFF_PROFILE_CREATED`, and `SCHOOL_ACCESS_GRANTED`, and do not contain the raw invitation token.
- Frontend staff provisioning scaffold requires a stored School Admin token and forwards it as Bearer auth.

Status decision: `STAFF-001` is VERIFIED for the current scaffold staff/teacher portal-login provisioning foundation. It intentionally does not implement full staff CRUD/edit, staff attendance, staff leave, department/designation lifecycle, multi-school staff assignment, finance role, production invitation delivery, or a teacher dashboard.

## 25O. AUD-001 Verification Notes

Files changed:

- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/invitation/InvitationAcceptanceService.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/AuthSessionService.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/session/PasswordResetToken.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Current scaffold mutation coverage:

- Onboarding writes `TENANT_CREATED`, `SCHOOL_CREATED`, `SCHOOL_ADMIN_INVITED`, and `SCHOOL_ACCESS_GRANTED`.
- Invitation acceptance now writes `INVITATION_ACCEPTED`.
- Auth/session mutations now write `MFA_CHALLENGE_CREATED`, `MFA_CHALLENGE_VERIFIED`, `REFRESH_TOKEN_ROTATED`, `USER_LOGGED_OUT`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`, `PASSWORD_CHANGED`, and `SCHOOL_CONTEXT_ACTIVATED`.
- Parent linking, staff provisioning, academic lifecycle, academic assignments, and student import continue to write their existing typed audit events.
- `POST /v1/school-admin/students/import/validate` remains intentionally non-audited because it validates input and does not persist business state.

Security evidence:

- Runtime auth-session tests assert invitation acceptance, MFA, school activation, refresh rotation, logout, reset password, and change-password audit rows exist with the authenticated actor id.
- Runtime tests assert audit metadata does not contain raw invitation tokens, raw refresh/access tokens, reset tokens, current/new passwords, token hashes, or code hashes.
- `AuditCoverageMatrixTest` fails any current or future controller with `POST`, `PUT`, `PATCH`, or `DELETE` routes unless it is added to the audit matrix, and verifies each mapped service calls `auditLogService.record` with the expected typed actions.

Status decision: `AUD-001` is VERIFIED for the current scaffold mutation surface. It does not implement an audit viewer/API, production security telemetry for failed login attempts, support-access reason capture, or audit export/retention workflows.

## 25P. EVT-001 Verification Notes

Files changed:

- `backend/src/main/resources/db/migration/V10__transactional_outbox.sql`
- `backend/src/main/java/com/cloudcampus/events/outbox/OutboxEvent.java`
- `backend/src/main/java/com/cloudcampus/events/outbox/OutboxEventRepository.java`
- `backend/src/main/java/com/cloudcampus/events/outbox/OutboxEventStatus.java`
- `backend/src/main/java/com/cloudcampus/events/outbox/TransactionalOutboxService.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditLogService.java`
- `backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Current scaffold outbox foundation:

- Added durable `outbox_events` with tenant/school scope, aggregate type/id, event type, optional idempotent `event_key`, JSON payload, status, attempts, lock metadata, retry time, and publish timestamp.
- Added `OutboxEvent` lifecycle states: `PENDING`, `PROCESSING`, `FAILED`, and `PUBLISHED`.
- Added `TransactionalOutboxService` with record, idempotent producer-key reuse, processing/published/failed state transitions, and JSON payload serialization.
- Wired `AuditLogService.record` to write an `AuditLogRecorded` outbox event in the same transaction as each audit row.

Validation evidence:

- `TransactionalOutboxFlowTest` verifies onboarding audit rows create matching pending outbox events, outbox payloads exclude raw invitation tokens and secret fields, audit/outbox writes roll back together on transaction failure, idempotent producer keys do not duplicate events, and lifecycle transitions update status/attempt/publish fields.
- Focused validation command: `cd backend && mvn -q -Dtest=TransactionalOutboxFlowTest test`.

Status decision: `EVT-001` is VERIFIED for the current scaffold transactional outbox foundation. It intentionally does not implement a dispatcher, external queue publisher, retry scheduler, dead-letter handling, or per-consumer idempotency tables yet.

## 25Q. BULK-001 Verification Notes

Files changed:

- `backend/src/main/resources/db/migration/V11__bulk_jobs.sql`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJob.java`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobStatus.java`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobRepository.java`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobCreateRequest.java`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobProgressRequest.java`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobResponse.java`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobService.java`
- `backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobController.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/operations/api/bulkJobsApi.ts`
- `frontend/src/features/operations/pages/BulkJobsPage.tsx`
- `frontend/src/features/operations/pages/BulkJobsPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `frontend/src/shared/styles/global.css`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Current scaffold bulk job foundation:

- Added durable `bulk_jobs` with tenant/school scope, requesting user, job type, status, totals/progress counts, input/error references, metadata JSON, last error, timestamps, and optimistic versioning.
- Added `POST /v1/school-admin/bulk-jobs`, `GET /v1/school-admin/bulk-jobs`, `GET /v1/school-admin/bulk-jobs/{bulkJobId}`, and `POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel`.
- School Admin routes use authenticated active school context and `SchoolAccessService`; object reads/cancel use the job's actual `school_id`, not frontend-provided school ids.
- Added service lifecycle methods for worker use: validating, processing, progress update, completed, failed, and cancelled.
- Added audit coverage for `BULK_JOB_CREATED` and `BULK_JOB_CANCELLED`, and direct outbox events for `BulkJobCreated`, `BulkJobCancelled`, and `BulkJobStatusChanged`.
- Added a minimal School Admin bulk jobs web scaffold that requires the stored Bearer token before create/list/cancel.

Validation evidence:

- `BulkJobFlowTest` verifies School Admin create/list/read/cancel, durable DB state, audit rows, direct outbox events, no file reference leakage in audit/outbox payloads, cross-school read/cancel denial, non-School Admin create denial, and persisted progress lifecycle.
- `AuditCoverageMatrixTest` maps `BulkJobController` mutations to typed audit actions.
- `SchoolScopedControllerGuardCoverageTest` recognizes bulk job APIs as school-scoped and guarded.
- Focused validation commands: `cd backend && mvn -q -Dtest=BulkJobFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd frontend && npm test -- --run BulkJobsPage App`.

Status decision: `BULK-001` is VERIFIED for the generic durable bulk job model and minimal progress UI scaffold. It intentionally does not implement the async student import worker, row-level error file generation, report export integration, object storage, dispatcher scheduling, retry policy, or promotion jobs; those remain under STU-002, REP-001, and later operations tasks.

## 25R. STU-002 Verification Notes

Files changed:

- `backend/src/main/resources/db/migration/V12__student_import_jobs.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportJob.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportJobRepository.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportJobResponse.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java`
- `backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `frontend/src/features/student/api/studentImportApi.ts`
- `frontend/src/features/student/pages/StudentImportPage.tsx`
- `frontend/src/features/student/pages/StudentImportPage.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/school-admin/students/import/jobs` | Creates a durable `BulkJob` and `StudentImportJob`, stores submitted rows for later processing, returns queued job/progress state. | Bearer token resolved by `AuthenticatedUserResolver`; active school must be granted through `user_school_access`; class/section ids are loaded from the database and cross-school ids are rejected before queueing. |
| `GET /v1/school-admin/students/import/jobs/{bulkJobId}` | Returns student import job status, progress counts, error reference, and validation errors for the authenticated School Admin's accessible job. | Uses `BulkJobService.get`, which checks the job object's actual `school_id` through `SchoolAccessService`. |

Current scaffold async import foundation:

- Added durable `student_import_jobs` linked one-to-one with `bulk_jobs`, including tenant, school, requested-by user, submitted rows JSON, validation errors JSON, created time, and processed time.
- Added `StudentImportService.processQueuedImportJob(bulkJobId)` as the internal worker entry point for later scheduler/dispatcher wiring.
- Worker method re-runs active-school and object-school validation before inserting students.
- Valid rows are imported, invalid rows are captured as row-level validation errors, and the linked `BulkJob` moves to `COMPLETED` or `PARTIALLY_COMPLETED` with progress counts and `student-import-errors:{bulkJobId}` error reference.
- Added `STUDENT_IMPORT_JOB_QUEUED` audit event without storing student names in audit metadata.
- Frontend student import scaffold now supports validate, synchronous import, and queued import job creation with the stored Bearer token.

Validation evidence:

- `StudentImportJobFlowTest` verifies School Admin can queue a job, no students are inserted before worker processing, internal processing imports valid rows, partial failures persist validation errors and progress counts, audit rows avoid student names, direct bulk-job outbox events are produced, and School Admin A cannot queue a job using School B class/section ids.
- `AuditCoverageMatrixTest` maps the new student import job mutation to typed audit evidence.
- Focused validation commands: `cd backend && mvn -q -Dtest=StudentImportJobFlowTest,StudentImportFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q -DskipTests compile`; `cd frontend && npm test -- --run StudentImportPage App`.

Status decision: `STU-002` is VERIFIED for the current scaffold async student import job foundation. It intentionally does not implement a scheduled worker, queue dispatcher, object-storage CSV/error files, upload parsing, retry/idempotency policy, cancellation-aware processing, promotion/transfer jobs, or a full student import dashboard.

## 25S. STU-003 Verification Notes

Files changed:

- `backend/src/main/resources/db/migration/V13__student_login_provisioning.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/people/student/Student.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentRepository.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentLoginInvitationRequest.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentLoginInvitationResponse.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentSelfProfileResponse.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentLoginService.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentLoginController.java`
- `backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/student/api/studentImportApi.ts`
- `frontend/src/features/student/pages/StudentImportPage.tsx`
- `frontend/src/features/student/pages/StudentImportPage.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/school-admin/students/{studentId}/login-invitation` | Creates or reuses a tenant-local `STUDENT` user by email, links it to the student profile, grants `user_school_access`, creates a standard invitation when the user is not active, and returns the one-time invitation token for scaffold delivery. | Bearer token resolved by `AuthenticatedUserResolver`; the student is loaded by id and the student's actual `school_id` is checked through `SchoolAccessService.requireSchoolAdminAccess`; request body tenant/school/role data is ignored. |
| `GET /v1/student/profile` | Returns the authenticated student's own linked profile. | Bearer token role must be `STUDENT`; profile lookup uses `students.user_id` and tenant consistency, not frontend-supplied student id. |

Current scaffold student login foundation:

- Added nullable `students.user_id` with FK/unique constraint so a student profile may optionally link to exactly one login user.
- Added `StudentLoginService` that creates or reuses only `STUDENT` users, rejects conflicting existing roles, rejects disabled users, links the profile, grants `STUDENT` school access, and creates the standard hashed invitation token record.
- Added `STUDENT_LOGIN_INVITED` and `STUDENT_LOGIN_ENABLED` audit actions. Audit metadata includes actor, tenant, school, student id, user id, masked email, and invitation expiry, but not raw invitation tokens or passwords.
- Added minimal frontend support to send student id/email with the stored School Admin Bearer token.
- Mobile was not touched; student mobile workflow remains a later portal task.

Validation evidence:

- `StudentLoginProvisioningFlowTest` verifies School Admin can invite a student login, the student user receives `STUDENT` role and school access, standard invitation acceptance activates the user, login returns server-derived `STUDENT` identity and active school, and `GET /v1/student/profile` returns only the linked profile.
- Negative tests verify School Admin A cannot provision login for another school's student, existing non-student email conflicts, and a logged-in student cannot call the School Admin provisioning route.
- `AuditCoverageMatrixTest` maps the new student login mutation to typed audit evidence.
- `SchoolScopedControllerGuardCoverageTest` includes the new controller in current scaffold school-scoped route coverage.
- Focused validation commands: `cd backend && mvn -q -Dtest=StudentLoginProvisioningFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q -DskipTests compile`; `cd frontend && npm test -- --run StudentImportPage App`.

Status decision: `STU-003` is VERIFIED for optional student login invitation/provisioning and the minimal authenticated student self-profile foundation. It intentionally does not implement full student dashboards, attendance/homework/results/fees self-service, mobile student portal flows, resend/cancel invitation lifecycle, bulk login provisioning, or production notification delivery.

## 25T. FEE-001 Verification Notes

Files changed:

- `backend/src/main/resources/db/migration/V14__fee_payment_receipts.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeDemand.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeDemandRepository.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeDemandRequest.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeDemandResponse.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeDemandStatus.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeePayment.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeePaymentRepository.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeePaymentRequest.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeePaymentResponse.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java`
- `backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java`
- `backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/finance/api/feeApi.ts`
- `frontend/src/features/finance/pages/FeeLifecyclePage.tsx`
- `frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

APIs added:

| API | Behavior | Security source of truth |
|---|---|---|
| `POST /v1/school-admin/fees/demands` | Creates a fee demand for a student in the authenticated School Admin's active school. | Bearer token resolves the actor; active school is verified through `SchoolAccessService`; the student's actual `school_id` must match the active school. |
| `GET /v1/school-admin/fees/demands` | Lists fee demands for the active school. | Active school comes from server-derived session context and `user_school_access`. |
| `GET /v1/school-admin/fees/demands/{demandId}` | Reads one demand. | Loads the demand and verifies its actual `school_id` through `SchoolAccessService`. |
| `POST /v1/school-admin/fees/demands/{demandId}/payments` | Records a School Admin payment, updates partial/paid status, and issues a receipt number. | Loads the demand and verifies its actual `school_id`; amount cannot exceed outstanding balance. |
| `GET /v1/parent/children/{studentId}/fees` | Lists fee demands for a linked child. | Requires authenticated `PARENT` and a tenant-consistent `ParentStudentLink`. |
| `POST /v1/parent/children/{studentId}/fees/{demandId}/payments` | Records a parent payment for a linked child's demand and issues a receipt number. | Requires authenticated `PARENT`, linked child, and demand's actual `student_id` matching the linked child. |
| `GET /v1/student/fees` | Lists the authenticated student's own fee demands. | Requires authenticated `STUDENT`; resolves the profile through `students.user_id`, not a frontend-supplied student id. |

Current scaffold fee lifecycle foundation:

- Added V14 `fee_demands` and `fee_payments`, both tenant- and school-scoped.
- Added demand states `OPEN`, `PARTIALLY_PAID`, and `PAID`; payments cannot exceed outstanding balance and cannot be recorded after full payment.
- Added `FEE_DEMAND_CREATED`, `FEE_PAYMENT_RECORDED`, and `RECEIPT_ISSUED` audit actions.
- Added frontend School Admin fee lifecycle scaffold for demand creation/payment recording with stored Bearer token forwarding and login-required state.
- Mobile was not touched.

Validation evidence:

- `FeeLifecycleFlowTest` verifies School Admin demand creation/listing, partial payment, parent linked-child payment, student own-fee listing, paid status, receipt creation, persistence, and audit rows.
- Negative tests verify School Admin A cannot create a demand for School B student, read School B demand, or pay School B demand.
- Parent negative tests verify unlinked child access is denied, mismatched child-demand payment is denied, and overpayment is rejected.
- Audit assertions verify fee demand/payment/receipt actions exist and raw payment gateway reference values are not written to audit metadata.
- `AuditCoverageMatrixTest` maps the new fee mutation controller to typed audit evidence.
- `SchoolScopedControllerGuardCoverageTest` includes the fee controller in current scaffold school-scoped route coverage.
- Focused validation commands: `cd backend && mvn -q -Dtest=FeeLifecycleFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd frontend && npm test -- --run FeeLifecyclePage App`.
- Full validation commands: `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build`.

Status decision: `FEE-001` is VERIFIED for the current scaffold fee demand/payment/receipt lifecycle foundation. It intentionally does not implement fee category/structure setup, concessions, refunds, finance/accountant role, payment gateway/webhooks, reconciliation, finance reports, full parent/student fee UI, or mobile fee flows.

## 25U. FRONT-AUTH-001 Verification Notes

Task scope: make the verified backend auth/session/school-context foundation usable from the current web scaffold without adding unrelated product features.

Files changed:

- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/features/auth/api/authApi.test.ts`
- `frontend/src/features/auth/components/ProtectedPanel.tsx`
- `frontend/src/features/auth/components/SchoolSelector.tsx`
- `frontend/src/features/auth/hooks/authState.tsx`
- `frontend/src/features/auth/pages/LoginPage.tsx`
- `frontend/src/features/auth/pages/LoginPage.test.tsx`
- `frontend/src/shared/styles/global.css`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Implemented frontend auth foundation:

- Added `BACKEND_USER_ROLES` and `UserRole` typing aligned with backend roles: `SUPER_ADMIN`, `TENANT_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, and `STUDENT`.
- Added `AuthStateProvider`/`useAuthState` to manage scaffold access/refresh tokens, current-user loading from `GET /v1/me`, school access loading from `GET /v1/me/schools`, school activation, logout, and invalid-token clearing.
- Wired login/MFA completion into auth state so successful login hydrates current user and allowed schools instead of only writing token storage.
- Added `ProtectedPanel` role guards: unauthenticated users see login-required state; `SUPER_ADMIN` can access onboarding; `SCHOOL_ADMIN` can access School Admin scaffold pages only after active school context; `TENANT_ADMIN` is recognised with a placeholder; `TEACHER`, `PARENT`, `STUDENT`, and `STAFF` do not access admin-only panels.
- Added `SchoolSelector`: one-school users auto-activate their assigned school, multi-school users choose and activate through `POST /v1/me/schools/{schoolId}/activate`, returned access/refresh token context is stored, and activation denial shows a clear error.
- Existing School Admin scaffold pages remain protected by Bearer token checks in their own API clients and are now also gated behind authenticated `SCHOOL_ADMIN` plus active school state.

Validation evidence:

- `authApi.test.ts` verifies the frontend role list matches backend roles.
- `App.test.tsx` verifies unauthenticated protected-route denial, invalid stored-token clearing, `SUPER_ADMIN` onboarding access, `SCHOOL_ADMIN` scaffold access, `SCHOOL_ADMIN` denial from Super Admin onboarding, `TEACHER`/`PARENT`/`STUDENT`/`STAFF` denial from admin-only panels, `TENANT_ADMIN` recognition, and school activation API/token handling.
- `LoginPage.test.tsx` verifies login token storage, MFA checkpoint behavior, and auth-state notification after login completion.
- Focused validation: `cd frontend && npm test -- --run App LoginPage authApi` passed with 15 tests.
- Full frontend validation for FRONT-AUTH-001 passed with 33 tests; current suite now passes with 49 tests after MUL-007, and `cd frontend && npm run typecheck` plus `cd frontend && npm run build` pass.
- Backend tests were not rerun for this task because no backend/shared API contract was changed. Mobile typecheck was not rerun because mobile was not touched.

Status decision: `FRONT-AUTH-001` is VERIFIED for the current web scaffold. Remaining gaps are full role dashboards, Tenant Admin real product workflows, production-grade token storage/session UX, production MFA delivery/device management, finance/accountant role, and mobile auth alignment.

## 25V. CI-001 Verification Notes

Task scope: recreate CI for the current backend/frontend/mobile scaffold without adding deploy, product features, or unrelated security tooling.

Files changed:

- `.github/workflows/ci.yml`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Implemented CI foundation:

- Added `CloudCampus CI` workflow for push to `main`, `master`, and `project-redesign`, all pull requests, and manual dispatch.
- Added read-only repository permissions and concurrency cancellation per ref.
- Backend job uses Temurin Java 21 with Maven cache and runs `mvn -B test` in `backend`.
- Frontend job uses Node 24 with npm cache keyed to `frontend/package-lock.json`, then runs `npm ci`, `npm test -- --run`, `npm run typecheck`, and `npm run build`.
- Mobile job uses Node 24 with npm cache keyed to `mobile/package-lock.json`, then runs `npm ci`, `npm run typecheck`, and `npm test`.
- Deployment, image publishing, security scans, OpenAPI publishing, DR drills, and lint are intentionally deferred because the current scaffold has no deploy manifests, image publish policy, security workflow policy, OpenAPI publish flow, restore setup, or lint script.

Validation evidence:

- Workflow syntax check: `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/ci.yml'); puts 'workflow yaml parses'"` passed.
- Backend validation for CI-001 passed with 87 tests, 0 failures, 0 errors; current backend suite now passes with 117 tests after MUL-007.
- Frontend validation for CI-001 passed with 33 tests; current frontend suite now passes with 49 tests after MUL-007, and `npm run typecheck` plus `npm run build` pass.
- Mobile validation for CI-001 passed with 1 test; current mobile suite now passes with 2 tests after MUL-003, and `npm run typecheck` passes.

Status decision: `CI-001` is VERIFIED for scaffold CI. Remaining gaps are lint policy, security/dependency scan jobs, artifact/image publishing, staging deploy, OpenAPI publication, and backup/restore workflows.

## 25W. ATT-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q -Dtest=AttendanceFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`
- `cd backend && mvn -q test`

APIs added:

- `POST /v1/school-admin/attendance/sessions`
- `GET /v1/school-admin/attendance/sessions`
- `GET /v1/school-admin/attendance/sessions/{sessionId}`
- `POST /v1/teacher/attendance/sessions`
- `GET /v1/teacher/attendance/sessions`
- `GET /v1/teacher/attendance/sessions/{sessionId}`

Backend and database evidence:

- Added Flyway V15 `attendance_sessions` and `attendance_records` with tenant, school, class, optional section, subject, submitting user/role, date, student, and attendance status columns.
- Added attendance entities, repositories, request/response DTOs, `AttendanceService`, and `AttendanceController`.
- School Admin attendance uses authenticated active school plus `SchoolAccessService.requireSchoolAdminAccess`; class, section, subject assignment, and students are loaded from the database and checked against their actual school/class/section.
- Teacher attendance uses `AcademicAssignmentService.requireTeacherAssignment` and the assigned class-subject's school; unassigned class access is denied.
- Added `ATTENDANCE_SUBMITTED` audit coverage with counts and object ids only, not individual status details.

Test evidence:

- `AttendanceFlowTest` verifies School Admin submit/list/read, School Admin denial for School B class/subject/student/session access, assigned Teacher submit/read, and Teacher denial for an unassigned class.
- `AuditCoverageMatrixTest` now maps `AttendanceController` to `AttendanceService` and `ATTENDANCE_SUBMITTED`.
- `SchoolScopedControllerGuardCoverageTest` now includes `AttendanceController` in the approved guarded controller inventory.
- Full backend suite passes with 90 tests, 0 failures, 0 errors.

Files changed for ATT-001:

- `backend/src/main/resources/db/migration/V15__attendance_foundation.sql`
- `backend/src/main/java/com/cloudcampus/operations/attendance/*`
- `backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Status decision: `ATT-001` is VERIFIED for the current backend attendance foundation. It intentionally does not implement frontend/mobile attendance screens, parent/student attendance views, staff attendance, QR attendance, attendance edits, reports, or notification workflows.

## 25X. HOME-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q -Dtest=HomeworkFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`
- `cd backend && mvn -q test`

APIs added:

- `POST /v1/school-admin/homework`
- `GET /v1/school-admin/homework`
- `GET /v1/school-admin/homework/{homeworkId}`
- `POST /v1/teacher/homework`
- `GET /v1/teacher/homework`
- `GET /v1/teacher/homework/{homeworkId}`
- `GET /v1/parent/children/{studentId}/homework`
- `GET /v1/student/homework`
- `POST /v1/student/homework/{homeworkId}/submissions`

Backend and database evidence:

- Added Flyway V16 `homework_assignments` and `homework_submissions` with tenant, school, class, optional section, subject, creator, due date, student, and submission-user columns.
- Added homework entities, repositories, request/response DTOs, `HomeworkService`, and `HomeworkController`.
- School Admin homework uses authenticated active school plus `SchoolAccessService.requireSchoolAdminAccess`; class, section, and class-subject assignment are loaded from the database and checked against actual school/class.
- Teacher homework uses `AcademicAssignmentService.requireTeacherAssignment`; unassigned class/subject access is denied.
- Parent homework uses `ParentStudentLink`; unlinked child access is denied.
- Student homework resolves the authenticated linked student profile and only exposes/submits homework for the student's actual school/class/section.
- Added `HOMEWORK_PUBLISHED` and `HOMEWORK_SUBMITTED` audit coverage without homework instructions or submission content in audit metadata.

Test evidence:

- `HomeworkFlowTest` verifies assigned Teacher publish/list/read, Parent linked-child visibility, Student own visibility/submission, duplicate submission rejection, School Admin cross-school create/read denial, Teacher unassigned class create/read denial, Parent unlinked-child denial, Student unassigned homework submission denial, and audit metadata redaction.
- `AuditCoverageMatrixTest` now maps `HomeworkController` to `HomeworkService`, `HOMEWORK_PUBLISHED`, and `HOMEWORK_SUBMITTED`.
- `SchoolScopedControllerGuardCoverageTest` now includes `HomeworkController` in the approved guarded controller inventory.
- Full backend suite passes after HOME-001 validation.

Files changed for HOME-001:

- `backend/src/main/resources/db/migration/V16__homework_foundation.sql`
- `backend/src/main/java/com/cloudcampus/operations/homework/*`
- `backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Status decision: `HOME-001` is VERIFIED for the current backend homework foundation. It intentionally does not implement frontend/mobile homework screens, file attachments, review/grading workflows, resubmission policy, notifications, reports, or offline/mobile submission handling.

## 25Y. EXAM-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q -Dtest=ExamFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`
- `cd backend && mvn -q test`

APIs added:

- `POST /v1/school-admin/exams`
- `GET /v1/school-admin/exams`
- `GET /v1/school-admin/exams/{examId}`
- `POST /v1/school-admin/exams/{examId}/results`
- `POST /v1/school-admin/exams/{examId}/publish`
- `GET /v1/teacher/exams`
- `GET /v1/teacher/exams/{examId}`
- `POST /v1/teacher/exams/{examId}/results`
- `GET /v1/parent/children/{studentId}/results`
- `GET /v1/student/results`

Backend and database evidence:

- Added Flyway V17 `exams` and `exam_results` with tenant, school, class, optional section, subject, creator, publisher, student, marks, and recording-user columns.
- Added exam/result entities, repositories, request/response DTOs, `ExamService`, and `ExamController`.
- School Admin exam routes use authenticated active school or the exam object's actual school through `SchoolAccessService.requireSchoolAdminAccess`; class, section, class-subject assignment, exam, and student rows are loaded from the database and checked against their actual scope.
- Teacher exam and marks routes use `AcademicAssignmentService.requireTeacherAssignment`; unassigned class/subject exam access is denied.
- Parent result reads use `ParentStudentLink`; unlinked child access is denied.
- Student result reads resolve the authenticated linked `STUDENT` profile through `students.user_id`.
- Parent/student result routes expose only `PUBLISHED` exams; draft marks stay hidden.
- Added `EXAM_CREATED`, `EXAM_MARKS_RECORDED`, and `EXAM_RESULTS_PUBLISHED` audit coverage without exam titles or raw marks in audit metadata.

Test evidence:

- `ExamFlowTest` verifies School Admin exam create, Teacher assigned-scope list/marks, draft result invisibility to parent/student, School Admin publish, Parent linked-child published-result visibility, Student own published-result visibility, School Admin cross-school create/read/record/publish denial, Teacher unassigned exam read/marks denial, Parent unlinked-child denial, Student own-result filtering, and audit metadata redaction.
- `AuditCoverageMatrixTest` now maps `ExamController` to `ExamService`, `EXAM_CREATED`, `EXAM_MARKS_RECORDED`, and `EXAM_RESULTS_PUBLISHED`.
- `SchoolScopedControllerGuardCoverageTest` now includes `ExamController` in the approved guarded controller inventory.
- Full backend suite passes with 96 tests, 0 failures, 0 errors.

Files changed for EXAM-001:

- `backend/src/main/resources/db/migration/V17__exam_result_foundation.sql`
- `backend/src/main/java/com/cloudcampus/operations/exam/*`
- `backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Status decision: `EXAM-001` is VERIFIED for the current backend exam/result foundation. It intentionally does not implement frontend/mobile exam screens, report cards, grade formulas, exam edits, result republishing policy, retests, analytics, or notifications.

## 25Z. NOTE-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q -Dtest=NoticeFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`
- `cd backend && mvn -q test`

APIs added:

- `POST /v1/school-admin/notices`
- `GET /v1/school-admin/notices`
- `GET /v1/school-admin/notices/{noticeId}`
- `POST /v1/school-admin/notices/{noticeId}/publish`
- `GET /v1/teacher/notices`
- `GET /v1/parent/children/{studentId}/notices`
- `GET /v1/student/notices`

Backend and database evidence:

- Added Flyway V18 `notices` with tenant, school, optional class/section target, creator, publisher, audience, status, body, created-at, and published-at columns.
- Added notice entity, repository, request/response DTOs, `NoticeService`, and `NoticeController`.
- School Admin notice routes use authenticated active school or the notice object's actual school through `SchoolAccessService.requireSchoolAdminAccess`; optional class/section targets are loaded from the database and checked against the active school.
- Teacher notice reads derive scope from active `TeacherAssignment` rows and filter class-targeted notices to assigned classes.
- Parent notice reads require `ParentStudentLink` for the requested child.
- Student notice reads resolve the authenticated linked `STUDENT` profile through `students.user_id`.
- Teacher/parent/student reads expose only `PUBLISHED` notices; drafts remain visible only to School Admin routes.
- Added `NOTICE_CREATED` and `NOTICE_PUBLISHED` audit coverage without notice titles or bodies in audit metadata.
- Tenant/organisation-wide notices are intentionally not implemented yet; NOTE-001 establishes the school-scoped foundation and documents the future tenant/org surface separately.

Test evidence:

- `NoticeFlowTest` verifies School Admin create/publish, draft invisibility to Teacher/Parent/Student, published visibility for assigned Teacher/linked Parent/own Student, School Admin cross-school create/read/publish denial, Teacher unassigned-class filtering, Parent unlinked-child denial, Student own class/section filtering, and audit metadata redaction.
- `AuditCoverageMatrixTest` maps `NoticeController` to `NoticeService`, `NOTICE_CREATED`, and `NOTICE_PUBLISHED`.
- `SchoolScopedControllerGuardCoverageTest` includes `NoticeController` in the approved guarded controller inventory.
- Full backend suite passes with 99 tests, 0 failures, 0 errors.

Files changed for NOTE-001:

- `backend/src/main/resources/db/migration/V18__notice_foundation.sql`
- `backend/src/main/java/com/cloudcampus/operations/notice/*`
- `backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Status decision: `NOTE-001` is VERIFIED for the current backend school-scoped notice foundation. It intentionally does not implement frontend/mobile notice screens, tenant/organisation-wide notices, edit/unpublish workflows, notice delivery, notification fan-out, public website notice reads, or attachment support.

## 25AA. REP-001 Verification Notes

Verification run on 2026-05-26:

- `cd backend && mvn -q -Dtest=ReportExportFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`
- `cd backend && mvn -q test`
- `cd frontend && npm test -- --run App ReportExportsPage`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`

APIs added:

- `POST /v1/school-admin/reports/exports`
- `GET /v1/school-admin/reports/exports`
- `GET /v1/school-admin/reports/exports/{exportId}`
- `GET /v1/school-admin/reports/exports/{exportId}/download`

Backend and database evidence:

- Added Flyway V19 `report_export_jobs` and `report_export_files`, each with direct tenant and school scope.
- Each report export creates and links to a durable `bulk_jobs` row with job type `REPORT_EXPORT`.
- Added report export entities, repositories, request/response DTOs, `ReportExportService`, and `ReportExportController`.
- Added scaffold CSV generators for `STUDENT_DIRECTORY` and `FEE_DEMANDS`.
- Generated files are persisted with file name, content type, byte size, SHA-256 checksum, and CSV content. This is DB-backed scaffold storage; object storage is deferred.
- School Admin request/list routes use authenticated active school. Read/download routes load the report export object's actual school and verify `SchoolAccessService.requireSchoolAdminAccess`.
- Added `REPORT_EXPORT_REQUESTED` and `REPORT_EXPORT_COMPLETED` audit coverage without generated report content or user-supplied file names in audit metadata.

Frontend evidence:

- Added `frontend/src/features/reports/api/reportExportsApi.ts`.
- Added `ReportExportsPage` to the School Admin protected scaffold.
- The web scaffold can request/list report exports and download completed CSV files with the stored Bearer token.
- Frontend tests verify token forwarding and login-required state.

Test evidence:

- `ReportExportFlowTest` verifies durable student-directory and fee-demand export request/process/download, download denial before completion, persisted file/checksum/size, linked bulk-job completion/progress, School Admin cross-school read/download denial, non-School Admin rejection, and audit metadata redaction.
- `AuditCoverageMatrixTest` maps `ReportExportController` to `ReportExportService`, `REPORT_EXPORT_REQUESTED`, and `REPORT_EXPORT_COMPLETED`.
- `SchoolScopedControllerGuardCoverageTest` includes `ReportExportController` in the approved guarded controller inventory.
- Full backend suite passed with 106 tests after MUL-002; current suite now passes with 117 tests, 0 failures, 0 errors after MUL-007.
- Full frontend suite passed with 35 tests for REP-001; current suite now passes with 49 tests after MUL-007, and frontend typecheck/build pass.

Files changed for REP-001:

- `backend/src/main/resources/db/migration/V19__report_export_foundation.sql`
- `backend/src/main/java/com/cloudcampus/operations/report/*`
- `backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/reports/api/reportExportsApi.ts`
- `frontend/src/features/reports/pages/ReportExportsPage.tsx`
- `frontend/src/features/reports/pages/ReportExportsPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Status decision: `REP-001` is VERIFIED for the current durable report export foundation. It intentionally does not implement object-storage file delivery, scheduled report workers, expensive reporting read models, report scheduling, email delivery, mobile report UX, or full analytics dashboards. Tenant Admin combined summary/drilldown was added later by MUL-004.

## 25AB. MUL-002 Verification Notes

MUL-002 implementation scope:

- Added durable `tenant_school_limits` with a default single-school posture when no limit row exists.
- Added `POST /v1/tenant-admin/schools` for authenticated `TENANT_ADMIN` users to create additional non-primary schools for their own tenant.
- The route derives tenant from the signed authenticated user only; request body `tenantId` is ignored and tenant/school spoofing headers are rejected by the global spoofing filter.
- School code is normalised to uppercase, duplicate tenant/school codes are rejected, and customer-created `MAIN` remains rejected.
- The route checks `SchoolRepository.countByTenantId` against `TenantSchoolLimit.maxSchools` before creating a school.
- Additional schools are created as `primarySchool=false`; first-school onboarding remains unchanged.
- The school creation mutation writes a typed `SCHOOL_CREATED` audit row with authenticated Tenant Admin actor id/role and school-limit usage metadata.
- Added a minimal protected Tenant Admin web panel that sends the stored Bearer token and displays returned school usage.

APIs added:

- `POST /v1/tenant-admin/schools`

Backend evidence:

- `TenantAdminSchoolController` uses `AuthenticatedUserResolver`.
- `TenantAdminSchoolService` permits only `TENANT_ADMIN`, derives tenant from `actor.getTenant()`, checks `tenant_school_limits`, rejects `MAIN`, rejects duplicate codes, creates the additional school, and records audit.
- `TenantSchoolLimit` and `TenantSchoolLimitRepository` provide the current scaffold school-limit source.

Frontend evidence:

- `TenantSchoolCreationPage` is rendered only inside the `TENANT_ADMIN` protected panel.
- `tenantSchoolsApi.createTenantSchool` sends `Authorization: Bearer ...`.
- Frontend tests verify login-required state and token-forwarding payload behavior.

Migration/database evidence:

- `V20__tenant_school_limits.sql` creates `tenant_school_limits` with `tenant_id` primary key, FK to `tenants`, `max_schools`, and a `max_schools >= 1` check.

Test evidence:

- `TenantAdminSchoolManagementFlowTest` verifies Tenant Admin school creation within limit, server-derived tenant identity despite spoofed body `tenantId`, audit actor attribution, limit rejection, reserved `MAIN` rejection, duplicate code rejection, unauthenticated rejection, non-Tenant Admin rejection, and spoofed tenant header rejection.
- `AuditCoverageMatrixTest` maps `TenantAdminSchoolController` to `TenantAdminSchoolService` and `SCHOOL_CREATED`.
- `TenantSchoolCreationPage.test.tsx` verifies login-required and token-forwarding behavior.
- `App.test.tsx` verifies `TENANT_ADMIN` can access the school-creation scaffold.

Files changed for MUL-002:

- `backend/src/main/resources/db/migration/V20__tenant_school_limits.sql`
- `backend/src/main/java/com/cloudcampus/platform/subscription/TenantSchoolLimit.java`
- `backend/src/main/java/com/cloudcampus/platform/subscription/TenantSchoolLimitRepository.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/*`
- `backend/src/main/java/com/cloudcampus/school/SchoolRepository.java`
- `backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts`
- `frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.tsx`
- `frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Status decision: `MUL-002` is VERIFIED for the current scaffold multi-school creation foundation. It intentionally does not implement Super Admin subscription assignment APIs, rich plan catalog, mobile Tenant Admin UX, or production billing reconciliation. Tenant Admin combined summary/drilldown was added later by MUL-004, new-school School Admin invitation/grant workflow was added later by MUL-005, and Tenant Admin school list/edit/deactivate was added later by MUL-006.

## 25AC. MUL-003 Verification Notes

MUL-003 implementation scope:

- Hardened initial active-school resolution so login/MFA/refresh session issuance uses tenant-consistent `user_school_access` grants only.
- Verified a same-tenant multi-school user can list granted schools, activate a secondary school through `POST /v1/me/schools/{schoolId}/activate`, receive a new active-school token context, and hydrate `/v1/me` from that server-derived context.
- Verified activation ignores spoofed request body/query role, tenant, and school noise; path school id plus backend grant checks determine the activated school.
- Improved the web school selector with assigned-school count, school code labels, disabled activation when no school is selected, single-school auto-activation coverage, and denied-activation error coverage.
- Added mobile shell role metadata with backend role codes and explicit school-switching readiness markers for Tenant Admin, School Admin, Teacher, Staff, Parent, and Student.

APIs validated:

- `GET /v1/me`
- `GET /v1/me/schools`
- `POST /v1/me/schools/{schoolId}/activate`

Files changed for MUL-003:

- `backend/src/main/java/com/cloudcampus/identity/auth/session/AuthSessionService.java`
- `backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java`
- `frontend/src/features/auth/components/SchoolSelector.tsx`
- `frontend/src/app/App.test.tsx`
- `mobile/src/app/mobileShellModel.ts`
- `mobile/src/app/mobileShellModel.test.ts`
- `mobile/App.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Test evidence:

- `AuthSessionFlowTest` now proves multi-school activation returns the selected school's active token context, body/query spoofing does not override backend grant checks, activation audit metadata uses the selected school and authenticated actor, and malformed cross-tenant grants are not used as initial active-school context.
- `App.test.tsx` now proves single-school users auto-activate their only assigned school, multi-school activation calls the correct API, updated tokens are stored, and denied activation shows a clear error without opening active-school panels.
- `mobileShellModel.test.ts` now proves mobile shell role coverage includes backend role codes and switch-ready roles.

Validation evidence:

- `cd backend && mvn -q -Dtest=AuthSessionFlowTest test` passed.
- `cd backend && mvn -q test` passed with 113 tests, 0 failures, 0 errors after MUL-005.
- `cd frontend && npm test -- --run App` passed with 13 tests.
- `cd frontend && npm test -- --run` passed with 43 tests after MUL-005.
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npm run build` passed.
- `cd mobile && npm test` passed with 2 tests.
- `cd mobile && npm run typecheck` passed.

Status decision: `MUL-003` is VERIFIED for the current scaffold secure school switching foundation. It intentionally does not implement a polished multi-school dashboard, mobile login/session screens, or browser E2E tests with a live server. Tenant Admin combined summary/drilldown was added later by MUL-004, and newly created school admin assignment/grant workflow was added later by MUL-005.

## 25AD. MUL-004 Verification Notes

MUL-004 implementation scope:

- Added Tenant Admin combined tenant report summary over the current scaffold student and fee models.
- Added school-safe Tenant Admin report drilldown for a requested school in the authenticated actor's tenant.
- The routes derive tenant identity from the signed authenticated user only; request headers, query parameters, and body data cannot choose the tenant.
- School drilldown loads the requested school and rejects cross-tenant school ids.
- Current metrics include school counts, total/active students, fee demand count, amount due, amount paid, and outstanding amount.
- No database migration was needed because the task reads existing `schools`, `students`, `fee_demands`, and `fee_payments` data.

APIs added:

- `GET /v1/tenant-admin/reports/summary`
- `GET /v1/tenant-admin/reports/schools/{schoolId}/summary`

Backend evidence:

- `TenantAdminReportController` uses `AuthenticatedUserResolver` and exposes only `TENANT_ADMIN` report routes.
- `TenantAdminReportService` permits only active `TENANT_ADMIN` users, derives tenant from `actor.getTenant()`, aggregates schools through `SchoolRepository.findByTenantIdOrderByNameAsc`, and blocks school drilldown when `school.tenant_id` does not match the actor tenant.
- `SchoolScopedControllerGuardCoverageTest` includes `TenantAdminReportController` in the approved guarded controller inventory.

Frontend evidence:

- Added `frontend/src/features/tenant-admin/api/tenantReportsApi.ts`.
- Added `TenantReportsPage` to the `TENANT_ADMIN` protected scaffold next to Tenant Admin school creation.
- The page loads combined summary and school drilldown using the stored Bearer token and shows a login-required state when missing.
- Frontend tests verify token forwarding, summary rendering, school drilldown calls, and login-required behavior.

Migration/database evidence:

- No new migration. MUL-004 is read-only over V1 schools/students plus V14 fee demand/payment tables.

Test evidence:

- `TenantAdminReportSummaryFlowTest` verifies combined tenant summary aggregation, per-school drilldown, cross-tenant school drilldown rejection, unauthenticated rejection, non-Tenant Admin rejection, and spoofed `X-Tenant-ID` rejection.
- `TenantReportsPage.test.tsx` verifies the web scaffold sends the stored Bearer token for summary/drilldown and shows login-required state without a token.
- `App.test.tsx` verifies the Tenant Admin protected scaffold renders Tenant reports.

Files changed for MUL-004:

- `backend/src/main/java/com/cloudcampus/school/SchoolRepository.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/report/*`
- `backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java`
- `backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java`
- `frontend/src/features/tenant-admin/api/tenantReportsApi.ts`
- `frontend/src/features/tenant-admin/pages/TenantReportsPage.tsx`
- `frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Validation evidence:

- `cd backend && mvn -q -Dtest=TenantAdminReportSummaryFlowTest,SchoolScopedControllerGuardCoverageTest test` passed.
- `cd backend && mvn -q test` passed with 111 tests, 0 failures, 0 errors.
- `cd frontend && npm test -- --run TenantReportsPage App` passed with 15 focused tests.
- `cd frontend && npm test -- --run` passed with 41 tests.
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npm run build` passed.
- Mobile was not touched for MUL-004.

Status decision: `MUL-004` is VERIFIED for the current scaffold Tenant Admin combined report summary and school-safe drilldown foundation. It intentionally does not implement richer reporting read models, export scheduling, object-storage delivery, chart dashboards, mobile Tenant Admin report UX, tenant settings, or usage/subscription workflows. Newly created school admin assignment/grants were added later by MUL-005, Tenant Admin school list/edit/deactivate was added later by MUL-006, and tenant settings/usage was added later by MUL-007.

## 25AE. MUL-005 Verification Notes

MUL-005 implementation scope:

- Added Tenant Admin school-admin assignment/grant workflow for tenant schools.
- Added `POST /v1/tenant-admin/schools/{schoolId}/admins/invite`.
- The route allows only authenticated active `TENANT_ADMIN` users.
- The route derives tenant from the signed authenticated actor and rejects schools outside the actor tenant.
- The request body cannot choose role, tenant, user, or trusted school context; the assigned role is always server-derived `SCHOOL_ADMIN`.
- The service creates or reuses a same-tenant `SCHOOL_ADMIN` user, grants `user_school_access` for the requested school, and issues a standard invitation when the user is not active.
- Existing same-tenant users with non-`SCHOOL_ADMIN` roles are rejected; disabled users are rejected.
- No database migration was needed because `user_accounts`, `invitations`, and `user_school_access` already support the workflow.

APIs added:

- `POST /v1/tenant-admin/schools/{schoolId}/admins/invite`

Backend evidence:

- `TenantAdminSchoolController` now exposes the School Admin invite route under the existing Tenant Admin school-management controller.
- `TenantAdminSchoolService.inviteSchoolAdmin` uses `AuthenticatedUserResolver` output, checks `TENANT_ADMIN`, verifies the requested school belongs to the authenticated tenant, creates/reuses a `SCHOOL_ADMIN`, persists `UserSchoolAccess`, creates an invitation for inactive users, and records audit rows.
- Audit rows use `SCHOOL_ADMIN_INVITED` and `SCHOOL_ACCESS_GRANTED` with authenticated Tenant Admin actor id/role and no raw invitation token.
- `AuditCoverageMatrixTest` maps `TenantAdminSchoolController` to `SCHOOL_CREATED`, `SCHOOL_ADMIN_INVITED`, and `SCHOOL_ACCESS_GRANTED`.

Frontend evidence:

- `tenantSchoolsApi.ts` now includes `inviteTenantSchoolAdmin`.
- `TenantSchoolCreationPage` includes a minimal School Admin invitation form that sends the stored Bearer token and shows login-required state when missing.
- Frontend tests verify token-required and token-forwarding behavior for the invite form.

Migration/database evidence:

- No new migration. MUL-005 reuses V1 `user_accounts`, `invitations`, and `user_school_access`.

Test evidence:

- `TenantAdminSchoolManagementFlowTest` verifies Tenant Admin can create a school, invite a School Admin for that school, persist the grant, accept the invitation, activate the user, and write audit rows without raw invitation token or unmasked request email.
- The same test verifies cross-tenant school assignment is forbidden, spoofed tenant headers are rejected, non-Tenant Admin callers are rejected, and existing same-tenant users with conflicting roles are rejected.
- `TenantSchoolCreationPage.test.tsx` verifies login-required behavior and Bearer-backed payload forwarding for School Admin invitations.

Files changed for MUL-005:

- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantSchoolAdminInviteRequest.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantSchoolAdminInviteResponse.java`
- `backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts`
- `frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.tsx`
- `frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Validation evidence:

- `cd backend && mvn -q -Dtest=TenantAdminSchoolManagementFlowTest,AuditCoverageMatrixTest test` passed.
- `cd backend && mvn -q test` passed with 113 tests, 0 failures, 0 errors.
- `cd frontend && npm test -- --run TenantSchoolCreationPage App` passed with 17 focused tests.
- `cd frontend && npm test -- --run` passed with 43 tests.
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npm run build` passed.
- Mobile was not touched for MUL-005.

Status decision: `MUL-005` is VERIFIED for the current scaffold Tenant Admin School Admin invite/access-grant foundation. School-admin list/resend/revoke and school list/edit/deactivate were added later by MUL-006; tenant settings/usage was added later by MUL-007. It intentionally does not implement a richer Tenant Admin dashboard, production email delivery, billing-grade subscriptions, or mobile Tenant Admin UX.

## 25AF. MUL-006 Verification Notes

MUL-006 implementation scope:

- Added Tenant Admin school list, school name update, and school deactivation workflow.
- Added Tenant Admin School Admin list, invitation resend, and access revoke workflow.
- The routes allow only authenticated active `TENANT_ADMIN` users and derive tenant identity from the signed authenticated actor.
- Cross-tenant school ids and cross-tenant user ids are rejected. Frontend body/header values cannot choose tenant, role, user, or trusted school context.
- Primary tenant schools cannot be deactivated in this scaffold. The last School Admin access grant for a school cannot be revoked.
- No database migration was needed because V1 already has `schools`, `user_accounts`, `invitations`, `user_school_access`, and `audit_logs`.

APIs added:

- `GET /v1/tenant-admin/schools`
- `PATCH /v1/tenant-admin/schools/{schoolId}`
- `POST /v1/tenant-admin/schools/{schoolId}/deactivate`
- `GET /v1/tenant-admin/schools/{schoolId}/admins`
- `POST /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation`
- `DELETE /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access`

Backend evidence:

- `TenantAdminSchoolController` exposes the new list/update/deactivate/admin-list/resend/revoke routes under `/v1/tenant-admin/schools`.
- `TenantAdminSchoolService` verifies the authenticated actor is `TENANT_ADMIN`, checks every school/user/access grant against the actor tenant, ignores spoofed body tenant fields, and reuses the existing invitation and `user_school_access` model.
- `School` now has narrow domain methods for rename and deactivate only.
- `UserSchoolAccessRepository` adds school-admin grant listing/counting for admin management; `InvitationRepository` adds latest-invitation lookup for admin summaries.
- Audit rows use `SCHOOL_UPDATED`, `SCHOOL_DEACTIVATED`, `SCHOOL_ADMIN_INVITATION_RESENT`, and `SCHOOL_ACCESS_REVOKED` with authenticated Tenant Admin actor id/role and no raw invitation token.
- `AuditCoverageMatrixTest` maps `TenantAdminSchoolController` to the new typed audit actions.

Frontend evidence:

- `tenantSchoolsApi.ts` includes list/update/deactivate/list-admins/resend/revoke API clients that send `Authorization: Bearer ...`.
- `TenantSchoolManagementPage` adds minimal Tenant Admin forms/lists for school management and School Admin management, including login-required behavior when no stored token exists.
- `App.tsx` mounts the management panel inside the existing `TENANT_ADMIN` protected portal section.
- Frontend tests verify token-required behavior, token forwarding, school/admin rendering, and management API calls.

Migration/database evidence:

- No new migration. MUL-006 reuses existing V1 tables and adds no schema columns.

Test evidence:

- `TenantAdminSchoolManagementFlowTest` verifies Tenant Admin school listing, school rename, school deactivation, primary-school deactivation rejection, cross-tenant edit/admin-list rejection, School Admin listing, resend invitation, last-admin revoke rejection, successful revoke when another admin remains, active-user resend rejection, and audit rows without raw tokens.
- Existing MUL-002/MUL-005 tests still verify additional-school creation limits, reserved `MAIN` rejection, duplicate school code rejection, School Admin invitation/grant, standard invitation acceptance, non-Tenant Admin rejection, spoofed header rejection, cross-tenant assignment rejection, and conflicting user-role rejection.
- `TenantSchoolManagementPage.test.tsx` verifies login-required state, Bearer-backed school/admin loading, and update/deactivate/resend/revoke API calls.

Files changed for MUL-006:

- `backend/src/main/java/com/cloudcampus/school/School.java`
- `backend/src/main/java/com/cloudcampus/identity/accesscontrol/UserSchoolAccessRepository.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/invitation/InvitationRepository.java`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolUpdateRequest.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantSchoolAdminSummaryResponse.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantSchoolAdminAccessRevokeResponse.java`
- `backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts`
- `frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.tsx`
- `frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx`
- `frontend/src/app/App.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Validation evidence:

- `cd backend && mvn -q -Dtest=TenantAdminSchoolManagementFlowTest,AuditCoverageMatrixTest test` passed.
- `cd backend && mvn -q test` passed with 115 tests, 0 failures, 0 errors after MUL-006 validation.
- `cd frontend && npm test -- --run TenantSchoolManagementPage TenantSchoolCreationPage App` passed with 20 focused tests.
- `cd frontend && npm test -- --run` passed with 46 tests.
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npm run build` passed.
- Mobile was not touched for MUL-006.

Status decision: `MUL-006` is VERIFIED for the current scaffold Tenant Admin school-management and School Admin grant-management foundation. Tenant settings and usage were added later by MUL-007. It intentionally does not implement polished dashboard navigation, production email delivery, invitation cancellation, reactivation, billing-grade subscription assignment, or mobile Tenant Admin UX.

## 25AG. MUL-007 Verification Notes

MUL-007 implementation scope:

- Added Tenant Admin tenant settings read/update workflow.
- Added Tenant Admin subscription usage summary over the current scaffold tenant, school, user, staff, and student models.
- The routes allow only authenticated active `TENANT_ADMIN` users and derive tenant identity from the signed authenticated actor.
- Request body values cannot choose tenant, role, user, or trusted context; spoofed tenant/school context headers are rejected by the global filter.
- Settings updates write a typed audit row with authenticated Tenant Admin actor id/role. Raw billing/support email addresses are masked in audit metadata.
- Subscription usage is read-only and intentionally scaffold-level: `planCode` is `SCAFFOLD`, school count limit comes from `tenant_school_limits`, and full billing/plan catalog/invoice lifecycle is deferred.

APIs added:

- `GET /v1/tenant-admin/settings`
- `PATCH /v1/tenant-admin/settings`
- `GET /v1/tenant-admin/subscription/usage`

Backend evidence:

- `TenantAdminSettingsController` exposes settings and usage routes under `/v1/tenant-admin`.
- `TenantAdminSettingsService` verifies the authenticated actor is `TENANT_ADMIN`, reloads the tenant from the database, persists settings by tenant id, computes usage from server-side repositories, and records `TENANT_SETTINGS_UPDATED`.
- `tenant_settings` stores display name, billing/support email, timezone, locale, and update timestamp keyed by tenant id.
- Usage counts active/all schools, School Admin users, teacher users, staff profiles, student profiles, remaining schools, and school-limit reached state.
- `AuditCoverageMatrixTest` maps `TenantAdminSettingsController` to `TENANT_SETTINGS_UPDATED`.

Frontend evidence:

- `tenantSettingsApi.ts` includes settings read/update and usage lookup clients that send `Authorization: Bearer ...`.
- `TenantSettingsPage` adds minimal Tenant Admin forms for loading settings/usage and updating tenant settings, including login-required behavior when no stored token exists.
- `App.tsx` mounts the settings panel inside the existing `TENANT_ADMIN` protected portal section.
- Frontend tests verify token-required behavior, token forwarding, usage rendering, and update payload calls.

Migration/database evidence:

- `V21__tenant_settings.sql` creates `tenant_settings` with tenant FK/PK, display name, billing/support email, timezone, locale, and `updated_at`.

Test evidence:

- `TenantAdminSettingsFlowTest` verifies Tenant Admin can read default settings, update only their own tenant settings despite spoofed body fields, persist normalised email/settings values, and write audit rows with authenticated actor and without raw email/spoofed tenant data.
- The same test verifies usage counts are server-derived, spoofed tenant headers are rejected, non-Tenant Admin callers are rejected, and unauthenticated callers are rejected.
- `TenantSettingsPage.test.tsx` verifies login-required state, Bearer-backed settings/usage loading, and update payload forwarding.

Files changed for MUL-007:

- `backend/src/main/resources/db/migration/V21__tenant_settings.sql`
- `backend/src/main/java/com/cloudcampus/audit/AuditAction.java`
- `backend/src/main/java/com/cloudcampus/identity/auth/UserAccountRepository.java`
- `backend/src/main/java/com/cloudcampus/people/staff/StaffProfileRepository.java`
- `backend/src/main/java/com/cloudcampus/people/student/StudentRepository.java`
- `backend/src/main/java/com/cloudcampus/school/SchoolRepository.java`
- `backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/*`
- `backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java`
- `backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java`
- `frontend/src/features/tenant-admin/api/tenantSettingsApi.ts`
- `frontend/src/features/tenant-admin/pages/TenantSettingsPage.tsx`
- `frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md`

Validation evidence:

- `cd backend && mvn -q -Dtest=TenantAdminSettingsFlowTest,AuditCoverageMatrixTest test` passed.
- `cd backend && mvn -q test` passed with 117 tests, 0 failures, 0 errors after MUL-007 validation.
- `cd frontend && npm test -- --run TenantSettingsPage App` passed with 16 focused tests.
- `cd frontend && npm test -- --run` passed with 49 tests.
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npm run build` passed.
- Mobile was not touched for MUL-007.

Status decision: `MUL-007` is VERIFIED for the current scaffold Tenant Admin tenant settings and subscription usage foundation. It intentionally does not implement Super Admin subscription assignment, a billing-grade plan catalog, tenant subscription lifecycle, invoices, feature entitlements, usage over all future modules, organisation branding, polished navigation, or mobile Tenant Admin UX.

| Task ID | Phase | Task | Priority | Depends On | Backend | Frontend | Mobile | DB Migration | Tests Required | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ARCH-001 | PHASE 0 | Audit current tenant and school creation flow | P0 | None | Yes | Yes | No | No | Validation dashboard | VERIFIED | Current flow is `POST /v1/super-admin/tenants/onboard`; historical `TenantServiceImpl.create`/`MAIN` behavior is retained only as deleted legacy context. |
| ARCH-002 | PHASE 0 | Inventory current APIs and roles | P0 | None | Yes | Yes | Yes | No | Route/role inventory | VERIFIED | Current scaffold exposes readiness, onboarding, invitation/auth/session/MFA/password lifecycle, current-user school APIs, parent-child, staff/teacher provisioning, academic lifecycle, academic assignment, teacher assignment, student import, student import job, student login invitation/self-profile, bulk job, fee demand/payment/receipt, attendance, homework, exam/result, notice, and report export endpoints; backend role enum includes `SUPER_ADMIN`, `TENANT_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, `STUDENT`; historical route inventory is labelled as rebuild reference. |
| ARCH-003 | PHASE 0 | Keep this master file updated after each task | P0 | ARCH-001 | No | No | No | No | Review diff | IN_PROGRESS | This file created as source of truth. |
| STRUCT-001 | PHASE 0 | Create clean CloudCampus monorepo folder scaffold | P0 | ARCH-003 | Yes | Yes | Yes | No | Folder inventory | VERIFIED | Added backend/frontend/mobile/infra/docs/scripts/tests/.github scaffold with `.gitkeep` placeholders; current build/test commands pass and package dependency scan found no compile-time break. |
| STRUCT-002 | PHASE 0 | Add minimal build manifests and app shells to scaffold | P0 | STRUCT-001 | Yes | Yes | Yes | No | Backend compile, frontend build, mobile typecheck | VERIFIED | Added Spring Boot, Vite React, and Expo baseline shells with smoke tests. Backend compile/test, frontend build/typecheck/test, and mobile typecheck/test pass. |
| ONB-001 | PHASE 1 | Replace visible `MAIN` onboarding with first real school input | P0 | ARCH-001 | Yes | Yes | No | Yes | Tenant onboarding integration tests | VERIFIED | `POST /v1/super-admin/tenants/onboard` requires first real school details; backend and frontend tests reject reserved `MAIN`. |
| ONB-002 | PHASE 1 | Implement first School Admin secure invitation | P0 | AUTH-001, ONB-001 | Yes | Yes | Maybe | Yes | Invitation/onboarding tests | VERIFIED | Onboarding creates a pending `SCHOOL_ADMIN` invitation with hashed token storage and one-time raw token response for delivery. |
| ONB-003 | PHASE 1 | Auto-grant school access during onboarding | P0 | ONB-002 | Yes | Yes | Maybe | Yes | School access grant tests | VERIFIED | Onboarding persists `user_school_access` for first School Admin and verifies access during invitation acceptance. |
| ONB-004 | PHASE 1 | Audit tenant creation, school creation, admin invitation, access grant | P0 | ONB-003, AUD-001 | Yes | No | No | Yes | Audit assertions | VERIFIED | Added `audit_logs` migration/entity/service and transactional onboarding audit events for `TENANT_CREATED`, `SCHOOL_CREATED`, `SCHOOL_ADMIN_INVITED`, and `SCHOOL_ACCESS_GRANTED`; tests verify no raw invitation token/full email leakage. |
| AUTH-001 | PHASE 1 | Implement invitation set-password flow | P0 | ARCH-002 | Yes | Yes | Maybe | Yes | Invitation accept/security tests | VERIFIED | `POST /v1/invitations/accept` validates token hash, pending state, and expiry; stores BCrypt password hash; activates user; and tests block reuse, invalid token, and expired token acceptance. Expired rows remain `PENDING` after rejection because the thrown exception rolls back the status mutation. |
| AUTH-002 | PHASE 1 | Implement authenticated login/session foundation | P0 | AUTH-001 | Yes | Yes | No | No | Login/session/security tests | VERIFIED | Added `POST /v1/auth/login`, `GET /v1/me`, `GET /v1/me/schools`, and `POST /v1/me/schools/{schoolId}/activate`; signed stateless access token includes server-derived user, tenant, role, and active school context; tests verify valid invited School Admin login, wrong password, inactive user rejection, spoofing rejection/ignore, school list, unassigned school activation denial, cross-tenant activation denial, and updated token context. Frontend has minimal login API/page and token storage in `sessionStorage`. |
| AUTH-003 | PHASE 1 | Add refresh/session hardening lifecycle | P1 | AUTH-002 | Yes | Yes | No | Yes | Refresh/revocation/password lifecycle tests | VERIFIED | Added V3 `refresh_tokens`, `revoked_access_tokens`, and `password_reset_tokens`; added refresh-token rotation, logout/access-token revocation, forgot/reset password, and authenticated change-password APIs. Tests verify refresh rotation blocks old token reuse, logout blocks revoked access and refresh tokens, reset changes password and blocks token reuse, and change-password requires the current password. Frontend auth client supports refresh/logout/reset/change-password and stores refresh token in `sessionStorage`. |
| AUTH-004 | PHASE 1 | Add MFA and login rate limiting for privileged users | P1 | AUTH-003 | Yes | Yes | No | Yes | MFA/rate-limit tests | VERIFIED | Added V4 `mfa_challenges`, `POST /v1/auth/mfa/verify`, privileged-role MFA gating before token issuance, BCrypt-hashed one-time code storage, challenge expiry/reuse rejection, and in-process login rate limiting. Backend tests verify MFA required, wrong-code rejection, reuse rejection, and HTTP 429 after repeated wrong passwords. Frontend supports the scaffold MFA checkpoint before token storage. Production out-of-band MFA delivery remains a follow-up. |
| AUTH-005 | PHASE 1 | Protect Super Admin tenant onboarding | P0 | AUTH-004, ONB-004 | Yes | Yes | No | No | Super Admin onboarding authorization and audit actor tests | VERIFIED | `POST /v1/super-admin/tenants/onboard` now requires an authenticated active `SUPER_ADMIN`; unauthenticated and all non-super roles are rejected. Onboarding audit rows contain actual Super Admin actor id/role. Added controlled opt-in Super Admin bootstrap for non-prod explicit config only. Frontend sends Bearer token and shows login-required state when absent. |
| FRONT-AUTH-001 | PHASE 1 | Align frontend auth state, role guards, and school activation UX with verified backend auth | P0 | AUTH-005, SEC-001, SEC-002 | No | Yes | No | No | Frontend auth/routing/school selector tests | VERIFIED | Added web auth state provider, current-user and school-list hydration, invalid-token clearing, logout, role-aligned `BACKEND_USER_ROLES`, protected panels for Super Admin/Tenant Admin/School Admin scopes, active-school-required School Admin scaffold gating, and school selector/activation flow. Frontend tests verify role list alignment, unauthenticated denial, invalid stored-token clearing, Super Admin onboarding access, School Admin scaffold access, School Admin denial from onboarding, Teacher/Parent/Student/Staff denial from admin-only panels, Tenant Admin recognition, school activation API/token handling, and login auth-state registration. Backend contracts and mobile were not changed. |
| SEC-001 | PHASE 2 | Verify tenant context cannot be spoofed | P0 | ARCH-002 | Yes | No | No | No | Tenant spoofing tests | VERIFIED | `ClientTenantContextSpoofingFilter` rejects tenant/school context headers; onboarding ignores body `tenantId` noise; login ignores body `tenantId`/`schoolId`/`role`; `/v1/me` returns server-derived tenant and role despite spoofed query parameters; Tenant A School Admin is denied when attempting to activate Tenant B school via URL/query/body spoofing; signed token tenant-claim mismatch is rejected; malformed cross-tenant school grants do not leak through `/v1/me` or `/v1/me/schools`. Future business APIs still need module-specific cross-tenant object tests when rebuilt. |
| SEC-002 | PHASE 2 | Verify school admin cannot access another school | P0 | ONB-003 | Yes | No | No | No | School isolation integration tests | PARTIAL | `SchoolAccessService.requireSchoolAdminAccess` denies unassigned same-tenant and cross-tenant schools at service level, now parameterized across student, staff, fees, payments, attendance, homework, exams, results, notices, timetable, documents, reports, and website content object types. PAR-001 adds route-level denial for Tenant/School B student parent-link attempts. STAFF-001 adds active-school staff/teacher provisioning guard coverage and non-admin denial. ACA-001 adds route-level denial for Tenant/School B academic objects. ACA-002 adds route-level denial for Tenant/School B subject/class-subject/teacher assignment objects and teacher unassigned class access. STU-001 adds route-level denial for Tenant/School B class/section ids in student import. BULK-001 adds route-level denial for School Admin A reading/cancelling School B bulk jobs. STU-002 adds route-level denial for queueing an import job with School B class/section ids. STU-003 adds route-level denial for provisioning a student login for another school's student. FEE-001 adds route-level denial for School Admin A creating, reading, or paying School B fee demands, plus parent linked-child and student own-fee checks. ATT-001 adds route-level denial for School Admin A creating/reading School B attendance inputs/sessions and Teacher denial for unassigned class attendance. HOME-001 adds route-level denial for School Admin A creating/reading School B homework, Teacher unassigned class homework access, Parent unlinked-child homework access, and Student unassigned homework submission. EXAM-001 adds route-level denial for School Admin A creating/reading/recording/publishing School B exams/results, Teacher unassigned exam/result access, Parent unlinked-child results, and Student own-result filtering. NOTE-001 adds route-level denial for School Admin A creating/reading/publishing School B notices, Teacher unassigned notice filtering, Parent unlinked-child denial, and Student own-notice filtering. REP-001 adds route-level denial for School Admin A reading/downloading School B report exports and non-School Admin report request denial. Missing: route-level negative tests for remaining controllers when rebuilt. |
| SEC-003 | PHASE 2 | Remove hard-coded `MAIN` school resolution | P0 | SEC-002 | Yes | Yes | Yes | Maybe | Regression tests for student/teacher/parent flows | VERIFIED | Current scaffold has no active business logic depending on hard-coded `MAIN`; safe `MAIN` references are limited to onboarding rejection/tests/docs. Added `HardCodedMainSchoolResolutionTest` to fail on `MAIN`, `resolveMainSchool`, `defaultSchool`, or explicit primary-school fallback markers in backend business sources outside the onboarding reserved-code guard. Parent/student/teacher Java business flows are not rebuilt yet; the regression protects them when added. |
| SEC-004 | PHASE 2 | Protect Super Admin tenant onboarding route | P0 | AUTH-005 | Yes | Yes | No | No | Super Admin onboarding authorization tests | VERIFIED | Same delivered scope as AUTH-005: tenant onboarding is protected by Bearer-token identity, only `SUPER_ADMIN` can call it, spoofed role/tenant/user context is ignored, and audit rows include the authenticated Super Admin actor. |
| SEC-005 | PHASE 2 | Add teacher-assignment access tests | P0 | ACA-001 | Yes | Maybe | Maybe | No | Teacher unassigned class/subject tests | VERIFIED | ACA-002 adds durable class-subject and teacher assignment models, `GET /v1/teacher/assignments`, and tests proving a teacher sees only own assignments and receives 403 for an unassigned class. ATT-001, HOME-001, and EXAM-001 now add assignment checks at attendance, homework, and marks routes. Future timetable and teacher modules must add assignment checks at their own routes. |
| SEC-006 | PHASE 2 | Add object-level school access guard for ID-only routes | P0 | SEC-002 | Yes | No | No | No | Cross-school object route tests | PARTIAL | Current scaffold has guarded school-scoped routes for parent-child access, staff/teacher provisioning, academic lifecycle, academic assignment/teacher assignment, student import/list/job routes, student login provisioning/self-profile routes, bulk jobs, fee demand/payment/receipt routes, attendance routes, homework routes, exam/result routes, notice routes, report export routes, and Tenant Admin report school drilldown. Added central guard negative coverage across object types and `SchoolScopedControllerGuardCoverageTest` to fail future school-scoped controllers without approved backend guard markers. Product route tests remain blocked for timetable, documents, website content, tenant/organisation notices, and broader route surfaces until those routes exist. |
| SEC-007 | PHASE 2 | Add parent-child access tests | P0 | PAR-001 | Yes | Maybe | Maybe | No | Parent access tests | VERIFIED | PAR-001 verifies parent accepts invitation, logs in, sees only linked children, can read a linked child, and receives 403 for an unlinked child. Future parent payment/leave/result/attendance routes must add their own linked-child tests when rebuilt. |
| AUD-001 | PHASE 2 | Add audit logging for sensitive mutations | P0 | ARCH-002 | Yes | No | No | No | Audit coverage tests | VERIFIED | Added typed audit rows for invitation acceptance, MFA challenge create/verify, refresh rotation, logout, password reset request/completion, password change, and school context activation; existing onboarding, parent-link, staff, academic, assignment, student-import, bulk, and student-login audit rows remain covered. Added `AuditCoverageMatrixTest` to fail future mutation controllers without mapped audit evidence. No DB migration was required because V2 `audit_logs` already supports these actions. |
| ACA-001 | PHASE 3 | Verify academic year/class/section lifecycle | P1 | SEC-006 | Yes | Yes | No | Yes | Lifecycle and school isolation tests | VERIFIED | Added V6 `academic_years`, `class_levels`, and `sections`; added School Admin APIs for academic year create/list/activate, class create/list, and section create/list; uses active authenticated school or object's actual `school_id`; writes academic/class/section audit events; backend tests cover lifecycle, invalid dates, and cross-school object denial; frontend scaffold forwards Bearer auth. |
| ACA-002 | PHASE 3 | Add class-subject and teacher assignment model validation | P1 | ACA-001 | Yes | Yes | No | Yes | Assignment tests | VERIFIED | Added V8 subjects/class-subject/teacher-assignment tables, School Admin subject/class-subject/teacher-assignment APIs, teacher own-assignment API, audit events, object-school checks, teacher role/status/tenant checks, backend negative tests, and frontend assignment scaffold. STAFF-001 now removes the manual teacher-user creation gap for current scaffold flows. |
| STU-001 | PHASE 3 | Validate student import template | P1 | SEC-006 | Yes | Yes | No | Yes | Import validation tests | VERIFIED | Added V7 student import fields/class-section FKs, synchronous import template/validate/import/list APIs, row-level validation, duplicate admission checks, class-section match checks, active-school object guards, `STUDENT_IMPORTED` audit event, backend negative tests, and frontend import scaffold. Durable queued import foundation is now STU-002. |
| STU-002 | PHASE 4 | Design async student import job | P1 | BULK-001, STU-001 | Yes | Yes | Maybe | Yes | Bulk job tests | VERIFIED | Added V12 `student_import_jobs`, queued import job API/read API, persisted submitted rows, linked `BulkJob` progress, internal processor method, row-level validation error JSON/error reference, partial-completion handling, `STUDENT_IMPORT_JOB_QUEUED` audit event, cross-school queue denial tests, and frontend queue action. Scheduled worker, object-storage CSV/error files, retry/idempotency, and promotions remain follow-ups. |
| STU-003 | PHASE 3 | Add optional student login invitation | P1 | AUTH-001 | Yes | Yes | No | Yes | Student login provisioning tests | VERIFIED | Added V13 `students.user_id`, School Admin student-login invitation API, student self-profile API, `STUDENT` user creation/reuse, standard invitation/set-password flow, `user_school_access` grant, audit events, cross-school/non-admin/role-conflict negative tests, and frontend token-forwarding scaffold. Mobile student portal was not touched. |
| PAR-001 | PHASE 3 | Implement parent-child linking by email/mobile with invitation | P1 | AUTH-001 | Yes | Yes | No | Yes | Parent link/invite tests | VERIFIED | Added V5 `students` and `parent_student_links`, minimal `Student` anchor, `ParentStudentLink`, School Admin parent-link API, parent invitation creation, parent child-list/read APIs, parent-child audit events, backend integration tests, and frontend scaffold form/API client. Mobile was not touched. |
| PAR-002 | PHASE 3 | Implement parent leave request flow | P2 | PAR-001 | Yes | Yes | Yes | Maybe | Parent leave tests | NOT_STARTED | Required before paid commercial release. |
| STAFF-001 | PHASE 3 | Add staff/teacher portal-login-required provisioning | P1 | AUTH-001 | Yes | Yes | No | Yes | Staff invite tests | VERIFIED | Added V9 `staff_profiles`, School Admin `POST /v1/school-admin/staff/provision`, portal-login-required `STAFF`/`TEACHER` user creation/reuse, invitation creation, school access grant, audit events, backend provisioning/login/assignment tests, and frontend provisioning scaffold. |
| FEE-001 | PHASE 3 | Complete fee demand/payment/receipt lifecycle | P1 | SEC-006 | Yes | Yes | No | Yes | Payment/receipt/reconciliation tests | VERIFIED | Added V14 `fee_demands` and `fee_payments`, School Admin demand create/list/read/payment APIs, parent linked-child fee list/payment APIs, student own-fee list API, payment status transitions, receipt numbers, fee audit events, cross-school/unlinked-parent/mismatched-demand/overpayment negative tests, and frontend fee lifecycle scaffold. Payment gateway/webhooks, reconciliation, finance role, fee setup, parent/student UI, and mobile flows remain follow-ups. |
| FEE-002 | PHASE 6 | Add finance/accountant role and finance-only portal scope | P1 | FEE-001 | Yes | Yes | Maybe | Maybe | Role/permission tests | NOT_STARTED | Required before paid commercial release. |
| EVT-001 | PHASE 7 | Add transactional outbox architecture | P1 | AUD-001 | Yes | No | No | Yes | Outbox integration tests | VERIFIED | Added V10 `outbox_events`, outbox entity/repository/status/service, idempotent producer keys, lifecycle state transitions, and audit-to-outbox producer wiring. Tests prove audit rows produce pending outbox events in the same flow, secret fields are not emitted, audit/outbox writes roll back together, duplicate producer keys reuse one event, and processing/failed/published transitions persist. Dispatcher/worker remains a follow-up. |
| BULK-001 | PHASE 4 | Implement generic bulk job model | P1 | EVT-001 | Yes | Yes | Maybe | Yes | Bulk job tests | VERIFIED | Added V11 `bulk_jobs`, bulk job entity/repository/service/controller, School Admin create/list/read/cancel APIs with active-school and object-school guards, persisted progress lifecycle methods, `BULK_JOB_CREATED`/`BULK_JOB_CANCELLED` audit events, direct bulk-job outbox events, backend negative tests, and frontend bulk jobs scaffold. Worker processing and student-import integration remain STU-002. |
| REP-001 | PHASE 4 | Replace in-memory report export jobs with durable jobs/files | P1 | BULK-001 | Yes | Yes | Maybe | Yes | Report export tests | VERIFIED | Added V19 `report_export_jobs` and `report_export_files`; report export request/list/read/download APIs; durable `BulkJob` linkage; DB-backed scaffold CSV file storage with size/checksum; student-directory and fee-demand CSV generators; `REPORT_EXPORT_REQUESTED`/`REPORT_EXPORT_COMPLETED` audit events; cross-school read/download denial tests; non-School Admin denial tests; frontend report export scaffold with token forwarding and login-required tests. Object storage, scheduled report workers, reporting read models, mobile UX, and analytics dashboards remain follow-ups; Tenant Admin combined summary/drilldown is covered by MUL-004. |
| ATT-001 | PHASE 4 | Rebuild attendance foundation with route-level school isolation | P0 | CI-001, SEC-006, ACA-002 | Yes | No | No | Yes | Attendance school isolation and teacher assignment tests | VERIFIED | Added V15 `attendance_sessions` and `attendance_records`, School Admin attendance session create/list/read APIs, Teacher attendance session create/list/read APIs, active-school and object-school checks for School Admin, teacher assignment checks for teacher flows, `ATTENDANCE_SUBMITTED` audit coverage, route-level negative tests for cross-school attendance inputs/sessions and unassigned teacher access, and full backend validation. Frontend/mobile attendance UI, parent/student views, edits, QR, staff attendance, and reports remain follow-ups. |
| HOME-001 | PHASE 4 | Rebuild homework foundation with teacher assignment checks | P0 | ATT-001, ACA-002 | Yes | No | No | Yes | Homework school isolation and teacher assignment tests | VERIFIED | Added V16 `homework_assignments` and `homework_submissions`, School Admin homework create/list/read APIs, Teacher homework create/list/read APIs, Parent linked-child homework listing, Student own-homework listing and submission, active-school/object-school checks for School Admin, teacher assignment checks for Teacher, linked-child checks for Parent, own-profile checks for Student, `HOMEWORK_PUBLISHED`/`HOMEWORK_SUBMITTED` audit coverage, and route-level negative tests for cross-school homework, unassigned teacher access, unlinked parent access, and unassigned student submission. Frontend/mobile homework UI, attachments, review/grading, resubmissions, notifications, and reports remain follow-ups. |
| EXAM-001 | PHASE 4 | Rebuild exam/result foundation with audit and publish flow | P0 | HOME-001, ACA-002, AUD-001 | Yes | No | No | Yes | Exam/result publish, audit, and school isolation tests | VERIFIED | Added V17 `exams` and `exam_results`; School Admin exam create/list/read/marks/publish APIs; Teacher assigned-scope exam list/read/marks APIs; Parent linked-child and Student own published-result APIs; `EXAM_CREATED`, `EXAM_MARKS_RECORDED`, and `EXAM_RESULTS_PUBLISHED` audit events; negative tests for School Admin cross-school create/read/record/publish, Teacher unassigned access, Parent unlinked child, Student own-result filtering, and draft-result invisibility. Frontend/mobile exam UX, report cards, grading schemes, retests, analytics, and notifications remain follow-ups. |
| NOTE-001 | PHASE 4 | Rebuild notices foundation with school/tenant targeting | P1 | EXAM-001, SEC-006 | Yes | Maybe | Maybe | Yes | Notice targeting and isolation tests | VERIFIED | Added V18 `notices`; School Admin notice create/list/read/publish APIs; Teacher published-notice listing from assigned school/class scope; Parent linked-child published-notice listing; Student own published-notice listing; optional class/section targeting; `NOTICE_CREATED` and `NOTICE_PUBLISHED` audit events; negative tests for School Admin cross-school create/read/publish, Teacher unassigned-class filtering, Parent unlinked-child denial, Student own-notice filtering, and draft invisibility. Tenant/organisation notices, edit/unpublish lifecycle, notification delivery, frontend notice UX, and mobile notice UX remain follow-ups. |
| MUL-001 | PHASE 5 | Add/align `TENANT_ADMIN` role in frontend/mobile | P1 | ARCH-002 | Maybe | Yes | Yes | No | Route guard tests | VERIFIED | FRONT-AUTH-001 aligns the web role model and recognises `TENANT_ADMIN`; MUL-002 adds the first protected web Tenant Admin school-creation workflow; MUL-003 updates the mobile shell model with backend role codes including `TENANT_ADMIN` and `STAFF`. Broader Tenant Admin workflows remain tracked by CF-006 and later MUL tasks. |
| MUL-002 | PHASE 5 | Add multi-school creation with subscription limit | P1 | ONB-001, MUL-001 | Yes | Yes | Maybe | Yes | Plan limit/school create tests | VERIFIED | Added V20 `tenant_school_limits`, `POST /v1/tenant-admin/schools`, server-derived Tenant Admin tenant scope, school-count limit enforcement, `MAIN`/duplicate-code rejection, Tenant Admin audit actor assertions, spoofed body/header tenant denial coverage, and minimal web Tenant Admin school creation scaffold with Bearer token forwarding. Super Admin subscription assignment, mobile UX, and billing-grade subscriptions remain follow-ups; new-school School Admin grant/invite workflow is covered by MUL-005 and school list/edit/deactivate by MUL-006. |
| MUL-003 | PHASE 5 | Add secure school switching UI/API validation | P1 | SEC-002 | Yes | Yes | Yes | No | Switch school E2E/security tests | VERIFIED | Backend tests prove granted multi-school activation returns a new active-school token context, `/v1/me` hydrates from that token, spoofed body/query tenant/school/role data does not override server checks, malformed cross-tenant grants are ignored for initial active-school selection, and activation audit rows use authenticated actor/selected school. Web tests prove single-school auto-activation, multi-school selection/token storage, and denied activation error handling. Mobile shell model now lists backend role codes and switch-ready roles. Live browser E2E and full mobile auth screens remain follow-ups. |
| MUL-004 | PHASE 5 | Add combined tenant reports with school-safe drilldown | P2 | REP-001, MUL-003 | Yes | Yes | No | No | Report authorization tests | VERIFIED | Added `GET /v1/tenant-admin/reports/summary` and `GET /v1/tenant-admin/reports/schools/{schoolId}/summary`; Tenant Admin tenant scope is server-derived; cross-tenant school drilldown, unauthenticated callers, non-Tenant Admin callers, and spoofed tenant headers are rejected; minimal web Tenant Admin reports scaffold forwards Bearer auth and handles login-required state. Rich reporting read models, charts, exports, mobile report UX, and broader Tenant Admin portal workflows remain follow-ups. |
| MUL-005 | PHASE 5 | Add Tenant Admin School Admin invitation/access grant workflow | P1 | MUL-002, AUTH-001 | Yes | Yes | No | No | School Admin invite/grant authorization tests | VERIFIED | Added `POST /v1/tenant-admin/schools/{schoolId}/admins/invite`; Tenant Admin tenant scope is server-derived; same-tenant `SCHOOL_ADMIN` users are created/reused; `user_school_access` is granted; standard invitation/set-password flow activates the user; cross-tenant school assignment, non-Tenant Admin callers, spoofed tenant headers, and conflicting same-tenant user roles are rejected; audit rows record authenticated Tenant Admin actor without raw invitation token. Minimal web invite form forwards Bearer auth and handles login-required state. School/admin management is covered by MUL-006; richer Tenant Admin UX remains a follow-up. |
| MUL-006 | PHASE 5 | Add Tenant Admin school management and School Admin grant management workflow | P1 | MUL-005 | Yes | Yes | No | No | School/admin management authorization and audit tests | VERIFIED | Added `GET /v1/tenant-admin/schools`, `PATCH /v1/tenant-admin/schools/{schoolId}`, `POST /v1/tenant-admin/schools/{schoolId}/deactivate`, `GET /v1/tenant-admin/schools/{schoolId}/admins`, `POST /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation`, and `DELETE /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access`; Tenant Admin tenant scope is server-derived; cross-tenant schools/users are rejected; primary school deactivation and last-admin revoke are blocked; audit rows record authenticated Tenant Admin actor without raw invitation token. Minimal web management panel forwards Bearer auth and handles login-required state. Tenant settings/usage is covered by MUL-007; production email delivery and mobile UX remain follow-ups. |
| MUL-007 | PHASE 5 | Add Tenant Admin tenant settings and subscription usage workflow | P1 | MUL-006 | Yes | Yes | No | Yes | Settings/usage authorization and audit tests | VERIFIED | Added V21 `tenant_settings`, `GET/PATCH /v1/tenant-admin/settings`, and `GET /v1/tenant-admin/subscription/usage`; Tenant Admin tenant scope is server-derived; spoofed body tenant fields and spoofed tenant headers cannot change/read another tenant; usage counts schools/admins/teachers/staff/students from backend repositories; settings updates write authenticated audit rows with raw email addresses masked. Minimal web settings/usage panel forwards Bearer auth and handles login-required state. Plan catalog, Super Admin subscription assignment, invoices/billing, feature entitlements, organisation branding, polished navigation, and mobile UX remain follow-ups. |
| AI-001 | PHASE 7 | Define AI entitlement and audit model | P2 | EVT-001, SEC-006 | Yes | Yes | Maybe | Yes | AI scope/usage tests | NOT_STARTED | Future scale/AI enhancement. |
| AI-002 | PHASE 7 | Enforce scoped AI/RAG retrieval by role and school | P2 | AI-001 | Yes | Yes | Maybe | Maybe | Prompt injection and scope tests | NOT_STARTED | Future scale/AI enhancement. |
| SCALE-001 | PHASE 8 | Document cell migration architecture | P2 | EVT-001 | Yes | No | No | No | ADR review | NOT_STARTED | Future scale/AI enhancement. |
| SCALE-002 | PHASE 8 | Add tenant registry/cell assignment design | P3 | SCALE-001 | Yes | No | No | Yes | Migration tests later | DEFERRED | Do not implement too early. |
| CI-001 | PHASE 6 | Recreate CI for backend/frontend/mobile scaffold | P0 | STRUCT-002, FRONT-AUTH-001 | Yes | Yes | Yes | No | CI workflow plus local command validation | VERIFIED | Added `.github/workflows/ci.yml` with backend Maven tests, frontend npm install/tests/typecheck/build, and mobile npm install/typecheck/tests. Workflow YAML parses locally; all job commands passed locally. Lint/security/deploy jobs remain separate follow-ups. |
| OPS-001 | PHASE 6 | Add lint/static-analysis policy to CI | P2 | CI-001 | No | Yes | Yes | No | CI lint/typecheck | NOT_STARTED | Current scaffold has no frontend/mobile lint script; CI-001 intentionally gates build/typecheck/tests only. |
| OPS-002 | PHASE 6 | Wire staging deploy and production secrets/alerts | P1 | OPS-001 | Yes | Yes | Maybe | No | Deploy smoke tests | NOT_STARTED | Required before pilot. |
| DOC-001 | PHASE 0 | Keep legacy docs merged into this file only | P2 | ARCH-003 | No | No | No | No | Tracked docs check | VERIFIED | Current docs inventory contains this master Markdown file only; this recheck labels historical content and updates overclaimed task statuses. |

Recommended next implementation task: Super Admin subscription assignment and billing-grade plan catalog foundation, or move to `AI-001` if product priority shifts to intelligence features. `SEC-002` remains the standing security gate to strengthen alongside each rebuilt school-scoped module.

## 26. Validation Dashboard

| Validation Area | Command / Method | Last Result | Date | Evidence / Notes |
|---|---|---|---|---|
| Backend Build | `cd backend && mvn -q test` | PASS | 2026-05-26 | Spring Boot 3.5.14 scaffold compiles and tests with Flyway V1-V21 and env-configurable H2 datasource defaults. |
| Backend Tests | `cd backend && mvn -q test` | PASS | 2026-05-26 | Surefire reports 117 tests, 0 failures, 0 errors: context/readiness plus onboarding, invitation acceptance, `MAIN` rejection, school-access grant, token reuse, invalid token rejection, expired token rejection without activation, authenticated onboarding audit assertions, tenant context spoofing, Tenant Admin school creation with school-limit guardrails, Tenant Admin school list/update/deactivate and School Admin invite/grant/list/resend/revoke authorization coverage, Tenant Admin settings/update/subscription usage authorization coverage, Tenant Admin combined report/drilldown authorization coverage, secure multi-school activation, malformed cross-tenant grant filtering, School Admin cross-school denial coverage, hard-coded `MAIN` school-resolution regression coverage, SEC-006 school-scoped controller guard coverage, AUD-001 mutation audit coverage matrix, EVT-001 transactional outbox coverage, BULK-001 durable bulk job coverage, STU-002 queued student import job coverage, STU-003 student login provisioning/self-profile coverage, FEE-001 fee demand/payment/receipt lifecycle coverage, ATT-001 attendance route isolation/teacher-assignment coverage, HOME-001 homework route isolation/teacher-assignment/parent-student visibility coverage, EXAM-001 exam/result publish/isolation/parent-student visibility coverage, NOTE-001 notice targeting/isolation/parent-student visibility coverage, REP-001 durable report export/job/file coverage, AUTH-002 login/current-user/school activation security coverage, AUTH-003 refresh/logout/password lifecycle coverage, AUTH-004 MFA/rate-limit coverage, AUTH-005/SEC-004 Super Admin onboarding authorization coverage, SEC-001 Tenant A to Tenant B object-spoofing coverage, PAR-001 parent-child linking/invitation/access coverage, STAFF-001 staff/teacher provisioning coverage, ACA-001 academic lifecycle coverage, ACA-002 academic assignment/teacher assignment coverage, and STU-001 student import validation coverage. |
| Frontend Build | `cd frontend && npm run build` | PASS | 2026-05-26 | React/Vite shell builds successfully with auth state provider, current-user/school hydration, protected Super Admin/Tenant Admin/School Admin panels, school selector with single-school auto-activation/multi-school activation handling, authenticated Super Admin onboarding, Tenant Admin school creation/admin-invite/management/report/settings scaffolds, invitation acceptance, login/MFA panel, School Admin parent-link scaffold, School Admin staff provisioning scaffold, School Admin academic setup scaffold, School Admin academic assignment scaffold, School Admin student import scaffold with queued-job and student-login invitation actions, School Admin bulk jobs scaffold, School Admin fee lifecycle scaffold, and School Admin report export scaffold. |
| Frontend Lint | Not configured in STRUCT-002 | NOT_RUN | 2026-05-26 | Minimal scaffold includes build/typecheck/test only; add lint with CI task. |
| Frontend Typecheck | `cd frontend && npm run typecheck` | PASS | 2026-05-26 | TypeScript no-emit check passes with auth state provider, role guards, school selector, Tenant Admin school creation/admin-invite/management/report/settings scaffolds, bulk jobs scaffold, queued student import/student-login invitation actions, fee lifecycle scaffold, and report export scaffold. |
| Frontend Tests | `cd frontend && npm test -- --run` | PASS | 2026-05-26 | 49 Vitest tests pass across app shell auth guards, invalid-token clearing, role alignment, school activation, single-school auto-activation, denied school activation handling, authenticated Super Admin onboarding token forwarding/login-required state, Tenant Admin school creation token forwarding/login-required state, Tenant Admin School Admin invite token forwarding/login-required state, Tenant Admin school/admin management token forwarding/login-required state, Tenant Admin report summary/drilldown token forwarding/login-required state, Tenant Admin settings/usage token forwarding/login-required state, invitation acceptance, login token storage/auth-state registration, MFA challenge handling before token storage, parent-link token forwarding/login-required state, staff provisioning token forwarding/login-required state, academic setup token forwarding/login-required state, academic assignment token forwarding/login-required state, student import validate/import/queue/student-login invitation token forwarding/login-required state, bulk jobs create/list/cancel token forwarding/login-required state, fee lifecycle token forwarding/login-required state, and report export request/list/download token forwarding/login-required state. |
| Frontend Auth Routing Tests | `cd frontend && npm test -- --run App LoginPage authApi`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | FRONT-AUTH-001 plus MUL-003 verified: focused app auth tests pass with 13 tests; full frontend suite now passes with 49 tests after MUL-007. Coverage verifies frontend role list alignment, unauthenticated protected-route denial, invalid stored-token clearing, `SUPER_ADMIN` onboarding access, `SCHOOL_ADMIN` scaffold access, `SCHOOL_ADMIN` denial from Super Admin onboarding, `TEACHER`/`PARENT`/`STUDENT`/`STAFF` denial from admin-only panels, `TENANT_ADMIN` recognition, selected-school activation API/token handling, single-school auto-activation, activation-denied error handling, login token storage, MFA checkpoint behavior, auth-state notification after login completion, Tenant Admin reports panel access, Tenant Admin School Admin invite form behavior, Tenant Admin school/admin management behavior, and Tenant Admin settings/usage panel access. |
| CI Workflow | `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/ci.yml')"`; `cd backend && mvn -B test`; `cd frontend && npm ci`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build`; `cd mobile && npm ci`; `cd mobile && npm run typecheck`; `cd mobile && npm test` | PASS | 2026-05-26 | CI-001 verified: `.github/workflows/ci.yml` parses as YAML and defines backend, frontend, and mobile jobs using Java 21 and Node 24. CI-001 originally passed with backend 87 tests, frontend 33 tests, and mobile 1 shell-model test. Current local command coverage now passes with backend 117 tests and frontend 49 tests after MUL-007; mobile remained at 2 tests after MUL-003 and was not touched for MUL-007. |
| Mobile Typecheck | `cd mobile && npm run typecheck` | PASS | 2026-05-26 | Expo/React Native TypeScript shell passes with backend role codes and school-switching readiness markers in the shell model. |
| Mobile Tests | `cd mobile && npm test` | PASS | 2026-05-26 | 2 Vitest shell-model tests pass, including backend role coverage and switch-ready role coverage. |
| Folder Scaffold | `find backend frontend mobile infra docs scripts tests .github -type d`; `find ... -name '.gitkeep'` | PASS | 2026-05-26 | Current scaffold has 264 directories and 209 `.gitkeep` placeholders. |
| Backend Package Dependency Scan | `cd backend && jdeps -q -recursive -verbose:package target/classes \| rg 'com\\.cloudcampus'` | PASS/PARTIAL | 2026-05-26 | Compiled classes show expected scaffold dependencies among audit, common, identity, platform tenant/onboarding, and school packages. No automated architectural cycle rule exists yet. |
| Docker Startup | `find infra/docker -type f ! -name '.gitkeep'` | BLOCKED | 2026-05-26 | Current scaffold has no Docker Compose or Dockerfile manifests. |
| API Smoke Tests | `cd backend && mvn -q test` | PARTIAL | 2026-05-26 | MockMvc covers readiness, SUPER_ADMIN-protected tenant onboarding, TENANT_ADMIN school creation with limit checks, TENANT_ADMIN School Admin invite/access grant, TENANT_ADMIN school/admin management, TENANT_ADMIN settings/update/subscription usage, TENANT_ADMIN report summary and school drilldown, invitation acceptance, login, MFA verification, current user, school list, school activation, secure multi-school activation, parent-link creation, parent child list/read, staff/teacher provisioning, academic year create/list/activate, class create/list, section create/list, subject create/list, class-subject create/list, teacher assignment create/list/filter, teacher own-assignment list/filter, student import template/validate/import/list/queue-job/read-job, student login invitation, student self-profile, bulk job create/list/read/cancel, fee demand create/list/read/payment, parent linked-child fee list/payment, student own-fee list, attendance session create/list/read for School Admin and Teacher, homework create/list/read for School Admin and Teacher, parent linked-child homework list, student own-homework list/submission, exam create/list/read/marks/publish for School Admin and Teacher, parent linked-child results, student own results, notice create/list/read/publish for School Admin, teacher notice list, parent linked-child notice list, student own notice list, report export request/list/read/download for School Admin, reserved `MAIN` rejection, invitation/login/MFA/onboarding/tenant-school/tenant-admin-invite/tenant-admin-settings/tenant-report/staff/academic/student/bulk/fee/attendance/homework/exam/notice/report authorization negative cases, authenticated onboarding/tenant-school/tenant-admin-invite/tenant-admin-settings/parent-link/staff/academic/student/bulk/fee/attendance/homework/exam/notice/report/auth-session audit persistence, spoofed tenant/school header rejection, and internal queued student import/report processing through service-level worker methods. Live server smoke and several school business APIs do not exist yet. |
| Auth Session Tests | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build`; `cd mobile && npm test`; `cd mobile && npm run typecheck` | PASS | 2026-05-26 | AUTH-002/AUTH-003/AUTH-004 plus SEC-001 and MUL-003 coverage verified with 20 backend auth-session tests, 39 frontend tests, and 2 mobile shell-model tests. Signed token login after MFA, server-derived identity, active school context, school list, same-tenant multi-school switching, unassigned/cross-tenant activation denial, wrong password, inactive user, spoofing cases, refresh rotation, logout revocation, reset password, change-password, MFA wrong-code/reuse rejection, login rate limiting, tenant-claim mismatch rejection, malformed cross-tenant grant filtering, auth-session audit assertions, web school selector behavior, and mobile switch-ready role coverage pass. |
| School Switching Tests | `cd backend && mvn -q -Dtest=AuthSessionFlowTest test`; `cd frontend && npm test -- --run App`; `cd mobile && npm test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build`; `cd mobile && npm run typecheck` | PASS | 2026-05-26 | MUL-003 verified: backend multi-school activation lists granted schools, activates a secondary school, returns an updated active-school token context, hydrates `/v1/me` from that token, ignores body/query spoofing noise, records selected-school audit metadata, and filters malformed cross-tenant grants from initial active-school selection. Web tests cover single-school auto-activation, multi-school selection/token storage, and denied activation handling. Mobile tests cover backend role codes and switch-ready role coverage. |
| Audit Coverage Tests | `cd backend && mvn -q -Dtest=AuthSessionFlowTest,AuditCoverageMatrixTest,TenantOnboardingFlowTest test`; `cd backend && mvn -q -Dtest=TenantAdminSchoolManagementFlowTest,AuditCoverageMatrixTest test`; `cd backend && mvn -q -Dtest=TenantAdminSettingsFlowTest,AuditCoverageMatrixTest test`; `cd backend && mvn -q -Dtest=ExamFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q -Dtest=NoticeFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q -Dtest=ReportExportFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test` | PASS | 2026-05-26 | AUD-001 plus MUL-007/REP-001 verified: invitation acceptance, MFA challenge create/verify, refresh rotation, logout, password reset request/completion, change-password, school context activation, Tenant Admin additional-school creation, Tenant Admin school update/deactivation, Tenant Admin-created School Admin invitation/access grant/resend/revoke, Tenant Admin settings update, bulk job create/cancel, student import job queueing, student login enable/invitation, exam creation, exam marks recording, exam result publication, notice creation/publication, report export request, and report export completion write audit rows with authenticated actors and without raw secret material, raw invitation tokens, raw tenant settings emails, raw marks, notice title/body, user-supplied report file names, generated report content, or spoofed tenant ids from school-creation/admin-invite/settings requests. `AuditCoverageMatrixTest` inventories all current mutation controllers and verifies mapped services use `auditLogService.record` with typed `AuditAction` values. |
| Transactional Outbox Tests | `cd backend && mvn -q -Dtest=TransactionalOutboxFlowTest test`; `cd backend && mvn -q test` | PASS | 2026-05-26 | EVT-001 verified: Flyway V10 creates `outbox_events`; onboarding audit rows create matching pending `AuditLogRecorded` outbox events; payloads exclude raw invitation tokens and secret fields; audit/outbox rows roll back together on transaction failure; idempotent producer keys reuse one event; processing/failed/published lifecycle transitions persist. |
| Bulk Job Tests | `cd backend && mvn -q -Dtest=BulkJobFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | BULK-001 verified: Flyway V11 creates `bulk_jobs`; School Admin can create/list/read/cancel durable jobs; School Admin A cannot read/cancel School B jobs; non-School Admin callers are rejected; lifecycle progress persists and terminal states reject further progress; audit/outbox payloads avoid raw file-reference leakage; frontend bulk jobs scaffold requires and forwards Bearer auth. |
| Report Export Tests | `cd backend && mvn -q -Dtest=ReportExportFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run App ReportExportsPage`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | REP-001 verified: Flyway V19 creates `report_export_jobs` and `report_export_files`; School Admin can request/list/read/download durable report exports; generated student-directory and fee-demand CSV files persist with checksum/size; download is denied until completion; School Admin A cannot read/download School B exports; non-School Admin callers are rejected; audit rows avoid generated report content and user-supplied file names; frontend report exports scaffold forwards Bearer auth and handles login-required state. |
| Tenant Admin Report Tests | `cd backend && mvn -q -Dtest=TenantAdminReportSummaryFlowTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run TenantReportsPage App`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | MUL-004 verified: Tenant Admin can read combined tenant summary and same-tenant school drilldown; metrics aggregate current student and fee data; unauthenticated callers, non-Tenant Admin callers, spoofed tenant headers, and cross-tenant school drilldown are rejected; frontend Tenant Admin reports scaffold forwards Bearer auth for summary/drilldown and handles login-required state. |
| Tenant Admin School Management Tests | `cd backend && mvn -q -Dtest=TenantAdminSchoolManagementFlowTest,AuditCoverageMatrixTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run TenantSchoolManagementPage TenantSchoolCreationPage App`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | MUL-002/MUL-005/MUL-006 verified: Tenant Admin can create additional schools within school-count limits, list/update/deactivate same-tenant schools, invite/list/resend/revoke School Admin access for same-tenant schools, grant `user_school_access`, activate the invited admin through the standard invitation flow, and write authenticated audit rows without raw invitation token. Limit, reserved `MAIN`, duplicate school code, primary-school deactivation, last-admin revoke, cross-tenant school/user management, non-Tenant Admin caller, spoofed tenant header, active-user resend, and conflicting existing-user role cases are rejected. Frontend Tenant Admin school creation/admin-invite/management scaffold forwards Bearer auth and handles login-required state. |
| Tenant Admin Settings and Usage Tests | `cd backend && mvn -q -Dtest=TenantAdminSettingsFlowTest,AuditCoverageMatrixTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run TenantSettingsPage App`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | MUL-007 verified: Tenant Admin can read default tenant settings, update same-tenant settings, and view server-derived usage counts for schools, School Admins, teachers, staff, and students. Body tenant spoofing does not create/update another tenant's settings; spoofed tenant headers, unauthenticated callers, and non-Tenant Admin callers are rejected. Audit rows contain authenticated Tenant Admin actor and do not contain raw tenant settings emails or spoofed tenant ids. Frontend Tenant Admin settings/usage scaffold forwards Bearer auth and handles login-required state. |
| Student Import Job Tests | `cd backend && mvn -q -Dtest=StudentImportJobFlowTest,StudentImportFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | STU-002 verified: Flyway V12 creates `student_import_jobs`; School Admin can queue and read import jobs; students are not inserted until the internal processor runs; valid rows import, invalid rows persist validation errors and progress counts; partial completion is recorded with an error reference; School Admin A cannot queue using School B class/section ids; audit rows avoid student names; direct bulk-job outbox events are produced; frontend student import scaffold can queue jobs with Bearer auth. |
| Student Login Provisioning Tests | `cd backend && mvn -q -Dtest=StudentLoginProvisioningFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | STU-003 verified: Flyway V13 adds `students.user_id`; School Admin can invite an existing student profile to login; standard invitation acceptance activates the `STUDENT` user; login returns server-derived role/tenant/active school; `GET /v1/student/profile` returns the linked profile; cross-school provisioning, non-student existing email, and non-School Admin callers are rejected; audit rows avoid raw invitation tokens; frontend student scaffold forwards Bearer auth. |
| Fee Lifecycle Tests | `cd backend && mvn -q -Dtest=FeeLifecycleFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run typecheck`; `cd frontend && npm run build` | PASS | 2026-05-26 | FEE-001 verified: Flyway V14 adds `fee_demands` and `fee_payments`; School Admin can create/list/read demands and record payments; parent can view/pay only linked child's demand; student can view own demands; payments update partial/paid state and issue receipts; School Admin A cannot create/read/pay School B demand; parent unlinked/mismatched demand access and overpayment are rejected; audit rows avoid raw gateway references; frontend fee scaffold forwards Bearer auth. |
| Super Admin Onboarding Authorization | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | PASS | 2026-05-26 | AUTH-005/SEC-004 verified: unauthenticated onboarding is rejected, `SCHOOL_ADMIN`, `TENANT_ADMIN`, `TEACHER`, `STAFF`, `PARENT`, and `STUDENT` are rejected, `SUPER_ADMIN` succeeds, spoofed role/tenant/user data does not elevate privileges, audit actor rows contain the authenticated Super Admin, and frontend onboarding sends Bearer auth. |
| Tenant Isolation Tests | `cd backend && mvn -q test` | PASS | 2026-05-26 | SEC-001/MUL-003 coverage verifies client-supplied tenant/school context headers are rejected before mutation, spoofed body `tenantId` is ignored, login body `tenantId`/`schoolId`/`role` is not trusted, `/v1/me` returns server-derived tenant/role despite spoofed query parameters, Tenant A cannot activate Tenant B school via URL/query/body spoofing, signed token tenant-claim mismatch is rejected, malformed cross-tenant school grants do not leak through current-user or school-list APIs, and malformed cross-tenant grants are not used as login-time initial active-school context. |
| School Isolation Tests | `cd backend && mvn -q test` | PARTIAL | 2026-05-26 | SEC-002 verifies School Admin access is allowed only for explicitly granted schools and denied for unassigned same-tenant and cross-tenant schools at service level. PAR-001 adds route-level denial for School Admin A attempting to link a parent to Tenant/School B student. STAFF-001 adds active-school staff/teacher provisioning guard coverage and non-admin denial. ACA-001 adds route-level denial for School Admin A attempting to create class/section records from Tenant/School B academic objects. ACA-002 adds route-level denial for Tenant/School B subject/class-subject/teacher assignment objects and teacher unassigned class access. STU-001 adds route-level denial for School B class/section ids in student import. BULK-001 adds route-level denial for School Admin A reading/cancelling School B bulk jobs. STU-002 adds route-level denial for queueing student imports with School B class/section ids. STU-003 adds route-level denial for provisioning login for School B student and self-profile access through authenticated linked `STUDENT` user. FEE-001 adds route-level denial for School Admin A creating/reading/paying School B fee demands, and parent/student fee routes resolve linked-child/own-student state. ATT-001 adds route-level denial for School Admin A submitting/reading School B attendance data and Teacher unassigned class attendance. HOME-001 adds route-level denial for School Admin A creating/reading School B homework, Teacher unassigned homework, Parent unlinked-child homework, and Student unassigned homework submission. EXAM-001 adds route-level denial for School Admin A creating/reading/recording/publishing School B exams/results, Teacher unassigned exam/result access, Parent unlinked-child results, Student own-result filtering, and draft-result invisibility. NOTE-001 adds route-level denial for School Admin A creating/reading/publishing School B notices, Teacher unassigned notice filtering, Parent unlinked-child denial, Student own-notice filtering, and draft-notice invisibility. REP-001 adds route-level denial for School Admin A reading/downloading School B report exports and non-School Admin report requests. SEC-006 adds negative central-guard coverage across student, staff, fees, payments, attendance, homework, exams, results, notices, timetable, documents, reports, and website content object types. Most remaining route-level product tests are blocked until those controllers are rebuilt. |
| Parent-Child Linking Tests | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | PASS | 2026-05-26 | PAR-001 verified: School Admin can create/reuse parent by email, inactive parent receives invitation, parent accepts and logs in, parent sees only linked children, unlinked child read is denied, School Admin A cannot link a Tenant/School B student, audit rows include authenticated actor and exclude raw invitation token, and frontend sends Bearer auth. |
| Staff Provisioning Tests | `cd backend && mvn -q -Dtest=StaffProvisioningFlowTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | PASS | 2026-05-26 | STAFF-001 verified: School Admin can provision portal-login-required `TEACHER`/`STAFF` users, create staff profile and school access, return one-time invitation, teacher accepts/login with server-derived school context, provisioned teacher can be assigned and list assignments, unsafe roles/profile-only requests/duplicate employee number/non-admin callers are rejected, audit rows exclude raw invitation token, and frontend sends Bearer auth. |
| Academic Lifecycle Tests | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | PASS | 2026-05-26 | ACA-001 verified: School Admin can create/list/activate academic years, previous active year is closed, class and section create/list work, invalid dates are rejected, cross-school academic year/class ids are denied, audit rows include authenticated actor, and frontend sends Bearer auth. |
| Academic Assignment Tests | `cd backend && mvn -q -Dtest=AcademicAssignmentFlowTest test`; `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | PASS | 2026-05-26 | ACA-002 verified: School Admin can create/list subjects, assign subject to class, assign active same-tenant teacher, list assignments, teacher can list own assignments, teacher unassigned class filter is denied, cross-school subject/class/assignment objects are denied, non-teacher and cross-tenant teacher assignment attempts are rejected, audit rows include authenticated actor, and frontend sends Bearer auth. |
| Student Import Tests | `cd backend && mvn -q test`; `cd frontend && npm test -- --run`; `cd frontend && npm run build` | PASS | 2026-05-26 | STU-001/STU-002/STU-003 verified: School Admin can fetch template, validate rows, import students into active-school class/section, list imported students, queue durable import jobs, read job status, process queued jobs through the internal worker entry point, and invite optional student logins; validation catches required/duplicate/existing/date/email errors, queued partial failures persist row-level errors, cross-school class/section/student ids are denied, audit rows include authenticated actor without student names or raw invitation tokens, and frontend sends Bearer auth. |
| School-Scoped Controller Guard Coverage | `rg -n "@RestController|@Controller|@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@PatchMapping|@DeleteMapping" backend/src/main/java`; `cd backend && mvn -q test` | PARTIAL | 2026-05-26 | Current rebuilt guarded school-scoped controllers include PAR-001 parent child read routes, STAFF-001 staff provisioning route, ACA-001 academic year/class/section routes, ACA-002 subject/class-subject/teacher assignment routes, STU-001/STU-002 student import/list/import-job routes, STU-003 student login/self-profile routes, BULK-001 bulk job routes, FEE-001 fee demand/payment routes, ATT-001 attendance routes, HOME-001 homework routes, EXAM-001 exam/result routes, NOTE-001 notice routes, and REP-001 report export routes. No timetable/document/website business controller exists. `SchoolScopedControllerGuardCoverageTest` fails future school-scoped controllers that lack an approved backend guard marker. |
| Attendance Tests | `cd backend && mvn -q -Dtest=AttendanceFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test` | PASS | 2026-05-26 | ATT-001 verified: Flyway V15 adds attendance sessions/records; School Admin can create/list/read attendance for active-school class/section/subject/students; School Admin A cannot use School B class/subject/student ids or read School B attendance sessions; assigned Teacher can create/read attendance; Teacher unassigned class access is denied; `ATTENDANCE_SUBMITTED` audit coverage and school-scoped controller guard coverage pass. |
| Homework Tests | `cd backend && mvn -q -Dtest=HomeworkFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test` | PASS | 2026-05-26 | HOME-001 verified: Flyway V16 adds homework assignments/submissions; School Admin and Teacher homework routes enforce active-school/object-school and assignment checks; Parent homework requires linked child; Student homework resolves own linked profile and rejects unassigned homework submission; duplicate submission is rejected; `HOMEWORK_PUBLISHED`/`HOMEWORK_SUBMITTED` audit coverage and school-scoped controller guard coverage pass. |
| Exam/Result Tests | `cd backend && mvn -q -Dtest=ExamFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test` | PASS | 2026-05-26 | EXAM-001 verified: Flyway V17 adds exams/results; School Admin can create/list/read/record/publish exams/results for active-school objects; Teacher can list/read/record marks only for assigned class-subject scope; Parent and Student see only published linked/own results; draft results are hidden; School Admin cross-school create/read/record/publish, Teacher unassigned access, Parent unlinked child, and Student other-result access are denied; exam audit coverage and school-scoped controller guard coverage pass. |
| Notice Tests | `cd backend && mvn -q -Dtest=NoticeFlowTest,AuditCoverageMatrixTest,SchoolScopedControllerGuardCoverageTest test`; `cd backend && mvn -q test` | PASS | 2026-05-26 | NOTE-001 verified: Flyway V18 adds notices; School Admin can create/list/read/publish notices for active-school scope; Teacher can list published notices only for assigned school/class scope; Parent and Student see only published linked/own notices; drafts are hidden; School Admin cross-school create/read/publish, Teacher unassigned-class filtering, Parent unlinked child, and Student own class/section filtering are covered; notice audit coverage and school-scoped controller guard coverage pass. |
| Hard-coded `MAIN` School Resolution | `rg -n --hidden -i "\\bMAIN\\b|resolveMainSchool|resolveSchool|defaultSchool|primary school fallback|primary.*school.*fallback|hard-coded school|hardcoded school|school code assumption|school code" ...`; `cd backend && mvn -q test` | PASS | 2026-05-26 | Current scaffold has no active business logic depending on hard-coded `MAIN`. Safe references are onboarding rejection, tests, docs, and lowercase entrypoint false positives. `HardCodedMainSchoolResolutionTest` enforces this for backend business sources. |
| Security Scan | `.github/workflows` inventory | BLOCKED | 2026-05-26 | Current scaffold has only `.github/workflows/.gitkeep`; recreate scans after manifests exist. |
| Dependency Scan | `cd frontend && npm audit --omit=dev`; `cd mobile && npm audit --omit=dev` | PARTIAL | 2026-05-26 | Frontend production audit: 0 vulnerabilities. Mobile Expo 56 production audit: 10 moderate transitive advisories, 0 high, 0 critical; npm suggests a breaking downgrade, so this remains an OPS/security follow-up. |
| Backup/Restore Test | `find infra/backup -type f ! -name '.gitkeep'` | BLOCKED | 2026-05-26 | Current scaffold has backup folder placeholder only. |
| Performance Smoke Test | `find tests/performance infra/load-tests -type f ! -name '.gitkeep'` | BLOCKED | 2026-05-26 | Current scaffold has performance/load-test folder placeholders only. |
| Tracked docs inventory | `git ls-files | rg -i '\\.(md|txt)$' || true` before creating this file | PASS | 2026-05-26 | No tracked Markdown/TXT files existed before this master file. |
| Working tree safety | `git status -sb` before creating this file | PASS | 2026-05-26 | Branch was clean before creating this file. |
| Master Plan Recheck | Section, task, label, and scaffold validation review | PASS | 2026-05-26 | Rechecked completed/verified tasks; added verification table; labelled historical implementation inventory to avoid reading deleted legacy code as current capability; updated SEC-003/CF-004, SEC-006/CF-005, AUTH-002 login/session foundation, AUTH-003 refresh/session lifecycle, AUTH-004 MFA/rate-limit scaffold, AUTH-005/SEC-004 Super Admin onboarding protection, SEC-001 authenticated tenant object-spoofing coverage, PAR-001 parent-child linking foundation, STAFF-001 staff/teacher provisioning foundation, ACA-001 academic lifecycle foundation, ACA-002 academic assignment foundation, STU-001 student import validation foundation, FEE-001 fee lifecycle foundation, FRONT-AUTH-001 frontend auth/routing/school activation foundation, CI-001 backend/frontend/mobile scaffold CI, ATT-001 attendance foundation, HOME-001 homework foundation, and EXAM-001 exam/result foundation after validation. |

Historical validation evidence from the pre-cleanup codebase: backend compile passed, backend tests passed with 250 tests, frontend build passed, frontend lint failed on an existing hook rule, and mobile typecheck passed. Current scaffold validation supersedes those results for implementation planning: `STRUCT-002` is now verified, but it intentionally does not include product features, authentication, database schema, tenant onboarding, or school isolation behavior.

## 27. Agent Working Protocol for Future Sessions

1. Always read docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md before making changes.
2. Select only one task approved by the user.
3. Inspect existing related code before editing.
4. Do not make unrelated changes.
5. Preserve backward compatibility unless task explicitly requires migration.
6. Add/update tests for every behaviour change.
7. Run relevant build/test/validation commands.
8. Update task status and evidence in the master file.
9. Report files changed, validations run, failures and next task.
10. Stop after one completed task unless user explicitly asks to continue.
