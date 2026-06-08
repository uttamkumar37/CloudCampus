<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# STUDENT

## 1. Role summary
| Item | Detail | Status |
| --- | --- | --- |
| Human-readable name | Student | CURRENT_IMPLEMENTED |
| Role enum value | STUDENT | CURRENT_IMPLEMENTED |
| Role type | human | CURRENT_IMPLEMENTED |
| Login allowed | yes for authenticated roles; GUEST is public/auth only | CURRENT_IMPLEMENTED |
| MFA required | no/configurable; SYSTEM and AI_AGENT are non-login | CURRENT_IMPLEMENTED |
| Scope level | own record | CURRENT_IMPLEMENTED |
| Typical users | Students with portal login | CURRENT_IMPLEMENTED |
| Business purpose | View own profile, homework, results, fees, notices, attendance, timetable, and approved study recommendations. | CURRENT_IMPLEMENTED |
| Risk level | medium | CURRENT_IMPLEMENTED |
| Data sensitivity level | own academic, attendance, and fee data | CURRENT_IMPLEMENTED |

## 2. Role responsibilities
- CURRENT_IMPLEMENTED: Use visible screens: Dashboard, Homework, Results, Fees, Notices, Attendance, Timetable, AI Study Help.
- CURRENT_IMPLEMENTED: Call 27 backend endpoint(s) inferred for this role/scope.
- CURRENT_IMPLEMENTED: Quick actions: Submit homework - Track what is due; View results - Review published marks; AI study help - Open approved study tips.
- CURRENT_PARTIAL: Some responsibilities depend on module APIs/UI surfaces and are listed in matrices.
- CURRENT_IMPLEMENTED: Operate only inside documented scope.

## 3. Role restrictions
- CURRENT_IMPLEMENTED: Must not access resources outside own record scope.
- CURRENT_IMPLEMENTED: Must not spoof tenant/school headers or use another user session.
- CURRENT_IMPLEMENTED: Must not access /v1/super-admin APIs unless role is SUPER_ADMIN.
- CURRENT_PARTIAL: Fine-grained denials are module-specific.
- CURRENT_PARTIAL: Parent-child restrictions apply where guardian endpoints are used.
- PLANNED_RECOMMENDED: Add endpoint-level MFA freshness for high-risk exports, finance, access-control, and AI execution.

## 4. Tenant/school/class/student scope rules
- tenant_id rules: CURRENT_IMPLEMENTED derived from authenticated user/server context.
- school_id rules: CURRENT_IMPLEMENTED active or allowed school context required.
- class/section/subject rules: CURRENT_IMPLEMENTED via linked student record.
- own-student record rules: CURRENT_IMPLEMENTED own-record scoped.
- parent-child linked access rules: CURRENT_PARTIAL applies when guardian endpoints are used.
- platform-wide rules: CURRENT_IMPLEMENTED denied for non-SUPER_ADMIN services.

## 5. Permissions
| Permission code | Category | Allowed by default | Scope | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| VIEW_AI_RECOMMENDATIONS | AI | Yes | TENANT | MEDIUM | View scoped AI recommendations. |
| VIEW_OWN_ATTENDANCE | STUDENT_PARENT | Yes | SELF | LOW | View own attendance. |
| VIEW_OWN_HOMEWORK | STUDENT_PARENT | Yes | SELF | LOW | View own homework. |
| VIEW_OWN_PROFILE | STUDENT_PARENT | Yes | SELF | LOW | View own student/user profile. |
| VIEW_OWN_RESULTS | STUDENT_PARENT | Yes | SELF | LOW | View own results. |

## 6. Navigation and screens
| Screen | Route/nav id | Visible? | Required permission | API used | Current status |
| --- | --- | --- | --- | --- | --- |
| Dashboard | dashboard | Yes | SESSION_SELF_MANAGE | /v1/student/dashboard/summary | CURRENT_IMPLEMENTED |
| Homework | homework | Yes | SCREEN_HOMEWORK | /v1/student/homework/{homeworkId}/submissions | CURRENT_IMPLEMENTED |
| Results | results | Yes | SCREEN_RESULTS | /v1/student/results | CURRENT_IMPLEMENTED |
| Fees | fees | Yes | SCREEN_FEES | /v1/student/fees | CURRENT_IMPLEMENTED |
| Notices | notices | Yes | SCREEN_NOTICES | /v1/student/notices | CURRENT_IMPLEMENTED |
| Attendance | attendance | Yes | SCREEN_ATTENDANCE | /v1/student/attendance | CURRENT_IMPLEMENTED |
| Timetable | timetable | Yes | SCREEN_TIMETABLE | /v1/student/timetable | CURRENT_IMPLEMENTED |
| AI Study Help | ai-suggestions | Yes | SCREEN_AI_SUGGESTIONS | /v1/student/dashboard/summary | CURRENT_IMPLEMENTED |

