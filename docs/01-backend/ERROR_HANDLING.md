# Error Handling

## Central Handler
`RestExceptionHandler` maps domain exceptions to stable HTTP responses.

## Error Categories
- `NotFoundException`: 404.
- `UnauthorizedException`: 401.
- `AccessDeniedException`/`ForbiddenException`: 403.
- `TenantSuspendedException`: 403 with tenant-suspended semantics.
- `BadRequestException` and Bean Validation failures: 400.
- `ConflictException`: 409.
- `TooManyRequestsException`: 429.
- `StorageException`: storage-specific failure response.
- `UsageLimitExceededException`: entitlement/plan usage failure.

## Rules
- Do not leak stack traces or secrets in API errors.
- Validation errors should identify fields and business condition clearly.
- Security errors should avoid confirming whether a cross-tenant entity exists.
- Keep response envelopes consistent for frontend/mobile handling.
