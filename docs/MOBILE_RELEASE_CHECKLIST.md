# Mobile Release Checklist

Last updated: 2026-05-19

## Purpose

This checklist defines the production release gate for the CloudCampus Expo mobile app across iOS and Android.

Run it before every TestFlight, Play internal testing, staged rollout, production submission, emergency patch, or store metadata change.

## Current Mobile Baseline

| Area | Current state |
|---|---|
| Framework | Expo SDK 54, Expo Router, React Native 0.81. |
| App identity | `CloudCampus`, slug `cloudcampus-mobile`, scheme `cloudcampus`, version `1.0.0`. |
| Storage | SecureStore token/session storage and MMKV/Zustand app state. |
| Offline | WatermelonDB offline database and sync queue exist. |
| Push | `expo-notifications` registration for native FCM/APNs token and Expo push token fallback. |
| Deep links | `cloudcampus` scheme plus Android/iOS app links for `cloudcampus.in` and `www.cloudcampus.in`. |
| Security | Network security plugin and secure token hydration are present. |

## Release Inputs

Record these before starting:

| Field | Required value |
|---|---|
| Release version | App version and build number/version code. |
| Git commit | Exact commit SHA used for the mobile build. |
| Target track | Internal, TestFlight, staged rollout, or production. |
| API environment | Staging or production backend base URL. |
| Owner | Mobile release owner and backend on-call owner. |
| Rollback owner | Person authorized to pause rollout or submit hotfix. |
| Store accounts | Apple Developer Team and Google Play Console account. |

## Gate 1: Versioning and Build Profile

| Check | Pass condition |
|---|---|
| App version | `mobile/app.json` version matches release ticket. |
| iOS build number | EAS/App Store build number is incremented from previous release. |
| Android version code | EAS/Play version code is incremented from previous release. |
| Build profile | EAS profile is explicit: preview, internal, staging, or production. |
| Runtime config | API base URL, environment name, and feature flags point to the target environment. |
| Commit reproducibility | Build command and commit SHA are recorded. |

Add or verify an `eas.json` before production if the release is built with EAS Build.

## Gate 2: App Signing

| Check | iOS | Android |
|---|---|---|
| Signing owner | Apple Developer Team role confirmed. | Google Play signing owner confirmed. |
| Certificates | Distribution certificate is valid and not expiring within 30 days. | Upload key is available and backed up. |
| Profiles | App Store provisioning profile matches bundle ID and entitlements. | App signing by Play is enabled or upload key policy is documented. |
| Secrets | Signing credentials are stored in EAS credentials or secret manager, not committed. | Keystore/upload key is stored in EAS credentials or secret manager, not committed. |
| Entitlements | Associated domains and notifications match `mobile/app.json`. | App links and notification permissions match `mobile/app.json`. |

Release is blocked if signing credentials are local-only, unknown-owner, expired, or not recoverable.

## Gate 3: Environment and Secrets

| Check | Pass condition |
|---|---|
| API base URL | App talks to staging for pre-release validation and production for store submission. |
| Auth storage | Refresh token remains in SecureStore and access token is not persisted insecurely. |
| Offline DB key | WatermelonDB encryption key is per install and stored through SecureStore/keystore. |
| Push config | Firebase/APNs credentials match target bundle/package IDs. |
| Deep link domains | `cloudcampus.in` associated-domain and assetlinks files are deployed and valid. |
| Network security | Production build does not allow arbitrary cleartext traffic. |
| Debug flags | Dev menus, mock APIs, verbose logs, and test tenants are disabled unless intentionally on internal track. |

## Gate 4: Build and Static Checks

| Check | Command or evidence |
|---|---|
| Type check | `cd mobile && npx tsc --noEmit`. |
| Dependency install | `cd mobile && npm ci` or lockfile-consistent install. |
| Expo config | `cd mobile && npx expo config --type public`. |
| Native build | EAS iOS and Android builds succeed for the target profile. |
| Asset validation | Icon, adaptive icon, splash icon, and notification icon render correctly. |
| Bundle size | Bundle growth is reviewed and explained if unusually large. |

## Gate 5: Smoke Tests

Run on at least one physical iOS device and one physical Android device.

| Flow | Pass condition |
|---|---|
| Fresh install | App opens from cold start without crash. |
| Login | Valid user can log in and reach the role-appropriate app home. |
| Forced password change | User requiring password change is redirected and can complete change. |
| Token refresh | App resumes after backgrounding and refreshes session without a forced logout. |
| Logout | Tokens are cleared and app returns to auth flow. |
| Deep link | App opens from `cloudcampus://` and approved HTTPS app links. |
| Offline open | App opens with no network and shows cached/offline-safe screens where supported. |
| Network restore | Offline sync queue runs after connectivity returns. |
| Role navigation | Student, parent, teacher, and school-admin screens render according to seeded accounts. |

## Gate 6: Push Notifications

| Check | Pass condition |
|---|---|
| Permission prompt | Prompt appears only after login or intended onboarding point. |
| Token registration | Device posts native FCM/APNs token and optional Expo push token to backend. |
| Token rotation | `devicePushTokenChanged` re-registers the token. |
| Android channel | Default notification channel is created with production name/importance. |
| Foreground handling | Foreground notification behavior is intentional and tested. |
| Tap routing | Notification tap opens the correct app screen or safe fallback. |
| Opt-out | Permission denied does not block app use. |