## 7. Dashboard details
- dashboard title: Student Overview
- widgets/cards: Submit homework, View results, AI study help
- metrics: CURRENT_IMPLEMENTED from role dashboard summary endpoint.
- API source: /v1/student/dashboard/summary
- loading state: CURRENT_IMPLEMENTED shell and page loading states.
- empty state: CURRENT_IMPLEMENTED generic empty states; module-specific quality CURRENT_PARTIAL.
- error state: CURRENT_IMPLEMENTED API/form error panels.
- refresh behavior: CURRENT_PARTIAL manual navigation/refetch; no uniform live refresh found.

## 8. API access matrix
| Method | Endpoint | Allowed? | Required permission | Required scope | Request params/body | Response DTO | Audit event | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AUTOMATION_RULE_UPDATED | CURRENT_IMPLEMENTED |
| GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | query params | AiRecommendationPortal response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | query params | AiRecommendationPortal response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | query params | AiUsage response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | path params / JSON body | AiRetrieval response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_CREATED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_APPROVED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_DISMISSED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_EXECUTED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_REJECTED | CURRENT_IMPLEMENTED |
| GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | query params | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | CURRENT_IMPLEMENTED |
| GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | query params | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | CURRENT_IMPLEMENTED |
| POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | path params / JSON body | AiUsage response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | PASSWORD_CHANGED | CURRENT_IMPLEMENTED |
| POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | USER_LOGGED_OUT | CURRENT_IMPLEMENTED |
| POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | query params | CurrentUser response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | query params | CurrentUser response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/student/attendance | Yes | ATTENDANCE_VIEW | own record | query params | Attendance response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/student/dashboard/summary | Yes | STUDENT_PARENT_VIEW | own record | query params | DashboardSummary response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/student/fees | Yes | FINANCE_VIEW | own record | query params | Fee response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/student/homework/{homeworkId}/submissions | Yes | HOMEWORK_MANAGE | own record | path params / JSON body | Homework response/DTO | HOMEWORK_SUBMITTED | CURRENT_IMPLEMENTED |
| GET | /v1/student/homework | Yes | HOMEWORK_VIEW | own record | query params | Homework response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/student/notices | Yes | NOTICE_VIEW | own record | query params | Notice response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/student/profile | Yes | STUDENT_PARENT_VIEW | own record | query params | StudentLogin response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/student/results | Yes | EXAM_VIEW | own record | query params | Exam response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/student/timetable | Yes | TIMETABLE_VIEW | own record | query params | Timetable response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |

## 9. Detailed API behavior
### PATCH /v1/ai/automation-rules/{id}
- Method: PATCH
- Full endpoint: /v1/ai/automation-rules/{id}
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: MANAGE_AI_AUTOMATION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"name":"Rule name","enabled":false,"requiresApproval":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AUTOMATION_RULE_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/automation-rules
- Method: GET
- Full endpoint: /v1/ai/automation-rules
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_AUTOMATION
- Scope checks: role AI policy scope
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/automation-runs
- Method: GET
- Full endpoint: /v1/ai/automation-runs
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_AUTOMATION
- Scope checks: role AI policy scope
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/entitlement
- Method: GET
- Full endpoint: /v1/ai/entitlement
- Purpose: GET /v1/ai/entitlement in AI Recommendation / Automation.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: role AI policy scope
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/knowledge/search
- Method: POST
- Full endpoint: /v1/ai/knowledge/search
- Purpose: Return navigation-oriented search results.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: MANAGE_AI_POLICY
- Scope checks: role AI policy scope
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
- Search behavior: CURRENT_IMPLEMENTED navigation search
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRetrievalController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/accept
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/accept
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/approve
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/approve
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_APPROVED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/dismiss
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/dismiss
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_DISMISSED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/execute
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/execute
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_EXECUTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/reject
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/reject
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_REJECTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/recommendations/{id}
- Method: GET
- Full endpoint: /v1/ai/recommendations/{id}
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_RECOMMENDATIONS
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/recommendations
- Method: GET
- Full endpoint: /v1/ai/recommendations
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_RECOMMENDATIONS
- Scope checks: role AI policy scope
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
- Audit events: AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/usage/audit
- Method: POST
- Full endpoint: /v1/ai/usage/audit
- Purpose: Read audit logs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: MANAGE_AI_POLICY
- Scope checks: role AI policy scope
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

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

