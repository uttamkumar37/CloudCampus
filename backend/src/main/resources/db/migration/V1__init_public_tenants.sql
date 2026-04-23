CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL UNIQUE,
    school_name VARCHAR(150) NOT NULL,
    schema_name VARCHAR(63) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id ON public.tenants (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_schema_name ON public.tenants (schema_name);
