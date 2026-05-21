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
- After each finished task: update this file, explain changes, run validation, and wait for approval before starting the next task.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[!]` Blocked

## Current Baseline

- Existing Student Profile page and workflows must continue to work.
- Existing parent links, student document handling, student details, and school-admin routes must remain compatible.
- A first 360 profile foundation already exists with sectioned backend entities, aggregate endpoint, and a tabbed frontend profile shell.
- Demo tenant write protection may block live write smoke tests; this must not be weakened to validate profile work.

## Phase 0 - Planning and Guardrails

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

## Phase 2 - Profile Completion Engine

## Phase 3 - Student Timeline

## Phase 4 - AI Insights Engine

## Phase 5 - Advanced Academic Analytics

## Phase 6 - Health and Wellbeing

## Phase 7 - Interests and Skills

## Phase 8 - Parent and Family Intelligence

## Phase 9 - Risk Management System

## Phase 10 - Document Vault

## Phase 11 - Communication Center

## Phase 12 - UX and Accessibility

## Phase 13 - Security and Performance
