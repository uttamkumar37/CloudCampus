-- ─────────────────────────────────────────────────────────────────────────────
-- V42: JNV Lucknow — Full school demo seed data
--
-- Reference school : Jawahar Navodaya Vidyalaya, Lucknow (CBSE residential)
-- Classes          : 6 – 12, two sections (A / B) per class
-- Students         : 27 boys + 13 girls = 40 per section, 560 total
-- Staff            : 22 employees (principal, vice-principal, 18 teachers, 3 support)
-- Data month       : April 2026 (attendance, exam, homework, notices)
-- Idempotent       : every INSERT uses ON CONFLICT … DO NOTHING
--
-- Guard: this whole script is a no-op in fresh databases (Testcontainers / CI)
--        where the seed tenant does not exist.  Dev/staging environments that
--        were bootstrapped with the initial admin setup will already have the
--        tenant row and will execute the full seed as intended.
-- ─────────────────────────────────────────────────────────────────────────────

DO $v42$
BEGIN

-- ── Guard ─────────────────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM tenants WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'
) THEN
    RAISE NOTICE 'V42 seed: seed tenant not found — skipping (clean/test env).';
    RETURN;
END IF;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Update school to JNV Lucknow
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE schools
   SET name       = 'Jawahar Navodaya Vidyalaya Lucknow',
       address    = 'Sector 15, Indira Nagar, Lucknow, Uttar Pradesh - 226016',
       phone      = '0522-2716050',
       email      = 'jnvlucknow@navodaya.gov.in',
       updated_at = NOW()
 WHERE id = 'bbbbbbbb-0000-0000-0000-000000000001';

-- Normalise existing class / section names
UPDATE classes  SET name = 'Class 10', grade_order = 10 WHERE id = 'ffffffff-0000-0000-0000-000000000001';
UPDATE sections SET name = 'A'                             WHERE id = '11111111-0000-0000-0000-000000000001';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Departments
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO departments (id, tenant_id, school_id, name, code, description) VALUES
  ('d2000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Science','SCI','Physics, Chemistry, Biology, General Science'),
  ('d3000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Languages','LANG','English, Hindi, Sanskrit'),
  ('d4000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Social Science','SST','History, Geography, Civics, Economics'),
  ('d5000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Computer Science','CS','Information Technology and Applications'),
  ('d6000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Physical Education','PE','Sports and Physical Health Education')
ON CONFLICT ON CONSTRAINT uq_departments_school_name DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Subjects (school-scoped, not year-scoped)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO subjects (id, tenant_id, school_id, name, code, description) VALUES
  ('e2000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Hindi','HINDI','Hindi Language and Literature'),
  ('e3000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','English','ENG','English Language and Literature'),
  ('e4000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Science','SCI','General Science (Class 6–8)'),
  ('e5000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Social Science','SST','History, Geography, Civics and Economics'),
  ('e6000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Sanskrit','SANS','Sanskrit Language'),
  ('e7000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Physics','PHYS','Physics (Class 9–12)'),
  ('e8000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Chemistry','CHEM','Chemistry (Class 9–12)'),
  ('e9000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Biology','BIO','Biology (Class 9–10)'),
  ('ea000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Computer Science','CS','Computer Science and Programming (Class 11–12)'),
  ('eb000000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Physical Education','PE','Sports and Physical Health Education')
ON CONFLICT ON CONSTRAINT uq_subjects_school_code DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Classes 6–9, 11, 12  (Class 10 already exists)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO classes (id, tenant_id, school_id, academic_year_id, name, grade_order) VALUES
  ('aa060000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','Class 6',   6),
  ('aa070000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','Class 7',   7),
  ('aa080000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','Class 8',   8),
  ('aa090000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','Class 9',   9),
  ('aa110000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','Class 11', 11),
  ('aa120000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','Class 12', 12)
ON CONFLICT ON CONSTRAINT uq_classes_school_year_name DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Sections  (10-A already exists, renamed above)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sections (id, tenant_id, school_id, class_id, name, capacity) VALUES
  ('bb060a00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa060000-0000-0000-0000-000000000001','A',40),
  ('bb060b00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa060000-0000-0000-0000-000000000001','B',40),
  ('bb070a00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa070000-0000-0000-0000-000000000001','A',40),
  ('bb070b00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa070000-0000-0000-0000-000000000001','B',40),
  ('bb080a00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa080000-0000-0000-0000-000000000001','A',40),
  ('bb080b00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa080000-0000-0000-0000-000000000001','B',40),
  ('bb090a00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa090000-0000-0000-0000-000000000001','A',40),
  ('bb090b00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa090000-0000-0000-0000-000000000001','B',40),
  ('bb100b00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000001','B',40),
  ('bb110a00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa110000-0000-0000-0000-000000000001','A',40),
  ('bb110b00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa110000-0000-0000-0000-000000000001','B',40),
  ('bb120a00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa120000-0000-0000-0000-000000000001','A',40),
  ('bb120b00-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aa120000-0000-0000-0000-000000000001','B',40)
