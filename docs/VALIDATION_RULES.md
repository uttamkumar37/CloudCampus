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
| Super Admin role scope | UI requires tenant scope for tenant/school roles, school scope for school-scoped roles, blocks legacy STAFF for new assignments, and requires reason text for permission override changes. | CURRENT_IMPLEMENTED | Keep frontend guardrails aligned with backend access-control validation. |
| Super Admin subscriptions | Plan edit/create sends backend enum values only (`ACTIVE`, `ARCHIVED`); tenant subscription assignment requires tenant ID and plan code, and optional date fields are sent as UTC instants. | CURRENT_IMPLEMENTED | Reject archived plan assignment and invalid billing cycles server-side. |
| Super Admin revenue filters | Invoice list accepts optional `tenantId`, `status`, `from`, and `to`; date filters must be `yyyy-MM-dd` and are applied as UTC day bounds. | CURRENT_IMPLEMENTED | Invalid dates return 400 and must be shown as safe UI errors. |
| Super Admin notifications | Delivery detail displays `maskedRecipient`; failure reason and subject are sanitized before rendering. | CURRENT_IMPLEMENTED | Never display token, password, MFA, secret, API key, or raw prompt values. |
| AI governance | Risk/policy fields exist; approval checks should keep hardening. | CURRENT_PARTIAL | High risk requires human approval. |
| Super Admin AI governance UI | Entitlement update requires tenant ID and at least one enabled feature when enabled; recommendation metadata is JSON-normalized and displayed only through sanitized summaries; high/critical execution requires confirmation. | CURRENT_IMPLEMENTED | Never render raw prompt text in Super Admin recommendation/detail views. |
| OpenAPI schema | No generated OpenAPI config discovered. | NOT_FOUND_IN_CODEBASE | Add contract generation. |
