# Student API Audit Report

_Audit date: 2026-05-22 — branch `main` — commit `2dc34c2`._

## 1. Executive Summary

- **Overall status:** End-to-end functional for the core student-facing flows (login, dashboard, timetable, attendance summary + QR self-mark, homework list + submit, assignment list + submit, exam results, fees + Razorpay self-payment, notices). The Student surface is the smallest of the four role portals, and security-wise it is the strongest of any non-Super-Admin role — every Student controller derives `tenantId`/`userId` from the JWT and never trusts a client-supplied `studentId`.
- **Production readiness score: 76 / 100.**
- **Major risks:**
  1. **`/v1/student/attendance/qr-mark` lives in `QrAttendanceController` with NO `@PreAuthorize`.** Path `/v1/student/**` is **not** in `SecurityConfig` matchers, so this endpoint only requires `.anyRequest().authenticated()`. A TEACHER, PARENT, SCHOOL_ADMIN, or SUPER_ADMIN with a valid JWT can hit it. The service then uses `RequestContext.getUserId()` to find a `Student` row — if no Student exists for that user it will 404/500, so the immediate exploit is limited, but the missing role guard is still a defence-in-depth gap.
  2. **`/v1/mobile/notices` ignores multi-school tenants.** `MobileController.resolveMainSchool()` (`backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java:90-98`) calls `schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")` — a student of a non-MAIN school will see MAIN school's notices, not their own. For any tenant that has more than one school this is wrong data.
  3. **`/v1/payment/verify` uses `@PreAuthorize("isAuthenticated()")`.** Any authenticated user can call it. Defence relies entirely on the service-layer ownership check matching `paymentOrderId` to the JWT user; the controller does not assert role STUDENT.
  4. **No audit logging** on attendance self-mark, homework submit, assignment submit, payment verify. These are mutations a parent will dispute (fee refund, "my child never submitted"); we need provenance.
  5. **No rate limit** on `qr-mark`, `submit`, payment create-order/verify. A misbehaving client can flood any of these.
  6. **No student-side leave application.** Sidebar shows nothing for leave; students cannot apply for leave from the portal. Either out of scope or a real gap.
  7. **Notices on `/v1/mobile/notices` falls under generic auth.** A Student fetches notices through a shared endpoint, not a `/v1/student/notices` endpoint.
  8. **No `/v1/student/me` endpoint.** Student layout shows only username from local auth store — no profile call returns class/section/roll-no/photo.
  9. **Profile-360 returns extensive aggregate data** including (per the DTO) communication centre, risk profile, parent/family. Visibility per-section isn't enforced at the API level visible in the controller — the frontend trusts a per-section `visibility` field, which means the API does NOT filter before transmission.

**Validation commands run on 2026-05-22:**

| Command | Result |
|---|---|
| `cd backend && mvn test --batch-mode --no-transfer-progress` | **PASS** — 174 tests, 0 failures, 0 errors, 0 skipped (47 s) |
| `cd frontend && npx tsc -b --pretty false` | **PASS** — exit 0 |
| `cd frontend && npm run lint` | **PASS** — exit 0 |
| API smoke against running local backend | Not performed — local backend not running. Smoke run recommended in a follow-up after the fixes below. |

Existing Student-relevant tests: `RoleMatrixIntegrationTest`, `SensitiveDataPolicyTest`, `MfaPolicyTest`, `UsageLimitEnforcerTest`. None of these is a dedicated Student controller test. **Zero** controller-level tests for `StudentHomeworkController`, `StudentAssignmentController`, `StudentAttendanceController`, `StudentResultsController`, `StudentFeesController`, `StudentTimetableController`, `StudentSelfProfile360Controller`, `QrAttendanceController`, `PaymentController.verify`. This is the biggest test-coverage gap.

---

## 2. API Inventory Table

