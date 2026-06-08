<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# School Management

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | TENANT_ADMIN/SCHOOL_ADMIN/SUPER_ADMIN | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | TENANT_ADMIN/SCHOOL_ADMIN/SUPER_ADMIN | Form/query input | Submit/filter/search | school | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | TENANT_ADMIN/SCHOOL_ADMIN/SUPER_ADMIN | Role/scope allowed | API call | POST /v1/me/schools/{schoolId}/activate<br>GET /v1/me/schools<br>POST /v1/school-admin/academic-years/{academicYearId}/activate<br>GET /v1/school-admin/academic-years<br>POST /v1/school-admin/academic-years<br>GET /v1/school-admin/ai/knowledge-documents<br>POST /v1/school-admin/ai/knowledge-documents<br>GET /v1/school-admin/attendance/sessions/{sessionId} | Domain records/jobs change | Audit action inferred from module; verify service for exact enum.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Audit action inferred from module; verify service for exact enum.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Audit action inferred from module; verify service for exact enum.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | TENANT_ADMIN/SCHOOL_ADMIN/SUPER_ADMIN | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| POST | /v1/me/schools/{schoolId}/activate | Me / Session | CURRENT_IMPLEMENTED |
| GET | /v1/me/schools | Me / Session | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/academic-years/{academicYearId}/activate | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/academic-years | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/academic-years | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/ai/knowledge-documents | School Admin | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/ai/knowledge-documents | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/attendance/sessions/{sessionId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/bulk-jobs/{bulkJobId}/cancel | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/bulk-jobs/{bulkJobId} | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/bulk-jobs | School Admin | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/bulk-jobs | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/class-subjects | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/class-subjects | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/classes | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/classes | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/dashboard/summary | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/documents/{documentId} | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/documents | School Admin | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/documents | School Admin | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams/{examId}/publish | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams/{examId}/results | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/exams/{examId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/exams | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/fees/demands/{demandId}/payments | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/fees/demands/{demandId} | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/fees/demands | Finance | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/fees/demands | Finance | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/homework/{homeworkId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/homework | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/homework | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/notices/{noticeId}/publish | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/notices/{noticeId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/notices | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/notices | Academic | CURRENT_IMPLEMENTED |
| PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/parent-leave-requests | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/parent-links | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/parents | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports/{exportId}/download | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports/{exportId} | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports | Report / Export | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/reports/exports | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/sections | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/sections | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/settings | Settings | CURRENT_IMPLEMENTED |
| PATCH | /v1/school-admin/settings | Settings | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/staff/provision | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/staff | School Admin | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/{studentId}/login-invitation | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students/import/jobs/{bulkJobId} | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import/jobs | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students/import/template | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import/validate | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/subjects | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/subjects | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/teacher-assignments | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/teacher-assignments | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/teachers | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/timetable/{timetableEntryId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/timetable | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/timetable | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/website/pages/{pageId}/publish | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/website/pages/{pageId} | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/website/pages | School Admin | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/website/pages | School Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/schools | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/schools/{schoolId} | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/schools | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/tenants/{tenantId}/schools | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | Report / Export | CURRENT_IMPLEMENTED |
| DELETE | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/access | Tenant Admin | CURRENT_IMPLEMENTED |
| POST | /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation | Tenant Admin | CURRENT_IMPLEMENTED |
| POST | /v1/tenant-admin/schools/{schoolId}/admins/invite | Tenant Admin | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/schools/{schoolId}/admins | Tenant Admin | CURRENT_IMPLEMENTED |
