# Exam Module

## Overview
Implemented: exams, exam subjects, marks, results, report cards.

## Business Purpose
Define assessments, collect subject marks, calculate results, and produce report-card level outputs.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `exam`.

## APIs
Detected endpoint method counts for related packages: ANY:3, DELETE:2, GET:5, PATCH:1, POST:4, PUT:1.
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
- `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java`
- `backend/src/main/java/com/cloudcampus/exam/controller/MarksController.java`
- `backend/src/main/java/com/cloudcampus/exam/controller/ResultController.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/BulkMarksEntryRequest.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/ExamCreateRequest.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/ExamResponse.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/ExamResultResponse.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/ExamStatusUpdateRequest.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/ExamSubjectRequest.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/ExamSubjectResponse.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/MarksEntryRequest.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/StudentMarkResponse.java`
- `backend/src/main/java/com/cloudcampus/exam/dto/SubjectResultLine.java`
- `backend/src/main/java/com/cloudcampus/exam/entity/Exam.java`
- `backend/src/main/java/com/cloudcampus/exam/entity/ExamResult.java`
- `backend/src/main/java/com/cloudcampus/exam/entity/ExamStatus.java`
- `backend/src/main/java/com/cloudcampus/exam/entity/ExamSubject.java`
- `backend/src/main/java/com/cloudcampus/exam/entity/ExamType.java`
- `backend/src/main/java/com/cloudcampus/exam/entity/StudentMark.java`
- `backend/src/main/java/com/cloudcampus/exam/repository/ExamRepository.java`
- `backend/src/main/java/com/cloudcampus/exam/repository/ExamResultRepository.java`
- `backend/src/main/java/com/cloudcampus/exam/repository/ExamSubjectRepository.java`
- `backend/src/main/java/com/cloudcampus/exam/repository/StudentMarkRepository.java`
- `backend/src/main/java/com/cloudcampus/exam/service/ExamService.java`
- `backend/src/main/java/com/cloudcampus/exam/service/ExamServiceImpl.java`
- ... 4 additional files omitted for focus


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
