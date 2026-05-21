# Component Guidelines

- Use shared UI primitives from `frontend/src/shared/ui` before adding new visual primitives.
- Keep feature-specific components inside the feature folder.
- Use React Hook Form and Zod for non-trivial forms.
- Use accessible labels, semantic controls, loading states, empty states, and error states.
- Do not render UUIDs as meaningful labels; display names/codes should be business-friendly.
- Keep API calls in feature API modules, not inline inside deeply nested components.
