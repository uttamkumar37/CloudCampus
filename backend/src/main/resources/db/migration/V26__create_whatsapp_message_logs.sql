-- V26: WhatsApp message log (CC-1004 / E14)
--
-- Stores every WhatsApp outbound message attempt.
-- Real dispatch is via WhatsApp Business API (Meta Cloud API or on-prem BSP).
-- E14 baseline: stub implementation — saves log rows only, no real dispatch.
-- Real dispatch is wired in a later task once a BSP account is provisioned.
--
-- SECURITY: recipient phone numbers are stored; classify as PII.
--           Apply column-level encryption in prod if required by DPDP Act.

CREATE TABLE whatsapp_message_logs (
    id             UUID         PRIMARY KEY,
    tenant_id      UUID         NOT NULL REFERENCES tenants(id),
    school_id      UUID         REFERENCES schools(id),

    -- Destination phone in E.164 format (+91XXXXXXXXXX)
    recipient      VARCHAR(30)  NOT NULL,

    -- Template name registered in WhatsApp Business Manager
    template_name  VARCHAR(100) NOT NULL,

    -- Language code used for the template (e.g. en_US, en_IN)
    language_code  VARCHAR(20)  NOT NULL DEFAULT 'en',

    -- JSON-serialised list of variable values passed to the template
    template_params TEXT,

    -- Dispatch outcome
    status         VARCHAR(20)  NOT NULL,   -- QUEUED | SENT | FAILED
    error_message  VARCHAR(2000),
    sent_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_wa_log_tenant       ON whatsapp_message_logs(tenant_id);
CREATE INDEX idx_wa_log_school       ON whatsapp_message_logs(school_id);
CREATE INDEX idx_wa_log_status       ON whatsapp_message_logs(status);
CREATE INDEX idx_wa_log_created_desc ON whatsapp_message_logs(created_at DESC);
