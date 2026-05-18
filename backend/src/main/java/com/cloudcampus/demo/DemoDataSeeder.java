package com.cloudcampus.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;

import static com.cloudcampus.demo.DemoConstants.*;

/**
 * Enterprise demo-school seeder for Jawahar Navodaya Vidyalaya Lucknow.
 *
 * Runs once on startup when {@code app.demo.enabled=true}.
 * Idempotent: guard-checked via student-count before seeding.
 *
 * Data seeded (all scoped to jnv-lucknow-demo tenant):
 *   • 1 academic year (2025-26)
 *   • 5 departments, 10 subjects
 *   • 14 grades × 3 sections = 42 sections
 *   • 40 teacher users + staff records
 *   • 1 school-admin user + user_school_access
 *   • 5 named demo student users + parents
 *   • 1 050 students (42 sections × 25 each)
 *   • 4 fee categories + fee structures per class level
 *   • 20 working days of attendance
 *   • 2 exams (Unit Test 1, Mid-Term) with subject marks + results
 *   • 10 lesson plans, 5 homework assignments, 5 school notices
 */
@Component
@Order(20)
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    // Deterministic seed for reproducible demo data across nightly resets
    private static final long RNG_SEED = 42_000_000L;

    private final JdbcTemplate       jdbc;
    private final PasswordEncoder     encoder;
    private final IndianNameGenerator names    = new IndianNameGenerator(RNG_SEED);
    private final Map<String, UUID>   uuidCache = new HashMap<>();

    public DemoDataSeeder(JdbcTemplate jdbc, PasswordEncoder encoder) {
        this.jdbc    = jdbc;
        this.encoder = encoder;
    }

    // ── Entry point ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (isAlreadySeeded()) {
            log.debug("DEMO: JNV Lucknow demo school already seeded — skipping.");
            return;
        }
        log.info("DEMO: Seeding Jawahar Navodaya Vidyalaya Lucknow enterprise demo data...");
        long start = System.currentTimeMillis();

        String hash = encoder.encode(DEMO_PASSWORD);

        UUID ayId   = seedAcademicYear();
        List<UUID> deptIds = seedDepartmentsAndFeeCategories();
        List<UUID> subjectIds = seedSubjects();
        List<SectionRef> sections = seedClassesAndSections(ayId);
        seedAdminUser(hash);
        List<UUID> staffIds = seedTeachers(hash, deptIds);
        UUID teacher1StaffId = staffIds.get(0);
        seedDemoStudentUsers(hash, sections);
        seedAllStudents(sections);
        seedFeeStructures(sections);
        seedAttendance(sections);
        seedExams(subjectIds, sections);
        seedLessonPlans(teacher1StaffId, sections, subjectIds, ayId);
        seedHomework(teacher1StaffId, sections, subjectIds);
        seedNotices();
        seedTimetable(staffIds, sections, subjectIds, ayId);
        seedStaffAttendance(staffIds);
        seedLeaveRequests(staffIds);
        seedStudentFeeRecords(sections);
        seedAssignments(teacher1StaffId, sections, subjectIds, ayId);
        seedNotificationLogs();
        seedWhatsAppLogs();
        seedAiUsageLogs();
        seedWebsite();

        log.info("DEMO: JNV Lucknow demo school seeded in {} ms.", System.currentTimeMillis() - start);
    }

    // ── Guard ─────────────────────────────────────────────────────────────────

    private boolean isAlreadySeeded() {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM students WHERE tenant_id = ?", Integer.class, TENANT_ID);
        return count != null && count >= SEED_GUARD_THRESHOLD;
    }

    // ── Academic year ─────────────────────────────────────────────────────────

    private UUID seedAcademicYear() {
        jdbc.update("""
            INSERT INTO academic_years
                (id, tenant_id, school_id, name, start_date, end_date, is_current)
            VALUES (?, ?, ?, '2025-26', '2025-04-01', '2026-03-31', true)
            ON CONFLICT (id) DO NOTHING
            """, AY_ID, TENANT_ID, SCHOOL_ID);
        return AY_ID;
    }

    // ── Departments & fee categories ──────────────────────────────────────────

    private List<UUID> seedDepartmentsAndFeeCategories() {
        // Departments — capture IDs so seedTeachers can reference them by position
        UUID[] depUuids = { uuid("dep-0001"), uuid("dep-0002"), uuid("dep-0003"), uuid("dep-0004"), uuid("dep-0005") };
        Object[][] depts = {
            {depUuids[0], "Academic",          "ACAD",  "Core academic instruction"},
            {depUuids[1], "Science",            "SCI",   "Science and laboratory subjects"},
            {depUuids[2], "Arts & Humanities",  "ARTS",  "Languages, humanities, and arts"},
            {depUuids[3], "Administration",     "ADMIN", "Administrative and support"},
            {depUuids[4], "Sports",             "SPT",   "Physical education and sports"}
        };
        for (Object[] d : depts) {
            jdbc.update("""
                INSERT INTO departments (id, tenant_id, school_id, name, code, description)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT ON CONSTRAINT uq_departments_school_name DO NOTHING
                """, d[0], TENANT_ID, SCHOOL_ID, d[1], d[2], d[3]);
        }

        // Fee categories
        Object[][] cats = {
            {uuid("fcat-001"), "Tuition Fee",     "Monthly tuition for all classes"},
            {uuid("fcat-002"), "Examination Fee", "Per-term exam fee"},
            {uuid("fcat-003"), "Library Fee",     "Annual library resource fee"},
            {uuid("fcat-004"), "Sports Fee",      "Annual sports and PE fee"}
        };
        for (Object[] c : cats) {
            jdbc.update("""
                INSERT INTO fee_categories (id, tenant_id, school_id, name, description)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, c[0], TENANT_ID, SCHOOL_ID, c[1], c[2]);
        }
        return List.of(depUuids);
    }

    // ── Subjects ──────────────────────────────────────────────────────────────

    private List<UUID> seedSubjects() {
        Object[][] subs = {
            {uuid("sub-0001"), "Mathematics",    "MATH"},
            {uuid("sub-0002"), "Science",        "SCI"},
            {uuid("sub-0003"), "English",        "ENG"},
            {uuid("sub-0004"), "Hindi",          "HIN"},
            {uuid("sub-0005"), "Social Studies", "SST"},
            {uuid("sub-0006"), "Computer Sci.",  "CS"},
            {uuid("sub-0007"), "Physics",        "PHY"},
            {uuid("sub-0008"), "Chemistry",      "CHEM"},
            {uuid("sub-0009"), "Biology",        "BIO"},
            {uuid("sub-0010"), "Physical Edu.",  "PE"}
        };
        List<UUID> ids = new ArrayList<>();
        for (Object[] s : subs) {
            UUID id = (UUID) s[0];
            jdbc.update("""
                INSERT INTO subjects (id, tenant_id, school_id, name, code)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT ON CONSTRAINT uq_subjects_school_code DO NOTHING
                """, id, TENANT_ID, SCHOOL_ID, s[1], s[2]);
            ids.add(id);
        }
        return ids;
    }

    // ── Classes & sections ────────────────────────────────────────────────────

    private List<SectionRef> seedClassesAndSections(UUID ayId) {
        String[][] grades = {
            {"Nursery", "0"},  {"LKG",     "1"},  {"UKG",     "2"},
            {"Class 1",  "3"}, {"Class 2",  "4"}, {"Class 3",  "5"},
            {"Class 4",  "6"}, {"Class 5",  "7"}, {"Class 6",  "8"},
            {"Class 7",  "9"}, {"Class 8", "10"}, {"Class 9", "11"},
            {"Class 10","12"}, {"Class 11","13"}, {"Class 12","14"}
        };

        List<SectionRef> sections = new ArrayList<>();
        for (int g = 0; g < grades.length; g++) {
            UUID classId = uuid("cls-" + String.format("%02d", g));
            jdbc.update("""
                INSERT INTO classes (id, tenant_id, school_id, academic_year_id, name, grade_order)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT ON CONSTRAINT uq_classes_school_year_name DO NOTHING
                """, classId, TENANT_ID, SCHOOL_ID, ayId, grades[g][0], Short.parseShort(grades[g][1]));

            for (String sec : SECTION_NAMES) {
                UUID sectionId = uuid("sec-" + String.format("%02d", g) + "-" + sec);
                jdbc.update("""
                    INSERT INTO sections (id, tenant_id, school_id, class_id, name, capacity)
                    VALUES (?, ?, ?, ?, ?, 30)
                    ON CONFLICT ON CONSTRAINT uq_sections_class_name DO NOTHING
                    """, sectionId, TENANT_ID, SCHOOL_ID, classId, sec);
                sections.add(new SectionRef(sectionId, classId, g));
            }
        }
        return sections;
    }

    // ── Admin user ────────────────────────────────────────────────────────────

    private void seedAdminUser(String hash) {
        // User account
        jdbc.update("""
            INSERT INTO users (id, tenant_id, username, password_hash, role, status)
            VALUES (?, ?, 'jnv.admin', ?, 'SCHOOL_ADMIN', 'ACTIVE')
            ON CONFLICT (username) DO NOTHING
            """, ADMIN_USER_ID, TENANT_ID, hash);

        // Staff record for the admin
        jdbc.update("""
            INSERT INTO staff (id, tenant_id, school_id, user_id, employee_number,
                               staff_type, status, first_name, last_name, joining_date,
                               email, phone)
            VALUES (?, ?, ?, ?, 'JNV-ADMIN-001', 'ADMIN_STAFF', 'ACTIVE',
                    'Uttam', 'Kumar', '2020-04-01',
                    'uttamkumar3797@gmail.com', '+917905025730')
            ON CONFLICT ON CONSTRAINT uq_staff_school_employee_number DO NOTHING
            """, uuid("stf-admin"), TENANT_ID, SCHOOL_ID, ADMIN_USER_ID);

        // user_school_access so school_id is embedded in the JWT
        jdbc.update("""
            INSERT INTO user_school_access (user_id, school_id, tenant_id, is_primary)
            VALUES (?, ?, ?, true)
            ON CONFLICT DO NOTHING
            """, ADMIN_USER_ID, SCHOOL_ID, TENANT_ID);
    }

    // ── Teachers ──────────────────────────────────────────────────────────────

    private List<UUID> seedTeachers(String hash, List<UUID> deptIds) {
        List<UUID> staffIds = new ArrayList<>();

        for (int i = 1; i <= 40; i++) {
            boolean male    = (i % 2 == 1);
            String[] name   = male ? names.maleName() : names.femaleName();
            String username = String.format("jnv.teacher%03d", i);
            UUID userId     = uuid("usr-t-" + String.format("%04d", i));
            UUID staffId    = uuid("stf-t-" + String.format("%04d", i));
            String empNo    = String.format("JNV-TCH-%03d", i);

            jdbc.update("""
                INSERT INTO users (id, tenant_id, username, password_hash, role, status)
                VALUES (?, ?, ?, ?, 'TEACHER', 'ACTIVE')
                ON CONFLICT (username) DO NOTHING
                """, userId, TENANT_ID, username, hash);

            jdbc.update("""
                INSERT INTO staff (id, tenant_id, school_id, user_id, department_id,
                                   employee_number, staff_type, status,
                                   first_name, last_name, gender, email, phone, joining_date)
                VALUES (?, ?, ?, ?, ?, ?, 'TEACHER', 'ACTIVE', ?, ?, ?, ?, ?, ?)
                ON CONFLICT ON CONSTRAINT uq_staff_school_employee_number DO NOTHING
                """,
                staffId, TENANT_ID, SCHOOL_ID, userId,
                deptIds.get(i % 5),
                empNo, name[0], name[1],
                male ? "MALE" : "FEMALE",
                names.staffEmail(name[0], name[1]),
                names.phone(),
                LocalDate.of(2015 + (i % 8), 6, 1));

            // First teacher also gets user_school_access for JWT school_id resolution
            if (i == 1) {
                jdbc.update("""
                    INSERT INTO user_school_access (user_id, school_id, tenant_id, is_primary)
                    VALUES (?, ?, ?, true)
                    ON CONFLICT DO NOTHING
                    """, userId, SCHOOL_ID, TENANT_ID);
                // Override with the stable TEACHER1_USER_ID for the first teacher
            }

            staffIds.add(staffId);

            // Also link the first teacher to the stable constant UUID
            if (i == 1) {
                jdbc.update("""
                    INSERT INTO users (id, tenant_id, username, password_hash, role, status)
                    VALUES (?, ?, 'gw.teacher001.demo', ?, 'TEACHER', 'ACTIVE')
                    ON CONFLICT (username) DO NOTHING
                    """, TEACHER1_USER_ID, TENANT_ID, hash);
            }
        }
        return staffIds;
    }

    // ── Named demo student + parent users ─────────────────────────────────────

    private void seedDemoStudentUsers(String hash, List<SectionRef> sections) {
        // 5 named demo students with user accounts (for parent / student portal testing)
        String[][] students = {
            {"Aarav",  "Sharma",  "JNV-0001"},
            {"Priya",  "Patel",   "JNV-0002"},
            {"Rohit",  "Gupta",   "JNV-0003"},
            {"Ananya", "Singh",   "JNV-0004"},
            {"Dev",    "Mehta",   "JNV-0005"}
        };
        SectionRef firstSection = sections.get(9); // Class 4-A (index 9)

        for (int i = 0; i < 5; i++) {
            UUID sUserId = i == 0 ? STUDENT1_USER_ID : uuid("usr-s-demo-" + i);
            UUID pUserId = i == 0 ? PARENT1_USER_ID  : uuid("usr-p-demo-" + i);
            UUID sId     = uuid("stu-demo-" + i);

            // Student user
            jdbc.update("""
                INSERT INTO users (id, tenant_id, username, password_hash, role, status)
                VALUES (?, ?, ?, ?, 'STUDENT', 'ACTIVE')
                ON CONFLICT (username) DO NOTHING
                """, sUserId, TENANT_ID,
                String.format("jnv.student%03d", i + 1), hash);

            // Student record
            jdbc.update("""
                INSERT INTO students (id, tenant_id, school_id, user_id, student_number,
                    admission_date, status, class_id, section_id,
                    first_name, last_name, gender, date_of_birth)
                VALUES (?, ?, ?, ?, ?, '2022-04-01', 'ACTIVE', ?, ?, ?, ?, 'MALE', '2012-06-15')
                ON CONFLICT ON CONSTRAINT uq_students_school_number DO NOTHING
                """, sId, TENANT_ID, SCHOOL_ID, sUserId, students[i][2],
                firstSection.classId(), firstSection.id(),
                students[i][0], students[i][1]);

            // Parent user
            jdbc.update("""
                INSERT INTO users (id, tenant_id, username, password_hash, role, status)
                VALUES (?, ?, ?, ?, 'PARENT', 'ACTIVE')
                ON CONFLICT (username) DO NOTHING
                """, pUserId, TENANT_ID,
                String.format("jnv.parent%03d", i + 1), hash);

            // Parent-student link (schema: student_id, parent_user_id, relationship, is_primary)
            jdbc.update("""
                INSERT INTO student_parent_links
                    (id, tenant_id, student_id, parent_user_id, relationship, is_primary)
                VALUES (?, ?, ?, ?, 'FATHER', true)
                ON CONFLICT ON CONSTRAINT uq_student_parent_link DO NOTHING
                """,
                uuid("lnk-demo-" + i), TENANT_ID, sId, pUserId);
        }
    }

    // ── Bulk students (1 050 total across all sections) ───────────────────────

    private void seedAllStudents(List<SectionRef> sections) {
        String sql = """
            INSERT INTO students
                (id, tenant_id, school_id, student_number, admission_date, status,
                 class_id, section_id, first_name, last_name, gender, date_of_birth, phone, address)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT ON CONSTRAINT uq_students_school_number DO NOTHING
            """;

        int seqNo = 100; // Start after demo students (JNV-0001 to JNV-0005)
        List<Object[]> batch = new ArrayList<>(500);

        for (SectionRef sec : sections) {
            for (int i = 0; i < STUDENTS_PER_SECTION; i++) {
                boolean male  = (seqNo % 2 == 0);
                String[] name = male ? names.maleName() : names.femaleName();
                int birthYear = 2010 + (sec.gradeOrder() > 2 ? sec.gradeOrder() - 2 : 0);

                batch.add(new Object[]{
                    UUID.randomUUID(), TENANT_ID, SCHOOL_ID,
                    String.format("GW-%04d", seqNo),
                    LocalDate.of(2020 + Math.min(sec.gradeOrder(), 5), 4, 1),
                    sec.classId(), sec.id(),
                    name[0], name[1],
                    male ? "MALE" : "FEMALE",
                    LocalDate.of(Math.max(birthYear, 2010), 1 + (seqNo % 12), 1 + (seqNo % 28)),
                    names.phone(),
                    names.address()
                });
                seqNo++;

                if (batch.size() == 500) {
                    jdbc.batchUpdate(sql, batch);
                    batch.clear();
                }
            }
        }
        if (!batch.isEmpty()) {
            jdbc.batchUpdate(sql, batch);
        }
        log.debug("DEMO: Seeded {} students.", seqNo - 100);
    }

    // ── Fee structures & payments ─────────────────────────────────────────────

    private void seedFeeStructures(List<SectionRef> sections) {
        // 3 fee tiers: Pre-Primary (Nursery-UKG), Primary (1-5), Secondary (6-12)
        record FeeTier(String tag, int minGrade, int maxGrade, int tuition) {}
        FeeTier[] tiers = {
            new FeeTier("pre-primary",  0,  2, 1500),
            new FeeTier("primary",      3,  7, 2000),
            new FeeTier("secondary",    8, 14, 2500)
        };

        UUID fcTuition = uuid("fcat-001");
        UUID fcExam    = uuid("fcat-002");

        for (FeeTier tier : tiers) {
            // Tuition — MONTHLY, no class_id (tier covers a grade range)
            // Use ON CONFLICT (id) because class_id=NULL makes the partial unique index skip
            jdbc.update("""
                INSERT INTO fee_structures
                    (id, tenant_id, school_id, fee_category_id, amount,
                     frequency, academic_year_id)
                VALUES (?, ?, ?, ?, ?, 'MONTHLY', ?)
                ON CONFLICT (id) DO NOTHING
                """, uuid("fs-" + tier.tag()), TENANT_ID, SCHOOL_ID,
                fcTuition, tier.tuition(), AY_ID);

            // Exam fee — ONE_TIME
            jdbc.update("""
                INSERT INTO fee_structures
                    (id, tenant_id, school_id, fee_category_id, amount,
                     frequency, academic_year_id)
                VALUES (?, ?, ?, ?, 500, 'ONE_TIME', ?)
                ON CONFLICT (id) DO NOTHING
                """, uuid("fs-ex-" + tier.tag()), TENANT_ID, SCHOOL_ID,
                fcExam, AY_ID);
        }
    }

    // ── Attendance (last 20 working days) ─────────────────────────────────────

    private void seedAttendance(List<SectionRef> sections) {
        // One attendance session per section per day; all students present (demo = 90 %)
        List<LocalDate> workDays = last20WorkingDays();

        // For performance, seed attendance only for first 6 sections (demo showcase)
        List<SectionRef> showcaseSections = sections.subList(0, Math.min(6, sections.size()));

        UUID teacher1Staff = uuid("stf-t-" + String.format("%04d", 1));

        for (SectionRef sec : showcaseSections) {
            List<UUID> studentIds = jdbc.queryForList(
                "SELECT id FROM students WHERE school_id = ? AND section_id = ? LIMIT 30",
                UUID.class, SCHOOL_ID, sec.id());

            if (studentIds.isEmpty()) continue;

            for (LocalDate day : workDays) {
                UUID sessionId = UUID.randomUUID();

                jdbc.update("""
                    INSERT INTO attendance_sessions
                        (id, tenant_id, school_id, class_id, section_id,
                         academic_year_id, session_date, subject_id,
                         taken_by_staff_id, is_finalized)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
                    ON CONFLICT (id) DO NOTHING
                    """, sessionId, TENANT_ID, SCHOOL_ID,
                    sec.classId(), sec.id(), AY_ID, day,
                    uuid("sub-0001"), teacher1Staff);

                List<Object[]> recs = new ArrayList<>();
                for (UUID sId : studentIds) {
                    boolean present = (Math.abs(sId.getLeastSignificantBits()) % 10 != 0);
                    recs.add(new Object[]{
                        UUID.randomUUID(), TENANT_ID, sessionId, sId,
                        present ? "PRESENT" : "ABSENT"
                    });
                }
                jdbc.batchUpdate("""
                    INSERT INTO attendance_records
                        (id, tenant_id, session_id, student_id, status)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT ON CONSTRAINT uq_att_record_session_student DO NOTHING
                    """, recs);
            }
        }
        log.debug("DEMO: Attendance seeded for {} sections × {} days.",
                  showcaseSections.size(), workDays.size());
    }

    // ── Exams, marks, results ─────────────────────────────────────────────────

    private void seedExams(List<UUID> subjectIds, List<SectionRef> sections) {
        String[] examNames = {"Unit Test 1 (2025-26)", "Mid-Term Examination (2025-26)"};
        LocalDate[] startDates = {LocalDate.of(2025, 7, 10), LocalDate.of(2025, 9, 15)};
        LocalDate[] endDates   = {LocalDate.of(2025, 7, 12), LocalDate.of(2025, 9, 22)};

        SectionRef examSection = sections.get(9); // Class 4-A — showcase section
        List<UUID> examSubjectIds = subjectIds.subList(0, 5); // first 5 subjects

        for (int e = 0; e < examNames.length; e++) {
            UUID examId = uuid("exam-" + String.format("%04d", e + 1));

            jdbc.update("""
                INSERT INTO exams
                    (id, tenant_id, school_id, academic_year_id, name,
                     exam_type, start_date, end_date, status, total_marks, passing_marks)
                VALUES (?, ?, ?, ?, ?, 'UNIT_TEST', ?, ?, 'COMPLETED', 400, 160)
                ON CONFLICT (id) DO NOTHING
                """, examId, TENANT_ID, SCHOOL_ID, AY_ID,
                examNames[e], startDates[e], endDates[e]);

            // Seed exam_subjects with stable UUIDs so we can reference them in student_marks
            List<UUID> esIds = new ArrayList<>();
            for (int s = 0; s < examSubjectIds.size(); s++) {
                UUID esId  = uuid("es-" + e + "-" + s);
                UUID subId = examSubjectIds.get(s);
                esIds.add(esId);
                jdbc.update("""
                    INSERT INTO exam_subjects
                        (id, exam_id, subject_id, class_id, total_marks, passing_marks, exam_date)
                    VALUES (?, ?, ?, ?, 80, 32, ?)
                    ON CONFLICT ON CONSTRAINT exam_subjects_unique DO NOTHING
                    """, esId, examId, subId, examSection.classId(), startDates[e]);
            }

            // student_marks: one row per (exam_subject_id, student_id)
            List<UUID> studentIds = jdbc.queryForList(
                "SELECT id FROM students WHERE school_id = ? AND section_id = ? LIMIT 30",
                UUID.class, SCHOOL_ID, examSection.id());

            List<Object[]> marksBatch = new ArrayList<>();
            for (UUID stuId : studentIds) {
                int totalObtained = 0;
                for (int s = 0; s < esIds.size(); s++) {
                    int marks = 40 + (int)(Math.abs(stuId.getLeastSignificantBits()
                                ^ examSubjectIds.get(s).getMostSignificantBits()) % 40);
                    marksBatch.add(new Object[]{
                        UUID.randomUUID(), TENANT_ID, examId, esIds.get(s), stuId,
                        marks, false   // marks_obtained, is_absent
                    });
                    totalObtained += marks;
                }

                double pct   = (totalObtained * 100.0) / (esIds.size() * 80);
                String grade = pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : "D";

                jdbc.update("""
                    INSERT INTO exam_results
                        (id, tenant_id, exam_id, student_id, school_id,
                         total_marks_obtained, total_marks_possible, percentage, grade, is_passed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT ON CONSTRAINT exam_results_unique DO NOTHING
                    """, UUID.randomUUID(), TENANT_ID, examId, stuId, SCHOOL_ID,
                    totalObtained, esIds.size() * 80, pct, grade, pct >= 40.0);
            }

            if (!marksBatch.isEmpty()) {
                jdbc.batchUpdate("""
                    INSERT INTO student_marks
                        (id, tenant_id, exam_id, exam_subject_id, student_id,
                         marks_obtained, is_absent)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT ON CONSTRAINT student_marks_unique DO NOTHING
                    """, marksBatch);
            }
        }
        log.debug("DEMO: Seeded {} exams.", examNames.length);
    }

    // ── Lesson plans ──────────────────────────────────────────────────────────

    private void seedLessonPlans(UUID staffId, List<SectionRef> sections, List<UUID> subjectIds, UUID ayId) {
        SectionRef sec = sections.get(9);
        String[] topics = {
            "Introduction to Fractions", "Decimals and Percentages",
            "Photosynthesis", "The Human Digestive System",
            "Parts of Speech", "Essay Writing Techniques",
            "India's Freedom Movement", "River Systems of India",
            "Fundamentals of Programming", "Binary Number System"
        };

        for (int i = 0; i < 10; i++) {
            UUID subId = subjectIds.get(i % subjectIds.size());
            jdbc.update("""
                INSERT INTO lesson_plans
                    (id, tenant_id, school_id, staff_id, class_id, section_id,
                     subject_id, academic_year_id, plan_date, period_number,
                     topic, objectives, activities, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """,
                uuid("lp-" + String.format("%04d", i + 1)),
                TENANT_ID, SCHOOL_ID, staffId,
                sec.classId(), sec.id(), subId, ayId,
                LocalDate.now().minusDays(i * 2L),
                (i % 6) + 1,
                topics[i],
                "Students will understand " + topics[i].toLowerCase(),
                "Lecture, Q&A, worksheet activity");
        }
        log.debug("DEMO: Seeded 10 lesson plans.");
    }

    // ── Homework ──────────────────────────────────────────────────────────────

    private void seedHomework(UUID staffId, List<SectionRef> sections, List<UUID> subjectIds) {
        SectionRef sec = sections.get(9);
        String[] tasks = {
            "Complete exercises 3.1 to 3.5 in the textbook",
            "Write a 200-word essay on importance of water conservation",
            "Solve the practice problems on page 47"
        };

        for (int i = 0; i < tasks.length; i++) {
            jdbc.update("""
                INSERT INTO homework_assignments
                    (id, tenant_id, school_id, academic_year_id, assigned_by,
                     class_id, section_id, subject_id, title, description, due_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """,
                uuid("hw-" + String.format("%04d", i + 1)),
                TENANT_ID, SCHOOL_ID, AY_ID, staffId,
                sec.classId(), sec.id(),
                subjectIds.get(i % subjectIds.size()),
                "Homework " + (i + 1),
                tasks[i],
                LocalDate.now().plusDays(3L + i));
        }
        log.debug("DEMO: Seeded 3 homework assignments.");
    }

    // ── Notices ───────────────────────────────────────────────────────────────

    private void seedNotices() {
        // category must be one of: GENERAL|ACADEMIC|EXAM|FEE|HOLIDAY|CIRCULAR|URGENT
        // priority is SMALLINT (higher = more important); is_published replaces status
        Object[][] notices = {
            {"Annual Sports Day 2026",
             "All students must report to the ground by 8:00 AM on 15 November for Annual Sports Day.",
             "GENERAL", 2},
            {"Parent-Teacher Meeting — Term 1",
             "PT Meeting scheduled for 5 October 2025. Please collect your child's progress report.",
             "ACADEMIC", 1},
            {"Mid-Term Examination Schedule",
             "Mid-term exams begin on 15 September. Revised timetable is attached.",
             "EXAM", 2},
            {"School Closure — Dussehra",
             "School will remain closed on 2 October and 3 October 2025 for Dussehra.",
             "HOLIDAY", 0},
            {"New Library Hours",
             "Library is now open Monday to Saturday from 8 AM to 5 PM.",
             "GENERAL", 0}
        };

        for (int i = 0; i < notices.length; i++) {
            jdbc.update("""
                INSERT INTO school_notices
                    (id, tenant_id, school_id, posted_by, title, content,
                     category, priority, is_published, published_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, now())
                ON CONFLICT (id) DO NOTHING
                """,
                uuid("ntc-" + String.format("%04d", i + 1)),
                TENANT_ID, SCHOOL_ID, ADMIN_USER_ID,
                notices[i][0], notices[i][1], notices[i][2], notices[i][3]);
        }
        log.debug("DEMO: Seeded 5 school notices.");
    }

    // ── Timetable ─────────────────────────────────────────────────────────────

    private void seedTimetable(List<UUID> staffIds, List<SectionRef> sections,
                                List<UUID> subjectIds, UUID ayId) {
        String[] days = {"MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"};
        // Three showcase sections: Class 1-A (idx 9), Class 6-A (idx 24), Class 10-A (idx 36)
        int[] picks = {9, Math.min(24, sections.size()-1), Math.min(36, sections.size()-1)};
        List<Object[]> batch = new ArrayList<>();
        for (int si = 0; si < picks.length; si++) {
            SectionRef sec = sections.get(picks[si]);
            for (int di = 0; di < days.length; di++) {
                for (int period = 1; period <= 8; period++) {
                    int subIdx = (di * 8 + period - 1) % subjectIds.size();
                    int stfIdx = (si * 48 + di * 8 + period - 1) % Math.min(staffIds.size(), 20);
                    batch.add(new Object[]{
                        uuid(String.format("tt-%02d-%02d-%02d", si, di, period)),
                        TENANT_ID, SCHOOL_ID, ayId,
                        sec.classId(), sec.id(),
                        subjectIds.get(subIdx), staffIds.get(stfIdx),
                        days[di], period,
                        LocalTime.of(7 + period, 0),
                        LocalTime.of(7 + period, 45)
                    });
                }
            }
        }
        if (!batch.isEmpty()) {
            jdbc.batchUpdate("""
                INSERT INTO timetable_slots
                    (id, tenant_id, school_id, academic_year_id, class_id, section_id,
                     subject_id, staff_id, day_of_week, period_number, start_time, end_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT ON CONSTRAINT timetable_slots_unique_period DO NOTHING
                """, batch);
        }
        log.debug("DEMO: Seeded {} timetable slots.", batch.size());
    }

    // ── Staff attendance (last 20 working days) ───────────────────────────────

    private void seedStaffAttendance(List<UUID> staffIds) {
        List<LocalDate> workDays = last20WorkingDays();
        int staffCount = Math.min(15, staffIds.size());
        List<Object[]> batch = new ArrayList<>();
        for (int si = 0; si < staffCount; si++) {
            UUID staffId = staffIds.get(si);
            for (int di = 0; di < workDays.size(); di++) {
                long rnd = Math.abs(staffId.getLeastSignificantBits() + di) % 20;
                String status = rnd < 17 ? "PRESENT" : rnd < 19 ? "ABSENT" : "HALF_DAY";
                batch.add(new Object[]{
                    UUID.randomUUID(), TENANT_ID, SCHOOL_ID, staffId,
                    workDays.get(di), status, null, uuid("stf-admin")
                });
            }
        }
        if (!batch.isEmpty()) {
            jdbc.batchUpdate("""
                INSERT INTO staff_attendance
                    (id, tenant_id, school_id, staff_id, attendance_date, status, notes, marked_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT ON CONSTRAINT uq_staff_attendance_day DO NOTHING
                """, batch);
        }
        log.debug("DEMO: Seeded staff attendance for {} staff × {} days.", staffCount, workDays.size());
    }

    // ── Leave requests ────────────────────────────────────────────────────────

    private void seedLeaveRequests(List<UUID> staffIds) {
        // {staffIndex, type, startDate, endDate, days, reason, status}
        Object[][] leaves = {
            {0, "SICK",     "2025-09-01", "2025-09-03",  3, "Seasonal fever and throat infection",              "APPROVED"},
            {1, "CASUAL",   "2025-09-10", "2025-09-10",  1, "Family function attendance",                       "APPROVED"},
            {2, "EARNED",   "2025-10-20", "2025-10-24",  5, "Annual family vacation trip",                      "APPROVED"},
            {3, "SICK",     "2025-10-05", "2025-10-06",  2, "Medical appointment and recovery",                 "REJECTED"},
            {4, "CASUAL",   "2025-11-01", "2025-11-01",  1, "Personal work to be attended",                    "PENDING"},
            {5, "MATERNITY","2025-08-01", "2025-10-31", 92, "Maternity leave as per school policy",             "APPROVED"},
            {6, "STUDY",    "2025-12-01", "2025-12-05",  5, "Teacher certification exam preparation",           "PENDING"},
            {7, "CASUAL",   "2025-09-25", "2025-09-25",  1, "Wedding ceremony attendance",                     "APPROVED"},
            {8, "SICK",     "2025-10-15", "2025-10-16",  2, "Migraine and prescribed bed rest",                "PENDING"},
            {9, "EARNED",   "2025-12-22", "2025-12-31", 10, "Year-end family trip",                             "PENDING"}
        };
        for (Object[] l : leaves) {
            int idx = (int) l[0];
            if (idx >= staffIds.size()) continue;
            String status = (String) l[6];
            boolean reviewed = "APPROVED".equals(status) || "REJECTED".equals(status);
            jdbc.update("""
                INSERT INTO leave_requests
                    (id, tenant_id, school_id, staff_id, leave_type, start_date, end_date,
                     total_days, reason, status, reviewed_by, review_notes, reviewed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """,
                uuid("lv-" + String.format("%04d", idx + 1)),
                TENANT_ID, SCHOOL_ID, staffIds.get(idx),
                l[1], LocalDate.parse((String) l[2]), LocalDate.parse((String) l[3]),
                l[4], l[5], status,
                reviewed ? ADMIN_USER_ID : null,
                reviewed ? ("APPROVED".equals(status) ? "Approved by Principal" : "Rejected — attendance required") : null,
                reviewed ? OffsetDateTime.now().minusDays(idx + 1L) : null);
        }
        log.debug("DEMO: Seeded 10 leave requests.");
    }

    // ── Student fee records + payments ────────────────────────────────────────

    private void seedStudentFeeRecords(List<SectionRef> sections) {
        SectionRef showcase = sections.get(9); // Class 1-A → PRIMARY tier
        UUID fsTuition = uuid("fs-primary");
        UUID fsExam    = uuid("fs-ex-primary");

        List<UUID> studentIds = new ArrayList<>();
        for (int i = 0; i < 5; i++) studentIds.add(uuid("stu-demo-" + i));
        List<UUID> extra = jdbc.queryForList(
            "SELECT id FROM students WHERE school_id = ? AND section_id = ? LIMIT 10",
            UUID.class, SCHOOL_ID, showcase.id());
        studentIds.addAll(extra);

        String[] payStatuses = {"PAID","PAID","PARTIAL","PENDING","OVERDUE","PAID","PARTIAL","PAID","PENDING","PENDING",
                                "PAID","PARTIAL","PENDING","PAID","PAID"};
        String[] payModes    = {"UPI","CASH","ONLINE","UPI","CASH","ONLINE","UPI","CASH","ONLINE","UPI",
                                "BANK_TRANSFER","UPI","CASH","ONLINE","UPI"};

        for (int i = 0; i < studentIds.size(); i++) {
            UUID stuId = studentIds.get(i);
            String status = payStatuses[i % payStatuses.length];
            int amountDue = 2000;
            int amountPaid = "PAID".equals(status) ? amountDue : "PARTIAL".equals(status) ? amountDue / 2 : 0;

            // Insert tuition fee record; query back actual ID so payment always has a valid FK
            jdbc.update("""
                INSERT INTO student_fee_records
                    (id, tenant_id, school_id, student_id, fee_structure_id, academic_year_id,
                     amount_due, amount_paid, discount, due_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
                ON CONFLICT ON CONSTRAINT uq_student_fee_record DO UPDATE
                    SET amount_paid = EXCLUDED.amount_paid, status = EXCLUDED.status
                """, uuid("sfr-" + String.format("%04d", i)),
                TENANT_ID, SCHOOL_ID, stuId, fsTuition, AY_ID,
                amountDue, amountPaid, LocalDate.of(2025, 8, 10), status);

            UUID actualFeeRecId = jdbc.queryForObject(
                "SELECT id FROM student_fee_records WHERE student_id = ? AND fee_structure_id = ?",
                UUID.class, stuId, fsTuition);

            if (actualFeeRecId != null && amountPaid > 0) {
                jdbc.update("""
                    INSERT INTO fee_payments
                        (id, student_fee_record_id, amount, payment_date, payment_mode,
                         reference_number, receipt_number, collected_by_staff_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    uuid("fp-" + String.format("%04d", i)), actualFeeRecId, amountPaid,
                    LocalDate.of(2025, 8, 1 + (i % 10)),
                    payModes[i % payModes.length],
                    String.format("REF-GW-%06d", 100000 + i),
                    String.format("RCP-GW-%06d", 200000 + i),
                    uuid("stf-admin"));
            }

            // Exam fee record — same upsert + query-back pattern
            String examStatus = i < 8 ? "PAID" : "PENDING";
            int examPaid = "PAID".equals(examStatus) ? 500 : 0;
            jdbc.update("""
                INSERT INTO student_fee_records
                    (id, tenant_id, school_id, student_id, fee_structure_id, academic_year_id,
                     amount_due, amount_paid, discount, due_date, status)
                VALUES (?, ?, ?, ?, ?, ?, 500, ?, 0, ?, ?)
                ON CONFLICT ON CONSTRAINT uq_student_fee_record DO UPDATE
                    SET amount_paid = EXCLUDED.amount_paid, status = EXCLUDED.status
                """, uuid("sfr-ex-" + String.format("%04d", i)),
                TENANT_ID, SCHOOL_ID, stuId, fsExam, AY_ID,
                examPaid, LocalDate.of(2025, 9, 1), examStatus);

            UUID actualExamRecId = jdbc.queryForObject(
                "SELECT id FROM student_fee_records WHERE student_id = ? AND fee_structure_id = ?",
                UUID.class, stuId, fsExam);

            if (actualExamRecId != null && examPaid > 0) {
                jdbc.update("""
                    INSERT INTO fee_payments
                        (id, student_fee_record_id, amount, payment_date, payment_mode,
                         reference_number, receipt_number, collected_by_staff_id)
                    VALUES (?, ?, 500, ?, 'ONLINE', ?, ?, ?)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    uuid("fp-ex-" + String.format("%04d", i)), actualExamRecId,
                    LocalDate.of(2025, 8, 20 + (i % 8)),
                    String.format("REF-EX-%06d", 300000 + i),
                    String.format("RCP-EX-%06d", 400000 + i),
                    uuid("stf-admin"));
            }
        }
        log.debug("DEMO: Seeded fee records & payments for {} students.", studentIds.size());
    }

    // ── Assignments + submissions ──────────────────────────────────────────────

    private void seedAssignments(UUID staffId, List<SectionRef> sections,
                                  List<UUID> subjectIds, UUID ayId) {
        SectionRef sec = sections.get(9);
        Object[][] asgns = {
            {"Science Experiment Report",
             "Document your observations from the water purification experiment in 500 words.",
             "2025-09-20", 25},
            {"Mathematics Problem Set",
             "Solve all exercises in Chapter 4: Fractions and Decimals.",
             "2025-09-18", 30},
            {"English Creative Writing",
             "Write a short story (300-400 words) on the theme: A Day I'll Never Forget.",
             "2025-09-25", 20},
            {"History Research Assignment",
             "Prepare a 2-page summary on the Non-Cooperation Movement of 1920.",
             "2025-10-01", 25},
            {"Computer Science Coding Task",
             "Write a Java program to find the factorial of a number using recursion.",
             "2025-10-05", 20}
        };

        String[] subStatuses = {"GRADED", "SUBMITTED", "GRADED", "PENDING", "LATE"};
        for (int i = 0; i < asgns.length; i++) {
            UUID aId = uuid("asgn-" + String.format("%04d", i + 1));
            jdbc.update("""
                INSERT INTO assignments
                    (id, tenant_id, school_id, academic_year_id, class_id, section_id,
                     subject_id, assigned_by, title, description, due_date, max_marks, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """,
                aId, TENANT_ID, SCHOOL_ID, ayId,
                sec.classId(), sec.id(),
                subjectIds.get(i % subjectIds.size()), staffId,
                asgns[i][0], asgns[i][1],
                LocalDate.parse((String) asgns[i][2]), asgns[i][3]);

            List<Object[]> subs = new ArrayList<>();
            for (int d = 0; d < Math.min(5, i + 2); d++) {
                UUID stuId = uuid("stu-demo-" + (d % 5));
                String subStatus = subStatuses[d % subStatuses.length];
                boolean graded   = "GRADED".equals(subStatus);
                boolean pending  = "PENDING".equals(subStatus);
                subs.add(new Object[]{
                    UUID.randomUUID(), TENANT_ID, aId, stuId, SCHOOL_ID,
                    subStatus,
                    pending ? null : "Submission for " + asgns[i][0],
                    pending ? null : OffsetDateTime.now().minusDays(d + 1L),
                    graded  ? (int) asgns[i][3] - d * 2 : null,
                    graded  ? (d == 0 ? "Excellent work! Keep it up." : "Good effort. Focus on presentation.") : null,
                    graded  ? staffId : null,
                    graded  ? OffsetDateTime.now().minusDays(d) : null
                });
            }
            if (!subs.isEmpty()) {
                jdbc.batchUpdate("""
                    INSERT INTO assignment_submissions
                        (id, tenant_id, assignment_id, student_id, school_id, status,
                         text_response, submitted_at, marks_obtained, feedback,
                         graded_by, graded_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT ON CONSTRAINT assignment_submissions_unique DO NOTHING
                    """, subs);
            }
        }
        log.debug("DEMO: Seeded 5 assignments with submissions.");
    }

    // ── Notification logs ─────────────────────────────────────────────────────

    private void seedNotificationLogs() {
        // {channel, templateCode, recipient, subject, status}
        Object[][] logs = {
            {"EMAIL","WELCOME_EMAIL",       "uttamkumar3797@gmail.com",   "Welcome to Jawahar Navodaya Vidyalaya Lucknow",   "SENT"},
            {"SMS",  "FEE_REMINDER",        "+917905025730",              null,                                              "SENT"},
            {"EMAIL","EXAM_SCHEDULE",       "jnv.parent002@jnv.demo",     "Mid-Term Examination Schedule — 2025-26",        "SENT"},
            {"SMS",  "ATTENDANCE_ALERT",    "+919876543211",              null,                                              "SENT"},
            {"EMAIL","RESULT_NOTIFICATION", "jnv.parent003@jnv.demo",     "Unit Test 1 Results Published",                  "SENT"},
            {"SMS",  "OTP_AUTH",            "+917905025730",              null,                                              "SENT"},
            {"EMAIL","PT_MEETING",          "jnv.parent004@jnv.demo",     "Parent-Teacher Meeting — 5 October 2025",        "SENT"},
            {"SMS",  "HOLIDAY_NOTICE",      "+919876543213",              null,                                              "SENT"},
            {"EMAIL","REPORT_CARD",         "jnv.parent005@jnv.demo",     "Report Card — Term 1, 2025-26",                  "SENT"},
            {"EMAIL","FEE_REMINDER",        "uttamkumar3797@gmail.com",   "Fee Payment Reminder — August 2025",             "FAILED"},
            {"SMS",  "EMERGENCY_ALERT",     "+919876543214",              null,                                              "SENT"},
            {"EMAIL","CIRCULAR",            "jnv.parent002@jnv.demo",     "Circular — Library Hour Changes",                "SENT"},
            {"SMS",  "FEE_REMINDER",        "+919876543215",              null,                                              "FAILED"},
            {"EMAIL","HOMEWORK_ALERT",      "jnv.parent003@jnv.demo",     "Homework Submission Reminder",                   "SENT"},
            {"SMS",  "ATTENDANCE_ALERT",    "+917905025730",              null,                                              "SENT"}
        };
        List<Object[]> batch = new ArrayList<>();
        for (int i = 0; i < logs.length; i++) {
            Object[] l = logs[i];
            boolean sent = "SENT".equals(l[4]);
            batch.add(new Object[]{
                uuid("nl-" + String.format("%04d", i + 1)),
                TENANT_ID, SCHOOL_ID,
                l[0], l[1], l[2], l[3], l[4],
                sent ? null : "SMTP connection timeout — provider unreachable",
                sent ? OffsetDateTime.now().minusHours(24L - i) : null
            });
        }
        jdbc.batchUpdate("""
            INSERT INTO notification_logs
                (id, tenant_id, school_id, channel, template_code, recipient, subject,
                 status, error_message, sent_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING
            """, batch);
        log.debug("DEMO: Seeded {} notification logs.", batch.size());
    }

    // ── WhatsApp message logs ─────────────────────────────────────────────────

    private void seedWhatsAppLogs() {
        // {recipient, templateName, params, status}
        Object[][] logs = {
            {"+919876543210","fee_reminder",     "[\"August 2025\",\"2000\",\"10 Aug 2025\"]",  "SENT"},
            {"+919876543211","attendance_alert", "[\"Priya\",\"2025-10-15\"]",                   "SENT"},
            {"+919876543212","exam_reminder",    "[\"Mid-Term\",\"15 Sep 2025\"]",               "SENT"},
            {"+919876543213","result_ready",     "[\"Rohit\",\"Unit Test 1\",\"A+\"]",           "SENT"},
            {"+919876543214","holiday_notice",   "[\"Dussehra\",\"2 Oct 2025\"]",                "SENT"},
            {"+919876543215","fee_reminder",     "[\"September 2025\",\"2000\",\"10 Sep 2025\"]","FAILED"},
            {"+917905025730","welcome_parent",   "[\"Ananya\",\"Jawahar Navodaya Vidyalaya\"]",   "SENT"},
            {"+919876543217","pt_meeting",       "[\"5 Oct 2025\",\"10:00 AM\",\"Room 12\"]",   "SENT"},
            {"+919876543218","homework_alert",   "[\"Mathematics\",\"tomorrow\"]",               "SENT"},
            {"+917905025730","fee_receipt",      "[\"RCP-JNV-200001\",\"2000\",\"1 Aug 2025\"]","SENT"}
        };
        List<Object[]> batch = new ArrayList<>();
        for (int i = 0; i < logs.length; i++) {
            Object[] l = logs[i];
            boolean sent = "SENT".equals(l[3]);
            batch.add(new Object[]{
                uuid("wa-" + String.format("%04d", i + 1)),
                TENANT_ID, SCHOOL_ID,
                l[0], l[1], "en_IN", l[2], l[3],
                sent ? null : "WhatsApp Business API — rate limit exceeded",
                sent ? OffsetDateTime.now().minusHours(48L - i * 4) : null
            });
        }
        jdbc.batchUpdate("""
            INSERT INTO whatsapp_message_logs
                (id, tenant_id, school_id, recipient, template_name, language_code,
                 template_params, status, error_message, sent_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING
            """, batch);
        log.debug("DEMO: Seeded {} WhatsApp message logs.", batch.size());
    }

    // ── AI usage logs ─────────────────────────────────────────────────────────

    private void seedAiUsageLogs() {
        // {provider, model, promptKey, inputTokens, outputTokens, latencyMs}
        Object[][] logs = {
            {"ANTHROPIC","claude-sonnet-4-6","lesson_plan_generator",    1250, 890, 2340},
            {"ANTHROPIC","claude-sonnet-4-6","student_risk_analyzer",     980, 650, 1890},
            {"ANTHROPIC","claude-sonnet-4-6","report_card_generator",    1580,1200, 3120},
            {"OPENAI",   "gpt-4o-mini",      "attendance_insight",        750, 480, 1450},
            {"ANTHROPIC","claude-sonnet-4-6","teacher_performance",      1100, 820, 2100},
            {"ANTHROPIC","claude-sonnet-4-6","lesson_plan_generator",    1280, 910, 2280},
            {"OPENAI",   "gpt-4o-mini",      "homework_feedback",         620, 410, 1230},
            {"ANTHROPIC","claude-sonnet-4-6","classroom_summary",         890, 680, 1980},
            {"ANTHROPIC","claude-sonnet-4-6","student_risk_analyzer",     960, 720, 1820},
            {"OPENAI",   "gpt-4o-mini",      "fee_defaulter_alert",       540, 380, 1100},
            {"ANTHROPIC","claude-sonnet-4-6","report_card_generator",    1620,1180, 3050},
            {"ANTHROPIC","claude-sonnet-4-6","attendance_insight",        820, 590, 1760},
            {"OPENAI",   "gpt-4o-mini",      "lesson_plan_generator",     890, 640, 1640},
            {"ANTHROPIC","claude-sonnet-4-6","teacher_productivity",     1050, 780, 2010},
            {"ANTHROPIC","claude-sonnet-4-6","student_risk_analyzer",     940, 700, 1790}
        };
        List<Object[]> batch = new ArrayList<>();
        for (Object[] l : logs) {
            batch.add(new Object[]{
                TENANT_ID, ADMIN_USER_ID,
                l[0], l[1], l[2], l[3], l[4], l[5], true, null
            });
        }
        jdbc.batchUpdate("""
            INSERT INTO ai_usage_logs
                (tenant_id, user_id, provider, model, prompt_key,
                 input_tokens, output_tokens, latency_ms, success, error_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, batch);
        log.debug("DEMO: Seeded {} AI usage log entries.", batch.size());
    }

    // ── School public website ─────────────────────────────────────────────────

    private void seedWebsite() {
        UUID websiteId = uuid("website-jnv");

        // Website root (published)
        jdbc.update("""
            INSERT INTO websites (id, tenant_id, school_id, published)
            VALUES (?, ?, ?, true)
            ON CONFLICT ON CONSTRAINT uq_website_school DO NOTHING
            """, websiteId, TENANT_ID, SCHOOL_ID);

        // Pages
        UUID pgHome    = uuid("wp-home");
        UUID pgAbout   = uuid("wp-about");
        UUID pgAdmit   = uuid("wp-admissions");
        UUID pgContact = uuid("wp-contact");

        Object[][] pages = {
            {pgHome,    "Home",       "home",       "JNV Lucknow — Welcome",        "Official website of Jawahar Navodaya Vidyalaya Lucknow", 1},
            {pgAbout,   "About Us",   "about",      "About JNV Lucknow",             "Our history, vision, mission and values",                 2},
            {pgAdmit,   "Admissions", "admissions", "Admissions — JNV Lucknow",      "Eligibility, process and important dates for admissions",  3},
            {pgContact, "Contact",    "contact",    "Contact JNV Lucknow",           "Address, phone and email for JNV Lucknow",                 4},
        };
        for (Object[] p : pages) {
            jdbc.update("""
                INSERT INTO website_pages
                    (id, tenant_id, school_id, title, slug, seo_title, seo_description, published, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, true, ?)
                ON CONFLICT DO NOTHING
                """, p[0], TENANT_ID, SCHOOL_ID, p[1], p[2], p[3], p[4], p[5]);
        }

        // ── Home sections ────────────────────────────────────────────────────
        upsertSection(uuid("ws-home-hero"), pgHome, "HERO", 0,
            """
            {"heading":"Jawahar Navodaya Vidyalaya Lucknow",
             "subheading":"Excellence in Education Since 1986 · Free Residential Schooling for Rural Talent",
             "badge":"Govt. of India Residential School",
             "ctaText":"Explore Admissions",
             "ctaUrl":"/sites/jnv-lucknow-demo/admissions"}
            """);

        upsertSection(uuid("ws-home-stats"), pgHome, "STATS", 1,
            """
            {"stats":[
              {"value":"1050+","label":"Students Enrolled","icon":"👨‍🎓"},
              {"value":"42","label":"Faculty Members","icon":"👩‍🏫"},
              {"value":"Cls 6–12","label":"Classes Offered","icon":"📚"},
              {"value":"1986","label":"Year Established","icon":"🏫"}
            ]}
            """);

        upsertSection(uuid("ws-home-text"), pgHome, "TEXT", 2,
            """
            {"heading":"Why JNV Lucknow?",
             "body":"Jawahar Navodaya Vidyalaya Lucknow is a premier co-educational residential school run by Navodaya Vidyalaya Samiti under the Ministry of Education, Government of India. We provide free, quality education to meritorious students from rural areas, nurturing them into future leaders.",
             "features":[
               {"icon":"🎓","title":"Academic Excellence","desc":"Consistent 95%+ results in CBSE Board examinations with subject toppers every year."},
               {"icon":"⚽","title":"Sports & Fitness","desc":"Olympic-size play grounds, kabaddi, football, volleyball, athletics and NCC training."},
               {"icon":"🎨","title":"Arts & Culture","desc":"Annual cultural programmes, folk dance, music, painting and theatre workshops."},
               {"icon":"💻","title":"Technology Lab","desc":"State-of-the-art computer labs with broadband internet and STEM project facilities."},
               {"icon":"🌿","title":"Eco Campus","desc":"Green, pollution-free residential campus spread over 20 acres with a herbal garden."},
               {"icon":"🤝","title":"National Integration","desc":"Students from every state live together — a living model of national unity."}
             ]}
            """);

        // ── About sections ───────────────────────────────────────────────────
        upsertSection(uuid("ws-about-vision"), pgAbout, "TEXT", 0,
            """
            {"heading":"Our Vision & Mission",
             "body":"To nurture talent from rural India through quality residential education, fostering academic excellence, cultural values, and national integration.",
             "sections":[
               {"icon":"🎯","title":"Vision","body":"Empowering every rural child with world-class education and transforming them into responsible citizens of India."},
               {"icon":"📖","title":"Mission","body":"Provide free, high-quality residential education to meritorious students from Classes 6–12, promoting holistic development through academics, sports, arts and social service."},
               {"icon":"⚖️","title":"Values","body":"Integrity, discipline, inclusivity, respect for diversity, and commitment to academic and personal excellence."}
             ]}
            """);

        upsertSection(uuid("ws-about-principal"), pgAbout, "TEXT", 1,
            """
            {"heading":"Message from the Principal",
             "team":[
               {"name":"Dr. Ramesh Kumar Sharma","title":"Principal, JNV Lucknow","bio":"With over 25 years in the NVS system, Dr. Sharma leads JNV Lucknow with a focus on holistic education. Under his leadership, the school has consistently achieved 100% board results and won national-level sports and cultural competitions."}
             ]}
            """);

        upsertSection(uuid("ws-about-facts"), pgAbout, "TEXT", 2,
            """
            {"heading":"School at a Glance",
             "highlights":[
               "Established in 1986 under Navodaya Vidyalaya Samiti",
               "Affiliated to CBSE (Affiliation No. 2100037)",
               "Co-educational residential school for Classes 6–12",
               "Free education, boarding, lodging, uniform and textbooks",
               "100% scholarship — no fees for admitted students",
               "National Sports & Cultural competitions participation every year",
               "Dedicated Science, Math and Computer labs",
               "20-acre green campus in Lucknow"
             ]}
            """);

        // ── Admissions sections ──────────────────────────────────────────────
        upsertSection(uuid("ws-admit-info"), pgAdmit, "TEXT", 0,
            """
            {"heading":"Admission Process — JNVST",
             "body":"Admission to Class 6 is through the Jawahar Navodaya Vidyalaya Selection Test (JNVST), a single-stage objective test. Seats are reserved for SC/ST and differently-abled students as per Government norms.",
             "steps":[
               {"step":1,"title":"Check Eligibility","desc":"Candidate must be studying in Class 5 in a Govt./Govt.-aided school in Lucknow district, aged 9–13 years as on 1 May of the admission year."},
               {"step":2,"title":"Fill Application","desc":"Submit the prescribed application form through the school or online NVS portal. No application fee is charged."},
               {"step":3,"title":"Appear in JNVST","desc":"The selection test is held in November (Phase I) and January (Phase II) each year. The test covers Mental Ability, Arithmetic and Language."},
               {"step":4,"title":"Result & Merit List","desc":"Results are published on the NVS official website. Selected students must submit original documents for verification."},
               {"step":5,"title":"Admission & Joining","desc":"Selected students report with parents/guardians. All boarding, meals, uniforms and books are provided free by NVS from day one."}
             ]}
            """);

        upsertSection(uuid("ws-admit-eligibility"), pgAdmit, "TEXT", 1,
            """
            {"heading":"Key Eligibility Criteria",
             "highlights":[
               "Must be a resident of Lucknow district",
               "Studying in Class 5 in a Govt. or Govt.-aided school",
               "Age between 9 and 13 years as on 1 May",
               "Only one attempt allowed for JNVST",
               "Reservation: 75% rural area, 33% girls, SC/ST as per population ratio",
               "No re-admission once a student leaves the Vidyalaya"
             ]}
            """);

        // ── Contact section ──────────────────────────────────────────────────
        upsertSection(uuid("ws-contact-info"), pgContact, "CONTACT", 0,
            """
            {"address":"Sector 15, Indira Nagar, Lucknow, Uttar Pradesh - 226016",
             "phone":"+91 7905025730",
             "email":"uttamkumar3797@gmail.com"}
            """);

        // Nav items
        Object[][] navItems = {
            {"Home",       null,   pgHome,    0},
            {"About Us",   null,   pgAbout,   1},
            {"Admissions", null,   pgAdmit,   2},
            {"Contact",    null,   pgContact, 3},
        };
        for (Object[] n : navItems) {
            jdbc.update("""
                INSERT INTO website_nav_items (id, tenant_id, school_id, label, url, page_id, position)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT DO NOTHING
                """, uuid("wn-" + n[0]), TENANT_ID, SCHOOL_ID, n[0], n[1], n[2], n[3]);
        }

        log.debug("DEMO: Seeded JNV Lucknow public website with 4 pages.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Insert or update a website section so re-seeding always refreshes content. */
    private void upsertSection(UUID id, UUID pageId, String sectionType, int position, String contentJson) {
        jdbc.update("""
            INSERT INTO website_sections (id, tenant_id, page_id, section_type, position, content, visible)
            VALUES (?, ?, ?, ?, ?, ?::jsonb, true)
            ON CONFLICT (id) DO UPDATE
              SET content = EXCLUDED.content,
                  position = EXCLUDED.position,
                  section_type = EXCLUDED.section_type
            """, id, TENANT_ID, pageId, sectionType, position, contentJson.strip());
    }

    /**
     * Returns a UUID that is stable for a given tag within one seeder run.
     * Each seed run produces different UUIDs (no predictable enumeration),
     * but repeated calls with the same tag in the same run return the same UUID
     * so cross-method FK references resolve correctly.
     */
    private UUID uuid(String tag) {
        return uuidCache.computeIfAbsent(tag, k -> UUID.randomUUID());
    }

    /** Returns the last 20 working days (Mon-Fri) ending yesterday. */
    private static List<LocalDate> last20WorkingDays() {
        List<LocalDate> days = new ArrayList<>();
        LocalDate d = LocalDate.now().minusDays(1);
        while (days.size() < 20) {
            int dow = d.getDayOfWeek().getValue(); // 1=Mon … 7=Sun
            if (dow <= 5) days.add(d);
            d = d.minusDays(1);
        }
        return days;
    }

    // ── Inner types ───────────────────────────────────────────────────────────

    record SectionRef(UUID id, UUID classId, int gradeOrder) {}
}
