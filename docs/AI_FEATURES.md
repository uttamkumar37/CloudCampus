# CloudCampus AI Features

CloudCampus AI is a role-aware assistant layer on top of the existing backend security model. The backend owns tenant isolation, active-school context, route policies, AI entitlements, request audits, scoped knowledge retrieval, and recommendations. The frontend AI portal consumes those APIs without sending trusted tenant, school, or role scope.

## Current Repository Shape

- Backend: Spring Boot modular monolith in `backend/`.
- Frontend: isolated React/Vite/TypeScript AI portal in `frontend/`.
- Mobile: not present in this repository yet.
- The frontend is a client experience only. It sends bearer authentication and `X-Correlation-Id`; the backend resolves user, tenant, active school, roles, permissions, correlation ID, and request source from `RequestContext`.

## Backend AI Architecture

The backend AI layer has four pieces:

1. Provider abstraction
   - `AiProvider` defines the contract for generating AI output.
   - `MockAiProvider` returns deterministic local, test, and demo content.
   - Future real providers can implement the same interface without changing controller contracts.

2. Safety and governance
   - `AiSafetyService` blocks unsafe prompt patterns.
   - `AiGovernanceService` records safe metadata in `ai_request_audits`.
   - Raw prompts and responses are not stored by default.

3. Role-aware application service
   - `AiAssistantService` maps use cases to allowed roles and AI features.
   - School-scoped work uses authenticated active-school context.
   - The service never accepts tenant or school scope from frontend request bodies.

4. Product APIs
   - Assistant query.
   - Notice, homework, lesson plan, quiz, and report-summary generation.
   - Settings and audit-log reads.
   - Recommendation list and recommendation action workflow.

## Integrated Frontend AI UX

The frontend workspace implements:

- Global floating AI assistant button on authenticated app pages.
- Right-side assistant drawer with role-aware welcome copy, quick prompts, custom prompts, loading/error states, copy, regenerate, and review disclaimer.
- AI dashboard with role-specific actions, recent recommendations, generator entry points, governance links, and demo-friendly sample cards.
- AI recommendations page with filters for priority, category, and status.
- Notice, homework, lesson plan, quiz, and report-summary generator pages.
- AI settings page for entitlement/budget visibility with disabled controls where backend save support is pending.
- AI audit page that displays metadata only.

Primary frontend files:

- `frontend/src/features/ai/aiConfig.ts`
- `frontend/src/features/ai/services/aiApi.ts`
- `frontend/src/features/ai/types/ai.types.ts`
- `frontend/src/features/ai/hooks/useAiAssistant.ts`
- `frontend/src/features/ai/hooks/useAiRecommendations.ts`
- `frontend/src/features/ai/components/*`
- `frontend/src/features/ai/pages/*`
- `frontend/src/components/AppShell.tsx`
- `frontend/src/features/auth/*`

## Backend APIs

| Method | Endpoint | Frontend usage |
| --- | --- | --- |
| `POST` | `/v1/ai/assistant/query` | Assistant drawer and dashboard quick prompts. |
| `POST` | `/v1/ai/generate/notice` | Notice/message/reminder draft generator. |
| `POST` | `/v1/ai/generate/homework` | Teacher homework draft generator. |
| `POST` | `/v1/ai/generate/lesson-plan` | Teacher lesson plan generator. |
| `POST` | `/v1/ai/generate/quiz` | Teacher quiz generator. |
| `POST` | `/v1/ai/reports/summary` | Plain-language report summary generator. |
| `GET` | `/v1/ai/settings` | AI settings and entitlement view. |
| `GET` | `/v1/ai/audit-logs` | Scoped AI usage audit metadata. |
| `GET` | `/v1/ai/recommendations` | Recommendations list. |
| `GET` | `/v1/ai/recommendations/{id}` | Mark recommendation as viewed/read detail. |
| `POST` | `/v1/ai/recommendations/{id}/approve` | Approve recommendation. |
| `POST` | `/v1/ai/recommendations/{id}/reject` | Reject recommendation. |
| `POST` | `/v1/ai/recommendations/{id}/accept` | Accept low-risk recommendation. |
| `POST` | `/v1/ai/recommendations/{id}/execute` | Execute approved recommendation. |
| `POST` | `/v1/ai/recommendations/{id}/dismiss` | Dismiss recommendation. |

## Role-Wise Frontend Screens

| Role | AI navigation and prompts |
| --- | --- |
| Super Admin | Platform health prompts, low-activity schools, AI usage summary, renewal follow-ups, settings, audit logs. |
| Tenant Admin | Tenant summary, onboarding prompts, school activity, governance review, settings, audit logs. |
| School Admin | School summary, attendance risks, fee dues, parent notices, recommendations, settings, audit logs. |
| Principal | Attendance and class-performance prompts, teacher workload, parent meeting drafts, recommendations, audit visibility. |
| Teacher | Homework, lesson plan, quiz, weak-student summary, parent message draft, assistant drawer. |
| Student | Homework explanation, study plan, weak-topic practice, chapter revision, softer student safety wording. |
| Parent | Child progress, attendance explanation, parent-teacher meeting preparation, improvement plan. |
| Finance | Fee dues, fee reminder drafts, collection insight, finance-safe recommendations. |
| Office Staff | Admission inquiry summary, parent message drafts, front-office response prompts. |
| Guest/Demo | Sample prompts and demo responses only; destructive backend actions are not called. |

## Safety Rules

- Do not trust `tenantId`, `schoolId`, or role from the frontend.
- Never return another tenant or school data.
- Student responses must be age-appropriate and avoid direct cheating help.
- Parent responses must be scoped to linked children.
- Finance responses must stay inside active-school finance boundaries.
- Raw prompts and responses are not stored by default.
- AI suggestions are drafts and must be reviewed before use.
- Student-facing screens show softer learning-help wording.
- Audit screens show metadata only, not raw prompt or response content.

## Known Backend Gaps

- `GET /v1/ai/settings` supports portal visibility, but the frontend does not save settings because a matching portal update endpoint is not available for all displayed controls.
- Recommendation actions are limited to the backend-supported workflow: detail/view, approve, reject, accept, execute, and dismiss. Generic direct status changes to `NEW`, `VIEWED`, `DISMISSED`, and `COMPLETED` are not exposed as one status-update endpoint.
- Generator "Use this" actions currently mark drafts for review in the UI. Persisting or publishing generated notices, homework, quizzes, and lesson plans should be wired to domain create/publish APIs in a later phase.
- Local/demo output uses the mock provider unless a real provider implementation and credentials are added.

## Provider Setup

Environment variables:

- `CLOUDCAMPUS_AI_ENABLED`
- `CLOUDCAMPUS_AI_PROVIDER`
- `CLOUDCAMPUS_AI_MODEL`
- `CLOUDCAMPUS_AI_API_KEY`

Default local/test behavior uses the mock provider.

## Roadmap

1. Add a real provider implementation behind `AiProvider`.
2. Add portal save APIs for role/module AI settings.
3. Add idempotency and persistence handoff for generated content that becomes notices, messages, homework, lesson plans, or quizzes.
4. Add object storage for AI-generated export attachments.
5. Generate a typed frontend API client from `docs/api/openapi.yaml`.
