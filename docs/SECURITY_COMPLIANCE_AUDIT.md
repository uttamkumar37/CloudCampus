# Security And Compliance Audit

## Sensitive Field Policy

Sensitive data must be guarded by backend policy and mirrored by frontend masking.

- Payroll and banking: Super Admin, Tenant Admin, School Admin only.
- Student health: admin roles, the student owner, or a linked parent.
- Documents: admin roles, the record owner, or a linked parent depending on document type.
- Parent income and family finance details: admin roles only.

## Upload Security

- Direct storage must block executable/script extensions.
- Unapproved MIME types must be quarantined before object storage exposure.
- Upload/download/delete events must stay in immutable audit logs.
- Sensitive download URLs must be short-lived and generated after authorization checks.

## Enterprise Gaps To Close Next

- Wire `SensitiveDataPolicy` into payroll, health, documents, and family finance controllers.
- Wire `UploadQuarantinePolicy` into all file upload paths before MinIO write.
- Add Super Admin MFA challenge storage, recovery codes, and audit logging.
- Add SSO tenant configuration tables and OIDC/SAML metadata validation.
- Add audit export and retention controls per tenant.
