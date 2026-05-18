-- DSEP Phase 5: Marketing Automation
-- Drip campaign engine with trigger-based step execution.

CREATE TABLE platform_campaigns (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    campaign_type   VARCHAR(40)  NOT NULL CHECK (campaign_type IN ('EMAIL_DRIP','IN_APP','PUSH','WEBHOOK')),
    audience_filter JSONB        NOT NULL DEFAULT '{}',
    trigger_type    VARCHAR(40)  NOT NULL CHECK (trigger_type IN ('SIGNUP','PAGE_VIEW','DEMO_START','DEMO_COMPLETE','TIME_BASED','MANUAL')),
    trigger_config  JSONB        NOT NULL DEFAULT '{}',
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','PAUSED','ARCHIVED')),
    created_by      UUID         REFERENCES users(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_campaign_steps (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   UUID        NOT NULL REFERENCES platform_campaigns(id) ON DELETE CASCADE,
    position      INTEGER     NOT NULL,
    delay_minutes INTEGER     NOT NULL DEFAULT 0,
    action_type   VARCHAR(40) NOT NULL CHECK (action_type IN ('SEND_EMAIL','SEND_WEBHOOK','TAG_LEAD','SHOW_POPUP','SLACK_NOTIFY')),
    action_config JSONB       NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, position)
);

CREATE TABLE platform_campaign_enrollments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID        NOT NULL REFERENCES platform_campaigns(id) ON DELETE CASCADE,
    visitor_id  VARCHAR(128) NOT NULL,
    email       VARCHAR(255),
    meta_json   JSONB       NOT NULL DEFAULT '{}',
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','UNSUBSCRIBED')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, visitor_id)
);

CREATE INDEX idx_pc_status     ON platform_campaigns (status, trigger_type);
CREATE INDEX idx_pce_visitor   ON platform_campaign_enrollments (visitor_id, status);
CREATE INDEX idx_pce_campaign  ON platform_campaign_enrollments (campaign_id, status);
