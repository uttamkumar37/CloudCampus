<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# API Security Checklist

Status: CURRENT_IMPLEMENTED

| Control | Status | Notes |
| --- | --- | --- |
| JWT auth | CURRENT_IMPLEMENTED | Protected APIs use JWT/auth resolver. |
| Role guards | CURRENT_IMPLEMENTED | Service/controller role checks. |
| Scope guard | CURRENT_IMPLEMENTED | Tenant/school/class/child scoped services. |
| Header spoofing block | CURRENT_IMPLEMENTED | ClientTenantContextSpoofingFilter. |
| MFA privileged roles | CURRENT_IMPLEMENTED | AuthSessionService. |
| System/AI login block | CURRENT_IMPLEMENTED | AuthSessionService. |
| Login rate limit | CURRENT_IMPLEMENTED | LoginRateLimiterService. |
| Global rate limit | CURRENT_PARTIAL | Recommended. |
| OpenAPI | NOT_FOUND_IN_CODEBASE | Recommended. |
| MFA freshness | CURRENT_PARTIAL | Recommended for sensitive commands. |
| Field privacy | CURRENT_PARTIAL | Review DTO/export fields. |
