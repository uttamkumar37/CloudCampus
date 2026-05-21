-- ─────────────────────────────────────────────────────────────────────────────
-- V91: JNV Lucknow — populate V87 profile tables + fee structures + notices
--
-- V89/V90 used stale UUIDs from V58 (804d7650-...) and silently skipped.
-- This migration targets the REAL tenant (c0000000-...) seeded by the
-- TenantBootstrapService and populates all currently-empty modules:
--
--   • student_identity_profiles    — all 1130 students
--   • student_logistics_profiles   — all 1130 students
--   • student_enrichment_profiles  — all 1130 students
--   • student_medical_records      — 20 representative students
--   • student_behavior_records     — 20 representative students
--   • student_achievement_records  — 30 representative students
--   • student_communication_events — 30 representative students
--   • fee_structures               — per-class for Class 6 – 12
--   • student_fee_records          — all students × class fee structures
--   • school_notices               — 10 additional notices
--
-- Idempotent: all INSERTs use ON CONFLICT … DO NOTHING.
-- ─────────────────────────────────────────────────────────────────────────────

DO $v91$
DECLARE
    v_tid UUID := 'c0000000-0000-0000-0000-000000000001';
    v_sid UUID := 'c0000000-0000-0000-0000-000000000002';
    v_ay  UUID := 'c0000000-0000-0000-0000-000000000003';

    -- Fee categories
    v_fc_tuition UUID := 'd2b64638-caba-4ac4-b2eb-0795d9d9415b';
    v_fc_exam    UUID := 'e7014efb-d724-4594-8014-7da5a68beefe';
    v_fc_library UUID := '6dde0df9-aa4b-47be-ae18-4a80728d42c4';
    v_fc_sports  UUID := 'adb30c82-2f67-4ce9-958d-06a7554d1590';

    -- Classes (VI-XII)
    v_cls6  UUID := 'ad32ce0a-3026-409f-a4b2-2e9f3f8e5d14';
    v_cls7  UUID := '88382778-31b6-44be-9f07-6ba5905401a3';
    v_cls8  UUID := '445a120a-cd14-4044-9cd3-6d2d42a09236';
    v_cls9  UUID := '90ea98b7-0088-4683-ae55-531757fdba05';
    v_cls10 UUID := '3fbf6407-db22-4223-97ca-1b28e4d4c428';
    v_cls11 UUID := '29960fdc-8439-4a40-83cc-68fd6f067e4e';
    v_cls12 UUID := '92ca440b-1aa1-4c79-88a1-914d3b0c8cb7';

    -- Staff (admin + teachers for references)
    v_admin_stf  UUID := '4042bb0e-8398-4e38-aa7a-73032214eb8d';
    v_admin_usr  UUID := 'c0000000-0000-0000-0000-000000000010';
    v_teacher001 UUID := '64277783-f966-4bfa-8b78-755d279930da';
    v_teacher002 UUID := '01e5d658-773a-449e-888a-cb0c43e793a9';
    v_teacher003 UUID := '15ecbd4d-a1b1-489e-a443-73543d55bed4';
    v_teacher004 UUID := '11dd77bb-7345-435d-9a6e-917d177d51ca';
    v_teacher005 UUID := '8388c621-bf8b-4ab3-8c95-f3f112397e37';

    -- Subjects
    v_math UUID := '554e3d7d-6ab2-46e3-9c33-0da700a2f825';
    v_eng  UUID := '1a1af224-0408-40c9-a47e-224f225853b1';
    v_hin  UUID := '680f3bdc-79ea-4bac-91b2-3d99b06db9cf';
    v_sci  UUID := 'f46e100c-2f77-4ba5-ac7d-00fa194e6082';
    v_sst  UUID := '6ab96b3c-1dbc-4456-b42a-fe1d0e7be397';

