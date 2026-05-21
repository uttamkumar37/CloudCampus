# Analytics API

## Purpose
Tenant, school, report, public experience, and AI usage analytics.

## Detected Endpoints
| Method | Endpoint | Controller |
|---|---|---|
| `GET` | `/v1/public/branding` | `backend/src/main/java/com/cloudcampus/tenant/controller/BrandingController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/reports/performance` | `backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java` |
| `GET` | `/v1/school-admin/schools/{schoolId}/reports/performance/export` | `backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java` |
| `ANY` | `/v1/school-admin/schools/{schoolId}/reports/v1/school-admin/schools/{schoolId}/reports` | `backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java` |
| `GET` | `/v1/super-admin/analytics` | `backend/src/main/java/com/cloudcampus/reports/controller/AnalyticsController.java` |
| `ANY` | `/v1/super-admin/analytics/v1/super-admin/analytics` | `backend/src/main/java/com/cloudcampus/reports/controller/AnalyticsController.java` |
| `GET` | `/v1/super-admin/experience/analytics` | `backend/src/main/java/com/cloudcampus/experience/controller/SuperAdminExperienceController.java` |
| `GET` | `/v1/super-admin/public-website/analytics` | `backend/src/main/java/com/cloudcampus/experience/controller/SuperAdminPublicWebsiteController.java` |
| `GET` | `/v1/super-admin/tenant-analytics` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminAnalyticsController.java` |
| `GET` | `/v1/super-admin/tenants` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `POST` | `/v1/super-admin/tenants` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `GET` | `/v1/super-admin/tenants/stats` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `ANY` | `/v1/super-admin/tenants/v1/super-admin/tenants` | `backend/src/main/java/com/cloudcampus/reports/controller/SuperAdminReportController.java` |
| `ANY` | `/v1/super-admin/tenants/v1/super-admin/tenants` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `GET` | `/v1/super-admin/tenants/{id}` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `PATCH` | `/v1/super-admin/tenants/{id}/activate` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `GET` | `/v1/super-admin/tenants/{id}/config` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `PUT` | `/v1/super-admin/tenants/{id}/config/{key}` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `PATCH` | `/v1/super-admin/tenants/{id}/suspend` | `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java` |
| `GET` | `/v1/super-admin/tenants/{tenantId}/comparison` | `backend/src/main/java/com/cloudcampus/reports/controller/SuperAdminReportController.java` |


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
GET /v1/public/branding HTTP/1.1
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
