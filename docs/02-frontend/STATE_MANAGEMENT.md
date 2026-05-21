# State Management

## Server State
React Query is the default for API-backed state. Query keys should include tenant/school/entity scope where relevant.

## Client State
- Auth state is managed by Zustand in `features/auth/store/useAuthStore.ts`.
- Experience UI state uses feature-local Zustand stores.
- Toasts and disclosure state use shared context/hooks.

## Rules
- Do not duplicate backend authorization state into long-lived frontend state.
- Invalidate affected React Query keys after mutations.
- Keep form draft state local to the page/component unless multiple routes need it.
