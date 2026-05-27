# CloudCampus Frontend API Connection Audit

Date: 2026-05-28

## Executive Summary

The portal shell no longer presents hard-coded operational dashboard metrics, fake record tables, fake logged-in notification feeds, static analytics charts, or fake AI insight lists as if they are production data.

Visible logged-in portal modules now fall into one production state:

- `CONNECTED_REAL_API`: UI calls an existing backend endpoint for that module.

Production and local navigation now hide modules that do not have verified backend/UI integration. The portal shell no longer displays `Partial API`, `Missing API`, `Coming soon`, or pending-style badges in visible navigation.

## Central API Layer

Added:

- `frontend/src/shared/api/httpClient.ts`
- `frontend/src/shared/api/apiError.ts`
- `frontend/src/shared/api/authHeaders.ts`

The shared client now handles:

- `VITE_API_BASE_URL` through the existing `buildApiUrl` helper.
- Bearer token attachment.
- JSON request/response parsing.
- Standard API error parsing.
- 401 refresh retry when a refresh token exists.
- Explicit unauthenticated calls for login, MFA, invitation accept and password reset.

Raw `fetch` calls were removed from feature API modules. Remaining `fetch` usage is isolated to the shared client and its base URL test.

## Dashboard Static Data Removed

Removed from logged-in portal views:

- Hardcoded role metric arrays.
- Hardcoded operational table rows.
- Hardcoded dashboard chart series.
- Hardcoded AI insight bullets.
- Hardcoded logged-in notification feed.
- Dead quick-action buttons.

Dashboard behavior now:

- Calls role summary endpoint such as `GET /v1/school-admin/dashboard/summary`.
- Shows loading skeleton while loading.
- Shows empty state if the backend returns no metrics.
- Shows explicit unavailable state if the summary endpoint is missing.
- Shows only server-derived session facts from `/v1/me` and `/v1/me/schools`.

Backend summary endpoints are now implemented for:

- `GET /v1/super-admin/dashboard/summary`
- `GET /v1/tenant-admin/dashboard/summary`
- `GET /v1/school-admin/dashboard/summary`
- `GET /v1/teacher/dashboard/summary`
- `GET /v1/finance/dashboard/summary`
- `GET /v1/staff/dashboard/summary`
- `GET /v1/parent/dashboard/summary`
- `GET /v1/student/dashboard/summary`

Role dashboards are classified as `CONNECTED_REAL_API` because each visible dashboard calls its authenticated summary endpoint and no longer falls through to a pending/coming-soon workspace.

## Sidebar Classification

### SUPER_ADMIN

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls real Super Admin platform APIs for tenant, school, revenue, health and notification summaries; no hardcoded metric cards remain. |
| Tenants | CONNECTED_REAL_API | Uses `POST /v1/super-admin/tenants/onboard`, `GET /v1/super-admin/tenants`, detail/status/settings, tenant schools, tenant users and tenant audit APIs. |
| Schools | CONNECTED_REAL_API | Uses `GET /v1/super-admin/schools` and `GET /v1/super-admin/schools/{schoolId}` with tenant/status/search filters. |
| Subscription Plans | CONNECTED_REAL_API | Uses `/v1/super-admin/subscriptions/plans` list/create and existing tenant subscription invoice APIs. Edit/assignment UX is tracked as post-MVP polish, not a visible pending state. |
| Revenue | CONNECTED_REAL_API | Uses `/v1/super-admin/revenue/summary`, `/invoices`, `/trends` and `/tenants` from subscription/invoice tables. |
| AI Usage | CONNECTED_REAL_API | Uses `/v1/super-admin/ai/usage/summary`, `/usage/tenants` and `/entitlements`. Read-only usage and budget visibility are live; inline entitlement editing is tracked as post-MVP polish. |
| Reports | CONNECTED_REAL_API | Uses `/v1/super-admin/reports/summary`, tenant/school report aliases and export list/request APIs. Durable platform-level export worker remains future operational hardening. |
| Audit Logs | CONNECTED_REAL_API | Uses `GET /v1/super-admin/audit-logs` with safe redacted audit metadata. |
| Platform Health | CONNECTED_REAL_API | Uses `GET /v1/super-admin/platform-health` for readiness, database, migrations, notification mode, queue/report and build status. |
| Notifications | CONNECTED_REAL_API | Uses `GET /v1/super-admin/notifications/summary`, delivery list and delivery detail with masked recipients. |
| Settings | CONNECTED_REAL_API | Uses `GET/PATCH /v1/super-admin/settings` for safe runtime settings display/update with audit; durable platform settings persistence remains future operational hardening. |

