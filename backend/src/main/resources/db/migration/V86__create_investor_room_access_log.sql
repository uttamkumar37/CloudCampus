-- TASK-019: Investor room access audit log
-- Immutable ledger of room metadata access, content access, unlock attempts,
-- and expiry events. No FK on room_id — deleted rooms must not erase their audit trail.

CREATE TABLE investor_room_access_log (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id     UUID         NOT NULL,
    room_code   VARCHAR(40)  NOT NULL,
    event       VARCHAR(30)  NOT NULL,   -- METADATA_ACCESS | CONTENT_ACCESS | UNLOCK_SUCCESS | UNLOCK_FAILURE | EXPIRED
    access_mode VARCHAR(20),             -- LINK_ONLY | PASSWORD | null if unknown at event time
    client_ip   VARCHAR(64),
    occurred_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_access_room_occurred
    ON investor_room_access_log (room_id, occurred_at DESC);

CREATE INDEX idx_investor_access_occurred
    ON investor_room_access_log (occurred_at DESC);
