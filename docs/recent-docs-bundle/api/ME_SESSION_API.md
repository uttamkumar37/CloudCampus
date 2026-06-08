<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Me Session API

Status: CURRENT_IMPLEMENTED for discovered controllers; NOT_FOUND_IN_CODEBASE for planned/missing cards.

| Method | Endpoint | Module | Roles | Frontend caller | Status |
| --- | --- | --- | --- | --- | --- |
| POST | /v1/me/change-password | Me / Session | SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/me/logout | Me / Session | SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/me/schools/{schoolId}/activate | Me / Session | SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF | frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/me/schools | Me / Session | SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/me | Me / Session | SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF | frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts | CURRENT_IMPLEMENTED |

# POST /v1/me/change-password

## Summary
- Purpose: POST /v1/me/change-password in Me / Session.
- Current status: CURRENT_IMPLEMENTED
- Module: Me / Session
- Role audience: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java method changePassword
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: SESSION_SELF_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: current user/session
- Super Admin allowed: Yes
- Tenant Admin allowed: Yes
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
- IDs must resolve to resources inside current user/session scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/me/change-password" \
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
  "path": "/v1/me/change-password"
}
```

## Audit events
- PASSWORD_CHANGED

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
- frontend/src/features/auth/api/authApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- frontend/src/app/App.test.tsx

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/me/logout

## Summary
- Purpose: POST /v1/me/logout in Me / Session.
- Current status: CURRENT_IMPLEMENTED
- Module: Me / Session
- Role audience: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java method logout
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: SESSION_SELF_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: current user/session
- Super Admin allowed: Yes
- Tenant Admin allowed: Yes
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
  "refreshToken": "refresh-token"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside current user/session scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/me/logout" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"refresh-token\"}"
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
  "path": "/v1/me/logout"
}
```

## Audit events
- USER_LOGGED_OUT

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
- frontend/src/features/auth/api/authApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- frontend/src/app/App.test.tsx

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/me/schools/{schoolId}/activate

## Summary
- Purpose: Create/update school data.
- Current status: CURRENT_IMPLEMENTED
- Module: Me / Session
- Role audience: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java method activateSchool
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: SESSION_SELF_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: current user/session
- Super Admin allowed: Yes
- Tenant Admin allowed: Yes
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
| schoolId | string | Yes | Must exist and be accessible in scope | schoolId-id | Verified by service/controller scope checks where implemented. |

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
- IDs must resolve to resources inside current user/session scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/me/schools/sample-schoolId/activate" \
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
  "path": "/v1/me/schools/{schoolId}/activate"
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
- frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
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
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/me/schools

## Summary
- Purpose: Read school data.
- Current status: CURRENT_IMPLEMENTED
- Module: Me / Session
- Role audience: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java method schools
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: SESSION_SELF_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: current user/session
- Super Admin allowed: Yes
- Tenant Admin allowed: Yes
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
- IDs must resolve to resources inside current user/session scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/me/schools" \
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
  "path": "/v1/me/schools"
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
- frontend/src/features/auth/api/authApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/super-admin/api/platformApi.test.ts
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- tests/performance/super-admin-platform-smoke.k6.js
- tests/performance/super-admin-scale-seed-sql.mjs

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/me

## Summary
- Purpose: Hydrate current user and active school context.
- Current status: CURRENT_IMPLEMENTED
- Module: Me / Session
- Role audience: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java method currentUser
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permissions required: SESSION_SELF_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: current user/session
- Super Admin allowed: Yes
- Tenant Admin allowed: Yes
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
- IDs must resolve to resources inside current user/session scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/me" \
  -H "Authorization: Bearer <access-token>"
```

## Success status code
- 200 OK

## Success response body
```json
{
  "accessToken": "jwt-or-null",
  "refreshToken": "refresh-or-null",
  "tokenType": "Bearer",
  "expiresAt": "2026-06-08T12:00:00Z",
  "user": {
    "userId": "id",
    "role": "SUPER_ADMIN"
  },
  "mfaRequired": false
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | CURRENT_IMPLEMENTED or CURRENT_PARTIAL |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | CURRENT_IMPLEMENTED where PageResponse is returned |
| id/status/message | Resource identifier or command result. | CURRENT_IMPLEMENTED by module DTO |
| user/accessToken/refreshToken | Auth/session response fields for auth endpoints. | CURRENT_IMPLEMENTED |

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
  "path": "/v1/me"
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
- frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- frontend/src/app/App.test.tsx
- frontend/src/shared/api/apiBase.test.ts

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.
