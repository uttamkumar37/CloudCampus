# CloudCampus Production Readiness Report

Audit date: 2026-05-28  
Branch: `project-redesign`  
Scope: backend, frontend, mobile shell, API integration, security, data safety, deployment, CI/CD, monitoring, performance and customer usability.

## Part 1: Executive Summary

Final verdict: `STAGING_READY_FOR_RECREATE`

Meaning: CloudCampus is ready to recreate a controlled staging deployment from the repository, and a disposable EC2/Docker HTTP staging smoke has already passed. The smoke host was terminated afterward to avoid ongoing cost, so there is no currently running staging URL. The backend and web portal are strong enough for internal demos and repeatable staging smoke tests. The highest-priority UUID-based student import UX issue found during smoke is fixed in the frontend. Pilot usage should wait until stable HTTPS staging is deployed, production mail/storage/payment/monitoring/backups are configured, exposed staging secrets are rotated, bootstrap is disabled, and the remaining scaffold-grade UX is tightened.

It is not `PRODUCTION_READY` because production readiness requires more than passing tests: live infrastructure, real secrets, HTTPS/DNS, managed PostgreSQL, backups and restore proof, alerting, SMTP/provider delivery, object storage, payment reconciliation, and hosted staging verification are still not proven.

| Area | Score | Verdict |
| --- | ---: | --- |
| Overall readiness | 75/100 | Clean staging candidate; not paid-production ready |
| Backend readiness | 88/100 | READY for staging, PARTIAL for production |
| Frontend readiness | 80/100 | READY for staging demo, PARTIAL for broader customer-grade UX |
| Mobile readiness | 35/100 | SCAFFOLD_ONLY |
| Security readiness | 78/100 | SAFE_FOR_STAGING, needs hardening for production |
| Deployment readiness | 74/100 | Repo assets pass and disposable EC2 HTTP smoke passed; stable HTTPS staging not running |
| Data safety readiness | 62/100 | Migrations exist; hosted backup/restore not proven |
| Monitoring readiness | 42/100 | Health endpoints exist; full observability missing |
| Performance readiness | 60/100 | MVP scale likely; needs pagination/lazy loading/load tests |
| Customer usability readiness | 68/100 | Good demo shell; student import improved, other admin setup workflows still need polish |

## Part 2: Build Validation

| Command | Result | Summary | Blocker if failed |
| --- | --- | --- | --- |
| `cd backend && mvn test` | PASS | 152 tests, 0 failures, 0 errors, 0 skipped. | None |
| `cd frontend && npm test -- --run` | PASS | 21 test files, 75 tests passed. | None |
| `cd frontend && npm run lint` | PASS | ESLint completed with no reported errors. | None |
| `cd frontend && npm run typecheck` | PASS | TypeScript completed with no errors. | None |
| `cd frontend && npm run build` | PASS | Vite production build succeeded; main JS 471.05 kB before gzip, 137.64 kB gzip. | None |
| `cd mobile && npm run lint` | PASS | ESLint completed with no reported errors. | None |
| `cd mobile && npm run typecheck` | PASS | TypeScript completed with no errors. | None |
| `cd mobile && npm test -- --run` | PASS | 1 test file, 2 tests passed. | None |
| `sh scripts/ci/validate-ops.sh` | PASS | Local-only placeholders are explicitly allowed only in `.env.example`/local compose; staging/prod deploy assets reject local defaults and unsafe bootstrap settings. | None |
| `sh scripts/ci/security-audit.sh` | PASS gate | No frontend high/critical advisories; mobile has 10 moderate Expo transitive advisories. | Moderate advisories are not a hard gate but should be tracked before production mobile release. |
| `docker compose --env-file .env.example -f docker-compose.local.yml config` | PASS | Local compose renders. | None |
| `docker compose --env-file .env.staging.example -f docker-compose.staging.yml config` | PASS | Staging compose renders. | None |
| `docker compose --env-file .env.production.example -f docker-compose.prod.yml config` | PASS | Production compose renders. | None |

## Part 3: Backend Readiness

Backend status: `PARTIAL`

Ready:

