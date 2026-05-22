# Parent API Audit Report

_Audit date: 2026-05-22 — branch `main` — commit `2dc34c2`._

## 1. Executive Summary

- **Overall status:** Functional for the core "view-my-child" use-case (login, dashboard with all linked children, per-child attendance / homework / timetable / results / fees, school-wide notices). The Parent surface is the smallest of the five role portals. Backend ownership enforcement is the strongest in the codebase — every per-child endpoint checks that the child is linked to the calling parent before any data is read. However, the same multi-school resolution bug seen in the Student audit affects Parent results + timetable, and the Parent portal currently has **zero write capabilities** (no leave request, no payment, no message-teacher, no consent), so it is a strict read-only portal at this point.
- **Production readiness score: 70 / 100.**
- **Major risks:**
  1. **`ParentPortalServiceImpl.resolveSchool()` hard-codes school code `"MAIN"`.** For multi-school tenants, `getChildResults(studentId)` and `getChildTimetable(studentId, ...)` look up results / timetable scoped to the MAIN school instead of the child's actual school (`Student.schoolId`). Wrong data, not a leak — but in a real chain-of-schools tenant the parent could see an empty result list while the child has data, or could see another school's timetable.
  2. **`/v1/mobile/notices` (used by parent notices page) has the same MAIN-school bug** and has no `@PreAuthorize` — any authenticated role (TEACHER, SCHOOL_ADMIN) can hit it. For PARENT specifically this is fine, but as a shared endpoint it is a defence-in-depth gap.
  3. **Parent profile is missing.** No `GET /v1/parent/me`, no `PUT` for self-update. `ParentLayout` shows only the auth-store user.
  4. **Parent cannot do anything beyond reading.** No leave request, no fee payment, no message-teacher, no consent acknowledgement, no notice acknowledgement, no acknowledge-results. This is a strict product limitation.
  5. **No fee payment for parents.** Razorpay payment flow exists for STUDENT (`/v1/student/fee-records/{recordId}/payment-order`) but not for PARENT. Parents typically pay fees, not students. This is the biggest UX gap.
  6. **Parent self-profile-360 missing.** Children's profile-360 is not exposed to parents — they only see the limited fields in `ChildSummary` and a few attendance/fee/result aggregates.
  7. **No audit log writes** anywhere on the Parent side because there are no writes today. Once leave / payment / consent are added, audit logs become mandatory.
  8. **No dedicated Parent controller tests.** Existing `RoleMatrixIntegrationTest` covers basic role gating but does not assert that Parent A cannot fetch Parent B's child data through `/v1/parent/children/{studentId}/...` despite the service-layer `checkAccess` helper.

**Validation commands run on 2026-05-22:**

| Command | Result |
|---|---|
| `cd backend && mvn test --batch-mode --no-transfer-progress` | **PASS** — 174 tests, 0 failures, 0 errors, 0 skipped (47 s) |
| `cd frontend && npx tsc -b --pretty false` | **PASS** — exit 0 |
| `cd frontend && npm run lint` | **PASS** — exit 0 |
| API smoke against running local backend | Not performed — local backend not running. Smoke run recommended in a follow-up. |

Existing tests that touch the Parent code path: `RoleMatrixIntegrationTest`, `SensitiveDataPolicyTest`, `MfaPolicyTest`. None of them tests cross-parent isolation, the `checkAccess` helper, or the multi-school resolver.

---

## 2. API Inventory Table

