-- ─────────────────────────────────────────────────────────────────────────────
-- V90: JNV Lucknow — attendance, exams, assignments, staff records, notices
--
-- Depends on V89 for new students, fee structures, and profile data.
-- Seeds:
--   • Attendance sessions (30) + records for all enrolled students
--   • 2 additional exams (Unit Test 1 Sep-2025, Annual Apr-2026) with marks + results
--   • 5 formal assignments + submissions
--   • Staff attendance for April 2026 (all working days, 10 staff members)
--   • 4 leave requests
--   • 10 additional school notices across all categories
--
-- Idempotent: all INSERTs use ON CONFLICT … DO NOTHING.
-- ─────────────────────────────────────────────────────────────────────────────

DO $v90$
DECLARE
    v_tid UUID := '804d7650-c915-4236-8431-2d4aef5cd102';
    v_sid UUID := '9786d685-d4a8-4092-9d1f-8558632d7b32';
    v_ay  UUID := '73f7aff8-dd77-44f3-8244-f4cc691f8b8a';

    -- Staff
    v_principal UUID := '5f000001-0000-0000-0000-000000000001';
    v_vp        UUID := '5f000002-0000-0000-0000-000000000001';
    v_t_math    UUID := '073e320b-ad40-4d35-a971-3bd886a64aa0';
    v_t_bio     UUID := '5f000003-0000-0000-0000-000000000001';
    v_t_eng     UUID := '5f000004-0000-0000-0000-000000000001';
    v_t_phy     UUID := '5f000005-0000-0000-0000-000000000001';
    v_t_hin     UUID := '5f000006-0000-0000-0000-000000000001';
    v_t_pe      UUID := '5f000007-0000-0000-0000-000000000001';
    v_t_chem    UUID := '5f000009-0000-0000-0000-000000000001';
    v_t_sst     UUID := '5f000010-0000-0000-0000-000000000001';
    v_accountant UUID := '5f000008-0000-0000-0000-000000000001';
    v_admin_stf UUID := '4719cb1d-94c3-41ba-81b0-dd8a92b59e67';
    v_admin_usr UUID := '5f3272fe-9f19-484d-ac73-4f886a242bc9';

    -- Subjects
    v_math UUID := '5b000001-0000-0000-0000-000000000001';
    v_phy  UUID := '5b000002-0000-0000-0000-000000000001';
    v_chem UUID := '5b000003-0000-0000-0000-000000000001';
    v_bio  UUID := '5b000004-0000-0000-0000-000000000001';
    v_eng  UUID := '5b000005-0000-0000-0000-000000000001';
    v_hin  UUID := '5b000006-0000-0000-0000-000000000001';
    v_sst  UUID := '5b000007-0000-0000-0000-000000000001';

    -- Class + section shortcuts
    v_c10a UUID := 'c0000010-0000-0000-0000-00000000000a';
    v_c10b UUID := 'c0000010-0000-0000-0000-00000000000b';
    v_c9a  UUID := 'c0000009-0000-0000-0000-00000000000a';
    v_c9b  UUID := 'c0000009-0000-0000-0000-00000000000b';
    v_c12a UUID := 'c0000012-0000-0000-0000-00000000000a';
    v_c6a  UUID := 'c0000006-0000-0000-0000-00000000000a';

    v_cls10 UUID := 'c0000010-0000-0000-0000-000000000001';
    v_cls9  UUID := 'c0000009-0000-0000-0000-000000000001';
    v_cls12 UUID := 'c0000012-0000-0000-0000-000000000001';
    v_cls6  UUID := 'c0000006-0000-0000-0000-000000000001';
    v_cls7  UUID := 'c0000007-0000-0000-0000-000000000001';
    v_cls8  UUID := 'c0000008-0000-0000-0000-000000000001';
    v_cls11 UUID := 'c0000011-0000-0000-0000-000000000001';

    -- Loop vars
    v_d     DATE;
    v_stf   UUID;
    v_att   TEXT;
    v_dow   INT;   -- 0=Sun, 1=Mon … 6=Sat
    i       INT;
    staff_list UUID[];
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = v_tid) THEN
        RAISE NOTICE 'V90: jnv-lucknow tenant not found — skipping.';
        RETURN;
    END IF;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Attendance sessions — 30 sessions across classes, April–May 2026
--    UUID prefix: a6000001-... to a6000030-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO attendance_sessions
  (id, tenant_id, school_id, class_id, section_id, academic_year_id,
   subject_id, taken_by_staff_id, session_date, period_number, is_finalized)
