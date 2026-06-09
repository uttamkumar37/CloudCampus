<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Finance API

Status: CURRENT_IMPLEMENTED for discovered controllers; NOT_FOUND_IN_CODEBASE for planned/missing cards.

| Method | Endpoint | Module | Roles | Frontend caller | Status |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/finance/dashboard/summary | Finance | FINANCE_STAFF | frontend/src/features/portal/api/dashboardApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/finance/fees/demands/{demandId}/payments | Finance | FINANCE_STAFF | frontend/src/features/finance/api/feeApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/finance/fees/demands/{demandId} | Finance | FINANCE_STAFF | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/finance/fees/demands | Finance | FINANCE_STAFF | frontend/src/app/App.tsx | CURRENT_IMPLEMENTED |
| POST | /v1/finance/fees/demands | Finance | FINANCE_STAFF | frontend/src/features/finance/api/feeApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/finance/receipts | Finance | FINANCE_STAFF | frontend/src/features/finance/api/feeApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/fees/demands/{demandId}/payments | Finance | SCHOOL_ADMIN, PRINCIPAL | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/fees/demands/{demandId} | Finance | SCHOOL_ADMIN, PRINCIPAL | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/fees/demands | Finance | SCHOOL_ADMIN, PRINCIPAL | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/fees/demands | Finance | SCHOOL_ADMIN, PRINCIPAL | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |

Finance guard note: FINANCE_STAFF finance endpoints derive tenant/school from the authenticated active school, reject demand IDs outside the active school, require an active school and active student for demand creation, validate payment methods, reject duplicate school payment references, and audit `FEE_DEMAND_CREATED`, `FEE_PAYMENT_RECORDED`, and `RECEIPT_ISSUED`.

# GET /v1/finance/dashboard/summary

## Summary
- Purpose: Return role dashboard metrics, alerts, and activity.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: FINANCE_STAFF
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/portal/api/dashboardApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/portal/dashboard/DashboardSummaryController.java method finance
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: FINANCE_STAFF
- Permissions required: FINANCE_VIEW
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: Yes
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
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/finance/dashboard/summary" \
  -H "Authorization: Bearer <access-token>"
```

## Success status code
- 200 OK

## Success response body
```json
{
  "metrics": [],
  "alerts": [],
  "activity": []
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
  "path": "/v1/finance/dashboard/summary"
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
- frontend/src/features/portal/api/dashboardApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/portal/dashboard/DashboardSummaryController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/portal/dashboard/DashboardSummaryService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/finance/fees/demands/{demandId}/payments

## Summary
- Purpose: Create demands/payments/receipts.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: FINANCE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method recordFinancePayment
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: FINANCE_STAFF
- Permissions required: FINANCE_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: Yes
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| demandId | string | Yes | Must exist and be accessible in scope | demandId-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "example": "See backend request DTO for this endpoint."
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/finance/fees/demands/sample-demandId/payments" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "id": "resource-id",
  "status": "OK"
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/finance/fees/demands/{demandId}/payments"
}
```

## Audit events
- FEE_PAYMENT_RECORDED, RECEIPT_ISSUED

## Side effects
- May create/update/deactivate records, enqueue background work, write audit logs, or emit outbox events depending on service.

## Pagination
- Not applicable to command endpoint.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- Not applicable unless command endpoint accepts query filters.

## Search behavior
- NOT_FOUND_IN_CODEBASE for command endpoints.

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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/finance/fees/demands/{demandId}

## Summary
- Purpose: Read finance data.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: FINANCE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method financeDemand
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: FINANCE_STAFF
- Permissions required: FINANCE_VIEW
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: Yes
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
| demandId | string | Yes | Must exist and be accessible in scope | demandId-id | Verified by service/controller scope checks where implemented. |

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
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/finance/fees/demands/sample-demandId" \
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
  "path": "/v1/finance/fees/demands/{demandId}"
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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/finance/fees/demands

## Summary
- Purpose: Read finance data.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: FINANCE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method financeDemands
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: FINANCE_STAFF
- Permissions required: FINANCE_VIEW
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: Yes
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
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/finance/fees/demands" \
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
  "path": "/v1/finance/fees/demands"
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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/finance/fees/demands

## Summary
- Purpose: Create demands/payments/receipts.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: FINANCE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method createFinanceDemand
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: FINANCE_STAFF
- Permissions required: FINANCE_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: Yes
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | No path params. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "example": "See backend request DTO for this endpoint."
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/finance/fees/demands" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "id": "resource-id",
  "status": "OK"
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/finance/fees/demands"
}
```

