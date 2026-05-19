# Support Playbook

Last updated: 2026-05-19

## Purpose

This support playbook defines how CloudCampus support handles production tickets from schools, tenant administrators, parents, students, and internal teams. It covers ticket intake, incident triage, school issues, auth issues, payment issues, data correction, privacy boundaries, escalation, and closure evidence.

Use this playbook for day-to-day support, launch hypercare, release monitoring, and any tenant-visible issue that is not already declared as a P1/P2 incident. When a ticket indicates service outage, data isolation risk, payment corruption, or security compromise, escalate immediately instead of continuing normal support handling.

## Related Runbooks

| Area | Source |
|---|---|
| Incident response | `docs/INCIDENT_RUNBOOK.md` |
| Health verification | `docs/HEALTH_VERIFICATION_CHECKLIST.md` |
| Deployment support handoff | `docs/DEPLOYMENT_SOP.md` |
| Alert routing | `docs/ALERT_ROUTING_PLAN.md` |
| Billing reconciliation | `docs/BILLING_RECONCILIATION_CHECKLIST.md` |
| Admin sessions and devices | `docs/ADMIN_SESSION_DEVICE_MANAGEMENT_PLAN.md` |
| Audit retention | `docs/AUDIT_RETENTION_POLICY.md` |

## Support Roles

| Role | Responsibility |
|---|---|
| Support owner | Owns the ticket queue, first response, requester communication, and closure notes. |
| Customer success owner | Owns tenant relationship, school-principal communication, and non-technical expectation setting. |
| School admin contact | Confirms school-scoped impact, user identity, and business approval for changes. |
| Engineering support owner | Triages code, data, logs, metrics, and safe remediation steps. |
| Finance owner | Reviews payment, receipt, settlement, refund, and reconciliation exceptions. |
| Security owner | Handles suspected account compromise, cross-tenant exposure, privacy breach, and access abuse. |
| Incident commander | Takes over if the ticket is promoted to an incident. |

Every ticket must have one directly responsible owner. Escalated tickets keep the original support owner as the communication owner unless the incident commander assigns someone else.

## Ticket Intake

Create or update a ticket for every support request. Do not resolve production issues only in chat.

| Field | Required evidence |
|---|---|
| Requester | Name, role, school, tenant, contact channel, and callback preference. |
| Scope | Tenant ID/code, school ID/name, user ID/email/phone if available. |
| Symptom | What failed, expected result, actual result, and exact error text or screenshot summary. |
| Time window | First seen time, latest occurrence, timezone, and whether the issue is still happening. |
| Workflow | Auth, attendance, fees/payment, student record, public website, mobile app, notifications, reporting, or admin setup. |
| Impact | Number of users affected, whether classes/payments/admissions are blocked, and any deadline. |
| Environment | Production, staging, mobile app version, browser/device, and network context. |
| Correlation | Request ID, correlation ID, receipt number, payment order ID, audit event ID, or notification log ID when available. |
| Consent | Confirmation that requester is authorized to discuss the affected school/user data. |

Avoid collecting raw passwords, full card or UPI details, government IDs, medical data, or unnecessary student personal data. If a screenshot contains sensitive data, store it only in the approved ticketing system and mark the ticket restricted.

## Incident Triage

Classify the ticket before troubleshooting.

| Severity | Use when | Response target | Escalation |
|---|---|---:|---|
| P1 | Production unavailable for most tenants, login outage, payment capture corruption, cross-tenant data exposure, or active security breach. | 15-30 min | Declare incident and page on-call. |
| P2 | One tenant or critical workflow is blocked, payments cannot complete for a school, or admin access is broadly broken. | 2 h | Engineering lead and customer success. |
| P3 | One user, one class, one invoice, or a degraded but usable workflow. | 1 business day | Service owner if unresolved after triage. |
| P4 | Question, how-to request, cosmetic issue, or scheduled data/admin change. | 2 business days | Support queue. |

Promote to incident immediately when any of these are true:

- Multiple schools report the same outage or 5xx/401 loop after a release.
- A user can see another tenant's data or school-scoped access is wrong.
- A successful gateway payment is missing internally or duplicate receipts are suspected.
- A Super Admin, Tenant Admin, or School Admin account appears compromised.
- Data loss, accidental mass update, or unauthorized data correction is suspected.
- Legal, privacy, or breach notification risk is present.

If promoted, follow `docs/INCIDENT_RUNBOOK.md` and link the support ticket to the incident record.

