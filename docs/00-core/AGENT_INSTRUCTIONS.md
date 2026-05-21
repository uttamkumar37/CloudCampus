# AI Agent Instructions

## First Context To Load
1. `docs/00-core/DO_NOT_BREAK_RULES.md`
2. `docs/00-core/SECURITY_RULES.md`
3. The module doc under `docs/10-modules/<module>/README.md`
4. The API group doc under `docs/11-apis/<group>/README.md`
5. The layer architecture doc for the touched code

## Working Rules
- Inspect implementation before editing.
- Preserve existing APIs unless the user explicitly requests a breaking change.
- Do not alter unrelated frontend/mobile/backend code while working in a specific layer.
- Run the same commands CI runs when fixing CI failures.
- For backend changes, prefer `mvn verify --batch-mode --no-transfer-progress` from `backend`.
- For frontend changes, prefer `npm run build` from `frontend`.
- For mobile changes, prefer `npm run typecheck` and Expo export/start checks from `mobile`.

## Tenant Safety Checklist
- Does every repository query include tenant ownership where required?
- Is `schoolId` checked against `tenantId`?
- Does async work restore or propagate request context?
- Does the API derive tenant from JWT instead of trusting the body/header?
- Does the mutation write audit history?

## Forbidden Shortcuts
- Do not disable tests or bypass validation to make CI green.
- Do not skip Flyway validation.
- Do not widen CORS or public routes casually.
- Do not expose raw secrets, JWTs, refresh tokens, or PII in logs.
- Do not remove RBAC guards to unblock UI calls.
