-- ─────────────────────────────────────────────────────────────────────────────
-- V89: JNV Lucknow — expanded students + full V87 profile data + fee records
--
-- Adds 40 new students across Classes VI–XII (sections not yet populated),
-- then seeds student_identity_profiles, student_logistics_profiles,
-- student_enrichment_profiles, student_medical_records, student_behavior_records,
-- student_achievement_records, student_communication_events, fee structures
-- for Classes VI–IX/XI, and student_fee_records for all new students.
--
-- Guard: skips silently when the jnv-lucknow tenant is absent (CI / clean env).
-- Idempotent: all INSERTs use ON CONFLICT … DO NOTHING.
-- ─────────────────────────────────────────────────────────────────────────────

DO $v89$
DECLARE
    v_tid UUID := '804d7650-c915-4236-8431-2d4aef5cd102';
    v_sid UUID := '9786d685-d4a8-4092-9d1f-8558632d7b32';
    v_ay  UUID := '73f7aff8-dd77-44f3-8244-f4cc691f8b8a';

    -- Staff (V57/V58)
    v_principal UUID := '5f000001-0000-0000-0000-000000000001';
    v_t_math    UUID := '073e320b-ad40-4d35-a971-3bd886a64aa0';
    v_t_eng     UUID := '5f000004-0000-0000-0000-000000000001';
    v_t_phy     UUID := '5f000005-0000-0000-0000-000000000001';
    v_admin_stf UUID := '4719cb1d-94c3-41ba-81b0-dd8a92b59e67';
    v_admin_usr UUID := '5f3272fe-9f19-484d-ac73-4f886a242bc9';

    -- Subjects (V58)
    v_math UUID := '5b000001-0000-0000-0000-000000000001';
    v_phy  UUID := '5b000002-0000-0000-0000-000000000001';
    v_chem UUID := '5b000003-0000-0000-0000-000000000001';
    v_bio  UUID := '5b000004-0000-0000-0000-000000000001';
    v_eng  UUID := '5b000005-0000-0000-0000-000000000001';
    v_hin  UUID := '5b000006-0000-0000-0000-000000000001';
    v_sst  UUID := '5b000007-0000-0000-0000-000000000001';

    -- Fee categories (seeded by TenantBootstrapService)
    v_fc_tuition UUID := '46d7fb43-a4f6-4ce2-9057-3c02427ee85d';
    v_fc_exam    UUID := 'd288e08c-a94e-49fc-8e32-78f2669593f8';
    v_fc_library UUID := 'c32cc264-6cca-4d22-a13e-07d15b4e5026';
    v_fc_sports  UUID := 'efadfeac-84f2-4ea3-8c49-66a8e90c5761';

    -- Departments (seeded by TenantBootstrapService)
    v_dept_academic UUID := 'e1c14349-eea3-44a4-a7b5-4b075eb5d286';
    v_dept_science  UUID := 'f41019ce-8bae-4815-94ac-7257c07c5ec9';
    v_dept_arts     UUID := '4756ece6-1f49-4b10-9704-36b1b3f41f93';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = v_tid) THEN
        RAISE NOTICE 'V89: jnv-lucknow tenant not found — skipping.';
        RETURN;
    END IF;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Two additional subject teachers (Chemistry + Social Science)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO staff (id, tenant_id, school_id, department_id, employee_number,
                   staff_type, first_name, last_name, gender, phone, email,
                   qualification, specialization, joining_date) VALUES
  ('5f000009-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_science, 'EMP-JNV-T07', 'TEACHER',
   'Alok',  'Kumar Pandey',   'MALE',   '9415009009', 'alok.pandey@jnvlucknow.edu.in',
   'M.Sc Chemistry, B.Ed', 'Organic and Physical Chemistry', '2015-07-01'),
  ('5f000010-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_arts,    'EMP-JNV-T08', 'TEACHER',
   'Seema', 'Bai Kushwaha',   'FEMALE', '9415010010', 'seema.kushwaha@jnvlucknow.edu.in',
   'M.A Social Science, B.Ed', 'History and Geography', '2016-07-01')
ON CONFLICT ON CONSTRAINT uq_staff_school_employee_number DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. New students — 40 total across Classes VI–XII
-- UUID pattern: 7d0000{nn}-0000-0000-0000-000000000001  (nn = 13 to 52)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO students (id, tenant_id, school_id, user_id, student_number,
                      class_id, section_id, first_name, last_name, gender,
                      date_of_birth, admission_date, status) VALUES

-- ── Class VI-A (5) ──
  ('7d000013-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-001',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000a',
   'Aarav',    'Sharma',       'MALE',   '2013-04-12','2026-04-01','ACTIVE'),
  ('7d000014-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-002',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000a',
   'Divya',    'Mishra',       'FEMALE', '2013-07-19','2026-04-01','ACTIVE'),
  ('7d000015-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-003',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000a',
   'Tanmay',   'Gupta',        'MALE',   '2013-02-28','2026-04-01','ACTIVE'),
  ('7d000016-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-004',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000a',
   'Priyanka', 'Singh',        'FEMALE', '2013-09-03','2026-04-01','ACTIVE'),
  ('7d000017-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-005',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000a',
   'Kartik',   'Yadav',        'MALE',   '2013-11-15','2026-04-01','ACTIVE'),

