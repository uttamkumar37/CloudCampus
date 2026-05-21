# Do Not Break Rules

- Never bypass tenant isolation.
- Never trust `X-Tenant-Id` over authenticated JWT tenant context.
- Never expose internal UUIDs as user-facing labels or copy-first identifiers.
- Never overwrite historical academic records during promotion, transfer, suspension, rejoin, or correction flows.
- Never mutate an already-applied Flyway migration.
- Never skip backend validation, backend tests, or CI-equivalent commands to hide failures.
- Never disable OWASP, Trivy, secret scanning, RBAC, tenant filters, or audit logging as a fix.
- Every mutation must validate RBAC, tenant ownership, and state transition rules.
- Every mutation should create an audit log; if an existing flow lacks one, add it when touching the flow.
- Student lifecycle history is immutable unless a dedicated correction workflow is implemented and audited.
- Payment webhooks must remain idempotent and signature-validated.
- AI/RAG retrieval must remain tenant-scoped.
- Public website and investor-room content must validate schemas before publish.
