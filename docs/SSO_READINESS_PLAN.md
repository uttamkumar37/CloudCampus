# SSO Readiness Plan

## Scope

This plan prepares CloudCampus for enterprise single sign-on and lifecycle
management across OIDC, SAML, just-in-time provisioning, SCIM, domain
verification, and role mapping.

The first implementation target should be tenant-scoped SSO for school chains
and enterprise customers. Super Admin login should remain local username,
password, and MFA until a separate platform-operator identity provider is
designed.

## Current Auth Context

Current behavior:

- `POST /v1/auth/login` verifies a global `users.username` and password hash.
- `users.username` is globally unique and normally stores an email-like login
  identifier.
- `tenant_id` is null only for `SUPER_ADMIN`; every tenant-scoped role has a
  non-null tenant id.
- JWTs carry `sub`, `tenant_id`, `school_id`, `role`, and `jti`.
- `SCHOOL_ADMIN` JWTs include the primary school from `user_school_access`.
- Tenant routing uses `tenants.code`, `tenant_id`, and custom domain support.
- Custom domain verification already uses DNS TXT tokens; SSO domain
  verification can reuse the same operational pattern with a separate table.

Important readiness gaps:

- There is no identity-provider configuration model.
- There is no external identity link table for `(provider, subject) -> user`.
- There is no SSO callback/session endpoint or SAML assertion consumer service.
- There is no verified login-domain ownership model for tenant SSO.
- There is no JIT provisioning policy or SCIM lifecycle endpoint.
- Current single-role users require explicit mapping rules for IdP groups and
  school grants.

## Target Capabilities

CloudCampus should support:

- OIDC login with authorization-code + PKCE.
- SAML 2.0 SP login with signed assertions.
- Tenant-owned domain verification before enabling SSO.
- JIT provisioning for approved domains and IdP mappings.
- SCIM 2.0 users and groups for enterprise lifecycle management.
- Deterministic role mapping from IdP claims or SCIM groups to CloudCampus
  roles.
- School-access mapping for school-scoped admins.
- Audit events for SSO login, provisioning, deprovisioning, and mapping changes.

## Domain Verification

SSO must only be enabled for a tenant after the tenant proves control of each
email domain it wants to use for login routing.

Recommended verification flow:

1. Tenant Admin or Super Admin registers `example.edu` as an SSO login domain.
2. Backend creates a verification token such as
   `cc-sso-verify-{random-24-byte-token}`.
3. Customer publishes DNS TXT record:
   `_cloudcampus-sso.example.edu TXT cc-sso-verify-...`
4. Backend verifies the TXT record and marks the domain `VERIFIED`.
5. SSO routing can then match `user@example.edu` to the tenant.

Do not reuse public website custom-domain rows for SSO. Public website domains
prove routing ownership, while SSO domains prove email identity ownership and
should have separate policy, status, audit events, and deletion rules.

## Data Model

Add tenant-scoped identity provider configuration:

```sql
CREATE TABLE tenant_sso_domains (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  verification_token VARCHAR(120) NOT NULL,
  status VARCHAR(32) NOT NULL,
  verified_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, domain)
);

CREATE TABLE tenant_identity_providers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type VARCHAR(32) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  enforce_sso BOOLEAN NOT NULL DEFAULT FALSE,
  jit_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  issuer VARCHAR(500),
  client_id VARCHAR(255),
  client_secret_ciphertext TEXT,
  authorization_endpoint VARCHAR(500),
  token_endpoint VARCHAR(500),
  jwks_uri VARCHAR(500),
  saml_entity_id VARCHAR(500),
  saml_sso_url VARCHAR(500),
  saml_x509_certificate TEXT,
  metadata_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE external_identities (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  identity_provider_id UUID NOT NULL REFERENCES tenant_identity_providers(id) ON DELETE CASCADE,
  external_subject VARCHAR(500) NOT NULL,
  email VARCHAR(255) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (identity_provider_id, external_subject),
  UNIQUE (tenant_id, email)
);

CREATE TABLE tenant_sso_role_mappings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  identity_provider_id UUID NOT NULL REFERENCES tenant_identity_providers(id) ON DELETE CASCADE,
  source_type VARCHAR(32) NOT NULL,
  source_value VARCHAR(255) NOT NULL,
  target_role VARCHAR(50) NOT NULL,
  school_code VARCHAR(64),
  is_primary_school BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (identity_provider_id, source_type, source_value, target_role, school_code)
);

CREATE TABLE scim_clients (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  display_name VARCHAR(160) NOT NULL,
  token_hash TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Provider secrets and SCIM bearer tokens must never be stored in plaintext.

## OIDC Readiness

OIDC implementation requirements:

- Use authorization-code flow with PKCE.
- Validate issuer, audience, nonce, state, expiry, and signature against JWKS.
- Prefer `sub` as the stable external identifier; never use email alone as the
  external identity key.
- Require `email_verified=true` for JIT provisioning unless the provider is
  explicitly trusted by contract.
- Store provider metadata per tenant and cache JWKS with rotation support.
- Support IdP-initiated routing only after tenant/domain resolution is known.
- Return the normal CloudCampus JWT pair only after SSO validation and optional
  MFA/step-up policy are complete.

Recommended endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /v1/auth/sso/start?tenantCode=&email=` | Resolve tenant/provider and redirect to OIDC or SAML. |
| `GET /v1/auth/sso/oidc/callback` | Validate OIDC response, link/provision user, issue tokens. |
| `POST /v1/auth/sso/logout` | Optional app logout and IdP logout redirect support. |