ON CONFLICT ON CONSTRAINT uq_sections_class_name DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Staff (21 new + existing John Smith = 22 total)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO staff (id,tenant_id,school_id,department_id,employee_number,staff_type,first_name,last_name,gender,phone,email,qualification,specialization,joining_date) VALUES
  ('55000001-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001',NULL,'EMP-JNV-001','PRINCIPAL','Rajendra','Prasad Singh','MALE','9415001001','principal@jnvlucknow.edu.in','M.Ed, M.Sc Physics','School Administration','2010-07-01'),
  ('55000002-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001',NULL,'EMP-JNV-002','VICE_PRINCIPAL','Sunita','Devi Mishra','FEMALE','9415002002','vprincipal@jnvlucknow.edu.in','M.Ed, M.A Hindi','Hindi Literature','2012-07-01'),
  ('55000003-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','dddddddd-0000-0000-0000-000000000001','EMP-JNV-003','TEACHER','Suresh','Chandra Gupta','MALE','9415003003','suresh.gupta@jnvlucknow.edu.in','M.Sc Mathematics, B.Ed','Pure Mathematics','2013-07-15'),
  ('55000004-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001','EMP-JNV-004','TEACHER','Anita','Kumari Singh','FEMALE','9415004004','anita.singh@jnvlucknow.edu.in','M.Sc Biology, B.Ed','Life Sciences','2014-07-01'),
  ('55000005-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001','EMP-JNV-005','TEACHER','Pradeep','Kumar Tiwari','MALE','9415005005','pradeep.tiwari@jnvlucknow.edu.in','M.Sc Physics, B.Ed','Applied Physics','2011-07-01'),
  ('55000006-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001','EMP-JNV-006','TEACHER','Sanjay','Kumar Mishra','MALE','9415006006','sanjay.mishra@jnvlucknow.edu.in','M.Sc Chemistry, B.Ed','Organic Chemistry','2015-07-01'),
  ('55000007-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001','EMP-JNV-007','TEACHER','Preeti','Singh Chauhan','FEMALE','9415007007','preeti.chauhan@jnvlucknow.edu.in','Ph.D Zoology, M.Sc, B.Ed','Zoology and Botany','2009-07-01'),
  ('55000008-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d3000000-0000-0000-0000-000000000001','EMP-JNV-008','TEACHER','Mary','DeSouza','FEMALE','9415008008','mary.desouza@jnvlucknow.edu.in','M.A English Literature, B.Ed','English Literature','2016-07-01'),
  ('55000009-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d3000000-0000-0000-0000-000000000001','EMP-JNV-009','TEACHER','Robert','Paul Thomas','MALE','9415009009','robert.thomas@jnvlucknow.edu.in','M.A English, B.Ed','English Communication','2013-07-01'),
  ('5500000a-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d3000000-0000-0000-0000-000000000001','EMP-JNV-010','TEACHER','Kavita','Rani Yadav','FEMALE','9415010010','kavita.yadav@jnvlucknow.edu.in','M.A Hindi, B.Ed','Hindi Literature and Grammar','2012-07-01'),
  ('5500000b-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d3000000-0000-0000-0000-000000000001','EMP-JNV-011','TEACHER','Deepak','Narayan Pandey','MALE','9415011011','deepak.pandey@jnvlucknow.edu.in','M.A Hindi, M.Ed','Hindi Poetry and Prose','2010-07-01'),
  ('5500000c-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d4000000-0000-0000-0000-000000000001','EMP-JNV-012','TEACHER','Meena','Laxmi Srivastava','FEMALE','9415012012','meena.srivastava@jnvlucknow.edu.in','M.A History, B.Ed','History and Geography','2014-07-01'),
  ('5500000d-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d4000000-0000-0000-0000-000000000001','EMP-JNV-013','TEACHER','Vijay','Kumar Jha','MALE','9415013013','vijay.jha@jnvlucknow.edu.in','M.A Political Science, B.Ed','Civics and Economics','2011-07-01'),
  ('5500000e-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d3000000-0000-0000-0000-000000000001','EMP-JNV-014','TEACHER','Rakesh','Mohan Tripathi','MALE','9415014014','rakesh.tripathi@jnvlucknow.edu.in','M.A Sanskrit, B.Ed','Sanskrit Language and Literature','2013-07-01'),
  ('5500000f-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d5000000-0000-0000-0000-000000000001','EMP-JNV-015','TEACHER','Nitin','Kumar Agarwal','MALE','9415015015','nitin.agarwal@jnvlucknow.edu.in','MCA, B.Ed','Computer Science and Programming','2017-07-01'),
  ('55000010-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d6000000-0000-0000-0000-000000000001','EMP-JNV-016','TEACHER','Manoj','Kumar Bajpai','MALE','9415016016','manoj.bajpai@jnvlucknow.edu.in','B.P.Ed, M.P.Ed','Athletics and Team Sports','2009-07-01'),
  ('55000011-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001','EMP-JNV-017','TEACHER','Poonam','Verma','FEMALE','9415017017','poonam.verma@jnvlucknow.edu.in','M.Sc Physics, B.Ed','Electromagnetism and Optics','2018-07-01'),
  ('55000012-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001',NULL,'EMP-JNV-018','LIBRARIAN','Sarita','Devi Tiwari','FEMALE','9415018018','sarita.tiwari@jnvlucknow.edu.in','M.Lib, B.A','Library Management','2015-07-01'),
  ('55000013-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001',NULL,'EMP-JNV-019','ACCOUNTANT','Dinesh','Kumar Verma','MALE','9415019019','dinesh.verma@jnvlucknow.edu.in','M.Com, CA Inter','School Finance','2008-07-01'),
  ('55000014-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001',NULL,'EMP-JNV-020','ADMIN_STAFF','Rekha','Rani Gupta','FEMALE','9415020020','rekha.gupta@jnvlucknow.edu.in','B.A, Diploma Office Management','Administration','2011-07-01'),
  ('55000015-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001','EMP-JNV-021','LAB_ASSISTANT','Hemant','Kumar Pandey','MALE','9415021021','hemant.pandey@jnvlucknow.edu.in','B.Sc Chemistry','Laboratory Management','2019-07-01')
ON CONFLICT ON CONSTRAINT uq_staff_school_employee_number DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Fee categories
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO fee_categories (id, tenant_id, school_id, name, description) VALUES
  ('fc010000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Tuition Fee','Annual tuition charges'),
  ('fc020000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Hostel Charges','Residential hostel charges per term'),
  ('fc030000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Mess Charges','Monthly food and mess charges'),
  ('fc040000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Development Fund','Annual school development fund'),
  ('fc050000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Library Fee','Annual library resource fee'),
  ('fc060000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Exam Fee','Examination and assessment fee per term')
ON CONFLICT ON CONSTRAINT uq_fee_category_school_name DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Fee structures — Tuition (ANNUAL, ₹600) per class
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO fee_structures (id,tenant_id,school_id,academic_year_id,class_id,fee_category_id,amount,due_date,frequency) VALUES
  ('f1060000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa060000-0000-0000-0000-000000000001','fc010000-0000-0000-0000-000000000001',600.00,'2025-07-31','ANNUAL'),
  ('f1070000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa070000-0000-0000-0000-000000000001','fc010000-0000-0000-0000-000000000001',600.00,'2025-07-31','ANNUAL'),
  ('f1080000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa080000-0000-0000-0000-000000000001','fc010000-0000-0000-0000-000000000001',600.00,'2025-07-31','ANNUAL'),
  ('f1090000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa090000-0000-0000-0000-000000000001','fc010000-0000-0000-0000-000000000001',600.00,'2025-07-31','ANNUAL'),
  ('f10a0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000001','fc010000-0000-0000-0000-000000000001',600.00,'2025-07-31','ANNUAL'),
  ('f10b0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa110000-0000-0000-0000-000000000001','fc010000-0000-0000-0000-000000000001',600.00,'2025-07-31','ANNUAL'),
  ('f10c0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa120000-0000-0000-0000-000000000001','fc010000-0000-0000-0000-000000000001',600.00,'2025-07-31','ANNUAL')
