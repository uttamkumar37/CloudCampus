CREATE TABLE staff_profiles (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(40) NOT NULL,
    employee_number VARCHAR(80),
    full_name VARCHAR(180) NOT NULL,
    email VARCHAR(320) NOT NULL,
    department VARCHAR(120),
    designation VARCHAR(120),
    portal_login_required BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_staff_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_staff_profiles_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_staff_profiles_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT uk_staff_profiles_school_user UNIQUE (school_id, user_id),
    CONSTRAINT uk_staff_profiles_school_employee UNIQUE (school_id, employee_number)
);

CREATE INDEX idx_staff_profiles_tenant_school ON staff_profiles(tenant_id, school_id);
CREATE INDEX idx_staff_profiles_user ON staff_profiles(user_id);
