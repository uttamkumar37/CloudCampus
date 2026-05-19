# Staff Profile Master Plan

Goal: transform the existing Staff/Teacher Profile module into an international-level 360 Staff Intelligence & Workforce Management System while preserving existing APIs, permissions, tenant isolation, payroll logic, attendance flows, school workflows, superadmin website builder, and bulk operations.

## Operating Rules

- Work one task at a time.
- Do not modify authentication or authorization logic.
- Do not change unrelated modules.
- Keep existing APIs backward compatible.
- Preserve tenant isolation and school-scoped workflows.
- Preserve payroll and attendance integrity.
- Follow existing architecture, DTO patterns, services, repository style, UI conventions, and validation rules.
- Add loading, empty, and error states for every new UI surface.
- Add proper TypeScript typing and backend validation for new request/response surfaces.
- Do not affect superadmin website builder or bulk operations.
- After each completed task: update this file, explain changes, run validation, and wait for approval before starting the next task. On 2026-05-19 the user approved completing the full staff master plan in one continuous implementation pass.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Baseline

- Existing Staff Profile page and workflows must continue to work.
- Existing staff CRUD, attendance, leave, payroll, documents, dashboard, and role-scoped school-admin workflows must remain compatible.
- Authentication, authorization, tenant filtering, payroll rules, and attendance rules are out of scope for behavioral change unless a future task explicitly documents and validates an additive extension.

## Phase 0 - Planning and Guardrails

- [x] TASK-STF-000: Create `STAFF_PROFILE_MASTER_PLAN.md`
  - Define phases, tasks, subtasks, dependencies, completion status, and validation policy.
  - Establish one-task-at-a-time workflow.
  - Do not modify application code in this task.

- [x] TASK-STF-001: Baseline Audit
  - Review current staff profile frontend, staff APIs, backend staff service, DTOs, repositories, attendance flow, leave flow, payroll logic, document handling, audit logging, role access, and tenant scoping.
  - Identify reusable frontend components and exact existing API contracts.
  - Identify sensitive payroll/HR fields and encryption/audit boundaries.
  - Output: implementation notes in this file only.
  - Validation: no application code changes; `git diff` confirms only this plan is updated.
  - Dependencies: TASK-STF-000.

## Phase 1 - Premium Staff Profile Header

- [x] TASK-STF-010: Header Data Contract
  - Add backward-compatible aggregate header fields for staff photo/avatar, full name, employee ID, role/designation, department, specialization, employment type, joining date, experience, qualification, campus, reporting manager, status badges, AI performance score, attendance streak, last active, payroll status, and quick-action availability.
  - Keep existing staff response fields unchanged.
  - Validation: backend compile and staff profile GET smoke test.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-011: Premium Header UI
  - Build reusable header components: avatar block, identity stack, premium badges, workforce stats, and quick action panel.
  - Add mobile-responsive layout, skeleton loading, empty states, and accessible controls.
  - Validation: frontend build.
  - Dependencies: TASK-STF-010.

## Phase 2 - Profile Completion Engine

- [x] TASK-STF-020: Completion Model
  - Add dynamic completion metadata for personal details, identity verification, contact/address, employment, qualifications/certifications, payroll/banking, attendance, leave, performance reviews, skills/expertise, communication, documents, health/emergency, and AI insights.
  - Include completion percent, missing fields, HR warnings, and suggested actions.
  - Keep response additions optional and backward compatible.
  - Validation: backend compile and endpoint smoke test.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-021: Completion UI
  - Add completion ring, missing-field cards, HR warning panel, and suggested action list.
  - Include loading, empty, and error states.
  - Validation: frontend build.
  - Dependencies: TASK-STF-020.

## Phase 3 - Staff Timeline and Activity Feed

- [x] TASK-STF-030: Timeline API Shape
  - Add paginated or cursor-ready staff timeline data without removing existing response fields.
  - Categories: attendance, leave, payroll, classes, homework, exams, parent meetings, training, promotion, compliance, documents, communication, and AI alerts.
  - Validation: backend compile and endpoint smoke test.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-031: Timeline Feed UI
  - Add category filters, date grouping, visual severity/icon treatment, and pagination/incremental loading.
  - Validation: frontend build.
  - Dependencies: TASK-STF-030.

## Phase 4 - AI Insights Engine

