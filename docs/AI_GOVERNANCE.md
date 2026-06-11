# CloudCampus AI Governance

CloudCampus AI governance protects student, school, and tenant data while still making AI useful for daily school operations.

## Governance Principles

- Server-side scope is authoritative.
- Route policy decides whether a user can call an AI endpoint.
- `RequestContext` decides user, tenant, active school, role, permissions, correlation ID, and request source.
- `AiAssistantService` decides whether a role can use a specific AI feature.
- `AiGovernanceService` records safe metadata for authorized and denied AI usage.
- `AiSafetyService` blocks unsafe requests before provider generation.

## Data Privacy

AI audit rows store safe metadata:

- Tenant ID.
- School ID when available.
- User ID and role.
- AI feature.
- Scope type and scope ID.
- Request type.
- Prompt hash.
- Prompt length.
- Estimated units and cost placeholder.
- Authorization or denial status.

Raw prompt and raw response content are not stored by default. This is intentional because prompts can contain student, parent, fee, health, discipline, or operationally sensitive information.

## Tenant Isolation

AI endpoints must not trust request-body `tenantId` or `schoolId`. The authenticated context supplies tenant and active-school scope. School-scoped features require an active school and a valid user-school grant.

Recommended checks:

- Tenant admin: tenant scope only.
- School admin/principal/teacher/student/parent/finance/staff: tenant and active school.
- Parent: linked-child scope for child-specific summaries.
- Student: active student-user link for self-specific summaries.
- Finance: active school finance permission and object checks for fee/payment/report data.

## Prompt Safety

The safety layer should reject or redirect prompts that ask for:

- Passwords, JWTs, refresh tokens, reset tokens, MFA codes, or SMTP/API secrets.
- Cross-tenant or cross-school data.
- Student cheating, exam answer leakage, or bypassing teacher review.
- Harmful, abusive, sexual, or age-inappropriate content.
- Payment-sensitive details beyond safe summaries.

Student-facing AI must explain concepts step by step and avoid doing assessed work in a way that enables cheating.

## Admin Controls

Existing foundations:

- Super admin AI entitlements under `/v1/super-admin/ai/**`.
- Tenant entitlements with enabled features, monthly budget, human approval, and retention.
- AI policies and automation metadata.
- AI recommendations with approval, rejection, execution, and dismissal workflows.

Portal AI generation uses tenant entitlements and records audit metadata for both successful and denied requests.

## Frontend Safety And Visibility

The React/Vite AI portal follows these rules:

- The frontend sends bearer authentication and `X-Correlation-Id` only. It does not send trusted tenant, school, role, or permission claims.
- Navigation is role-aware for usability, but it is not a security boundary. Backend route policy and `RequestContext` remain authoritative.
- Global assistant, dashboard, recommendations, generators, settings, and audit screens all show review-before-use language.
- Student-facing AI screens use softer learning-help wording: "Use this as learning help. Ask your teacher if you are unsure."
- Recommendation cards expose only the backend-supported action workflow. Unsupported direct status changes are not faked in the UI.
- AI settings controls are disabled and labeled "Backend support pending" when a matching save endpoint does not exist.
- "Use this" on generated drafts marks the draft for user review in the UI. Publishing, sending, or saving must be handled by a later domain-specific API integration.
- Guest/demo mode can show sample prompts and demo responses, but it must not call destructive APIs.

## Audit And Review

The AI audit page should show metadata only:

- Time.
- User role.
- Feature.
- Scope.
- Status.
- Denial reason.
- Cost/unit estimate.
- Correlation ID when available in future schema.

Operators should search by tenant, school, role, feature, status, and date. Raw prompt review should require a separate, explicit, protected product decision.

## Human Review

All generated communication, fee reminders, notices, homework, quizzes, report summaries, and recommendations are draft suggestions. Users must review before publishing, sending, or treating AI output as final.
