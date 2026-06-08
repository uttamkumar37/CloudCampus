<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Auth API

Status: CURRENT_IMPLEMENTED for discovered controllers; NOT_FOUND_IN_CODEBASE for planned/missing cards.

| Method | Endpoint | Module | Roles | Frontend caller | Status |
| --- | --- | --- | --- | --- | --- |
| POST | /v1/auth/forgot-password | Auth | GUEST | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/auth/login | Auth | GUEST | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/auth/mfa/verify | Auth | GUEST | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/auth/refresh | Auth | GUEST | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/auth/reset-password | Auth | GUEST | frontend/src/features/auth/api/authApi.ts | CURRENT_IMPLEMENTED |
| POST | /v1/invitations/accept | Platform | GUEST | frontend/src/features/auth/api/invitationsApi.ts | CURRENT_IMPLEMENTED |

# POST /v1/auth/forgot-password

## Summary
- Purpose: POST /v1/auth/forgot-password in Auth.
- Current status: CURRENT_IMPLEMENTED
- Module: Auth
- Role audience: GUEST
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java method forgotPassword
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: No token for public auth/invitation flow.
- Roles allowed: GUEST
- Permissions required: PUBLIC_AUTH_FLOW
- MFA required: No role-level MFA requirement found.
- Scope required: public/auth flow
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: Yes for public/auth only
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | No | Bearer <access-token> | JWT issued by auth flow. |
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
- IDs must resolve to resources inside public/auth flow scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/auth/forgot-password" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "accessToken": "jwt-or-null",
  "refreshToken": "refresh-or-null",
  "tokenType": "Bearer",
  "expiresAt": "2026-06-08T12:00:00Z",
  "user": {
    "userId": "id",
    "role": "GUEST"
  },
  "mfaRequired": false
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/auth/forgot-password"
}
```

## Audit events
- PASSWORD_RESET_REQUESTED

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
- backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
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
- backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java
- frontend/src/app/App.test.tsx
- frontend/src/features/auth/pages/LoginPage.test.tsx
- frontend/src/shared/api/httpClient.test.ts
- tests/performance/super-admin-platform-smoke.k6.js

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/auth/login

## Summary
- Purpose: Start interactive login and return MFA challenge or session tokens.
- Current status: CURRENT_IMPLEMENTED
- Module: Auth
- Role audience: GUEST
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java method login
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: No token for public auth/invitation flow.
- Roles allowed: GUEST
- Permissions required: PUBLIC_AUTH_FLOW
- MFA required: No role-level MFA requirement found.
- Scope required: public/auth flow
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: Yes for public/auth only
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | No | Bearer <access-token> | JWT issued by auth flow. |
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
  "email": "user@example.com",
  "password": "********"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside public/auth flow scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/auth/login" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"********\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "accessToken": "jwt-or-null",
  "refreshToken": "refresh-or-null",
  "tokenType": "Bearer",
  "expiresAt": "2026-06-08T12:00:00Z",
  "user": {
    "userId": "id",
    "role": "GUEST"
  },
  "mfaRequired": false
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/auth/login"
}
```

## Audit events
- MFA_CHALLENGE_CREATED for MFA roles; session issuance is not a separate enum.

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
- backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
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
- backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java
- frontend/src/app/App.test.tsx
- frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx
- frontend/src/features/academic/pages/AcademicSetupPage.test.tsx
- frontend/src/features/auth/pages/LoginPage.test.tsx
- frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx
- frontend/src/features/operations/pages/BulkJobsPage.test.tsx
- frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx
- frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx
- frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx
- frontend/src/features/reports/pages/ReportExportsPage.test.tsx
- frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx
- frontend/src/features/student/pages/StudentImportPage.test.tsx
- frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- frontend/src/shared/api/httpClient.test.ts
- tests/performance/super-admin-platform-smoke.k6.js
- tests/performance/super-admin-scale-seed-sql.mjs

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/auth/mfa/verify

## Summary
- Purpose: Verify MFA challenge and issue session tokens.
- Current status: CURRENT_IMPLEMENTED
- Module: Auth
- Role audience: GUEST
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java method verifyMfa
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: No token for public auth/invitation flow.
- Roles allowed: GUEST
- Permissions required: PUBLIC_AUTH_FLOW
- MFA required: No role-level MFA requirement found.
- Scope required: public/auth flow
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: Yes for public/auth only
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | No | Bearer <access-token> | JWT issued by auth flow. |
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
  "challengeId": "challenge-id",
  "code": "123456"
}
```

## Field validation
- CURRENT_PARTIAL: DTO and service validation exists by module; validation annotations are not uniformly discoverable in every request record.
- IDs must resolve to resources inside public/auth flow scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/auth/mfa/verify" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"challengeId\":\"challenge-id\",\"code\":\"123456\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "accessToken": "jwt-or-null",
  "refreshToken": "refresh-or-null",
  "tokenType": "Bearer",
  "expiresAt": "2026-06-08T12:00:00Z",
  "user": {
    "userId": "id",
    "role": "GUEST"
  },
  "mfaRequired": false
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/auth/mfa/verify"
}
```

## Audit events
- MFA_CHALLENGE_VERIFIED

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
- backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
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
- backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java
- frontend/src/app/App.test.tsx
- frontend/src/features/auth/pages/LoginPage.test.tsx
- frontend/src/shared/api/httpClient.test.ts
- tests/performance/super-admin-platform-smoke.k6.js

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/auth/refresh

