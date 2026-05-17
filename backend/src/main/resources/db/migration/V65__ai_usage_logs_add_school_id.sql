-- V65: M-17 — add school_id to ai_usage_logs for per-school cost attribution
--
-- Without school_id, cost reporting can only be broken down per-tenant.
-- In multi-school tenants (e.g. a district) each school's AI spend is
-- invisible, making budget enforcement at the school level impossible.

ALTER TABLE ai_usage_logs
    ADD COLUMN school_id UUID REFERENCES schools(id);

CREATE INDEX idx_ai_usage_school ON ai_usage_logs (school_id);
