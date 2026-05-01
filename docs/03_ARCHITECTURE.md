# CloudCampus Architecture

Version: 2026-05-01

## 1. High-Level Topology

```text
React SPA (frontend)
  -> Axios + TanStack Query
  -> HttpOnly auth cookie + X-Tenant-Slug header
  -> Spring Boot REST API (/api/v1)

Spring Boot backend
  -> TenantRequestFilter (slug/subdomain to schema)
  -> JwtAuthenticationFilter
  -> Controller -> Service -> Repository
  -> Hibernate schema-based multi-tenancy routing

PostgreSQL
  -> public schema: tenant registry + platform data
  -> tenant schemas: school domain data isolation
```

## 2. Backend Architecture

Current backend is a modular monolith under com.cloudcampus with domain packages:

- auth
- tenant
- user
- student
- teacher
- academic
- attendance
- fees
- exam
- homework
- timetable
- parent
- dashboard
- subscription
- common
- config

Layering pattern:

- controller: transport and role guards
- service: business logic + tenant validation
- repository: persistence access
- dto: API contracts
- mapper: DTO mapping (introduced for tenant module)

Cross-cutting packages:

- common/api: ApiResponse and PageResponse wrappers
- common/exception: global exception handling
- common/audit: JPA auditing with authenticated principal
- config: security, OpenAPI, password, tenant-aware Hibernate wiring

## 3. Multi-Tenant Design

Strategy: schema-per-tenant (recommended and implemented).

Tenant resolution order:

1. Request header X-Tenant-Slug
2. Legacy fallback header X-Tenant-ID (temporary compatibility)
3. Subdomain extraction when enabled
4. Default schema public

Tenant isolation flow:

- TenantRequestFilter resolves tenant slug to schema via tenant registry
- TenantContext stores schema in ThreadLocal for current request
- Hibernate multi-tenant resolver and connection provider switch schema
- TenantContext is always cleared after request completion

Security isolation notes:

- Any tenant-scoped service verifies tenant context is not public
- Super admin APIs run in public scope where appropriate
- Internal UUIDs are not required in login/session contracts

## 4. Authentication and Authorization

Auth model:

- Stateless JWT access token in HttpOnly cookie app_jwt
- JWT claims include role and tenant context
- Role guards via @PreAuthorize and SecurityConfig route rules

Login flow:

1. User chooses school by slug (or subdomain auto-lock)
2. User chooses role
3. Backend authenticates user credentials
4. JWT issued and cookie set
5. Frontend persists non-sensitive metadata only

## 5. Frontend Architecture

Structure:

- app: providers and routing
- api: axios client + endpoint constants
- components: shared UI
- features: domain-driven modules
- utils: storage and toast

Data and auth flow:

- React Query for server state
- Axios interceptor injects X-Tenant-Slug
- 401 interceptor clears session and redirects to role-appropriate login

UX conventions:

- No tenant UUID input in login
- School search/autocomplete for tenant selection
- Role selection before credentials

## 6. API Contract Standard

All APIs follow:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

Error responses are wrapped similarly with success=false and consistent status codes.

## 7. Docker and Runtime

Compose services:

- postgres
- backend
- frontend

Operational recommendations:

- Use docker compose down -v && docker compose up --build for clean validation
- Keep dev/prod environment variables separate
- Rotate JWT secrets and bootstrap credentials per environment
- Keep Flyway enabled for deterministic schema changes

## 8. Target Refactor Direction

Recommended package convergence over time:

- modules/: domain modules (auth, tenant, student...)
- common/: API envelope, exceptions, shared abstractions
- infra/: persistence, messaging, external integrations
- config/: security and framework wiring

This can be applied incrementally module-by-module without a big-bang rewrite.