-- ── Class VI-B (5) ──
  ('7d000018-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-006',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000b',
   'Harsh',    'Agarwal',      'MALE',   '2013-03-22','2026-04-01','ACTIVE'),
  ('7d000019-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-007',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000b',
   'Anamika',  'Verma',        'FEMALE', '2013-06-14','2026-04-01','ACTIVE'),
  ('7d000020-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-008',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000b',
   'Saurabh',  'Kumar',        'MALE',   '2013-08-08','2026-04-01','ACTIVE'),
  ('7d000021-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-009',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000b',
   'Roshni',   'Pandey',       'FEMALE', '2013-01-30','2026-04-01','ACTIVE'),
  ('7d000022-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2026-010',
   'c0000006-0000-0000-0000-000000000001','c0000006-0000-0000-0000-00000000000b',
   'Dhruv',    'Jha',          'MALE',   '2013-12-05','2026-04-01','ACTIVE'),

-- ── Class VII-A (5) ──
  ('7d000023-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-001',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000a',
   'Aryan',    'Tiwari',       'MALE',   '2012-05-17','2025-04-01','ACTIVE'),
  ('7d000024-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-002',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000a',
   'Sakshi',   'Bajpai',       'FEMALE', '2012-03-09','2025-04-01','ACTIVE'),
  ('7d000025-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-003',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000a',
   'Naman',    'Srivastava',   'MALE',   '2012-10-23','2025-04-01','ACTIVE'),
  ('7d000026-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-004',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000a',
   'Ritika',   'Chaudhary',    'FEMALE', '2012-07-11','2025-04-01','ACTIVE'),
  ('7d000027-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-005',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000a',
   'Parth',    'Dubey',        'MALE',   '2012-12-28','2025-04-01','ACTIVE'),

-- ── Class VII-B (5) ──
  ('7d000028-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-006',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000b',
   'Shivansh', 'Shukla',       'MALE',   '2012-04-04','2025-04-01','ACTIVE'),
  ('7d000029-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-007',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000b',
   'Anushka',  'Saxena',       'FEMALE', '2012-09-16','2025-04-01','ACTIVE'),
  ('7d000030-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-008',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000b',
   'Mohit',    'Gautam',       'MALE',   '2012-01-22','2025-04-01','ACTIVE'),
  ('7d000031-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-009',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000b',
   'Aparna',   'Chauhan',      'FEMALE', '2012-06-30','2025-04-01','ACTIVE'),
  ('7d000032-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2025-010',
   'c0000007-0000-0000-0000-000000000001','c0000007-0000-0000-0000-00000000000b',
   'Yash',     'Patel',        'MALE',   '2012-11-07','2025-04-01','ACTIVE'),

-- ── Class VIII-A (5) ──
  ('7d000033-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-013',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000a',
   'Lakshay',  'Verma',        'MALE',   '2011-06-18','2024-04-01','ACTIVE'),
  ('7d000034-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-014',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000a',
   'Pragya',   'Singh',        'FEMALE', '2011-02-14','2024-04-01','ACTIVE'),
  ('7d000035-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-015',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000a',
   'Shubham',  'Kumar',        'MALE',   '2011-09-02','2024-04-01','ACTIVE'),
  ('7d000036-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-016',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000a',
   'Simran',   'Kaur',         'FEMALE', '2011-04-25','2024-04-01','ACTIVE'),
  ('7d000037-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-017',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000a',
   'Abhijeet', 'Mishra',       'MALE',   '2011-12-11','2024-04-01','ACTIVE'),

-- ── Class VIII-B (3) ──
  ('7d000038-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-018',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000b',
   'Mayank',   'Yadav',        'MALE',   '2011-07-06','2024-04-01','ACTIVE'),
  ('7d000039-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-019',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000b',
   'Garima',   'Gupta',        'FEMALE', '2011-03-19','2024-04-01','ACTIVE'),
  ('7d000040-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-020',
   'c0000008-0000-0000-0000-000000000001','c0000008-0000-0000-0000-00000000000b',
   'Nitin',    'Pandey',       'MALE',   '2011-10-31','2024-04-01','ACTIVE'),

-- ── Class IX-B (3) ──
  ('7d000041-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-021',
   'c0000009-0000-0000-0000-000000000001','c0000009-0000-0000-0000-00000000000b',
   'Tarun',    'Sharma',       'MALE',   '2010-08-22','2024-04-01','ACTIVE'),
  ('7d000042-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-022',
   'c0000009-0000-0000-0000-000000000001','c0000009-0000-0000-0000-00000000000b',
   'Prachi',   'Verma',        'FEMALE', '2010-05-13','2024-04-01','ACTIVE'),
  ('7d000043-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-023',
   'c0000009-0000-0000-0000-000000000001','c0000009-0000-0000-0000-00000000000b',
   'Ankur',    'Tiwari',       'MALE',   '2010-11-28','2024-04-01','ACTIVE'),

-- ── Class X-A (2 more — fills section to 7) ──
  ('7d000044-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-024',
   'c0000010-0000-0000-0000-000000000001','c0000010-0000-0000-0000-00000000000a',
   'Gaurav',   'Mishra',       'MALE',   '2010-01-17','2024-04-01','ACTIVE'),
  ('7d000045-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-025',
   'c0000010-0000-0000-0000-000000000001','c0000010-0000-0000-0000-00000000000a',
   'Sushma',   'Devi',         'FEMALE', '2010-06-09','2024-04-01','ACTIVE'),

-- ── Class X-B (4 more — fills section to 7) ──
  ('7d000046-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-026',
   'c0000010-0000-0000-0000-000000000001','c0000010-0000-0000-0000-00000000000b',
   'Karan',    'Singh',        'MALE',   '2010-03-31','2024-04-01','ACTIVE'),
  ('7d000047-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-027',
   'c0000010-0000-0000-0000-000000000001','c0000010-0000-0000-0000-00000000000b',
   'Nidhi',    'Agarwal',      'FEMALE', '2010-09-14','2024-04-01','ACTIVE'),
  ('7d000048-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-028',
   'c0000010-0000-0000-0000-000000000001','c0000010-0000-0000-0000-00000000000b',
   'Rajesh',   'Kumar Pandey', 'MALE',   '2010-12-22','2024-04-01','ACTIVE'),
  ('7d000049-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2024-029',
   'c0000010-0000-0000-0000-000000000001','c0000010-0000-0000-0000-00000000000b',
   'Kavya',    'Dubey',        'FEMALE', '2010-07-05','2024-04-01','ACTIVE'),

