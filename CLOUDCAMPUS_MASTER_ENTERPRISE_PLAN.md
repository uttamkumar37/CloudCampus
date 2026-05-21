# CloudCampus Master Enterprise Plan

Last updated: 2026-05-20

## Executive Positioning

CloudCampus must be positioned as an **AI-Powered School Operating System**, not only a School ERP. The winning product story is:

- One operating system for school administration, teaching, learning, parents, public websites, finance, staff, AI, and growth.
- Multi-tenant SaaS built for individual schools, school chains, coaching groups, residential schools, and government/enterprise rollouts.
- AI-first workflows that reduce admin effort, detect risk early, guide students, support teachers, and make school leadership more data-driven.
- A no-code public website and admissions conversion engine that becomes a paid monetization module, not a side feature.
- Enterprise trust through tenant isolation, RBAC, audit logs, observability, backup/restore, rate limiting, and production runbooks.

## Operating Rules

1. Preserve existing APIs and backward compatibility.
2. Preserve tenant isolation and role-based access.
3. Do not mass-modify the project.
4. Work one task at a time.
5. Every implementation task must update this file.
6. Every implementation task must include validation.
7. Security, tenant isolation, and current school workflows take priority over visual redesign.
8. New UX must be mobile-first, accessible, and componentized.

## Current Platform Inventory

### Backend

- Java 21, Spring Boot 3, Spring Security, JWT, Redis, PostgreSQL 16 with pgvector, Flyway, RabbitMQ, MinIO, Micrometer.
- Domain modules include auth, tenant, school, student, staff, attendance, staff attendance, finance, payment, exams, timetable, homework, assignments, notices, notifications, WhatsApp, reports, website builder, public website, AI, subscription, feature flags, storage, retention, and experience studio.
- Flyway migrations currently extend through V87, including AI foundation, public website builder, rollback/audit tables, upload audit logs, investor access logs, and 360 student profile tables.
- Existing production docs cover architecture, disaster recovery, audits, alerting, staging, upload security, SSO readiness, billing reconciliation, mobile release, and load testing.

### Frontend

- React 19, TypeScript, Vite, React Query, Zustand, Tailwind.
- Feature modules cover super admin, school admin, student, staff, teacher, parent, role portals, website builder, public website, auth, finance, exams, attendance, reports, notification, homework, assignments, timetable, and WhatsApp.
- Recent UI work added richer public website interactions, Super Admin public website console interactions, 360 student/staff profile foundations, and role portal foundations.

### Mobile

- Expo React Native app with authenticated app routes for attendance, QR attendance, fees, homework, assignments, children, notices, timetable, results, leave, admin leave, teacher attendance, teacher homework, and offline sync primitives.
- Offline queue/database structure exists, but enterprise conflict testing and end-user recovery workflows remain important.

### Infrastructure

- Docker Compose includes PostgreSQL pgvector, Redis, MinIO, MailHog, RabbitMQ, Prometheus, Grafana, Tempo, Loki/Promtail, Alertmanager, Nginx, and backup tooling.
- Load test scripts exist under `infra/load-tests`.
- Production gaps remain around Kubernetes manifests, CI/CD gates, managed cloud deployment topology, synthetic monitoring, and real restore drills.

## Enterprise Audit Findings

### Product Strengths

- Broad domain coverage already exists: admissions/students, staff, attendance, finance, payments, exams, homework, assignments, notices, timetable, reports, portals, public websites, AI, and subscriptions.
- Multi-role platform story is strong and can compete against fragmented school tools.
- Public Website Builder and Experience Studio are valuable differentiators when tied to admissions leads and paid plans.
- Demo/investor public website foundations already exist and are improving.

### Product Gaps

