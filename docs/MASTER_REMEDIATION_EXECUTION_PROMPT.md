You are acting as a Principal Architect, Security Engineer, SRE, DevOps Engineer, Backend Architect, Frontend Architect, DBA, and AI Safety Engineer.

Your task is to completely remediate all issues from the CloudCampus Enterprise Pre-Production Audit Report.

IMPORTANT EXECUTION RULES:

1. NEVER perform large refactors in one task.
2. NEVER modify unrelated files.
3. NEVER break existing working functionality.
4. ALWAYS use incremental safe changes.
5. ALWAYS create small isolated tasks.
6. ALWAYS verify compilation after every task.
7. ALWAYS verify tests after every task.
8. ALWAYS maintain backward compatibility unless explicitly instructed.
9. ALWAYS preserve tenant isolation.
10. ALWAYS preserve security constraints.
11. ALWAYS preserve audit logging.
12. ALWAYS preserve feature flag behavior.
13. ALWAYS preserve subscription logic.
14. ALWAYS preserve demo tenant protections.

====================================================
GLOBAL EXECUTION STRATEGY
====================================================

You must divide every issue into:
- Small isolated tasks
- Maximum 1-3 files changed per task
- Easy rollback capability
- Safe deployment sequence
- Independent validation steps

Each task MUST include:
- Task ID
- Priority
- Goal
- Exact files to modify
- Expected changes
- Validation steps
- Rollback strategy
- Dependencies
- Risk level
- Estimated effort

====================================================
TASK EXECUTION FORMAT
====================================================

For EVERY task generate:

----------------------------------------------------
TASK HEADER
----------------------------------------------------

Task ID:
Priority:
Category:
Risk:
Estimated Time:
Dependencies:

----------------------------------------------------
OBJECTIVE
----------------------------------------------------

Explain EXACTLY what problem this task solves.

----------------------------------------------------
FILES TO MODIFY
----------------------------------------------------

List exact files only.

----------------------------------------------------
IMPLEMENTATION PLAN
----------------------------------------------------

Step-by-step implementation.

----------------------------------------------------
VALIDATION
----------------------------------------------------

How to verify success.

----------------------------------------------------
ROLLBACK
----------------------------------------------------

How to revert safely.

----------------------------------------------------
POST-TASK CHECKS
----------------------------------------------------

- mvn test
- npm test
- docker compose config
- flyway validation
- tenant isolation validation
- security validation

====================================================
PHASE STRUCTURE
====================================================

Create ALL tasks grouped into these phases:

PHASE 0 — SAFETY & BACKUP
PHASE 1 — CRITICAL SECURITY
PHASE 2 — MULTI-TENANCY PROTECTION
PHASE 3 — INFRASTRUCTURE HARDENING
PHASE 4 — DATABASE SAFETY
PHASE 5 — AUTHENTICATION & AUTHORIZATION
PHASE 6 — AI SECURITY
PHASE 7 — OBSERVABILITY & MONITORING
PHASE 8 — PERFORMANCE & SCALABILITY
PHASE 9 — FRONTEND SECURITY
PHASE 10 — MOBILE SECURITY
PHASE 11 — CI/CD & SUPPLY CHAIN
PHASE 12 — TESTING & QUALITY
PHASE 13 — PRODUCTION DEPLOYMENT
PHASE 14 — POST-DEPLOYMENT VALIDATION

====================================================
VERY IMPORTANT EXECUTION RULES
====================================================

1. EACH TASK MUST:
- be independently deployable
- be independently testable
- not exceed small scope
- avoid touching many modules

2. NEVER:
- mix infra + backend + frontend in same task
- combine DB migrations with frontend changes
- combine AI fixes with auth fixes
- combine Docker and application logic together

3. FOR DATABASE TASKS:
- always use Flyway
- include rollback SQL
- include data safety validation
- include index impact analysis

4. FOR SECURITY TASKS:
- include attack scenario
- include security validation
- include regression prevention

5. FOR PERFORMANCE TASKS:
- include metrics before/after
- include load impact
- include memory impact

====================================================
GENERATE TASKS FOR ALL CRITICAL FINDINGS
====================================================

Generate SMALL TASKS for:

CRIT-01 Alertmanager disconnected
CRIT-02 PostgreSQL TLS validation
CRIT-03 Missing container resource limits
CRIT-04 Exposed infrastructure ports
CRIT-05 Hardcoded credentials
CRIT-06 pgbackup root user
CRIT-07 Unencrypted backups
CRIT-08 Missing HTTPS
CRIT-09 Redis no authentication
CRIT-10 ThreadLocal unsafe
CRIT-11 Refresh token race condition
CRIT-12 pgvector migration issue
CRIT-13 Receipt number race condition
CRIT-14 findById tenant isolation bypass
CRIT-15 Prompt injection
CRIT-16 AI budget bypass
CRIT-17 Missing backend tests
CRIT-18 RabbitMQ auto-ack issue
CRIT-19 Missing ShedLock
CRIT-20 Unbounded student queries
CRIT-21 GitHub Actions mutable tags

====================================================
GENERATE TASKS FOR HIGH FINDINGS
====================================================

Generate separate tasks for:
- H-01 through H-30
- grouped safely
- isolated
- independently testable

====================================================
GENERATE TASKS FOR MEDIUM FINDINGS
====================================================

Generate optimized tasks for:
- M-01 through M-20

====================================================
GENERATE TASKS FOR LOW FINDINGS
====================================================

Generate backlog tasks for:
- L-01 through L-30

====================================================
VERY IMPORTANT — AGENT EXECUTION STYLE
====================================================

Claude Agent must:
- finish one task fully before next
- commit after every task
- run tests after every task
- never leave partial implementation
- generate migration files separately
- generate config files separately
- generate test files separately

====================================================
GIT STRATEGY
====================================================

For every task generate:

Branch name:
Example:
- fix/crit-01-alertmanager
- fix/security-redis-auth
- fix/tenant-isolation-fee-records

Commit message:
Example:
- fix(security): add redis authentication
- fix(ai): prevent prompt injection in rag pipeline

====================================================
TESTING STRATEGY
====================================================

For every task include:
- unit tests
- integration tests
- security tests
- tenant isolation tests
- docker validation
- observability validation

====================================================
OUTPUT REQUIREMENTS
====================================================

Generate:

1. Master remediation roadmap
2. All phases
3. All tasks
4. Dependency graph
5. Recommended execution order
6. Safe deployment order
7. Rollback plan
8. Validation checklist
9. Production readiness checklist
10. Final deployment gate checklist

====================================================
FINAL GOAL
====================================================

The final result must produce:
- enterprise-grade security
- production-ready SaaS architecture
- zero critical blockers
- strong tenant isolation
- hardened infrastructure
- AI-safe architecture
- scalable deployment
- proper observability
- production-grade CI/CD
- secure mobile architecture
- secure frontend architecture
- secure Docker deployment
- reliable backups
- disaster recovery readiness
- proper monitoring
- proper alerting
- clean maintainable architecture

The remediation plan must be detailed enough that Claude Agent can execute task-by-task safely without human confusion.