- All controllers compile in the current test suite.
- Auth login, MFA challenge, refresh rotation, logout revocation, password reset/change and `/v1/me` flows exist.
- Role checks, tenant isolation, school isolation, parent-child access, teacher assignment access and finance school access have targeted tests.
- Super Admin onboarding is authenticated and audited.
- Flyway migrations run through V27 in test.
- Production profile fail-fast validation exists.
- Health/readiness endpoints exist.
- Client-supplied tenant/school headers are rejected.
- Hard-coded `MAIN` school resolution is regression-protected.

Critical backend blockers:

- No hosted PostgreSQL staging run has been verified end to end.
- Production mail delivery, payment provider, object storage and report/document file delivery are not integrated.
- Outbox/report/bulk workers are foundation-level, not production-proven runtime services.

Medium backend risks:

- Many list endpoints are still unpaginated or lightly paginated.
- No generated OpenAPI contract is enforced.
- Rate limiting is local/in-memory oriented.
- JWT implementation should eventually move to a vetted library and key-rotation policy.

Future improvements:

- Distributed rate limiting.
- OpenAPI generation and contract tests.
- Production worker runtime for outbox, reports, notifications and imports.
- Stronger correlation ID propagation and structured error telemetry.

## Part 4: Frontend Readiness

Frontend status: `PARTIAL`

The visible web portal is now API-backed through the shared HTTP client, and tests prove key role-routing/API-call behavior. The remaining issue is not fake navigation; it is product depth and UX maturity.

### Role Section Status

| Role | Section | Status | Notes |
| --- | --- | --- | --- |
| SUPER_ADMIN | Dashboard | READY | Real platform summary APIs. |
| SUPER_ADMIN | Tenants | READY | Onboard/list/detail/status/settings APIs connected. |
| SUPER_ADMIN | Schools | READY | Read-only directory connected. |
| SUPER_ADMIN | Subscription Plans | PARTIAL | List/create connected; edit/tenant assignment UX remains basic. |
| SUPER_ADMIN | Revenue | PARTIAL | Invoice/scaffold revenue data connected; no payment gateway settlement. |
| SUPER_ADMIN | AI Usage | PARTIAL | Usage/entitlements visible; entitlement edit UX/provider execution incomplete. |
| SUPER_ADMIN | Reports | PARTIAL | Export APIs connected; durable worker/storage not production-proven. |
| SUPER_ADMIN | Audit Logs | READY | Safe audit list connected. |
| SUPER_ADMIN | Platform Health | READY | Backend health/readiness/platform status connected. |
| SUPER_ADMIN | Notifications | PARTIAL | Delivery lists connected; retry/provider webhooks incomplete. |
| SUPER_ADMIN | Settings | PARTIAL | Safe settings connected; durable platform settings limited. |
| TENANT_ADMIN | Dashboard | READY | Real summary endpoint. |
| TENANT_ADMIN | Schools | READY | Create/list/edit/deactivate connected. |
| TENANT_ADMIN | School Admins | READY | Invite/list/resend/revoke connected. |
| TENANT_ADMIN | Reports | PARTIAL | Summary/drilldown connected; exports absent. |
| TENANT_ADMIN | Subscription Usage | READY | Usage endpoint connected. |
| TENANT_ADMIN | Settings | PARTIAL | Settings connected; branding/assets incomplete. |
| SCHOOL_ADMIN | Dashboard | READY | Real summary endpoint. |
| SCHOOL_ADMIN | Students | PARTIAL | List/import/invite connected; full CRUD/profile UX missing. |
| SCHOOL_ADMIN | Parents | PARTIAL | Directory/link/leave connected; UX compact. |
| SCHOOL_ADMIN | Teachers | PARTIAL | Directory/provisioning connected; profile UX compact. |
| SCHOOL_ADMIN | Staff | PARTIAL | Directory/provisioning connected; profile UX compact. |
| SCHOOL_ADMIN | Academic Setup | PARTIAL | APIs connected; needs guided setup UX. |
| SCHOOL_ADMIN | Attendance | PARTIAL | APIs connected; attendance grid not product-grade. |
| SCHOOL_ADMIN | Homework | PARTIAL | APIs connected; forms are basic. |
| SCHOOL_ADMIN | Exams | PARTIAL | APIs connected; review/marks UX basic. |
| SCHOOL_ADMIN | Results | PARTIAL | Publish/result APIs connected; analytics/export UX basic. |
| SCHOOL_ADMIN | Fees | PARTIAL | ERP fee APIs connected; no payment gateway. |
| SCHOOL_ADMIN | Timetable | PARTIAL | APIs connected; calendar UX missing. |
| SCHOOL_ADMIN | Notices | PARTIAL | APIs connected; audience/template UX basic. |
| SCHOOL_ADMIN | Reports | PARTIAL | Export APIs connected; worker/storage not production hardened. |
| SCHOOL_ADMIN | Documents | PARTIAL | Metadata APIs connected; file upload/storage missing. |
| SCHOOL_ADMIN | Website Builder | PARTIAL | Page APIs connected; public publish pipeline incomplete. |
| SCHOOL_ADMIN | Settings | PARTIAL | Basic settings connected. |
| TEACHER | Dashboard | READY | Real summary endpoint. |
| TEACHER | My Classes | READY | Assignment API connected. |
| TEACHER | Attendance | PARTIAL | Assignment-scoped APIs connected; taking UX basic. |
| TEACHER | Homework | PARTIAL | APIs connected; review workflow incomplete. |
| TEACHER | Exams | PARTIAL | APIs connected. |
| TEACHER | Marks | PARTIAL | Real workflow connected; absent state unsupported by backend. |
| TEACHER | Timetable | PARTIAL | API connected; basic list. |
| TEACHER | Notices | READY | API connected. |
| PARENT | Dashboard | READY | Real summary endpoint. |
| PARENT | Children | READY | Linked-child API connected. |
| PARENT | Attendance | PARTIAL | API connected; mobile-first UX needs polish. |
| PARENT | Homework | PARTIAL | API connected; submission/review detail basic. |
| PARENT | Results | PARTIAL | API connected; presentation basic. |
| PARENT | Fees | PARTIAL | API connected; payment provider not integrated. |
| PARENT | Notices | READY | API connected. |
| PARENT | Timetable | PARTIAL | API connected; calendar UX missing. |
| PARENT | Leave Requests | PARTIAL | API connected; timeline/notifications basic. |
| STUDENT | Dashboard | READY | Real summary endpoint. |
| STUDENT | Homework | PARTIAL | API connected; submit UX basic. |
| STUDENT | Results | PARTIAL | API connected; presentation basic. |
| STUDENT | Attendance | PARTIAL | API connected; visual summary basic. |
| STUDENT | Timetable | PARTIAL | API connected; calendar UX missing. |
| STUDENT | Notices | READY | API connected. |
| STUDENT | Fees | PARTIAL | API connected; payment provider not integrated. |
| STUDENT | Profile | PARTIAL | Self-profile API exists; full profile page not mature. |
| FINANCE_STAFF | Dashboard | READY | Real summary endpoint. |
| FINANCE_STAFF | Fee Demands | PARTIAL | APIs connected; selectors/ledger UX basic. |
| FINANCE_STAFF | Payments | PARTIAL | ERP payment record connected; no provider integration. |
| FINANCE_STAFF | Receipts | PARTIAL | List API connected; detail/download UX missing. |
| FINANCE_STAFF | Reports | PARTIAL | Summary/collections connected; export missing. |

