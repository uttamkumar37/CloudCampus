# Glossary

- Tenant: SaaS customer boundary. Owns schools, users, subscriptions, features, and school data.
- School: Operational institution inside a tenant.
- School Admin: User role responsible for school operations.
- Tenant Admin: Tenant-level administrator above school admin.
- Super Admin: Platform operator role.
- Student Profile 360: Extended student profile covering identity, medical, logistics, behavior, achievements, communication, and enrichment.
- Feature Flag: Tenant entitlement switch cached in Redis.
- RAG: Retrieval-augmented generation using tenant-scoped knowledge and embeddings.
- RequestContext: Thread-local backend context containing tenant, school, and user information.
- Audit Log: Immutable event record for security, compliance, and operational traceability.
- Experience Platform: Public website, investor-room, storytelling, campaigns, and analytics modules under `experience`.
