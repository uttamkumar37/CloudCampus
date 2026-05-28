# CloudCampus Staging Smoke Test Report

Report date: 2026-05-28  
Task: `STAGE-001`  
Target: EC2/Docker staging deployment  
Status: `LIVE_STAGING_HTTP_VERIFIED_THEN_TERMINATED`

## Executive Summary

CloudCampus was deployed to an EC2/Docker staging host and the core smoke path was verified over HTTP using the EC2 public IP.

This was not production-like HTTPS staging because no domain or TLS certificate was configured. It was a successful low-cost HTTP staging smoke test for backend, frontend, PostgreSQL, Nginx reverse proxy, Super Admin onboarding, School Admin invitation acceptance/login, academic setup, student import, and logout.

After the smoke test, the EC2 instance was terminated to avoid ongoing AWS cost. The smoke result remains valid as deployment evidence, but there is no currently running staging URL.

## Environment Under Test

| Item | Value |
| --- | --- |
| EC2 instance | `i-0697bf3276eb59a01` |
| EC2 final state | `TERMINATED` after successful smoke to avoid ongoing cost |
| Staging domain | `NONE` |
| Public base URL | `http://65.1.147.247` during smoke only; no longer active after termination |
| Backend URL | `http://65.1.147.247` through host Nginx to `127.0.0.1:18080` during smoke |
| Frontend URL | `http://65.1.147.247` through host Nginx to `127.0.0.1:18088` during smoke |
| TLS certificate | `NOT CONFIGURED`; HTTP-only smoke because no domain is available |
| Staging env file | Server-only `/opt/cloudcampus/.env.staging` created on EC2 |
| PostgreSQL | Docker PostgreSQL 16, healthy |
| Mail mode | `log` dry-run mode |
| Bootstrap Super Admin | Enabled only for this disposable HTTP staging smoke; must be disabled for shared staging |
| AWS cleanup | Console showed running instances `0`, Elastic IPs `0`, volumes `0`, snapshots `0`, load balancers `0` after termination |

## Repository Readiness Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Staging compose renders with example env | `PASS` | `docker compose --env-file .env.staging.example -f docker-compose.staging.yml config` |
| Ops validation | `PASS` | `sh scripts/ci/validate-ops.sh` |
| Backend test suite | `PASS` | `cd backend && mvn test`: 152 tests, 0 failures, 0 errors, 0 skipped |
| Frontend test suite | `PASS` | `cd frontend && npm test -- --run`: 21 files, 75 tests |
| Frontend lint/typecheck/build | `PASS` | `npm run lint`, `npm run typecheck`, and `npm run build` passed; build output JS 471.05 kB before gzip |
| Staging runbook | `PASS` | `docs/deployment/STAGING_RUNBOOK.md` created |
| EC2 bootstrap | `PASS` | `sudo sh infra/scripts/ec2-bootstrap-ubuntu.sh`; final output included `Bootstrap complete.` |
| Backend/frontend image build on EC2 | `PASS` | Built `cloudcampus-backend:staging` and `cloudcampus-frontend:staging` locally on the EC2 host |
| Docker compose staging deployment | `PASS` | Backend, frontend, and PostgreSQL containers are all `healthy` |
| Public HTTP health checks | `PASS` | `http://65.1.147.247/actuator/health`, `/actuator/health/readiness`, and `/` returned success |

## Smoke Test Matrix

