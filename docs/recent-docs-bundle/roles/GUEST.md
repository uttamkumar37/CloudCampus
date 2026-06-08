<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# GUEST

## 1. Role summary
| Item | Detail | Status |
| --- | --- | --- |
| Human-readable name | Guest | CURRENT_IMPLEMENTED |
| Role enum value | GUEST | CURRENT_IMPLEMENTED |
| Role type | public | CURRENT_IMPLEMENTED |
| Login allowed | yes for authenticated roles; GUEST is public/auth only | CURRENT_IMPLEMENTED |
| MFA required | no/configurable; SYSTEM and AI_AGENT are non-login | CURRENT_IMPLEMENTED |
| Scope level | public | CURRENT_IMPLEMENTED |
| Typical users | Unauthenticated visitor, applicant, demo user | CURRENT_IMPLEMENTED |
| Business purpose | Use public/login/invitation/application entry points only. | CURRENT_IMPLEMENTED |
| Risk level | low | CURRENT_IMPLEMENTED |
| Data sensitivity level | public or self-submitted data only | CURRENT_IMPLEMENTED |

## 2. Role responsibilities
- CURRENT_IMPLEMENTED: Use visible screens: Dashboard.
- CURRENT_IMPLEMENTED: Call 6 backend endpoint(s) inferred for this role/scope.
- CURRENT_IMPLEMENTED: Quick actions: Open dashboard - Review available access.
- CURRENT_PARTIAL: Some responsibilities depend on module APIs/UI surfaces and are listed in matrices.
- CURRENT_IMPLEMENTED: Operate only inside documented scope.

## 3. Role restrictions
- CURRENT_IMPLEMENTED: Must not access resources outside public scope.
- CURRENT_IMPLEMENTED: Must not spoof tenant/school headers or use another user session.
- CURRENT_IMPLEMENTED: Must not access /v1/super-admin APIs unless role is SUPER_ADMIN.
- CURRENT_PARTIAL: Fine-grained denials are module-specific.
- CURRENT_PARTIAL: Parent-child restrictions apply where guardian endpoints are used.
- PLANNED_RECOMMENDED: Add endpoint-level MFA freshness for high-risk exports, finance, access-control, and AI execution.

## 4. Tenant/school/class/student scope rules
- tenant_id rules: NOT_FOUND_IN_CODEBASE for internal tenant scope; public/auth only.
- school_id rules: CURRENT_PARTIAL bounded by policy/public/system path.
- class/section/subject rules: CURRENT_PARTIAL module-specific.
- own-student record rules: CURRENT_PARTIAL applies to student self APIs.
- parent-child linked access rules: CURRENT_PARTIAL applies when guardian endpoints are used.
- platform-wide rules: CURRENT_IMPLEMENTED denied for non-SUPER_ADMIN services.

## 5. Permissions
| Permission code | Category | Allowed by default | Scope | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| MANAGE_ENQUIRIES | OFFICE | Yes | SCHOOL | LOW | Manage admission enquiries. |

## 6. Navigation and screens
| Screen | Route/nav id | Visible? | Required permission | API used | Current status |
| --- | --- | --- | --- | --- | --- |
| Dashboard | dashboard | Yes | SESSION_SELF_MANAGE | /v1/me | CURRENT_IMPLEMENTED |

## 7. Dashboard details
- dashboard title: Guest Overview
- widgets/cards: Open dashboard
- metrics: CURRENT_PARTIAL from /v1/me/session shell.
- API source: /v1/me
- loading state: CURRENT_IMPLEMENTED shell and page loading states.
- empty state: CURRENT_IMPLEMENTED generic empty states; module-specific quality CURRENT_PARTIAL.
- error state: CURRENT_IMPLEMENTED API/form error panels.
- refresh behavior: CURRENT_PARTIAL manual navigation/refetch; no uniform live refresh found.