| API | Method | Frontend Usage | Backend Controller → Service → Repo | Business Importance | Status | Issue | Recommendation |
|---|---|---|---|---|---|---|---|
| `/v1/auth/login` | POST | `features/auth/api/authApi.ts` → `LoginPage.tsx` | `auth/controller/AuthController.login` → `users`, refresh tokens | Critical | Working | No MFA for PARENT. | Optional MFA. |
| `/v1/parent/children` | GET | `features/parent/api/parentApi.getMyChildren` → `ParentLayout.tsx`, `ParentDashboardPage.tsx` | `mobile/controller/ParentController.children` (`@PreAuthorize("hasRole('PARENT')")` at class level) → `ParentPortalServiceImpl.getLinkedChildren()` → `StudentParentLinkRepository.findAllByParentUserIdOrderByCreatedAtAsc` + `StudentRepository.findByIdAndTenantId` + `AttendanceRecordRepository` counts | Critical | Working | List uses 2 attendance count queries per child (N+1-style). No paging. | Aggregate into one query; cap N. |
| `/v1/parent/children/{studentId}/attendance` | GET | `getChildAttendance` → `ParentChildPage.tsx`, `ParentDashboardPage.tsx` | `ParentController.attendance` → `ParentPortalServiceImpl.getChildAttendance` → `checkAccess` + 4 attendance count queries | Critical | Working | 4 separate count queries instead of one aggregate. No recent-records breakdown returned. | One aggregate query; consider returning recent list too. |
| `/v1/parent/children/{studentId}/results` | GET | `getChildResults` → `ParentChildPage.tsx`, `ParentDashboardPage.tsx` | `ParentController.results` → `ParentPortalServiceImpl.getChildResults` → `checkAccess` + `resultRepo.findByStudentIdAndSchoolIdOrderByCreatedAtDesc(studentId, MAIN_school.id)` | Critical | **Wrong data on multi-school tenants** | `resolveSchool()` hard-codes MAIN; should resolve from `Student.schoolId`. | Resolve school from child's actual school. |
| `/v1/parent/children/{studentId}/homework` | GET | `getChildHomework` → `ParentChildPage.tsx`, `ParentDashboardPage.tsx` | `ParentController.homework` → `ParentPortalServiceImpl.getChildHomework` → `checkAccess` + `homeworkRepo.findPublishedForClass(child.schoolId, child.classId, child.sectionId)` | Critical | Working | Returns homework for child's class — but no submission status for that child. | Return `(homework, child's submission?)` tuple. |
| `/v1/parent/children/{studentId}/timetable` | GET | `getChildTimetable` → `ParentChildPage.tsx` | `ParentController.timetable` → `ParentPortalServiceImpl.getChildTimetable` → `checkAccess` + `resolveSchool()` (MAIN bug) + `timetableService.listSlots(school.id, year, classId, sectionId)` | Critical | **Wrong data on multi-school tenants** | Uses MAIN school for the timetable lookup; should use `child.schoolId`. | Use `child.schoolId`. |
| `/v1/parent/children/{studentId}/fees` | GET | `getChildFees` → `ParentChildPage.tsx`, `ParentDashboardPage.tsx` | `ParentController.fees` → `ParentPortalServiceImpl.getChildFees` → `checkAccess` + `feeService.listRecordsByStudent(studentId, null)` | Critical | Working | `feeService.listRecordsByStudent` is called without a tenant guard from this controller; trust depends on `feeService` doing its own tenant scoping (verified — it uses `RequestContext.getTenantId()`). | Keep; add audit when payments are launched. |
| `/v1/mobile/notices` | GET | `parentApi.getNotices` → `ParentNoticesPage.tsx`, `ParentDashboardPage.tsx` | `mobile/controller/MobileController.notices` (**no `@PreAuthorize`** — falls under `anyRequest().authenticated()`) → `MAIN` school code resolver | Critical | **Wrong data on multi-school tenants; defence-in-depth gap** | Same hard-coded `findByTenantIdAndCode(tenantId, "MAIN")` as in Student audit. Plus, no role gate at controller. | Resolve school from `Student.schoolId` of one of the parent's linked children; add `@PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN')")`. |
| `/v1/parent/me` | GET | **Missing** | **Missing** | Important | **Missing** | ParentLayout shows only username from auth store; no contact / linked-children / photo. | Build `GET /v1/parent/me`. |
| `/v1/parent/children/{studentId}/leave` | POST/GET/DELETE | **Missing** | **Missing** | Important | **Missing** | Parents commonly need to apply leave for a child. No endpoint. | Build leave application flow. |
| `/v1/parent/children/{studentId}/fee-records/{recordId}/payment-order` | POST | **Missing** | **Missing** | Critical (revenue path) | **Missing** | Razorpay flow only exists for STUDENT; parents typically pay fees. | Mirror student payment flow for PARENT with ownership check via `StudentParentLinkRepository.existsByStudentIdAndParentUserId`. |
| `/v1/parent/children/{studentId}/profile` | GET | **Missing** | **Missing** | Important | **Missing** | Parents cannot see basic profile (class, section, roll, photo, address) — only attendance counts. | Build a Parent-redacted profile endpoint (lighter than profile-360). |
| `/v1/parent/children/{studentId}/documents` | GET | **Missing** | **Missing** | Important | **Missing** | Parent cannot fetch child's documents (TC, marksheet PDFs). | Build read-only endpoint with ownership check. |
| `/v1/parent/children/{studentId}/exams/upcoming` | GET | **Missing** | **Missing** | Important | **Missing** | Parents cannot see upcoming exam schedule. | Build. |
| `/v1/parent/notifications` | GET | **Missing** | **Missing** | Optional | **Missing** | No in-app notification feed (separate from notices). | Build with badge in `ParentLayout`. |
| `/v1/parent/notices/{id}/acknowledge` | POST | **Missing** | **Missing** | Optional | **Missing** | Parents cannot acknowledge a notice / consent. | Build. |
| `/v1/parent/messages` | * | **Missing** | **Missing** | Optional | **Missing** | No parent-to-teacher / parent-to-school-admin messaging. | Build messaging or document Phase-2. |