### TENANT_ADMIN

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls `GET /v1/tenant-admin/dashboard/summary`; returns real tenant-scoped school, student, staff and School Admin counts. Dashboard workspace no longer shows a pending/coming-soon fallback. |
| Schools | CONNECTED_REAL_API | Uses `/v1/tenant-admin/schools` create/list/update/deactivate. |
| School Admins | CONNECTED_REAL_API | Uses `/v1/tenant-admin/schools/{schoolId}/admins*`; school selection UX is inside school management. |
| Reports | CONNECTED_REAL_API | Uses `/v1/tenant-admin/reports/summary` and school drilldown. |
| Subscription Usage | CONNECTED_REAL_API | Uses `/v1/tenant-admin/subscription/usage`. |
| Settings | CONNECTED_REAL_API | Uses `/v1/tenant-admin/settings`. |

### SCHOOL_ADMIN

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls `GET /v1/school-admin/dashboard/summary`; returns real active-school metrics for students, teachers, staff, attendance, homework, exams, fees, notices and reports. |
| Students | CONNECTED_REAL_API | Uses `GET /v1/school-admin/students`, import validate/import/job APIs and login invitation API. Student profile CRUD is tracked as a future enhancement. |
| Parents | CONNECTED_REAL_API | Uses `GET /v1/school-admin/parents`, parent link APIs and leave approval APIs. |
| Teachers | CONNECTED_REAL_API | Uses `GET /v1/school-admin/teachers` and `POST /v1/school-admin/staff/provision`. |
| Staff | CONNECTED_REAL_API | Uses `GET /v1/school-admin/staff` and `POST /v1/school-admin/staff/provision`. |
| Academic Setup | CONNECTED_REAL_API | Uses academic year, class, section, subject, class-subject and teacher assignment APIs. |
| Attendance | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/attendance/sessions`. |
| Homework | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/homework`. |
| Exams / Results | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/exams` and publish endpoint. Marks UX remains basic. |
| Fees | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/fees/demands` and payment endpoint. |
| Timetable | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/timetable`. |
| Notices | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/notices` and publish endpoint. |
| Reports | CONNECTED_REAL_API | Uses report export request/list/download APIs. |
| Documents | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/documents`. |
| Website Builder | CONNECTED_REAL_API | Uses `GET/POST /v1/school-admin/website/pages` and publish endpoint. |
| Settings | CONNECTED_REAL_API | Uses `GET/PATCH /v1/school-admin/settings` and backend-backed bulk job operations. |

### TEACHER

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls `GET /v1/teacher/dashboard/summary`; returns real assigned-class, homework, exam and notice counts. |
| My Classes | CONNECTED_REAL_API | Uses `GET /v1/teacher/assignments`. |
| Attendance | CONNECTED_REAL_API | Uses assignment selector from `GET /v1/teacher/assignments`, then calls `GET /v1/teacher/attendance/sessions?classLevelId=&subjectId=`. |
| Homework | CONNECTED_REAL_API | Uses assignment selector from `GET /v1/teacher/assignments`, then calls `GET /v1/teacher/homework?classLevelId=&subjectId=`. |
| Exams | CONNECTED_REAL_API | Uses assignment selector from `GET /v1/teacher/assignments`, then calls `GET /v1/teacher/exams?classLevelId=&subjectId=`. |
| Marks | CONNECTED_REAL_API | Uses class/subject selectors from `GET /v1/teacher/assignments`, assigned exams from `GET /v1/teacher/exams?classLevelId=&subjectId=`, roster from `GET /v1/teacher/exams/{examId}/roster`, and submits marks through `POST /v1/teacher/exams/{examId}/results`. |
| Timetable | CONNECTED_REAL_API | Uses `GET /v1/teacher/timetable` scoped to teacher assignments. |
| Notices | CONNECTED_REAL_API | Uses `GET /v1/teacher/notices`. |

### PARENT

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls `GET /v1/parent/dashboard/summary`; returns real linked-child, fee, homework, result and leave counts. |
| Children | CONNECTED_REAL_API | Uses `GET /v1/parent/children`. |
| Attendance | CONNECTED_REAL_API | Uses child selector from `GET /v1/parent/children`, then calls `GET /v1/parent/children/{studentId}/attendance`. |
| Homework | CONNECTED_REAL_API | Uses child selector from `GET /v1/parent/children`, then calls `GET /v1/parent/children/{studentId}/homework`. |
| Results | CONNECTED_REAL_API | Uses child selector from `GET /v1/parent/children`, then calls `GET /v1/parent/children/{studentId}/results`. |
| Fees | CONNECTED_REAL_API | Uses child selector from `GET /v1/parent/children`, then calls `GET /v1/parent/children/{studentId}/fees`. |
| Notices | CONNECTED_REAL_API | Uses child selector from `GET /v1/parent/children`, then calls `GET /v1/parent/children/{studentId}/notices`. |
| Timetable | CONNECTED_REAL_API | Uses child selector from `GET /v1/parent/children`, then calls `GET /v1/parent/children/{studentId}/timetable`. |
| Leave Requests | CONNECTED_REAL_API | Uses parent leave create/list APIs. |

### STUDENT

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls `GET /v1/student/dashboard/summary`; returns real profile, homework, result and fee metrics. |
| Homework | CONNECTED_REAL_API | Uses `GET /v1/student/homework`. |
| Results | CONNECTED_REAL_API | Uses `GET /v1/student/results`. |
| Attendance | CONNECTED_REAL_API | Uses `GET /v1/student/attendance`, returning only the authenticated student's own records. |
| Timetable | CONNECTED_REAL_API | Uses `GET /v1/student/timetable`, scoped to the authenticated student's class/section. |
| Notices | CONNECTED_REAL_API | Uses `GET /v1/student/notices`. |
| Fees | CONNECTED_REAL_API | Uses `GET /v1/student/fees`. |

### FINANCE_STAFF

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls `GET /v1/finance/dashboard/summary`; returns real fee demand, collection, outstanding and receipt counts. |
| Fee Demands | CONNECTED_REAL_API | Uses `GET/POST /v1/finance/fees/demands`. |
| Payments | CONNECTED_REAL_API | Uses `POST /v1/finance/fees/demands/{demandId}/payments`. |
| Receipts | CONNECTED_REAL_API | Uses `GET /v1/finance/receipts` for assigned-school receipts. |
| Reports | CONNECTED_REAL_API | Uses `GET /v1/finance/reports/summary`, `GET /v1/finance/reports/collections`, and `GET /v1/finance/receipts`. |

### STAFF

| Item | Status | Evidence |
|---|---:|---|
| Dashboard | CONNECTED_REAL_API | Calls `GET /v1/staff/dashboard/summary`; future task/attendance/notices modules are hidden until backend-backed workflows exist. |

## School Admin Portal Work Completed

Connected or improved:

- Student list and student import/invite workflows.
- Staff/teacher directory and provisioning workflow.
- Academic setup and teacher assignment workflows.
- Fee demand list/create/payment workflow.
- Attendance session list/create workflow.
- Homework list/create workflow.
- Exam list/create/publish workflow.
- Notice list/create/publish workflow.
- Report export request/list/download workflow.
- Timetable list/create workflow.
- Teacher assignment selector for attendance/homework/exams and teacher timetable.
- Teacher marks entry workflow with class, subject and exam selectors, real roster loading, client-side marks validation and mark submission.
- Parent child selector for attendance/homework/results/fees/notices/timetable.
- Student attendance and timetable APIs.
- Document list/create workflow.
- Website page list/create/publish workflow.

Every connected panel now has:

- Loading skeleton.
- Empty state.
- Error state.
- Real backend list call where available.
- Real create/publish call where available.
- Bearer token attachment through the shared HTTP client.

## Remaining Frontend Gaps

- Role dashboard summary backend endpoints now exist and return real values.
- Visible local and production navigation no longer shows pending/missing API states.
- School Admin parent, teacher, and staff directory APIs are connected through compact record panels; premium searchable tables remain product polish.
- Teacher marks are connected for numeric marks. Absent marking is shown as unavailable because the current backend exam API does not support absent result state yet.
- Super Admin schools, revenue, audit logs, platform health and notification inbox/list are now API-backed.
- Super Admin AI entitlement editing, subscription plan edit/tenant assignment UX, durable platform report export jobs and durable platform settings persistence remain partial.
- Finance standalone reports are now visible and connected to real summary, collection and receipt endpoints.
- Parent/student attendance and timetable endpoints now exist.
- Generic JSON payload panels are functional but not yet premium business forms for every low-frequency admin module.

## Super Admin Files Changed

Backend:

- `backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java`
- `backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java`
- `backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformDtos.java`
- Repository helpers for audit logs, notification deliveries, schools, users, AI audit, report exports and subscription invoices.

## API-to-UI Audit Pass, 2026-05-28

New audit docs:

- `docs/audit/UI_API_INTEGRATION_MATRIX.md`
- `docs/audit/BACKEND_API_INVENTORY.md`

Backend APIs added in this pass:

- `GET /v1/school-admin/parents`
- `GET /v1/school-admin/teachers`
- `GET /v1/school-admin/staff`
- `GET /v1/school-admin/settings`
- `PATCH /v1/school-admin/settings`
- `GET /v1/finance/receipts`
- `GET /v1/finance/reports/summary`
- `GET /v1/finance/reports/collections`

Frontend UI wired in this pass:

- School Admin Parents directory panel.
- School Admin Teachers directory panel.
- School Admin Staff directory panel.
- School Admin Settings panel.
- Finance Staff Receipts panel.
- Finance Staff Reports page.

Tests added or updated:

- Staff provisioning flow verifies teacher/staff directory APIs.
- Parent-child linking flow verifies parent directory API.
- Fee lifecycle flow verifies finance receipts and report APIs.
- School settings flow verifies settings read/update, role denial, spoof resistance and audit.
- App shell tests verify the new visible sections call real APIs with Bearer tokens.

Validation evidence:

- `cd backend && mvn -q -Dtest=StaffProvisioningFlowTest,ParentChildLinkingFlowTest,FeeLifecycleFlowTest,SchoolSettingsFlowTest,AuditCoverageMatrixTest test` PASS.
- `cd backend && mvn -q test` PASS: 152 tests, 0 failures, 0 errors, 0 skipped.
- `cd frontend && npm test -- --run` PASS: 21 files, 75 tests.
- `cd frontend && npm run lint` PASS.
- `cd frontend && npm run typecheck` PASS.
- `cd frontend && npm run build` PASS.
- `cd mobile && npm run lint` PASS.
- `cd mobile && npm run typecheck` PASS.
- `cd mobile && npm test -- --run` PASS: 1 file, 2 tests.
- Audit actions for tenant status and safe platform settings mutations.

Frontend:

- `frontend/src/features/super-admin/api/platformApi.ts`
- `frontend/src/features/super-admin/pages/SuperAdminPlatformPage.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `frontend/src/shared/styles/global.css`

## Validation Evidence

Commands run:

- `mvn test`
- `mvn test -Dtest=SuperAdminPlatformControlFlowTest`
- `mvn test -Dtest=ExamFlowTest`
- `mvn test -Dtest=AttendanceFlowTest,TimetablePortalFlowTest`
- `npm test -- --run`
- `npm test -- --run App.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Results:

- Backend tests passed: 150 tests.
- Targeted Super Admin platform control tests passed: 2 tests.
- Targeted exam workflow tests passed: 3 tests.
- Targeted attendance/timetable portal tests passed: 5 tests.
- Frontend tests passed: 21 files, 75 tests.
- Targeted app tests passed: 26 tests, including the all-role no-pending-navigation regression.
- Frontend lint, typecheck and production build passed.

## Next Recommended Task

Replace remaining technical JSON/ID-based low-frequency workflows with guided selectors and polished business forms, starting with Academic Setup and School Admin resource creation.
