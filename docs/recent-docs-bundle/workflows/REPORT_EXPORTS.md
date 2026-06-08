<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Report Exports

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SUPER_ADMIN/SCHOOL_ADMIN/FINANCE_STAFF | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SUPER_ADMIN/SCHOOL_ADMIN/FINANCE_STAFF | Form/query input | Submit/filter/search | reports\|exports | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SUPER_ADMIN/SCHOOL_ADMIN/FINANCE_STAFF | Role/scope allowed | API call | GET /v1/finance/reports/collections<br>GET /v1/finance/reports/summary<br>GET /v1/school-admin/reports/exports/{exportId}/download<br>GET /v1/school-admin/reports/exports/{exportId}<br>GET /v1/school-admin/reports/exports<br>POST /v1/school-admin/reports/exports<br>GET /v1/super-admin/reports/exports/{jobId}<br>GET /v1/super-admin/reports/exports | Domain records/jobs change | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>REPORT_EXPORT_REQUESTED | Report/bulk jobs | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SUPER_ADMIN/SCHOOL_ADMIN/FINANCE_STAFF | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| GET | /v1/finance/reports/collections | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/finance/reports/summary | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports/{exportId}/download | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports/{exportId} | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/school-admin/reports/exports | Report / Export | CURRENT_IMPLEMENTED |
| POST | /v1/school-admin/reports/exports | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/exports/{jobId} | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/exports | Report / Export | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/reports/exports | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/schools | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/summary | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/tenants | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/reports/schools/{schoolId}/summary | Report / Export | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/reports/summary | Report / Export | CURRENT_IMPLEMENTED |
