# Business Rules

## Tenant And School Rules
- A tenant owns one or more schools and all tenant-owned data must carry `tenantId`.
- School-scoped records must validate both `tenantId` and `schoolId`.
- `SUPER_ADMIN` manages platform records; school operational APIs must not treat super-admin as a school user unless explicitly designed.
- Suspended tenants must be blocked by `TenantSuspensionFilter` before business logic runs.

## Student Lifecycle Rules
- Student identity and academic history are business records, not cache.
- Promotions create lifecycle history; they must not overwrite prior academic records.
- Parent links must be tenant-owned and validated before exposing child data.
- Documents must respect storage quota, upload audit, and download authorization.

## Finance Rules
- Fee structures define obligation templates; student fee records represent assigned obligations.
- Payment gateway callbacks must be idempotent.
- Receipts/invoices must preserve historical payment facts even if student/class metadata changes later.

## AI Rules
- AI prompts, usage, and knowledge retrieval are tenant-aware.
- Embeddings and RAG queries must never cross tenant boundaries.
- AI output is assistance; it must not bypass validation, RBAC, or audit requirements.

## Website/Experience Rules
- Published public content must validate route-safe slugs/paths and schema constraints.
- Investor room protected content must honor access mode and expiry.
- Public analytics must avoid collecting sensitive student or user PII.
