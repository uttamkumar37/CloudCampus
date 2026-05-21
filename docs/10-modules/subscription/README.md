# Subscription Module

## Overview
Implemented: tenant subscriptions, invoices, feature flags, feature dependencies, usage-limit exceptions.

## Business Purpose
Control plan entitlement, feature access, invoice state, and upgrade/downgrade behavior per tenant.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `subscription, feature, payment`.

## APIs
Detected endpoint method counts for related packages: ANY:4, DELETE:1, GET:9, POST:8, PUT:1.
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
- `backend/src/main/java/com/cloudcampus/subscription/controller/SubscriptionController.java`
- `backend/src/main/java/com/cloudcampus/subscription/controller/TenantInvoiceController.java`
- `backend/src/main/java/com/cloudcampus/subscription/controller/TenantSubscriptionController.java`
- `backend/src/main/java/com/cloudcampus/subscription/dto/AssignPlanRequest.java`
- `backend/src/main/java/com/cloudcampus/subscription/dto/InvoiceResponse.java`
- `backend/src/main/java/com/cloudcampus/subscription/dto/PlanChangePreviewResponse.java`
- `backend/src/main/java/com/cloudcampus/subscription/dto/PlanChangeRequest.java`
- `backend/src/main/java/com/cloudcampus/subscription/dto/SubscriptionPlanResponse.java`
- `backend/src/main/java/com/cloudcampus/subscription/dto/TenantSubscriptionResponse.java`
- `backend/src/main/java/com/cloudcampus/subscription/entity/BillingCycle.java`
- `backend/src/main/java/com/cloudcampus/subscription/entity/SubscriptionPlanCode.java`
- `backend/src/main/java/com/cloudcampus/subscription/entity/SubscriptionStatus.java`
- `backend/src/main/java/com/cloudcampus/subscription/entity/TenantSubscription.java`
- `backend/src/main/java/com/cloudcampus/subscription/repository/TenantSubscriptionRepository.java`
- `backend/src/main/java/com/cloudcampus/subscription/service/SubscriptionService.java`
- `backend/src/main/java/com/cloudcampus/subscription/service/SubscriptionServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/feature/annotation/RequiresFeature.java`
- `backend/src/main/java/com/cloudcampus/feature/aop/RequiresFeatureAspect.java`
- `backend/src/main/java/com/cloudcampus/feature/controller/FeatureAdminController.java`
- `backend/src/main/java/com/cloudcampus/feature/dto/FeatureResponse.java`
- `backend/src/main/java/com/cloudcampus/feature/dto/TenantFeatureResponse.java`
- `backend/src/main/java/com/cloudcampus/feature/entity/Feature.java`
- `backend/src/main/java/com/cloudcampus/feature/entity/FeatureType.java`
- `backend/src/main/java/com/cloudcampus/feature/entity/TenantFeature.java`
- `backend/src/main/java/com/cloudcampus/feature/entity/TenantFeatureId.java`
- ... 14 additional files omitted for focus


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
