# Seeded Staging Load Test Plan

Status: TASK-026 production-readiness plan

Last updated: 2026-05-19

## Scope

CloudCampus must run repeatable seeded staging load tests before claiming high-scale production readiness. Existing k6 scripts cover smoke, auth, reports, and stress checks. TASK-027 and TASK-028 will add broader school-admin and public-website scenarios.

This plan defines the staging dataset, target throughput, p95 latency goals, failure thresholds, execution cadence, and owner roles.

## Environment Rules

1. Run these tests only against seeded staging or a dedicated load-test stack, never against production.
2. Staging must use production-like PostgreSQL, Redis, RabbitMQ, MinIO, and object-storage latency.
3. Staging must run with production JVM flags, container limits, Flyway migrations, and observability enabled.
4. Use explicit credentials through environment variables. k6 scripts must not rely on fallback passwords.
5. Reset or reseed the database before every formal benchmark so results are comparable.
6. Keep load-test tenants clearly marked, for example tenant codes prefixed with `LT-`.

## Dataset Sizes

| Tier | Tenants | Schools | Students | Staff | Parents | Classes/sections | Fee records | Attendance records | Documents |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| MVP staging | 3 | 10 | 20,000 | 1,000 | 30,000 | 400 | 60,000 | 300,000 | 10,000 |
| Standard staging | 25 | 250 | 250,000 | 15,000 | 350,000 | 8,000 | 750,000 | 4,000,000 | 100,000 |
| Enterprise claim gate | 100 | 1,000 | 1,000,000 | 60,000 | 1,400,000 | 30,000 | 3,000,000 | 16,000,000 | 500,000 |

The enterprise claim gate can be run against a scaled staging stack or a short-lived benchmark environment. The MVP tier is the minimum for every release candidate.

## Seed Data Requirements

| Domain | Required seed shape |
|---|---|
| Auth | Super Admin, Tenant Admin, School Admin, Teacher, Student, Parent users across multiple tenants. |
| School admin | Active academic year, classes, sections, subjects, staff, timetables, notices, homework, assignments. |
| Students | Mixed grades, statuses, parent links, document records, fee records, attendance history. |
| Finance | Paid, unpaid, partial, overdue, online, cash, and refunded payment states. |
| Reports | Enough historical attendance, fee, and exam data to force real aggregation queries. |
| Public website | Published pages, navigation, theme, SEO, public website sections, and investor-room/demo data. |
| AI | Prompt templates, knowledge documents, tenant AI configs, and representative `ai_usage_logs`. |
| Files | Student document metadata and object-store objects large enough to exercise presign and listing paths. |

## Workload Mix

Formal load tests should approximate a busy weekday.

| Flow | Share | Notes |
|---|---:|---|
| Login and token refresh | 10% | Super Admin, school roles, parent/student users. |
| School admin dashboard and lists | 25% | Dashboard, students, staff, classes, fees, attendance, notices. |
| Write paths | 15% | Attendance marking, fee payment records, notices, homework, assignments. |
| Reports | 15% | Attendance, fee, performance, tenant analytics. |
| Parent/student portal reads | 15% | Fees, attendance, homework, notices, results. |
| Public website reads | 15% | Homepage, dynamic pages, navigation, SEO, investor-room metadata. |
| AI requests | 5% | Copilot, prompt rendering, knowledge-base RAG. |

## k6 Scenario Plan

| Scenario | Script | Stage target |
|---|---|---|
| Smoke precheck | `infra/load-tests/smoke.js` | 3 VUs for 30s. |
| Auth baseline | `infra/load-tests/load-auth.js` | 50 VUs, p95 login under 500 ms. |
| Reports baseline | `infra/load-tests/load-reports.js` | 20 VUs, p95 report under 2s. |
| School admin flow | `infra/load-tests/load-school-admin.js` | TASK-027. |
| Public website flow | `infra/load-tests/load-public-website.js` | TASK-028. |
| Stress discovery | `infra/load-tests/stress.js` | Non-gating, finds degradation point. |

## Target Throughput

