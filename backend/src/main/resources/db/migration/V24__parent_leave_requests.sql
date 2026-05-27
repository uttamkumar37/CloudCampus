CREATE TABLE parent_leave_requests (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    parent_user_id VARCHAR(36) NOT NULL,
    parent_student_link_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    status VARCHAR(32) NOT NULL,
    admin_note VARCHAR(1000),
    decided_by_user_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    decided_at TIMESTAMP,
    CONSTRAINT fk_parent_leave_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_parent_leave_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_parent_leave_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_parent_leave_parent_user FOREIGN KEY (parent_user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_parent_leave_parent_link FOREIGN KEY (parent_student_link_id) REFERENCES parent_student_links(id),
    CONSTRAINT fk_parent_leave_decider FOREIGN KEY (decided_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT ck_parent_leave_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT ck_parent_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_parent_leave_parent_student ON parent_leave_requests(parent_user_id, student_id);
CREATE INDEX idx_parent_leave_school_status ON parent_leave_requests(school_id, status);
