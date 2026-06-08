<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# TENANT_ADMIN

## 1. Role summary
| Item | Detail | Status |
| --- | --- | --- |
| Human-readable name | Tenant Admin | CURRENT_IMPLEMENTED |
| Role enum value | TENANT_ADMIN | CURRENT_IMPLEMENTED |
| Role type | human | CURRENT_IMPLEMENTED |
| Login allowed | yes for authenticated roles; GUEST is public/auth only | CURRENT_IMPLEMENTED |
| MFA required | yes | CURRENT_IMPLEMENTED |
| Scope level | tenant | CURRENT_IMPLEMENTED |
| Typical users | Trust/group organization administrators | CURRENT_IMPLEMENTED |
| Business purpose | Manage schools, tenant users, organization settings, usage, subscription view, and tenant reports. | CURRENT_IMPLEMENTED |
| Risk level | high | CURRENT_IMPLEMENTED |
| Data sensitivity level | tenant-wide school, user, report, and subscription data | CURRENT_IMPLEMENTED |

## 2. Role responsibilities
- CURRENT_IMPLEMENTED: Use visible screens: Dashboard, Schools, School Admins, Reports, Subscription Usage, Settings.
- CURRENT_IMPLEMENTED: Call 19 backend endpoint(s) inferred for this role/scope.
- CURRENT_IMPLEMENTED: Quick actions: Add school - Add a new campus safely; Invite School Admin - Grant school access; View reports - Compare school performance; Subscription usage - Review plan limits.
- CURRENT_PARTIAL: Some responsibilities depend on module APIs/UI surfaces and are listed in matrices.
- CURRENT_IMPLEMENTED: Operate only inside documented scope.

## 3. Role restrictions
- CURRENT_IMPLEMENTED: Must not access resources outside tenant scope.
- CURRENT_IMPLEMENTED: Must not spoof tenant/school headers or use another user session.
- CURRENT_IMPLEMENTED: Must not access /v1/super-admin APIs unless role is SUPER_ADMIN.
- CURRENT_PARTIAL: Fine-grained denials are module-specific.
- CURRENT_PARTIAL: Parent-child restrictions apply where guardian endpoints are used.
- PLANNED_RECOMMENDED: Add endpoint-level MFA freshness for high-risk exports, finance, access-control, and AI execution.

## 4. Tenant/school/class/student scope rules
- tenant_id rules: CURRENT_IMPLEMENTED derived from authenticated user/server context.
- school_id rules: CURRENT_IMPLEMENTED broad school visibility by role.
- class/section/subject rules: CURRENT_PARTIAL module-specific.
- own-student record rules: CURRENT_PARTIAL applies to student self APIs.
- parent-child linked access rules: CURRENT_PARTIAL applies when guardian endpoints are used.
- platform-wide rules: CURRENT_IMPLEMENTED denied for non-SUPER_ADMIN services.

## 5. Permissions
| Permission code | Category | Allowed by default | Scope | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| APPROVE_AI_RECOMMENDATIONS | AI | Yes | TENANT | HIGH | Approve scoped AI recommendations. |
| EXPORT_TENANT_REPORTS | TENANT | Yes | TENANT | HIGH | Export tenant-level reports. |
| MANAGE_AI_POLICY | AI | Yes | TENANT | HIGH | Manage AI policies. |
| MANAGE_TENANT | TENANT | Yes | TENANT | HIGH | Manage tenant-level business data. |
| MANAGE_TENANT_AI_POLICY | TENANT | Yes | TENANT | HIGH | Configure tenant AI policy when allowed. |
| MANAGE_TENANT_SCHOOLS | TENANT | Yes | TENANT | HIGH | Create and manage schools under tenant. |
| MANAGE_TENANT_SETTINGS | TENANT | Yes | TENANT | HIGH | Update tenant settings. |
| MANAGE_TENANT_USERS | TENANT | Yes | TENANT | HIGH | Manage tenant users and admin assignments. |
| REJECT_AI_RECOMMENDATIONS | AI | Yes | TENANT | HIGH | Reject scoped AI recommendations. |
| VIEW_AI_RECOMMENDATIONS | AI | Yes | TENANT | MEDIUM | View scoped AI recommendations. |
| VIEW_AI_USAGE | AI | Yes | TENANT | MEDIUM | View AI usage and budget. |
| VIEW_TENANT_AUDIT | TENANT | Yes | TENANT | HIGH | View tenant audit events. |
| VIEW_TENANT_DASHBOARD | TENANT | Yes | TENANT | LOW | View tenant dashboard and rollups. |
| VIEW_TENANT_REPORTS | TENANT | Yes | TENANT | MEDIUM | View tenant-level reports. |

