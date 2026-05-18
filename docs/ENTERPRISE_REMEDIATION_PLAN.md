# CloudCampus Enterprise Remediation Plan

Last updated: 2026-05-18

This plan turns the production/business audit into an execution roadmap. The
first section lists fixes already applied in this remediation pass. The later
sections are the remaining enterprise work required before CloudCampus should
be positioned as a production-grade commercial SaaS for real schools.

## Completed In This Pass

### Security And Tenant Isolation

- Enabled Spring method security so existing `@PreAuthorize` annotations are
  actually enforced.
- Narrowed public auth routes to login, refresh, logout, forgot-password, and
  reset-password only.
- Preserved `schoolId` in refreshed school-admin JWTs.
- Revoked all refresh sessions after password changes.
- Added a school-path interceptor for `/v1/school-admin/schools/{schoolId}/...`
  so school admins must have explicit access to the requested school.
- Replaced high-risk student `findById` usages in admin/document flows with
  explicit tenant or school scoped repository queries.
- Removed `SUPER_ADMIN` from implicit `/v1/school-admin/**` access; super-admin
  operational access should go through an explicit impersonation/support flow.
- Replaced remaining high-risk direct entity-ID lookups in finance, school
  setup, staff, staff attendance, attendance, homework, exams, lesson plans,
  online classes, video, parent links, mobile parent portal, domains, and
  invoice generation with tenant or school scoped lookups.
- Added tenant/school context restoration for async attendance alerts and the
  scheduled fee reminder worker.

### Payments

- Scoped payment order lookup and fee-record lookup by tenant.
- Removed super-admin from school-admin payment creation.
- Required authentication on payment verification.
- Added row locking for payment verification to prevent double capture.
- Added idempotent handling for already captured orders.
- Validated Razorpay order ID against the stored gateway order before capture.
- Switched payment signature comparison to constant-time comparison.
- Added tenant filtering to `PaymentOrder`.
- Added Razorpay webhook capture endpoint with signature validation.
- Added gateway event idempotency table and duplicate event suppression.
- Added duplicate `gateway_payment_id` protection.
- Added payment order expiration for browser verification flow.
- Added focused webhook regression tests for invalid signatures, duplicate
  events, successful capture, and request-context restoration.

### Public Experience And Demo Safety

- Protected investor rooms now expose metadata only from public GET.
- Investor room content is returned only after successful password unlock.
- Expired investor rooms are no longer returned by public access paths.
- Public investor showcase returns metadata only.
- Public demo credential issuance is disabled by default and explicitly enabled
  only in the dev profile.
- Added Redis-backed public IP rate limiting for DSEP/public website surfaces.
- Added the signed payment webhook endpoint to public IP rate limiting.

### File Storage

- Added upload object-key validation.
- Added 10 MB upload cap.
- Added extension and MIME allow-listing.
- Added magic-byte checks for PDF, PNG, JPEG, WebP, DOC, and DOCX.

### DevOps And DR

- Fixed restore drill to locate encrypted `.dump.gpg` backups.
- Added GPG decrypt support to the restore drill.
- Removed the CI dependency-check bypass so HIGH+ CVEs fail the workflow.
- Added DSEP analytics partitions through 2028.
- Added startup validation for production secrets across JWT, encryption,
  database, Redis, RabbitMQ, MinIO/S3, Razorpay, and enabled AI providers.

## Phase 1: Must Finish Before Real School Onboarding

Target: private pilot readiness.

- Add integration tests for method-security enforcement on every role surface.
- Continue direct entity-ID lookup hardening for lower-priority modules not yet
  covered by this pass, especially timetable, notifications, website builder,
  transport, hostel, and newly added public-site administration surfaces.
- Add permission tests for cross-school school-admin access.
- Add failed-payment webhook handling and failed-order state transitions.
- Add file antivirus scanning and quarantine workflow.
- Add per-tenant storage quotas and upload audit logs.
- Add backup restore CI drill against a seeded staging database.
- Add alert rules for auth failures, payment errors, queue depth, Redis errors,
  DB pool exhaustion, 5xx rates, and AI spend spikes.
