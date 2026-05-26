CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    admission_number VARCHAR(80) NOT NULL,
    full_name VARCHAR(180) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_students_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_students_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT uk_students_school_admission_number UNIQUE (school_id, admission_number)
);

CREATE TABLE parent_student_links (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    parent_user_id VARCHAR(36) NOT NULL,
    relationship VARCHAR(80) NOT NULL,
    contact_email VARCHAR(320) NOT NULL,
    contact_mobile VARCHAR(40),
    primary_contact BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_parent_links_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_parent_links_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_parent_links_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_parent_links_parent_user FOREIGN KEY (parent_user_id) REFERENCES user_accounts(id),
    CONSTRAINT uk_parent_links_parent_student UNIQUE (parent_user_id, student_id)
);

CREATE INDEX idx_students_tenant_school ON students(tenant_id, school_id);
CREATE INDEX idx_parent_links_parent_user ON parent_student_links(parent_user_id);
CREATE INDEX idx_parent_links_student ON parent_student_links(student_id);
CREATE INDEX idx_parent_links_tenant_school ON parent_student_links(tenant_id, school_id);
