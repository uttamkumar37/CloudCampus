<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# SCHOOL_ADMIN

## 1. Role summary
| Item | Detail | Status |
| --- | --- | --- |
| Human-readable name | School Admin | CURRENT_IMPLEMENTED |
| Role enum value | SCHOOL_ADMIN | CURRENT_IMPLEMENTED |
| Role type | human | CURRENT_IMPLEMENTED |
| Login allowed | yes for authenticated roles; GUEST is public/auth only | CURRENT_IMPLEMENTED |
| MFA required | yes | CURRENT_IMPLEMENTED |
| Scope level | school | CURRENT_IMPLEMENTED |
| Typical users | School administrators and operations heads | CURRENT_IMPLEMENTED |
| Business purpose | Run school operations for students, parents, teachers, staff, academics, fees, notices, reports, documents, website, and settings. | CURRENT_IMPLEMENTED |
| Risk level | high | CURRENT_IMPLEMENTED |
| Data sensitivity level | school-wide student, guardian, staff, academic, fee, and document data | CURRENT_IMPLEMENTED |

## 2. Role responsibilities
- CURRENT_IMPLEMENTED: Use visible screens: Dashboard, Students, Parents, Teachers, Staff, Academic Setup, Attendance, Homework, Exams & Results, Fees, Timetable, Notices, Reports, Documents, Website Builder, Settings.
- CURRENT_IMPLEMENTED: Call 87 backend endpoint(s) inferred for this role/scope.
- CURRENT_IMPLEMENTED: Quick actions: Add student - Validate and queue roster updates; Add teacher - Provision portal access; Take attendance - Open today’s classes; Create notice - Publish school update; Create exam - Prepare assessment flow.
- CURRENT_PARTIAL: Some responsibilities depend on module APIs/UI surfaces and are listed in matrices.
- CURRENT_IMPLEMENTED: Operate only inside documented scope.

## 3. Role restrictions
- CURRENT_IMPLEMENTED: Must not access resources outside school scope.
- CURRENT_IMPLEMENTED: Must not spoof tenant/school headers or use another user session.
- CURRENT_IMPLEMENTED: Must not access /v1/super-admin APIs unless role is SUPER_ADMIN.
- CURRENT_PARTIAL: Fine-grained denials are module-specific.
- CURRENT_PARTIAL: Parent-child restrictions apply where guardian endpoints are used.
- PLANNED_RECOMMENDED: Add endpoint-level MFA freshness for high-risk exports, finance, access-control, and AI execution.

## 4. Tenant/school/class/student scope rules
- tenant_id rules: CURRENT_IMPLEMENTED derived from authenticated user/server context.
- school_id rules: CURRENT_IMPLEMENTED active or allowed school context required.
- class/section/subject rules: CURRENT_PARTIAL module-specific.
- own-student record rules: CURRENT_PARTIAL applies to student self APIs.
- parent-child linked access rules: CURRENT_PARTIAL applies when guardian endpoints are used.
- platform-wide rules: CURRENT_IMPLEMENTED denied for non-SUPER_ADMIN services.

## 5. Permissions
| Permission code | Category | Allowed by default | Scope | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| APPROVE_AI_RECOMMENDATIONS | AI | Yes | TENANT | HIGH | Approve scoped AI recommendations. |
| EXPORT_REPORTS | REPORTS | Yes | TENANT | HIGH | Export scoped reports. |
| MANAGE_AI_POLICY | AI | Yes | TENANT | HIGH | Manage AI policies. |
| MANAGE_CLASSES | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update classes. |
| MANAGE_SCHOOL | SCHOOL | Yes | SCHOOL | HIGH | Manage school operations. |
| MANAGE_SCHOOL_SETTINGS | SCHOOL | Yes | SCHOOL | HIGH | Update school settings. |
| MANAGE_SCHOOL_USERS | SCHOOL | Yes | SCHOOL | HIGH | Manage users assigned to a school. |
| MANAGE_SECTIONS | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update sections. |
| MANAGE_SUBJECTS | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update subjects. |
| MANAGE_TIMETABLE | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update timetables. |
| REJECT_AI_RECOMMENDATIONS | AI | Yes | TENANT | HIGH | Reject scoped AI recommendations. |
| SEND_SCHOOL_NOTICES | SCHOOL | Yes | SCHOOL | MEDIUM | Publish notices for a school. |
| VIEW_AI_RECOMMENDATIONS | AI | Yes | TENANT | MEDIUM | View scoped AI recommendations. |
| VIEW_REPORTS | REPORTS | Yes | TENANT | MEDIUM | View scoped reports. |
| VIEW_SCHOOL_DASHBOARD | SCHOOL | Yes | SCHOOL | LOW | View assigned school dashboard. |

