# Push Notification Production Checklist

Last updated: 2026-05-19

## Purpose

This checklist defines the production readiness gate for CloudCampus push notifications across mobile devices, backend dispatch, FCM/APNs credentials, consent, delivery monitoring, retries, token rotation, and opt-out.

Run it before enabling push in production, rotating Firebase/APNs credentials, changing notification payload routing, adding a new notification type, or launching a bulk notification workflow.

## Current Push Baseline

| Area | Current behavior |
|---|---|
| Mobile registration | `usePushRegistration` requests OS permission after login and registers native FCM/APNs token plus optional Expo push token. |
| Token rotation | Expo Notifications `addPushTokenListener` re-registers rotated OS tokens. |
| Backend registration | `POST /v1/devices/register` upserts device tokens for the authenticated user. |
| Device storage | `device_tokens` stores tenant ID, user ID, push token, platform, optional Expo token, fingerprint, and timestamps. |
| Dispatch | `PushServiceImpl` fans out one Firebase message per registered device token. |
| Invalid token handling | Firebase `UNREGISTERED` and `INVALID_ARGUMENT` responses prune stale tokens. |
| Logging | Push attempts write `NotificationLog` rows as `SENT` or `FAILED`. |
| Safe routing | Mobile notification tap routing uses an exact-match route allowlist. |
| Firebase config | Backend starts with Firebase disabled unless `APP_FIREBASE_ENABLED=true` and credentials are mounted. |

## Gate 1: Credentials

| Check | Pass condition |
|---|---|
| Firebase project | Production Firebase project is separate from staging/dev. |
| Service account | Production service-account JSON is stored in secret manager or Kubernetes secret, never in git. |
| Backend config | `APP_FIREBASE_ENABLED=true`, `APP_FIREBASE_CREDENTIALS_PATH`, and optional `APP_FIREBASE_PROJECT_ID` are set in production only. |
| Android FCM | Android package ID matches Firebase app and Google services configuration. |
| iOS APNs | APNs key/certificate is uploaded to Firebase and matches the production bundle ID. |
| Credential owner | Rotation owner and emergency revoke procedure are documented. |
| Expiry review | APNs certificates/keys and Firebase service accounts are reviewed before release. |

## Gate 2: Mobile Permission and Consent

| Check | Pass condition |
|---|---|
| Prompt timing | Permission prompt appears after login or a clear user action, not on cold anonymous launch. |
| Denied permission | Denial does not block app navigation or core workflows. |
| Opt-out | Users can disable push in app settings or OS settings without repeated prompts. |
| Consent scope | Marketing/promotional push requires explicit opt-in; operational/school push follows product policy and local law. |
| Re-prompt policy | App does not repeatedly ask after denial; it directs users to OS settings when needed. |
| Privacy text | Store privacy/data-safety forms disclose push token collection and notification purpose. |

## Gate 3: Token Lifecycle

| Check | Pass condition |
|---|---|
| Login registration | Token is registered after successful login with authenticated user ID from JWT, never request body. |
| Rotation | OS token rotation re-registers the new token. |
| Multi-device | A user can have multiple active device tokens. |
| Tenant scoping | Token lookup and dispatch include tenant ID and target user. |
| Logout future | Token deletion or disablement on logout is planned or intentionally handled by OS permission and server pruning. |
| Invalid token pruning | Firebase invalid/unregistered token responses remove stale rows. |
| Token secrecy | Raw push tokens never appear in UI, broad exports, support screenshots, or normal logs. |

## Gate 4: Payload Safety

| Check | Pass condition |
|---|---|
| Allowed types | Notification types are enumerated and documented. |
| Route allowlist | `targetRoute` is exact-match allowlisted on mobile before navigation. |
| Tenant context | Payload includes tenant/school context only when required and never trusts client-provided scope for authorization. |
| PII minimization | Title/body avoid sensitive student/financial/medical details unless product policy allows it. |
| Data payload | FCM data values are strings and bounded in size. |
| Silent sync | Silent sync payloads are limited to supported types and do not execute arbitrary routes. |
| Localization future | Message templates support locale without leaking one tenant's data to another. |

## Gate 5: Backend Dispatch

| Check | Pass condition |
|---|---|
| Firebase enabled | Production environment has Firebase Admin enabled and startup logs confirm initialization. |
| Async dispatch | API returns accepted quickly and work runs on the notification executor. |
| Per-token logging | Each device token attempt produces a notification log outcome. |
| Failure handling | Firebase failures are logged with safe error descriptions. |
| Invalid token cleanup | `UNREGISTERED` and `INVALID_ARGUMENT` prune the device token. |
| Tenant isolation | School admins can only send push within authorized school/tenant scope. |
| Rate limiting | Manual send endpoints are protected by auth, role checks, and operational rate limits. |
| Bulk sends future | Bulk workflows use queueing, batching, and backpressure rather than unbounded fan-out. |

