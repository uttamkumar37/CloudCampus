# Attendance Module

## Overview
Implemented: class attendance sessions, mark/report APIs, QR attendance, staff attendance, absence alert queueing.

## Business Purpose
Capture daily presence accurately and make absence signals available to dashboards, reports, and parent notification flows.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `attendance, staffattendance`.

## APIs
Detected endpoint method counts for related packages: ANY:2, GET:2, POST:2.
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
- `backend/src/main/java/com/cloudcampus/attendance/controller/AttendanceController.java`
- `backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/AttendanceRecordEntry.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/AttendanceRecordResponse.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/AttendanceSessionResponse.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/AttendanceSessionSummaryResponse.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/CreateSessionRequest.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/MarkAttendanceRequest.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/QrMarkRequest.java`
- `backend/src/main/java/com/cloudcampus/attendance/dto/StudentAttendanceReport.java`
- `backend/src/main/java/com/cloudcampus/attendance/entity/AttendanceRecord.java`
- `backend/src/main/java/com/cloudcampus/attendance/entity/AttendanceSession.java`
- `backend/src/main/java/com/cloudcampus/attendance/entity/AttendanceStatus.java`
- `backend/src/main/java/com/cloudcampus/attendance/repository/AttendanceRecordRepository.java`
- `backend/src/main/java/com/cloudcampus/attendance/repository/AttendanceSessionRepository.java`
- `backend/src/main/java/com/cloudcampus/attendance/service/AttendanceAlertService.java`
- `backend/src/main/java/com/cloudcampus/attendance/service/AttendanceAlertServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/attendance/service/AttendanceService.java`
- `backend/src/main/java/com/cloudcampus/attendance/service/AttendanceServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/attendance/service/QrAttendanceService.java`
- `backend/src/main/java/com/cloudcampus/staffattendance/controller/StaffAttendanceController.java`
- `backend/src/main/java/com/cloudcampus/staffattendance/dto/StaffAttendanceResponse.java`
- `backend/src/main/java/com/cloudcampus/staffattendance/entity/StaffAttendance.java`
- `backend/src/main/java/com/cloudcampus/staffattendance/entity/StaffAttendanceStatus.java`
- `backend/src/main/java/com/cloudcampus/staffattendance/repository/StaffAttendanceRepository.java`


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