BEGIN
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = v_tid) THEN
        RAISE NOTICE 'V91: jnv-lucknow-demo tenant not found — skipping.';
        RETURN;
    END IF;

    IF NOT EXISTS (
            SELECT 1
            FROM academic_years
            WHERE id = v_ay
              AND tenant_id = v_tid
              AND school_id = v_sid
       )
       OR NOT EXISTS (
            SELECT 1
            FROM students
            WHERE tenant_id = v_tid
              AND school_id = v_sid
            LIMIT 1
       )
       OR NOT EXISTS (
            SELECT 1
            FROM fee_categories
            WHERE id IN (v_fc_tuition, v_fc_exam, v_fc_library, v_fc_sports)
              AND tenant_id = v_tid
              AND school_id = v_sid
            GROUP BY school_id
            HAVING COUNT(*) = 4
       )
       OR NOT EXISTS (
            SELECT 1
            FROM classes
            WHERE id IN (v_cls6, v_cls7, v_cls8, v_cls9, v_cls10, v_cls11, v_cls12)
              AND tenant_id = v_tid
              AND school_id = v_sid
            GROUP BY school_id
            HAVING COUNT(*) = 7
       ) THEN
        RAISE NOTICE 'V91: JNV bulk demo data not present yet — skipping enrichment seed.';
        RETURN;
    END IF;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Fee structures — Classes 6–12 (4 categories each)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO fee_structures
  (tenant_id, school_id, academic_year_id, class_id, fee_category_id, amount, due_date, frequency)
VALUES
  -- Class 6
  (v_tid,v_sid,v_ay,v_cls6, v_fc_tuition,  8000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls6, v_fc_exam,     1000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls6, v_fc_library,   400.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls6, v_fc_sports,    500.00,'2026-05-15','ANNUAL'),
  -- Class 7
  (v_tid,v_sid,v_ay,v_cls7, v_fc_tuition,  9000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls7, v_fc_exam,     1000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls7, v_fc_library,   400.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls7, v_fc_sports,    500.00,'2026-05-15','ANNUAL'),
  -- Class 8
  (v_tid,v_sid,v_ay,v_cls8, v_fc_tuition, 10000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls8, v_fc_exam,     1200.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls8, v_fc_library,   400.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls8, v_fc_sports,    600.00,'2026-05-15','ANNUAL'),
  -- Class 9
  (v_tid,v_sid,v_ay,v_cls9, v_fc_tuition, 11000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls9, v_fc_exam,     1500.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls9, v_fc_library,   500.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls9, v_fc_sports,    700.00,'2026-05-15','ANNUAL'),
  -- Class 10
  (v_tid,v_sid,v_ay,v_cls10,v_fc_tuition, 12000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls10,v_fc_exam,     1500.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls10,v_fc_library,   500.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls10,v_fc_sports,    750.00,'2026-05-15','ANNUAL'),
  -- Class 11
  (v_tid,v_sid,v_ay,v_cls11,v_fc_tuition, 13000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls11,v_fc_exam,     1800.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls11,v_fc_library,   500.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls11,v_fc_sports,    750.00,'2026-05-15','ANNUAL'),
  -- Class 12
  (v_tid,v_sid,v_ay,v_cls12,v_fc_tuition, 14000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls12,v_fc_exam,     2000.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls12,v_fc_library,   500.00,'2026-04-30','ANNUAL'),
  (v_tid,v_sid,v_ay,v_cls12,v_fc_sports,    750.00,'2026-05-15','ANNUAL')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Student fee records — all students in Classes 6–12 × their class fee structures
--    ~525 students (7 classes × 3 sections × 25) × 4 structures = ~2100 records
--    Mix: deterministic paid/partial/pending based on student id hash
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
  CASE ABS(HASHTEXT(s.id::TEXT || fs.id::TEXT)) % 4
    WHEN 0 THEN 0.00
    WHEN 1 THEN fs.amount
    WHEN 2 THEN ROUND(fs.amount * 0.5, 2)
    ELSE fs.amount
  END,
  0.00,
  fs.due_date,
  CASE ABS(HASHTEXT(s.id::TEXT || fs.id::TEXT)) % 4
    WHEN 0 THEN CASE WHEN fs.due_date IS NOT NULL AND fs.due_date < CURRENT_DATE THEN 'OVERDUE' ELSE 'PENDING' END
    WHEN 1 THEN 'PAID'
    WHEN 2 THEN 'PARTIAL'
    ELSE 'PAID'
  END
