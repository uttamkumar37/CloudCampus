-- V23: Fee structures — defines the amount charged per category per class/year.
-- class_id is nullable (null = school-wide / all classes).
-- Part of CC-0901 Fee Structure Engine.

CREATE TABLE fee_structures (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID          NOT NULL,
    school_id        UUID          NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID          NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    class_id         UUID                   REFERENCES classes(id) ON DELETE SET NULL,
    fee_category_id  UUID          NOT NULL REFERENCES fee_categories(id) ON DELETE RESTRICT,
    amount           NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    due_date         DATE,
    frequency        VARCHAR(20)   NOT NULL DEFAULT 'ANNUAL'
                     CHECK (frequency IN ('ANNUAL','TERM','MONTHLY','ONE_TIME')),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_fee_structure UNIQUE (school_id, academic_year_id, class_id, fee_category_id)
);

CREATE INDEX idx_fee_structures_school_year ON fee_structures(school_id, academic_year_id);
CREATE INDEX idx_fee_structures_class        ON fee_structures(class_id);
CREATE INDEX idx_fee_structures_tenant       ON fee_structures(tenant_id);
