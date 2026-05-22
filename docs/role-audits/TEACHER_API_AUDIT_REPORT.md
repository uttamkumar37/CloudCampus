# Teacher API Audit Report

_Audit date: 2026-05-22 — branch `main` — commit `2dc34c2`._

## 1. Executive Summary

- **Overall status:** Working end-to-end for the core daily workflow (dashboard, timetable, attendance + QR, homework list + submissions review, assignments list + grading, leave requests, lesson plans CRUD + publish, video upload, online classes scheduling, notices viewer). The Teacher surface is smaller than School Admin and is generally safer because tenancy is derived from the JWT-resolved `Staff` record, not from URL path params.
- **Production readiness score: 74 / 100.**
- **Major risks:**
  1. **No `/v1/teacher/me` profile endpoint.** Teacher portal layout shows only the user record from local auth store; there is no backend call that returns the teacher's profile, departments, subjects, assigned classes, or photo. Several UI choices currently rely on hard-coded assumptions.
  2. **Teacher-data ownership inside `Staff`-derived endpoints depends on `staff.id == request.user.staffId`.** This works because `RequestContext.getUserId()` is mapped to `Staff` lookup. But the lookup itself happens per controller method; if any future controller forgets to derive `staff` from `RequestContext` and trusts a body field, cross-teacher leak is possible.
  3. **No backend bounds check on grading.** Assignment grading PATCH accepts arbitrary numbers; backend does not clamp to `assignment.maxMarks`.
  4. **Attendance edit window not enforced server-side.** `school_settings.allowLateAttendance` and `lateCutoffMinutes` exist but the teacher attendance POST does not visibly check them. A teacher could backdate attendance.
  5. **No audit logging** on attendance create, homework/assignment review/grade, lesson plan publish/delete, online class delete, video delete, leave cancel.
  6. **No rate limit** on QR generation, video initiate, attendance posting. The QR endpoint in particular can be hit hundreds of times to flood the database.
  7. **Lesson plan API client lives in `school-admin` folder** (`features/school-admin/api/lessonPlanApi.ts`) instead of `features/teacher/api/`. Functional but a code organisation hazard.
  8. **Notice listing uses `/v1/mobile/notices`** which is not under `/v1/teacher/...` — the security model relies on `anyRequest().authenticated()` rather than a TEACHER role check.
  9. **No teacher-specific reports endpoint.** Teacher cannot view their own class-performance/attendance KPIs without going through School Admin pages they don't have access to.

**Validation commands run on 2026-05-22:**

| Command | Result |
|---|---|
| `cd backend && mvn test --batch-mode --no-transfer-progress` | **PASS** — 174 tests, 0 failures, 0 errors, 0 skipped (47 s) |
| `cd frontend && npx tsc -b --pretty false` | **PASS** — exit 0 |
| `cd frontend && npm run lint` | **PASS** — exit 0 |
| API smoke against running local backend | Not performed — local backend not running. Smoke run belongs in follow-up. |

Existing tests that touch TEACHER behaviour: `RoleMatrixIntegrationTest`, `MfaPolicyTest`, `AuthServiceImplTest`, `AuthLockoutIntegrationTest`, `SensitiveDataPolicyTest`. There is **no** dedicated controller-level test for `TeacherAttendanceController`, `TeacherDashboardController`, `TeacherTimetableController`, `LessonPlanController`, `VideoController`, `OnlineClassController`, `StaffLeaveController`, `TeacherHomeworkController`, `TeacherAssignmentController`. This is the biggest test-coverage gap.

---

## 2. API Inventory Table

