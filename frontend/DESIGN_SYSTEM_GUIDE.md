# CloudCampus Frontend Design System Guide

## Shared Patterns

- Use `PageHeader` for page titles and subtitles.
- Use `MetricCard` for dashboard numbers and linked KPI cards.
- Use `InsightCard` for AI-style recommendations that follow the shared insight contract.
- Use `LockedFeature` for premium feature gates and upgrade prompts.
- Use `SensitiveField` for role-masked data like payroll, health, documents, and family income.
- Use `EmptyState`, `ErrorState`, `SkeletonPage`, and `SkeletonTable` for non-happy states.

## Dashboard Rules

- KPI cards should be clickable when they lead to a real workflow.
- Panels must not nest cards inside decorative card wrappers.
- Use responsive grids with `sm`, `md`, `lg`, or `xl` breakpoints.
- Keep headings compact inside admin/portal surfaces.
- Empty states must explain the next action.
- Disabled actions must include a short hint.

## AI Insight Rules

- Every insight needs title, summary, recommendation, severity, confidence, and source signals.
- Confidence must be clamped between `0` and `100`.
- AI-looking cards must never imply access to data outside the current user role and tenant.

## Accessibility

- Buttons must be real `button` elements when they perform actions.
- Navigation must use links for route changes.
- Error states need `role="alert"` where appropriate.
- Text must fit on mobile and avoid viewport-scaled font sizing.
