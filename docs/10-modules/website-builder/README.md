# Website-Builder Module

## Overview
Implemented in two layers: tenant school website builder and super-admin/public experience website builder.

## Business Purpose
Let schools and platform admins publish structured public pages without breaking tenant isolation or route safety.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `website, domain, experience`.

## APIs
Detected endpoint method counts for related packages: ANY:6, DELETE:6, GET:52, POST:42, PUT:17.
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
- `backend/src/main/java/com/cloudcampus/website/controller/PublicSiteController.java`
- `backend/src/main/java/com/cloudcampus/website/controller/WebsiteAdminController.java`
- `backend/src/main/java/com/cloudcampus/website/dto/NavItemRequest.java`
- `backend/src/main/java/com/cloudcampus/website/dto/NavItemResponse.java`
- `backend/src/main/java/com/cloudcampus/website/dto/PageRequest.java`
- `backend/src/main/java/com/cloudcampus/website/dto/PageResponse.java`
- `backend/src/main/java/com/cloudcampus/website/dto/PageWithSectionsResponse.java`
- `backend/src/main/java/com/cloudcampus/website/dto/PublicSiteResponse.java`
- `backend/src/main/java/com/cloudcampus/website/dto/SectionRequest.java`
- `backend/src/main/java/com/cloudcampus/website/dto/SectionResponse.java`
- `backend/src/main/java/com/cloudcampus/website/dto/WebsiteResponse.java`
- `backend/src/main/java/com/cloudcampus/website/entity/Website.java`
- `backend/src/main/java/com/cloudcampus/website/entity/WebsiteNavItem.java`
- `backend/src/main/java/com/cloudcampus/website/entity/WebsitePage.java`
- `backend/src/main/java/com/cloudcampus/website/entity/WebsiteSection.java`
- `backend/src/main/java/com/cloudcampus/website/repository/WebsiteNavItemRepository.java`
- `backend/src/main/java/com/cloudcampus/website/repository/WebsitePageRepository.java`
- `backend/src/main/java/com/cloudcampus/website/repository/WebsiteRepository.java`
- `backend/src/main/java/com/cloudcampus/website/repository/WebsiteSectionRepository.java`
- `backend/src/main/java/com/cloudcampus/website/service/WebsiteService.java`
- `backend/src/main/java/com/cloudcampus/website/service/WebsiteServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/domain/controller/CustomDomainController.java`
- `backend/src/main/java/com/cloudcampus/domain/dto/DomainRequest.java`
- `backend/src/main/java/com/cloudcampus/domain/dto/DomainResponse.java`
- `backend/src/main/java/com/cloudcampus/domain/entity/CustomDomain.java`
- ... 39 additional files omitted for focus


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