## 6. Navigation and screens
| Screen | Route/nav id | Visible? | Required permission | API used | Current status |
| --- | --- | --- | --- | --- | --- |
| Dashboard | dashboard | Yes | SESSION_SELF_MANAGE | /v1/school-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| Students | students | Yes | SCREEN_STUDENTS | /v1/school-admin/students/{studentId}/login-invitation | CURRENT_IMPLEMENTED |
| Parents | parents | Yes | SCREEN_PARENTS | /v1/school-admin/parents | CURRENT_IMPLEMENTED |
| Teachers | teachers | Yes | SCREEN_TEACHERS | /v1/school-admin/teachers | CURRENT_IMPLEMENTED |
| Staff | staff | Yes | SCREEN_STAFF | /v1/school-admin/staff/provision | CURRENT_IMPLEMENTED |
| Academic Setup | academic | Yes | SCREEN_ACADEMIC | /v1/school-admin/academic-years/{academicYearId}/activate | CURRENT_IMPLEMENTED |
| Attendance | attendance | Yes | SCREEN_ATTENDANCE | /v1/school-admin/attendance/sessions/{sessionId} | CURRENT_IMPLEMENTED |
| Homework | homework | Yes | SCREEN_HOMEWORK | /v1/school-admin/homework/{homeworkId} | CURRENT_IMPLEMENTED |
| Exams & Results | exams | Yes | SCREEN_EXAMS | /v1/school-admin/exams/{examId}/publish | CURRENT_IMPLEMENTED |
| Fees | fees | Yes | SCREEN_FEES | /v1/school-admin/fees/demands/{demandId}/payments | CURRENT_IMPLEMENTED |
| Timetable | timetable | Yes | SCREEN_TIMETABLE | /v1/school-admin/timetable/{timetableEntryId} | CURRENT_IMPLEMENTED |
| Notices | notices | Yes | SCREEN_NOTICES | /v1/school-admin/notices/{noticeId}/publish | CURRENT_IMPLEMENTED |
| Reports | reports | Yes | SCREEN_REPORTS | /v1/school-admin/reports/exports/{exportId}/download | CURRENT_IMPLEMENTED |
| Documents | documents | Yes | SCREEN_DOCUMENTS | /v1/school-admin/ai/knowledge-documents | CURRENT_IMPLEMENTED |
| Website Builder | website | Yes | SCREEN_WEBSITE | /v1/school-admin/website/pages/{pageId}/publish | CURRENT_IMPLEMENTED |
| Settings | settings | Yes | SCREEN_SETTINGS | /v1/school-admin/settings | CURRENT_IMPLEMENTED |