## Standard Triage Flow

1. Acknowledge the requester with ticket ID, owner, severity, and next update time.
2. Confirm identity and authority before discussing user, payment, or school data.
3. Reproduce with the least privileged role possible and within the affected tenant/school scope.
4. Check recent deployments, feature flags, and active alerts for the same workflow.
5. Attach evidence: screenshots, timestamps, request IDs, audit events, payment IDs, logs, or metrics.
6. Decide whether support can resolve safely, whether engineering must investigate, or whether an incident is required.
7. Keep requester updates factual: impact, workaround, current owner, and next update time.

Do not promise root cause before engineering confirms it. Do not run direct database changes from a support request without approval and audit evidence.

## School Issues

Common school tickets include setup mistakes, role access, attendance workflows, student data, fee configuration, timetable/class issues, public website content, and notifications.

| Symptom | Support checks | Safe support action | Escalate when |
|---|---|---|---|
| School admin cannot see expected data | Confirm tenant/school, role, assigned school, and active user status. | Correct documented school assignment through admin UI if authorized. | User sees another school/tenant, role mapping is inconsistent, or audit trail is missing. |
| Student/class/section missing | Confirm record exists, status, school scope, import history, and filters. | Guide admin to create/update through UI or retry import using approved workflow. | Bulk import partially applied, duplicate records were created, or data correction requires DB update. |
| Attendance workflow blocked | Check class roster, date, role, mobile sync state, and recent release. | Ask user to retry after sync, validate roster, or use web fallback if available. | Offline sync conflict, duplicate attendance, or repeated mobile sync failure. |
| Public website content wrong | Check published status, navigation, page route, theme, and cache behavior. | Republish content or guide school admin through CMS workflow. | Public site is down, SEO metadata leaks private data, or route serves wrong tenant. |
| Notification not delivered | Check recipient consent, token/contact details, notification log, and queue status. | Correct contact preference or resend through approved UI if idempotent. | Queue backlog, FCM/APNs failure, SMS/email provider issue, or cross-school notification. |

School issue tickets must include affected school, role, workflow, sample record IDs, and whether the requester approved any change.

## Auth Issues

Auth tickets are sensitive because they can indicate security incidents.

| Symptom | Support checks | Safe support action | Escalate when |
|---|---|---|---|
| User cannot log in | Confirm account status, role, tenant/school, recent password reset, and browser/mobile version. | Trigger approved password reset or guide user through existing recovery flow. | Many users affected, repeated 401 loop, lockout across a school, or suspected brute force. |
| Session keeps expiring | Check device/session state, refresh behavior, Redis alert state, and recent deploy. | Ask user to sign out and back in; revoke stale devices if authorized. | Redis outage, refresh token reuse, revoked-device refresh attempts, or broad session churn. |
| Lost or suspicious device | Confirm identity through approved channel and review active devices. | Revoke the affected device or all sessions using approved admin/self-service flow. | Admin account compromise, impossible travel, or attacker activity is suspected. |
| Wrong role or access | Confirm requested role, school assignment, tenant scope, and approval from school admin contact. | Apply role/school change only through admin UI with approval evidence. | Cross-tenant access, privilege escalation, or missing audit event. |
| MFA or recovery problem | Confirm identity and recovery policy. | Use approved recovery process only. | Super Admin/Tenant Admin blocked, MFA bypass requested, or social-engineering concern. |

Never ask for passwords or one-time codes. Never disable security controls to resolve a ticket without security-owner approval.

## Payment Issues

Payment tickets require finance evidence and careful reconciliation. Use sandbox or read-only checks where possible.

| Symptom | Support checks | Safe support action | Escalate when |
|---|---|---|---|
| Payment succeeded in gateway but not in CloudCampus | Collect gateway payment ID, order ID, receipt number if any, amount, timestamp, student, fee record, and school. | Check status and tell requester reconciliation is in progress. | Captured gateway payment lacks successful internal order, amount mismatch, or missing receipt after webhook retry window. |
| Duplicate payment or receipt | Collect both payment IDs, receipt numbers, timestamps, and fee record. | Freeze manual changes and route to finance. | Any duplicate receipt number, duplicate successful order, or possible double capture. |
| Payment failed or pending | Check order status, gateway status, expiry, amount, and whether user retried. | Ask user to retry only after confirming no captured payment exists. | Gateway captured but internal state failed, repeated failures across school, or webhook errors. |
| Refund request | Collect original receipt/payment, amount, reason, school approval, and bank/gateway evidence. | Route to finance according to refund policy. | Refund status mismatch, partial refund ambiguity, or settlement already closed. |
| Settlement or month-end mismatch | Collect date range, gateway report, internal export, and tenant/school scope. | Link to reconciliation ticket. | Cross-tenant mismatch, amount mismatch, duplicate receipt, or unresolved failed webhook. |

