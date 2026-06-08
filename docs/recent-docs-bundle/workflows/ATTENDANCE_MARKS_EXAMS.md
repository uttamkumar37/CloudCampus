<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Attendance Marks Exams

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SCHOOL_ADMIN/PRINCIPAL/TEACHER/STUDENT/PARENT | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SCHOOL_ADMIN/PRINCIPAL/TEACHER/STUDENT/PARENT | Form/query input | Submit/filter/search | attendance\|exam\|result\|homework | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SCHOOL_ADMIN/PRINCIPAL/TEACHER/STUDENT/PARENT | Role/scope allowed | API call | GET /v1/parent/children/{studentId}/attendance<br>GET /v1/parent/children/{studentId}/homework<br>GET /v1/parent/children/{studentId}/results<br>GET /v1/school-admin/attendance/sessions/{sessionId}<br>GET /v1/school-admin/attendance/sessions<br>POST /v1/school-admin/attendance/sessions<br>POST /v1/school-admin/exams/{examId}/publish<br>POST /v1/school-admin/exams/{examId}/results | Domain records/jobs change | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>ATTENDANCE_SUBMITTED | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SCHOOL_ADMIN/PRINCIPAL/TEACHER/STUDENT/PARENT | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| GET | /v1/parent/children/{studentId}/attendance | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/homework | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/parent/children/{studentId}/results | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/attendance/sessions/{sessionId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams/{examId}/publish | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams/{examId}/results | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/exams/{examId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/exams | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/exams | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/homework/{homeworkId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/homework | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/homework | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/student/attendance | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/student/homework/{homeworkId}/submissions | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/homework | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/student/results | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/attendance/sessions/{sessionId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/teacher/attendance/sessions | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/teacher/exams/{examId}/results | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/exams/{examId}/roster | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/exams/{examId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/exams | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/homework/{homeworkId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/homework | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/teacher/homework | Academic | CURRENT_IMPLEMENTED |