ON CONFLICT ON CONSTRAINT uq_fee_structure DO NOTHING;

-- Hostel Charges (TERM, ₹900)
INSERT INTO fee_structures (id,tenant_id,school_id,academic_year_id,class_id,fee_category_id,amount,due_date,frequency) VALUES
  ('f2060000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa060000-0000-0000-0000-000000000001','fc020000-0000-0000-0000-000000000001',900.00,'2025-07-31','TERM'),
  ('f2070000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa070000-0000-0000-0000-000000000001','fc020000-0000-0000-0000-000000000001',900.00,'2025-07-31','TERM'),
  ('f2080000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa080000-0000-0000-0000-000000000001','fc020000-0000-0000-0000-000000000001',900.00,'2025-07-31','TERM'),
  ('f2090000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa090000-0000-0000-0000-000000000001','fc020000-0000-0000-0000-000000000001',900.00,'2025-07-31','TERM'),
  ('f20a0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000001','fc020000-0000-0000-0000-000000000001',900.00,'2025-07-31','TERM'),
  ('f20b0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa110000-0000-0000-0000-000000000001','fc020000-0000-0000-0000-000000000001',900.00,'2025-07-31','TERM'),
  ('f20c0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa120000-0000-0000-0000-000000000001','fc020000-0000-0000-0000-000000000001',900.00,'2025-07-31','TERM')
ON CONFLICT ON CONSTRAINT uq_fee_structure DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. School notices (April 2026)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO school_notices (id,tenant_id,school_id,title,content,category,target,priority,is_published,published_at,expires_at,posted_by) VALUES
  ('dc010000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Mid-Term Exam Schedule - April 2026','Mid-Term examinations for all classes (6-12) will be held from 1st April to 10th April 2026. Students are advised to prepare thoroughly. Detailed timetable is available on the notice board.','EXAM','ALL',2,TRUE,'2026-03-28 09:00:00+00','2026-04-10 23:59:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc020000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Holiday - Dr. B.R. Ambedkar Jayanti (14 April)','School will remain closed on 14th April 2026 on account of Dr. B.R. Ambedkar Jayanti. School will reopen on 15th April 2026.','HOLIDAY','ALL',3,TRUE,'2026-04-05 10:00:00+00','2026-04-15 00:00:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc030000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Parent-Teacher Meeting - 20 April 2026','PTM for all classes will be held on 20th April 2026 from 9:00 AM to 1:00 PM. Parents of all students are requested to attend mandatorily.','GENERAL','PARENT',2,TRUE,'2026-04-10 11:00:00+00','2026-04-20 23:59:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc040000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Science Exhibition - 25 April 2026','Inter-class Science Exhibition will be held on 25th April 2026. Students of classes 8-12 are invited to submit project proposals to their science teachers by 18th April.','ACADEMIC','STUDENT',1,TRUE,'2026-04-11 09:30:00+00','2026-04-25 23:59:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc050000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Annual Fee Payment Reminder','Students who have not yet paid annual tuition and hostel fees for 2025-26 are reminded to do so before 30th April 2026. Late payment will attract a fine of Rs.50 per month.','FEE','PARENT',2,TRUE,'2026-04-19 09:00:00+00','2026-04-30 23:59:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc060000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Annual Sports Day Registration','Registration for Annual Sports Day (to be held in May) is now open. Interested students must register with the Physical Education department by 30th April 2026.','GENERAL','STUDENT',1,TRUE,'2026-04-15 10:00:00+00','2026-04-30 23:59:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc070000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Library Books Return Notice','All library books issued for the term must be returned by 30th April 2026. Students with overdue books will not be issued new books for the next term.','GENERAL','STUDENT',1,TRUE,'2026-04-20 09:00:00+00','2026-04-30 23:59:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc080000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Board Exam Preparation - Class 10 and 12','Special classes for Class 10 and Class 12 students will be held every Saturday from 14:00-17:00 till board exams. Attendance is compulsory.','ACADEMIC','STUDENT',2,TRUE,'2026-04-22 09:00:00+00','2026-05-31 23:59:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc090000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Staff Meeting - 28 April 2026','All teaching and non-teaching staff are requested to attend the mandatory staff meeting on 28th April 2026 at 16:00 in the conference room.','GENERAL','STAFF',1,TRUE,'2026-04-25 09:00:00+00','2026-04-28 20:00:00+00','00000000-2222-2222-2222-000000000001'),
  ('dc0a0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Summer Vacation 2026 - Dates Announced','Summer vacation for the academic year 2025-26 will be from 1st June to 30th June 2026. Hostel will close on 31st May and reopen on 1st July 2026.','GENERAL','ALL',1,TRUE,'2026-04-28 10:00:00+00','2026-06-01 00:00:00+00','00000000-2222-2222-2222-000000000001')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Homework assignments (April 2026)  — class-wide (section_id = NULL)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO homework_assignments (id,tenant_id,school_id,academic_year_id,class_id,section_id,subject_id,assigned_by,title,description,due_date,status) VALUES
  ('db010000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000001',NULL,'eeeeeeee-0000-0000-0000-000000000001','66666666-0000-0000-0000-000000000001','Algebra Practice Set 1','Solve exercises 3.1 to 3.5 from Chapter 3 (Polynomials). Show all working steps.','2026-04-08','PUBLISHED'),
  ('db020000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000001',NULL,'e3000000-0000-0000-0000-000000000001','55000009-0000-0000-0000-000000000001','Essay Writing - My School','Write a 300-word essay on My School in English. Focus on grammar, punctuation and vocabulary.','2026-04-12','PUBLISHED'),
  ('db030000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa090000-0000-0000-0000-000000000001',NULL,'e7000000-0000-0000-0000-000000000001','55000005-0000-0000-0000-000000000001','Laws of Motion - Problems','Solve 10 numerical problems on Newton''s Laws of Motion from the textbook. Unit conversion required.','2026-04-15','PUBLISHED'),
  ('db040000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa060000-0000-0000-0000-000000000001',NULL,'e5000000-0000-0000-0000-000000000001','5500000c-0000-0000-0000-000000000001','Map Work - River Systems of India','Draw and label the major river systems of India on an outline map. Colour-code each river basin.','2026-04-17','PUBLISHED'),
  ('db050000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000001',NULL,'eeeeeeee-0000-0000-0000-000000000001','66666666-0000-0000-0000-000000000001','Coordinate Geometry Practice','Complete Chapter 7 exercises on coordinate geometry. Plot all points on graph paper.','2026-04-20','PUBLISHED'),
  ('db060000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa080000-0000-0000-0000-000000000001',NULL,'e4000000-0000-0000-0000-000000000001','55000004-0000-0000-0000-000000000001','Reproduction in Plants - Diagram','Draw and label diagrams of asexual reproduction methods in plants. Write a short note on each.','2026-04-22','PUBLISHED'),
  ('db070000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa110000-0000-0000-0000-000000000001',NULL,'ea000000-0000-0000-0000-000000000001','5500000f-0000-0000-0000-000000000001','Python Programming - List Operations','Write Python programs for 5 list manipulation operations. Test each with minimum 3 sample inputs.','2026-04-24','PUBLISHED'),
  ('db080000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa070000-0000-0000-0000-000000000001',NULL,'e2000000-0000-0000-0000-000000000001','5500000a-0000-0000-0000-000000000001','Hindi Nibandh - Mera Bharat Mahan','Mera Bharat Mahan vishay par 250 shabdon mein nibandh likhein. Bhasha shuddh honi chahiye.','2026-04-26','PUBLISHED'),
  ('db090000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','aa120000-0000-0000-0000-000000000001',NULL,'e8000000-0000-0000-0000-000000000001','55000006-0000-0000-0000-000000000001','Organic Chemistry - Reaction Mechanisms','Write the mechanisms for 8 named reactions in organic chemistry. Include reagents and conditions.','2026-04-27','PUBLISHED'),
  ('db0a0000-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000001',NULL,'e3000000-0000-0000-0000-000000000001','55000009-0000-0000-0000-000000000001','Comprehension Passage Practice','Read the given comprehension passage and answer all questions. Focus on inference questions.','2026-04-30','PUBLISHED')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- DO BLOCK 1 : 560 students  (27 boys + 13 girls per section)
