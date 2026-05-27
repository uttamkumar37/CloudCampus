CREATE TABLE subscription_plans (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(24) NOT NULL,
    max_schools INTEGER NOT NULL,
    max_students INTEGER NOT NULL,
    max_staff INTEGER NOT NULL,
    monthly_price_cents BIGINT NOT NULL,
    annual_price_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_subscription_plans_max_schools CHECK (max_schools >= 1),
    CONSTRAINT chk_subscription_plans_max_students CHECK (max_students >= 0),
    CONSTRAINT chk_subscription_plans_max_staff CHECK (max_staff >= 0),
    CONSTRAINT chk_subscription_plans_monthly_price CHECK (monthly_price_cents >= 0),
    CONSTRAINT chk_subscription_plans_annual_price CHECK (annual_price_cents >= 0)
);

CREATE TABLE tenant_subscriptions (
    tenant_id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    status VARCHAR(24) NOT NULL,
    billing_cycle VARCHAR(24) NOT NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP,
    assigned_at TIMESTAMP NOT NULL,
    assigned_by_user_id VARCHAR(36) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_tenant_subscriptions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_tenant_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    CONSTRAINT fk_tenant_subscriptions_actor FOREIGN KEY (assigned_by_user_id) REFERENCES user_accounts(id)
);

CREATE TABLE tenant_invoices (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
    invoice_number VARCHAR(60) NOT NULL UNIQUE,
    billing_cycle VARCHAR(24) NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(24) NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    due_at TIMESTAMP,
    CONSTRAINT fk_tenant_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_tenant_invoices_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    CONSTRAINT chk_tenant_invoices_amount CHECK (amount_cents >= 0)
);
