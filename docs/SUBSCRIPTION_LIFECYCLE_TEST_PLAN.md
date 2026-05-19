# Subscription Lifecycle Test Plan

Last updated: 2026-05-19

## Purpose

This test plan defines the subscription lifecycle coverage needed before CloudCampus subscription billing is production-ready.

The current product supports Super Admin plan assignment/change, monthly or annual billing cycles, current-period dates, tenant limit updates, and feature-flag cache invalidation after plan changes. Future billing work must add lifecycle states and tests for trial, activation, renewal, dunning, upgrade, downgrade, suspension, cancellation, and grace periods.

## Current Baseline

| Area | Current behavior | Test implication |
|---|---|---|
| Plan catalog | `FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE` with monthly prices and usage limits. | Verify limits are applied consistently after assignment or change. |
| Billing cycle | `MONTHLY` and `ANNUAL`. | Verify period start/end and price display rules. |
| Subscription status | Existing enum includes `ACTIVE`, `TRIALING`, and `CANCELLED`. | Expand tests before exposing additional state transitions. |
| Plan assignment | Super Admin can assign or change a tenant plan. | Verify tenant existence, assigned user, notes, period dates, and response DTO. |
| Entitlements | Plan change writes tenant config limits and invalidates feature flag cache. | Verify upgrades grant limits and downgrades revoke stale access. |
| Tenant suspension | Tenants can be suspended separately from subscription status. | Verify billing suspension and platform suspension are intentionally coordinated. |

## Lifecycle State Model

Target subscription states:

| State | Meaning | Expected access |
|---|---|---|
| `TRIALING` | Tenant is in a no-charge trial window. | Paid features enabled according to trial plan. |
| `ACTIVE` | Subscription is paid/current or manually approved. | Features enabled by plan. |
| `PAST_DUE` | Renewal payment failed but grace period is active. | Core access remains; billing banners/alerts shown. |
| `GRACE` | Explicit temporary access extension after trial or failed payment. | Features remain enabled until grace end. |
| `SUSPENDED` | Access blocked due to non-payment, fraud, compliance, or admin decision. | Authenticated tenant traffic blocked except support/billing recovery paths. |
| `CANCELLED` | Subscription ended and will not renew. | Access follows cancellation effective date and retention policy. |

Status transitions must be explicit, audited, and idempotent.

## Required Test Matrix

| Scenario | Coverage required |
|---|---|
| Trial start | Creates trial subscription with plan, trial start/end, no paid invoice unless configured. |
| Trial conversion | Trial moves to `ACTIVE`, issues first paid invoice, applies selected billing cycle. |
| Trial expiry without payment | Moves to `PAST_DUE` or `GRACE` according to policy; no silent indefinite access. |
| Manual activation | Super Admin activates paid subscription and writes audit event. |
| Monthly renewal | Generates renewal invoice, extends period by one month, preserves entitlements. |
| Annual renewal | Generates annual renewal invoice, extends period by one year, preserves entitlements. |
| Upgrade mid-cycle | Applies higher limits immediately and creates prorated invoice or adjustment. |
| Downgrade mid-cycle | Revokes premium entitlements at configured effective date and clears stale feature cache. |
| Failed renewal payment | Enters dunning flow, records failed payment event, and preserves access only within grace. |
| Dunning recovery | Successful retry returns subscription to `ACTIVE` and closes dunning state. |
| Grace period expiry | Moves tenant to `SUSPENDED` or reduced free plan according to policy. |
| Cancellation at period end | Keeps access until period end, then moves to `CANCELLED` or free plan. |
| Immediate cancellation | Ends paid access immediately, creates credit/refund path if applicable. |
| Reactivation | Restores plan, limits, feature flags, billing cycle, and period dates safely. |
| Tenant suspension | Subscription state and tenant status do not conflict or bypass access blocks. |

## Backend Unit Tests

Add service-level tests for subscription policy calculations:

| Component | Tests |
|---|---|
| Subscription lifecycle service | State transitions, invalid transition rejection, idempotency, audit metadata. |
| Period calculator | Monthly/annual boundaries, leap year, trial days, grace days, timezone safety. |
| Proration calculator | Upgrade charge, downgrade credit, zero-charge edge cases, rounding to paise. |
| Dunning policy | Retry schedule, max attempts, grace expiry, recovery after successful payment. |
| Entitlement projector | Plan limits written after activation/upgrade/downgrade/cancellation/suspension. |
| Feature cache invalidation | Downgrade and suspension clear tenant feature cache before next request. |