## 7. Dashboard details
- dashboard title: School Admin Overview
- widgets/cards: Add student, Add teacher, Take attendance, Create notice, Create exam
- metrics: CURRENT_IMPLEMENTED from role dashboard summary endpoint.
- API source: /v1/school-admin/dashboard/summary
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
| POST | /v1/school-admin/academic-years/{academicYearId}/activate | Yes | SCHOOL_MANAGE | school | path params / JSON body | AcademicYear response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/academic-years | Yes | SCHOOL_VIEW | school | query params | AcademicYear response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/academic-years | Yes | SCHOOL_MANAGE | school | path params / JSON body | AcademicYear response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/ai/knowledge-documents | Yes | VIEW_AI_USAGE_OR_POLICY | school | query params | SchoolAdminAiKnowledge response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/ai/knowledge-documents | Yes | MANAGE_AI_POLICY | school | path params / JSON body | SchoolAdminAiKnowledge response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/attendance/sessions/{sessionId} | Yes | ATTENDANCE_VIEW | school | query params | Attendance response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/attendance/sessions | Yes | ATTENDANCE_VIEW | school | query params | Attendance response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/attendance/sessions | Yes | ATTENDANCE_MANAGE | school | path params / JSON body | Attendance response/DTO | ATTENDANCE_SUBMITTED | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | Yes | SCHOOL_MANAGE | school | path params / JSON body | BulkJob response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/bulk-jobs/{bulkJobId} | Yes | SCHOOL_VIEW | school | query params | BulkJob response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/bulk-jobs | Yes | SCHOOL_VIEW | school | query params | BulkJob response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/bulk-jobs | Yes | SCHOOL_MANAGE | school | path params / JSON body | BulkJob response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/class-subjects | Yes | SCHOOL_VIEW | school | query params | ClassSubjectAssignment response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/class-subjects | Yes | SCHOOL_MANAGE | school | path params / JSON body | ClassSubjectAssignment response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/classes | Yes | SCHOOL_VIEW | school | query params | ClassLevel response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/classes | Yes | SCHOOL_MANAGE | school | path params / JSON body | ClassLevel response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/dashboard/summary | Yes | SCHOOL_VIEW | school | query params | DashboardSummary response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/documents/{documentId} | Yes | SCHOOL_VIEW | school | query params | SchoolDocument response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/documents | Yes | SCHOOL_VIEW | school | query params | SchoolDocument response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/documents | Yes | SCHOOL_MANAGE | school | path params / JSON body | SchoolDocument response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams/{examId}/publish | Yes | EXAM_MANAGE | school | path params / JSON body | Exam response/DTO | EXAM_CREATED | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams/{examId}/results | Yes | EXAM_MANAGE | school | path params / JSON body | Exam response/DTO | EXAM_MARKS_RECORDED or EXAM_RESULTS_PUBLISHED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/exams/{examId} | Yes | EXAM_VIEW | school | query params | Exam response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/exams | Yes | EXAM_VIEW | school | query params | Exam response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams | Yes | EXAM_MANAGE | school | path params / JSON body | Exam response/DTO | EXAM_CREATED | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/fees/demands/{demandId}/payments | Yes | FINANCE_MANAGE | school | path params / JSON body | Fee response/DTO | FEE_PAYMENT_RECORDED, RECEIPT_ISSUED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/fees/demands/{demandId} | Yes | FINANCE_VIEW | school | query params | Fee response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/fees/demands | Yes | FINANCE_VIEW | school | query params | Fee response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/fees/demands | Yes | FINANCE_MANAGE | school | path params / JSON body | Fee response/DTO | FEE_DEMAND_CREATED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/homework/{homeworkId} | Yes | HOMEWORK_VIEW | school | query params | Homework response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/homework | Yes | HOMEWORK_VIEW | school | query params | Homework response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/homework | Yes | HOMEWORK_MANAGE | school | path params / JSON body | Homework response/DTO | HOMEWORK_PUBLISHED | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/notices/{noticeId}/publish | Yes | NOTICE_MANAGE | school | path params / JSON body | Notice response/DTO | NOTICE_PUBLISHED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/notices/{noticeId} | Yes | NOTICE_VIEW | school | query params | Notice response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/notices | Yes | NOTICE_VIEW | school | query params | Notice response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/notices | Yes | NOTICE_MANAGE | school | path params / JSON body | Notice response/DTO | NOTICE_CREATED | CURRENT_IMPLEMENTED |
| PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | Yes | PARENT_MANAGE | school | path params / JSON body | ParentLeaveRequest response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/parent-leave-requests | Yes | PARENT_VIEW | school | query params | ParentLeaveRequest response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/parent-links | Yes | PARENT_MANAGE | school | path params / JSON body | ParentLink response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/parents | Yes | PARENT_VIEW | school | query params | ParentDirectory response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports/{exportId}/download | Yes | VIEW_REPORTS | school | query params | ReportExport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports/{exportId} | Yes | VIEW_REPORTS | school | query params | ReportExport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports | Yes | VIEW_REPORTS | school | query params | ReportExport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/reports/exports | Yes | EXPORT_REPORTS | school | path params / JSON body | ReportExport response/DTO | REPORT_EXPORT_REQUESTED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/sections | Yes | SCHOOL_VIEW | school | query params | Section response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/sections | Yes | SCHOOL_MANAGE | school | path params / JSON body | Section response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/settings | Yes | SETTINGS_VIEW | school | query params | SchoolSettings response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PATCH | /v1/school-admin/settings | Yes | SETTINGS_MANAGE | school | path params / JSON body | SchoolSettings response/DTO | CURRENT_PARTIAL settings audit | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/staff/provision | Yes | STAFF_MANAGE | school | path params / JSON body | StaffProvisioning response/DTO | STAFF_INVITED, STAFF_PROFILE_CREATED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/staff | Yes | STAFF_VIEW | school | query params | StaffDirectory response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/{studentId}/login-invitation | Yes | STUDENT_MANAGE | school | path params / JSON body | StudentLogin response/DTO | MFA_CHALLENGE_CREATED for MFA roles; session issuance is not a separate enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students/import/jobs/{bulkJobId} | Yes | STUDENT_VIEW | school | query params | StudentImport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import/jobs | Yes | STUDENT_MANAGE | school | path params / JSON body | StudentImport response/DTO | STUDENT_IMPORTED or STUDENT_IMPORT_JOB_QUEUED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students/import/template | Yes | STUDENT_VIEW | school | query params | StudentImport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import/validate | Yes | STUDENT_MANAGE | school | path params / JSON body | StudentImport response/DTO | STUDENT_IMPORTED or STUDENT_IMPORT_JOB_QUEUED | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import | Yes | STUDENT_MANAGE | school | path params / JSON body | StudentImport response/DTO | STUDENT_IMPORTED or STUDENT_IMPORT_JOB_QUEUED | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students | Yes | STUDENT_VIEW | school | query params | StudentImport response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/subjects | Yes | SCHOOL_VIEW | school | query params | Subject response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/subjects | Yes | SCHOOL_MANAGE | school | path params / JSON body | Subject response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/teacher-assignments | Yes | TEACHER_VIEW | school | query params | TeacherAssignment response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/teacher-assignments | Yes | TEACHER_MANAGE | school | path params / JSON body | TeacherAssignment response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/teachers | Yes | TEACHER_VIEW | school | query params | StaffDirectory response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/timetable/{timetableEntryId} | Yes | TIMETABLE_VIEW | school | query params | Timetable response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/timetable | Yes | TIMETABLE_VIEW | school | query params | Timetable response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/timetable | Yes | TIMETABLE_MANAGE | school | path params / JSON body | Timetable response/DTO | TIMETABLE_ENTRY_CREATED | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/website/pages/{pageId}/publish | Yes | SCHOOL_MANAGE | school | path params / JSON body | Website response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/website/pages/{pageId} | Yes | SCHOOL_VIEW | school | query params | Website response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/website/pages | Yes | SCHOOL_VIEW | school | query params | Website response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/website/pages | Yes | SCHOOL_MANAGE | school | path params / JSON body | Website response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |

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