-- ── Class XI-A (5) ──
  ('7d000050-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-003',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000a',
   'Sahil',    'Dubey',        'MALE',   '2009-04-08','2022-04-01','ACTIVE'),
  ('7d000051-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-004',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000a',
   'Aditi',    'Jha',          'FEMALE', '2009-09-21','2022-04-01','ACTIVE'),
  ('7d000052-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-005',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000a',
   'Varun',    'Saxena',       'MALE',   '2009-07-15','2022-04-01','ACTIVE'),
  ('7d000053-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-006',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000a',
   'Swapna',   'Rani',         'FEMALE', '2009-02-06','2022-04-01','ACTIVE'),
  ('7d000054-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-007',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000a',
   'Manav',    'Shukla',       'MALE',   '2009-12-30','2022-04-01','ACTIVE'),

-- ── Class XI-B (4) ──
  ('7d000055-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-008',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000b',
   'Ayush',    'Patel',        'MALE',   '2009-06-11','2022-04-01','ACTIVE'),
  ('7d000056-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-009',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000b',
   'Bhavya',   'Agarwal',      'FEMALE', '2009-10-04','2022-04-01','ACTIVE'),
  ('7d000057-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-010',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000b',
   'Chirag',   'Chauhan',      'MALE',   '2009-03-27','2022-04-01','ACTIVE'),
  ('7d000058-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2022-011',
   'c0000011-0000-0000-0000-000000000001','c0000011-0000-0000-0000-00000000000b',
   'Deepika',  'Pandey',       'FEMALE', '2009-08-17','2022-04-01','ACTIVE'),

-- ── Class XII-A (3 more — fills section to 5) ──
  ('7d000059-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2020-001',
   'c0000012-0000-0000-0000-000000000001','c0000012-0000-0000-0000-00000000000a',
   'Prashant', 'Tripathi',     'MALE',   '2008-03-15','2020-04-01','ACTIVE'),
  ('7d000060-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2020-002',
   'c0000012-0000-0000-0000-000000000001','c0000012-0000-0000-0000-00000000000a',
   'Rinky',    'Soni',         'FEMALE', '2008-10-28','2020-04-01','ACTIVE'),
  ('7d000061-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2020-003',
   'c0000012-0000-0000-0000-000000000001','c0000012-0000-0000-0000-00000000000a',
   'Sumit',    'Pandey',       'MALE',   '2008-06-20','2020-04-01','ACTIVE'),

-- ── Class XII-B (4) ──
  ('7d000062-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2020-004',
   'c0000012-0000-0000-0000-000000000001','c0000012-0000-0000-0000-00000000000b',
   'Ankita',   'Gupta',        'FEMALE', '2008-01-12','2020-04-01','ACTIVE'),
  ('7d000063-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2020-005',
   'c0000012-0000-0000-0000-000000000001','c0000012-0000-0000-0000-00000000000b',
   'Hemant',   'Singh',        'MALE',   '2008-08-04','2020-04-01','ACTIVE'),
  ('7d000064-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2020-006',
   'c0000012-0000-0000-0000-000000000001','c0000012-0000-0000-0000-00000000000b',
   'Nitu',     'Yadav',        'FEMALE', '2008-05-31','2020-04-01','ACTIVE'),
  ('7d000065-0000-0000-0000-000000000001', v_tid, v_sid, NULL, 'STU-2020-007',
   'c0000012-0000-0000-0000-000000000001','c0000012-0000-0000-0000-00000000000b',
   'Rohit',    'Kumar Rai',    'MALE',   '2008-11-19','2020-04-01','ACTIVE')

ON CONFLICT ON CONSTRAINT uq_students_school_number DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Fee structures — Classes VI, VII, VIII, IX, XI (X + XII exist from V58)
-- UUID prefix: fe0000{grade}0-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO fee_structures (id, tenant_id, school_id, academic_year_id, class_id, fee_category_id, amount, due_date, frequency) VALUES
  -- Class VI
  ('fe060001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000006-0000-0000-0000-000000000001', v_fc_tuition,  8000.00, '2026-04-30', 'ANNUAL'),
  ('fe060002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000006-0000-0000-0000-000000000001', v_fc_exam,     1000.00, '2026-04-30', 'ANNUAL'),
  ('fe060003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000006-0000-0000-0000-000000000001', v_fc_library,   400.00, '2026-04-30', 'ANNUAL'),
  ('fe060004-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000006-0000-0000-0000-000000000001', v_fc_sports,    500.00, '2026-05-15', 'ANNUAL'),
  -- Class VII
  ('fe070001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000007-0000-0000-0000-000000000001', v_fc_tuition,  9000.00, '2026-04-30', 'ANNUAL'),
  ('fe070002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000007-0000-0000-0000-000000000001', v_fc_exam,     1000.00, '2026-04-30', 'ANNUAL'),
  ('fe070003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000007-0000-0000-0000-000000000001', v_fc_library,   400.00, '2026-04-30', 'ANNUAL'),
  ('fe070004-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000007-0000-0000-0000-000000000001', v_fc_sports,    500.00, '2026-05-15', 'ANNUAL'),
  -- Class VIII
  ('fe080001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000008-0000-0000-0000-000000000001', v_fc_tuition, 10000.00, '2026-04-30', 'ANNUAL'),
  ('fe080002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000008-0000-0000-0000-000000000001', v_fc_exam,     1200.00, '2026-04-30', 'ANNUAL'),
  ('fe080003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000008-0000-0000-0000-000000000001', v_fc_library,   400.00, '2026-04-30', 'ANNUAL'),
  ('fe080004-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000008-0000-0000-0000-000000000001', v_fc_sports,    600.00, '2026-05-15', 'ANNUAL'),
  -- Class IX
  ('fe090001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000009-0000-0000-0000-000000000001', v_fc_tuition, 11000.00, '2026-04-30', 'ANNUAL'),
  ('fe090002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000009-0000-0000-0000-000000000001', v_fc_exam,     1500.00, '2026-04-30', 'ANNUAL'),
  ('fe090003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000009-0000-0000-0000-000000000001', v_fc_library,   500.00, '2026-04-30', 'ANNUAL'),
  ('fe090004-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000009-0000-0000-0000-000000000001', v_fc_sports,    700.00, '2026-05-15', 'ANNUAL'),
  -- Class XI
  ('fe110001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000011-0000-0000-0000-000000000001', v_fc_tuition, 13000.00, '2026-04-30', 'ANNUAL'),
  ('fe110002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000011-0000-0000-0000-000000000001', v_fc_exam,     1800.00, '2026-04-30', 'ANNUAL'),
  ('fe110003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000011-0000-0000-0000-000000000001', v_fc_library,   500.00, '2026-04-30', 'ANNUAL'),
  ('fe110004-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000011-0000-0000-0000-000000000001', v_fc_sports,    750.00, '2026-05-15', 'ANNUAL')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Student fee records for all new students