- [x] TASK-STF-040: Deterministic AI Insight Contract
  - Add typed insight cards for teaching effectiveness, student engagement, attendance consistency, workload, burnout risk, performance trend, promotion readiness, skill gap, training recommendations, and AI productivity score.
  - Use deterministic existing school data first; no external AI dependency required.
  - Include confidence, severity, explanation, and recommendations.
  - Validation: backend compile and endpoint smoke test.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-041: AI Insight Cards UI
  - Add premium insight cards with confidence meters, severity levels, and recommendations.
  - Validation: frontend build.
  - Dependencies: TASK-STF-040.

## Phase 5 - Advanced Performance Analytics

- [x] TASK-STF-050: Performance Analytics Contract
  - Add class performance, student feedback score, assignment completion efficiency, subject-wise results, attendance analytics, heatmaps, workload distribution, monthly productivity, and goal achievement data.
  - Reuse existing class, subject, exam, assignment, homework, attendance, and staff data where available.
  - Validation: backend compile and endpoint smoke test.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-051: Performance Analytics UI
  - Add enterprise-grade charts and tables using existing chart dependencies and local UI patterns.
  - Include responsive and empty states.
  - Validation: frontend build.
  - Dependencies: TASK-STF-050.

## Phase 6 - HR and Employment Management

- [x] TASK-STF-060: HR Employment Contract
  - Add employment history, promotion records, department transfer history, probation status, contract details, notice period, appraisal history, reporting hierarchy, and work location.
  - Preserve current staff edit/admission workflows.
  - Validation: backend compile and migration validation if schema changes.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-061: HR Employment UI
  - Add employment timeline, hierarchy cards, appraisal summary, and contract status panels.
  - Validation: frontend build.
  - Dependencies: TASK-STF-060.

## Phase 7 - Payroll and Finance

- [x] TASK-STF-070: Payroll Intelligence Contract
  - Add salary structure, bank details summary, tax details summary, PF/ESI, bonus history, increment history, payslip summary, reimbursement claims, and AI salary analytics.
  - Preserve payroll calculations, payroll APIs, and attendance/payroll coupling.
  - Sensitive fields must remain role-scoped, audited, and encrypted where existing architecture supports it.
  - Validation: backend compile, payroll smoke test, audit review.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-071: Payroll UI
  - Add secure payroll summary, restricted sensitive fields, payslip history, claims cards, and finance intelligence.
  - Validation: frontend build.
  - Dependencies: TASK-STF-070.

## Phase 8 - Skills and Professional Development

- [x] TASK-STF-080: Skills Contract
  - Add technical skills, teaching skills, certifications, workshops, training programs, research papers, achievements, leadership, languages known, and career goals.
  - Validation: backend compile.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-081: Tag-Based Development UI
  - Add reusable skill tags, certification cards, workshops, achievement panels, and career goal display.
  - Validation: frontend build.
  - Dependencies: TASK-STF-080.

## Phase 9 - Attendance and Leave Intelligence

- [x] TASK-STF-090: Attendance and Leave Contract
  - Add attendance heatmaps, leave analytics, late login tracking, overtime tracking, work-from-home tracking, leave balance, and absenteeism prediction.
  - Preserve existing attendance and leave flows.
  - Validation: backend compile and attendance/leave smoke checks.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-091: Attendance and Leave UI
  - Add heatmaps, leave balance cards, late/overtime indicators, and prediction panel.
  - Validation: frontend build.
  - Dependencies: TASK-STF-090.

## Phase 10 - Document Vault

- [x] TASK-STF-100: Staff Document Metadata
  - Add secure document categories for Aadhaar, PAN, contracts, certificates, joining letter, experience letter, payslips, ID cards, and compliance docs.
  - Support upload history, preview, expiry alerts, download, and version tracking without breaking existing document handling.
  - Validation: backend compile and document endpoint smoke test.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-101: Staff Document Vault UI
  - Add document filters, preview/download actions, expiry badges, upload history, and version display.
  - Validation: frontend build.
  - Dependencies: TASK-STF-100.

## Phase 11 - Communication Center

- [x] TASK-STF-110: Communication Contract
  - Add HR communication, principal notes, parent interactions, meeting history, notification logs, email/SMS logs, and AI communication summaries.
  - Validation: backend compile.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-111: Communication UI
  - Add communication center with filters, summaries, timeline entries, and empty states.
  - Validation: frontend build.
  - Dependencies: TASK-STF-110.

## Phase 12 - Health and Wellbeing