## Summary
- Purpose: POST /v1/auth/refresh in Auth.
- Current status: CURRENT_IMPLEMENTED
- Module: Auth
- Role audience: GUEST
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java method refresh
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: No token for public auth/invitation flow.
- Roles allowed: GUEST
- Permissions required: PUBLIC_AUTH_FLOW
- MFA required: No role-level MFA requirement found.
- Scope required: public/auth flow
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: Yes for public/auth only
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | No | Bearer <access-token> | JWT issued by auth flow. |
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
- IDs must resolve to resources inside public/auth flow scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/auth/refresh" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"refresh-token\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "accessToken": "jwt-or-null",
  "refreshToken": "refresh-or-null",
  "tokenType": "Bearer",
  "expiresAt": "2026-06-08T12:00:00Z",
  "user": {
    "userId": "id",
    "role": "GUEST"
  },
  "mfaRequired": false
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/auth/refresh"
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
- frontend/src/features/auth/api/authApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
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
- backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java
- frontend/src/app/App.test.tsx
- frontend/src/features/auth/pages/LoginPage.test.tsx
- frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx
- frontend/src/shared/api/httpClient.test.ts
- tests/performance/super-admin-platform-smoke.k6.js
- tests/performance/super-admin-scale-seed-sql.mjs

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/auth/reset-password

## Summary
- Purpose: POST /v1/auth/reset-password in Auth.
- Current status: CURRENT_IMPLEMENTED
- Module: Auth
- Role audience: GUEST
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/authApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java method resetPassword
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: No token for public auth/invitation flow.
- Roles allowed: GUEST
- Permissions required: PUBLIC_AUTH_FLOW
- MFA required: No role-level MFA requirement found.
- Scope required: public/auth flow
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: Yes for public/auth only
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | No | Bearer <access-token> | JWT issued by auth flow. |
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
- IDs must resolve to resources inside public/auth flow scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/auth/reset-password" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d "{\"example\":\"See backend request DTO for this endpoint.\"}"
```

## Success status code
- 200 OK or 201 Created depending controller/service flow

## Success response body
```json
{
  "accessToken": "jwt-or-null",
  "refreshToken": "refresh-or-null",
  "tokenType": "Bearer",
  "expiresAt": "2026-06-08T12:00:00Z",
  "user": {
    "userId": "id",
    "role": "GUEST"
  },
  "mfaRequired": false
}
```

## Response field descriptions
| Field | Description | Status |
| --- | --- | --- |
| items | Paged item list when PageResponse/list DTO is used. | n/a |
| page/size/totalItems/totalPages | Pagination metadata for broad list APIs. | n/a |
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
  "path": "/v1/auth/reset-password"
}
```

## Audit events
- PASSWORD_RESET_COMPLETED

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
- backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- CURRENT_PARTIAL: repository is module-specific or differently named.

## Tests that cover it
- backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java
- backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java
- backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
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
- backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java
- backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java
- backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java
- backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java
- backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java
- backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java
- frontend/src/app/App.test.tsx
- frontend/src/features/auth/pages/LoginPage.test.tsx
- frontend/src/shared/api/httpClient.test.ts
- tests/performance/super-admin-platform-smoke.k6.js

## Gaps/TODOs
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.


# POST /v1/invitations/accept

## Summary
- Purpose: POST /v1/invitations/accept in Platform.
- Current status: CURRENT_IMPLEMENTED
- Module: Platform
- Role audience: GUEST
- Frontend used: CURRENT_IMPLEMENTED in frontend/src/features/auth/api/invitationsApi.ts
- Backend implemented: backend/src/main/java/com/cloudcampus/identity/auth/invitation/InvitationController.java method accept
- Planned/future: No separate planned endpoint; gaps listed below.

## Authorization
- Authentication required: No token for public auth/invitation flow.
- Roles allowed: GUEST
- Permissions required: PUBLIC_AUTH_FLOW
- MFA required: No role-level MFA requirement found.
- Scope required: public/auth flow
- Super Admin allowed: No
- Tenant Admin allowed: No
- School Admin allowed: No
- Teacher allowed: No
- Student allowed: No
- Parent allowed: No
- Finance Staff allowed: No
- Office Staff allowed: No
- Guest allowed: Yes for public/auth only
- System allowed: No interactive access
- AI Agent allowed: No interactive access
- Header spoofing protection: CURRENT_IMPLEMENTED for protected tenant/school headers through ClientTenantContextSpoofingFilter.

## Request
### Headers
| Header | Required | Example | Notes |
| --- | --- | --- | --- |
| Authorization | No | Bearer <access-token> | JWT issued by auth flow. |
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
- IDs must resolve to resources inside public/auth flow scope.
- Enum/status fields must use values in docs/STATUS_ENUMS.md.

## Example request
```bash
curl -X POST "http://127.0.0.1:18080/v1/invitations/accept" \
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
  "path": "/v1/invitations/accept"
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
- frontend/src/features/auth/api/invitationsApi.ts

## Backend controller file
- backend/src/main/java/com/cloudcampus/identity/auth/invitation/InvitationController.java

## Backend service file
- CURRENT_PARTIAL: service may be differently named or logic may be delegated.

## Repository/query source
- backend/src/main/java/com/cloudcampus/identity/auth/invitation/InvitationRepository.java

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
- backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java
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
- CURRENT_IMPLEMENTED: frontend/backend path detected.
- PLANNED_RECOMMENDED: add OpenAPI contract schemas and generated examples.
