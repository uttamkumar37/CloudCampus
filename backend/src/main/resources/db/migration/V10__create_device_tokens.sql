-- V10: device_tokens — stores FCM/APNs push token per user per device.
-- One row per unique (user_id, device_fingerprint) pair.
-- On token rotation the row is updated in-place (upsert via unique index).

CREATE TABLE IF NOT EXISTS device_tokens (
    id                  UUID                        PRIMARY KEY,
    user_id             UUID                        NOT NULL,
    push_token          VARCHAR(512)                NOT NULL,
    platform            VARCHAR(10)                 NOT NULL,          -- IOS | ANDROID
    expo_push_token     VARCHAR(512),
    device_fingerprint  VARCHAR(255),                                   -- optional: model + OS version for diagnostics
    created_at          TIMESTAMP WITH TIME ZONE    NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE    NOT NULL
);

-- A user can have multiple devices, but each (user + token) pair is unique
CREATE UNIQUE INDEX IF NOT EXISTS uidx_device_tokens_user_token
    ON device_tokens (user_id, push_token);
