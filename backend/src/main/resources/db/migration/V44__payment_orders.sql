-- V44: Online Payment Orders (CC-0903)
-- Tracks every Razorpay payment order from creation through capture.
-- One row per payment attempt; a new row is created for each retry.

CREATE TABLE payment_orders (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID         NOT NULL REFERENCES tenants(id),
    school_id           UUID         NOT NULL REFERENCES schools(id),
    fee_record_id       UUID         NOT NULL REFERENCES student_fee_records(id),
    student_id          UUID         NOT NULL,
    initiated_by        UUID         NOT NULL,       -- userId who triggered the checkout

    gateway             VARCHAR(20)  NOT NULL DEFAULT 'RAZORPAY',
    gateway_order_id    VARCHAR(100) NOT NULL UNIQUE, -- Razorpay order_id
    amount_paise        BIGINT       NOT NULL,        -- amount × 100 (smallest currency unit)
    currency            CHAR(3)      NOT NULL DEFAULT 'INR',

    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',

    -- Populated after successful payment
    gateway_payment_id  VARCHAR(100),
    gateway_signature   VARCHAR(300),
    fee_payment_id      UUID,                         -- FK to fee_payments after capture

    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_payment_order_status
        CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'))
);

CREATE INDEX idx_payment_orders_fee_record ON payment_orders (fee_record_id);
CREATE INDEX idx_payment_orders_tenant     ON payment_orders (tenant_id);
CREATE INDEX idx_payment_orders_student    ON payment_orders (student_id);
