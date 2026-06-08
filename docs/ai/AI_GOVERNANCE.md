<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# AI Governance

Status: CURRENT_IMPLEMENTED

| Component | Behavior | Status |
| --- | --- | --- |
| Tenant entitlement | Super Admin view/update tenant entitlement/budget. | CURRENT_IMPLEMENTED |
| Usage summary | Platform usage summary and tenant audit views. | CURRENT_IMPLEMENTED |
| Recommendations | Entities, repository, portal, Super Admin governance endpoints. | CURRENT_IMPLEMENTED |
| Automation rules/runs | Entities/repositories/endpoints. | CURRENT_IMPLEMENTED |
| AI policies | Super Admin policy endpoints. | CURRENT_IMPLEMENTED |
| Human approval | Approve/reject/execute endpoints exist; harden risk policy. | CURRENT_PARTIAL |
| AI_AGENT login | Interactive login blocked. | CURRENT_IMPLEMENTED |
| Prompt privacy | Audit/retrieval models exist; redaction policy review needed. | CURRENT_PARTIAL |

Verified June 8, 2026:
- `frontend/src/features/super-admin/pages/SuperAdminPlatformPage.tsx` exposes Super Admin AI tabs for usage summary, tenant usage, entitlements, policies, recommendations, automation rules, automation runs, and audit/safety notes.
- The Super Admin UI shows approval status, budget/usage, sanitized metadata, rejection reason capture, and high/critical execution confirmation.
- Service-level MFA freshness and broader risk-policy hardening remain `CURRENT_PARTIAL` unless covered by endpoint-specific backend tests.