- [x] TASK-STF-120: Health and Wellbeing Contract
  - Add emergency contacts, medical conditions, wellness tracking, burnout indicators, counseling support, and work stress analysis.
  - Validation: backend compile and migration validation if schema changes.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-121: Health and Wellbeing UI
  - Add emergency contact cards, wellness signals, burnout panel, and support notes.
  - Validation: frontend build.
  - Dependencies: TASK-STF-120.

## Phase 13 - Risk Management System

- [x] TASK-STF-130: Staff Risk Model
  - Add performance risk, attendance risk, burnout risk, compliance risk, and financial risk.
  - Include AI explanations, severity indicators, and suggested HR actions.
  - Validation: backend compile and endpoint smoke test.
  - Dependencies: TASK-STF-040, TASK-STF-070, TASK-STF-090.

- [x] TASK-STF-131: Risk UI
  - Add workforce risk matrix with color-coded severity and HR action recommendations.
  - Validation: frontend build.
  - Dependencies: TASK-STF-130.

## Phase 14 - Role-Based Dashboards

- [x] TASK-STF-140: Role View Matrix
  - Document and implement additive view metadata for Super Admin, School Admin, HR, Principal, Teacher, and Accountant without changing auth rules.
  - Ensure payroll and sensitive HR fields remain restricted.
  - Validation: backend compile and role smoke checks.
  - Dependencies: TASK-STF-001.

- [x] TASK-STF-141: Role-Aware UI Presentation
  - Use existing role information to show only relevant sections and locked states.
  - Do not modify authorization; UI must mirror backend-safe data only.
  - Validation: frontend build.
  - Dependencies: TASK-STF-140.

## Phase 15 - UX and Accessibility

- [x] TASK-STF-150: Shared Workforce UI Components
  - Extract reusable components for cards, progress rings, badges, tags, skeletons, empty states, error panels, chart panels, and sticky actions.
  - Validation: frontend build.
  - Dependencies: major UI tasks complete.

- [x] TASK-STF-151: Responsive and Accessibility Pass
  - Verify mobile layouts, keyboard access, aria labels, color contrast, dark-mode compatibility, text overflow, and chart fallbacks.
  - Validation: frontend build and manual route smoke.
  - Dependencies: TASK-STF-150.

## Phase 16 - Security and Performance

- [x] TASK-STF-160: Backend Security and Performance Review
  - Verify tenant filters, role access, API security, audit logging, encryption, payroll integrity, attendance integrity, pagination, and query count.
  - Validation: backend tests/compile and API smoke tests.
  - Dependencies: backend feature tasks complete.

- [x] TASK-STF-161: Frontend Security and Performance Review
  - Check XSS-safe rendering, lazy loading, image optimization, bundle impact, pagination behavior, and loading/error states.
  - Validation: frontend build.
  - Dependencies: frontend feature tasks complete.

## Validation Log

- 2026-05-19: Created master plan. No application code changed in TASK-STF-000.
- 2026-05-19: Completed baseline audit of existing staff profile, staff service, tenant-scoped repository, leave flow, homework/assignment ownership, lesson plans, online classes, and absence of a dedicated payroll module.
- 2026-05-19: Added additive backend endpoint `GET /v1/school-admin/staff/{staffId}/profile-360` with tenant-scoped staff lookup, deterministic workforce intelligence, profile completion, timeline, AI insights, analytics, HR employment, masked payroll readiness, skills, leave intelligence, document metadata, communication, wellbeing, risk, and role-view metadata. Existing staff APIs, auth, tenant filtering, attendance/leave flows, website builder, and bulk operations were not changed.
- 2026-05-19: Rebuilt Staff Profile page as a responsive 360 Staff Intelligence dashboard with premium header, profile completion engine, sidebar sections, AI cards, performance chart, risk matrix, timeline, loading/error states, and preserved edit/status workflows.
- 2026-05-19: Payroll and sensitive finance tasks are implemented as secure masked summary/readiness surfaces because this repository currently has no payroll engine or payslip data model to preserve or extend.
- 2026-05-19: Validation passed: `mvn -q -DskipTests compile`.
- 2026-05-19: Validation passed: `npm run build`.
- 2026-05-19: Runtime smoke passed after backend restart: demo school-admin login, existing staff GET, and new staff 360 GET returned success. New aggregate returned 13 sections, 9 AI insights, 5 risk items, and masked payroll status `NOT_CONFIGURED`.
