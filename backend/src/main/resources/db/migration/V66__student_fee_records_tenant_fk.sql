-- L-14: student_fee_records.tenant_id was indexed but had no FK to tenants(id),
-- allowing orphan rows after a tenant is deleted and making the join unverified
-- at the DB level. Add the constraint; the column is NOT NULL so no backfill needed.
ALTER TABLE student_fee_records
    ADD CONSTRAINT fk_sfr_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id);