## 8. API access matrix
| Method | Endpoint | Allowed? | Required permission | Required scope | Request params/body | Response DTO | Audit event | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | /v1/auth/forgot-password | Yes | PUBLIC_AUTH_FLOW | public/auth flow | path params / JSON body | Auth response/DTO | PASSWORD_RESET_REQUESTED | CURRENT_IMPLEMENTED |
| POST | /v1/auth/login | Yes | PUBLIC_AUTH_FLOW | public/auth flow | path params / JSON body | Auth response/DTO | MFA_CHALLENGE_CREATED for MFA roles; session issuance is not a separate enum. | CURRENT_IMPLEMENTED |
| POST | /v1/auth/mfa/verify | Yes | PUBLIC_AUTH_FLOW | public/auth flow | path params / JSON body | Auth response/DTO | MFA_CHALLENGE_VERIFIED | CURRENT_IMPLEMENTED |
| POST | /v1/auth/refresh | Yes | PUBLIC_AUTH_FLOW | public/auth flow | path params / JSON body | Auth response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/auth/reset-password | Yes | PUBLIC_AUTH_FLOW | public/auth flow | path params / JSON body | Auth response/DTO | PASSWORD_RESET_COMPLETED | CURRENT_IMPLEMENTED |
| POST | /v1/invitations/accept | Yes | PUBLIC_AUTH_FLOW | public/auth flow | path params / JSON body | Invitation response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |

## 9. Detailed API behavior
### POST /v1/auth/forgot-password
- Method: POST
- Full endpoint: /v1/auth/forgot-password
- Purpose: POST /v1/auth/forgot-password in Auth.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: No token for public auth flow
- Role required: GUEST
- Permission required: PUBLIC_AUTH_FLOW
- Scope checks: public/auth flow
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"accessToken":"jwt-or-null","refreshToken":"refresh-or-null","tokenType":"Bearer","expiresAt":"2026-06-08T12:00:00Z","user":{"userId":"id","role":"GUEST"},"mfaRequired":false}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: PASSWORD_RESET_REQUESTED
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
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/auth/login
- Method: POST
- Full endpoint: /v1/auth/login
- Purpose: Start interactive login and return MFA challenge or session tokens.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: No token for public auth flow
- Role required: GUEST
- Permission required: PUBLIC_AUTH_FLOW
- Scope checks: public/auth flow
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"email":"user@example.com","password":"********"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"accessToken":"jwt-or-null","refreshToken":"refresh-or-null","tokenType":"Bearer","expiresAt":"2026-06-08T12:00:00Z","user":{"userId":"id","role":"GUEST"},"mfaRequired":false}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: MFA_CHALLENGE_CREATED for MFA roles; session issuance is not a separate enum.
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
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/auth/mfa/verify
- Method: POST
- Full endpoint: /v1/auth/mfa/verify
- Purpose: Verify MFA challenge and issue session tokens.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: No token for public auth flow
- Role required: GUEST
- Permission required: PUBLIC_AUTH_FLOW
- Scope checks: public/auth flow
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"challengeId":"challenge-id","code":"123456"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"accessToken":"jwt-or-null","refreshToken":"refresh-or-null","tokenType":"Bearer","expiresAt":"2026-06-08T12:00:00Z","user":{"userId":"id","role":"GUEST"},"mfaRequired":false}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: MFA_CHALLENGE_VERIFIED
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
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/auth/refresh
- Method: POST
- Full endpoint: /v1/auth/refresh
- Purpose: POST /v1/auth/refresh in Auth.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: No token for public auth flow
- Role required: GUEST
- Permission required: PUBLIC_AUTH_FLOW
- Scope checks: public/auth flow
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"refreshToken":"refresh-token"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"accessToken":"jwt-or-null","refreshToken":"refresh-or-null","tokenType":"Bearer","expiresAt":"2026-06-08T12:00:00Z","user":{"userId":"id","role":"GUEST"},"mfaRequired":false}
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
- Frontend caller file: frontend/src/features/auth/api/authApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/auth/reset-password
- Method: POST
- Full endpoint: /v1/auth/reset-password
- Purpose: POST /v1/auth/reset-password in Auth.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: No token for public auth flow
- Role required: GUEST
- Permission required: PUBLIC_AUTH_FLOW
- Scope checks: public/auth flow
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"accessToken":"jwt-or-null","refreshToken":"refresh-or-null","tokenType":"Bearer","expiresAt":"2026-06-08T12:00:00Z","user":{"userId":"id","role":"GUEST"},"mfaRequired":false}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: PASSWORD_RESET_COMPLETED
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
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/AuthController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/invitations/accept
- Method: POST
- Full endpoint: /v1/invitations/accept
- Purpose: POST /v1/invitations/accept in Platform.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: GUEST
- Permission required: PUBLIC_AUTH_FLOW
- Scope checks: public/auth flow
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
- Frontend caller file: frontend/src/features/auth/api/invitationsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/invitation/InvitationController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

