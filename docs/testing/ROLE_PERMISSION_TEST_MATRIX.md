<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Role Permission Test Matrix

Status: CURRENT_IMPLEMENTED

## Super Admin Portal Verification Overlay

Verified on June 8, 2026:

| Area | Evidence | Status |
| --- | --- | --- |
| Super Admin-only portal access and shell wiring | `frontend/src/app/App.test.tsx`, `frontend/src/features/super-admin/pages/SuperAdminPlatformPage.test.tsx` | CURRENT_IMPLEMENTED UI coverage |
| Super Admin access-control role/override validation | `frontend/src/features/super-admin/pages/SuperAdminPlatformPage.test.tsx`, `frontend/src/features/super-admin/api/platformApi.test.ts` | CURRENT_IMPLEMENTED frontend validation/API coverage; backend role-negative matrix remains CURRENT_PARTIAL |
| Super Admin AI, notification, revenue, report, and subscription actions | `frontend/src/features/super-admin/api/platformApi.test.ts`, `backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java`, `backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java`, `backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java` | CURRENT_IMPLEMENTED flow coverage; exhaustive permission-negative matrix remains CURRENT_PARTIAL |

The generated rows below retain `CURRENT_PARTIAL` where endpoint-specific negative/security tests are still recommended.

| Role | Endpoint | Positive test needed | Negative test needed | Status |
| --- | --- | --- | --- | --- |
| SUPER_ADMIN | PATCH /v1/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/ai/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/ai/recommendations/{id}/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/ai/recommendations/{id}/dismiss | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/ai/usage/audit | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| SUPER_ADMIN | PATCH /v1/super-admin/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/super-admin/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/entitlements | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/policies/{tenantId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | PUT /v1/super-admin/ai/policies/{tenantId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/policies | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/super-admin/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/usage/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/ai/usage/tenants | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/audit-logs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/dashboard/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/notifications/deliveries/{deliveryId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/notifications/deliveries | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/notifications/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/permissions | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/platform-health | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/platform-metrics | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/reports/exports/{jobId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/reports/exports | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | POST /v1/super-admin/reports/exports | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/reports/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/reports/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/reports/tenants | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/revenue/invoices | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/revenue/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/revenue/tenants | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/revenue/trends | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SUPER_ADMIN | GET /v1/super-admin/roles/{role}/permissions | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TENANT_ADMIN | PATCH /v1/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/ai/entitlement | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/ai/knowledge/search | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/ai/recommendations/{id}/accept | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/ai/recommendations/{id}/dismiss | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/ai/usage/audit | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| TENANT_ADMIN | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | PATCH /v1/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/ai/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/ai/recommendations/{id}/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/ai/recommendations/{id}/dismiss | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/ai/usage/audit | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/academic-years/{academicYearId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/academic-years | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/academic-years | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/ai/knowledge-documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/ai/knowledge-documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/attendance/sessions/{sessionId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/attendance/sessions | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/attendance/sessions | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/bulk-jobs/{bulkJobId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/bulk-jobs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/bulk-jobs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/class-subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/class-subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/classes | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/classes | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/dashboard/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/documents/{documentId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/exams/{examId}/publish | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/exams/{examId}/results | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/exams/{examId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/exams | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/exams | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/fees/demands/{demandId}/payments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/fees/demands/{demandId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/fees/demands | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/fees/demands | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/homework/{homeworkId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/homework | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/homework | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/notices/{noticeId}/publish | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/notices/{noticeId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/notices | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/notices | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/parent-leave-requests | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/parent-links | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/parents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/reports/exports/{exportId}/download | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/reports/exports/{exportId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/reports/exports | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/reports/exports | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/sections | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/sections | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/settings | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | PATCH /v1/school-admin/settings | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/staff/provision | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/staff | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/students/{studentId}/login-invitation | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/students/import/jobs/{bulkJobId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/students/import/jobs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/students/import/template | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/students/import/validate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/students/import | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/students | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/teacher-assignments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/teacher-assignments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/teachers | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/timetable/{timetableEntryId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/timetable | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/timetable | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/website/pages/{pageId}/publish | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/website/pages/{pageId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/school-admin/website/pages | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/school-admin/website/pages | Yes | Scope negative recommended | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| SCHOOL_ADMIN | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | PATCH /v1/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/ai/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/ai/recommendations/{id}/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/ai/recommendations/{id}/dismiss | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/ai/usage/audit | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/academic-years/{academicYearId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/academic-years | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/academic-years | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/ai/knowledge-documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/ai/knowledge-documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/attendance/sessions/{sessionId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/attendance/sessions | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/attendance/sessions | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/bulk-jobs/{bulkJobId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/bulk-jobs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/bulk-jobs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/class-subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/class-subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/classes | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/classes | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/dashboard/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/documents/{documentId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/documents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/exams/{examId}/publish | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/exams/{examId}/results | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/exams/{examId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/exams | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/exams | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/fees/demands/{demandId}/payments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/fees/demands/{demandId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/fees/demands | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/fees/demands | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/homework/{homeworkId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/homework | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/homework | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/notices/{noticeId}/publish | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/notices/{noticeId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/notices | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/notices | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/parent-leave-requests | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/parent-links | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/parents | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/reports/exports/{exportId}/download | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/reports/exports/{exportId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/reports/exports | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/reports/exports | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/sections | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/sections | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/settings | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | PATCH /v1/school-admin/settings | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/staff/provision | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/staff | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/students/{studentId}/login-invitation | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/students/import/jobs/{bulkJobId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/students/import/jobs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/students/import/template | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/students/import/validate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/students/import | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/students | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/subjects | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/teacher-assignments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/teacher-assignments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/teachers | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/timetable/{timetableEntryId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/timetable | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/timetable | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/website/pages/{pageId}/publish | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/website/pages/{pageId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/school-admin/website/pages | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/school-admin/website/pages | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| PRINCIPAL | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| TEACHER | PATCH /v1/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/ai/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/ai/recommendations/{id}/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/ai/recommendations/{id}/dismiss | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/ai/usage/audit | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| TEACHER | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| TEACHER | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| TEACHER | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| TEACHER | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TEACHER | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| TEACHER | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| STUDENT | PATCH /v1/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/ai/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/ai/recommendations/{id}/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/ai/recommendations/{id}/dismiss | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/ai/usage/audit | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| STUDENT | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| STUDENT | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/attendance | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/dashboard/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/fees | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | POST /v1/student/homework/{homeworkId}/submissions | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/homework | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/notices | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/profile | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/results | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | GET /v1/student/timetable | Yes | Scope negative recommended | CURRENT_PARTIAL |
| STUDENT | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| STUDENT | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| STUDENT | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| STUDENT | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| PARENT | PATCH /v1/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/ai/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/ai/recommendations/{id}/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/ai/recommendations/{id}/dismiss | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/ai/usage/audit | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId}/attendance | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId}/fees | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId}/homework | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId}/leave-requests | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/parent/children/{studentId}/leave-requests | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId}/notices | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId}/results | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId}/timetable | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children/{studentId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/children | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | GET /v1/parent/dashboard/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| PARENT | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| PARENT | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| PARENT | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| PARENT | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| PARENT | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| PARENT | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| PARENT | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | PATCH /v1/ai/automation-rules/{id} | No | Denied/unavailable | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET /v1/ai/automation-rules | No | Denied in AiGovernanceFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET /v1/ai/automation-runs | No | Denied in AiGovernanceFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET /v1/ai/entitlement | No | Denied in AiGovernanceFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/ai/recommendations/{id}/accept | Yes | Active-school fee scope tested for shared mutations | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/ai/recommendations/{id}/approve | Yes | Active-school fee scope tested in AiGovernanceFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/ai/recommendations/{id}/dismiss | Yes | Active-school fee scope tested in AiGovernanceFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/ai/recommendations/{id}/execute | No | Denied without automation policy in AiGovernanceFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/ai/recommendations/{id}/reject | Yes | Active-school fee scope covered by recommendation guard | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/ai/recommendations/{id} | Yes | Non-finance and cross-school denial tested | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET /v1/ai/recommendations | Yes | Active-school fee suggestion list tested | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/ai/usage/audit | No | Denied in AiGovernanceFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/finance/dashboard/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/finance/fees/demands/{demandId}/payments | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/finance/fees/demands/{demandId} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/finance/fees/demands | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/finance/fees/demands | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/finance/receipts | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/finance/reports/collections | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/finance/reports/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/finance/reports/exports/{exportId}/download | Yes | Cross-school denial and download audited in ReportExportFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET /v1/finance/reports/exports/{exportId} | Yes | Cross-school denial tested in ReportExportFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET /v1/finance/reports/exports | Yes | Active-school list tested in ReportExportFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/finance/reports/exports | Yes | FEE_DEMANDS-only creation tested in ReportExportFlowTest | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| FINANCE_STAFF | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | PATCH /v1/ai/automation-rules/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/ai/automation-rules | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/ai/automation-runs | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/ai/entitlement | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/ai/knowledge/search | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/ai/recommendations/{id}/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/ai/recommendations/{id}/approve | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/ai/recommendations/{id}/dismiss | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/ai/recommendations/{id}/execute | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/ai/recommendations/{id}/reject | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/ai/recommendations/{id} | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/ai/recommendations | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/ai/usage/audit | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/me/change-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/me/logout | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/me/schools/{schoolId}/activate | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/me/schools | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/me | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/staff/dashboard/summary | Yes | Scope negative recommended | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| OFFICE_STAFF | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| GUEST | PATCH /v1/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/ai/entitlement | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/ai/knowledge/search | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/ai/recommendations/{id}/accept | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/ai/recommendations/{id}/dismiss | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/ai/usage/audit | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/auth/forgot-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| GUEST | POST /v1/auth/login | Yes | Scope negative recommended | CURRENT_PARTIAL |
| GUEST | POST /v1/auth/mfa/verify | Yes | Scope negative recommended | CURRENT_PARTIAL |
| GUEST | POST /v1/auth/refresh | Yes | Scope negative recommended | CURRENT_PARTIAL |
| GUEST | POST /v1/auth/reset-password | Yes | Scope negative recommended | CURRENT_PARTIAL |
| GUEST | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/invitations/accept | Yes | Scope negative recommended | CURRENT_PARTIAL |
| GUEST | POST /v1/me/change-password | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/me/logout | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/me/schools/{schoolId}/activate | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/me/schools | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/me | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| GUEST | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| GUEST | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| GUEST | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| GUEST | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| GUEST | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| GUEST | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| GUEST | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| SYSTEM | PATCH /v1/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/ai/entitlement | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/ai/knowledge/search | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/ai/recommendations/{id}/accept | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/ai/recommendations/{id}/dismiss | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/ai/usage/audit | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/me/change-password | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/me/logout | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/me/schools/{schoolId}/activate | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/me/schools | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/me | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| SYSTEM | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| SYSTEM | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| SYSTEM | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| SYSTEM | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SYSTEM | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| SYSTEM | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | PATCH /v1/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/ai/entitlement | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/ai/knowledge/search | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/ai/recommendations/{id}/accept | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/ai/recommendations/{id}/dismiss | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/ai/usage/audit | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/auth/forgot-password | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/auth/login | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/auth/mfa/verify | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/auth/refresh | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/auth/reset-password | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/finance/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/finance/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/finance/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/finance/fees/demands | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/finance/receipts | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/finance/reports/collections | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/finance/reports/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/invitations/accept | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/me/change-password | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/me/logout | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/me/schools/{schoolId}/activate | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/me/schools | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/me | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId}/attendance | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/parent/children/{studentId}/fees/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId}/fees | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId}/homework | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/parent/children/{studentId}/leave-requests | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId}/notices | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId}/results | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId}/timetable | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children/{studentId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/children | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/parent/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/academic-years/{academicYearId}/activate | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/academic-years | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/ai/knowledge-documents | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/attendance/sessions/{sessionId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/attendance/sessions | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/bulk-jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/bulk-jobs | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/class-subjects | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/classes | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/documents/{documentId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/documents | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/exams/{examId}/publish | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/exams/{examId}/results | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/exams/{examId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/exams | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/fees/demands/{demandId}/payments | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/fees/demands/{demandId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/fees/demands | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/homework/{homeworkId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/homework | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/notices/{noticeId}/publish | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/notices/{noticeId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/notices | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | PATCH /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/parent-leave-requests | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/parent-links | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/parents | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/reports/exports/{exportId}/download | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/reports/exports/{exportId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/sections | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | PATCH /v1/school-admin/settings | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/staff/provision | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/staff | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/students/{studentId}/login-invitation | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/students/import/jobs/{bulkJobId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/students/import/jobs | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/students/import/template | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/students/import/validate | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/students/import | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/students | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/subjects | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/teacher-assignments | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/teachers | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/timetable/{timetableEntryId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/timetable | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/website/pages/{pageId}/publish | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/website/pages/{pageId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/school-admin/website/pages | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/staff/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/attendance | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/fees | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/student/homework/{homeworkId}/submissions | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/homework | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/notices | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/profile | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/results | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/student/timetable | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | PATCH /v1/super-admin/ai/automation-rules/{id} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/super-admin/ai/automation-rules | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/automation-runs | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/entitlements | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | PUT /v1/super-admin/ai/policies/{tenantId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/policies | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/super-admin/ai/recommendations/{id}/approve | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/super-admin/ai/recommendations/{id}/execute | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/super-admin/ai/recommendations/{id}/reject | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/recommendations/{id} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/super-admin/ai/recommendations | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/usage/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/ai/usage/tenants | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/audit-logs | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/dashboard/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/notifications/deliveries/{deliveryId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/notifications/deliveries | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/notifications/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/permissions | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/platform-health | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/platform-metrics | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/reports/exports/{jobId} | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | POST /v1/super-admin/reports/exports | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/reports/schools | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/reports/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/reports/tenants | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/revenue/invoices | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/revenue/summary | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/revenue/tenants | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/revenue/trends | No | Yes | CURRENT_PARTIAL |
| AI_AGENT | GET /v1/super-admin/roles/{role}/permissions | No | Yes | CURRENT_PARTIAL |
