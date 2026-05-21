# AI Safety Regression Plan

## Required Test Categories

- Prompt injection attempts against prompt templates and knowledge-base answers.
- Cross-tenant data leakage checks for every AI retrieval workflow.
- Role-scope tests for student, parent, teacher, school admin, and super admin prompts.
- Output schema validation for insight cards, website generation, reports, summaries, and recommendations.
- Budget/rate-limit tests for AI Premium and tenant usage ceilings.

## Current Safe Foundation

- AI insight service boundaries return deterministic `AiInsightCard` contracts.
- Confidence is clamped to `0..100`.
- Insight services accept scoped metrics only; they do not query cross-tenant data.
- Existing prompt injection tests remain the baseline for deeper AI workflows.

## Release Gate

Every new AI workflow must ship with:

- Tenant-scoped repository/query tests.
- Prompt injection regression tests.
- Output schema validation tests.
- Audit/usage logging verification.
- Feature entitlement or role-gate coverage where premium data is exposed.