## 6. Navigation and screens
| Screen | Route/nav id | Visible? | Required permission | API used | Current status |
| --- | --- | --- | --- | --- | --- |
| Dashboard | dashboard | Yes | SESSION_SELF_MANAGE | /v1/tenant-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| Schools | schools | Yes | SCREEN_SCHOOLS | /v1/me/schools/{schoolId}/activate | CURRENT_IMPLEMENTED |
| School Admins | admins | Yes | SCREEN_ADMINS | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | CURRENT_IMPLEMENTED |
| Reports | reports | Yes | SCREEN_REPORTS | /v1/tenant-admin/reports/schools/{schoolId}/summary | CURRENT_IMPLEMENTED |
| Subscription Usage | usage | Yes | SCREEN_USAGE | /v1/tenant-admin/subscription/usage | CURRENT_IMPLEMENTED |
| Settings | settings | Yes | SCREEN_SETTINGS | /v1/tenant-admin/settings | CURRENT_IMPLEMENTED |

## 7. Dashboard details
- dashboard title: Tenant Admin Overview
- widgets/cards: Add school, Invite School Admin, View reports, Subscription usage
- metrics: CURRENT_IMPLEMENTED from role dashboard summary endpoint.
- API source: /v1/tenant-admin/dashboard/summary
- loading state: CURRENT_IMPLEMENTED shell and page loading states.
- empty state: CURRENT_IMPLEMENTED generic empty states; module-specific quality CURRENT_PARTIAL.
- error state: CURRENT_IMPLEMENTED API/form error panels.
- refresh behavior: CURRENT_PARTIAL manual navigation/refetch; no uniform live refresh found.

## 8. API access matrix
| Method | Endpoint | Allowed? | Required permission | Required scope | Request params/body | Response DTO | Audit event | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | PASSWORD_CHANGED | CURRENT_IMPLEMENTED |
| POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | USER_LOGGED_OUT | CURRENT_IMPLEMENTED |
| POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | query params | CurrentUser response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | query params | CurrentUser response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/dashboard/summary | Yes | TENANT_VIEW | tenant | query params | DashboardSummary response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | Yes | VIEW_REPORTS | tenant | query params | TenantAdminReport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/reports/summary | Yes | VIEW_REPORTS | tenant | query params | TenantAdminReport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | Yes | SCHOOL_MANAGE | tenant | path params / JSON body | TenantAdminSchool response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | Yes | SCHOOL_MANAGE | tenant | path params / JSON body | TenantAdminSchool response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | Yes | SCHOOL_MANAGE | tenant | path params / JSON body | TenantAdminSchool response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/schools/{schoolId}/admins | Yes | SCHOOL_VIEW | tenant | query params | TenantAdminSchool response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/tenant-admin/schools/{schoolId}/deactivate | Yes | SCHOOL_MANAGE | tenant | path params / JSON body | TenantAdminSchool response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| PATCH | /v1/tenant-admin/schools/{schoolId} | Yes | SCHOOL_MANAGE | tenant | path params / JSON body | TenantAdminSchool response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/schools | Yes | SCHOOL_VIEW | tenant | query params | TenantAdminSchool response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/tenant-admin/schools | Yes | SCHOOL_MANAGE | tenant | path params / JSON body | TenantAdminSchool response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/settings | Yes | SETTINGS_VIEW | tenant | query params | TenantAdminSettings response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PATCH | /v1/tenant-admin/settings | Yes | SETTINGS_MANAGE | tenant | path params / JSON body | TenantAdminSettings response/DTO | CURRENT_PARTIAL settings audit | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/subscription/usage | Yes | TENANT_VIEW | tenant | query params | TenantAdminSettings response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |

