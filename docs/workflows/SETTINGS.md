<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Settings

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SUPER_ADMIN/TENANT_ADMIN/SCHOOL_ADMIN | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SUPER_ADMIN/TENANT_ADMIN/SCHOOL_ADMIN | Form/query input | Submit/filter/search | settings | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SUPER_ADMIN/TENANT_ADMIN/SCHOOL_ADMIN | Role/scope allowed | API call | GET /v1/school-admin/settings<br>PATCH /v1/school-admin/settings<br>GET /v1/super-admin/settings<br>PATCH /v1/super-admin/settings<br>PATCH /v1/super-admin/tenants/{tenantId}/settings<br>GET /v1/tenant-admin/settings<br>PATCH /v1/tenant-admin/settings | Domain records/jobs change | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>CURRENT_PARTIAL settings audit<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>PLATFORM_SETTINGS_UPDATED<br>TENANT_SETTINGS_UPDATED<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SUPER_ADMIN/TENANT_ADMIN/SCHOOL_ADMIN | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| GET | /v1/school-admin/settings | Settings | CURRENT_IMPLEMENTED |
| PATCH | /v1/school-admin/settings | Settings | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/settings | Settings | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/settings | Settings | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/tenants/{tenantId}/settings | Settings | CURRENT_IMPLEMENTED |
| GET | /v1/tenant-admin/settings | Settings | CURRENT_IMPLEMENTED |
| PATCH | /v1/tenant-admin/settings | Settings | CURRENT_IMPLEMENTED |
