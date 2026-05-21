# Role Portals Master Plan

Goal: create international-level 360 degree portals for STUDENT, TEACHER, and PARENT while preserving existing APIs, authentication, role-based access, tenant isolation, school workflows, and current page behavior.

## Operating Rules

- Work one task at a time.
- Ask for approval before starting the next task.
- Do not modify unrelated modules.
- Do not change authentication or authorization logic.
- Keep existing APIs backward compatible.
- Preserve tenant isolation and role-specific data boundaries.
- Keep student, teacher, and parent workflows usable throughout the upgrade.
- Prefer additive aggregate endpoints and typed frontend API wrappers over risky changes to existing contracts.
- Use reusable UI components for portal cards, charts, timelines, insight cards, skeletons, empty states, and error panels.
- Add loading, empty, and error states for every new surface.
- Add TypeScript types and backend validation for any new request/response surface.
- Validate builds and smoke-test role access after each implementation task.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[!]` Blocked

## Current Baseline Snapshot

- Existing role routes are already protected:
  - `/student/*` requires `STUDENT`
  - `/teacher/*` requires `TEACHER`
  - `/parent/*` requires `PARENT`
- Existing student portal includes dashboard, homework, assignments, timetable, notices, results, fees, attendance, and QR scan pages.
- Existing teacher portal includes dashboard, timetable, attendance, homework, assignments, lesson plans, online classes, videos, notices, and leave pages.
- Existing parent portal includes dashboard, child detail, and notices pages.
- Existing student portal APIs include homework, assignments, timetable, notices, results, fees, attendance, and QR attendance.
- Existing teacher dashboard API returns today slots, pending homework review, pending assignment grading, and posted work counts.
- Existing parent APIs expose linked children and child-scoped attendance, results, homework, timetable, fees, and notices.
- Student 360 and Staff 360 work already exists and should be reused where safe, not duplicated.

## Phase 0 - Planning and Guardrails

## Phase 1 - Shared Portal Foundation

- [ ] TASK-RP-012: Portal Accessibility and Theme Pass
  - Add keyboard-friendly controls, proper aria labels, responsive text behavior, contrast-safe tones, and dark-mode-compatible class choices.
  - Validation: frontend build and visual smoke.
  - Dependencies: TASK-RP-010.

## Phase 2 - Student Portal 360 Experience

- [ ] TASK-RP-022: Student Profile Portal Integration
  - Surface 360 student profile sections in the student portal where role-safe: personal details, academics, attendance, achievements, skills/interests, documents, health summary, and career goals.
  - Student can only see own data.
  - Validation: frontend build and student profile smoke.
  - Dependencies: TASK-RP-020.

- [ ] TASK-RP-023: Student Learning Hub
  - Improve homework, assignments, lesson-plan/readiness, study materials, exam schedule, marks/results, and teacher feedback views.
  - Preserve existing submission/upload behavior.
  - Validation: frontend build and homework/assignment smoke.
  - Dependencies: TASK-RP-021.

- [ ] TASK-RP-024: Student AI Insight Cards
  - Add weak subject detection, study plan, exam readiness, attendance risk, career suggestions, and personalized learning tips from deterministic existing data.
  - No external AI dependency required.
  - Validation: frontend build and API smoke if a backend aggregate is added.
  - Dependencies: TASK-RP-021.

## Phase 3 - Teacher Portal 360 Faculty Experience

- [ ] TASK-RP-032: Teacher Class Management Hub
  - Improve student list, attendance marking, homework assignment, lesson plans, study material upload, marks entry, and behavior-note readiness.
  - Do not loosen assigned-class access.
  - Validation: frontend build and attendance/homework smoke.
  - Dependencies: TASK-RP-031.

- [ ] TASK-RP-033: Teacher Performance Analytics
  - Add class result analytics, student risk alerts, assignment completion percent, attendance trends, subject performance, and AI class insights.
  - Prefer additive aggregate data and existing repositories.
  - Validation: backend compile if needed, frontend build.
  - Dependencies: TASK-RP-030.

- [ ] TASK-RP-034: Teacher Profile Portal
  - Add teacher-visible profile with personal details, qualification, subject expertise, attendance, leave, documents readiness, achievements, and training/certifications.
  - Reuse staff 360 profile data safely where current user owns the staff profile.
  - Validation: backend compile if endpoint is added, frontend build.
  - Dependencies: TASK-RP-030.

## Phase 4 - Parent Portal 360 Experience

- [ ] TASK-RP-042: Parent Child Profile 360 UI
  - Upgrade child profile with academic progress, attendance analytics, homework completion, achievements, behavior readiness, health summary, documents, and teacher feedback readiness.
  - Reuse student 360 profile only through parent-linked child access rules.
  - Validation: frontend build and linked-child smoke.
  - Dependencies: TASK-RP-040.

- [ ] TASK-RP-043: Parent Communication Center
  - Add teacher message readiness, meeting schedule readiness, school announcements, SMS/email history readiness, and AI progress summary panel.
  - Keep unavailable actions disabled or clearly marked as not configured when no backend workflow exists.
  - Validation: frontend build.
  - Dependencies: TASK-RP-041.

- [ ] TASK-RP-044: Parent Finance Hub
  - Upgrade fee balance, payment history, receipts, due reminders, and transport/hostel charge readiness.
  - Preserve existing payment and receipt behavior.
  - Validation: frontend build and fees smoke.
  - Dependencies: TASK-RP-041.

## Phase 5 - Common Enterprise Features

- [ ] TASK-RP-050: Timeline and Notification Center
  - Add role-specific activity feed and notification center using existing notices, homework, assignments, attendance, fees, results, leave, and communication data where available.
  - Validation: frontend build.
  - Dependencies: student, teacher, and parent dashboard tasks.

- [ ] TASK-RP-051: Search and Filters
  - Add scoped search/filter controls where lists exist: homework, assignments, notices, child data, classes, submissions, and timeline items.
  - Validation: frontend build.
  - Dependencies: relevant portal list tasks.

- [ ] TASK-RP-052: Role-Specific Quick Actions
  - Add quick actions for student, teacher, and parent while preserving existing flows and disabling non-configured workflows.
  - Validation: frontend build and route smoke.
  - Dependencies: dashboard UI tasks.

## Phase 6 - Security and Access Control Validation

- [ ] TASK-RP-060: Student Access Review
  - Verify student can only see own data.
  - Validate existing student APIs and any new aggregate endpoints.
  - Validation: backend compile and student smoke.
  - Dependencies: student portal tasks.

- [ ] TASK-RP-061: Parent Access Review
  - Verify parent can only see linked children and cannot access unlinked student IDs.
  - Validation: backend compile and parent linked-child smoke.
  - Dependencies: parent portal tasks.

- [ ] TASK-RP-062: Teacher Access Review
  - Verify teacher can only see assigned classes/students and own staff profile.
  - Validation: backend compile and teacher smoke.
  - Dependencies: teacher portal tasks.

- [ ] TASK-RP-063: Tenant and Role Regression
  - Verify no cross-tenant data leak, sensitive data remains hidden, and school admin/super admin workflows are unaffected.
  - Validation: API smoke checks and frontend build.
  - Dependencies: all portal tasks.

## Phase 7 - Final Production Validation

- [ ] TASK-RP-070: Frontend Build and Visual Smoke
  - Run `npm run build`.
  - Smoke-test student, teacher, and parent dashboard routes on desktop and mobile widths.
  - Dependencies: all UI tasks.

- [ ] TASK-RP-071: Backend Compile and API Smoke
  - Run backend compile.
  - Smoke-test existing APIs and any new additive portal endpoints.
  - Dependencies: all backend tasks.

- [ ] TASK-RP-072: Master Plan Closeout
  - Update this plan with final status, validation log, limitations, and follow-up opportunities.
  - Dependencies: TASK-RP-070, TASK-RP-071.

## Next Task
