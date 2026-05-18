-- DSEP Phase 2: Seed default demo scenarios
-- Three out-of-the-box scenarios covering key Indian school archetypes.

INSERT INTO platform_demo_scenarios (id, name, slug, description, school_profile, features_json, data_seed_ref, session_ttl_min, display_order, status)
VALUES
(
    'e0000001-0000-0000-0000-000000000001',
    'CBSE Urban School',
    'cbse-urban',
    'Experience CloudCampus as a typical CBSE urban school with 1200 students across Grades 1-12',
    '{"type":"CBSE","size":"MEDIUM","studentCount":1200,"gradeRange":"1-12","country":"IN","city":"Delhi","curriculum":"CBSE"}',
    '["ATTENDANCE","FEE_MANAGEMENT","HOMEWORK","EXAM","TIMETABLE","NOTICE_BOARD","PARENT_PORTAL","REPORT_CARDS"]',
    'cbse_urban_seed',
    45,
    1,
    'ACTIVE'
),
(
    'e0000001-0000-0000-0000-000000000002',
    'ICSE Boarding School',
    'icse-boarding',
    'Explore hostel management, strict attendance, and competitive exam prep for an ICSE boarding school',
    '{"type":"ICSE","size":"LARGE","studentCount":800,"gradeRange":"5-12","country":"IN","city":"Pune","curriculum":"ICSE","boarding":true}',
    '["ATTENDANCE","FEE_MANAGEMENT","HOMEWORK","EXAM","TIMETABLE","NOTICE_BOARD","PARENT_PORTAL","HOSTEL_MANAGEMENT","REPORT_CARDS"]',
    'icse_boarding_seed',
    45,
    2,
    'ACTIVE'
),
(
    'e0000001-0000-0000-0000-000000000003',
    'International IB School',
    'ib-international',
    'See how CloudCampus supports an IB PYP/MYP/DP school with multi-currency fees and global parent access',
    '{"type":"IB","size":"SMALL","studentCount":350,"gradeRange":"K-12","country":"IN","city":"Bangalore","curriculum":"IB","international":true}',
    '["ATTENDANCE","FEE_MANAGEMENT","HOMEWORK","EXAM","TIMETABLE","NOTICE_BOARD","PARENT_PORTAL","REPORT_CARDS","WEBSITE_BUILDER"]',
    'ib_international_seed',
    60,
    3,
    'ACTIVE'
);

-- Default global content blocks for the CloudCampus marketing site
INSERT INTO platform_content_blocks (id, tenant_id, block_key, block_type, content_json, locale, version, published, published_at)
VALUES
(
    'b0000001-0000-0000-0000-000000000001',
    NULL, 'hero.headline', 'TEXT',
    '{"value":"The All-in-One School Management Platform"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000002',
    NULL, 'hero.subtext', 'TEXT',
    '{"value":"Attendance, fees, exams, communication, and AI — unified for every Indian school, from 50 to 50,000 students."}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000003',
    NULL, 'hero.cta_primary', 'JSON',
    '{"label":"Start Free Demo","url":"/demo","variant":"primary"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000004',
    NULL, 'hero.cta_secondary', 'JSON',
    '{"label":"Watch 2-min Tour","url":"/tour","variant":"secondary"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000005',
    NULL, 'stats.schools', 'JSON',
    '{"value":"500+","label":"Schools Onboarded","icon":"school"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000006',
    NULL, 'stats.students', 'JSON',
    '{"value":"2L+","label":"Students Managed","icon":"students"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000007',
    NULL, 'stats.uptime', 'JSON',
    '{"value":"99.9%","label":"Uptime SLA","icon":"uptime"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000008',
    NULL, 'stats.nps', 'JSON',
    '{"value":"72","label":"Net Promoter Score","icon":"nps"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000009',
    NULL, 'nav.brand_name', 'TEXT',
    '{"value":"CloudCampus"}',
    'en', 1, true, NOW()
),
(
    'b0000001-0000-0000-0000-000000000010',
    NULL, 'footer.tagline', 'TEXT',
    '{"value":"Built for India. Ready for the world."}',
    'en', 1, true, NOW()
);

DO $$ BEGIN RAISE NOTICE 'DSEP seed complete — 3 demo scenarios, 10 content blocks inserted.'; END $$;