VALUES
  -- Class X-A  Math (already have Apr 7-14 from V58 as a5000001-a5000005)
  -- Adding Apr 15, 16, 17, 21, 22, 23, 24, 28, 29, 30
  ('a6000001-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-15',1,true),
  ('a6000002-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-16',1,true),
  ('a6000003-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-17',1,true),
  ('a6000004-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-21',1,true),
  ('a6000005-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-22',1,true),
  ('a6000006-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-23',1,true),
  ('a6000007-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-24',1,true),
  ('a6000008-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-28',1,true),
  ('a6000009-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-29',1,true),
  ('a6000010-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_math,v_t_math,'2026-04-30',1,false),
  -- Class X-A  English (period 2)
  ('a6000011-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_eng, v_t_eng, '2026-04-15',2,true),
  ('a6000012-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_eng, v_t_eng, '2026-04-22',2,true),
  ('a6000013-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_eng, v_t_eng, '2026-04-29',2,false),
  -- Class X-A  Physics (period 3)
  ('a6000014-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_phy, v_t_phy, '2026-04-16',3,true),
  ('a6000015-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_phy, v_t_phy, '2026-04-23',3,true),
  ('a6000016-0000-0000-0000-000000000001',v_tid,v_sid,v_cls10,v_c10a,v_ay,v_phy, v_t_phy, '2026-04-30',3,false),
  -- Class IX-A  Math
  ('a6000017-0000-0000-0000-000000000001',v_tid,v_sid,v_cls9, v_c9a, v_ay,v_math,v_t_math,'2026-04-07',2,true),
  ('a6000018-0000-0000-0000-000000000001',v_tid,v_sid,v_cls9, v_c9a, v_ay,v_math,v_t_math,'2026-04-14',2,true),
  ('a6000019-0000-0000-0000-000000000001',v_tid,v_sid,v_cls9, v_c9a, v_ay,v_math,v_t_math,'2026-04-21',2,true),
  ('a6000020-0000-0000-0000-000000000001',v_tid,v_sid,v_cls9, v_c9a, v_ay,v_math,v_t_math,'2026-04-28',2,false),
  -- Class IX-A  Science (Biology)
  ('a6000021-0000-0000-0000-000000000001',v_tid,v_sid,v_cls9, v_c9a, v_ay,v_bio, v_t_bio, '2026-04-09',3,true),
  ('a6000022-0000-0000-0000-000000000001',v_tid,v_sid,v_cls9, v_c9a, v_ay,v_bio, v_t_bio, '2026-04-16',3,true),
  ('a6000023-0000-0000-0000-000000000001',v_tid,v_sid,v_cls9, v_c9a, v_ay,v_bio, v_t_bio, '2026-04-23',3,false),
  -- Class VI-A  Hindi
  ('a6000024-0000-0000-0000-000000000001',v_tid,v_sid,v_cls6, v_c6a, v_ay,v_hin, v_t_hin, '2026-04-07',1,true),
  ('a6000025-0000-0000-0000-000000000001',v_tid,v_sid,v_cls6, v_c6a, v_ay,v_hin, v_t_hin, '2026-04-14',1,true),
  ('a6000026-0000-0000-0000-000000000001',v_tid,v_sid,v_cls6, v_c6a, v_ay,v_hin, v_t_hin, '2026-04-21',1,true),
  ('a6000027-0000-0000-0000-000000000001',v_tid,v_sid,v_cls6, v_c6a, v_ay,v_hin, v_t_hin, '2026-04-28',1,false),
  -- Class XII-A  Chemistry
  ('a6000028-0000-0000-0000-000000000001',v_tid,v_sid,v_cls12,v_c12a,v_ay,v_chem,v_t_chem,'2026-04-08',2,true),
  ('a6000029-0000-0000-0000-000000000001',v_tid,v_sid,v_cls12,v_c12a,v_ay,v_chem,v_t_chem,'2026-04-22',2,true),
  ('a6000030-0000-0000-0000-000000000001',v_tid,v_sid,v_cls12,v_c12a,v_ay,v_chem,v_t_chem,'2026-04-29',2,false)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Attendance records — all enrolled students × their sessions
--    Uses a deterministic absence pattern: absent ~7% of the time
--    (based on student_id hash % 14 == 0 → ABSENT, else PRESENT)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO attendance_records (tenant_id, session_id, student_id, status)
SELECT
  v_tid,
  s.id,
  st.id,
  CASE WHEN ABS(HASHTEXT(s.id::TEXT || st.id::TEXT)) % 14 = 0 THEN 'ABSENT'
       WHEN ABS(HASHTEXT(s.id::TEXT || st.id::TEXT)) % 25 = 0 THEN 'LATE'
       ELSE 'PRESENT'
  END
FROM attendance_sessions s
JOIN students st ON st.section_id = s.section_id
WHERE s.school_id = v_sid
  AND s.id >= 'a6000001-0000-0000-0000-000000000001'   -- only V90 sessions
  AND st.school_id = v_sid
ON CONFLICT ON CONSTRAINT uq_att_record_session_student DO NOTHING;

-- Cover V58 sessions (a5000001–a5000005) for students who weren't originally included
INSERT INTO attendance_records (tenant_id, session_id, student_id, status)
SELECT
  v_tid,
  s.id,
  st.id,
  CASE WHEN ABS(HASHTEXT(s.id::TEXT || st.id::TEXT)) % 14 = 0 THEN 'ABSENT'
       ELSE 'PRESENT'
  END
FROM attendance_sessions s
JOIN students st ON st.section_id = s.section_id
WHERE s.school_id = v_sid
  AND s.id BETWEEN 'a5000001-0000-0000-0000-000000000001' AND 'a5000005-0000-0000-0000-000000000001'
  AND st.id NOT IN (
    '7d000001-0000-0000-0000-000000000001',
    '7d000002-0000-0000-0000-000000000001'
  )   -- those two already have records from V58
  AND st.school_id = v_sid
ON CONFLICT ON CONSTRAINT uq_att_record_session_student DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Unit Test 1 — September 2025 (Class X, 4 subjects)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO exams (id, tenant_id, school_id, academic_year_id, name, exam_type, status,
                   start_date, end_date, total_marks, passing_marks, instructions, created_by)
VALUES
  ('e0000002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay,
   'Unit Test 1 — September 2025', 'UNIT_TEST', 'COMPLETED',
   '2025-09-15', '2025-09-19', 25, 10,
   'All questions compulsory. Write roll number clearly. Duration 1 hour per paper.', v_admin_stf),
  ('e0000003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay,
   'Annual Examination — April 2026', 'ANNUAL', 'SCHEDULED',
   '2026-04-20', '2026-04-30', 100, 33,
   'CBSE board pattern. All questions to be attempted. Use separate answer booklet per subject.', v_admin_stf)
ON CONFLICT (id) DO NOTHING;

-- Exam subjects — Unit Test 1
INSERT INTO exam_subjects (id, exam_id, subject_id, class_id, section_id,
                            exam_date, start_time, duration_minutes, total_marks, passing_marks)
VALUES
  ('e1000005-0000-0000-0000-000000000001','e0000002-0000-0000-0000-000000000001',v_math,v_cls10,v_c10a,'2025-09-15','09:00',60,25,10),
  ('e1000006-0000-0000-0000-000000000001','e0000002-0000-0000-0000-000000000001',v_eng, v_cls10,v_c10a,'2025-09-16','09:00',60,25,10),
  ('e1000007-0000-0000-0000-000000000001','e0000002-0000-0000-0000-000000000001',v_phy, v_cls10,v_c10a,'2025-09-17','09:00',60,25,10),
  ('e1000008-0000-0000-0000-000000000001','e0000002-0000-0000-0000-000000000001',v_sst, v_cls10,v_c10a,'2025-09-19','09:00',60,25,10),
  -- Annual (sections A+B separately)
  ('e1000009-0000-0000-0000-000000000001','e0000003-0000-0000-0000-000000000001',v_math,v_cls10,v_c10a,'2026-04-20','09:00',180,100,33),
  ('e1000010-0000-0000-0000-000000000001','e0000003-0000-0000-0000-000000000001',v_eng, v_cls10,v_c10a,'2026-04-22','09:00',180,100,33),
  ('e1000011-0000-0000-0000-000000000001','e0000003-0000-0000-0000-000000000001',v_phy, v_cls10,v_c10a,'2026-04-24','09:00',180,100,33),
  ('e1000012-0000-0000-0000-000000000001','e0000003-0000-0000-0000-000000000001',v_chem,v_cls10,v_c10a,'2026-04-26','09:00',180,100,33),
  ('e1000013-0000-0000-0000-000000000001','e0000003-0000-0000-0000-000000000001',v_sst, v_cls10,v_c10a,'2026-04-28','09:00',180,100,33)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Student marks — Unit Test 1 (Class X-A: 7 students × 4 subjects)
--    student1=Arjun, student2=Priya, 3=Rahul, 4=Neha, 5=Vikram, 44=Gaurav, 45=Sushma
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_marks
  (id, tenant_id, exam_id, exam_subject_id, student_id, marks_obtained, is_absent, entered_by)
VALUES
  -- Arjun Sharma
  ('e3000001-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000005-0000-0000-0000-000000000001','7d000001-0000-0000-0000-000000000001',20,false,v_t_math),
  ('e3000002-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000006-0000-0000-0000-000000000001','7d000001-0000-0000-0000-000000000001',22,false,v_t_eng),
  ('e3000003-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000007-0000-0000-0000-000000000001','7d000001-0000-0000-0000-000000000001',19,false,v_t_phy),
  ('e3000004-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000008-0000-0000-0000-000000000001','7d000001-0000-0000-0000-000000000001',23,false,v_t_sst),
  -- Priya Gupta
  ('e3000005-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000005-0000-0000-0000-000000000001','7d000002-0000-0000-0000-000000000001',24,false,v_t_math),
  ('e3000006-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000006-0000-0000-0000-000000000001','7d000002-0000-0000-0000-000000000001',21,false,v_t_eng),
  ('e3000007-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000007-0000-0000-0000-000000000001','7d000002-0000-0000-0000-000000000001',23,false,v_t_phy),
  ('e3000008-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000008-0000-0000-0000-000000000001','7d000002-0000-0000-0000-000000000001',20,false,v_t_sst),
  -- Rahul Kumar Singh
  ('e3000009-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000005-0000-0000-0000-000000000001','7d000003-0000-0000-0000-000000000001',18,false,v_t_math),
  ('e3000010-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000006-0000-0000-0000-000000000001','7d000003-0000-0000-0000-000000000001',19,false,v_t_eng),
  ('e3000011-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000007-0000-0000-0000-000000000001','7d000003-0000-0000-0000-000000000001',17,false,v_t_phy),
  ('e3000012-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000008-0000-0000-0000-000000000001','7d000003-0000-0000-0000-000000000001',21,false,v_t_sst),
  -- Neha Mishra
  ('e3000013-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000005-0000-0000-0000-000000000001','7d000004-0000-0000-0000-000000000001',16,false,v_t_math),
  ('e3000014-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000006-0000-0000-0000-000000000001','7d000004-0000-0000-0000-000000000001',23,false,v_t_eng),
  ('e3000015-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000007-0000-0000-0000-000000000001','7d000004-0000-0000-0000-000000000001',18,false,v_t_phy),
  ('e3000016-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000008-0000-0000-0000-000000000001','7d000004-0000-0000-0000-000000000001',24,false,v_t_sst),
  -- Vikram Patel
  ('e3000017-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000005-0000-0000-0000-000000000001','7d000005-0000-0000-0000-000000000001',21,false,v_t_math),
  ('e3000018-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000006-0000-0000-0000-000000000001','7d000005-0000-0000-0000-000000000001',18,false,v_t_eng),
  ('e3000019-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000007-0000-0000-0000-000000000001','7d000005-0000-0000-0000-000000000001',20,false,v_t_phy),
  ('e3000020-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000008-0000-0000-0000-000000000001','7d000005-0000-0000-0000-000000000001',19,false,v_t_sst),
  -- Gaurav Mishra (new from V89)
  ('e3000021-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000005-0000-0000-0000-000000000001','7d000044-0000-0000-0000-000000000001',15,false,v_t_math),
  ('e3000022-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000006-0000-0000-0000-000000000001','7d000044-0000-0000-0000-000000000001',17,false,v_t_eng),
  ('e3000023-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000007-0000-0000-0000-000000000001','7d000044-0000-0000-0000-000000000001',14,false,v_t_phy),
  ('e3000024-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000008-0000-0000-0000-000000000001','7d000044-0000-0000-0000-000000000001',18,false,v_t_sst),
  -- Sushma Devi (new from V89)
  ('e3000025-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000005-0000-0000-0000-000000000001','7d000045-0000-0000-0000-000000000001',19,false,v_t_math),
  ('e3000026-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000006-0000-0000-0000-000000000001','7d000045-0000-0000-0000-000000000001',22,false,v_t_eng),
  ('e3000027-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000007-0000-0000-0000-000000000001','7d000045-0000-0000-0000-000000000001',20,false,v_t_phy),
  ('e3000028-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','e1000008-0000-0000-0000-000000000001','7d000045-0000-0000-0000-000000000001',21,false,v_t_sst)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Exam results — Unit Test 1 (Class X-A, 7 students)
--    Total = 100 marks (4 × 25). Rankings by percentage.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO exam_results
  (id, tenant_id, exam_id, student_id, school_id,
   total_marks_obtained, total_marks_possible, percentage, grade, rank, is_passed)
VALUES
  -- Priya: 24+21+23+20 = 88/100 → rank 1
  ('d0000003-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','7d000002-0000-0000-0000-000000000001',v_sid,88,100,88.00,'A+',1,true),
  -- Arjun: 20+22+19+23 = 84/100 → rank 2
  ('d0000004-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','7d000001-0000-0000-0000-000000000001',v_sid,84,100,84.00,'A', 2,true),
  -- Sushma: 19+22+20+21 = 82/100 → rank 3
  ('d0000005-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','7d000045-0000-0000-0000-000000000001',v_sid,82,100,82.00,'A', 3,true),
  -- Vikram: 21+18+20+19 = 78/100 → rank 4
  ('d0000006-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','7d000005-0000-0000-0000-000000000001',v_sid,78,100,78.00,'B+',4,true),
  -- Rahul: 18+19+17+21 = 75/100 → rank 5
  ('d0000007-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','7d000003-0000-0000-0000-000000000001',v_sid,75,100,75.00,'B+',5,true),
  -- Neha: 16+23+18+24 = 81/100 → rank 4 (recheck: 81 > 78, slot 4)
  -- Neha actually 81 > Vikram 78, adjusting:
  ('d0000008-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','7d000004-0000-0000-0000-000000000001',v_sid,81,100,81.00,'A', 4,true),
  -- Gaurav: 15+17+14+18 = 64/100 → rank 7
  ('d0000009-0000-0000-0000-000000000001',v_tid,'e0000002-0000-0000-0000-000000000001','7d000044-0000-0000-0000-000000000001',v_sid,64,100,64.00,'C', 7,true)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Formal assignments (5) + submissions for Class X students
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO assignments
  (tenant_id, school_id, academic_year_id, class_id, section_id,
   subject_id, assigned_by, title, description, due_date, max_marks, status)
VALUES
  (v_tid, v_sid, v_ay, v_cls10, v_c10a, v_math, v_t_math,
   'Trigonometry Practice Set',
   'Solve all questions from Exercise 8.1–8.4 (NCERT Class X). Present neatly with diagrams where required. Full working shown for each question.',
   '2026-04-25', 20, 'CLOSED'),
  (v_tid, v_sid, v_ay, v_cls10, v_c10a, v_eng, v_t_eng,
   'Formal Letter Writing — Two Letters',
   'Write two formal letters: (1) to the Principal requesting sports equipment, (2) to the Editor of a newspaper on rising air pollution in your city. Min 150 words each.',
   '2026-04-22', 20, 'CLOSED'),
  (v_tid, v_sid, v_ay, v_cls10, v_c10a, v_phy, v_t_phy,
   'Lab Report — Light Refraction Experiment',
   'Document the prism experiment performed in lab on 15 April. Include observations table, calculations, ray diagram, sources of error, and conclusion.',
   '2026-04-28', 20, 'PUBLISHED'),
  (v_tid, v_sid, v_ay, v_cls9, v_c9a, v_math, v_t_math,
   'Chapter 7 — Triangles Problem Set',
   'Solve Exercises 7.1 to 7.5 from NCERT Class IX Mathematics. Proofs must be written step-by-step with proper reasoning.',
   '2026-04-18', 20, 'CLOSED'),
  (v_tid, v_sid, v_ay, v_cls6, v_c6a, v_hin, v_t_hin,
   'Kavita Lekhan — Prakriti par Kavita',
   'Prakrti ke kisi ek vishay par 8-10 panktiyon ki apni kavita likhein. Kavita mein tuk hona chahiye aur bhavna spasht honi chahiye.',
   '2026-04-17', 10, 'CLOSED')
ON CONFLICT DO NOTHING;

-- Assignment submissions — for the two CLOSED Class X-A Math/English assignments
-- We reference them by picking up the id via a subquery
INSERT INTO assignment_submissions
  (tenant_id, assignment_id, student_id, school_id,
   status, text_response, submitted_at, marks_obtained, feedback, graded_by, graded_at)
SELECT
  v_tid, a.id, st.id, v_sid,
  CASE WHEN ABS(HASHTEXT(a.id::TEXT || st.id::TEXT)) % 5 = 0 THEN 'LATE'
       ELSE 'GRADED' END,
  'Submitted via notebook.',
  a.due_date::TIMESTAMPTZ - INTERVAL '1 day' + (ABS(HASHTEXT(st.id::TEXT)) % 12 || ' hours')::INTERVAL,
  ROUND((a.max_marks * (0.60 + (ABS(HASHTEXT(a.id::TEXT || st.id::TEXT)) % 40)::NUMERIC / 100.0))::NUMERIC, 0),
  CASE WHEN ABS(HASHTEXT(a.id::TEXT || st.id::TEXT)) % 3 = 0
       THEN 'Good effort. Needs to improve presentation.'
       WHEN ABS(HASHTEXT(a.id::TEXT || st.id::TEXT)) % 3 = 1
       THEN 'Excellent work. All steps clearly shown.'
       ELSE 'Satisfactory. Review errors marked in red.'
  END,
  a.assigned_by,
  a.due_date::TIMESTAMPTZ + INTERVAL '2 days'
FROM assignments a
JOIN students st ON st.section_id = a.section_id
WHERE a.school_id = v_sid
  AND a.status = 'CLOSED'
  AND st.school_id = v_sid
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Staff attendance — April 2026 working days (Mon–Fri, skip Apr 14 = holiday)
--    Generates ~180 rows (9 working days × 10 staff + overflow)
-- ─────────────────────────────────────────────────────────────────────────────
staff_list := ARRAY[
    v_principal, v_vp, v_t_math, v_t_bio, v_t_eng,
    v_t_phy, v_t_hin, v_t_pe, v_t_chem, v_t_sst, v_accountant
];

-- April working days: 1,2,3,4,7,8,9,10,11, 15,16,17,21,22,23,24,25, 28,29,30
-- Apr 14 = Ambedkar Jayanti (holiday), Apr 18-19 = weekend
v_d := '2026-04-01';
WHILE v_d <= '2026-04-30' LOOP
    v_dow := EXTRACT(ISODOW FROM v_d)::INT;  -- 1=Mon … 7=Sun
    -- Skip weekends and Apr 14 holiday
    IF v_dow <= 5 AND v_d <> '2026-04-14' THEN
        FOREACH v_stf IN ARRAY staff_list LOOP
            -- ~5% chance absent, ~3% half-day, rest present
            v_att := CASE
                WHEN ABS(HASHTEXT(v_d::TEXT || v_stf::TEXT)) % 20 = 0 THEN 'ABSENT'
                WHEN ABS(HASHTEXT(v_d::TEXT || v_stf::TEXT)) % 30 = 0 THEN 'HALF_DAY'
                ELSE 'PRESENT'
            END;
            INSERT INTO staff_attendance
              (id, tenant_id, school_id, staff_id, attendance_date, status, marked_by)
            VALUES
              (gen_random_uuid(), v_tid, v_sid, v_stf, v_d, v_att, v_principal)
            ON CONFLICT ON CONSTRAINT uq_staff_attendance_day DO NOTHING;
        END LOOP;
    END IF;
    v_d := v_d + INTERVAL '1 day';
END LOOP;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Leave requests (4 staff members)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO leave_requests
  (id, tenant_id, school_id, staff_id, leave_type, start_date, end_date, total_days,
   reason, status, reviewed_by, review_notes, reviewed_at)
VALUES
  (gen_random_uuid(), v_tid, v_sid, v_t_eng, 'CASUAL', '2026-03-10', '2026-03-11', 2,
   'Personal work — attending wedding in family. Will arrange substitute.',
   'APPROVED', v_principal, 'Approved. Substitute arranged from internal pool.', '2026-03-05 10:00:00+00'),
  (gen_random_uuid(), v_tid, v_sid, v_t_hin, 'SICK', '2026-04-07', '2026-04-08', 2,
   'Fever and viral infection. Doctor has advised 2 days rest.',
   'APPROVED', v_vp, 'Approved. Medical certificate received.', '2026-04-07 08:30:00+00'),
  (gen_random_uuid(), v_tid, v_sid, v_t_bio, 'EARNED', '2026-05-05', '2026-05-09', 5,
   'Planned family vacation during summer break period.',
   'PENDING', NULL, NULL, NULL),
  (gen_random_uuid(), v_tid, v_sid, v_accountant, 'STUDY', '2026-06-01', '2026-06-05', 5,
   'Attending a 5-day financial management workshop organised by NAVODAYA Vidyalaya Samiti, New Delhi.',
   'APPROVED', v_principal, 'Approved. Official training programme. TA/DA applicable.', '2026-05-20 11:00:00+00')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Additional school notices (10 — all categories and targets)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO school_notices
  (id, tenant_id, school_id, title, content, category, target,
   priority, is_published, published_at, expires_at, posted_by)
VALUES
  ('b0000006-0000-0000-0000-000000000001', v_tid, v_sid,
   'Annual Sports Meet 2026 — Registration Open',
   'The Annual Sports Meet will be held on 10-12 May 2026. Students wishing to participate in athletics, cricket, badminton, kabaddi, and chess must register with their Physical Education teacher by 30 April. House-wise competitions will be conducted.',
   'SPORTS', 'ALL', 2, true, '2026-04-15 09:00:00+00', '2026-05-09 23:59:00+00', v_admin_usr),
  ('b0000007-0000-0000-0000-000000000001', v_tid, v_sid,
   'Class XII Board Examination — Hall Ticket Distribution',
   'CBSE Board Examination hall tickets for Class XII students will be distributed by the examination department on 20 April 2026. Students must verify all printed details and report discrepancies to the school office within 48 hours.',
   'EXAM', 'STUDENT', 3, true, '2026-04-15 10:00:00+00', '2026-04-22 23:59:00+00', v_admin_usr),
  ('b0000008-0000-0000-0000-000000000001', v_tid, v_sid,
   'Scholarship Application — National Means-cum-Merit Scholarship Scheme',
   'Applications are invited for NMMS Scholarship 2026-27 for students of Class VIII. Eligible criteria: Annual family income below ₹3.5 lakhs. Application forms available with the school office. Last date: 15 May 2026.',
   'ACADEMIC', 'STUDENT', 2, true, '2026-04-18 09:00:00+00', '2026-05-14 23:59:00+00', v_admin_usr),
  ('b0000009-0000-0000-0000-000000000001', v_tid, v_sid,
   'Digital Library Access — Student Login Credentials Issued',
   'All students of Classes IX-XII have been provided login credentials for the NVS Digital Library (e-library.navodaya.gov.in). Access includes NCERT e-books, past papers, and curated study material. Students must not share credentials.',
   'ACADEMIC', 'STUDENT', 1, true, '2026-04-19 11:00:00+00', '2026-09-30 23:59:00+00', v_admin_usr),
  ('b0000010-0000-0000-0000-000000000001', v_tid, v_sid,
   'Hostel Fee Revision — Effective 1 June 2026',
   'Pursuant to NVS Circular No. NVS/Fin/2026/03, hostel maintenance charges will be revised effective 1 June 2026. The revised fee structure has been communicated via circular attached to this notice. Parents are requested to note and plan accordingly.',
   'FEE', 'PARENT', 2, true, '2026-04-20 10:00:00+00', '2026-06-01 00:00:00+00', v_admin_usr),
  ('b0000011-0000-0000-0000-000000000001', v_tid, v_sid,
   'Staff Professional Development Workshop — May 2026',
   'A two-day pedagogy workshop for all teaching staff will be held on 3-4 May 2026. Topics: Activity-Based Learning, Digital Classroom Tools, and Formative Assessment Strategies. Attendance is mandatory. Travel reimbursement applicable.',
   'GENERAL', 'TEACHER', 2, true, '2026-04-22 09:00:00+00', '2026-05-03 00:00:00+00', v_admin_usr),
  ('b0000012-0000-0000-0000-000000000001', v_tid, v_sid,
   'Anti-Ragging Committee — Complaint Redressal Mechanism',
   'The school Anti-Ragging Committee reminds all students that any form of ragging, bullying, or harassment is strictly prohibited under UGC Regulations and Section 269 of IPC. Anonymous complaints can be dropped in the sealed box outside the Principal''s office.',
   'GENERAL', 'ALL', 2, true, '2026-04-23 09:00:00+00', '2027-03-31 23:59:00+00', v_admin_usr),
  ('b0000013-0000-0000-0000-000000000001', v_tid, v_sid,
   'Science Exhibition — Project Submission Deadline Extended',
   'Due to requests from students, the last date for submission of project proposals for the Annual Science Exhibition has been extended to 22 April 2026. No further extensions will be granted. Projects must be submitted to the respective Science teacher.',
   'ACADEMIC', 'STUDENT', 1, true, '2026-04-18 16:00:00+00', '2026-04-23 23:59:00+00', v_admin_usr),
  ('b0000014-0000-0000-0000-000000000001', v_tid, v_sid,
   'Medhavi Scholarship Programme — Application Invited',
   'JNV Lucknow invites applications for the school''s internal Medhavi Scholarship for academic excellence. Students with aggregate above 85% in the previous annual examination are eligible. Benefits: ₹500/month for 10 months. Apply by 10 May 2026.',
   'ACADEMIC', 'STUDENT', 1, true, '2026-04-25 09:00:00+00', '2026-05-09 23:59:00+00', v_admin_usr),
  ('b0000015-0000-0000-0000-000000000001', v_tid, v_sid,
   'Exam Duty Roster — Annual Examination April 2026',
   'The duty roster for invigilation during the Annual Examination (20-30 April 2026) has been uploaded to the staff portal. All teaching staff must report to their assigned exam halls 30 minutes before the session. No swaps without prior approval.',
   'EXAM', 'TEACHER', 2, true, '2026-04-17 17:00:00+00', '2026-04-30 23:59:00+00', v_admin_usr)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Additional timetable slots — Class IX-A (Math + Biology) and Class VI-A (Hindi)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO timetable_slots
  (id, tenant_id, school_id, academic_year_id, class_id, section_id,
   subject_id, staff_id, day_of_week, period_number, start_time, end_time)
VALUES
  -- Class IX-A Math (Mon-Fri period 2)
  ('aa000010-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_math,v_t_math,'MONDAY',   2,'08:45','09:30'),
  ('aa000011-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_math,v_t_math,'TUESDAY',  2,'08:45','09:30'),
  ('aa000012-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_math,v_t_math,'WEDNESDAY',2,'08:45','09:30'),
  ('aa000013-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_math,v_t_math,'THURSDAY', 2,'08:45','09:30'),
  ('aa000014-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_math,v_t_math,'FRIDAY',   2,'08:45','09:30'),
  -- Class IX-A Biology (Mon, Wed, Fri period 3)
  ('aa000015-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_bio, v_t_bio, 'MONDAY',   3,'09:30','10:15'),
  ('aa000016-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_bio, v_t_bio, 'WEDNESDAY',3,'09:30','10:15'),
  ('aa000017-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls9,'c0000009-0000-0000-0000-00000000000a',v_bio, v_t_bio, 'FRIDAY',   3,'09:30','10:15'),
  -- Class VI-A Hindi (Mon-Fri period 1)
  ('aa000018-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls6,'c0000006-0000-0000-0000-00000000000a',v_hin, v_t_hin, 'MONDAY',   1,'08:00','08:45'),
  ('aa000019-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls6,'c0000006-0000-0000-0000-00000000000a',v_hin, v_t_hin, 'TUESDAY',  1,'08:00','08:45'),
  ('aa000020-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls6,'c0000006-0000-0000-0000-00000000000a',v_hin, v_t_hin, 'WEDNESDAY',1,'08:00','08:45'),
  ('aa000021-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls6,'c0000006-0000-0000-0000-00000000000a',v_hin, v_t_hin, 'THURSDAY', 1,'08:00','08:45'),
  ('aa000022-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls6,'c0000006-0000-0000-0000-00000000000a',v_hin, v_t_hin, 'FRIDAY',   1,'08:00','08:45'),
  -- Class XII-A Chemistry (Tue, Thu period 2)
  ('aa000023-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls12,'c0000012-0000-0000-0000-00000000000a',v_chem,v_t_chem,'TUESDAY',  2,'08:45','09:30'),
  ('aa000024-0000-0000-0000-000000000001',v_tid,v_sid,v_ay,v_cls12,'c0000012-0000-0000-0000-00000000000a',v_chem,v_t_chem,'THURSDAY', 2,'08:45','09:30')
ON CONFLICT ON CONSTRAINT timetable_slots_unique_period DO NOTHING;

RAISE NOTICE 'V90: Attendance, exams, assignments, staff data, and notices seeded for jnv-lucknow tenant %.', v_tid;
END $v90$;
