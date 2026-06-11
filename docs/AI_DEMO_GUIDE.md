# CloudCampus AI Demo Guide

This guide shows how to demo CloudCampus AI using the React/Vite frontend, backend mock provider, and local demo data.

## Demo Positioning

CloudCampus AI should feel like a practical school assistant, not a generic chatbot. The demo should show short, useful outputs that respect roles, active-school context, and review-before-use safety.

## Local Demo Setup

Start the backend:

```bash
docker compose -f docker-compose.local.yml up --build
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Useful notes:

- The frontend defaults to `http://localhost:18080` for backend API calls.
- Set `VITE_CLOUDCAMPUS_API_BASE_URL` if the backend runs elsewhere.
- The mock AI provider returns deterministic output without an external AI key.
- Use local demo users from `LocalDemoDataSeeder`.
- The role preview selector is for demo UI exploration only; backend authorization still comes from the login token.

## Frontend Demo Flow

1. Log in and activate a school when the account has more than one school.
2. Open the AI dashboard from the sidebar.
3. Use a role-specific quick prompt from the dashboard to open the assistant drawer.
4. Copy and regenerate an assistant response.
5. Open AI Recommendations and filter by priority, category, and status.
6. Approve, reject, accept, dismiss, or execute a recommendation depending on the visible action state.
7. Open a generator page and create a notice, homework, lesson plan, quiz, or report summary.
8. Show the "Use this" review state without claiming the content has been published.
9. Open AI Settings to show entitlement, budget, enabled features, and disabled pending-save controls.
10. Open AI Audit Logs and point out that only safe metadata is shown.

## Role-Wise Walkthrough

| Role | Demo path |
| --- | --- |
| Super Admin | AI dashboard, tenant health prompt, AI usage prompt, settings, audit logs. |
| Tenant Admin | Tenant activity summary, onboarding prompt, recommendations, governance view. |
| School Admin | Today's school summary, attendance risks, fee dues, parent notice generator. |
| Principal | Class attendance risk prompt, teacher workload prompt, recommendations. |
| Teacher | Lesson plan generator, homework generator, quiz generator, parent message draft. |
| Student | Homework explanation, study plan, weak-topic practice with student-safe wording. |
| Parent | Child progress summary, attendance explanation, parent-teacher meeting prep. |
| Finance | Fee dues summary, fee reminder draft, collection insight prompt. |
| Guest/Demo | Sample prompts and demo responses only, no destructive backend actions. |

## Best Prompts

School admin:

```text
Show today's attendance and fee collection risks for my school.
```

Principal:

```text
Summarize Class VI attendance risks and recommend actions.
```

Teacher:

```text
Generate a 40 minute lesson plan for Class VI Mathematics on fractions.
```

Student:

```text
Explain fractions step by step and give practice questions.
```

Parent:

```text
Prepare questions I should ask the teacher about my child's progress.
```

Finance:

```text
Draft a polite fee reminder for overdue May mess contribution.
```

## Expected Output Shape

AI responses should include:

- Short answer.
- Key highlights.
- Recommended actions.
- Quick follow-up actions.
- Review-before-use disclaimer.

Every output screen should visibly communicate that AI-generated content may be inaccurate and must be reviewed before use. Student-facing screens use softer learning-help wording.

## What To Emphasize

- Role-aware prompts and navigation.
- Backend-owned tenant, school, role, and permission checks.
- AI audit metadata without raw prompt or response exposure.
- Mock mode works without external provider keys.
- Settings save controls are disabled where backend support is pending.
- Generated drafts are reviewable but not automatically published.