### POST /v1/school-admin/academic-years/{academicYearId}/activate
- Method: POST
- Full endpoint: /v1/school-admin/academic-years/{academicYearId}/activate
- Purpose: POST /v1/school-admin/academic-years/{academicYearId}/activate in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: academicYearId
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
- Frontend caller file: frontend/src/features/academic/api/academicApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/AcademicYearController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/academic-years
- Method: GET
- Full endpoint: /v1/school-admin/academic-years
- Purpose: GET /v1/school-admin/academic-years in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/AcademicYearController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/academic-years
- Method: POST
- Full endpoint: /v1/school-admin/academic-years
- Purpose: POST /v1/school-admin/academic-years in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/AcademicYearController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/ai/knowledge-documents
- Method: GET
- Full endpoint: /v1/school-admin/ai/knowledge-documents
- Purpose: GET /v1/school-admin/ai/knowledge-documents in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/SchoolAdminAiKnowledgeController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/school-admin/ai/knowledge-documents
- Method: POST
- Full endpoint: /v1/school-admin/ai/knowledge-documents
- Purpose: POST /v1/school-admin/ai/knowledge-documents in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: MANAGE_AI_POLICY
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/SchoolAdminAiKnowledgeController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/attendance/sessions/{sessionId}
- Method: GET
- Full endpoint: /v1/school-admin/attendance/sessions/{sessionId}
- Purpose: Read attendance data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: ATTENDANCE_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: sessionId
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
- Frontend caller file: frontend/src/features/attendance/api/attendanceApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/attendance/sessions
- Method: GET
- Full endpoint: /v1/school-admin/attendance/sessions
- Purpose: Read attendance data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: ATTENDANCE_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/attendance/api/attendanceApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/attendance/sessions
- Method: POST
- Full endpoint: /v1/school-admin/attendance/sessions
- Purpose: Submit attendance data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: ATTENDANCE_MANAGE
- Scope checks: school
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
- Audit events: ATTENDANCE_SUBMITTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/attendance/api/attendanceApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel
- Method: POST
- Full endpoint: /v1/school-admin/bulk-jobs/{bulkJobId}/cancel
- Purpose: POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: bulkJobId
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
- Frontend caller file: frontend/src/features/operations/api/bulkJobsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/operations/pages/BulkJobsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/bulk-jobs/{bulkJobId}
- Method: GET
- Full endpoint: /v1/school-admin/bulk-jobs/{bulkJobId}
- Purpose: GET /v1/school-admin/bulk-jobs/{bulkJobId} in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: bulkJobId
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
- Frontend caller file: frontend/src/features/operations/api/bulkJobsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/common/health/SystemReadinessControllerTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/bulk-jobs
- Method: GET
- Full endpoint: /v1/school-admin/bulk-jobs
- Purpose: GET /v1/school-admin/bulk-jobs in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/operations/api/bulkJobsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/bulk-jobs
- Method: POST
- Full endpoint: /v1/school-admin/bulk-jobs
- Purpose: POST /v1/school-admin/bulk-jobs in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/operations/api/bulkJobsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/bulk/BulkJobService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/class-subjects
- Method: GET
- Full endpoint: /v1/school-admin/class-subjects
- Purpose: GET /v1/school-admin/class-subjects in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicAssignmentsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/ClassSubjectAssignmentController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/class-subjects
- Method: POST
- Full endpoint: /v1/school-admin/class-subjects
- Purpose: POST /v1/school-admin/class-subjects in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicAssignmentsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/ClassSubjectAssignmentController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/classes
- Method: GET
- Full endpoint: /v1/school-admin/classes
- Purpose: GET /v1/school-admin/classes in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/ClassLevelController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/classes
- Method: POST
- Full endpoint: /v1/school-admin/classes
- Purpose: POST /v1/school-admin/classes in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/ClassLevelController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/dashboard/summary
- Method: GET
- Full endpoint: /v1/school-admin/dashboard/summary
- Purpose: Return role dashboard metrics, alerts, and activity.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/documents/{documentId}
- Method: GET
- Full endpoint: /v1/school-admin/documents/{documentId}
- Purpose: GET /v1/school-admin/documents/{documentId} in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: documentId
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/common/health/SystemReadinessControllerTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/shared/api/apiBase.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/documents
- Method: GET
- Full endpoint: /v1/school-admin/documents
- Purpose: GET /v1/school-admin/documents in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/school-admin/documents
- Method: POST
- Full endpoint: /v1/school-admin/documents
- Purpose: POST /v1/school-admin/documents in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/school-admin/exams/{examId}/publish
- Method: POST
- Full endpoint: /v1/school-admin/exams/{examId}/publish
- Purpose: Create exams, record marks, or publish results.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: EXAM_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: examId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: EXAM_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/exams/api/examsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/exam/ExamController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/exam/ExamService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/exams/{examId}/results
- Method: POST
- Full endpoint: /v1/school-admin/exams/{examId}/results
- Purpose: Create exams, record marks, or publish results.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: EXAM_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: examId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: EXAM_MARKS_RECORDED or EXAM_RESULTS_PUBLISHED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/exams/api/examsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/exam/ExamController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/exam/ExamService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/exams/{examId}
- Method: GET
- Full endpoint: /v1/school-admin/exams/{examId}
- Purpose: Read exam/results data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: EXAM_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: examId
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
- Frontend caller file: frontend/src/features/exams/api/examsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/exam/ExamController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/exam/ExamService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/exams
- Method: GET
- Full endpoint: /v1/school-admin/exams
- Purpose: Read exam/results data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: EXAM_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/exams/api/examsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/exam/ExamController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/exam/ExamService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/exams
- Method: POST
- Full endpoint: /v1/school-admin/exams
- Purpose: Create exams, record marks, or publish results.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: EXAM_MANAGE
- Scope checks: school
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
- Audit events: EXAM_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/exams/api/examsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/exam/ExamController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/exam/ExamService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/fees/demands/{demandId}/payments
- Method: POST
- Full endpoint: /v1/school-admin/fees/demands/{demandId}/payments
- Purpose: Create demands/payments/receipts.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: FINANCE_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: demandId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: FEE_PAYMENT_RECORDED, RECEIPT_ISSUED
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/fees/demands/{demandId}
- Method: GET
- Full endpoint: /v1/school-admin/fees/demands/{demandId}
- Purpose: Read finance data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: FINANCE_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: demandId
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

