# Analytics Module

## Overview
Implemented across reports, tenant analytics, AI usage metrics, and public experience event analytics.

## Business Purpose
Aggregate tenant, school, finance, attendance, AI usage, and experience metrics for operational visibility.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `reports, tenant, experience, ai`.

## APIs
Detected endpoint method counts for related packages: ANY:12, DELETE:2, GET:63, PATCH:4, POST:41, PUT:14.
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
- `backend/src/main/java/com/cloudcampus/reports/controller/AnalyticsController.java`
- `backend/src/main/java/com/cloudcampus/reports/controller/ReportController.java`
- `backend/src/main/java/com/cloudcampus/reports/controller/SuperAdminReportController.java`
- `backend/src/main/java/com/cloudcampus/reports/dto/AttendanceReportResponse.java`
- `backend/src/main/java/com/cloudcampus/reports/dto/ComparisonResponse.java`
- `backend/src/main/java/com/cloudcampus/reports/dto/FeeReportResponse.java`
- `backend/src/main/java/com/cloudcampus/reports/dto/PerformanceReportResponse.java`
- `backend/src/main/java/com/cloudcampus/reports/dto/PlatformAnalyticsResponse.java`
- `backend/src/main/java/com/cloudcampus/reports/dto/SchoolComparisonRow.java`
- `backend/src/main/java/com/cloudcampus/reports/dto/TenantAnalyticsSummary.java`
- `backend/src/main/java/com/cloudcampus/reports/service/AnalyticsService.java`
- `backend/src/main/java/com/cloudcampus/reports/service/AnalyticsServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/reports/service/ReportService.java`
- `backend/src/main/java/com/cloudcampus/reports/service/ReportServiceImpl.java`
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
- ... 89 additional files omitted for focus


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
