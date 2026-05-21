# Contributing

## Local Validation
- Backend: `cd backend && mvn verify --batch-mode --no-transfer-progress`
- Frontend: `cd frontend && npm ci && npm run build`
- Mobile: `cd mobile && npm install && npm run typecheck`
- Local infra: `docker compose up -d`

## Pull Request Checklist
- Scope is limited to the requested module/layer.
- Tenant and school ownership checks are preserved.
- RBAC is explicit for new APIs.
- Mutations have audit logging or a documented reason plus follow-up task.
- Flyway migrations are append-only and locally validated.
- API docs and module docs are updated.
- Tests cover success, validation failure, RBAC failure, and cross-tenant denial where relevant.

## Release Checklist
- CI backend/frontend/secret scan pass.
- Security nightly reviewed for OWASP/Trivy findings.
- Docker publish completed for the target branch/tag.
- OpenAPI artifact generated for release notes or downstream consumers.
- Database backup exists before production migration.
- Rollback path is documented for app and database.
