-- DSEP Phase 8 seed data for expansion domains

INSERT INTO platform_website_templates (
    id, template_key, name, category, status, preview_image_url, tags_json, schema_json,
    default_branding_json, usage_count, published, published_at, created_at, updated_at
)
VALUES
(
    'e7800000-0000-0000-0000-000000000101',
    'template-k12-modern',
    'K12 Modern Growth Site',
    'K12',
    'PUBLISHED',
    'https://cdn.cloudcampus.app/templates/k12-modern.png',
    '["admissions","growth","school-owner"]',
    '{"sections":["hero","proof","features","cta"],"widgets":["roi-calculator","lead-form"]}',
    '{"brandCode":"GROWTH_EMBER"}',
    42,
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    'e7800000-0000-0000-0000-000000000102',
    'template-enterprise-trust',
    'Enterprise Trust Experience',
    'ENTERPRISE',
    'PUBLISHED',
    'https://cdn.cloudcampus.app/templates/enterprise-trust.png',
    '["security","compliance","enterprise"]',
    '{"sections":["hero","architecture","security","sla","cta"],"widgets":["uptime","audit-evidence"]}',
    '{"brandCode":"ENT_SKY"}',
    17,
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (template_key) DO NOTHING;

INSERT INTO platform_story_scenes (
    id, scene_key, title, audience_type, status, timeline_json, proof_points_json,
    animation_json, published, published_at, created_at, updated_at
)
VALUES
(
    'e7800000-0000-0000-0000-000000000201',
    'story-investor-scale',
    'Investor Scale Narrative',
    'INVESTOR',
    'PUBLISHED',
    '{"acts":["problem","traction","economics","vision"]}',
    '["520 schools onboarded","124% NRR","24 month runway"]',
    '{"preset":"confidence-rise","durationMs":4200}',
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    'e7800000-0000-0000-0000-000000000202',
    'story-principal-outcomes',
    'Principal Outcomes Journey',
    'PRINCIPAL',
    'PUBLISHED',
    '{"acts":["chaos","visibility","intervention","results"]}',
    '["17% faster intervention cycles","Improved attendance tracking"]',
    '{"preset":"focus-flow","durationMs":3600}',
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (scene_key) DO NOTHING;

INSERT INTO platform_trust_modules (
    id, module_key, title, category, status, evidence_json, metrics_json, display_json,
    published, published_at, created_at, updated_at
)
VALUES
(
    'e7800000-0000-0000-0000-000000000301',
    'trust-security-core',
    'Security Posture Core',
    'SECURITY',
    'PUBLISHED',
    '{"controls":["JWT auth","RBAC","tenant isolation","audit logs"]}',
    '{"uptime":"99.95%","criticalIncidents":"0"}',
    '{"priority":1,"badge":"Security Verified"}',
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    'e7800000-0000-0000-0000-000000000302',
    'trust-compliance-overview',
    'Compliance and Governance Overview',
    'COMPLIANCE',
    'PUBLISHED',
    '{"artifacts":["access reviews","change audit","backup drills"]}',
    '{"policyCoverage":"100%","lastDrillDaysAgo":18}',
    '{"priority":2,"badge":"Governance Ready"}',
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (module_key) DO NOTHING;
