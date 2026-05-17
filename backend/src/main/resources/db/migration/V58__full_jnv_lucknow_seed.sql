-- ─────────────────────────────────────────────────────────────────────────────
-- V58: Full JNV Lucknow demo seed — aligned to real DB UUIDs
--
-- Context: V42 used hardcoded fantasy UUIDs (aaaaaaaa-...) that don't match the
-- dynamically-created jnv-lucknow tenant. V58 uses the real UUIDs from the DB.
--
-- Seeds: subjects, classes (VI–XII), sections (A+B), staff (8 additional),
--        students (12), parent-student link, fee structures, fee records,
--        timetable slots, attendance sessions/records, homework, notices,
--        mid-term exam + exam subjects + student marks.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- ─────────────────────────────────────────────────────────────────────────────

DO $v58$
DECLARE
    v_tid UUID := '804d7650-c915-4236-8431-2d4aef5cd102';  -- jnv-lucknow tenant
    v_sid UUID := '9786d685-d4a8-4092-9d1f-8558632d7b32';  -- Jawahar Navodaya Vidyalaya Lucknow
    v_ay  UUID := '73f7aff8-dd77-44f3-8244-f4cc691f8b8a';  -- academic year 2026-27

    -- Existing staff (seeded by V57)
    v_teacher1_staff UUID := '073e320b-ad40-4d35-a971-3bd886a64aa0';
    v_admin_staff    UUID := '4719cb1d-94c3-41ba-81b0-dd8a92b59e67';

    -- Existing user accounts
    v_student1_user    UUID := '6489e01e-df7b-4e0d-bf76-5a0d4c70a78a';
    v_parent1_user     UUID := '306712c0-3870-4526-851e-8c5b701cf088';
    v_admin_user       UUID := '5f3272fe-9f19-484d-ac73-4f886a242bc9';
    v_teacher1_user    UUID := '3d8de146-3d43-4b1a-9623-e1eaea162a84';

    -- Existing fee categories (seeded by TenantBootstrapService)
    v_fc_tuition UUID := '46d7fb43-a4f6-4ce2-9057-3c02427ee85d';
    v_fc_exam    UUID := 'd288e08c-a94e-49fc-8e32-78f2669593f8';
    v_fc_library UUID := 'c32cc264-6cca-4d22-a13e-07d15b4e5026';
    v_fc_sports  UUID := 'efadfeac-84f2-4ea3-8c49-66a8e90c5761';

    -- Existing departments (seeded by TenantBootstrapService)
    v_dept_academic UUID := 'e1c14349-eea3-44a4-a7b5-4b075eb5d286';
    v_dept_science  UUID := 'f41019ce-8bae-4815-94ac-7257c07c5ec9';
    v_dept_arts     UUID := '4756ece6-1f49-4b10-9704-36b1b3f41f93';
    v_dept_admin    UUID := '5f8e1446-c9e6-44b9-bf47-8ec580e9e825';
    v_dept_sports   UUID := '6699bb2e-25ce-402c-8fdd-3cdb52bc6d9e';
BEGIN

IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = v_tid) THEN
    RAISE NOTICE 'V58: jnv-lucknow tenant not found — skipping.';
    RETURN;
END IF;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Subjects (10 core CBSE subjects)
-- UUIDs: 5b000001-... to 5b000010-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO subjects (id, tenant_id, school_id, name, code, description) VALUES
  ('5b000001-0000-0000-0000-000000000001', v_tid, v_sid, 'Mathematics',        'MATH', 'Pure and Applied Mathematics'),
  ('5b000002-0000-0000-0000-000000000001', v_tid, v_sid, 'Physics',            'PHY',  'Classical and Modern Physics'),
  ('5b000003-0000-0000-0000-000000000001', v_tid, v_sid, 'Chemistry',          'CHEM', 'Organic, Inorganic and Physical Chemistry'),
  ('5b000004-0000-0000-0000-000000000001', v_tid, v_sid, 'Biology',            'BIO',  'Zoology and Botany'),
  ('5b000005-0000-0000-0000-000000000001', v_tid, v_sid, 'English',            'ENG',  'English Language and Literature'),
  ('5b000006-0000-0000-0000-000000000001', v_tid, v_sid, 'Hindi',              'HIN',  'Hindi Bhasha aur Sahitya'),
  ('5b000007-0000-0000-0000-000000000001', v_tid, v_sid, 'Social Science',     'SST',  'History, Geography, Civics and Economics'),
  ('5b000008-0000-0000-0000-000000000001', v_tid, v_sid, 'Computer Science',   'CS',   'Programming and Computer Fundamentals'),
  ('5b000009-0000-0000-0000-000000000001', v_tid, v_sid, 'Sanskrit',           'SKT',  'Sanskrit Language and Literature'),
  ('5b000010-0000-0000-0000-000000000001', v_tid, v_sid, 'Physical Education', 'PE',   'Sports, Fitness and Health Education')