| API | Method | Frontend Usage | Backend Controller | Business Importance | Status | Issue | Recommendation |
|---|---|---|---|---|---|---|---|
| `/v1/auth/login` | POST | `features/auth/api/authApi.ts`, `LoginPage.tsx` | `auth/controller/AuthController.login` | Critical | Working | No MFA for TEACHER. | Optional MFA for TEACHER (less critical than SCHOOL_ADMIN). |
| `/v1/teacher/dashboard` | GET | `features/teacher/api/teacherDashboardApi.ts` → `TeacherDashboardPage` | `teacher/controller/TeacherDashboardController.dashboard` (`hasRole('TEACHER')`) | Critical | Working | No cache. Runs 4 count queries serially. | Cache per-teacher for 30 s. |
| `/v1/teacher/timetable` | GET | `features/teacher/api/teacherTimetableApi.ts` → `TeacherTimetablePage`, `TeacherAttendancePage`, `TeacherDashboardPage` | `timetable/controller/TeacherTimetableController.myTimetable` (`hasRole('TEACHER')`) | Critical | Working | Optional `academicYearId` query — falls back to current. | Keep. |
| `/v1/teacher/attendance/students` | GET | `features/teacher/api/teacherAttendanceApi.ts` → `TeacherAttendancePage` | `teacher/controller/TeacherAttendanceController.students` (`hasRole('TEACHER')`) | Critical | Working | Does not validate teacher is assigned to class/section. Any TEACHER of same school can fetch any class roster. | Add staff↔class assignment check. |
| `/v1/teacher/attendance/sessions` | POST | Same | `TeacherAttendanceController.takeAttendance` | Critical | Working | No backend check of school-settings edit window. No audit. No marks-completeness check (teacher can submit empty list). | Enforce edit window + audit + require all-students-covered. |
| `/v1/teacher/attendance/sessions/with-qr` | POST | Same | `TeacherAttendanceController.openSessionWithQr` | Critical | Working | No rate-limit; could be hit repeatedly to spawn QR tokens. | Rate limit per session. |
| `/v1/teacher/attendance/sessions/{sessionId}/qr` | POST | Same | `TeacherAttendanceController.generateQr` | Critical | Working | Same | Same. |
| `/v1/teacher/homework` | GET | `features/teacher/api/teacherHomeworkApi.ts` → `TeacherHomeworkListPage`, `TeacherDashboardPage` | `homework/controller/TeacherHomeworkController.myHomework` (`hasRole('TEACHER')`) | Important | Working | Filters by `assignedBy == staff.id` so it shows only the teacher's own. No filtering by status from UI. | Add status filter. |
| `/v1/teacher/homework/{homeworkId}/submissions` | GET | `TeacherHomeworkSubmissionsPage` | `TeacherHomeworkController.listSubmissions` | Important | Working | Returns all submissions without paging. No check that homework was created by this teacher. | Add ownership check + pagination. |
| `/v1/teacher/homework/{homeworkId}/submissions/{subId}/review` | PATCH | Same | `TeacherHomeworkController.review` | Important | Working | No audit. No teacher-owner check. | Audit + check homework owner. |
| `/v1/teacher/assignments` | GET | `features/teacher/api/teacherAssignmentApi.ts` → `TeacherAssignmentListPage`, `TeacherDashboardPage` | `assignment/controller/TeacherAssignmentController.myAssignments` (`hasRole('TEACHER')`) | Important | Working | Same as homework list. | Add status filter. |
| `/v1/teacher/assignments/{assignmentId}/submissions` | GET | `TeacherAssignmentSubmissionsPage` | `TeacherAssignmentController.listSubmissions` | Important | Working | Returns all submissions; no ownership check that the teacher created the assignment. | Add ownership check + pagination. |
| `/v1/teacher/assignments/{assignmentId}/submissions/{subId}/grade` | PATCH | Same | `TeacherAssignmentController.grade` | Important | Working | Backend does not clamp marks to `assignment.maxMarks`; UI does. No audit. | Clamp on backend + audit. |
| `/v1/teacher/lesson-plans` | GET / POST | `features/school-admin/api/lessonPlanApi.ts` (path inconsistency) → `LessonPlanPage` | `lessonplan/controller/LessonPlanController.myPlans` / `create` (`hasRole('TEACHER')`) | Important | Working | API client misplaced in school-admin folder. | Move to `features/teacher/api/`. |
| `/v1/teacher/lesson-plans/{planId}` | PUT | Same `lessonPlanApi.updatePlanApi` | `LessonPlanController.update` | Important | **Unused (frontend)** | API client function exists but the only consumer page (`LessonPlanPage`) does not currently call PUT — it shows create + publish + delete only. | Either wire to UI or remove the client function. |
| `/v1/teacher/lesson-plans/{planId}/publish` | POST | Same | `LessonPlanController.publish` | Important | Working | No audit. | Audit. |
| `/v1/teacher/lesson-plans/{planId}` | DELETE | Same | `LessonPlanController.delete` | Important | Working | No audit; hard-delete (no soft delete). | Soft-delete + audit. |
| `/v1/teacher/online-classes` | POST / GET | `features/teacher/api/onlineClassApi.ts` → `OnlineClassPage` | `onlineclass/controller/OnlineClassController` (`hasRole('TEACHER')`) | Optional | Working | Schedule POST does not check class/section is assigned to the teacher. | Add staff↔class assignment check. |
| `/v1/teacher/online-classes/{classId}/status` | PATCH | Same | `OnlineClassController.updateStatus` | Optional | Working | Status transitions not state-machine enforced (could go COMPLETED→SCHEDULED). | Add transition rules. |
| `/v1/teacher/online-classes/{classId}/recording` | PATCH | Same | `OnlineClassController.addRecording` | Optional | Working | Recording URL not validated (could be any URL). | Validate URL scheme/host allowlist. |
| `/v1/teacher/online-classes/{classId}` | DELETE | Same | `OnlineClassController.delete` | Optional | Working | No audit; can delete past sessions. | Audit + restrict deletes to future-only. |
| `/v1/student/online-classes` | GET | Same `listStudentClasses` | `OnlineClassController` (presumed student endpoint) | Optional | Working (used cross-role) | Lives in teacher api file; conceptually a student endpoint. | Move to student api folder. |
| `/v1/teacher/leave` | GET / POST | `features/teacher/api/teacherLeaveApi.ts` → `TeacherLeavePage` | `leave/controller/StaffLeaveController` (`hasRole('TEACHER')`) | Important | Working | No required-fields validation beyond presence (e.g., from/to date order). | Add date range validation. |
| `/v1/teacher/leave/{id}` | DELETE | Same | `StaffLeaveController.cancel` | Important | Working | Cancels only own pending leave. No audit. | Audit. |
| `/v1/teacher/videos/initiate` | POST | `features/teacher/api/videoApi.ts` → `VideoUploadPage` | `video/controller/VideoController.initiate` (`hasRole('TEACHER')`) | Optional | Working | No quota check pre-issue of upload URL. | Check tenant storage quota first. |
| `/v1/teacher/videos/{videoId}/confirm` | POST | Same | `VideoController.confirm` | Optional | Working | No validation that actual blob exists. | Server-side stat the object before confirming. |
| `/v1/teacher/videos` | GET | Same | `VideoController.myVideos` | Optional | Working | None major | Keep. |
| `/v1/teacher/videos/{videoId}` | DELETE | Same | `VideoController.delete` | Optional | Working | No audit; orphans the storage object if delete fails midway. | Audit + transactional delete (or background cleanup). |
| `/v1/student/videos` | GET | Same `listStudentVideos` | `VideoController` | Optional | Working (cross-role) | Sits in teacher api file. | Move to student api folder. |
| `/v1/mobile/notices` | GET | Inline call in `TeacherNoticesPage.tsx` | `mobile/controller/MobileController` (no `@PreAuthorize`; falls under `.anyRequest().authenticated()`) | Important | Working | Any authenticated role (STUDENT, PARENT, etc.) can call this. Inline call lives outside `api/` folder. | Move to a dedicated `noticeApi.ts`; verify backend filters to user's school. |
| `/v1/teacher/me` | — | **Missing** | **Missing** | Important | **Missing** | TeacherLayout has no API for full profile (departments, subjects, assigned classes). | Implement `GET /v1/teacher/me` and use in `TeacherLayout`. |

