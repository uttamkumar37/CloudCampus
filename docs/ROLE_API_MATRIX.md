<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Role API Matrix

Status: CURRENT_IMPLEMENTED

| Role | Allowed endpoint count | Representative endpoints | Status |
| --- | --- | --- | --- |
| SUPER_ADMIN | 90 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | 19 | POST /v1/me/change-password<br>POST /v1/me/logout<br>POST /v1/me/schools/{schoolId}/activate<br>GET /v1/me/schools<br>GET /v1/me<br>GET /v1/tenant-admin/dashboard/summary<br>GET /v1/tenant-admin/reports/schools/{schoolId}/summary<br>GET /v1/tenant-admin/reports/summary<br>DELETE /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access<br>POST /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation<br>POST /v1/tenant-admin/schools/{schoolId}/admins/invite<br>GET /v1/tenant-admin/schools/{schoolId}/admins | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | 87 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| PRINCIPAL | 87 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| TEACHER | 32 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| STUDENT | 27 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| PARENT | 30 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | 26 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | 19 | PATCH /v1/ai/automation-rules/{id}<br>GET /v1/ai/automation-rules<br>GET /v1/ai/automation-runs<br>GET /v1/ai/entitlement<br>POST /v1/ai/knowledge/search<br>POST /v1/ai/recommendations/{id}/accept<br>POST /v1/ai/recommendations/{id}/approve<br>POST /v1/ai/recommendations/{id}/dismiss<br>POST /v1/ai/recommendations/{id}/execute<br>POST /v1/ai/recommendations/{id}/reject<br>GET /v1/ai/recommendations/{id}<br>GET /v1/ai/recommendations | CURRENT_IMPLEMENTED |
| GUEST | 6 | POST /v1/auth/forgot-password<br>POST /v1/auth/login<br>POST /v1/auth/mfa/verify<br>POST /v1/auth/refresh<br>POST /v1/auth/reset-password<br>POST /v1/invitations/accept | CURRENT_IMPLEMENTED |
| SYSTEM | 1 | GET /v1/system/readiness | CURRENT_IMPLEMENTED |
| AI_AGENT | 0 | none | CURRENT_PARTIAL |

## Full Matrix

