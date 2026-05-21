# POST /v1/auth/login

## Status
Implemented.

## Purpose
Exchange a username and password for a short-lived JWT access token and a single-use refresh token. The response carries role, tenant id, primary school id, password-change flag, and enabled feature codes so web and mobile clients can open the correct portal.

## Contract
- Method: `POST`
- Path: `/v1/auth/login`
- Authentication: public, because this endpoint establishes identity.
- Rate limiting: Redis-backed login rate limiter by username and source IP.
- Tenant handling: `X-Tenant-Id` is required for tenant-scoped users; `SUPER_ADMIN` users are not tenant-scoped.

## Request Example
```http
POST /v1/auth/login HTTP/1.1
Content-Type: application/json
X-Tenant-Id: jnv-lucknow-demo
```

```json
{
  "username": "jnv.admin",
  "password": "Demo@1234"
}
```

## Response Example
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<opaque-refresh-token>",
    "expiresIn": 900,
    "role": "SCHOOL_ADMIN",
    "userId": "<user-uuid>",
    "tenantId": "<tenant-uuid>",
    "schoolId": "<school-uuid>",
    "requiresPasswordChange": false,
    "features": ["STUDENT_MANAGEMENT", "ATTENDANCE_MANUAL", "FEE_COLLECTION"]
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
1. Resolve tenant from `X-Tenant-Id` for non-super-admin login.
2. Check Redis login rate limit.
3. Lookup user within tenant scope.
4. Verify password with BCrypt.
5. Mint JWT with subject, role, tenant, school, issue, expiry, and token id claims.
6. Mint refresh token, persist only its safe server-side representation/session record, and return the token pair.
7. Load enabled tenant features for client feature rendering.

## RBAC
The endpoint is public, but the returned role drives all later route and method authorization.

## DB Impact
Reads tenant/user/school/feature state and writes device/session refresh-token state.

## Frontend And Mobile Usage
- Web: `frontend/src/features/auth/api/authApi.ts`.
- Mobile: `mobile/src/api/client.ts`.

## Audit Logging
Successful and failed login attempts must be auditable without logging passwords or tokens.

## Security Concerns
- Use the same failure message for unknown user and wrong password.
- Never log request body, access token, or refresh token.
- After login, JWT tenant claims are authoritative; do not trust client tenant headers.

## Related
- `refresh.md`
- `logout.md`
- `docs/06-security/JWT_FLOW.md`
- `docs/06-security/RBAC_RULES.md`
