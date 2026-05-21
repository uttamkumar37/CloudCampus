# RBAC Rules

## Route-Level Matrix
- `/v1/super-admin/**`: `SUPER_ADMIN`.
- `/v1/admin/**`: `TENANT_ADMIN`, `SUPER_ADMIN`.
- `/v1/school-admin/**`: `SCHOOL_ADMIN`, `TENANT_ADMIN`.
- `/v1/public/**`, selected auth routes, payment webhook, public experience routes: public.
- Other routes require authentication, with method-level `@PreAuthorize` where applicable.

## Role Safety
- Student, parent, and teacher APIs must only expose the caller's own scoped records unless explicitly delegated by school admin.
- Tenant admin access to school-admin paths still requires tenant ownership.
- Super admin operations belong under `/v1/super-admin/**`, not school operational routes.