Counts:
- **Distinct endpoints actually used by Parent UI today:** 7.
- **Endpoints whose Parent UI assumes single-school tenancy:** 3 (`/v1/parent/children/{id}/results`, `/timetable`, `/v1/mobile/notices`).
- **Missing endpoints that block product completeness:** at minimum `/v1/parent/me`, `/v1/parent/children/{id}/leave`, `/v1/parent/children/{id}/fee-records/{recordId}/payment-order`, `/v1/parent/children/{id}/profile`, `/v1/parent/children/{id}/documents`.

---

## 3. Working APIs

The following are correctly wired from a Parent page through to a Parent controller and serve data:

- **Auth:** `POST /v1/auth/login` (shared).
- **Linked children:** `GET /v1/parent/children` → `ParentLayout`, `ParentDashboardPage`.
- **Child attendance:** `GET /v1/parent/children/{studentId}/attendance` → `ParentChildPage` + dashboard widget.
- **Child homework:** `GET /v1/parent/children/{studentId}/homework`.
- **Child fees:** `GET /v1/parent/children/{studentId}/fees`.
- **Notices:** `GET /v1/mobile/notices` (with two correctness caveats noted above).

Ownership scoping: every per-child endpoint calls `ParentPortalServiceImpl.checkAccess(studentId)` which calls `linkRepo.existsByStudentIdAndParentUserId(studentId, parentUserId)` (file `backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java:143-148`). If the child is not linked to the parent, the service throws `NotFoundException`. This is the strongest ownership check in the codebase (stronger than Teacher's missing assignment check). **Good.**

Tenant scoping: `requireStudent(studentId)` uses `studentRepo.findByIdAndTenantId(studentId, tenantId)` (line 152-153). Cross-tenant access is blocked even if a malicious parent guessed another tenant's studentId UUID. **Good.**

Backend tests: 174 passing. None of them is dedicated to Parent endpoints, but `RoleMatrixIntegrationTest` exercises basic role gating.

---

## 4. Broken APIs

- **`/v1/parent/children/{studentId}/results`** — Returns wrong data for tenants with more than one school.
  - File: `backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java:103-111` calls `resolveSchool()` (line 156-160) which is `schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")`.
  - Symptom: if child belongs to a non-MAIN school, the result repository is queried with the wrong `schoolId` and the response may be empty / wrong.
- **`/v1/parent/children/{studentId}/timetable`** — Same multi-school bug.
  - File: `ParentPortalServiceImpl.java:126-133`.
- **`/v1/mobile/notices`** (used by Parent UI) — Same multi-school bug + missing `@PreAuthorize`.
  - File: `backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java:90-98`.

No other endpoint is broken; the rest of the Parent surface is missing rather than broken (see §5).

---

## 5. Missing APIs

1. **`GET /v1/parent/me`** — Parent profile (name, email, phone, linked children, photo). UI uses only local auth-store today.
2. **`PUT /v1/parent/me/contact`** — Self-update email / phone (subject to school approval).
3. **`GET /v1/parent/children/{studentId}/profile`** — Parent-redacted child profile (class, section, roll, blood group, emergency contact). Profile-360 is too heavy and admin-flavoured.
4. **`GET /v1/parent/children/{studentId}/documents`** + presigned URL — Read-only document list for the child (TC, marksheet, ID proof).
5. **`GET /v1/parent/children/{studentId}/results/{examId}/report-card.pdf`** — Direct PDF download.
6. **`POST /v1/parent/children/{studentId}/leave`**, **`GET .../leave`**, **`DELETE .../leave/{id}`** — Apply / view / cancel student leave on behalf of a child. (Backend `leave_requests` table currently models staff leave; a separate `student_leave_requests` table might be needed.)
7. **`POST /v1/parent/children/{studentId}/fee-records/{recordId}/payment-order`** + **`POST /v1/payment/verify`** (already exists, but the role list excludes PARENT — see Student audit) — Parent self-pay child's fees via Razorpay.
8. **`GET /v1/parent/notifications`** — In-app notification feed (push history).
9. **`POST /v1/parent/notices/{id}/acknowledge`** — Notice / consent acknowledgement.
10. **`GET /v1/parent/children/{studentId}/exams/upcoming`** — Schedule of upcoming exams.
11. **`GET /v1/parent/children/{studentId}/homework/{id}/submission`** — See child's own submission status / teacher feedback. Today the Parent only sees that homework was assigned, not whether the child submitted.
12. **`/v1/parent/children/{studentId}/transport`, `/hostel`, `/library`** — Phase-2.
13. **`/v1/parent/messages`** — Parent ↔ Teacher / School-Admin messaging.
14. **`/v1/parent/consent/{eventKey}`** — Permission slips for field trips / medical events. School-Admin sends, Parent acknowledges.

---

## 6. Duplicate / Unused APIs

| Endpoint | Reason | Recommendation |
|---|---|---|
| `VideoController.adminList` and the parent-permitted `@PreAuthorize("hasRole('STUDENT') or hasRole('PARENT')")` methods in `VideoController` | Backend supports parent video access but no Parent UI page consumes it. | Either build a "Child videos" page for Parent or drop the PARENT role from those endpoints. |

No internal duplicates inside the Parent surface itself.

---

## 7. Security Findings

### 7.1 Authorisation model
- `SecurityConfig.requestMatchers` does **not** include `/v1/parent/**`. Spring relies on the class-level `@PreAuthorize("hasRole('PARENT')")` on `ParentController` for role enforcement. **Verified.**
- **Recommendation (defence in depth):** add `requestMatchers("/v1/parent/**").hasRole("PARENT")` to SecurityConfig so a future regression that removes `@PreAuthorize` does not silently downgrade to "any authenticated".
- **Notice endpoint:** `/v1/mobile/notices` has no `@PreAuthorize` (controller is plain `@RequestMapping("/v1/mobile")`). Shared with Student and Teacher portals. For Parent specifically the path-only `.anyRequest().authenticated()` gate is fine, but `MobileController` should still be tightened (already called out in Student audit).

### 7.2 Ownership isolation (Parent → Child)
- **Strong.** `ParentPortalServiceImpl.checkAccess(studentId)` calls `linkRepo.existsByStudentIdAndParentUserId(studentId, parentUserId)` at the top of every per-child method (attendance, results, homework, timetable, fees). If the link is absent, a `NotFoundException` is thrown.
- **Caveat:** `getLinkedChildren()` does not currently filter by tenant on the link query (`findAllByParentUserIdOrderByCreatedAtAsc` only takes `parentUserId`). Tenant filtering happens at the subsequent `studentRepo.findByIdAndTenantId(...)` call (line 72), which silently drops any link that points to a student in a different tenant. **Defence in depth** but works.
- **Missing tests** — see §7.5.

### 7.3 Tenant isolation
- `requireStudent` uses `findByIdAndTenantId`. **Good.**
- `resolveSchool` uses `findByTenantIdAndCode(tenantId, "MAIN")`. Tenant is honoured; the bug is the hard-coded school code, not the tenant scoping.

### 7.4 Sensitive data exposure
- `getChildResults` returns `ExamResultResponse` which includes `totalMarksObtained`, `percentage`, `grade`, `rank`. Verify the service filters to `exam.status == PUBLISHED` only — leaking draft results to parents would be a process violation. The repository call is `findByStudentIdAndSchoolIdOrderByCreatedAtDesc`, which does NOT filter on status. **Confirm at service or repository level that only PUBLISHED exam results are returned**, otherwise drafts are visible.
- `getChildFees` returns full fee records including notes (may contain admin notes). Confirm `StudentFeeRecordResponse` does not expose admin-only notes.
- `getChildHomework` returns published homework only (`findPublishedForClass`). Good.
- No PII is mixed into the response objects (no parent phone / email / OTP code returned to other parents).

### 7.5 Test coverage
- **No dedicated test** for `ParentController` / `ParentPortalServiceImpl`.
- **Missing negative tests** (must add):
  - Parent A receives 403 / 404 on `/v1/parent/children/{studentId-of-parent-B's-child}/...` (the `checkAccess` happy path is currently untested).
  - STUDENT / TEACHER / SCHOOL_ADMIN / SUPER_ADMIN receive 403 on every `/v1/parent/*` endpoint.
  - Multi-school tenant: a parent of a child in school B does NOT receive notices / results / timetable from school A.
  - Draft exam results are NOT returned via `/v1/parent/children/{studentId}/results`.

### 7.6 Audit logging
- No writes today, so no audit gap. **But** the moment leave / payment / consent is added, audit log writes are mandatory.

### 7.7 Rate limit
- No mutation surface today, so no immediate need. After payment / leave / message endpoints land, rate-limit `/v1/parent/.../payment-order`, `/leave`, `/messages`.

---

## 8. Frontend Findings

- **`ParentLayout`** uses only `useAuthStore` for parent identity; no API call to fetch parent profile.
- **`ParentDashboardPage`** issues **N+1 + 1 useQueries pattern**: one query for children, then 3 parallel queries per child (fees, homework, results), plus a notices query. For a parent with 3 children this is 11 round trips on mount. (`ParentDashboardPage.tsx:39-72`.)
  - Recommendation: consolidate to a `/v1/parent/dashboard` aggregate endpoint.
- **`ParentChildPage`** uses `useQuery` for attendance, homework, results, timetable, and fees independently. React Query keys are scoped by `studentId` correctly, but there is no `enabled: !!studentId` gate visible — needs verification.
- **Child switcher reliability.** The dashboard / child page rely on the URL `studentId` param; there is no central `ChildSelector` context. A user could in theory hit `/parent/children/{another-uuid}` directly. Backend protects via `checkAccess`, so this is safe; frontend should still verify the studentId is in `parentChildren` before issuing queries.
- **No `enabled` gate on dependent queries** in `ParentDashboardPage`. `useQueries` will fire all child queries before `children` resolves; today React Query returns `undefined` and the queries don't actually start, but this should be made explicit with `enabled: childrenQuery.isSuccess`.
- **No empty state for "no linked children".** `ParentDashboardPage` should show a clear message if `children` is empty (likely a setup misconfiguration by School Admin).
- **No "Switch child" affordance in `ParentLayout`.** Switching is implicit via clicking a child card.
- **No "Change Password" link** in `ParentLayout` (consistent gap with Student and Teacher layouts).
- **No notification badge** in layout — would consume future `/v1/parent/notifications`.
- **`ParentNoticesPage`** uses page index but no infinite scroll; pagination is invisible to the user.
- **No "Pay fees" button** in `ParentChildPage` fees tab. Payment is impossible from the Parent portal currently.
- **TypeScript types match** between `parentApi.ts` DTOs and the backend (`ChildSummary`, `AttendanceSummary`, `ExamResult` ↔ `ExamResultResponse`, `HomeworkItem` ↔ `HomeworkResponse`, `ChildFeeRecord` ↔ `StudentFeeRecordResponse`). Frontend `ExamResult` allows nulls in fields where backend may return non-null; minor mismatch but defensible.

---

## 9. Backend Findings

- **`ParentPortalServiceImpl.resolveSchool()` hard-codes `"MAIN"`** (line 156-160). Critical correctness bug for multi-school tenants. Fix: use the child's `schoolId` from `requireStudent(studentId).getSchoolId()`.
- **`ParentPortalServiceImpl.getChildResults`** does not filter by `exam.status == PUBLISHED`. If a school-admin enters marks in a draft exam (`exam.status == IN_PROGRESS`), the parent could see them. Confirm at service or via additional repo method.
- **`ParentPortalServiceImpl.getLinkedChildren`** runs 2 attendance count queries per child (N+1). For a parent linked to 4+ children this is 8 extra DB hits.
- **`ParentPortalServiceImpl.getChildAttendance`** runs 4 separate count queries. Consolidate.
- **`ParentController` has no Swagger `@ApiResponse(401, 403)` annotations** documenting failure modes (cosmetic).
- **`StudentParentLinkRepository.existsByStudentIdAndParentUserId`** is the single point of ownership enforcement — verify it has an index on `(student_id, parent_user_id)` for performance.
- **`MobileController` (used by Parent for notices)** — same gaps as in Student audit (no @PreAuthorize, hard-coded MAIN school).
- **No write endpoints** for Parent role, so no validation / audit / rate-limit gaps yet. The first write endpoint added must come with all three.
- **No fee payment for PARENT.** `PaymentController.createOrderStudent` is gated `hasRole('STUDENT')` only. A parallel endpoint `createOrderParent` (with ownership check via `linkRepo.existsByStudentIdAndParentUserId`) is needed.

---

## 10. Recommended Changes

### Critical fixes (must do before charging schools money)

1. **Fix multi-school resolution.** In `ParentPortalServiceImpl`, replace `resolveSchool()` calls in `getChildResults` and `getChildTimetable` with `requireStudent(studentId).getSchoolId()`. Result-repo query should be `findByStudentIdAndSchoolIdOrderByCreatedAtDesc(studentId, child.getSchoolId())`.
2. **Filter results to PUBLISHED exams only** in `getChildResults` (avoid leaking draft marks to parents).
3. **Add `requestMatchers("/v1/parent/**").hasRole("PARENT")`** in `SecurityConfig` for defence in depth.
4. **Add `@PreAuthorize` on `MobileController`** (also needed for Student — already called out in that audit) and fix its hard-coded MAIN school resolution to use the caller's linked-child or own school.
5. **Implement `/v1/parent/children/{studentId}/fee-records/{recordId}/payment-order`** (or extend `PaymentController.createOrderStudent` to a generic `/v1/me/fee-records/{recordId}/payment-order` accepting `STUDENT` or `PARENT` with ownership check). Without this, parents cannot pay fees, which is the primary commercial transaction for most schools.
6. **Cross-parent + cross-tenant integration tests** in `backend/src/test/java/com/cloudcampus/...`:
   - Parent A cannot access Parent B's child via `/v1/parent/children/{id}/*`.
   - STUDENT / TEACHER / SCHOOL_ADMIN get 403 on `/v1/parent/*`.
   - Multi-school tenant: parent of school-B child does not see school-A's results / timetable / notices.
   - Draft exam results are not returned.

### High priority improvements

1. **`GET /v1/parent/me`** and wire to `ParentLayout`.
2. **`GET /v1/parent/children/{studentId}/profile`** (parent-redacted child profile).
3. **`GET /v1/parent/children/{studentId}/documents`** + presigned URL.
4. **`GET /v1/parent/children/{studentId}/results/{examId}/report-card.pdf`** + "Download PDF" button on `ParentChildPage` results tab.
5. **Aggregate `/v1/parent/dashboard`** endpoint to replace the N×3+1 query fan-out from `ParentDashboardPage`.
6. **Parent-side leave application** (`POST /v1/parent/children/{studentId}/leave`, with backing `student_leave_requests` table if needed).
7. **Notice acknowledgement / consent** (`POST /v1/parent/notices/{id}/acknowledge`).
8. **Return homework + child's submission status** as a tuple from `/v1/parent/children/{studentId}/homework` so the parent can see whether the child actually submitted.
9. **Add `enabled` guards** in `ParentDashboardPage` `useQueries` for child-dependent queries.
10. **Pagination** on notices in `ParentNoticesPage`.

### Medium priority improvements

1. **In-app notifications feed** (`/v1/parent/notifications`) with badge in layout.
2. **Upcoming exams** (`/v1/parent/children/{studentId}/exams/upcoming`).
3. **Parent ↔ Teacher / School-Admin messaging.**
4. **"Switch child" affordance** in `ParentLayout`.
5. **"Change Password" link** in `ParentLayout`.
6. **Consolidate attendance counts** in `ParentPortalServiceImpl` into one aggregate query.
7. **Add DB index** on `student_parent_links(student_id, parent_user_id)` if not already present.
8. **Empty-state UI** for parents with zero linked children.

### Optional improvements

1. **MFA for PARENT.**
2. **Transport / Hostel / Library** sub-modules.
3. **Parent dashboard PWA / push** for low-end Android.
4. **Multi-language support** beyond i18next default.
5. **Razorpay webhook reconciliation** dashboard for parent-side payments.

---

## 11. Implementation Plan

- [ ] CC-P-01: Replace `resolveSchool()` in `ParentPortalServiceImpl.getChildResults` and `getChildTimetable` with the child's actual `schoolId`. Add regression test.
- [ ] CC-P-02: Filter `getChildResults` to PUBLISHED exam status only. Add regression test.
- [ ] CC-P-03: Add `requestMatchers("/v1/parent/**").hasRole("PARENT")` in `SecurityConfig`.
- [ ] CC-P-04: Add `@PreAuthorize` to `MobileController` (shared fix with Student audit). Use `child.schoolId` resolution.
- [ ] CC-P-05: Implement parent fee payment: `POST /v1/parent/children/{studentId}/fee-records/{recordId}/payment-order` with `linkRepo.existsByStudentIdAndParentUserId` ownership check. Update `PaymentController.verify` to allow PARENT role. Add "Pay fees" button to `ParentChildPage`.
- [ ] CC-P-06: Cross-parent + cross-tenant integration tests under `backend/src/test/java/com/cloudcampus/rbac/`.
- [ ] CC-P-07: Implement `GET /v1/parent/me`. Wire to `ParentLayout`.
- [ ] CC-P-08: Implement parent-redacted child profile endpoint and a "Profile" tab in `ParentChildPage`.
- [ ] CC-P-09: Implement `GET /v1/parent/children/{studentId}/documents` + presigned URL + "Documents" tab.
- [ ] CC-P-10: Implement `GET /v1/parent/children/{studentId}/results/{examId}/report-card.pdf` + button in results tab.
- [ ] CC-P-11: Implement aggregate `/v1/parent/dashboard` endpoint; refactor `ParentDashboardPage` to one query.
- [ ] CC-P-12: Implement parent-side leave application endpoints + UI. Decide schema (reuse `leave_requests` or new table).
- [ ] CC-P-13: Implement notice acknowledgement endpoint + UI.
- [ ] CC-P-14: Change `getChildHomework` to return `(homework, child's submission?)` tuple.
- [ ] CC-P-15: Add `enabled` guards in `ParentDashboardPage.useQueries`.
- [ ] CC-P-16: Add `enabled` + `staleTime` review across Parent React Query hooks.
- [ ] CC-P-17: Consolidate attendance counts into one query in `ParentPortalServiceImpl`.
- [ ] CC-P-18: Add DB index on `student_parent_links(student_id, parent_user_id)` if missing.
- [ ] CC-P-19: Implement `/v1/parent/notifications` feed + badge in layout.
- [ ] CC-P-20: Implement `/v1/parent/children/{studentId}/exams/upcoming`.
- [ ] CC-P-21: "Switch child" affordance + "Change Password" link in `ParentLayout`.
- [ ] CC-P-22: Empty-state UI for zero linked children.
- [ ] CC-P-23: Parent ↔ Teacher / School-Admin messaging (Phase-2).

---

## 12. Final Decision

- **Is Parent module production ready?** **No.** It is the smallest and best-secured portal in the codebase (ownership check is correct), but:
  1. Multi-school tenants get wrong data for results, timetable, and notices.
  2. There is no way for parents to pay fees — the primary commercial transaction.
  3. No write capabilities at all (no leave, no acknowledgement, no consent).
  4. No `/v1/parent/me`, no parent-side document download, no report-card PDF.
  5. No dedicated test coverage.
- **Must-fix before selling this SaaS:**
  1. CC-P-01, CC-P-02, CC-P-03, CC-P-04 — close the four critical correctness / security gaps.
  2. CC-P-05 — parent fee payment (revenue blocker).
  3. CC-P-06 — cross-parent + cross-tenant tests.
  4. CC-P-07 — `/v1/parent/me`.
  5. CC-P-10 — report-card PDF download (parents will ask).
- **Improve later (but ship anyway):** CC-P-08, CC-P-09, CC-P-11 through CC-P-23.

---

_Generated 2026-05-22 by automated audit against branch `main` @ `2dc34c2`. Findings reflect static analysis + selected runtime checks (mvn test PASS, tsc PASS, lint PASS). A real-environment smoke against a running stack — log in as a Parent user with two children in two different schools, exercise dashboard → child page → results → timetable → fees — is still required before sign-off and would surface the multi-school bug immediately._
