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

/**
 * Seeds a complete Jawahar Navodaya Vidyalaya demo school on every startup
 * when app.seed.demo-enabled=true.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  LOGIN CREDENTIALS                                                   │
 * │  ─────────────────────────────────────────────────────────────────  │
 * │  Principal (SCHOOL_ADMIN)                                            │
 * │    Username : uttam.kumar                                            │
 * │    Password : Uttam@2026!                                            │
 * │    Email    : uttamkumar3797@gmail.com                               │
 * │                                                                      │
 * │  Vice-Principal (SCHOOL_ADMIN)                                       │
 * │    Username : priya.nirmal                                           │
 * │    Password : Priya@2026!                                            │
 * │    Email    : uttamgaurav2020@gmail.com                              │
 * │                                                                      │
 * │  All Staff  : Jnv@Demo2026                                           │
 * │  All Students: Jnv@Demo2026                                          │
 * │  All Parents : Jnv@Demo2026                                          │
 * │                                                                      │
 * │  Tenant slug: jnv-palamau  (X-Tenant-Slug header)                   │
 * └─────────────────────────────────────────────────────────────────────┘
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.seed", name = "demo-enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final String TENANT_ID     = "jnv-palamau";
    private static final String TENANT_SCHEMA = "jnv";
    private static final String TENANT_SLUG   = "jnv-palamau";
    private static final String SCHOOL_NAME   = "Jawahar Navodaya Vidyalaya, Palamau";

    private static final String ADMIN_PASSWORD   = "Uttam@2026!";
    private static final String VP_PASSWORD      = "Priya@2026!";
    private static final String DEFAULT_PASSWORD = "Jnv@Demo2026";

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
        txTemplate.execute(status -> { ensureTenant(); return null; });

        TenantContext.setTenant(TENANT_SCHEMA);
        try {
            txTemplate.execute(status -> { seedSchool(); return null; });
        } finally {
            TenantContext.clear();
        }

        txTemplate.execute(status -> { seedPublicData(); return null; });
        log.info("JNV demo seed complete for tenant={}", TENANT_ID);
    }

    // ── Tenant bootstrap ─────────────────────────────────────────────────────

    private void ensureTenant() {
        if (tenantRepository.findByTenantId(TENANT_ID).isPresent()) return;
        tenantService.createTenant(new TenantCreateRequest(
                TENANT_ID, TENANT_SLUG, SCHOOL_NAME, TENANT_SCHEMA,
                null, "#1E40AF",
                "Uttam Kumar", "uttam.kumar",
                "uttamkumar3797@gmail.com", "7905025730", ADMIN_PASSWORD
        ));
        log.info("JNV tenant created: tenantId={}", TENANT_ID);
    }

    // ── Tenant-schema data ────────────────────────────────────────────────────

    private void seedSchool() {
        if (userAccountRepository.findByUsername("priya.nirmal").isPresent()) {
            log.info("JNV school data already seeded, skipping");
            return;
        }

        // ── Admin / Staff ──────────────────────────────────────────────────
        UserAccount vpUser = upsertUser("priya.nirmal",   "Priya Nirmal",         UserRole.SCHOOL_ADMIN, "uttamgaurav2020@gmail.com", "8724099452", VP_PASSWORD);
        UserAccount t1u    = upsertUser("anand.mishra",   "Anand Kumar Mishra",   UserRole.TEACHER, "anand.mishra@jnvpalamau.ac.in",   "9430100101", DEFAULT_PASSWORD);
        UserAccount t2u    = upsertUser("sunita.sharma",  "Sunita Kumari Sharma", UserRole.TEACHER, "sunita.sharma@jnvpalamau.ac.in",  "9430100102", DEFAULT_PASSWORD);
        UserAccount t3u    = upsertUser("ramesh.oraon",   "Ramesh Kumar Oraon",   UserRole.TEACHER, "ramesh.oraon@jnvpalamau.ac.in",   "9430100103", DEFAULT_PASSWORD);
        UserAccount t4u    = upsertUser("kavita.sinha",   "Kavita Kumari Sinha",  UserRole.TEACHER, "kavita.sinha@jnvpalamau.ac.in",   "9430100104", DEFAULT_PASSWORD);
        UserAccount t5u    = upsertUser("deepak.singh",   "Deepak Kumar Singh",   UserRole.TEACHER, "deepak.singh@jnvpalamau.ac.in",   "9430100105", DEFAULT_PASSWORD);
        UserAccount t6u    = upsertUser("santosh.tiwari", "Santosh Kumar Tiwari", UserRole.TEACHER, "santosh.tiwari@jnvpalamau.ac.in", "9430100106", DEFAULT_PASSWORD);
        UserAccount t7u    = upsertUser("sanjay.nath",    "Sanjay Nath",          UserRole.TEACHER, "sanjay.nath@jnvpalamau.ac.in",    "9430100107", DEFAULT_PASSWORD);
        UserAccount t8u    = upsertUser("meera.kumari",   "Meera Kumari",         UserRole.TEACHER, "meera.kumari@jnvpalamau.ac.in",   "9430100108", DEFAULT_PASSWORD);
        UserAccount t9u    = upsertUser("ashok.sharma",   "Ashok Kumar Sharma",   UserRole.TEACHER, "ashok.sharma@jnvpalamau.ac.in",   "9430100109", DEFAULT_PASSWORD);
        UserAccount t10u   = upsertUser("rekha.shriv",    "Rekha Shrivastava",    UserRole.TEACHER, "rekha.shriv@jnvpalamau.ac.in",    "9430100110", DEFAULT_PASSWORD);
        UserAccount t11u   = upsertUser("pooja.agarwal",  "Pooja Agarwal",        UserRole.TEACHER, "pooja.agarwal@jnvpalamau.ac.in",  "9430100111", DEFAULT_PASSWORD);

        // ── Student user accounts ──────────────────────────────────────────
        // Class 6A (admitted 2024)
        UserAccount su1  = upsertUser("s24001", "Raju Kumar Mahato",    UserRole.STUDENT, "raju.mahato@jnvpalamau.ac.in",    "9430200101", DEFAULT_PASSWORD);
        UserAccount su2  = upsertUser("s24002", "Priti Kumari",         UserRole.STUDENT, "priti.kumari@jnvpalamau.ac.in",   "9430200102", DEFAULT_PASSWORD);
        UserAccount su3  = upsertUser("s24003", "Amit Kumar Sahu",      UserRole.STUDENT, "amit.sahu@jnvpalamau.ac.in",      "9430200103", DEFAULT_PASSWORD);
        // Class 6B (admitted 2024)
        UserAccount su4  = upsertUser("s24004", "Sunita Devi",          UserRole.STUDENT, "sunita.devi@jnvpalamau.ac.in",    "9430200104", DEFAULT_PASSWORD);
        UserAccount su5  = upsertUser("s24005", "Vijay Kumar Bind",     UserRole.STUDENT, "vijay.bind@jnvpalamau.ac.in",     "9430200105", DEFAULT_PASSWORD);
        UserAccount su6  = upsertUser("s24006", "Meena Kumari Gond",    UserRole.STUDENT, "meena.gond@jnvpalamau.ac.in",     "9430200106", DEFAULT_PASSWORD);
        // Class 7A (admitted 2023)
        UserAccount su7  = upsertUser("s23001", "Rohit Kumar Yadav",    UserRole.STUDENT, "rohit.yadav@jnvpalamau.ac.in",    "9430200107", DEFAULT_PASSWORD);
        UserAccount su8  = upsertUser("s23002", "Anita Kumari",         UserRole.STUDENT, "anita.kumari@jnvpalamau.ac.in",   "9430200108", DEFAULT_PASSWORD);
        // Class 7B (admitted 2023)
        UserAccount su9  = upsertUser("s23003", "Suresh Kumar Oraon",   UserRole.STUDENT, "suresh.oraon@jnvpalamau.ac.in",   "9430200109", DEFAULT_PASSWORD);
        UserAccount su10 = upsertUser("s23004", "Kavita Devi",          UserRole.STUDENT, "kavita.devi@jnvpalamau.ac.in",    "9430200110", DEFAULT_PASSWORD);
        // Class 8A (admitted 2022)
        UserAccount su11 = upsertUser("s22001", "Manish Kumar Goswami", UserRole.STUDENT, "manish.goswami@jnvpalamau.ac.in", "9430200111", DEFAULT_PASSWORD);
        UserAccount su12 = upsertUser("s22002", "Rekha Kumari",         UserRole.STUDENT, "rekha.kumari@jnvpalamau.ac.in",   "9430200112", DEFAULT_PASSWORD);
        // Class 8B (admitted 2022)
        UserAccount su13 = upsertUser("s22003", "Arun Kumar Sharma",    UserRole.STUDENT, "arun.sharma@jnvpalamau.ac.in",    "9430200113", DEFAULT_PASSWORD);
        UserAccount su14 = upsertUser("s22004", "Pooja Kumari Gupta",   UserRole.STUDENT, "pooja.gupta@jnvpalamau.ac.in",    "9430200114", DEFAULT_PASSWORD);
        // Class 9A (admitted 2021)
        UserAccount su15 = upsertUser("s21001", "Sanjay Kumar Tiwari",  UserRole.STUDENT, "sanjay.tiwari@jnvpalamau.ac.in",  "9430200115", DEFAULT_PASSWORD);
        UserAccount su16 = upsertUser("s21002", "Neha Kumari",          UserRole.STUDENT, "neha.kumari@jnvpalamau.ac.in",    "9430200116", DEFAULT_PASSWORD);
        // Class 9B (admitted 2021)
        UserAccount su17 = upsertUser("s21003", "Rakesh Kumar Singh",   UserRole.STUDENT, "rakesh.singh@jnvpalamau.ac.in",   "9430200117", DEFAULT_PASSWORD);
        UserAccount su18 = upsertUser("s21004", "Priyanka Kumari",      UserRole.STUDENT, "priyanka.kumari@jnvpalamau.ac.in","9430200118", DEFAULT_PASSWORD);
        // Class 10A (admitted 2020)
        UserAccount su19 = upsertUser("s20001", "Abhishek Kumar Mishra",UserRole.STUDENT, "abhishek.mishra@jnvpalamau.ac.in","9430200119", DEFAULT_PASSWORD);
        UserAccount su20 = upsertUser("s20002", "Shivani Kumari",       UserRole.STUDENT, "shivani.kumari@jnvpalamau.ac.in", "9430200120", DEFAULT_PASSWORD);
        // Class 10B (admitted 2020)
        UserAccount su21 = upsertUser("s20003", "Deepak Kumar Pandey",  UserRole.STUDENT, "deepak.pandey@jnvpalamau.ac.in",  "9430200121", DEFAULT_PASSWORD);
        UserAccount su22 = upsertUser("s20004", "Roshni Kumari",        UserRole.STUDENT, "roshni.kumari@jnvpalamau.ac.in",  "9430200122", DEFAULT_PASSWORD);
        // Class 11 Science (admitted 2019)
        UserAccount su23 = upsertUser("s19001", "Rahul Kumar Dubey",    UserRole.STUDENT, "rahul.dubey@jnvpalamau.ac.in",    "9430200123", DEFAULT_PASSWORD);
        UserAccount su24 = upsertUser("s19002", "Sangeeta Kumari",      UserRole.STUDENT, "sangeeta.kumari@jnvpalamau.ac.in","9430200124", DEFAULT_PASSWORD);
        // Class 11 Arts (admitted 2019)
        UserAccount su25 = upsertUser("s19003", "Ashish Kumar Gond",    UserRole.STUDENT, "ashish.gond@jnvpalamau.ac.in",    "9430200125", DEFAULT_PASSWORD);
        // Class 12 Science (admitted 2018)
        UserAccount su26 = upsertUser("s18001", "Vikash Kumar Mahato",  UserRole.STUDENT, "vikash.mahato@jnvpalamau.ac.in",  "9430200126", DEFAULT_PASSWORD);
        UserAccount su27 = upsertUser("s18002", "Ankita Kumari",        UserRole.STUDENT, "ankita.kumari@jnvpalamau.ac.in",  "9430200127", DEFAULT_PASSWORD);
        // Class 12 Arts (admitted 2018)
        UserAccount su28 = upsertUser("s18003", "Ramji Kumar Yadav",    UserRole.STUDENT, "ramji.yadav@jnvpalamau.ac.in",    "9430200128", DEFAULT_PASSWORD);

        // ── Parent user accounts ──────────────────────────────────────────
        UserAccount p1  = upsertUser("par.001", "Mahendra Kumar Mahato",  UserRole.PARENT, "mahendra.mahato@gmail.com",  "9430300101", DEFAULT_PASSWORD);
        UserAccount p2  = upsertUser("par.002", "Usha Devi",              UserRole.PARENT, "usha.devi@gmail.com",        "9430300102", DEFAULT_PASSWORD);
        UserAccount p3  = upsertUser("par.003", "Ramesh Sahu",            UserRole.PARENT, "ramesh.sahu@gmail.com",      "9430300103", DEFAULT_PASSWORD);
        UserAccount p4  = upsertUser("par.004", "Ramdas Bind",            UserRole.PARENT, "ramdas.bind@gmail.com",      "9430300104", DEFAULT_PASSWORD);
        UserAccount p5  = upsertUser("par.005", "Budhu Ram Gond",         UserRole.PARENT, "budhu.gond@gmail.com",       "9430300105", DEFAULT_PASSWORD);
        UserAccount p6  = upsertUser("par.006", "Birendra Kumar Yadav",   UserRole.PARENT, "birendra.yadav@gmail.com",   "9430300106", DEFAULT_PASSWORD);
        UserAccount p7  = upsertUser("par.007", "Sharda Devi",            UserRole.PARENT, "sharda.devi@gmail.com",      "9430300107", DEFAULT_PASSWORD);
        UserAccount p8  = upsertUser("par.008", "Laxman Oraon",           UserRole.PARENT, "laxman.oraon@gmail.com",     "9430300108", DEFAULT_PASSWORD);
        UserAccount p9  = upsertUser("par.009", "Malti Devi",             UserRole.PARENT, "malti.devi@gmail.com",       "9430300109", DEFAULT_PASSWORD);
        UserAccount p10 = upsertUser("par.010", "Gopal Singh Tiwari",     UserRole.PARENT, "gopal.tiwari@gmail.com",     "9430300110", DEFAULT_PASSWORD);
        UserAccount p11 = upsertUser("par.011", "Janki Devi",             UserRole.PARENT, "janki.devi@gmail.com",       "9430300111", DEFAULT_PASSWORD);
        UserAccount p12 = upsertUser("par.012", "Awadhesh Kumar Mishra",  UserRole.PARENT, "awadhesh.mishra@gmail.com",  "9430300112", DEFAULT_PASSWORD);
        UserAccount p13 = upsertUser("par.013", "Shanti Devi",            UserRole.PARENT, "shanti.devi@gmail.com",      "9430300113", DEFAULT_PASSWORD);
        UserAccount p14 = upsertUser("par.014", "Ramkhelawan Dubey",      UserRole.PARENT, "ramkhelawan.dubey@gmail.com","9430300114", DEFAULT_PASSWORD);
        UserAccount p15 = upsertUser("par.015", "Suresh Prasad Mahato",   UserRole.PARENT, "suresh.mahato@gmail.com",    "9430300115", DEFAULT_PASSWORD);

        // ── Academic structure ────────────────────────────────────────────
        SchoolClass c6  = upsertClass("Class 6",       "C06");
        SchoolClass c7  = upsertClass("Class 7",       "C07");
        SchoolClass c8  = upsertClass("Class 8",       "C08");
        SchoolClass c9  = upsertClass("Class 9",       "C09");
        SchoolClass c10 = upsertClass("Class 10",      "C10");
        SchoolClass c11 = upsertClass("Class 11",      "C11");
        SchoolClass c12 = upsertClass("Class 12",      "C12");

        Section c6a  = upsertSection(c6,  "A");
        Section c6b  = upsertSection(c6,  "B");
        Section c7a  = upsertSection(c7,  "A");
        Section c7b  = upsertSection(c7,  "B");
        Section c8a  = upsertSection(c8,  "A");
        Section c8b  = upsertSection(c8,  "B");
        Section c9a  = upsertSection(c9,  "A");
        Section c9b  = upsertSection(c9,  "B");
        Section c10a = upsertSection(c10, "A");
        Section c10b = upsertSection(c10, "B");
        Section c11s = upsertSection(c11, "Science");
        Section c11a = upsertSection(c11, "Arts");
        Section c12s = upsertSection(c12, "Science");
        Section c12a = upsertSection(c12, "Arts");

        Subject english  = upsertSubject("English",             "ENG");
        Subject hindi    = upsertSubject("Hindi",               "HIN");
        Subject maths    = upsertSubject("Mathematics",         "MATH");
        Subject science  = upsertSubject("Science",             "SCI");
        Subject socialSt = upsertSubject("Social Studies",      "SST");
        Subject sanskrit = upsertSubject("Sanskrit",            "SANSK");
        Subject physics  = upsertSubject("Physics",             "PHY");
        Subject chemistry= upsertSubject("Chemistry",           "CHEM");
        Subject biology  = upsertSubject("Biology",             "BIO");
        Subject history  = upsertSubject("History",             "HIST");
        Subject geography= upsertSubject("Geography",           "GEO");
        Subject polSci   = upsertSubject("Political Science",   "PS");
        Subject economics= upsertSubject("Economics",           "ECO");
        Subject cs       = upsertSubject("Computer Science",    "CS");
        Subject pe       = upsertSubject("Physical Education",  "PE");

        // ── Teachers ──────────────────────────────────────────────────────
        Teacher vp   = upsertTeacher("JNV-T00", "Priya",   "Nirmal",         "uttamgaurav2020@gmail.com", "8724099452", LocalDate.of(2010, 7,  1), vpUser);
        Teacher tr1  = upsertTeacher("JNV-T01", "Anand",   "Kumar Mishra",   "anand.mishra@jnvpalamau.ac.in",   "9430100101", LocalDate.of(2012, 6,  1), t1u);
        Teacher tr2  = upsertTeacher("JNV-T02", "Sunita",  "Kumari Sharma",  "sunita.sharma@jnvpalamau.ac.in",  "9430100102", LocalDate.of(2011, 7,  1), t2u);
        Teacher tr3  = upsertTeacher("JNV-T03", "Ramesh",  "Kumar Oraon",    "ramesh.oraon@jnvpalamau.ac.in",   "9430100103", LocalDate.of(2015, 8,  1), t3u);
        Teacher tr4  = upsertTeacher("JNV-T04", "Kavita",  "Kumari Sinha",   "kavita.sinha@jnvpalamau.ac.in",   "9430100104", LocalDate.of(2014, 6,  1), t4u);
        Teacher tr5  = upsertTeacher("JNV-T05", "Deepak",  "Kumar Singh",    "deepak.singh@jnvpalamau.ac.in",   "9430100105", LocalDate.of(2016, 7,  1), t5u);
        Teacher tr6  = upsertTeacher("JNV-T06", "Santosh", "Kumar Tiwari",   "santosh.tiwari@jnvpalamau.ac.in", "9430100106", LocalDate.of(2013, 8,  1), t6u);
        Teacher tr7  = upsertTeacher("JNV-T07", "Sanjay",  "Nath",           "sanjay.nath@jnvpalamau.ac.in",    "9430100107", LocalDate.of(2018, 6,  1), t7u);
        Teacher tr8  = upsertTeacher("JNV-T08", "Meera",   "Kumari",         "meera.kumari@jnvpalamau.ac.in",   "9430100108", LocalDate.of(2017, 7,  1), t8u);
        Teacher tr9  = upsertTeacher("JNV-T09", "Ashok",   "Kumar Sharma",   "ashok.sharma@jnvpalamau.ac.in",   "9430100109", LocalDate.of(2019, 8,  1), t9u);
        Teacher tr10 = upsertTeacher("JNV-T10", "Rekha",   "Shrivastava",    "rekha.shriv@jnvpalamau.ac.in",    "9430100110", LocalDate.of(2020, 6,  1), t10u);
        Teacher tr11 = upsertTeacher("JNV-T11", "Pooja",   "Agarwal",        "pooja.agarwal@jnvpalamau.ac.in",  "9430100111", LocalDate.of(2021, 7,  1), t11u);

        // ── Students ──────────────────────────────────────────────────────
        // Class 6A
        Student st1  = upsertStudent("JNV-PLM-2024-001", "Raju",     "Kumar Mahato",   LocalDate.of(2013,  3, 15), Gender.MALE,   "raju.mahato@jnvpalamau.ac.in",    "9430200101", su1);
        Student st2  = upsertStudent("JNV-PLM-2024-002", "Priti",    "Kumari",         LocalDate.of(2013,  7, 22), Gender.FEMALE, "priti.kumari@jnvpalamau.ac.in",   "9430200102", su2);
        Student st3  = upsertStudent("JNV-PLM-2024-003", "Amit",     "Kumar Sahu",     LocalDate.of(2013,  1, 10), Gender.MALE,   "amit.sahu@jnvpalamau.ac.in",      "9430200103", su3);
        // Class 6B
        Student st4  = upsertStudent("JNV-PLM-2024-004", "Sunita",   "Devi",           LocalDate.of(2013,  5, 18), Gender.FEMALE, "sunita.devi@jnvpalamau.ac.in",    "9430200104", su4);
        Student st5  = upsertStudent("JNV-PLM-2024-005", "Vijay",    "Kumar Bind",     LocalDate.of(2013, 11,  5), Gender.MALE,   "vijay.bind@jnvpalamau.ac.in",     "9430200105", su5);
        Student st6  = upsertStudent("JNV-PLM-2024-006", "Meena",    "Kumari Gond",    LocalDate.of(2013,  9, 20), Gender.FEMALE, "meena.gond@jnvpalamau.ac.in",     "9430200106", su6);
        // Class 7A
        Student st7  = upsertStudent("JNV-PLM-2023-001", "Rohit",    "Kumar Yadav",    LocalDate.of(2012,  4, 12), Gender.MALE,   "rohit.yadav@jnvpalamau.ac.in",    "9430200107", su7);
        Student st8  = upsertStudent("JNV-PLM-2023-002", "Anita",    "Kumari",         LocalDate.of(2012,  8, 30), Gender.FEMALE, "anita.kumari@jnvpalamau.ac.in",   "9430200108", su8);
        // Class 7B
        Student st9  = upsertStudent("JNV-PLM-2023-003", "Suresh",   "Kumar Oraon",    LocalDate.of(2012,  2, 14), Gender.MALE,   "suresh.oraon@jnvpalamau.ac.in",   "9430200109", su9);
        Student st10 = upsertStudent("JNV-PLM-2023-004", "Kavita",   "Devi",           LocalDate.of(2012,  6, 25), Gender.FEMALE, "kavita.devi@jnvpalamau.ac.in",    "9430200110", su10);
        // Class 8A
        Student st11 = upsertStudent("JNV-PLM-2022-001", "Manish",   "Kumar Goswami",  LocalDate.of(2011,  5,  8), Gender.MALE,   "manish.goswami@jnvpalamau.ac.in", "9430200111", su11);
        Student st12 = upsertStudent("JNV-PLM-2022-002", "Rekha",    "Kumari",         LocalDate.of(2011, 10, 16), Gender.FEMALE, "rekha.kumari@jnvpalamau.ac.in",   "9430200112", su12);
        // Class 8B
        Student st13 = upsertStudent("JNV-PLM-2022-003", "Arun",     "Kumar Sharma",   LocalDate.of(2011,  3, 22), Gender.MALE,   "arun.sharma@jnvpalamau.ac.in",    "9430200113", su13);
        Student st14 = upsertStudent("JNV-PLM-2022-004", "Pooja",    "Kumari Gupta",   LocalDate.of(2011, 12,  5), Gender.FEMALE, "pooja.gupta@jnvpalamau.ac.in",    "9430200114", su14);
        // Class 9A
        Student st15 = upsertStudent("JNV-PLM-2021-001", "Sanjay",   "Kumar Tiwari",   LocalDate.of(2010,  1, 18), Gender.MALE,   "sanjay.tiwari@jnvpalamau.ac.in",  "9430200115", su15);
        Student st16 = upsertStudent("JNV-PLM-2021-002", "Neha",     "Kumari",         LocalDate.of(2010,  7,  9), Gender.FEMALE, "neha.kumari@jnvpalamau.ac.in",    "9430200116", su16);
        // Class 9B
        Student st17 = upsertStudent("JNV-PLM-2021-003", "Rakesh",   "Kumar Singh",    LocalDate.of(2010,  4, 27), Gender.MALE,   "rakesh.singh@jnvpalamau.ac.in",   "9430200117", su17);
        Student st18 = upsertStudent("JNV-PLM-2021-004", "Priyanka", "Kumari",         LocalDate.of(2010,  9, 14), Gender.FEMALE, "priyanka.kumari@jnvpalamau.ac.in","9430200118", su18);
        // Class 10A
        Student st19 = upsertStudent("JNV-PLM-2020-001", "Abhishek", "Kumar Mishra",   LocalDate.of(2009,  2, 28), Gender.MALE,   "abhishek.mishra@jnvpalamau.ac.in","9430200119", su19);
        Student st20 = upsertStudent("JNV-PLM-2020-002", "Shivani",  "Kumari",         LocalDate.of(2009,  6, 15), Gender.FEMALE, "shivani.kumari@jnvpalamau.ac.in", "9430200120", su20);
        // Class 10B
        Student st21 = upsertStudent("JNV-PLM-2020-003", "Deepak",   "Kumar Pandey",   LocalDate.of(2009, 11, 20), Gender.MALE,   "deepak.pandey@jnvpalamau.ac.in",  "9430200121", su21);
        Student st22 = upsertStudent("JNV-PLM-2020-004", "Roshni",   "Kumari",         LocalDate.of(2009,  8,  3), Gender.FEMALE, "roshni.kumari@jnvpalamau.ac.in",  "9430200122", su22);
        // Class 11 Science
        Student st23 = upsertStudent("JNV-PLM-2019-001", "Rahul",    "Kumar Dubey",    LocalDate.of(2008,  5, 12), Gender.MALE,   "rahul.dubey@jnvpalamau.ac.in",    "9430200123", su23);
        Student st24 = upsertStudent("JNV-PLM-2019-002", "Sangeeta", "Kumari",         LocalDate.of(2008,  9, 28), Gender.FEMALE, "sangeeta.kumari@jnvpalamau.ac.in","9430200124", su24);
        // Class 11 Arts
        Student st25 = upsertStudent("JNV-PLM-2019-003", "Ashish",   "Kumar Gond",     LocalDate.of(2008,  3, 17), Gender.MALE,   "ashish.gond@jnvpalamau.ac.in",    "9430200125", su25);
        // Class 12 Science
        Student st26 = upsertStudent("JNV-PLM-2018-001", "Vikash",   "Kumar Mahato",   LocalDate.of(2007,  7, 22), Gender.MALE,   "vikash.mahato@jnvpalamau.ac.in",  "9430200126", su26);
        Student st27 = upsertStudent("JNV-PLM-2018-002", "Ankita",   "Kumari",         LocalDate.of(2007, 11, 10), Gender.FEMALE, "ankita.kumari@jnvpalamau.ac.in",  "9430200127", su27);
        // Class 12 Arts
        Student st28 = upsertStudent("JNV-PLM-2018-003", "Ramji",    "Kumar Yadav",    LocalDate.of(2007,  4,  5), Gender.MALE,   "ramji.yadav@jnvpalamau.ac.in",    "9430200128", su28);

        // ── Parent ↔ Student links ─────────────────────────────────────────
        upsertParentLink(p1,  st1);                        // Mahendra → Raju
        upsertParentLink(p2,  st2);  upsertParentLink(p2,  st4);  // Usha → Priti, Sunita
        upsertParentLink(p3,  st3);                        // Ramesh → Amit
        upsertParentLink(p4,  st5);                        // Ramdas → Vijay
        upsertParentLink(p5,  st6);                        // Budhu → Meena
        upsertParentLink(p6,  st7);  upsertParentLink(p6,  st8);  // Birendra → Rohit, Anita
        upsertParentLink(p7,  st9);                        // Sharda → Suresh
        upsertParentLink(p8,  st10); upsertParentLink(p8,  st12); // Laxman → Kavita, Rekha
        upsertParentLink(p9,  st11);                       // Malti → Manish
        upsertParentLink(p10, st13);                       // Gopal → Arun
        upsertParentLink(p11, st14); upsertParentLink(p11, st16); // Janki → Pooja, Neha
        upsertParentLink(p12, st15); upsertParentLink(p12, st19); // Awadhesh → Sanjay, Abhishek
        upsertParentLink(p13, st17); upsertParentLink(p13, st18); // Shanti → Rakesh, Priyanka
        upsertParentLink(p14, st23); upsertParentLink(p14, st26); // Ramkhelawan → Rahul, Vikash
        upsertParentLink(p15, st27); upsertParentLink(p15, st20); // Suresh → Ankita, Shivani

        // ── Timetable (Class 6A, Class 9A, Class 12 Science) ─────────────
        UUID vpId  = vp.getId();
        UUID tr1Id = tr1.getId();
        UUID tr2Id = tr2.getId();
        UUID tr3Id = tr3.getId();
        UUID tr4Id = tr4.getId();
        UUID tr5Id = tr5.getId();
        UUID tr6Id = tr6.getId();
        UUID tr7Id = tr7.getId();
        UUID tr8Id = tr8.getId();
        UUID tr9Id = tr9.getId();
        UUID tr10Id= tr10.getId();
        UUID tr11Id= tr11.getId();

        // Class 6A — Mon-Fri
        seedTimetable(c6, c6a, english,  vpId,   (short)1, "07:30","08:30","English");
        seedTimetable(c6, c6a, maths,    tr1Id,  (short)1, "08:30","09:30","Mathematics");
        seedTimetable(c6, c6a, hindi,    tr2Id,  (short)1, "09:45","10:45","Hindi");
        seedTimetable(c6, c6a, science,  tr3Id,  (short)1, "10:45","11:45","Science");
        seedTimetable(c6, c6a, socialSt, tr6Id,  (short)1, "12:30","13:30","Social Studies");
        seedTimetable(c6, c6a, pe,       tr9Id,  (short)1, "13:30","14:30","Physical Education");

        seedTimetable(c6, c6a, maths,    tr1Id,  (short)2, "07:30","08:30","Mathematics");
        seedTimetable(c6, c6a, english,  vpId,   (short)2, "08:30","09:30","English");
        seedTimetable(c6, c6a, science,  tr3Id,  (short)2, "09:45","10:45","Science");
        seedTimetable(c6, c6a, sanskrit, tr2Id,  (short)2, "10:45","11:45","Sanskrit");
        seedTimetable(c6, c6a, hindi,    tr2Id,  (short)2, "12:30","13:30","Hindi");

        seedTimetable(c6, c6a, science,  tr3Id,  (short)3, "07:30","08:30","Science");
        seedTimetable(c6, c6a, maths,    tr1Id,  (short)3, "08:30","09:30","Mathematics");
        seedTimetable(c6, c6a, english,  vpId,   (short)3, "09:45","10:45","English");
        seedTimetable(c6, c6a, socialSt, tr6Id,  (short)3, "10:45","11:45","Social Studies");
        seedTimetable(c6, c6a, pe,       tr9Id,  (short)3, "12:30","13:30","Physical Education");

        seedTimetable(c6, c6a, hindi,    tr2Id,  (short)4, "07:30","08:30","Hindi");
        seedTimetable(c6, c6a, maths,    tr1Id,  (short)4, "08:30","09:30","Mathematics");
        seedTimetable(c6, c6a, socialSt, tr6Id,  (short)4, "09:45","10:45","Social Studies");
        seedTimetable(c6, c6a, english,  vpId,   (short)4, "10:45","11:45","English");

        seedTimetable(c6, c6a, maths,    tr1Id,  (short)5, "07:30","08:30","Mathematics");
        seedTimetable(c6, c6a, sanskrit, tr2Id,  (short)5, "08:30","09:30","Sanskrit");
        seedTimetable(c6, c6a, science,  tr3Id,  (short)5, "09:45","10:45","Science");
        seedTimetable(c6, c6a, english,  vpId,   (short)5, "10:45","11:45","English");

        // Class 9A — Mon-Fri
        seedTimetable(c9, c9a, maths,    tr1Id,  (short)1, "07:30","08:30","Mathematics");
        seedTimetable(c9, c9a, science,  tr3Id,  (short)1, "08:30","09:30","Science");
        seedTimetable(c9, c9a, english,  vpId,   (short)1, "09:45","10:45","English");
        seedTimetable(c9, c9a, socialSt, tr6Id,  (short)1, "10:45","11:45","Social Studies");
        seedTimetable(c9, c9a, cs,       tr7Id,  (short)1, "12:30","13:30","Computer Science");
        seedTimetable(c9, c9a, pe,       tr9Id,  (short)1, "13:30","14:30","Physical Education");

        seedTimetable(c9, c9a, english,  vpId,   (short)2, "07:30","08:30","English");
        seedTimetable(c9, c9a, maths,    tr1Id,  (short)2, "08:30","09:30","Mathematics");
        seedTimetable(c9, c9a, hindi,    tr2Id,  (short)2, "09:45","10:45","Hindi");
        seedTimetable(c9, c9a, science,  tr3Id,  (short)2, "10:45","11:45","Science");
        seedTimetable(c9, c9a, socialSt, tr6Id,  (short)2, "12:30","13:30","Social Studies");

        seedTimetable(c9, c9a, maths,    tr1Id,  (short)3, "07:30","08:30","Mathematics");
        seedTimetable(c9, c9a, cs,       tr7Id,  (short)3, "08:30","09:30","Computer Science");
        seedTimetable(c9, c9a, science,  tr3Id,  (short)3, "09:45","10:45","Science");
        seedTimetable(c9, c9a, english,  vpId,   (short)3, "10:45","11:45","English");

        seedTimetable(c9, c9a, hindi,    tr2Id,  (short)4, "07:30","08:30","Hindi");
        seedTimetable(c9, c9a, maths,    tr1Id,  (short)4, "08:30","09:30","Mathematics");
        seedTimetable(c9, c9a, socialSt, tr6Id,  (short)4, "09:45","10:45","Social Studies");
        seedTimetable(c9, c9a, pe,       tr9Id,  (short)4, "10:45","11:45","Physical Education");

        seedTimetable(c9, c9a, science,  tr3Id,  (short)5, "07:30","08:30","Science");
        seedTimetable(c9, c9a, english,  vpId,   (short)5, "08:30","09:30","English");
        seedTimetable(c9, c9a, cs,       tr7Id,  (short)5, "09:45","10:45","Computer Science");
        seedTimetable(c9, c9a, maths,    tr1Id,  (short)5, "10:45","11:45","Mathematics");

        // Class 12 Science — Mon-Fri
        seedTimetable(c12, c12s, physics,   tr3Id,  (short)1, "07:30","09:00","Physics");
        seedTimetable(c12, c12s, chemistry, tr5Id,  (short)1, "09:00","10:30","Chemistry");
        seedTimetable(c12, c12s, maths,     tr1Id,  (short)1, "10:45","12:15","Mathematics");
        seedTimetable(c12, c12s, english,   vpId,   (short)1, "13:00","14:00","English");

        seedTimetable(c12, c12s, biology,   tr4Id,  (short)2, "07:30","09:00","Biology");
        seedTimetable(c12, c12s, physics,   tr3Id,  (short)2, "09:00","10:30","Physics");
        seedTimetable(c12, c12s, cs,        tr7Id,  (short)2, "10:45","11:45","Computer Science");
        seedTimetable(c12, c12s, pe,        tr9Id,  (short)2, "13:00","14:00","Physical Education");

        seedTimetable(c12, c12s, maths,     tr1Id,  (short)3, "07:30","09:00","Mathematics");
        seedTimetable(c12, c12s, chemistry, tr5Id,  (short)3, "09:00","10:30","Chemistry");
        seedTimetable(c12, c12s, biology,   tr4Id,  (short)3, "10:45","12:15","Biology");

        seedTimetable(c12, c12s, physics,   tr3Id,  (short)4, "07:30","09:00","Physics");
        seedTimetable(c12, c12s, maths,     tr1Id,  (short)4, "09:00","10:30","Mathematics");
        seedTimetable(c12, c12s, english,   vpId,   (short)4, "10:45","11:45","English");

        seedTimetable(c12, c12s, chemistry, tr5Id,  (short)5, "07:30","09:00","Chemistry");
        seedTimetable(c12, c12s, biology,   tr4Id,  (short)5, "09:00","10:30","Biology");
        seedTimetable(c12, c12s, cs,        tr7Id,  (short)5, "10:45","11:45","Computer Science");

        // ── Exams ────────────────────────────────────────────────────────
        Exam ex01 = upsertExam("Unit Test I – Mathematics",        LocalDate.now().minusDays(75), c6,  c6a,  maths,    tr1Id,  50);
        Exam ex02 = upsertExam("Unit Test I – English",            LocalDate.now().minusDays(73), c6,  c6a,  english,  vpId,   50);
        Exam ex03 = upsertExam("Unit Test I – Hindi",              LocalDate.now().minusDays(71), c6,  c6a,  hindi,    tr2Id,  50);
        Exam ex04 = upsertExam("Half Yearly – Mathematics",        LocalDate.now().minusDays(45), c6,  c6a,  maths,    tr1Id,  100);
        Exam ex05 = upsertExam("Half Yearly – English",            LocalDate.now().minusDays(43), c6,  c6a,  english,  vpId,   100);
        Exam ex06 = upsertExam("Half Yearly – Science",            LocalDate.now().minusDays(41), c6,  c6a,  science,  tr3Id,  100);

        Exam ex07 = upsertExam("Unit Test I – Mathematics",        LocalDate.now().minusDays(70), c9,  c9a,  maths,    tr1Id,  50);
        Exam ex08 = upsertExam("Unit Test I – Science",            LocalDate.now().minusDays(68), c9,  c9a,  science,  tr3Id,  50);
        Exam ex09 = upsertExam("Unit Test I – English",            LocalDate.now().minusDays(66), c9,  c9a,  english,  vpId,   50);
        Exam ex10 = upsertExam("Half Yearly – Mathematics",        LocalDate.now().minusDays(40), c9,  c9a,  maths,    tr1Id,  100);
        Exam ex11 = upsertExam("Half Yearly – Science",            LocalDate.now().minusDays(38), c9,  c9a,  science,  tr3Id,  100);
        Exam ex12 = upsertExam("Half Yearly – Social Studies",     LocalDate.now().minusDays(36), c9,  c9a,  socialSt, tr6Id,  100);

        Exam ex13 = upsertExam("Board Mock Test I – Mathematics",  LocalDate.now().minusDays(50), c10, c10a, maths,    tr1Id,  100);
        Exam ex14 = upsertExam("Board Mock Test I – Science",      LocalDate.now().minusDays(48), c10, c10a, science,  tr3Id,  100);
        Exam ex15 = upsertExam("Board Mock Test I – English",      LocalDate.now().minusDays(46), c10, c10a, english,  vpId,   100);
        Exam ex16 = upsertExam("Board Mock Test I – Social Studies",LocalDate.now().minusDays(44), c10, c10a, socialSt, tr6Id,  100);

        Exam ex17 = upsertExam("Practical Exam – Physics",         LocalDate.now().minusDays(30), c12, c12s, physics,  tr3Id,  30);
        Exam ex18 = upsertExam("Practical Exam – Chemistry",       LocalDate.now().minusDays(28), c12, c12s, chemistry,tr5Id,  30);
        Exam ex19 = upsertExam("Practical Exam – Biology",         LocalDate.now().minusDays(26), c12, c12s, biology,  tr4Id,  30);
        Exam ex20 = upsertExam("Board Mock – Physics",             LocalDate.now().minusDays(20), c12, c12s, physics,  tr3Id,  100);
        Exam ex21 = upsertExam("Board Mock – Chemistry",           LocalDate.now().minusDays(18), c12, c12s, chemistry,tr5Id,  100);
        Exam ex22 = upsertExam("Board Mock – Mathematics",         LocalDate.now().minusDays(16), c12, c12s, maths,    tr1Id,  100);
        Exam ex23 = upsertExam("Board Mock – Biology",             LocalDate.now().minusDays(14), c12, c12s, biology,  tr4Id,  100);

        // ── Exam Results ─────────────────────────────────────────────────
        // Class 6A
        upsertExamResult(ex01, st1,  42, "A",  "Excellent",             true);
        upsertExamResult(ex01, st2,  38, "B+", "Very good",             true);
        upsertExamResult(ex01, st3,  35, "B",  "Good",                  true);
        upsertExamResult(ex02, st1,  45, "A+", "Outstanding",           true);
        upsertExamResult(ex02, st2,  40, "A",  "Excellent",             true);
        upsertExamResult(ex02, st3,  32, "B",  "Good",                  true);
        upsertExamResult(ex03, st1,  36, "B+", "Very good",             true);
        upsertExamResult(ex03, st2,  44, "A+", "Perfect Hindi grammar", true);
        upsertExamResult(ex03, st3,  30, "B",  "Improve vocabulary",    true);
        upsertExamResult(ex04, st1,  88, "A",  "Excellent work",        true);
        upsertExamResult(ex04, st2,  76, "B+", "Very good",             true);
        upsertExamResult(ex04, st3,  72, "B",  "Good attempt",          true);
        upsertExamResult(ex05, st1,  92, "A+", "Brilliant",             true);
        upsertExamResult(ex05, st2,  85, "A",  "Excellent",             true);
        upsertExamResult(ex05, st3,  68, "B-", "Work on comprehension", true);
        upsertExamResult(ex06, st1,  80, "B+", "Good",                  true);
        upsertExamResult(ex06, st2,  91, "A+", "Outstanding",           true);
        upsertExamResult(ex06, st3,  74, "B",  "Satisfactory",          true);

        // Class 9A
        upsertExamResult(ex07, st15, 47, "A+", "Excellent",             true);
        upsertExamResult(ex07, st16, 43, "A",  "Very good",             true);
        upsertExamResult(ex08, st15, 45, "A+", "Outstanding",           true);
        upsertExamResult(ex08, st16, 40, "A",  "Excellent",             true);
        upsertExamResult(ex09, st15, 38, "B+", "Very good",             true);
        upsertExamResult(ex09, st16, 46, "A+", "Brilliant writing",     true);
        upsertExamResult(ex10, st15, 95, "A+", "Brilliant",             true);
        upsertExamResult(ex10, st16, 88, "A",  "Excellent",             true);
        upsertExamResult(ex11, st15, 91, "A+", "Outstanding",           true);
        upsertExamResult(ex11, st16, 84, "A",  "Very good",             true);
        upsertExamResult(ex12, st15, 82, "A",  "Excellent",             true);
        upsertExamResult(ex12, st16, 79, "B+", "Very good",             true);

        // Class 10A – Board Mock
        upsertExamResult(ex13, st19, 84, "A",  "Excellent",             true);
        upsertExamResult(ex13, st20, 78, "B+", "Very good",             true);
        upsertExamResult(ex14, st19, 88, "A",  "Excellent",             true);
        upsertExamResult(ex14, st20, 91, "A+", "Outstanding",           true);
        upsertExamResult(ex15, st19, 76, "B+", "Good writing skills",   true);
        upsertExamResult(ex15, st20, 82, "A",  "Excellent",             true);
        upsertExamResult(ex16, st19, 80, "B+", "Very good",             true);
        upsertExamResult(ex16, st20, 74, "B",  "Good",                  true);

        // Class 12 Science – Board Mock
        upsertExamResult(ex17, st26, 27, "A+", "Excellent lab work",    true);
        upsertExamResult(ex17, st27, 25, "A",  "Very good",             true);
        upsertExamResult(ex18, st26, 28, "A+", "Outstanding",           true);
        upsertExamResult(ex18, st27, 24, "A",  "Very good",             true);
        upsertExamResult(ex19, st26, 26, "A+", "Excellent",             true);
        upsertExamResult(ex19, st27, 27, "A+", "Outstanding",           true);
        upsertExamResult(ex20, st26, 92, "A+", "Brilliant",             true);
        upsertExamResult(ex20, st27, 88, "A",  "Excellent",             true);
        upsertExamResult(ex21, st26, 87, "A",  "Excellent",             true);
        upsertExamResult(ex21, st27, 91, "A+", "Outstanding",           true);
        upsertExamResult(ex22, st26, 96, "A+", "Perfect score approach",true);
        upsertExamResult(ex22, st27, 84, "A",  "Excellent",             true);
        upsertExamResult(ex23, st26, 90, "A+", "Outstanding",           true);
        upsertExamResult(ex23, st27, 93, "A+", "Brilliant",             true);

        // ── Attendance (30 school days for all students) ───────────────────
        UUID adminId = userAccountRepository.findByUsername("uttam.kumar")
                .map(UserAccount::getId)
                .orElse(vpUser.getId());

        for (Student st : List.of(st1, st2, st3, st4, st5, st6)) {
            seedAttendance(st, c6, st.getAdmissionNo().endsWith("004") || st.getAdmissionNo().endsWith("005") || st.getAdmissionNo().endsWith("006") ? c6b : c6a, adminId);
        }
        for (Student st : List.of(st7, st8)) seedAttendance(st, c7, c7a, adminId);
        for (Student st : List.of(st9, st10)) seedAttendance(st, c7, c7b, adminId);
        for (Student st : List.of(st11, st12)) seedAttendance(st, c8, c8a, adminId);
        for (Student st : List.of(st13, st14)) seedAttendance(st, c8, c8b, adminId);
        for (Student st : List.of(st15, st16)) seedAttendance(st, c9, c9a, adminId);
        for (Student st : List.of(st17, st18)) seedAttendance(st, c9, c9b, adminId);
        for (Student st : List.of(st19, st20)) seedAttendance(st, c10, c10a, adminId);
        for (Student st : List.of(st21, st22)) seedAttendance(st, c10, c10b, adminId);
        for (Student st : List.of(st23, st24)) seedAttendance(st, c11, c11s, adminId);
        seedAttendance(st25, c11, c11a, adminId);
        for (Student st : List.of(st26, st27)) seedAttendance(st, c12, c12s, adminId);
        seedAttendance(st28, c12, c12a, adminId);

        // ── Fees ──────────────────────────────────────────────────────────
        // Class 6-8 students (most exempt SC/ST; small hostel charges for others)
        seedStudentFees(st1,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st1,  adminId, "Term 2 Hostel Charges",    1800, LocalDate.now().plusDays(30),  FeeStatus.PENDING,            0, null,              null);
        seedStudentFees(st2,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-001");
        seedStudentFees(st3,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PARTIALLY_PAID,  900, "CASH",           null);
        seedStudentFees(st4,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st5,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(120),FeeStatus.PENDING,            0, null,              null);
        seedStudentFees(st6,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-002");

        seedStudentFees(st7,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st7,  adminId, "Activity & Sports Fee",     500, LocalDate.now().minusDays(60), FeeStatus.PAID,            500, "CASH",           null);
        seedStudentFees(st8,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-003");
        seedStudentFees(st9,  adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PARTIALLY_PAID,  600, "CASH",           null);
        seedStudentFees(st10, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);

        seedStudentFees(st11, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-004");
        seedStudentFees(st11, adminId, "Activity & Sports Fee",     500, LocalDate.now().minusDays(60), FeeStatus.PAID,            500, "CASH",           null);
        seedStudentFees(st12, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st13, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CHEQUE",         "CHQ-001");
        seedStudentFees(st14, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(120),FeeStatus.PENDING,            0, null,              null);
        seedStudentFees(st14, adminId, "Term 2 Hostel Charges",    1800, LocalDate.now().plusDays(30),  FeeStatus.PENDING,            0, null,              null);

        // Class 9-10 (₹600/month = ₹1800/term; only non-SC/ST boys pay)
        seedStudentFees(st15, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-005");
        seedStudentFees(st15, adminId, "Board Exam Registration",   500, LocalDate.now().minusDays(45), FeeStatus.PAID,            500, "BANK_TRANSFER",  "UTR-006");
        seedStudentFees(st15, adminId, "Term 2 Hostel Charges",    1800, LocalDate.now().plusDays(20),  FeeStatus.PENDING,            0, null,              null);
        seedStudentFees(st16, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st17, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PARTIALLY_PAID, 1200, "CASH",           null);
        seedStudentFees(st18, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-007");

        seedStudentFees(st19, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-008");
        seedStudentFees(st19, adminId, "Board Exam Form Fee",       1200, LocalDate.now().minusDays(30), FeeStatus.PAID,           1200, "BANK_TRANSFER",  "UTR-009");
        seedStudentFees(st20, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st20, adminId, "Board Exam Form Fee",       1200, LocalDate.now().minusDays(30), FeeStatus.PAID,           1200, "CASH",           null);
        seedStudentFees(st21, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(120),FeeStatus.PENDING,            0, null,              null);
        seedStudentFees(st22, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CHEQUE",         "CHQ-002");

        // Class 11-12
        seedStudentFees(st23, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-010");
        seedStudentFees(st23, adminId, "Lab Charges – Term 1",     1000, LocalDate.now().minusDays(60), FeeStatus.PAID,           1000, "CASH",           null);
        seedStudentFees(st23, adminId, "Term 2 Hostel Charges",    1800, LocalDate.now().plusDays(25),  FeeStatus.PENDING,            0, null,              null);
        seedStudentFees(st24, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st24, adminId, "Lab Charges – Term 1",     1000, LocalDate.now().minusDays(60), FeeStatus.PAID,           1000, "BANK_TRANSFER",  "UTR-011");
        seedStudentFees(st25, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);

        seedStudentFees(st26, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "BANK_TRANSFER",  "UTR-012");
        seedStudentFees(st26, adminId, "Board Registration Fee",   1500, LocalDate.now().minusDays(45), FeeStatus.PAID,           1500, "BANK_TRANSFER",  "UTR-013");
        seedStudentFees(st26, adminId, "Lab Charges – Annual",     2000, LocalDate.now().minusDays(60), FeeStatus.PAID,           2000, "BANK_TRANSFER",  "UTR-014");
        seedStudentFees(st27, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st27, adminId, "Board Registration Fee",   1500, LocalDate.now().minusDays(45), FeeStatus.PAID,           1500, "BANK_TRANSFER",  "UTR-015");
        seedStudentFees(st27, adminId, "Lab Charges – Annual",     2000, LocalDate.now().minusDays(60), FeeStatus.PARTIALLY_PAID, 1000, "CASH",           null);
        seedStudentFees(st28, adminId, "Term 1 Hostel Charges",    1800, LocalDate.now().minusDays(90), FeeStatus.PAID,           1800, "CASH",           null);
        seedStudentFees(st28, adminId, "Board Registration Fee",   1500, LocalDate.now().minusDays(45), FeeStatus.PENDING,            0, null,              null);

        // ── Homework ──────────────────────────────────────────────────────
        seedHomework("Place Value & Number System",        "Complete Ex 1.1 to 1.3 from NCERT textbook.",       c6,  c6a,  tr1Id,  LocalDate.now().plusDays(3));
        seedHomework("Comprehension – The Wild Animals",   "Answer all questions from the passage.",             c6,  c6a,  vpId,   LocalDate.now().plusDays(4));
        seedHomework("Hindi Patra Lekhan",                 "Write a formal letter to your school principal.",    c6,  c6a,  tr2Id,  LocalDate.now().plusDays(2));
        seedHomework("Adaptation in Animals – Diagram",    "Draw and label adaptations of 3 desert animals.",   c6,  c6a,  tr3Id,  LocalDate.now().plusDays(5));
        seedHomework("Our Pasts – Chapter 2 Questions",    "Answer Q1-Q8 from Our Pasts textbook.",              c6,  c6a,  tr6Id,  LocalDate.now().plusDays(4));
        seedHomework("Integers – Worksheet",               "Solve all 30 problems from the worksheet.",          c6,  c6b,  tr1Id,  LocalDate.now().plusDays(3));

        seedHomework("Linear Equations – Practice Set",    "Solve problems 1–25 from Ex 4.2.",                  c9,  c9a,  tr1Id,  LocalDate.now().plusDays(3));
        seedHomework("Atoms and Molecules – Notes",        "Prepare summary notes for Chapter 3.",               c9,  c9a,  tr3Id,  LocalDate.now().plusDays(4));
        seedHomework("The Fun They Had – Analysis",        "Write character analysis of Margie (250 words).",    c9,  c9a,  vpId,   LocalDate.now().plusDays(3));
        seedHomework("Democratic Rights – Q&A",            "Answer all intext and exercise questions.",           c9,  c9a,  tr6Id,  LocalDate.now().plusDays(5));
        seedHomework("Python Basics – Variables Lab",      "Complete Lab exercise 1 and 2 in school notebook.",  c9,  c9a,  tr7Id,  LocalDate.now().plusDays(4));

        seedHomework("Newton's Laws – Numericals",         "Solve 20 numericals from Chapter 5 Force and Laws.", c10, c10a, tr3Id,  LocalDate.now().plusDays(3));
        seedHomework("Carbon Compounds – Worksheet",       "Complete the naming worksheet for organic compounds.",c10, c10a, tr5Id,  LocalDate.now().plusDays(4));
        seedHomework("Board Practice Paper – Maths",       "Attempt 2014 CBSE question paper in 3 hours.",       c10, c10a, tr1Id,  LocalDate.now().plusDays(5));
        seedHomework("Nationalism in India – Timeline",    "Create a detailed timeline poster (1857–1947).",      c10, c10a, tr6Id,  LocalDate.now().plusDays(6));

        seedHomework("Electrostatics – Numericals Set 3",  "Solve Q1–30 from HC Verma Chapter 21.",              c12, c12s, tr3Id,  LocalDate.now().plusDays(3));
        seedHomework("Organic Reactions Chart",            "Prepare summary chart of all named reactions.",       c12, c12s, tr5Id,  LocalDate.now().plusDays(4));
        seedHomework("Genetics Problems – Mendel's Laws",  "Solve 15 cross-breeding problems.",                   c12, c12s, tr4Id,  LocalDate.now().plusDays(3));
        seedHomework("Calculus – Integration Practice",    "Solve Ex 7.10 and 7.11 from NCERT.",                  c12, c12s, tr1Id,  LocalDate.now().plusDays(5));
        seedHomework("Database SQL – Practice Queries",    "Write 20 SQL queries for given schema.",              c12, c12s, tr7Id,  LocalDate.now().plusDays(4));

        log.info("JNV school seed complete: 7 classes, 14 sections, 15 subjects, 12 teachers, 28 students, 15 parents");
    }

    // ── Public-schema data ────────────────────────────────────────────────────

    private void seedPublicData() {
        seedWebsiteConfig();
        seedWebsiteSections();
        seedWebsiteGallery();
        seedAdmissionLeads();
    }

    private void seedWebsiteConfig() {
        if (websiteConfigRepository.findByTenantId(TENANT_ID).isPresent()) return;
        WebsiteConfig config = new WebsiteConfig();
        config.setTenantId(TENANT_ID);
        config.setSchoolTagline("Empowering Rural Talent, Building India's Future");
        config.setSchoolEmail("principal@jnvpalamau.ac.in");
        config.setSchoolPhone("+91 7905025730");
        config.setSchoolAddress("Medininagar, Palamau District");
        config.setSchoolCity("Medininagar");
        config.setSchoolState("Jharkhand");
        config.setSchoolCountry("India");
        config.setSchoolPincode("822101");
        config.setHeroImageUrl("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600");
        config.setAboutText("Jawahar Navodaya Vidyalaya, Palamau is a fully residential co-educational school established under the Navodaya Vidyalaya Samiti, an autonomous body under the Ministry of Education, Government of India. Founded to provide quality modern education to talented rural children, JNV Palamau has been nurturing district-toppers, Olympiad winners, and IIT/NEET qualifiers since 1987.");
        config.setVisionText("To provide good quality modern education to talented children predominantly from rural areas, without regard to their family's socio-economic condition.");
        config.setMissionText("We select the best talent from rural Jharkhand through the Jawahar Navodaya Vidyalaya Selection Test and provide free residential education from Class VI to XII, nurturing academic excellence alongside character formation.");
        config.setFacebookUrl("https://facebook.com/jnvpalamau");
        config.setTwitterUrl("https://twitter.com/jnvpalamau");
        config.setInstagramUrl("https://instagram.com/jnvpalamau");
        config.setYoutubeUrl("https://youtube.com/jnvpalamau");
        config.setAdmissionsOpen(true);
        config.setAdmissionInfo("JNVST (Class VI Lateral Entry) registrations open for 2026-27. Only students from rural areas of Palamau district are eligible. Apply online at navodaya.gov.in.");
        config.setThemeColor("#1E40AF");
        websiteConfigRepository.save(config);
    }

    private void seedWebsiteSections() {
        seedSection("hero", "Jawahar Navodaya Vidyalaya, Palamau",
                "Free residential education for rural talent — Class VI to XII under CBSE.",
                Map.of("cta_text", "Apply via JNVST", "cta_link", "https://navodaya.gov.in"), 0);
        seedSection("about", "About JNV Palamau",
                "Excellence in education for Jharkhand's brightest rural minds.",
                Map.of("founded", "1987", "affiliation", "CBSE (NVS)", "students", "560+", "staff", "45+", "type", "Free Residential Co-educational"), 1);
        seedSection("features", "Why JNV Palamau?",
                "A unique residential school experience that shapes lifelong achievers.",
                Map.of("items", List.of(
                        Map.of("icon", "🏠", "title", "Free Residential",       "desc", "Fully free accommodation, meals, and uniform for all students."),
                        Map.of("icon", "📚", "title", "CBSE Curriculum",        "desc", "Rigorous academics with NCERT books and CBSE board examinations."),
                        Map.of("icon", "🔬", "title", "Science Labs",            "desc", "Well-equipped Physics, Chemistry, and Biology laboratories."),
                        Map.of("icon", "💻", "title", "Computer Lab",            "desc", "Computer Science with internet access for every student."),
                        Map.of("icon", "⚽", "title", "Sports & Yoga",           "desc", "Extensive sports facilities including cricket, kabaddi, and yoga."),
                        Map.of("icon", "🎨", "title", "Cultural Activities",     "desc", "Annual cultural fest, debates, and science exhibitions.")
                )), 2);
        seedSection("achievements", "Our Achievements",
                "Proud milestones from our students and alumni.",
                Map.of(
                        "board_results",   "100% pass rate in Class X and XII for 8 consecutive years",
                        "jee_neet",        "12 students qualified JEE/NEET in 2024",
                        "olympiad",        "8 students represented Jharkhand in national Science Olympiad 2024",
                        "sports",          "District and state level champions in kabaddi, cricket, and athletics"
                ), 3);
        seedSection("faculty", "Our Faculty",
                "Dedicated PGT/TGT teachers selected through DSSSB/NVS examination.",
                Map.of("total_teachers", "42", "avg_experience", "10 years", "pg_qualified", "100%"), 4);
        seedSection("contact", "Contact Us",
                "Reach out for admissions, queries, or to visit our campus.",
                Map.of("office_hours", "Mon–Sat 9:00 AM – 5:00 PM",
                        "admission_helpline", "+91 7905025730"), 5);
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
            {"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800", "Annual Science Exhibition 2024",                 "0"},
            {"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800", "District Level Cricket Champions 2024",             "1"},
            {"https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800", "Class XII Board Felicitation Ceremony",           "2"},
            {"https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800", "Annual Cultural Festival – Navodyam 2024",        "3"},
            {"https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800", "Smart Classroom Inauguration by Principal",       "4"},
            {"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", "JNVST Merit List – Class VI Admission 2024",      "5"},
            {"https://images.unsplash.com/photo-1544717305-2782549b5136?w=800", "NVS National Integration Camp – Our Delegates",     "6"},
            {"https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800", "Career Counselling by IIT Alumni",                "7"},
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
            {"Ramkumar Mahato",   "ramkumar.m@gmail.com",   "9431001001", "Sonu Mahato",        "Class 6",  "My son has scored 90% in Class 5. Is JNVST registration open?",           "NEW"},
            {"Usha Devi",         "usha.d@gmail.com",       "9431001002", "Rani Devi",          "Class 6",  "We are from Chainpur block. Can rural students apply?",                    "CONTACTED"},
            {"Bhola Oraon",       "bhola.o@gmail.com",      "9431001003", "Sunil Oraon",        "Class 6",  "My son wants to study science. What facilities are available?",            "VISITED"},
            {"Sundari Devi",      "sundari.d@gmail.com",    "9431001004", "Champa Kumari",      "Class 6",  "Heard JNV is fully free. Is that true for girls also?",                    "NEW"},
            {"Mohan Kumar Yadav", "mohan.y@gmail.com",      "9431001005", "Ramu Yadav",         "Class 9",  "Lateral entry for Class 9 – is it available this year?",                  "CONTACTED"},
            {"Parwati Devi",      "parwati.d@gmail.com",    "9431001006", "Bablu Kumar",        "Class 6",  "Bablu came 1st in district primary olympiad. Want to enrol.",             "VISITED"},
            {"Chandrika Prasad",  "chandrika.p@gmail.com",  "9431001007", "Neeraj Kumar",       "Class 6",  "Please share prospectus and JNVST syllabus.",                              "NEW"},
            {"Ramavtar Singh",    "ramavtar.s@gmail.com",   "9431001008", "Deepa Singh",        "Class 6",  "Deepa topped Class 5 in government school. Can she apply?",               "ADMITTED"},
            {"Lakhan Mahto",      "lakhan.m@gmail.com",     "9431001009", "Bittu Mahto",        "Class 6",  "What is the selection process? Are there coaching classes?",               "NEW"},
            {"Janaki Devi",       "janaki.d@gmail.com",     "9431001010", "Sita Kumari",        "Class 6",  "Is there a girl's hostel? Is the food provided hygienic?",                "CONTACTED"},
            {"Tulsi Ram Gond",    "tulsi.g@gmail.com",      "9431001011", "Anuj Gond",          "Class 6",  "ST category student. Any reservation in JNVST?",                          "VISITED"},
            {"Saroj Devi",        "saroj.d@gmail.com",      "9431001012", "Pinki Kumari",       "Class 6",  "Last year our daughter missed by 2 marks. Can she try again?",             "NEW"},
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

    // ── Helpers ──────────────────────────────────────────────────────────────

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
            if (dow == 6 || dow == 7) continue;
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

    private Exam upsertExam(String title, LocalDate date, SchoolClass cls, Section section,
                            Subject subject, UUID markedBy, int maxMarks) {
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

    private void upsertExamResult(Exam exam, Student student, int marks, String grade,
                                  String remarks, boolean published) {
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
        boolean alreadyExists = existing.stream()
                .anyMatch(f -> f.getFeeTitle().equals(title) && f.getDueDate().equals(dueDate));
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

    private void seedHomework(String title, String instructions, SchoolClass cls, Section section,
                              UUID assignedBy, LocalDate dueDate) {
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

    // ── Entity upsert helpers ─────────────────────────────────────────────────

    private UserAccount upsertUser(String username, String fullName, UserRole role,
                                   String email, String phone, String password) {
        String u = username.trim().toLowerCase(Locale.ROOT);
        return userAccountRepository.findByUsername(u).orElseGet(() -> {
            UserAccount user = new UserAccount();
            user.setUsername(u);
            user.setFullName(fullName.trim());
            user.setRole(role);
            user.setTenantId(TenantContext.getTenant());
            user.setEmail(email == null ? null : email.trim().toLowerCase(Locale.ROOT));
            user.setPhone(phone == null ? null : phone.trim());
            user.setPasswordHash(passwordEncoder.encode(password));
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
                                  LocalDate dob, Gender gender, String email, String phone,
                                  UserAccount linkedUser) {
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