FROM students s
JOIN fee_structures fs ON fs.class_id = s.class_id AND fs.academic_year_id = v_ay
WHERE s.school_id = v_sid
  AND fs.tenant_id = v_tid
  AND s.class_id IN (v_cls6,v_cls7,v_cls8,v_cls9,v_cls10,v_cls11,v_cls12)
ON CONFLICT ON CONSTRAINT uq_student_fee_record DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. student_identity_profiles — all students (deterministic from student data)
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
  '5' || LPAD((ABS(HASHTEXT(student_number)) % 100000000000)::TEXT, 11, '0'),
  'Indian',
  CASE ABS(HASHTEXT(student_number)) % 10
    WHEN 0 THEN 'Muslim'  WHEN 1 THEN 'Christian'
    ELSE 'Hindu'
  END,
  CASE ABS(HASHTEXT(last_name)) % 5
    WHEN 0 THEN 'OBC'  WHEN 1 THEN 'SC'  WHEN 2 THEN 'ST'
    ELSE 'General'
  END,
  CASE ABS(HASHTEXT(first_name)) % 4
    WHEN 0 THEN 'English' ELSE 'Hindi'
  END,
  CASE ABS(HASHTEXT(student_number)) % 4
    WHEN 0 THEN 'Kendriya Vidyalaya, Lucknow'
    WHEN 1 THEN 'Government Upper Primary School, Sitapur'
    WHEN 2 THEN 'Saraswati Vidya Mandir, Varanasi'
    ELSE 'Municipal Primary School, Lucknow'
  END,
  'NAVODAYA_ENTRANCE',
  CASE gender WHEN 'FEMALE' THEN 'Smt. ' ELSE 'Shri ' END ||
    CASE ABS(HASHTEXT(last_name)) % 5
      WHEN 0 THEN 'Ram ' WHEN 1 THEN 'Vijay ' WHEN 2 THEN 'Suresh '
      WHEN 3 THEN 'Mohan ' ELSE 'Rajesh '
    END || last_name,
  '9' || LPAD((ABS(HASHTEXT(id::TEXT)) % 1000000000)::TEXT, 9, '4')