Counts:
- **Teacher-specific endpoints used (`/v1/teacher/...`):** 24.
- **Shared/cross-role endpoints used by Teacher UI:** 3 (`/v1/student/online-classes`, `/v1/student/videos`, `/v1/mobile/notices`).
- **Auth endpoint:** 1 (`/v1/auth/login`).

---

## 3. Working APIs

These endpoints respond correctly under code inspection and are wired to actual Teacher UI:

- Dashboard: `/v1/teacher/dashboard`.
- Timetable: `/v1/teacher/timetable`.
- Attendance: `/v1/teacher/attendance/students`, `/sessions`, `/sessions/with-qr`, `/sessions/{id}/qr`.
- Homework: `/v1/teacher/homework`, `/{id}/submissions`, `/{id}/submissions/{subId}/review`.
- Assignments: `/v1/teacher/assignments`, `/{id}/submissions`, `/{id}/submissions/{subId}/grade`.
- Lesson plans: `/v1/teacher/lesson-plans` GET/POST, `/{id}/publish`, `/{id}` DELETE.
- Online classes: `/v1/teacher/online-classes` POST/GET, `/{id}/status`, `/{id}/recording`, `/{id}` DELETE.
- Leave: `/v1/teacher/leave` GET/POST, `/{id}` DELETE.
- Videos: `/v1/teacher/videos/initiate`, `/{id}/confirm`, GET, DELETE.
- Notices viewer (via `/v1/mobile/notices`).

