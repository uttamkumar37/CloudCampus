<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Role Screen Matrix

Status: CURRENT_IMPLEMENTED

| Role | Screen | Route/nav id | Visible | API/source | Status |
| --- | --- | --- | --- | --- | --- |
| SUPER_ADMIN | Dashboard | dashboard | Yes | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Tenants | tenants | Yes | /v1/super-admin/ai/tenants/{tenantId}/entitlement | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Schools | schools | Yes | /v1/me/schools/{schoolId}/activate | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Access Control | access-control | Yes | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Subscription Plans | subscriptions | Yes | /v1/super-admin/subscriptions/plans/{planId} | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Revenue | revenue | Yes | /v1/super-admin/revenue/invoices | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | AI Governance | ai-usage | Yes | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Reports | reports | Yes | /v1/super-admin/reports/exports/{jobId} | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Audit Logs | audit | Yes | /v1/ai/usage/audit | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Platform Health | health | Yes | /v1/super-admin/platform-health | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Notifications | notifications | Yes | /v1/super-admin/notifications/deliveries/{deliveryId} | CURRENT_IMPLEMENTED |
| SUPER_ADMIN | Settings | settings | Yes | /v1/super-admin/settings | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Dashboard | dashboard | Yes | /v1/tenant-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Schools | schools | Yes | /v1/me/schools/{schoolId}/activate | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | School Admins | admins | Yes | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Reports | reports | Yes | /v1/tenant-admin/reports/schools/{schoolId}/summary | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Subscription Usage | usage | Yes | /v1/tenant-admin/subscription/usage | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | Settings | settings | Yes | /v1/tenant-admin/settings | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Dashboard | dashboard | Yes | /v1/school-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Students | students | Yes | /v1/school-admin/students/{studentId}/login-invitation | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Parents | parents | Yes | /v1/school-admin/parents | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Teachers | teachers | Yes | /v1/school-admin/teachers | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Staff | staff | Yes | /v1/school-admin/staff/provision | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Academic Setup | academic | Yes | /v1/school-admin/academic-years/{academicYearId}/activate | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Attendance | attendance | Yes | /v1/school-admin/attendance/sessions/{sessionId} | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Homework | homework | Yes | /v1/school-admin/homework/{homeworkId} | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Exams & Results | exams | Yes | /v1/school-admin/exams/{examId}/publish | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Fees | fees | Yes | /v1/school-admin/fees/demands/{demandId}/payments | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Timetable | timetable | Yes | /v1/school-admin/timetable/{timetableEntryId} | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Notices | notices | Yes | /v1/school-admin/notices/{noticeId}/publish | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Reports | reports | Yes | /v1/school-admin/reports/exports/{exportId}/download | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Documents | documents | Yes | /v1/school-admin/ai/knowledge-documents | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Website Builder | website | Yes | /v1/school-admin/website/pages/{pageId}/publish | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | Settings | settings | Yes | /v1/school-admin/settings | CURRENT_IMPLEMENTED |
| PRINCIPAL | Dashboard | dashboard | Yes | /v1/school-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| PRINCIPAL | Teachers | teachers | Yes | /v1/school-admin/teachers | CURRENT_IMPLEMENTED |
| PRINCIPAL | Students | students | Yes | /v1/school-admin/students/{studentId}/login-invitation | CURRENT_IMPLEMENTED |
| PRINCIPAL | Attendance Review | attendance | Yes | /v1/school-admin/attendance/sessions/{sessionId} | CURRENT_IMPLEMENTED |
| PRINCIPAL | Exams | exams | Yes | /v1/school-admin/exams/{examId}/publish | CURRENT_IMPLEMENTED |
| PRINCIPAL | Results Approval | results | Yes | /v1/school-admin/exams/{examId}/results | CURRENT_IMPLEMENTED |
| PRINCIPAL | AI Approvals | ai-suggestions | Yes | /v1/school-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| PRINCIPAL | Reports | reports | Yes | /v1/school-admin/reports/exports/{exportId}/download | CURRENT_IMPLEMENTED |
| TEACHER | Dashboard | dashboard | Yes | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED |
| TEACHER | My Classes | classes | Yes | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED |
| TEACHER | Attendance | attendance | Yes | /v1/teacher/attendance/sessions/{sessionId} | CURRENT_IMPLEMENTED |
| TEACHER | Homework | homework | Yes | /v1/teacher/homework/{homeworkId} | CURRENT_IMPLEMENTED |
| TEACHER | Exams | exams | Yes | /v1/teacher/exams/{examId}/results | CURRENT_IMPLEMENTED |
| TEACHER | Marks | marks | Yes | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED |
| TEACHER | Notices | notices | Yes | /v1/teacher/notices | CURRENT_IMPLEMENTED |
| TEACHER | Timetable | timetable | Yes | /v1/teacher/timetable | CURRENT_IMPLEMENTED |
| TEACHER | AI Suggestions | ai-suggestions | Yes | /v1/teacher/dashboard/summary | CURRENT_IMPLEMENTED |
| STUDENT | Dashboard | dashboard | Yes | /v1/student/dashboard/summary | CURRENT_IMPLEMENTED |
| STUDENT | Homework | homework | Yes | /v1/student/homework/{homeworkId}/submissions | CURRENT_IMPLEMENTED |
| STUDENT | Results | results | Yes | /v1/student/results | CURRENT_IMPLEMENTED |
| STUDENT | Fees | fees | Yes | /v1/student/fees | CURRENT_IMPLEMENTED |
| STUDENT | Notices | notices | Yes | /v1/student/notices | CURRENT_IMPLEMENTED |
| STUDENT | Attendance | attendance | Yes | /v1/student/attendance | CURRENT_IMPLEMENTED |
| STUDENT | Timetable | timetable | Yes | /v1/student/timetable | CURRENT_IMPLEMENTED |
| STUDENT | AI Study Help | ai-suggestions | Yes | /v1/student/dashboard/summary | CURRENT_IMPLEMENTED |
| PARENT | Dashboard | dashboard | Yes | /v1/parent/dashboard/summary | CURRENT_IMPLEMENTED |
| PARENT | My Children | children | Yes | /v1/parent/children/{studentId}/attendance | CURRENT_IMPLEMENTED |
| PARENT | Attendance | attendance | Yes | /v1/parent/children/{studentId}/attendance | CURRENT_IMPLEMENTED |
| PARENT | Homework | homework | Yes | /v1/parent/children/{studentId}/homework | CURRENT_IMPLEMENTED |
| PARENT | Results | results | Yes | /v1/parent/children/{studentId}/results | CURRENT_IMPLEMENTED |
| PARENT | Fees | fees | Yes | /v1/parent/children/{studentId}/fees/{demandId}/payments | CURRENT_IMPLEMENTED |
| PARENT | Notices | notices | Yes | /v1/parent/children/{studentId}/notices | CURRENT_IMPLEMENTED |
| PARENT | Timetable | timetable | Yes | /v1/parent/children/{studentId}/timetable | CURRENT_IMPLEMENTED |
| PARENT | Leave Requests | leave | Yes | /v1/parent/children/{studentId}/leave-requests | CURRENT_IMPLEMENTED |
| PARENT | AI Recommendations | ai-suggestions | Yes | /v1/parent/dashboard/summary | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Dashboard | dashboard | Yes | /v1/finance/dashboard/summary | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Fee Demands | fees | Yes | /v1/finance/fees/demands/{demandId}/payments | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Payments | payments | Yes | /v1/finance/fees/demands/{demandId}/payments | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Receipts | receipts | Yes | /v1/finance/receipts | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | Reports | reports | Yes | /v1/finance/reports/collections | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | AI Fee Suggestions | ai-suggestions | Yes | /v1/finance/dashboard/summary | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Dashboard | dashboard | Yes | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Admissions | admissions | Yes | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Enquiries | enquiries | Yes | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Student Records | students | Yes | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Documents | documents | Yes | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | Certificates | certificates | Yes | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | AI Follow-ups | ai-suggestions | Yes | /v1/staff/dashboard/summary | CURRENT_IMPLEMENTED |
| GUEST | Dashboard | dashboard | Yes | /v1/me | CURRENT_IMPLEMENTED |
| SYSTEM | System Activity | dashboard | Yes | /v1/me | CURRENT_IMPLEMENTED |
| AI_AGENT | AI Activity | dashboard | Yes | /v1/me | CURRENT_IMPLEMENTED |