-- UUID scheme : {class_hex_2}{section_a_or_b}{student_num_hex_5}-0000-0000-0000-000000000000
-- ─────────────────────────────────────────────────────────────────────────────
EXECUTE $b1$
DO $$
DECLARE
  v_tenant UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_school UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_class_nums INT[]  := ARRAY[6,7,8,9,10,11,12];
  v_class_ids  UUID[] := ARRAY[
    'aa060000-0000-0000-0000-000000000001'::UUID,
    'aa070000-0000-0000-0000-000000000001'::UUID,
    'aa080000-0000-0000-0000-000000000001'::UUID,
    'aa090000-0000-0000-0000-000000000001'::UUID,
    'ffffffff-0000-0000-0000-000000000001'::UUID,
    'aa110000-0000-0000-0000-000000000001'::UUID,
    'aa120000-0000-0000-0000-000000000001'::UUID];
  v_sec_a UUID[] := ARRAY[
    'bb060a00-0000-0000-0000-000000000001'::UUID,
    'bb070a00-0000-0000-0000-000000000001'::UUID,
    'bb080a00-0000-0000-0000-000000000001'::UUID,
    'bb090a00-0000-0000-0000-000000000001'::UUID,
    '11111111-0000-0000-0000-000000000001'::UUID,
    'bb110a00-0000-0000-0000-000000000001'::UUID,
    'bb120a00-0000-0000-0000-000000000001'::UUID];
  v_sec_b UUID[] := ARRAY[
    'bb060b00-0000-0000-0000-000000000001'::UUID,
    'bb070b00-0000-0000-0000-000000000001'::UUID,
    'bb080b00-0000-0000-0000-000000000001'::UUID,
    'bb090b00-0000-0000-0000-000000000001'::UUID,
    'bb100b00-0000-0000-0000-000000000001'::UUID,
    'bb110b00-0000-0000-0000-000000000001'::UUID,
    'bb120b00-0000-0000-0000-000000000001'::UUID];

  boy_fn  TEXT[] := ARRAY['Aarav','Arjun','Vivek','Rahul','Rohit','Amit','Suresh','Pradeep','Ravi','Karan','Ankit','Mohit','Sachin','Varun','Harsh','Nikhil','Deepak','Vishal','Gaurav','Piyush','Shivam','Saurabh','Abhishek','Rajesh','Manish','Aakash','Lalit'];
  girl_fn TEXT[] := ARRAY['Priya','Neha','Pooja','Anjali','Kavita','Swati','Deepa','Ritu','Sunita','Preeti','Shweta','Ananya','Divya'];
  lnames  TEXT[] := ARRAY['Sharma','Singh','Gupta','Verma','Yadav','Mishra','Tiwari','Pandey','Srivastava','Chauhan','Bajpai','Agarwal','Tripathi','Saxena','Awasthi','Kesarwani','Upadhyay','Rastogi','Dubey','Jha','Kumar','Shukla','Dwivedi','Nishad','Dixit','Patel','Rajput','Maurya','Bind','Kushwaha','Chaudhary','Pathak','Giri','Pal','Vishwakarma','Sonkar','Prajapati','Rawat','Lodhi','Rao'];

  v_ci INT; v_si INT; v_n INT; v_actual INT;
  v_cnum INT; v_cid UUID; v_sid UUID; v_sch TEXT;
  v_uuid UUID; v_sno TEXT; v_base_yr INT;