Backend-side tenant scoping is correctly derived from `RequestContext.getUserId()` → `Staff` lookup → `staff.schoolId` / `staff.tenantId`, verified in `TeacherAttendanceController.java:198-204`, `TeacherDashboardController.java:79-84`, `LessonPlanController.java:52-95`, `VideoController.java:41-111`, `OnlineClassController.java:43-89`. This is materially safer than the School Admin pattern of trusting URL `schoolId`.

---

## 4. Broken APIs

No outright broken endpoints found in code inspection. The borderline cases:

- `PUT /v1/teacher/lesson-plans/{id}` — backend exists, frontend client function exists, but no UI page actually uses it. Functionally dead.
- `OnlineClassController.updateStatus` — works but the action enum on the request (`{ action }`) is not validated against a state-machine. A bad client could send arbitrary actions.

If "broken" is widened to "missing where UI implies it exists", see §5.

---

## 5. Missing APIs

Required for a complete Teacher portal but currently absent:

1. **`GET /v1/teacher/me`** — Teacher self-profile (department, subjects, classes, photo, email, contact). UI currently uses local auth store, which only has username + role.
2. **`PUT /v1/teacher/me`** — update own contact / photo.
3. **`PUT /v1/teacher/me/password`** — exists at generic `/v1/auth/change-password` but no Teacher-friendly UI path. (Not technically missing, just not surfaced from Teacher layout — see §8.)
4. **`GET /v1/teacher/students`** — flat list of all students whose classes/sections the teacher is assigned to. Currently the teacher has to pick a class first, which is awkward for class teachers.
5. **`GET /v1/teacher/students/{studentId}/profile`** — view a single student's relevant info (limited fields). Without this, teachers can only see roster from attendance flow.
6. **`POST /v1/teacher/homework`** — create homework as a teacher. Today the only path to creating homework is via the School Admin `/v1/school-admin/schools/{schoolId}/homework` endpoint, which TEACHER cannot call. Sidebar shows "Homework" but Teacher cannot post new homework. This is a glaring UX gap.
7. **`POST /v1/teacher/assignments`** — same problem for assignments.
8. **`GET /v1/teacher/reports/class-performance`** — per-class KPI for the teacher.
9. **`GET /v1/teacher/notices`** — Teacher-scoped notice listing. Today it borrows `/v1/mobile/notices`, which is generic.
10. **`POST /v1/teacher/notices` / `PATCH .../acknowledge`** — Teachers cannot post or acknowledge notices.
11. **`POST /v1/teacher/attendance/sessions/{id}/correct`** — edit attendance entries within an edit window.
12. **`GET /v1/teacher/exam-duties`** — examination duty roster.
13. **`GET /v1/teacher/marks`** — Teachers grade exam papers under School Admin's `MarksController`, but Teachers do not have access. Need a `/v1/teacher/exams/{examId}/subjects/{entryId}/marks` endpoint when a Teacher is assigned to that subject.