Frontend risks:

- The app remains heavily centralized in `frontend/src/app/App.tsx`.
- Some screens still use compact/generic panels instead of polished product workflows.
- Route splitting/lazy loading is not implemented.
- Mobile web responsiveness is not screenshot-verified.
- Session storage is acceptable for scaffold staging, but production session UX needs a deliberate security policy.

## Part 5: API Integration Readiness

| UI section | Frontend file | Expected backend API | Actual backend API | Auth role | Connected | Status | Issue | Production risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Auth/login/current user | `features/auth/api/authApi.ts` | `/v1/auth/*`, `/v1/me*` | Same | All authenticated roles | Yes | READY | Refresh exists but production session UX needs hardening | Medium |
| Super Admin platform | `features/super-admin/api/platformApi.ts` | `/v1/super-admin/*` | Same | `SUPER_ADMIN` | Yes | PARTIAL | Some operational workflows are scaffold-level | Medium |
| Tenant Admin | `features/tenant-admin/api/*` | `/v1/tenant-admin/*` | Same | `TENANT_ADMIN` | Yes | PARTIAL | Exports/branding incomplete | Medium |
| School Admin resources | `features/school-admin/api/*` | `/v1/school-admin/*` | Same | `SCHOOL_ADMIN` | Yes | PARTIAL | Some generic forms and compact tables | High for paid users |
| Teacher portal | `features/teacher/api/teacherPortalApi.ts` | `/v1/teacher/*` | Same | `TEACHER` | Yes | PARTIAL | Daily workflow polish incomplete | Medium |
| Parent portal | `features/parent/api/*` | `/v1/parent/*` | Same | `PARENT` | Yes | PARTIAL | Mobile-first UX incomplete | High for pilot |
| Student portal | app/student panels | `/v1/student/*` | Same | `STUDENT` | Yes | PARTIAL | Basic lists and profile | Medium |
| Finance portal | `features/finance/api/feeApi.ts` | `/v1/finance/*` | Same | `FINANCE_STAFF` | Yes | PARTIAL | Gateway/reconciliation missing | High for paid production |
| Staff dashboard | portal dashboard API | `/v1/staff/dashboard/summary` | Same | `STAFF` | Yes | READY | Staff-specific modules hidden | Low |

