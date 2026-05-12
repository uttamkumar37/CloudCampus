-- V22: Fee categories — named fee heads for a school (e.g. Tuition, Library, Sports).
-- Part of CC-0901 Fee Structure Engine.

CREATE TABLE fee_categories (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID          NOT NULL,
    school_id   UUID          NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name        VARCHAR(100)  NOT NULL,
    description VARCHAR(500),
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_fee_category_school_name UNIQUE (school_id, name)
);

CREATE INDEX idx_fee_categories_school      ON fee_categories(school_id);
CREATE INDEX idx_fee_categories_tenant      ON fee_categories(tenant_id);
