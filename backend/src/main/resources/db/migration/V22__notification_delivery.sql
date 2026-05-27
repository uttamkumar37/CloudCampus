CREATE TABLE notification_deliveries (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    invitation_id VARCHAR(36),
    user_id VARCHAR(36),
    channel VARCHAR(32) NOT NULL,
    template VARCHAR(80) NOT NULL,
    recipient_email VARCHAR(320) NOT NULL,
    recipient_name VARCHAR(160) NOT NULL,
    recipient_role VARCHAR(40) NOT NULL,
    subject VARCHAR(240) NOT NULL,
    status VARCHAR(24) NOT NULL,
    provider VARCHAR(80),
    masked_recipient VARCHAR(340) NOT NULL,
    last_error VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    failed_at TIMESTAMP,
    CONSTRAINT fk_notification_deliveries_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_notification_deliveries_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_notification_deliveries_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id),
    CONSTRAINT fk_notification_deliveries_user FOREIGN KEY (user_id) REFERENCES user_accounts(id)
);

CREATE INDEX idx_notification_deliveries_tenant_id ON notification_deliveries(tenant_id);
CREATE INDEX idx_notification_deliveries_school_id ON notification_deliveries(school_id);
CREATE INDEX idx_notification_deliveries_invitation_id ON notification_deliveries(invitation_id);
CREATE INDEX idx_notification_deliveries_status_created_at ON notification_deliveries(status, created_at);
