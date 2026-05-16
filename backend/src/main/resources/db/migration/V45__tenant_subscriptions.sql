-- V45: Tenant Subscription Plans (CC-0308)
-- Tracks which plan each tenant is on, when it was assigned, and billing cycle.
-- Plan limits (maxStudents, maxStaff, maxSchools) are defined in SubscriptionPlanCode
-- enum and written to tenant_configs on plan assignment by SubscriptionServiceImpl.

CREATE TABLE tenant_subscriptions (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID        NOT NULL UNIQUE REFERENCES tenants(id),
    plan_code            VARCHAR(20) NOT NULL,                 -- SubscriptionPlanCode enum value
    billing_cycle        VARCHAR(10) NOT NULL DEFAULT 'MONTHLY',
    status               VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end   TIMESTAMPTZ,                         -- NULL = no fixed end (open billing)
    assigned_by          UUID        NOT NULL,                 -- super-admin userId
    assigned_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes                TEXT,

    CONSTRAINT chk_tenant_sub_plan
        CHECK (plan_code IN ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
    CONSTRAINT chk_tenant_sub_billing
        CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL')),
    CONSTRAINT chk_tenant_sub_status
        CHECK (status IN ('ACTIVE', 'TRIALING', 'CANCELLED'))
);

CREATE INDEX idx_tenant_subscriptions_tenant ON tenant_subscriptions (tenant_id);
