CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    status VARCHAR(24) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE schools (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    code VARCHAR(40) NOT NULL,
    name VARCHAR(180) NOT NULL,
    primary_school BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_schools_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT uk_schools_tenant_code UNIQUE (tenant_id, code)
);

CREATE TABLE user_accounts (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    email VARCHAR(320) NOT NULL,
    display_name VARCHAR(160) NOT NULL,
    role VARCHAR(40) NOT NULL,
    status VARCHAR(24) NOT NULL,
    password_hash VARCHAR(120),
    must_change_password BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    activated_at TIMESTAMP,
    CONSTRAINT fk_user_accounts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT uk_user_accounts_tenant_email UNIQUE (tenant_id, email)
);

CREATE TABLE invitations (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(40) NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(24) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_invitations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_invitations_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_invitations_user FOREIGN KEY (user_id) REFERENCES user_accounts(id)
);

CREATE TABLE user_school_access (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(40) NOT NULL,
    primary_access BOOLEAN NOT NULL,
    granted_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_school_access_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_user_school_access_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_user_school_access_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT uk_user_school_access_user_school UNIQUE (user_id, school_id)
);

CREATE INDEX idx_schools_tenant_id ON schools(tenant_id);
CREATE INDEX idx_user_accounts_tenant_id ON user_accounts(tenant_id);
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_user_school_access_school_id ON user_school_access(school_id);