BEGIN
  FOR v_ci IN 1..7 LOOP
    v_cnum   := v_class_nums[v_ci];
    v_cid    := v_class_ids[v_ci];
    v_base_yr := 2025 - (v_cnum - 6) - 12;   -- 2013 for class 6 .. 2007 for class 12

    FOR v_si IN 1..2 LOOP
      v_sid := CASE WHEN v_si = 1 THEN v_sec_a[v_ci] ELSE v_sec_b[v_ci] END;
      v_sch := CASE WHEN v_si = 1 THEN 'a' ELSE 'b' END;

      -- 27 boys
      FOR v_n IN 1..27 LOOP
        v_uuid := format('%s%s%s-0000-0000-0000-000000000000',
                    lpad(to_hex(v_cnum),2,'0'), v_sch, lpad(to_hex(v_n),5,'0'))::UUID;
        v_sno  := format('JNV-2025-%s-%s-%s', lpad(v_cnum::TEXT,2,'0'),
                    upper(chr(64+v_si)), lpad(v_n::TEXT,3,'0'));
        INSERT INTO students (id,tenant_id,school_id,class_id,section_id,student_number,
                              first_name,last_name,date_of_birth,gender,admission_date,status)
        VALUES (v_uuid, v_tenant, v_school, v_cid, v_sid, v_sno,
                boy_fn[v_n],
                lnames[((v_ci*2+v_si+v_n-1)%40)+1],
                make_date(v_base_yr, ((v_n-1)%12)+1, 15),
                'MALE','2025-06-01','ACTIVE')
        ON CONFLICT (school_id, student_number) DO NOTHING;
      END LOOP;

      -- 13 girls (student numbers 28–40)
      FOR v_n IN 1..13 LOOP
        v_actual := 27 + v_n;
        v_uuid := format('%s%s%s-0000-0000-0000-000000000000',
                    lpad(to_hex(v_cnum),2,'0'), v_sch, lpad(to_hex(v_actual),5,'0'))::UUID;
        v_sno  := format('JNV-2025-%s-%s-%s', lpad(v_cnum::TEXT,2,'0'),
                    upper(chr(64+v_si)), lpad(v_actual::TEXT,3,'0'));
        INSERT INTO students (id,tenant_id,school_id,class_id,section_id,student_number,
                              first_name,last_name,date_of_birth,gender,admission_date,status)
        VALUES (v_uuid, v_tenant, v_school, v_cid, v_sid, v_sno,
                girl_fn[v_n],
                lnames[((v_ci*2+v_si+v_actual)%40)+1],
                make_date(v_base_yr, ((v_actual-1)%12)+1, 20),
                'FEMALE','2025-06-01','ACTIVE')
        ON CONFLICT (school_id, student_number) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
$b1$;

-- ─────────────────────────────────────────────────────────────────────────────
-- DO BLOCK 2 : Student fee records (Tuition) + payments for 70 % students
-- ─────────────────────────────────────────────────────────────────────────────
EXECUTE $b2$
DO $$
DECLARE
  v_tenant UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_school UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_ay     UUID := 'cccccccc-0000-0000-0000-000000000001';
  v_accountant UUID := '55000013-0000-0000-0000-000000000001';

  fee_map UUID[] := ARRAY[
    'f1060000-0000-0000-0000-000000000001'::UUID,   -- class 6
    'f1070000-0000-0000-0000-000000000001'::UUID,
    'f1080000-0000-0000-0000-000000000001'::UUID,
    'f1090000-0000-0000-0000-000000000001'::UUID,
    'f10a0000-0000-0000-0000-000000000001'::UUID,   -- class 10
    'f10b0000-0000-0000-0000-000000000001'::UUID,
    'f10c0000-0000-0000-0000-000000000001'::UUID];

  v_class_ids UUID[] := ARRAY[
    'aa060000-0000-0000-0000-000000000001'::UUID,
    'aa070000-0000-0000-0000-000000000001'::UUID,
    'aa080000-0000-0000-0000-000000000001'::UUID,
    'aa090000-0000-0000-0000-000000000001'::UUID,
    'ffffffff-0000-0000-0000-000000000001'::UUID,
    'aa110000-0000-0000-0000-000000000001'::UUID,
    'aa120000-0000-0000-0000-000000000001'::UUID];

  v_rec UUID; v_stu RECORD; v_ci INT; v_row_n INT;
  v_status TEXT; v_paid NUMERIC;
BEGIN
  FOR v_ci IN 1..7 LOOP
    v_row_n := 0;
    FOR v_stu IN
      SELECT id FROM students
       WHERE school_id = v_school AND class_id = v_class_ids[v_ci]
       ORDER BY student_number
    LOOP
      v_row_n := v_row_n + 1;
      -- 70 % paid (students 1..28 in each 40-student set)
      v_status := CASE WHEN (v_row_n % 40) <= 28 AND (v_row_n % 40) != 0 THEN 'PAID' ELSE 'PENDING' END;
      v_paid   := CASE WHEN v_status = 'PAID' THEN 600.00 ELSE 0.00 END;

      v_rec := NULL;
      INSERT INTO student_fee_records
        (id,tenant_id,school_id,student_id,fee_structure_id,academic_year_id,amount_due,amount_paid,status,due_date)
      VALUES (gen_random_uuid(), v_tenant, v_school, v_stu.id, fee_map[v_ci], v_ay, 600.00, v_paid, v_status, '2025-07-31')
      ON CONFLICT ON CONSTRAINT uq_student_fee_record DO UPDATE SET updated_at = NOW()
      RETURNING id INTO v_rec;

      IF v_status = 'PAID' AND v_rec IS NOT NULL THEN
        INSERT INTO fee_payments
          (id, student_fee_record_id, amount, payment_date, payment_mode,
           receipt_number, collected_by_staff_id, remarks)
        VALUES (gen_random_uuid(), v_rec, 600.00, '2025-07-15', 'UPI',
                format('RCP-JNV-%s-%s', v_ci, v_row_n),
                v_accountant, 'Annual tuition fee payment')
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;
$b2$;

-- ─────────────────────────────────────────────────────────────────────────────
-- DO BLOCK 3 : Timetable slots (14 sections × 6 days × 6 periods = 504 slots)
-- Clear old 3 test slots first, then insert fresh JNV timetable
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM timetable_slots WHERE school_id = 'bbbbbbbb-0000-0000-0000-000000000001';