Checks:

- Feature-level raw `fetch` calls are not used outside the shared HTTP client and tests.
- Logged-in dashboards no longer show fake metric arrays as production data.
- Visible sidebar items call real APIs or are intentionally hidden.
- Bearer token attachment is centralized.
- 401 refresh retry exists in `httpClient`; production session expiry UX still needs full browser-path testing.

## Part 6: Security Readiness

Security classification: `SAFE_FOR_STAGING`

Ready:

- Production profile validates JWT secret strength, non-H2 database URL, explicit CORS origins, public frontend URL, mail mode, disabled bootstrap credentials and safe actuator exposure.
- Passwords are BCrypt hashed.
- MFA, refresh rotation and logout revocation exist.
- Tenant, school and role spoofing are tested across critical routes.
- Sensitive audit metadata avoids raw passwords, tokens, MFA codes, AI prompts and raw import payloads.
- Super Admin APIs are role protected.
- Security audit gate passes for high/critical npm advisories.

Needs hardening:

- Local-only Super Admin bootstrap credentials remain documented for developer machines only; staging/prod deploy assets are validated separately and reject those values.
- MFA delivery/device trust is scaffold-grade.
- No external secrets manager is configured.
- No production CORS/domain/TLS environment has been verified.
- No penetration test or DAST run is recorded.
- Mobile dependency audit reports moderate Expo transitive advisories.

## Part 7: Deployment Readiness

Deployment classification: `STAGING_READY`

Ready in repo:

- Backend and frontend Dockerfiles.
- `docker-compose.local.yml`, `docker-compose.staging.yml`, `docker-compose.prod.yml`.
- Nginx reverse proxy/SPA fallback config.
- Env templates.
- Deployment, staging, rollback and health-check guides.
- GitHub Actions for CI/security/deploy scaffolding.
- Compose config rendering passes for local/staging/prod.

Not production-ready:

- No live staging environment has been deployed and verified.
- No domain/HTTPS/TLS proof.
- No managed PostgreSQL instance connected.
- No production secrets management.
- No SMTP provider delivery proof.
- No object storage for reports/documents.
- No payment gateway.
- No monitoring/alerting deployment.
- No scheduled backup/restore drill in hosted infrastructure.

## Part 8: Data and Database Readiness

DB status: `PARTIAL`

Ready:

- Flyway migrations exist and pass in tests.
- PostgreSQL-compatible deployment path exists.
- Tenant/school columns and object-scope guards exist in rebuilt modules.
- Backup/restore documentation and local scripts exist.

Not verified:

- Managed PostgreSQL staging migration run.
- Hosted backup schedule.
- Restore drill against managed backup.
- Data retention policy.
- Audit retention policy.
- Object storage for documents/report artifacts.

Data loss risks:

- Report/document artifacts are not yet backed by production object storage.
- Without hosted backup restore proof, recovery time and recovery point are unknown.

## Part 9: Monitoring and Operations Readiness

Monitoring classification: `enough for staging smoke, missing for production`

Exists:

- Actuator health/readiness.
- Super Admin platform health API.
- Basic operational scripts and runbooks.
- Prometheus alert-rule scaffold.

Missing:

- Deployed Prometheus/Grafana/Alertmanager.
- Centralized logs.
- Correlation ID dashboards.
- Error tracking.
- Uptime monitoring.
- Notification delivery alerts.
- Outbox/queue pending alerts.
- Backup success/failure alerts.
- Disk/memory/container health dashboards.

## Part 10: Performance and Scale Readiness