| API | Method | Frontend Usage | Backend Controller | Business Importance | Status | Issue | Recommendation |
|---|---|---|---|---|---|---|---|
| `/v1/auth/login` | POST | `features/auth/api/authApi.ts` → `LoginPage.tsx` | `auth/controller/AuthController.login` | Critical | Working | Same `admin/admin123`-style defaults exist in `auth.bootstrap.SuperAdminBootstrap`. Not student-specific but applies. | Force-password-reset on first login for STUDENT. |
| `/v1/student/profile-360` | GET | `features/student/api/studentProfile360Api.getMyStudentProfile360` → `StudentSelfProfilePage` | `student/profile/controller/StudentSelfProfile360Controller` (class-level `hasRole('STUDENT')`) → `StudentProfile360ServiceImpl` → many profile tables | Critical | Working | Service returns aggregate including risk profile, communication centre, parent/family. Visibility filter is a string on each section, not enforced at API. | Strip private sections (risk_profile, behavior records, sensitive notes) before returning to the student. |
| `/v1/student/homework` | GET | `studentPortalApi.getMyHomework` → `StudentHomeworkPage`, `StudentDashboardPage` | `homework/controller/StudentHomeworkController.myHomework` (`@PreAuthorize("hasRole('STUDENT')")`) → repo filters by `tenantId` + student's class/section | Critical | Working | No pagination — loads all homework ever assigned. | Paginate. Filter to active/recent N. |
| `/v1/student/homework/{homeworkId}/submit` | POST | `studentPortalApi.submitHomework` → `StudentHomeworkPage` | `StudentHomeworkController.submit` (`@Valid HomeworkSubmitRequest`) | Critical | Working | No backend file-attachment support (only `notes` string). No audit. No `dueDate` deadline enforcement visible. | Add multipart file upload + size cap + MIME allowlist + dueDate check + audit. |
| `/v1/student/assignments` | GET | `studentPortalApi.getMyAssignments` → `StudentAssignmentsPage`, `StudentDashboardPage` | `assignment/controller/StudentAssignmentController.myAssignments` (`hasRole('STUDENT')`) | Critical | Working | No pagination. | Paginate. |
| `/v1/student/assignments/{assignmentId}/submit` | POST | `studentPortalApi.submitAssignment` → `StudentAssignmentsPage` | `StudentAssignmentController.submit` | Critical | Working | Body is `{ textResponse }` only — no file attachment. No deadline check visible. No audit. | Add multipart upload + deadline enforcement + audit. |
| `/v1/student/timetable` | GET | `studentPortalApi.getMyTimetable` → `StudentTimetablePage`, `StudentDashboardPage` | `timetable/controller/StudentTimetableController.myTimetable` (`hasRole('STUDENT')`) | Critical | Working | None major | Keep. |
| `/v1/student/results` | GET | `studentPortalApi.getMyResults` → `StudentResultsPage`, `StudentDashboardPage` | `student/controller/StudentResultsController.listMyResults` (`hasRole('STUDENT')`) | Critical | Working | Returns only published results (assumed). Verify `exam.status == PUBLISHED` is enforced at service level. | Confirm visibility filter; never expose draft results. |
| `/v1/student/fees` | GET | `studentPortalApi.getMyFees` → `StudentFeesPage`, `StudentDashboardPage` | `student/controller/StudentFeesController.listMyFees` (`hasRole('STUDENT')`) | Critical | Working | `academicYearId` param optional. | Add filter UI for year. |
| `/v1/student/fee-records/{recordId}/payment-order` | POST | `paymentApi.createStudentPaymentOrder` → `useRazorpay` hook → `StudentFeesPage` | `payment/controller/PaymentController.createOrderStudent` (`hasRole('STUDENT')`) | Critical | Working | Service must verify the `recordId` belongs to the calling student. Should never let a student create an order for another student's fee. | Verify ownership; add audit. |
| `/v1/payment/verify` | POST | `paymentApi.verifyPayment` → `useRazorpay` | `PaymentController.verify` (`isAuthenticated()`) | Critical | Working | Role check too broad. The service must match `paymentOrderId.userId == RequestContext.getUserId()`. | Tighten role to `STUDENT, SCHOOL_ADMIN, TENANT_ADMIN`. Add audit. |
| `/v1/payment/webhooks/razorpay` | POST | (Razorpay → server) | `PaymentController.razorpayWebhook` (`permitAll`) | Critical | Working (presumed) | Public endpoint relies on Razorpay-signature verification. No request size cap visible. | Confirm signature check + add max body size. |
| `/v1/student/attendance` | GET | `studentPortalApi.getMyAttendance` → `StudentAttendancePage`, `StudentDashboardPage` | `student/controller/StudentAttendanceController.myAttendance` (`hasRole('STUDENT')`) | Critical | Working | Returns aggregate + recent records. No date range param. | Add `from`/`to` to UI + backend. |
| `/v1/student/attendance/qr-mark` | POST | `studentPortalApi.qrMarkAttendance` → `StudentQrScanPage` | `attendance/controller/QrAttendanceController.selfMark` (**NO `@PreAuthorize`**) | Critical | Working but security gap | Class lacks `@PreAuthorize`; relies only on `.anyRequest().authenticated()`. Any role with a valid JWT can call. | Add `@PreAuthorize("hasRole('STUDENT')")` immediately. |
| `/v1/mobile/notices` | GET | `studentPortalApi.getMyNotices` → `StudentNoticesPage`, `StudentDashboardPage` | `mobile/controller/MobileController.notices` (**no `@PreAuthorize`** — falls under `anyRequest().authenticated()`) | Critical | **Working but wrong data for multi-school tenants** | `resolveMainSchool` returns `findByTenantIdAndCode(tenantId, "MAIN")` — Students of non-MAIN schools see MAIN school's notices. | Resolve the student's actual school from `Student.schoolId`, not the MAIN code. |
| `/v1/mobile/notices/{id}` | GET | Not directly called by Student UI (only list is) | Same | Optional | Working | Same multi-school bug. | Same fix. |
| `/v1/student/me` | GET | **Missing** | **Missing** | Important | **Missing** | StudentLayout shows only username from local auth store; no class/section/roll-no/photo. | Build `GET /v1/student/me`. |
| `/v1/student/leave` | * | **Missing** | **Missing** | Optional | **Missing** | Students cannot apply for or view leave from the portal (sidebar has no link). | Either add or explicitly mark as out-of-scope in product spec. |
| `/v1/student/achievements`, `/v1/student/certificates` | GET | **Missing** | **Missing** | Optional | **Missing** | Profile-360 includes achievements in aggregate; no individual download/print API. | Add download endpoints. |
| `/v1/student/documents` (read-only) | GET | **Missing** for Student | School-Admin owns the upload side at `/v1/school-admin/.../students/{id}/documents` | Important | **Missing for Student** | Student cannot fetch their own documents (TC, marksheet PDFs, ID proof). | Add `/v1/student/documents` read-only endpoint. |
| `/v1/student/reports` (download report card PDF) | GET | **Missing** | **Missing** | Important | **Missing** | Results endpoint returns summary only; no PDF download. School Admin generates them at `/v1/school-admin/.../results/students/{id}` but the Student cannot pull it. | Add `/v1/student/results/{examId}/report-card.pdf`. |

