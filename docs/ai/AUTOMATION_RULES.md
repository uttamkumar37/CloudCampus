<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Automation Rules

Status: CURRENT_IMPLEMENTED

| Action | Endpoint status | Audit | Notes |
| --- | --- | --- | --- |
| PATCH /v1/ai/automation-rules/{id} | CURRENT_IMPLEMENTED | AUTOMATION_RULE_UPDATED | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF; Read or manage automation rules/runs. |
| GET /v1/ai/automation-rules | CURRENT_IMPLEMENTED | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF; Read or manage automation rules/runs. |
| GET /v1/ai/automation-runs | CURRENT_IMPLEMENTED | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF; Read or manage automation rules/runs. |
| PATCH /v1/super-admin/ai/automation-rules/{id} | CURRENT_IMPLEMENTED | AUTOMATION_RULE_UPDATED | SUPER_ADMIN; Read or manage automation rules/runs. |
| GET /v1/super-admin/ai/automation-rules | CURRENT_IMPLEMENTED | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | SUPER_ADMIN; Read or manage automation rules/runs. |
| POST /v1/super-admin/ai/automation-rules | CURRENT_IMPLEMENTED | AUTOMATION_RULE_CREATED | SUPER_ADMIN; Read or manage automation rules/runs. |
| GET /v1/super-admin/ai/automation-runs | CURRENT_IMPLEMENTED | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | SUPER_ADMIN; Read or manage automation rules/runs. |

- CURRENT_IMPLEMENTED: Rule and run models exist.
- CURRENT_IMPLEMENTED: Super Admin portal lists, creates, enables/disables, and audits automation rules and shows automation run status through `/v1/super-admin/ai/automation-rules` and `/v1/super-admin/ai/automation-runs`.
- CURRENT_PARTIAL: Approval/retry behavior should be verified by automation type.
- PLANNED_RECOMMENDED: Add dry-run, kill switch, idempotency for high-impact automations.
