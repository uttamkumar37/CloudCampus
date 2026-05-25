# CloudCampus Final SaaS Sellability and Growth Report

_Audit date: 2026-05-22 — branch `main` — commit `f53c009`. **Updated and re-verified the same day**: all task counts, all "completed" claims, and the security blockers list were re-checked against the actual HEAD. No production code has been modified to produce this report. After review, begin with **Task 1 in §17**._

> **Read these two sections first:** [§1.1 Exact Change Requirement Dashboard](#11-exact-change-requirement-dashboard) and [§1.2 Simple Founder Answer](#12-simple-founder-answer). Everything else is supporting evidence.

---

## 1. Executive Verdict

| Question | Answer |
|---|---|
| Ready to sell today? | **No.** |
| Ready for real paying schools? | **No — controlled pilot only.** |
| Ready for sensitive student/parent/payment data at commercial scale? | **No.** |
| Ready for hundreds–thousands of schools? | **No — needs load testing and several correctness fixes first.** |
| Overall readiness score | **74 / 100** (see §19 scorecard). |
| Strongest areas | Critical-mutation audit hooks now exist for fee/payment, student lifecycle, marks/results, notices, leave approvals, settings, academic years, custom domains, parent links, and AI Copilot; irreversible actions now require operator reason capture and store that reason in audit metadata; high-cost/high-abuse endpoints now use the shared API rate limiter; mutating controller bodies are now covered by `@Valid` except the raw Razorpay webhook signature body; CVE/dependency scans now run as a PR-triggered release gate; bulk student promotion now has backend `dryRun=true` protection plus UI preview; payment HMAC + webhook idempotency are real; parent fee payment now exists in the parent portal; first-login forced password-change and prod bootstrap secret enforcement now exist; demo tenant reset hygiene and demo-only labeling now exist; comprehensive observability stack (Prometheus / Grafana / Loki / Tempo); DR drill workflow exists; backend full suite passes after P1-13; frontend strict TS/build pass; clean role separation per portal at the URL prefix level. |
| Biggest blockers | (1) Audit viewer UI still needs to ship before pilots. (2) Student/parent/teacher self-profile endpoints are still missing for pilot polish. (3) Per-tenant restore drill and legal pages still need to ship before controlled pilots. |
| Recommendation | **Stop and fix Phase-0 blockers → demo at Level A → onboard 1–3 pilot schools at Level B → take money at Level C.** Do not accept paid customers until §18 "Level C — First Paid Customer Ready" checklist passes. |

This verdict is honest. Detailed evidence and file references are in §3–§20.

---

## 1.1 Exact Change Requirement Dashboard

**Updated through Task 20 / P1-13 on 2026-05-25.** Counts derived from spot-checking the actual code; see §3 for the per-finding verification matrix.

| Release Target | Required Remaining Tasks | Critical Blockers Remaining | Current Status | Can Start Selling? |
|---|---:|---:|---|---|
| **Level A — Customer Demo Ready** | **0** | **0** | PASS — customer demo ready with demo-only data | Demo only |
| **Level B — Controlled Pilot Ready** | **4** | Pilot-critical Phase-1 items | FAIL — pilot-critical Phase-1 work still needs to ship | No |
| **Level C — First Paid Customer Ready** | **19 tracked tasks + mandatory non-task evidence** | Parent-payment-in-prod hardening + audit viewer + legal docs + MFA + **external penetration test (P2-10)** + non-task commercial evidence (pricing, support process, payment reconciliation, security/trust page, completed pilot validation) | FAIL — both tracked tasks AND mandatory evidence required; **pen-test mandatory** | No |
| **Level D — Revenue Expansion Ready** | **27** | All of C + report-card PDF + parent-teacher chat + pilot validation | FAIL | No |
| **Level E — Scale / Enterprise Ready** | **36** | All of D + load test + multi-school proof + per-tenant restore | FAIL | No |

### Task-count math (re-verified against the roadmap in §16)

| Measurement | Count |
|---|---:|
| Total roadmap tasks after scope cleanup | 56 |
| Already completed in current code (verified by grep + spot read) | 20 |
| Partially completed | 0 |
| Still required | 36 |
| Duplicate scope found and resolved | **1 overlap corrected between P0-01 and P0-13** (see correction note below) |
| Invalid tasks removed | 0 |
| New paid-sale requirement promoted into a mandatory milestone | **P2-10 external penetration test now included in Level C** (was previously listed but not counted in the Level C task count) |
| New tasks discovered during re-verification | 0 |
| **Final remaining tasks** | **36** |
| Remaining Phase-0 blockers | 0 |
| Remaining before **Customer Demo Ready (Level A)** | **0** |
| Remaining before Controlled Pilot Ready (Level B) | 4 |
| Remaining before **First Paid Customer Ready (Level C)** | **19** |
| Remaining before Revenue Expansion Ready (Level D) | 27 |
| Remaining before Scale / Enterprise Ready (Level E) | 36 |

### Re-verification corrections to the original roadmap

| What changed | Reason |
|---|---|
| **Duplicate scope between P0-01 and P0-13 corrected.** Previously both tasks touched `MobileController`. After cleanup: **P0-01** is parent-portal-only (`ParentPortalServiceImpl.resolveSchool()` + `getChildResults` + `getChildTimetable`). **P0-13** is mobile-controller-only (`MobileController` authorization + school resolution from caller's actual school). Total task count unchanged at 56. | Scope-overlap audit on 2026-05-23. |
| **P2-10 (external penetration test) promoted into Level C task count.** Previously listed in §5 evidence checklist but excluded from the 38-task math. Now Level C = 24 (pilot) + 8 remaining Phase-1 + **7 Phase-2** = **39 tasks**. | Paid sale cannot occur without an independent pen-test with all CRITICAL findings closed and HIGH findings closed or formally risk-accepted. |
| **Level A (Customer Demo Ready) raised from 6 → 8 tasks.** Added **P0-14** (Parent fee payment in Razorpay test mode) and clarified **P0-01** (Parent multi-school correctness) is also a demo prerequisite, because a customer demo must show parent paying fees and parent seeing correct child data. A demo that omits these will not convince a school operator. | Sales-realism check 2026-05-23. |
| **P0-03 scope clarified.** Was framed as a 3-line SecurityConfig change. Updated to a 5-step task: inventory + classify (role-exclusive / intentionally shared / misplaced / dead) → add matchers for role-exclusive → move shared to a neutral path or carve allow-rules → keep working flows working → regression tests. Original framing risked breaking `/v1/student/online-classes` and `/v1/student/videos` (consumed by Teacher portal) and `/v1/student/profile-360` (already STUDENT-only but shares path prefix). | Audit-finding overlap 2026-05-23. |
| BL-04 / TD-04 / P0-04: list of `/v1/school-admin/...` controllers without `@PreAuthorize` is **14, not 15**. | Re-grep on 2026-05-22 confirms `StudentDocumentController.java:35` already has `@PreAuthorize("hasRole('SCHOOL_ADMIN')")`. All other 14 controllers in the original list verified missing. |
| Critical-mutation audit hooks now exist across finance/payment, student lifecycle, marks/results, notices, leave, settings, academic years, custom domains, parent links, and AI Copilot. | P0-07 added `logCriticalMutation(...)`, new `AuditAction` values, service/controller injections, payment/finance assertions, and full-suite cleanup coverage. |
| `dryRun` flag on bulk promote now exists in StudentController. | P0-10 added `?dryRun=true`, backend preview metadata, UI preview wiring, and focused service tests proving dry-run does not save or audit. |
| Demo tenant reset + demo-only label hygiene now exists. | P1-09 hardened `DemoResetScheduler` deletion order for fee/payment, assignment, and homework data; added a visible demo-only banner for School Admin, Teacher, Student, and Parent portals; focused backend/frontend tests pass. |
| Force-first-login password reset and prod bootstrap hardening now exist. | P0-12 added `ForcePasswordChangeFilter`, clears the force flag on successful password reset/change, redirects forced users to `/change-password`, and makes `BOOTSTRAP_ADMIN_PASSWORD` mandatory in `prod`. |
| Method-level rate-limit annotations beyond login endpoint now cover the P0-16 high-cost endpoints. | `@RateLimit` is applied to AI Copilot query, email/push notification sends, WhatsApp send, student/admin/parent payment-order creation, QR mark, video initiate, and result generation. `MultiSchoolMultiTenantIT` proves the N+1 request returns HTTP 429 through the shared API limiter. |
| CVE / dependency scans now run as a PR-triggered release gate. | P0-18 updated `.github/workflows/security-nightly.yml` into `Security — Release Gate`, adds `pull_request` triggers for `main` and `release/**`, removes OWASP report-only mode, and scans a freshly-built backend image with Trivy on the current ref. |
| Required reason capture on irreversible actions now exists. | P1-13 added a shared `ReasonRequest`, requires reason bodies for student graduate/transfer/suspend, staff terminate, fee waive, academic-year close, and tenant suspend, stores the reason in audit metadata, and adds frontend reason dialogs for those flows. |
| `/v1/student/me`, `/v1/parent/me`, `/v1/teacher/me`: **still missing**. | grep for these endpoint strings returns 0 matches; only `/v1/school-admin/me` exists. |
| Backend tests at HEAD after P1-13: **246 pass / 0 fail / 0 error / 0 skip** (`mvn -f backend/pom.xml test` re-run on 2026-05-25, exit 0). Surefire includes `*IT` so `MultiSchoolMultiTenantIT` is part of the normal backend gate. |
| Frontend at HEAD: `tsc -b` PASS, `npm run build` PASS, `npm run lint` PASS. |

---

## 1.2 Simple Founder Answer

> Plain answers a non-engineer can act on. Each number is updated through Task 20 / P1-13 on 2026-05-25.

**Q1. How many changes are required right now before I can safely show the product to a prospective school (Customer Demo Ready)?**
**0 tasks remain out of the original 8. Customer Demo Ready is complete for demo-only conversations.** **P0-01, P0-02, P0-03, P0-04, P0-12, P0-13, P0-14, and P1-09 are done.** Demo data is visibly labeled and reset-safe; do not use real student, parent, or payment data in demos.

**Q2. How many changes before I can onboard pilot schools (Controlled Pilot Ready)?**
**4 tasks remain.** Controlled Pilot Ready now requires the remaining pilot-critical Phase-1 items: profile endpoints, audit-log viewer, per-tenant restore drill, and privacy policy + Terms. After these, you can safely take 1–3 friendly schools as pilots — single-campus only.

**Q3. How many changes before I can charge real money (First Paid Customer Ready)?**
**19 tracked engineering/product/security tasks remain PLUS mandatory non-task commercial/operational evidence.** The remaining tracked-task calculation is **4 pilot tasks + 8 remaining Phase-1 items not already in pilot + 7 Phase-2 paid-readiness items = 19**. The 7 Phase-2 items required for Level C are exactly:
- **P2-01** Report-card PDF download (student + parent).
- **P2-02** Parent read-only child documents.
- **P2-04** In-app notification feed.
- **P2-05** Student leave application via parent.
- **P2-09** MFA for School Admin and Super Admin.
- **P2-10** External penetration test with all CRITICAL findings fixed and HIGH findings fixed or formally accepted.
- **P2-11** Customer-facing data-export endpoint.

> CloudCampus must not store real paying-school student, parent or payment data under a commercial contract until an independent penetration test has been completed and all critical findings have been remediated.

**The tracked tasks are necessary but not sufficient. Paid commercial sale also requires the mandatory non-task evidence listed in §16.5 / §18 (completed controlled-pilot validation period, published pricing, published Privacy Policy + Terms + DPA, public security/trust page, documented support/escalation process, documented payment reconciliation process, external pen-test sign-off).**

**Q4. What are the first 5 changes I must implement?**
1. **P0-02** — Add `@PreAuthorize("hasRole('STUDENT')")` to `QrAttendanceController`. One-line annotation + a 1-method role-matrix negative test. Closes the QR self-mark security gap.
2. **P0-03** — **Not just a matcher change.** Inventory every endpoint under `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**`, `/v1/mobile/**`; classify each as role-exclusive / intentionally shared / misplaced / dead; add SecurityConfig matchers only for role-exclusive paths; move or carve allow-rules for shared paths (e.g. Teacher portal currently consumes `/v1/student/online-classes` and `/v1/student/videos`). Includes regression tests. **Treat as analysis + secure implementation + regression tests, not a one-line change.**
3. **P0-04** — Add class-level `@PreAuthorize` to **14** `/v1/school-admin/...` controllers (Student, Staff, Fee, AcademicYear, ClassRoom, Section, Subject, Department, SchoolSettings, Attendance, ParentLink, Student/Staff Profile-360, SchoolDashboard). `StudentDocumentController` already has it.
4. **P0-13** — Add `@PreAuthorize` to `MobileController` AND replace its hard-coded `"MAIN"` school resolver with caller-context resolution **for notices only** (parent-portal resolver is now scoped to P0-01).
5. **P0-01** — Fix `ParentPortalServiceImpl.resolveSchool()` to use the linked child's actual `Student.schoolId` for `getChildResults` and `getChildTimetable`. **Parent-portal-only scope; MobileController is no longer touched by this task.**

Tasks 1 + 5 are tight code edits with focused tests. Task 2 is the largest of the five (endpoint inventory + matcher design + regression suite); plan a full day for it. Tasks 3 + 4 are mostly mechanical with tests.

**Q5. What features should I stop building until these are complete?**
- AI insights upsell.
- Transport / hostel / library / payroll modules.
- Public website builder polish.
- Investor / Experience Studio polish.
- New role portals (mobile app already removed — keep it removed).

Build none of these until the remaining Controlled Pilot Ready blockers are complete and tests are green.

---

## 1.3 Implementation Progress Tracker

> Last updated: 2026-05-25 after Task 20 / P1-13 landed. Tracked via the §17 Top-25 queue order and the §16 phase tables. All counts re-derived from the actual code state at HEAD.

### Completed tasks (verified by `mvn test` green)

| Order in §17 | Task ID | Title | Verified date | Test result |
|---:|---|---|---|---|
| **1** | **P0-02** | `@PreAuthorize("hasRole('STUDENT')")` on `QrAttendanceController` + role-matrix tests | 2026-05-23 | 179 tests pass (was 174) |
| **2** | **P0-03** | Inventory + secure role-paths without breaking shared APIs (SecurityConfig matchers + shared `/v1/student/videos/**`, `/v1/mobile/**` carve-outs) | 2026-05-24 | 202 tests pass (was 179, +23 role-matrix cases) |
| **3** | **P0-04** | Class-level `@PreAuthorize` on **13** School Admin controllers (audit report said 14; `SchoolDashboardController` already had it and was excluded) | 2026-05-24 | 202 tests pass (no new tests; defence-in-depth) |
| **4** | **P0-13** | `MobileController` class-level `@PreAuthorize` + `resolveMainSchool` → `resolveCallerSchool` using JWT `schoolId` via `SchoolRepository.findByIdFiltered` (tenant-filter-aware) | 2026-05-24 | 202 tests pass |
| **5** | **P0-01** | `ParentPortalServiceImpl` resolves parent child results/timetable from the linked child's actual `Student.schoolId`, with no `"MAIN"` lookup | 2026-05-24 | 204 tests pass (was 202, +2 parent service cases) |
| **6** | **P0-05** | `TenantSecurity.assertSchoolBelongsToTenant(UUID)` added and enforced for `/v1/school-admin/schools/{schoolId}/...` via the shared school-path interceptor | 2026-05-24 | 205 tests pass (was 204, +1 cross-tenant school-path case) |
| **7** | **P0-08** | Parent-visible child results now use `ExamStatus.COMPLETED` as the existing lifecycle's published-equivalent status; draft exam results are excluded | 2026-05-24 | 206 tests pass (was 205, +1 repository draft-exclusion case) |
| **8** | **P0-09** | Student self-profile-360 now uses `getSelfProfile(...)` with server-side redaction of restricted sections and sensitive top-level aggregates | 2026-05-24 | 207 tests pass (was 206, +1 self-profile redaction case) |
| **9** | **P0-06** | Payment verify is role-scoped and rejects non-admin users verifying another user's order | 2026-05-24 | Focused 90-test payment/RBAC suite passes |
| **10** | **P0-14** | Parent fee payment order endpoint and parent portal Pay Online flow | 2026-05-24 | Focused 90-test payment/RBAC suite passes; frontend build passes |
| **11** | **P0-17** | Multi-school / multi-tenant integration matrix covering TI-01..TI-10 plus expanded role-matrix negatives | 2026-05-24 | 10-test P0-17 suite passes; 101-test focused regression suite passes |
| **12** | **P0-15** | Container CVE dependency bumps: Tomcat 10.1.55, Netty 4.1.133.Final, BouncyCastle 1.84, MinIO 8.6.0, commons-io 2.14.0, org.json 20231013, explicit okhttp 4.12.0 pin | 2026-05-24 | Dependency list confirms target versions; focused storage/payment suite passes; backend suite passes |
| **13** | **P0-12** | Forced first-login password-change gate, prod bootstrap password enforcement, and frontend redirect to `/change-password` | 2026-05-24 | Focused backend 15-test suite passes; backend 236-test suite passes; ProtectedRoute 9 tests pass; frontend build passes |
| **14** | **P0-07** | Critical mutation audit hooks across fee/payment, student lifecycle, marks/results, notices, leave approvals, settings, academic years, custom domains, parent links, and AI Copilot | 2026-05-24 | Focused payment integration tests pass; backend 236-test suite passes |
| **15** | **P0-10** | Bulk Promote Students dry-run preview (`?dryRun=true`) plus UI preview wiring | 2026-05-24 | `StudentServiceImplTest` focused dry-run tests pass; frontend build passes; backend 238-test suite passes |
| **16** | **P1-09** | Demo tenant reset hardening plus visible demo-only banner across demo role portals | 2026-05-24 | `DemoResetSchedulerTest` passes; `DemoEnvironmentBanner` tests pass; frontend build passes |
| **17** | **P0-16** | Shared API rate limiting on AI Copilot, notifications, WhatsApp, payment-order creation, QR mark, video initiate, and result generation | 2026-05-24 | `RateLimitedEndpointCoverageTest` + `MultiSchoolMultiTenantIT` pass; backend 241-test suite passes |
| **18** | **P0-11** | `@Valid` sweep across mutating controller bodies plus DTO constraints for OnlineClass, Video confirm, Experience Studio, Public Website, public demo/events, prompt render, optional reviews, investor access, student assignment submit, and bulk student rows | 2026-05-24 | `MutatingRequestBodyValidationCoverageTest` + `PublicEndpointValidationHttpTest` pass; backend 245-test suite passes |
| **19** | **P0-18** | PR-blocking CVE / dependency scan gate with OWASP Dependency Check and Trivy on the current backend image | 2026-05-25 | `security-nightly.yml` now runs on PRs, OWASP fails on CVSS >= 7, and Trivy scans a freshly-built local backend image for HIGH/CRITICAL findings |
| **20** | **P1-13** | Required reason capture for irreversible actions with audit metadata and frontend confirmation dialogs | 2026-05-25 | Focused 15-test backend suite passes; backend 246-test suite passes; frontend build passes |

### Per-milestone progress

| Milestone | Total tracked tasks | **Done** | Remaining | Next gate task |
|---|---:|---:|---:|---|
| **Level A — Customer Demo Ready** | 8 | **8** | **0** | Complete |
| Level B — Controlled Pilot Ready | 24 | **20** | **4** | P1-01 (Order 21) |
| Level C — First Paid Customer Ready | **39 tracked + non-task evidence** | **20** | **19 tracked + all non-task evidence** | P1-01 (Order 21) |
| Level D — Revenue Expansion Ready | 47 | 20 | 27 | P1-01 (Order 21) |
| Level E — Scale / Enterprise Ready | 56 | 20 | 36 | P1-01 (Order 21) |

### Per-phase progress

| Phase | Total | **Done** | Remaining | Notes |
|---|---:|---:|---:|---|
| Phase 0 | 18 | **18** (P0-01, P0-02, P0-03, P0-04, P0-05, P0-06, P0-07, P0-08, P0-09, P0-10, P0-11, P0-12, P0-13, P0-14, P0-15, P0-16, P0-17, P0-18) | 0 | Phase 0 complete |
| Phase 1 | 14 | 2 | 12 | P1-09 and P1-13 complete |
| Phase 2 | 10 | 0 | 10 | Includes P2-10 pen-test (mandatory for Level C) |
| Phase 3 | 7 | 0 | 7 | |
| Phase 4 | 7 | 0 | 7 | |
| **Total** | **56** | **20** | **36** | |

### Remaining Level-A tasks

All **8 Customer-Demo-Ready tasks** are complete.

### Test posture at HEAD

| Suite | Count | Status |
|---|---:|---|
| Backend `mvn -f backend/pom.xml test` | **246** | PASS (0 failures, 0 errors, 0 skipped; includes `*IT`) |
| Focused P0-07 payment integration suite | 2 | PASS (`PaymentFlowIntegrationTest`, `PaymentWebhookIdempotencyTest`) |
| Focused P0-12 backend suite | 15 | PASS (`AuthServiceImplTest`, `ForcePasswordChangeFilterTest`, `SecretsGuardConfigTest`) |
| Frontend `ProtectedRoute.test.tsx` | 9 | PASS |
| Focused P0-15 storage/payment suite | 25 | PASS (`StorageServiceTest`, `PaymentServiceImplTest`, `PaymentFlowIntegrationTest`, `PaymentWebhookIdempotencyTest`) |
| `MultiSchoolMultiTenantIT` alone | 10 | PASS (TI-01..TI-10) |
| Focused P0-17 regression suite | 101 | PASS (`MultiSchoolMultiTenantIT`, `RoleMatrixIntegrationTest`, `PaymentServiceImplTest`, `ParentPortalServiceImplTest`) |
| Focused P1-13 reason-capture suite | 15 | PASS (`FeeServiceImplTest`, `CrossTenantIsolationIntegrationTest`, `MutatingRequestBodyValidationCoverageTest`) |
| Focused P0-16 rate-limit suite | 11 | PASS (`RateLimitedEndpointCoverageTest`, `MultiSchoolMultiTenantIT`) |
| `RoleMatrixIntegrationTest` alone | 79 | PASS (+P0-06 payment verify role/owner coverage) |
| Frontend `npx tsc -b` | — | PASS via `npm run build` on 2026-05-24 |
| Frontend `npm run build` | — | PASS on 2026-05-24 |
| Frontend `npm run lint` | — | PASS as of last full run on 2026-05-22 |

---

## 2. Current Product Snapshot

### What exists in code today (verified from `frontend/src/features/`, `backend/src/main/java/com/cloudcampus/`)

- **Roles wired end-to-end:** SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT (auth, dedicated layout, dedicated API surface).
- **Modules with a real backend + frontend pair:**
  - Auth (login, refresh, forgot/reset password, change password, MFA stubs).
  - Tenant / Subscription / Feature flags (Super Admin).
  - School management (academic years, classes, sections, subjects, departments, settings).
  - Students (admit, list, profile-360, document upload, bulk import, promotion).
  - Staff/Teachers (CRUD, lifecycle, profile-360, leave, staff attendance).
  - Attendance (sessions, mark, QR teacher-issuing, student QR self-mark, reports).
  - Homework + Assignments (create/list/grade/submit, both admin and teacher paths).
  - Exams + Marks + Results.
  - Fees (categories, structures, records, waiver, payment-order + Razorpay verify).
  - Notifications (email, push, WhatsApp) — backend controllers exist; outbound channels need provider config.
  - Notices (admin CRUD + mobile shared listing).
  - Timetable (admin CRUD + teacher self + student self + parent self).
  - Reports (attendance / fees / performance + CSV export).
  - Public Website builder (CRUD pages + sections + nav).
  - AI Copilot (Anthropic Claude) for School Admin + prompt/knowledge management for Super Admin.
  - Custom domain registration & verification.
  - Lesson plans, online classes, video upload (teacher).
- **Infrastructure that exists:** [docker-compose.yml](docker-compose.yml), [infra/](infra/) (alertmanager, grafana, k8s starter, **load-tests**, loki, nginx, **pgbackup**, prometheus, promtail, secrets, tempo).
- **CI workflows:** [.github/workflows/](.github/workflows) — `ci.yml`, `deploy.yml`, `docker-publish.yml`, `dr-drill.yml`, `openapi-publish.yml`, `security-nightly.yml`.
- **Docs:** Significant documentation tree at [docs/](docs/) — `00-core`, `01-backend` through `14-decisions`, `role-audits`, `reference`.
- **Tests:** 246 backend tests pass after P1-13 (see §1.3 validation). Tests cover at least: tenant isolation, role matrix, payment webhook idempotency, payment flow, retention, AI insight, fee/exam service unit, parent result draft-exclusion, student self-profile redaction, prompt injection defences, parent payment ownership, storage service compatibility, forced password-change enforcement, prod bootstrap secret validation, student-promotion dry-run, demo reset hygiene, high-cost endpoint rate-limit coverage, mutating request-body validation coverage, required reason enforcement, invalid public payload HTTP 400 behavior, and multi-school / multi-tenant regression scenarios.

### What is mocked / hardcoded / incomplete

- **`MobileController.resolveMainSchool()` hard-codes `findByTenantIdAndCode(tenantId, "MAIN")`** (file [backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java](backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java) lines 90–98). Same hard-coding in `ParentPortalServiceImpl.resolveSchool()` ([backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java](backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java) lines 156–160). A real tenant with >1 school cannot use Notices, Parent Results, or Parent Timetable correctly.
- **`QrAttendanceController` has no `@PreAuthorize`** ([backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java](backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java) lines 29–50). Any authenticated user can hit `/v1/student/attendance/qr-mark`.
- **14 controllers under `/v1/school-admin/...`** have no method-level `@PreAuthorize` and depend only on `SecurityConfig.requestMatchers("/v1/school-admin/**").hasAnyRole("SCHOOL_ADMIN","TENANT_ADMIN")` — see §6. (`StudentDocumentController` already has `@PreAuthorize("hasRole('SCHOOL_ADMIN')")` at line 35 and is excluded.)
- **`AuditLogService` critical mutation coverage now exists** ([backend/src/main/java/com/cloudcampus/audit/service/AuditLogService.java](backend/src/main/java/com/cloudcampus/audit/service/AuditLogService.java)) for core dispute surfaces: fee waive/payment, student lifecycle, marks/results, notices, leave approvals, school settings, academic years, custom domains, parent links, and AI Copilot. P1-13 now captures required reasons on irreversible actions; audit viewer UI remains a pilot-readiness task.
- **Parent payment flow now exists for Razorpay test-mode demos (P0-14).** `POST /v1/parent/children/{studentId}/fee-records/{recordId}/payment-order` creates orders only for linked children and matching fee records. Production hardening remains in P1-07.
- **No `/v1/parent/me` and no `/v1/student/me` / `/v1/teacher/me` endpoints**, so layouts show only auth-store username — no class/section/photo.
- **Container CVEs** — nightly Trivy previously reported 14 vulns (3 CRITICAL: Tomcat auth-bypass, improper authorization; 11 HIGH: Netty / BouncyCastle / commons-io / MinIO / org.json). P0-15 now pins the target dependency versions and explicit okhttp; re-run the container scan in CI after image build and make it PR-blocking in P0-18.
- **Profile-360 self endpoint redaction is now enforced server-side (P0-09).** Student self-service uses `getSelfProfile(...)`, which removes restricted/sensitive sections and top-level risk, behavior, family, health, AI and communication aggregates.
- **Notice schema only models notices targeted at `ALL/STUDENT/PARENT/TEACHER`** — no individual targeting, no consent workflow, no read receipts.
- **Reports CSV export is synchronous** ([backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java](backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java)) — large schools will hang the request thread.
- **Validation `@Valid` sweep now complete** for structured mutating request bodies. The only intentional raw `@RequestBody` exception is the Razorpay webhook body used for signature verification.

### Role-wise table

| Role | Existing Core Capabilities | Major Missing Features | Security / Correctness Risks | Sellability Status | Score |
|---|---|---|---|---|---|
| **Super Admin** | Tenant CRUD, suspend/activate, subscription assignment, feature toggles, analytics, AI prompts, knowledge base, AI usage, Experience Studio, Public Website builder, comparison | School create/list/detail in Super Admin; school-admin user creation; subscription plan CRUD; billing/payment view; impersonation/support access; audit log viewer; real system health | Experience Studio + Public Website mutating bodies now validate; critical audit rows now exist but no viewer UI; dashboard contains hardcoded health/monetization copy | **Operational, not sellable for self-service** | 64 |
| **School Admin** | Dashboard, academic structure, students, staff, attendance, fees, exams/marks/results, homework, assignments, timetable, notices, reports, website builder, custom domain, AI copilot, settings | Audit log viewer; subscription/invoices UI; class-teacher assignment endpoint; transfer certificate; bulk staff import; receipt resend; marks moderation; storage usage widget | Path-only RBAC; `schoolId` from URL not centrally verified against caller tenant/school; high-cost endpoints are rate-limited after P0-16 but results-generate still has no preview; bulk promote now has dry-run but remains irreversible after confirmation | **Functional for demo, unsafe for real customers** | 69 |
| **Teacher** | Dashboard, timetable, attendance + QR, homework list, assignment grading, lesson plans, online classes, video upload, leave, notices | `/v1/teacher/me`; create homework/assignments from Teacher portal; marks-entry permission; class-performance reports; exam duties roster; leave-balance | `/v1/teacher/**` not in SecurityConfig matcher list — relies solely on method-level `@PreAuthorize`; no class/section/subject assignment ownership check; assignment grading has no `maxMarks` clamp; attendance edit window not enforced; no audit log; video initiate is rate-limited after P0-16 but QR session generation still needs review; notice endpoint uses `/v1/mobile/notices` (any auth role) | **Works for read-heavy daily use; not commercially complete** | 74 |
| **Student** | Profile-360 (self), homework + submit, assignments + submit, timetable, attendance + QR self-mark, results, fees, Razorpay payment, notices | `/v1/student/me`, documents read-only, report-card PDF, in-app notifications, leave application, achievements export | P0-02/P0-09/P0-13/P0-17 now cover QR role gating, self-profile redaction, multi-school notices, and matrix regression. Remaining risks: no audit log on submits/payments and broader production hardening still needed | **Smallest surface; mostly correct on ownership; security gaps blocking** | 76 |
| **Parent** | Linked children list, child attendance / homework / results / timetable / fees, notices, Razorpay test-mode fee payment | `/v1/parent/me`, child profile/documents, leave application for child, in-app notifications, notice acknowledgement, parent-teacher messaging, upcoming exams | P0-01/P0-13 fixed the `MAIN` school resolver issues; P0-08 fixed draft result leakage; P0-14 added parent payment; P0-17 locks cross-owner and multi-school parent paths. Remaining risks: profile/consent/chat gaps and production payment hardening | **Readable portal plus demo payment flow; still needs pilot hardening** | 72 |

---

## 3. Existing Audit Consolidation

Findings from the five role audits ([docs/role-audits/](docs/role-audits/)) were re-verified against current code at commit `f53c009`. Status legend: ✅ confirmed in code; ⚠️ partially confirmed; ❌ contradicted; ➕ new finding from this scan.

| Finding | Source Audit | Verified in Current Code? | Business Impact | Final Priority |
|---|---|---|---|---|
| `QrAttendanceController` has no `@PreAuthorize` | Student | ✅ confirmed at [QrAttendanceController.java:29-50](backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java) | TEACHER/PARENT can call student self-mark | **Critical** |
| `MobileController.resolveMainSchool` hard-codes `"MAIN"` | Student + Parent | ✅ confirmed at [MobileController.java:90-98](backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java) | Wrong-school notices for multi-school tenants | **Critical** |
| `ParentPortalServiceImpl.resolveSchool` hard-codes `"MAIN"` | Parent | ✅ confirmed at [ParentPortalServiceImpl.java:156-160](backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java) | Wrong-school results + timetable for parents | **Critical** |
| `getChildResults` did not filter draft results | Parent | ✅ fixed 2026-05-24 in P0-08: parent flow now calls `findByStudentIdAndSchoolIdAndExamStatusOrderByCreatedAtDesc(..., ExamStatus.COMPLETED)`. `ExamStatus.PUBLISHED` does not exist in the current lifecycle. | Draft marks leak to parents | **Closed** |
| `/v1/payment/verify` is role-scoped and owner-checked | Student / Parent / Admin | ✅ P0-06 complete: `hasAnyRole('STUDENT','PARENT','SCHOOL_ADMIN','TENANT_ADMIN')` plus service-level order ownership check for non-admin roles | Money-path regression covered by payment/RBAC tests | Low |
| **14** `/v1/school-admin/...` controllers (Student, Staff, Fee, AcademicYear, ClassRoom, Section, Subject, Department, SchoolSettings, Attendance, ParentLink, Student/Staff Profile-360, SchoolDashboard) have no class-level `@PreAuthorize` | School Admin | ✅ confirmed today (2026-05-22) on each file. `StudentDocumentController` already has `@PreAuthorize("hasRole('SCHOOL_ADMIN')")` at line 35 — removed from list. | Defence-in-depth gap. Today blocked by SecurityConfig URL rule; a future SecurityConfig refactor could silently downgrade | **Critical** |
| `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**` not in SecurityConfig matchers | Student + Parent + Teacher | ✅ confirmed at [SecurityConfig.java:142-180](backend/src/main/java/com/cloudcampus/config/SecurityConfig.java) | Same defence-in-depth gap; method-level `@PreAuthorize` is the only gate | **Critical** |
| Critical mutation audit logs | All five | ✅ P0-07 complete for fee waive/payment, payment orders/capture, student status/lifecycle and bulk promotion, parent links, marks/results, notices, leave approvals/rejections/cancellations, school settings, academic years, custom domain delete, and AI Copilot query. Remaining audit work is viewer UX, reason capture, and lower-risk module coverage. | Core disputes now have provenance; pilot evidence still needs a viewer | **Closed for P0-07; follow-ups in P1-04/P1-13** |
| Profile-360 self endpoint returned admin-only sections | Student | ✅ fixed 2026-05-24 in P0-09: `StudentSelfProfile360Controller` now calls `StudentProfile360Service.getSelfProfile(...)`, which redacts restricted sections and sensitive top-level aggregates | Sensitive parent / risk / behavior data shown to student | **Closed** |
| Parent fee payment endpoint | Parent | ✅ P0-14 complete: parent `createOrder` exists with child-link and fee-record ownership checks | Production hardening remains in P1-07 | Medium |
| No `/v1/teacher/me`, `/v1/student/me`, `/v1/parent/me` | Teacher + Student + Parent | ✅ confirmed: only `/v1/school-admin/me` exists | UX blocker for demos | **High** |
| Teacher endpoints have no class/section/subject ownership check | Teacher | ✅ confirmed: any TEACHER of the same school can fetch any class roster via `/v1/teacher/attendance/students` | Privacy + integrity risk | **Critical** |
| Assignment grading does not clamp marks to `assignment.maxMarks` | Teacher | ⚠️ confirmed at DTO level only (`@Valid` present at controller). Need to check `TeacherAssignmentController.grade` service for bounds | Data correctness risk | **High** |
| Attendance edit window not enforced server-side | Teacher | ⚠️ requires runtime check; `school_settings.allowLateAttendance` and `lateCutoffMinutes` exist as columns | Process integrity | **High** |
| Bulk promote students has dry-run protection | School Admin | ✅ P0-10 complete: `StudentController.promote` accepts `dryRun=true`; service returns proposed source/target delta without save/audit; UI consumes backend preview before commit | Mass mutation now has backend preview guard; still irreversible once confirmed | **Closed for P0-10** |
| Reports `/export` is synchronous | School Admin | ✅ confirmed in [ReportController.java](backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java) | Large schools will hang request threads | **High** |
| Sidebar / menu mismatches: `/v1/school-admin/online-classes`, `/videos`, `/lesson-plans`, `/storage/quota` exist but no UI consumes them | School Admin | ✅ confirmed | Dead APIs / wasted attack surface | **Medium** |
| `getLinkedChildren` runs 2 attendance count queries per child (N+1) | Parent | ✅ confirmed | Performance | **Medium** |
| `ParentDashboardPage` issues 1 + N×3 + 1 React Query calls on mount | Parent | ✅ confirmed in [ParentDashboardPage.tsx:39-72](frontend/src/features/parent/pages/ParentDashboardPage.tsx) | Mobile bandwidth waste | **Medium** |
| `StudentDashboardPage` issues 7 parallel queries on mount | Student | ✅ confirmed | Same | **Medium** |
| Cross-tenant + cross-owner negative tests are sparse | All five | ⚠️ `CrossTenantIsolationIntegrationTest` and `RoleMatrixIntegrationTest` exist; cover a small subset | Security regression risk | **Critical** |
| Container image carried 11 HIGH + 3 CRITICAL CVEs | (new — from CI) | Dependency bumps landed in P0-15; local Trivy CLI was unavailable, so CI/image scan must re-confirm | Hard blocker until CI scan verifies clean image | **Critical** |
| `OpenAPI publish` CI job fails because RabbitMQ is not available in runner | (new — from CI) | ➕ confirmed by today's CI logs | CI hygiene only — no security impact | **Low** |
| `setPublished` uses query-param boolean instead of body | School Admin | ✅ confirmed | Cosmetic | **Low** |
| Webhook signature HMAC verification implemented | (new — positive) | ➕ confirmed at [PaymentServiceImpl.java:291-307](backend/src/main/java/com/cloudcampus/payment/service/PaymentServiceImpl.java) | Strength to retain | n/a |
| DR drill workflow exists (`backup → encrypt → upload → restore → validate`) | (new — positive) | ➕ confirmed at [.github/workflows/dr-drill.yml](.github/workflows/dr-drill.yml) | Strength to retain | n/a |
| Tenant suspension filter exists and runs after JWT filter | (new — positive) | ➕ confirmed at [TenantSuspensionFilter.java](backend/src/main/java/com/cloudcampus/common/tenant/TenantSuspensionFilter.java) | Strength to retain | n/a |

---

## 4. Must-Fix Release Blockers Before Selling

| ID | Problem | Evidence / File Paths / APIs | Why It Blocks Sale | Exact Fix Direction | Verification Needed |
|---|---|---|---|---|---|
| BL-01 | Multi-school resolver hard-codes `"MAIN"` | [MobileController.java:90-98](backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java), [ParentPortalServiceImpl.java:156-160](backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java) | Wrong data shown to parents + students at any tenant with >1 school; cannot honestly sell to multi-campus schools | Resolve school from `Student.schoolId` (parent case) or current Student's record (student case). Add `findByUserIdAndTenantId` accessor. | Integration test with 2-school tenant: parent of school-B child must not see school-A's notices/results/timetable. |
| BL-02 | `QrAttendanceController` has no `@PreAuthorize` | [QrAttendanceController.java:29-50](backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java) | Any authenticated role can call student QR self-mark; defence-in-depth completely missing | Add `@PreAuthorize("hasRole('STUDENT')")` at class level. | RBAC test: TEACHER/PARENT/SCHOOL_ADMIN JWT → 403. |
| BL-03 | `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**` not in SecurityConfig matchers | [SecurityConfig.java:142-180](backend/src/main/java/com/cloudcampus/config/SecurityConfig.java) | A future refactor that drops a controller-level `@PreAuthorize` silently downgrades to "any authenticated" | **Do NOT add broad role matchers blindly.** Required steps: (1) **inventory** every endpoint under `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**`, and `/v1/mobile/**`; (2) **classify** each endpoint as role-exclusive, intentionally shared, misplaced, or unused/dead; (3) add strict SecurityConfig matchers + method-level `@PreAuthorize` **only** for role-exclusive endpoints; (4) **move** intentionally shared endpoints (e.g. Teacher portal consumes `/v1/student/online-classes` and `/v1/student/videos`) to neutral paths such as `/v1/shared/**` or `/v1/mobile/**`, OR add specific allow-rules before the broad matcher; (5) **require role-matrix and regression tests** so valid Teacher/Student/Parent flows do not break. | Updated `RoleMatrixIntegrationTest` covers all role-exclusive endpoints; explicit shared-endpoint contract tests pass; full `mvn test` + frontend build/typecheck/lint green; manual smoke of Teacher video/online-class and Student profile-360 flows. |
| BL-04 | **14** `/v1/school-admin/...` controllers lack class-level `@PreAuthorize` (re-verified 2026-05-22) | StudentController.java:50, StaffController.java:47, FeeController.java:65, AcademicYearController.java:39, ClassRoomController.java, SectionController.java, SubjectController.java, DepartmentController.java, SchoolSettingsController.java, AttendanceController.java, ParentLinkController.java, StudentProfile360Controller.java, StaffProfile360Controller.java, SchoolDashboardController.java. `StudentDocumentController` (line 35) already has `@PreAuthorize` and is **excluded**. | Same defence-in-depth gap | Add `@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN')")` at class level to each of the 14. | Existing `mvn test` must remain green. |
| BL-05 | Per-request school ownership not centrally verified | All `/v1/school-admin/schools/{schoolId}/...` endpoints | SCHOOL_ADMIN of tenant A could try `schoolId` of tenant B; only blocked if every service includes tenantId filter. | Introduce `TenantSecurity.assertSchoolBelongsToTenant(UUID schoolId)` helper, call it from each controller (or use an `HandlerMethodArgumentResolver`/aspect). | Cross-tenant test: SCHOOL_ADMIN of tenant A hits tenant B's `schoolId` → 404. |
| BL-06 | `PaymentController.verify` broad gate | [PaymentController.java](backend/src/main/java/com/cloudcampus/payment/controller/PaymentController.java), [PaymentServiceImpl.java](backend/src/main/java/com/cloudcampus/payment/service/PaymentServiceImpl.java) | **Fixed in P0-06.** Role list narrowed and service asserts ownership for non-admin roles. | Keep payment/RBAC regression tests in CI. | Negative test: user A verifies user B's payment-order → 403. |
| BL-07 | Critical mutation audit-log writes | P0-07 added audit calls in finance/payment, student lifecycle, marks/results, notices, leave, school settings, academic year, custom domain, parent link, and AI Copilot flows; P1-13 added required reason metadata to irreversible actions | Core disputes (fee, marks, leave, promotion, suspend) now have provenance and operator rationale; audit viewer remains required before pilot | Keep audit writes in critical mutation paths; complete P1-04 viewer. | Focused payment/reason suites pass; backend 246-test suite passes. |
| BL-08 | `getChildResults` returned draft results | [ParentPortalServiceImpl.java:103-111](backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java) | Parents could see provisional marks before publication — process violation | **Done in P0-08:** filter to `ExamStatus.COMPLETED`, the existing published-equivalent lifecycle state (`PUBLISHED` does not exist). | `ExamResultRepositoryTest`: draft exam not visible to parent-visible query. |
| BL-09 | Profile-360 self leaked admin-only sections | [StudentSelfProfile360Controller.java:23-39](backend/src/main/java/com/cloudcampus/student/profile/controller/StudentSelfProfile360Controller.java) previously used the same admin aggregate | Student saw risk_profile / behavior_records / communication_centre | **Done in P0-09:** `getSelfProfile(...)` strips restricted sections and sensitive top-level aggregates; controller uses tenant-scoped student lookup. | `StudentProfile360ServiceImplTest`: redacted sections and aggregates are NOT in response. |
| BL-10 | Bulk Promote Students dry-run | `POST /v1/school-admin/schools/{schoolId}/students/promote?dryRun=true` | **Fixed in P0-10.** The endpoint now previews proposed source/target promotion counts without saving or auditing; the UI waits for backend preview before enabling commit. | Keep dry-run flow in the promotion page and preserve focused service coverage. | `StudentServiceImplTest` proves dry-run leaves student class/section unchanged, does not call `saveAll`, and does not write audit. |
| BL-11 | Parent fee payment | `PaymentController` + parent portal | **Fixed for demo in P0-14.** Parent order creation exists with child-link and fee-record ownership checks; parent UI can start Razorpay test-mode payment. | P1-07 still required for production hardening and polish. | Parent pays own child's fee; another parent's child rejected. |
| BL-12 | Teacher cannot post homework / assignments from Teacher portal | No `POST /v1/teacher/homework` or `/assignments` | Sidebar implies feature; UX gap | Add the endpoints; reuse existing `HomeworkService.create` with teacher ownership. | UI + backend test. |
| BL-13 | Teacher access to class/section/subject not validated | All `/v1/teacher/...` endpoints accepting `classId`/`sectionId`/`subjectId` | Privacy/integrity risk between teachers of same school | Add `StaffAssignmentService.assertTeacherAssignedTo(...)`. | Cross-teacher test. |
| BL-14 | High-cost endpoint rate limiting | `SchoolAdminAiCopilotController`, `NotificationController`, `WhatsAppController`, `PaymentController`, `QrAttendanceController`, `VideoController`, `ResultController` | **Closed in P0-16.** Compromised-account blast radius is reduced for AI/WhatsApp/payment/QR/video/result-generation abuse paths. | Keep `@RateLimit` on these endpoints and tune `app.rate-limit.api.*` per environment. | `RateLimitedEndpointCoverageTest` verifies annotations; `MultiSchoolMultiTenantIT` proves N+1 returns HTTP 429. |
| BL-15 | Container CVEs (3 CRITICAL + 11 HIGH) | Tomcat 10.1.54, Netty 4.1.132, BC 1.78, MinIO 8.5.12, commons-io 2.13.0, org.json 20180130 | Production-blocking; CI security gate fails | **Done in P0-15:** `backend/pom.xml` now pins Tomcat 10.1.55, Netty 4.1.133.Final, BouncyCastle 1.84, MinIO 8.6.0, commons-io 2.14.0, org.json 20231013, and explicit okhttp 4.12.0 via properties/dependency management. | Dependency list confirms target versions; focused storage/payment suite PASS; full backend `mvn -f backend/pom.xml test` PASS (236 tests after P0-12). Run container Trivy again in CI after image build and make it blocking in P0-18. |
| BL-16 | DTOs missing `@Valid` across many mutating endpoints | `OnlineClassController.updateStatus/addRecording`, `VideoController.confirm`, `StaffLeaveController.submit`, `PaymentController.createOrderAdmin`, several Experience Studio + Public Website endpoints | Invalid state reaches DB | **Done in P0-11:** structured mutating request bodies now carry `@Valid`; loose maps on OnlineClass, Video confirm, and public investor access were replaced with typed request DTOs; Experience Studio and Public Website request DTOs now have bounds/blank/nested validation. | `MutatingRequestBodyValidationCoverageTest` proves every structured controller `@RequestBody` is validated except the raw Razorpay webhook body; `PublicEndpointValidationHttpTest` proves high-risk invalid public payloads return HTTP 400. |
| BL-17 | Cross-tenant + cross-owner integration tests sparse | [backend/src/test/java/com/cloudcampus/rbac/](backend/src/test/java/com/cloudcampus/rbac/) | A future regression that breaks isolation passes CI | New tests for: parent A vs child B; teacher A vs class B; student A vs result B; school-admin A vs school B; QR mark by non-student; verify-payment ownership; PUBLISHED-only results to parent. | Tests must FAIL before fixes land and PASS after. |
| BL-18 | Sensitive default credentials in repo | [.claude/memory/](Users/uttamkumar/.claude/projects/-Users-uttamkumar-uttam-all-data-01-github-projects-CloudCampus/memory/) memory file logs `superadmin/admin123` for local dev; demo seeder uses `Demo@1234` (per [docs/role-audits/SCHOOL_ADMIN_API_AUDIT_REPORT.md](docs/role-audits/SCHOOL_ADMIN_API_AUDIT_REPORT.md)) | These must NOT ship to production images | **Done in P0-12 + P1-09:** prod profile requires `BOOTSTRAP_ADMIN_PASSWORD`; prod bootstrap rejects blank/weak bootstrap secrets; users flagged `forcePasswordChange` can only call password-change/auth endpoints until the flag clears; demo tenant UI now labels demo-only data and warns against real data entry. | `SecretsGuardConfigTest`, `ForcePasswordChangeFilterTest`, `AuthServiceImplTest`, `DemoResetSchedulerTest`, and `DemoEnvironmentBanner` tests cover prod env rejection, forced password-change flow, reset hygiene, and demo labeling. |
| BL-19 | Production secrets handling not proven | [.env.example](.env.example) lists `JWT_SECRET` placeholder; `infra/secrets/` exists | Compromised JWT = mass impersonation across all tenants | Document KMS / Vault / sealed-secrets pipeline; rotate JWT signing keys; document refresh-token rotation on logout. | Runbook + rotation test in DR drill. |
| BL-20 | Public website / Experience Studio DTO validation gaps | (per Super Admin audit) | Half-built features create attack surface and false sales claims | **Partially closed by P0-11:** request DTO validation is now present. Remaining product risk is feature completeness / UI consumer maturity, not raw validation absence. | Manual review + tests. |

---

## 5. Security and Data Privacy Assessment

Review with the lens of a school that will store hundreds to thousands of children's names, addresses, exam scores, medical notes, and parent contact details.

| Security Area | Score / 10 | Evidence | Risk | Required Improvement |
|---|---:|---|---|---|
| Authentication | 6 | JWT + refresh tokens; BCrypt cost 10 ([SecurityConfig.java:97](backend/src/main/java/com/cloudcampus/config/SecurityConfig.java)); MFA scaffolding exists (`MfaPolicyTest`); first-login password-change gate and demo-only tenant labeling now exist | No enforced MFA for SCHOOL_ADMIN / SUPER_ADMIN; demo seed credentials are intentionally sample-only and must never ship as production defaults | Force MFA for SUPER_ADMIN + optional for SCHOOL_ADMIN; document JWT key rotation. |
| Password policy | 5 | BCrypt strength 10; OTP reset endpoint exists | No password complexity rules visible; no rotation; no breached-password check (HIBP) | Add password strength validator + HIBP API check. |
| JWT / refresh tokens | 7 | Stateless; refresh-token rotation in `AuthServiceImpl`; Redis-backed lockout test exists | JWT secret pinned in `.env.example`; multi-tenant blast radius if leaked | KMS / rotated signing keys; short-lived JWT (≤15 min); refresh rotation per request. |
| RBAC | 6 | `@EnableMethodSecurity`; per-portal layouts; URL path rules in SecurityConfig | **14** `/v1/school-admin/...` controllers without method-level `@PreAuthorize` (StudentDocumentController already protected and excluded); `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**` not in SecurityConfig matchers; `QrAttendanceController` totally unguarded | BL-02, BL-03, BL-04. |
| Tenant isolation | 6 | Hibernate `@Filter` tenant filter (`TenantFilterAspect`); `RequestContext.getTenantId()` used by most services; `CrossTenantIsolationIntegrationTest` exists | `schoolId` path param trusted at controller; multi-school `MAIN` hard-coding; no central school-ownership aspect | BL-01, BL-05. |
| Ownership checks | 7 | Parent: `linkRepo.existsByStudentIdAndParentUserId` (strong). Student: identity from JWT, never URL. Teacher: derives `staff` from JWT but does not check class assignment. | Teacher cross-class access; verify-payment ownership broad | BL-06, BL-13. |
| Student data privacy | 6 | Profile-360 self redaction now exists; documents in MinIO scoped by `tenantId/schoolId/studentId` keypath; encryption at rest depends on storage | Field-level redaction policy still needs formalization; presigned URL TTL not configured per call | Signed URL TTL config; data-retention rules (`DataRetentionService` exists but coverage unverified). |
| Parent access privacy | 7 | `checkAccess(studentId)` on every per-child call (strong) | Multi-school MAIN bug surfaces wrong child's data; parent profile / payment / consent missing | BL-01, BL-11. |
| Teacher authorization limits | 5 | `hasRole('TEACHER')` on every teacher controller | No class/section/subject ownership check between teachers of same school; can fetch any class roster | BL-13. |
| Admin privilege risk | 5 | SCHOOL_ADMIN can suspend / graduate / transfer / waive without audit, dry-run, or reason | Insider risk, dispute risk | BL-07, BL-10. |
| Payment security | 8 | HMAC-SHA256 webhook signature ([PaymentServiceImpl.java:291-307](backend/src/main/java/com/cloudcampus/payment/service/PaymentServiceImpl.java)); webhook idempotency by `eventId`; dedicated tests (`PaymentWebhookIdempotencyTest`, `PaymentFlowIntegrationTest`); payment-order creation is rate-limited after P0-16 | Production hardening and richer audit/viewer evidence remain | BL-07, P1-07. |
| Webhook verification | 9 | Verified HMAC; dedup table by `eventId` | Body-size cap not visible; replay window not bounded by signature timestamp | Add `Content-Length` cap; document Razorpay timestamp check. |
| Upload / document security | 6 | Storage service with magic-byte sniffing (`StorageServiceTest`); MinIO key path `tenantId/schoolId/studentId/...`; per-tenant quota (`StorageQuotaController`); upload audit exists for `StudentDocumentServiceImpl` | No antivirus / quarantine integration; MIME allowlist not visible at upload time for homework/assignment (no file upload there yet); presigned URL default TTL is the MinIO default | Add MIME allowlist + quarantine; tunable presigned URL TTL. |
| Audit trails | 5 | `AuditLogService` exists with `logDataPurge`, `logStudentProfileSectionUpdated`, etc.; used in 3 services | Most mutations not audited; no audit log viewer UI | BL-07; add Super-Admin and School-Admin audit log pages. |
| Logging + PII | 7 | `SensitiveDataPolicy` redacts Authorization; correlation IDs in MDC; JSON logs via `logstash-logback-encoder` | Verify PII (parent phone/email) not in logs; verify request body not logged for password endpoints | Test sweep on log redaction. |
| Secret handling | 5 | `.env.example` placeholders; `infra/secrets` exists; KMS not visible | Reviewer cannot verify whether prod uses KMS / Vault / sealed-secrets | Document and demo. |
| Backups + encryption | 7 | `infra/pgbackup/backup.sh` exists; DR drill workflow does encrypted backup + restore + row-count validation; `[backups]` GPG-encrypted to MinIO per workflow | Customer cannot verify "we can restore your school"; restore evidence runs monthly but no per-tenant restore tested | Per-tenant restore drill; customer-facing data-export endpoint. |
| OWASP / API security | 6 | CORS locked; security headers filter; CSRF disabled (stateless); rate-limit framework present | No formal pen-test; many endpoints lack rate limit; SecurityHeaders may need CSP for public website | External pen-test before charging money. |
| AI / prompt injection | 7 | `TASK-022 — Prompt injection defenses for prompt rendering` and `... for knowledge-base RAG` tests exist; `TASK-023 — Knowledge-base / Embedding tenant isolation` tests exist; AI Copilot query is rate-limited after P0-16 | No per-tenant AI cost cap | Integrate with `ai_usage_logs` quota. |

### Can a school legally and operationally trust this system today?

**Not without conditions.** The fundamentals (HMAC, tenant filter, JWT, BCrypt, encrypted backup, DR drill, prompt injection defences) are real and working. The day-to-day workflow surface is what is dangerous: a cross-tenant bug here, a wrong-school resolver there, a missing role guard on QR — any single one of these is a press-worthy incident if a school is operating.

### Security evidence to prepare before onboarding paying customers

1. **Security policy** + **data processing addendum (DPA)** + **breach notification SLA**.
2. **Tenant data deletion runbook** (test it against a real tenant in staging).
3. **Penetration test report** from a third party.
4. **MFA enrolment evidence** for SUPER_ADMIN and SCHOOL_ADMIN.
5. **Audit log retention policy** (today: no policy documented).
6. **Encryption-at-rest evidence** for PostgreSQL + MinIO.
7. **Restore-from-backup video** (DR drill workflow output).
8. **CVE / dependency scanning dashboard** (Trivy + OWASP Dependency Check; dependency bumps landed in P0-15; PR-blocking gate remains P0-18).

---

## 6. Tenant Isolation and Multi-School Correctness Review

### Confirmed vulnerabilities

| ID | Where | Symptom | Fix |
|---|---|---|---|
| TI-01 | [MobileController.java:90-98](backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java) | `resolveMainSchool` → `findByTenantIdAndCode(tenantId, "MAIN")` | Resolve from caller's `Student.schoolId` or one of parent's linked children's `schoolId`. |
| TI-02 | [ParentPortalServiceImpl.java:156-160](backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java) | Same hard-coded `"MAIN"` for parent results + timetable | Use `requireStudent(studentId).getSchoolId()`. |
| TI-03 | All `/v1/school-admin/schools/{schoolId}/...` endpoints | `schoolId` taken from URL, not centrally checked against caller's tenant | Single helper `TenantSecurity.assertSchoolBelongsToTenant(UUID)` called from every controller method. |
| TI-04 | `getChildResults` repository call | **Fixed in P0-08**: parent-visible query filters by `studentId + schoolId + exam status`, with the joined `Exam` constrained to the same school and tenant | Current implementation uses `ExamStatus.COMPLETED` because this lifecycle has no `PUBLISHED` state. `ExamResultRepositoryTest` proves DRAFT is excluded. |

### Suspected risks needing tests

| ID | Where | Hypothesis | Test |
|---|---|---|---|
| TI-05 | `StudentSelfProfile360Controller.java:39` | `studentRepo.findByUserId(RequestContext.getUserId())` (no `tenantId` filter) | If a `userId` UUID were re-used across tenants this would mis-route. Add `findByUserIdAndTenantId`. |
| TI-06 | Redis cache keys (`ff:{tenantId}`, audit caches) | Tenant prefix correct for feature flags; verify all cache keys carry tenantId | Test that `Cache::evict` for tenant A leaves tenant B keys intact. |
| TI-07 | MinIO key paths | `tenantId/schoolId/studentId/...` documented in `StudentDocumentServiceImpl.buildObjectKey` | Confirm no other module writes to a tenant-flat prefix. |
| TI-08 | AI knowledge base | `KnowledgeBaseTenantIsolation` test exists; verify all KB endpoints honour tenant scoping | Re-run + add School Admin specific scenario. |
| TI-09 | Scheduled jobs | `DataRetentionService` runs `@Scheduled` — verify it iterates per tenant, not globally | Read code; add per-tenant assertion. |
| TI-10 | RabbitMQ messages | Confirm tenantId is in message body for all queues; otherwise consumer must derive | Sample notification message. |

### Required integration test matrix (target file: `backend/src/test/java/com/cloudcampus/rbac/MultiSchoolMultiTenantIT.java`)

1. **Two-tenant test:** create tenant A and tenant B; SCHOOL_ADMIN(A) cannot hit `/v1/school-admin/schools/{schoolId-of-B}/...` (any endpoint).
2. **Two-school single tenant test:** tenant T has schools `MAIN` and `BRANCH`. Parent linked to a child in `BRANCH` — `/v1/mobile/notices`, `/v1/parent/children/{id}/results`, `/v1/parent/children/{id}/timetable` return `BRANCH` data, not `MAIN`.
3. **Parent isolation:** parent A linked to child X; parent A cannot read parent B's child Y.
4. **Teacher class assignment:** teacher T not assigned to class 5; `/v1/teacher/attendance/students?classId={class5}` → 403.
5. **Student self-only:** student S cannot reach student-Q's data via any URL (no studentId path param exists on Student endpoints; tests confirm).
6. **QR mark role gate:** TEACHER / PARENT / SCHOOL_ADMIN call `/v1/student/attendance/qr-mark` → 403.
7. **Payment ownership:** verify-payment with another user's `paymentOrderId` → 403.
8. **Profile-360 redaction:** student self-profile does NOT contain `riskProfile`, `behaviorRecords`, `communicationCenter`.
9. **Results published-equivalent only:** parent cannot see results when the exam is still `DRAFT`; current lifecycle uses `COMPLETED` for parent-visible results because `PUBLISHED` does not exist.
10. **AI Copilot quota:** N+1 requests over rate limit returns 429.

---

## 7. API and Backend Architecture Assessment

Modules ranked. Scores explicitly avoid claiming things that haven't been runtime-verified.

| Module | Backend Completeness | API Quality | Validation | Authorization | Auditability | Performance | Priority |
|---|---|---|---|---|---|---|---|
| Auth | 8 | 8 | 8 | 9 | **9 (audited)** | 8 | Keep |
| Tenant management | 8 | 7 | 6 | 8 | 4 | 7 | High |
| Subscription / feature flags | 7 | 7 | 6 | 7 | 4 | 6 | Medium |
| School management | 7 | 6 | 5 | **5 (no method-level RBAC)** | 3 | 7 | High |
| Students | 8 | 7 | 6 | **5 (no method-level RBAC)** | 4 | 7 | High |
| Staff / teachers | 7 | 6 | 5 | **5** | 3 | 7 | High |
| Parents | 6 | 6 | 7 | 8 | 2 | 5 (N×3 fan-out) | High |
| Attendance | 7 | 6 | 6 | **4 (QR no @PreAuthorize)** | 3 | 6 | Critical |
| Homework / assignments | 7 | 6 | 6 | 7 | 3 | 7 | Medium |
| Exams / results | 7 | 6 | 5 | 6 | 3 | 6 | High |
| Fees / payments | 8 | 7 | 7 | 7 | 5 | 7 | High |
| Notifications / notices | 6 | 5 | 5 | 6 (mobile/notices) | 3 | 5 (no paging) | High |
| Documents / uploads | 7 | 7 | 6 | 8 | **8 (audited)** | 7 | Medium |
| Timetable | 7 | 7 | 6 | 6 | 3 | 7 | Medium |
| Reports | 6 | 6 | 5 | 6 | 3 | 4 (sync CSV) | High |
| Website builder / public site | 6 | 5 | 4 | 7 | 3 | 6 | Medium |
| AI features | 7 | 7 | 6 | 7 (Copilot rate-limited) | 4 | 6 | High |
| Monitoring / audit | 6 (service ready) | 6 | 7 | 8 | n/a | 7 | High |
| Support / admin tooling | 3 (no impersonation, no audit-log viewer) | 3 | 3 | 8 | 3 | n/a | High |

Cross-cutting checks:

- **DTO validation:** P0-11 closes the structured mutating-body `@Valid` sweep. Raw Razorpay webhook body remains intentionally unvalidated because signature verification needs the exact payload.
- **Transaction boundaries:** `@Transactional(readOnly = true)` on services like `ParentPortalServiceImpl` — good. Mutating service methods generally annotated, but `TeacherAttendanceController.takeAttendance` combines two service calls without a wrapping `@Transactional` — must check.
- **Pagination:** missing on `/v1/student/homework`, `/v1/student/assignments`, `/v1/student/attendance`, `/v1/school-admin/.../fee-records`, `/notice-logs`, `/whatsapp/logs`, parent fees, parent results, teacher homework submissions.
- **Filters / search:** generally minimal.
- **Duplicate / dead APIs:** documented per-role (§3).
- **N+1:** confirmed in `ParentPortalServiceImpl.getLinkedChildren`; suspected in dashboard endpoints.
- **Caching:** Redis used for feature-flag cache, rate-limit counters, OTP. No HTTP response cache yet.
- **Rate limiting:** framework exists (`common.ratelimit`); P0-16 applies it to the high-cost/high-abuse endpoints. Broader non-critical API rate-limit policy can still be tuned later.
- **Idempotency:** strong on Razorpay webhook (`PaymentWebhookIdempotencyTest`). Other money-side endpoints (waive, payment-order) need idempotency keys.
- **Async reliability:** notifications dispatched async via `@Async` (`NotificationService.sendEmailAsync`, `PushService.sendPushToUserAsync`). RabbitMQ is wired; need to verify retry + DLQ.
- **Retry / DLQ:** not visible in the inspected files; needs explicit verification.

---

## 8. Frontend, UX and School Ease-of-Use Assessment

| User Type | Daily Tasks | Current Experience | Friction | Required UX Improvements | Revenue / Retention Impact |
|---|---|---|---|---|---|
| **School owner / principal** | Look at dashboard; ask "are fees being collected?", "any complaints today?" | School Admin dashboard works but lacks revenue / parent-satisfaction signals | No "Today's collection", "Parents notified", "Open complaints" widgets | Add executive dashboard + alerts; "this week" view | High retention impact |
| **School admin / operator** | Admit students, take fees, send notices, generate reports | Surface complete but unsafe (no audit / no dry-run / no rate limit). Bulk promote irreversible. Notice / email send via 3 separate places (notification, whatsapp, notice) | Confirmation dialogs for irreversible actions; dry-run preview for promote/bulk; unified "Communications" hub | Sale-blocker if a school operator accidentally promotes wrong class |
| **Teacher** | Take attendance, post homework, review submissions | Cannot post homework from Teacher portal (sidebar implies it should work). QR session usable. Timetable readable. | `POST /v1/teacher/homework` + UI; "My class students" quick view; submission filters | UX blocker for daily use |
| **Parent** | See child progress, pay fees, respond to notices | Read-only portal. Cannot pay fees, cannot acknowledge notices, cannot apply leave. Sees wrong school data in multi-school tenants. | Payment, leave, consent, profile, child profile/documents, notice ack — all missing | **Revenue blocker** (fees) + retention blocker (consent + chat) |
| **Student** | Submit homework, scan QR, check results, view fee status | Submit limited to text only. QR works. Results readable. Profile-360 over-shares. | File attachments, deadline enforcement, redacted profile, report-card PDF download | Medium |
| **Platform operator / Super Admin** | Onboard tenant, toggle plan, monitor health | Onboarding works (tenant create → seeds main school). Health dashboard hardcoded. No real Super-Admin school-or-admin-user creation UI. | Real system health endpoint; admin-user creation form; audit log viewer | Sale-readiness blocker — operator cannot demonstrate "we monitor everything" |

Cross-cutting frontend findings:

- **Mobile responsiveness:** Tailwind-based; mobile sidebar implemented. Forms have not been smoke-tested on small screens during this audit.
- **Empty / loading / error states:** present on most list pages; not uniformly. Profile pages (>500 lines) need section-level skeletons.
- **Accessibility:** ARIA labels on icon buttons; not formally audited.
- **Regional language:** `i18next` is in dependencies; bundling but not used for UI text in most pages (English-only).
- **Help / tutorial system:** none.
- **Sales-quality demo:** `gw.admin / Demo@1234` etc. — works but cannot be shown to a customer because the URLs / branding are dev.

---

## 9. Product Completeness for a Sellable School ERP

| Feature | Current Status | Needed For Pilot? | Needed For Paid Sale? | Monetization Potential | Recommended Phase |
|---|---|---:|---:|---|---|
| Admissions | Manual + bulk import | Yes | Yes | Low (table-stakes) | Phase 0 |
| Student records | Working | Yes | Yes | Low | Phase 0 |
| Staff management | Working | Yes | Yes | Low | Phase 0 |
| Attendance (QR + manual) | Working (with security gap BL-02) | Yes | Yes | Low | Phase 0 |
| Homework | Working from admin; **missing from teacher** | Yes | Yes | Low | Phase 0 |
| Assignments | Working from admin; **missing from teacher** | Yes | Yes | Low | Phase 0 |
| Exams / results | Working; P0-08 closes the parent draft-result leak by filtering to completed exams | Yes | Yes | Medium | Phase 0 |
| Fee plans | Working | Yes | Yes | Medium | Phase 0 |
| Online fee payment by parent | Working for Razorpay test-mode demo; production hardening remains in P1-07 | Yes (revenue case) | Yes | **High** | Phase 1 |
| Receipts | Working (PDF generation) | Yes | Yes | Low | Phase 0 |
| Notices | Working (with multi-school gap BL-01) | Yes | Yes | Low | Phase 0 |
| Parent communication (chat) | Missing | No | Recommended | High | Phase 2 |
| Leave (staff) | Working | Yes | Yes | Low | Phase 1 |
| Leave (student via parent) | Missing | Recommended | Yes | Low | Phase 1 |
| Timetable | Working | Yes | Yes | Low | Phase 0 |
| ID cards / certificates | Missing | No | Recommended | Medium (upsell) | Phase 2 |
| Reports | Working but sync export | Yes | Yes | Medium | Phase 1 |
| Transport | Missing | No | Optional | Medium (upsell) | Phase 3 |
| Library | Missing | No | Optional | Medium (upsell) | Phase 3 |
| Hostel | Missing | No | Optional | Medium (upsell) | Phase 3 |
| Payroll | Missing | No | Optional | High (upsell) | Phase 3 |
| Website / public admission form | Working basic | Yes | Yes | Medium | Phase 1 |
| Subscription control | Working (Super Admin side) | Yes | Yes | n/a | Phase 0 |
| Onboarding / data import | Bulk student import works; staff import missing | Yes | Yes | Medium (services) | Phase 0 |
| Demo environment | "Greenwood International School" seed exists | Yes | n/a | n/a | Phase 0 |
| Audit logs | Service exists; viewer UI missing | Yes | Yes | n/a | Phase 0 |
| Support / admin tools (impersonate, audit) | Missing | Recommended | Yes | Low | Phase 1 |
| Notifications / WhatsApp / SMS | Email + push + WhatsApp wired; provider config needed | Yes | Yes | **High** (pass-through) | Phase 0 |
| AI features | Copilot + prompt + KB; needs quota + audit | Optional | Optional | High (upsell) | Phase 2 |

---

## 10. Revenue and Monetization Strategy

### Recommended First Customer Segment

- **School type:** small-to-mid English-medium private K-12 schools (single campus, 300–1500 students). Indian / South Asian market is the strongest natural fit given existing demo data, Razorpay integration, and WhatsApp wiring.
- **Geography:** start in 1 city / 1 cluster you can physically reach. Pilot with 2–3 founder-network schools.
- **Why this segment:** complex enough to validate every feature (exams + fees + WhatsApp), small enough to support hands-on, willing to tolerate a 6–8 week stabilisation.
- **What they need first:** safe student records, working fee collection through parents, daily attendance, notices via WhatsApp, end-of-term results.
- **What NOT to promise yet:** transport / hostel / library; multi-campus chains; chat with teachers; AI insights as a sales claim; advanced HR/payroll.

### Suggested Pricing Hypotheses

All values are **hypotheses to test in market**, not committed prices.

| Plan | Target School | Included Features | Pricing Hypothesis | Why They Would Pay | Product Work Needed First |
|---|---|---|---|---|---|
| **Starter** | <500 students single campus | Auth, students, attendance, fees + Razorpay, notices, parent portal read-only, basic reports | ₹15–25 / student / year (annual) | Replaces excel + WhatsApp groups | BL-07, BL-18, plus pilot-critical Phase-1 tasks |
| **Growth** | 500–1500 students | Starter + exams + marks + results PDF, homework + assignments + teacher portal, WhatsApp pass-through, audit logs | ₹40–60 / student / year + WhatsApp pass-through | One system for daily ops | BL-12, BL-13, plus pagination + report PDFs |
| **Premium** | 1500+ students or chain | Growth + custom domain + website builder + AI Copilot + analytics + branding | ₹80–120 / student / year + setup ₹50k–2L | Differentiated brand + insights | Phase-2 features |
| **Enterprise** | Chain / network | Premium + multi-school correctness (real, not MAIN-hack), payroll, transport, dedicated SLA | Custom (₹3–10 L / year base) | Operational consolidation | Phase-3 + real multi-school resolver |

### First 10 Paying Schools Plan

1. **Demo method.** Use the Greenwood seed tenant. Show School Admin (admit student → fee structure → Razorpay test → notice) + Parent (view fees, view results). **Do not** demo multi-school flows until BL-01 is fixed. **Do not** demo Teacher posting homework until BL-12 is fixed.
2. **Onboarding process.** 1 week setup window: tenant create → school admin invite → import students + staff CSV → academic year + classes + sections → fee categories + structures → notice template → 1 test Razorpay payment from a parent number.
3. **Pilot agreement.** 60-day pilot at 50% off Starter. SLA: response in 4 working hours; bug fix in 5 working days; downtime credits.
4. **Support process.** WhatsApp + email; weekly check-in for first 4 weeks.
5. **Feedback cycle.** Friday call every week for 8 weeks; track open issues in a shared sheet.
6. **Feature commitments.** Lock to feature list. No "AI Copilot" promised. No "transport module" promised.
7. **Risk control.** Each pilot tenant gets:
   - Encrypted nightly backup verified (re-use DR drill).
   - Audit log retention 1 year.
   - Their own subdomain via custom domain flow.
   - A test parent account they can use to validate end-to-end.

---

## 11. Competitive and Sales Readiness

| Item | Status | Required Before … |
|---|---|---|
| Public website quality | Exists; content not fully reviewed; uses `/sites/:tenantCode` for tenant sites and a generic public site for marketing | … pilot demo |
| Product demo data | "Greenwood International School" seeder exists with 1130 students, 40 teachers, attendance, exams, fee records, notices, AI usage | Already pilot-quality |
| Demo school setup | Yes (in `DemoDataSeeder`) | Already demo-quality |
| Role-based demo logins | `gw.admin`, `gw.teacher001`, `gw.teacher002`, `gw.student001`, `gw.parent001` with `Demo@1234` | Already demo-quality; do not ship to production |
| Investor / customer pages | Public website page exists; needs sales copy review | Sales kickoff |
| Screenshots / videos | Not present in repo | Sales kickoff |
| Pricing page | Not present in repo | Sales kickoff |
| Trust / security page | Not present in repo | First paid customer |
| Privacy policy + terms | Not present in repo | First paid customer (legal requirement) |
| Support / contact flow | None visible in repo | First pilot |
| Case study readiness | None (no live customers) | After first 3 pilots |
| Sales pipeline tracking | Not in repo | Founder external (HubSpot/Notion) |

**Before showing schools:** Complete all Level A — Customer Demo Ready tasks: **P0-01, P0-02, P0-03, P0-04, P0-12, P0-13, P0-14 and P1-09.** Then rehearse the complete customer demo flow using demo data only. **Do not use real student, parent or payment data during demos.**

**Before collecting money:** add BL-07, BL-18, BL-19, complete the remaining Level-B / Level-C tracked tasks, have privacy policy / terms / DPA published, and have a public security disclosure page.

**Before claiming production readiness:** load test (see §12), real-world DR drill, external pen-test.

---

## 12. Scalability and Future Feature Readiness

Claimed targets: 1000 schools × ~1000 students × ~100 teachers each = ~1M students.

| Scale Area | Current Design | Expected Bottleneck | Safe Until Approx. | Required Improvement | Priority |
|---|---|---|---|---|---|
| DB tenancy | Shared-schema, `tenant_id` column on every row | Index pressure at >1M rows per table | Requires load testing | Composite indexes on `(tenant_id, …)`; partitioning for `attendance_records`, `audit_logs`, `notification_logs`, `ai_usage_logs` | High |
| Connection pool | HikariCP, env-driven sizing (`L-16`) | At ~50 schools concurrently active under heavy traffic | Requires load testing | Read-replica routing; pgbouncer in front | Medium |
| Pagination | Inconsistent across endpoints | List endpoints loading 10k+ rows | Now | BL pagination work | High |
| Caching | Redis used for FF + rate-limit + OTP + sessions | Dashboard count queries hit DB on every request | Now (medium tenants) | Per-tenant short-lived caches on dashboard counts | Medium |
| Queue (RabbitMQ) | Notifications dispatched async | Consumer retry/DLQ not visible | Requires verification | Add `@RabbitListener` retry policy + DLQ | High |
| Object storage | MinIO single-node in compose; assumes external (S3) in prod | Single-node MinIO crash | Now (prod) | Use AWS S3 / MinIO HA in prod; document | High |
| Reporting | Synchronous CSV in request thread | Request timeout for school >500 students | Now | Move to async job + status polling | High |
| Payment flow | Verified HMAC; webhook idempotent; need scaling test | Outbound to Razorpay; webhook re-delivery storm | Requires load testing | Add backpressure on order create | Medium |
| File uploads | StorageQuota per tenant | Quota check not on `presignedUrl` issue, only on upload | Requires load testing | Issue presigned URL only after quota check | Medium |
| Monitoring | Prometheus + Grafana + Loki + Tempo wired | Alert rules not reviewed in this scan | n/a | Define alert thresholds (DB connection saturation, queue lag, 5xx rate, p99 latency) | High |
| Scheduled jobs | `@Scheduled` + ShedLock | One node burning CPU per tenant iteration | Now (~100 tenants) | Per-tenant fan-out via queue | Medium |
| Backup / restore | DR drill monthly | Single shared volume tested; per-tenant restore not tested | n/a | Per-tenant restore drill | High |
| Onboarding new tenants | `POST /v1/super-admin/tenants` seeds main school | Multi-school tenant creation not exposed | Now (chain customers) | Add multi-school create | Medium |
| Data migration | Bulk import for students; no other import | Schools have legacy data in Excel | Now | Build "import" service per entity | High |
| Feature flags | Per-tenant via Redis | Cold start race on Redis miss | Now (rare) | Cache-aside with warm-up | Low |
| Deployment scaling | `infra/k8s/cloudcampus-starter.yaml` exists | Single replica template | Now (multi-replica) | HPA + readiness probes | Medium |

---

## 13. Reliability, DevOps and Operations Readiness

| Operations Capability | Exists? | Production Quality? | Evidence | Missing Work |
|---|---:|---:|---|---|
| Build pipeline | Yes | Yes | [.github/workflows/ci.yml](.github/workflows/ci.yml) — `Backend Build & Test`, `Frontend TS & Build`, `Secret Scan (TruffleHog)` all green | None for build correctness |
| Automated tests | Yes | Partial | 246 backend tests pass; frontend tsc/build pass; ProtectedRoute and demo-banner RTL tests pass; no broad frontend RTL suite | Per-mutation audit and broader frontend RTL coverage |
| Security scans | Yes (running) | Partial | Trivy + OWASP Dependency Check + TruffleHog (TruffleHog green); dependency bumps landed in P0-15; P0-18 made OWASP + Trivy PR-triggered and blocking | Confirm first PR run is green and configure branch protection to require the two security jobs |
| Docker configuration | Yes | Partial | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` | Multi-stage prod images verified once CVEs cleared |
| Production profiles | Yes | Partial | `application-prod.yml`, `application-dev.yml`, `application-staging.yml` (assumed) | Document each profile's variance |
| Health probes | Yes | Yes | `/actuator/health` used in CI | None |
| Alerts | Yes | Unknown | `infra/alertmanager/` exists | Review rules; document escalation |
| Logging | Yes | Yes | Loki + Promtail + Grafana | Document log-retention policy |
| Metrics | Yes | Yes | Micrometer + Prometheus + Grafana dashboards in `infra/grafana/` | Document SLO board |
| Backups | Yes | Yes | `infra/pgbackup/backup.sh` + DR drill workflow with GPG encryption + restore validation | Per-tenant backup/restore |
| Restores | Yes (drill) | Yes | DR drill workflow validates row counts after restore | Per-tenant restore proof |
| Database migrations | Yes | Yes | Flyway under `backend/src/main/resources/db/migration` | Continue strict migration discipline |
| Disaster recovery | Yes | Yes (monthly) | dr-drill.yml | Quarterly tabletop with founder + ops |
| Rollback plan | Partial | Unknown | No explicit rollback runbook visible | Write runbook |
| Incident response | Partial | Unknown | Correlation IDs in MDC; no incident playbook in repo | Write playbook |
| Support / admin tooling | Limited | No | No impersonation; no global audit-log viewer | Build these |
| Data export / delete | Partial | No | `DataRetentionService` exists | Build customer-facing export + delete |
| Tenant offboarding | Not visible | No | No "delete tenant" flow in code | Build delete + 30-day grace export |

Answers to required questions:

- **Can a failed deployment be rolled back?** Partially — depends on CI workflow `deploy.yml` (need to read for rollback step) and Flyway migrations being reversible. Not all migrations are reversible. **Document and test rollback procedure.**
- **Can a school's data be restored?** Yes, the workflow proves end-to-end restore on a fresh PostgreSQL once a month. Per-tenant restore is not exercised — needs work.
- **Can an issue be traced to a specific tenant/user/action?** Partially — correlation IDs in MDC are present (`CorrelationIdFilter`) and `RequestContext` carries tenantId/userId. Without consistent audit logs (BL-07) the **action** dimension is weak.
- **Can payment disputes be investigated?** Yes — `PaymentWebhookIdempotencyTest` and `PaymentFlowIntegrationTest` show the implementation is robust. Adding audit calls on `payment-order` create + `verify` will close the gap.
- **Can sensitive actions be audited?** Partially — `AuthServiceImpl` writes audit for login/logout/MFA; `StudentProfile360ServiceImpl` writes audit for section updates; everything else is silent.
- **Can one bad tenant affect all tenants?** No catastrophic single-tenant impact identified, *except*: shared rate-limit framework keys must include tenantId (need verification); shared connection pool — a runaway tenant can exhaust it (need pgbouncer / per-tenant quota); RabbitMQ queue is shared; AI Copilot has no per-tenant cost cap.

---

## 14. Testing and Quality Gate Assessment

| Test Area | Existing Coverage | Missing Scenario | Required Before Pilot / Paid / Scale | Priority |
|---|---|---|---|---|
| Backend unit tests | `FeeServiceImplTest`, `ExamServiceImplTest`, `StorageServiceTest`, ratelimit + ratelimit window tests, AI insight services | Per-service coverage for student-lifecycle, marks, results, leave, notice | Paid | High |
| Integration tests | `CrossTenantIsolationIntegrationTest`, `RoleMatrixIntegrationTest`, `UploadAuditLogIntegrationTest`, `PaymentFlowIntegrationTest`, `PaymentWebhookIdempotencyTest`, `KnowledgeBaseTenantIsolationTest`, `EmbeddingTenantIsolationTest`, `PromptInjectionDefencesTest`, `UsageLimitEnforcerTest` | Per-portal integration tests; multi-school correctness tests (TI-01..TI-10) | Pilot | Critical |
| Cross-tenant tests | Partial (`CrossTenantIsolationIntegrationTest`) | Per-endpoint negative checks for every `/v1/school-admin/...` URL | Paid | Critical |
| RBAC tests | `RoleMatrixIntegrationTest` | Add explicit `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**` deny tests | Pilot | Critical |
| Parent-child ownership | None dedicated | Parent A vs child B; payment ownership | Pilot | Critical |
| Teacher-class authorization | None | Teacher T not assigned → 403 | Pilot | Critical |
| Payment tests | `PaymentWebhookIdempotencyTest`, `PaymentFlowIntegrationTest` | Verify-payment ownership; double-spend / replay | Paid | High |
| Webhook tests | Idempotency covered | Signature mismatch; signature timestamp skew | Paid | High |
| Document upload tests | `UploadAuditLogIntegrationTest`, `StorageServiceTest` | MIME allowlist; quarantine flow | Paid | High |
| Audit-log tests | Implicit (used in `AuthServiceImpl` tests presumed) | Per-mutation audit assertion | Paid | High |
| Bulk operation tests | None | Dry-run for promote; per-row error reporting for student bulk import | Pilot | High |
| Frontend tests | `SchoolAdminLayout.test.tsx` (snapshot only) | RTL tests for `LoginPage`, `FeeCollectionPage`, `MarksEntryPage`, `ParentChildPage`, `StudentQrScanPage` | Paid | Medium |
| Mobile tests | n/a (mobile app removed — see commit `f6090fd`) | n/a | n/a | n/a |
| End-to-end tests | None | Cypress / Playwright for login → admit → fee → parent pay | Paid | High |
| Load tests | `infra/load-tests/` (k6 scripts) | Run against representative tenant | Scale | High |
| Security tests | `SensitiveDataPolicyTest`, `RoleMatrix`, `CrossTenantIsolation`, `PromptInjectionDefences` | External pen-test | Paid | Critical |

### Non-negotiable release-gate checklist

- [ ] `mvn test` → 100% pass.
- [ ] `npx tsc -b` → exit 0.
- [ ] `npm run build` → exit 0.
- [ ] `npm run lint` → exit 0.
- [ ] Trivy container scan → 0 CRITICAL, ≤2 HIGH (with documented justification).
- [ ] OWASP Dependency Check → 0 CRITICAL, ≤2 HIGH.
- [ ] DR drill workflow → green within the last 30 days.
- [ ] CrossTenantIsolation + new MultiSchool tests → all green.
- [ ] RoleMatrix tests cover every mutating endpoint of each role.
- [ ] Manual checklist: log in as each role and walk the daily flow end-to-end.

---

## 15. Technical Debt and Code Quality Findings

| ID | Category | Finding | Evidence | Business Impact | Recommended Action | Priority |
|---|---|---|---|---|---|---|
| TD-01 | Security risk | `QrAttendanceController` missing `@PreAuthorize` | [QrAttendanceController.java:29-50](backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java) | Any auth role can self-mark | Add class-level `@PreAuthorize("hasRole('STUDENT')")` | Critical |
| TD-02 | Data correctness | Hard-coded `"MAIN"` school resolution in Mobile / Parent service | `MobileController.java:90-98`, `ParentPortalServiceImpl.java:156-160` | Multi-school tenants get wrong data | Resolve from student's actual `schoolId` | Critical |
| TD-03 | Security risk | `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**` not in SecurityConfig | [SecurityConfig.java:142-180](backend/src/main/java/com/cloudcampus/config/SecurityConfig.java) | Defence-in-depth gap | Add matcher rules | Critical |
| TD-04 | Security risk | **14** `/v1/school-admin/...` controllers lack method-level `@PreAuthorize` (re-verified 2026-05-22; `StudentDocumentController` already has it) | StudentController.java, StaffController.java, FeeController.java, AcademicYearController.java, ClassRoomController.java, SectionController.java, SubjectController.java, DepartmentController.java, SchoolSettingsController.java, AttendanceController.java, ParentLinkController.java, StudentProfile360Controller.java, StaffProfile360Controller.java, SchoolDashboardController.java | Same gap | Add `@PreAuthorize` at class level | Critical |
| TD-05 | Data correctness | `getChildResults` returned drafts | `ParentPortalServiceImpl.getChildResults` | Process violation | **Done in P0-08:** filter parent-visible results to `ExamStatus.COMPLETED` | Closed |
| TD-06 | Security risk | `PaymentController.verify` role too broad | [PaymentController.java:79-81](backend/src/main/java/com/cloudcampus/payment/controller/PaymentController.java) | Money path under-guarded | Tighten role + add service ownership assert | High |
| TD-07 | Security risk | `MobileController` notice role gate and caller-school resolution | P0-13 added class-level role allow-list and replaced hard-coded MAIN school lookup | Shared notice endpoint now has explicit allowed roles; keep covered by role/multi-school tests | Keep regression coverage in `MultiSchoolMultiTenantIT` / `RoleMatrixIntegrationTest` | Closed |
| TD-08 | Auditability | Critical mutation audit hooks and required reason capture now exist; viewer still missing | P0-07 added audit rows across finance/payment, student lifecycle, marks/results, notices, leave, settings, academic years, custom domains, parent links, and AI Copilot; P1-13 added reason capture on irreversible actions | Core disputes have provenance and operator rationale; schools still need a UI to inspect it | Complete P1-04 audit viewer | Closed for P0-07/P1-13; follow-up high |
| TD-09 | UX weakness | Bulk Promote without dry-run | `StudentController.promote` | **Closed in P0-10:** backend dry-run preview returns proposed delta without writing; UI waits for preview before commit | Keep focused dry-run regression coverage | Closed |
| TD-10 | Missing feature | Parent fee payment hardening | `PaymentController`, `ParentChildPage` | Demo flow exists after P0-14; production hardening remains | Complete P1-07 | High |
| TD-11 | Missing feature | Teacher cannot post homework/assignments | No `POST /v1/teacher/homework` | UX blocker | Add endpoints | High |
| TD-12 | Security risk | Teacher cross-class access | `TeacherAttendanceController.students` | Privacy risk | Add assignment ownership check | High |
| TD-13 | Data correctness | Assignment grading: no `maxMarks` clamp | `TeacherAssignmentController.grade` | Bad data | Clamp at service | High |
| TD-14 | Data correctness | Attendance edit window not enforced | `TeacherAttendanceController.takeAttendance` | Process integrity | Enforce server-side | High |
| TD-15 | Missing feature | No `/v1/student/me`, `/v1/parent/me`, `/v1/teacher/me` | grep shows only `/v1/school-admin/me` | UX gap | Add endpoints + layout integration | High |
| TD-16 | Performance | N+1 in `getLinkedChildren` | [ParentPortalServiceImpl.java:64-85](backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java) | Slow at 4+ children | Single aggregate query | Medium |
| TD-17 | Performance | Synchronous CSV report export | [ReportController.java](backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java) | Request thread hang | Async job | High |
| TD-18 | Performance | Dashboard fan-out queries | `ParentDashboardPage.tsx`, `StudentDashboardPage.tsx` | Mobile bandwidth waste | Aggregate endpoints | Medium |
| TD-19 | Security risk | High-cost endpoint rate limiting | P0-16 added `@RateLimit` coverage and tests | Cost / abuse blast radius reduced | Keep coverage test and tune limits by environment | Closed |
| TD-20 | Missing feature | No audit log viewer UI | No `/super-admin/audit-logs` or `/school-admin/audit-logs` page | Compliance | Build viewer | High |
| TD-21 | Security risk | Default credentials in dev memory + demo seed | `.claude/memory/`, `DemoDataSeeder` (`gw.admin/Demo@1234`) | Cannot ship to prod | **Done in P0-12 + P1-09:** force first-login reset gate and mandatory `BOOTSTRAP_ADMIN_PASSWORD` in prod; demo tenant surfaces now clearly warn demo-only and reset nightly. | Closed for prod path and demo-labeling path |
| TD-22 | Dependency | 3 CRITICAL + 11 HIGH CVEs in container | Trivy log 2026-05-22 | Production-blocking; naive bumps regress tests | **Done in P0-15:** coordinated dependency-management bump with explicit `okhttp` pin; target versions resolved and backend tests green | Closed |
| TD-23 | DevOps | OpenAPI publish job assumes RabbitMQ in CI | [.github/workflows/openapi-publish.yml](.github/workflows/openapi-publish.yml) | CI red | Add RabbitMQ service or `openapi-gen` profile | Low |
| TD-24 | Code quality | Several DTOs lacked `@Valid` | OnlineClassController.updateStatus, VideoController.confirm, Experience/Public Website endpoints, etc. | Invalid data | **Done in P0-11** | High |
| TD-25 | UX weakness | No "Change Password" link in Student/Parent/Teacher layouts | Layouts grep | UX gap | Add link | Low |
| TD-26 | Missing feature | No student/parent in-app notifications feed | grep | UX gap | Build with badge | Medium |
| TD-27 | Missing feature | No report card PDF download from student/parent | grep | UX gap | Reuse PDF generator | High |
| TD-28 | Performance | Notification logs, fee records, attendance sessions not paginated | per-module audit | Browser hang at scale | Paginate | High |
| TD-29 | DevOps | Per-tenant restore not exercised | DR drill is global | Cannot prove restore for one tenant | Per-tenant restore step | High |
| TD-30 | Missing feature | No data export / delete endpoint for school | grep | GDPR-style requirement | Build export endpoint | High |

---

## 16. Final Prioritized Roadmap

Roadmap is organized by **commercial milestones** (Levels A→E), not by module. Each Phase corresponds to one or more milestones.

| Phase | Milestone reached when subset is done | Tasks in this phase | Completed in this phase | Remaining in this phase |
|---|---|---:|---:|---:|
| Phase 0 | Customer Demo Ready (Level A — after the 7 Phase-0 tasks listed in Level A + P1-09 demo hygiene); Controlled Pilot Ready (Level B — after all 18 Phase-0 + the 6 pilot-critical Phase-1 items) | 18 | 18 | 0 |
| Phase 1 | Level B (complete); start of Level C | 14 | 2 | 12 |
| Phase 2 | Level C tracked tasks (after the 7 paid-readiness Phase-2 items: P2-01, P2-02, P2-04, P2-05, P2-09, P2-10, P2-11). The other 3 Phase-2 tasks (P2-03, P2-06, P2-08) are post-Level-C improvements. | 10 | 0 | 10 |
| Phase 3 | Level D (complete) | 7 | 0 | 7 |
| Phase 4 | Level E (complete) | 7 | 0 | 7 |

### Phase 0 — Demo + Pilot Security Blockers (Levels A → most of B)

| Task ID | Task | Reason | Affected Module / File / API | Acceptance Criteria | Verification / Test | Revenue or Risk Impact | Status |
|---|---|---|---|---|---|---|---|
| P0-01 | **Fix Parent multi-school data resolution.** Scope: `ParentPortalServiceImpl.resolveSchool()` + `getChildResults` + `getChildTimetable` only. Do NOT touch `MobileController` (covered by P0-13). | Parent of a child in BRANCH school currently sees MAIN school's results/timetable | `backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java` | School resolved from linked child's actual `Student.schoolId`; no hard-coded `"MAIN"` | Multi-school integration test: parent linked to BRANCH child receives BRANCH timetable + BRANCH results; not MAIN | Risk: incident-grade | **[x] Done — 2026-05-24** (`resolveSchool(Student)` uses `SchoolRepository.findByIdFiltered(student.getSchoolId())`; +2 parent service cases; 204 tests green) |
| P0-02 | Add `@PreAuthorize("hasRole('STUDENT')")` to `QrAttendanceController` | Any auth role can self-mark | `QrAttendanceController.java` | Class-level annotation present | RoleMatrix negative tests pass | Risk: critical | **[x] Done — 2026-05-23** |
| P0-03 | **Inventory and secure role-scoped API paths without breaking shared APIs.** 5-step task: (1) inventory every endpoint under `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**`, `/v1/mobile/**`; (2) classify each as role-exclusive / intentionally shared / misplaced / dead; (3) add SecurityConfig matchers + method-level `@PreAuthorize` for role-exclusive endpoints; (4) move intentionally shared endpoints to a neutral path (e.g. `/v1/shared/**` or `/v1/mobile/**`) OR add specific allow-rules before broad matchers — Teacher portal currently consumes `/v1/student/online-classes` and `/v1/student/videos`; (5) keep legitimate Teacher/Student/Parent flows working. Treat as analysis + secure implementation + regression tests, **not** a single-line matcher change. | Defence-in-depth gap; today blocked by method-level `@PreAuthorize` alone | `SecurityConfig.java`, role controllers, mobile controllers | Every role-exclusive endpoint has SecurityConfig matcher AND method-level `@PreAuthorize`; shared endpoints have documented allowed roles; existing flows unaffected | Updated `RoleMatrixIntegrationTest` + new API contract tests for shared endpoint access; full `mvn test` + frontend build/typecheck/lint; manual smoke of Teacher video/online-class flow and Student profile-360 | Risk: critical | **[x] Done — 2026-05-24** (SecurityConfig matchers added with shared carve-out for `/v1/student/videos/**` and multi-role `/v1/mobile/**`; +23 RoleMatrix cases) |
| P0-04 | Add class-level `@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN')")` to the **13** verified `/v1/school-admin/...` controllers (StudentController, StaffController, FeeController, AcademicYearController, ClassRoomController, SectionController, SubjectController, DepartmentController, SchoolSettingsController, AttendanceController, ParentLinkController, StudentProfile360Controller, StaffProfile360Controller). **Corrected from 14 → 13 on 2026-05-24** — `SchoolDashboardController` already had class-level `@PreAuthorize("hasRole('SCHOOL_ADMIN')")` at line 37 and is excluded (in addition to the previously-excluded `StudentDocumentController`). | Defence-in-depth gap | 13 controller files above | Annotations present on all 13 | Existing tests green | Risk: critical | **[x] Done — 2026-05-24** (202 tests still green) |
| P0-05 | Add `TenantSecurity.assertSchoolBelongsToTenant(schoolId)` and enforce it for every `/v1/school-admin/schools/{schoolId}/...` route | Cross-tenant abuse risk | `TenantSecurity`, `SchoolPathAccessInterceptor`, `WebMvcConfig` | Helper added; interceptor applies it to all school-path endpoints before role-specific access checks | New cross-tenant TENANT_ADMIN + SCHOOL_ADMIN tests pass | Risk: critical | **[x] Done — 2026-05-24** (`TenantSecurity` uses `SchoolRepository.existsByIdAndTenantId`; school-path interceptor now returns 404 for tenant A hitting tenant B's `schoolId`; 205 tests green) |
| P0-06 | Tighten `PaymentController.verify` role + add ownership check | Verify broad | `PaymentController.java`, `PaymentServiceImpl.java` | Role list narrowed; service asserts `paymentOrder.userId == caller` | Negative test passes | Risk: high | **[x] Done — 2026-05-24** (`PaymentServiceImplTest` owner mismatch; `RoleMatrixIntegrationTest` allowed/forbidden roles; focused 90-test payment/RBAC suite green) |
| P0-07 | Add audit-log writes on critical mutations | Disputes unprovable | Many services (see BL-07) | At least: fee waive, fee payment, student suspend/graduate/transfer, marks bulk, results generate, notice publish, leave approve/reject, school settings | Per-mutation test asserts audit row | Risk: critical | [x] Done — 2026-05-24 |
| P0-08 | Filter `getChildResults` to published-equivalent results only | Draft marks leak | `ParentPortalServiceImpl.java`, `ExamResultRepository` | New repo method filters by exam status. **Implementation note:** the codebase has no `ExamStatus.PUBLISHED`; existing published-equivalent terminal status is `COMPLETED`. | Test asserts draft NOT visible | Risk: high | **[x] Done — 2026-05-24** (`ParentPortalServiceImpl` calls the status-filtered repo with `ExamStatus.COMPLETED`; `ExamResultRepositoryTest` proves DRAFT is excluded; 206 tests green) |
| P0-09 | Implement self-profile-360 redaction | Sensitive sections leak | `StudentProfile360Service`, `StudentSelfProfile360Controller` | New `getSelfProfile()` strips restricted/sensitive sections and top-level private aggregates | Test asserts redaction | Risk: high | **[x] Done — 2026-05-24** (`getSelfProfile` redacts restricted sections plus risk/AI/health/family/communication aggregates; `StudentSelfProfile360Controller` uses tenant-scoped self lookup) |
| P0-10 | Dry-run for bulk Promote Students | Catastrophic mass mutation | `StudentController.promote`, `StudentServiceImpl.promoteStudents`, `StudentPromotionPage` | `?dryRun=true` returns proposed source/target delta without writing; UI preview uses backend dry-run before commit | Focused dry-run test proves no class/section mutation, no `saveAll`, and no audit write | Risk: critical | **[x] Done — 2026-05-24** (`PromotionResult` now includes `dryRun` and source/target IDs; frontend build green) |
| P0-11 | Add `@Valid` to every mutating controller; sweep DTOs (especially `OnlineClassController.updateStatus/addRecording`, `VideoController.confirm`, `StaffLeaveController.submit`, `PaymentController.createOrderAdmin`, Experience Studio + Public Website endpoints) | Invalid data risk | Many controllers | Compile + tests green | Boundary test passes | Risk: high | **[x] Done — 2026-05-24** (`@Valid` coverage guard and public invalid-payload HTTP 400 tests added; backend 245-test suite passes) |
| P0-12 | Force first-login password reset; remove dev defaults from prod profile; document `BOOTSTRAP_ADMIN_PASSWORD` mandatory | Default creds | `AuthService`, `application-prod.yml`, `SuperAdminBootstrap` | Prod startup fails without env var | Manual + test | Risk: critical | **[x] Done — 2026-05-24** (`ForcePasswordChangeFilter` blocks non-auth routes until password change; prod bootstrap secret is mandatory/strong; focused 15-test backend suite, full 236-test backend suite, ProtectedRoute tests, and frontend build pass) |
| P0-13 | **Secure and fix shared Mobile notices.** Scope: `MobileController` + `/v1/mobile/notices` only. Do NOT touch `ParentPortalServiceImpl` (covered by P0-01). Add explicit `@PreAuthorize` for the roles intentionally allowed to consume notices; resolve notice visibility using caller's actual school context (Student of BRANCH sees BRANCH notices; parent linked only to a BRANCH child sees BRANCH notices); document which roles are allowed. | Today `MobileController` has no `@PreAuthorize` and hard-codes `"MAIN"` school resolution; multi-school tenants see wrong notices | `backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java` | Class-level role allow-list; school resolved from caller (student's school or one of parent's linked children's schools, not hard-coded `"MAIN"`); unauthorized roles return 403 | Role-aware multi-school notices integration test in `RoleMatrixIntegrationTest`/`MultiSchoolMultiTenantIT`; existing tests green | Risk: critical | **[x] Done — 2026-05-24** (`@PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','STAFF','SCHOOL_ADMIN','TENANT_ADMIN')")` added; `resolveMainSchool` → `resolveCallerSchool` using JWT `schoolId` via `SchoolRepository.findByIdFiltered`; 202 tests green) |
| P0-14 | Implement parent fee payment | Revenue blocker | New endpoint `POST /v1/parent/children/{studentId}/fee-records/{recordId}/payment-order` | Parent paying for own child works; another child rejected | E2E test (Razorpay test mode) | Revenue: critical | **[x] Done — 2026-05-24** (`createParentOrder` link + record-child checks; parent fees tab Pay Online; backend focused 90 tests green; frontend build green) |
| P0-15 | Container CVE bumps (Tomcat, Netty, BouncyCastle, MinIO, commons-io, org.json) + explicit okhttp pin | 3 CRITICAL + 11 HIGH | `backend/pom.xml` | Target vulnerable dependency versions replaced; backend suite remains green. Container Trivy should be re-run in CI after image build and made blocking in P0-18. | Dependency list confirms target versions; focused storage/payment suite and full backend suite pass | Risk: critical | **[x] Done — 2026-05-24** (Tomcat 10.1.55, Netty 4.1.133.Final, BouncyCastle 1.84, MinIO 8.6.0, commons-io 2.14.0, org.json 20231013, okhttp 4.12.0; 236 tests green after P0-12) |
| P0-16 | Rate-limit AI Copilot, notifications, WhatsApp, payment order, QR mark, video initiate, results generate | Cost + abuse | Multiple controllers | Annotations applied; integration test trips 429 | Test passes | Risk: high | **[x] Done — 2026-05-24** (`@RateLimit` on all target endpoints; 11-test focused suite and 241-test backend suite pass) |
| P0-17 | Cross-tenant + cross-owner + multi-school integration test matrix (TI-01..TI-10 + role-matrix negatives) | Test discipline; lock in all earlier fixes | `backend/src/test/java/com/cloudcampus/rbac/MultiSchoolMultiTenantIT.java` (new) + existing `RoleMatrixIntegrationTest` updates | All 10 scenarios in §6 pass; non-owner / non-tenant negative paths all return 403 or 404 | `mvn test` green | Risk: critical | **[x] Done — 2026-05-24** (`MultiSchoolMultiTenantIT` covers 10 TI scenarios; Surefire includes `*IT`; 236-test backend suite green after P0-12) |
| P0-18 | Move CVE / dependency check to release-gate (block merges) | Quality gate | `.github/workflows/security-nightly.yml` | Workflow runs on PR; merge blocked on high+critical | Workflow run | Risk: high | **[x] Done — 2026-05-25** (`Security — Release Gate` runs on PR/main/release/nightly/manual; OWASP no longer report-only; Trivy scans freshly-built backend image) |

### Phase 1 — Pilot Polish + Start of Paid Readiness (Level B → start of C)

| Task ID | Task | Reason | Affected | Acceptance | Verification | Impact | Status |
|---|---|---|---|---|---|---|---|
| P1-01 | `/v1/student/me`, `/v1/parent/me`, `/v1/teacher/me` | UX | New controllers in respective modules | Layout uses real profile | Manual + tests | UX critical for demos | [ ] Not Started |
| P1-02 | Teacher cannot create homework / assignment | UX | `TeacherHomeworkController.create`, `TeacherAssignmentController.create` | Teacher posts homework end-to-end | E2E | UX critical | [ ] Not Started |
| P1-03 | Teacher class/section/subject assignment ownership | Privacy | `StaffAssignmentService` | Cross-teacher tests pass | mvn test | Risk: high | [ ] Not Started |
| P1-04 | Audit Log viewer UI for SCHOOL_ADMIN + SUPER_ADMIN | Compliance | New pages + endpoints | List + filter | Manual | Risk: high | [ ] Not Started |
| P1-05 | Async / streaming reports export | Performance | `ReportController.export*` | Returns job; `/jobs/{id}` polls | Manual + tests | Reliability: high | [ ] Not Started |
| P1-06 | Pagination on `/v1/student/homework`, `/assignments`, `/attendance`, parent fees, parent results, teacher submissions, notification logs, whatsapp logs, leave requests, attendance sessions | Performance | Many controllers | Each list paginates | Tests | Performance: high | [ ] Not Started |
| P1-07 | Receipts PDF + Razorpay flow reachable from parent + UI invalidation after success | Revenue | `StudentFeesPage`, `ParentChildPage` fees tab + parent payment endpoint | Parent pays + sees updated fee status without reload | E2E | Revenue: high | [ ] Not Started |
| P1-08 | Marks bounds clamp; attendance edit window enforce | Correctness | `MarksService`, `TeacherAttendanceController` | Cannot enter mark > max; cannot back-date attendance | Tests | Risk: high | [ ] Not Started |
| P1-09 | Demo data freeze + reset script for sales demos | Sales-readiness | `DemoDataSeeder` + scheduled reset | Demo tenant resets nightly | Manual | Sales: critical | **[x] Done — 2026-05-24** (`DemoResetScheduler` deletes FK-constrained transient demo data before reseed; demo-only banner visible in role portals; focused tests pass) |
| P1-10 | Per-tenant restore drill | DR | `infra/pgbackup/drill.sh` + workflow | Workflow restores ONE tenant | Workflow log | Reliability: critical | [ ] Not Started |
| P1-11 | Privacy policy + Terms + DPA published on public website | Legal | `frontend/public/legal/*` | Pages exist | Manual | Sale: critical | [ ] Not Started |
| P1-12 | Frontend invalidations after mutating actions (Razorpay onSuccess, attendance takeAttendance, etc.) | UX | Multiple pages | List refreshes after action | Manual | UX: high | [ ] Not Started |
| P1-13 | Required reason on irreversible actions (suspend, graduate, transfer, terminate, waive, close-academic-year) | Audit | Multiple services + UI | Backend rejects missing reason; UI captures it | Tests + UI | Risk: high | **[x] Done — 2026-05-25** (`ReasonRequest` enforced in backend + reason dialogs in UI; focused 15-test suite, backend 246-test suite, and frontend build pass) |
| P1-14 | Bulk staff import (mirror student bulk import) | Onboarding | `StaffController.bulk` + UI | CSV upload works | E2E | Onboarding: high | [ ] Not Started |

### Phase 2 — Paid Readiness and Customer Experience Improvements

> Level C requires only the **seven paid-readiness Phase-2 tasks** identified in the milestone section (P2-01, P2-02, P2-04, P2-05, P2-09, P2-10, P2-11). The remaining Phase-2 tasks (P2-03, P2-06, P2-08) may be completed later based on pilot feedback.

| Task ID | Task | Reason | Affected | Acceptance | Verification | Impact | Status |
|---|---|---|---|---|---|---|---|
| P2-01 | Report card PDF download (student + parent) | UX + parents will ask | `ResultService` PDF + endpoint + UI | Single PDF per student per exam | Manual | UX: high | [ ] Not Started |
| P2-02 | `/v1/parent/children/{id}/documents` (read-only) | UX | New endpoint + UI | Parent sees child docs | E2E | UX: high | [ ] Not Started |
| P2-03 | Notice acknowledgement / consent | Compliance | `POST /v1/notices/{id}/acknowledge` + UI | Read receipts | E2E | Risk: medium | [ ] Not Started |
| P2-04 | In-app notification feed (student + parent + teacher) | UX | `/v1/.../notifications` + badge | Bell badge with counts | E2E | UX: medium | [ ] Not Started |
| P2-05 | Student leave application via parent | UX | New endpoint + UI | Parent applies, school admin approves | E2E | UX: medium | [ ] Not Started |
| P2-06 | Class-teacher assignment | Workflow | `PATCH /v1/school-admin/sections/{id}/class-teacher` | Section has class teacher | Manual | Workflow: high | [ ] Not Started |
| **P2-11** | **Customer-facing data-export endpoint** (school can download all their data — students, staff, fees, attendance, exams, results) — moved from P4-07 into Phase 2 because real paying schools must be able to leave with their data | Compliance + GDPR/DPDP-style requirement | New `DataExportController` + service + UI button | Authenticated SCHOOL_ADMIN can request export; async job emits a signed download link | E2E test asserts full tenant export round-trip | Compliance: critical | [ ] Not Started |
| P2-08 | Parent–Teacher messaging | Retention | New module | Chat per child | E2E | Retention: high | [ ] Not Started |
| P2-09 | MFA for SCHOOL_ADMIN + SUPER_ADMIN | Security | Auth module | TOTP enrolment + verify | E2E | Security: critical | [ ] Not Started |
| P2-10 | External pen-test report | Security | n/a (external) | Pass with fixes | Report | Security: critical | [ ] Not Started |

### Phase 3 — Revenue Expansion (Level D)

| Task ID | Task | Reason | Affected | Acceptance | Verification | Impact | Status |
|---|---|---|---|---|---|---|---|
| P3-01 | Library module | Upsell | New module | CRUD + checkout | Manual | Revenue: medium | [ ] Not Started |
| P3-02 | Transport module | Upsell | New module | Routes + students | Manual | Revenue: medium | [ ] Not Started |
| P3-03 | Hostel module | Upsell | New module | Rooms + occupancy | Manual | Revenue: medium | [ ] Not Started |
| P3-04 | Payroll | Upsell | New module | Salary slips + Razorpay payout | Manual | Revenue: high | [ ] Not Started |
| P3-05 | AI insights dashboard (per-class performance, attendance risk) | Upsell | `AiInsightService` extension | Anonymised insights | Manual | Revenue: high | [ ] Not Started |
| P3-06 | White-label / branding upsell | Upsell | Existing website builder + per-tenant theme | Custom theme + domain | Manual | Revenue: medium | [ ] Not Started |
| P3-07 | Analytics export (Excel / API) | Upsell | `ReportService` extension | Each report has Excel + JSON variant | Manual | Revenue: medium | [ ] Not Started |

### Phase 4 — Scale and Enterprise Readiness (Level E)

| Task ID | Task | Reason | Affected | Acceptance | Verification | Impact | Status |
|---|---|---|---|---|---|---|---|
| P4-01 | Read-replica routing + pgbouncer | Scale | Spring datasource + infra | Reads off replica | Load test | Scale: high | [ ] Not Started |
| P4-02 | Partition `attendance_records`, `audit_logs`, `notification_logs`, `ai_usage_logs` by month | Scale | Flyway | Partitions visible; queries fast | Load test | Scale: high | [ ] Not Started |
| P4-03 | Per-tenant resource quotas (DB conns, queue throughput, AI calls) | Noisy-neighbour | Many places | Saturated tenant does NOT degrade others | Load test | Scale: high | [ ] Not Started |
| P4-04 | k8s HPA + readiness probes + helm chart | Deploy | `infra/k8s/` | Auto-scaled deployment | Manual | Scale: high | [ ] Not Started |
| P4-05 | Real Super Admin school + admin-user CRUD (not relying on tenant bootstrap) | Enterprise | New endpoints | Multi-school tenants manageable from Super Admin | E2E | Enterprise: high | [ ] Not Started |
| P4-06 | Tenant offboarding (delete + 30-day export) | Compliance | New service | Tenant deleted + export verified | E2E | Compliance: high | [ ] Not Started |
| **P4-07** | **Transfer Certificate (TC) generator** (moved from old P2-07; not required for first paid sale — schools generate TCs only at year-end and many use a manual template until the platform supports it) | Workflow | New endpoint + PDF | Generate TC for a graduated/transferred student | Manual | Workflow: medium | [ ] Not Started |

---

## 16.5 Remaining Change Count by Commercial Milestone

> Re-counted on 2026-05-25 after Task 20 / P1-13. Per-task verification in §3 + §16.

### Before Level A — Customer Demo Ready

A "customer demo" here means a sales conversation with a prospective school, not an internal walkthrough. It must show School Admin core flow, Teacher core flow where working, Parent viewing correct child information, and a Parent fee payment in Razorpay **test** mode — with no exposure of known critical authorization gaps during the demo.

- **Required remaining tasks: 0.**
- **Exact task IDs:** none.
- **Completed Level-A prerequisites:** P0-01, P0-02, P0-03, P0-04, P0-12, P0-13, P0-14, P1-09.
- **Important boundary:** demos are ready for demo-only data. Real pilot data still waits for Level B.

### Before Level B — Controlled Pilot Ready

- **Required remaining tasks: 4** (all remaining work is pilot-critical Phase-1; total Phase-0 = 18, total pilot-Phase-1 = 6).
- **Exact task IDs:** P1-01, P1-04, P1-10, P1-11.
- **What real data becomes safe after completion:** Real students, real parents, real fees (Razorpay test mode for early pilots), real attendance, real notices — for **1–3 carefully chosen single-campus schools** with documented support SLAs. **Not** multi-school. **Not** chain operators. **Not** schools with strict regulatory regimes.

### Before Level C — First Paid Customer Ready

> **Level C requires both (a) 39 tracked tasks AND (b) mandatory non-task commercial/operational evidence.** Increasing or decreasing the tracked-task count is not how non-task evidence is captured.

- **Required remaining tracked tasks: 19.**
- **Math:** 4 remaining Pilot Ready tasks + **8 remaining Phase-1 tasks not already in Pilot** + **7 required Phase-2 paid-readiness tasks (including P2-10 external pen-test)** = **19**.
- **8 remaining Phase-1 tasks (not in Pilot):** P1-02 (Teacher creates homework/assignments from Teacher portal), P1-03 (Teacher class assignment ownership), P1-05 (Async reports export), P1-06 (Pagination across endpoints), P1-07 (Parent payment hardening + UI cache invalidation in production), P1-08 (Marks bounds + attendance edit window), P1-12 (React Query invalidation after mutating actions), P1-14 (Bulk staff import).
- **7 required Phase-2 paid-readiness tasks (exact, no swaps):**
  - **P2-01** — Report-card PDF download (student + parent).
  - **P2-02** — Parent read-only child documents.
  - **P2-04** — In-app notifications feed.
  - **P2-05** — Student leave application via parent.
  - **P2-09** — MFA enforcement for SCHOOL_ADMIN + SUPER_ADMIN.
  - **P2-10** — External penetration test with all CRITICAL findings fixed and HIGH findings fixed or formally accepted (written, founder-signed, renewable every 90 days).
  - **P2-11** — Customer-facing data-export endpoint (moved into Phase 2 from old P4-07; school must be able to take their data with them).
- **Hard guard rail:**
  > **CloudCampus must not store real paying-school student, parent or payment data under a commercial contract until an independent penetration test has been completed and all CRITICAL findings have been remediated.** A High finding may be released only with a written risk-acceptance signed by the founder and renewed every 90 days.
- **Other operational / security / legal evidence that must also exist:**
  - **Audit log retention policy** committed ≥1 year.
  - **Privacy policy + Terms + Data Processing Addendum** published on public website (P1-11 — already in Pilot but legal review must close before Paid).
  - **Trivy + OWASP scans green** in CI gate (P0-18).
  - **Per-tenant restore** drill PASS (P1-10).
  - **At least one 60-day pilot** with documented zero-incident record before charging.
  - **Public security disclosure page** (security@cloudcampus, vulnerability process).

### Before Level D — Revenue Expansion Ready

- **Required remaining tasks: 27.** Math: **19 remaining Level-C tasks + 3 remaining Phase-2 tasks not required for first paid sale (P2-03, P2-06, P2-08) + 5 validated Phase-3 revenue-expansion tasks = 27.**
- **Premium features that should only be built after customer feedback (Phase 3):** Library, Transport, Hostel, Payroll, AI insights dashboard, white-label / branding upsell, Analytics export. Do **not** start any of these until ≥5 schools renew once at Level C.

### Before Level E — Scale / Enterprise Ready

- **Required remaining tasks: 36** (all remaining roadmap tasks through Phase 4).
- **Items that require load testing instead of assumptions:**
  - P4-01 read-replica routing + pgbouncer cutover.
  - P4-02 partitioning of `attendance_records`, `audit_logs`, `notification_logs`, `ai_usage_logs`.
  - P4-03 per-tenant resource quotas (the "noisy neighbour" boundary).
  - P4-04 Kubernetes HPA + readiness probes — measured against actual traffic, not assumed.
  - Multi-school correctness end-to-end (after P0-01 + P0-13) must be re-verified at scale.
  - All `infra/load-tests/` k6 scripts must be run against a representative tenant and the latency / error SLOs documented.

---

## 17. Top 25 Tasks in Exact Implementation Order

| Order | Task ID | Exact Change | Why It Comes Now | File / API Area | Proof of Completion | Status |
|---:|---|---|---|---|---|---|
| 1 | **P0-02** | Add `@PreAuthorize("hasRole('STUDENT')")` at class level on `QrAttendanceController`; add a role-matrix negative test asserting TEACHER, PARENT and SCHOOL_ADMIN receive HTTP 403 on `POST /v1/student/attendance/qr-mark`; confirm STUDENT valid flow still succeeds. | First, smallest, defence-in-depth fix; unblocks the only completely unguarded student endpoint. | `backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java`; `RoleMatrixIntegrationTest` | `mvn test` green; new test asserts 403 for non-STUDENT roles; demo QR scan as student still works | **[x] Done — 2026-05-23** |
| 2 | **P0-03** | **Inventory and secure role-path authorization without breaking shared APIs.** 5-step task: inventory every endpoint under `/v1/student/**`, `/v1/parent/**`, `/v1/teacher/**`, `/v1/mobile/**`; classify; add matchers for role-exclusive endpoints; move or carve allow-rules for shared endpoints (Teacher consumes `/v1/student/online-classes` and `/v1/student/videos`); regression tests for every shared flow. **Not a one-line matcher change.** | Without inventory you will break legitimate Teacher/Student/Parent flows; doing this second prevents subsequent Phase-0 fixes from being silently undone. | `SecurityConfig.java`, role controllers, mobile controllers, API contract tests | Updated `RoleMatrixIntegrationTest` + new API contract tests; backend + frontend gates green; manual smoke of shared endpoints | **[x] Done — 2026-05-24** (5 matchers added; carve-out for `/v1/student/videos/**` STUDENT/PARENT/TEACHER; `/v1/mobile/**` multi-role; SUPER_ADMIN excluded from mobile; +23 RoleMatrix cases) |
| 3 | **P0-04** | Add class-level `@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN')")` to the 13 verified School Admin controllers: StudentController, StaffController, FeeController, AcademicYearController, ClassRoomController, SectionController, SubjectController, DepartmentController, SchoolSettingsController, AttendanceController, ParentLinkController, StudentProfile360Controller, StaffProfile360Controller. (`StudentDocumentController` and `SchoolDashboardController` are excluded — both already have class-level `@PreAuthorize`.) | Closes URL-rule-only protection on the largest backend surface. | 13 controller files under `backend/src/main/java/com/cloudcampus/.../controller/` | `mvn test` green; grep confirms annotation on all 13 | **[x] Done — 2026-05-24** (scope corrected from 14 to 13 mid-flight; 202 tests still green) |
| 4 | **P0-13** | Secure `MobileController` notices: add explicit `@PreAuthorize` allow-list; replace hard-coded `"MAIN"` resolver with caller-context resolution (student's school OR one of parent's linked children's schools); document allowed roles. Do NOT touch `ParentPortalServiceImpl` (P0-01 covers that). | Multi-school notice correctness + missing role gate; doing this before P0-01 confirms the resolver split is clean. | `backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java` | Role-aware multi-school notices test in `RoleMatrixIntegrationTest`/`MultiSchoolMultiTenantIT` | **[x] Done — 2026-05-24** (class-level `@PreAuthorize` allow-list; `resolveCallerSchool` reads JWT `schoolId` via tenant-filter-aware `findByIdFiltered`; 202 tests green) |
| 5 | **P0-01** | Fix `ParentPortalServiceImpl.resolveSchool()` to use linked child's actual `Student.schoolId` for `getChildResults` and `getChildTimetable`. Parent-portal-only scope. | Multi-school correctness for parents; depends on P0-13 having moved the notice path off. | `backend/src/main/java/com/cloudcampus/mobile/service/ParentPortalServiceImpl.java` | Multi-school parent test: parent of BRANCH child receives BRANCH data | **[x] Done — 2026-05-24** (`ParentPortalServiceImplTest`; 204 tests green) |
| 6 | **P0-05** | Add `TenantSecurity.assertSchoolBelongsToTenant(UUID schoolId)` helper and enforce it for every `/v1/school-admin/schools/{schoolId}/...` route. | Stops cross-tenant `schoolId` abuse for all School Admin endpoints. | `backend/src/main/java/com/cloudcampus/common/tenant/`, `SchoolPathAccessInterceptor`, `WebMvcConfig` | Cross-tenant test: TENANT_ADMIN and SCHOOL_ADMIN of tenant A hitting tenant B's `schoolId` → 404 | **[x] Done — 2026-05-24** (`TenantSecurity` + shared interceptor enforcement; `CrossTenantIsolationIntegrationTest`; 205 tests green) |
| 7 | **P0-08** | Filter `getChildResults` to published-equivalent results only. **Implementation note:** `ExamStatus.PUBLISHED` does not exist in this lifecycle, so parent visibility uses `ExamStatus.COMPLETED`. | Stops draft-mark leak to parents. | `ParentPortalServiceImpl.getChildResults`, new repo method on `ExamResultRepository` | Test asserts draft exam not visible to parent | **[x] Done — 2026-05-24** (`ExamResultRepositoryTest` covers DRAFT vs COMPLETED; 206 tests green) |
| 8 | **P0-09** | Implement `getSelfProfile()` in `StudentProfile360Service` that strips STAFF_ONLY / ADMIN_ONLY / PRIVATE sections; switch `StudentSelfProfile360Controller` to use it. | Stops sensitive section leak (risk profile, behavior records, communication centre, parent contact) to the student. | `StudentProfile360Service.java`, `StudentSelfProfile360Controller.java` | Test asserts redacted sections are NOT in student-self response | **[x] Done — 2026-05-24** (`StudentProfile360ServiceImplTest`) |
| 9 | **P0-06** | Tighten `PaymentController.verify` to `hasAnyRole('STUDENT','PARENT','SCHOOL_ADMIN','TENANT_ADMIN')`; in `PaymentServiceImpl.verify`, assert `paymentOrder.userId == RequestContext.getUserId()` for non-admin roles. | Money-path safety; required before adding parent payment. | `PaymentController.java`, `PaymentServiceImpl.java` | Negative test: user A verifies user B's payment-order → 403 | **[x] Done — 2026-05-24** |
| 10 | **P0-14** | Add `POST /v1/parent/children/{studentId}/fee-records/{recordId}/payment-order` with `linkRepo.existsByStudentIdAndParentUserId` ownership check; allow PARENT in `verify` (P0-06 done first); add "Pay Fees" button in `ParentChildPage`. | Revenue blocker; primary commercial moment in school sales conversations. | `PaymentController.java`, `PaymentServiceImpl.java`, `ParentChildPage.tsx`, `paymentApi.ts` | E2E test: parent pays own child's fee through Razorpay test mode; another parent's child → 403 | **[x] Done — 2026-05-24** |
| 11 | **P0-17** | New `MultiSchoolMultiTenantIT` + role-matrix expansion covering all 10 TI-01..TI-10 scenarios from §6. | Locks in everything above; subsequent work cannot silently regress. | `backend/src/test/java/com/cloudcampus/rbac/MultiSchoolMultiTenantIT.java` (new) | All 10 §6 scenarios pass; focused regression suite green | **[x] Done — 2026-05-24** |
| 12 | **P0-15** | Container CVE bumps (Tomcat 10.1.55, Netty 4.1.133.Final, BouncyCastle 1.84, MinIO 8.6.0, commons-io 2.14.0, org.json 20231013) PLUS explicit `okhttp` 4.x pin to keep `StorageServiceTest` green (MinIO 8.6.0 drops the transitive okhttp3). | Closes Trivy CRITICAL / HIGH findings; the okhttp pin is mandatory and verified locally on 2026-05-22. | `backend/pom.xml` | Target versions resolved; focused storage/payment suite green; full backend `mvn -f backend/pom.xml test` green | **[x] Done — 2026-05-24** |
| 13 | **P0-12** | Force first-login password reset for SUPER_ADMIN / SCHOOL_ADMIN / STUDENT / PARENT; make `BOOTSTRAP_ADMIN_PASSWORD` mandatory in `application-prod.yml`; remove demo defaults from prod profile. | Removes shipped default credentials before any non-demo environment exists. | `AuthService.java`, `application-prod.yml`, `SuperAdminBootstrap.java`, `ProtectedRoute.tsx` | Prod startup fails without env var; first-login forced reset flow is enforced | **[x] Done — 2026-05-24** (focused backend 15-test suite; full backend 236-test suite at time of completion; ProtectedRoute 9 tests; frontend build) |
| 14 | **P0-07** | Inject `AuditLogService` and write audit rows from: fee waive, fee payment, student suspend/graduate/transfer/reinstate, marks bulk, results generate, notice publish, leave approve/reject, school settings update, academic year set-current/close, custom domain delete, parent link CRUD, AI Copilot query. | Provenance for disputes; mandatory before paying schools store real data. | Many service classes (`FeeServiceImpl`, `StudentServiceImpl`, `MarksService`, `ResultService`, etc.) | Per-mutation integration test asserts `audit_logs` row written | [x] Done — 2026-05-24 |
| 15 | **P0-10** | Add `?dryRun=true` flag to `POST /v1/school-admin/schools/{schoolId}/students/promote` returning the proposed delta without writing; UI preview before commit. | Stops catastrophic mass mutation by mis-click. | `StudentController.promote`, `StudentServiceImpl.promoteStudents`, `StudentPromotionPage.tsx` | Dry-run does not save/audit; UI shows backend preview | **[x] Done — 2026-05-24** (`StudentServiceImplTest`; frontend build; backend 238-test suite) |
| 16 | **P1-09** | Demo tenant freeze + nightly reset + visible "demo-only" banner separating demo from any pilot tenant. | Completes Level A (Customer Demo Ready) once Top-15 are done. | `DemoDataSeeder`, `DemoResetScheduler`, role portal banner | Nightly reset runs; demo tenant data cannot mix with pilot | **[x] Done — 2026-05-24** (`DemoResetSchedulerTest`; `DemoEnvironmentBanner` tests; frontend build) |
| 17 | **P0-16** | Rate-limit AI Copilot, notifications (email + push), WhatsApp, payment-order, QR mark, video initiate, results-generate using existing `ApiRateLimitInterceptor`. | Cost + abuse prevention. | Multiple controllers; existing `common/ratelimit/RateLimitInterceptor` | Integration test trips 429 on the N+1 request | **[x] Done — 2026-05-24** (`RateLimitedEndpointCoverageTest`; `MultiSchoolMultiTenantIT` 429 assertion; backend 241-test suite) |
| 18 | **P0-11** | `@Valid` sweep across every mutating controller body (especially `OnlineClassController.updateStatus/addRecording`, `VideoController.confirm`, `StaffLeaveController.submit`, `PaymentController.createOrderAdmin`, Experience Studio + Public Website endpoints). | Stops invalid data reaching repositories. | Many controllers | Boundary tests pass | **[x] Done — 2026-05-24** (`MutatingRequestBodyValidationCoverageTest`; `PublicEndpointValidationHttpTest`; backend 245-test suite) |
| 19 | **P0-18** | Make Trivy + OWASP Dependency Check PR-blocking in `.github/workflows/security-nightly.yml` (or new workflow); merge blocked on CRITICAL / HIGH. | Prevents reintroducing CVEs after P0-15. | `.github/workflows/security-nightly.yml` | PR workflow runs; merge blocked on critical findings | **[x] Done — 2026-05-25** (`pull_request` gate added; OWASP fails on CVSS >= 7; Trivy scans current-ref backend image) |
| 20 | **P1-13** | Backend requires `reason` field on irreversible mutations (suspend, graduate, transfer, terminate, fee waive, close-academic-year); UI captures it. | Audit + dispute defence; pairs naturally with P0-07. | Multiple controllers + matching UI dialogs | Backend rejects mutation without reason; reason stored in `audit_logs` | **[x] Done — 2026-05-25** (`ReasonRequest` + audit metadata + frontend reason dialogs; backend 246-test suite and frontend build pass) |
| 21 | **P1-01** | `GET /v1/student/me`, `GET /v1/parent/me`, `GET /v1/teacher/me`; wire into respective layouts. | UX blocker for pilot demos — every layout currently shows only auth-store username. | New controllers + `StudentLayout.tsx`, `ParentLayout.tsx`, `TeacherLayout.tsx` | Manual smoke + new unit tests | [ ] Not Started |
| 22 | **P1-04** | Audit log viewer UI at `/super-admin/audit-logs` and `/school-admin/audit-logs`; backend list endpoint with pagination + filters. | Compliance + sales evidence — schools will ask to see this. | New endpoints + 2 frontend pages | List + filter works; tenant-scoped | [ ] Not Started |
| 23 | **P1-10** | Per-tenant restore drill in `infra/pgbackup/drill.sh` + GitHub workflow that exercises restoring ONE tenant from encrypted backup. | Reliability evidence for pilot SLA. | `infra/pgbackup/drill.sh`, `.github/workflows/dr-drill.yml` | Workflow runs green; restores a specific tenant; row counts validated | [ ] Not Started |
| 24 | **P1-11** | Publish Privacy Policy + Terms + Data Processing Addendum on public website. | Legal requirement before pilot data ingestion. | `frontend/public/legal/*` + public-site pages | Pages exist and link from public site | [ ] Not Started |
| 25 | **P2-10** | External penetration test by an accredited firm; close all CRITICAL findings; close all HIGH findings or formally risk-accept with founder-signed justification renewable every 90 days. | Hard prerequisite for First Paid Customer Ready (Level C); cannot accept money without it. | External vendor + remediation work across the codebase | Pen-test report + remediation evidence + risk-acceptance log | [ ] Not Started |

After Task 25, audit the in-flight pilots, re-score, then move into Phase 1 remainder, Phase 2, etc.

---

## 18. Definition of "Ready to Sell"

### Level A — Customer Demo Ready (can safely demonstrate to prospective schools using demo data only)

The system can be safely demonstrated to prospective schools using demo data only, including:
- School Admin core flow.
- Teacher core flow only where working.
- Parent viewing correct child information.
- Parent fee payment flow in Razorpay test mode.
- No exposure of known critical authorization gaps during the demo.

Required Phase-0 task list — **8 tasks (Top-25 orders 1, 2, 3, 4, 5, 10, 13, 16):**

- [x] **P0-01** — Parent multi-school correctness (results + timetable).
- [x] **P0-02** — Secure QR attendance endpoint.
- [x] **P0-03** — Inventory + secure role-paths without breaking shared APIs.
- [x] **P0-04** — Class-level `@PreAuthorize` on 13 School Admin controllers.
- [x] **P0-12** — Force first-login password reset; remove default credentials from prod path.
- [x] **P0-13** — Secure and fix shared Mobile notices.
- [x] **P0-14** — Parent fee payment in Razorpay test mode.
- [x] **P1-09** — Demo tenant reset + clearly demo-only label.

Operational checks (do these AFTER the 8 tasks):
- [x] Greenwood demo tenant resets nightly (confirmed by `DemoResetSchedulerTest` cron + deletion-order coverage).
- [ ] All five role demo logins work end-to-end (`gw.admin`, `gw.teacher001/002`, `gw.student001`, `gw.parent001`).
- [ ] Demo flow rehearsed: admit → fee → notice → **Razorpay test pay (parent persona, P0-14)** → parent view → teacher attendance → exam result publish.
- [ ] No claims of "multi-school" beyond the demo tenant's actual configuration.
- [ ] No claims of "transport/hostel/library/payroll/AI insights" in marketing copy.
- [ ] Screenshots / 2-min screen recording prepared.

**Current status:** **PASS** — 8 of 8 required tasks complete. Demo only; pilot and paid readiness still require Level B / Level C.

### Level B — Pilot Ready (can onboard selected real schools under controlled conditions)

- [x] All Phase-0 tasks complete (P0-01 to P0-18).
- [ ] `MultiSchoolMultiTenantIT` PASS in CI.
- [ ] DR drill PASS in last 30 days.
- [ ] Per-tenant restore drill PASS.
- [ ] Pilot agreement template ready.
- [ ] Privacy policy + Terms + DPA published.
- [ ] Operator runbook (incident response + rollback).
- [ ] Customer support email + WhatsApp channel ready.
- [ ] Demo + pilot tenants separated (no shared data).
- [ ] No CRITICAL Trivy findings; ≤2 HIGH with documented justification.

**Current status:** **FAIL** — all 18 Phase-0 tasks are complete; 4 pilot-critical Phase-1 tasks remain.

### Level C — First Paid Customer Ready (can accept money and store real school/student/payment data safely)

**Level C — First Paid Customer Ready requires BOTH:**

**(a) 39 tracked engineering / product / security tasks** — already counted in the §16 roadmap and §17 Top 25. These are: all 18 Phase-0 + 14 Phase-1 + the seven required Phase-2 paid-readiness tasks (P2-01, P2-02, P2-04, P2-05, P2-09, P2-10, P2-11). Current tracked status after P1-13: 20 done, 19 remaining, plus all mandatory non-task evidence.

**(b) Mandatory commercial and operational evidence that is NOT included in the 39-task roadmap count.** None of these are tracked as roadmap tasks because they are external or operational deliverables:

- [ ] **Completed controlled-pilot validation period** — at least one pilot school operated for 60+ days with documented incident-free record.
- [ ] **Published pricing and sales material** — pricing page, plan comparison, sales-call deck signed off.
- [ ] **Published Privacy Policy, Terms of Service, and Data Processing Agreement** — legal-reviewed and live on public website.
- [ ] **Public security / trust disclosure page** — `security@cloudcampus`, vulnerability process, sub-processor list, encryption summary.
- [ ] **Documented support and escalation process** — response-time SLA, escalation matrix, on-call rota.
- [ ] **Documented payment reconciliation process** — daily Razorpay reconciliation, dispute handling runbook.
- [ ] **External penetration test completed** with all CRITICAL findings fixed and HIGH findings fixed or formally risk-accepted in writing (founder-signed, renewable every 90 days). *(Note: P2-10 is the engineering task that triggers this; the signed report is the non-task evidence here.)*

**Paid commercial sale is blocked until both the 39 tracked tasks and every mandatory evidence check pass.**

Pre-existing operational checklist (kept for record; items overlap with the 39 tracked tasks above):
- [ ] Level B complete.
- [ ] MFA enforced for SUPER_ADMIN + SCHOOL_ADMIN (P2-09).
- [ ] Audit log retention policy committed (≥1 year).
- [ ] Customer data export endpoint exists and tested (P2-11).
- [ ] Customer data delete (GDPR-style) tested.
- [ ] Load test PASS at target scale (e.g. 10 tenants × 1000 students × peak concurrency) — note: large-scale load test is part of Level E but a basic capacity sanity check should occur before first paid sale.
- [ ] Pricing page + sales collateral signed off.
- [ ] At least 1 pilot running for 60+ days with documented incident-free record (target ≥3 by the time a wider sales push starts).

**Current status:** **FAIL.**

### Level D — Revenue Expansion Ready (can upsell premium modules after real customer validation)

- [ ] Level C complete.
- [ ] ≥5 paid schools have renewed at least once at Level C.
- [ ] Phase 2 complete (report-card PDF, parent-teacher chat, MFA, data export, notice ack).
- [ ] Key Phase-3 modules built only after customer feedback signals demand (Library OR Transport OR Hostel OR Payroll OR AI insights — pick the one customers actually ask for).
- [ ] White-label / branding upsell working end-to-end.
- [ ] Analytics export (Excel / API) shipped.
- [ ] Pricing for premium tier validated against ≥3 customer conversations.

**Current status:** **FAIL.** Level D should not be considered until at least 6 months of Level-C operation.

### Level E — Scale / Enterprise Ready (can support many schools or large contracts)

- [ ] Level D complete.
- [ ] Load test PASS at target scale (e.g. 10 tenants × 1000 students × peak concurrency) using `infra/load-tests/` k6 scripts; latency p99 documented.
- [ ] Read-replica routing + pgbouncer cutover validated.
- [ ] Partitioning live on `attendance_records`, `audit_logs`, `notification_logs`, `ai_usage_logs`.
- [ ] Per-tenant resource quotas enforced (no noisy-neighbour at DB, queue, or AI level).
- [ ] Kubernetes HPA + readiness probes validated; rollback runbook tested.
- [ ] Multi-school resolver (P0-01 + P0-13) re-validated at scale with 2-school tenants.
- [ ] Tenant offboarding (delete + 30-day export) tested end-to-end.
- [ ] Quarterly DR drill tabletop with founder + ops.

**Current status:** **FAIL.** No load tests have been executed against real traffic in this repo.

---

## 19. Final Scorecard

| Area | Score | Reason | Minimum Score Required Before Paid Sale |
|---|---:|---|---:|
| Product completeness | 67 | All five role portals functional; parent demo payment exists; still missing teacher homework creation, audit viewer, several profile endpoints | 80 |
| Security | 76 | Strong auth + HMAC + tenant filter + high-cost endpoint rate limits; mutating request bodies now validate; OWASP + Trivy now run as a PR-triggered release gate; irreversible action reasons are captured; remaining gaps are MFA, external pen-test, and audit viewer UX | 85 |
| Tenant isolation | 75 | `tenant_id` filter strong at ORM; multi-school parent/mobile fixes and school-path tenant guard now exist; broader per-endpoint proof and scale validation still needed | 90 |
| Payments / revenue flow | 66 | HMAC + webhook + idempotency strong; verify is role/owner checked; parent demo payment exists; payment-order creation is rate-limited; production hardening still required | 85 |
| UX / ease for schools | 61 | Surface complete; missing daily-use flows on Teacher (post homework) and Parent (pay fees, leave, consent); irreversible admin actions now have reason dialogs but broader workflow polish remains | 80 |
| Scalability | 55 | Solid foundation (Hikari env-driven, Redis, RMQ, MinIO, Prometheus); sync CSV exports, N+1, no partitioning, no read-replica | 70 |
| Reliability / DevOps | 73 | Backups + DR drill + CI + observability are real; CVE/dependency release gate now blocks HIGH/CRITICAL findings; rollback runbook and per-tenant restore are still missing | 85 |
| Testing | 74 | 246 backend tests pass; cross-tenant / role-matrix / payment / KB-isolation / parent draft-result exclusion / student self-profile redaction / forced password-change / prod bootstrap / student-promotion dry-run / demo reset hygiene / rate-limit / validation coverage / required-reason / public HTTP 400 / multi-school matrix tests exist; per-mutation audit and broad frontend RTL gaps remain | 85 |
| Sales / demo readiness | 60 | Demo tenant + role logins ready; no marketing site, no pricing, no legal docs, no screenshots | 80 |
| Future feature readiness | 70 | Modular architecture; clean feature-flag system; subscription scaffolding | 70 |

- **Overall current score: 74 / 100.**
- **Recommended commercial status:** **Controlled Pilot after the four remaining pilot-critical Phase-1 fixes and operational checklist pass.** Not "Paid Sale Ready".
- **Exact reason:** Phase 0 is complete, but controlled pilots still need the remaining Level-B Phase-1 work: audit viewer, profile endpoints, rollback/restore readiness, and pilot legal/ops handoff.

---

## 20. Personal Founder Action Plan

**Stop building temporarily:**
- AI insights upsell.
- Transport / hostel / library / payroll modules.
- Public website builder polish.
- Investor / experience studio "polish" features.
- React Native mobile app (already removed — keep removed).

**Fix first (next 3 weeks):**
- Phase-0 items in order from §17 (Task 1 → Task 25). Each task is one well-scoped change with a verification test.

**Target the first customer:**
- 2–3 small private K-12 schools in your founder network in one city.
- Single campus, 300–1500 students.
- English-medium so the demo data feels native.

**Do NOT promise customers:**
- "Multi-campus support" — until P0-01 lands.
- "Transport / hostel / library / payroll" — Phase 3.
- "AI insights" as a sales claim — quota + audit not finished.
- "WhatsApp / SMS unlimited" — pass-through pricing only.
- "Compliance with GDPR / FERPA / DPDP" — until Phase 1.

**Demo confidently:**
- School admin admit + fee structure + Razorpay test payment by parent + WhatsApp/email notice + teacher attendance (QR) + exam result publish + parent sees result.

**When to start contacting schools:**
- After the **8 Level-A tasks** (P0-01, P0-02, P0-03, P0-04, P0-12, P0-13, P0-14, P1-09) are complete, **start contacting schools for demonstrations only**.
- Call CloudCampus **pilot-ready only after all 24 Level-B tasks are complete**, all Level-B validation checks pass, and the controlled-pilot operational checklist is satisfied.

**Evidence to have before charging money:**
- DR drill green in the last 30 days.
- External pen-test report.
- Privacy policy + Terms + DPA.
- 3 pilots running for ≥60 days without incidents.
- Trivy + OWASP release gates green.

**Revenue features that matter first:**
- Parent fee payment (P0-14).
- Receipts.
- Notices via WhatsApp pass-through.
- Audit log evidence per fee / leave / result.

**How to avoid spending months on features nobody will pay for:**
- After every two Phase-0/Phase-1 tasks complete, ask one pilot school operator to use the new flow before adding the next.
- Time-box every Phase-2 task at 5 working days. If it's not done in 5, return to backlog.
- Do not start Phase 3 (transport / library / hostel / payroll / AI insights) until at least 5 paid schools renew once.

---

## Immediate Next Step

> Last updated 2026-05-25 after Task 20 (§17) shipped. See §1.3 for the full progress tracker.

- **Tasks completed so far:** **20 of 56** — P0-01, P0-02, P0-03, P0-04, P0-05, P0-06, P0-07, P0-08, P0-09, P0-10, P0-11, P0-12, P0-13, P0-14, P0-15, P0-16, P0-17, P0-18, P1-09, P1-13.
- **Current total remaining roadmap tasks:** **36** (was 56).
- **Remaining Customer Demo Ready (Level A) tasks:** **0** — was 8.
- **Remaining Controlled Pilot Ready (Level B) tasks:** **4** — was 24.
- **Remaining First Paid Customer Ready (Level C) tasks:** **19 tracked + all non-task evidence** — was 39 tracked; includes **P2-10 external penetration test**.
- **Remaining Phase-0 security/product blockers:** **0** (was 18).

### The exact next task to implement

**Task 21 — P1-01:** Add self-profile endpoints for Student, Parent, and Teacher portals.

- **Files:** new or existing role controllers plus `StudentLayout.tsx`, `ParentLayout.tsx`, and `TeacherLayout.tsx`.
- **Change scope:** add `GET /v1/student/me`, `GET /v1/parent/me`, and `GET /v1/teacher/me`; wire layouts away from auth-store-only names.
- **Test coverage:** role/ownership tests for each endpoint plus focused frontend layout tests or build verification.

### Validation command that proves Task 21 is completed

```
git diff --check && mvn -f backend/pom.xml test --batch-mode --no-transfer-progress
```

…must show **`Failures: 0, Errors: 0`** for backend changes. Because layouts will change, also run `npm --prefix frontend run build` and the closest focused frontend tests if present.

### Warning

**Do not implement multiple unrelated tasks together.** Each roadmap task has its own verification test. Bundling them makes regression diagnosis painful and review slower. Tackle them in the **§17 Top-25 order** strictly. After Task 20 lands and the tests pass, move to Task 21 (P1-01 — self-profile endpoints).

---

_Validation run during this audit (updated 2026-05-25):_
- P0-17 focused regression: **PASS** — 101 tests, 0 failures, 0 errors, 0 skipped (re-confirmed 2026-05-24, exit 0).
- P0-16 focused rate-limit suite: **PASS** — 11 tests, 0 failures, 0 errors, 0 skipped (2026-05-24, exit 0).
- P0-11 focused validation suite: **PASS** — 4 tests, 0 failures, 0 errors, 0 skipped (2026-05-24, exit 0).
- P1-13 focused reason-capture suite: **PASS** — 15 tests, 0 failures, 0 errors, 0 skipped (2026-05-25, exit 0).
- Backend full suite after P1-13: **PASS** — 246 tests, 0 failures, 0 errors, 0 skipped (2026-05-25, exit 0).
- P0-18 workflow validation: **PASS locally** — YAML parses, `git diff --check` is clean, and `.github/workflows/security-nightly.yml` now contains PR-triggered OWASP + Trivy blocking gates. Final merge blocking depends on GitHub branch protection requiring the two security jobs.
- `npx tsc -b --pretty false`: **PASS** — exit 0.
- `npm run build`: **PASS** — exit 0.
- `npm run lint`: **PASS** — exit 0.
- Container Trivy scan (from CI on f53c009): **previously FAIL** — 14 vulns (3 CRITICAL + 11 HIGH). P0-15 dependency remediation is complete; P0-18 now makes the current-ref image scan release-blocking.
- OpenAPI publish job (CI on f53c009): **FAIL** — RabbitMQ not available in runner; not a security issue.
- Local pom.xml CVE bump attempt (2026-05-22): regressed `StorageServiceTest` because MinIO 8.6.0 drops the transitive `okhttp3` jar; reverted during the original audit and later resolved by the P0-15 explicit okhttp pin.
- Mobile app: **N/A** — React Native mobile app was removed in an earlier commit (`f6090fd`); no `mobile/` package scripts to run.
- API smoke against running local backend: **not performed** — local backend was not started during this re-verification. Smoke testing belongs in a separate runbook step.

_End of report._
