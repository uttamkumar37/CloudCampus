CREATE TABLE mfa_challenges (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    code_hash VARCHAR(120) NOT NULL,
    status VARCHAR(24) NOT NULL,
    attempt_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    CONSTRAINT fk_mfa_challenges_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_mfa_challenges_user FOREIGN KEY (user_id) REFERENCES user_accounts(id)
);

CREATE INDEX idx_mfa_challenges_user_id ON mfa_challenges(user_id);
CREATE INDEX idx_mfa_challenges_status ON mfa_challenges(status);
CREATE INDEX idx_mfa_challenges_expires_at ON mfa_challenges(expires_at);
