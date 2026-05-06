-- V8: Website CMS tables (public schema, tenant-aware via tenant_id)

CREATE TABLE IF NOT EXISTS public.website_config (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        VARCHAR(50)  NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
    school_tagline   VARCHAR(255),
    school_email     VARCHAR(150),
    school_phone     VARCHAR(50),
    school_address   TEXT,
    school_city      VARCHAR(100),
    school_state     VARCHAR(100),
    school_country   VARCHAR(100) DEFAULT 'India',
    school_pincode   VARCHAR(20),
    hero_image_url   VARCHAR(500),
    about_text       TEXT,
    vision_text      TEXT,
    mission_text     TEXT,
    facebook_url     VARCHAR(500),
    twitter_url      VARCHAR(500),
    instagram_url    VARCHAR(500),
    youtube_url      VARCHAR(500),
    admissions_open  BOOLEAN      NOT NULL DEFAULT FALSE,
    admission_info   TEXT,
    theme_color      VARCHAR(20)  DEFAULT '#10b981',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (tenant_id)
);

CREATE TABLE IF NOT EXISTS public.website_sections (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    VARCHAR(50)  NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
    section_key  VARCHAR(50)  NOT NULL,  -- hero, about, gallery, admissions, contact, notices, faculty
    title        VARCHAR(255),
    subtitle     VARCHAR(500),
    body_json    JSONB,                  -- flexible per-section content
    display_order INT         NOT NULL DEFAULT 0,
    visible      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, section_key)
);

CREATE TABLE IF NOT EXISTS public.website_gallery (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   VARCHAR(50)  NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    caption     VARCHAR(255),
    display_order INT        NOT NULL DEFAULT 0,
    visible     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admission_leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50)  NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
    parent_name     VARCHAR(150) NOT NULL,
    parent_email    VARCHAR(150),
    parent_phone    VARCHAR(30)  NOT NULL,
    student_name    VARCHAR(150) NOT NULL,
    applying_class  VARCHAR(50),
    message         TEXT,
    status          VARCHAR(20)  NOT NULL DEFAULT 'NEW',  -- NEW, CONTACTED, CONVERTED, REJECTED
    submitted_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_website_config_tenant   ON public.website_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_tenant ON public.website_sections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gallery_tenant          ON public.website_gallery(tenant_id);
CREATE INDEX IF NOT EXISTS idx_admission_leads_tenant  ON public.admission_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_admission_leads_status  ON public.admission_leads(status);