- Add security tests for investor-room access and public demo credential gating.

## Phase 2: Production Launch Readiness

Target: launch readiness for paying schools.

- Introduce Kubernetes manifests or Helm charts with HPA, PDBs, probes, resource
  limits, network policies, and secret mounts.
- Add blue-green or canary deployment workflow.
- Add read replicas for analytics/reporting workloads.
- Add pgBouncer or managed connection pooling.
- Add Redis HA/cluster configuration and keyspace monitoring.
- Add RabbitMQ durable queues, retry policies, and dead-letter queues for every
  async workflow.
- Add outbox/inbox patterns for critical events.
- Add centralized log shipping with tenant/user correlation.
- Add OpenTelemetry traces across HTTP, DB, Redis, RabbitMQ, file storage, and AI.
- Add tenant-aware data export/delete flows for GDPR/DPDP compliance.
- Add incident runbooks for auth outage, DB failover, Redis outage, queue backup,
  payment outage, and object-storage outage.

## Phase 3: Enterprise SaaS Readiness

Target: enterprise sales and security review.

- Add SAML/OIDC SSO and SCIM provisioning.
- Add MFA, device trust, session management UI, and forced password reset policy.
- Add granular permission sets beyond coarse roles.
- Add tenant-level audit export with immutable retention.
- Add data residency controls and regional tenant placement.
- Add BYOK/KMS integration for high-tier customers.
- Add admin approval workflows for high-risk actions.
- Add customer-managed custom domains with automated SSL lifecycle.
- Add SLA dashboards and tenant health score.
- Add customer success onboarding workflows and implementation checklists.
- Add billing/subscription lifecycle with invoices, taxes, trials, renewals,
  entitlements, grace periods, and dunning.

## Phase 4: Scale To 1M+ Students

Target: global scale readiness.

- Partition large operational tables by tenant/date where write volume grows:
  attendance, notifications, audit logs, experience events, AI usage, and
  payments.
- Add archival strategy for old attendance, audit, notification, and event data.
- Move heavy analytics to OLAP storage or materialized aggregates.
- Add background job orchestration for imports, report generation, and bulk
  notifications.
- Add CDN for public websites, media, and downloadable documents.
- Add tenant-level rate limits and burst controls for public and authenticated
  APIs.
- Run load tests for 1,000 schools, 1M students, high parent-portal traffic,
  high notification volume, large uploads, and AI workloads.

## AI Platform Revenue Roadmap

- AI teacher copilot for lesson plans, homework, rubrics, and report comments.
- AI parent engagement assistant with school-approved templates.
- AI student learning coach with guardrails and age-appropriate prompts.
- AI admission/enrollment assistant for public school websites.
- AI finance copilot for fee-risk prediction and collection nudges.
- AI analytics narratives for school leadership dashboards.
- Usage-based AI credits per tenant, with premium bundles and overage billing.
- Tenant-level AI budgets, prompt audit logs, redaction, prompt-injection tests,
  and retrieval-source citations.

## Monetization Roadmap

- Tiered SaaS: Starter, Growth, Enterprise, and Enterprise Plus.
- Per-student platform fee with minimum annual contract value.
- Add-ons: AI copilots, advanced analytics, white-label mobile apps, website
  builder, custom domains, SSO/SCIM, data residency, premium support, WhatsApp
  messaging, transport GPS, hostel, and investor/demo rooms.
- Marketplace: templates, integrations, payment gateways, content packs,
  assessment packs, local compliance packs, and implementation partners.
- Enterprise services: migration, custom reports, integrations, training, and
  dedicated success manager.

## Go/No-Go Criteria

CloudCampus can enter a controlled paid pilot after Phase 1 is complete and
verified. It should not be sold as a fully enterprise-ready global SaaS until
Phases 2 and 3 are complete, with load/security testing evidence and operational
runbooks in place.

## Latest Verification

Completed on 2026-05-18:

- Backend: `mvn test --batch-mode --no-transfer-progress` — 31 tests passed.
- Frontend: `npm run build` — production build passed.
- Mobile: `npx tsc --noEmit` — typecheck passed.