## Audit events
- FEE_DEMAND_CREATED

## Side effects
- May create/update/deactivate records, enqueue background work, write audit logs, or emit outbox events depending on service.

## Pagination
- Not applicable to command endpoint.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- Not applicable unless command endpoint accepts query filters.

## Search behavior
- NOT_FOUND_IN_CODEBASE for command endpoints.

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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/finance/receipts

## Summary
- Purpose: Read finance data.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: FINANCE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method financeReceipts
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: FINANCE_STAFF
- Permissions required: FINANCE_VIEW
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: Yes
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
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/finance/receipts" \
  -H "Authorization: Bearer <access-token>"
```

## Success status code
- 200 OK

## Success response body
```json
{
  "id": "resource-id",
  "status": "OK"
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
  "path": "/v1/finance/receipts"
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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/school-admin/fees/demands/{demandId}/payments

## Summary
- Purpose: Create demands/payments/receipts.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: SCHOOL_ADMIN, PRINCIPAL
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method recordSchoolPayment
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SCHOOL_ADMIN, PRINCIPAL
- Permissions required: FINANCE_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: Yes
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| demandId | string | Yes | Must exist and be accessible in scope | demandId-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "example": "See backend request DTO for this endpoint."
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/school-admin/fees/demands/sample-demandId/payments" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "id": "resource-id",
  "status": "OK"
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/school-admin/fees/demands/{demandId}/payments"
}
```

## Audit events
- FEE_PAYMENT_RECORDED, RECEIPT_ISSUED

## Side effects
- May create/update/deactivate records, enqueue background work, write audit logs, or emit outbox events depending on service.

## Pagination
- Not applicable to command endpoint.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- Not applicable unless command endpoint accepts query filters.

## Search behavior
- NOT_FOUND_IN_CODEBASE for command endpoints.

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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/school-admin/fees/demands/{demandId}

## Summary
- Purpose: Read finance data.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: SCHOOL_ADMIN, PRINCIPAL
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method schoolDemand
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SCHOOL_ADMIN, PRINCIPAL
- Permissions required: FINANCE_VIEW
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: Yes
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
| demandId | string | Yes | Must exist and be accessible in scope | demandId-id | Verified by service/controller scope checks where implemented. |

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
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/school-admin/fees/demands/sample-demandId" \
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
  "path": "/v1/school-admin/fees/demands/{demandId}"
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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/school-admin/fees/demands

## Summary
- Purpose: Read finance data.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: SCHOOL_ADMIN, PRINCIPAL
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method schoolDemands
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SCHOOL_ADMIN, PRINCIPAL
- Permissions required: FINANCE_VIEW
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: Yes
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
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/school-admin/fees/demands" \
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
  "path": "/v1/school-admin/fees/demands"
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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/school-admin/fees/demands

## Summary
- Purpose: Create demands/payments/receipts.
- Current status: CURRENT_IMPLEMENTED
- Module: Finance
- Role audience: SCHOOL_ADMIN, PRINCIPAL
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java method createDemand
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SCHOOL_ADMIN, PRINCIPAL
- Permissions required: FINANCE_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: school
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: Yes
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | No path params. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "example": "See backend request DTO for this endpoint."
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/school-admin/fees/demands" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "id": "resource-id",
  "status": "OK"
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/school-admin/fees/demands"
}
```

## Audit events
- FEE_DEMAND_CREATED

## Side effects
- May create/update/deactivate records, enqueue background work, write audit logs, or emit outbox events depending on service.

## Pagination
- Not applicable to command endpoint.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- Not applicable unless command endpoint accepts query filters.

## Search behavior
- NOT_FOUND_IN_CODEBASE for command endpoints.

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
- backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.
