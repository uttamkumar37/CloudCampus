# Core Documentation

Core docs define the rules future developers and AI agents must obey before touching code.

## Reading Order
1. `PROJECT_OVERVIEW.md`
2. `SYSTEM_ARCHITECTURE.md`
3. `BUSINESS_RULES.md`
4. `DO_NOT_BREAK_RULES.md`
5. `SECURITY_RULES.md`
6. Layer-specific docs under `01-backend`, `02-frontend`, `03-mobile`, `04-database`, and `05-devops`

## Non-Negotiable Themes
- Tenant isolation is the primary safety boundary.
- JWT/RBAC decides identity and capability; client-visible navigation is only convenience.
- Student academic history is not disposable operational state.
- Mutations need validation, tenant ownership checks, and audit logs.
- Migrations are append-only and must be tested with Flyway.
