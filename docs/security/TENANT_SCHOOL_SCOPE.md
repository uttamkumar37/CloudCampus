<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Tenant School Scope

Status: CURRENT_IMPLEMENTED

| Scope | Rules | Status |
| --- | --- | --- |
| Platform | SUPER_ADMIN can operate without active school. | CURRENT_IMPLEMENTED |
| Tenant | TENANT_ADMIN remains within tenant_id. | CURRENT_IMPLEMENTED |
| School | School roles require active/allowed school. | CURRENT_IMPLEMENTED |
| Class/section/subject | Teacher access from assignments. | CURRENT_IMPLEMENTED |
| Own student | Student own-record scope. | CURRENT_IMPLEMENTED |
| Linked child | Parent/guardian child scope. | CURRENT_IMPLEMENTED |
| Header spoofing | ClientTenantContextSpoofingFilter. | CURRENT_IMPLEMENTED |
| Cross-module tests | Every controller should keep role/scope coverage. | CURRENT_PARTIAL |
