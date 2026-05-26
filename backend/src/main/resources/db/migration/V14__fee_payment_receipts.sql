CREATE TABLE fee_demands (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    description VARCHAR(180) NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_fee_demands_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_fee_demands_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_fee_demands_student FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE fee_payments (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    demand_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    recorded_by_user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    payment_reference VARCHAR(120),
    receipt_number VARCHAR(80) NOT NULL,
    paid_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_fee_payments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_fee_payments_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_fee_payments_demand FOREIGN KEY (demand_id) REFERENCES fee_demands(id),
    CONSTRAINT fk_fee_payments_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_fee_payments_recorded_by FOREIGN KEY (recorded_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT uk_fee_payments_receipt_number UNIQUE (receipt_number)
);

CREATE INDEX idx_fee_demands_school_student ON fee_demands(school_id, student_id);
CREATE INDEX idx_fee_demands_student ON fee_demands(student_id);
CREATE INDEX idx_fee_payments_demand ON fee_payments(demand_id);
CREATE INDEX idx_fee_payments_school_student ON fee_payments(school_id, student_id);
