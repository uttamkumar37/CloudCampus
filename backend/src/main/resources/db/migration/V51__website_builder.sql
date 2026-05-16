-- V51: Website Builder foundation (CC-2001/2002/2003/2004).
-- Every school gets one website record (auto-created on tenant onboarding).
-- Pages contain ordered sections; nav items build the public menu.

-- ── Website (one per school) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS websites (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id   UUID        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    published   BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT  uq_website_school UNIQUE (school_id)
);

CREATE INDEX IF NOT EXISTS idx_websites_tenant ON websites (tenant_id);

-- ── Pages ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS website_pages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id       UUID        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) NOT NULL,
    seo_title       VARCHAR(200),
    seo_description VARCHAR(500),
    published       BOOLEAN     NOT NULL DEFAULT false,
    display_order   INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_page_school_slug UNIQUE (school_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_website_pages_school ON website_pages (school_id, published);

-- ── Sections (content blocks within a page) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS website_sections (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    page_id      UUID        NOT NULL REFERENCES website_pages(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL,   -- HERO | TEXT | STATS | GALLERY | CTA | CONTACT
    position     INTEGER     NOT NULL DEFAULT 0,
    content      JSONB       NOT NULL DEFAULT '{}',
    visible      BOOLEAN     NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_website_sections_page ON website_sections (page_id, position);

-- ── Navigation items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS website_nav_items (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    label     VARCHAR(100) NOT NULL,
    url       VARCHAR(500),
    page_id   UUID        REFERENCES website_pages(id) ON DELETE SET NULL,
    position  INTEGER     NOT NULL DEFAULT 0,
    parent_id UUID        REFERENCES website_nav_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nav_items_school ON website_nav_items (school_id, position);