--    Mix: ~50% PAID, ~25% PARTIAL, ~25% PENDING/OVERDUE
--    Generated via INSERT … SELECT, joining students to their class fee structures.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_fee_records
  (tenant_id, school_id, student_id, fee_structure_id, academic_year_id,
   amount_due, amount_paid, discount, due_date, status)
SELECT
  v_tid,
  v_sid,
  s.id,
  fs.id,
  v_ay,
  fs.amount,
  CASE
    WHEN (EXTRACT(DAY FROM s.date_of_birth)::int % 4) = 0 THEN 0.00           -- PENDING
    WHEN (EXTRACT(DAY FROM s.date_of_birth)::int % 4) = 1 THEN fs.amount      -- PAID
    WHEN (EXTRACT(DAY FROM s.date_of_birth)::int % 4) = 2 THEN ROUND(fs.amount * 0.5, 2)  -- PARTIAL
    ELSE fs.amount                                                              -- PAID
  END,
  0.00,
  fs.due_date,
  CASE
    WHEN (EXTRACT(DAY FROM s.date_of_birth)::int % 4) = 0 THEN
      CASE WHEN fs.due_date < CURRENT_DATE THEN 'OVERDUE' ELSE 'PENDING' END
    WHEN (EXTRACT(DAY FROM s.date_of_birth)::int % 4) = 1 THEN 'PAID'
    WHEN (EXTRACT(DAY FROM s.date_of_birth)::int % 4) = 2 THEN 'PARTIAL'
    ELSE 'PAID'
  END
FROM students s
JOIN fee_structures fs ON fs.class_id = s.class_id AND fs.academic_year_id = v_ay
WHERE s.school_id = v_sid
  AND s.id >= '7d000013-0000-0000-0000-000000000001'   -- only new students
  AND fs.tenant_id = v_tid
ON CONFLICT ON CONSTRAINT uq_student_fee_record DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. student_identity_profiles — all students in the school
--    Government IDs use a deterministic pattern from student_number.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_identity_profiles
  (tenant_id, school_id, student_id,
   government_id_type, government_id_number,
   nationality, religion, caste_category, mother_tongue,
   previous_school, enrollment_source,
   emergency_contact_name, emergency_contact_phone)
SELECT
  v_tid, v_sid, id,
  'AADHAAR',
  '5' || LPAD(ABS(HASHTEXT(student_number))::TEXT, 11, '0'),
  'Indian',
  CASE WHEN HASHTEXT(student_number) % 10 < 8 THEN 'Hindu'
       WHEN HASHTEXT(student_number) % 10 < 9 THEN 'Muslim'
       ELSE 'Christian' END,
  CASE WHEN HASHTEXT(last_name) % 4 = 0 THEN 'OBC'
       WHEN HASHTEXT(last_name) % 4 = 1 THEN 'General'
       WHEN HASHTEXT(last_name) % 4 = 2 THEN 'SC'
       ELSE 'ST' END,
  CASE WHEN HASHTEXT(first_name) % 5 < 4 THEN 'Hindi' ELSE 'English' END,
  CASE WHEN HASHTEXT(student_number) % 3 = 0 THEN 'Government Upper Primary School, Lucknow'
       WHEN HASHTEXT(student_number) % 3 = 1 THEN 'Saraswati Vidya Mandir, Sitapur'
       ELSE 'Kendriya Vidyalaya, Lucknow' END,
  'NAVODAYA_ENTRANCE',
  CASE gender WHEN 'MALE' THEN 'Shri ' ELSE 'Smt. ' END ||
    CASE WHEN HASHTEXT(last_name) % 4 = 0 THEN 'Ram ' ELSE 'Vijay ' END || last_name,
  '94' || LPAD(ABS(HASHTEXT(id::TEXT))::TEXT, 8, '0')
