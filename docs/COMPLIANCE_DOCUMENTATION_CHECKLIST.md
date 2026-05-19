# Compliance Documentation Checklist

Last updated: 2026-05-19

## Purpose

This compliance documentation checklist defines the minimum documentation and operational evidence CloudCampus should have before production launch, school onboarding, enterprise procurement, or expanded cross-border data processing.

It is an engineering and operations readiness checklist, not legal advice. Legal counsel owns final interpretation of DPDP, GDPR, contract, sector-specific, and jurisdiction-specific requirements. Product, engineering, support, security, finance, and customer success own keeping the evidence current.

## Regulatory Anchors

| Area | Reference | Checklist use |
|---|---|---|
| India DPDP | Digital Personal Data Protection Act, 2023 and notified rules/guidance | Privacy notice, consent, data principal rights, processor/vendor controls, breach response, retention, and grievance flow. |
| GDPR | EU GDPR and European Commission guidance | Transparency, lawful basis, controller/processor contract terms, data subject rights, DPIA triggers, breach notification, and international transfer review. |
| School contracts | SaaS subscription, order form, school DPA, and support terms | Defines customer role, data processing instructions, subprocessor approval, retention, export, deletion, and support access. |
| CloudCampus runbooks | Audit retention, support playbook, incident runbook, deployment SOP | Converts compliance commitments into support, security, audit, and incident evidence. |

Official references:

- India DPDP Act: `https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf`
- European Commission GDPR breach guidance: `https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/what-data-breach-and-what-do-we-have-do-case-breach_en`
- European Commission controller/processor guidance: `https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/controllerprocessor/can-someone-else-process-data-my-organisations-behalf_en`
- European Commission DPIA guidance: `https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/when-data-protection-impact-assessment-dpia-required_en`

## Ownership

| Role | Responsibility |
|---|---|
| Compliance owner | Maintains checklist, evidence register, renewal cadence, and launch sign-off. |
| Legal owner | Approves privacy policy, DPA, subprocessor terms, breach notices, and regional obligations. |
| Security owner | Owns access reviews, breach response evidence, encryption controls, and incident coordination. |
| Product owner | Owns data inventory, feature-level purposes, user-facing copy, and rights workflows. |
| Engineering owner | Owns implementation evidence for retention, export, deletion, access control, audit, and logging. |
| Support owner | Owns privacy request intake, identity verification, ticket handling, and requester communication. |
| Customer success owner | Owns school-facing notices, onboarding artifacts, and contract handoff. |

No production launch or enterprise school onboarding should proceed without named owners for privacy policy, DPA, retention, deletion/export, access reviews, and breach response.

## Evidence Register

Maintain a compliance evidence register with one row per artifact.

| Field | Required |
|---|---|
| Artifact | Privacy policy, DPA, ROPA, retention matrix, deletion runbook, export workflow, access review, breach exercise, vendor review, or DPIA. |
| Owner | Person responsible for keeping it current. |
| Status | Draft, legal review, approved, implemented, or blocked. |
| Scope | Production, staging, mobile app, public website, school tenant, vendor, or internal ops. |
| Last reviewed | Date and reviewer. |
| Next review | Date or trigger. |
| Evidence link | Document, ticket, test result, runbook, audit event, or approval record. |
| Open gaps | Missing approvals, implementation gaps, or legal follow-ups. |

Use the evidence register during launch readiness, procurement reviews, security questionnaires, incident postmortems, and annual compliance review.

## Privacy Policy Checklist

| Topic | Required coverage | Evidence |
|---|---|---|
| Data controller/processor roles | Explain whether CloudCampus acts as processor/service provider for schools and controller for its own website, marketing, billing, and support data. | Legal-approved privacy policy and DPA role matrix. |
| Personal data categories | Students, parents/guardians, staff, admins, school contacts, payment metadata, device/session data, support tickets, audit logs, public website analytics, and notification tokens. | Data inventory and privacy policy section. |
| Purpose of processing | School ERP operations, authentication, attendance, fees/payments, communication, support, security, analytics with consent where required, billing, and legal obligations. | Purpose map tied to features. |
| Lawful basis or notice basis | Jurisdiction-specific basis approved by legal for each purpose. | Legal basis matrix. |
| Cookies and analytics | Explain analytics consent, optional tracking, public site consent banner, and withdrawal path. | Public website copy and consent test evidence. |
| Sharing and subprocessors | List hosting, email/SMS/push, payment gateway, observability, support, and storage vendors. | Subprocessor list and vendor review. |
| International transfers | Describe where data is hosted and any cross-border transfer safeguards. | Hosting region record and transfer assessment. |
| Rights and requests | Access, correction, deletion, export, consent withdrawal, grievance/complaint path, and school-mediated requests. | Rights request SOP and support intake template. |
| Retention | Summarize operational, audit, financial, backup, and legal-hold retention. | Retention matrix and `docs/AUDIT_RETENTION_POLICY.md`. |
| Security measures | Encryption, access controls, audit logs, backups, incident response, and tenant isolation. | Security controls summary and audit evidence. |
| Children/student data | Explain school-authorized processing and parent/guardian request routing where applicable. | School contract language and support SOP. |
| Contact and grievance | Provide privacy contact, support route, escalation timeline, and legal entity. | Published policy and support playbook. |

