<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# AI Approval Matrix

Status: CURRENT_IMPLEMENTED

| Risk level | View | Approve | Execute | Controls | Status |
| --- | --- | --- | --- | --- | --- |
| LOW | Role owner | Role owner/configured approver | Role owner where policy allows | Audit and policy check | CURRENT_PARTIAL |
| MEDIUM | Role owner/School Admin/Super Admin | School Admin/Principal/Super Admin | Approved executor only | Audit, scope, optional MFA freshness | CURRENT_PARTIAL |
| HIGH | Principal/Super Admin | Principal or Super Admin | SYSTEM after approval/Super Admin | MFA freshness, explicit human approval | PLANNED_RECOMMENDED |
| CRITICAL | Super Admin only | Super Admin only | SYSTEM after explicit approval | MFA freshness, dual control recommended | PLANNED_RECOMMENDED |