### GET /v1/school-admin/fees/demands
- Method: GET
- Full endpoint: /v1/school-admin/fees/demands
- Purpose: Read finance data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: FINANCE_VIEW
- Scope checks: school
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
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/school-admin/fees/demands
- Method: POST
- Full endpoint: /v1/school-admin/fees/demands
- Purpose: Create demands/payments/receipts.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: FINANCE_MANAGE
- Scope checks: school
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
- Audit events: FEE_DEMAND_CREATED
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/finance/FeeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/homework/{homeworkId}
- Method: GET
- Full endpoint: /v1/school-admin/homework/{homeworkId}
- Purpose: Read homework data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: HOMEWORK_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: homeworkId
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
- Frontend caller file: frontend/src/features/homework/api/homeworkApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/homework
- Method: GET
- Full endpoint: /v1/school-admin/homework
- Purpose: Read homework data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: HOMEWORK_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/homework/api/homeworkApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/homework
- Method: POST
- Full endpoint: /v1/school-admin/homework
- Purpose: Create/submit homework data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: HOMEWORK_MANAGE
- Scope checks: school
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
- Audit events: HOMEWORK_PUBLISHED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/homework/api/homeworkApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/homework/HomeworkService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/notices/{noticeId}/publish
- Method: POST
- Full endpoint: /v1/school-admin/notices/{noticeId}/publish
- Purpose: Create or publish notices.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: NOTICE_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: noticeId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: NOTICE_PUBLISHED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/notices/api/noticesApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/notices/{noticeId}
- Method: GET
- Full endpoint: /v1/school-admin/notices/{noticeId}
- Purpose: Read notices.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: NOTICE_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: noticeId
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
- Frontend caller file: frontend/src/features/notices/api/noticesApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/notices
- Method: GET
- Full endpoint: /v1/school-admin/notices
- Purpose: Read notices.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: NOTICE_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/notices/api/noticesApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/notices
- Method: POST
- Full endpoint: /v1/school-admin/notices
- Purpose: Create or publish notices.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: NOTICE_MANAGE
- Scope checks: school
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
- Audit events: NOTICE_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/notices/api/noticesApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/notice/NoticeService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId}
- Method: PATCH
- Full endpoint: /v1/school-admin/parent-leave-requests/{leaveRequestId}
- Purpose: PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: PARENT_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: leaveRequestId
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
- Frontend caller file: frontend/src/features/parent/api/parentLeaveRequestsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/parent/ParentLeaveRequestController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/parent/ParentLeaveRequestService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/parent-leave-requests
- Method: GET
- Full endpoint: /v1/school-admin/parent-leave-requests
- Purpose: GET /v1/school-admin/parent-leave-requests in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: PARENT_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/parent/api/parentLeaveRequestsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/parent/ParentLeaveRequestController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/parent/ParentLeaveRequestService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/parent-links
- Method: POST
- Full endpoint: /v1/school-admin/parent-links
- Purpose: POST /v1/school-admin/parent-links in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: PARENT_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/parent/api/parentLinksApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/parent/ParentLinkController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/parent/ParentLinkService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/parents
- Method: GET
- Full endpoint: /v1/school-admin/parents
- Purpose: GET /v1/school-admin/parents in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: PARENT_VIEW
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/people/parent/ParentDirectoryController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/parent/ParentDirectoryService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/reports/exports/{exportId}/download
- Method: GET
- Full endpoint: /v1/school-admin/reports/exports/{exportId}/download
- Purpose: List, inspect, or download report export data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: VIEW_REPORTS
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: exportId
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
- Frontend caller file: frontend/src/features/reports/api/reportExportsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/reports/exports/{exportId}
- Method: GET
- Full endpoint: /v1/school-admin/reports/exports/{exportId}
- Purpose: List, inspect, or download report export data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: VIEW_REPORTS
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: exportId
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
- Frontend caller file: frontend/src/features/reports/api/reportExportsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/reports/exports
- Method: GET
- Full endpoint: /v1/school-admin/reports/exports
- Purpose: List, inspect, or download report export data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: VIEW_REPORTS
- Scope checks: school
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
- Frontend caller file: frontend/src/features/reports/api/reportExportsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/reports/exports
- Method: POST
- Full endpoint: /v1/school-admin/reports/exports
- Purpose: Create an asynchronous report export job.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: EXPORT_REPORTS
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"reportType":"STUDENT_DIRECTORY","format":"CSV","tenantId":"tenant-id","schoolId":"school-id"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: REPORT_EXPORT_REQUESTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/reports/api/reportExportsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/report/ReportExportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/sections
- Method: GET
- Full endpoint: /v1/school-admin/sections
- Purpose: GET /v1/school-admin/sections in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/SectionController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/sections
- Method: POST
- Full endpoint: /v1/school-admin/sections
- Purpose: POST /v1/school-admin/sections in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/SectionController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/settings
- Method: GET
- Full endpoint: /v1/school-admin/settings
- Purpose: Read settings.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SETTINGS_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/school-admin/api/schoolSettingsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/school/SchoolSettingsController.java
- Backend service file: backend/src/main/java/com/cloudcampus/school/SchoolSettingsService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/common/health/SystemReadinessControllerTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/school-admin/settings
- Method: PATCH
- Full endpoint: /v1/school-admin/settings
- Purpose: Update settings.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SETTINGS_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/school-admin/api/schoolSettingsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/school/SchoolSettingsController.java
- Backend service file: backend/src/main/java/com/cloudcampus/school/SchoolSettingsService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/staff/provision
- Method: POST
- Full endpoint: /v1/school-admin/staff/provision
- Purpose: POST /v1/school-admin/staff/provision in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STAFF_MANAGE
- Scope checks: school
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
- Audit events: STAFF_INVITED, STAFF_PROFILE_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/staff/api/staffProvisioningApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/staff/StaffProvisioningController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/staff/StaffProvisioningService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/staff
- Method: GET
- Full endpoint: /v1/school-admin/staff
- Purpose: GET /v1/school-admin/staff in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STAFF_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/staff/api/staffProvisioningApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/staff/StaffDirectoryController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/staff/StaffDirectoryService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/students/{studentId}/login-invitation
- Method: POST
- Full endpoint: /v1/school-admin/students/{studentId}/login-invitation
- Purpose: POST /v1/school-admin/students/{studentId}/login-invitation in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STUDENT_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: studentId
- Query params: none by default
- Request body: {"email":"user@example.com","password":"********"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
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
- Frontend caller file: frontend/src/features/student/api/studentImportApi.ts, frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentLoginController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentLoginService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/students/import/jobs/{bulkJobId}
- Method: GET
- Full endpoint: /v1/school-admin/students/import/jobs/{bulkJobId}
- Purpose: GET /v1/school-admin/students/import/jobs/{bulkJobId} in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STUDENT_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: bulkJobId
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
- Frontend caller file: frontend/src/features/student/api/studentImportApi.ts, frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/students/import/jobs
- Method: POST
- Full endpoint: /v1/school-admin/students/import/jobs
- Purpose: POST /v1/school-admin/students/import/jobs in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STUDENT_MANAGE
- Scope checks: school
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
- Audit events: STUDENT_IMPORTED or STUDENT_IMPORT_JOB_QUEUED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/student/api/studentImportApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/students/import/template
- Method: GET
- Full endpoint: /v1/school-admin/students/import/template
- Purpose: GET /v1/school-admin/students/import/template in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STUDENT_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/student/api/studentImportApi.ts, frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/students/import/validate
- Method: POST
- Full endpoint: /v1/school-admin/students/import/validate
- Purpose: POST /v1/school-admin/students/import/validate in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STUDENT_MANAGE
- Scope checks: school
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
- Audit events: STUDENT_IMPORTED or STUDENT_IMPORT_JOB_QUEUED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/student/api/studentImportApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/students/import
- Method: POST
- Full endpoint: /v1/school-admin/students/import
- Purpose: POST /v1/school-admin/students/import in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STUDENT_MANAGE
- Scope checks: school
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
- Audit events: STUDENT_IMPORTED or STUDENT_IMPORT_JOB_QUEUED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/student/api/studentImportApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/students
- Method: GET
- Full endpoint: /v1/school-admin/students
- Purpose: GET /v1/school-admin/students in Student / Parent.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: STUDENT_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/student/api/studentImportApi.ts, frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/people/student/StudentImportController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/student/StudentImportService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/subjects
- Method: GET
- Full endpoint: /v1/school-admin/subjects
- Purpose: GET /v1/school-admin/subjects in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicAssignmentsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/SubjectController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/subjects
- Method: POST
- Full endpoint: /v1/school-admin/subjects
- Purpose: POST /v1/school-admin/subjects in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicAssignmentsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/SubjectController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/teacher-assignments
- Method: GET
- Full endpoint: /v1/school-admin/teacher-assignments
- Purpose: GET /v1/school-admin/teacher-assignments in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: TEACHER_VIEW
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicAssignmentsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/TeacherAssignmentController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/school-admin/teacher-assignments
- Method: POST
- Full endpoint: /v1/school-admin/teacher-assignments
- Purpose: POST /v1/school-admin/teacher-assignments in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: TEACHER_MANAGE
- Scope checks: school
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
- Frontend caller file: frontend/src/features/academic/api/academicAssignmentsApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/academic/TeacherAssignmentController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/school-admin/teachers
- Method: GET
- Full endpoint: /v1/school-admin/teachers
- Purpose: GET /v1/school-admin/teachers in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: TEACHER_VIEW
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/people/staff/StaffDirectoryController.java
- Backend service file: backend/src/main/java/com/cloudcampus/people/staff/StaffDirectoryService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/timetable/{timetableEntryId}
- Method: GET
- Full endpoint: /v1/school-admin/timetable/{timetableEntryId}
- Purpose: GET /v1/school-admin/timetable/{timetableEntryId} in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: TIMETABLE_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: timetableEntryId
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
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/common/health/SystemReadinessControllerTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/shared/api/apiBase.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/timetable
- Method: GET
- Full endpoint: /v1/school-admin/timetable
- Purpose: GET /v1/school-admin/timetable in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: TIMETABLE_VIEW
- Scope checks: school
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
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/school-admin/timetable
- Method: POST
- Full endpoint: /v1/school-admin/timetable
- Purpose: POST /v1/school-admin/timetable in Academic.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: TIMETABLE_MANAGE
- Scope checks: school
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
- Audit events: TIMETABLE_ENTRY_CREATED
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/timetable/TimetableController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/timetable/TimetableService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/school-admin/website/pages/{pageId}/publish
- Method: POST
- Full endpoint: /v1/school-admin/website/pages/{pageId}/publish
- Purpose: POST /v1/school-admin/website/pages/{pageId}/publish in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: pageId
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/website/pages/{pageId}
- Method: GET
- Full endpoint: /v1/school-admin/website/pages/{pageId}
- Purpose: GET /v1/school-admin/website/pages/{pageId} in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: pageId
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/common/health/SystemReadinessControllerTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/shared/api/apiBase.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/school-admin/website/pages
- Method: GET
- Full endpoint: /v1/school-admin/website/pages
- Purpose: GET /v1/school-admin/website/pages in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_VIEW
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/school-admin/website/pages
- Method: POST
- Full endpoint: /v1/school-admin/website/pages
- Purpose: POST /v1/school-admin/website/pages in School Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SCHOOL_ADMIN, PRINCIPAL
- Permission required: SCHOOL_MANAGE
- Scope checks: school
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
- Backend controller file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java
- Backend service file: backend/src/main/java/com/cloudcampus/operations/website/WebsiteService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

## 10. Workflows
| Flow | Actor | Preconditions | Trigger | State changes | Audit events | Recovery behavior |
| --- | --- | --- | --- | --- | --- | --- |
| School operations | SCHOOL_ADMIN | Active school context and MFA | Use students/parents/teachers/academic/fees/notices/settings | School records change | Module audit events | Missing active school denied |

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
| Can approve AI recommendations? | CURRENT_IMPLEMENTED | High impact should require human approval. |
| Can reject AI recommendations? | CURRENT_IMPLEMENTED | Reject/dismiss APIs exist by flow. |
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
| Notifications this role can send | CURRENT_PARTIAL | Notice/notification sending depends on module endpoints. |
| Message approval requirement | CURRENT_PARTIAL | AI-drafted messages should require human approval. |
| Recipient masking rules | CURRENT_IMPLEMENTED | Notification delivery DTO exposes maskedRecipient. |
| Delivery audit | CURRENT_PARTIAL | Delivery rows track status/failure; explicit audit varies. |
| Retry behavior | CURRENT_PARTIAL | Outbox/retry infrastructure exists; scheduler policy should be verified. |

## 13. Reports and exports
| Report/export item | Status | Notes |
| --- | --- | --- |
| Reports visible | CURRENT_IMPLEMENTED | Reports nav/screen visibility from App.tsx. |
| Export permissions | CURRENT_IMPLEMENTED | Export endpoints documented in Report API. |
| Async export behavior | CURRENT_IMPLEMENTED | Report export jobs/files and worker classes exist. |
| Sensitive field masking | CURRENT_PARTIAL | Must be reviewed per report/export DTO. |
| Download permission | CURRENT_IMPLEMENTED | School export download exists; platform download varies. |
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
| SCHOOL_ADMIN login/session | Integration/UI | Login allowed or public flow | Login/MFA/hydrate /v1/me | Correct role/token/scope | CURRENT_PARTIAL |
| SCHOOL_ADMIN forbidden cross-role API | Security | Authenticated session | Call unauthorized endpoint | 403/401 | CURRENT_PARTIAL |
| SCHOOL_ADMIN scope isolation | Security | Two tenants/schools/children/classes | Access outside scope | 403/404 | CURRENT_PARTIAL |
| SCHOOL_ADMIN dashboard load | UI/API | Authenticated session | Open dashboard | Metrics or empty state | CURRENT_PARTIAL |
| SCHOOL_ADMIN AI guard | Security/API | AI policy states | View/approve/execute | Only allowed action proceeds | CURRENT_PARTIAL |
| SCHOOL_ADMIN report/export privacy | Security/API | Sensitive data exists | Request report/export | Scoped masked data only | PLANNED_RECOMMENDED |

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
| Role enum documented | CURRENT_IMPLEMENTED | SCHOOL_ADMIN |
| Login/MFA behavior documented | CURRENT_IMPLEMENTED | login / MFA |
| Scope documented | CURRENT_IMPLEMENTED | school |
| Permissions documented | CURRENT_IMPLEMENTED | 15 rows |
| Navigation documented | CURRENT_IMPLEMENTED | 16 screens |
| APIs documented | CURRENT_IMPLEMENTED | 87 endpoints |
| AI behavior documented | CURRENT_IMPLEMENTED | Section 11 |
| Notification behavior documented | CURRENT_IMPLEMENTED | Section 12 |
| Reports/exports documented | CURRENT_IMPLEMENTED | Section 13 |
| Security controls documented | CURRENT_IMPLEMENTED | Section 14 |
| Tests and gaps documented | CURRENT_IMPLEMENTED | Sections 15 and 17 |
