# POST /v1/auth/logout

## Status
Implemented.

## Purpose
End the current session by revoking refresh-token state and denylisting usable JWTs where supported.

## Contract
- Method: `POST`
- Path: `/v1/auth/logout`
- Authentication: route is public for best-effort cleanup, but authenticated callers should send the current bearer token.
- Tenant handling: use JWT/request context when present and refresh-token/session state when supplied.

## Request Example
```http
POST /v1/auth/logout HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "refreshToken": "<opaque-refresh-token>"
}
```

## Response Example
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

## Error Responses
| Status | Code | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Missing or malformed payload. |
| 401 | `UNAUTHORIZED` | Token is invalid, expired, revoked, or credentials are wrong. |
| 403 | `FORBIDDEN` | Tenant or role state blocks the request. |
| 429 | `TOO_MANY_REQUESTS` | Redis-backed rate limit is exceeded. |
| 500 | `INTERNAL_ERROR` | Unexpected server failure; use correlation id for investigation. |

## Business Logic
1. Revoke provided refresh token/session when present.
2. Denylist the current access token id until expiry when possible.
3. Clear session/device state as configured.
4. Return success for idempotent repeated logout calls.

## Frontend And Mobile Usage
Clients must clear local access token, refresh token, user state, and cached sensitive data after logout.

## Security Concerns
- Logout must not fail open by leaving a valid refresh token active.
- Logout response must not reveal whether a token was already revoked.
