# Student API

## Purpose
School-admin student operations plus student self-service profile, documents, homework, assignments, attendance, results, and fees.

## Detected Endpoints
| Method | Endpoint | Controller |
|---|---|---|
| `GET` | `/v1/school-admin/classes/{classId}/students` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/results/students/{studentId}` | `backend/src/main/java/com/cloudcampus/exam/controller/ResultController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/students` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/students` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/students/bulk` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/students/promote` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/students/{studentId}/documents` | `backend/src/main/java/com/cloudcampus/student/controller/StudentDocumentController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/students/{studentId}/documents` | `backend/src/main/java/com/cloudcampus/student/controller/StudentDocumentController.java` |
| `ANY` | `/v1/school-admin/schools/{schoolId}/students/{studentId}/documents/v1/school-admin/schools/{schoolId}/students/{studentId}/documents` | `backend/src/main/java/com/cloudcampus/student/controller/StudentDocumentController.java` |
| `DELETE` | `/v1/school-admin/schools/{schoolId}/students/{studentId}/documents/{documentId}` | `backend/src/main/java/com/cloudcampus/student/controller/StudentDocumentController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/students/{studentId}/documents/{documentId}/url` | `backend/src/main/java/com/cloudcampus/student/controller/StudentDocumentController.java` |
| `GET` | `/v1/school-admin/sections/{sectionId}/students` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `DELETE` | `/v1/school-admin/student-parent-links/{linkId}` | `backend/src/main/java/com/cloudcampus/student/controller/ParentLinkController.java` |
| `GET` | `/v1/school-admin/students/{id}` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `PUT` | `/v1/school-admin/students/{id}` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `PATCH` | `/v1/school-admin/students/{id}/graduate` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `PATCH` | `/v1/school-admin/students/{id}/reinstate` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `PATCH` | `/v1/school-admin/students/{id}/suspend` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `PATCH` | `/v1/school-admin/students/{id}/transfer` | `backend/src/main/java/com/cloudcampus/student/controller/StudentController.java` |
| `GET` | `/v1/school-admin/students/{studentId}/fee-records` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/students/{studentId}/parents` | `backend/src/main/java/com/cloudcampus/student/controller/ParentLinkController.java` |
| `POST` | `/v1/school-admin/students/{studentId}/parents` | `backend/src/main/java/com/cloudcampus/student/controller/ParentLinkController.java` |
| `GET` | `/v1/school-admin/students/{studentId}/profile-360` | `backend/src/main/java/com/cloudcampus/student/profile/controller/StudentProfile360Controller.java` |
| `PUT` | `/v1/school-admin/students/{studentId}/profile-360/sections/{sectionKey}` | `backend/src/main/java/com/cloudcampus/student/profile/controller/StudentProfile360Controller.java` |
| `ANY` | `/v1/school-admin/students/{studentId}/profile-360/v1/school-admin/students/{studentId}/profile-360` | `backend/src/main/java/com/cloudcampus/student/profile/controller/StudentProfile360Controller.java` |
| `ANY` | `/v1/school-admin/v1/school-admin` | `backend/src/main/java/com/cloudcampus/student/controller/ParentLinkController.java` |
| `GET` | `/v1/student/assignments` | `backend/src/main/java/com/cloudcampus/assignment/controller/StudentAssignmentController.java` |
| `ANY` | `/v1/student/assignments/v1/student/assignments` | `backend/src/main/java/com/cloudcampus/assignment/controller/StudentAssignmentController.java` |
| `POST` | `/v1/student/assignments/{assignmentId}/submit` | `backend/src/main/java/com/cloudcampus/assignment/controller/StudentAssignmentController.java` |
| `GET` | `/v1/student/attendance` | `backend/src/main/java/com/cloudcampus/student/controller/StudentAttendanceController.java` |
| `POST` | `/v1/student/attendance/qr-mark` | `backend/src/main/java/com/cloudcampus/attendance/controller/QrAttendanceController.java` |
| `ANY` | `/v1/student/attendance/v1/student/attendance` | `backend/src/main/java/com/cloudcampus/student/controller/StudentAttendanceController.java` |
| `POST` | `/v1/student/fee-records/{recordId}/payment-order` | `backend/src/main/java/com/cloudcampus/payment/controller/PaymentController.java` |
| `GET` | `/v1/student/fees` | `backend/src/main/java/com/cloudcampus/student/controller/StudentFeesController.java` |
| `ANY` | `/v1/student/fees/v1/student/fees` | `backend/src/main/java/com/cloudcampus/student/controller/StudentFeesController.java` |
| `GET` | `/v1/student/homework` | `backend/src/main/java/com/cloudcampus/homework/controller/StudentHomeworkController.java` |
| `ANY` | `/v1/student/homework/v1/student/homework` | `backend/src/main/java/com/cloudcampus/homework/controller/StudentHomeworkController.java` |
| `POST` | `/v1/student/homework/{homeworkId}/submit` | `backend/src/main/java/com/cloudcampus/homework/controller/StudentHomeworkController.java` |
| `GET` | `/v1/student/online-classes` | `backend/src/main/java/com/cloudcampus/onlineclass/controller/OnlineClassController.java` |
| `GET` | `/v1/student/profile-360` | `backend/src/main/java/com/cloudcampus/student/profile/controller/StudentSelfProfile360Controller.java` |
| `ANY` | `/v1/student/profile-360/v1/student/profile-360` | `backend/src/main/java/com/cloudcampus/student/profile/controller/StudentSelfProfile360Controller.java` |
| `GET` | `/v1/student/results` | `backend/src/main/java/com/cloudcampus/student/controller/StudentResultsController.java` |
| `ANY` | `/v1/student/results/v1/student/results` | `backend/src/main/java/com/cloudcampus/student/controller/StudentResultsController.java` |
| `GET` | `/v1/student/timetable` | `backend/src/main/java/com/cloudcampus/timetable/controller/StudentTimetableController.java` |
| `GET` | `/v1/student/videos` | `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java` |
| `GET` | `/v1/student/videos/{videoId}` | `backend/src/main/java/com/cloudcampus/video/controller/VideoController.java` |
| `GET` | `/v1/teacher/attendance/students` | `backend/src/main/java/com/cloudcampus/teacher/controller/TeacherAttendanceController.java` |


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
GET /v1/school-admin/classes/{classId}/students HTTP/1.1
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
