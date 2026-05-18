-- DSEP Phase 3: Investor Data Rooms
-- Private, gated data rooms for investor due diligence.

CREATE TABLE platform_investor_rooms (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code     VARCHAR(40)  UNIQUE NOT NULL,
    title         VARCHAR(255) NOT NULL,
    access_mode   VARCHAR(20)  NOT NULL DEFAULT 'LINK_ONLY' CHECK (access_mode IN ('LINK_ONLY','PASSWORD','EMAIL_GATE')),
    access_secret VARCHAR(255),
    expires_at    TIMESTAMPTZ,
    content_json  JSONB        NOT NULL DEFAULT '{}',
    branding_json JSONB        NOT NULL DEFAULT '{}',
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
    created_by    UUID         REFERENCES users(id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_investor_room_sections (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id      UUID        NOT NULL REFERENCES platform_investor_rooms(id) ON DELETE CASCADE,
    position     INTEGER     NOT NULL,
    section_type VARCHAR(40) NOT NULL CHECK (section_type IN ('METRICS_DASHBOARD','TEAM','TRACTION','FINANCIALS','PRODUCT_DEMO','FAQ','CUSTOM')),
    content_json JSONB       NOT NULL DEFAULT '{}',
    visibility   VARCHAR(20) NOT NULL DEFAULT 'VISIBLE' CHECK (visibility IN ('VISIBLE','HIDDEN')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, position)
);

CREATE TABLE platform_investor_room_views (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id      UUID        NOT NULL REFERENCES platform_investor_rooms(id) ON DELETE CASCADE,
    viewer_email VARCHAR(255),
    viewer_meta  JSONB       NOT NULL DEFAULT '{}',
    section_id   UUID        REFERENCES platform_investor_room_sections(id),
    duration_sec INTEGER     NOT NULL DEFAULT 0,
    viewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pirm_status    ON platform_investor_rooms (status, expires_at);
CREATE INDEX idx_pirs_room      ON platform_investor_room_sections (room_id, position);
CREATE INDEX idx_pirv_room      ON platform_investor_room_views (room_id, viewed_at DESC);
