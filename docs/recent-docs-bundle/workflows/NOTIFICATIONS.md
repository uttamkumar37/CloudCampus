<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Notifications

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SUPER_ADMIN/SCHOOL_ADMIN/TEACHER/PARENT/STUDENT | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SUPER_ADMIN/SCHOOL_ADMIN/TEACHER/PARENT/STUDENT | Form/query input | Submit/filter/search | notifications\|notices | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SUPER_ADMIN/SCHOOL_ADMIN/TEACHER/PARENT/STUDENT | Role/scope allowed | API call | GET /v1/parent/children/{studentId}/notices<br>POST /v1/school-admin/notices/{noticeId}/publish<br>GET /v1/school-admin/notices/{noticeId}<br>GET /v1/school-admin/notices<br>POST /v1/school-admin/notices<br>GET /v1/student/notices<br>GET /v1/super-admin/notifications/deliveries/{deliveryId}<br>GET /v1/super-admin/notifications/deliveries | Domain records/jobs change | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>NOTICE_PUBLISHED<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>NOTICE_CREATED<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | Notification/outbox | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SUPER_ADMIN/SCHOOL_ADMIN/TEACHER/PARENT/STUDENT | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| GET | /v1/parent/children/{studentId}/notices | Student / Parent | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/notices/{noticeId}/publish | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/notices/{noticeId} | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/notices | Academic | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/notices | Academic | CURRENT_IMPLEMENTED |
| GET | /v1/student/notices | Student / Parent | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/notifications/deliveries/{deliveryId} | Notification | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/notifications/deliveries | Notification | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/notifications/summary | Notification | CURRENT_IMPLEMENTED |
| GET | /v1/teacher/notices | Academic | CURRENT_IMPLEMENTED |
