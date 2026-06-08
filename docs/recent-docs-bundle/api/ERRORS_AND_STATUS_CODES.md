<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Errors And Status Codes

Status: CURRENT_IMPLEMENTED

| HTTP status | Meaning | Current source | Status |
| --- | --- | --- | --- |
| 200 | Successful read or command response. | Controllers/services | CURRENT_IMPLEMENTED |
| 201 | Created resource where used. | Create flows | CURRENT_PARTIAL |
| 204 | No content for delete/deactivate where used. | Delete flows | CURRENT_PARTIAL |
| 400 | Bad request/validation/invalid state. | BadRequestException | CURRENT_IMPLEMENTED |
| 401 | Unauthorized token/credentials/MFA. | UnauthorizedException/security | CURRENT_IMPLEMENTED |
| 403 | Forbidden role/scope/inactive/system actor. | ForbiddenException/service guards | CURRENT_IMPLEMENTED |
| 404 | Not found/inaccessible. | NotFoundException | CURRENT_IMPLEMENTED |
| 409 | Conflict/duplicate. | ConflictException | CURRENT_IMPLEMENTED |
| 429 | Too many login attempts. | TooManyRequestsException/LoginRateLimiterService | CURRENT_IMPLEMENTED for login; CURRENT_PARTIAL globally |
| 500 | Unexpected server failure. | RestExceptionHandler fallback | CURRENT_IMPLEMENTED |

```json
{
  "timestamp": "2026-06-08T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed.",
  "path": "/v1/example"
}
```