## SAML Readiness

SAML implementation requirements:

- Support tenant-specific SP entity ID and ACS URL.
- Require signed assertions; prefer signed responses as well.
- Validate audience, recipient, destination, issue instant, assertion validity
  window, and replayed assertion IDs.
- Store IdP certificate and metadata per tenant.
- Support metadata URL refresh with certificate rollover.
- Map `NameID` or configured attribute to external subject.
- Map email, groups, and school attributes through tenant-level rules.

Recommended endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /v1/auth/sso/saml/metadata/{tenantCode}` | Tenant-specific SP metadata. |
| `POST /v1/auth/sso/saml/acs/{providerId}` | Assertion consumer service. |
| `GET /v1/auth/sso/saml/start/{providerId}` | SP-initiated SAML login. |

## JIT Provisioning

JIT provisioning should be tenant-controlled and disabled by default.

Provision only when:

- The identity provider is enabled.
- The user email domain is verified for the tenant.
- The assertion or ID token has a stable subject.
- Email is verified or the provider is contractually trusted.
- A role mapping resolves to exactly one CloudCampus role.
- Required school mapping exists for school-scoped roles.

User creation rules:

- `tenant_id` is the tenant resolved from the verified domain or provider.
- `username` should remain globally unique. Recommended value is normalized
  email when available; if collisions are possible, block JIT and require admin
  resolution rather than creating ambiguous accounts.
- Local password should be a random unusable value for SSO-only accounts.
- `force_password_change=false` for SSO-only users.
- `status=ACTIVE` unless SCIM pre-provisioned the user in another state.
- Create `external_identities` link in the same transaction as user creation.
- Create `user_school_access` grants when mapping includes school codes.

Existing local users can be linked only after a verified email match within the
same tenant and an admin-approved linking policy.

## SCIM Readiness

SCIM should handle planned lifecycle operations before users sign in.

Minimum supported SCIM 2.0 endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /v1/scim/v2/{tenantCode}/ServiceProviderConfig` | Advertise supported features. |
| `GET /v1/scim/v2/{tenantCode}/Schemas` | Return User and Group schemas. |
| `GET /v1/scim/v2/{tenantCode}/Users` | List/filter users by `userName` or `externalId`. |
| `POST /v1/scim/v2/{tenantCode}/Users` | Create or link a tenant user. |
| `GET /v1/scim/v2/{tenantCode}/Users/{id}` | Read a user. |
| `PATCH /v1/scim/v2/{tenantCode}/Users/{id}` | Activate/deactivate and update attributes. |
| `DELETE /v1/scim/v2/{tenantCode}/Users/{id}` | Deactivate, not hard-delete. |
| `GET/POST/PATCH/DELETE /v1/scim/v2/{tenantCode}/Groups` | Manage group-to-role mappings. |

SCIM deactivation should set `users.status=SUSPENDED`, revoke all sessions, and
audit the change. Hard deletion remains governed by retention policy.

SCIM group membership should map to CloudCampus roles and optionally school
access. Conflicting group membership must fail closed and surface in the SCIM
response with actionable error detail.

## Role Mapping

CloudCampus currently has one role per user:

- `TENANT_ADMIN`
- `SCHOOL_ADMIN`
- `TEACHER`
- `STAFF`
- `PARENT`
- `STUDENT`

Initial SSO role mapping should avoid `SUPER_ADMIN`.

Recommended mapping sources:

- OIDC `groups`
- OIDC custom role claim
- SAML group attribute
- SAML role attribute
- SCIM group display name

Mapping rules:

- Every mapped login must resolve to exactly one CloudCampus role.
- `TENANT_ADMIN` cannot be assigned by JIT unless the tenant explicitly allows
  tenant-admin JIT.