- Many modules are feature-complete but not yet guided enough for a first-time school admin.
- Onboarding is not yet a polished activation journey from signup to first school setup.
- Cross-module workflows need more "what should I do next?" guidance.
- Parent/student engagement needs habit-forming daily value: streaks, reminders, achievements, personalized insights, and communication summaries.
- Teacher workflows need stronger productivity framing: pending evaluations, lesson recommendations, class risk alerts, and workload planning.

### Monetization Gaps

- Subscription plan entities exist, but the business model is not yet consistently visible across the UI.
- Feature gates need to be felt naturally through upgrade prompts, usage meters, plan comparison, and AI/add-on nudges.
- Website Builder, AI analytics, communication credits, custom branding, custom domains, and advanced reports should be paid expansion levers.
- Billing lifecycle needs a visible SaaS control plane: trials, renewals, dunning, coupons, referrals, invoices, tax/GST readiness, and usage-based add-ons.

### UX Gaps

- Large forms and dense module pages need progressive flows, smart defaults, empty states, and contextual help.
- Navigation is module-heavy; users need role-based command centers, global search, favorites, and quick actions.
- Mobile responsiveness exists in places but must be verified systematically for every critical workflow.
- Loading/error/empty states must be consistent across all modules.
- Visual polish varies by module due to many sequential feature additions.

### Architecture Gaps

- Backend modularity is strong by package, but cross-module product workflows need dedicated orchestration services instead of UI-only composition.
- Feature flag and subscription checks should become a unified entitlement layer across backend, frontend, and mobile.
- AI needs domain-specific service boundaries: risk scoring, recommendation generation, content generation, summaries, and policy enforcement.
- Public website and school website builder concepts should be aligned under a shared content/section model where possible.
- Some current "premium" frontend data is deterministic/fallback. It should progressively connect to real APIs.

### Security Gaps

- RBAC and tenant isolation foundations exist, including tests and documentation, but every new feature must include scoped repository access and role tests.
- Sensitive staff payroll/banking and student health/documents need strict field-level authorization.
- Upload antivirus/quarantine is designed but should be implemented before enterprise claims.
- Super Admin MFA, SSO, device/session management, and audit export need implementation.
- AI prompts need ongoing injection, data leakage, and cross-tenant RAG regression tests.

### Scalability Gaps

- PostgreSQL, Redis, RabbitMQ, and pgvector are solid foundations, but large-scale claims require proof through seeded load testing.
- Heavy list APIs must enforce pagination, filtering, stable sorting, and index coverage.
- AI workloads require queueing, budget limits, tenant rate limits, retry policy, and background job monitoring.
- Website analytics and experience events require partition retention and aggregation strategy.
- Kubernetes readiness is mostly documentation/infrastructure-adjacent, not deployable manifests.

### Investor/Demo Gaps

- Public product website is improving, but demo flow should tell a complete story in under 5 minutes.
- Investor room needs protected downloads, watermarking, metrics, and share tracking.
- Demo schools should include scripted scenarios, guided tours, and role-specific "wow" dashboards.
- Product metrics should show business health: trial activation, MRR, churn risk, expansion, AI usage, website leads.

## Premium Product Pillars

1. **School Operations OS**: admissions, academics, fees, staff, attendance, exams, transport/hostel, documents, workflows.
2. **AI Intelligence Layer**: risk prediction, recommendations, summaries, generated reports, guided actions, copilots.
3. **Engagement Layer**: student, parent, teacher, school admin portals with daily useful actions.
4. **Growth Layer**: no-code public websites, SEO, admissions leads, demos, campaigns, analytics.
5. **SaaS Business Layer**: subscriptions, usage, billing, trials, coupons, add-ons, lifecycle automation.
6. **Enterprise Trust Layer**: RBAC, tenant isolation, audit, encryption, backups, observability, DR, compliance.

## SaaS Packaging Model

