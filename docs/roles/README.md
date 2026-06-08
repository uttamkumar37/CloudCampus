<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Role Documentation

Status: CURRENT_IMPLEMENTED

Every role file follows the requested 18-section structure. Legacy `STAFF` remains in code as an alias, but the requested package documents `OFFICE_STAFF` as the primary office role.

| Role | File | Login allowed | MFA | Scope | Endpoint count | Screen count | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SUPER_ADMIN | docs/roles/SUPER_ADMIN.md | Yes | Yes | platform | 90 | 12 | CURRENT_IMPLEMENTED |
| TENANT_ADMIN | docs/roles/TENANT_ADMIN.md | Yes | Yes | tenant | 19 | 6 | CURRENT_IMPLEMENTED |
| SCHOOL_ADMIN | docs/roles/SCHOOL_ADMIN.md | Yes | Yes | school | 87 | 16 | CURRENT_IMPLEMENTED |
| PRINCIPAL | docs/roles/PRINCIPAL.md | Yes | Yes | school | 87 | 8 | CURRENT_IMPLEMENTED |
| TEACHER | docs/roles/TEACHER.md | Yes | No | class | 32 | 9 | CURRENT_IMPLEMENTED |
| STUDENT | docs/roles/STUDENT.md | Yes | No | own record | 27 | 8 | CURRENT_IMPLEMENTED |
| PARENT | docs/roles/PARENT.md | Yes | No | linked child | 30 | 10 | CURRENT_IMPLEMENTED |
| FINANCE_STAFF | docs/roles/FINANCE_STAFF.md | Yes | Yes | school | 26 | 6 | CURRENT_IMPLEMENTED |
| OFFICE_STAFF | docs/roles/OFFICE_STAFF.md | Yes | No | school | 19 | 7 | CURRENT_IMPLEMENTED |
| GUEST | docs/roles/GUEST.md | Public/auth only | No | public | 6 | 1 | CURRENT_IMPLEMENTED |
| SYSTEM | docs/roles/SYSTEM.md | No | No | system | 1 | 1 | CURRENT_IMPLEMENTED |
| AI_AGENT | docs/roles/AI_AGENT.md | No | No | AI policy scope | 0 | 1 | CURRENT_IMPLEMENTED |
