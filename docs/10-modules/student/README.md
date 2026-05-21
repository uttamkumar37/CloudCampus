# Student Module

## Overview
Implemented: admissions, profile, parent links, documents, self profile, fees, attendance, results, and Profile 360.

## Business Purpose
Maintain immutable academic identity and current operational state for each learner while preserving parent, document, fee, attendance, and achievement history.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `student`.

## APIs
Detected endpoint method counts for related packages: ANY:7, DELETE:2, GET:12, PATCH:4, POST:5, PUT:2.
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
- `backend/src/main/java/com/cloudcampus/student/controller/ParentLinkController.java`
- `backend/src/main/java/com/cloudcampus/student/controller/StudentAttendanceController.java`
- `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java`
- `backend/src/main/java/com/cloudcampus/student/controller/StudentDocumentController.java`
- `backend/src/main/java/com/cloudcampus/student/controller/StudentFeesController.java`
- `backend/src/main/java/com/cloudcampus/student/controller/StudentResultsController.java`
- `backend/src/main/java/com/cloudcampus/student/dto/AdmitStudentRequest.java`
- `backend/src/main/java/com/cloudcampus/student/dto/BulkImportResult.java`
- `backend/src/main/java/com/cloudcampus/student/dto/BulkStudentRow.java`
- `backend/src/main/java/com/cloudcampus/student/dto/ParentLinkRequest.java`
- `backend/src/main/java/com/cloudcampus/student/dto/ParentLinkResponse.java`
- `backend/src/main/java/com/cloudcampus/student/dto/PromotionResult.java`
- `backend/src/main/java/com/cloudcampus/student/dto/RowError.java`
- `backend/src/main/java/com/cloudcampus/student/dto/StudentDocumentResponse.java`
- `backend/src/main/java/com/cloudcampus/student/dto/StudentPromotionRequest.java`
- `backend/src/main/java/com/cloudcampus/student/dto/StudentResponse.java`
- `backend/src/main/java/com/cloudcampus/student/dto/StudentSummaryResponse.java`
- `backend/src/main/java/com/cloudcampus/student/dto/UpdateStudentRequest.java`
- `backend/src/main/java/com/cloudcampus/student/entity/Gender.java`
- `backend/src/main/java/com/cloudcampus/student/entity/Relationship.java`
- `backend/src/main/java/com/cloudcampus/student/entity/Student.java`
- `backend/src/main/java/com/cloudcampus/student/entity/StudentDocument.java`
- `backend/src/main/java/com/cloudcampus/student/entity/StudentParentLink.java`
- `backend/src/main/java/com/cloudcampus/student/entity/StudentStatus.java`
- `backend/src/main/java/com/cloudcampus/student/profile/controller/StudentProfile360Controller.java`
- ... 10 additional files omitted for focus


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
