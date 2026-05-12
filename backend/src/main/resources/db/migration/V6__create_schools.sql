-- V6: Schools table — first-class School entity (EUP-070 / CC-0213).
--
-- Design decisions:
--   A tenant can contain one or more schools (school groups / trusts).
--   Every domain entity (Student, Class, Attendance, Fee) must reference
--   BOTH tenant_id AND school_id to support multi-school tenants.
--
--   code is unique within a tenant (uq_schools_tenant_code).
--   Short, human-readable — e.g. "MAIN", "NORTH", "BRANCH_01".
--
--   When a tenant is created, TenantServiceImpl auto-inserts a default row
--   (code = "MAIN") so the data model is always consistent.
--
--   status: ACTIVE | INACTIVE  (no physical delete — referential integrity).

CREATE TABLE IF NOT EXISTS schools (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID         NOT NULL REFERENCES tenants(id),
    name       VARCHAR(300) NOT NULL,
    code       VARCHAR(64)  NOT NULL,
    address    VARCHAR(500),
    phone      VARCHAR(30),
    email      VARCHAR(200),
    logo_url   VARCHAR(500),
    status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_schools_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT chk_schools_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- List all schools for a tenant (most common query pattern).
CREATE INDEX IF NOT EXISTS idx_schools_tenant_id ON schools(tenant_id);

-- Status filter for active schools.
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(tenant_id, status);