---

## 6. Duplicate / Unused APIs

| Endpoint | Reason | Recommendation |
|---|---|---|
| `PUT /v1/teacher/lesson-plans/{id}` (`updatePlanApi`) | Backend + client exist; no UI invocation. | Wire to a "Edit lesson plan" form in `LessonPlanPage` or remove client function. |
| `GET /v1/student/online-classes` and `GET /v1/student/videos` in `features/teacher/api/onlineClassApi.ts`, `videoApi.ts` | Student endpoints living in Teacher's api folder. | Move to `features/student/api/`. |
| `LessonPlanController.listAll` (`/v1/school-admin/lesson-plans`) | Listed in Teacher's `lessonPlanApi.ts` but only School Admins can call it; teacher never calls. | Already noted in School Admin audit; not Teacher's concern. |

---

## 7. Security Findings

### 7.1 Authorisation model

- `/v1/teacher/**` is **not** in `SecurityConfig.requestMatchers`. It falls through to `anyRequest().authenticated()`. Role enforcement therefore depends on **every** Teacher controller method having `@PreAuthorize("hasRole('TEACHER')")`.
- Verified: every Teacher controller method enumerated above has `@PreAuthorize("hasRole('TEACHER')")` at method level. **However**, this means a regression that drops `@PreAuthorize` on a future Teacher endpoint would allow STUDENT or PARENT to call it. There is no URL-level safety net.
- **Recommendation:** Add a `/v1/teacher/**` matcher to `SecurityConfig` with `hasRole("TEACHER")` (or `hasAnyRole("TEACHER","SCHOOL_ADMIN","TENANT_ADMIN")` if admins should also access). Defence in depth.

### 7.2 Tenant + ownership isolation

- Teacher controllers correctly derive `tenantId`/`schoolId` from the JWT-resolved `Staff` record, NOT from URL params. Verified in `TeacherAttendanceController.java:198`, `LessonPlanController.java:52,65,73,81,95`, `VideoController.java:41-104`, `OnlineClassController.java:43-89`. This is strong.
- **Gap:** Endpoints that take `classId`, `sectionId`, `assignmentId`, `homeworkId`, `examId`, `subjectId` as path/body parameters do not verify the teacher is **assigned** to that class/section/subject. The TEACHER role alone is enough to fetch any class roster of the same school. A teacher of class 5 can fetch class 8's student roster.
- **Recommendation:** Add a `StaffAssignmentService.assertTeacherAssignedTo(staffId, classId, sectionId)` check at the top of:
  - `/v1/teacher/attendance/students`
  - `/v1/teacher/attendance/sessions` (and `/with-qr`)
  - `/v1/teacher/homework/{id}/submissions/*`
  - `/v1/teacher/assignments/{id}/submissions/*`
  - `/v1/teacher/online-classes` POST/PATCH/DELETE
  - `/v1/teacher/lesson-plans` POST/PUT
  - `/v1/teacher/videos/initiate`

### 7.3 Audit logging

- **Finding:** No mutation Teacher endpoint writes to `audit_logs`. Specifically missing on attendance create, homework review, assignment grade, lesson plan create/publish/delete, online class delete, leave cancel, video delete.

### 7.4 Input validation

- `TeacherAssignmentController.grade` body has `@Valid` (per earlier scan) but the inner DTO does not appear to enforce numeric bounds against `assignment.maxMarks` — bounds clamping must happen in service.
- `OnlineClassController.updateStatus` accepts `{ action }` body without DTO validation — easy to send unknown action.
- `OnlineClassController.addRecording` accepts arbitrary `recordingUrl` — URL not validated.
- `VideoController.confirm` body `{ fileSizeBytes, durationSeconds }` should be `@Min(0)` validated.
- `StaffLeaveController.submit` body needs `fromDate ≤ toDate` and `fromDate ≥ today`.