- `SCHOOL_ADMIN`, `TEACHER`, and `STAFF` should map to one or more school codes
  and one primary school.
- `PARENT` and `STUDENT` SSO should wait until student/guardian identity
  matching rules are designed; do not JIT these roles from generic group claims.
- Unknown or conflicting groups should deny login and audit a mapping failure.
- Role mapping changes should not silently downgrade active sessions; revoke
  sessions after material role changes.

## Login Routing

Recommended routing order:

1. User enters email on `/login` or `/sso`.
2. Backend extracts email domain.
3. Domain must match one verified `tenant_sso_domains` row.
4. If exactly one enabled provider exists, redirect to that provider.
5. If multiple providers exist, return provider choices.
6. If no verified SSO route exists, fall back to local login unless tenant policy
   requires SSO.

For tenants with `enforce_sso=true`, local password login should be blocked for
tenant-scoped users except explicit break-glass accounts.

## Admin Configuration UI

Super Admin and Tenant Admin surfaces should provide:

- SSO domain registration and DNS TXT verification status.
- OIDC provider setup with issuer discovery, client id, client secret, and test
  login.
- SAML provider setup with metadata upload/URL, certificate display, and SP
  metadata download.
- JIT provisioning toggle and constraints.
- Role/group mapping table with school-code mapping.
- SCIM token creation, rotation, disablement, and last-used display.
- SSO enforcement toggle with break-glass-account warning.
- Audit log view filtered to SSO and SCIM events.

## Audit Events

Add audit action candidates:

- `SECURITY_SSO_DOMAIN_REGISTERED`
- `SECURITY_SSO_DOMAIN_VERIFIED`
- `SECURITY_IDP_CREATED`
- `SECURITY_IDP_UPDATED`
- `SECURITY_IDP_ENABLED`
- `SECURITY_IDP_DISABLED`
- `AUTH_SSO_LOGIN_SUCCESS`
- `AUTH_SSO_LOGIN_FAILED`
- `AUTH_SSO_USER_LINKED`
- `AUTH_SSO_USER_PROVISIONED`
- `AUTH_SSO_ROLE_MAPPING_FAILED`
- `AUTH_SCIM_USER_CREATED`
- `AUTH_SCIM_USER_UPDATED`
- `AUTH_SCIM_USER_DEACTIVATED`
- `AUTH_SCIM_GROUP_UPDATED`

Metadata should include tenant id, provider id, provider type, external subject
hash, target user id, role, school codes, domain, and correlation id. Do not log
SAML assertions, OIDC tokens, SCIM bearer tokens, client secrets, or raw
certificates in audit metadata.

## Security Controls

- Require HTTPS redirect URIs only outside local development.
- Use exact redirect URI allow-lists.
- Validate OIDC state and nonce with short-lived Redis records.
- Store SAML assertion IDs in Redis until expiry to prevent replay.
- Rate-limit SSO start and callback failures.
- Require step-up auth before changing SSO, SCIM, or role-mapping settings.
- Revoke sessions after IdP disablement, enforced-role change, SCIM deactivate,
  or domain unverification.
- Keep local break-glass accounts outside SSO enforcement and require MFA.

## Rollout Sequence

1. Add domain, IdP, external identity, role mapping, and SCIM client tables.
2. Build domain verification using the existing DNS TXT verification pattern.
3. Add OIDC SP-initiated login for one tenant in staging.
4. Add SAML SP-initiated login after OIDC token lifecycle is stable.
5. Add JIT provisioning with conservative role mappings.
6. Add SCIM users and deactivation before enabling tenant SSO enforcement.
7. Add SCIM groups and school-code mapping.
8. Enable production pilot for one tenant with break-glass accounts verified.
9. Add enforcement controls and customer-facing setup documentation.

## Test Coverage

Backend tests:

- Verified SSO domain can resolve a tenant; unverified domain cannot.
- OIDC callback validates issuer, audience, nonce, state, expiry, and signature.
- SAML ACS rejects unsigned, expired, wrong-audience, and replayed assertions.
- Existing user link requires same tenant and verified email.
- JIT creates tenant user, external identity link, role, and school access in one
  transaction.
- Conflicting role mappings deny login and audit failure.
- SCIM deactivate suspends user and revokes sessions.
- SSO-enforced tenant blocks password login for non-break-glass users.

Frontend tests:

- Login email discovery routes verified-domain users to SSO.
- Local login remains available when no SSO route exists.
- SSO settings page validates required OIDC/SAML fields.
- Role mapping UI prevents conflicting mappings.
- SCIM token rotation hides the token after first display.
