<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Test Plan

Status: CURRENT_IMPLEMENTED

| Layer | Current assets | Status | Recommended additions |
| --- | --- | --- | --- |
| Backend unit/integration | 40 Java test files discovered. | CURRENT_IMPLEMENTED | Add endpoint-by-endpoint role/scope tests. |
| Frontend unit/component | 22 frontend test files discovered. | CURRENT_IMPLEMENTED | Add role navigation and empty/error state tests. |
| Performance | 2 performance scripts discovered. | CURRENT_IMPLEMENTED | Add large tenant/school/audit/export scenarios. |
| Contract/OpenAPI | No generated OpenAPI test suite discovered. | NOT_FOUND_IN_CODEBASE | Generate and validate clients. |
| Security/RBAC | Auth/session and guard tests discovered. | CURRENT_PARTIAL | Matrix-test critical endpoints. |