The privacy policy must be published before production launch, linked from public website, mobile store listings, school onboarding material, and support templates.

## Data Processing Agreement Checklist

| DPA clause | Required coverage | Evidence |
|---|---|---|
| Subject matter and duration | Services provided, term, post-termination retention/export/deletion. | Standard DPA template. |
| Nature and purpose | School ERP, communications, billing support, analytics, security, and support operations. | Processing schedule. |
| Categories of data | Student, parent/guardian, staff, admin, payment metadata, device/session, support, and audit data. | Data inventory. |
| Data subjects | Students, parents/guardians, staff, school admins, tenant admins, platform admins, and website visitors. | DPA schedule. |
| Customer instructions | Process school data only under contract, product configuration, support request, or legal requirement. | DPA and support playbook. |
| Confidentiality | Workforce confidentiality and support-access restrictions. | HR/security policy evidence. |
| Security controls | Technical and organisational measures including encryption, tenant isolation, access control, backups, logging, vulnerability management, and incident response. | TOMs/security appendix. |
| Subprocessors | Prior authorization model, notice of changes, objection window, and flow-down terms. | Subprocessor list and vendor DPAs. |
| Assistance | Support for rights requests, DPIA, audits, breach investigation, deletion/export, and regulator/customer inquiries. | DPA clauses and runbooks. |
| Deletion or return | Export before termination, deletion schedule, backup handling, and legal/audit retention exceptions. | Termination checklist. |
| Audits | Questionnaire, evidence package, pen-test summary, or audit-right process. | Procurement evidence pack. |

For GDPR customers, confirm Article 28-style processor terms with legal. For DPDP customers, confirm data fiduciary/processor roles and school-specific notices with legal.

## Data Inventory and Processing Record

Maintain a processing inventory before launch and update it when a feature changes data collection or sharing.

| Field | Required |
|---|---|
| Feature/process | Auth, school setup, student records, attendance, fees, payments, notifications, uploads, AI knowledge base, website analytics, support, audit logs, backups, mobile push. |
| Data categories | Personal data, financial metadata, student education data, device/session identifiers, logs, support content, or special/sensitive data if any. |
| Purpose | Why the data is collected and used. |
| Role | Controller/fiduciary, processor, or internal operational controller, as approved by legal. |
| Source | School admin, student/parent, staff, public website, payment gateway, mobile app, or generated system data. |
| Recipients | Internal roles, school roles, vendors, exports, support, or regulators. |
| Retention | Hot retention, archive retention, backup retention, and deletion trigger. |
| Security controls | Encryption, access control, audit logging, masking, tenant scoping, or consent gates. |
| Rights impact | Whether access, correction, deletion, export, objection, or consent withdrawal applies. |
| DPIA/assessment | Required, not required, or legal review needed. |

High-risk processing, large-scale student data use, AI-assisted features, biometric/health data, or broad monitoring must be reviewed by legal and security before release.

## Retention Checklist

| Data class | Required documentation | Evidence |
|---|---|---|
| Active school records | Retention tied to contract, school instructions, and operational need. | Data inventory and school DPA. |
| Deleted users | Soft-delete window and hard-delete job behavior. | `DataRetentionService`, retention config, and audit event evidence. |
| Audit logs | Hot/archive retention by audit class, immutability, legal hold, and export controls. | `docs/AUDIT_RETENTION_POLICY.md`. |
| Financial records | Invoice, receipt, payment, refund, tax, and settlement retention. | Billing reconciliation and invoice/GST roadmap. |
| Uploads/documents | Clean, quarantine, deleted, backup, and lifecycle policy. | Upload quarantine design and storage lifecycle evidence. |
| Backups | Backup retention, encryption, restore test, and deletion policy. | Backup runbooks and restore-drill evidence. |
| Logs/traces | Short retention, PII minimization, restricted access, and incident archive rules. | Observability config and audit retention policy. |
| Support tickets | Restricted storage, PII minimization, closure evidence, and retention. | Support playbook and ticketing policy. |

Retention changes require legal and engineering review because they affect privacy promises, audit evidence, backups, and school contracts.

## Deletion and Export Checklist

| Request type | Required workflow | Evidence |
|---|---|---|
| School data export | Verify requester authority, tenant/school scope, export format, date range, secure delivery, and expiry. | Export ticket, audit event, checksum, and expiry timestamp. |
| Individual access/export | Route through school when CloudCampus is processor; verify identity and authority. | Request ticket and school authorization. |
| Correction | Use UI/API first, record approval, before/after evidence, and audit event. | Support playbook data correction evidence. |
| Deletion | Confirm legal basis, school instruction, dependencies, backups, audit/financial exceptions, and legal hold. | Deletion approval, affected objects, validation query, and audit event. |
| Consent withdrawal | Stop optional analytics/marketing processing and retain only required operational/audit data. | Consent state evidence and suppression record. |
| Tenant termination | Export, suspension, final deletion schedule, backup expiry, invoice settlement, and confirmation notice. | Termination checklist and customer sign-off. |

