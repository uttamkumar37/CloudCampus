# Fee API

## Purpose
Fee categories, structures, student fee records, receipt/PDF, Razorpay order creation, verification, and webhook handling.

## Detected Endpoints
| Method | Endpoint | Controller |
|---|---|---|
| `POST` | `/v1/payment/verify` | `backend/src/main/java/com/cloudcampus/payment/controller/PaymentController.java` |
| `POST` | `/v1/payment/webhooks/razorpay` | `backend/src/main/java/com/cloudcampus/payment/controller/PaymentController.java` |
| `GET` | `/v1/school-admin/application/pdf` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `PATCH` | `/v1/school-admin/fee-categories/{categoryId}/deactivate` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/fee-records/{recordId}` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/fee-records/{recordId}/invoice` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `POST` | `/v1/school-admin/fee-records/{recordId}/payment-order` | `backend/src/main/java/com/cloudcampus/payment/controller/PaymentController.java` |
| `POST` | `/v1/school-admin/fee-records/{recordId}/payments` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/fee-records/{recordId}/receipt` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `PATCH` | `/v1/school-admin/fee-records/{recordId}/waive` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/fee-categories` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/fee-categories` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/fee-records` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/fee-records` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/fee-structures` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `POST` | `/v1/school-admin/schools/{schoolId}/fee-structures` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/reports/fees` | `backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/reports/fees/export` | `backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java` |
| `ANY` | `/v1/school-admin/v1/school-admin` | `backend/src/main/java/com/cloudcampus/finance/controller/FeeController.java` |


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
POST /v1/payment/verify HTTP/1.1
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
