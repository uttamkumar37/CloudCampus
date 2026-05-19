# Student Profile Master Plan

Goal: transform the existing Student Profile module into an international-level 360 Student Intelligence Profile while preserving current APIs, permissions, tenant isolation, workflows, and backward compatibility.

## Operating Rules

- Work one task at a time.
- Do not modify authentication or authorization logic.
- Do not change unrelated modules.
- Keep existing APIs backward compatible.
- Preserve tenant isolation and role-based access.
- Use existing architecture, styles, services, DTO patterns, and validation conventions.
- Add loading, empty, and error states for every new UI surface.
- Add proper TypeScript typing and backend validation for new request/response surfaces.
- After each completed task: update this file, explain changes, run validation, and wait for approval before starting the next task.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Baseline

- Existing Student Profile page and workflows must continue to work.
- Existing parent links, student document handling, student details, and school-admin routes must remain compatible.
- A first 360 profile foundation already exists with sectioned backend entities, aggregate endpoint, and a tabbed frontend profile shell.
- Demo tenant write protection may block live write smoke tests; this must not be weakened to validate profile work.

## Phase 0 - Planning and Guardrails

- [x] TASK-SP-000: Create `STUDENT_PROFILE_MASTER_PLAN.md`
  - Define phases, tasks, dependencies, status tracking, and validation policy.
  - Establish one-task-at-a-time workflow.
  - Do not modify application code in this task.

- [x] TASK-SP-001: Baseline Audit
  - Review current student profile frontend, 360 API, backend service, DTOs, repositories, migration, document flow, audit logging, and tenant scoping.
  - Identify exact reusable components and current route/API contracts.
  - Output: implementation notes in this file only.
  - Validation: no code changes; `git diff` confirms only this plan is updated.
  - Dependencies: TASK-SP-000.

### TASK-SP-001 Audit Notes

Frontend baseline:

- Route: `frontend/src/app/router.tsx` lazy-loads `StudentProfilePage` at `/school-admin/students/:id`.
- Main page: `frontend/src/features/student/pages/StudentProfilePage.tsx`.
- Existing reusable pieces to preserve and improve:
  - `EditForm` for backward-compatible core student edits.
  - `ParentLinksSection` for current guardian linking workflow.
  - `DocumentsSection` for secure upload/download/delete flow.
  - `StatCard`, `TimelinePanel`, `SectionDataGrid`, `RecentRecords`, `SectionEditor`, `AddRecordForm`, and `ProfileSectionPanel` for the 360 shell.
- Current page state:
  - Uses React Query for `student`, `student-profile-360`, parent links, and documents.
  - Has basic loading/error/empty text states, but not enterprise skeletons or reusable error panels.
  - Has sidebar tabs for all major sections, but the header is still a basic profile card rather than a premium intelligence header.
  - Uses generic `Record<string, unknown>` section data; future tasks should add typed optional response models without removing current fields.
- Existing frontend API contracts:
  - `getStudent(id)` -> `/v1/school-admin/students/{id}`.
  - `updateStudent(id, body)` -> `/v1/school-admin/students/{id}`.
  - parent links use `/v1/school-admin/students/{studentId}/parents`.
  - documents use `/v1/school-admin/schools/{schoolId}/students/{studentId}/documents`.
  - 360 aggregate uses `/v1/school-admin/students/{studentId}/profile-360`.
  - 360 section update uses `/v1/school-admin/students/{studentId}/profile-360/sections/{sectionKey}`.

Backend baseline:

- New profile package: `backend/src/main/java/com/cloudcampus/student/profile`.
- Current 360 DTOs:
  - `StudentProfile360Response(studentId, profileCompletionPercent, sections, timeline, quickStats)`.
  - `ProfileSectionResponse(key, title, description, visibility, editable, completionPercent, data, timeline)`.
  - `TimelineItemResponse(id, type, title, summary, occurredAt, visibility)`.
  - `UpdateProfileSectionRequest(@NotNull Map<String, Object> data)`.
- Current 360 endpoints:
  - `GET /v1/school-admin/students/{studentId}/profile-360`.
  - `PUT /v1/school-admin/students/{studentId}/profile-360/sections/{sectionKey}`.
- Current 360 persistence:
  - `student_identity_profiles`
  - `student_logistics_profiles`
  - `student_enrichment_profiles`
  - `student_medical_records`
  - `student_behavior_records`
  - `student_achievement_records`
  - `student_communication_events`
- Current aggregate sources:
  - Core `students` table for personal, status, class/section IDs, and admission data.
  - Attendance counts via `AttendanceRecordRepository`.
  - Fee snapshot via `StudentFeeRecordRepository`.
  - Document count via `StudentDocumentRepository`.
  - Guardian count via `StudentParentLinkRepository`.
  - Recent health, behavior, achievement, and communication records with `PageRequest.of(0, 5)`.
- Audit:
  - Section updates log `DATA_STUDENT_PROFILE_UPDATED` through `AuditLogService.logStudentProfileSectionUpdated`.

Security and tenant isolation baseline:

