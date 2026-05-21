# Exams API

## Purpose
Exam definition, subject entries, marks entry, results, report cards, and student result views.

## Detected Endpoints
| Method | Endpoint | Controller |
|---|---|---|
| `GET` | `/v1/school-admin/schools/{schoolId}/exams` | `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/exams` | `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java` |
| `ANY` | `/v1/school-admin/schools/{schoolId}/exams/v1/school-admin/schools/{schoolId}/exams` | `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/exams/{examId}` | `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/results` | `backend/src/main/java/com/cloudcampus/exam/controller/ResultController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/results/generate` | `backend/src/main/java/com/cloudcampus/exam/controller/ResultController.java` |
| `ANY` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/results/v1/school-admin/schools/{schoolId}/exams/{examId}/results` | `backend/src/main/java/com/cloudcampus/exam/controller/ResultController.java` |
| `PATCH` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/status` | `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects` | `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java` |
| `DELETE` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{entryId}` | `backend/src/main/java/com/cloudcampus/exam/controller/ExamController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks` | `backend/src/main/java/com/cloudcampus/exam/controller/MarksController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/bulk` | `backend/src/main/java/com/cloudcampus/exam/controller/MarksController.java` |
| `ANY` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks` | `backend/src/main/java/com/cloudcampus/exam/controller/MarksController.java` |
| `DELETE` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/{markId}` | `backend/src/main/java/com/cloudcampus/exam/controller/MarksController.java` |
| `PUT` | `/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/{markId}` | `backend/src/main/java/com/cloudcampus/exam/controller/MarksController.java` |


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
GET /v1/school-admin/schools/{schoolId}/exams HTTP/1.1
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