## Gate 7: Crash Reporting and Observability

Crash reporting must be configured before production release.

| Check | Pass condition |
|---|---|
| Crash SDK | Sentry, Firebase Crashlytics, or approved equivalent is installed and enabled for production. |
| Release ID | Crash reports include app version, build number, platform, and commit SHA. |
| Source maps | JavaScript source maps are uploaded for the release. |
| PII scrub | User identifiers are minimized; tokens, passwords, OTPs, and raw request bodies are never sent. |
| Smoke crash | Test crash is visible in the staging crash project before production release. |
| Alert route | Mobile crash spike alerts route to the mobile/backend owner. |

If crash reporting is not yet implemented, production release is blocked unless the release owner explicitly accepts the risk for an internal-only track.

## Gate 8: Store Metadata

| Area | iOS App Store Connect | Google Play Console |
|---|---|---|
| App name | CloudCampus naming approved. | CloudCampus naming approved. |
| Description | Accurate role and feature description. | Accurate role and feature description. |
| Screenshots | Current iPhone/iPad screenshots. | Current phone/tablet screenshots. |
| Privacy | App privacy nutrition labels updated. | Data safety form updated. |
| Permissions | Push, storage, camera/QR, and network usage explained. | Push, storage, camera/QR, and network usage explained. |
| Support | Support URL, privacy URL, and contact email valid. | Support URL, privacy URL, and contact email valid. |
| Review notes | Demo credentials and test instructions included. | Demo credentials and test instructions included. |

## Gate 9: App Store Review Data

| Field | Required |
|---|---|
| Demo school tenant | Seeded and stable for review. |
| Demo login credentials | Student, parent, teacher, and school-admin accounts when relevant. |
| MFA/password state | Demo accounts must not require unavailable OTP/MFA flows. |
| Payment mode | Sandbox or disabled; no reviewer should trigger real-money payment. |
| Push behavior | Review notes explain notification prompt and test path. |
| Offline behavior | Review notes explain offline cache/sync if reviewers test airplane mode. |

## Gate 10: Rollout Plan

| Step | Rule |
|---|---|
| Internal track | Required before external or production rollout. |
| TestFlight/closed testing | Required for release candidates. |
| Staged rollout | Start at 5% or lower for material changes. |
| Monitoring window | Watch crashes, login errors, push registration failures, and API 4xx/5xx for at least 2 hours. |
| Expansion | Increase rollout only when crash-free sessions and core flows are healthy. |
| Pause criteria | Pause rollout on crash spike, login failure, data sync issue, notification storm, or severe UI regression. |

## Rollback and Hotfix

| Case | Action |
|---|---|
| Bad staged rollout | Pause rollout in Play Console or App Store phased release. |
| Severe iOS issue | Submit expedited hotfix if eligible; otherwise stop phased release and communicate workaround. |
| Severe Android issue | Halt staged rollout and submit patched version code. |
| Backend compatibility issue | Disable feature flag or roll backend forward safely. |
| Push notification issue | Disable sending from backend, revoke bad campaign, or rotate credentials. |
| Offline sync corruption | Disable sync trigger through feature flag or ship hotfix; do not ask users to reinstall until engineering approves. |

Rollback evidence must include release version, affected platform, percent rollout, issue summary, action taken, owner, and customer communication status.

## Completion Record

Attach these to the release ticket:

| Evidence | Required |
|---|---|
| Build artifacts | EAS build URLs or store build IDs. |
| Type check | `npx tsc --noEmit` result. |
| Device smoke | Physical iOS and Android smoke results. |
| Push proof | Token registration and received notification screenshots/logs. |
| Crash proof | Crash reporting release visible with source maps. |
| Store metadata | Screenshots, descriptions, privacy/data safety confirmation. |
| Rollout plan | Track, percent, monitoring owner, pause criteria. |
| Rollback plan | Pause/hotfix/backend-feature-flag action documented. |

## Go/No-Go

Mobile release is GO only when:

1. App version/build numbers are incremented and tied to a commit SHA.
2. iOS and Android signing credentials are valid, recoverable, and not committed.
3. Environment config points to the intended backend and no debug/test settings leak to production.
4. Type check, Expo config check, and native builds pass.
5. Physical-device smoke tests pass for auth, navigation, deep links, offline open, and token refresh.
6. Push configuration is valid and denial does not block the app.
7. Crash reporting and release/source-map metadata are working for production or explicitly waived for internal-only track.
8. Store metadata, privacy/data safety forms, and review notes are complete.
9. Rollout and rollback owners are assigned.

Any signing uncertainty, production API misconfiguration, crash-reporting blind spot for production, broken login, broken token refresh, push credential mismatch, or store metadata/privacy mismatch is a NO-GO.

## Validation

TASK-047 validation command:

```bash
rg -n "mobile release|Expo|signing|store" docs mobile PRODUCTION_READY_ROADMAP.md
```
