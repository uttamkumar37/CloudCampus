# Security Testing

- Role matrix tests must cover route-level RBAC.
- Cross-tenant isolation tests must cover direct object ids from another tenant.
- Sensitive data policy tests must cover logs/responses for secrets and PII.
- Public endpoint tests must cover rate limits and non-leaky failures.
- Payment webhook tests must cover signature and idempotency.
- AI tests must cover tenant-isolated embeddings/RAG.
