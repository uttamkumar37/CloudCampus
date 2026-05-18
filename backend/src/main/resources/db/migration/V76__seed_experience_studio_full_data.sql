-- DSEP Phase 7: Full Experience Studio seed data
-- Populates branding, website routes, stakeholder journeys, presentations,
-- campaigns, investor rooms, and additional content blocks.

-- -----------------------------------------------------------------------------
-- Branding systems
-- -----------------------------------------------------------------------------
INSERT INTO platform_brand_systems (
    id, name, code, status, token_json, typography_json, motion_json,
    version, published, published_at, created_at, updated_at
)
VALUES
(
    'e7600000-0000-0000-0000-000000000001',
    'Enterprise Sky',
    'ENT_SKY',
    'PUBLISHED',
    '{"colors":{"primary":"#0ea5e9","secondary":"#0f172a","accent":"#14b8a6","surface":"#f8fafc"},"radius":{"card":"16"},"spacing":{"section":"80"}}',
    '{"headingFont":"Sora","bodyFont":"Source Sans 3","scale":"enterprise"}',
    '{"preset":"confident-enterprise","durationMs":220}',
    1,
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    'e7600000-0000-0000-0000-000000000002',
    'Growth Ember',
    'GROWTH_EMBER',
    'PUBLISHED',
    '{"colors":{"primary":"#ea580c","secondary":"#111827","accent":"#f59e0b","surface":"#fff7ed"},"radius":{"card":"14"},"spacing":{"section":"72"}}',
    '{"headingFont":"Manrope","bodyFont":"Inter","scale":"growth"}',
    '{"preset":"velocity-story","durationMs":200}',
    1,
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Website routes (published)
-- -----------------------------------------------------------------------------
INSERT INTO platform_website_routes (
    id, route_path, audience_type, title, status, seo_json, layout_json, cta_json,
    published, published_at, created_at, updated_at
)
VALUES
('e7600000-0000-0000-0000-000000000101','/investors','INVESTOR','Investor Experience','PUBLISHED','{"title":"CloudCampus for Investors","description":"Scalable multi-tenant AI-native school ERP investment story"}','{"sections":["hero","market","traction","unit-economics","roadmap","cta"],"header":"investor"}','{"primary":{"label":"Request Data Room","href":"/investor/room"},"secondary":{"label":"Book Founder Call","href":"/contact"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000102','/school-owners','SCHOOL_OWNER','School Owner Experience','PUBLISHED','{"title":"CloudCampus ROI for School Owners","description":"Admissions, fee automation, parent engagement and multi-campus control"}','{"sections":["hero","roi","automation","ai","proof","cta"],"header":"sales"}','{"primary":{"label":"Get ROI Demo","href":"/demo"},"secondary":{"label":"Talk to Consultant","href":"/contact"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000103','/principals','PRINCIPAL','Principal Experience','PUBLISHED','{"title":"CloudCampus for Principals","description":"Operational clarity, academic analytics, and staff performance visibility"}','{"sections":["hero","academic-ops","analytics","alerts","cta"],"header":"trust"}','{"primary":{"label":"Start Guided Tour","href":"/demo"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000104','/teachers','TEACHER','Teacher Experience','PUBLISHED','{"title":"CloudCampus for Teachers","description":"AI lesson planning, attendance, homework, and student insights"}','{"sections":["hero","teacher-tools","ai-copilot","results","cta"],"header":"product"}','{"primary":{"label":"Try Teacher Demo","href":"/demo"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000105','/parents','PARENT','Parent Experience','PUBLISHED','{"title":"CloudCampus for Parents","description":"Attendance, fees, homework, transport, and personalized updates"}','{"sections":["hero","parent-app","payments","notifications","cta"],"header":"parent"}','{"primary":{"label":"See Parent App","href":"/demo"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000106','/students','STUDENT','Student Experience','PUBLISHED','{"title":"CloudCampus for Students","description":"Assignments, timetable, progress analytics, and AI learning support"}','{"sections":["hero","student-portal","performance","learning","cta"],"header":"student"}','{"primary":{"label":"Explore Student Journey","href":"/demo"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000107','/franchise-partners','FRANCHISE_PARTNER','Franchise Partner Experience','PUBLISHED','{"title":"CloudCampus Franchise Operating System","description":"Scale school networks with centralized governance and local flexibility"}','{"sections":["hero","governance","ops","reporting","cta"],"header":"enterprise"}','{"primary":{"label":"Partner With Us","href":"/contact"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000108','/government','GOVERNMENT_AUTHORITY','Government Authority Experience','PUBLISHED','{"title":"CloudCampus for Education Authorities","description":"Compliance, district analytics, and secure multi-school oversight"}','{"sections":["hero","compliance","district-analytics","security","cta"],"header":"gov"}','{"primary":{"label":"Request Policy Demo","href":"/contact"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000109','/enterprise','ENTERPRISE_CUSTOMER','Enterprise Customer Experience','PUBLISHED','{"title":"CloudCampus Enterprise Platform","description":"Enterprise integrations, SSO, data governance, and SLA-backed reliability"}','{"sections":["hero","integrations","security","scale","cta"],"header":"enterprise"}','{"primary":{"label":"Book Enterprise Demo","href":"/contact"}}',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000110','/campaign/back-to-school','MARKETING_CAMPAIGN','Back To School Campaign','PUBLISHED','{"title":"Back To School Growth Suite","description":"Admissions acceleration and campaign conversion workflows"}','{"sections":["hero","offer","proof","form","cta"],"header":"campaign"}','{"primary":{"label":"Activate Campaign","href":"/contact"}}',true,NOW(),NOW(),NOW())
ON CONFLICT (route_path) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Stakeholder journeys (published)
-- -----------------------------------------------------------------------------
INSERT INTO platform_stakeholder_journeys (
    id, stakeholder_type, journey_key, name, conversion_goal, status,
    narrative_json, touchpoints_json, published, published_at, created_at, updated_at
)
VALUES
('e7600000-0000-0000-0000-000000000201','INVESTOR','investor-growth-story','Investor Growth Story','Schedule diligence walkthrough','PUBLISHED','{"hero":"AI-native school ERP with defensible multi-tenant architecture","proof":"ARR growth, retention, expansion","emotion":"confidence"}','[{"type":"landing"},{"type":"metrics"},{"type":"data-room"},{"type":"founder-call"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000202','SCHOOL_OWNER','school-owner-roi','School Owner ROI Journey','Book ROI consultation','PUBLISHED','{"hero":"Automate operations and improve collections","proof":"reduced admin hours and faster fee closure","emotion":"clarity"}','[{"type":"landing"},{"type":"roi-calculator"},{"type":"demo"},{"type":"consultation"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000203','PRINCIPAL','principal-operational-command','Principal Operational Command','Start principal onboarding','PUBLISHED','{"hero":"Centralized academic and operational visibility","proof":"faster interventions and better outcomes","emotion":"control"}','[{"type":"landing"},{"type":"analytics"},{"type":"workflow-tour"},{"type":"onboarding"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000204','TEACHER','teacher-ai-productivity','Teacher AI Productivity','Activate teacher pilot','PUBLISHED','{"hero":"Reduce repetitive tasks with AI copilot","proof":"faster lesson prep and grading workflows","emotion":"empowerment"}','[{"type":"landing"},{"type":"lesson-plans"},{"type":"classroom-workflow"},{"type":"pilot"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000205','PARENT','parent-trust-loop','Parent Trust Loop','Install parent app','PUBLISHED','{"hero":"Always know attendance, fees, and learning status","proof":"high parent engagement and timely payment","emotion":"trust"}','[{"type":"landing"},{"type":"app-preview"},{"type":"notifications"},{"type":"install"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000206','STUDENT','student-progress-path','Student Progress Path','Activate student account','PUBLISHED','{"hero":"Organized homework, timetable, and progress signals","proof":"consistent completion and performance gains","emotion":"motivation"}','[{"type":"landing"},{"type":"student-dashboard"},{"type":"learning-assistant"},{"type":"activate"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000207','FRANCHISE_PARTNER','franchise-scale-engine','Franchise Scale Engine','Submit franchise interest','PUBLISHED','{"hero":"Standardized governance across multi-school franchises","proof":"faster launch and stronger compliance","emotion":"expansion"}','[{"type":"landing"},{"type":"governance"},{"type":"network-metrics"},{"type":"interest-form"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000208','GOVERNMENT_AUTHORITY','gov-compliance-overview','Authority Compliance Overview','Request policy alignment workshop','PUBLISHED','{"hero":"Secure district-level education monitoring","proof":"compliance and aggregate analytics","emotion":"assurance"}','[{"type":"landing"},{"type":"compliance"},{"type":"district-dashboard"},{"type":"workshop"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000209','ENTERPRISE_CUSTOMER','enterprise-procurement-flow','Enterprise Procurement Flow','Start enterprise evaluation','PUBLISHED','{"hero":"Enterprise-grade controls, integrations, and SLA reliability","proof":"security, uptime, governance","emotion":"certainty"}','[{"type":"landing"},{"type":"security-review"},{"type":"integration-plan"},{"type":"evaluation"}]',true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000210','MARKETING_CAMPAIGN','campaign-conversion-loop','Campaign Conversion Loop','Capture qualified lead','PUBLISHED','{"hero":"Targeted campaign narrative with conversion routing","proof":"higher conversion and lower CAC","emotion":"urgency"}','[{"type":"landing"},{"type":"offer"},{"type":"lead-form"},{"type":"nurture"}]',true,NOW(),NOW(),NOW())
ON CONFLICT (stakeholder_type, journey_key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Investor room + sections
-- -----------------------------------------------------------------------------
INSERT INTO platform_investor_rooms (
    id, room_code, title, access_mode, expires_at, content_json, branding_json,
    status, created_at, updated_at
)
VALUES
(
    'e7600000-0000-0000-0000-000000000301',
    'INV-CC-2026-A',
    'CloudCampus Series A Data Room',
    'LINK_ONLY',
    NOW() + INTERVAL '180 days',
    '{"summary":"Due diligence room with traction, architecture, and roadmap artifacts"}',
    '{"brandCode":"ENT_SKY"}',
    'ACTIVE',
    NOW(),
    NOW()
)
ON CONFLICT (room_code) DO NOTHING;

INSERT INTO platform_investor_room_sections (id, room_id, position, section_type, content_json, visibility, created_at)
VALUES
('e7600000-0000-0000-0000-000000000311','e7600000-0000-0000-0000-000000000301',1,'METRICS_DASHBOARD','{"arr":"$4.2M","nrr":"124%","grossMargin":"78%"}','VISIBLE',NOW()),
('e7600000-0000-0000-0000-000000000312','e7600000-0000-0000-0000-000000000301',2,'TRACTION','{"schools":520,"students":215000,"regions":28}','VISIBLE',NOW()),
('e7600000-0000-0000-0000-000000000313','e7600000-0000-0000-0000-000000000301',3,'PRODUCT_DEMO','{"demoLink":"/demo","notes":"Role-switch enabled"}','VISIBLE',NOW()),
('e7600000-0000-0000-0000-000000000314','e7600000-0000-0000-0000-000000000301',4,'FINANCIALS','{"burnMultiple":"1.4","runwayMonths":24}','VISIBLE',NOW())
ON CONFLICT (room_id, position) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Presentations + slides
-- -----------------------------------------------------------------------------
INSERT INTO platform_presentations (
    id, title, slug, audience_type, status, meta_json, branding_json, created_at, updated_at
)
VALUES
('e7600000-0000-0000-0000-000000000401','Investor Board Narrative 2026','investor-board-2026','INVESTOR','PUBLISHED','{"theme":"fundraise"}','{"brandCode":"ENT_SKY"}',NOW(),NOW()),
('e7600000-0000-0000-0000-000000000402','School Owner ROI Deck','school-owner-roi-deck','SCHOOL_OWNER','PUBLISHED','{"theme":"sales"}','{"brandCode":"GROWTH_EMBER"}',NOW(),NOW()),
('e7600000-0000-0000-0000-000000000403','AI Product Walkthrough','ai-product-walkthrough','GENERAL','PUBLISHED','{"theme":"product"}','{"brandCode":"ENT_SKY"}',NOW(),NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO platform_presentation_slides (
    id, presentation_id, position, slide_type, content_json, animation_json, speaker_notes, created_at
)
VALUES
('e7600000-0000-0000-0000-000000000411','e7600000-0000-0000-0000-000000000401',1,'TITLE','{"title":"CloudCampus: Category Leadership in School ERP"}','{"preset":"fade-up"}','Open with market context',NOW()),
('e7600000-0000-0000-0000-000000000412','e7600000-0000-0000-0000-000000000401',2,'METRICS','{"arr":"$4.2M","nrr":"124%","logos":520}','{"preset":"stagger-bars"}','Highlight efficiency and retention',NOW()),
('e7600000-0000-0000-0000-000000000413','e7600000-0000-0000-0000-000000000402',1,'TITLE','{"title":"ROI Framework for School Owners"}','{"preset":"fade-up"}','Focus on admissions and collections',NOW()),
('e7600000-0000-0000-0000-000000000414','e7600000-0000-0000-0000-000000000402',2,'COMPARISON','{"before":"manual workflows","after":"automated operations"}','{"preset":"split-reveal"}','Drive urgency',NOW()),
('e7600000-0000-0000-0000-000000000415','e7600000-0000-0000-0000-000000000403',1,'TITLE','{"title":"AI Copilots Across School Workflows"}','{"preset":"fade-up"}','Show AI-native platform position',NOW()),
('e7600000-0000-0000-0000-000000000416','e7600000-0000-0000-0000-000000000403',2,'CHART','{"usageGrowth":"3.2x","assistantSessions":184000}','{"preset":"chart-grow"}','Show adoption trajectory',NOW())
ON CONFLICT (presentation_id, position) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Marketing campaigns + steps
-- -----------------------------------------------------------------------------
INSERT INTO platform_campaigns (
    id, name, campaign_type, audience_filter, trigger_type, trigger_config,
    status, created_at, updated_at
)
VALUES
('e7600000-0000-0000-0000-000000000501','Investor Follow-Up Drip','EMAIL_DRIP','{"audience":"INVESTOR"}','DEMO_COMPLETE','{"scenario":"cbse-urban"}','ACTIVE',NOW(),NOW()),
('e7600000-0000-0000-0000-000000000502','School Owner Conversion Flow','IN_APP','{"audience":"SCHOOL_OWNER"}','PAGE_VIEW','{"path":"/school-owners"}','ACTIVE',NOW(),NOW()),
('e7600000-0000-0000-0000-000000000503','Back To School Lead Capture','WEBHOOK','{"audience":"MARKETING_CAMPAIGN"}','SIGNUP','{"campaign":"back-to-school"}','ACTIVE',NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO platform_campaign_steps (
    id, campaign_id, position, delay_minutes, action_type, action_config, created_at
)
VALUES
('e7600000-0000-0000-0000-000000000511','e7600000-0000-0000-0000-000000000501',1,0,'SEND_EMAIL','{"template":"investor_thank_you"}',NOW()),
('e7600000-0000-0000-0000-000000000512','e7600000-0000-0000-0000-000000000501',2,120,'SEND_EMAIL','{"template":"investor_metrics_pack"}',NOW()),
('e7600000-0000-0000-0000-000000000513','e7600000-0000-0000-0000-000000000502',1,0,'SHOW_POPUP','{"message":"Book ROI demo"}',NOW()),
('e7600000-0000-0000-0000-000000000514','e7600000-0000-0000-0000-000000000502',2,60,'TAG_LEAD','{"tag":"warm_school_owner"}',NOW()),
('e7600000-0000-0000-0000-000000000515','e7600000-0000-0000-0000-000000000503',1,0,'SEND_WEBHOOK','{"endpoint":"crm.leads.capture"}',NOW())
ON CONFLICT (campaign_id, position) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Additional content blocks for trust/AI/storytelling modules
-- -----------------------------------------------------------------------------
INSERT INTO platform_content_blocks (
    id, tenant_id, block_key, block_type, content_json, locale, version,
    published, published_at, created_at, updated_at
)
VALUES
('e7600000-0000-0000-0000-000000000601',NULL,'trust.security.badge','JSON','{"label":"ISO-ready controls","icon":"shield"}','en',1,true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000602',NULL,'trust.rbac.note','TEXT','{"value":"Granular RBAC with tenant-safe scope enforcement"}','en',1,true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000603',NULL,'ai.assistant.overview','TEXT','{"value":"Role-aware copilots for teachers, parents, and administrators"}','en',1,true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000604',NULL,'story.market.opportunity','TEXT','{"value":"$XXB education digitization opportunity with rising SaaS adoption"}','en',1,true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000605',NULL,'story.scalability.architecture','TEXT','{"value":"Shared-schema multi-tenant core with strict context isolation"}','en',1,true,NOW(),NOW(),NOW()),
('e7600000-0000-0000-0000-000000000606',NULL,'cta.enterprise.demo','JSON','{"label":"Book Enterprise Demo","url":"/enterprise"}','en',1,true,NOW(),NOW(),NOW())
ON CONFLICT (tenant_id, block_key, locale, version) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE 'DSEP full seed complete: branding, routes, journeys, investor room, presentations, campaigns, and content blocks inserted.';
END $$;