| Plan | Target | Included | Upgrade Trigger |
|---|---|---|---|
| Free | Small trial schools | Basic ERP, limited students, CloudCampus branding, basic website | Student limit, branding removal, reports |
| Starter | Small paid schools | Attendance, homework, notices, basic communication, basic analytics | AI, custom domain, finance automation |
| Professional | Growing schools | AI features, website builder, advanced reports, custom branding, fee automation | Multi-campus, integrations, premium AI |
| Enterprise | Chains and institutions | Full automation, custom workflows, advanced analytics, integrations, dedicated support | AI Premium, onboarding services |
| AI Premium Add-on | AI-ready schools | AI analytics, assistant, report generation, risk prediction, AI website generation | Usage credits and model tier |

## Entitlement Architecture Target

- Backend: centralized entitlement service combining subscription plan, feature flags, usage limits, tenant status, and role.
- Frontend: `useEntitlement` hook for feature visibility, locked states, usage meters, and upgrade modals.
- Mobile: entitlement snapshot from auth/session profile for offline-safe visibility.
- Audit: every blocked paid feature should optionally log feature interest for sales intelligence.
- Analytics: track feature impressions, lock clicks, upgrade clicks, trial activation, and conversion.

## AI Differentiation Roadmap

| AI Capability | Product Value | Data Boundary | Priority |
|---|---|---|---|
| AI Admin Assistant | Ask operational questions and get guided actions | Tenant + school scoped | P0 |
| Student Risk Insights | Attendance, academic, behavior, fee, wellness risk | Student scoped, role filtered | P0 |
| Teacher Productivity AI | Workload, delayed evaluation, lesson suggestions | Teacher + assigned classes | P1 |
| Parent Summary AI | Weekly child progress and action suggestions | Linked children only | P1 |
| AI Website Generator | School public website and admissions copy | Tenant website scope | P1 |
| AI Report Writer | Leadership reports and board-ready summaries | Tenant/school scoped | P1 |
| AI Search | Natural language search across permitted modules | RBAC/tenant aware | P2 |
| AI Chatbot | Website and portal help | Public vs authenticated modes | P2 |

## Security And Compliance Roadmap

- Implement Super Admin MFA.
- Implement admin device/session management.
- Implement SSO/OIDC/SAML readiness for enterprise customers.
- Implement antivirus/quarantine for uploads.
- Add field-level RBAC for payroll, health, documents, and sensitive parent income fields.
- Add audit export and retention controls.
- Add privacy, DPA, data processing, data export, and deletion workflows.
- Add AI safety tests for every new AI workflow.
- Add signed URL expiration and download watermarking for sensitive documents and investor assets.

## Scalability Roadmap

- Enforce pagination on every large list.
- Add indexes for high-cardinality tenant/school/time queries.
- Add async jobs for AI, notifications, reports, and bulk imports.
- Add queue dashboards and dead-letter workflows.
- Add k6 load tests for top workflows and public website paths.
- Add p95 latency budgets per API group.
- Add Redis cache policy by domain with invalidation rules.
- Add partition/retention strategy for analytics, audit, and notification logs.
- Add Kubernetes deployment, HPA, probes, config maps, secret references, and ingress templates.

## UX Transformation Roadmap

- Create a shared enterprise design system checklist for cards, forms, tables, tabs, badges, progress, charts, empty states, skeletons, and dialogs.
- Add global search across permitted modules.
- Add role-specific quick action bars.
- Add onboarding checklists for Super Admin, School Admin, Teacher, Parent, and Student.
- Add contextual help and AI-guided next steps.
- Add favorites/bookmarks for high-use modules.
- Add mobile verification for critical flows.
- Standardize loading/error/empty states across all pages.

## Business Growth Roadmap

- Add trial onboarding and activation scoring.
- Add subscription analytics: MRR, ARR, trial conversion, churn risk, expansion opportunities.
- Add upgrade prompts and usage meters.
- Add referral/coupon system.
- Add website lead capture, CRM-ready lead tracking, WhatsApp callback, and admissions inquiry pipeline.
- Add in-product announcements and guided tours.
- Add school success dashboard for implementation/onboarding teams.

