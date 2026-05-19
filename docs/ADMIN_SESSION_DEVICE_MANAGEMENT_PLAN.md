# Admin Session and Device Management Plan

## Scope

This plan defines production-ready session and device management for CloudCampus
admin users, starting with Super Admin, Tenant Admin, and School Admin accounts.
It extends the existing authenticated device list and refresh-token revocation
work so administrators can see active devices, revoke sessions, enforce session
age limits, alert on suspicious devices, and recover from lost devices.

## Current State

Existing behavior:

- `POST /v1/auth/login` issues a JWT access token and opaque Redis-backed
  refresh token.
- Refresh tokens are stored as `rt:{uuid} -> userId` and indexed by
  `cc:rt:user:{userId}` for all-session revocation.
- `POST /v1/auth/revoke-all` deletes all refresh tokens for the current user and
  audits `AUTH_ALL_SESSIONS_REVOKED`.
- `POST /v1/auth/logout` deletes one refresh token and deny-lists the current
  access-token `jti`.
- `device_sessions` tracks user id, tenant id, device name, IP address,
  user-agent, created time, last-seen time, and revoked state.
- `GET /v1/auth/devices` lists active device sessions for the current user.
- `DELETE /v1/auth/devices/{id}` marks a device session revoked.
- The frontend change-password page already shows active devices and a
  "sign out from all devices" action.

Important gaps:

- Super Admin logins skip device-session creation because the Flyway table has
  `tenant_id NOT NULL`, while Super Admin users are tenantless.
- Device-session revocation only marks a database row revoked; it does not
  invalidate the refresh token for that device.
- Refresh tokens are not linked to device-session IDs.
- JWT access tokens do not contain a session id (`sid`), so request-time session
  checks cannot reject a revoked device immediately.
- `last_seen_at` is only initialized at login and is not updated on subsequent
  authenticated requests.
- Suspicious device detection is not implemented beyond the generic
  `SECURITY_SUSPICIOUS_ACCESS` audit action.

## Target Behavior

Admins must be able to:

1. See an active device list with device name, IP, approximate location,
   browser/app, created time, last seen time, session age, MFA state, and
   suspicious status.
2. Revoke one device and have its refresh token invalidated immediately.
3. Revoke all sessions after compromise, password change, MFA recovery, or lost
   device.
4. Understand session age and be forced through reauthentication or MFA step-up
   when a session is too old for sensitive actions.
5. Receive alerts for suspicious devices or impossible travel signals.
6. Complete a lost-device flow that removes the device, rotates credentials, and
   requires MFA or password recovery as appropriate.

## Data Model Changes

Modify `device_sessions` so it can represent tenantless Super Admin sessions and
link tokens to devices:

```sql
ALTER TABLE device_sessions
  ALTER COLUMN tenant_id DROP NOT NULL;

ALTER TABLE device_sessions
  ADD COLUMN refresh_token_id UUID,
  ADD COLUMN session_fingerprint VARCHAR(128),
  ADD COLUMN first_ip_address VARCHAR(45),
  ADD COLUMN last_ip_address VARCHAR(45),
  ADD COLUMN user_agent_hash VARCHAR(128),
  ADD COLUMN location_summary VARCHAR(160),
  ADD COLUMN mfa_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN suspicious_reason VARCHAR(255),
  ADD COLUMN expires_at TIMESTAMPTZ,
  ADD COLUMN revoked_reason VARCHAR(80),
  ADD COLUMN revoked_by UUID;

CREATE INDEX IF NOT EXISTS idx_device_sessions_user_active
  ON device_sessions (user_id, revoked, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_sessions_refresh_token
  ON device_sessions (refresh_token_id);
```

The refresh token value itself must never be stored in Postgres. Store only the
refresh-token UUID or a one-way hash/fingerprint that can be matched during
refresh and revocation.

## Token and Session Linkage

Change login and refresh flows:

1. Login creates or updates a `device_sessions` row for every role, including
   Super Admin.
2. Login issues a refresh token linked to `device_session.id`.
3. Redis refresh-token value stores both user id and session id, for example
   JSON `{ "userId": "...", "sessionId": "..." }`.