Scale classification: `MVP scale ready`

Likely acceptable:

- Internal demo.
- Controlled staging.
- Small synthetic data tests.
- One-school pilot after infra and customer-critical workflows are hardened.

Risks:

- Some list APIs need pagination and indexes before large tenant data.
- Frontend route splitting/lazy loading is missing.
- Student import/report export workers are not production-proven.
- No load test baseline has been recorded.
- N+1 query risk has not been systematically audited.
- No CDN/object-storage delivery proof for assets/documents/reports.

## Part 11: Customer Readiness

| Audience | Ready? | Why |
| --- | --- | --- |
| Myself locally | YES | Local app, tests and dev servers work. |
| Friend/demo user | YES WITH LIMITATIONS | Good for walkthroughs; explain scaffold-grade workflows. |
| One pilot school | NO | Needs live staging proof, SMTP, backups, monitoring and UX hardening first. |
| Paid school customer | NO | Payment/storage/monitoring/backups/support readiness missing. |
| Multiple schools | NO | Backend supports multi-school foundations, but tenant admin UX and operations need hardening. |
| Enterprise customer | NO | Enterprise needs SSO, audit retention, compliance, SLAs, HA, observability and support processes. |

## Part 12: Blockers

### Critical Blockers

| Blocker | Impact | Where found | Recommended fix | Priority | Estimated effort |
| --- | --- | --- | --- | --- | --- |
| No stable HTTPS staging environment | Disposable EC2 HTTP smoke passed, but the host was terminated and no domain/TLS staging URL is running | Deployment audit and STAGE-001 smoke | Recreate staging with domain, HTTPS/TLS, rotated secrets, disabled bootstrap, and repeat smoke suite | P0 | 1-2 days |
| No hosted backup/restore proof | Data recovery unknown | Data audit | Configure managed DB backups and run restore drill | P0 | 1 day |
| No production monitoring/alerts | Incidents will be invisible | Monitoring audit | Deploy Prometheus/Grafana/alerts or managed equivalent | P0 | 1-2 days |
| SMTP/provider delivery not proven | Invitations/password flows cannot be trusted for real users | Notification audit | Configure SMTP provider in staging and test invite/reset delivery | P0 | 0.5-1 day |

### High Priority

| Blocker | Impact | Where found | Recommended fix | Priority | Estimated effort |
| --- | --- | --- | --- | --- | --- |
| No payment gateway/reconciliation | Fees/revenue are ERP records only | Finance/revenue audit | Add gateway integration plan, webhook, receipt reconciliation | P1 | 3-5 days |
| No object storage for reports/documents | Documents/report files are not production-grade | Reports/documents audit | Add S3/MinIO storage and signed URLs | P1 | 2-4 days |
| Parent/student mobile app is shell-only | Real customer experience weak | Mobile audit | Implement auth and core parent/student flows | P1 | 5-10 days |
| Scaffold-grade School Admin UX | Main selling portal still has technical forms | Frontend audit | Replace generic panels with business forms/tables/selectors | P1 | 5-10 days |
| No load/performance baseline | Unknown scale ceiling | Performance audit | Add k6/JMeter smoke and DB query review | P1 | 1-3 days |

### Medium Priority

| Blocker | Impact | Where found | Recommended fix | Priority | Estimated effort |
| --- | --- | --- | --- | --- | --- |
| App shell centralized in `App.tsx` | Maintainability risk | Frontend audit | Split role routes and lazy modules | P2 | 2-4 days |
| No OpenAPI contract | Frontend/backend drift risk | Backend/API audit | Generate OpenAPI and add contract check | P2 | 1-2 days |
| Mobile moderate dependency advisories | Future mobile security debt | Security audit | Track Expo dependency path and upgrade when safe | P2 | 1-2 days |
| Advanced audit filtering/export not polished | Support/admin usability gap | Super Admin audit UI | Add filters/export/detail UX | P2 | 1-2 days |
| Dark mode/mobile responsive proof missing | UX quality risk | Frontend audit | Add Playwright screenshot checks | P2 | 1-3 days |

## Part 13: Final Readiness Verdict

Current readiness:

- Local development: READY
- Staging deployment: VERIFIED ON DISPOSABLE HTTP EC2, READY TO RECREATE; stable HTTPS staging NOT RUNNING
- Internal demo: READY
- Pilot customer: NOT READY
- Paid production: NOT READY
- Enterprise production: NOT READY