### 7.5 Rate-limit / quota

- **Finding:** No rate limits on `/v1/teacher/attendance/sessions/with-qr`, `/sessions/{id}/qr`, `/v1/teacher/videos/initiate`. QR token churn and presigned-URL minting are both expensive.

### 7.6 Sensitive data exposure

- `/v1/teacher/attendance/students` returns full student name, number, classId, sectionId. Acceptable for an assigned teacher, dangerous for unassigned teachers (see §7.2 ownership gap).
- Notices via `/v1/mobile/notices` may return notices targeted to other audiences — verify backend filters by user's school and audience.

### 7.7 Test coverage

- **Finding:** No dedicated test class for any Teacher controller. Existing `RoleMatrixIntegrationTest` only asserts role gating. There is no test asserting:
  - A teacher cannot fetch another teacher's homework submissions.
  - A teacher cannot grade an assignment they did not create.
  - A teacher cannot post attendance for a class they aren't assigned to.
  - A teacher cannot delete another teacher's online class or video.
  - A teacher's lesson-plan create/publish/delete is scoped to their own.

---

## 8. Frontend Findings

- **`TeacherLayout.tsx`** does not show teacher's name/department; only `user` from local auth store. Should call `/v1/teacher/me`.
- **`TeacherDashboardPage`** displays `pendingHomeworkReview` and `pendingAssignmentGrading` counts but provides no quick-link to take action. Click-through is via separate nav.
- **`TeacherAttendancePage`** does not warn before submission if some students are unmarked.
- **`TeacherAttendancePage`** UX does not show whether the chosen session is within the school's late cutoff.
- **`TeacherHomeworkSubmissionsPage`** and `TeacherAssignmentSubmissionsPage` lack per-student grade history (only current submission).
- **`LessonPlanPage`** has no "Edit" affordance, even though the API client supports PUT.
- **`OnlineClassPage`** does not handle the recording-URL malformed case; no client-side URL validation.
- **`VideoUploadPage`** has no chunked-upload retry; one network hiccup mid-upload requires re-initiating.
- **`TeacherLeavePage`** lacks an empty state and lacks the leave-balance display.
- **`TeacherNoticesPage`** uses inline `axiosInstance` call instead of a dedicated `noticeApi.ts` in the teacher folder. Inconsistent with the rest of the codebase.
- **`TeacherLayout`** "Change Password" link is absent (School Admin's is at `/change-password`). Teachers can still navigate manually but the link is missing from the layout.
- **No React Query cache invalidation** after `takeAttendance` POST — list pages won't refresh until manual reload.
- **No loading / error skeleton** for `OnlineClassPage`, `VideoUploadPage`.

---

## 9. Backend Findings

- **Inconsistent placement.** `LessonPlanController` mixes `/v1/teacher/lesson-plans` and `/v1/school-admin/lesson-plans` in the same class. Acceptable, but should be split for clarity, or at least documented.
- **`TeacherAttendanceController.takeAttendance`** combines `openSession + markAttendance` in one call without an explicit `@Transactional`. Confirm transactional behaviour or wrap.
- **`TeacherDashboardController.dashboard`** runs ≥4 queries; no caching.
- **`OnlineClassController.updateStatus`** uses `{ action }` payload that is not validated against an enum.
- **`VideoController.confirm`** lacks @Valid + Min on size/duration.
- **`OnlineClassController.addRecording`** does not validate URL.
- **`StaffLeaveController`** does not enforce `fromDate ≤ toDate` or restrict back-dating.
- **No method-level role-and-assignment combined check.** Need a `@TeacherOwns(homeworkId="#homeworkId")`-style PreAuthorize or service-level helper.
- **Audit log writes missing** (see §7.3).
- **Rate-limit annotations missing** on QR + video initiate.
- **No backend bounds clamp** on assignment grade.
- **`mobile/controller/MobileController`** has no `@PreAuthorize`. The notices endpoint is accessible to any authenticated user; verify the backend filters by user's school + audience.

---

## 10. Recommended Changes

### Critical fixes (must do before charging schools money)

1. **Add `/v1/teacher/**` URL matcher** in `SecurityConfig` with `hasRole("TEACHER")`. Defence in depth against `@PreAuthorize` regressions.
2. **Add ownership/assignment checks** for class, section, subject, homework, assignment, online class, video, lesson plan (see §7.2 list).
3. **Backend clamp grading marks** against `assignment.maxMarks` in `TeacherAssignmentController.grade`.
4. **Enforce attendance edit window** per `school_settings.allowLateAttendance` + `lateCutoffMinutes` on `POST /v1/teacher/attendance/sessions`.
5. **Audit log writes** for attendance create, homework review, assignment grade, lesson plan create/publish/delete, online class delete, video delete, leave cancel.
6. **Rate limits** on `/v1/teacher/attendance/sessions/with-qr`, `/sessions/{id}/qr`, `/v1/teacher/videos/initiate`.
7. **Cross-teacher integration tests** under `backend/src/test/java/com/cloudcampus/rbac/` asserting:
   - Teacher A cannot fetch attendance students of a class assigned only to Teacher B.
   - Teacher A cannot review/grade submissions belonging to Teacher B's homework/assignment.
   - Teacher A cannot delete Teacher B's online class / video / lesson plan.
   - A STUDENT or PARENT JWT receives 403 on every `/v1/teacher/...` endpoint.
8. **Implement `GET /v1/teacher/me`** + wire to `TeacherLayout`.
9. **Implement `POST /v1/teacher/homework`** and `POST /v1/teacher/assignments`** so Teachers can create homework / assignments themselves (today the only path is via School Admin, which TEACHER cannot use).

### High priority improvements

1. **DTO validation** on `OnlineClassController.updateStatus` action enum, `addRecording` URL, `VideoController.confirm` size/duration, `StaffLeaveController.submit` date range.
2. **Transactional boundary** check on `TeacherAttendanceController.takeAttendance`.
3. **Pagination** on `homework/{id}/submissions` and `assignments/{id}/submissions`.
4. **Move `lessonPlanApi.ts`** from `features/school-admin/api/` to `features/teacher/api/`.
5. **Move `/v1/student/online-classes` and `/v1/student/videos` client helpers** out of `features/teacher/api/` into the student folder.
6. **Replace inline call in `TeacherNoticesPage`** with a dedicated `features/teacher/api/noticeApi.ts`.
7. **Verify backend filtering** of `/v1/mobile/notices` per user's school + audience.
8. **`Change Password` link** in `TeacherLayout`.
9. **Cache invalidation** after `takeAttendance` POST (React Query).
10. **Leave-balance display** on `TeacherLeavePage` (requires backend endpoint).

### Medium priority improvements

1. **Edit attendance within edit window** endpoint + UI.
2. **Per-class performance report** for the teacher.
3. **Exam duty roster** endpoint + page.
4. **Marks entry by Teacher** when assigned to that subject (today this is School-Admin only).
5. **`PUT /v1/teacher/lesson-plans/{id}`** — wire to UI or remove client function.
6. **URL allowlist** for `addRecording`.
7. **Chunked retry-able video upload** UI.
8. **Notice acknowledgement** by teacher.

### Optional improvements

1. **Optional MFA** for TEACHER.
2. **Per-teacher dashboard caching** (30 s).
3. **Bulk attendance import** from CSV for class teachers.
4. **Online class state machine** enforced backend-side.
5. **Soft-delete** lesson plans, online classes, videos.

---

## 11. Implementation Plan

- [ ] CC-T-01: Add `/v1/teacher/**` URL matcher in `SecurityConfig` with `hasRole("TEACHER")`.
- [ ] CC-T-02: Implement `StaffAssignmentService.assertTeacherAssignedTo(...)` and call it from the 8 endpoints listed in §7.2.
- [ ] CC-T-03: Backend clamp grading marks against `assignment.maxMarks` in `TeacherAssignmentController.grade`.
- [ ] CC-T-04: Enforce attendance edit window in `TeacherAttendanceController.takeAttendance`.
- [ ] CC-T-05: Audit log writes for the 7 mutating Teacher endpoints listed in §10 #5.
- [ ] CC-T-06: Rate-limit annotations on QR session endpoints and video initiate.
- [ ] CC-T-07: Cross-teacher / cross-role integration tests in `backend/src/test/java/com/cloudcampus/rbac/` for the 4 negative paths listed in §10 #7.
- [ ] CC-T-08: Implement `GET /v1/teacher/me` and consume in `TeacherLayout.tsx`.
- [ ] CC-T-09: Implement `POST /v1/teacher/homework` and `POST /v1/teacher/assignments`. Wire to new "Create homework / assignment" pages.
- [ ] CC-T-10: Add DTO validation on `OnlineClassController.updateStatus`, `addRecording`, `VideoController.confirm`, `StaffLeaveController.submit`.
- [ ] CC-T-11: Move `lessonPlanApi.ts` to `features/teacher/api/`. Move student-shared helpers out of `features/teacher/api/`.
- [ ] CC-T-12: Add `features/teacher/api/noticeApi.ts` and remove inline call from `TeacherNoticesPage`.
- [ ] CC-T-13: Verify backend filter of `/v1/mobile/notices` and add an explicit `@PreAuthorize` (or move to `/v1/teacher/notices`).
- [ ] CC-T-14: Paginate homework + assignment submission lists.
- [ ] CC-T-15: Add "Change Password" link to `TeacherLayout`.
- [ ] CC-T-16: React Query invalidation after `takeAttendance` POST.
- [ ] CC-T-17: Build leave-balance endpoint + UI in `TeacherLeavePage`.
- [ ] CC-T-18: Build per-class performance report endpoint + UI.
- [ ] CC-T-19: Build exam duty roster endpoint + UI.
- [ ] CC-T-20: Allow Teacher to enter marks for subjects they're assigned to (`/v1/teacher/exams/{examId}/subjects/{entryId}/marks` POST/PUT).
- [ ] CC-T-21: Wire `PUT /v1/teacher/lesson-plans/{id}` to UI or remove client function.
- [ ] CC-T-22: Cache TeacherDashboardController for 30 s.
- [ ] CC-T-23: Soft-delete lesson plans, online classes, videos.

---

## 12. Final Decision

- **Is Teacher module production ready?** **Not yet, but closer than School Admin.** The teacher portal is feature-complete enough to demo for the read-heavy daily use case (dashboard, timetable, attendance, view submissions). It is **not** safe to bill schools yet, primarily because:
  1. A teacher can fetch / mutate data belonging to another teacher of the same school (ownership/assignment checks missing).
  2. Teachers cannot actually post homework or assignments from the Teacher portal — a glaring product gap.
  3. Audit logging is absent on every mutating teacher action.
  4. Attendance edit window not enforced server-side.
  5. There are zero dedicated Teacher controller tests.
- **Must-fix before selling this SaaS:**
  1. CC-T-01, CC-T-02 — defence-in-depth role check and assignment ownership.
  2. CC-T-03, CC-T-04, CC-T-10 — backend bounds + validation.
  3. CC-T-05 — audit log writes.
  4. CC-T-06 — rate limits on QR + video initiate.
  5. CC-T-07 — cross-teacher integration tests.
  6. CC-T-08, CC-T-09 — `/v1/teacher/me` and Teacher-side homework/assignment creation.
- **Improve later (but ship anyway):** CC-T-11 through CC-T-23.

---

_Generated 2026-05-22 by automated audit against branch `main` @ `2dc34c2`. Findings reflect static analysis + selected runtime checks. A real-environment smoke against a running stack — log in as a Teacher user, exercise attendance → homework review → assignment grade → lesson plan publish — is still required before sign-off._
