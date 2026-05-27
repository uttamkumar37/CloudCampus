CREATE TABLE ai_tenant_entitlements (
    tenant_id VARCHAR(36) PRIMARY KEY,
    enabled BOOLEAN NOT NULL,
    monthly_unit_budget BIGINT NOT NULL,
    enabled_features VARCHAR(1000) NOT NULL,
    human_approval_required BOOLEAN NOT NULL,
    retention_days INTEGER NOT NULL,
    updated_by_user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ai_entitlements_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ai_entitlements_actor FOREIGN KEY (updated_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT chk_ai_entitlements_budget CHECK (monthly_unit_budget >= 0),
    CONSTRAINT chk_ai_entitlements_retention CHECK (retention_days BETWEEN 1 AND 3650)
);

CREATE TABLE ai_request_audits (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,
    user_role VARCHAR(40) NOT NULL,
    feature VARCHAR(60) NOT NULL,
    scope_type VARCHAR(40) NOT NULL,
    scope_id VARCHAR(80),
    request_type VARCHAR(80) NOT NULL,
    prompt_sha256 VARCHAR(64) NOT NULL,
    prompt_length INTEGER NOT NULL,
    estimated_input_units BIGINT NOT NULL,
    estimated_output_units BIGINT NOT NULL,
    estimated_cost_cents BIGINT NOT NULL,
    status VARCHAR(24) NOT NULL,
    denial_reason VARCHAR(240),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ai_request_audits_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ai_request_audits_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_ai_request_audits_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT chk_ai_request_audits_prompt_length CHECK (prompt_length >= 0),
    CONSTRAINT chk_ai_request_audits_input_units CHECK (estimated_input_units >= 0),
    CONSTRAINT chk_ai_request_audits_output_units CHECK (estimated_output_units >= 0),
    CONSTRAINT chk_ai_request_audits_cost CHECK (estimated_cost_cents >= 0)
);

CREATE INDEX idx_ai_request_audits_tenant_created ON ai_request_audits(tenant_id, created_at);
CREATE INDEX idx_ai_request_audits_school_created ON ai_request_audits(school_id, created_at);
CREATE INDEX idx_ai_request_audits_user_created ON ai_request_audits(user_id, created_at);
