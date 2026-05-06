package com.cloudcampus.bootstrap;

import com.cloudcampus.academic.entity.SchoolClass;
import com.cloudcampus.academic.entity.Section;
import com.cloudcampus.academic.entity.Subject;
import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.cms.entity.AdmissionLead;
import com.cloudcampus.cms.entity.WebsiteConfig;
import com.cloudcampus.cms.entity.WebsiteGalleryItem;
import com.cloudcampus.cms.entity.WebsiteSection;
import com.cloudcampus.cms.repository.AdmissionLeadRepository;
import com.cloudcampus.cms.repository.WebsiteConfigRepository;
import com.cloudcampus.cms.repository.WebsiteGalleryRepository;
import com.cloudcampus.cms.repository.WebsiteSectionRepository;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.fees.entity.FeeAssignment;
import com.cloudcampus.fees.entity.FeePayment;
import com.cloudcampus.fees.entity.FeeStatus;
import com.cloudcampus.fees.repository.FeeAssignmentRepository;
import com.cloudcampus.fees.repository.FeePaymentRepository;
import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.repository.HomeworkAssignmentRepository;
import com.cloudcampus.parent.entity.ParentStudent;
import com.cloudcampus.parent.repository.ParentStudentRepository;
import com.cloudcampus.student.entity.Gender;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.teacher.entity.Teacher;
import com.cloudcampus.teacher.repository.TeacherRepository;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.repository.TenantRepository;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.tenant.service.TenantService;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableSlotRepository;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.entity.UserRole;
import com.cloudcampus.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.seed", name = "demo-enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final String TENANT_ID     = "sunrise-academy";
    private static final String TENANT_SCHEMA = "sunrise";
    private static final String TENANT_SLUG   = "sunrise-academy";
    private static final String SCHOOL_NAME   = "Sunrise Academy";

    private static final String DEFAULT_USER_PASSWORD = "Demo@2026!";

    private final TenantService              tenantService;
    private final TenantRepository           tenantRepository;
    private final PasswordEncoder            passwordEncoder;
    private final UserAccountRepository      userAccountRepository;
    private final TeacherRepository          teacherRepository;
    private final StudentRepository          studentRepository;
    private final ParentStudentRepository    parentStudentRepository;
    private final SchoolClassRepository      schoolClassRepository;
    private final SectionRepository          sectionRepository;
    private final SubjectRepository          subjectRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ExamRepository             examRepository;
    private final ExamResultRepository       examResultRepository;
    private final FeeAssignmentRepository    feeAssignmentRepository;
    private final FeePaymentRepository       feePaymentRepository;
    private final HomeworkAssignmentRepository homeworkAssignmentRepository;
    private final TimetableSlotRepository    timetableSlotRepository;
    private final WebsiteConfigRepository    websiteConfigRepository;
    private final WebsiteSectionRepository   websiteSectionRepository;
    private final WebsiteGalleryRepository   websiteGalleryRepository;
    private final AdmissionLeadRepository    admissionLeadRepository;
    private final TransactionTemplate        txTemplate;

    @Override
    public void run(ApplicationArguments args) {
        // Each call starts a fresh transaction so the connection's schema is
        // resolved from TenantContext at transaction-open time, not method-entry time.
        txTemplate.execute(status -> { ensureTenant(); return null; });

        TenantContext.setTenant(TENANT_SCHEMA);
        try {
            txTemplate.execute(status -> { seedSchool(); return null; });
        } finally {
            TenantContext.clear();
        }

        txTemplate.execute(status -> { seedPublicData(); return null; });
        log.info("Demo seed complete for tenant={}", TENANT_ID);
    }

    // ── Public-schema data (website, leads) ──────────────────────────────────

    private void seedPublicData() {
        seedWebsiteConfig();
        seedWebsiteSections();
        seedWebsiteGallery();
        seedAdmissionLeads();
    }

    // ── Tenant-schema data ────────────────────────────────────────────────────

    private void seedSchool() {
        // Idempotency guard — skip if already seeded
        if (userAccountRepository.findByUsername("priya.sharma").isPresent()) {
            log.info("Demo school data already seeded, skipping");
            return;
        }
        // Users
        UserAccount admin  = upsertUser("priya.sharma",      "Priya Sharma",      UserRole.SCHOOL_ADMIN, "priya@sunrise.edu",      "9000000001");

        UserAccount t1  = upsertUser("sunita.aggarwal",  "Sunita Aggarwal",  UserRole.TEACHER, "sunita@sunrise.edu",    "9000000101");
        UserAccount t2  = upsertUser("vikram.desai",     "Vikram Desai",     UserRole.TEACHER, "vikram@sunrise.edu",    "9000000102");
        UserAccount t3  = upsertUser("lakshmi.krishnan", "Lakshmi Krishnan", UserRole.TEACHER, "lakshmi@sunrise.edu",   "9000000103");
        UserAccount t4  = upsertUser("rahul.mehta",      "Rahul Mehta",      UserRole.TEACHER, "rahul@sunrise.edu",     "9000000104");
        UserAccount t5  = upsertUser("asha.nair",        "Asha Nair",        UserRole.TEACHER, "asha@sunrise.edu",      "9000000105");
        UserAccount t6  = upsertUser("deepak.gupta",     "Deepak Gupta",     UserRole.TEACHER, "deepak@sunrise.edu",    "9000000106");
        UserAccount t7  = upsertUser("meena.pillai",     "Meena Pillai",     UserRole.TEACHER, "meena@sunrise.edu",     "9000000107");
        UserAccount t8  = upsertUser("arjun.verma",      "Arjun Verma",      UserRole.TEACHER, "arjun@sunrise.edu",     "9000000108");
        UserAccount t9  = upsertUser("pooja.iyer",       "Pooja Iyer",       UserRole.TEACHER, "pooja@sunrise.edu",     "9000000109");
        UserAccount t10 = upsertUser("suresh.rao",       "Suresh Rao",       UserRole.TEACHER, "suresh@sunrise.edu",    "9000000110");

        // Students
        UserAccount s1u  = upsertUser("aarav.sharma1",   "Aarav Sharma",   UserRole.STUDENT, "aarav@sunrise.edu",    "9000000201");
        UserAccount s2u  = upsertUser("diya.patel2",     "Diya Patel",     UserRole.STUDENT, "diya@sunrise.edu",     "9000000202");
        UserAccount s3u  = upsertUser("kabir.singh3",    "Kabir Singh",    UserRole.STUDENT, "kabir@sunrise.edu",    "9000000203");
        UserAccount s4u  = upsertUser("ananya.roy4",     "Ananya Roy",     UserRole.STUDENT, "ananya@sunrise.edu",   "9000000204");
        UserAccount s5u  = upsertUser("rohan.kumar5",    "Rohan Kumar",    UserRole.STUDENT, "rohan@sunrise.edu",    "9000000205");
        UserAccount s6u  = upsertUser("priya.joshi6",    "Priya Joshi",    UserRole.STUDENT, "priyaj@sunrise.edu",   "9000000206");
        UserAccount s7u  = upsertUser("aryan.mehta7",    "Aryan Mehta",    UserRole.STUDENT, "aryan@sunrise.edu",    "9000000207");
        UserAccount s8u  = upsertUser("sneha.gupta8",    "Sneha Gupta",    UserRole.STUDENT, "sneha@sunrise.edu",    "9000000208");
        UserAccount s9u  = upsertUser("vikrant.nair9",   "Vikrant Nair",   UserRole.STUDENT, "vikrant@sunrise.edu",  "9000000209");
        UserAccount s10u = upsertUser("riya.iyer10",     "Riya Iyer",      UserRole.STUDENT, "riya@sunrise.edu",     "9000000210");
        UserAccount s11u = upsertUser("harsh.pandey11",  "Harsh Pandey",   UserRole.STUDENT, "harsh@sunrise.edu",    "9000000211");
        UserAccount s12u = upsertUser("pooja.mishra12",  "Pooja Mishra",   UserRole.STUDENT, "pooja.mishra@sunrise.edu", "9000000212");
        UserAccount s13u = upsertUser("aditya.das13",    "Aditya Das",     UserRole.STUDENT, "aditya@sunrise.edu",   "9000000213");
        UserAccount s14u = upsertUser("kavya.menon14",   "Kavya Menon",    UserRole.STUDENT, "kavya@sunrise.edu",    "9000000214");
        UserAccount s15u = upsertUser("siddharth.rao15", "Siddharth Rao",  UserRole.STUDENT, "siddharth@sunrise.edu","9000000215");

        // Parents
        UserAccount p1  = upsertUser("ramesh.sharma.p",  "Ramesh Sharma",  UserRole.PARENT, "ramesh.p@sunrise.edu",  "9000000301");
        UserAccount p2  = upsertUser("sujata.patel.p",   "Sujata Patel",   UserRole.PARENT, "sujata.p@sunrise.edu",  "9000000302");
        UserAccount p3  = upsertUser("mukesh.singh.p",   "Mukesh Singh",   UserRole.PARENT, "mukesh.p@sunrise.edu",  "9000000303");
        UserAccount p4  = upsertUser("geeta.roy.p",      "Geeta Roy",      UserRole.PARENT, "geeta.p@sunrise.edu",   "9000000304");
        UserAccount p5  = upsertUser("naveen.kumar.p",   "Naveen Kumar",   UserRole.PARENT, "naveen.p@sunrise.edu",  "9000000305");
        UserAccount p6  = upsertUser("anita.joshi.p",    "Anita Joshi",    UserRole.PARENT, "anita.p@sunrise.edu",   "9000000306");
        UserAccount p7  = upsertUser("rajesh.mehta.p",   "Rajesh Mehta",   UserRole.PARENT, "rajesh.p@sunrise.edu",  "9000000307");

        // Academic
        SchoolClass g1  = upsertClass("Grade 1",  "G01");
        SchoolClass g2  = upsertClass("Grade 2",  "G02");
        SchoolClass g3  = upsertClass("Grade 3",  "G03");
        SchoolClass g4  = upsertClass("Grade 4",  "G04");
        SchoolClass g5  = upsertClass("Grade 5",  "G05");
        SchoolClass g6  = upsertClass("Grade 6",  "G06");
        SchoolClass g7  = upsertClass("Grade 7",  "G07");
        SchoolClass g8  = upsertClass("Grade 8",  "G08");
        SchoolClass g9  = upsertClass("Grade 9",  "G09");
        SchoolClass g10 = upsertClass("Grade 10", "G10");

        Section g1a = upsertSection(g1, "A");  Section g1b = upsertSection(g1, "B");  Section g1c = upsertSection(g1, "C");
        Section g2a = upsertSection(g2, "A");  Section g2b = upsertSection(g2, "B");
        Section g3a = upsertSection(g3, "A");  Section g3b = upsertSection(g3, "B");  Section g3c = upsertSection(g3, "C");
        Section g4a = upsertSection(g4, "A");  Section g4b = upsertSection(g4, "B");
        Section g5a = upsertSection(g5, "A");  Section g5b = upsertSection(g5, "B");
        Section g6a = upsertSection(g6, "A");  Section g6b = upsertSection(g6, "B");
        Section g7a = upsertSection(g7, "A");
        Section g8a = upsertSection(g8, "A");  Section g8b = upsertSection(g8, "B");
        Section g9a = upsertSection(g9, "A");
        Section g10a = upsertSection(g10, "A");

        Subject math    = upsertSubject("Mathematics",       "MATH");
        Subject science = upsertSubject("Science",           "SCI");
        Subject english = upsertSubject("English",           "ENG");
        Subject hindi   = upsertSubject("Hindi",             "HIN");
        Subject history = upsertSubject("History",           "HIST");
        Subject geo     = upsertSubject("Geography",         "GEO");
        Subject physics = upsertSubject("Physics",           "PHY");
        Subject chem    = upsertSubject("Chemistry",         "CHEM");
        Subject bio     = upsertSubject("Biology",           "BIO");
        Subject cs      = upsertSubject("Computer Science",  "CS");
        Subject art     = upsertSubject("Art & Craft",       "ART");
        Subject pe      = upsertSubject("Physical Education","PE");

        // Teachers
        Teacher teacher1  = upsertTeacher("SUN-T01", "Sunita",    "Aggarwal",  "sunita@sunrise.edu",    "9000000101", LocalDate.now().minusYears(5),  t1);
        Teacher teacher2  = upsertTeacher("SUN-T02", "Vikram",    "Desai",     "vikram@sunrise.edu",    "9000000102", LocalDate.now().minusYears(4),  t2);
        Teacher teacher3  = upsertTeacher("SUN-T03", "Lakshmi",   "Krishnan",  "lakshmi@sunrise.edu",   "9000000103", LocalDate.now().minusYears(6),  t3);
        Teacher teacher4  = upsertTeacher("SUN-T04", "Rahul",     "Mehta",     "rahul@sunrise.edu",     "9000000104", LocalDate.now().minusYears(3),  t4);
        Teacher teacher5  = upsertTeacher("SUN-T05", "Asha",      "Nair",      "asha@sunrise.edu",      "9000000105", LocalDate.now().minusYears(7),  t5);
        Teacher teacher6  = upsertTeacher("SUN-T06", "Deepak",    "Gupta",     "deepak@sunrise.edu",    "9000000106", LocalDate.now().minusYears(2),  t6);
        Teacher teacher7  = upsertTeacher("SUN-T07", "Meena",     "Pillai",    "meena@sunrise.edu",     "9000000107", LocalDate.now().minusYears(8),  t7);
        Teacher teacher8  = upsertTeacher("SUN-T08", "Arjun",     "Verma",     "arjun@sunrise.edu",     "9000000108", LocalDate.now().minusYears(1),  t8);
        Teacher teacher9  = upsertTeacher("SUN-T09", "Pooja",     "Iyer",      "pooja@sunrise.edu",     "9000000109", LocalDate.now().minusYears(4),  t9);
        Teacher teacher10 = upsertTeacher("SUN-T10", "Suresh",    "Rao",       "suresh@sunrise.edu",    "9000000110", LocalDate.now().minusYears(10), t10);

        // Students
        Student st1  = upsertStudent("SUN-S001", "Aarav",      "Sharma",   LocalDate.of(2015, 6,  10), Gender.MALE,   "aarav@sunrise.edu",    "9000000201", s1u);
        Student st2  = upsertStudent("SUN-S002", "Diya",       "Patel",    LocalDate.of(2015, 11,  2), Gender.FEMALE, "diya@sunrise.edu",     "9000000202", s2u);
        Student st3  = upsertStudent("SUN-S003", "Kabir",      "Singh",    LocalDate.of(2014,  3, 22), Gender.MALE,   "kabir@sunrise.edu",    "9000000203", s3u);
        Student st4  = upsertStudent("SUN-S004", "Ananya",     "Roy",      LocalDate.of(2014,  7, 15), Gender.FEMALE, "ananya@sunrise.edu",   "9000000204", s4u);
        Student st5  = upsertStudent("SUN-S005", "Rohan",      "Kumar",    LocalDate.of(2013,  1, 30), Gender.MALE,   "rohan@sunrise.edu",    "9000000205", s5u);
        Student st6  = upsertStudent("SUN-S006", "Priya",      "Joshi",    LocalDate.of(2013,  9,  5), Gender.FEMALE, "priyaj@sunrise.edu",   "9000000206", s6u);
        Student st7  = upsertStudent("SUN-S007", "Aryan",      "Mehta",    LocalDate.of(2012,  4, 18), Gender.MALE,   "aryan@sunrise.edu",    "9000000207", s7u);
        Student st8  = upsertStudent("SUN-S008", "Sneha",      "Gupta",    LocalDate.of(2012,  8, 27), Gender.FEMALE, "sneha@sunrise.edu",    "9000000208", s8u);
        Student st9  = upsertStudent("SUN-S009", "Vikrant",    "Nair",     LocalDate.of(2011,  2, 14), Gender.MALE,   "vikrant@sunrise.edu",  "9000000209", s9u);
        Student st10 = upsertStudent("SUN-S010", "Riya",       "Iyer",     LocalDate.of(2011,  5, 20), Gender.FEMALE, "riya@sunrise.edu",     "9000000210", s10u);
        Student st11 = upsertStudent("SUN-S011", "Harsh",      "Pandey",   LocalDate.of(2010,  6,  3), Gender.MALE,   "harsh@sunrise.edu",    "9000000211", s11u);
        Student st12 = upsertStudent("SUN-S012", "Pooja",      "Mishra",   LocalDate.of(2010, 10, 11), Gender.FEMALE, "pooja.mishra@sunrise.edu", "9000000212", s12u);
        Student st13 = upsertStudent("SUN-S013", "Aditya",     "Das",      LocalDate.of(2009,  3, 25), Gender.MALE,   "aditya@sunrise.edu",   "9000000213", s13u);
        Student st14 = upsertStudent("SUN-S014", "Kavya",      "Menon",    LocalDate.of(2009,  8,  8), Gender.FEMALE, "kavya@sunrise.edu",    "9000000214", s14u);
        Student st15 = upsertStudent("SUN-S015", "Siddharth",  "Rao",      LocalDate.of(2008, 12, 17), Gender.MALE,   "siddharth@sunrise.edu","9000000215", s15u);

        // Parent ↔ Student links
        upsertParentLink(p1, st1);
        upsertParentLink(p2, st2);
        upsertParentLink(p3, st3);
        upsertParentLink(p3, st4);
        upsertParentLink(p4, st5);
        upsertParentLink(p5, st6);
        upsertParentLink(p5, st7);
        upsertParentLink(p6, st8);
        upsertParentLink(p6, st9);
        upsertParentLink(p7, st10);

        UUID adminId    = admin.getId();
        UUID teacher1Id  = teacher1.getId();
        UUID teacher2Id  = teacher2.getId();
        UUID teacher3Id  = teacher3.getId();
        UUID teacher4Id  = teacher4.getId();
        UUID teacher5Id  = teacher5.getId();
        UUID teacher6Id  = teacher6.getId();
        UUID teacher7Id  = teacher7.getId();
        UUID teacher8Id  = teacher8.getId();
        UUID teacher9Id  = teacher9.getId();
        UUID teacher10Id = teacher10.getId();

        // Timetable — Grade 1 Section A (5 days × 6 periods)
        seedTimetable(g1, g1a, math,    teacher1Id, (short)1, "07:30", "08:30", "Mathematics");
        seedTimetable(g1, g1a, english, teacher3Id, (short)1, "08:30", "09:30", "English");
        seedTimetable(g1, g1a, hindi,   teacher5Id, (short)1, "09:45", "10:45", "Hindi");
        seedTimetable(g1, g1a, science, teacher2Id, (short)1, "10:45", "11:45", "Science");
        seedTimetable(g1, g1a, art,     teacher7Id, (short)1, "12:30", "13:30", "Art & Craft");
        seedTimetable(g1, g1a, pe,      teacher8Id, (short)1, "13:30", "14:30", "PE");

        seedTimetable(g1, g1a, english, teacher3Id, (short)2, "07:30", "08:30", "English");
        seedTimetable(g1, g1a, math,    teacher1Id, (short)2, "08:30", "09:30", "Mathematics");
        seedTimetable(g1, g1a, science, teacher2Id, (short)2, "09:45", "10:45", "Science");
        seedTimetable(g1, g1a, hindi,   teacher5Id, (short)2, "10:45", "11:45", "Hindi");
        seedTimetable(g1, g1a, art,     teacher7Id, (short)2, "12:30", "13:30", "Art & Craft");
        seedTimetable(g1, g1a, math,    teacher1Id, (short)3, "07:30", "08:30", "Mathematics");
        seedTimetable(g1, g1a, science, teacher2Id, (short)3, "08:30", "09:30", "Science");
        seedTimetable(g1, g1a, english, teacher3Id, (short)3, "09:45", "10:45", "English");
        seedTimetable(g1, g1a, math,    teacher1Id, (short)4, "07:30", "08:30", "Mathematics");
        seedTimetable(g1, g1a, hindi,   teacher5Id, (short)4, "08:30", "09:30", "Hindi");
        seedTimetable(g1, g1a, science, teacher2Id, (short)4, "09:45", "10:45", "Science");
        seedTimetable(g1, g1a, english, teacher3Id, (short)5, "07:30", "08:30", "English");
        seedTimetable(g1, g1a, math,    teacher1Id, (short)5, "08:30", "09:30", "Mathematics");
        seedTimetable(g1, g1a, pe,      teacher8Id, (short)5, "09:45", "10:45", "PE");

        // Timetable — Grade 5 Section A
        seedTimetable(g5, g5a, math,    teacher1Id, (short)1, "07:30", "08:30", "Mathematics");
        seedTimetable(g5, g5a, science, teacher2Id, (short)1, "08:30", "09:30", "Science");
        seedTimetable(g5, g5a, english, teacher3Id, (short)1, "09:45", "10:45", "English");
        seedTimetable(g5, g5a, history, teacher4Id, (short)1, "10:45", "11:45", "History");
        seedTimetable(g5, g5a, geo,     teacher5Id, (short)2, "07:30", "08:30", "Geography");
        seedTimetable(g5, g5a, math,    teacher1Id, (short)2, "08:30", "09:30", "Mathematics");
        seedTimetable(g5, g5a, hindi,   teacher9Id, (short)2, "09:45", "10:45", "Hindi");
        seedTimetable(g5, g5a, cs,      teacher6Id, (short)3, "07:30", "08:30", "Computer Science");
        seedTimetable(g5, g5a, math,    teacher1Id, (short)3, "08:30", "09:30", "Mathematics");
        seedTimetable(g5, g5a, science, teacher2Id, (short)3, "09:45", "10:45", "Science");
        seedTimetable(g5, g5a, english, teacher3Id, (short)4, "07:30", "08:30", "English");
        seedTimetable(g5, g5a, history, teacher4Id, (short)4, "08:30", "09:30", "History");
        seedTimetable(g5, g5a, pe,      teacher8Id, (short)4, "09:45", "10:45", "PE");
        seedTimetable(g5, g5a, math,    teacher1Id, (short)5, "07:30", "08:30", "Mathematics");
        seedTimetable(g5, g5a, geo,     teacher5Id, (short)5, "08:30", "09:30", "Geography");
        seedTimetable(g5, g5a, cs,      teacher6Id, (short)5, "09:45", "10:45", "Computer Science");

        // Timetable — Grade 10 Section A
        seedTimetable(g10, g10a, math,    teacher1Id,  (short)1, "07:30", "08:30", "Mathematics");
        seedTimetable(g10, g10a, physics, teacher10Id, (short)1, "08:30", "09:30", "Physics");
        seedTimetable(g10, g10a, chem,    teacher4Id,  (short)1, "09:45", "10:45", "Chemistry");
        seedTimetable(g10, g10a, bio,     teacher2Id,  (short)1, "10:45", "11:45", "Biology");
        seedTimetable(g10, g10a, english, teacher3Id,  (short)2, "07:30", "08:30", "English");
        seedTimetable(g10, g10a, math,    teacher1Id,  (short)2, "08:30", "09:30", "Mathematics");
        seedTimetable(g10, g10a, cs,      teacher6Id,  (short)2, "09:45", "10:45", "Computer Science");
        seedTimetable(g10, g10a, physics, teacher10Id, (short)3, "07:30", "08:30", "Physics");
        seedTimetable(g10, g10a, chem,    teacher4Id,  (short)3, "08:30", "09:30", "Chemistry");
        seedTimetable(g10, g10a, math,    teacher1Id,  (short)3, "09:45", "10:45", "Mathematics");
        seedTimetable(g10, g10a, bio,     teacher2Id,  (short)4, "07:30", "08:30", "Biology");
        seedTimetable(g10, g10a, english, teacher3Id,  (short)4, "08:30", "09:30", "English");
        seedTimetable(g10, g10a, cs,      teacher6Id,  (short)5, "07:30", "08:30", "Computer Science");
        seedTimetable(g10, g10a, physics, teacher10Id, (short)5, "08:30", "09:30", "Physics");
        seedTimetable(g10, g10a, pe,      teacher8Id,  (short)5, "09:45", "10:45", "PE");

        // Exams
        Exam e1  = upsertExam("Unit Test 1 - Mathematics",  LocalDate.now().minusDays(60), g1,  g1a,  math,    teacher1Id,  100);
        Exam e2  = upsertExam("Unit Test 1 - English",      LocalDate.now().minusDays(58), g1,  g1a,  english, teacher3Id,  100);
        Exam e3  = upsertExam("Mid-Term - Mathematics",     LocalDate.now().minusDays(45), g3,  g3a,  math,    teacher1Id,  100);
        Exam e4  = upsertExam("Mid-Term - Science",         LocalDate.now().minusDays(44), g3,  g3a,  science, teacher2Id,  100);
        Exam e5  = upsertExam("Mid-Term - English",         LocalDate.now().minusDays(43), g3,  g3a,  english, teacher3Id,  100);
        Exam e6  = upsertExam("Final Exam - Mathematics",   LocalDate.now().minusDays(15), g5,  g5a,  math,    teacher1Id,  100);
        Exam e7  = upsertExam("Final Exam - Science",       LocalDate.now().minusDays(14), g5,  g5a,  science, teacher2Id,  100);
        Exam e8  = upsertExam("Final Exam - History",       LocalDate.now().minusDays(13), g5,  g5a,  history, teacher4Id,  100);
        Exam e9  = upsertExam("Board Mock - Physics",       LocalDate.now().minusDays(30), g10, g10a, physics, teacher10Id, 100);
        Exam e10 = upsertExam("Board Mock - Chemistry",     LocalDate.now().minusDays(29), g10, g10a, chem,    teacher4Id,  100);
        Exam e11 = upsertExam("Board Mock - Mathematics",   LocalDate.now().minusDays(28), g10, g10a, math,    teacher1Id,  100);
        Exam e12 = upsertExam("Board Mock - Biology",       LocalDate.now().minusDays(27), g10, g10a, bio,     teacher2Id,  100);
        Exam e13 = upsertExam("Unit Test 2 - Mathematics",  LocalDate.now().minusDays(20), g1,  g1b,  math,    teacher1Id,  50);
        Exam e14 = upsertExam("Unit Test 2 - Hindi",        LocalDate.now().minusDays(19), g3,  g3b,  hindi,   teacher5Id,  50);

        // Exam Results — students 1-5 for Grade 1/3/5 exams
        upsertExamResult(e1, st1, 85, "B+", "Good effort", true);
        upsertExamResult(e1, st2, 92, "A",  "Excellent",   true);
        upsertExamResult(e2, st1, 78, "B",  "Needs improvement in grammar", true);
        upsertExamResult(e2, st2, 88, "A-", "Very good",   true);
        upsertExamResult(e3, st3, 74, "B-", "Satisfactory",true);
        upsertExamResult(e3, st4, 90, "A",  "Outstanding", true);
        upsertExamResult(e4, st3, 68, "C+", "Average",     true);
        upsertExamResult(e4, st4, 95, "A+", "Brilliant",   true);
        upsertExamResult(e5, st3, 80, "B",  "Good",        true);
        upsertExamResult(e5, st4, 72, "B-", "Keep trying", true);
        upsertExamResult(e6, st5, 88, "A-", "Well done",   true);
        upsertExamResult(e6, st6, 65, "C",  "Need more practice", true);
        upsertExamResult(e7, st5, 91, "A",  "Excellent",   true);
        upsertExamResult(e7, st6, 70, "B-", "Good attempt",true);
        upsertExamResult(e8, st5, 76, "B",  "Good",        true);
        upsertExamResult(e8, st6, 82, "B+", "Very good",   true);
        upsertExamResult(e9,  st13, 78, "B",  "Good",        true);
        upsertExamResult(e9,  st14, 84, "B+", "Very good",   true);
        upsertExamResult(e9,  st15, 91, "A",  "Excellent",   true);
        upsertExamResult(e10, st13, 72, "B-", "Satisfactory",true);
        upsertExamResult(e10, st14, 88, "A-", "Outstanding", true);
        upsertExamResult(e10, st15, 95, "A+", "Perfect",     true);
        upsertExamResult(e11, st13, 80, "B",  "Good",        true);
        upsertExamResult(e11, st14, 76, "B",  "Keep it up",  true);
        upsertExamResult(e11, st15, 98, "A+", "Brilliant",   true);
        upsertExamResult(e12, st13, 69, "C+", "Average",     true);
        upsertExamResult(e12, st14, 92, "A",  "Excellent",   true);
        upsertExamResult(e12, st15, 87, "A-", "Very good",   true);
        upsertExamResult(e13, st1, 44, "A",  "Well done", true);
        upsertExamResult(e14, st3, 38, "B+", "Good",      true);

        // Attendance — 30 school days for the first 10 students
        UUID schoolAdminId = admin.getId();
        seedAttendance(st1,  g1,  g1a,  schoolAdminId);
        seedAttendance(st2,  g1,  g1a,  schoolAdminId);
        seedAttendance(st3,  g3,  g3a,  schoolAdminId);
        seedAttendance(st4,  g3,  g3a,  schoolAdminId);
        seedAttendance(st5,  g5,  g5a,  schoolAdminId);
        seedAttendance(st6,  g5,  g5a,  schoolAdminId);
        seedAttendance(st7,  g7,  g7a,  schoolAdminId);
        seedAttendance(st8,  g7,  g7a,  schoolAdminId);
        seedAttendance(st9,  g9,  g9a,  schoolAdminId);
        seedAttendance(st10, g9,  g9a,  schoolAdminId);
        seedAttendance(st11, g10, g10a, schoolAdminId);
        seedAttendance(st12, g10, g10a, schoolAdminId);
        seedAttendance(st13, g10, g10a, schoolAdminId);
        seedAttendance(st14, g10, g10a, schoolAdminId);
        seedAttendance(st15, g10, g10a, schoolAdminId);

        // Fees
        seedStudentFees(st1,  adminId, "Term 1 Tuition Fee", 15000, LocalDate.now().minusDays(90), FeeStatus.PAID,          15000, "BANK_TRANSFER", "RCP-001");
        seedStudentFees(st1,  adminId, "Activity Fee",        2500, LocalDate.now().minusDays(60), FeeStatus.PAID,           2500, "CASH",          null);
        seedStudentFees(st1,  adminId, "Term 2 Tuition Fee", 15000, LocalDate.now().plusDays(30),  FeeStatus.PENDING,           0,  null,             null);
        seedStudentFees(st2,  adminId, "Term 1 Tuition Fee", 15000, LocalDate.now().minusDays(90), FeeStatus.PAID,          15000, "CASH",           null);
        seedStudentFees(st2,  adminId, "Exam Fee",            1500, LocalDate.now().minusDays(30), FeeStatus.PAID,           1500, "BANK_TRANSFER", "RCP-002");
        seedStudentFees(st2,  adminId, "Term 2 Tuition Fee", 15000, LocalDate.now().plusDays(30),  FeeStatus.PENDING,           0,  null,             null);
        seedStudentFees(st3,  adminId, "Term 1 Tuition Fee", 18000, LocalDate.now().minusDays(90), FeeStatus.PARTIALLY_PAID, 9000, "CASH",           null);
        seedStudentFees(st3,  adminId, "Library Fee",          500, LocalDate.now().minusDays(60), FeeStatus.PAID,            500, "CASH",           null);
        seedStudentFees(st4,  adminId, "Term 1 Tuition Fee", 18000, LocalDate.now().minusDays(90), FeeStatus.PAID,          18000, "CHEQUE",        "CHQ-301");
        seedStudentFees(st4,  adminId, "Sports Fee",          1000, LocalDate.now().minusDays(45), FeeStatus.PAID,           1000, "CASH",           null);
        seedStudentFees(st5,  adminId, "Term 1 Tuition Fee", 20000, LocalDate.now().minusDays(90), FeeStatus.PAID,          20000, "BANK_TRANSFER", "RCP-003");
        seedStudentFees(st5,  adminId, "Term 2 Tuition Fee", 20000, LocalDate.now().plusDays(20),  FeeStatus.PENDING,           0,  null,             null);
        seedStudentFees(st5,  adminId, "Exam Fee",            2000, LocalDate.now().minusDays(30), FeeStatus.PAID,           2000, "CASH",           null);
        seedStudentFees(st6,  adminId, "Term 1 Tuition Fee", 20000, LocalDate.now().minusDays(90), FeeStatus.PARTIALLY_PAID,10000, "CASH",           null);
        seedStudentFees(st7,  adminId, "Term 1 Tuition Fee", 22000, LocalDate.now().minusDays(90), FeeStatus.PAID,          22000, "BANK_TRANSFER", "RCP-004");
        seedStudentFees(st7,  adminId, "Lab Fee",             1500, LocalDate.now().minusDays(30), FeeStatus.PAID,           1500, "CASH",           null);
        seedStudentFees(st8,  adminId, "Term 1 Tuition Fee", 22000, LocalDate.now().minusDays(90), FeeStatus.PAID,          22000, "CHEQUE",        "CHQ-302");
        seedStudentFees(st9,  adminId, "Term 1 Tuition Fee", 25000, LocalDate.now().minusDays(90), FeeStatus.PENDING,           0,  null,             null);
        seedStudentFees(st10, adminId, "Term 1 Tuition Fee", 25000, LocalDate.now().minusDays(90), FeeStatus.PAID,          25000, "BANK_TRANSFER", "RCP-005");
        seedStudentFees(st11, adminId, "Term 1 Tuition Fee", 28000, LocalDate.now().minusDays(90), FeeStatus.PAID,          28000, "BANK_TRANSFER", "RCP-006");
        seedStudentFees(st12, adminId, "Term 1 Tuition Fee", 28000, LocalDate.now().minusDays(90), FeeStatus.PARTIALLY_PAID,14000, "CASH",           null);
        seedStudentFees(st13, adminId, "Term 1 Tuition Fee", 28000, LocalDate.now().minusDays(90), FeeStatus.PAID,          28000, "CHEQUE",        "CHQ-303");
        seedStudentFees(st14, adminId, "Term 1 Tuition Fee", 28000, LocalDate.now().minusDays(90), FeeStatus.PAID,          28000, "BANK_TRANSFER", "RCP-007");
        seedStudentFees(st15, adminId, "Term 1 Tuition Fee", 28000, LocalDate.now().minusDays(90), FeeStatus.PAID,          28000, "BANK_TRANSFER", "RCP-008");
        seedStudentFees(st15, adminId, "Board Exam Fee",      3000, LocalDate.now().minusDays(20), FeeStatus.PAID,           3000, "BANK_TRANSFER", "RCP-009");

        // Homework
        seedHomework("Chapter 2 – Place Value Practice",     "Complete exercises 2.1–2.5 from the textbook.",   g1,  g1a,  teacher1Id, LocalDate.now().plusDays(3));
        seedHomework("Grammar Exercise – Tenses",            "Fill in the blanks with correct verb forms.",      g1,  g1a,  teacher3Id, LocalDate.now().plusDays(4));
        seedHomework("Draw Animals Using Shapes",            "Draw 5 animals using basic geometric shapes.",     g1,  g1b,  teacher7Id, LocalDate.now().plusDays(2));
        seedHomework("Fractions Worksheet",                  "Solve 20 fraction problems from worksheet.",       g3,  g3a,  teacher1Id, LocalDate.now().plusDays(3));
        seedHomework("Plant Cell Diagram",                   "Draw and label a plant cell with 10 parts.",       g3,  g3a,  teacher2Id, LocalDate.now().plusDays(5));
        seedHomework("Essay – My Favourite Season",          "Write a 200-word essay on your favourite season.", g3,  g3a,  teacher3Id, LocalDate.now().plusDays(4));
        seedHomework("Hindi Paragraph Writing",              "Write 5 sentences about your family in Hindi.",    g3,  g3b,  teacher5Id, LocalDate.now().plusDays(2));
        seedHomework("Algebraic Expressions Practice",       "Simplify expressions – problems 1–30.",            g5,  g5a,  teacher1Id, LocalDate.now().plusDays(3));
        seedHomework("Water Cycle Project",                  "Make a poster showing the water cycle steps.",     g5,  g5a,  teacher2Id, LocalDate.now().plusDays(7));
        seedHomework("Medieval India – Summary",             "Write a 300-word summary of Chapter 4.",           g5,  g5a,  teacher4Id, LocalDate.now().plusDays(4));
        seedHomework("Python Turtle Program",                "Write a program to draw a star using turtle.",     g5,  g5b,  teacher6Id, LocalDate.now().plusDays(5));
        seedHomework("Optics Problems Set",                  "Solve numerical problems 1–15 on reflection.",     g10, g10a, teacher10Id,LocalDate.now().plusDays(3));
        seedHomework("Organic Chemistry Reactions",          "Balance 10 organic reaction equations.",           g10, g10a, teacher4Id, LocalDate.now().plusDays(4));
        seedHomework("Trigonometry – Prove 15 Identities",  "Prove identities from exercise 8.3.",              g10, g10a, teacher1Id, LocalDate.now().plusDays(5));
        seedHomework("Database Design Assignment",           "Design an ER diagram for a library system.",       g10, g10a, teacher6Id, LocalDate.now().plusDays(6));
        seedHomework("Photorespiration Essay",               "Write 400 words on photorespiration.",             g10, g10a, teacher2Id, LocalDate.now().plusDays(3));

        log.info("School seed complete: classes=10, sections=18, subjects=12, teachers=10, students=15, parents=7");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void ensureTenant() {
        if (tenantRepository.findByTenantId(TENANT_ID).isPresent()) {
            return;
        }
        tenantService.createTenant(new TenantCreateRequest(
                TENANT_ID, TENANT_SLUG, SCHOOL_NAME, TENANT_SCHEMA,
                null, "#2563EB",
                "Demo School Admin", "ananya.principal",
                "ananya.principal@cloudcampus.demo", "9000000000", DEFAULT_USER_PASSWORD
        ));
        log.info("Demo tenant created: tenantId={}", TENANT_ID);
    }

    private void seedAttendance(Student student, SchoolClass schoolClass, Section section, UUID markedBy) {
        LocalDate today = LocalDate.now();
        AttendanceStatus[] cycle = {
            AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT, AttendanceStatus.LATE,    AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,  AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT
        };
        int dayOffset = 0;
        int recorded  = 0;
        while (recorded < 30) {
            LocalDate date = today.minusDays(dayOffset + 1);
            dayOffset++;
            int dow = date.getDayOfWeek().getValue();
            if (dow == 6 || dow == 7) continue; // skip weekends
            if (attendanceRecordRepository.existsByStudentIdAndAttendanceDate(student.getId(), date)) {
                recorded++;
                continue;
            }
            AttendanceRecord rec = new AttendanceRecord();
            rec.setStudentId(student.getId());
            rec.setClassId(schoolClass.getId());
            rec.setSectionId(section.getId());
            rec.setAttendanceDate(date);
            rec.setStatus(cycle[recorded % cycle.length]);
            rec.setMarkedByUserId(markedBy);
            attendanceRecordRepository.save(rec);
            recorded++;
        }
    }

    private Exam upsertExam(String title, LocalDate date, SchoolClass cls, Section section, Subject subject, UUID markedBy, int maxMarks) {
        if (examRepository.existsByTitleAndExamDateAndClassIdAndSectionIdAndSubjectId(
                title, date, cls.getId(), section.getId(), subject.getId())) {
            return examRepository.findAllByClassId(cls.getId()).stream()
                    .filter(e -> e.getTitle().equals(title) && e.getExamDate().equals(date))
                    .findFirst().orElseThrow();
        }
        Exam exam = new Exam();
        exam.setTitle(title);
        exam.setExamDate(date);
        exam.setClassId(cls.getId());
        exam.setSectionId(section.getId());
        exam.setSubjectId(subject.getId());
        exam.setMaxMarks(BigDecimal.valueOf(maxMarks));
        exam.setActive(true);
        return examRepository.save(exam);
    }

    private void upsertExamResult(Exam exam, Student student, int marks, String grade, String remarks, boolean published) {
        if (exam == null || student == null) return;
        if (examResultRepository.existsByExamIdAndStudentId(exam.getId(), student.getId())) return;
        ExamResult result = new ExamResult();
        result.setExamId(exam.getId());
        result.setStudentId(student.getId());
        result.setMarksObtained(BigDecimal.valueOf(marks));
        result.setGrade(grade);
        result.setRemarks(remarks);
        result.setPublished(published);
        examResultRepository.save(result);
    }

    private void seedStudentFees(Student student, UUID receivedBy, String title, int amount,
                                 LocalDate dueDate, FeeStatus status, int paidAmount,
                                 String paymentMethod, String referenceNo) {
        List<FeeAssignment> existing = feeAssignmentRepository.findAllByStudentId(student.getId());
        boolean alreadyExists = existing.stream().anyMatch(f -> f.getFeeTitle().equals(title) && f.getDueDate().equals(dueDate));
        if (alreadyExists) return;

        FeeAssignment fa = new FeeAssignment();
        fa.setStudentId(student.getId());
        fa.setFeeTitle(title);
        fa.setAmount(BigDecimal.valueOf(amount));
        fa.setDueDate(dueDate);
        fa.setStatus(status);
        fa = feeAssignmentRepository.save(fa);

        if (paidAmount > 0 && paymentMethod != null) {
            FeePayment fp = new FeePayment();
            fp.setFeeAssignment(fa);
            fp.setAmountPaid(BigDecimal.valueOf(paidAmount));
            fp.setPaymentDate(dueDate.minusDays(5));
            fp.setPaymentMethod(paymentMethod);
            fp.setReferenceNo(referenceNo);
            fp.setReceivedByUserId(receivedBy);
            feePaymentRepository.save(fp);
        }
    }

    private void seedHomework(String title, String instructions, SchoolClass cls, Section section, UUID assignedBy, LocalDate dueDate) {
        List<HomeworkAssignment> existing = homeworkAssignmentRepository.findByClassIdOrderByCreatedAtDesc(cls.getId());
        boolean alreadyExists = existing.stream().anyMatch(h -> h.getTitle().equals(title));
        if (alreadyExists) return;
        HomeworkAssignment hw = new HomeworkAssignment();
        hw.setTitle(title);
        hw.setInstructions(instructions);
        hw.setClassId(cls.getId());
        hw.setSectionId(section.getId());
        hw.setAssignedByUserId(assignedBy);
        hw.setDueDate(dueDate);
        homeworkAssignmentRepository.save(hw);
    }

    private void seedTimetable(SchoolClass cls, Section section, Subject subject, UUID teacherId,
                               short day, String start, String end, String label) {
        List<TimetableSlot> existing = timetableSlotRepository
                .findByClassIdAndSectionIdOrderByDayOfWeekAscStartTimeAsc(cls.getId(), section.getId());
        LocalTime startTime = LocalTime.parse(start);
        LocalTime endTime   = LocalTime.parse(end);
        boolean alreadyExists = existing.stream().anyMatch(s ->
                s.getDayOfWeek() == day && s.getStartTime().equals(startTime)
                && s.getSubjectId().equals(subject.getId()));
        if (alreadyExists) return;
        TimetableSlot slot = new TimetableSlot();
        slot.setClassId(cls.getId());
        slot.setSectionId(section.getId());
        slot.setSubjectId(subject.getId());
        slot.setTeacherId(teacherId);
        slot.setDayOfWeek(day);
        slot.setStartTime(startTime);
        slot.setEndTime(endTime);
        slot.setLabel(label);
        timetableSlotRepository.save(slot);
    }

    // ── CMS / Public-schema ───────────────────────────────────────────────────

    private void seedWebsiteConfig() {
        if (websiteConfigRepository.findByTenantId(TENANT_ID).isPresent()) return;
        WebsiteConfig config = new WebsiteConfig();
        config.setTenantId(TENANT_ID);
        config.setSchoolTagline("Enlightening Minds, Building Futures");
        config.setSchoolEmail("info@sunriseacademy.edu.in");
        config.setSchoolPhone("+91 98765 43210");
        config.setSchoolAddress("12, Knowledge Park, Sector 18");
        config.setSchoolCity("Noida");
        config.setSchoolState("Uttar Pradesh");
        config.setSchoolCountry("India");
        config.setSchoolPincode("201301");
        config.setHeroImageUrl("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600");
        config.setAboutText("Sunrise Academy was established in 1995 with a vision to provide holistic education blending academics, sports, and life skills. Our 10-acre campus serves over 2,000 students from Grade 1 to Grade 12 under the CBSE curriculum.");
        config.setVisionText("To be a centre of excellence that nurtures compassionate, creative, and intellectually curious global citizens.");
        config.setMissionText("We deliver rigorous academics, inclusive co-curricular programmes, and values-based education to empower every student to achieve their highest potential.");
        config.setFacebookUrl("https://facebook.com/sunriseacademy");
        config.setTwitterUrl("https://twitter.com/sunriseacademy");
        config.setInstagramUrl("https://instagram.com/sunriseacademy");
        config.setYoutubeUrl("https://youtube.com/sunriseacademy");
        config.setAdmissionsOpen(true);
        config.setAdmissionInfo("Admissions open for the 2026-27 academic year for Grade 1 to Grade 9. Apply online or visit our campus.");
        config.setThemeColor("#2563EB");
        websiteConfigRepository.save(config);
    }

    private void seedWebsiteSections() {
        seedSection("hero", "Welcome to Sunrise Academy",
                "A CBSE school committed to excellence in education since 1995.",
                Map.of("cta_text", "Apply Now", "cta_link", "/admissions"), 0);
        seedSection("about", "About Us",
                "Our story, values, and commitment to student success.",
                Map.of("founded", "1995", "affiliation", "CBSE", "students", "2000+", "staff", "120+"), 1);
        seedSection("features", "Why Choose Sunrise?",
                "World-class facilities and a nurturing learning environment.",
                Map.of("items", List.of(
                        Map.of("icon", "🏫", "title", "Modern Classrooms",    "desc", "Smart boards and digital learning tools in every classroom."),
                        Map.of("icon", "⚽", "title", "Sports Complex",        "desc", "Olympic-sized pool, cricket ground, and indoor sports hall."),
                        Map.of("icon", "🔬", "title", "Science Labs",          "desc", "Fully equipped Physics, Chemistry, and Biology labs."),
                        Map.of("icon", "💻", "title", "Computer Labs",         "desc", "High-speed internet and latest hardware for 200+ students."),
                        Map.of("icon", "📚", "title", "Library",               "desc", "40,000+ books, journals, and digital resources."),
                        Map.of("icon", "🎨", "title", "Arts & Music Centre",   "desc", "Dedicated studios for visual arts, music, and drama.")
                )), 2);
        seedSection("faculty", "Our Faculty",
                "Experienced educators dedicated to student growth.",
                Map.of("average_experience", "12 years", "phd_holders", "8", "national_award_winners", "3"), 3);
        seedSection("achievements", "Our Achievements",
                "Proud of our students and their milestones.",
                Map.of("board_toppers", "5 state rank holders in last 3 years",
                       "sports_medals", "42 national-level medals since 2020",
                       "olympiad_winners", "18 international olympiad qualifiers"), 4);
        seedSection("contact", "Get in Touch",
                "We'd love to hear from you.",
                Map.of("office_hours", "Mon–Sat 8:00 AM – 4:00 PM",
                       "admissions_desk", "+91 98765 43211"), 5);
    }

    private void seedSection(String key, String title, String subtitle, Map<String, Object> body, int order) {
        if (websiteSectionRepository.findByTenantIdAndSectionKey(TENANT_ID, key).isPresent()) return;
        WebsiteSection section = new WebsiteSection();
        section.setTenantId(TENANT_ID);
        section.setSectionKey(key);
        section.setTitle(title);
        section.setSubtitle(subtitle);
        section.setBodyJson(body);
        section.setDisplayOrder(order);
        section.setVisible(true);
        websiteSectionRepository.save(section);
    }

    private void seedWebsiteGallery() {
        if (!websiteGalleryRepository.findByTenantIdOrderByDisplayOrderAsc(TENANT_ID).isEmpty()) return;
        String[][] items = {
            {"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800", "Annual Science Exhibition 2025",       "0"},
            {"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800", "Inter-School Cricket Championship",       "1"},
            {"https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800", "Grade 10 Board Felicitation Ceremony", "2"},
            {"https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800", "Annual Day Dance Performance",         "3"},
            {"https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800", "Robotics Club Workshop",               "4"},
            {"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", "Library Reading Programme",            "5"},
            {"https://images.unsplash.com/photo-1544717305-2782549b5136?w=800", "Art Exhibition – Student Masterpieces",  "6"},
            {"https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800", "Smart Classroom Inauguration",         "7"},
        };
        for (String[] item : items) {
            WebsiteGalleryItem g = new WebsiteGalleryItem();
            g.setTenantId(TENANT_ID);
            g.setImageUrl(item[0]);
            g.setCaption(item[1]);
            g.setDisplayOrder(Integer.parseInt(item[2]));
            g.setVisible(true);
            websiteGalleryRepository.save(g);
        }
    }

    private void seedAdmissionLeads() {
        if (!admissionLeadRepository.findByTenantIdOrderBySubmittedAtDesc(TENANT_ID).isEmpty()) return;
        Object[][] leads = {
            {"Anil Kapoor",      "anil.kapoor@gmail.com",   "9811001001", "Ravi Kapoor",       "Grade 3",  "Interested in admission. Please share prospectus.", "NEW"},
            {"Sunita Verma",     "sunita.v@yahoo.com",      "9811001002", "Priti Verma",       "Grade 1",  "Looking for CBSE school nearby. Is transport available?", "CONTACTED"},
            {"Mohan Das",        "mohan.das@outlook.com",   "9811001003", "Arjun Das",         "Grade 6",  "My son is a state-level chess player.", "NEW"},
            {"Lakshmi Nair",     "lakshmi.nair@gmail.com",  "9811001004", "Meera Nair",        "Grade 2",  "Heard great reviews. Would like to visit campus.", "VISITED"},
            {"Prasad Reddy",     "prasad.r@gmail.com",      "9811001005", "Vignesh Reddy",     "Grade 9",  "Transferring from Hyderabad. Need mid-year admission.", "NEW"},
            {"Kiran Sharma",     "kiran.s@hotmail.com",     "9811001006", "Nisha Sharma",      "Grade 4",  "Looking for a school with strong science programme.", "CONTACTED"},
            {"Deepa Iyer",       "deepa.iyer@gmail.com",    "9811001007", "Gautam Iyer",       "Grade 7",  "Interested. Please call to schedule a visit.", "VISITED"},
            {"Rajiv Khanna",     "rajiv.khanna@gmail.com",  "9811001008", "Aakash Khanna",     "Grade 1",  "Just moved to Noida. Need admission urgently.", "ADMITTED"},
            {"Preethi Menon",    "preethi.m@gmail.com",     "9811001009", "Divya Menon",       "Grade 5",  "My daughter loves art and music. What programmes do you offer?", "NEW"},
            {"Sachin Gupta",     "sachin.g@gmail.com",      "9811001010", "Ronak Gupta",       "Grade 8",  "Is there a scholarship programme for merit students?", "CONTACTED"},
            {"Ananya Pillai",    "ananya.p@gmail.com",      "9811001011", "Tara Pillai",       "Grade 3",  "Very interested. Visited campus last week.", "VISITED"},
            {"Vijay Mishra",     "vijay.m@gmail.com",       "9811001012", "Shrey Mishra",      "Grade 10", "Need TC from current school. Can admission still happen?", "NEW"},
        };
        for (Object[] lead : leads) {
            AdmissionLead al = new AdmissionLead();
            al.setTenantId(TENANT_ID);
            al.setParentName((String) lead[0]);
            al.setParentEmail((String) lead[1]);
            al.setParentPhone((String) lead[2]);
            al.setStudentName((String) lead[3]);
            al.setApplyingClass((String) lead[4]);
            al.setMessage((String) lead[5]);
            al.setStatus((String) lead[6]);
            admissionLeadRepository.save(al);
        }
    }

    // ── Entity upsert helpers ─────────────────────────────────────────────────

    private UserAccount upsertUser(String username, String fullName, UserRole role, String email, String phone) {
        String u = username.trim().toLowerCase(Locale.ROOT);
        return userAccountRepository.findByUsername(u).orElseGet(() -> {
            UserAccount user = new UserAccount();
            user.setUsername(u);
            user.setFullName(fullName.trim());
            user.setRole(role);
            user.setTenantId(TenantContext.getTenant());
            user.setEmail(email == null ? null : email.trim().toLowerCase(Locale.ROOT));
            user.setPhone(phone == null ? null : phone.trim());
            user.setPasswordHash(passwordEncoder.encode(DEFAULT_USER_PASSWORD));
            user.setFirstLoginRequired(false);
            user.setActive(true);
            return userAccountRepository.save(user);
        });
    }

    private Teacher upsertTeacher(String employeeNo, String firstName, String lastName,
                                  String email, String phone, LocalDate hireDate, UserAccount linkedUser) {
        String no = employeeNo.trim().toUpperCase(Locale.ROOT);
        if (teacherRepository.existsByEmployeeNo(no)) {
            return teacherRepository.findByEmployeeNo(no).orElseThrow();
        }
        Teacher teacher = new Teacher();
        teacher.setEmployeeNo(no);
        teacher.setFirstName(firstName.trim());
        teacher.setLastName(lastName.trim());
        teacher.setEmail(email.trim().toLowerCase(Locale.ROOT));
        teacher.setPhone(phone);
        teacher.setHireDate(hireDate);
        teacher.setLinkedUser(linkedUser);
        teacher.setActive(true);
        return teacherRepository.save(teacher);
    }

    private Student upsertStudent(String admissionNo, String firstName, String lastName,
                                  LocalDate dob, Gender gender, String email, String phone, UserAccount linkedUser) {
        String no = admissionNo.trim().toUpperCase(Locale.ROOT);
        return studentRepository.findByAdmissionNo(no).orElseGet(() -> {
            Student student = new Student();
            student.setAdmissionNo(no);
            student.setFirstName(firstName.trim());
            student.setLastName(lastName.trim());
            student.setDateOfBirth(dob);
            student.setGender(gender);
            student.setEmail(email == null ? null : email.trim().toLowerCase(Locale.ROOT));
            student.setPhone(phone);
            student.setLinkedUser(linkedUser);
            student.setActive(true);
            return studentRepository.save(student);
        });
    }

    private void upsertParentLink(UserAccount parent, Student student) {
        if (parent == null || student == null) return;
        if (parentStudentRepository.existsByParentUserIdAndStudentId(parent.getId(), student.getId())) return;
        ParentStudent link = new ParentStudent();
        link.setParentUserId(parent.getId());
        link.setStudentId(student.getId());
        parentStudentRepository.save(link);
    }

    private SchoolClass upsertClass(String name, String code) {
        String c = code.trim().toUpperCase(Locale.ROOT);
        return schoolClassRepository.findByCode(c).orElseGet(() -> {
            SchoolClass sc = new SchoolClass();
            sc.setName(name.trim());
            sc.setCode(c);
            sc.setActive(true);
            return schoolClassRepository.save(sc);
        });
    }

    private Section upsertSection(SchoolClass schoolClass, String name) {
        if (sectionRepository.existsBySchoolClass_IdAndNameIgnoreCase(schoolClass.getId(), name.trim())) {
            return sectionRepository.findAll().stream()
                    .filter(s -> s.getSchoolClass().getId().equals(schoolClass.getId())
                              && s.getName().equalsIgnoreCase(name.trim()))
                    .findFirst().orElseThrow();
        }
        Section section = new Section();
        section.setSchoolClass(schoolClass);
        section.setName(name.trim());
        section.setActive(true);
        return sectionRepository.save(section);
    }

    private Subject upsertSubject(String name, String code) {
        String c = code.trim().toUpperCase(Locale.ROOT);
        if (subjectRepository.existsByCode(c)) {
            return subjectRepository.findAll().stream()
                    .filter(s -> s.getCode().equalsIgnoreCase(c))
                    .findFirst().orElseThrow();
        }
        Subject subject = new Subject();
        subject.setName(name.trim());
        subject.setCode(c);
        subject.setActive(true);
        return subjectRepository.save(subject);
    }

}