| Step | Expected Result | Current Result | Evidence / Error Logs | Required Fix |
| --- | --- | --- | --- | --- |
| Backend health returns `UP` | `GET /actuator/health` returns HTTP 200 with `UP` | `PASS` | `curl -fsS http://65.1.147.247/actuator/health` returned `{"status":"UP","groups":["liveness","readiness"]}` | None |
| Backend readiness returns `UP` | `GET /actuator/health/readiness` returns HTTP 200 with `UP` | `PASS` | `curl -fsS http://65.1.147.247/actuator/health/readiness` returned `{"status":"UP"}` | None |
| Frontend loads | `GET /` returns HTTP 200 and app shell renders | `PASS` | `curl -I http://65.1.147.247/` returned HTTP 200; browser loaded the app | None |
| Super Admin login works | Login accepts controlled staging Super Admin credential or returns MFA challenge | `PASS` | User confirmed Super Admin login succeeded in browser | Disable bootstrap after smoke or rotate credentials before shared staging |
| MFA works | MFA verification returns authenticated session | `PASS` | User completed MFA and reached authenticated Super Admin area | None |
| Super Admin creates tenant | Tenant, first school, School Admin invitation, access grant and audit rows created | `PASS` | UI showed created tenant/school; direct API smoke returned HTTP 201 with tenant, school, invitation, and school access objects | None |
| School Admin invitation generated/sent | Invitation exists; SMTP sends email or log mode records controlled token | `PASS_WITH_LIMITATION` | Log-mode invitation flow generated an invitation; token was available in the authenticated onboarding API response | Configure SMTP before pilot |
| School Admin accepts invitation | Invitation token accepted, password set, user activated | `PASS` | User confirmed invitation grant/acceptance succeeded | None |
| School Admin login works | Login accepts new School Admin credential or returns MFA challenge | `PASS` | Direct API login returned MFA required; user entered MFA code and confirmed School Admin login succeeded | None |
| School Admin creates academic setup item | Academic year/class/section/subject created in active school | `PASS` | Academic year existed/409 conflict proved prior creation; class created HTTP 201; section created HTTP 201 | None |
| School Admin creates student or fee demand | Student import/list or fee demand create succeeds | `PASS` | Student import returned HTTP 201 with `imported: true`, `importedCount: 1`, `errors: []` | None |
| Logout works | `/v1/me/logout` revokes refresh/access context and UI returns to logged-out state | `PASS` | User confirmed logout succeeded | None |

## Problems Discovered During Live Smoke

| Finding ID | Problem | Evidence | Impact | Required Fix | Priority |
| --- | --- | --- | --- | --- | --- |
| STAGE-GAP-001 | Staging was HTTP-only and IP-based. | Smoke used `http://65.1.147.247`; no domain or TLS certificate existed. | Good for low-cost deploy proof, not acceptable for pilot or paid customer testing. | Add domain, HTTPS/TLS, stable staging URL, and update CORS/frontend URLs. | P0 before pilot |
| STAGE-GAP-002 | Staging secrets were exposed during manual troubleshooting. | JWT/DB/bootstrap credential values were typed into the operator chat during `.env.staging` repair. | Any future shared staging must treat those values as compromised. | Rotate JWT secret, DB password, bootstrap password, and any copied `.env.staging` values before reusing staging. | P0 before shared staging |
| STAGE-GAP-003 | Bootstrap Super Admin remained enabled for the disposable smoke. | `.env.staging` used `CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED=true`. | Acceptable for disposable smoke only; unsafe for shared staging/pilot. | Disable bootstrap after first platform admin exists and document controlled admin creation. | P0 before pilot |
| STAGE-GAP-004 | Invitation delivery was log/API-token based, not real email delivery. | Mail mode was `log`; token was obtained from authenticated onboarding API response for smoke. | Real School Admin onboarding email delivery is not proven. | Configure SMTP/provider delivery and verify invitation acceptance from received email. | P0 before pilot |
| STAGE-GAP-005 | EC2 staging host was terminated after successful smoke. | AWS resource page showed terminated instance and no volumes/EIPs after cleanup. | There is no persistent staging environment currently running. | Recreate staging when needed from the runbook or move to a stable shared staging host. | P1 |
| UX-STU-IMPORT-001 | School Admin student import exposed raw UUID fields instead of dropdown selectors. | During smoke, class and section IDs had to be copied manually into the import JSON even though the School Admin was inside an active school and academic setup existed. | Fixed in frontend: student import now loads academic years/classes/sections, hides IDs, provides editable rows, CSV upload, validation summary, and import/queue actions. | Re-run this flow during the next live staging smoke. | COMPLETE in repo; pending live re-smoke |
| UX-ACA-001 | Academic setup forms are API-backed but not fully guided. | Class/section creation was completed through direct API/browser-console checks after duplicate academic-year conflict. | Admin setup is functional but still too technical for non-technical users. | Add guided setup flow with existing-year handling, dependent dropdowns, and clear success/error copy. | P1 |

## Commands To Run On Staging

