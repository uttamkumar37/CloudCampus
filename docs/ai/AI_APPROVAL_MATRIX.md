<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# AI Approval Matrix

Status: CURRENT_IMPLEMENTED

| Risk level | View | Approve | Execute | Controls | Status |
| --- | --- | --- | --- | --- | --- |
| LOW | Role owner | Role owner/configured approver | Role owner where policy allows | Audit and policy check | CURRENT_PARTIAL |
| MEDIUM | Role owner/School Admin/Super Admin | School Admin/Principal/Super Admin | Approved executor only | Audit, scope, optional MFA freshness | CURRENT_PARTIAL |
| HIGH | Principal/Super Admin | Principal or Super Admin | SYSTEM after approval/Super Admin | MFA freshness, explicit human approval | PLANNED_RECOMMENDED |
| CRITICAL | Super Admin only | Super Admin only | SYSTEM after explicit approval | MFA freshness, dual control recommended | PLANNED_RECOMMENDED |

Finance Staff note: `FINANCE_STAFF` approval is implemented only for active-school `FEE_REMINDER_SUGGESTION` recommendations where `APPROVE_AI_RECOMMENDATIONS` applies. Finance Staff cannot execute recommendation automation without a separate automation-policy permission, and it is denied AI entitlement, usage-audit, and automation controls by default.

Guest note: `GUEST` has no AI permissions. Shared AI recommendation, approval, execution, automation, policy, knowledge-search, entitlement, and usage-audit endpoints return 401 without a token and 403 for authenticated GUEST sessions.
