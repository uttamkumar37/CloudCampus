-- Payment gateway webhook idempotency and duplicate-payment protection.

CREATE TABLE IF NOT EXISTS payment_gateway_events (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway       VARCHAR(20)  NOT NULL,
    event_id      VARCHAR(120) NOT NULL,
    event_type    VARCHAR(120) NOT NULL,
    payload_hash  VARCHAR(64)  NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'RECEIVED',
    error_message VARCHAR(500),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    processed_at  TIMESTAMPTZ,

    CONSTRAINT uq_payment_gateway_event UNIQUE (gateway, event_id),
    CONSTRAINT chk_payment_gateway_event_status
        CHECK (status IN ('RECEIVED','PROCESSED','FAILED','IGNORED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_orders_gateway_payment_id
    ON payment_orders (gateway_payment_id)
    WHERE gateway_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_gateway_events_created
    ON payment_gateway_events (created_at DESC);