Replace `https://staging.<your-domain>` with the real domain:

```bash
BASE_URL=https://staging.<your-domain>

curl -fsS "$BASE_URL/actuator/health"
curl -fsS "$BASE_URL/actuator/health/readiness"
curl -fsS "$BASE_URL/"

BACKEND_URL="$BASE_URL" FRONTEND_URL="$BASE_URL" sh scripts/ops/smoke-staging.sh
```

Optional login smoke after a controlled staging Super Admin exists:

```bash
BACKEND_URL="$BASE_URL" \
FRONTEND_URL="$BASE_URL" \
CLOUDCAMPUS_SMOKE_EMAIL=<staging-super-admin-email> \
CLOUDCAMPUS_SMOKE_PASSWORD='<staging-super-admin-password>' \
sh scripts/ops/smoke-staging.sh
```

Log capture:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=300 backend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=300 frontend
docker compose --env-file .env.staging -f docker-compose.staging.yml logs --tail=300 postgres
sudo tail -n 200 /var/log/nginx/error.log
```

## Exact Error Logs

No unresolved application errors remain from the successful deployment.

Resolved deployment issue:

```text
Initial backend startup failed with PostgreSQL password authentication errors because the disposable DB volume was created with an earlier mismatched password.
Fix: corrected `.env.staging`, removed a broken wrapped JWT line, made DB/JDBC passwords match, reset the disposable staging DB volume with `docker compose down -v`, then redeployed.
Result: backend, frontend, and postgres containers became healthy.
```

Current compose status:

```text
cloudcampus-backend-1    cloudcampus-backend:staging    Up About an hour (healthy)   127.0.0.1:18080->8080/tcp
cloudcampus-frontend-1   cloudcampus-frontend:staging   Up About an hour (healthy)   127.0.0.1:18088->80/tcp
cloudcampus-postgres-1   postgres:16-alpine             Up About an hour (healthy)   5432/tcp
```

## Fixes Needed Before Pilot

Critical before pilot:

- Add a real domain and HTTPS/TLS. Current smoke is HTTP-only on `http://65.1.147.247`.
- Rotate the staging secrets that were exposed during manual troubleshooting and disable bootstrap for shared staging.
- Configure controlled staging Super Admin creation without leaving bootstrap enabled.
- Configure staging backup/restore drill and record proof.
- Configure staging monitoring/alerts and record proof.
- Use `smtp` mode for at least one invitation delivery test before pilot.
- Re-run the improved student import UX in the next live staging environment to confirm the dropdown workflow outside localhost.

Not blockers for staging attempt, but blockers for paid production:

- Object storage for report/document artifacts.
- Payment gateway and reconciliation.
- Hosted logging/metrics/alerts.
- Load/performance baseline.
- Production secrets manager and managed PostgreSQL.

## Manual EC2 Action Status

| Action | Status |
| --- | --- |
| Provision EC2 | `COMPLETE` |
| Configure security group | `COMPLETE` |
| Point DNS to EC2 | `SKIPPED_NO_DOMAIN` |
| Run bootstrap script | `COMPLETE` |
| Create `.env.staging` with real secrets | `COMPLETE_FOR_HTTP_SMOKE`; rotate before shared staging |
| Login to GHCR or build images | `COMPLETE_LOCAL_EC2_BUILD` |
| Configure Nginx and Certbot | `PARTIAL`; HTTP Nginx complete, Certbot skipped because no domain |
| Deploy compose stack | `COMPLETE` |
| Run smoke matrix | `COMPLETE_HTTP_SMOKE` |
| Stop/delete AWS resources after smoke | `COMPLETE`; EC2 terminated, no Elastic IPs, no volumes, no snapshots |

## Final Status

Current staging status: `LIVE_STAGING_HTTP_VERIFIED_THEN_TERMINATED`

CloudCampus was live on EC2 over HTTP at `http://65.1.147.247` and the core smoke path passed. The EC2 instance was then terminated to avoid ongoing cost, so there is no currently running staging URL. CloudCampus should not be treated as pilot-ready until a stable staging host, domain, HTTPS/TLS, rotated staging secrets, disabled shared bootstrap, SMTP delivery, backups/restore, monitoring, and School Admin UX hardening are completed.
