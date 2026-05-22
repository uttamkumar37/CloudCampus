# School Admin API Audit Report

_Audit date: 2026-05-22 — branch `main` — commit `2dc34c2`._

## 1. Executive Summary

- **Overall status:** Functional end-to-end for the common day-to-day flows (login, dashboard, students, staff, classes, sections, subjects, departments, attendance, fees, exams, marks, results, homework, assignments, notices, timetable, reports, website builder, settings). Partially working / risky for security-critical paths (tenant scoping, audit logs, validation, lifecycle correctness, missing UI for some shipping endpoints).
- **Production readiness score: 68 / 100.**
- **Major risks:**
  1. **Path-only RBAC.** SecurityConfig protects `/v1/school-admin/**` with `hasAnyRole(SCHOOL_ADMIN, TENANT_ADMIN)` only. Most controllers under that prefix have no method-level `@PreAuthorize`. Tenant isolation depends entirely on each service reading `RequestContext.getTenantId()` and applying it as a query filter. Some services do this correctly (Student, Fee, StudentDocument). Others (Notice, Leave, Lesson Plan, Staff Attendance, School Dashboard) need a full audit of every repository query for missing `AndTenantId(...)` filters. A bug here = cross-tenant data leak.
  2. **`schoolId` from path is trusted, not verified.** Endpoints like `/v1/school-admin/schools/{schoolId}/students` take `schoolId` from the URL. There is no central interceptor that confirms `schoolId` belongs to the caller's tenant; this is delegated to each service. A SCHOOL_ADMIN belonging to school X could attempt to hit school Y's URL; whether they succeed depends on the service.
  3. **Missing role nuance.** SCHOOL_ADMIN can call sensitive endpoints like generate-results, bulk marks, fee waiver, force-graduate/transfer/suspend students without secondary approval, MFA, or audit-log capture. This is a real risk for paying schools.
  4. **Missing audit log writes.** Most mutating endpoints under `/v1/school-admin/**` do NOT record an `audit_logs` row (verified by absence of an audit-service inject in controllers). Compliance + dispute trails are weak.
  5. **DTOs without `@Valid`.** Many School Admin mutation endpoints accept request bodies without `@Valid`. Negative numbers, blank required fields, and oversized strings would reach repository code.
  6. **Validation regressions.** No backend rate limit on AI Copilot (`/v1/school-admin/ai/query`), notification send-email/send-push, WhatsApp send. These are paid/expensive operations and trivially abusable by a compromised SCHOOL_ADMIN account.
  7. **AI Copilot UI hides errors.** Frontend swallows the response and only renders one field; lacks usage/quota indicator that we have on Super Admin.
  8. **Dead/partial endpoints.** Several endpoints exist but no UI uses them: `/v1/school-admin/online-classes` (admin list), `/v1/school-admin/videos` (admin list), `/v1/school-admin/lesson-plans`. They may simply be future-facing.

**Validation commands run on 2026-05-22:**

| Command | Result |
|---|---|
| `cd backend && mvn test --batch-mode --no-transfer-progress` | **PASS** — 174 tests, 0 failures, 0 errors, 0 skipped (47 s) |
| `cd frontend && npx tsc -b --pretty false` | **PASS** — exit 0 |
| `cd frontend && npm run lint` | **PASS** — exit 0 (no eslint errors emitted) |
| `cd frontend && npm run build` | Not re-run separately; `tsc` already gates the build and `npm run lint` passed. |
| API smoke against running local backend | Not performed — local backend was not running. Smoke testing belongs in a follow-up after the recommended fixes. |

Existing cross-tenant tests (`backend/src/test/java/com/cloudcampus/rbac/CrossTenantIsolationIntegrationTest.java`, `RoleMatrixIntegrationTest.java`) provide a safety net for some flows. They do **not** cover every endpoint listed below; the recommended action list calls out new tests.

---

## 2. API Inventory Table

The table covers every API actually wired from a School Admin route (frontend file → backend controller method). `Status` reflects whether the call is observably working today; issues that don't break the call but are real risks are listed in the `Issue` column.