Deletion/export workflows must be role-scoped, auditable, rate-limited where applicable, and tested before production launch. Direct database deletion must follow support playbook data correction controls and incident/runbook procedures when risk is high.

## Access Review Checklist

| Access area | Review cadence | Required evidence |
|---|---:|---|
| Super Admin users | Monthly and after every personnel change. | User list, reviewer, approval/removal actions, MFA status. |
| Tenant Admin and School Admin users | Quarterly or per school contract. | Scoped role export and school confirmation. |
| Production database access | Monthly. | DBA/security role list, break-glass events, access reason, removal record. |
| Cloud/storage/backup access | Monthly. | IAM export, bucket access, key ownership, backup decrypt access. |
| Payment gateway access | Monthly. | Razorpay/admin access list and finance approval. |
| Observability/log access | Quarterly. | Grafana/Prometheus/log platform role export. |
| Support/ticketing access | Quarterly. | Support users, restricted queue access, offboarding evidence. |
| Vendor/subprocessor access | Annual or on contract change. | Vendor review and DPA/security evidence. |

Access reviews must record reviewer, date, source export, exceptions, removals, and unresolved risks. Any orphaned privileged account is a launch blocker.

## Breach Response Checklist

Use `docs/INCIDENT_RUNBOOK.md` for incident command and `docs/SUPPORT_PLAYBOOK.md` for requester communication. This checklist adds privacy-specific evidence.

| Step | Required action | Evidence |
|---|---|---|
| Detect and preserve | Declare incident if personal data may be affected; preserve logs, audit events, support tickets, and system state. | Incident ID and evidence snapshot. |
| Classify | Identify confidentiality, integrity, availability impact; affected data categories; tenants/schools; users; systems; vendors. | Breach assessment worksheet. |
| Contain | Revoke credentials, disable feature, rotate secrets, isolate tenant/data path, block exports, or pause vendor integration. | Containment timeline. |
| Assess notification | Legal decides DPDP/GDPR/customer/regulator/user notification obligations and timelines. | Legal decision record. |
| Notify processors/controllers | If acting as processor, notify affected controller/customer according to contract and law. | Customer notification draft and send record. |
| Notify individuals/regulator | If required, send approved notices with facts, impact, mitigation, and contact path. | Approved notice and delivery evidence. |
| Remediate | Patch, data repair, access removal, monitoring, and compensating controls. | Remediation ticket and validation. |
| Postmortem | Root cause, timeline, impact, control gaps, follow-ups, and owner dates. | Postmortem and tracked actions. |

GDPR breach assessment must account for the European Commission guidance that supervisory authority notification may be required without undue delay and, where applicable, within 72 hours after awareness. DPDP notification content and timing must be confirmed against currently notified rules and legal advice.

## Launch Readiness Checklist

| Gate | Go criteria |
|---|---|
| Privacy policy | Published, legal-approved, linked from public website, mobile store listings, and onboarding materials. |
| DPA | Standard DPA approved, with processing schedule, TOMs, subprocessor list, and deletion/export terms. |
| Data inventory | Current for production features, mobile app, public website, support, payments, uploads, backups, logs, and AI features. |
| Retention | Retention matrix approved and aligned with audit, backup, support, payment, and deletion workflows. |
| Deletion/export | Rights request SOP exists, support intake is ready, engineering workflow is tested, and audit evidence is generated. |
| Access reviews | Privileged accounts reviewed; orphaned, stale, or non-MFA privileged access removed. |
| Vendor/subprocessor review | Subprocessor list, DPAs, security evidence, hosting regions, and transfer assessment are current. |
| Breach response | Privacy breach exercise completed or tabletop scheduled with legal, support, security, and engineering owners. |
| Store/privacy metadata | Mobile app privacy/data-safety forms and support/privacy URLs match actual data collection. |
| Evidence register | All required artifacts have owner, status, review date, evidence link, and gap notes. |

## Go/No-Go

Compliance documentation is GO only when:

1. Privacy policy and DPA are legal-approved and published or ready for contract use.
2. Data processing inventory covers every production feature and vendor.
3. Retention, deletion, export, and backup exceptions are documented.
4. Access reviews are complete for privileged production, support, payment, and vendor access.
5. Breach response roles, legal decision points, and communication templates are documented.
6. Open compliance gaps have explicit owner, severity, and launch decision.

Any missing privacy policy, missing school DPA, undocumented subprocessor, unreviewed privileged production access, untested deletion/export workflow, or unclear breach notification owner is a NO-GO for enterprise launch.

## Validation

TASK-052 validation command:

```bash
rg -n "compliance|DPDP|GDPR|privacy|data processing" docs PRODUCTION_READY_ROADMAP.md
```
