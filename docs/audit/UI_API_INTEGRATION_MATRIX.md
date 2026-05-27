# CloudCampus UI to API Integration Matrix

Date: 2026-05-28

This matrix records the visible web portal surface after the API-to-UI integration pass. The standard for visible navigation is: no fake production data, no dead sidebar pages, and no visible module that lacks a backend call. Lower-frequency screens may still use scaffold-grade forms, but they must call real APIs and show loading, empty, and error states.

## Status Legend

| Status | Meaning |
| --- | --- |
| CONNECTED_REAL_API | Visible UI calls a backend endpoint through the shared API client. |
| PARTIAL_API | Backend is real, but UX or mutation coverage is intentionally limited. |
| HIDDEN_IN_PRODUCTION | Not shown in visible navigation because no verified API/UI workflow exists. |

## Role Matrix

| Role | UI Section | UI Component/File | User Action | Expected Backend API | Actual Backend API | Status | Issue | Required Fix | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SUPER_ADMIN | Dashboard | `SuperAdminPlatformPage`, `DashboardWorkspacePanel` | View platform metrics | `/v1/super-admin/dashboard/summary`, platform control summaries | `/v1/super-admin/dashboard/summary`, `/tenants`, `/schools`, `/revenue/summary`, `/platform-health`, `/notifications/summary` | CONNECTED_REAL_API | Charts are summary cards, not full analytics drilldowns | Add richer charts after production staging | P2 |
| SUPER_ADMIN | Tenants | `TenantOnboardingPage`, `SuperAdminPlatformPage` | Create/list/detail/status/settings | `/v1/super-admin/tenants*` | `GET/PATCH /v1/super-admin/tenants*`, `POST /v1/super-admin/tenants/onboard` | CONNECTED_REAL_API | Detail drawer is still compact | Add richer tenant detail tabs | P2 |
| SUPER_ADMIN | Schools | `SuperAdminPlatformPage` | List/read school directory | `/v1/super-admin/schools*` | `GET /v1/super-admin/schools`, `GET /v1/super-admin/schools/{schoolId}` | CONNECTED_REAL_API | Read-only first | Keep read-only for safety | P2 |
| SUPER_ADMIN | Subscription Plans | `SuperAdminPlatformPage` | List/create plans | `/v1/super-admin/subscriptions/plans*` | `GET/POST/PATCH /v1/super-admin/subscriptions/plans` | PARTIAL_API | Tenant assignment/edit UX is basic | Add assignment/edit drawer | P2 |
| SUPER_ADMIN | Revenue | `SuperAdminPlatformPage` | View invoices and revenue | `/v1/super-admin/revenue/*` | `GET /summary`, `/invoices`, `/trends`, `/tenants` | CONNECTED_REAL_API | No payment gateway settlement data | Add payment provider integration later | P1 for real billing |
| SUPER_ADMIN | AI Usage | `SuperAdminPlatformPage` | View AI budget and tenant usage | `/v1/super-admin/ai/*` | `GET /ai/usage/summary`, `/usage/tenants`, `/entitlements` | PARTIAL_API | Entitlement inline editing remains basic | Add guided edit UX | P2 |
| SUPER_ADMIN | Reports | `SuperAdminPlatformPage` | View/request platform exports | `/v1/super-admin/reports/*` | `GET /summary`, `/tenants`, `/schools`, `/exports`; `POST /exports` | PARTIAL_API | Durable export worker is not production-proven | Add worker/storage delivery | P1 |
| SUPER_ADMIN | Audit Logs | `SuperAdminPlatformPage` | Search/list audit logs | `/v1/super-admin/audit-logs` | `GET /v1/super-admin/audit-logs` | CONNECTED_REAL_API | Filtering UI is compact | Add advanced filters | P2 |
| SUPER_ADMIN | Platform Health | `SuperAdminPlatformPage` | View readiness/runtime safety | `/v1/super-admin/platform-health` | `GET /v1/super-admin/platform-health` | CONNECTED_REAL_API | No external monitor integration | Connect hosted monitoring | P1 before prod |
| SUPER_ADMIN | Notifications | `SuperAdminPlatformPage` | View delivery summary/list/detail | `/v1/super-admin/notifications/*` | `GET /summary`, `/deliveries`, `/deliveries/{id}` | CONNECTED_REAL_API | Retry UI hidden unless backend supports it | Add safe retry worker | P2 |
| SUPER_ADMIN | Settings | `SuperAdminPlatformPage` | View/update safe platform settings | `/v1/super-admin/settings` | `GET/PATCH /v1/super-admin/settings` | PARTIAL_API | Runtime settings persistence is limited | Add durable platform settings store | P2 |
| TENANT_ADMIN | Dashboard | `DashboardWorkspacePanel` | View tenant summary | `/v1/tenant-admin/dashboard/summary` | `GET /v1/tenant-admin/dashboard/summary` | CONNECTED_REAL_API | Limited drilldown | Add tenant analytics pages | P2 |
| TENANT_ADMIN | Schools | `TenantSchoolCreationPage`, `TenantSchoolManagementPage` | Create/list/edit/deactivate | `/v1/tenant-admin/schools*` | `GET/POST/PATCH /v1/tenant-admin/schools`, deactivate | CONNECTED_REAL_API | Good MVP flow | None for MVP | P3 |
| TENANT_ADMIN | School Admins | `TenantSchoolManagementPage` | Invite/list/resend/revoke | `/v1/tenant-admin/schools/{schoolId}/admins*` | Real admin invite/list/resend/revoke APIs | CONNECTED_REAL_API | Managed inside Schools page | Optional standalone view | P3 |
| TENANT_ADMIN | Reports | `TenantReportsPage` | View combined/school report | `/v1/tenant-admin/reports/*` | `GET /summary`, `/schools/{schoolId}/summary` | CONNECTED_REAL_API | No export UX | Add exports later | P2 |
| TENANT_ADMIN | Subscription Usage | `TenantSettingsPage` | View usage limits | `/v1/tenant-admin/subscription/usage` | `GET /v1/tenant-admin/subscription/usage` | CONNECTED_REAL_API | Read-only | None for MVP | P3 |
| TENANT_ADMIN | Settings | `TenantSettingsPage` | View/update tenant settings | `/v1/tenant-admin/settings` | `GET/PATCH /v1/tenant-admin/settings` | CONNECTED_REAL_API | Branding UI not complete | Add branding assets later | P2 |
| SCHOOL_ADMIN | Dashboard | `DashboardWorkspacePanel` | View school summary | `/v1/school-admin/dashboard/summary` | `GET /v1/school-admin/dashboard/summary` | CONNECTED_REAL_API | Cards only | Add drilldowns | P2 |
| SCHOOL_ADMIN | Students | `SchoolAdminResourcePanel`, `StudentImportPage` | List/import/invite | `/v1/school-admin/students*` | Student list/import/job/invitation APIs | CONNECTED_REAL_API | Profile CRUD drawer not built | Add student CRUD UX | P1 |
| SCHOOL_ADMIN | Parents | `SchoolAdminResourcePanel`, parent pages | List/link/leave decisions | `/v1/school-admin/parents`, parent link/leave APIs | `GET /v1/school-admin/parents`, `POST /parent-links`, leave APIs | CONNECTED_REAL_API | Directory is compact | Add searchable table | P2 |
| SCHOOL_ADMIN | Teachers | `SchoolAdminResourcePanel`, `StaffProvisioningPage` | List/provision teacher | `/v1/school-admin/teachers`, staff provision | `GET /v1/school-admin/teachers`, `POST /staff/provision` | CONNECTED_REAL_API | Directory is compact | Add teacher profile table | P2 |
| SCHOOL_ADMIN | Staff | `SchoolAdminResourcePanel`, `StaffProvisioningPage` | List/provision staff | `/v1/school-admin/staff`, staff provision | `GET /v1/school-admin/staff`, `POST /staff/provision` | CONNECTED_REAL_API | Directory is compact | Add staff profile table | P2 |
| SCHOOL_ADMIN | Academic Setup | Academic setup pages | Create/list academic objects | Academic year/class/section/subject/assignment APIs | Real school-admin academic APIs | CONNECTED_REAL_API | Uses forms, not wizard | Add guided setup wizard | P2 |
| SCHOOL_ADMIN | Attendance | `SchoolAdminResourcePanel` | List/create sessions | `/v1/school-admin/attendance/sessions` | `GET/POST /v1/school-admin/attendance/sessions` | CONNECTED_REAL_API | Table UX basic | Add attendance grid | P1 |
| SCHOOL_ADMIN | Homework | `SchoolAdminResourcePanel` | List/create homework | `/v1/school-admin/homework` | `GET/POST /v1/school-admin/homework` | CONNECTED_REAL_API | JSON payload form | Add guided homework form | P2 |
| SCHOOL_ADMIN | Exams & Results | `SchoolAdminResourcePanel` | List/create/publish exams | `/v1/school-admin/exams*` | Exam list/create/read/results/publish APIs | CONNECTED_REAL_API | Marks UX mostly teacher-focused | Add School Admin review table | P2 |
| SCHOOL_ADMIN | Fees | `SchoolAdminResourcePanel`, `FeeLifecyclePage` | List/create/pay demands | `/v1/school-admin/fees/demands*` | Fee demand/payment APIs | CONNECTED_REAL_API | No gateway integration | Add payment gateway later | P1 |
| SCHOOL_ADMIN | Timetable | `SchoolAdminResourcePanel` | List/create entries | `/v1/school-admin/timetable` | `GET/POST /v1/school-admin/timetable` | CONNECTED_REAL_API | Needs calendar UI | Add timetable grid | P2 |
| SCHOOL_ADMIN | Notices | `SchoolAdminResourcePanel` | List/create/publish notices | `/v1/school-admin/notices*` | Notice list/create/read/publish APIs | CONNECTED_REAL_API | Basic publisher | Add audience builder | P2 |
| SCHOOL_ADMIN | Reports | `ReportExportsPage` | Request/list/download exports | `/v1/school-admin/reports/exports*` | Real report export APIs | CONNECTED_REAL_API | Export worker/storage not production hardened | Add durable worker/storage | P1 |
| SCHOOL_ADMIN | Documents | `SchoolAdminResourcePanel` | List/create metadata | `/v1/school-admin/documents` | Document metadata APIs | PARTIAL_API | No real file upload/storage | Add S3/MinIO upload | P1 |
| SCHOOL_ADMIN | Website Builder | `SchoolAdminResourcePanel` | List/create/publish pages | `/v1/school-admin/website/pages*` | Website content APIs | PARTIAL_API | No public publishing pipeline | Add publish pipeline | P2 |
| SCHOOL_ADMIN | Settings | `SchoolSettingsPage`, `BulkJobsPage` | View/update school name, jobs | `/v1/school-admin/settings`, bulk jobs | `GET/PATCH /settings`, bulk job APIs | CONNECTED_REAL_API | Settings scope is intentionally narrow | Expand settings later | P2 |
| TEACHER | Dashboard | `DashboardWorkspacePanel` | View teacher summary | `/v1/teacher/dashboard/summary` | `GET /v1/teacher/dashboard/summary` | CONNECTED_REAL_API | Limited detail | Add daily task board | P2 |
| TEACHER | My Classes | `TeacherPortalPanel` | View assignments | `/v1/teacher/assignments` | `GET /v1/teacher/assignments` | CONNECTED_REAL_API | Compact list | Add class detail | P2 |
| TEACHER | Attendance | `TeacherPortalPanel` | List scoped attendance | `/v1/teacher/attendance/sessions` | Real teacher attendance APIs | CONNECTED_REAL_API | Attendance taking UX basic | Add grid | P1 |
| TEACHER | Homework | `TeacherPortalPanel` | List/create scoped homework | `/v1/teacher/homework` | Real teacher homework APIs | CONNECTED_REAL_API | Review/submission UX basic | Add review workflow | P2 |
| TEACHER | Exams | `TeacherPortalPanel` | List assigned exams | `/v1/teacher/exams` | Real teacher exam APIs | CONNECTED_REAL_API | Compact | Add exam details | P2 |
| TEACHER | Marks | `TeacherMarksEntry` in `App.tsx` | Select class/subject/exam, load roster, submit marks | Teacher assignment/exam/roster/result APIs | `GET /assignments`, `/exams`, `/roster`; `POST /results` | CONNECTED_REAL_API | Absent marking unsupported by backend | Add absent result state later | P2 |
| TEACHER | Timetable | `TeacherPortalPanel` | View timetable | `/v1/teacher/timetable` | `GET /v1/teacher/timetable` | CONNECTED_REAL_API | Basic list | Add timetable view | P2 |
| TEACHER | Notices | `TeacherPortalPanel` | View notices | `/v1/teacher/notices` | `GET /v1/teacher/notices` | CONNECTED_REAL_API | Basic list | Add inbox polish | P3 |
| FINANCE_STAFF | Dashboard | `DashboardWorkspacePanel` | View finance summary | `/v1/finance/dashboard/summary` | `GET /v1/finance/dashboard/summary` | CONNECTED_REAL_API | Cards only | Add collection chart | P2 |
| FINANCE_STAFF | Fee Demands | `FeeLifecyclePage` | List/create demand | `/v1/finance/fees/demands` | `GET/POST /v1/finance/fees/demands` | CONNECTED_REAL_API | Form is basic | Add searchable student selector | P1 |
| FINANCE_STAFF | Payments | `FeeLifecyclePage` | Record payment | `/v1/finance/fees/demands/{id}/payments` | `POST /v1/finance/fees/demands/{id}/payments` | CONNECTED_REAL_API | No gateway | Add provider integration later | P1 |
| FINANCE_STAFF | Receipts | `EndpointListPanel` | View receipts | `/v1/finance/receipts` | `GET /v1/finance/receipts` | CONNECTED_REAL_API | Basic receipt list | Add receipt detail/download | P2 |
| FINANCE_STAFF | Reports | `FinanceReportsPage` | View summary/collections/receipts | `/v1/finance/reports/*` | `GET /summary`, `/collections`, `/receipts` | CONNECTED_REAL_API | No CSV export | Add finance export | P2 |
| PARENT | Dashboard | `DashboardWorkspacePanel` | View parent summary | `/v1/parent/dashboard/summary` | `GET /v1/parent/dashboard/summary` | CONNECTED_REAL_API | Shell-grade | Add mobile-first detail cards | P2 |
| PARENT | Children/Data | `ParentPortalPanel` | Select child and view attendance/homework/results/fees/notices/timetable | `/v1/parent/children*` | Real child-scoped APIs | CONNECTED_REAL_API | Needs richer child profile | Add child profile 360 | P2 |
| PARENT | Leave Requests | `ParentLeaveRequestsPage` | Create/list leave | `/v1/parent/children/{id}/leave-requests` | Real parent leave APIs | CONNECTED_REAL_API | Basic form | Add status timeline | P3 |
| STUDENT | Dashboard | `DashboardWorkspacePanel` | View student summary | `/v1/student/dashboard/summary` | `GET /v1/student/dashboard/summary` | CONNECTED_REAL_API | Shell-grade | Add study dashboard | P2 |
| STUDENT | Homework/Results/Fees/Notices/Attendance/Timetable | `StudentPortalPanel` | View own records | `/v1/student/*` | Real own-profile APIs | CONNECTED_REAL_API | Basic lists | Add polished student portal | P2 |
| STAFF | Dashboard | `DashboardWorkspacePanel` | View staff summary | `/v1/staff/dashboard/summary` | `GET /v1/staff/dashboard/summary` | CONNECTED_REAL_API | Only dashboard visible | Add staff-specific modules when product policy defines them | P3 |

## Central Client Enforcement

Frontend feature files use `frontend/src/shared/api/httpClient.ts` for protected API calls. Direct `fetch` is restricted to the shared API base/client implementation and tests. App-level generic panels also use the shared client.

## Remaining Production Gaps

- Several forms are API-backed but still technical. The next UX pass should replace JSON payload panels with selector-driven business forms.
- Reports, documents, website, notifications, payments, and AI need production integrations: workers, object storage, provider delivery, gateway reconciliation, and real AI provider/RAG.
- Mobile remains a shell and must not be marketed as full parity yet.
