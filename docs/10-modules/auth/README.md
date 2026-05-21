# Auth Module

## Overview
Implemented: JWT login, refresh rotation, logout denylist, password reset OTP, device sessions, login lockout/rate limiting.

## Business Purpose
Authenticate users, issue short-lived access tokens, rotate refresh tokens, enforce lockout, and establish tenant context.

## Workflows
- See `docs/09-workflows` for cross-module lifecycle flows.
- This module must preserve tenant, school, role, and audit boundaries.

## Entities
Implementation files indicate entities/repositories in these packages: `auth, security`.

## APIs
Detected endpoint method counts for related packages: DELETE:1, GET:1, POST:7.
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
- `backend/src/main/java/com/cloudcampus/auth/bootstrap/SuperAdminBootstrap.java`
- `backend/src/main/java/com/cloudcampus/auth/controller/AuthController.java`
- `backend/src/main/java/com/cloudcampus/auth/controller/DeviceController.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/ChangePasswordRequest.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/DeviceSessionResponse.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/ForgotPasswordRequest.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/LoginRequest.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/LoginResponse.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/RefreshRequest.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/RefreshResponse.java`
- `backend/src/main/java/com/cloudcampus/auth/dto/ResetPasswordRequest.java`
- `backend/src/main/java/com/cloudcampus/auth/entity/DeviceSession.java`
- `backend/src/main/java/com/cloudcampus/auth/entity/User.java`
- `backend/src/main/java/com/cloudcampus/auth/entity/UserRole.java`
- `backend/src/main/java/com/cloudcampus/auth/entity/UserStatus.java`
- `backend/src/main/java/com/cloudcampus/auth/mfa/MfaPolicy.java`
- `backend/src/main/java/com/cloudcampus/auth/repository/DeviceSessionRepository.java`
- `backend/src/main/java/com/cloudcampus/auth/repository/UserRepository.java`
- `backend/src/main/java/com/cloudcampus/auth/security/JwtAuthenticationFilter.java`
- `backend/src/main/java/com/cloudcampus/auth/security/JwtDenylistService.java`
- `backend/src/main/java/com/cloudcampus/auth/security/JwtUtil.java`
- `backend/src/main/java/com/cloudcampus/auth/security/LoginRateLimiterService.java`
- `backend/src/main/java/com/cloudcampus/auth/service/AuthService.java`
- `backend/src/main/java/com/cloudcampus/auth/service/AuthServiceImpl.java`
- `backend/src/main/java/com/cloudcampus/auth/service/DeviceSessionService.java`
- ... 4 additional files omitted for focus


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
