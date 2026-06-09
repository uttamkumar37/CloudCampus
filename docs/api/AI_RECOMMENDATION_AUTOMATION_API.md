<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# AI Recommendation Automation API

Status: CURRENT_IMPLEMENTED for discovered controllers; NOT_FOUND_IN_CODEBASE for planned/missing cards.

| Method | Endpoint | Module | Roles | Frontend caller | Status |
| --- | --- | --- | --- | --- | --- |
| PATCH | /v1/ai/automation-rules/{id} | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/automation-rules | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/automation-runs | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/entitlement | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/knowledge/search | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT child-scoped, FINANCE_STAFF, OFFICE_STAFF | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/accept | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/approve | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/dismiss | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/execute | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/reject | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, FINANCE_STAFF, OFFICE_STAFF; PARENT denied | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/recommendations/{id} | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT read-only approved linked child, FINANCE_STAFF, OFFICE_STAFF | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/recommendations | AI Recommendation / Automation | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT read-only approved linked child, FINANCE_STAFF, OFFICE_STAFF | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| PATCH | /v1/super-admin/ai/automation-rules/{id} | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/automation-rules | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/automation-rules | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/automation-runs | AI Recommendation / Automation | SUPER_ADMIN | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/ai/entitlements | AI Recommendation / Automation | SUPER_ADMIN | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/ai/policies/{tenantId} | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| PUT | /v1/super-admin/ai/policies/{tenantId} | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/policies | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations/{id}/approve | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations/{id}/execute | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations/{id}/reject | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/recommendations/{id} | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/recommendations | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | AI Recommendation / Automation | SUPER_ADMIN | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | AI Recommendation / Automation | SUPER_ADMIN | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/ai/usage/summary | AI Recommendation / Automation | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/usage/tenants | AI Recommendation / Automation | SUPER_ADMIN | NOT_FOUND_IN_CODEBASE | BACKEND_EXISTS_UI_NOT_SURFACED |

Parent guard: PARENT is intentionally limited to approved recommendations for linked children in the active school and child-scoped knowledge search with a linked `studentId`. PARENT receives 403 for AI entitlement details, usage audit submission, automation rules/runs, and recommendation mutation actions.

# PATCH /v1/ai/automation-rules/{id}

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method automationRuleUpdateNotAvailable
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: MANAGE_AI_AUTOMATION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "name": "Rule name",
  "enabled": false,
  "requiresApproval": true
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PATCH "http://127.0.0.1:18080/v1/ai/automation-rules/sample-id" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Rule name\",\"enabled\":false,\"requiresApproval\":true}"
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
  "path": "/v1/ai/automation-rules/{id}"
}
```

## Audit events
- AUTOMATION_RULE_UPDATED

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/ai/automation-rules

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method automationRules
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: VIEW_AI_AUTOMATION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/ai/automation-rules" \
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
  "path": "/v1/ai/automation-rules"
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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/ai/automation-runs

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method automationRuns
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: VIEW_AI_AUTOMATION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/ai/automation-runs" \
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
  "path": "/v1/ai/automation-runs"
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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/ai/entitlement

## Summary
- Purpose: GET /v1/ai/entitlement in AI Recommendation / Automation.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java method currentTenantEntitlement
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: VIEW_AI_USAGE_OR_POLICY
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/ai/entitlement" \
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
  "path": "/v1/ai/entitlement"
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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/ai/knowledge/search

## Summary
- Purpose: Return navigation-oriented search results.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRetrievalController.java method search
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: MANAGE_AI_POLICY
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/ai/knowledge/search" \
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
  "path": "/v1/ai/knowledge/search"
}
```

## Audit events
- Audit action inferred from module; verify service for exact enum.

## Side effects
- May create/update/deactivate records, enqueue background work, write audit logs, or emit outbox events depending on service.

## Pagination
- Not applicable to command endpoint.

## Sorting
- CURRENT_PARTIAL: sorting is endpoint/query-specific and not uniformly exposed.

## Filtering
- Not applicable unless command endpoint accepts query filters.

## Search behavior
- CURRENT_IMPLEMENTED navigation-oriented search.

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRetrievalController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx
- frontend/src/features/super-admin/api/platformApi.test.ts
- tests/performance/super-admin-platform-smoke.k6.js

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/ai/recommendations/{id}/accept

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method accept
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: AI_RECOMMENDATION_ACTION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/ai/recommendations/sample-id/accept" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/ai/recommendations/{id}/accept"
}
```

## Audit events
- AI_RECOMMENDATION_CREATED

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java
- backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java
- backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx
- frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx
- frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx
- frontend/src/features/student/pages/StudentImportPage.test.tsx
- frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/ai/recommendations/{id}/approve

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method approve
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: AI_RECOMMENDATION_ACTION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/ai/recommendations/sample-id/approve" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/ai/recommendations/{id}/approve"
}
```