### GET /v1/student/attendance
- Method: GET
- Full endpoint: /v1/student/attendance
- Purpose: Read attendance data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: ATTENDANCE_VIEW
- Scope checks: own record
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/student/dashboard/summary
- Method: GET
- Full endpoint: /v1/student/dashboard/summary
- Purpose: Return role dashboard metrics, alerts, and activity.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: STUDENT_PARENT_VIEW
- Scope checks: own record
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
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/student/fees
- Method: GET
- Full endpoint: /v1/student/fees
- Purpose: Read finance data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: FINANCE_VIEW
- Scope checks: own record
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/student/homework/{homeworkId}/submissions
- Method: POST
- Full endpoint: /v1/student/homework/{homeworkId}/submissions
- Purpose: Create/submit homework data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: HOMEWORK_MANAGE
- Scope checks: own record
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: homeworkId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: HOMEWORK_SUBMITTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/student/homework
- Method: GET
- Full endpoint: /v1/student/homework
- Purpose: Read homework data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: HOMEWORK_VIEW
- Scope checks: own record
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/student/notices
- Method: GET
- Full endpoint: /v1/student/notices
- Purpose: Read notices.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: NOTICE_VIEW
- Scope checks: own record
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/student/profile
- Method: GET
- Full endpoint: /v1/student/profile
- Purpose: GET /v1/student/profile in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: STUDENT_PARENT_VIEW
- Scope checks: own record
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentLoginController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentLoginService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/student/results
- Method: GET
- Full endpoint: /v1/student/results
- Purpose: GET /v1/student/results in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: EXAM_VIEW
- Scope checks: own record
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/exam/ExamController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/exam/ExamService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/student/timetable
- Method: GET
- Full endpoint: /v1/student/timetable
- Purpose: GET /v1/student/timetable in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: STUDENT
- Permission required: TIMETABLE_VIEW
- Scope checks: own record
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
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/timetable/TimetableController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/timetable/TimetableService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

## 10. Workflows
| Flow | Actor | Preconditions | Trigger | State changes | Audit events | Recovery behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Student self-service | STUDENT | Student user link exists | Open own screens | Own data read or homework submission | HOMEWORK_SUBMITTED where applicable | Official record edits denied |

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
| Can view AI recommendations? | CURRENT_IMPLEMENTED | Role AI panels/API endpoints where permitted. |
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
| STUDENT login/session | Integration/UI | Login allowed or public flow | Login/MFA/hydrate /v1/me | Correct role/token/scope | CURRENT_PARTIAL |
| STUDENT forbidden cross-role API | Security | Authenticated session | Call unauthorized endpoint | 403/401 | CURRENT_PARTIAL |
| STUDENT scope isolation | Security | Two tenants/schools/children/classes | Access outside scope | 403/404 | CURRENT_PARTIAL |
| STUDENT dashboard load | UI/API | Authenticated session | Open dashboard | Metrics or empty state | CURRENT_PARTIAL |
| STUDENT AI guard | Security/API | AI policy states | View/approve/execute | Only allowed action proceeds | CURRENT_PARTIAL |
| STUDENT report/export privacy | Security/API | Sensitive data exists | Request report/export | Scoped masked data only | PLANNED_RECOMMENDED |

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
| Role enum documented | CURRENT_IMPLEMENTED | STUDENT |
| Login/MFA behavior documented | CURRENT_IMPLEMENTED | login / no role MFA |
| Scope documented | CURRENT_IMPLEMENTED | own record |
| Permissions documented | CURRENT_IMPLEMENTED | 5 rows |
| Navigation documented | CURRENT_IMPLEMENTED | 8 screens |
| APIs documented | CURRENT_IMPLEMENTED | 27 endpoints |
| AI behavior documented | CURRENT_IMPLEMENTED | Section 11 |
| Notification behavior documented | CURRENT_IMPLEMENTED | Section 12 |
| Reports/exports documented | CURRENT_IMPLEMENTED | Section 13 |
| Security controls documented | CURRENT_IMPLEMENTED | Section 14 |
| Tests and gaps documented | CURRENT_IMPLEMENTED | Sections 15 and 17 |
