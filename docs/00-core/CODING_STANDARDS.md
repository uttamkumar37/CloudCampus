# Coding Standards

## Backend
- Use Java 21 and Spring Boot conventions already present in the codebase.
- Keep controllers focused on HTTP mapping, DTO validation, `RequestContext` extraction, and response wrapping.
- Put business rules in services and persistence details in repositories.
- Add `@PreAuthorize` when route-level security is too broad for an operation.
- Use Bean Validation DTOs for simple field constraints and service validation for ownership, state transition, and cross-table rules.
- Use tenant-scoped repository methods (`findBy...AndTenantId`) for tenant data.
- Use Flyway migrations for schema changes; never mutate existing applied migrations.

## Frontend
- Use existing React Router, React Query, Zustand, shared Axios, shared UI, and feature-folder patterns.
- Keep API clients close to their feature and unwrap `ApiResponse<T>` consistently.
- Route guards are for UX; backend remains the source of security truth.
- Never render sensitive identifiers as primary display values.

## Mobile
- Use Expo/React Native APIs and the existing `src/api/client.ts` auth refresh pattern.
- Keep API base URL in Expo config/environment, not hardcoded per screen.
- Verify web bundling separately from native export when adding native-only libraries.

## Documentation
- Update the relevant module, API, and architecture doc when changing behavior.
- Prefer small focused docs over giant catch-all files.
- Include exact commands and file paths when documenting build, CI, migration, or incident steps.
