<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Screen By Screen Details

Status: CURRENT_IMPLEMENTED

| Role | Screen | Route/nav id | Primary API/source | Loading | Empty | Error | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SUPER_ADMIN | Dashboard | dashboard | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Tenants | tenants | /v1/super-admin/ai/tenants/{tenantId}/entitlement | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Schools | schools | /v1/me/schools/{schoolId}/activate | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Access Control | access-control | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Subscription Plans | subscriptions | /v1/super-admin/subscriptions/plans/{planId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Revenue | revenue | /v1/super-admin/revenue/invoices | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | AI Governance | ai-usage | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Reports | reports | /v1/super-admin/reports/exports/{jobId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Audit Logs | audit | /v1/ai/usage/audit | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Platform Health | health | /v1/super-admin/platform-health | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Notifications | notifications | /v1/super-admin/notifications/deliveries/{deliveryId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Settings | settings | /v1/super-admin/settings | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Dashboard | dashboard | /v1/tenant-admin/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Schools | schools | /v1/me/schools/{schoolId}/activate | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | School Admins | admins | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Reports | reports | /v1/tenant-admin/reports/schools/{schoolId}/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Subscription Usage | usage | /v1/tenant-admin/subscription/usage | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Settings | settings | /v1/tenant-admin/settings | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Dashboard | dashboard | /v1/school-admin/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Students | students | /v1/school-admin/students/{studentId}/login-invitation | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Parents | parents | /v1/school-admin/parents | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Teachers | teachers | /v1/school-admin/teachers | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Staff | staff | /v1/school-admin/staff/provision | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Academic Setup | academic | /v1/school-admin/academic-years/{academicYearId}/activate | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Attendance | attendance | /v1/school-admin/attendance/sessions/{sessionId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Homework | homework | /v1/school-admin/homework/{homeworkId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Exams & Results | exams | /v1/school-admin/exams/{examId}/publish | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Fees | fees | /v1/school-admin/fees/demands/{demandId}/payments | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Timetable | timetable | /v1/school-admin/timetable/{timetableEntryId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Notices | notices | /v1/school-admin/notices/{noticeId}/publish | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Reports | reports | /v1/school-admin/reports/exports/{exportId}/download | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Documents | documents | /v1/school-admin/ai/knowledge-documents | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Website Builder | website | /v1/school-admin/website/pages/{pageId}/publish | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Settings | settings | /v1/school-admin/settings | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | Dashboard | dashboard | /v1/school-admin/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | Teachers | teachers | /v1/school-admin/teachers | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | Students | students | /v1/school-admin/students/{studentId}/login-invitation | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | Attendance Review | attendance | /v1/school-admin/attendance/sessions/{sessionId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | Exams | exams | /v1/school-admin/exams/{examId}/publish | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | Results Approval | results | /v1/school-admin/exams/{examId}/results | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | AI Approvals | ai-suggestions | /v1/school-admin/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PRINCIPAL | Reports | reports | /v1/school-admin/reports/exports/{exportId}/download | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | Dashboard | dashboard | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | My Classes | classes | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | Attendance | attendance | /v1/teacher/attendance/sessions/{sessionId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | Homework | homework | /v1/teacher/homework/{homeworkId} | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | Exams | exams | /v1/teacher/exams/{examId}/results | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | Marks | marks | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | Notices | notices | /v1/teacher/notices | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | Timetable | timetable | /v1/teacher/timetable | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| TEACHER | AI Suggestions | ai-suggestions | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | Dashboard | dashboard | /v1/student/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | Homework | homework | /v1/student/homework/{homeworkId}/submissions | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | Results | results | /v1/student/results | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | Fees | fees | /v1/student/fees | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | Notices | notices | /v1/student/notices | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | Attendance | attendance | /v1/student/attendance | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | Timetable | timetable | /v1/student/timetable | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| STUDENT | AI Study Help | ai-suggestions | /v1/student/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Dashboard | dashboard | /v1/parent/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | My Children | children | /v1/parent/children/{studentId}/attendance | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Attendance | attendance | /v1/parent/children/{studentId}/attendance | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Homework | homework | /v1/parent/children/{studentId}/homework | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Results | results | /v1/parent/children/{studentId}/results | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Fees | fees | /v1/parent/children/{studentId}/fees/{demandId}/payments | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Notices | notices | /v1/parent/children/{studentId}/notices | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Timetable | timetable | /v1/parent/children/{studentId}/timetable | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | Leave Requests | leave | /v1/parent/children/{studentId}/leave-requests | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| PARENT | AI Recommendations | ai-suggestions | /v1/parent/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Dashboard | dashboard | /v1/finance/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Fee Demands | fees | /v1/finance/fees/demands/{demandId}/payments | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Payments | payments | /v1/finance/fees/demands/{demandId}/payments | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Receipts | receipts | /v1/finance/receipts | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Reports | reports | /v1/finance/reports/collections | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | AI Fee Suggestions | ai-suggestions | /v1/finance/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Dashboard | dashboard | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Admissions | admissions | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Enquiries | enquiries | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Student Records | students | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Documents | documents | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Certificates | certificates | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | AI Follow-ups | ai-suggestions | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| GUEST | Dashboard | dashboard | /v1/me | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| SYSTEM | System Activity | dashboard | /v1/me | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |
| AI_AGENT | AI Activity | dashboard | /v1/me | CURRENT_IMPLEMENTED generic loading | CURRENT_PARTIAL module empty state | CURRENT_IMPLEMENTED API error state | CURRENT_IMPLEMENTED |

- CURRENT_PARTIAL: Command palette/search is navigation-oriented.
- CURRENT_PARTIAL: Notification popover and some AI shell elements may be presentational.
- CURRENT_IMPLEMENTED: Super Admin platform page is connected to API sections for dashboard, tenants, schools, access control, subscriptions, revenue, AI, reports, audit, health, notifications, settings.
