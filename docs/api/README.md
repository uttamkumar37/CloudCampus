# CloudCampus API Contract

CloudCampus exposes its runtime OpenAPI contract at:

```text
GET /v3/api-docs
GET /v3/api-docs.yaml
```

The committed generated contract lives at:

```text
docs/api/openapi.yaml
```

Swagger UI is disabled by default and enabled only for the `local`, `dev`, and `staging` Spring profiles:

```text
/swagger-ui.html
```

## Groups

OpenAPI groups are available under `/v3/api-docs/{group}`:

| Group | Paths |
| --- | --- |
| `auth` | `/v1/auth/**`, `/v1/invitations/**` |
| `me` | `/v1/me/**` |
| `system` | `/v1/system/**` |
| `super-admin` | `/v1/super-admin/**` |
| `tenant-admin` | `/v1/tenant-admin/**` |
| `school-admin` | `/v1/school-admin/**` |
| `teacher` | `/v1/teacher/**` |
| `finance` | `/v1/finance/**` |
| `parent` | `/v1/parent/**` |
| `student` | `/v1/student/**` |
| `ai` | `/v1/ai/**`, `/v1/school-admin/ai/**`, `/v1/super-admin/ai/**` |

## Authentication

Protected APIs use a bearer JWT:

```http
Authorization: Bearer <access-token>
```

Clients must not send tenant or school context headers such as `X-Tenant-ID` or `X-School-ID`; the backend derives tenant and school scope from the authenticated session and rejects spoofed client context.

Clients may send a safe request correlation header:

```http
X-Correlation-Id: web-portal:request_123
```

The backend returns the resolved value on every response as `X-Correlation-Id`. Unsafe, blank, or overlong values are replaced server-side. Use this value in frontend/mobile logs and support tickets; do not use it as an idempotency key.

The intentionally public `/v1` surface is limited to authentication token-material flows, invitation acceptance, and system readiness. All other `/v1` routes are classified as protected in `RoutePolicyRegistry`, enforced at runtime by `RoutePolicyEnforcementInterceptor`, and checked by `RouteAuthorizationMatrixTest`.

Runtime route policy behavior:

- Public routes are allowed without bearer authentication.
- Protected routes require an authenticated `RequestContext`.
- Role-namespaced routes require the matching role family; non-role-locked routes may also allow explicit permissions.
- Unknown `/v1/**` routes fail closed instead of falling through as implicitly allowed.
- Authenticated guests may call `/v1/me` to inspect their own session shape, but `/v1/me/**` subresources and role portals remain forbidden.

## Examples

Representative request/response examples are in `docs/api/examples/`. They cover authentication, current user, system readiness, tenant onboarding, school creation, student listing/import validation, attendance, fees, homework, exam results, notices, report exports, parent/student flows, and AI recommendation approval.

## Client Generation

Generate frontend, mobile, or integration clients from the committed contract for repeatable builds:

```bash
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-fetch \
  -o frontend/src/generated/cloudcampus-api
```

To generate from a running local backend:

```bash
curl http://localhost:8080/v3/api-docs.yaml -o /tmp/cloudcampus-openapi.yaml
openapi-generator-cli generate \
  -i /tmp/cloudcampus-openapi.yaml \
  -g typescript-fetch \
  -o frontend/src/generated/cloudcampus-api
```

Suggested generators:

| Target | Generator |
| --- | --- |
| React / Next.js | `typescript-fetch` or `typescript-axios` |
| React Native | `typescript-fetch` |
| Android | `kotlin` |
| iOS | `swift5` |
| JVM services | `java` |

Client rules:

- Always attach `Authorization: Bearer <access-token>` after login or MFA verification.
- Use refresh tokens only with `/v1/auth/refresh`; do not expose them to analytics, logs, or crash reports.
- Treat `code` in error responses as the stable programmatic field.
- Treat `message` as user-displayable only when the product surface has no more specific localized copy.
- Do not send `X-Tenant-ID`, `X-School-ID`, or similar tenant/school context headers.
- Capture `X-Correlation-Id` from responses for support and troubleshooting.
- Regenerate clients whenever `docs/api/openapi.yaml` changes.

## Error Codes

All handled API errors use this shape:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "email must be a well-formed email address",
  "timestamp": "2026-06-11T10:15:30Z"
}
```

| HTTP status | Code | Meaning | Client behavior |
| --- | --- | --- | --- |
| 400 | `BAD_REQUEST` | Request syntax or domain input is invalid. | Show a correction message and keep user input. |
| 400 | `VALIDATION_FAILED` | Bean validation rejected at least one field. | Highlight the indicated field when possible. |
| 401 | `UNAUTHORIZED` | Missing, expired, revoked, or invalid bearer token. | Re-authenticate or refresh if allowed. |
| 403 | `FORBIDDEN` | The user is authenticated but lacks the role, permission, tenant, school, or object access. | Hide or disable the action after showing a concise denial. |
| 404 | `NOT_FOUND` | The resource does not exist or is not visible to the current user. | Show a not-found state. |
| 409 | `CONFLICT` | Request conflicts with current state, such as duplicates or invalid transitions. | Refresh state and ask the user to retry. |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded. | Back off and retry later. |

Notes:

- `timestamp` is generated by the backend and is intended for support correlation, not ordering.
- Future field-level validation details should remain backward compatible by adding fields rather than changing `code`, `message`, or `timestamp`.
- Security and object-authorization failures should not reveal cross-tenant resource details.

## Versioning

CloudCampus currently exposes versioned REST paths under `/v1`.

Backward-compatible changes may be made within `/v1`:

- Adding optional request fields.
- Adding response fields.
- Adding new endpoints.
- Adding enum values when clients are expected to treat unknown values defensively.
- Tightening documentation without changing behavior.

Breaking changes require a new API version or an explicitly coordinated migration:

- Removing or renaming fields.
- Changing field types or semantics.
- Making optional fields required.
- Removing enum values.
- Changing authentication, authorization, pagination, or idempotency semantics.
- Changing error `code` values for existing conditions.

Deprecation process:

1. Mark the endpoint or field as deprecated in OpenAPI.
2. Document the replacement and migration window.
3. Keep both old and new behavior available during the migration window.
4. Remove only after frontend/mobile clients and integrations have moved.

Every API change should update `docs/api/openapi.yaml` and relevant examples. CI runs the OpenAPI generation test to catch boot-time contract failures.
