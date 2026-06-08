<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# MFA And Auth Flow

Status: CURRENT_IMPLEMENTED

| Step | Behavior | Status |
| --- | --- | --- |
| Login | Normalize email, rate limit, active check, deny SYSTEM/AI_AGENT, password check. | CURRENT_IMPLEMENTED |
| MFA challenge | Privileged roles receive MFA challenge. | CURRENT_IMPLEMENTED |
| MFA roles | SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, FINANCE_STAFF. | CURRENT_IMPLEMENTED |
| MFA verify | Pending/unexpired challenge and valid code required. | CURRENT_IMPLEMENTED |
| Token issue | JWT access and refresh token after MFA/non-MFA login. | CURRENT_IMPLEMENTED |
| Refresh | Active/unexpired refresh, active user, interactive actor. | CURRENT_IMPLEMENTED |
| Logout | Access token revoked; refresh token revoked when supplied. | CURRENT_IMPLEMENTED |
| Endpoint freshness | Uniform sensitive-action freshness not found. | CURRENT_PARTIAL |

Verified June 8, 2026:
- Super Admin portal UI now adds explicit confirmation/validation around high-risk AI execution, access-control assignment, permission override, subscription assignment, report export, and settings flows.
- Backend MFA freshness is still a documented extension point rather than a uniform request-time guard across every sensitive Super Admin mutation.
