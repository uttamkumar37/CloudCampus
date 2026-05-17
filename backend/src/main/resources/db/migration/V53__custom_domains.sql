-- CC-0212: Custom domain verification workflow
-- Allows a tenant to map a custom domain (e.g. erp.myschool.edu) to their CloudCampus portal.
-- Verification uses a DNS TXT record: _cloudcampus-verify.<domain> = <token>

CREATE TABLE custom_domains (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain              VARCHAR(255) NOT NULL,
    verification_token  VARCHAR(64)  NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',  -- PENDING | VERIFIED | FAILED
    verified_at         TIMESTAMPTZ,
    last_checked_at     TIMESTAMPTZ,
    failure_reason      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT custom_domains_tenant_domain_unique UNIQUE (tenant_id, domain),
    CONSTRAINT custom_domains_status_check CHECK (status IN ('PENDING','VERIFIED','FAILED'))
);

CREATE INDEX idx_custom_domains_tenant_id ON custom_domains(tenant_id);
CREATE INDEX idx_custom_domains_domain     ON custom_domains(domain);
