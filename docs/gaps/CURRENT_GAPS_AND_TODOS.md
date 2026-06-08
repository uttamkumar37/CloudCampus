<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Current Gaps And TODOs

Status: CURRENT_IMPLEMENTED

## Requested Endpoints Not Found

| Method | Endpoint | Status | Recommendation |
| --- | --- | --- | --- |
| POST | /v1/ai/automation-rules | NOT_FOUND_IN_CODEBASE | Implement, document alternate route, or keep planned. |
| PUT | /v1/super-admin/roles/{role}/permissions | NOT_FOUND_IN_CODEBASE | Implement, document alternate route, or keep planned. |

## Backend Exists UI Not Surfaced

| Method | Endpoint | Backend controller | Status |
| --- | --- | --- | --- |
| PATCH | /v1/ai/automation-rules/{id} | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/automation-rules | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/automation-runs | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/entitlement | backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/knowledge/search | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRetrievalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/accept | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/approve | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/dismiss | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/execute | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/recommendations/{id}/reject | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/recommendations/{id} | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/ai/recommendations | backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/ai/usage/audit | backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/finance/fees/demands/{demandId}/payments | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/finance/fees/demands/{demandId} | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/finance/fees/demands | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/finance/fees/demands | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/finance/receipts | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/ai/knowledge-documents | backend/src/main/java/com/cloudcampus/intelligence/ai/SchoolAdminAiKnowledgeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/ai/knowledge-documents | backend/src/main/java/com/cloudcampus/intelligence/ai/SchoolAdminAiKnowledgeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/documents/{documentId} | backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/documents | backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/documents | backend/src/main/java/com/cloudcampus/operations/document/SchoolDocumentController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/fees/demands/{demandId}/payments | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/fees/demands/{demandId} | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/fees/demands | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/fees/demands | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/parents | backend/src/main/java/com/cloudcampus/people/parent/ParentDirectoryController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/teachers | backend/src/main/java/com/cloudcampus/people/staff/StaffDirectoryController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/timetable/{timetableEntryId} | backend/src/main/java/com/cloudcampus/operations/timetable/TimetableController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/timetable | backend/src/main/java/com/cloudcampus/operations/timetable/TimetableController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/timetable | backend/src/main/java/com/cloudcampus/operations/timetable/TimetableController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/website/pages/{pageId}/publish | backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/website/pages/{pageId} | backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/school-admin/website/pages | backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/school-admin/website/pages | backend/src/main/java/com/cloudcampus/operations/website/WebsiteController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/student/attendance | backend/src/main/java/com/cloudcampus/operations/attendance/AttendanceController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/student/fees | backend/src/main/java/com/cloudcampus/operations/finance/FeeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/student/homework/{homeworkId}/submissions | backend/src/main/java/com/cloudcampus/operations/homework/HomeworkController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/student/homework | backend/src/main/java/com/cloudcampus/operations/homework/HomeworkController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/student/notices | backend/src/main/java/com/cloudcampus/operations/notice/NoticeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/student/profile | backend/src/main/java/com/cloudcampus/people/student/StudentLoginController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/student/results | backend/src/main/java/com/cloudcampus/operations/exam/ExamController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/student/timetable | backend/src/main/java/com/cloudcampus/operations/timetable/TimetableController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/ai/automation-runs | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/ai/entitlements | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/ai/usage/tenants | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/audit-logs | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/notifications/deliveries/{deliveryId} | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/notifications/deliveries | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/reports/schools | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/reports/tenants | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/revenue/invoices | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/revenue/tenants | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/revenue/trends | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/schools/{schoolId} | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/schools | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/super-admin/students/{studentId}/guardians | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/super-admin/subscriptions/tenants/{tenantId} | backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| POST | /v1/super-admin/teachers/{teacherUserId}/assignments | backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/system/readiness | backend/src/main/java/com/cloudcampus/common/health/SystemReadinessController.java | BACKEND_EXISTS_UI_NOT_SURFACED |
| GET | /v1/teacher/notices | backend/src/main/java/com/cloudcampus/operations/notice/NoticeController.java | BACKEND_EXISTS_UI_NOT_SURFACED |

## Cross-Cutting Gaps

| Gap | Status | Impact | Recommended action |
| --- | --- | --- | --- |
| OpenAPI/Swagger contract not found | NOT_FOUND_IN_CODEBASE | Docs can drift. | Add OpenAPI generation and contract tests. |
| Endpoint-level MFA freshness not uniform | CURRENT_PARTIAL | Sensitive commands rely on login MFA. | Add freshness checks. |
| Global rate limiting beyond login | CURRENT_PARTIAL | Abuse risk. | Add per-role/IP/user limits. |
| Uniform DTO validation | CURRENT_PARTIAL | Inconsistent 400 behavior. | Add validation annotations/tests. |
| Read audit coverage | CURRENT_PARTIAL | Sensitive reads may not audit. | Audit high-risk views/downloads. |
| UI static/presentational elements | CURRENT_PARTIAL | Search/notification/AI affordances may overpromise. | Connect or scope UI. |
| Permission matrix tests | CURRENT_PARTIAL | RBAC regressions possible. | Generate critical role-by-endpoint tests. |