## Gate 6: Delivery Monitoring

| Signal | Required evidence |
|---|---|
| Registration rate | Count of active tokens by tenant, school, platform, and recent update window. |
| Send attempts | Count by tenant, school, notification type, and platform. |
| Success/failure | `NotificationLog` success/failure rates and failure reasons. |
| Invalid tokens | Pruned token count and trend. |
| Latency | Time from API accepted to Firebase send result. |
| Alerting | Alert on sudden failure spike, zero sends during expected campaign, or token registration drop. |
| Audit | Administrative sends include actor, school, target user, correlation ID, and timestamp. |

## Gate 7: Retry and Backoff

| Failure | Policy |
|---|---|
| Invalid/unregistered token | Do not retry; prune token. |
| Permission denied | Do not retry until token is re-registered. |
| Firebase transient error | Retry with bounded exponential backoff or dead-letter for manual review. |
| Backend outage | Queue notification job for retry if the initiating workflow requires guaranteed delivery. |
| Payload validation error | Do not retry until payload is fixed. |
| Bulk campaign failure | Pause campaign and require owner approval before replay. |

Retries must be idempotent. A replayed push job should not create duplicate notification logs unless it is explicitly a second delivery attempt with a linked retry number.

## Gate 8: Opt-Out and Preference Management

| Preference | Requirement |
|---|---|
| Operational alerts | Enabled according to school policy; user can use OS settings when app-level opt-out is not available. |
| Marketing messages | Requires explicit opt-in and easy opt-out. |
| Category preferences | Future settings should support attendance, fees, notices, exam results, homework, and marketing categories. |
| Tenant policy | Schools can disable optional push categories for their tenant. |
| Audit | Preference changes are timestamped and attributable. |

Until app-level preferences are implemented, production release notes must state which push categories are enabled and how users opt out through OS settings.

## Gate 9: Test Matrix

Run on physical devices:

| Test | iOS | Android |
|---|---|---|
| Fresh install permission prompt | Required | Required |
| Token registration after login | Required | Required |
| Permission denied path | Required | Required |
| Foreground notification display | Required | Required |
| Background notification tap | Required | Required |
| Killed-app notification tap | Required | Required |
| Safe route allowlist | Required | Required |
| Token rotation/re-register | Best effort or simulated | Best effort or simulated |
| Invalid token pruning | Backend/Firebase mocked test | Backend/Firebase mocked test |
| Silent sync notification | Required for attendance sync payloads | Required for attendance sync payloads |

## Gate 10: Rollback and Kill Switch

| Issue | Action |
|---|---|
| Bad notification content | Disable sender workflow, revoke campaign, and notify support. |
| Notification storm | Disable backend push dispatch or feature flag the campaign source. |
| Credential compromise | Revoke Firebase service account/APNs key and rotate secrets. |
| Wrong routing | Disable affected notification type and ship mobile hotfix if allowlist is insufficient. |
| High failure rate | Pause bulk sends, inspect Firebase errors, and prune stale tokens. |
| Privacy incident | Stop sends, preserve logs, and follow incident runbook. |

Production push needs a documented kill switch before bulk or automated notifications are enabled.

## Completion Record

Record these in the release ticket:

| Evidence | Required |
|---|---|
| Firebase project | Production project ID and credential secret reference. |
| APNs/FCM setup | Bundle/package IDs and credential status. |
| Device tests | Physical iOS and Android registration/delivery proof. |
| Permission tests | Granted and denied flows. |
| Routing tests | Allowed route and blocked unsafe route. |
| Monitoring | Notification log query or dashboard screenshot. |
| Retry policy | Failure classes and replay owner. |
| Opt-out policy | User and tenant-level opt-out posture. |
| Rollback plan | Kill switch, owner, and communication path. |

## Go/No-Go

Push notification production readiness is GO only when:

1. FCM/APNs credentials are production-scoped, mounted securely, and tested.
2. Mobile token registration and token rotation work on physical iOS and Android devices.
3. Permission denial and opt-out do not block app use.
4. Payload routing is allowlisted and does not trust arbitrary push data.
5. Notification logs and delivery failure monitoring are available.
6. Invalid tokens are pruned and transient failures have a bounded retry policy.
7. Tenant/school authorization is enforced for sends.
8. A kill switch and rollback owner are documented.

Any unknown credential owner, production Firebase disabled unexpectedly, unbounded bulk fan-out, raw token exposure, unsafe notification route, cross-tenant send risk, missing opt-out posture, or no delivery monitoring is a NO-GO.

## Validation

TASK-049 validation command:

```bash
rg -n "push notification|FCM|APNs" docs mobile backend PRODUCTION_READY_ROADMAP.md
```
