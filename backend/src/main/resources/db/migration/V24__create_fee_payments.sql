-- V24: Student fee records (invoices) and payment transactions.
-- Part of CC-0902 Fee Collection + CC-0905 Receipt Generation.

-- Per-student invoice generated from a fee_structure row.
CREATE TABLE student_fee_records (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID          NOT NULL,
    school_id        UUID          NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id       UUID          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID          NOT NULL REFERENCES fee_structures(id) ON DELETE RESTRICT,
    academic_year_id UUID          NOT NULL REFERENCES academic_years(id),
    amount_due       NUMERIC(12,2) NOT NULL CHECK (amount_due >= 0),
    amount_paid      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    discount         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    due_date         DATE,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','PARTIAL','PAID','WAIVED','OVERDUE')),
    notes            VARCHAR(500),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_fee_record UNIQUE (student_id, fee_structure_id)
);

CREATE INDEX idx_sfr_student         ON student_fee_records(student_id);
CREATE INDEX idx_sfr_school_year     ON student_fee_records(school_id, academic_year_id);
CREATE INDEX idx_sfr_status          ON student_fee_records(status);
CREATE INDEX idx_sfr_tenant          ON student_fee_records(tenant_id);

-- Individual payment transactions against a student fee record.
CREATE TABLE fee_payments (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    student_fee_record_id UUID          NOT NULL REFERENCES student_fee_records(id) ON DELETE CASCADE,
    amount                NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date          DATE          NOT NULL DEFAULT CURRENT_DATE,
    payment_mode          VARCHAR(20)   NOT NULL
                          CHECK (payment_mode IN ('CASH','CHEQUE','ONLINE','UPI','DD','BANK_TRANSFER')),
    reference_number      VARCHAR(100),
    receipt_number        VARCHAR(50)   UNIQUE,
    collected_by_staff_id UUID          REFERENCES staff(id) ON DELETE SET NULL,
    remarks               VARCHAR(300),
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fee_payments_record ON fee_payments(student_fee_record_id);
CREATE INDEX idx_fee_payments_date   ON fee_payments(payment_date);