EXECUTE $b3$
DO $$
DECLARE
  v_tenant UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_school UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_ay     UUID := 'cccccccc-0000-0000-0000-000000000001';

  -- Subject UUIDs
  sMATH UUID := 'eeeeeeee-0000-0000-0000-000000000001';
  sHINDI UUID := 'e2000000-0000-0000-0000-000000000001';
  sENG  UUID := 'e3000000-0000-0000-0000-000000000001';
  sSCI  UUID := 'e4000000-0000-0000-0000-000000000001';
  sSST  UUID := 'e5000000-0000-0000-0000-000000000001';
  sSANS UUID := 'e6000000-0000-0000-0000-000000000001';
  sPHYS UUID := 'e7000000-0000-0000-0000-000000000001';
  sCHEM UUID := 'e8000000-0000-0000-0000-000000000001';
  sBIO  UUID := 'e9000000-0000-0000-0000-000000000001';
  sCS   UUID := 'ea000000-0000-0000-0000-000000000001';

  v_class_nums INT[]  := ARRAY[6,7,8,9,10,11,12];
  v_class_ids  UUID[] := ARRAY[
    'aa060000-0000-0000-0000-000000000001'::UUID,'aa070000-0000-0000-0000-000000000001'::UUID,
    'aa080000-0000-0000-0000-000000000001'::UUID,'aa090000-0000-0000-0000-000000000001'::UUID,
    'ffffffff-0000-0000-0000-000000000001'::UUID,'aa110000-0000-0000-0000-000000000001'::UUID,
    'aa120000-0000-0000-0000-000000000001'::UUID];
  v_sec_a UUID[] := ARRAY[
    'bb060a00-0000-0000-0000-000000000001'::UUID,'bb070a00-0000-0000-0000-000000000001'::UUID,
    'bb080a00-0000-0000-0000-000000000001'::UUID,'bb090a00-0000-0000-0000-000000000001'::UUID,
    '11111111-0000-0000-0000-000000000001'::UUID,'bb110a00-0000-0000-0000-000000000001'::UUID,
    'bb120a00-0000-0000-0000-000000000001'::UUID];
  v_sec_b UUID[] := ARRAY[
    'bb060b00-0000-0000-0000-000000000001'::UUID,'bb070b00-0000-0000-0000-000000000001'::UUID,
    'bb080b00-0000-0000-0000-000000000001'::UUID,'bb090b00-0000-0000-0000-000000000001'::UUID,
    'bb100b00-0000-0000-0000-000000000001'::UUID,'bb110b00-0000-0000-0000-000000000001'::UUID,
    'bb120b00-0000-0000-0000-000000000001'::UUID];

  day_names TEXT[] := ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  starts    TIME[] := ARRAY['07:30'::TIME,'08:20'::TIME,'09:10'::TIME,'10:20'::TIME,'11:10'::TIME,'13:00'::TIME];
  ends      TIME[] := ARRAY['08:20'::TIME,'09:10'::TIME,'10:00'::TIME,'11:10'::TIME,'12:00'::TIME,'13:50'::TIME];

  v_ci INT; v_si INT; v_day INT; v_per INT;
  v_cnum INT; v_grp INT; v_cid UUID; v_sid UUID;
  v_subj UUID; v_staff UUID;
BEGIN
  FOR v_ci IN 1..7 LOOP
    v_cnum := v_class_nums[v_ci];
    v_cid  := v_class_ids[v_ci];
    v_grp  := CASE WHEN v_cnum <= 8 THEN 1 WHEN v_cnum <= 10 THEN 2 ELSE 3 END;

    FOR v_si IN 1..2 LOOP
      v_sid := CASE WHEN v_si = 1 THEN v_sec_a[v_ci] ELSE v_sec_b[v_ci] END;

      FOR v_day IN 1..6 LOOP
        FOR v_per IN 1..6 LOOP
          -- ── subject lookup ────────────────────────────────────────────────
          v_subj := CASE v_grp
            WHEN 1 THEN   -- class 6-8: HINDI ENG MATH SCI SST SANS
              CASE v_day
                WHEN 1 THEN (ARRAY[sMATH,sENG,sHINDI,sSCI,sSST,sSANS])[v_per]
                WHEN 2 THEN (ARRAY[sENG,sMATH,sSCI,sHINDI,sSANS,sSST])[v_per]
                WHEN 3 THEN (ARRAY[sHINDI,sSCI,sMATH,sENG,sSST,sSANS])[v_per]
                WHEN 4 THEN (ARRAY[sSCI,sHINDI,sSST,sMATH,sENG,sSANS])[v_per]
                WHEN 5 THEN (ARRAY[sMATH,sSST,sENG,sHINDI,sSCI,sSANS])[v_per]
                ELSE        (ARRAY[sENG,sHINDI,sSCI,sMATH,sSST,sSANS])[v_per]
              END
            WHEN 2 THEN   -- class 9-10: MATH ENG HINDI PHYS CHEM BIO
              CASE v_day
                WHEN 1 THEN (ARRAY[sMATH,sENG,sHINDI,sPHYS,sCHEM,sBIO])[v_per]
                WHEN 2 THEN (ARRAY[sENG,sMATH,sPHYS,sHINDI,sBIO,sCHEM])[v_per]
                WHEN 3 THEN (ARRAY[sHINDI,sPHYS,sMATH,sENG,sSST,sCHEM])[v_per]
                WHEN 4 THEN (ARRAY[sPHYS,sHINDI,sCHEM,sMATH,sENG,sBIO])[v_per]
                WHEN 5 THEN (ARRAY[sMATH,sCHEM,sENG,sHINDI,sPHYS,sSST])[v_per]
                ELSE        (ARRAY[sENG,sHINDI,sBIO,sMATH,sCHEM,sPHYS])[v_per]
              END
            ELSE           -- class 11-12: MATH ENG HINDI PHYS CHEM CS
              CASE v_day
                WHEN 1 THEN (ARRAY[sMATH,sENG,sHINDI,sPHYS,sCHEM,sCS])[v_per]
                WHEN 2 THEN (ARRAY[sENG,sMATH,sPHYS,sHINDI,sCS,sCHEM])[v_per]
                WHEN 3 THEN (ARRAY[sHINDI,sPHYS,sMATH,sENG,sCHEM,sCS])[v_per]
                WHEN 4 THEN (ARRAY[sPHYS,sHINDI,sCHEM,sMATH,sENG,sCS])[v_per]
                WHEN 5 THEN (ARRAY[sMATH,sCHEM,sENG,sHINDI,sPHYS,sCS])[v_per]
                ELSE        (ARRAY[sENG,sHINDI,sCS,sMATH,sCHEM,sPHYS])[v_per]
              END
          END;

          -- ── staff lookup ──────────────────────────────────────────────────
          v_staff := CASE v_subj
            WHEN sMATH  THEN CASE WHEN v_cnum = 10 THEN '66666666-0000-0000-0000-000000000001'::UUID
                                  ELSE '55000003-0000-0000-0000-000000000001'::UUID END
            WHEN sHINDI THEN CASE WHEN v_cnum <= 9  THEN '5500000a-0000-0000-0000-000000000001'::UUID
                                  ELSE '5500000b-0000-0000-0000-000000000001'::UUID END
            WHEN sENG   THEN CASE WHEN v_cnum <= 9  THEN '55000008-0000-0000-0000-000000000001'::UUID
                                  ELSE '55000009-0000-0000-0000-000000000001'::UUID END
            WHEN sSCI   THEN '55000004-0000-0000-0000-000000000001'::UUID
            WHEN sSST   THEN CASE WHEN v_cnum <= 8  THEN '5500000c-0000-0000-0000-000000000001'::UUID
                                  ELSE '5500000d-0000-0000-0000-000000000001'::UUID END
            WHEN sSANS  THEN '5500000e-0000-0000-0000-000000000001'::UUID
            WHEN sPHYS  THEN CASE WHEN v_cnum = 10  THEN '55000011-0000-0000-0000-000000000001'::UUID
                                  ELSE '55000005-0000-0000-0000-000000000001'::UUID END
            WHEN sCHEM  THEN '55000006-0000-0000-0000-000000000001'::UUID
            WHEN sBIO   THEN '55000007-0000-0000-0000-000000000001'::UUID
            WHEN sCS    THEN '5500000f-0000-0000-0000-000000000001'::UUID
            ELSE NULL
          END;

          INSERT INTO timetable_slots
            (id,tenant_id,school_id,academic_year_id,class_id,section_id,
             subject_id,staff_id,day_of_week,period_number,start_time,end_time)
          VALUES (gen_random_uuid(), v_tenant, v_school, v_ay, v_cid, v_sid,
                  v_subj, v_staff, day_names[v_day], v_per, starts[v_per], ends[v_per])
          ON CONFLICT ON CONSTRAINT timetable_slots_unique_period DO NOTHING;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