## 9. Detailed API behavior
### POST /v1/me/change-password
- Method: POST
- Full endpoint: /v1/me/change-password
- Purpose: POST /v1/me/change-password in Me / Session.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: PASSWORD_CHANGED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/me/logout
- Method: POST
- Full endpoint: /v1/me/logout
- Purpose: POST /v1/me/logout in Me / Session.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"refreshToken":"refresh-token"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: USER_LOGGED_OUT
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/me/schools/{schoolId}/activate
- Method: POST
- Full endpoint: /v1/me/schools/{schoolId}/activate
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/me/schools
- Method: GET
- Full endpoint: /v1/me/schools
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/me
- Method: GET
- Full endpoint: /v1/me
- Purpose: Hydrate current user and active school context.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"accessToken":"jwt-or-null","refreshToken":"refresh-or-null","tokenType":"Bearer","expiresAt":"2026-06-08T12:00:00Z","user":{"userId":"id","role":"SUPER_ADMIN"},"mfaRequired":false}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/shared/api/apiBase.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/tenant-admin/dashboard/summary
- Method: GET
- Full endpoint: /v1/tenant-admin/dashboard/summary
- Purpose: Return role dashboard metrics, alerts, and activity.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: TENANT_VIEW
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"metrics":[],"alerts":[],"activity":[]}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/portal/api/dashboardApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/portal/dashboard/DashboardSummaryController.java
- Backend service file: backend/src/main/java/com/cloudcampus/portal/dashboard/DashboardSummaryService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/tenant-admin/reports/schools/{schoolId}/summary
- Method: GET
- Full endpoint: /v1/tenant-admin/reports/schools/{schoolId}/summary
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: VIEW_REPORTS
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantReportsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/tenant-admin/reports/summary
- Method: GET
- Full endpoint: /v1/tenant-admin/reports/summary
- Purpose: GET /v1/tenant-admin/reports/summary in Report / Export.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: VIEW_REPORTS
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantReportsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### DELETE /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access
- Method: DELETE
- Full endpoint: /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_MANAGE
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId, userId
- Query params: none by default
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"message":"Deleted or deactivated"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation
- Method: POST
- Full endpoint: /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_MANAGE
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId, userId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/tenant-admin/schools/{schoolId}/admins/invite
- Method: POST
- Full endpoint: /v1/tenant-admin/schools/{schoolId}/admins/invite
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_MANAGE
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/tenant-admin/schools/{schoolId}/admins
- Method: GET
- Full endpoint: /v1/tenant-admin/schools/{schoolId}/admins
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_VIEW
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/tenant-admin/schools/{schoolId}/deactivate
- Method: POST
- Full endpoint: /v1/tenant-admin/schools/{schoolId}/deactivate
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_MANAGE
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/tenant-admin/schools/{schoolId}
- Method: PATCH
- Full endpoint: /v1/tenant-admin/schools/{schoolId}
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_MANAGE
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/tenant-admin/schools
- Method: GET
- Full endpoint: /v1/tenant-admin/schools
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_VIEW
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/tenant-admin/schools
- Method: POST
- Full endpoint: /v1/tenant-admin/schools
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SCHOOL_MANAGE
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSchoolsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/tenant-admin/settings
- Method: GET
- Full endpoint: /v1/tenant-admin/settings
- Purpose: Read settings.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SETTINGS_VIEW
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSettingsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/tenant-admin/settings
- Method: PATCH
- Full endpoint: /v1/tenant-admin/settings
- Purpose: Update settings.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: SETTINGS_MANAGE
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"key":"value"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: CURRENT_PARTIAL settings audit
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSettingsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/tenant-admin/subscription/usage
- Method: GET
- Full endpoint: /v1/tenant-admin/subscription/usage
- Purpose: GET /v1/tenant-admin/subscription/usage in Tenant Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: TENANT_ADMIN
- Permission required: TENANT_VIEW
- Scope checks: tenant
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/tenant-admin/api/tenantSettingsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

## 10. Workflows
| Flow | Actor | Preconditions | Trigger | State changes | Audit events | Recovery behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Tenant administration | TENANT_ADMIN | Tenant session and MFA | Open schools/admins/reports/settings | Tenant-scoped school/user/settings/report data changes | SCHOOL_* / TENANT_* where services emit | Cross-tenant access forbidden |