## 10. Workflows
| Flow | Actor | Preconditions | Trigger | State changes | Audit events | Recovery behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Public/auth access | GUEST | No token | Login/invitation/public entry | No internal records exposed | Auth/invitation audit only | Protected APIs return 401 |

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
| Notifications this role can receive | NOT_FOUND_IN_CODEBASE | Delivery records exist; role inbox UI varies. |
| Notifications this role can send | NOT_FOUND_IN_CODEBASE | Notice/notification sending depends on module endpoints. |
| Message approval requirement | CURRENT_PARTIAL | AI-drafted messages should require human approval. |
| Recipient masking rules | CURRENT_IMPLEMENTED | Notification delivery DTO exposes maskedRecipient. |
| Delivery audit | CURRENT_PARTIAL | Delivery rows track status/failure; explicit audit varies. |
| Retry behavior | CURRENT_PARTIAL | Outbox/retry infrastructure exists; scheduler policy should be verified. |

## 13. Reports and exports
| Report/export item | Status | Notes |
| --- | --- | --- |
| Reports visible | CURRENT_PARTIAL | Reports nav/screen visibility from App.tsx. |
| Export permissions | PLANNED_RECOMMENDED | Export endpoints documented in Report API. |
| Async export behavior | CURRENT_IMPLEMENTED | Report export jobs/files and worker classes exist. |
| Sensitive field masking | CURRENT_PARTIAL | Must be reviewed per report/export DTO. |
| Download permission | PLANNED_RECOMMENDED | School export download exists; platform download varies. |
| Audit requirement | CURRENT_IMPLEMENTED | REPORT_EXPORT_* enum values exist. |
| MFA-fresh requirement | PLANNED_RECOMMENDED | Login MFA exists for privileged roles; endpoint freshness not uniform. |

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
| GUEST login/session | Integration/UI | Login allowed or public flow | Login/MFA/hydrate /v1/me | Correct role/token/scope | CURRENT_PARTIAL |
| GUEST forbidden cross-role API | Security | Authenticated session | Call unauthorized endpoint | 403/401 | CURRENT_PARTIAL |
| GUEST scope isolation | Security | Two tenants/schools/children/classes | Access outside scope | 403/404 | CURRENT_PARTIAL |
| GUEST dashboard load | UI/API | Authenticated session | Open dashboard | Metrics or empty state | CURRENT_PARTIAL |
| GUEST AI guard | Security/API | AI policy states | View/approve/execute | Only allowed action proceeds | CURRENT_PARTIAL |
| GUEST report/export privacy | Security/API | Sensitive data exists | Request report/export | Scoped masked data only | PLANNED_RECOMMENDED |

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
| Role enum documented | CURRENT_IMPLEMENTED | GUEST |
| Login/MFA behavior documented | CURRENT_IMPLEMENTED | login / no role MFA |
| Scope documented | CURRENT_IMPLEMENTED | public |
| Permissions documented | CURRENT_IMPLEMENTED | 1 rows |
| Navigation documented | CURRENT_IMPLEMENTED | 1 screens |
| APIs documented | CURRENT_IMPLEMENTED | 6 endpoints |
| AI behavior documented | CURRENT_IMPLEMENTED | Section 11 |
| Notification behavior documented | CURRENT_IMPLEMENTED | Section 12 |
| Reports/exports documented | CURRENT_IMPLEMENTED | Section 13 |
| Security controls documented | CURRENT_IMPLEMENTED | Section 14 |
| Tests and gaps documented | CURRENT_IMPLEMENTED | Sections 15 and 17 |
