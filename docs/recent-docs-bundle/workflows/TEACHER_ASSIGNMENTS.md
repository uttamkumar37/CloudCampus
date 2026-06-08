<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Teacher Assignments

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SCHOOL_ADMIN/SUPER_ADMIN/TEACHER | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SCHOOL_ADMIN/SUPER_ADMIN/TEACHER | Form/query input | Submit/filter/search | teacher | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SCHOOL_ADMIN/SUPER_ADMIN/TEACHER | Role/scope allowed | API call | GET /v1/school-admin/teacher-assignments<br>POST /v1/school-admin/teacher-assignments<br>GET /v1/school-admin/teachers<br>DELETE /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}<br>PATCH /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}<br>POST /v1/super-admin/teachers/{teacherUserId}/assignments<br>GET /v1/teacher/assignments<br>GET /v1/teacher/attendance/sessions/{sessionId} | Domain records/jobs change | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Audit action inferred from module; verify service for exact enum.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>TEACHER_ASSIGNMENT_DEACTIVATED<br>TEACHER_ASSIGNMENT_UPDATED or TEACHER_ASSIGNMENT_DEACTIVATED<br>TEACHER_ASSIGNMENT_CREATED | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SCHOOL_ADMIN/SUPER_ADMIN/TEACHER | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| GET | /v1/school-admin/teacher-assignments | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/teacher-assignments | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/teachers | Academic | CURRENT_IMPLEMENTED |
| DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | Super Admin | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | Super Admin | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/teachers/{teacherUserId}/assignments | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/assignments | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/attendance/sessions/{sessionId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/teacher/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/dashboard/summary | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/teacher/exams/{examId}/results | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/exams/{examId}/roster | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/exams/{examId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/exams | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/homework/{homeworkId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/homework | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/teacher/homework | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/notices | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/timetable | Academic | CURRENT_IMPLEMENTED |
