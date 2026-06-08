<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# User Role Management

Status: CURRENT_IMPLEMENTED

| Step | Actor | Preconditions | Trigger | API sequence | State changes | Audit events | Notifications/background jobs | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Open screen | SUPER_ADMIN | Authenticated/scoped session | Navigation/quick action | /v1/me then screen APIs | No mutation | Read audit CURRENT_PARTIAL | None | Loading/error/empty state | CURRENT_IMPLEMENTED |
| 2. Validate request | SUPER_ADMIN | Form/query input | Submit/filter/search | /v1/super-admin/users | No mutation until accepted | Validation failures not always audited | None | 400/403/404/409 shown | CURRENT_PARTIAL |
| 3. Execute | SUPER_ADMIN | Role/scope allowed | API call | DELETE /v1/super-admin/users/{userId}/permission-overrides/{overrideId}<br>PATCH /v1/super-admin/users/{userId}/permission-overrides/{overrideId}<br>GET /v1/super-admin/users/{userId}/permission-overrides<br>POST /v1/super-admin/users/{userId}/permission-overrides<br>DELETE /v1/super-admin/users/{userId}/roles/{roleAssignmentId}<br>PATCH /v1/super-admin/users/{userId}/roles/{roleAssignmentId}<br>GET /v1/super-admin/users/{userId}/roles<br>POST /v1/super-admin/users/{userId}/roles | Domain records/jobs change | PERMISSION_OVERRIDE_REVOKED<br>Audit action inferred from module; verify service for exact enum.<br>Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.<br>PERMISSION_OVERRIDE_GRANTED or PERMISSION_OVERRIDE_DENIED<br>ROLE_DEACTIVATED<br>ROLE_UPDATED | Module-specific | Rollback transaction or job failure state | CURRENT_IMPLEMENTED |
| 4. Refresh/result | SUPER_ADMIN | Command succeeded | Refetch or local update | GET list/detail/dashboard | UI reflects server state | Read audit partial | Async status progresses | Retry safe reads | CURRENT_PARTIAL |

## Related Endpoints

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | Super Admin | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users/{userId}/permission-overrides | Super Admin | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/users/{userId}/permission-overrides | Super Admin | CURRENT_IMPLEMENTED |
| DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | Super Admin | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users/{userId}/roles | Super Admin | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/users/{userId}/roles | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users/{userId} | Super Admin | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users | Super Admin | CURRENT_IMPLEMENTED |