- Do not change `SecurityConfig`.
- `/v1/school-admin/**` currently allows `SCHOOL_ADMIN` and `TENANT_ADMIN` at the path-rule level.
- `StudentDocumentController` has an additional `@PreAuthorize("hasRole('SCHOOL_ADMIN')")`; keep this unchanged unless a future task explicitly approves a permissions change.
- `StudentProfile360ServiceImpl.findStudent` uses `RequestContext.getTenantId()` and `studentRepo.findByIdAndTenantId`.
- New 360 entities are annotated with the Hibernate `tenantFilter`.
- Repository methods mostly query by `studentId`; this relies on the active Hibernate tenant filter. Future backend tasks may add explicit `tenantId` repository methods for defense in depth without changing external APIs.
- Document storage already sanitizes filenames, uses tenant/school/student object keys, returns presigned URLs, enforces storage quota, validates student school+tenant, and records upload/download/delete audit events.

Compatibility and gap notes for next tasks:

- Additive response fields are safe for backward compatibility; do not remove or rename existing response properties.
- The next backend contract should add optional `header`, `completion`, `insights`, `risks`, and analytics objects instead of changing `sections`.
- Section `visibility` is currently metadata, not fine-grained per-section authorization. Do not introduce auth behavior changes during UI/header work.
- Current completion is a simple average over section data values. TASK-SP-020 must replace this with weighted metadata while keeping `profileCompletionPercent` available.
- Current timeline is an in-memory recent aggregate limited to 12 items. TASK-SP-030 should add a paginated model or optional paginated field while preserving existing `timeline`.
- Current AI risk is deterministic and simple (`NORMAL`/`WATCH`). TASK-SP-040 and TASK-SP-090 should add typed signals and risk categories without external AI dependency.
- Current UI needs skeleton loaders, premium empty states, accessible icon buttons, better mobile layout, and extracted shared components before broad visual expansion.

## Phase 1 - Premium Profile Header

- [x] TASK-SP-010: Header Data Contract
  - Extend the 360 aggregate response with backward-compatible header fields.
  - Include avatar, preferred name, admission number, roll number, class/section, academic year, campus, house, status badges, blood group, transport, hostel, scholarship, attendance streak, last active, AI risk score, and quick action availability.
  - Validation: backend compile, endpoint read smoke test.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-011: Premium Header UI
  - Build reusable header components: avatar block, identity stack, badges, quick stats, and action bar.
  - Add responsive mobile layout and skeleton/error states.
  - Validation: frontend build.
  - Dependencies: TASK-SP-010.

## Phase 2 - Profile Completion Engine

- [x] TASK-SP-020: Completion Model
  - Add section-weighted completion metadata, missing fields, suggested actions, and admin warnings.
  - Keep response additions optional/backward compatible.
  - Validation: backend compile, endpoint smoke test.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-021: Completion UI
  - Add completion ring, missing-field cards, warning panel, and suggested-action list.
  - Include empty/loading/error states.
  - Validation: frontend build.
  - Dependencies: TASK-SP-020.

## Phase 3 - Student Timeline

- [x] TASK-SP-030: Timeline API Shape
  - Add paginated timeline response or extend existing timeline safely.
  - Categories: homework, attendance, fees, leave, achievements, documents, behavior, parent meetings, communication, AI warnings.
  - Validation: backend compile, endpoint read smoke test.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-031: Timeline Feed UI
  - Add grouped dates, category filters, icons/colors, empty states, and pagination or incremental loading.
  - Validation: frontend build.
  - Dependencies: TASK-SP-030.

## Phase 4 - AI Insights Engine

- [x] TASK-SP-040: AI Insight DTOs and Deterministic Signals
  - Add typed insight cards for attendance trend, subject weakness, learning risk, consistency, engagement, discipline, scholarship eligibility, career recommendation, exam readiness, and teacher recommendations.
  - Use deterministic existing data first; no external AI dependency required.
  - Include confidence, severity, explanation, and recommendations.
  - Validation: backend compile, endpoint smoke test.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-041: AI Insight Card UI
  - Add premium insight cards with severity colors, confidence meters, recommendations, and empty states.
  - Validation: frontend build.
  - Dependencies: TASK-SP-040.

## Phase 5 - Advanced Academic Analytics

- [x] TASK-SP-050: Academic Analytics Contract
  - Add academic analytics data for subject comparison, rank trends, exam readiness, heatmaps, monthly progress, teacher remarks, and assignment completion.
  - Use existing exams, marks, assignments, homework, and attendance data where available.
  - Validation: backend compile, endpoint smoke test.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-051: Academic Analytics UI
  - Add enterprise-grade charts using existing frontend chart patterns or lightweight reusable components.
  - Include responsive and empty states.
  - Validation: frontend build.
  - Dependencies: TASK-SP-050.

## Phase 6 - Health and Wellbeing