## Audit events
- AI_RECOMMENDATION_APPROVED

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/ai/recommendations/{id}/dismiss

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method dismiss
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: AI_RECOMMENDATION_ACTION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/ai/recommendations/sample-id/dismiss" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/ai/recommendations/{id}/dismiss"
}
```

## Audit events
- AI_RECOMMENDATION_DISMISSED

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/ai/recommendations/{id}/execute

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method execute
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: AI_RECOMMENDATION_ACTION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/ai/recommendations/sample-id/execute" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/ai/recommendations/{id}/execute"
}
```

## Audit events
- AI_RECOMMENDATION_EXECUTED

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/ai/recommendations/{id}/reject

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method reject
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: AI_RECOMMENDATION_ACTION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/ai/recommendations/sample-id/reject" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/ai/recommendations/{id}/reject"
}
```

## Audit events
- AI_RECOMMENDATION_REJECTED

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java
- backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx
- frontend/src/shared/api/httpClient.test.ts

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/ai/recommendations/{id}

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method recommendation
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: VIEW_AI_RECOMMENDATIONS
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

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
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/ai/recommendations/sample-id" \
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
  "path": "/v1/ai/recommendations/{id}"
}
```

## Audit events
- AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/ai/recommendations

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java method recommendations
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: VIEW_AI_RECOMMENDATIONS
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/ai/recommendations" \
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
  "path": "/v1/ai/recommendations"
}
```

## Audit events
- AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# PATCH /v1/super-admin/ai/automation-rules/{id}

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method updateAutomationRule
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: MANAGE_AI_AUTOMATION
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "name": "Rule name",
  "enabled": false,
  "requiresApproval": true
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PATCH "http://127.0.0.1:18080/v1/super-admin/ai/automation-rules/sample-id" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Rule name\",\"enabled\":false,\"requiresApproval\":true}"
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
  "path": "/v1/super-admin/ai/automation-rules/{id}"
}
```

## Audit events
- AUTOMATION_RULE_UPDATED

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
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/automation-rules

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method automationRules
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_AUTOMATION
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/automation-rules" \
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
  "path": "/v1/super-admin/ai/automation-rules"
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
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/super-admin/ai/automation-rules

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method createAutomationRule
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: MANAGE_AI_AUTOMATION
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
  "name": "Rule name",
  "enabled": false,
  "requiresApproval": true
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/super-admin/ai/automation-rules" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Rule name\",\"enabled\":false,\"requiresApproval\":true}"
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
  "path": "/v1/super-admin/ai/automation-rules"
}
```

## Audit events
- AUTOMATION_RULE_CREATED

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
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/automation-runs

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method automationRuns
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_AUTOMATION
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/automation-runs" \
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
  "path": "/v1/super-admin/ai/automation-runs"
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
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/entitlements

## Summary
- Purpose: GET /v1/super-admin/ai/entitlements in AI Recommendation / Automation.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method aiEntitlements
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_USAGE_OR_POLICY
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/entitlements" \
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
  "path": "/v1/super-admin/ai/entitlements"
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

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/policies/{tenantId}

## Summary
- Purpose: GET /v1/super-admin/ai/policies/{tenantId} in AI Recommendation / Automation.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method policy
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_USAGE_OR_POLICY
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
| tenantId | string | Yes | Must exist and be accessible in scope | tenantId-id | Verified by service/controller scope checks where implemented. |

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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/policies/sample-tenantId" \
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
  "path": "/v1/super-admin/ai/policies/{tenantId}"
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
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# PUT /v1/super-admin/ai/policies/{tenantId}

## Summary
- Purpose: PUT /v1/super-admin/ai/policies/{tenantId} in AI Recommendation / Automation.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method updatePolicy
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: MANAGE_AI_POLICY
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| tenantId | string | Yes | Must exist and be accessible in scope | tenantId-id | Verified by service/controller scope checks where implemented. |

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
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PUT "http://127.0.0.1:18080/v1/super-admin/ai/policies/sample-tenantId" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
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
  "path": "/v1/super-admin/ai/policies/{tenantId}"
}
```

## Audit events
- Audit action inferred from module; verify service for exact enum.

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
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/policies

## Summary
- Purpose: GET /v1/super-admin/ai/policies in AI Recommendation / Automation.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method policies
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_USAGE_OR_POLICY
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/policies" \
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
  "path": "/v1/super-admin/ai/policies"
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
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/super-admin/ai/recommendations/{id}/approve

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method approveRecommendation
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: AI_RECOMMENDATION_ACTION
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/super-admin/ai/recommendations/sample-id/approve" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/super-admin/ai/recommendations/{id}/approve"
}
```

## Audit events
- AI_RECOMMENDATION_APPROVED

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
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/super-admin/ai/recommendations/{id}/execute

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method executeRecommendation
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: AI_RECOMMENDATION_ACTION
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/super-admin/ai/recommendations/sample-id/execute" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/super-admin/ai/recommendations/{id}/execute"
}
```

## Audit events
- AI_RECOMMENDATION_EXECUTED

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
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/super-admin/ai/recommendations/{id}/reject

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method rejectRecommendation
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: AI_RECOMMENDATION_ACTION
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

### Query params
| Param | Type | Required | Default | Max | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | No | n/a | n/a | n/a | n/a | No query params expected unless controller signature adds them. |

