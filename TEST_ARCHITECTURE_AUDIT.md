# CloudCampus Test Architecture Audit

Last updated: 2026-05-21

## Objective

Audit and improve test coverage across backend, frontend, mobile, infrastructure, and security modules without changing production behavior.

## Current Test Inventory

| Area | Current State | Status |
| --- | --- | --- |
| Backend | 29 Java test classes across auth, RBAC, tenant isolation, payment, finance, exam, storage, AI, experience, security, and traceability. | Passing |
| Frontend | 10 Vitest files focused on auth, protected routes, school-admin layout, tenant pages, and experience analytics consent/tracking, plus a shared provider render helper. | Passing |
| Mobile | No test files or test script. TypeScript compile is available through `npx tsc --noEmit`. | Gap |
| Infrastructure | k6 load scripts and shell scripts exist, but no automated lint/test harness for infra config. | Gap |
| E2E | No Playwright/Cypress app-level E2E suite found. | Gap |

## Initial Coverage Gaps

### Backend Modules Without Top-Level Test Coverage

assignment, attendance, audit, demo, domain, feature, homework, leave, lessonplan, mobile, notice, notification, onlineclass, reports, retention, school, staff, staffattendance, student, subscription, teacher, timetable, video, website, whatsapp.

### Frontend Features Without Test Files

assignments, attendance, exam, exams, finance, homework, notice-board, notification, parent, public-site, reports, role-portals, staff, student, teacher, tenant, timetable, whatsapp.

### Mobile Gaps

- No Jest/Vitest setup.
- No screen tests.
- No API/client tests.
- No offline sync conflict tests in code.
- No push notification/deep-link tests.

### Infrastructure And Load Gaps

- k6 scripts exist but are not wired to an npm/make/CI command.
- Kubernetes YAML has no validation script.
- Alertmanager, Prometheus, Grafana, Loki, Tempo configs have no lint/check command.

## Broken Or Outdated Tests Found

| Area | Issue | Fix Status |
| --- | --- | --- |
| Frontend global setup | React Testing Library cleanup was not registered, so DOM nodes leaked between tests and caused duplicate navigation/button matches. | Fixed |
| Frontend page tests | Auth and tenant create pages now require `ToastProvider`, but tests rendered them without the app provider stack. | Fixed |
| Frontend tenant create test | Test expected the old single-step create flow; the page is now a multi-step identity → plan → review workflow. | Fixed |
| Frontend login test | Test expected the backend's raw credential error text; the UI now shows a safer generic sign-in failure message. | Fixed |
| Backend auth service test | Constructor was stale after adding device session registration to the login flow. | Fixed |

## Tests Added Or Improved In This Pass

- Added `DeviceSessionServiceImplTest` covering device registration, tenantless platform sessions, long user-agent truncation, duplicate active-device compaction, targeted revoke, unknown-session failure, and revoke-all behavior.
- Added shared frontend `renderWithProviders` test utility for `QueryClientProvider`, `ToastProvider`, and `MemoryRouter`.
- Reused the frontend provider helper in auth and tenant create page tests.
- Added global React Testing Library cleanup after every frontend test.
- Added frontend `test` and `test:coverage` scripts.
- Added backend JaCoCo reporting through Maven `verify`.

## Validation Commands

| Command | Purpose | Latest Result |
| --- | --- | --- |
| `cd backend && mvn verify -q` | Backend unit/integration/security tests plus JaCoCo report. | Passed: 166 tests, 0 failures, 0 errors, 0 skipped |
| `cd frontend && npm run test:coverage` | Frontend unit/component tests plus V8 coverage. | Passed: 10 files, 54 tests |
| `cd frontend && npm run build` | Frontend TypeScript and production build. | Passed |
| `cd mobile && npx tsc --noEmit` | Mobile static type validation. | Passed |

## Coverage Snapshot

| Area | Report Location | Latest Coverage |
| --- | --- | --- |
| Backend | `backend/target/site/jacoco/index.html` | Instruction 19.43%, branch 16.68%, line 25.89% |
| Frontend | `frontend/coverage/index.html` | Statements 49.94%, branches 47.64%, functions 28.53%, lines 61.97% |

Coverage is now reportable, but the percentages confirm the same architectural gap found by the scan: many modules compile and run, yet still lack direct deterministic tests.

## Recommended Improvements

1. Add backend test data builders for tenant, school, user, student, staff, fee, attendance, and website entities.
2. Add module-level backend tests for school settings, timetable, homework, assignments, subscription entitlement enforcement, notifications, staff attendance, and student self-profile.
3. Add mobile Jest/Vitest stack and first tests for auth store, axios refresh queue, proactive refresh, notification route allowlist, and offline sync queue.
4. Add infra validation command for k8s manifests and observability config linting.
5. Add E2E smoke coverage for login, role routing, school-admin dashboard, student profile, timetable week navigation, public website, and website builder publish flow.
6. Wire coverage thresholds into CI once the uncovered modules above have baseline tests.

## Production Readiness Status

Not production-complete yet. The test foundation covers several high-risk backend security and data-safety areas, but frontend, mobile, infra, and several school workflow modules need broader deterministic coverage before claiming enterprise-grade readiness.