FROM students
WHERE school_id = v_sid
ON CONFLICT (student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. student_logistics_profiles — hostel (60%), bus (30%), day scholar (10%)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_logistics_profiles
  (tenant_id, school_id, student_id,
   transport_mode, route_name, pickup_point, drop_point,
   hostel_name, room_number, warden_contact)
SELECT
  v_tid, v_sid, id,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 < 6 THEN 'HOSTEL'
       WHEN ABS(HASHTEXT(student_number)) % 10 < 9 THEN 'BUS'
       ELSE 'SELF' END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 >= 6 AND ABS(HASHTEXT(student_number)) % 10 < 9
       THEN CASE ABS(HASHTEXT(student_number)) % 3
              WHEN 0 THEN 'Route-A (Gomti Nagar - Indira Nagar)'
              WHEN 1 THEN 'Route-B (Alambagh - Hazratganj)'
              ELSE 'Route-C (Aliganj - Chinhat)'
            END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 >= 6 AND ABS(HASHTEXT(student_number)) % 10 < 9
       THEN CASE ABS(HASHTEXT(student_number)) % 3
              WHEN 0 THEN 'Sector 12, Gomti Nagar Stop'
              WHEN 1 THEN 'Alambagh Bus Stop'
              ELSE 'Aliganj Chauraha'
            END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 >= 6 AND ABS(HASHTEXT(student_number)) % 10 < 9
       THEN 'JNV Lucknow Main Gate'
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 < 6
       THEN CASE gender WHEN 'FEMALE' THEN 'Girls'' Hostel Block-A' ELSE 'Boys'' Hostel Block-B' END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 < 6
       THEN CASE gender WHEN 'FEMALE'
              THEN 'GH-' || LPAD(((ABS(HASHTEXT(student_number)) % 30) + 101)::TEXT, 3, '0')
              ELSE 'BH-' || LPAD(((ABS(HASHTEXT(student_number)) % 40) + 201)::TEXT, 3, '0')
            END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 < 6
       THEN CASE gender WHEN 'FEMALE' THEN '9415099001' ELSE '9415099002' END
       ELSE NULL END
FROM students
WHERE school_id = v_sid
ON CONFLICT (student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. student_enrichment_profiles — interests, skills, career goals, AI insights
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_enrichment_profiles
  (tenant_id, school_id, student_id,
   interests, hobbies, skills, career_goals, learning_style,
   counseling_summary, ai_risk_level, ai_insights)
SELECT
  v_tid, v_sid, id,
  CASE ABS(HASHTEXT(student_number)) % 5
    WHEN 0 THEN 'Mathematics, Science, Robotics'
    WHEN 1 THEN 'Reading, Creative Writing, Debating'
    WHEN 2 THEN 'Sports, Athletics, Swimming'
    WHEN 3 THEN 'Music, Fine Arts, Drama'
    ELSE 'Computer Programming, Gaming, Electronics'
  END,
  CASE ABS(HASHTEXT(first_name)) % 4
    WHEN 0 THEN 'Drawing, Painting, Origami'
    WHEN 1 THEN 'Cricket, Badminton, Chess'
    WHEN 2 THEN 'Cooking, Gardening, Yoga'
    ELSE 'Photography, Reading, Cycling'
  END,
  CASE ABS(HASHTEXT(last_name)) % 4
    WHEN 0 THEN 'Problem-Solving, Analytical Thinking'
    WHEN 1 THEN 'Leadership, Communication, Teamwork'
    WHEN 2 THEN 'Creative Thinking, Artistic Expression'
    ELSE 'Technical Skills, Computer Literacy'
  END,
  CASE ABS(HASHTEXT(student_number)) % 6
    WHEN 0 THEN 'Wants to become an IIT engineer and work in aerospace'
    WHEN 1 THEN 'Aspires to be a doctor (MBBS) and serve rural communities'
    WHEN 2 THEN 'Dreams of becoming an IAS officer to serve the nation'
    WHEN 3 THEN 'Interested in becoming a teacher or professor'
    WHEN 4 THEN 'Plans to pursue chartered accountancy and start a business'
    ELSE 'Wants to join the Indian Defence Forces (Army/Navy/Air Force)'
  END,
  CASE ABS(HASHTEXT(id::TEXT)) % 3
    WHEN 0 THEN 'VISUAL'
    WHEN 1 THEN 'AUDITORY'
    ELSE 'KINESTHETIC'
  END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 5 = 0
       THEN 'Student is performing well but needs to improve time management. Counseled on study schedule.'
       WHEN ABS(HASHTEXT(student_number)) % 5 = 1
       THEN 'Student shows excellent participation in class and extracurricular activities. Encouraged to maintain consistency.'
       ELSE NULL
  END,
  CASE WHEN ABS(HASHTEXT(id::TEXT)) % 10 < 1 THEN 'HIGH'
       WHEN ABS(HASHTEXT(id::TEXT)) % 10 < 3 THEN 'MEDIUM'
       ELSE 'LOW'
  END,
  CASE WHEN ABS(HASHTEXT(id::TEXT)) % 10 < 1
       THEN 'Attendance has dropped below 75% in the last month. Performance in Mathematics is declining. Recommend immediate parent-teacher meeting and counseling intervention.'
       WHEN ABS(HASHTEXT(id::TEXT)) % 10 < 3
       THEN 'Student shows slight irregularity in assignment submissions. Overall performance is satisfactory but requires monitoring.'
       ELSE 'Student is on track. Consistent attendance and performance. Positive peer interactions observed.'
  END
FROM students
WHERE school_id = v_sid
ON CONFLICT (student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. student_medical_records — 15 students with realistic conditions
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_medical_records
  (tenant_id, school_id, student_id, condition_name, severity, medication, doctor_contact, notes)
VALUES
  (v_tid, v_sid, '7d000001-0000-0000-0000-000000000001', 'Mild Myopia', 'LOW',
   'Prescribed corrective lenses (-1.5D right, -1.0D left)', 'Dr. Rakesh Gupta — 9415200001',
   'Student wears glasses. Seated in front row.'),
  (v_tid, v_sid, '7d000002-0000-0000-0000-000000000001', 'Allergic Rhinitis', 'LOW',
   'Cetirizine 5mg (seasonal use only)', 'Dr. Anita Saxena — 9415200002',
   'Triggered by dust and seasonal pollen. Handkerchief always required.'),
  (v_tid, v_sid, '7d000005-0000-0000-0000-000000000001', 'Asthma (Mild)', 'MEDIUM',
   'Salbutamol inhaler (rescue), Budesonide inhaler (maintenance)', 'Dr. V.K. Mishra — 9415200003',
   'Inhaler kept with class teacher. Avoid strenuous PE during cold weather.'),
  (v_tid, v_sid, '7d000009-0000-0000-0000-000000000001', 'Type-1 Diabetes', 'HIGH',
   'Insulin (Novolin 30/70) — administered under supervision', 'Dr. S.P. Sharma — 9415200004',
   'Blood glucose monitored before lunch. Emergency glucose tablets in medical room. Parents notified daily.'),
  (v_tid, v_sid, '7d000011-0000-0000-0000-000000000001', 'Colour Blindness (Red-Green)', 'LOW',
   'No medication required', 'Dr. Rakesh Gupta — 9415200001',
   'Accommodations made in lab practicals. Lab partner assigned.'),
  (v_tid, v_sid, '7d000014-0000-0000-0000-000000000001', 'Iron Deficiency Anaemia', 'MEDIUM',
   'Ferrous Sulphate 100mg daily with Vitamin C', 'Dr. Sunita Rai — 9415200005',
   'Haemoglobin levels to be checked every 3 months. Dietary guidance given.'),
  (v_tid, v_sid, '7d000020-0000-0000-0000-000000000001', 'Mild Epilepsy (Controlled)', 'MEDIUM',
   'Sodium Valproate 200mg twice daily', 'Dr. Pradeep Chandra — 9415200006',
   'Last seizure: August 2025. Staff trained in first aid response. Parents on speed dial.'),
  (v_tid, v_sid, '7d000024-0000-0000-0000-000000000001', 'Eczema', 'LOW',
   'Hydrocortisone cream (topical, as needed)', 'Dr. Kavita Sharma — 9415200007',
   'Flare-ups in winter. Student carries cream in bag.'),
  (v_tid, v_sid, '7d000033-0000-0000-0000-000000000001', 'Mild Hearing Impairment (Left Ear)', 'LOW',
   'No medication. Hearing aid used.', 'Dr. R.N. Sinha — 9415200008',
   'Seated away from windows. Teacher speaks facing the student.'),
  (v_tid, v_sid, '7d000041-0000-0000-0000-000000000001', 'Hypertension (Adolescent)', 'MEDIUM',
   'Lifestyle modification prescribed; Amlodipine 2.5mg if BP >130', 'Dr. S.P. Sharma — 9415200004',
   'Weekly BP monitoring. Restricted from competitive sports temporarily.'),
  (v_tid, v_sid, '7d000050-0000-0000-0000-000000000001', 'Anxiety Disorder (Mild)', 'MEDIUM',
   'Cognitive Behavioural Therapy (CBT) sessions fortnightly', 'Dr. Meera Lal — 9415200009',
   'Student gets anxious during exams. Extra time granted per board guidelines.'),
  (v_tid, v_sid, '7d000051-0000-0000-0000-000000000001', 'Scoliosis (Mild)', 'LOW',
   'Physiotherapy twice a week', 'Dr. Arun Joshi — 9415200010',
   'Ergonomic chair provided. Not to carry heavy bags.'),
  (v_tid, v_sid, '7d000055-0000-0000-0000-000000000001', 'Seasonal Allergic Conjunctivitis', 'LOW',
   'Olopatadine eye drops (seasonal)', 'Dr. Rakesh Gupta — 9415200001',
   'Avoid rubbing eyes. Antihistamine drops kept in medical room.'),
  (v_tid, v_sid, '7d000059-0000-0000-0000-000000000001', 'Migraine', 'MEDIUM',
   'Sumatriptan 50mg (on-demand); Propranolol 20mg (prophylactic)', 'Dr. Pradeep Chandra — 9415200006',
   'Resting room access authorised during migraine episodes. Parents informed.'),
  (v_tid, v_sid, '7d000062-0000-0000-0000-000000000001', 'Thalassemia Minor', 'LOW',
   'No regular medication; Iron supplement restriction', 'Dr. Sunita Rai — 9415200005',
   'Carrier only — not symptomatic. Parents briefed on dietary restrictions.')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. student_behavior_records — positive and corrective entries
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_behavior_records
  (tenant_id, school_id, student_id, category, severity, summary, action_taken, counselor_notes)
VALUES
  (v_tid, v_sid, '7d000001-0000-0000-0000-000000000001', 'POSITIVE', 'LOW',
   'Won first prize in Inter-Class Mathematics Quiz, April 2026.',
   'Certificate awarded at School Assembly on 25 April 2026.', NULL),
  (v_tid, v_sid, '7d000002-0000-0000-0000-000000000001', 'POSITIVE', 'LOW',
   'Represented school in District-Level Science Olympiad; secured Rank 2.',
   'Letter of appreciation from Principal. Parents informed.', NULL),
  (v_tid, v_sid, '7d000003-0000-0000-0000-000000000001', 'DISCIPLINARY', 'LOW',
   'Found using mobile phone during library period, 12 March 2026.',
   'Phone confiscated for 3 days. Verbal warning issued. Parents called.',
   'First-time offence. Student apologised and signed undertaking.'),
  (v_tid, v_sid, '7d000005-0000-0000-0000-000000000001', 'DISCIPLINARY', 'MEDIUM',
   'Involved in altercation with fellow student during lunch break, 18 April 2026.',
   'Both students counselled separately. Peer mediation conducted.',
   'Conflict arose over seat allocation. Resolved amicably. Monitoring for recurrence.'),
  (v_tid, v_sid, '7d000007-0000-0000-0000-000000000001', 'ATTENDANCE', 'MEDIUM',
   'Absent for 5 consecutive days without prior intimation, February 2026.',
   'Parents contacted. Medical certificate provided retrospectively.',
   'Family medical emergency confirmed. Attendance regularised.'),
  (v_tid, v_sid, '7d000009-0000-0000-0000-000000000001', 'POSITIVE', 'LOW',
   'Consistently helps classmates with difficult topics; natural peer mentor.',
   'Nominated as Class Representative for 2026-27.', NULL),
  (v_tid, v_sid, '7d000011-0000-0000-0000-000000000001', 'POSITIVE', 'LOW',
   'Secured 94% in Pre-Board Chemistry examination — highest in Class XII.',
   'Merit certificate awarded. Recommended for school topper recognition.', NULL),
  (v_tid, v_sid, '7d000033-0000-0000-0000-000000000001', 'DISCIPLINARY', 'LOW',
   'Homework not submitted for 3 consecutive weeks in Mathematics.',
   'Parent meeting held. Extra coaching arranged.',
   'Student has hearing impairment; instructions were not received clearly. Seating rearranged.'),
  (v_tid, v_sid, '7d000050-0000-0000-0000-000000000001', 'ACADEMIC', 'LOW',
   'Significant improvement in Term-2 results after exam anxiety counselling.',
   'Positive reinforcement given. Study plan revised with house tutor.',
   'CBT sessions showing results. Student more confident in class participation.'),
  (v_tid, v_sid, '7d000051-0000-0000-0000-000000000001', 'POSITIVE', 'LOW',
   'Led the school NCC contingent at Republic Day Parade with distinction.',
   'School pride award presented at Annual Function.', NULL)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. student_achievement_records
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_achievement_records
  (tenant_id, school_id, student_id, title, category, description, awarded_on)
VALUES
  (v_tid, v_sid, '7d000001-0000-0000-0000-000000000001',
   'First Prize — Inter-Class Mathematics Quiz 2026', 'ACADEMIC',
   'Scored highest in a 3-round elimination quiz covering Class X NCERT syllabus.', '2026-04-25'),
  (v_tid, v_sid, '7d000002-0000-0000-0000-000000000001',
   'Rank 2 — District Science Olympiad 2025', 'ACADEMIC',
   'Awarded silver medal at the Lucknow District Science Olympiad organised by CBSE.', '2025-12-10'),
  (v_tid, v_sid, '7d000002-0000-0000-0000-000000000001',
   'School Topper — Class X Mid-Term 2026', 'ACADEMIC',
   'Highest aggregate (83.75%) in Class X Mid-Term April 2026 examination.', '2026-04-20'),
  (v_tid, v_sid, '7d000009-0000-0000-0000-000000000001',
   'Best Class Representative Award 2025-26', 'LEADERSHIP',
   'Elected by peers and faculty for outstanding contribution as Class IX-A representative.', '2026-03-15'),
  (v_tid, v_sid, '7d000011-0000-0000-0000-000000000001',
   'Chemistry Excellence Award — Pre-Board 2026', 'ACADEMIC',
   'Highest score (94%) in Class XII Pre-Board Chemistry examination.', '2026-02-28'),
  (v_tid, v_sid, '7d000011-0000-0000-0000-000000000001',
   'State-Level Science Exhibition — Second Place', 'ACADEMIC',
   'Project on "Water Purification Using Bio-Char" won silver at UP State Science Exhibition.', '2025-11-20'),
  (v_tid, v_sid, '7d000051-0000-0000-0000-000000000001',
   'NCC Republic Day Contingent Leader 2026', 'EXTRA_CURRICULAR',
   'Led school NCC team at Republic Day parade; received commendation from Commanding Officer.', '2026-01-26'),
  (v_tid, v_sid, '7d000050-0000-0000-0000-000000000001',
   'Most Improved Student Award — Term 2', 'ACADEMIC',
   'Improved overall percentage from 58% (Term-1) to 79% (Term-2) through dedicated effort.', '2026-03-20'),
  (v_tid, v_sid, '7d000024-0000-0000-0000-000000000001',
   'Under-14 State Badminton — Bronze Medal', 'SPORTS',
   'Won bronze medal at UP State Under-14 Badminton Championship, Varanasi.', '2025-10-18'),
  (v_tid, v_sid, '7d000036-0000-0000-0000-000000000001',
   'National Talent Search Examination (NTSE) Stage-1 Qualifier', 'ACADEMIC',
   'Qualified Stage-1 NTSE with score of 142/150 (Rank 8 in district).', '2025-12-05'),
  (v_tid, v_sid, '7d000059-0000-0000-0000-000000000001',
   'Annual Essay Competition — First Prize (Hindi)', 'CULTURAL',
   'Won first prize in Hindi essay competition on "Ek Bharat Shreshtha Bharat".', '2025-09-14'),
  (v_tid, v_sid, '7d000041-0000-0000-0000-000000000001',
   'Inter-House Cricket Tournament — Player of the Tournament', 'SPORTS',
   'Led Himalaya House to victory; scored 180 runs and took 9 wickets across 5 matches.', '2026-01-30'),
  (v_tid, v_sid, '7d000023-0000-0000-0000-000000000001',
   'Junior Science Quiz — District Level Runner-Up', 'ACADEMIC',
   'Secured second place in district-level junior science quiz for Classes VI-VIII.', '2025-11-08'),
  (v_tid, v_sid, '7d000034-0000-0000-0000-000000000001',
   'Painting Competition — First Prize (Intra-School)', 'CULTURAL',
   'Won first prize in Intra-School Painting Competition themed "My India, My Pride".', '2025-08-15'),
  (v_tid, v_sid, '7d000013-0000-0000-0000-000000000001',
   'Best Newcomer Award — Annual Function 2026', 'EXTRA_CURRICULAR',
   'Recognised as most active newcomer in Class VI for participation across sports and academics.', '2026-02-14')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. student_communication_events
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_communication_events
  (tenant_id, school_id, student_id, channel, direction, subject, summary, occurred_at)
VALUES
  (v_tid, v_sid, '7d000001-0000-0000-0000-000000000001', 'PHONE', 'OUTBOUND',
   'Mid-Term Result Notification', 'Parent informed of Arjun''s mid-term result (80.5%). Encouraged to maintain consistency.', '2026-04-20 11:00:00+00'),
  (v_tid, v_sid, '7d000001-0000-0000-0000-000000000001', 'MEETING', 'INBOUND',
   'PTM — April 2026', 'Father (Ramesh Sharma) attended PTM. Discussed exam preparation strategy for annual exams. Positive interaction.', '2026-04-20 10:00:00+00'),
  (v_tid, v_sid, '7d000002-0000-0000-0000-000000000001', 'EMAIL', 'OUTBOUND',
   'Science Olympiad Result & Felicitation', 'Email sent to parent regarding Priya''s District Science Olympiad rank and school felicitation ceremony.', '2025-12-12 09:00:00+00'),
  (v_tid, v_sid, '7d000005-0000-0000-0000-000000000001', 'PHONE', 'OUTBOUND',
   'Disciplinary Matter — Altercation', 'Parent called regarding lunch break altercation. Situation explained. Parent cooperative and supportive.', '2026-04-18 14:30:00+00'),
  (v_tid, v_sid, '7d000005-0000-0000-0000-000000000001', 'SMS', 'OUTBOUND',
   'Medical Alert — Asthma Episode', 'SMS sent to parent: Vikram had mild asthma episode; inhaler administered; now stable. Doctor visit recommended.', '2025-11-03 13:00:00+00'),
  (v_tid, v_sid, '7d000007-0000-0000-0000-000000000001', 'PHONE', 'INBOUND',
   'Absence Explanation — February 2026', 'Parent called to explain 5-day absence due to family medical emergency. Medical certificate promised.', '2026-02-24 16:00:00+00'),
  (v_tid, v_sid, '7d000009-0000-0000-0000-000000000001', 'EMAIL', 'OUTBOUND',
   'Diabetes Management Update', 'Monthly email to parent re: Aditya''s blood glucose log and dietary compliance. All readings within normal range.', '2026-04-30 09:00:00+00'),
  (v_tid, v_sid, '7d000011-0000-0000-0000-000000000001', 'MEETING', 'INBOUND',
   'Career Counselling — Board Exam Strategy', 'Father met Principal and Chemistry teacher to discuss board exam strategy and engineering college options.', '2026-03-10 11:00:00+00'),
  (v_tid, v_sid, '7d000011-0000-0000-0000-000000000001', 'PHONE', 'OUTBOUND',
   'Pre-Board Excellence — Parent Notification', 'Called parent to congratulate Deepak on 94% in Chemistry Pre-Board. Encouraged to maintain focus for boards.', '2026-02-28 12:00:00+00'),
  (v_tid, v_sid, '7d000050-0000-0000-0000-000000000001', 'MEETING', 'INBOUND',
   'Exam Anxiety Counselling — Parent Briefing', 'Mother attended session with school counsellor regarding Sahil''s exam anxiety. CBT plan explained.', '2026-01-15 10:00:00+00'),
  (v_tid, v_sid, '7d000050-0000-0000-0000-000000000001', 'EMAIL', 'OUTBOUND',
   'Term-2 Improvement — Congratulatory Note', 'Email sent to parent regarding Sahil''s remarkable improvement (58% to 79%). Counselling intervention acknowledged.', '2026-03-20 09:30:00+00'),
  (v_tid, v_sid, '7d000051-0000-0000-0000-000000000001', 'SMS', 'OUTBOUND',
   'NCC Republic Day — Invitation', 'SMS sent inviting parents to attend Republic Day parade where Aditi leads NCC contingent at Lucknow Parade Ground.', '2026-01-20 10:00:00+00'),
  (v_tid, v_sid, '7d000033-0000-0000-0000-000000000001', 'MEETING', 'INBOUND',
   'Homework Non-Submission — Parent Meeting', 'Parent met class teacher. Communication gap due to student''s hearing impairment identified. Seating and communication protocol revised.', '2026-03-08 14:00:00+00'),
  (v_tid, v_sid, '7d000036-0000-0000-0000-000000000001', 'PHONE', 'OUTBOUND',
   'NTSE Stage-1 Qualification — Parent Notification', 'Called parent to share Simran''s NTSE Stage-1 result (Rank 8, district). Guidance for Stage-2 preparation discussed.', '2025-12-06 11:00:00+00'),
  (v_tid, v_sid, '7d000041-0000-0000-0000-000000000001', 'PHONE', 'OUTBOUND',
   'Blood Pressure Monitoring Update', 'Weekly BP update call to parent of Tarun. BP reading: 122/78. Trending normal. Sports restriction under review.', '2026-04-28 16:00:00+00')
ON CONFLICT DO NOTHING;

RAISE NOTICE 'V89: Students, profiles, and fee data seeded for jnv-lucknow tenant %.', v_tid;
END $v89$;