$b3$;

-- ─────────────────────────────────────────────────────────────────────────────
-- DO BLOCK 4 : Attendance — April 2026 (25 working days, no 14 Apr)
-- Session UUID: a{section_idx_3}{day_idx_2}00-0000-0000-0000-000000000000
-- ─────────────────────────────────────────────────────────────────────────────
EXECUTE $b4$
DO $$
DECLARE
  v_tenant UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_school UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_ay     UUID := 'cccccccc-0000-0000-0000-000000000001';

  -- 25 working days in April 2026 (Mon–Sat, excl. 14 Apr holiday)
  work_days DATE[] := ARRAY[
    '2026-04-01'::DATE,'2026-04-02','2026-04-03','2026-04-04',
    '2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11',
    '2026-04-13',
    '2026-04-15','2026-04-16','2026-04-17','2026-04-18',
    '2026-04-20','2026-04-21','2026-04-22','2026-04-23','2026-04-24','2026-04-25',
    '2026-04-27','2026-04-28','2026-04-29','2026-04-30'];

  section_list UUID[] := ARRAY[
    'bb060a00-0000-0000-0000-000000000001'::UUID,'bb060b00-0000-0000-0000-000000000001'::UUID,
    'bb070a00-0000-0000-0000-000000000001'::UUID,'bb070b00-0000-0000-0000-000000000001'::UUID,
    'bb080a00-0000-0000-0000-000000000001'::UUID,'bb080b00-0000-0000-0000-000000000001'::UUID,
    'bb090a00-0000-0000-0000-000000000001'::UUID,'bb090b00-0000-0000-0000-000000000001'::UUID,
    '11111111-0000-0000-0000-000000000001'::UUID,'bb100b00-0000-0000-0000-000000000001'::UUID,
    'bb110a00-0000-0000-0000-000000000001'::UUID,'bb110b00-0000-0000-0000-000000000001'::UUID,
    'bb120a00-0000-0000-0000-000000000001'::UUID,'bb120b00-0000-0000-0000-000000000001'::UUID];

  class_for_sec UUID[] := ARRAY[
    'aa060000-0000-0000-0000-000000000001'::UUID,'aa060000-0000-0000-0000-000000000001'::UUID,
    'aa070000-0000-0000-0000-000000000001'::UUID,'aa070000-0000-0000-0000-000000000001'::UUID,
    'aa080000-0000-0000-0000-000000000001'::UUID,'aa080000-0000-0000-0000-000000000001'::UUID,
    'aa090000-0000-0000-0000-000000000001'::UUID,'aa090000-0000-0000-0000-000000000001'::UUID,
    'ffffffff-0000-0000-0000-000000000001'::UUID,'ffffffff-0000-0000-0000-000000000001'::UUID,
    'aa110000-0000-0000-0000-000000000001'::UUID,'aa110000-0000-0000-0000-000000000001'::UUID,
    'aa120000-0000-0000-0000-000000000001'::UUID,'aa120000-0000-0000-0000-000000000001'::UUID];

  -- Class teacher for attendance (taken_by_staff_id)
  class_teacher UUID[] := ARRAY[
    '5500000c-0000-0000-0000-000000000001'::UUID,'5500000c-0000-0000-0000-000000000001'::UUID,
    '5500000d-0000-0000-0000-000000000001'::UUID,'5500000d-0000-0000-0000-000000000001'::UUID,
    '55000004-0000-0000-0000-000000000001'::UUID,'55000004-0000-0000-0000-000000000001'::UUID,
    '55000003-0000-0000-0000-000000000001'::UUID,'55000003-0000-0000-0000-000000000001'::UUID,
    '66666666-0000-0000-0000-000000000001'::UUID,'55000011-0000-0000-0000-000000000001'::UUID,
    '55000005-0000-0000-0000-000000000001'::UUID,'55000005-0000-0000-0000-000000000001'::UUID,
    '55000006-0000-0000-0000-000000000001'::UUID,'55000006-0000-0000-0000-000000000001'::UUID];

  v_sess UUID; v_si INT; v_di INT; v_n INT;
  v_stu RECORD; v_att TEXT;
BEGIN
  FOR v_si IN 1..14 LOOP
    FOR v_di IN 1..25 LOOP
      -- Deterministic session UUID
      v_sess := format('a%s%s00-0000-0000-0000-000000000000',
                  lpad(v_si::TEXT,3,'0'), lpad(v_di::TEXT,2,'0'))::UUID;

      INSERT INTO attendance_sessions
        (id,tenant_id,school_id,class_id,section_id,academic_year_id,
         taken_by_staff_id,session_date,period_number,is_finalized)
      VALUES (v_sess, v_tenant, v_school, class_for_sec[v_si], section_list[v_si], v_ay,
              class_teacher[v_si], work_days[v_di], 0, TRUE)
      ON CONFLICT DO NOTHING;

      v_n := 0;
      FOR v_stu IN
        SELECT id FROM students
         WHERE section_id = section_list[v_si] AND school_id = v_school
         ORDER BY student_number
      LOOP
        v_n := v_n + 1;
        -- Attendance pattern: ~88 % PRESENT, ~7 % ABSENT, ~5 % LATE
        v_att := CASE
          WHEN (v_n + v_di) % 14 = 0 THEN 'ABSENT'
          WHEN (v_n + v_di) % 20 = 0 THEN 'LATE'
          ELSE 'PRESENT'
        END;
        INSERT INTO attendance_records (id,tenant_id,session_id,student_id,status)
        VALUES (gen_random_uuid(), v_tenant, v_sess, v_stu.id, v_att)
        ON CONFLICT ON CONSTRAINT uq_att_record_session_student DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
