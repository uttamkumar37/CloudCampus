# Student My Profile Master Plan

## Scope

Transform only the Student Portal `My Profile` route into a premium 360 degree Student Digital Identity Profile. This work must preserve existing authentication, RBAC, tenant isolation, APIs, fee/payment logic, and school workflows.

## Guardrails

- Do not modify unrelated modules.
- Keep `/student/profile` protected by the existing student portal route guard.
- Keep APIs backward compatible and prefer the existing `/v1/student/profile-360` self-service endpoint.
- Do not expose admin-only write actions inside the student portal.
- Preserve tenant isolation by resolving data from the authenticated student context.
- Keep mobile responsiveness, loading states, empty states, and error states.
- Use typed React/TypeScript data helpers and reusable UI primitives.

## Phases And Tasks

| Phase | Task | Description | Dependencies | Status |
| --- | --- | --- | --- | --- |

## Current Implementation Notes

- `My Profile` route: `/student/profile`.
- Data source: `GET /v1/student/profile-360`.
- Backend self endpoint resolves the student record from the authenticated user context.
