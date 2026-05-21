# POST /v1/auth/refresh

## Status
Implemented.

## Purpose
Rotate a refresh token and issue a new access token. Clients use this when the access token expires or is close to expiry.

## Contract
- Method: `POST`
- Path: `/v1/auth/refresh`
- Authentication: public route, authorized by refresh-token validity.
- Tenant handling: derived from stored refresh/session state, not from request body.

## Request Example
```http
POST /v1/auth/refresh HTTP/1.1
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
  "data": {
    "accessToken": "<new-jwt>",
    "refreshToken": "<new-refresh-token>",
    "expiresIn": 900
  },
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
1. Validate refresh token format and lookup active server-side session.
2. Reject expired, revoked, or already-rotated refresh tokens.
3. Rotate the refresh token and persist the new active session state.
4. Mint a new JWT with the same authoritative role/tenant/school context.
5. Return the new pair so clients replace both tokens atomically.

## Frontend And Mobile Usage
- Web refresh retry is in `frontend/src/shared/api/axiosInstance.ts`.
- Mobile refresh retry is in `mobile/src/api/client.ts`.

## Security Concerns
- Refresh tokens are single-use.
- Reuse should revoke the session family where supported.
- Never expose refresh tokens in logs or audit metadata.