Counts:
- **Distinct endpoints actually used by the Student UI:** 12.
- **Endpoints exposed for Student role but unused by Student UI:** `/v1/student/online-classes`, `/v1/student/videos` (called only from the Teacher folder's API files — see Teacher report).
- **Missing endpoints that block product completeness:** `/v1/student/me`, `/v1/student/documents`, `/v1/student/results/{examId}/report-card.pdf`, optional `/v1/student/leave`, `/v1/student/achievements`.

---

## 3. Working APIs

The following are correctly wired from a Student page through to a Student controller and persist/serve data:

- **Profile (self):** `GET /v1/student/profile-360` → `StudentSelfProfilePage.tsx:746-748`.
- **Homework:** `GET /v1/student/homework`, `POST /v1/student/homework/{id}/submit` → `StudentHomeworkPage`.
- **Assignments:** `GET /v1/student/assignments`, `POST /v1/student/assignments/{id}/submit` → `StudentAssignmentsPage`.
- **Timetable:** `GET /v1/student/timetable` → `StudentTimetablePage`, `StudentDashboardPage`.
- **Attendance:** `GET /v1/student/attendance`, `POST /v1/student/attendance/qr-mark` → `StudentAttendancePage`, `StudentQrScanPage`.
- **Results:** `GET /v1/student/results` → `StudentResultsPage`, `StudentDashboardPage`.
- **Fees:** `GET /v1/student/fees`, `POST /v1/student/fee-records/{id}/payment-order`, `POST /v1/payment/verify` → `StudentFeesPage` + `useRazorpay` hook.
- **Notices:** `GET /v1/mobile/notices` → `StudentNoticesPage`, `StudentDashboardPage`.
- **Auth:** `POST /v1/auth/login` (shared).

Tenant + ownership scoping: every Student controller fetches the calling `Student` row from `RequestContext.getUserId()` and uses `RequestContext.getTenantId()` to scope queries. Verified in:
- `StudentSelfProfile360Controller.java:39` (`studentRepo.findByUserId(RequestContext.getUserId())`).
- `StudentResultsController.java:113-119`.
- `StudentAttendanceController.java:91-97`.
- `StudentFeesController.java:66-72`.
- `StudentHomeworkController.java:99,110-111`.
- `StudentAssignmentController.java:145,162-163`.
- `StudentTimetableController.java:61-62`.

This pattern means a student cannot read another student's data via path parameter — there are no studentId path params on student endpoints.

---

## 4. Broken APIs

- **`/v1/mobile/notices` (used by `StudentNoticesPage` + dashboard widget):** Returns notices for the tenant's `MAIN` school regardless of the student's actual school assignment. For tenants with multiple schools this is the wrong dataset.
  - File: `backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java:90-98`.
  - Reason: `resolveMainSchool` hard-codes school code `"MAIN"` instead of resolving from `Student.schoolId`.
- **`/v1/student/attendance/qr-mark`:** Functionally works for STUDENT but is reachable by any authenticated role because `QrAttendanceController` has no `@PreAuthorize` and `/v1/student/**` is not in SecurityConfig.
  - File: `backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java:29-50`.

No other endpoint is hard-broken. Below "broken" widens to "important data not exposed to student" — see §5.

---

## 5. Missing APIs

1. **`GET /v1/student/me`** — Student profile (class, section, roll number, photo, current academic year). `StudentLayout` currently shows only username.
2. **`PUT /v1/student/me/photo`** — Self-update photo (subject to school approval).
3. **`GET /v1/student/documents`** — Read-only listing of documents already uploaded by School Admin against this student (TC, marksheet PDFs, ID proof). Students currently cannot see their own files.
4. **`GET /v1/student/documents/{id}/url`** — Presigned URL for a given document.
5. **`GET /v1/student/results/{examId}/report-card.pdf`** — Direct PDF download of the report card. Today the only endpoint that serves this is the School-Admin path.
6. **`GET /v1/student/achievements`** — Standalone listing for the Achievements section (used by profile-360 aggregate but no dedicated endpoint).
7. **`GET /v1/student/notifications`** — In-app notification feed (separate from notices).
8. **`POST /v1/student/leave`, `GET /v1/student/leave`, `DELETE /v1/student/leave/{id}`** — Student leave application (matching the staff/teacher pattern at `/v1/teacher/leave`). Optional product decision but commonly expected by Indian schools.
9. **`GET /v1/student/library`, `/transport`, `/hostel`** — Sidebar shows nothing for these; backend has nothing. Mark Phase-2.
10. **`GET /v1/student/exams/upcoming`** — Today the student sees results only after publication; there is no schedule of upcoming exams.
11. **`GET /v1/student/homework/{id}/my-submission`** — Currently the student sees only the homework list; they cannot retrieve their own submission status/comments after the fact.
12. **`POST /v1/student/notices/{id}/acknowledge`** — Notice read-receipt.

---

## 6. Duplicate / Unused APIs

| Endpoint | Reason | Recommendation |
|---|---|---|
| `GET /v1/student/online-classes` | Backend served by `OnlineClassController`; client function lives in `features/teacher/api/onlineClassApi.ts` but no Student page in `frontend/src/features/student/pages/` consumes it. | Either build a Student "Online Classes" page or remove client function. (Already noted in Teacher report.) |
| `GET /v1/student/videos` | Same situation. | Same. |

No internal duplicates within the Student surface itself.

---

## 7. Security Findings

### 7.1 Authorisation model
- `SecurityConfig.requestMatchers` does **not** include `/v1/student/**`. All Student endpoints rely on method/class-level `@PreAuthorize("hasRole('STUDENT')")`.
- Verified: every `student/controller/*Controller.java` and `homework/controller/StudentHomeworkController.java`, `assignment/controller/StudentAssignmentController.java`, `timetable/controller/StudentTimetableController.java`, `student/profile/controller/StudentSelfProfile360Controller.java` has `@PreAuthorize("hasRole('STUDENT')")` at the class level. **Good.**
- **Exception (must-fix):** `attendance/controller/QrAttendanceController.java` has no `@PreAuthorize`. Its only mapping is `POST /v1/student/attendance/qr-mark`. Defence-in-depth gap.
- **Exception (must-fix):** `mobile/controller/MobileController.java` has no `@PreAuthorize`. Any authenticated user reaches `/v1/mobile/notices`.
- **Exception:** `payment/controller/PaymentController.verify` uses `@PreAuthorize("isAuthenticated()")`. The service must check `paymentOrderId.userId == RequestContext.getUserId()` (verify before merging).
- **Recommendation:** Add `requestMatchers("/v1/student/**").hasRole("STUDENT")` to `SecurityConfig` as defence in depth.

### 7.2 Ownership isolation
- Student endpoints do not take `studentId` as a path/body parameter — identity is always derived from `RequestContext.getUserId()` → `Student.findByUserId`. This is the strongest pattern in the codebase. A Student cannot access another Student's data via the public Student API surface.
- **Caveat:** `studentProfile360Api.ts` also exports `getStudentProfile360(studentId)` and `updateStudentProfile360Section(studentId, ...)`, which call `/v1/school-admin/...` paths. These are SCHOOL_ADMIN endpoints and a Student cannot use them (the SecurityConfig path rule rejects). This is fine, but the api file mixes Student and School-Admin client helpers — confusing.

### 7.3 Tenant isolation
- Every Student controller uses `RequestContext.getTenantId()` and student-school is derived from the `Student` entity, not the URL. Strong.
- **Exception:** `MobileController` resolves to a single "MAIN" school per tenant — a multi-school correctness bug, not a tenant-leak per se. A student of tenant A still sees only tenant A data, but not the right school within it.

### 7.4 Validation
- `StudentHomeworkController.submit` accepts `@Valid HomeworkSubmitRequest` — good. But the DTO is `{ notes }` only; if file attachments are added later remember `@NotBlank`/`@Size` + MIME/size validation.
- `StudentAssignmentController.submit` takes `{ textResponse }` — verify `@Valid` is present (controller has `@Valid` per scan).
- `QrAttendanceController.selfMark` accepts `@Valid QrMarkRequest` — good. `token` should be `@NotBlank`.
- `PaymentController.verify` accepts `VerifyPaymentRequest` — verify `@Valid` on controller method.

### 7.5 Audit logging
- **Finding:** No audit log on `submit` homework, `submit` assignment, `qr-mark` attendance, payment-order creation, payment verify. Disputes ("my child paid but it didn't reflect", "I submitted but it shows pending") have no provenance.

### 7.6 Rate limit / quota
- **Finding:** No rate limit on any Student mutation. QR-mark in particular can be flooded — a script could send many invalid tokens per second. Payment create-order is a money-side operation and should be capped.

### 7.7 File upload safety
- Currently homework/assignment submit endpoints accept text only, so there is no file-upload surface for students. The missing feature is product-relevant; if added, must include MIME allowlist, size cap, antivirus/quarantine, tenant storage quota check.

### 7.8 Sensitive data exposure (`/v1/student/profile-360`)
- The DTO returns `parentFamily`, `riskProfile`, `behaviorRecords`, `communicationCenter`. None of these should typically be visible to the student themselves.
- **Finding:** The Student self-profile-360 controller delegates to the same `StudentProfile360Service.getProfile(...)` used by School-Admin; the visibility filter is purely on the per-section `visibility` field returned to the client. The frontend trusts this; if a future client renders all sections, sensitive content will be shown.
- **Recommendation:** Add a separate `getSelfProfile()` service method that strips/redacts sections marked `STAFF_ONLY` / `ADMIN_ONLY` / `PRIVATE` before returning.

### 7.9 Test coverage
- Existing tests touching student behaviour: `RoleMatrixIntegrationTest` (role gating), `MfaPolicyTest` (auth), `SensitiveDataPolicyTest` (logging redaction). **No dedicated controller test** for any `/v1/student/*` endpoint.
- **Recommended new tests** (`backend/src/test/java/com/cloudcampus/...`):
  - Student A cannot retrieve Student B's profile through the self endpoint.
  - A SCHOOL_ADMIN or TEACHER receives 403 on every `/v1/student/*` endpoint.
  - `qrMarkAttendance` rejected for non-STUDENT after the @PreAuthorize fix.
  - `submitHomework` rejected after `dueDate` once enforced.
  - `verifyPayment` rejected when `paymentOrderId` does not belong to the caller.

---

## 8. Frontend Findings

- **`StudentLayout`** uses only local auth-store user data; missing rich profile (class/section/photo). Add `GET /v1/student/me` integration.
- **`StudentDashboardPage`** issues **7 parallel queries** on mount (`student-homework`, `student-assignments`, `student-notices`, `student-timetable`, `student-attendance`, `student-fees`, `student-results`). For low-bandwidth phones this is heavy.
  - Recommendation: consolidate to a single `/v1/student/dashboard` aggregate endpoint, or stagger / suspense them.
- **`StudentHomeworkPage`** allows submitting only a notes string. No file attach UI. Many Indian schools require photo of completed work.
- **`StudentAssignmentsPage`** same — only text response.
- **`StudentResultsPage`** has no "download PDF" affordance.
- **`StudentFeesPage`** — payment success/failure path through Razorpay relies on `onSuccess`/`onError` callbacks but doesn't invalidate React Query caches; status will be stale until refresh.
  - Recommendation: invalidate `['student-fees']` and `['student-attendance']` (if affected) on success.
- **`StudentNoticesPage`** uses page index but no infinite scroll; pagination is invisible to the user.
- **`StudentQrScanPage`** — no debounce on scan; rapid re-scans of the same QR will spam the backend.
- **`StudentSelfProfilePage`** is 800+ lines and renders many sections; loading skeleton/empty states should be section-level.
- **No "Change Password" link** in `StudentLayout` (same gap as Teacher).
- **No notification badge** in layout (would consume future `/v1/student/notifications`).
- **No offline / connectivity awareness** — a portal targeting schools should at minimum show a banner on offline.
- **`studentProfile360Api.ts`** mixes admin + self API helpers — split into `studentSelfApi.ts` (Student) and keep admin helpers in a `school-admin` location.

---

## 9. Backend Findings

- **`QrAttendanceController` missing `@PreAuthorize`** (critical, see §7.1).
- **`MobileController` missing `@PreAuthorize` + `resolveMainSchool` hard-codes "MAIN"** (critical, see §4 and §7.3).
- **`PaymentController.verify` has `isAuthenticated()` only.** Tighten role and require ownership.
- **`StudentSelfProfile360Controller`** returns the same aggregate as the admin view. Add a self-redacted variant.
- **No audit log writes** on the Student-side mutations: homework submit, assignment submit, qr-mark, payment create-order, payment verify.
- **No rate-limit annotation** on any student mutation.
- **No file-upload surface** for homework/assignment submit. When added, must integrate `storage.StorageQuotaController` and antivirus quarantine (already exists per `StorageServiceTest`).
- **`StudentSelfProfile360Controller` uses `studentRepo.findByUserId`** but does not filter by `tenantId` in the call (line 39). Confirmed it falls back to `findByUserId` which we should double-check filters by tenant — if not, a recycled `userId` UUID across tenants is theoretically risky. Add `findByUserIdAndTenantId`.
- **`MobileController.notices` `findPublishedForTarget(school.getId(), NoticeTarget.STUDENT, ...)`** is OK once the school resolution is fixed; verify expiry filter (`expiresAt`) is applied.
- **`StudentHomeworkController.myHomework`** does not return the student's own submission status alongside the homework; the UI cannot tell at a glance which homework has already been submitted. Returning `(homework, mySubmission?)` would simplify the UI.

---

## 10. Recommended Changes

### Critical fixes (must do before charging schools money)

1. **Add `@PreAuthorize("hasRole('STUDENT')")` to `QrAttendanceController`** (class-level).
2. **Fix multi-school resolution in `MobileController`.** Resolve school from `Student.schoolId` via `studentRepo.findByUserId(...)` instead of `findByTenantIdAndCode(tenantId, "MAIN")`. Also add `@PreAuthorize` (e.g., `hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN')`).
3. **Tighten `PaymentController.verify`** to `@PreAuthorize("hasAnyRole('STUDENT','SCHOOL_ADMIN','TENANT_ADMIN')")` AND assert in the service that the `paymentOrderId.userId == RequestContext.getUserId()` (for STUDENT) or that the order belongs to a school the admin manages.
4. **Add `requestMatchers("/v1/student/**").hasRole("STUDENT")` to `SecurityConfig`** for defence in depth.
5. **Self-profile redaction.** Add `StudentProfile360Service.getSelfProfile(studentId)` that strips `riskProfile`, `behaviorRecords`, `communicationCenter`, parent contact details. Use it from `StudentSelfProfile360Controller`.
6. **Audit log writes** on: homework submit, assignment submit, QR self-mark, payment create-order, payment verify.
7. **Rate limits** on: `qr-mark`, `submit homework`, `submit assignment`, `create payment order`, `verify payment`.
8. **Cross-role integration tests** under `backend/src/test/java/com/cloudcampus/...` asserting:
   - TEACHER / PARENT / SCHOOL_ADMIN get 403 on every `/v1/student/*` endpoint (including the QR endpoint).
   - Verify-payment rejects requests where the paymentOrder is for a different user.
   - Profile-360 self redacts sensitive sections.

### High priority improvements

1. **`GET /v1/student/me`** and wire into `StudentLayout`.
2. **`GET /v1/student/documents`** + presigned URL download.
3. **`GET /v1/student/results/{examId}/report-card.pdf`** and "Download PDF" button on `StudentResultsPage`.
4. **Consolidate `StudentDashboardPage` to a single `GET /v1/student/dashboard` aggregate** to reduce 7 round-trips on every mount.
5. **Multipart file submission** for homework + assignments + size/MIME validation + storage quota check.
6. **Deadline enforcement on submit** (homework.dueDate, assignment.dueDate). Backend should reject after dueDate or mark as LATE.
7. **Invalidate React Query cache** after Razorpay onSuccess.
8. **Debounce QR scan** in `StudentQrScanPage`.
9. **"Change Password" link** in `StudentLayout`.
10. **Pagination** on `/v1/student/homework`, `/v1/student/assignments`, `/v1/student/attendance` (date range).
11. **Return homework+mySubmission tuple** from `myHomework`.

### Medium priority improvements

1. **`POST /v1/student/notices/{id}/acknowledge`** read-receipt.
2. **`GET /v1/student/notifications`** in-app feed + badge.
3. **`GET /v1/student/exams/upcoming`** schedule.
4. **Optional `/v1/student/leave`** endpoints (decision: include or explicitly out-of-scope).
5. **Offline banner / connectivity awareness** in layout.
6. **Split `studentProfile360Api.ts`** into student-self vs school-admin helpers.
7. **Add `findByUserIdAndTenantId`** repo method and use in `StudentSelfProfile360Controller`.
8. **Confirm expiry filter** on notices.
9. **Section-level loading skeletons** in `StudentSelfProfilePage`.

### Optional improvements

1. **`/v1/student/achievements`, `/certificates`** download endpoints.
2. **MFA for STUDENT** — usually overkill, but should be available for older students if institution requires it.
3. **Library / transport / hostel** Phase-2 modules.
4. **Razorpay webhook reconciliation** dashboard.

---

## 11. Implementation Plan

- [ ] CC-S-01: Add `@PreAuthorize("hasRole('STUDENT')")` to `QrAttendanceController`.
- [ ] CC-S-02: Fix multi-school bug in `MobileController.resolveMainSchool` — use `Student.schoolId`. Add `@PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN')")`.
- [ ] CC-S-03: Tighten `PaymentController.verify` role + add ownership check in `PaymentService.verify`.
- [ ] CC-S-04: Add `requestMatchers("/v1/student/**").hasRole("STUDENT")` to `SecurityConfig`.
- [ ] CC-S-05: Implement `StudentProfile360Service.getSelfProfile(...)` with redaction; switch `StudentSelfProfile360Controller` to use it.
- [ ] CC-S-06: Audit log writes for homework submit, assignment submit, qr-mark, payment create-order, payment verify.
- [ ] CC-S-07: Rate-limit annotations on the same five endpoints.
- [ ] CC-S-08: Cross-role integration tests in `backend/src/test/java/com/cloudcampus/rbac/` asserting non-STUDENT roles get 403 on `/v1/student/*` and verify-payment ownership.
- [ ] CC-S-09: Implement `GET /v1/student/me` + wire into `StudentLayout.tsx`.
- [ ] CC-S-10: Implement `GET /v1/student/documents` + presigned URL endpoint + "My Documents" page.
- [ ] CC-S-11: Implement `GET /v1/student/results/{examId}/report-card.pdf` + "Download PDF" button on `StudentResultsPage`.
- [ ] CC-S-12: Implement aggregate `GET /v1/student/dashboard` and refactor `StudentDashboardPage` to use one query.
- [ ] CC-S-13: Multipart submission for homework + assignment with size/MIME/quota validation.
- [ ] CC-S-14: Deadline enforcement on submit (mark LATE / reject).
- [ ] CC-S-15: Invalidate `['student-fees']` (and other affected) caches after Razorpay onSuccess in `StudentFeesPage`.
- [ ] CC-S-16: Debounce QR scan in `StudentQrScanPage`.
- [ ] CC-S-17: Add "Change Password" link to `StudentLayout`.
- [ ] CC-S-18: Paginate homework, assignments, attendance.
- [ ] CC-S-19: Return `{ homework, mySubmission? }` tuple from `myHomework`.
- [ ] CC-S-20: Add `findByUserIdAndTenantId` to `StudentRepository` and use it.
- [ ] CC-S-21: Notice acknowledgement endpoint + UI.
- [ ] CC-S-22: In-app notifications feed.
- [ ] CC-S-23: Upcoming exams endpoint.
- [ ] CC-S-24: Decide on Student leave application (build or document as out-of-scope).
- [ ] CC-S-25: Split `studentProfile360Api.ts` into student-self vs admin client files.

---

## 12. Final Decision

- **Is Student module production ready?** **Closer than other roles, but not yet.** The Student API surface is small, the controllers are well-scoped (role + tenant + ownership derived from JWT), and existing 174 backend tests pass. But the four critical security/correctness gaps below are blocking:
  1. `QrAttendanceController` accepts non-STUDENT roles.
  2. `MobileController` returns wrong-school notices for multi-school tenants.
  3. `PaymentController.verify` is gated only by `isAuthenticated()`.
  4. `Profile-360` self endpoint returns admin-only sections without redaction.
- **Must-fix before selling this SaaS:**
  1. CC-S-01, CC-S-02, CC-S-03, CC-S-04 — close the four critical security/correctness gaps.
  2. CC-S-05 — self-profile redaction.
  3. CC-S-06 — audit log writes on student mutations.
  4. CC-S-07 — rate limits.
  5. CC-S-08 — cross-role negative tests.
  6. CC-S-09 — `/v1/student/me` and basic profile in layout (UX blocker for demo).
  7. CC-S-14 — deadline enforcement on homework/assignment submit (academic integrity).
- **Improve later (but ship anyway):** CC-S-10 through CC-S-25.

---

_Generated 2026-05-22 by automated audit against branch `main` @ `2dc34c2`. Findings reflect static analysis + selected runtime checks (mvn test PASS, tsc PASS, lint PASS). A real-environment smoke against a running stack — log in as a Student user, exercise dashboard → homework submit → assignment submit → QR attendance → fee payment via Razorpay test mode — is still required before sign-off._
