# Billing & Subscription

## Plans

CloudCampus offers four tiers. All plans include core school management.

| Feature | FREE | BASIC | PRO | ENTERPRISE |
|---|---|---|---|---|
| **Price / cycle** | ₹0 | ₹2,999 / 30 days | ₹7,999 / 30 days | Custom |
| **Max Students** | 50 | 300 | 1,500 | Unlimited |
| **Max Teachers** | 5 | 30 | 150 | Unlimited |
| Student Management | ✅ | ✅ | ✅ | ✅ |
| Teacher Management | ✅ | ✅ | ✅ | ✅ |
| Dashboard Access | ✅ | ✅ | ✅ | ✅ |
| Attendance Tracking | ❌ | ✅ | ✅ | ✅ |
| Fee Management | ❌ | ✅ | ✅ | ✅ |
| Academic Management | ❌ | ✅ | ✅ | ✅ |
| Exam Management | ❌ | ✅ | ✅ | ✅ |
| Homework Management | ❌ | ✅ | ✅ | ✅ |
| Timetable Management | ❌ | ✅ | ✅ | ✅ |
| Bulk Upload | ❌ | ❌ | ✅ | ✅ |
| Parent Portal | ❌ | ❌ | ✅ | ✅ |
| Advanced Reports | ❌ | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ❌ | ✅ |

Upgrade path: `FREE → BASIC → PRO → ENTERPRISE`

Upgrading cancels the current active subscription and creates a new one (no prorated refund in v1).

---

## Payment Flow

### Manual Flow (Super Admin records payment)

```
Super Admin creates tenant
        ↓
Super Admin assigns plan via POST /api/v1/tenants/{tenantId}/subscribe
        ↓
TenantSubscription created — status=ACTIVE, paymentStatus=PENDING
        ↓
Payment received (bank transfer / UPI / etc.)
        ↓
Super Admin records payment via POST /api/v1/payments
        ↓
TenantSubscription.paymentStatus → PAID
```

### Online Flow (Razorpay)

```
Super Admin opens TenantSubscriptionPage
        ↓
Clicks "Pay Online" → POST /api/v1/tenants/{tenantId}/subscribe/initiate
        ↓
Backend creates Razorpay order → stores gateway_order_id
        ↓
Returns { orderId, amountInPaise, currency, keyId }
        ↓
Frontend opens Razorpay checkout modal
        ↓
User completes payment
        ↓
Razorpay fires POST /api/v1/payments/webhook (HMAC-SHA256 signed)
        ↓
Backend verifies signature → TenantSubscription.paymentStatus = PAID
        ↓
PlatformPayment record created automatically
```

## API Endpoints

| Action | Method | Path |
|---|---|---|
| List plans | GET | `/api/v1/plans` |
| Create plan | POST | `/api/v1/plans` |
| Subscribe tenant | POST | `/api/v1/tenants/{tenantId}/subscribe` |
| Initiate online payment | POST | `/api/v1/tenants/{tenantId}/subscribe/initiate` |
| Get subscription | GET | `/api/v1/tenants/{tenantId}/subscription` |
| Cancel subscription | DELETE | `/api/v1/tenants/{tenantId}/subscription` |
| Record payment (manual) | POST | `/api/v1/payments` |
| Tenant payment history | GET | `/api/v1/payments/tenant/{tenantId}` |
| Razorpay webhook | POST | `/api/v1/payments/webhook` |

## Payment Statuses

| Status | Description |
|---|---|
| `PENDING` | Subscription created, payment not yet received |
| `PAID` | Payment recorded / verified |
| `FAILED` | Payment attempt failed |
| `REFUNDED` | Payment reversed |

## Razorpay Configuration

| Variable | Description |
|---|---|
| `RAZORPAY_KEY_ID` | Public API key from Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Secret API key — never expose to frontend |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret set in Razorpay Dashboard |

Configure the Razorpay Dashboard to fire the `payment.captured` event to:
```
POST https://<your-domain>/api/v1/payments/webhook
```

## Security

- `POST /subscribe/initiate` requires `SUPER_ADMIN` JWT.
- `POST /payments/webhook` is unauthenticated — security enforced by HMAC-SHA256 signature verification.
- Duplicate webhook deliveries are idempotent: a subscription already `PAID` is skipped.

## Feature Guard

`SubscriptionGuardService.requireFeature(PlanFeature)` gates plan-specific features.

**Fail-open**: tenants with no active subscription get full access (legacy compatibility).

**Fail-closed**: if an active subscription excludes the feature → `HTTP 403`.
