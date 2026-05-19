# Super Admin MFA Design

## Scope

This design adds mandatory multi-factor authentication (MFA) for CloudCampus
Super Admin accounts. Super Admin users are tenantless (`tenant_id` is null) and
can operate across tenants, billing, AI settings, public website publishing, and
investor/content controls, so their MFA state must be user-scoped rather than
tenant-scoped.

Initial implementation should support TOTP and one-time backup codes. WebAuthn
can be added later without changing the login contract again.

## Current Auth Context

- `POST /v1/auth/login` currently verifies username/password and immediately
  returns a full `LoginResponse` with access and refresh tokens.
- Access tokens currently contain `sub`, `tenant_id`, `school_id`, `role`, and
  `jti`; Super Admin access tokens omit `tenant_id`.
- Refresh tokens are opaque UUIDs stored in Redis and indexed by user for
  `revokeAllSessions`.
- Device sessions are currently tenant-bound, so Super Admin login skips device
  session creation.
- Audit logging already records login, logout, token refresh, password change,
  account lock, and all-session revocation events. `SECURITY_MFA_ENROLLED`
  already exists as an audit action seed.

## Login Contract

Super Admin login must become a two-step exchange:

1. Password is verified.
2. If Super Admin MFA is required, the server returns an MFA challenge response
   instead of access and refresh tokens.
3. The user verifies TOTP or a backup code.
4. Only after successful verification does the server issue access and refresh
   tokens.

Recommended response shape for password success requiring MFA:

```json
{
  "mfaRequired": true,
  "challengeId": "uuid",
  "availableMethods": ["TOTP", "BACKUP_CODE"],
  "expiresInSeconds": 300
}
```

The challenge should be stored in Redis as `mfa:challenge:{challengeId}` with a
five-minute TTL, bound to user id, IP hash, user-agent hash, and the credential
verification timestamp. Reusing or verifying an expired challenge must fail.

For non-Super Admin roles, the current login response can remain unchanged until
tenant-admin MFA is introduced.

## Token Claims

Access tokens issued after MFA verification should include:

- `mfa_verified`: `true`
- `amr`: authentication methods used, for example `["pwd", "otp"]`
- `auth_time`: epoch seconds when the password step completed
- `mfa_time`: epoch seconds when the second factor completed

Refresh tokens should only be issued after MFA success. A refreshed Super Admin
access token may keep `mfa_verified=true` for normal navigation, but sensitive
operations still require step-up when `mfa_time` is older than the configured
step-up window.

## Data Model

Add Flyway migrations for user-scoped MFA storage:

```sql
CREATE TABLE user_security_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  mfa_required BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_enforced_at TIMESTAMPTZ,
  recovery_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_mfa_factors (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  factor_type VARCHAR(32) NOT NULL,
  label VARCHAR(120) NOT NULL,
  secret_ciphertext TEXT,
  credential_json JSONB,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_mfa_backup_codes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

TOTP secrets must be encrypted at rest using the application secret management
standard. Backup codes must be generated with high-entropy random bytes, shown
once, stored only as salted password-style hashes, and invalidated after use.

## Enrollment

Enrollment is only complete after the user proves possession of the factor.

1. Require a fresh password check or recent step-up before enrollment changes.
2. Generate a TOTP secret and QR provisioning URI.
3. Store the factor as disabled until the first valid TOTP code is submitted.
4. Enable the factor, set `verified_at`, generate backup codes, and show backup
   codes once.
5. Set `mfa_required=true` for all Super Admin users during enforcement rollout.
6. Revoke existing Super Admin refresh tokens when MFA is first enabled.

The system must not allow the last enabled Super Admin MFA factor to be removed
while MFA enforcement is active unless a recovery flow is already approved.

## Backup Codes

Backup code rules:

- Generate 10 one-time codes per rotation.
- Display codes only at generation time.
- Hash and salt each code independently.
- Accept a backup code only for an active MFA challenge or step-up challenge.
- Mark the code used atomically.
- Notify and audit on every backup-code use.
- Prompt rotation when fewer than three unused codes remain.

Backup code use should grant the same MFA state as TOTP for that session, but
the event is higher risk and should be visible in audit and security alerts.

## Recovery

Recovery is for lost devices and exhausted backup codes.

Recovery must be deliberately slower than normal MFA:

1. User starts recovery from the MFA challenge screen.
2. System records a recovery request and notifies security owners.
3. A separate active Super Admin approves recovery after identity verification.
4. Approval creates a short-lived recovery token, revokes all sessions for the
   locked-out user, and sets `recovery_required=true`.
5. The user signs in with password plus recovery token, then must enroll a new
   factor and rotate backup codes before receiving a normal session.

Break-glass recovery must require two-person control when there is more than one
Super Admin account. If only one Super Admin exists, require an offline
production runbook approval and retain the evidence link in audit metadata.

## Step-Up Authentication

Step-up auth protects sensitive Super Admin operations even after login.

Require recent MFA, for example within the last 10 minutes, for:

- Tenant create, suspend, archive, subscription, and domain changes.
- AI budget and prompt activation changes.
- Public website publish and rollback.
- Investor room publish, asset policy changes, and original download enabling.
- Role, school-access, and user-security changes.
- MFA enrollment, backup-code rotation, recovery approval, and factor removal.
- Audit export, data export, and support impersonation if introduced later.
- `revokeAllSessions` for users other than the current actor.

Implementation option:

- Add an annotation such as `@RequiresStepUp`.
- Enforce it in a Spring interceptor or AOP aspect by reading JWT `mfa_time`.
- If step-up is missing or stale, return `403` with `STEP_UP_REQUIRED`.
- Frontend opens a step-up modal and calls `POST /v1/auth/mfa/step-up`.
- Successful step-up returns a new access token with a fresh `mfa_time`; refresh
  token rotation is not required for step-up.

## API Surface

Recommended endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /v1/auth/mfa/enroll/totp/start` | Begin TOTP enrollment after password or step-up proof. |
| `POST /v1/auth/mfa/enroll/totp/verify` | Verify first TOTP code, enable factor, generate backup codes. |
| `POST /v1/auth/mfa/challenge/verify` | Complete login challenge with TOTP or backup code. |
| `POST /v1/auth/mfa/step-up` | Refresh `mfa_time` for sensitive actions. |
| `POST /v1/auth/mfa/backup-codes/rotate` | Revoke unused backup codes and issue replacements. |
| `GET /v1/auth/mfa/status` | Show enabled factors, backup-code count, and recovery requirement. |
| `DELETE /v1/auth/mfa/factors/{factorId}` | Remove a factor only when policy allows it. |
| `POST /v1/super-admin/users/{userId}/mfa/recovery/start` | Start assisted recovery. |
| `POST /v1/super-admin/users/{userId}/mfa/recovery/approve` | Approve recovery using two-person control. |
| `POST /v1/auth/mfa/recovery/complete` | Complete recovery and force new enrollment. |