### Workflow detail notes
- UI screen: CURRENT_IMPLEMENTED screens are listed in section 6.
- API sequence: login/MFA if needed, /v1/me hydration, screen-specific reads, command write, refetch/state update.
- Request/response examples: see section 9 and docs/api/*.md.
- Notifications created: CURRENT_PARTIAL module-specific.
- Background jobs created: CURRENT_IMPLEMENTED for report exports/bulk jobs where endpoints exist.
- Failure cases: 400/401/403/404/409/429/500 depending validation/auth/scope/conflict/rate limit.
- Recovery behavior: retry safe reads; commands should use service transaction rollback or explicit job failure state.

## 11. AI recommendation and automation behavior
| Capability | Status | Notes |
| --- | --- | --- |
| Can view AI recommendations? | NOT_FOUND_IN_CODEBASE | Role AI panels/API endpoints where permitted. |
| Can create AI recommendations? | CURRENT_PARTIAL | Super Admin governance can create; AI_AGENT should be internal/non-login. |
| Can approve AI recommendations? | PLANNED_RECOMMENDED | High impact should require human approval. |
| Can reject AI recommendations? | CURRENT_PARTIAL | Reject/dismiss APIs exist by flow. |
| Can execute approved AI action? | CURRENT_PARTIAL | Execution must remain policy-controlled. |
| Can configure AI policy? | NOT_FOUND_IN_CODEBASE | Platform policy endpoints are Super Admin in current backend. |
| Can run automation? | PLANNED_RECOMMENDED | Automation rules/runs exist. |
| Can approve automation? | PLANNED_RECOMMENDED | Approval matrix in docs/ai/AI_APPROVAL_MATRIX.md. |
| Allowed risk levels | LOW/MEDIUM recommended; HIGH requires approval | CURRENT_PARTIAL enforcement by service. |
| Recommendation types allowed | Role-specific AI types for academic, finance, office, parent/student study help. | CURRENT_PARTIAL |
| What AI must never do | Direct sensitive mutation without approval, cross-tenant access, hidden finance/marks/subscription/user changes. | PLANNED_RECOMMENDED |
| Human approval rules | High-risk and sensitive actions require human approval. | CURRENT_PARTIAL |

## 12. Notification behavior
| Behavior | Status | Details |
| --- | --- | --- |
| Notifications this role can receive | CURRENT_PARTIAL | Delivery records exist; role inbox UI varies. |
| Notifications this role can send | NOT_FOUND_IN_CODEBASE | Notice/notification sending depends on module endpoints. |
| Message approval requirement | CURRENT_PARTIAL | AI-drafted messages should require human approval. |
| Recipient masking rules | CURRENT_IMPLEMENTED | Notification delivery DTO exposes maskedRecipient. |
| Delivery audit | CURRENT_PARTIAL | Delivery rows track status/failure; explicit audit varies. |
| Retry behavior | CURRENT_PARTIAL | Outbox/retry infrastructure exists; scheduler policy should be verified. |

## 13. Reports and exports
| Report/export item | Status | Notes |
| --- | --- | --- |
| Reports visible | CURRENT_IMPLEMENTED | Reports nav/screen visibility from App.tsx. |
| Export permissions | PLANNED_RECOMMENDED | Export endpoints documented in Report API. |
| Async export behavior | CURRENT_IMPLEMENTED | Report export jobs/files and worker classes exist. |
| Sensitive field masking | CURRENT_PARTIAL | Must be reviewed per report/export DTO. |
| Download permission | PLANNED_RECOMMENDED | School export download exists; platform download varies. |
| Audit requirement | CURRENT_IMPLEMENTED | REPORT_EXPORT_* enum values exist. |
| MFA-fresh requirement | CURRENT_PARTIAL | Login MFA exists for privileged roles; endpoint freshness not uniform. |

## 14. Security risks and controls
- vertical privilege escalation risks: CURRENT_IMPLEMENTED Super Admin service guards; PLANNED_RECOMMENDED full role-matrix tests.
- horizontal tenant/school access risks: CURRENT_IMPLEMENTED scope patterns and spoofing filter; CURRENT_PARTIAL per-module tests.
- sensitive data exposure risks: CURRENT_PARTIAL field masking review needed.
- AI risks: CURRENT_PARTIAL governance exists; central risk approval policy recommended.
- payment/finance risks: CURRENT_IMPLEMENTED finance audit/API foundations; PLANNED_RECOMMENDED MFA freshness/refund approvals.
- mitigation in current code: JWT auth, MFA roles, non-login system actors, audit logging, role/scope services, constraints/indexes.
- missing controls if any: OpenAPI, endpoint rate limits, field-level privacy tests, comprehensive role-permission tests.

## 15. Test cases
| Test case | Type | Preconditions | Steps | Expected result | Current coverage |
| --- | --- | --- | --- | --- | --- |
| TENANT_ADMIN login/session | Integration/UI | Login allowed or public flow | Login/MFA/hydrate /v1/me | Correct role/token/scope | CURRENT_PARTIAL |
| TENANT_ADMIN forbidden cross-role API | Security | Authenticated session | Call unauthorized endpoint | 403/401 | CURRENT_PARTIAL |
| TENANT_ADMIN scope isolation | Security | Two tenants/schools/children/classes | Access outside scope | 403/404 | CURRENT_PARTIAL |
| TENANT_ADMIN dashboard load | UI/API | Authenticated session | Open dashboard | Metrics or empty state | CURRENT_PARTIAL |
| TENANT_ADMIN AI guard | Security/API | AI policy states | View/approve/execute | Only allowed action proceeds | CURRENT_PARTIAL |
| TENANT_ADMIN report/export privacy | Security/API | Sensitive data exists | Request report/export | Scoped masked data only | PLANNED_RECOMMENDED |

## 16. Edge cases
- missing token: CURRENT_IMPLEMENTED protected APIs return 401.
- expired session: CURRENT_IMPLEMENTED JWT/session services reject expired tokens; refresh flow exists.
- inactive user: CURRENT_IMPLEMENTED auth blocks inactive users.
- suspended tenant: CURRENT_PARTIAL tenant status modeled; every endpoint should verify behavior.
- inactive school: CURRENT_PARTIAL school active checks are module-specific.
- no active school context: CURRENT_IMPLEMENTED/CURRENT_PARTIAL school APIs require active/allowed school.
- user with multiple roles: CURRENT_IMPLEMENTED role assignment model exists.
- user with conflicting permission override: CURRENT_IMPLEMENTED override model exists; test edge behavior.
- user linked to multiple schools: CURRENT_IMPLEMENTED allowed school list and activation endpoint exist.
- parent with multiple children: CURRENT_IMPLEMENTED guardian/child models exist; UI behavior CURRENT_PARTIAL.
- teacher with multiple class assignments: CURRENT_IMPLEMENTED teacher assignment model exists.
- zero records: CURRENT_IMPLEMENTED/CURRENT_PARTIAL empty states.
- large data pagination: CURRENT_IMPLEMENTED indexes/page responses; UI often uses fixed size.
- invalid filters: CURRENT_PARTIAL endpoint-specific validation.
- deleted/inactive linked records: CURRENT_PARTIAL deactivation/read visibility must be verified.

## 17. Open gaps
| Gap type | Status | Detail |
| --- | --- | --- |
| missing API | CURRENT_PARTIAL | See docs/gaps/CURRENT_GAPS_AND_TODOS.md. |
| missing UI | BACKEND_EXISTS_UI_NOT_SURFACED | Backend endpoints without frontend callers are listed in docs/API_INDEX.md. |
| missing tests | CURRENT_PARTIAL | Direct endpoint tests are not present for every controller. |
| missing validation | CURRENT_PARTIAL | DTO validation not uniform. |
| missing audit | CURRENT_PARTIAL | Read APIs and some settings/list interactions may not audit. |
| performance risk | CURRENT_PARTIAL | Broad lists need page max and explain plans. |
| security risk | CURRENT_PARTIAL | MFA freshness and field privacy checks recommended. |
| documentation uncertainty | CURRENT_PARTIAL | Generated from static code scan; runtime contract tests should verify. |

## 18. Final checklist
| Item | Status | Notes |
| --- | --- | --- |
| Role enum documented | CURRENT_IMPLEMENTED | TENANT_ADMIN |
| Login/MFA behavior documented | CURRENT_IMPLEMENTED | login / MFA |
| Scope documented | CURRENT_IMPLEMENTED | tenant |
| Permissions documented | CURRENT_IMPLEMENTED | 14 rows |
| Navigation documented | CURRENT_IMPLEMENTED | 6 screens |
| APIs documented | CURRENT_IMPLEMENTED | 19 endpoints |
| AI behavior documented | CURRENT_IMPLEMENTED | Section 11 |
| Notification behavior documented | CURRENT_IMPLEMENTED | Section 12 |
| Reports/exports documented | CURRENT_IMPLEMENTED | Section 13 |
| Security controls documented | CURRENT_IMPLEMENTED | Section 14 |
| Tests and gaps documented | CURRENT_IMPLEMENTED | Sections 15 and 17 |
