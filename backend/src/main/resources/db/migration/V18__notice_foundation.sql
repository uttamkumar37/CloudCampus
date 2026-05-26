CREATE TABLE notices (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    class_level_id VARCHAR(36),
    section_id VARCHAR(36),
    created_by_user_id VARCHAR(36) NOT NULL,
    published_by_user_id VARCHAR(36),
    title VARCHAR(160) NOT NULL,
    body VARCHAR(4000) NOT NULL,
    audience VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP,
    CONSTRAINT fk_notices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_notices_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_notices_class_level FOREIGN KEY (class_level_id) REFERENCES class_levels(id),
    CONSTRAINT fk_notices_section FOREIGN KEY (section_id) REFERENCES sections(id),
    CONSTRAINT fk_notices_created_by FOREIGN KEY (created_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_notices_published_by FOREIGN KEY (published_by_user_id) REFERENCES user_accounts(id)
);

CREATE INDEX idx_notices_school_created ON notices(school_id, created_at);
CREATE INDEX idx_notices_school_status_audience ON notices(school_id, status, audience);
CREATE INDEX idx_notices_class_level ON notices(class_level_id);