What must be done before pilot:

- Recreate stable staging with a domain and HTTPS/TLS.
- Rotate all manually exposed staging secrets and disable bootstrap Super Admin.
- Configure staging SMTP and prove invitation/password email delivery.
- Configure managed PostgreSQL backups and perform restore drill.
- Add basic hosted monitoring/alerts.
- Re-smoke the improved School Admin student import dropdown workflow on the next live staging host.
- Polish the highest-use School Admin, Teacher, Parent and Finance workflows.

What must be done before paid production:

- Add production payment gateway/reconciliation.
- Add object storage for reports/documents and signed URL access.
- Add production observability, alerts, logs and incident runbooks.
- Add production support/backup/restore/SLA process.
- Add OpenAPI/contract validation and load test baseline.
- Harden session/MFA delivery policy.

What can wait:

- Enterprise SSO.
- Advanced AI/RAG provider execution.
- Full custom website builder.
- Advanced analytics/data warehouse.
- Native mobile parity beyond pilot-critical parent/student flows.

## Part 14: Next 10 Tasks

| Order | Task ID | Title | Why it matters | Likely files touched | Scope | Validation commands | Done criteria |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | STAGE-HTTPS-001 | Recreate stable HTTPS staging | Disposable HTTP smoke passed but no staging URL is currently running | deployment docs/scripts, DNS/TLS env | Infra | health curls, login/onboarding smoke, compose logs | Stable HTTPS staging URL works and CORS/frontend URLs are correct |
| 2 | OPS-SECRET-ROTATE-001 | Rotate exposed staging secrets and disable bootstrap | Manual smoke exposed temporary secrets in chat | `.env.staging` on server, deployment docs | Infra/Security | health checks, Super Admin login, onboarding smoke | New JWT/DB/admin secrets active; bootstrap disabled after controlled admin exists |
| 3 | UX-STU-IMPORT-SMOKE-001 | Re-smoke improved student import UX on staging | New dropdown workflow needs live EC2 verification | staging smoke report, browser smoke notes | Frontend/Infra | live staging browser smoke, frontend tests | School Admin imports a student using dropdowns without seeing raw IDs |
| 4 | OPS-BACKUP-001 | Managed DB backup and restore drill | Pilot data safety depends on restore proof | `docs/deployment/*`, scripts | Infra/DB | backup command, restore command, Flyway validate | Restore drill documented with timestamp and row/table proof |
| 5 | NOTIF-PROVIDER-001 | Configure real staging SMTP delivery | Invitations/reset flows need real delivery | backend env/docs, notification tests | Backend/Infra | backend tests, staging invite smoke | School Admin invite and password reset arrive through provider without leaking tokens |
| 6 | MON-001 | Deploy basic monitoring and alerts | Staging/pilot needs visibility | `infra/monitoring`, compose/docs | Infra | health alert simulation, dashboard check | Backend/frontend/up/down alerts and dashboards visible |
| 7 | STORAGE-001 | Add object storage for documents and reports | Current metadata/DB file path is not production file handling | backend document/report services, env/docs | Backend/Infra | backend tests, upload/download smoke | Signed URLs work; cross-school access denied |
| 8 | SCHOOL-UX-001 | Replace remaining School Admin generic panels with product forms/tables | Main portal must be non-technical | frontend school-admin features | Frontend | frontend tests/lint/typecheck/build | Attendance, homework, fees, academic setup use selectors/tables, not raw JSON |
| 9 | PERF-001 | Add staging load/performance baseline | Scale readiness needs numbers | scripts/tests/docs | Backend/Frontend/Infra | load test script, backend tests, frontend build | Baseline p95/error-rate report recorded |
| 10 | SEC-SESSION-001 | Harden browser session policy | Improves paid-production auth posture | frontend auth state, backend auth docs/tests | Frontend/Backend | frontend tests, backend auth tests | Explicit token storage, refresh expiry, logout and invalid-session UX are documented and tested |

## Safest Path to Production

1. Deploy staging and run the smoke checklist.
2. Prove backups, restore, monitoring and SMTP in staging.
3. Harden School Admin and Parent/Teacher/Finance UX for the first pilot workflow.
4. Run a small pilot with non-critical data and active monitoring.
5. Add payment, object storage, OpenAPI contracts and load tests before paid production.
