# CloudCampus Production Ready Roadmap

Last updated: 2026-05-19

## 1. Executive Summary

CloudCampus is currently strong for a controlled production MVP, but it is not yet enterprise-ready for large school chains, government rollouts, strict SLA contracts, or high-compliance customers. The latest production audit rated the platform at **6.8/10** because core foundations exist, including JWT auth, refresh-token rotation, multi-tenant architecture, route-level RBAC, public website rendering, Website Builder foundations, CI checks, Docker image hardening, observability assets, backup scripts, payment webhook verification, and mobile type safety.

The roadmap below converts CloudCampus from **6.8/10 production-ready** to **9.5+/10 enterprise-ready** through small, sequential, validated tasks. Work must proceed one task at a time. After each task, update this file, run the listed validation, and stop for confirmation before continuing.

## 2. Current Readiness Score: 6.8/10

The current system is suitable for a controlled paid pilot with close support, limited onboarding, and conservative claims. It should not yet be positioned as a fully enterprise-grade SaaS with guaranteed high availability, compliance, large-scale load, or strict disaster recovery commitments.

## 3. Target Readiness Score: 9.5+/10

The target state is an enterprise-ready SaaS platform with audited tenant isolation, complete RBAC test coverage, verified disaster recovery, hardened uploads, safe AI boundaries, production deployment gates, observability runbooks, billing operations, mobile release discipline, and complete SOP/compliance documentation.

## 4. Critical Production Blockers

1. Complete RBAC and tenant isolation integration tests across all major roles and modules.
2. Audit all unsafe direct entity lookups and enforce tenant/school-scoped access.
3. Prove disaster recovery with scheduled restore drills, RPO/RTO targets, and incident runbooks.
4. Harden upload security with audit logs, quotas, antivirus/quarantine design, and MIME regression tests.
5. Add production alert routing and runbook-linked alerts for auth, payment, DB, Redis, RabbitMQ, AI budget, backups, and public website health.
6. Add Website Builder schema validation, publish validation, rollback validation, preview validation, and audit timeline.
7. Run seeded staging load tests before claiming 1000+ schools or 1M+ students.

## 5. Phase-Wise Roadmap

Each phase is intentionally narrow. Do not batch phases or skip validation. The status values are `TODO`, `IN_PROGRESS`, and `BLOCKED`.

## 6. Task List With IDs

### PHASE 1 - Security & Tenant Safety

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 2 - Disaster Recovery

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 3 - File Upload Security

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 4 - Website Builder Hardening

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 5 - Investor Room Protection

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 6 - AI Safety

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 7 - Performance & Load

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 8 - Deployment Safety

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 9 - Enterprise Auth

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 10 - Observability & Audit

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 11 - Public Website & SEO

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 12 - Billing & SaaS Ops

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 13 - Mobile Hardening

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

### PHASE 14 - Documentation & SOP

| ID | Task | Status | Risk | Validation command | Rollback notes | Acceptance criteria |
|---|---|---:|---:|---|---|---|

## 8. Operating Rule

Work must continue one task at a time. After a task is completed:

1. Update that task status in this file.
2. Add findings or implementation notes.
3. Run the task validation command.
4. Stop and ask for confirmation before starting the next task.