$b4$;

-- ─────────────────────────────────────────────────────────────────────────────
-- DO BLOCK 5 : Exam subjects + student marks for existing Mid-Term exam
-- Exam: 88888888-0000-0000-0000-000000000001 (Apr 1–10 2026, COMPLETED)
-- Exam subject UUID: e{class_hex_2}{subj_idx_2}00-0000-0000-0000-000000000001
-- ─────────────────────────────────────────────────────────────────────────────
EXECUTE $b5$
DO $$
DECLARE
  v_tenant UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_school UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_exam   UUID := '88888888-0000-0000-0000-000000000001';
  v_principal UUID := '55000001-0000-0000-0000-000000000001';

  sMATH UUID := 'eeeeeeee-0000-0000-0000-000000000001';
  sHINDI UUID := 'e2000000-0000-0000-0000-000000000001';
  sENG  UUID := 'e3000000-0000-0000-0000-000000000001';
  sSCI  UUID := 'e4000000-0000-0000-0000-000000000001';
  sSST  UUID := 'e5000000-0000-0000-0000-000000000001';
  sSANS UUID := 'e6000000-0000-0000-0000-000000000001';
  sPHYS UUID := 'e7000000-0000-0000-0000-000000000001';
  sCHEM UUID := 'e8000000-0000-0000-0000-000000000001';
  sBIO  UUID := 'e9000000-0000-0000-0000-000000000001';
  sCS   UUID := 'ea000000-0000-0000-0000-000000000001';

  -- Subjects per class group and their exam dates
  grp1_subjs UUID[] := ARRAY[sMATH,sHINDI,sENG,sSCI,sSST,sSANS];  -- class 6-8
  grp2_subjs UUID[] := ARRAY[sMATH,sHINDI,sENG,sPHYS,sCHEM,sBIO];  -- class 9-10
  grp3_subjs UUID[] := ARRAY[sMATH,sHINDI,sENG,sPHYS,sCHEM];       -- class 11-12
  grp1_dates DATE[] := ARRAY['2026-04-03'::DATE,'2026-04-01','2026-04-02','2026-04-04','2026-04-06','2026-04-07'];
  grp2_dates DATE[] := ARRAY['2026-04-03'::DATE,'2026-04-01','2026-04-02','2026-04-04','2026-04-06','2026-04-07'];
  grp3_dates DATE[] := ARRAY['2026-04-03'::DATE,'2026-04-01','2026-04-02','2026-04-04','2026-04-06'];

  v_class_nums INT[]  := ARRAY[6,7,8,9,10,11,12];
  v_class_ids  UUID[] := ARRAY[
    'aa060000-0000-0000-0000-000000000001'::UUID,'aa070000-0000-0000-0000-000000000001'::UUID,
    'aa080000-0000-0000-0000-000000000001'::UUID,'aa090000-0000-0000-0000-000000000001'::UUID,
    'ffffffff-0000-0000-0000-000000000001'::UUID,'aa110000-0000-0000-0000-000000000001'::UUID,
    'aa120000-0000-0000-0000-000000000001'::UUID];

  v_ci INT; v_sj INT; v_cnum INT; v_cid UUID; v_grp INT;
  v_subj UUID; v_edate DATE; v_esid UUID;
  v_stu RECORD; v_n INT; v_marks NUMERIC;
  cur_subjs UUID[]; cur_dates DATE[];
BEGIN
  FOR v_ci IN 1..7 LOOP
    v_cnum := v_class_nums[v_ci];
    v_cid  := v_class_ids[v_ci];
    v_grp  := CASE WHEN v_cnum <= 8 THEN 1 WHEN v_cnum <= 10 THEN 2 ELSE 3 END;
    cur_subjs := CASE v_grp WHEN 1 THEN grp1_subjs WHEN 2 THEN grp2_subjs ELSE grp3_subjs END;
    cur_dates := CASE v_grp WHEN 1 THEN grp1_dates WHEN 2 THEN grp2_dates ELSE grp3_dates END;

    FOR v_sj IN 1..array_length(cur_subjs,1) LOOP
      v_subj := cur_subjs[v_sj];
      v_edate := cur_dates[v_sj];

      -- Exam subject UUID: e{class_hex_2}{subj_idx_2}000-0000-0000-0000-000000000001
      v_esid := format('e%s%s000-0000-0000-0000-000000000001',
                  lpad(to_hex(v_cnum),2,'0'), lpad(v_sj::TEXT,2,'0'))::UUID;

      INSERT INTO exam_subjects
        (id,exam_id,subject_id,class_id,section_id,exam_date,start_time,duration_minutes,total_marks,passing_marks)
      VALUES (v_esid, v_exam, v_subj, v_cid, NULL, v_edate, '09:00'::TIME, 180, 100, 33)
      ON CONFLICT ON CONSTRAINT exam_subjects_unique DO NOTHING;

      -- Insert marks for every student in this class
      v_n := 0;
      FOR v_stu IN
        SELECT id FROM students
         WHERE class_id = v_cid AND school_id = v_school
         ORDER BY student_number
      LOOP
        v_n := v_n + 1;
        -- Varied realistic marks: mostly 45-85, a few low scorers
        v_marks := CASE
          WHEN v_n % 15 = 0 THEN 28 + (v_n % 5)          -- ~7% below passing
          WHEN v_n % 7  = 0 THEN 33 + (v_n % 3)           -- borderline
          ELSE 45 + ((v_n * v_sj + v_ci * 3) % 41)        -- 45-85
        END;

        INSERT INTO student_marks
          (id,tenant_id,exam_id,exam_subject_id,student_id,marks_obtained,is_absent,entered_by)
        VALUES (gen_random_uuid(), v_tenant, v_exam, v_esid, v_stu.id,
                v_marks, FALSE, v_principal)
        ON CONFLICT ON CONSTRAINT student_marks_unique DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
$b5$;

END $v42$;