4. Access tokens include `sid` with the device-session id.
5. Refresh validates that the linked device session exists, belongs to the user,
   is not revoked, and is not expired.
6. Refresh rotation updates the new token id on the device-session row.
7. Logout revokes only the submitted refresh token and may mark the session
   revoked when the logout is explicit for the current device.

This closes the current gap where deleting a device row does not stop refresh.

## Device List

Expose device list data through the current self-service endpoint and a new
admin endpoint:

| Endpoint | Role | Purpose |
|---|---|---|
| `GET /v1/auth/devices` | Any authenticated user | List current user's active devices. |
| `DELETE /v1/auth/devices/{id}` | Any authenticated user | Revoke current user's selected device. |
| `POST /v1/auth/revoke-all` | Any authenticated user | Revoke all current-user refresh tokens. |
| `GET /v1/admin/users/{userId}/devices` | Tenant Admin or School Admin by scope | Support-managed list for a tenant/school user. |
| `GET /v1/super-admin/users/{userId}/devices` | Super Admin | Cross-tenant support/security device list. |
| `DELETE /v1/super-admin/users/{userId}/devices/{id}` | Super Admin | Security revoke for any user device. |

Recommended response fields:

```json
{
  "id": "uuid",
  "deviceName": "Chrome on macOS",
  "ipAddress": "203.0.113.10",
  "locationSummary": "Delhi, IN",
  "createdAt": "2026-05-19T08:00:00Z",
  "lastSeenAt": "2026-05-19T09:15:00Z",
  "expiresAt": "2026-06-18T08:00:00Z",
  "sessionAgeSeconds": 4500,
  "mfaVerified": true,
  "currentDevice": false,
  "suspicious": false,
  "suspiciousReason": null
}
```

The UI should label IP-based locations as approximate and should not expose raw
user-agent strings to normal users.

## Revocation Semantics

Single-device revoke must:

1. Verify the caller can manage the target device.
2. Mark `device_sessions.revoked=true`, set `revoked_at`, `revoked_by`, and
   `revoked_reason`.
3. Delete the linked Redis refresh token key.
4. Remove the refresh token from `cc:rt:user:{userId}`.
5. Prevent future refresh attempts for that session.
6. Optionally deny-list the current request access-token `jti` when the user
   revokes their current device.
7. Audit the action with actor, target user, device id, reason, and IP address.

All-session revoke must:

- Delete every active refresh token for the user.
- Mark every active device session revoked.
- Deny-list the current access token when the current actor is the target user.
- Preserve existing `AUTH_ALL_SESSIONS_REVOKED` audit behavior and add device
  count metadata.

Access tokens already expire quickly, so revocation does not need to look up and
deny-list every historical access-token `jti`. Sensitive admin actions should
still require fresh session age and step-up checks.

## Session Age Rules

Recommended policy:

| Session type | Maximum age | Behavior |
|---|---:|---|
| Super Admin normal session | 12 hours | Refresh denied after max age; login required. |
| Tenant Admin normal session | 24 hours | Refresh denied after max age; login required. |
| School Admin normal session | 24 hours | Refresh denied after max age; login required. |
| Sensitive action step-up | 10 minutes | Requires password or MFA step-up before action. |
| Idle session | 8 hours | Client signs out after no activity; backend refresh denied after idle TTL if tracked. |
| Lost-device recovery session | 15 minutes | Only permits password reset or MFA recovery completion. |

Track both absolute age (`created_at`) and activity age (`last_seen_at`). Update
`last_seen_at` on refresh and at most once every five minutes during
authenticated requests to avoid write amplification.

## Suspicious Device Alerts

Flag and audit suspicious sessions when any of the following occur:

- New device for an admin user.
- New country or impossible travel from the previous admin session.
- User-agent hash changes for an existing session fingerprint.
- Multiple failed login or MFA attempts followed by a successful login.
- Refresh token reuse after rotation, which suggests token theft.
- Login from blocked ASN, anonymous proxy, or high-risk IP feed if enabled.
- Device revocation followed by a refresh attempt from the revoked session.

Alert actions:

- Write `SECURITY_SUSPICIOUS_ACCESS` audit event.
- Send email or in-app notification to the affected admin.
- For Super Admin, notify security owners or configured break-glass contacts.
- Require step-up immediately for suspicious but not blocked sessions.
- Block refresh for high-confidence token reuse or revoked-device attempts.

Do not block purely on location lookup failure. Location services are advisory
and can be inaccurate.

## Lost-Device Flow

Self-service lost-device flow:

1. User selects "I lost a device" from account security.
2. User completes MFA or password reauthentication on the current device.
3. UI shows active devices with last seen, approximate location, and session age.
4. User revokes the lost device or chooses "sign out from all devices".
5. Backend invalidates linked refresh tokens and marks device sessions revoked.
6. If the lost device had MFA authenticator access, route the user to the MFA
   recovery or backup-code rotation flow from `docs/SUPER_ADMIN_MFA_DESIGN.md`.
7. Send confirmation and audit the recovery path.

Admin-assisted flow:

1. Support/admin verifies the identity of the affected admin.
2. Authorized admin opens the target user's device list.
3. Authorized admin revokes the device or all sessions with a required reason.
4. For Super Admin targets, require step-up and two-person approval when MFA
   factors are affected.
5. Force password reset or MFA reenrollment if compromise is suspected.

## Audit Events

Add audit action candidates:

- `AUTH_DEVICE_SESSION_CREATED`
- `AUTH_DEVICE_SESSION_REFRESHED`
- `AUTH_DEVICE_SESSION_REVOKED`
- `AUTH_DEVICE_SESSION_REVOKE_FAILED`
- `AUTH_DEVICE_SESSION_EXPIRED`
- `AUTH_ALL_SESSIONS_REVOKED`
- `SECURITY_NEW_ADMIN_DEVICE`
- `SECURITY_SUSPICIOUS_ACCESS`
- `SECURITY_REFRESH_TOKEN_REUSE`
- `SECURITY_LOST_DEVICE_REPORTED`

Audit metadata should include actor id, target user id, device-session id,
tenant id, role, action reason, IP address, user-agent hash, approximate
location, revoked refresh-token count, and correlation id. Do not store raw
refresh tokens or full user-agent strings in audit metadata.

## Frontend Plan

Move the current device controls out of the change-password page into a dedicated
account security surface:

- `/account/security` for all authenticated users.
- `/super-admin/security/devices` or user detail tabs for Super Admin support.
- Show active devices, current device, last seen, created date, approximate
  location, session age, and suspicious badges.
- Use a confirmation dialog for single-device revoke.
- Use a stronger confirmation for sign-out-all because it ends the current
  session.
- Offer "lost device" as a guided flow instead of only a destructive button.
- If backend returns `SESSION_REVOKED`, `SESSION_EXPIRED`, or
  `STEP_UP_REQUIRED`, redirect or open the appropriate auth flow.

## Implementation Sequence

1. Update the `device_sessions` schema to allow tenantless Super Admin sessions
   and add token/session linkage columns.
2. Change refresh-token Redis values to include session id while keeping backward
   compatibility for existing `rt:{uuid} -> userId` entries during rollout.
3. Add `sid` to JWT access tokens.
4. Create device sessions for Super Admin login.
5. Link device revocation to refresh-token deletion.
6. Update refresh to reject revoked or expired sessions.
7. Update `last_seen_at` during refresh and throttled authenticated requests.
8. Add suspicious-device detection and audit events.
9. Move frontend device management into account security.
10. Add Super Admin and scoped admin support endpoints.

## Test Coverage

Backend tests:

- Super Admin login creates a tenantless device session.
- Login links refresh token to device-session id.
- Refresh fails when the linked device session is revoked.
- Single-device revoke deletes the linked refresh token and keeps other devices
  active.
- All-session revoke deletes all refresh tokens and marks active device sessions
  revoked.
- Session age expiry blocks refresh after the configured maximum age.
- Suspicious new admin device writes audit and notification events.
- Lost-device flow requires reauthentication and records reason metadata.

Frontend tests:

- Device list renders current device, last seen, session age, and suspicious
  state.
- Single-device revoke refreshes the device list.
- Sign-out-all clears auth state and redirects to login.
- Lost-device flow routes to MFA recovery or backup-code rotation when needed.