## Frontend Flow

Login UI changes:

- Detect `mfaRequired=true` response from `loginApi`.
- Keep username/password out of persistent storage.
- Render a TOTP screen with backup-code fallback.
- Do not call `setTokens` until MFA verification returns full tokens.
- Preserve the original post-login destination after MFA success.

Super Admin account security UI:

- Show MFA status, enrolled factors, backup-code count, and last used time.
- Provide enrollment, backup-code rotation, and factor removal flows.
- Require step-up before any MFA settings change.
- Surface recovery-required state before allowing normal Super Admin navigation.

Sensitive Super Admin actions should handle `STEP_UP_REQUIRED` by showing a
modal, submitting the TOTP or backup code, replacing the access token, and then
retrying the original action once.

## Audit Events

Extend `AuditAction` and `AuditLogService` with events for:

- `SECURITY_MFA_CHALLENGE_ISSUED`
- `SECURITY_MFA_CHALLENGE_VERIFIED`
- `SECURITY_MFA_CHALLENGE_FAILED`
- `SECURITY_MFA_ENROLLED`
- `SECURITY_MFA_FACTOR_REMOVED`
- `SECURITY_MFA_BACKUP_CODES_ROTATED`
- `SECURITY_MFA_BACKUP_CODE_USED`
- `SECURITY_MFA_RECOVERY_REQUESTED`
- `SECURITY_MFA_RECOVERY_APPROVED`
- `SECURITY_MFA_RECOVERY_COMPLETED`
- `SECURITY_STEP_UP_REQUIRED`
- `SECURITY_STEP_UP_VERIFIED`
- `SECURITY_STEP_UP_FAILED`

Audit metadata should include actor id, target user id where applicable,
challenge id, factor type, IP, user-agent hash, result, failure reason, and
session revocation count. Do not log TOTP codes, backup codes, shared secrets,
or raw user-agent strings if the audit store is broadly accessible.

## Abuse Controls

- Apply the existing login rate limiter before password verification.
- Add a separate MFA challenge rate limiter keyed by user id, challenge id, and
  IP hash.
- Lock or cool down the challenge after five failed factor attempts.
- Invalidate all outstanding MFA challenges on password change, MFA enrollment,
  recovery approval, or all-session revocation.
- Send security notifications for backup-code use, recovery activity, factor
  removal, and repeated failed MFA attempts.

## Rollout Plan

1. Add schema, service, audit actions, and backend tests with MFA disabled.
2. Enable optional enrollment for Super Admin accounts in staging.
3. Enforce MFA for all Super Admin login in staging and update smoke tests.
4. Roll out production enforcement with at least two enrolled Super Admins.
5. Revoke existing Super Admin refresh tokens at enforcement time.
6. Add WebAuthn as an additional factor after TOTP is stable.

## Test Coverage

Backend tests:

- Super Admin password success returns MFA challenge and no tokens.
- Non-Super Admin login still returns the existing `LoginResponse`.
- Valid TOTP challenge returns access and refresh tokens with MFA claims.
- Invalid or expired challenges fail without issuing tokens.
- Backup code succeeds once and cannot be reused.
- Step-up rejects stale `mfa_time` and accepts a verified challenge.
- Recovery revokes sessions, requires reenrollment, and audits all state changes.

Frontend tests:

- Login handles MFA challenge before storing tokens.
- Backup-code fallback is available from the challenge screen.
- Step-up modal retries the original Super Admin action after success.
- MFA settings page blocks factor removal when it would violate enforcement.