| Role | Method | Endpoint | Allowed | Required permission | Scope | Status |
| --- | --- | --- | --- | --- | --- | --- |
| SUPER_ADMIN | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | PATCH | /v1/super-admin/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/ai/automation-rules | Yes | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/entitlements | Yes | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/policies/{tenantId} | Yes | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PUT | /v1/super-admin/ai/policies/{tenantId} | Yes | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/policies | Yes | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/ai/recommendations | Yes | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | Yes | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/usage/summary | Yes | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/ai/usage/tenants | Yes | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/audit-logs | Yes | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/dashboard/summary | Yes | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | Yes | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/notifications/deliveries | Yes | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/notifications/summary | Yes | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/permissions | Yes | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/platform-health | Yes | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/platform-metrics | Yes | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/reports/exports/{jobId} | Yes | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/reports/exports | Yes | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/reports/exports | Yes | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/reports/schools | Yes | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/reports/summary | Yes | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/reports/tenants | Yes | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/revenue/invoices | Yes | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/revenue/summary | Yes | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/revenue/tenants | Yes | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/revenue/trends | Yes | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/roles/{role}/permissions | Yes | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/schools/{schoolId} | Yes | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/schools | Yes | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/search | Yes | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/settings | Yes | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/settings | Yes | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | Yes | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | Yes | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/students/{studentId}/guardians | Yes | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/subscriptions/plans/{planId} | Yes | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/subscriptions/plans | Yes | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/subscriptions/plans | Yes | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | Yes | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | Yes | TENANT_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | Yes | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | Yes | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | Yes | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | Yes | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/audit | Yes | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/schools | Yes | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/tenants/{tenantId}/settings | Yes | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/tenants/{tenantId}/status | Yes | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/users | Yes | TENANT_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/tenants/{tenantId} | Yes | TENANT_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/tenants/onboard | Yes | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/tenants | Yes | TENANT_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | Yes | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | Yes | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/users/{userId}/permission-overrides | Yes | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/users/{userId}/permission-overrides | Yes | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | Yes | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | Yes | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/users/{userId}/roles | Yes | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | POST | /v1/super-admin/users/{userId}/roles | Yes | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/users/{userId} | Yes | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/super-admin/users | Yes | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SUPER_ADMIN | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/ai/automation-rules | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/ai/automation-runs | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/ai/entitlement | No | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/ai/knowledge/search | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/ai/recommendations/{id}/accept | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/ai/recommendations/{id}/dismiss | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/ai/usage/audit | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| TENANT_ADMIN | GET | /v1/tenant-admin/dashboard/summary | Yes | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | Yes | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/tenant-admin/reports/summary | Yes | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | Yes | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | Yes | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | Yes | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/tenant-admin/schools/{schoolId}/admins | Yes | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | Yes | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | PATCH | /v1/tenant-admin/schools/{schoolId} | Yes | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/tenant-admin/schools | Yes | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | POST | /v1/tenant-admin/schools | Yes | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/tenant-admin/settings | Yes | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | PATCH | /v1/tenant-admin/settings | Yes | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | GET | /v1/tenant-admin/subscription/usage | Yes | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/school-admin/academic-years/{academicYearId}/activate | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/academic-years | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/academic-years | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/ai/knowledge-documents | Yes | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/ai/knowledge-documents | Yes | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/attendance/sessions/{sessionId} | Yes | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/attendance/sessions | Yes | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/attendance/sessions | Yes | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/bulk-jobs | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/bulk-jobs | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/class-subjects | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/class-subjects | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/classes | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/classes | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/dashboard/summary | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/documents/{documentId} | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/documents | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/documents | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/exams/{examId}/publish | Yes | EXAM_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/exams/{examId}/results | Yes | EXAM_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/exams/{examId} | Yes | EXAM_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/exams | Yes | EXAM_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/exams | Yes | EXAM_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/fees/demands/{demandId}/payments | Yes | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/fees/demands/{demandId} | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/fees/demands | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/fees/demands | Yes | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/homework/{homeworkId} | Yes | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/homework | Yes | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/homework | Yes | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/notices/{noticeId}/publish | Yes | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/notices/{noticeId} | Yes | NOTICE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/notices | Yes | NOTICE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/notices | Yes | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | Yes | PARENT_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/parent-leave-requests | Yes | PARENT_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/parent-links | Yes | PARENT_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/parents | Yes | PARENT_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/reports/exports/{exportId}/download | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/reports/exports/{exportId} | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/reports/exports | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/reports/exports | Yes | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/sections | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/sections | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/settings | Yes | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | PATCH | /v1/school-admin/settings | Yes | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/staff/provision | Yes | STAFF_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/staff | Yes | STAFF_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/students/{studentId}/login-invitation | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | Yes | STUDENT_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/students/import/jobs | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/students/import/template | Yes | STUDENT_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/students/import/validate | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/students/import | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/students | Yes | STUDENT_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/subjects | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/subjects | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/teacher-assignments | Yes | TEACHER_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/teacher-assignments | Yes | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/teachers | Yes | TEACHER_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/timetable/{timetableEntryId} | Yes | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/timetable | Yes | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/timetable | Yes | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/website/pages/{pageId}/publish | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/website/pages/{pageId} | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/school-admin/website/pages | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | POST | /v1/school-admin/website/pages | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SCHOOL_ADMIN | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/school-admin/academic-years/{academicYearId}/activate | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/academic-years | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/academic-years | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/ai/knowledge-documents | Yes | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/ai/knowledge-documents | Yes | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/attendance/sessions/{sessionId} | Yes | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/attendance/sessions | Yes | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/attendance/sessions | Yes | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/bulk-jobs | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/bulk-jobs | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/class-subjects | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/class-subjects | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/classes | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/classes | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/dashboard/summary | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/documents/{documentId} | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/documents | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/documents | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/exams/{examId}/publish | Yes | EXAM_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/exams/{examId}/results | Yes | EXAM_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/exams/{examId} | Yes | EXAM_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/exams | Yes | EXAM_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/exams | Yes | EXAM_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/fees/demands/{demandId}/payments | Yes | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/fees/demands/{demandId} | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/fees/demands | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/fees/demands | Yes | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/homework/{homeworkId} | Yes | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/homework | Yes | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/homework | Yes | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/notices/{noticeId}/publish | Yes | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/notices/{noticeId} | Yes | NOTICE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/notices | Yes | NOTICE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/notices | Yes | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | Yes | PARENT_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/parent-leave-requests | Yes | PARENT_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/parent-links | Yes | PARENT_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/parents | Yes | PARENT_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/reports/exports/{exportId}/download | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/reports/exports/{exportId} | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/reports/exports | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/reports/exports | Yes | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/sections | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/sections | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/settings | Yes | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | PATCH | /v1/school-admin/settings | Yes | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/staff/provision | Yes | STAFF_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/staff | Yes | STAFF_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/students/{studentId}/login-invitation | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | Yes | STUDENT_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/students/import/jobs | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/students/import/template | Yes | STUDENT_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/students/import/validate | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/students/import | Yes | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/students | Yes | STUDENT_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/subjects | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/subjects | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/teacher-assignments | Yes | TEACHER_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/teacher-assignments | Yes | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/teachers | Yes | TEACHER_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/timetable/{timetableEntryId} | Yes | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/timetable | Yes | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/timetable | Yes | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/website/pages/{pageId}/publish | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/website/pages/{pageId} | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/school-admin/website/pages | Yes | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | POST | /v1/school-admin/website/pages | Yes | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED |
| PRINCIPAL | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PRINCIPAL | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/teacher/assignments | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/attendance/sessions/{sessionId} | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/attendance/sessions | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/teacher/attendance/sessions | Yes | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/dashboard/summary | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/teacher/exams/{examId}/results | Yes | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/exams/{examId}/roster | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/exams/{examId} | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/exams | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/homework/{homeworkId} | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/homework | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | POST | /v1/teacher/homework | Yes | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/notices | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/teacher/timetable | Yes | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED |
| TEACHER | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| TEACHER | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/student/attendance | Yes | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/student/dashboard/summary | Yes | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/student/fees | Yes | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | POST | /v1/student/homework/{homeworkId}/submissions | Yes | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/student/homework | Yes | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/student/notices | Yes | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/student/profile | Yes | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/student/results | Yes | EXAM_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | GET | /v1/student/timetable | Yes | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED |
| STUDENT | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| STUDENT | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId}/attendance | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | Yes | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId}/fees | Yes | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId}/homework | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId}/leave-requests | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/parent/children/{studentId}/leave-requests | Yes | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId}/notices | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId}/results | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId}/timetable | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children/{studentId} | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/children | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | GET | /v1/parent/dashboard/summary | Yes | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED |
| PARENT | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| PARENT | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/finance/dashboard/summary | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/finance/fees/demands/{demandId}/payments | Yes | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/finance/fees/demands/{demandId} | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/finance/fees/demands | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/finance/fees/demands | Yes | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/finance/receipts | Yes | FINANCE_VIEW | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/finance/reports/collections | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/finance/reports/summary | Yes | VIEW_REPORTS | school | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| FINANCE_STAFF | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/staff/dashboard/summary | Yes | STAFF_VIEW | school | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| OFFICE_STAFF | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/ai/automation-rules | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/ai/automation-runs | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/ai/entitlement | No | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/ai/knowledge/search | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/ai/recommendations/{id}/accept | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/ai/recommendations/{id}/dismiss | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/ai/usage/audit | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/auth/forgot-password | Yes | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED |
| GUEST | POST | /v1/auth/login | Yes | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED |
| GUEST | POST | /v1/auth/mfa/verify | Yes | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED |
| GUEST | POST | /v1/auth/refresh | Yes | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED |
| GUEST | POST | /v1/auth/reset-password | Yes | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED |
| GUEST | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/invitations/accept | Yes | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED |
| GUEST | POST | /v1/me/change-password | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/me/logout | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/me/schools/{schoolId}/activate | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/me/schools | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/me | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| GUEST | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/ai/automation-rules | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/ai/automation-runs | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/ai/entitlement | No | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/ai/knowledge/search | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/ai/recommendations/{id}/accept | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/ai/recommendations/{id}/dismiss | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/ai/usage/audit | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/me/change-password | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/me/logout | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/me/schools/{schoolId}/activate | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/me/schools | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/me | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/system/readiness | Yes | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED |
| SYSTEM | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| SYSTEM | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/ai/automation-rules | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/ai/automation-runs | No | VIEW_AI_AUTOMATION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/ai/entitlement | No | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/ai/knowledge/search | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/ai/recommendations/{id}/accept | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/ai/recommendations/{id}/dismiss | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/ai/usage/audit | No | MANAGE_AI_POLICY | role AI policy scope | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/auth/forgot-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/auth/login | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/auth/mfa/verify | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/auth/refresh | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/auth/reset-password | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/finance/dashboard/summary | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/finance/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/finance/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/finance/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/finance/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/finance/receipts | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/finance/reports/collections | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/finance/reports/summary | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/invitations/accept | No | PUBLIC_AUTH_FLOW | public/auth flow | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/me/change-password | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/me/logout | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/me/schools/{schoolId}/activate | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/me/schools | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/me | No | SESSION_SELF_MANAGE | current user/session | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId}/attendance | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | No | FINANCE_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId}/fees | No | FINANCE_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId}/homework | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId}/leave-requests | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/parent/children/{studentId}/leave-requests | No | PARENT_MANAGE | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId}/notices | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId}/results | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId}/timetable | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children/{studentId} | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/children | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/parent/dashboard/summary | No | PARENT_VIEW | linked child | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/academic-years/{academicYearId}/activate | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/academic-years | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/academic-years | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/ai/knowledge-documents | No | VIEW_AI_USAGE_OR_POLICY | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/ai/knowledge-documents | No | MANAGE_AI_POLICY | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/attendance/sessions/{sessionId} | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/attendance/sessions | No | ATTENDANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/attendance/sessions | No | ATTENDANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/bulk-jobs/{bulkJobId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/bulk-jobs | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/bulk-jobs | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/class-subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/class-subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/classes | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/classes | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/dashboard/summary | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/documents/{documentId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/documents | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/documents | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/exams/{examId}/publish | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/exams/{examId}/results | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/exams/{examId} | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/exams | No | EXAM_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/exams | No | EXAM_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/fees/demands/{demandId}/payments | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/fees/demands/{demandId} | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/fees/demands | No | FINANCE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/fees/demands | No | FINANCE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/homework/{homeworkId} | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/homework | No | HOMEWORK_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/homework | No | HOMEWORK_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/notices/{noticeId}/publish | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/notices/{noticeId} | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/notices | No | NOTICE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/notices | No | NOTICE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/parent-leave-requests | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/parent-links | No | PARENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/parents | No | PARENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/reports/exports/{exportId}/download | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/reports/exports/{exportId} | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/reports/exports | No | VIEW_REPORTS | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/reports/exports | No | EXPORT_REPORTS | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/sections | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/sections | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/settings | No | SETTINGS_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/school-admin/settings | No | SETTINGS_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/staff/provision | No | STAFF_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/staff | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/students/{studentId}/login-invitation | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/students/import/jobs/{bulkJobId} | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/students/import/jobs | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/students/import/template | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/students/import/validate | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/students/import | No | STUDENT_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/students | No | STUDENT_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/subjects | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/subjects | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/teacher-assignments | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/teacher-assignments | No | TEACHER_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/teachers | No | TEACHER_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/timetable/{timetableEntryId} | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/timetable | No | TIMETABLE_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/timetable | No | TIMETABLE_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/website/pages/{pageId}/publish | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/website/pages/{pageId} | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/school-admin/website/pages | No | SCHOOL_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/school-admin/website/pages | No | SCHOOL_MANAGE | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/staff/dashboard/summary | No | STAFF_VIEW | school | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/attendance | No | ATTENDANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/dashboard/summary | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/fees | No | FINANCE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/student/homework/{homeworkId}/submissions | No | HOMEWORK_MANAGE | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/homework | No | HOMEWORK_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/notices | No | NOTICE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/profile | No | STUDENT_PARENT_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/results | No | EXAM_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/student/timetable | No | TIMETABLE_VIEW | own record | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/ai/automation-rules/{id} | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/automation-rules | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/ai/automation-rules | No | MANAGE_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/automation-runs | No | VIEW_AI_AUTOMATION | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/entitlements | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/policies/{tenantId} | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PUT | /v1/super-admin/ai/policies/{tenantId} | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/policies | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/ai/recommendations/{id}/approve | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/ai/recommendations/{id}/execute | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/ai/recommendations/{id}/reject | No | AI_RECOMMENDATION_ACTION | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/recommendations/{id} | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/recommendations | No | VIEW_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/ai/recommendations | No | CREATE_AI_RECOMMENDATIONS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | No | MANAGE_AI_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/usage/summary | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/ai/usage/tenants | No | VIEW_AI_USAGE_OR_POLICY | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/audit-logs | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/dashboard/summary | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/notifications/deliveries/{deliveryId} | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/notifications/deliveries | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/notifications/summary | No | VIEW_NOTIFICATIONS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/platform-health | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/platform-metrics | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/reports/exports/{jobId} | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/reports/exports | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/reports/exports | No | EXPORT_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/reports/schools | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/reports/summary | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/reports/tenants | No | VIEW_REPORTS | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/revenue/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/revenue/summary | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/revenue/tenants | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/revenue/trends | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/roles/{role}/permissions | No | PERMISSION_VIEW_OR_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/schools/{schoolId} | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/search | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/settings | No | SETTINGS_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/students/{studentId}/guardians | No | STUDENT_GUARDIAN_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/subscriptions/plans/{planId} | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/subscriptions/plans | No | SUBSCRIPTION_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | No | FINANCE_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/teachers/{teacherUserId}/assignments | No | TEACHER_ASSIGNMENT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/tenants/{tenantId}/audit | No | VIEW_AUDIT | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/tenants/{tenantId}/schools | No | SCHOOL_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/tenants/{tenantId}/settings | No | SETTINGS_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/tenants/{tenantId}/status | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/tenants/{tenantId}/users | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/tenants/{tenantId} | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/tenants/onboard | No | TENANT_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/tenants | No | TENANT_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/users/{userId}/permission-overrides | No | PERMISSION_OVERRIDE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/super-admin/users/{userId}/roles | No | ROLE_MANAGE | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/users/{userId} | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/super-admin/users | No | SUPER_ADMIN_VIEW | platform | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/system/readiness | No | SYSTEM_VIEW | system | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/assignments | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/attendance/sessions/{sessionId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/attendance/sessions | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/teacher/attendance/sessions | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/dashboard/summary | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/teacher/exams/{examId}/results | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/exams/{examId}/roster | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/exams/{examId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/exams | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/homework/{homeworkId} | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/homework | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/teacher/homework | No | TEACHER_MANAGE | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/notices | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/teacher/timetable | No | TEACHER_VIEW | assigned class/section/subject | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/tenant-admin/dashboard/summary | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/tenant-admin/reports/summary | No | VIEW_REPORTS | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/tenant-admin/schools/{schoolId}/admins | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/tenant-admin/schools/{schoolId}/deactivate | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/tenant-admin/schools/{schoolId} | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/tenant-admin/schools | No | SCHOOL_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | POST | /v1/tenant-admin/schools | No | SCHOOL_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/tenant-admin/settings | No | SETTINGS_VIEW | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | PATCH | /v1/tenant-admin/settings | No | SETTINGS_MANAGE | tenant | CURRENT_IMPLEMENTED denied |
| AI_AGENT | GET | /v1/tenant-admin/subscription/usage | No | TENANT_VIEW | tenant | CURRENT_IMPLEMENTED denied |
