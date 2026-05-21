# Parent API

## Purpose
Parent/mobile child summary, notices, child attendance/results/homework/fees views.

## Detected Endpoints
| Method | Endpoint | Controller |
|---|---|---|
| `GET` | `/v1/mobile/notices` | `backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java` |
| `GET` | `/v1/mobile/notices/{id}` | `backend/src/main/java/com/cloudcampus/mobile/controller/MobileController.java` |
| `ANY` | `/v1/parent` | `backend/src/main/java/com/cloudcampus/mobile/controller/ParentController.java` |


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
GET /v1/mobile/notices HTTP/1.1
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