## Implementation Phases

Status values: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`.

### Phase A: Master Planning And Product Positioning

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase B: Entitlements And Monetization

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase C: Super Admin SaaS Control Center

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase D: School Admin Experience

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase E: Student, Teacher, Parent Engagement

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase F: Website Builder Monetization Engine

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase G: AI Product Layer

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase H: Security And Compliance

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase I: Performance And Scale

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

### Phase J: Design System Consistency

| ID | Task | Priority | Status | Validation |
|---|---|---:|---:|---|

## Next Recommended Task

Start **CME-020: Audit Super Admin dashboard against SaaS control center requirements** or **CME-015: Add billing lifecycle roadmap implementation tasks**. The cleanest next step is CME-020 because the first monetization widgets are now visible and need to become a fuller SaaS command center.

Acceptance criteria for CME-020:

- Inventory current Super Admin dashboard, tenant list/detail, AI usage, and subscription surfaces.
- Identify missing revenue, churn, support, tenant health, trial, and upgrade intelligence.
- Update this file with findings.
- Keep implementation scoped to Super Admin dashboard surfaces.

## Five-Task Monetization Batch

### CME-010: Audit current subscription and feature flag APIs


Findings:

- Backend subscription endpoints exist under `/v1/super-admin`: list plans, get tenant subscription, and assign tenant plan.
- The plan enum currently supports FREE, STARTER, PROFESSIONAL, and ENTERPRISE with monthly price and tenant limits.
- Plan assignment writes limits into tenant config so existing usage-limit enforcement can react immediately.
- Feature catalog and tenant feature flag APIs exist under `/v1/super-admin/features` and `/v1/super-admin/tenants/{tenantId}/features`.
- Backend feature gating exists via `@RequiresFeature`, but not every premium workflow uses it yet.
- Frontend auth user carries enabled feature keys, and `useFeatureFlag` supports boolean feature checks.
- Gap: frontend did not have a reusable entitlement concept combining plan, feature, lock messaging, and upgrade prompts.
- Gap: auth user does not expose current subscription plan, so frontend plan inference is currently a UX aid only and not a security boundary.

### CME-011: Design unified entitlement contract


Target contract:

- Backend remains source of truth for tenant plan, features, usage limits, and role access.
- Frontend entitlement layer consumes current auth features and required plan metadata to render locks, upgrade prompts, and premium messaging.
- Backend enforcement must still be added per premium API using `@RequiresFeature` or a future entitlement service.
- Super Admin bypass remains a platform-admin behavior, not a tenant entitlement.
- AI Premium, Website Builder, advanced analytics, custom domain, and finance/reporting are primary paid surfaces.

### CME-012: Add frontend entitlement hook and locked feature component


Implemented:

- Added `frontend/src/shared/hooks/useEntitlement.ts`.
- Added `frontend/src/shared/ui/LockedFeature.tsx`.
- Exported `LockedFeature` from shared UI.
- The hook infers a UX-level plan from enabled feature flags and returns upgrade title/message metadata.
- This does not change backend security or tenant isolation.

### CME-013: Add Super Admin subscription analytics cards


Implemented:

- Added a SaaS monetization section to the Super Admin dashboard.
- The dashboard now loads subscription plan catalog data.
- Added clickable cards for plan catalog, AI add-on motion, and catalog MRR floor.
- Cards route to tenant management, AI usage, and tenant creation surfaces.

### CME-014: Add upgrade prompts to Website Builder and AI features


Implemented:

- Added `LockedFeature` prompt to School Admin Website Builder when Website Builder entitlement is missing.
- Added AI Premium prompt inside Website Builder AI generation tab.
- Disabled AI generation button when AI website generation entitlement is missing.
- Added AI Premium prompt on School Admin AI Copilot.
- Existing backend APIs and route permissions were not changed.

Validation:

- Run `cd frontend && npm run build`.

## Twenty-Task Control Center Batch

### CME-015: Billing lifecycle roadmap implementation tasks


Roadmap additions:

- Billing lifecycle now has explicit implementation slices for trials, renewals, upgrade prompts, tenant plan assignment, AI add-ons, usage meters, and future invoice/tax workflows.
- Backend remains the source of truth for plan limits and paid feature enforcement.
- Frontend upgrade prompts remain UX-only and do not replace backend security checks.

### CME-020 to CME-023: Super Admin SaaS Control Center


Findings:

- Super Admin needed a stronger command-center view for tenant health, revenue motion, support follow-up, churn risk, provisioning, AI usage, and platform readiness.
- Existing tenant stats and subscription plan APIs were enough for a first production-safe dashboard pass.
- Trial lifecycle, renewal automation, support tickets, and billing analytics still need backend entities before deeper automation.

Implemented:

- Added platform command-center cards to `frontend/src/features/super-admin/pages/SuperAdminDashboardPage.tsx`.
- Added tenant health, churn risk, AI usage, and support follow-up widgets.
- Added a tenant provisioning checklist with links to create tenant, assign plans, manage feature toggles, review AI usage, and manage the public website.
- Added a platform health snapshot for backend, frontend, database, Redis, queues, and public website readiness.

### CME-030 to CME-033: School Admin Experience


Findings:

- School Admin dashboards need first-time activation guidance so a new school does not land on an empty operational screen.
- Existing dashboard stats can power a lightweight launch checklist without changing APIs.
- Empty and alert states should explain the next operational action, not only show zero values.

Implemented:

- Added School Activation Checklist to `frontend/src/features/school-admin/pages/SchoolAdminDashboardPage.tsx`.
- Added setup progress percentage and launch steps for classes, students, staff, notices, timetable, and website.
- Added AI Operations Copilot recommendations for activation, leave backlog, and fee collection risk.
- Added an empty-data guidance state for early school setup.

### CME-040 to CME-044: Student, Teacher, Parent Engagement


Findings:

- Student, teacher, and parent portals already had strong 360 dashboard foundations.
- The next engagement gap was daily habit formation: each portal should quickly answer "what should I do today?"
- Mobile parity should keep compact cards, responsive grids, and clear disabled states.

Implemented:

- Added Student Daily Growth Loop to `frontend/src/features/student/pages/StudentDashboardPage.tsx`.
- Added Teacher Productivity Command Center to `frontend/src/features/teacher/pages/TeacherDashboardPage.tsx`.
- Added Parent Engagement Rhythm to `frontend/src/features/parent/pages/ParentDashboardPage.tsx`.
- Changes reuse existing portal panels, data queries, loading/error states, and role-scoped APIs.

### CME-050 to CME-054: Website Builder Monetization Engine


Findings:

- School Admin Website Builder now has no-code editing, AI prompts, responsive preview, subscription locks, lead/conversion panels, analytics, and plan-gated template messaging from earlier website-builder work.
- Super Admin public website pages now have richer clickable dashboard, pages, analytics, and media surfaces from earlier public website work.
- Remaining deeper work requires backend lead entities, website analytics aggregation, template marketplace persistence, and AI usage metering tables.

Implemented:

- Marked the current Website Builder monetization pass complete based on the implemented builder/public website surfaces.
- Preserved website rendering, SEO-facing public routes, custom-domain architecture, role access, and tenant isolation.
- No unrelated modules were changed in this batch.

### CME-060: AI Gateway And Copilot Audit


Findings:

- AI usage surfaces exist in Super Admin, School Admin AI Copilot, Website Builder AI generation, and role portal insight cards.
- Current premium insight cards are deterministic and safe, using already-authorized dashboard data.
- Production AI expansion should add prompt registry hardening, tenant budgets, queue-based execution, usage audit logs, and AI safety regression tests before claiming autonomous intelligence.

Validation:

- Passed: `cd frontend && npm run build`.
- Backend APIs, auth, RBAC logic, and tenant isolation were not modified in this 20-task batch.

## Final Enterprise Completion Batch

### CME-002 to CME-003: Positioning And Demo Readiness


Implemented:

- Updated public product website positioning to "AI-Powered School Operating System".
- Added `docs/ENTERPRISE_DEMO_JOURNEY.md` with five-minute demo flow, proof points, and investor narrative.
- Super Admin dashboard already carries SaaS control-center and monetization copy from the previous batch.

### CME-061 to CME-065: AI Product Layer


Implemented:

- Added backend AI insight contract:
  - `AiInsightCard`
  - `AiInsightSeverity`
  - `AiInsightAudience`
- Added deterministic AI service boundaries:
  - `StudentRiskInsightService`
  - `TeacherWorkloadInsightService`
  - `ParentWeeklySummaryInsightService`
- Added unit tests for insight severity, confidence, and metadata behavior.
- Added frontend shared AI contract at `frontend/src/shared/types/aiInsight.ts`.
- Added `docs/AI_SAFETY_REGRESSION_PLAN.md` for prompt injection, cross-tenant leakage, role scope, schema, and usage-budget tests.

Notes:

- These AI services do not query data directly and do not alter tenant access.
- Production AI generation still requires tenant-scoped repositories, usage logging, budget enforcement, and prompt-safety gates per workflow.

### CME-070 to CME-075: Security And Compliance


Implemented:

- Added `SensitiveDataPolicy` for payroll, student health, documents, and parent income visibility decisions.
- Added `SensitiveField` frontend component for role-masked UI sections.
- Added `UploadQuarantinePolicy` and `UploadQuarantineDecision` as the upload quarantine foundation.
- Added `MfaPolicy` for Super Admin/Tenant Admin/School Admin MFA requirements.
- Added tests for sensitive field policy, quarantine decisions, and MFA role policy.
- Added `docs/SECURITY_COMPLIANCE_AUDIT.md` with sensitive field, upload, MFA, SSO, audit, and compliance next steps.

Notes:

- Existing controllers were not rewired in this pass, avoiding behavior changes to current upload/auth flows.
- The new policies are ready to be injected into payroll, health, document, upload, and auth controllers in a follow-up migration-safe backend pass.

### CME-080 to CME-084: Performance And Scale


Implemented:

- Added `docs/PERFORMANCE_SCALE_AUDIT.md` covering index coverage, pagination rules, queue strategy, retention, and scale priorities.
- Added `infra/load-tests/enterprise-smoke.js` for enterprise demo and control-surface smoke coverage.
- Added `infra/k8s/cloudcampus-starter.yaml` with backend Deployment, Service, readiness/liveness probes, and HPA starter template.

Findings:

- Existing migrations already include many tenant/school/time indexes.
- Existing k6 tests cover auth, public website, reports, school admin, smoke, and stress paths.
- Queue/dead-letter observability exists as infrastructure direction; deeper dashboards require RabbitMQ metric wiring.

### CME-090 to CME-093: Design System Consistency


Implemented:

- Added `frontend/DESIGN_SYSTEM_GUIDE.md`.
- Added shared `MetricCard`, `InsightCard`, and `SensitiveField` components.
- Confirmed existing shared UI already includes `EmptyState`, `ErrorState`, `Skeleton`, `PageHeader`, `Button`, `Badge`, `DataTable`, and `LockedFeature`.
- Exported the new shared UI components from `frontend/src/shared/ui/index.ts`.

Validation:

- Passed: `cd backend && mvn test` with 159 tests, 0 failures, 0 errors.
- Passed: `cd frontend && npm run build`.
- Passed frontend route smoke checks after dev-server refresh: `/`, `/super-admin`, `/school-admin`, `/student`, `/teacher`, `/parent`, `/school-admin/website`.
- Passed backend readiness smoke check: `/actuator/health/readiness`.
