# Testing Strategy

## Backend
CI runs `mvn verify --batch-mode --no-transfer-progress`. Tests include auth, RBAC, security headers, tenant isolation, finance, exam, storage, experience website validation, investor room expiry/audit, MFA, sensitive data policy, and AI embedding tenant isolation.

## Frontend
CI runs `npm run build`, which performs TypeScript project build and Vite production build. Vitest tests exist for protected routes, tenant pages, and experience analytics consent/tracking.

## Mobile
A typecheck script exists. CI currently does not run mobile despite a mobile directory existing locally.

## Required Coverage By Change Type
- Auth/RBAC: positive and negative role tests.
- Tenant data: cross-tenant denial tests.
- Migrations: repository/service integration test or app boot validation.
- UI: render/route/API error tests for changed screens.
