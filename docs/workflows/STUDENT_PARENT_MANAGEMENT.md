<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Student Parent Management

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Form/query input | Submit/filter/search | student\|parent\|guardian\|children | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Role/scope allowed | API call | GET /v1/parent/children/{studentId}/attendance<br>POST /v1/parent/children/{studentId}/fees/{demandId}/payments<br>GET /v1/parent/children/{studentId}/fees<br>GET /v1/parent/children/{studentId}/homework<br>GET /v1/parent/children/{studentId}/leave-requests<br>POST /v1/parent/children/{studentId}/leave-requests<br>GET /v1/parent/children/{studentId}/notices<br>GET /v1/parent/children/{studentId}/results | Domain records/jobs change | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>FEE_PAYMENT_RECORDED<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>PARENT_LEAVE_REQUESTED | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SCHOOL_ADMIN/PARENT/STUDENT/SUPER_ADMIN | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| GET | /v1/parent/children/{studentId}/attendance | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/parent/children/{studentId}/fees/{demandId}/payments | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/fees | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/homework | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/leave-requests | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/parent/children/{studentId}/leave-requests | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/notices | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/results | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/timetable | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId} | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/dashboard/summary | Student / Parent | CURRENT_IMPLEMENTED |
| PATCH | /v1/school-admin/parent-leave-requests/{leaveRequestId} | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/parent-leave-requests | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/parent-links | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/parents | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/{studentId}/login-invitation | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students/import/jobs/{bulkJobId} | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import/jobs | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students/import/template | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import/validate | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/students/import | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/students | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/attendance | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/dashboard/summary | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/fees | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/student/homework/{homeworkId}/submissions | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/homework | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/notices | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/profile | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/results | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/timetable | Student / Parent | CURRENT_IMPLEMENTED |
| DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | Super Admin | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | Super Admin | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/students/{studentId}/guardians | Super Admin | CURRENT_IMPLEMENTED |
