<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Notification API

Status: CURRENT_IMPLEMENTED for discovered controllers; NOT_FOUND_IN_CODEBASE for planned/missing cards.

| Method | Endpoint | Module | Roles | Frontend caller | Status |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/super-admin/notifications/deliveries/{deliveryId} | Notification | SUPER_ADMIN | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/notifications/deliveries | Notification | SUPER_ADMIN | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/notifications/summary | Notification | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |

# GET /v1/super-admin/notifications/deliveries/{deliveryId}

## Summary
- Purpose: Read notification delivery summary/list/detail.
- Current status: CURRENT_IMPLEMENTED
- Module: Notification
- Role audience: SUPER_ADMIN
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method notificationDelivery
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_NOTIFICATIONS
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: platform
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: No
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | Yes | Bearer <access-token> | JWT issued by auth flow. |
| Content-Type | No | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| deliveryId | string | Yes | Must exist and be accessible in scope | deliveryId-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| page | integer | No | 0 | service-specific | >= 0 | 0 | Broad lists use page where implemented. |
| size | integer | No | 25 or 50 | service-specific | > 0 | 50 | UI often uses fixed page sizes for broad lists. |
| search/q | string | No | none | service-specific | trimmed | alpha | Search support is endpoint-specific. |
| status/type/role/action/date filters | string | No | none | service-specific | enum/known value | ACTIVE | Filters are controller-specific. |

### Request body
```json
{}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/super-admin/notifications/deliveries/sample-deliveryId" \
  -H "Authorization: Bearer <access-token>"
```

## Success status code
- 200 OK

## Success response body
```json
{
  "items": [],
  "page": 0,
  "size": 50,
  "totalItems": 0,
  "totalPages": 0
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | CURRENT_IMPLEMENTED or CURRENT_PARTIAL |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | CURRENT_IMPLEMENTED where PageResponse is returned |
| id/status/message | Resource identifier or command result. | CURRENT_IMPLEMENTED by module DTO |
| user/accessToken/refreshToken | Auth/session response fields for auth endpoints. | n/a |

## Error status codes
| Status | When | Current status |
| --- | --- | --- |
| 400 | Bad request, invalid enum/body/state. | CURRENT_IMPLEMENTED |
| 401 | Missing/invalid/expired/revoked token or invalid auth/MFA. | CURRENT_IMPLEMENTED |
| 403 | Role/scope/inactive/system actor forbidden. | CURRENT_IMPLEMENTED |
| 404 | Resource not found or inaccessible. | CURRENT_IMPLEMENTED |
| 409 | Duplicate/conflicting state. | CURRENT_IMPLEMENTED where conflict checks exist |
| 429 | Login rate limit exceeded. | CURRENT_IMPLEMENTED for login; CURRENT_PARTIAL globally |
| 500 | Unexpected runtime failure. | CURRENT_IMPLEMENTED generic handler |

## Error response examples
```json
{
  "timestamp": "2026-06-08T00:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied for current role or scope.",
  "path": "/v1/super-admin/notifications/deliveries/{deliveryId}"
}
```

## Audit events
- Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.

## Side effects
- Read-only unless service records view/audit metadata.

## Pagination
- CURRENT_IMPLEMENTED/CURRENT_PARTIAL by endpoint; broad lists should remain paginated.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- CURRENT_PARTIAL: filters include search, status, tenantId, schoolId, role, action, type, date, channel, reportType where controller supports them.

## Search behavior
- CURRENT_PARTIAL where search/q exists; NOT_FOUND_IN_CODEBASE otherwise.

## Rate limits
- CURRENT_PARTIAL: login rate limiting exists; general per-endpoint rate limiting is PLANNED_RECOMMENDED.

## Security notes
- Enforce role, permission, tenant/school/class/student scope, and server-side actor context.

## Privacy notes
- Mask sensitive student, guardian, staff, finance, audit, AI prompt, and export fields according to role/scope.

## Performance notes
- Broad lists must be indexed and paginated; see docs/database/INDEXES_AND_SCALE.md.

## Frontend caller file
- NOT_FOUND_IN_CODEBASE

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/notifications/deliveries

## Summary
- Purpose: Read notification delivery summary/list/detail.
- Current status: CURRENT_IMPLEMENTED
- Module: Notification
- Role audience: SUPER_ADMIN
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method notificationDeliveries
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_NOTIFICATIONS
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: platform
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: No
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | Yes | Bearer <access-token> | JWT issued by auth flow. |
| Content-Type | No | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | No path params. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| page | integer | No | 0 | service-specific | >= 0 | 0 | Broad lists use page where implemented. |
| size | integer | No | 25 or 50 | service-specific | > 0 | 50 | UI often uses fixed page sizes for broad lists. |
| search/q | string | No | none | service-specific | trimmed | alpha | Search support is endpoint-specific. |
| status/type/role/action/date filters | string | No | none | service-specific | enum/known value | ACTIVE | Filters are controller-specific. |

### Request body
```json
{}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/super-admin/notifications/deliveries" \
  -H "Authorization: Bearer <access-token>"
