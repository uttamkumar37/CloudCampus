-- Global Public Website Platform tables (super-admin managed, tenant-agnostic)

CREATE TABLE platform_website_pages (
    id UUID PRIMARY KEY,
    page_key VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    seo_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_website_sections (
    id UUID PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES platform_website_pages(id) ON DELETE CASCADE,
    section_key VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    section_type VARCHAR(80) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_platform_website_section_key UNIQUE (page_id, section_key)
);

CREATE TABLE platform_website_themes (
    id UUID PRIMARY KEY,
    theme_key VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    tokens_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    typography_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    effects_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_website_navigation (
    id UUID PRIMARY KEY,
    label VARCHAR(120) NOT NULL,
    path VARCHAR(255) NOT NULL,
    target VARCHAR(20) NOT NULL DEFAULT 'SAME_TAB',
    group_name VARCHAR(80) NOT NULL DEFAULT 'primary',
    position INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_platform_website_navigation_path UNIQUE (path, group_name)
);

CREATE TABLE platform_website_seo_settings (
    id UUID PRIMARY KEY,
    page_id UUID NULL REFERENCES platform_website_pages(id) ON DELETE SET NULL,
    route_path VARCHAR(255) NOT NULL UNIQUE,
    meta_title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(1000) NOT NULL,
    open_graph_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    twitter_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    structured_data_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    robots VARCHAR(120) NOT NULL DEFAULT 'index,follow',
    sitemap_priority NUMERIC(3,2) NOT NULL DEFAULT 0.50,
    sitemap_change_freq VARCHAR(40) NOT NULL DEFAULT 'weekly',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_website_publish_snapshots (
    id UUID PRIMARY KEY,
    version_label VARCHAR(120) NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pwp_slug_published ON platform_website_pages(slug, published);
CREATE INDEX idx_pws_page_position ON platform_website_sections(page_id, position);
CREATE INDEX idx_pwn_group_position ON platform_website_navigation(group_name, position);
CREATE INDEX idx_pwseo_route_published ON platform_website_seo_settings(route_path, published);
