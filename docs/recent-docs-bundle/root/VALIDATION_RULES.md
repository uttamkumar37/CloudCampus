<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Validation Rules

Status: CURRENT_IMPLEMENTED

| Area | Current validation | Status | Required behavior |
| --- | --- | --- | --- |
| Auth login | Email normalization, rate limit, active check, password check, non-login actor denial, MFA challenge. | CURRENT_IMPLEMENTED | Reject invalid auth without leaking account state. |
| MFA verify | Challenge must be pending/unexpired and code hash must match. | CURRENT_IMPLEMENTED | Expire invalid/old challenges and audit success. |
| Refresh/logout | Refresh token active/unexpired; logout revokes access token and optional refresh token. | CURRENT_IMPLEMENTED | Rotate/revoke safely. |
| Tenant/school spoofing | ClientTenantContextSpoofingFilter protects client headers. | CURRENT_IMPLEMENTED | Server actor context is authoritative. |
| Pagination | Broad lists support page/size in many controllers; max not uniform. | CURRENT_PARTIAL | Enforce max size and stable sort. |
| Enums/status | Backend enums documented in STATUS_ENUMS. | CURRENT_IMPLEMENTED | Reject unknown enum values. |
| Role assignment | SYSTEM and AI_AGENT cannot become a human primary login role. | CURRENT_IMPLEMENTED | Keep non-login boundary. |
| AI governance | Risk/policy fields exist; approval checks should keep hardening. | CURRENT_PARTIAL | High risk requires human approval. |
| OpenAPI schema | No generated OpenAPI config discovered. | NOT_FOUND_IN_CODEBASE | Add contract generation. |
