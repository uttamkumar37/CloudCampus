# Teacher Module

## Overview
Implemented: teacher dashboard, timetable, homework, assignments, attendance, leave, lesson plan, online class, and video resource flows.

## Business Purpose
Give teachers role-safe access to assigned academic work and classroom operations without exposing school-admin configuration surfaces.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `teacher, lessonplan, onlineclass, video, homework, assignment`.

## APIs
Detected endpoint method counts for related packages: ANY:8, DELETE:5, GET:22, PATCH:7, POST:12, PUT:1.
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
- `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherAttendanceController.java`
- `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherDashboardController.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/controller/LessonPlanController.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/dto/LessonPlanRequest.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/dto/LessonPlanResponse.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/entity/LessonPlan.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/entity/LessonPlanStatus.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/repository/LessonPlanRepository.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/service/LessonPlanService.java`
- `backend/src/main/java/com/cloudcampus/lessonplan/service/LessonPlanServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/dto/OnlineClassRequest.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/dto/OnlineClassResponse.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/entity/MeetingPlatform.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/entity/OnlineClass.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/entity/OnlineClassStatus.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/repository/OnlineClassRepository.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/service/OnlineClassService.java`
- `backend/src/main/java/com/cloudcampus/onlineclass/service/OnlineClassServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java`
- `backend/src/main/java/com/cloudcampus/video/dto/VideoResponse.java`
- `backend/src/main/java/com/cloudcampus/video/dto/VideoUploadRequest.java`
- `backend/src/main/java/com/cloudcampus/video/entity/VideoResource.java`
- `backend/src/main/java/com/cloudcampus/video/entity/VideoUploadStatus.java`
- `backend/src/main/java/com/cloudcampus/video/entity/VideoVisibility.java`
- ... 35 additional files omitted for focus


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
