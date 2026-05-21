# Teacher API

## Purpose
Teacher dashboard, timetable, attendance, homework/assignment review, leave, lesson plans, online classes, and video resources.

## Detected Endpoints
| Method | Endpoint | Controller |
|---|---|---|
| `GET` | `/v1/school-admin/lesson-plans` | `backend/src/main/java/com/cloudcampus/lessonplan/controller/LessonPlanController.java` |
| `GET` | `/v1/school-admin/online-classes` | `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java` |
| `GET` | `/v1/school-admin/videos` | `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java` |
| `GET` | `/v1/teacher/assignments` | `backend/src/main/java/com/cloudcampus/assignment/controller/TeacherAssignmentController.java` |
| `ANY` | `/v1/teacher/assignments/v1/teacher/assignments` | `backend/src/main/java/com/cloudcampus/assignment/controller/TeacherAssignmentController.java` |
| `GET` | `/v1/teacher/assignments/{assignmentId}/submissions` | `backend/src/main/java/com/cloudcampus/assignment/controller/TeacherAssignmentController.java` |
| `PATCH` | `/v1/teacher/assignments/{assignmentId}/submissions/{subId}/grade` | `backend/src/main/java/com/cloudcampus/assignment/controller/TeacherAssignmentController.java` |
| `POST` | `/v1/teacher/attendance/sessions` | `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherAttendanceController.java` |
| `POST` | `/v1/teacher/attendance/sessions/with-qr` | `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherAttendanceController.java` |
| `POST` | `/v1/teacher/attendance/sessions/{sessionId}/qr` | `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherAttendanceController.java` |
| `ANY` | `/v1/teacher/attendance/v1/teacher/attendance` | `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherAttendanceController.java` |
| `GET` | `/v1/teacher/dashboard` | `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherDashboardController.java` |
| `ANY` | `/v1/teacher/dashboard/v1/teacher/dashboard` | `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherDashboardController.java` |
| `GET` | `/v1/teacher/homework` | `backend/src/main/java/com/cloudcampus/homework/controller/TeacherHomeworkController.java` |
| `ANY` | `/v1/teacher/homework/v1/teacher/homework` | `backend/src/main/java/com/cloudcampus/homework/controller/TeacherHomeworkController.java` |
| `GET` | `/v1/teacher/homework/{homeworkId}/submissions` | `backend/src/main/java/com/cloudcampus/homework/controller/TeacherHomeworkController.java` |
| `PATCH` | `/v1/teacher/homework/{homeworkId}/submissions/{subId}/review` | `backend/src/main/java/com/cloudcampus/homework/controller/TeacherHomeworkController.java` |
| `GET` | `/v1/teacher/leave` | `backend/src/main/java/com/cloudcampus/leave/controller/StaffLeaveController.java` |
| `POST` | `/v1/teacher/leave` | `backend/src/main/java/com/cloudcampus/leave/controller/StaffLeaveController.java` |
| `ANY` | `/v1/teacher/leave/v1/teacher/leave` | `backend/src/main/java/com/cloudcampus/leave/controller/StaffLeaveController.java` |
| `DELETE` | `/v1/teacher/leave/{id}` | `backend/src/main/java/com/cloudcampus/leave/controller/StaffLeaveController.java` |
| `GET` | `/v1/teacher/lesson-plans` | `backend/src/main/java/com/cloudcampus/lessonplan/controller/LessonPlanController.java` |
| `POST` | `/v1/teacher/lesson-plans` | `backend/src/main/java/com/cloudcampus/lessonplan/controller/LessonPlanController.java` |
| `DELETE` | `/v1/teacher/lesson-plans/{planId}` | `backend/src/main/java/com/cloudcampus/lessonplan/controller/LessonPlanController.java` |
| `PUT` | `/v1/teacher/lesson-plans/{planId}` | `backend/src/main/java/com/cloudcampus/lessonplan/controller/LessonPlanController.java` |
| `POST` | `/v1/teacher/lesson-plans/{planId}/publish` | `backend/src/main/java/com/cloudcampus/lessonplan/controller/LessonPlanController.java` |
| `GET` | `/v1/teacher/online-classes` | `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java` |
| `POST` | `/v1/teacher/online-classes` | `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java` |
| `DELETE` | `/v1/teacher/online-classes/{classId}` | `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java` |
| `PATCH` | `/v1/teacher/online-classes/{classId}/recording` | `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java` |
| `PATCH` | `/v1/teacher/online-classes/{classId}/status` | `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java` |
| `GET` | `/v1/teacher/timetable` | `backend/src/main/java/com/cloudcampus/timetable/controller/TeacherTimetableController.java` |
| `ANY` | `/v1/teacher/timetable/v1/teacher/timetable` | `backend/src/main/java/com/cloudcampus/timetable/controller/TeacherTimetableController.java` |
| `GET` | `/v1/teacher/videos` | `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java` |
| `POST` | `/v1/teacher/videos/initiate` | `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java` |
| `DELETE` | `/v1/teacher/videos/{videoId}` | `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java` |
| `POST` | `/v1/teacher/videos/{videoId}/confirm` | `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java` |


## Common API Contract
- Envelope: controllers return `ApiResponse<T>` or a Spring `ResponseEntity` carrying the same success/error shape.
- Authentication: protected APIs require `Authorization: Bearer <accessToken>`.
- Tenant handling: authenticated APIs must derive tenant from JWT/`RequestContext`; `X-Tenant-Id` is informational and never sufficient for authorization.
- RBAC: route-level checks live in `SecurityConfig`; sensitive methods add `@PreAuthorize` at controller level.
- Validation: request DTOs should use Bean Validation and service-level domain checks for cross-entity ownership.
- DB impact: repositories must query by `tenantId` for tenant-owned data, usually with `findBy...AndTenantId` methods.
- Error responses: `RestExceptionHandler` maps not found, bad request, conflict, forbidden, tenant suspended, rate-limit, storage, usage-limit, and validation errors.
- Audit logging: every mutation should create an audit event. Current implementation has strong coverage in auth, profile, uploads, retention, website/investor-room, and selected operational flows; new mutations must close gaps rather than copy missing-audit patterns.
- Rate limiting: public/auth/AI limits use Redis-backed counters. New public endpoints must choose an explicit limit profile.
- Security concerns: never expose internal UUIDs as user-facing labels; never trust client-supplied school or tenant ids without ownership checks.


## Request Example
```http
GET /v1/school-admin/lesson-plans HTTP/1.1
Authorization: Bearer <accessToken>
Accept: application/json
```

## Response Example
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Error Responses
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed"
  }
}
```

## Frontend Usage
- Web clients use `frontend/src/shared/api/axiosInstance.ts` and feature API modules.
- Mobile clients use `mobile/src/api/client.ts`.

## Security Notes
- Validate role, tenant, school, and entity ownership in backend.
- Treat all ids in path/body as untrusted lookup hints.