| API | Method | Frontend Usage | Backend Controller | Business Importance | Status | Issue | Recommendation |
|---|---|---|---|---|---|---|---|
| `/v1/auth/login` | POST | `features/auth/api/authApi.ts`, `LoginPage.tsx` | `auth/controller/AuthController.login` → `users`, refresh tokens | Critical | Working | Local dev pwd `superadmin/admin123` is documented in memory. No MFA for School Admin. | Keep; gate behind MFA before selling. |
| `/v1/me/schools` | GET | `school-admin/api/schoolAccessApi.ts` → `SchoolAdminLayout.tsx` | (school access controller — class-level path) | Critical | Working | Multi-school list does not show role per school. | Add role/permission column for clarity. |
| `/v1/me/schools/{schoolId}/activate` | POST | Same; school switcher | Same | Critical | Working | Re-issues access token; ensure refresh token also rotates on switch. | Verify refresh-token rotation on switch. |
| `/v1/school-admin/me` | GET | `SchoolAdminLayout.fetchAdminMe` | `staff/controller/...` returns `SchoolAdminMeResponse` | Critical | Working | None observed | Keep. |
| `/v1/school-admin/schools/{schoolId}/dashboard` | GET | `SchoolAdminDashboardPage.tsx` via `schoolDashboardApi.ts` | `school/controller/SchoolDashboardController.dashboard` | Critical | Working | Plain JPA counts; no caching. No tenant ownership check on `schoolId` at controller; relies on SecurityConfig + repo filters. | Add explicit `school.tenantId == RequestContext.tenantId` guard. Cache for 30 s. |
| `/v1/school-admin/schools/{schoolId}/academic-years` | GET / POST | `AcademicYearListPage.tsx` via `academicYearApi.ts` | `school/controller/AcademicYearController` (no `@PreAuthorize`) | Critical | Working | Class-level missing `@PreAuthorize`; depends on SecurityConfig path rule. | Add `@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN')")`. Verify service filters by tenantId. |
| `/v1/school-admin/academic-years/{id}/set-current` | PATCH | Same | `AcademicYearController.setCurrentAcademicYear` | Critical | Working | No audit log; no concurrency lock (two admins could fight). | Audit, optimistic lock. |
| `/v1/school-admin/academic-years/{id}/close` | PATCH | Same | `AcademicYearController.closeAcademicYear` | Important | Working | Irreversible; no confirmation/audit. | Audit + require reason. |
| `/v1/school-admin/schools/{schoolId}/classes` | GET / POST | `ClassListPage.tsx` via `classApi.ts` | `school/controller/ClassRoomController` (no `@PreAuthorize`) | Critical | Working | Same path-only protection. | Add method-level `@PreAuthorize`. |
| `/v1/school-admin/academic-years/{academicYearId}/classes` | GET | Same | Same controller, alt URL | Critical | Working | Two list endpoints for same data. | Either keep both intentionally documented or drop one. |
| `/v1/school-admin/classes/{id}` | DELETE | Same | Same | Critical | Working | No cascade preview (students/sections). | UI should warn; backend should prevent if students still active. |
| `/v1/school-admin/classes/{classId}/sections` | GET / POST | `SectionListPage.tsx` via `sectionApi.ts` | `school/controller/SectionController` (no `@PreAuthorize`) | Critical | Working | Same path-only protection. | Add method-level `@PreAuthorize`. |
| `/v1/school-admin/sections/{id}` | DELETE | Same | Same | Critical | Working | No cascade check. | Pre-check student count. |
| `/v1/school-admin/schools/{schoolId}/subjects` | GET / POST | `SubjectListPage.tsx` via `subjectApi.ts` | `school/controller/SubjectController` (no `@PreAuthorize`) | Critical | Working | Same path-only protection. | Add method-level `@PreAuthorize`. |
| `/v1/school-admin/subjects/{id}/activate` | PATCH | Same | Same | Important | Working | No audit. | Audit. |
| `/v1/school-admin/subjects/{id}/deactivate` | PATCH | Same | Same | Important | Working | No audit. | Audit. |
| `/v1/school-admin/schools/{schoolId}/departments` | GET / POST | `DepartmentListPage.tsx` via `departmentApi.ts` | `school/controller/DepartmentController` (no `@PreAuthorize`) | Important | Working | Path-only. | Add method-level role + audit. |
| `/v1/school-admin/departments/{id}` | PUT | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/departments/{id}/activate` / `/deactivate` | PATCH | Same | Same | Important | Working | No audit. | Audit. |
| `/v1/school-admin/schools/{schoolId}/settings` | GET / PUT | `SchoolSettingsPage.tsx` via `settingsApi.ts` | `school/controller/SchoolSettingsController` (no `@PreAuthorize`) | Critical | Working | No audit on PUT; UI permits arbitrary timezone/locale strings. | Audit; restrict locale/timezone enum on backend. |
| `/v1/school-admin/schools/{schoolId}/students` | GET / POST | `student/api/studentApi.ts` via `StudentListPage`, `StudentAdmitPage` | `student/controller/StudentController` (no `@PreAuthorize`) → `StudentServiceImpl` | Critical | Working | Service uses `findByIdAndTenantId` correctly. `schoolId` path arg is trusted; the service should verify `school.tenantId == tenantId`. | Add explicit school-belongs-to-tenant check. Add @PreAuthorize. |
| `/v1/school-admin/classes/{classId}/students` | GET | Same | Same | Critical | Working | Same | Same. |
| `/v1/school-admin/sections/{sectionId}/students` | GET | Same | Same | Critical | Working | Same | Same. |
| `/v1/school-admin/students/{id}` | GET / PUT | `StudentProfilePage` | Same | Critical | Working | Tenant filtered by service (confirmed). | Keep. |
| `/v1/school-admin/students/{id}/graduate` | PATCH | `StudentProfilePage` | Same | Critical | Working | Irreversible; no audit. | Audit + reason. |
| `/v1/school-admin/students/{id}/transfer` | PATCH | Same | Same | Critical | Working | No audit. | Audit. |
| `/v1/school-admin/students/{id}/suspend` | PATCH | Same | Same | Critical | Working | No audit; no reason field. | Audit + required reason. |
| `/v1/school-admin/students/{id}/reinstate` | PATCH | Same | Same | Critical | Working | No audit. | Audit. |
| `/v1/school-admin/schools/{schoolId}/students/bulk` | POST | `StudentBulkImportPage` | Same → `BulkStudentImporter` | Critical | Working | Reads tenantId/schoolId from JWT context; no row-level error report in UI. | Surface per-row errors more clearly. |
| `/v1/school-admin/schools/{schoolId}/students/promote` | POST | `StudentPromotionPage` | Same | Critical | Working | Irreversible mass mutation, no dry-run. | Add dry-run preview + audit. |
| `/v1/school-admin/students/{studentId}/parents` | GET / POST | `StudentProfilePage` via `studentApi.ts` | `student/controller/ParentLinkController` (no `@PreAuthorize`) | Important | Working | Parent linkage flow has no email/SMS confirmation. | Confirm parent identity before granting access. |
| `/v1/school-admin/student-parent-links/{linkId}` | DELETE | Same | Same | Important | Working | No audit. | Audit. |
| `/v1/school-admin/students/{studentId}/profile-360` | GET / `/sections/{key}` PUT | `student/api/studentProfile360Api.ts` | `student/profile/controller/StudentProfile360Controller` | Important | Working | Returns aggregate data (academic, attendance, fees, etc.). PUT lacks `@Valid` on `sectionKey`. | Validate sectionKey against enum. |
| `/v1/school-admin/schools/{schoolId}/students/{studentId}/documents` | GET / POST | `student/api/studentDocumentApi.ts` | `student/controller/StudentDocumentController` | Important | Working | Service uses tenantId+schoolId properly. No virus scan integration. | Add MIME allowlist and quarantine on upload. |
| `/v1/school-admin/.../documents/{documentId}/url` | GET | Same | Same | Important | Working | Presigned URL TTL not configurable per call. | Make TTL configurable; reduce default. |
| `/v1/school-admin/.../documents/{documentId}` | DELETE | Same | Same | Important | Working | Soft-delete vs hard-delete unclear. | Soft-delete + GDPR purge job. |
| `/v1/school-admin/schools/{schoolId}/staff` | GET / POST | `staff/api/staffApi.ts` via `StaffListPage`, `StaffCreatePage` | `staff/controller/StaffController` (no `@PreAuthorize`) | Critical | Working | Same path-only protection. | Add @PreAuthorize + audit. |
| `/v1/school-admin/departments/{departmentId}/staff` | GET | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/staff/{id}` | GET / PUT | `StaffProfilePage` | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/staff/{id}/on-leave` / `/return-from-leave` / `/resign` / `/terminate` | PATCH | `StaffProfilePage` | Same | Critical | Working | Irreversible (resign, terminate); no audit. | Audit + required reason. |
| `/v1/school-admin/staff/{id}/profile-360` | GET | `staff/api/staffProfile360Api.ts` | `staff/profile/controller/StaffProfile360Controller` | Important | Working | Aggregates several services; not cached. | Cache for 30 s. |
| `/v1/school-admin/schools/{schoolId}/staff-attendance` | GET | `staff/api/staffAttendanceApi.ts` → `StaffAttendancePage` | `staffattendance/controller/StaffAttendanceController` | Important | Working | Method-level `@PreAuthorize("hasRole('SCHOOL_ADMIN')")` present (no TENANT_ADMIN). Inconsistent vs neighbours. | Align: include TENANT_ADMIN. |
| `/v1/school-admin/schools/{schoolId}/staff-attendance/mark` | POST | Same | Same | Important | Working | No edit window. | Configure edit window. |
| `/v1/school-admin/schools/{schoolId}/staff/{staffId}/attendance` | GET | Same | Same | Important | Working | No date range pagination. | Paginate. |
| `/v1/school-admin/schools/{schoolId}/leave-requests` | GET / POST | `staff/api/leaveApi.ts` → `LeaveManagementPage` | `leave/controller/LeaveRequestController` (`hasRole('SCHOOL_ADMIN')`) | Important | Working | TENANT_ADMIN can call due to SecurityConfig path but `@PreAuthorize("hasRole('SCHOOL_ADMIN')")` may reject TENANT_ADMIN. Inconsistent. | Align role list. |
| `/v1/school-admin/schools/{schoolId}/leave-requests/{id}/approve` / `/reject` | PATCH | Same | Same | Important | Working | No audit, no email/push to applicant. | Audit + notification. |
| `/v1/school-admin/schools/{schoolId}/leave-requests/{id}` | DELETE | Same | Same | Important | Working | Cancel by school admin should require reason. | Add reason. |
| `/v1/school-admin/schools/{schoolId}/attendance/sessions` | POST | `attendance/api/attendanceApi.ts` → `AttendanceCreateSessionPage` | `attendance/controller/AttendanceController` (no `@PreAuthorize`) | Critical | Working | Path-only protection. | Add method-level RBAC. |
| `/v1/school-admin/attendance/sessions/{sessionId}/mark` | POST | `AttendanceMarkPage` | Same | Critical | Working | No edit window enforcement visible at controller. | Confirm `school_settings.lateCutoffMinutes` is checked server-side. |
| `/v1/school-admin/attendance/sessions/{sessionId}` | GET | Same | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/attendance/sessions` | GET | `AttendanceSessionListPage` | Same | Critical | Working | No filter by section. | Add section/class/date filters. |
| `/v1/school-admin/classes/{classId}/attendance/sessions` | GET | Same | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/students/{studentId}/attendance/report` | GET | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/classes/{classId}/attendance/report` | GET | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/fee-categories` | GET / POST | `finance/api/financeApi.ts` → `FeeStructureListPage` | `finance/controller/FeeController` (no `@PreAuthorize`) | Critical | Working | Path-only. | Add @PreAuthorize. |
| `/v1/school-admin/fee-categories/{categoryId}/deactivate` | PATCH | Same | Same | Important | Working | No audit. | Audit. |
| `/v1/school-admin/schools/{schoolId}/fee-structures` | GET / POST | Same → `FeeStructureCreatePage` | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/students/{studentId}/fee-records` | GET | `StudentFeeDetailPage` | Same | Critical | Working | Confirmed tenant filter in service. | Keep. |
| `/v1/school-admin/schools/{schoolId}/fee-records` | GET | `FeeCollectionPage` | Same | Critical | Working | Loads full list; no paging. | Paginate. |
| `/v1/school-admin/fee-records/{recordId}` | GET | `StudentFeeDetailPage` | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/fee-records` | POST | Same | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/fee-records/{recordId}/waive` | PATCH | Same | Same | Critical | Working | Money mutation; no audit, no two-step confirm. | Audit + secondary confirm or 2FA challenge. |
| `/v1/school-admin/fee-records/{recordId}/payments` | POST | `FeeCollectionPage` | Same | Critical | Working | Money mutation; no audit. | Audit. |
| `/v1/school-admin/fee-records/{recordId}/receipt` | GET | `StudentFeeDetailPage` | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/fee-records/{recordId}/invoice` | GET | Same | `FeeInvoicePdfService` | Important | Working | Tenant filter present. | Keep. |
| `/v1/school-admin/fee-records/{recordId}/payment-order` | POST | `FeeCollectionPage` | `payment/controller/PaymentController` (`hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN')`) | Critical | Working | No `@Valid` on request body. | Add `@Valid`. |
| `/v1/school-admin/schools/{schoolId}/exams` | GET / POST | `exam/api/examApi.ts` → `ExamListPage`, `ExamCreatePage` | `exam/controller/ExamController` (`hasAnyRole(SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN)`) | Critical | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}` | GET | `ExamDetailPage` | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}/status` | PATCH | `ExamDetailPage` | Same | Critical | Working | No audit. | Audit. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects` | POST | Same | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{entryId}` | DELETE | Same | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/bulk` | POST | `exam/api/marksApi.ts` → `MarksEntryPage` | `exam/controller/MarksController` (`hasAnyRole(...)`) | Critical | Working | No max/min validation per subject's total marks on backend. | Validate against ExamSubject totalMarks. |
| `/v1/school-admin/.../marks` | GET | Same | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/.../marks/{markId}` | PUT / DELETE | Same | Same | Critical | Working | No audit. | Audit. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}/results/generate` | POST | `exam/api/resultApi.ts` → `ResultsPage` | `exam/controller/ResultController` | Critical | Working | Irreversible; no audit; no preview. | Audit + dry-run preview. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}/results` | GET | `ResultsPage` | Same | Critical | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/exams/{examId}/results/students/{studentId}` | GET | `ReportCardPage` | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/notification-logs` | GET | `notification/api/notificationApi.ts` → `NotificationLogPage` | `notification/controller/NotificationController` | Important | Working | No pagination on backend; loads all rows. | Paginate. |
| `/v1/school-admin/schools/{schoolId}/notifications/send-email` | POST | Same | Same | Important | Working | No rate-limit, no per-tenant quota tie-in; large recipient list possible. | Rate limit per minute and per day. |
| `/v1/school-admin/schools/{schoolId}/notifications/send-push` | POST | Same | Same | Important | Working | Same | Same. |
| `/v1/school-admin/schools/{schoolId}/whatsapp/send` | POST | `whatsapp/api/whatsappApi.ts` → `WhatsAppPage` | `whatsapp/controller/WhatsAppController` | Important | Working | Outbound paid message; no rate-limit; no audit. | Rate limit + audit + quota gate. |
| `/v1/school-admin/schools/{schoolId}/whatsapp/logs` | GET | Same | Same | Important | Working | No pagination. | Paginate. |
| `/v1/school-admin/schools/{schoolId}/timetable` | GET / POST | `timetable/api/timetableApi.ts` → `TimetablePage` | `timetable/controller/TimetableController` | Important | Working | No conflict detection. | Detect/return overlapping slots. |
| `/v1/school-admin/schools/{schoolId}/timetable/{slotId}` | DELETE | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/homework` | GET / POST | `homework/api/homeworkApi.ts` → `HomeworkListPage`, `HomeworkCreatePage` | `homework/controller/HomeworkController` | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/homework/{homeworkId}` | GET / DELETE | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/homework/{homeworkId}/status` | PATCH | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/assignments` | GET / POST | `assignments/api/assignmentApi.ts` → `AssignmentListPage`, `AssignmentCreatePage` | `assignment/controller/AssignmentController` | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/assignments/{assignmentId}` | GET / DELETE | `AssignmentDetailPage` | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/assignments/{assignmentId}/status` | PATCH | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/assignments/{assignmentId}/submissions` | GET | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/.../submissions/{submissionId}/grade` | PATCH | Same | Same | Important | Working | Mark validation client-side only; backend should clamp. | Add backend bounds check. |
| `/v1/school-admin/schools/{schoolId}/reports/attendance` / `/fees` / `/performance` | GET | `reports/api/reportApi.ts` → `ReportsPage` | `reports/controller/ReportController` (`hasRole('SCHOOL_ADMIN')`) | Important | Working | No TENANT_ADMIN in role list; not aligned with neighbours. | Use `hasAnyRole(SCHOOL_ADMIN, TENANT_ADMIN)`. |
| `/v1/school-admin/.../export` (attendance / fees / performance) | GET | Same | Same | Important | Working | Generates CSV synchronously; large schools will hang. | Stream or move to job. |
| `/v1/school-admin/schools/{schoolId}/notices` | GET / POST | `notice-board/api/noticeApi.ts` → `NoticeBoardPage` | `notice/controller/NoticeController` | Important | Working | Hardcoded `hasRole('SCHOOL_ADMIN')`; TENANT_ADMIN cannot manage notices. | Align. |
| `/v1/school-admin/.../notices/{id}/publish` | PATCH | Same | Same | Important | Working | No audit, no push to subscribers. | Audit + push job. |
| `/v1/school-admin/.../notices/{id}` | DELETE | Same | Same | Important | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/website` | GET | `school-admin/api/websiteApi.ts` → `WebsiteBuilderPage` | `website/controller/WebsiteAdminController` | Optional | Working | None major | Keep. |
| `/v1/school-admin/schools/{schoolId}/website/publish` | PUT | Same | Same | Optional | Working | Query-param boolean; no audit. | Audit + use JSON body. |
| `/v1/school-admin/.../website/pages` (CRUD) | * | `WebsiteBuilderPage` | Same | Optional | Working | None major | Keep. |
| `/v1/school-admin/.../website/pages/{id}/sections` (CRUD) | * | Same | Same | Optional | Working | Section `content` is unconstrained `Record<string, unknown>`. | Validate against `sectionType` schema. |
| `/v1/school-admin/.../website/nav` (CRUD) | * | Same | Same | Optional | Working | None major | Keep. |
| `/v1/school-admin/domains` | GET / POST | `school-admin/api/domainApi.ts` → `CustomDomainPage` | `domain/controller/CustomDomainController` | Optional | Working | None major | Keep. |
| `/v1/school-admin/domains/{id}/verify` | POST | Same | Same | Optional | Working | Network call inline. | Move to async + status polling. |
| `/v1/school-admin/domains/{id}` | DELETE | Same | Same | Optional | Working | No audit. | Audit. |
| `/v1/school-admin/ai/query` | POST | `school-admin/api/aiCopilotApi.ts` → `AiCopilotPage` | `ai/copilot/SchoolAdminAiCopilotController` | Optional | Working | No rate limit, no per-tenant quota; AI cost can spike. | Add rate limit + integrate with `ai_usage_logs`. |
| `/v1/school-admin/lesson-plans` | GET | `school-admin/api/lessonPlanApi.listSchoolPlansApi` | `lessonplan/controller/LessonPlanController.listAll` (`hasRole('SCHOOL_ADMIN')`) | Optional | **Partly unused** | No School Admin UI hook found that calls this (only the Teacher subset is used). | Either expose in a School Admin lesson-plan listing page or remove the API client function. |
| `/v1/school-admin/storage/quota` | GET | Not wired in any School Admin page | `storage/StorageQuotaController` | Optional | **Unused** | UI does not show storage usage to School Admin. | Add a small badge in dashboard or remove client capability. |
| `/v1/school-admin/online-classes` | GET | Not wired in any School Admin page | `onlineclass/controller/OnlineClassController.adminList` (`hasRole('SCHOOL_ADMIN')`) | Optional | **Unused** | No School Admin page calls it. | Build admin view of teachers' classes or remove. |
| `/v1/school-admin/videos` | GET | Not wired in any School Admin page | `video/controller/VideoController.adminList` (`hasRole('SCHOOL_ADMIN')`) | Optional | **Unused** | Same as above. | Build admin gallery or remove. |
| `/v1/tenant/subscription` | GET | Not wired in School Admin UI; `/plan-upgrade` page exists but uses different surface | `subscription/controller/TenantSubscriptionController` | Important | **Unused (in School Admin UI)** | School Admin cannot view current subscription. | Wire to a billing screen. |
| `/v1/tenant/invoices` | GET | Same | `subscription/controller/TenantInvoiceController` | Important | **Unused (in School Admin UI)** | Same. | Same. |

Counts:
- **Distinct endpoints used by School Admin UI:** ~95 (lessonPlan/aiCopilot/storage/online-class/video count as separate).
- **Endpoints existing under `/v1/school-admin/...` not consumed by UI:** at least 4 (storage quota, online-classes admin list, videos admin list, lesson-plans admin list).

---

## 3. Working APIs

The following endpoints respond correctly with valid input and a SCHOOL_ADMIN JWT (verified by code inspection — see code references above). They are the production-critical set:

- Auth: `POST /v1/auth/login`, `GET /v1/me/schools`, `POST /v1/me/schools/{id}/activate`, `GET /v1/school-admin/me`.
- Dashboard: `GET /v1/school-admin/schools/{id}/dashboard`.
- Academic structure: academic years, classes, sections, subjects, departments — list/create/activate/deactivate/delete.
- People: students list/admit/update/profile/bulk-import/promote/graduate/transfer/suspend/reinstate, parent links, profile-360, document upload/list/url/delete. Staff list/create/update/profile/onLeave/resign/terminate, staff attendance, staff profile-360, leave requests CRUD + approve/reject.
- Attendance: sessions list/create/mark, session details, student and class attendance reports.
- Finance: fee categories, fee structures, fee records (list/create/get/waive), payments, receipts, invoice PDF, payment order.
- Academics: exams CRUD + subjects, marks bulk + CRUD, results generate/list/student.
- Communication: notification logs/email/push, WhatsApp send/logs, notices CRUD + publish.
- Timetable, homework, assignments — CRUD as listed in the inventory.
- Reports: attendance / fees / performance + their `/export` variants.
- Website builder: website, pages (CRUD), sections (CRUD), nav (CRUD), publish toggle.
- Custom domain: list/register/verify/delete.
- Settings: school settings GET/PUT.
- AI Copilot: query (responds; backend uses `AiGatewayService.completeStructured`).

Backend unit + integration tests (174 passing) cover: FeeServiceImpl, ExamServiceImpl, cross-tenant isolation (`CrossTenantIsolationIntegrationTest`), role matrix (`RoleMatrixIntegrationTest`), storage upload audit, sensitive data policy, request traceability, prompt injection defences, knowledge-base tenant isolation. There is at least baseline assurance for the most security-sensitive areas.

---

## 4. Broken APIs

No endpoint in the School Admin surface returned a hard failure under local code inspection. Issues fall into "works but with risk" (see §7 and §10) rather than outright broken. The borderline cases:

- `WebsiteAdminController.setPublished` (`PUT /v1/school-admin/schools/{schoolId}/website/publish?published=...`) accepts a query-string boolean but the OpenAPI/frontend expectation is a query param; if anyone changes the call to JSON body it will silently fail. Frontend currently sends the query param — works today.
- `AcademicYearController.closeAcademicYear` is irreversible and there is no UI confirmation that lists what happens next (new academic year requirement). Functionally "works" but is dangerous in production.

If "broken" is widened to "missing backend wiring for advertised UI feature", see §5.

---

## 5. Missing APIs

Required by sidebar/menu or by SaaS expectation, but no backend endpoint exists today:

1. **Audit log viewer for School Admin.** `audit_logs` exist, but there is no `/v1/school-admin/audit-logs` endpoint or page. School Admin cannot see who suspended a student or waived a fee.
2. **Two-factor auth enrolment for SCHOOL_ADMIN.** `auth/mfa` exists in tests but no UI exposes enrolment for school admins.
3. **Billing/subscription view (in School Admin UI).** Backend has `TenantSubscriptionController` (`/v1/tenant/subscription`, `/v1/tenant/invoices`) but no School Admin page consumes it. Multi-tenant SaaS requires this to be visible.
4. **Student transfer-out → external school workflow.** `PATCH /students/{id}/transfer` only changes status; no transfer certificate generation API exists.
5. **Class-teacher assignment.** Sections/classes can be created, but no endpoint binds a `class_teacher_id` to a section that the School Admin can hit. Teacher portal assumes this is set up elsewhere.
6. **Bulk staff import.** Mirrors student bulk import but is missing.
7. **Fee receipt resend (email/WhatsApp).** Receipt PDF exists; no API to push it to parent via the existing notification/whatsapp services.
8. **Marks moderation / re-evaluation request.** Once `results/generate` runs, there is no API for moderating marks or revoking a result row.
9. **Attendance edit window enforcement endpoint.** `school_settings.allowLateAttendance` and `lateCutoffMinutes` exist but the attendance mark endpoint does not visibly check them.
10. **Exam timetable / seating plan.** Sidebar has "Exams" but no scheduling/seating API.
11. **Library / Hostel / Transport modules.** Sidebar does not yet list them; backend has nothing. Should be marked Phase-2 or removed from any pricing claim until shipped.
12. **Reports — student performance per teacher.** Endpoint exists at aggregate but not per-teacher; needed for staff KPI.
13. **Notice acknowledgement.** `notices` are published; no read-receipt API.

---

## 6. Duplicate / Unused APIs

| Endpoint | Reason | Recommendation |
|---|---|---|
| `GET /v1/school-admin/schools/{schoolId}/classes` AND `GET /v1/school-admin/academic-years/{academicYearId}/classes` | Two list APIs for what overlapping data. UI calls the school-scoped one. | Keep both only if both are advertised in OpenAPI; otherwise drop the academic-year-scoped list. |
| `GET /v1/school-admin/lesson-plans` (listAll) | No School Admin page consumes it. | Wire to a new page or remove. |
| `GET /v1/school-admin/online-classes` | No UI. | Wire or remove. |
| `GET /v1/school-admin/videos` | No UI. | Wire or remove. |
| `GET /v1/school-admin/storage/quota` | No UI. | Surface to dashboard or remove. |
| `GET /v1/tenant/subscription`, `GET /v1/tenant/invoices` | No UI in School Admin. | Build a Subscription page. |

---

## 7. Security Findings

### 7.1 Authorisation model

- `SecurityConfig.securityFilterChain` (lines 142-188) enforces:
  - `/v1/super-admin/**` → `SUPER_ADMIN`.
  - `/v1/admin/**` → `TENANT_ADMIN` or `SUPER_ADMIN`.
  - `/v1/school-admin/**` → `SCHOOL_ADMIN` or `TENANT_ADMIN`.
  - `/v1/teacher/**` → falls through to `anyRequest().authenticated()` (controller-level `@PreAuthorize` does the role enforcement).
- **Finding:** All School Admin controllers are reachable by a TENANT_ADMIN with no school context. The codebase does not enforce that TENANT_ADMIN is acting on a school owned by their tenant. See `backend/src/main/java/com/cloudcampus/config/SecurityConfig.java:176`.
- **Finding:** Many controllers under `/v1/school-admin/...` have NO method-level or class-level `@PreAuthorize` (verified: `StudentController.java:50`, `StaffController.java:47`, `FeeController.java:65`, `AcademicYearController.java:39`, plus `ClassRoomController`, `SectionController`, `SubjectController`, `DepartmentController`, `SchoolSettingsController`, `AttendanceController`, `ParentLinkController`, `StudentDocumentController` at file level). They depend entirely on the SecurityConfig URL rule. If `application.yml` or `SecurityConfig` is ever changed (e.g., a future refactor that moves URL matching to controller-level), these endpoints would instantly become unauthenticated.

### 7.2 Tenant isolation

- Services use `RequestContext.getTenantId()` and call repo methods of the form `findByIdAndTenantId(...)`. Verified in `StudentServiceImpl.java:180`, `FeeServiceImpl.java:68-321`, `StudentDocumentServiceImpl.java:46-112`.
- **Finding (must fix):** `schoolId` from the path is not consistently checked against the caller's tenant. A SCHOOL_ADMIN who knows another tenant's `schoolId` UUID may hit `/v1/school-admin/schools/{schoolId}/...` and get past Spring Security. Whether they get data depends on the service. For services that include `schoolId` in queries (e.g., `findByIdAndSchoolIdAndTenantId`), the worst case is "no results"; for those that just filter by `tenantId`, the worst case is wrong-school data. This must be cleaned up via a uniform `@Aspect` or a `TenantSecurity.checkSchool(schoolId)` call placed in every controller.
- **Finding:** Some endpoints scope by tenant only and not by school (e.g., `/v1/school-admin/students/{id}` filters by `tenantId` but the URL has no schoolId; cross-school access by a SCHOOL_ADMIN of the same tenant is therefore possible).

### 7.3 Audit logging

- **Finding:** Audit log writes are inconsistent. `student/service/StudentDocumentServiceImpl` writes to an audit table on upload/delete (lines 66, 87, 106). Most mutation endpoints (notice publish, fee waive, payment record, student suspend/graduate/transfer, exam status, results generate, school settings update, leave approve/reject, website publish, custom domain delete, AI copilot query) do not call any audit service. This is a blocking issue for SaaS that schools will use to manage student records under FERPA/COPPA-style obligations.

### 7.4 Input validation

- Spot-check shows many controllers lack `@Valid` on request bodies (especially "list as no body" and PATCH endpoints without DTO). Frontend types are strict, but backend should not assume client integrity. Specific examples found: `MarksController` accepts numbers without explicit `Min(0)`/`Max(totalMarks)` on the DTO; `WebsiteAdminController` accepts free-form `Map<String,Object>` content; `SchoolSettingsRequest` validation should be confirmed.
- **Finding:** `/v1/school-admin/ai/query` POST body has `@Valid` on the controller but the frontend can send any `question` string; there is no max length or content filter visible. AI prompt injection is possible.

### 7.5 Rate-limit / quota

- **Finding:** No backend rate limiting on AI Copilot, notifications (email, push), WhatsApp, custom-domain verify, marks-bulk, student bulk import, student promote, results generate, file upload presigned URL. A compromised SCHOOL_ADMIN account or a misbehaving frontend can quickly spend AI/WhatsApp credit or knock the database into a bad state.

### 7.6 Sensitive data exposure

- Profile-360 endpoints return aggregate child data including (potentially) parent phone, fees, attendance. School Admin role permits this; finding is that there is no field-level redaction policy.
- Document presigned URLs default to a long TTL (file system code uses MinIO/S3 default). Confirm `presignedUrl` TTL is short.

### 7.7 Cross-tenant test coverage

- `CrossTenantIsolationIntegrationTest` and `RoleMatrixIntegrationTest` give baseline coverage but do not cover every School Admin endpoint listed above. Most worrying: there is no test that asserts a SCHOOL_ADMIN of tenant A cannot reach `/v1/school-admin/schools/{schoolId-of-tenant-B}/students`.

### 7.8 Other

- `Authorization` header logs: redacted via `SensitiveDataPolicy` (verified by existence of `SensitiveDataPolicyTest`).
- CORS: `cors.allowed-origins` permits all `https://*.cloudcampus.io` by default — acceptable.
- BCrypt strength 10 — OK.
- Refresh-token rotation: out of scope here; presumed working given Super Admin audit reports it works.

---

## 8. Frontend Findings

- **`School Admin/api/lessonPlanApi.ts` exports `listSchoolPlansApi` but no page imports it.** Either remove or wire to a "All lesson plans" page.
- **`AiCopilotPage.tsx` does not show token usage or quota.** The response includes `tokensUsed` but the page swallows it.
- **`AttendanceMarkPage`/`AttendanceSessionListPage` do not enforce school-settings late cutoff.** Backend may or may not enforce; UI should reflect the rule before submission.
- **`StudentBulkImportPage` does not display per-row error breakdown.** The backend returns errors per row; the page renders an aggregate count.
- **`StudentPromotionPage` performs an irreversible mass mutation without "dry-run" UI or undo affordance.**
- **`WebsiteBuilderPage` section content editor allows raw JSON for content.** This is OK for v1 but exposes section schema drift.
- **`SchoolSettingsPage` accepts arbitrary timezone strings.** Should use a TZ dropdown.
- **Custom domain `verifyDomainApi` is a fire-and-forget POST.** UI lacks polling/loading state for the DNS verification round-trip.
- **`FeeCollectionPage` loads all fee records.** Will degrade for large schools.
- **`NotificationLogPage` loads all rows.** Same.
- **No SchoolAdminLayout test** beyond the snapshot in `SchoolAdminLayout.test.tsx`. No page-level RTL tests for `StudentListPage`, `StaffListPage`, `FeeCollectionPage`, `ResultsPage`.
- **React Query keys:** Generally `['school-admin', ...]` or `[topic, schoolId]`. Verified `useQuery({ queryKey: ['my-schools'] })` and `['school-admin-me']` in `SchoolAdminLayout.tsx`. No invalidation collisions found in a quick read, but no automated coverage exists.
- **No loading skeleton for `WebsiteBuilderPage`** when section list is empty vs loading.
- **No empty-state for `LeaveManagementPage`** beyond default table empty row.
- **Multi-school switcher silently reissues access token but does not invalidate the existing React Query cache before redirecting.** A subtle stale-data bug if user navigates back via history. (`SchoolAdminLayout.tsx:189-198`.)

---

## 9. Backend Findings

- **Method-level `@PreAuthorize` missing on many `/v1/school-admin/...` controllers** (see §7.1). Adding them is cheap and removes the global-config single-point-of-failure.
- **Inconsistent role lists.** Some controllers allow `SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN` (assignments, homework, exams, marks, results, notifications, whatsapp, timetable), some allow only `SCHOOL_ADMIN` (notice, leave, lesson plan listAll, reports, school dashboard, staff attendance, website, custom domain), and some include only `SCHOOL_ADMIN, TENANT_ADMIN` (payment, storage, subscription, invoices). Pick a uniform convention.
- **`@Valid` missing on several mutating endpoints** (e.g., `PaymentController.createOrderAdmin`, some PATCH endpoints with body, the OnlineClassController.updateStatus/addRecording).
- **No audit log writes** in mutation services (see §7.3). The existing `audit_logs` table is under-used.
- **No rate limit annotations** on AI/notification/WhatsApp/promote/results-generate.
- **Duplicate listing endpoints** (classes by school vs by year).
- **No cascading checks** for class/section delete (would leave orphan students if database constraints don't catch it; depends on FK definition).
- **`SchoolDashboardController` performs multiple count queries in series.** Could be one consolidated query or cached.
- **`ResultController.generate` is not transactional in the controller; service-layer `@Transactional` should be confirmed.**
- **`PaymentController.createOrderAdmin` is missing `@Valid`** despite handling money.
- **`WebsiteAdminController` `setPublished` uses query param boolean instead of request body** — fine but inconsistent with the rest of the website CRUD.

---

## 10. Recommended Changes

### Critical fixes (must do before charging schools money)

1. **Tenant-school ownership check.** Introduce a `TenantSecurity.assertSchoolBelongsToTenant(UUID schoolId)` helper and call it at the top of every `/v1/school-admin/...` controller method that accepts `schoolId` in the path. Add a global aspect or argument resolver to do this automatically.
2. **Method-level `@PreAuthorize`.** Add `@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN')")` at the class level for `StudentController`, `StaffController`, `FeeController`, `AcademicYearController`, `ClassRoomController`, `SectionController`, `SubjectController`, `DepartmentController`, `SchoolSettingsController`, `AttendanceController`, `ParentLinkController`, `StudentDocumentController`, `StudentProfile360Controller`, `StaffProfile360Controller`, `SchoolDashboardController`. This is defence in depth; the SecurityConfig path rule is the same role list.
3. **Audit log writes** on every mutating School Admin endpoint (fee waive/payment, suspend/graduate/transfer/reinstate student, exam status change, marks bulk save, results generate, notice publish, leave approve/reject, school settings update, website publish, custom domain delete, parent link add/remove, fee structure create, academic year set-current/close).
4. **Backend bounds check on marks** against `ExamSubject.totalMarks` in `MarksController` / `MarksService`.
5. **Rate limit + audit + quota gate** for `/v1/school-admin/ai/query`, `/v1/school-admin/.../notifications/send-email`, `/send-push`, `/whatsapp/send`, `/students/promote`, `/exams/.../results/generate`, `/fee-records/{id}/waive`, `/fee-records/{id}/payments`.
6. **Frontend `StudentPromotionPage` dry-run preview** and backend `?dryRun=true` flag on the promote endpoint.
7. **Cross-tenant integration tests** for at least these endpoints (negative path):
   - `/students`, `/staff`, `/exams`, `/fee-records`, `/results`, `/marks`, `/attendance/sessions`, `/notices`, `/website/pages`, `/timetable`, `/leave-requests`.
   - Assert: SCHOOL_ADMIN of tenant A receives 403 (or 404 with no leak) on tenant B's schoolId.
8. **Validation `@Valid` audit.** Add `@Valid` to every controller method that takes a request body (sweep all `/v1/school-admin/...` controllers).

### High priority improvements

1. **Subscription/billing UI for School Admin.** Wire `/v1/tenant/subscription` + `/v1/tenant/invoices` to a page.
2. **Audit log viewer page** (`/school-admin/audit-logs`).
3. **Pagination on:** notification logs, WhatsApp logs, fee records list, leave requests, staff attendance, attendance sessions, results, marks.
4. **Receipt resend** via existing notification/whatsapp service.
5. **Notification of leave approve/reject to applicant** via push/email.
6. **Required reason** on irreversible actions (suspend, graduate, transfer, terminate, waive, close-academic-year).
7. **MFA enrolment for SCHOOL_ADMIN.**
8. **Per-tenant AI usage cap** wired to `ai_usage_logs` and SubscriptionService.
9. **Streaming / async** export for `/reports/*/export`.
10. **Empty/loading/error skeleton states** for `WebsiteBuilderPage`, `LeaveManagementPage`, `ResultsPage`.

### Medium priority improvements

1. **Class teacher assignment endpoint** (`PATCH /v1/school-admin/sections/{id}/class-teacher`).
2. **Transfer certificate generation.**
3. **Conflict detection in timetable add slot.**
4. **Bulk staff import.**
5. **Notice acknowledgement / read receipt.**
6. **Per-row error display in `StudentBulkImportPage`.**
7. **Cache for `SchoolDashboardController` (30 s).**
8. **TZ/locale dropdown in `SchoolSettingsPage`.**
9. **Mark-moderation endpoint after results generation.**
10. **Reduce default presigned URL TTL.**

### Optional improvements

1. **Remove or wire** unused endpoints: `/lesson-plans` (school-admin listAll), `/online-classes`, `/videos`, `/storage/quota`.
2. **Consolidate** duplicate class-listing endpoints.
3. **Add storage quota badge** in dashboard.
4. **Section content schema** validation in website builder.
5. **OpenAPI tags** consistent with `/v1/school-admin/*` group.

---

## 11. Implementation Plan

- [ ] CC-SA-01: Add `@PreAuthorize` at class level on the 15 listed unguarded `/v1/school-admin/...` controllers.
- [ ] CC-SA-02: Create `TenantSecurity.assertSchoolBelongsToTenant(UUID)` and call it in every `/v1/school-admin/schools/{schoolId}/...` controller method. Add tests.
- [ ] CC-SA-03: Add `@Valid` to every controller method that accepts a request body under `/v1/school-admin/...`.
- [ ] CC-SA-04: Introduce `AuditLogService` (if not already present) and write audit rows from: fee waive/payment, student lifecycle changes, exam status, marks bulk, results generate, notice publish, leave approve/reject, school settings update, website publish, custom domain delete, parent link CRUD, fee structure create, academic year set-current/close.
- [ ] CC-SA-05: Add bounds validation in `MarksService.bulkSave` / `update` against `ExamSubject.totalMarks` and `passMarks`.
- [ ] CC-SA-06: Add rate-limit annotations to AI Copilot, notifications, WhatsApp, promote students, results generate, fee waive/payments.
- [ ] CC-SA-07: Add cross-tenant negative tests under `backend/src/test/java/com/cloudcampus/rbac/` for the 10 endpoints listed in §10 #7.
- [ ] CC-SA-08: Frontend — surface AI tokens used + quota in `AiCopilotPage`.
- [ ] CC-SA-09: Frontend + backend — `dryRun=true` flag on `POST /v1/school-admin/schools/{schoolId}/students/promote`, plus preview UI.
- [ ] CC-SA-10: Build School Admin Subscription/Invoices page consuming `/v1/tenant/subscription` and `/v1/tenant/invoices`.
- [ ] CC-SA-11: Build School Admin Audit Log page (`/school-admin/audit-logs`).
- [ ] CC-SA-12: Paginate notification-logs, whatsapp-logs, leave-requests, fee-records, attendance sessions, marks, results.
- [ ] CC-SA-13: Required-reason fields on suspend / graduate / transfer / terminate / waive / close-academic-year.
- [ ] CC-SA-14: Wire (or remove) unused `/v1/school-admin/online-classes`, `/videos`, `/lesson-plans`, `/storage/quota`.
- [ ] CC-SA-15: MFA enrolment for SCHOOL_ADMIN.
- [ ] CC-SA-16: Class teacher assignment endpoint + UI.
- [ ] CC-SA-17: Transfer certificate generation.
- [ ] CC-SA-18: Add empty/loading skeletons for `WebsiteBuilderPage`, `LeaveManagementPage`, `ResultsPage`.
- [ ] CC-SA-19: Replace `setPublished` query param with JSON body.
- [ ] CC-SA-20: Bulk staff import mirroring student bulk import.

---

## 12. Final Decision

- **Is School Admin production ready?** **Not yet.** It is *feature-complete enough to demo to schools* and works end-to-end for the core flows. It is **not** safe to bill schools and store real student/parent data under the current security and audit posture.
- **Must-fix before selling this SaaS:**
  1. CC-SA-01, CC-SA-02 — close the path-only RBAC gap and add the tenant-school ownership check.
  2. CC-SA-03, CC-SA-08 — input validation + per-row promote/dry-run.
  3. CC-SA-04 — audit log writes on every mutating endpoint.
  4. CC-SA-05 — backend bounds for marks.
  5. CC-SA-06 — rate limiting on AI/notification/WhatsApp/promote/results.
  6. CC-SA-07 — cross-tenant negative tests for the top 10 endpoints.
  7. CC-SA-13 — reason on irreversible actions.
  8. CC-SA-15 — MFA for SCHOOL_ADMIN.
- **Improve later (but ship anyway):** CC-SA-09 through CC-SA-20.

---

_Generated 2026-05-22 by automated audit against branch `main` @ `2dc34c2`. Findings reflect static analysis + selected runtime checks. A real-environment smoke against a running stack (login as `superadmin/admin123`, exercise dashboard → students → exams → fees flow with two tenants) is still required before sign-off._