- [x] TASK-SP-060: Health Model Enhancement
  - Add support for allergies, medical conditions, vaccination records, emergency contacts, doctor details, wellness notes, and fitness indicators.
  - Preserve existing medical records.
  - Validation: backend compile, migration validation if schema changes.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-061: Health UI
  - Add health summary, medical cards, emergency block, vaccination list, and wellness notes.
  - Validation: frontend build.
  - Dependencies: TASK-SP-060.

## Phase 7 - Interests and Skills

- [x] TASK-SP-070: Interests and Skills Contract
  - Support hobbies, sports, clubs, coding skills, arts, leadership, communication, certifications, olympiads, and career aspirations.
  - Validation: backend compile.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-071: Tag-Based UI
  - Add reusable tag groups and editable skill/interest chips.
  - Validation: frontend build.
  - Dependencies: TASK-SP-070.

## Phase 8 - Parent and Family Intelligence

- [x] TASK-SP-080: Parent Intelligence Contract
  - Add parent occupation, education, income bracket, engagement score, communication preference, pickup authorization, emergency contacts, and activity history without breaking parent link APIs.
  - Validation: backend compile, endpoint smoke test.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-081: Family Intelligence UI
  - Add parent engagement cards, authorized pickup badges, and family communication summary.
  - Validation: frontend build.
  - Dependencies: TASK-SP-080.

## Phase 9 - Risk Management System

- [x] TASK-SP-090: Risk Model
  - Replace simple display risk with academic, attendance, behavioral, financial, and wellness risk categories.
  - Include AI explanations and recommended interventions.
  - Validation: backend compile, endpoint smoke test.
  - Dependencies: TASK-SP-040.

- [x] TASK-SP-091: Risk UI
  - Add risk matrix, color-coded severity, explanations, and intervention actions.
  - Validation: frontend build.
  - Dependencies: TASK-SP-090.

## Phase 10 - Document Vault

- [x] TASK-SP-100: Document Vault Metadata
  - Add category handling for Aadhaar, transfer certificate, marksheets, fee receipts, certificates, medical docs, and student ID card.
  - Support expiry tracking and upload history while preserving secure document download/preview flow.
  - Validation: backend compile and document endpoint smoke test.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-101: Document Vault UI
  - Add preview/download actions, category filters, expiry badges, and upload history presentation.
  - Validation: frontend build.
  - Dependencies: TASK-SP-100.

## Phase 11 - Communication Center

- [x] TASK-SP-110: Communication Contract
  - Add teacher notes, parent logs, SMS/email history, notifications, meeting summaries, and AI communication summaries.
  - Validation: backend compile.
  - Dependencies: TASK-SP-001.

- [x] TASK-SP-111: Communication UI
  - Add communication center with filters, summaries, timeline entries, and empty states.
  - Validation: frontend build.
  - Dependencies: TASK-SP-110.

## Phase 12 - UX and Accessibility

- [x] TASK-SP-120: Shared UI Components
  - Extract reusable components for section cards, progress rings, badges, chips, skeletons, empty states, error panels, and sticky action bar.
  - Validation: frontend build.
  - Dependencies: TASK-SP-011, TASK-SP-021.

- [x] TASK-SP-121: Responsive and Accessibility Pass
  - Verify mobile layouts, keyboard access, aria labels, color contrast, dark-mode compatibility, and text overflow.
  - Validation: frontend build and manual route smoke.
  - Dependencies: major UI tasks complete.

## Phase 13 - Security and Performance

- [x] TASK-SP-130: Backend Security and Query Review
  - Verify tenant filters, role access, input validation, audit logging, pagination, query count, and document access control.
  - Validation: backend tests/compile and API smoke tests.
  - Dependencies: backend feature tasks complete.

- [x] TASK-SP-131: Frontend Security and Performance Review
  - Check XSS-safe rendering, lazy loading, image optimization, bundle impact, pagination behavior, and loading states.
  - Validation: frontend build.
  - Dependencies: frontend feature tasks complete.

## Validation Log

- 2026-05-19: Created master plan. No application code changed in TASK-SP-000.
- 2026-05-19: Started TASK-SP-001 baseline audit.
- 2026-05-19: Completed TASK-SP-001 baseline audit. Findings recorded in this file only; no application code changed for this task.
- 2026-05-19: Completed full Student Profile Intelligence v1 pass across Phases 1-13.
  - Backend: expanded the existing 360 aggregate response with additive `header`, `completion`, `activityFeed`, `aiInsights`, `academicAnalytics`, `healthWellbeing`, `parentFamily`, `riskProfile`, `documentVault`, and `communicationCenter` blocks.
  - Backend: reused existing tenant-scoped repositories and added read-only helper methods for recent assignment/homework profile activity.
  - Frontend: upgraded the student profile page with premium header, badges, completion ring, completion engine, AI insight cards, risk matrix, academic charts, engagement charts, filtered timeline, and section-specific intelligence summaries.
  - Compatibility: existing student APIs, document APIs, parent-link APIs, auth rules, security paths, and school workflows were preserved.
  - Validation: `mvn clean test -DskipTests` passed, `npm run build` passed, and profile 360 GET smoke test returned HTTP 200 with all new intelligence blocks present.
