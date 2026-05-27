# CloudCampus Backend API Inventory

Date: 2026-05-28

This inventory maps the current backend controller surface to security scope, frontend consumers, and audit/test posture. All protected `/v1/**` APIs derive user, role, tenant, and active school from the authenticated backend context. Client tenant/school headers are blocked by the spoofing filter.

## Inventory

| Area | Endpoint Family | Role Required | Tenant Scope | School Scope | Request/Response DTO | Pagination | Audit Logging | Frontend Consumer | Test Coverage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Auth | `POST /v1/auth/login`, `/mfa/verify`, `/refresh`, `/forgot-password`, `/reset-password`; `/v1/me*` | Public or authenticated user | Server-derived after auth | Server-derived active school | Auth/session DTOs | N/A | Login/session/password audit where relevant | `authApi.ts`, `authState.tsx` | Auth/session tests | Refresh retry exists in shared client; device management is future work. |
| Invitations | `POST /v1/invitations/accept` | Public invitation token | Token-derived | Token-derived where applicable | Invitation DTOs | N/A | Invitation/user activation audit | `invitationsApi.ts` | Invitation flow tests | Raw tokens are not logged. |
| Super Admin Onboarding | `POST /v1/super-admin/tenants/onboard` | `SUPER_ADMIN` | Platform | Creates first real school | Onboarding DTOs | N/A | Yes | `onboardingApi.ts`, `TenantOnboardingPage` | Onboarding/security tests | Protected from role/header spoofing. |
| Super Admin Control | `/v1/super-admin/tenants*`, `/schools*`, `/revenue/*`, `/ai/*`, `/reports/*`, `/audit-logs`, `/platform-health`, `/notifications/*`, `/settings` | `SUPER_ADMIN` | Platform | N/A unless reporting school metadata | Safe platform DTOs | Yes for list endpoints | Mutations audited | `platformApi.ts`, `SuperAdminPlatformPage` | SuperAdminPlatformControl tests | Secrets/tokens/prompts are redacted or omitted. |
| Super Admin Subscriptions | `/v1/super-admin/subscriptions/plans*`, `/tenants/{tenantId}`, `/invoices` | `SUPER_ADMIN` | Platform | N/A | Subscription DTOs | Invoice list not huge in scaffold | Mutations audited | `platformApi.ts` | Subscription tests | Payment collection remains scaffold/internal. |
| Dashboard Summaries | `/v1/{role}/dashboard/summary` | Matching role | Server-derived | Active/linked/assigned school as applicable | Dashboard summary DTO | N/A | Read-only | `dashboardApi.ts` | Portal/dashboard tests | Replaces fake dashboard metrics. |
| Tenant Admin Schools/Admins | `/v1/tenant-admin/schools*` | `TENANT_ADMIN` | Actor tenant | Tenant school objects only | Tenant school/admin DTOs | List currently unpaginated | Mutations audited | `tenantSchoolsApi.ts` | Tenant Admin tests | School limit and cross-tenant guards exist. |
| Tenant Admin Reports | `/v1/tenant-admin/reports/*` | `TENANT_ADMIN` | Actor tenant | Tenant-owned school drilldown | Report DTOs | N/A | Read-only | `tenantReportsApi.ts` | Tenant report tests | Export UX is future work. |
| Tenant Settings/Usage | `/v1/tenant-admin/settings`, `/subscription/usage` | `TENANT_ADMIN` | Actor tenant | N/A | Settings/usage DTOs | N/A | Settings mutation audited | `tenantSettingsApi.ts` | Tenant settings tests | Branding storage is future work. |
| School Settings | `GET/PATCH /v1/school-admin/settings` | `SCHOOL_ADMIN` | Actor tenant | Active school access required | `SchoolSettingsRequest/Response` | N/A | `SCHOOL_UPDATED` | `schoolSettingsApi.ts`, `SchoolSettingsPage` | `SchoolSettingsFlowTest` | New in this pass; body tenant/school spoofing ignored. |
| Parent Directory/Links | `GET /v1/school-admin/parents`, `POST /v1/school-admin/parent-links`, leave decision APIs | `SCHOOL_ADMIN` | Actor tenant | Active school access and object-school checks | Parent DTOs | Directory paginated | Link/leave mutations audited | `schoolAdminResourcesApi.ts`, parent pages | Parent linking/leave tests | New directory endpoint in this pass. |
| Staff/Teacher Directory/Provisioning | `GET /v1/school-admin/staff`, `GET /v1/school-admin/teachers`, `POST /v1/school-admin/staff/provision` | `SCHOOL_ADMIN` | Actor tenant | Active school access | Staff DTOs | Directory paginated | Provision mutation audited | `schoolAdminResourcesApi.ts`, `StaffProvisioningPage` | Staff provisioning tests | New directory endpoints in this pass. |
| Academic | `/v1/school-admin/academic-years`, `/classes`, `/sections`, `/subjects`, `/class-subjects`, `/teacher-assignments` | `SCHOOL_ADMIN` | Actor tenant | Active/object school checks | Academic DTOs | Lists currently unpaginated | Mutations audited | `academicApi.ts`, `academicAssignmentsApi.ts` | Academic tests | Future pagination recommended. |
| Students | `/v1/school-admin/students*`, `/v1/student/profile` | `SCHOOL_ADMIN` or `STUDENT` | Actor tenant | Active school or own linked profile | Student/import DTOs | Student list unpaginated | Import/invite audited | `studentImportApi.ts`, resource panel | Student tests | CRUD profile drawer is future UX. |
| Attendance | `/v1/school-admin/attendance/*`, `/v1/teacher/attendance/*`, `/v1/parent/children/{id}/attendance`, `/v1/student/attendance` | School Admin, Teacher, Parent, Student | Actor tenant | Active school, teacher assignment, parent link, own profile | Attendance DTOs | Lists unpaginated | Submit audited | `attendanceApi.ts`, teacher/parent/student panels | Attendance tests | Route-level school/assignment/link guards exist. |
| Homework | `/v1/school-admin/homework`, `/v1/teacher/homework`, `/v1/parent/children/{id}/homework`, `/v1/student/homework*` | School Admin, Teacher, Parent, Student | Actor tenant | Active/assigned/linked/own school | Homework DTOs | Lists unpaginated | Publish/submit audited | `homeworkApi.ts`, teacher/parent/student panels | Homework tests | Review UX is future work. |
| Exams/Results | `/v1/school-admin/exams*`, `/v1/teacher/exams*`, `/v1/parent/children/{id}/results`, `/v1/student/results` | School Admin, Teacher, Parent, Student | Actor tenant | Active/assigned/linked/own school | Exam/result DTOs | Lists unpaginated | Result/publish audited | `examsApi.ts`, `teacherPortalApi.ts` | Exam tests | Teacher marks entry is connected; absent status future. |
| Fees/Finance | `/v1/school-admin/fees/*`, `/v1/finance/fees/*`, `/v1/finance/receipts`, `/v1/finance/reports/*`, parent/student fee APIs | School Admin, Finance Staff, Parent, Student | Actor tenant | Active finance school, linked child, own profile | Fee/receipt/report DTOs | Finance receipts paginated | Demand/payment audited | `feeApi.ts`, `FinanceReportsPage` | Fee lifecycle tests | New finance receipt/report endpoints in this pass. |
| Notices | `/v1/school-admin/notices*`, `/v1/teacher/notices`, parent/student notice APIs | School Admin, Teacher, Parent, Student | Actor tenant | Active/assigned/linked/own visibility | Notice DTOs | Lists unpaginated | Publish audited | `noticesApi.ts`, role panels | Notice tests | Draft notices are hidden from non-admins. |
| Reports | `/v1/school-admin/reports/exports*` | `SCHOOL_ADMIN` | Actor tenant | Active school access | Report export DTOs | List unpaginated | Request audited | `reportExportsApi.ts` | Report tests | Worker/object storage are production gaps. |
| Bulk Jobs | `/v1/school-admin/bulk-jobs*` | `SCHOOL_ADMIN` | Actor tenant | Active school access | Bulk job DTOs | List unpaginated | Create/cancel audited | `bulkJobsApi.ts`, `BulkJobsPage` | Bulk job tests | Background runtime hardening remains. |
| Timetable | School Admin, Teacher, Parent, Student timetable APIs | Role-specific | Actor tenant | Active/assigned/linked/own school | Timetable DTOs | Lists unpaginated | Mutations audited | Resource/role panels | Timetable tests | Calendar UX is future work. |
| Documents | `/v1/school-admin/documents*` | `SCHOOL_ADMIN` | Actor tenant | Active school/object school | Document DTOs | Lists unpaginated | Mutations audited | Resource panel | Document tests via school-scoped coverage | File upload/storage missing. |
| Website Content | `/v1/school-admin/website/pages*` | `SCHOOL_ADMIN` | Actor tenant | Active school/object school | Website page DTOs | Lists unpaginated | Publish audited | Resource panel | Website tests via school-scoped coverage | Public publish pipeline missing. |
| AI | `/v1/ai/entitlement`, `/usage/audit`, `/knowledge/search`, school knowledge docs | Role-specific | Actor tenant | Active/assigned/linked/own scope | AI DTOs | Knowledge docs list unpaginated | Usage/search/doc mutations audited | Resource/API panels | AI tests | No raw prompts returned to Super Admin. |
| System | `/v1/system/readiness`, actuator health/readiness | Public/ops | N/A | N/A | Health DTOs | N/A | Read-only | Deployment scripts | Deployment checks | Production actuator exposure is fail-fast validated. |

## APIs With No Polished Frontend Yet

- Some read/detail endpoints are consumed through generic record panels rather than full tables or drawers.
- School Admin document metadata and website content APIs are connected but lack file upload/public publish UX.
- Super Admin platform report exports exist, but durable worker/storage/download UX is still limited.
- AI entitlement editing exists in backend foundations; frontend edit UX is compact.

## Frontend Screens With Missing Backend

No visible sidebar section currently lacks a backend endpoint. Future-only modules remain hidden until product policy and backend APIs are ready.

## Risk Register

| Risk | Impact | Required Follow-up |
| --- | --- | --- |
| Unpaginated lists remain in several foundation APIs | Scale risk for large schools | Add `PageResponse` consistently to high-volume lists. |
| No OpenAPI contract | Frontend/backend drift risk | Add generated OpenAPI and TypeScript client. |
| Generic JSON forms | Usability risk for non-technical users | Replace with selector-driven forms and tables. |
| Production integrations missing | Blocks real customer deployment | Configure SMTP/SMS, payment gateway, object storage, workers, monitoring. |