Minimum assertions:

1. Every transition validates the current state.
2. Every transition writes an audit event with actor, tenant, from-state, to-state, and correlation ID.
3. Every paid transition links to invoice/payment state when billing records exist.
4. No downgrade leaves cached premium features available.
5. No suspended or cancelled tenant can exceed the allowed recovery paths.

## Backend Integration Tests

Add API and persistence tests:

| Flow | Expected proof |
|---|---|
| Assign plan | `PUT /v1/super-admin/tenants/{id}/subscription` creates or updates row and tenant limits. |
| Get subscription | `GET /v1/super-admin/tenants/{id}/subscription` returns explicit row or default free subscription. |
| Upgrade | Plan, billing cycle, period, tenant configs, feature flags, and audit event update atomically. |
| Downgrade | Premium-only feature access is revoked on the next request. |
| Renewal | Period changes only once for a given renewal event ID. |
| Dunning retry | Duplicate gateway failure/success events are idempotent. |
| Suspension | Tenant suspension filter blocks tenant traffic while billing/support recovery paths remain available. |
| Cancellation | Access and entitlements follow the configured effective date. |

Tenant-isolation checks:

1. Super Admin can act across tenants.
2. School Admin cannot modify tenant subscription.
3. Tenant-scoped users cannot read another tenant's subscription or billing lifecycle data.
4. Subscription lifecycle jobs never process rows outside the selected tenant scope.

## Frontend Tests

Add UI tests for the Super Admin subscription flow:

| Screen | Test |
|---|---|
| Tenant create | Plan and billing cycle selection submit expected payload. |
| Tenant detail | Current subscription displays plan, status, billing cycle, limits, and notes. |
| Plan change | Upgrade/downgrade edit state submits the selected plan and billing cycle. |
| Past due/grace | UI shows billing warning without breaking tenant detail page. |
| Suspended/cancelled | UI distinguishes billing suspension from tenant operational suspension. |
| Feature gate | Missing entitlement redirects to `/plan-upgrade` and does not leak gated page content. |

## Scheduled Job Tests

Lifecycle automation must be tested with fixed clocks:

| Job | Test cases |
|---|---|
| Trial expiry job | Converts expired trials to grace/past-due according to policy. |
| Renewal job | Creates exactly one renewal invoice per period. |
| Dunning retry job | Schedules retries, respects max attempts, and stops after payment recovery. |
| Grace expiry job | Suspends or downgrades tenants when grace ends. |
| Cancellation job | Ends period-end cancellations exactly once. |

Use deterministic clocks and idempotency keys for every scheduled job test.

## Data Fixtures

Required fixtures:

| Fixture | Purpose |
|---|---|
| Free tenant | Default subscription fallback. |
| Trialing tenant | Trial conversion and expiry. |
| Active monthly tenant | Monthly renewal and upgrade. |
| Active annual tenant | Annual renewal and downgrade. |
| Past-due tenant | Dunning and grace-period behavior. |
| Suspended tenant | Access-block behavior and reactivation. |
| Cancelled tenant | Data retention and reactivation rules. |

## Acceptance Criteria

Subscription lifecycle is production-ready only when:

1. Trial, activation, renewal, upgrade, downgrade, dunning, grace period, suspension, cancellation, and reactivation flows have automated tests.
2. State transitions are idempotent and reject invalid from-state/to-state combinations.
3. Plan changes update tenant limits and invalidate feature flags atomically.
4. Dunning and renewal jobs are clock-tested and safe to rerun.
5. Billing events link to invoice/payment records when billing records are enabled.
6. Tenant isolation covers API access, scheduled jobs, and lifecycle data reads.
7. Frontend billing pages remain functional for active, trialing, past-due, grace, suspended, and cancelled tenants.

## Validation

TASK-045 validation command:

```bash
rg -n "subscription lifecycle|trial|dunning|upgrade|downgrade" docs PRODUCTION_READY_ROADMAP.md
```