| Tier | Sustained duration | Target request rate | Peak VUs | Notes |
|---|---:|---:|---:|---|
| MVP staging | 20 minutes | 75 RPS | 100 | Required for controlled paid pilot. |
| Standard staging | 45 minutes | 350 RPS | 500 | Required before onboarding school chains. |
| Enterprise claim gate | 90 minutes | 1,000 RPS | 1,500 | Required before claiming 1,000 schools or 1M students. |

Stress discovery may exceed these targets, but release gating uses the sustained tiers above.

## Latency Goals

| Path class | MVP p95 | Standard p95 | Enterprise p95 |
|---|---:|---:|---:|
| Health and static metadata | 250 ms | 250 ms | 300 ms |
| Login/auth | 500 ms | 600 ms | 750 ms |
| Dashboard/list reads | 750 ms | 900 ms | 1,200 ms |
| Write paths | 900 ms | 1,200 ms | 1,500 ms |
| Reports and analytics | 2,000 ms | 2,500 ms | 3,000 ms |
| Public website reads | 500 ms | 650 ms | 850 ms |
| AI gateway mock/offline mode | 1,500 ms | 2,000 ms | 2,500 ms |

Any p99 above 2x the p95 target must be investigated even if the formal p95 threshold passes.

## Failure Thresholds

| Signal | Release gate |
|---|---|
| HTTP 5xx rate | Less than 0.5% for MVP, less than 0.25% for Standard and Enterprise. |
| Total failed checks | Less than 1% per k6 scenario. |
| Auth failures | Less than 0.25%, excluding intentionally invalid credentials. |
| Rate limiting | Must be explainable by test design and must not affect normal user flows. |
| DB connection pool | Under 85% active connections for sustained test window. |
| Redis errors | 0 connection failures during gating run. |
| RabbitMQ backlog | No sustained queue growth after load stops. |
| JVM heap | Under 85% after GC during sustained phase. |
| CPU | Under 75% average, no sustained 95% saturation. |

## Observability During Run

Capture these before, during, and after every run:

1. k6 summary and JSON output.
2. Prometheus request rate, p50/p95/p99 latency, 5xx rate, JVM heap, CPU, DB pool, Redis, RabbitMQ.
3. PostgreSQL slow query log or `pg_stat_statements` top queries.
4. Grafana screenshots for backend latency, slowest endpoints, DB, Redis, and queue depth.
5. Application logs filtered by correlation ID, tenant ID, and 5xx responses.

## Roles

| Role | Responsibility |
|---|---|
| Release owner | Approves target tier, run window, and go/no-go decision. |
| Backend owner | Reviews API failures, DB pool, query latency, and backend resource usage. |
| Frontend owner | Confirms public/admin flows match real UX and no route assumptions are stale. |
| DevOps owner | Provisions staging capacity, runs k6, captures Prometheus/Grafana evidence. |
| QA owner | Confirms seed data quality, scenario coverage, and acceptance thresholds. |
| Support owner | Reviews user-visible degradation and drafts customer-facing risk notes if needed. |

## Execution Checklist

1. Confirm staging build SHA, migrations, and environment variables.
2. Seed target dataset tier and record seed manifest.
3. Confirm `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SCHOOL_ID`, `ACADEMIC_YEAR_ID`, and `EXAM_ID` are valid.
4. Run `k6 run infra/load-tests/smoke.js`.
5. Run auth and reports baselines.
6. Run school-admin and public-website scenarios when TASK-027 and TASK-028 are available.
7. Run sustained target tier test.
8. Run stress discovery only after the release-gating run passes.
9. Export k6 output and observability evidence.
10. Record pass/fail, regressions, and tuning actions in the release notes.

## Go/No-Go Rules

A run passes only when:

1. All required k6 thresholds pass.
2. p95 goals pass for each path class at the target tier.
3. No unexplained 5xx spikes occur.
4. No persistent DB, Redis, RabbitMQ, or JVM saturation remains after load stops.
5. The release owner and backend owner both approve the result.

If any rule fails, treat the run as a failed release gate and open performance fixes before rerunning.