### Request body
```json
{
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/super-admin/ai/recommendations/sample-id/reject" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/super-admin/ai/recommendations/{id}/reject"
}
```

## Audit events
- AI_RECOMMENDATION_REJECTED

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
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/recommendations/{id}

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method recommendation
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_RECOMMENDATIONS
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
| id | string | Yes | Must exist and be accessible in scope | id-id | Verified by service/controller scope checks where implemented. |

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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/recommendations/sample-id" \
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
  "path": "/v1/super-admin/ai/recommendations/{id}"
}
```

## Audit events
- AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.

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
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/recommendations

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method recommendations
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_RECOMMENDATIONS
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/recommendations" \
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
  "path": "/v1/super-admin/ai/recommendations"
}
```

## Audit events
- AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.

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
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/super-admin/ai/recommendations

## Summary
- Purpose: Read or act on AI recommendations.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java method createRecommendation
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: CREATE_AI_RECOMMENDATIONS
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
  "type": "GENERAL",
  "title": "Recommendation title",
  "riskLevel": "LOW",
  "metadataJson": "{}"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/super-admin/ai/recommendations" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"GENERAL\",\"title\":\"Recommendation title\",\"riskLevel\":\"LOW\",\"metadataJson\":\"{}\"}"
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
  "path": "/v1/super-admin/ai/recommendations"
}
```

## Audit events
- AI_RECOMMENDATION_CREATED

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
- frontend/src/features/super-admin/api/platformApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/tenants/{tenantId}/entitlement

## Summary
- Purpose: Read tenant data.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java method entitlement
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_USAGE_OR_POLICY
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
| tenantId | string | Yes | Must exist and be accessible in scope | tenantId-id | Verified by service/controller scope checks where implemented. |

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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/tenants/sample-tenantId/entitlement" \
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
  "path": "/v1/super-admin/ai/tenants/{tenantId}/entitlement"
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
- backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- frontend/src/app/App.test.tsx

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement

## Summary
- Purpose: Update tenant data.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java method updateEntitlement
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: MANAGE_AI_POLICY
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
| Content-Type | Yes | application/json | Required when sending JSON body. |
| X-Tenant-Id / X-School-Id | No client trust | tenant-id / school-id | Server context and spoofing filter remain authoritative. |

### Path params
| Param | Type | Required | Validation | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| tenantId | string | Yes | Must exist and be accessible in scope | tenantId-id | Verified by service/controller scope checks where implemented. |

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
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PUT "http://127.0.0.1:18080/v1/super-admin/ai/tenants/sample-tenantId/entitlement" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
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
  "path": "/v1/super-admin/ai/tenants/{tenantId}/entitlement"
}
```

## Audit events
- AI_ENTITLEMENT_UPDATED

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
- backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/usage/summary

## Summary
- Purpose: GET /v1/super-admin/ai/usage/summary in AI Recommendation / Automation.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method aiUsageSummary
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_USAGE_OR_POLICY
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/usage/summary" \
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
  "path": "/v1/super-admin/ai/usage/summary"
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

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/ai/usage/tenants

## Summary
- Purpose: Read tenant data.
- Current status: CURRENT_IMPLEMENTED
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method aiTenantUsage
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: VIEW_AI_USAGE_OR_POLICY
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/ai/usage/tenants" \
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
  "path": "/v1/super-admin/ai/usage/tenants"
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

## Gaps/TODOs
- BACKEND_EXISTS_UI_NOT_SURFACED: backend endpoint exists without a direct frontend caller found.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.

# POST /v1/ai/automation-rules

## Summary
- Purpose: Read or manage automation rules/runs.
- Current status: NOT_FOUND_IN_CODEBASE
- Module: AI Recommendation / Automation
- Role audience: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: NOT_FOUND_IN_CODEBASE
- Backend implemented: NOT_FOUND_IN_CODEBASE
- Planned/future: PLANNED_RECOMMENDED

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: MANAGE_AI_AUTOMATION
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: role AI policy scope
- Super Admin allowed: Yes
- Tenant Admin allowed: No
- School Admin allowed: Yes
- Teacher allowed: Yes
- Student allowed: Yes
- Parent allowed: Yes
- Finance Staff allowed: Yes
- Office Staff allowed: Yes
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
  "name": "Rule name",
  "enabled": false,
  "requiresApproval": true
}
```

## Field validation
- PLANNED_RECOMMENDED: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside role AI policy scope scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/ai/automation-rules" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Rule name\",\"enabled\":false,\"requiresApproval\":true}"
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
  "path": "/v1/ai/automation-rules"
}
```

## Audit events
- PLANNED_RECOMMENDED: AUTOMATION_RULE_CREATED

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
- NOT_FOUND_IN_CODEBASE

## Backend service file
- NOT_FOUND_IN_CODEBASE

## Repository/query source
- NOT_FOUND_IN_CODEBASE

## Tests that cover it
- CURRENT_PARTIAL: no direct endpoint test discovered by static scan.

## Gaps/TODOs
- NOT_FOUND_IN_CODEBASE: requested endpoint not discovered in backend controllers.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.
