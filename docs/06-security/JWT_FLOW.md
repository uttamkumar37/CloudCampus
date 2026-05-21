# JWT Flow

```mermaid
sequenceDiagram
  participant Client
  participant Auth
  participant Redis
  participant API

  Client->>Auth: POST /v1/auth/login
  Auth->>Redis: Check lockout/rate limit
  Auth-->>Client: accessToken + refreshToken
  Client->>API: Bearer accessToken
  API->>API: JwtAuthenticationFilter validates token
  API->>API: Set RequestContext tenant/user/school
  Client->>Auth: POST /v1/auth/refresh
  Auth->>Redis: Rotate/revoke refresh token state
  Auth-->>Client: new accessToken + refreshToken
```

## Rules
- Access token identity is authoritative for tenant context.
- Refresh token rotation must preserve security against replay.
- Logout must denylist/revoke usable tokens where supported.
- Token parsing errors return JSON 401, not HTML.