FROM students
WHERE school_id = v_sid
ON CONFLICT (student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. student_logistics_profiles — hostel (55%), bus (30%), day scholar (15%)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_logistics_profiles
  (tenant_id, school_id, student_id,
   transport_mode, route_name, pickup_point, drop_point,
   hostel_name, room_number, warden_contact)
SELECT
  v_tid, v_sid, id,
  CASE ABS(HASHTEXT(student_number)) % 10
    WHEN 0 THEN 'SELF' WHEN 1 THEN 'SELF'
    WHEN 2 THEN 'BUS'  WHEN 3 THEN 'BUS'  WHEN 4 THEN 'BUS'
    ELSE 'HOSTEL'
  END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 IN (2,3,4)
       THEN CASE ABS(HASHTEXT(student_number)) % 3
              WHEN 0 THEN 'Route-A (Gomti Nagar – Indira Nagar)'
              WHEN 1 THEN 'Route-B (Alambagh – Hazratganj)'
              ELSE 'Route-C (Aliganj – Chinhat)'
            END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 IN (2,3,4)
       THEN CASE ABS(HASHTEXT(student_number)) % 3
              WHEN 0 THEN 'Sector 12, Gomti Nagar'
              WHEN 1 THEN 'Alambagh Bus Stand'
              ELSE 'Aliganj Chauraha'
            END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 IN (2,3,4)
       THEN 'JNV Lucknow Main Gate' ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 NOT IN (0,1,2,3,4)
       THEN CASE gender WHEN 'FEMALE' THEN 'Girls'' Hostel Block-A' ELSE 'Boys'' Hostel Block-B' END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 NOT IN (0,1,2,3,4)
       THEN CASE gender WHEN 'FEMALE'
              THEN 'GH-' || LPAD(((ABS(HASHTEXT(student_number)) % 50) + 101)::TEXT, 3, '0')
              ELSE 'BH-' || LPAD(((ABS(HASHTEXT(student_number)) % 60) + 201)::TEXT, 3, '0')
            END
       ELSE NULL END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 10 NOT IN (0,1,2,3,4)
       THEN CASE gender WHEN 'FEMALE' THEN '9415099001' ELSE '9415099002' END
       ELSE NULL END
FROM students
WHERE school_id = v_sid
ON CONFLICT (student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. student_enrichment_profiles — interests, hobbies, skills, goals, AI insights
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_enrichment_profiles
  (tenant_id, school_id, student_id,
   interests, hobbies, skills, career_goals, learning_style,
   counseling_summary, ai_risk_level, ai_insights)
SELECT
  v_tid, v_sid, id,
  CASE ABS(HASHTEXT(student_number)) % 6
    WHEN 0 THEN 'Mathematics, Science, Robotics'
    WHEN 1 THEN 'Reading, Creative Writing, Debating'
    WHEN 2 THEN 'Sports, Athletics, Cricket'
    WHEN 3 THEN 'Music, Fine Arts, Drama'
    WHEN 4 THEN 'Computer Programming, Gaming'
    ELSE 'Nature, Gardening, Environmental Science'
  END,
  CASE ABS(HASHTEXT(first_name)) % 5
    WHEN 0 THEN 'Drawing, Painting, Origami'
    WHEN 1 THEN 'Cricket, Badminton, Chess'
    WHEN 2 THEN 'Cooking, Yoga, Cycling'
    WHEN 3 THEN 'Photography, Reading'
    ELSE 'Kabaddi, Running, Swimming'
  END,
  CASE ABS(HASHTEXT(last_name)) % 4
    WHEN 0 THEN 'Problem-Solving, Analytical Thinking'
    WHEN 1 THEN 'Leadership, Communication, Teamwork'
    WHEN 2 THEN 'Creative Thinking, Artistic Expression'
    ELSE 'Technical Skills, Digital Literacy'
  END,
  CASE ABS(HASHTEXT(student_number)) % 7
    WHEN 0 THEN 'IIT engineer — aerospace or software'
    WHEN 1 THEN 'Doctor (MBBS) to serve rural communities'
    WHEN 2 THEN 'IAS officer for public service'
    WHEN 3 THEN 'Teacher or university professor'
    WHEN 4 THEN 'Chartered accountant or entrepreneur'
    WHEN 5 THEN 'Join Indian Defence Forces'
    ELSE 'Research scientist or data analyst'
  END,
  CASE ABS(HASHTEXT(id::TEXT)) % 3
    WHEN 0 THEN 'VISUAL' WHEN 1 THEN 'AUDITORY' ELSE 'KINESTHETIC'
  END,
  CASE WHEN ABS(HASHTEXT(student_number)) % 8 = 0
       THEN 'Student needs support with time management. Counselled on structured study schedule.'
       WHEN ABS(HASHTEXT(student_number)) % 8 = 1
       THEN 'Excellent participation in class. Encouraged to mentor peers.'
       ELSE NULL
  END,
  CASE WHEN ABS(HASHTEXT(id::TEXT)) % 15 = 0 THEN 'HIGH'
       WHEN ABS(HASHTEXT(id::TEXT)) % 15 < 3 THEN 'MEDIUM'
       ELSE 'LOW'
  END,
  CASE WHEN ABS(HASHTEXT(id::TEXT)) % 15 = 0
       THEN 'Attendance dropped below 75%. Mathematics performance declining. Immediate parent-teacher meeting recommended.'
       WHEN ABS(HASHTEXT(id::TEXT)) % 15 < 3
       THEN 'Slight irregularity in assignment submissions. Overall satisfactory. Monitoring advised.'
       ELSE 'Student on track. Consistent attendance and steady performance. Positive peer interactions.'
  END
FROM students
WHERE school_id = v_sid
ON CONFLICT (student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. student_medical_records — 20 students from Classes 9–12
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_medical_records
  (tenant_id, school_id, student_id, condition_name, severity, medication, doctor_contact, notes)
SELECT
  v_tid, v_sid, s.id,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 8
    WHEN 0 THEN 'Mild Myopia'
    WHEN 1 THEN 'Allergic Rhinitis'
    WHEN 2 THEN 'Asthma (Mild)'
    WHEN 3 THEN 'Iron Deficiency Anaemia'
    WHEN 4 THEN 'Eczema'
    WHEN 5 THEN 'Seasonal Conjunctivitis'
    WHEN 6 THEN 'Migraine'
    ELSE 'Thalassemia Minor'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 3
    WHEN 0 THEN 'LOW' WHEN 1 THEN 'MEDIUM' ELSE 'LOW'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 8
    WHEN 0 THEN 'Corrective lenses (-1.5D). Seated in front row.'
    WHEN 1 THEN 'Cetirizine 5mg seasonal. Dust and pollen triggers.'
    WHEN 2 THEN 'Salbutamol inhaler (rescue). Kept with class teacher.'
    WHEN 3 THEN 'Ferrous Sulphate 100mg daily. Haemoglobin check every 3 months.'
    WHEN 4 THEN 'Hydrocortisone cream topical. Flare-ups in winter.'
    WHEN 5 THEN 'Olopatadine eye drops seasonal. Antihistamine in medical room.'
    WHEN 6 THEN 'Sumatriptan 50mg on-demand. Rest room access authorised.'
    ELSE 'No regular medication. Dietary restriction on iron supplements.'
  END,
  'Dr. School Medical Officer — 9415200000',
  'Record maintained by school medical team. Parents informed at admission.'
FROM students s
WHERE s.class_id IN (v_cls9, v_cls10, v_cls11, v_cls12)
  AND s.school_id = v_sid
ORDER BY s.student_number
LIMIT 20
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. student_behavior_records — positive entries for top performers,
--    corrective entries for a few at-risk students
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_behavior_records
  (tenant_id, school_id, student_id, category, severity, summary, action_taken, counselor_notes)
SELECT
  v_tid, v_sid, s.id,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 4
    WHEN 0 THEN 'POSITIVE'
    WHEN 1 THEN 'POSITIVE'
    WHEN 2 THEN 'DISCIPLINARY'
    ELSE 'ATTENDANCE'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 4
    WHEN 2 THEN 'LOW' WHEN 3 THEN 'MEDIUM' ELSE 'LOW'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 4
    WHEN 0 THEN s.first_name || ' demonstrated exemplary leadership during the inter-house science quiz.'
    WHEN 1 THEN s.first_name || ' consistently assists classmates and was nominated as class monitor.'
    WHEN 2 THEN s.first_name || ' found using mobile phone during class. First offence. Verbal warning issued.'
    ELSE s.first_name || ' had 4 unexplained absences in the past month. Parents notified.'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 4
    WHEN 0 THEN 'Certificate of appreciation presented at assembly.'
    WHEN 1 THEN 'Nominated as Class Representative for 2025-26.'
    WHEN 2 THEN 'Phone confiscated for 3 days. Parents called. Undertaking signed.'
    ELSE 'Parents contacted. Attendance regularised after medical certificate provided.'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 4
    WHEN 3 THEN 'Family issue identified. Student counselled and monitored closely.'
    ELSE NULL
  END
FROM students s
WHERE s.class_id IN (v_cls8, v_cls9, v_cls10, v_cls11, v_cls12)
  AND s.school_id = v_sid
ORDER BY s.student_number
LIMIT 20
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. student_achievement_records — 30 students across all classes
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_achievement_records
  (tenant_id, school_id, student_id, title, category, description, awarded_on)
SELECT
  v_tid, v_sid, s.id,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 8
    WHEN 0 THEN 'First Prize — Inter-Class Mathematics Quiz 2025'
    WHEN 1 THEN 'District Science Olympiad — Silver Medal'
    WHEN 2 THEN 'Best Class Representative Award 2025-26'
    WHEN 3 THEN 'Under-14 State Badminton — Bronze Medal'
    WHEN 4 THEN 'NTSE Stage-1 Qualifier 2025'
    WHEN 5 THEN 'Annual Essay Competition — First Prize'
    WHEN 6 THEN 'School Topper — Half-Yearly Examination'
    ELSE 'NCC Excellence Award — Republic Day Parade'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 8
    WHEN 0 THEN 'ACADEMIC'
    WHEN 1 THEN 'ACADEMIC'
    WHEN 2 THEN 'LEADERSHIP'
    WHEN 3 THEN 'SPORTS'
    WHEN 4 THEN 'ACADEMIC'
    WHEN 5 THEN 'CULTURAL'
    WHEN 6 THEN 'ACADEMIC'
    ELSE 'EXTRA_CURRICULAR'
  END,
  s.first_name || ' ' || s.last_name || ' received this award for outstanding performance at JNV Lucknow.',
  DATE '2025-08-15' + ((ROW_NUMBER() OVER (ORDER BY s.student_number) % 12) * INTERVAL '30 days')
FROM students s
WHERE s.school_id = v_sid
ORDER BY s.student_number
LIMIT 30
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. student_communication_events — 30 students, realistic channels
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_communication_events
  (tenant_id, school_id, student_id, channel, direction, subject, summary, occurred_at)
SELECT
  v_tid, v_sid, s.id,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 4
    WHEN 0 THEN 'PHONE'
    WHEN 1 THEN 'EMAIL'
    WHEN 2 THEN 'MEETING'
    ELSE 'SMS'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 3
    WHEN 0 THEN 'OUTBOUND' ELSE 'INBOUND'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 5
    WHEN 0 THEN 'Exam Result Notification'
    WHEN 1 THEN 'PTM — Parent-Teacher Meeting'
    WHEN 2 THEN 'Attendance Irregularity Alert'
    WHEN 3 THEN 'Fee Payment Reminder'
    ELSE 'Academic Progress Update'
  END,
  CASE ROW_NUMBER() OVER (ORDER BY s.student_number) % 5
    WHEN 0 THEN 'Parent informed of ' || s.first_name || '''s examination result. Performance discussed and guidance provided.'
    WHEN 1 THEN 'PTM attended by parent of ' || s.first_name || '. Academic progress and extracurricular activities reviewed.'
    WHEN 2 THEN 'Parent contacted regarding ' || s.first_name || '''s attendance. Matter resolved after explanation.'
    WHEN 3 THEN 'Fee payment reminder sent to parent of ' || s.first_name || '. Due date: 30 April 2026.'
    ELSE 'Academic progress of ' || s.first_name || ' reviewed with parents. Improvement plan shared.'
  END,
  TIMESTAMPTZ '2025-09-01 09:00:00+00' + ((ROW_NUMBER() OVER (ORDER BY s.student_number) % 60) * INTERVAL '5 days')
FROM students s
WHERE s.school_id = v_sid
ORDER BY s.student_number
LIMIT 30
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Additional school notices (10) — id supplied explicitly (no DEFAULT on col)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO school_notices
  (id, tenant_id, school_id, title, content, category, target,
   priority, is_published, published_at, expires_at, posted_by)
VALUES
  ('91910001-0000-0000-0000-000000000001', v_tid, v_sid,
   'Annual Sports Meet 2026 — Registration Open',
   'The Annual Sports Meet will be held from 10–12 May 2026. Students of all classes may register for athletics, cricket, badminton, kabaddi, and chess with their Physical Education teacher by 30 April 2026.',
   'GENERAL', 'ALL', 2, true, '2026-04-15 09:00:00+00', '2026-05-09 23:59:00+00', v_admin_usr),
  ('91910002-0000-0000-0000-000000000001', v_tid, v_sid,
   'Class XII Board Examination — Hall Ticket Distribution',
   'CBSE Board hall tickets for Class XII will be distributed on 20 April 2026. Students must verify details and report discrepancies to the school office within 48 hours.',
   'EXAM', 'STUDENT', 3, true, '2026-04-15 10:00:00+00', '2026-04-22 23:59:00+00', v_admin_usr),
  ('91910003-0000-0000-0000-000000000001', v_tid, v_sid,
   'NMMS Scholarship — Applications Invited',
   'Applications for the National Means-cum-Merit Scholarship 2026-27 (Class VIII) are invited. Family income must be below ₹3.5 lakhs annually. Forms available at the school office. Last date: 15 May 2026.',
   'ACADEMIC', 'STUDENT', 2, true, '2026-04-18 09:00:00+00', '2026-05-14 23:59:00+00', v_admin_usr),
  ('91910004-0000-0000-0000-000000000001', v_tid, v_sid,
   'Digital Library Access — Student Credentials Issued',
   'Students of Classes 9–12 have been provided login credentials for the NVS Digital Library. Access includes NCERT e-books, past papers, and curated study material. Do not share credentials.',
   'ACADEMIC', 'STUDENT', 1, true, '2026-04-19 11:00:00+00', '2026-09-30 23:59:00+00', v_admin_usr),
  ('91910005-0000-0000-0000-000000000001', v_tid, v_sid,
   'Hostel Fee Revision — Effective 1 June 2026',
   'Pursuant to NVS Circular 2026/03, hostel maintenance charges will be revised from 1 June 2026. The revised fee structure is available at the school office. Parents are requested to plan accordingly.',
   'FEE', 'PARENT', 2, true, '2026-04-20 10:00:00+00', '2026-06-01 00:00:00+00', v_admin_usr),
  ('91910006-0000-0000-0000-000000000001', v_tid, v_sid,
   'Staff Professional Development Workshop — May 2026',
   'A two-day pedagogy workshop for all teaching staff will be held on 3–4 May 2026. Topics: Activity-Based Learning, Digital Classroom Tools, and Formative Assessment. Attendance is mandatory.',
   'GENERAL', 'TEACHER', 2, true, '2026-04-22 09:00:00+00', '2026-05-03 00:00:00+00', v_admin_usr),
  ('91910007-0000-0000-0000-000000000001', v_tid, v_sid,
   'Anti-Ragging Awareness — Zero Tolerance Policy',
   'The school Anti-Ragging Committee reminds all students that any form of ragging or bullying is strictly prohibited. Anonymous complaints can be dropped in the sealed box outside the Principal''s office.',
   'GENERAL', 'ALL', 2, true, '2026-04-23 09:00:00+00', '2027-03-31 23:59:00+00', v_admin_usr),
  ('91910008-0000-0000-0000-000000000001', v_tid, v_sid,
   'Science Exhibition — Project Deadline Extended',
   'Last date for submitting project proposals for the Annual Science Exhibition has been extended to 22 April 2026. Submit to the respective Science teacher. No further extension will be granted.',
   'ACADEMIC', 'STUDENT', 1, true, '2026-04-18 16:00:00+00', '2026-04-23 23:59:00+00', v_admin_usr),
  ('91910009-0000-0000-0000-000000000001', v_tid, v_sid,
   'Medhavi Internal Scholarship — Apply Now',
   'Students with aggregate above 85% in the last annual examination are eligible for the Medhavi Scholarship (₹500/month for 10 months). Apply by 10 May 2026 at the school office.',
   'ACADEMIC', 'STUDENT', 1, true, '2026-04-25 09:00:00+00', '2026-05-09 23:59:00+00', v_admin_usr),
  ('91910010-0000-0000-0000-000000000001', v_tid, v_sid,
   'Exam Invigilation Duty Roster — Annual Exam April 2026',
   'The invigilation roster for the Annual Examination (20–30 April 2026) is available on the staff notice board. All teaching staff must report to assigned halls 30 minutes before each session.',
   'EXAM', 'TEACHER', 2, true, '2026-04-17 17:00:00+00', '2026-04-30 23:59:00+00', v_admin_usr)
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE 'V91: Profile data, fee records, and notices seeded for tenant %.', v_tid;
END $v91$;
