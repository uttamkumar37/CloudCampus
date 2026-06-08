<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Settings API

Status: CURRENT_IMPLEMENTED for discovered controllers; NOT_FOUND_IN_CODEBASE for planned/missing cards.

| Method | Endpoint | Module | Roles | Frontend caller | Status |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/school-admin/settings | Settings | SCHOOL_ADMIN, PRINCIPAL | frontend/src/features/school-admin/api/schoolSettingsApi.ts | CURRENT_IMPLEMENTED |
| PATCH | /v1/school-admin/settings | Settings | SCHOOL_ADMIN, PRINCIPAL | frontend/src/features/school-admin/api/schoolSettingsApi.ts | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/settings | Settings | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/settings | Settings | SUPER_ADMIN | frontend/src/features/super-admin/api/platformApi.ts | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/tenants/{tenantId}/settings | Settings | SUPER_ADMIN | frontend/src/shared/api/httpClient.test.ts | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/settings | Settings | TENANT_ADMIN | frontend/src/features/tenant-admin/api/tenantSettingsApi.ts | CURRENT_IMPLEMENTED |
| PATCH | /v1/tenant-admin/settings | Settings | TENANT_ADMIN | frontend/src/features/tenant-admin/api/tenantSettingsApi.ts | CURRENT_IMPLEMENTED |

# GET /v1/school-admin/settings

## Summary
- Purpose: Read settings.
- Current status: CURRENT_IMPLEMENTED
- Module: Settings
- Role audience: SCHOOL_ADMIN, PRINCIPAL
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/school-admin/api/schoolSettingsApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/school/SchoolSettingsController.java method get
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SCHOOL_ADMIN, PRINCIPAL
- Permissions required: SETTINGS_VIEW
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
curl -X GET "http://127.0.0.1:18080/v1/school-admin/settings" \
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
  "path": "/v1/school-admin/settings"
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
- frontend/src/features/school-admin/api/schoolSettingsApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/school/SchoolSettingsController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/school/SchoolSettingsService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/common/health/SystemReadinessControllerTest.java
- backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java
- frontend/src/app/App.test.tsx
- frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx
- frontend/src/features/academic/pages/AcademicSetupPage.test.tsx
- frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx
- frontend/src/features/auth/pages/LoginPage.test.tsx
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/operations/pages/BulkJobsPage.test.tsx
- frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx
- frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx
- frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx
- frontend/src/features/reports/pages/ReportExportsPage.test.tsx
- frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx
- frontend/src/features/student/pages/StudentImportPage.test.tsx
- frontend/src/features/super-admin/api/platformApi.test.ts
- frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- frontend/src/shared/api/httpClient.test.ts
- tests/performance/super-admin-platform-smoke.k6.js

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# PATCH /v1/school-admin/settings

## Summary
- Purpose: Update settings.
- Current status: CURRENT_IMPLEMENTED
- Module: Settings
- Role audience: SCHOOL_ADMIN, PRINCIPAL
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/school-admin/api/schoolSettingsApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/school/SchoolSettingsController.java method update
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SCHOOL_ADMIN, PRINCIPAL
- Permissions required: SETTINGS_MANAGE
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
  "key": "value"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside school scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PATCH "http://127.0.0.1:18080/v1/school-admin/settings" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"value\"}"
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
  "path": "/v1/school-admin/settings"
}
```

## Audit events
- CURRENT_PARTIAL settings audit

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
- frontend/src/features/school-admin/api/schoolSettingsApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/school/SchoolSettingsController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/school/SchoolSettingsService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java
- backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/operations/pages/BulkJobsPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- tests/performance/super-admin-scale-seed-sql.mjs

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/super-admin/settings

## Summary
- Purpose: Read settings.
- Current status: CURRENT_IMPLEMENTED
- Module: Settings
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method settings
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: SETTINGS_VIEW
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
curl -X GET "http://127.0.0.1:18080/v1/super-admin/settings" \
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
  "path": "/v1/super-admin/settings"
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
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# PATCH /v1/super-admin/settings

## Summary
- Purpose: Update settings.
- Current status: CURRENT_IMPLEMENTED
- Module: Settings
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/super-admin/api/platformApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method updateSettings
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: SETTINGS_MANAGE
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
  "key": "value"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PATCH "http://127.0.0.1:18080/v1/super-admin/settings" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"value\"}"
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
  "path": "/v1/super-admin/settings"
}
```

## Audit events
- PLATFORM_SETTINGS_UPDATED

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


# PATCH /v1/super-admin/tenants/{tenantId}/settings

## Summary
- Purpose: Update settings.
- Current status: CURRENT_IMPLEMENTED
- Module: Settings
- Role audience: SUPER_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/shared/api/httpClient.test.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java method updateTenantSettings
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: SUPER_ADMIN
- Permissions required: SETTINGS_MANAGE
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
  "key": "value"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside platform scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PATCH "http://127.0.0.1:18080/v1/super-admin/tenants/sample-tenantId/settings" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"value\"}"
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
  "path": "/v1/super-admin/tenants/{tenantId}/settings"
}
```

## Audit events
- TENANT_SETTINGS_UPDATED

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
- frontend/src/shared/api/httpClient.test.ts

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
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# GET /v1/tenant-admin/settings

## Summary
- Purpose: Read settings.
- Current status: CURRENT_IMPLEMENTED
- Module: Settings
- Role audience: TENANT_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/tenant-admin/api/tenantSettingsApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java method settings
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: TENANT_ADMIN
- Permissions required: SETTINGS_VIEW
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: tenant
- Super Admin allowed: No
- Tenant Admin allowed: Yes
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
- IDs must resolve to resources inside tenant scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X GET "http://127.0.0.1:18080/v1/tenant-admin/settings" \
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
  "path": "/v1/tenant-admin/settings"
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
- frontend/src/features/tenant-admin/api/tenantSettingsApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java
- frontend/src/app/App.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# PATCH /v1/tenant-admin/settings

## Summary
- Purpose: Update settings.
- Current status: CURRENT_IMPLEMENTED
- Module: Settings
- Role audience: TENANT_ADMIN
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/tenant-admin/api/tenantSettingsApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java method updateSettings
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: Yes, Bearer JWT.
- Roles allowed: TENANT_ADMIN
- Permissions required: SETTINGS_MANAGE
- MFA required: Yes at login for privileged role; endpoint-level freshness is CURRENT_PARTIAL.
- Scope required: tenant
- Super Admin allowed: No
- Tenant Admin allowed: Yes
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
  "key": "value"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside tenant scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X PATCH "http://127.0.0.1:18080/v1/tenant-admin/settings" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"value\"}"
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
  "path": "/v1/tenant-admin/settings"
}
```

## Audit events
- CURRENT_PARTIAL settings audit

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
- frontend/src/features/tenant-admin/api/tenantSettingsApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java

## Backend service file
- backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsService.java

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.
