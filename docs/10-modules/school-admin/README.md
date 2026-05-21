# School-Admin Module

## Overview
Implemented: academic setup, settings, staff, school access, departments, feature flags, and admin dashboard flows.

## Business Purpose
Operate one school inside one tenant: academic setup, users, staff, sections, fees, exams, attendance, notices, and website content.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `school, staff, staffattendance, leave, tenant, feature`.

## APIs
Detected endpoint method counts for related packages: ANY:7, DELETE:6, GET:32, PATCH:14, POST:13, PUT:8.
Use `docs/11-apis` and OpenAPI `/v3/api-docs` for full request/response schema.

## Validations
- Validate tenant ownership and school ownership before reads or writes.
- Validate state transitions in service layer.
- Validate DTO shape with Bean Validation or explicit service checks.

## RBAC
- Backend route and method RBAC are authoritative.
- Frontend/mobile role rendering is convenience only.

## Edge Cases
- Cross-tenant object id must not leak existence.
- Soft-deleted/inactive records must not appear in active lists unless requested.
- Retryable operations must be idempotent where external systems or queues are involved.

## Audit Rules
- Mutations must write audit events with actor, tenant, action, target, timestamp, and safe metadata.

## Lifecycle Handling
- Preserve history for academic, finance, attendance, student lifecycle, subscription, and published website state.

## Tenant Isolation
- All tenant-owned repositories must include tenant predicates.
- Async/event consumers must carry tenant context explicitly.

## Dependencies
- `backend/src/main/java/com/cloudcampus/school/controller/AcademicYearController.java`
- `backend/src/main/java/com/cloudcampus/school/controller/ClassRoomController.java`
- `backend/src/main/java/com/cloudcampus/school/controller/DepartmentController.java`
- `backend/src/main/java/com/cloudcampus/school/controller/SchoolAccessController.java`
- `backend/src/main/java/com/cloudcampus/school/controller/SchoolDashboardController.java`
- `backend/src/main/java/com/cloudcampus/school/controller/SchoolSettingsController.java`
- `backend/src/main/java/com/cloudcampus/school/controller/SectionController.java`
- `backend/src/main/java/com/cloudcampus/school/controller/SubjectController.java`
- `backend/src/main/java/com/cloudcampus/school/dto/AcademicYearRequest.java`
- `backend/src/main/java/com/cloudcampus/school/dto/AcademicYearResponse.java`
- `backend/src/main/java/com/cloudcampus/school/dto/ClassRoomRequest.java`
- `backend/src/main/java/com/cloudcampus/school/dto/ClassRoomResponse.java`
- `backend/src/main/java/com/cloudcampus/school/dto/DepartmentRequest.java`
- `backend/src/main/java/com/cloudcampus/school/dto/DepartmentResponse.java`
- `backend/src/main/java/com/cloudcampus/school/dto/GrantSchoolAccessRequest.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SchoolAccessResponse.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SchoolSettingsRequest.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SchoolSettingsResponse.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SectionRequest.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SectionResponse.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SubjectRequest.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SubjectResponse.java`
- `backend/src/main/java/com/cloudcampus/school/dto/SwitchSchoolResponse.java`
- `backend/src/main/java/com/cloudcampus/school/entity/AcademicCalendarType.java`
- `backend/src/main/java/com/cloudcampus/school/entity/AcademicYear.java`
- ... 84 additional files omitted for focus


## UI Behavior
- Frontend feature folders and mobile screens must call backend APIs through shared API clients.
- UI must handle loading, empty, validation, forbidden, and tenant-suspended states.

## Event Flow
- Use queues/events for notifications, analytics, and async audit work.
- Do not perform long external dispatch on request threads.

## Security Concerns
- No raw UUIDs as user-facing labels.
- No PII/secrets in logs, public analytics, AI prompts, or audit metadata.

## Future Scalability
- Add pagination for large lists.
- Add indexes matching tenant-scoped filters.
- Add queue-based processing for long-running exports/imports.
