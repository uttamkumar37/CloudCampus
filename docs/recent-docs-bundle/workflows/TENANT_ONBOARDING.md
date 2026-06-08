<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Tenant Onboarding

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SUPER_ADMIN | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SUPER_ADMIN | Form/query input | Submit/filter/search | /v1/super-admin/tenants/onboard | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SUPER_ADMIN | Role/scope allowed | API call | POST /v1/super-admin/tenants/onboard | Domain records/jobs change | TENANT_CREATED, SCHOOL_CREATED, SCHOOL_ADMIN_INVITED | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SUPER_ADMIN | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| POST | /v1/super-admin/tenants/onboard | Super Admin | CURRENT_IMPLEMENTED |
