-- Seed baseline global website pages and navigation

INSERT INTO platform_website_pages (
    id, page_key, title, slug, status, seo_json, settings_json, version, published, published_at, is_deleted, created_at, updated_at
)
VALUES
    (
        gen_random_uuid(),
        'home',
        'CloudCampus - AI Native School ERP Platform',
        'home',
        'PUBLISHED',
        jsonb_build_object('title', 'CloudCampus | AI Native School ERP', 'description', 'CloudCampus unifies ERP, AI, mobile, analytics, and public website operations for modern institutions.'),
        jsonb_build_object('heroStyle', 'enterprise-gradient', 'showcase', jsonb_build_array('ai', 'erp', 'mobile', 'investor-ready')),
        1,
        TRUE,
        NOW(),
        FALSE,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'features',
        'Platform Features',
        'features',
        'PUBLISHED',
        jsonb_build_object('title', 'Features | CloudCampus', 'description', 'Explore ERP, AI, analytics, and website platform capabilities.'),
        '{}'::jsonb,
        1,
        TRUE,
        NOW(),
        FALSE,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'ai',
        'AI Platform',
        'ai',
        'PUBLISHED',
        jsonb_build_object('title', 'AI | CloudCampus', 'description', 'AI prompt governance, usage analytics, and automation for school operations.'),
        '{}'::jsonb,
        1,
        TRUE,
        NOW(),
        FALSE,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'investors',
        'Investor Readiness',
        'investors',
        'PUBLISHED',
        jsonb_build_object('title', 'Investors | CloudCampus', 'description', 'Growth metrics, architecture strategy, and scaling roadmap.'),
        '{}'::jsonb,
        1,
        TRUE,
        NOW(),
        FALSE,
        NOW(),
        NOW()
    );

INSERT INTO platform_website_navigation (
    id, label, path, target, group_name, position, visible, status, published, published_at, is_deleted, created_at, updated_at
)
VALUES
    (gen_random_uuid(), 'Home', '/', 'SAME_TAB', 'primary', 1, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW()),
    (gen_random_uuid(), 'Features', '/features', 'SAME_TAB', 'primary', 2, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW()),
    (gen_random_uuid(), 'Platform', '/platform', 'SAME_TAB', 'primary', 3, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW()),
    (gen_random_uuid(), 'AI', '/ai', 'SAME_TAB', 'primary', 4, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW()),
    (gen_random_uuid(), 'Investors', '/investors', 'SAME_TAB', 'primary', 5, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW()),
    (gen_random_uuid(), 'Demo', '/demo', 'SAME_TAB', 'primary', 6, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW()),
    (gen_random_uuid(), 'Pricing', '/pricing', 'SAME_TAB', 'primary', 7, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW()),
    (gen_random_uuid(), 'Contact', '/contact', 'SAME_TAB', 'primary', 8, TRUE, 'PUBLISHED', TRUE, NOW(), FALSE, NOW(), NOW());

INSERT INTO platform_website_themes (
    id, theme_key, name, status, tokens_json, typography_json, effects_json, published, published_at, is_deleted, created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    'enterprise-aurora',
    'Enterprise Aurora',
    'PUBLISHED',
    jsonb_build_object('primary', '#0B2A4A', 'accent', '#12B5CB', 'surface', '#F2F6FA', 'gradient', 'linear-gradient(125deg,#0B2A4A,#0A5C7A,#12B5CB)'),
    jsonb_build_object('heading', 'Space Grotesk', 'body', 'Manrope', 'mono', 'IBM Plex Mono'),
    jsonb_build_object('motion', 'smooth', 'glass', true, 'darkMode', true),
    TRUE,
    NOW(),
    FALSE,
    NOW(),
    NOW()
);