```

## Success status code
- 200 OK

## Success response body
```json
{
  "items": [],
  "page": 0,
  "size": 50,
  "totalItems": 0,
  "totalPages": 0
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | CURRENT_IMPLEMENTED or CURRENT_PARTIAL |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | CURRENT_IMPLEMENTED where PageResponse is returned |
| id/status/message | Resource identifier or command result. | CURRENT_IMPLEMENTED by module DTO |
| user/accessToken/refreshToken | Auth/session response fields for auth endpoints. | n/a |

## Error status codes
| Status | When | Current status |
| --- | --- | --- |
| 400 | Bad request, invalid enum/body/state. | CURRENT_IMPLEMENTED |
| 401 | Missing/invalid/expired/revoked token or invalid auth/MFA. | CURRENT_IMPLEMENTED |
| 403 | Role/scope/inactive/system actor forbidden. | CURRENT_IMPLEMENTED |
| 404 | Resource not found or inaccessible. | CURRENT_IMPLEMENTED |
| 409 | Duplicate/conflicting state. | CURRENT_IMPLEMENTED where conflict checks exist |
| 429 | Login rate limit exceeded. | CURRENT_IMPLEMENTED for login; CURRENT_PARTIAL globally |
| 500 | Unexpected runtime failure. | CURRENT_IMPLEMENTED generic handler |

## Error response examples
```json
{
  "timestamp": "2026-06-08T00:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied for current role or scope.",
  "path": "/v1/super-admin/notifications/deliveries"
}
```

## Audit events
- Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.

## Side effects
- Read-only unless service records view/audit metadata.

## Pagination
- CURRENT_IMPLEMENTED/CURRENT_PARTIAL by endpoint; broad lists should remain paginated.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- CURRENT_PARTIAL: filters include search, status, tenantId, schoolId, role, action, type, date, channel, reportType where controller supports them.

## Search behavior
- CURRENT_PARTIAL where search/q exists; NOT_FOUND_IN_CODEBASE otherwise.

## Rate limits
- CURRENT_PARTIAL: login rate limiting exists; general per-endpoint rate limiting is PLANNED_RECOMMENDED.

## Security notes
- Enforce role, permission, tenant/school/class/student scope, and server-side actor context.

## Privacy notes
- Mask sensitive student, guardian, staff, finance, audit, AI prompt, and export fields according to role/scope.

## Performance notes
- Broad lists must be indexed and paginated; see docs/database/INDEXES_AND_SCALE.md.

## Frontend caller file
- NOT_FOUND_IN_CODEBASE

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- tests/performance/super-admin-platform-smoke.k6.js

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/notifications/summary

## Summary
- Purpose: Read notification delivery summary/list/detail.
- Current status: CURRENT_IMPLEMENTED
- Module: Notification
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method notificationSummary
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_NOTIFICATIONS
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: platform
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: No
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | Yes | Bearer <access-token> | JWT issued by auth flow. |
| Content-Type | No | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | No path params. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| page | integer | No | 0 | service-specific | >= 0 | 0 | Broad lists use page where implemented. |
| size | integer | No | 25 or 50 | service-specific | > 0 | 50 | UI often uses fixed page sizes for broad lists. |
| search/q | string | No | none | service-specific | trimmed | alpha | Search support is endpoint-specific. |
| status/type/role/action/date filters | string | No | none | service-specific | enum/known value | ACTIVE | Filters are controller-specific. |

### Request body
```json
{}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/super-admin/notifications/summary" \
  -H "Authorization: Bearer <access-token>"
```

## Success status code
- 200 OK

## Success response body
```json
{
  "items": [],
  "page": 0,
  "size": 50,
  "totalItems": 0,
  "totalPages": 0
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | CURRENT_IMPLEMENTED or CURRENT_PARTIAL |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | CURRENT_IMPLEMENTED where PageResponse is returned |
| id/status/message | Resource identifier or command result. | CURRENT_IMPLEMENTED by module DTO |
| user/accessToken/refreshToken | Auth/session response fields for auth endpoints. | n/a |

## Error status codes
| Status | When | Current status |
| --- | --- | --- |
| 400 | Bad request, invalid enum/body/state. | CURRENT_IMPLEMENTED |
| 401 | Missing/invalid/expired/revoked token or invalid auth/MFA. | CURRENT_IMPLEMENTED |
| 403 | Role/scope/inactive/system actor forbidden. | CURRENT_IMPLEMENTED |
| 404 | Resource not found or inaccessible. | CURRENT_IMPLEMENTED |
| 409 | Duplicate/conflicting state. | CURRENT_IMPLEMENTED where conflict checks exist |
| 429 | Login rate limit exceeded. | CURRENT_IMPLEMENTED for login; CURRENT_PARTIAL globally |
| 500 | Unexpected runtime failure. | CURRENT_IMPLEMENTED generic handler |

## Error response examples
```json
{
  "timestamp": "2026-06-08T00:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied for current role or scope.",
  "path": "/v1/super-admin/notifications/summary"
}
```

## Audit events
- Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.

## Side effects
- Read-only unless service records view/audit metadata.

## Pagination
- CURRENT_IMPLEMENTED/CURRENT_PARTIAL by endpoint; broad lists should remain paginated.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- CURRENT_PARTIAL: filters include search, status, tenantId, schoolId, role, action, type, date, channel, reportType where controller supports them.

## Search behavior
- CURRENT_PARTIAL where search/q exists; NOT_FOUND_IN_CODEBASE otherwise.

## Rate limits
- CURRENT_PARTIAL: login rate limiting exists; general per-endpoint rate limiting is PLANNED_RECOMMENDED.

## Security notes
- Enforce role, permission, tenant/school/class/student scope, and server-side actor context.

## Privacy notes
- Mask sensitive student, guardian, staff, finance, audit, AI prompt, and export fields according to role/scope.

## Performance notes
- Broad lists must be indexed and paginated; see docs/database/INDEXES_AND_SCALE.md.

## Frontend caller file
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- tests/performance/super-admin-platform-smoke.k6.js

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.