For payment exceptions, follow `docs/BILLING_RECONCILIATION_CHECKLIST.md`. Do not mark payment records paid, issue receipts, or process refunds manually without finance and engineering approval.

## Data Correction

Data correction must be auditable, authorized, reversible where possible, and scoped to the minimum affected records.

| Correction type | Required approval | Preferred path | Escalation |
|---|---|---|---|
| User profile, contact, class, or school assignment | School admin or tenant admin contact. | Admin UI change with audit event. | Engineering if UI cannot represent the correction. |
| Student fee amount, discount, waiver, or due date | School finance/admin approval. | Fee-management UI or approved finance workflow. | Finance plus engineering for historical or paid invoices. |
| Attendance correction | Authorized school admin. | Attendance correction UI with reason. | Engineering if offline sync conflict or duplicate record exists. |
| Bulk import cleanup | Tenant admin plus support owner. | Re-run import with corrected file if supported. | Engineering for partial writes, duplicate merge, or rollback. |
| Database repair | Engineering lead plus data owner. | Reviewed script or migration with backup evidence. | Incident commander for corruption, isolation, or mass-change risk. |

Before any data correction:

1. Record before-state evidence in the ticket.
2. Confirm tenant/school scope and requester authority.
3. Identify affected rows or business objects.
4. Choose UI/API correction before direct database repair.
5. Define rollback or compensating action.
6. Record after-state evidence and audit event IDs.

Direct database changes require a peer-reviewed script, backup confirmation for risky changes, execution owner, timestamp, affected-row count, and validation query output.

## Escalation Matrix

| Trigger | Escalate to | Time limit | Required context |
|---|---|---:|---|
| P1/P2 outage or broad degradation | Incident commander and platform on-call | Immediate | Ticket, symptom, scope, time window, health/alert evidence. |
| Tenant or school data isolation concern | Security owner and engineering lead | Immediate | Actor, affected tenant/school, example records, screenshots stored restricted. |
| Payment capture, duplicate receipt, settlement mismatch | Finance owner and engineering support owner | Immediate for captured money | Gateway IDs, internal order/payment IDs, amounts, timestamps, school. |
| Admin account compromise | Security owner | Immediate | User, role, device/session evidence, IPs, suspicious timeline. |
| Direct DB correction needed | Engineering lead and data owner | Before change | Approval, script, backup evidence, affected rows, rollback plan. |
| Release regression suspected | Release owner and support owner from deployment SOP | 30 min | Release version, workflow, first report time, affected tenants. |
| Compliance or privacy concern | Security/privacy owner and leadership | Immediate | Data categories, affected users, exposure window, ticket restrictions. |

Escalated tickets must include the next update time and the person responsible for requester communication.

## Communication Rules

| Situation | Message guidance |
|---|---|
| New ticket | Confirm receipt, ticket ID, severity, owner, and next update time. |
| Investigation | Share what is known, what is being checked, and any safe workaround. |
| Incident promotion | State that the issue has been escalated to incident response and give update cadence. |
| Payment issue | Avoid saying money is lost; say reconciliation is underway and list evidence being checked. |
| Data correction | Confirm approved change, affected records, completion time, and validation performed. |
| Closure | State root cause or confirmed outcome, action taken, evidence, and any follow-up. |

Use tenant-facing language, not internal stack traces. For P1/P2 incidents, customer communication must be approved by the incident commander.

## Closure Criteria

A support ticket can be closed only when:

1. The requester-visible issue is resolved, safely worked around, or explicitly transferred to a tracked follow-up.
2. Evidence is attached: logs, screenshots, audit event, receipt/order IDs, validation result, or owner sign-off.
3. Any data correction includes before/after evidence and approval.
4. Any payment exception includes finance status or reconciliation ticket link.
5. Any escalation includes final owner, incident link, or engineering issue link.
6. The requester receives a closure note with what changed and what to do if it recurs.

## Validation

TASK-051 validation command:

```bash
rg -n "support playbook|ticket|incident triage" docs PRODUCTION_READY_ROADMAP.md
```