ON CONFLICT ON CONSTRAINT uq_subjects_school_code DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Classes VI – XII
-- UUIDs: c0000006-... to c0000012-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO classes (id, tenant_id, school_id, academic_year_id, name, grade_order) VALUES
  ('c0000006-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'Class VI',   6),
  ('c0000007-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'Class VII',  7),
  ('c0000008-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'Class VIII', 8),
  ('c0000009-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'Class IX',   9),
  ('c0000010-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'Class X',   10),
  ('c0000011-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'Class XI',  11),
  ('c0000012-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'Class XII', 12)
ON CONFLICT ON CONSTRAINT uq_classes_school_year_name DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Sections — A & B per class (14 total)
-- UUIDs: c00000{grade}-0000-0000-0000-00000000000a (Section A)
--        c00000{grade}-0000-0000-0000-00000000000b (Section B)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sections (id, tenant_id, school_id, class_id, name, capacity) VALUES
  ('c0000006-0000-0000-0000-00000000000a', v_tid, v_sid, 'c0000006-0000-0000-0000-000000000001', 'A', 40),
  ('c0000006-0000-0000-0000-00000000000b', v_tid, v_sid, 'c0000006-0000-0000-0000-000000000001', 'B', 40),
  ('c0000007-0000-0000-0000-00000000000a', v_tid, v_sid, 'c0000007-0000-0000-0000-000000000001', 'A', 40),
  ('c0000007-0000-0000-0000-00000000000b', v_tid, v_sid, 'c0000007-0000-0000-0000-000000000001', 'B', 40),
  ('c0000008-0000-0000-0000-00000000000a', v_tid, v_sid, 'c0000008-0000-0000-0000-000000000001', 'A', 40),
  ('c0000008-0000-0000-0000-00000000000b', v_tid, v_sid, 'c0000008-0000-0000-0000-000000000001', 'B', 40),
  ('c0000009-0000-0000-0000-00000000000a', v_tid, v_sid, 'c0000009-0000-0000-0000-000000000001', 'A', 40),
  ('c0000009-0000-0000-0000-00000000000b', v_tid, v_sid, 'c0000009-0000-0000-0000-000000000001', 'B', 40),
  ('c0000010-0000-0000-0000-00000000000a', v_tid, v_sid, 'c0000010-0000-0000-0000-000000000001', 'A', 40),
  ('c0000010-0000-0000-0000-00000000000b', v_tid, v_sid, 'c0000010-0000-0000-0000-000000000001', 'B', 40),
  ('c0000011-0000-0000-0000-00000000000a', v_tid, v_sid, 'c0000011-0000-0000-0000-000000000001', 'A', 40),
  ('c0000011-0000-0000-0000-00000000000b', v_tid, v_sid, 'c0000011-0000-0000-0000-000000000001', 'B', 40),
  ('c0000012-0000-0000-0000-00000000000a', v_tid, v_sid, 'c0000012-0000-0000-0000-000000000001', 'A', 40),
  ('c0000012-0000-0000-0000-00000000000b', v_tid, v_sid, 'c0000012-0000-0000-0000-000000000001', 'B', 40)
ON CONFLICT ON CONSTRAINT uq_sections_class_name DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Upgrade existing teacher1 staff record to realistic profile
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE staff SET
    first_name      = 'Rajesh',
    last_name       = 'Kumar Sharma',
    department_id   = v_dept_academic,
    specialization  = 'Mathematics',
    qualification   = 'M.Sc Mathematics, B.Ed',
    phone           = '9876543001',
    email           = 'rajesh.sharma@jnvlucknow.edu.in'
WHERE id = v_teacher1_staff AND first_name = 'Demo';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Additional Staff (8 members)
-- UUIDs: 5f000001-... to 5f000008-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO staff (id, tenant_id, school_id, department_id, employee_number,
                   staff_type, first_name, last_name, gender, phone, email,
                   qualification, specialization, joining_date) VALUES
  ('5f000001-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_admin,   'EMP-JNV-P01', 'PRINCIPAL',      'Suresh',  'Kumar Verma',     'MALE',   '9415001001', 'principal@jnvlucknow.edu.in',     'M.Ed, M.Sc Physics',       'School Administration',        '2010-07-01'),
  ('5f000002-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_admin,   'EMP-JNV-P02', 'VICE_PRINCIPAL',  'Sunita',  'Devi Mishra',     'FEMALE', '9415002002', 'vprincipal@jnvlucknow.edu.in',    'M.Ed, M.A Hindi',          'Hindi Literature',             '2012-07-01'),
  ('5f000003-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_science, 'EMP-JNV-T02', 'TEACHER',         'Anita',   'Kumari Singh',    'FEMALE', '9415003003', 'anita.singh@jnvlucknow.edu.in',   'M.Sc Biology, B.Ed',       'Life Sciences',                '2014-07-01'),
  ('5f000004-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_arts,    'EMP-JNV-T03', 'TEACHER',         'Robert',  'Paul Thomas',     'MALE',   '9415004004', 'robert.thomas@jnvlucknow.edu.in', 'M.A English, B.Ed',        'English Communication',        '2013-07-01'),
  ('5f000005-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_science, 'EMP-JNV-T04', 'TEACHER',         'Pradeep', 'Kumar Tiwari',    'MALE',   '9415005005', 'pradeep.tiwari@jnvlucknow.edu.in','M.Sc Physics, B.Ed',       'Applied Physics',              '2011-07-01'),
  ('5f000006-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_arts,    'EMP-JNV-T05', 'TEACHER',         'Kavita',  'Rani Yadav',      'FEMALE', '9415006006', 'kavita.yadav@jnvlucknow.edu.in',  'M.A Hindi, B.Ed',          'Hindi Literature and Grammar', '2012-07-01'),
  ('5f000007-0000-0000-0000-000000000001', v_tid, v_sid, v_dept_sports,  'EMP-JNV-T06', 'TEACHER',         'Manoj',   'Kumar Bajpai',    'MALE',   '9415007007', 'manoj.bajpai@jnvlucknow.edu.in',  'B.P.Ed, M.P.Ed',           'Athletics and Team Sports',    '2009-07-01'),
  ('5f000008-0000-0000-0000-000000000001', v_tid, v_sid, NULL,           'EMP-JNV-A01', 'ACCOUNTANT',      'Dinesh',  'Kumar Verma',     'MALE',   '9415008008', 'dinesh.verma@jnvlucknow.edu.in',  'M.Com, CA Inter',          'School Finance',               '2008-07-01')
ON CONFLICT ON CONSTRAINT uq_staff_school_employee_number DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Students (12 total)
-- student1 user → STU-2024-001 (Arjun Sharma, Class X-A)
-- UUIDs: 7d000001-... to 7d000012-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO students (id, tenant_id, school_id, user_id, student_number,
                      class_id, section_id, first_name, last_name, gender,
                      date_of_birth, admission_date, status) VALUES
  -- Class X-A (5 students — student1 linked to user account)
  ('7d000001-0000-0000-0000-000000000001', v_tid, v_sid, v_student1_user, 'STU-2024-001',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   'Arjun',  'Sharma',       'MALE',   '2010-08-15', '2024-04-01', 'ACTIVE'),
  ('7d000002-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-002',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   'Priya',  'Gupta',        'FEMALE', '2010-06-22', '2024-04-01', 'ACTIVE'),
  ('7d000003-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-003',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   'Rahul',  'Kumar Singh',  'MALE',   '2010-03-10', '2024-04-01', 'ACTIVE'),
  ('7d000004-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-004',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   'Neha',   'Mishra',       'FEMALE', '2010-11-05', '2024-04-01', 'ACTIVE'),
  ('7d000005-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-005',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   'Vikram', 'Patel',        'MALE',   '2010-09-18', '2024-04-01', 'ACTIVE'),
  -- Class X-B (3 students)
  ('7d000006-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-006',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000b',
   'Pooja',  'Rani Verma',   'FEMALE', '2010-07-25', '2024-04-01', 'ACTIVE'),
  ('7d000007-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-007',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000b',
   'Rohan',  'Agarwal',      'MALE',   '2010-04-14', '2024-04-01', 'ACTIVE'),
  ('7d000008-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-008',
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000b',
   'Sneha',  'Pandey',       'FEMALE', '2010-12-30', '2024-04-01', 'ACTIVE'),
  -- Class IX-A (2 students)
  ('7d000009-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-009',
   'c0000009-0000-0000-0000-000000000001', 'c0000009-0000-0000-0000-00000000000a',
   'Aditya', 'Jha',          'MALE',   '2011-05-20', '2024-04-01', 'ACTIVE'),
  ('7d000010-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2024-010',
   'c0000009-0000-0000-0000-000000000001', 'c0000009-0000-0000-0000-00000000000a',
   'Ritu',   'Srivastava',   'FEMALE', '2011-02-08', '2024-04-01', 'ACTIVE'),
  -- Class XII-A (2 students)
  ('7d000011-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2022-001',
   'c0000012-0000-0000-0000-000000000001', 'c0000012-0000-0000-0000-00000000000a',
   'Deepak', 'Narayan',      'MALE',   '2008-07-12', '2022-04-01', 'ACTIVE'),
  ('7d000012-0000-0000-0000-000000000001', v_tid, v_sid, NULL,            'STU-2022-002',
   'c0000012-0000-0000-0000-000000000001', 'c0000012-0000-0000-0000-00000000000a',
   'Meena',  'Laxmi',        'FEMALE', '2008-09-03', '2022-04-01', 'ACTIVE')
ON CONFLICT ON CONSTRAINT uq_students_school_number DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Parent-student link (parent1 → Arjun Sharma / student1)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_parent_links (id, tenant_id, student_id, parent_user_id, relationship, is_primary) VALUES
  ('bb000001-0000-0000-0000-000000000001', v_tid,
   '7d000001-0000-0000-0000-000000000001', v_parent1_user, 'GUARDIAN', true)
ON CONFLICT ON CONSTRAINT uq_student_parent_link DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Fee structures for Class X and XII
-- UUIDs: fe000001-... to fe000006-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO fee_structures (id, tenant_id, school_id, academic_year_id, class_id, fee_category_id, amount, due_date, frequency) VALUES
  ('fe000001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', v_fc_tuition, 12000.00, '2026-04-30', 'ANNUAL'),
  ('fe000002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', v_fc_exam,     1500.00, '2026-04-30', 'ANNUAL'),
  ('fe000003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', v_fc_library,   500.00, '2026-04-30', 'ANNUAL'),
  ('fe000004-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', v_fc_sports,    750.00, '2026-05-15', 'ANNUAL'),
  ('fe000005-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000012-0000-0000-0000-000000000001', v_fc_tuition, 14000.00, '2026-04-30', 'ANNUAL'),
  ('fe000006-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000012-0000-0000-0000-000000000001', v_fc_exam,     2000.00, '2026-04-30', 'ANNUAL')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Student fee records for student1 (Arjun Sharma, Class X-A)
-- UUIDs: fr000001-... to fr000004-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_fee_records (id, tenant_id, school_id, student_id, fee_structure_id,
                                  academic_year_id, amount_due, amount_paid, discount, due_date, status) VALUES
  ('f0000001-0000-0000-0000-000000000001', v_tid, v_sid, '7d000001-0000-0000-0000-000000000001',
   'fe000001-0000-0000-0000-000000000001', v_ay, 12000.00, 12000.00, 0.00, '2026-04-30', 'PAID'),
  ('f0000002-0000-0000-0000-000000000001', v_tid, v_sid, '7d000001-0000-0000-0000-000000000001',
   'fe000002-0000-0000-0000-000000000001', v_ay,  1500.00,     0.00, 0.00, '2026-04-30', 'PENDING'),
  ('f0000003-0000-0000-0000-000000000001', v_tid, v_sid, '7d000001-0000-0000-0000-000000000001',
   'fe000003-0000-0000-0000-000000000001', v_ay,   500.00,   500.00, 0.00, '2026-04-30', 'PAID'),
  ('f0000004-0000-0000-0000-000000000001', v_tid, v_sid, '7d000001-0000-0000-0000-000000000001',
   'fe000004-0000-0000-0000-000000000001', v_ay,   750.00,     0.00, 0.00, '2026-05-15', 'OVERDUE')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Timetable slots (Class X-A — teacher1 = Math, Robert = English, Pradeep = Physics)
-- UUIDs: tt000001-... to tt000009-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO timetable_slots (id, tenant_id, school_id, academic_year_id, class_id, section_id,
                              subject_id, staff_id, day_of_week, period_number, start_time, end_time) VALUES
  -- Mathematics (teacher1 = Rajesh Sharma) — Period 1, Mon–Fri
  ('aa000001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, 'MONDAY',    1, '08:00', '08:45'),
  ('aa000002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, 'TUESDAY',   1, '08:00', '08:45'),
  ('aa000003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, 'WEDNESDAY', 1, '08:00', '08:45'),
  ('aa000004-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, 'THURSDAY',  1, '08:00', '08:45'),
  ('aa000005-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, 'FRIDAY',    1, '08:00', '08:45'),
  -- English (Robert Paul Thomas) — Period 2, Mon & Wed
  ('aa000006-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000005-0000-0000-0000-000000000001', '5f000004-0000-0000-0000-000000000001', 'MONDAY',    2, '08:45', '09:30'),
  ('aa000007-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000005-0000-0000-0000-000000000001', '5f000004-0000-0000-0000-000000000001', 'WEDNESDAY', 2, '08:45', '09:30'),
  -- Physics (Pradeep Kumar Tiwari) — Period 2, Tue & Thu
  ('aa000008-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000002-0000-0000-0000-000000000001', '5f000005-0000-0000-0000-000000000001', 'TUESDAY',   2, '08:45', '09:30'),
  ('aa000009-0000-0000-0000-000000000001', v_tid, v_sid, v_ay, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', '5b000002-0000-0000-0000-000000000001', '5f000005-0000-0000-0000-000000000001', 'THURSDAY',  2, '08:45', '09:30')
ON CONFLICT ON CONSTRAINT timetable_slots_unique_period DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Attendance sessions (Class X-A, Mathematics, April 2026)
-- UUIDs: a5000001-... to a5000005-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO attendance_sessions (id, tenant_id, school_id, class_id, section_id,
                                  academic_year_id, subject_id, taken_by_staff_id,
                                  session_date, period_number, is_finalized) VALUES
  ('a5000001-0000-0000-0000-000000000001', v_tid, v_sid, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', v_ay, '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, '2026-04-07', 1, true),
  ('a5000002-0000-0000-0000-000000000001', v_tid, v_sid, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', v_ay, '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, '2026-04-08', 1, true),
  ('a5000003-0000-0000-0000-000000000001', v_tid, v_sid, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', v_ay, '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, '2026-04-09', 1, true),
  ('a5000004-0000-0000-0000-000000000001', v_tid, v_sid, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', v_ay, '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, '2026-04-10', 1, true),
  ('a5000005-0000-0000-0000-000000000001', v_tid, v_sid, 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a', v_ay, '5b000001-0000-0000-0000-000000000001', v_teacher1_staff, '2026-04-14', 1, false)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. Attendance records (student1 = 4 PRESENT 1 ABSENT; student2 = 4P 1A)
-- UUIDs: ar000001-... to ar000010-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO attendance_records (id, tenant_id, session_id, student_id, status) VALUES
  ('ab000001-0000-0000-0000-000000000001', v_tid, 'a5000001-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 'PRESENT'),
  ('ab000002-0000-0000-0000-000000000001', v_tid, 'a5000002-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 'PRESENT'),
  ('ab000003-0000-0000-0000-000000000001', v_tid, 'a5000003-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 'ABSENT'),
  ('ab000004-0000-0000-0000-000000000001', v_tid, 'a5000004-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 'PRESENT'),
  ('ab000005-0000-0000-0000-000000000001', v_tid, 'a5000005-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 'PRESENT'),
  ('ab000006-0000-0000-0000-000000000001', v_tid, 'a5000001-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 'PRESENT'),
  ('ab000007-0000-0000-0000-000000000001', v_tid, 'a5000002-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 'ABSENT'),
  ('ab000008-0000-0000-0000-000000000001', v_tid, 'a5000003-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 'PRESENT'),
  ('ab000009-0000-0000-0000-000000000001', v_tid, 'a5000004-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 'PRESENT'),
  ('ab000010-0000-0000-0000-000000000001', v_tid, 'a5000005-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 'PRESENT')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. Homework assignments (3 — Class X-A)
-- UUIDs: hw000001-... to hw000003-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO homework_assignments (id, tenant_id, school_id, academic_year_id, class_id, section_id,
                                   subject_id, assigned_by, title, description, due_date, status) VALUES
  ('ac000001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay,
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   '5b000001-0000-0000-0000-000000000001', v_teacher1_staff,
   'Chapter 5 — Quadratic Equations',
   'Solve exercises 5.1 to 5.4 from the NCERT textbook. Show all steps clearly.', '2026-04-15', 'PUBLISHED'),
  ('ac000002-0000-0000-0000-000000000001', v_tid, v_sid, v_ay,
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   '5b000005-0000-0000-0000-000000000001', '5f000004-0000-0000-0000-000000000001',
   'Essay: My School — A Temple of Learning',
   'Write a 300-word essay on the given topic. Focus on structure, grammar and vocabulary.', '2026-04-18', 'PUBLISHED'),
  ('ac000003-0000-0000-0000-000000000001', v_tid, v_sid, v_ay,
   'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   '5b000002-0000-0000-0000-000000000001', '5f000005-0000-0000-0000-000000000001',
   'Newton''s Laws — 10 Numericals',
   'Solve numericals 4.1 to 4.10 from Chapter 4 (Laws of Motion). Include free-body diagrams.', '2026-04-20', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. School notices (5)
-- UUIDs: nc000001-... to nc000005-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO school_notices (id, tenant_id, school_id, title, content, category, target,
                             priority, is_published, published_at, expires_at, posted_by) VALUES
  ('b0000001-0000-0000-0000-000000000001', v_tid, v_sid,
   'Mid-Term Examination Schedule — April 2026',
   'Mid-term examinations for Classes VI–XII will be held from 1st to 10th April 2026. Students must carry their hall tickets. Detailed timetable is on the school notice board.',
   'EXAM', 'ALL', 2, true, '2026-03-28 09:00:00+00', '2026-04-10 23:59:00+00', v_admin_user),
  ('b0000002-0000-0000-0000-000000000001', v_tid, v_sid,
   'Annual Fee Payment Reminder — 2026-27',
   'Parents are requested to clear tuition and examination fees for the academic year 2026-27 before 30th April 2026. A late-payment penalty of ₹50/month applies thereafter.',
   'FEE', 'PARENT', 2, true, '2026-04-01 10:00:00+00', '2026-04-30 23:59:00+00', v_admin_user),
  ('b0000003-0000-0000-0000-000000000001', v_tid, v_sid,
   'Parent-Teacher Meeting — 20 April 2026',
   'PTM for all classes will be held on 20th April 2026 from 9:00 AM to 1:00 PM. All parents are requested to attend and discuss their ward''s academic progress with subject teachers.',
   'GENERAL', 'PARENT', 1, true, '2026-04-10 11:00:00+00', '2026-04-21 00:00:00+00', v_admin_user),
  ('b0000004-0000-0000-0000-000000000001', v_tid, v_sid,
   'Inter-Class Science Exhibition — 25 April 2026',
   'The Annual Science Exhibition will be held on 25th April 2026. Students of Classes VIII–XII are invited to submit project proposals to their Science teacher by 18th April.',
   'ACADEMIC', 'STUDENT', 1, true, '2026-04-11 09:30:00+00', '2026-04-26 00:00:00+00', v_admin_user),
  ('b0000005-0000-0000-0000-000000000001', v_tid, v_sid,
   'Summer Vacation 2026 — Dates Announced',
   'Summer vacation will be observed from 1st June to 30th June 2026. The school will reopen on 1st July 2026. Hostel checkout must be completed by 31st May.',
   'GENERAL', 'ALL', 1, true, '2026-04-28 10:00:00+00', '2026-06-30 23:59:00+00', v_admin_user)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. Mid-term exam (Class X)
-- UUID: ex000001-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO exams (id, tenant_id, school_id, academic_year_id, name, exam_type, status,
                   start_date, end_date, total_marks, passing_marks, instructions, created_by) VALUES
  ('e0000001-0000-0000-0000-000000000001', v_tid, v_sid, v_ay,
   'Mid-Term Examination April 2026', 'MIDTERM', 'COMPLETED',
   '2026-04-01', '2026-04-10', 100, 35,
   'Answer all questions. Calculators not permitted. Write in blue or black ink.', v_admin_staff)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. Exam subjects (4 papers — Maths, English, Physics, Social Science)
-- UUIDs: es000001-... to es000004-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO exam_subjects (id, exam_id, subject_id, class_id, section_id,
                            exam_date, start_time, duration_minutes, total_marks, passing_marks) VALUES
  ('e1000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001',
   '5b000001-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   '2026-04-01', '09:00', 180, 100, 35),
  ('e1000002-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001',
   '5b000005-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   '2026-04-03', '09:00', 180, 100, 35),
  ('e1000003-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001',
   '5b000002-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   '2026-04-05', '09:00', 180, 100, 35),
  ('e1000004-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001',
   '5b000007-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-00000000000a',
   '2026-04-07', '09:00', 180, 100, 35)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. Student marks for student1 (Arjun Sharma) and student2 (Priya Gupta)
-- UUIDs: sm000001-... to sm000008-...
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO student_marks (id, tenant_id, exam_id, exam_subject_id, student_id,
                            marks_obtained, is_absent, entered_by) VALUES
  -- Arjun Sharma (student1)
  ('e2000001-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 78, false, v_teacher1_staff),
  ('e2000002-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000002-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 85, false, '5f000004-0000-0000-0000-000000000001'),
  ('e2000003-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000003-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 71, false, '5f000005-0000-0000-0000-000000000001'),
  ('e2000004-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000004-0000-0000-0000-000000000001', '7d000001-0000-0000-0000-000000000001', 88, false, v_admin_staff),
  -- Priya Gupta (student2)
  ('e2000005-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 92, false, v_teacher1_staff),
  ('e2000006-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000002-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 79, false, '5f000004-0000-0000-0000-000000000001'),
  ('e2000007-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000003-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 88, false, '5f000005-0000-0000-0000-000000000001'),
  ('e2000008-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001', 'e1000004-0000-0000-0000-000000000001', '7d000002-0000-0000-0000-000000000001', 76, false, v_admin_staff)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. Exam results (aggregate rows used by /v1/student/results)
-- student1 (Arjun): 322/400 = 80.5% grade A rank 2
-- student2 (Priya): 335/400 = 83.75% grade A rank 1
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO exam_results (id, tenant_id, exam_id, student_id, school_id,
                          total_marks_obtained, total_marks_possible, percentage, grade, rank, is_passed)
VALUES
  ('d0000001-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001',
   '7d000001-0000-0000-0000-000000000001', v_sid, 322.00, 400.00, 80.50, 'A', 2, true),
  ('d0000002-0000-0000-0000-000000000001', v_tid, 'e0000001-0000-0000-0000-000000000001',
   '7d000002-0000-0000-0000-000000000001', v_sid, 335.00, 400.00, 83.75, 'A', 1, true)
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE 'V58: JNV Lucknow full demo seed applied successfully for tenant 804d7650-c915-4236-8431-2d4aef5cd102.';

END $v58$;
