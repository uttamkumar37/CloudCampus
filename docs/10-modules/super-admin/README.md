# Super-Admin Module

## Overview
Implemented: tenant management, analytics, subscription controls, public website/experience platform, AI prompt and knowledge management.

## Business Purpose
Operate the SaaS platform: tenant lifecycle, subscriptions, public website, investor rooms, AI prompts, analytics, and platform configuration.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `tenant, subscription, experience, ai, reports`.

## APIs
Detected endpoint method counts for related packages: ANY:15, DELETE:2, GET:70, PATCH:4, POST:44, PUT:15.
Use `docs/11-apis` and OpenAPI `/v3/api-docs` for full request/response schema.

## Validations
- Validate tenant ownership and school ownership before reads or writes.
- Validate state transitions in service layer.
- Validate DTO shape with Bean Validation or explicit service checks.

## RBAC
- Backend route and method RBAC are authoritative.
- Frontend/mobile role rendering is convenience only.

## Edge Cases
- Cross-tenant object id must not leak existence.
- Soft-deleted/inactive records must not appear in active lists unless requested.
- Retryable operations must be idempotent where external systems or queues are involved.

## Audit Rules
- Mutations must write audit events with actor, tenant, action, target, timestamp, and safe metadata.

## Lifecycle Handling
- Preserve history for academic, finance, attendance, student lifecycle, subscription, and published website state.

## Tenant Isolation
- All tenant-owned repositories must include tenant predicates.
- Async/event consumers must carry tenant context explicitly.

## Dependencies
- `backend/src/main/java/com/cloudcampus/tenant/controller/BrandingController.java`
- `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminAnalyticsController.java`
- `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminTenantController.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/BrandingResponse.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/ComparisonResponse.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/ConfigValueRequest.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/PlatformAnalyticsResponse.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/SchoolComparisonRow.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/SuperAdminStatsResponse.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/TenantAnalyticsSummary.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/TenantConfigResponse.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/TenantCreateRequest.java`
- `backend/src/main/java/com/cloudcampus/tenant/dto/TenantResponse.java`
- `backend/src/main/java/com/cloudcampus/tenant/entity/Tenant.java`
- `backend/src/main/java/com/cloudcampus/tenant/entity/TenantConfig.java`
- `backend/src/main/java/com/cloudcampus/tenant/entity/TenantConfigKey.java`
- `backend/src/main/java/com/cloudcampus/tenant/entity/TenantStatus.java`
- `backend/src/main/java/com/cloudcampus/tenant/repository/TenantConfigRepository.java`
- `backend/src/main/java/com/cloudcampus/tenant/repository/TenantRepository.java`
- `backend/src/main/java/com/cloudcampus/tenant/service/SuperAdminAnalyticsService.java`
- `backend/src/main/java/com/cloudcampus/tenant/service/SuperAdminAnalyticsServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/tenant/service/TenantBootstrapService.java`
- `backend/src/main/java/com/cloudcampus/tenant/service/TenantBootstrapServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/tenant/service/TenantConfigService.java`
- `backend/src/main/java/com/cloudcampus/tenant/service/TenantConfigServiceImpl.java`
- ... 105 additional files omitted for focus


## UI Behavior
- Frontend feature folders and mobile screens must call backend APIs through shared API clients.
- UI must handle loading, empty, validation, forbidden, and tenant-suspended states.

## Event Flow
- Use queues/events for notifications, analytics, and async audit work.
- Do not perform long external dispatch on request threads.

## Security Concerns
- No raw UUIDs as user-facing labels.
- No PII/secrets in logs, public analytics, AI prompts, or audit metadata.

## Future Scalability
- Add pagination for large lists.
- Add indexes matching tenant-scoped filters.
- Add queue-based processing for long-running exports/imports.
