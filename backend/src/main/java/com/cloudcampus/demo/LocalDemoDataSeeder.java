package com.cloudcampus.demo;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

import com.cloudcampus.academic.AcademicYear;
import com.cloudcampus.academic.AcademicYearRepository;
import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.ClassSubjectAssignment;
import com.cloudcampus.academic.ClassSubjectAssignmentRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.academic.Subject;
import com.cloudcampus.academic.SubjectRepository;
import com.cloudcampus.academic.TeacherAssignment;
import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.operations.attendance.AttendanceRecord;
import com.cloudcampus.operations.attendance.AttendanceRecordRepository;
import com.cloudcampus.operations.attendance.AttendanceSession;
import com.cloudcampus.operations.attendance.AttendanceSessionRepository;
import com.cloudcampus.operations.attendance.AttendanceStatus;
import com.cloudcampus.operations.document.SchoolDocument;
import com.cloudcampus.operations.document.SchoolDocumentRepository;
import com.cloudcampus.operations.exam.Exam;
import com.cloudcampus.operations.exam.ExamRepository;
import com.cloudcampus.operations.exam.ExamResult;
import com.cloudcampus.operations.exam.ExamResultRepository;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.operations.finance.FeePayment;
import com.cloudcampus.operations.finance.FeePaymentRepository;
import com.cloudcampus.operations.homework.Homework;
import com.cloudcampus.operations.homework.HomeworkRepository;
import com.cloudcampus.operations.notice.Notice;
import com.cloudcampus.operations.notice.NoticeAudience;
import com.cloudcampus.operations.notice.NoticeRepository;
import com.cloudcampus.operations.timetable.TimetableEntry;
import com.cloudcampus.operations.timetable.TimetableEntryRepository;
import com.cloudcampus.operations.website.WebsitePage;
import com.cloudcampus.operations.website.WebsitePageRepository;
import com.cloudcampus.people.parent.ParentStudentLink;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.staff.StaffProfile;
import com.cloudcampus.people.staff.StaffProfileRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.subscription.TenantSchoolLimit;
import com.cloudcampus.platform.subscription.TenantSchoolLimitRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local")
@Order(100)
public class LocalDemoDataSeeder implements ApplicationRunner {

    private static final String DEMO_PASSWORD = "DemoPass123!";

    private final boolean enabled;
    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final TenantSchoolLimitRepository tenantSchoolLimitRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final ClassSubjectAssignmentRepository classSubjectAssignmentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final FeeDemandRepository feeDemandRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final HomeworkRepository homeworkRepository;
    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final NoticeRepository noticeRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final SchoolDocumentRepository schoolDocumentRepository;
    private final WebsitePageRepository websitePageRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalDemoDataSeeder(
            @Value("${cloudcampus.demo-data.enabled:true}") boolean enabled,
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            TenantSchoolLimitRepository tenantSchoolLimitRepository,
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            AcademicYearRepository academicYearRepository,
            ClassLevelRepository classLevelRepository,
            SectionRepository sectionRepository,
            SubjectRepository subjectRepository,
            ClassSubjectAssignmentRepository classSubjectAssignmentRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            StaffProfileRepository staffProfileRepository,
            StudentRepository studentRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            FeeDemandRepository feeDemandRepository,
            FeePaymentRepository feePaymentRepository,
            AttendanceSessionRepository attendanceSessionRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            HomeworkRepository homeworkRepository,
            ExamRepository examRepository,
            ExamResultRepository examResultRepository,
            NoticeRepository noticeRepository,
            TimetableEntryRepository timetableEntryRepository,
            SchoolDocumentRepository schoolDocumentRepository,
            WebsitePageRepository websitePageRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.enabled = enabled;
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.tenantSchoolLimitRepository = tenantSchoolLimitRepository;
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.academicYearRepository = academicYearRepository;
        this.classLevelRepository = classLevelRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.classSubjectAssignmentRepository = classSubjectAssignmentRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.studentRepository = studentRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.feeDemandRepository = feeDemandRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.attendanceSessionRepository = attendanceSessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.homeworkRepository = homeworkRepository;
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
        this.noticeRepository = noticeRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.schoolDocumentRepository = schoolDocumentRepository;
        this.websitePageRepository = websitePageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        seedTenant("JNV", "Jawahar Navodaya Vidyalaya Samiti", 1, List.of(
                new SchoolSeed("JNV-KNP", "Jawahar Navodaya Vidyalaya Kanpur", true)
        ));
    }

    private void seedTenant(String tenantCode, String tenantName, int maxSchools, List<SchoolSeed> schools) {
        if (tenantRepository.findByCode(tenantCode).isPresent()) {
            return;
        }

        Tenant tenant = tenantRepository.save(new Tenant(tenantCode, tenantName));
        tenantSchoolLimitRepository.save(new TenantSchoolLimit(tenant.getId(), maxSchools));
        activeUser(tenant, "tenant.admin@" + tenantCode.toLowerCase(Locale.ROOT) + ".demo", tenantName + " Tenant Admin", UserRole.TENANT_ADMIN);

        for (SchoolSeed schoolSeed : schools) {
            School school = schoolRepository.save(new School(tenant, schoolSeed.code(), schoolSeed.name(), schoolSeed.primary()));
            seedSchool(tenant, school);
        }
    }

    private void seedSchool(Tenant tenant, School school) {
        String prefix = school.getCode().toLowerCase(Locale.ROOT).replace("-", ".");
        UserAccount schoolAdmin = activeUser(tenant, "principal@" + prefix + ".demo", "Dr. Uttam Kumar", UserRole.SCHOOL_ADMIN);
        UserAccount principal = activeUser(tenant, "principal.user@" + prefix + ".demo", "Principal User", UserRole.PRINCIPAL);
        UserAccount mathTeacher = activeUser(tenant, "teacher.math@" + prefix + ".demo", "Asha Mathur", UserRole.TEACHER);
        UserAccount englishTeacher = activeUser(tenant, "teacher.english@" + prefix + ".demo", "Rohan Sen", UserRole.TEACHER);
        UserAccount scienceTeacher = activeUser(tenant, "teacher.science@" + prefix + ".demo", "Farah Khan", UserRole.TEACHER);
        UserAccount finance = activeUser(tenant, "finance@" + prefix + ".demo", "Neha Finance", UserRole.FINANCE_STAFF);
        UserAccount staff = activeUser(tenant, "office@" + prefix + ".demo", "Kiran Office", UserRole.STAFF);
        UserAccount parent = activeUser(tenant, "parent@" + prefix + ".demo", "Meera Sharma", UserRole.PARENT);
        UserAccount studentLogin = activeUser(tenant, "student@" + prefix + ".demo", "Aarav Sharma", UserRole.STUDENT);

        grant(tenant, school, schoolAdmin, UserRole.SCHOOL_ADMIN, true);
        grant(tenant, school, principal, UserRole.PRINCIPAL, true);
        grant(tenant, school, mathTeacher, UserRole.TEACHER, true);
        grant(tenant, school, englishTeacher, UserRole.TEACHER, true);
        grant(tenant, school, scienceTeacher, UserRole.TEACHER, true);
        grant(tenant, school, finance, UserRole.FINANCE_STAFF, true);
        grant(tenant, school, staff, UserRole.STAFF, true);
        grant(tenant, school, parent, UserRole.PARENT, true);
        grant(tenant, school, studentLogin, UserRole.STUDENT, true);

        staffProfile(tenant, school, mathTeacher, UserRole.TEACHER, "JNV-KNP-T001", "Asha Mathur", "Mathematics", "PGT Mathematics");
        staffProfile(tenant, school, englishTeacher, UserRole.TEACHER, "JNV-KNP-T002", "Rohan Sen", "English", "TGT English");
        staffProfile(tenant, school, scienceTeacher, UserRole.TEACHER, "JNV-KNP-T003", "Farah Khan", "Science", "TGT Science");
        staffProfile(tenant, school, finance, UserRole.FINANCE_STAFF, "JNV-KNP-F001", "Neha Finance", "Finance", "Accounts Assistant");
        staffProfile(tenant, school, staff, UserRole.STAFF, "JNV-KNP-S001", "Kiran Office", "Administration", "Office Coordinator");

        AcademicYear year = academicYearRepository.save(new AcademicYear(school.getTenant(), school, "2026-27", LocalDate.of(2026, 4, 1), LocalDate.of(2027, 3, 31)));
        year.activate();
        ClassLevel gradeSix = classLevelRepository.save(new ClassLevel(year, "Class VI", 6));
        ClassLevel gradeSeven = classLevelRepository.save(new ClassLevel(year, "Class VII", 7));
        ClassLevel gradeEight = classLevelRepository.save(new ClassLevel(year, "Class VIII", 8));
        Section sixA = sectionRepository.save(new Section(gradeSix, "A", 40));
        Section sevenA = sectionRepository.save(new Section(gradeSeven, "A", 40));
        Section eightA = sectionRepository.save(new Section(gradeEight, "A", 40));
        Subject math = subjectRepository.save(new Subject(school, "MATH", "Mathematics"));
        Subject english = subjectRepository.save(new Subject(school, "ENG", "English"));
        Subject science = subjectRepository.save(new Subject(school, "SCI", "Science"));
        Subject socialScience = subjectRepository.save(new Subject(school, "SST", "Social Science"));
        Subject hindi = subjectRepository.save(new Subject(school, "HIN", "Hindi"));
        ClassSubjectAssignment sixMath = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeSix, math));
        ClassSubjectAssignment sevenEnglish = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeSeven, english));
        ClassSubjectAssignment eightScience = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeEight, science));
        ClassSubjectAssignment sixScience = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeSix, science));
        ClassSubjectAssignment sevenSocialScience = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeSeven, socialScience));
        ClassSubjectAssignment eightHindi = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeEight, hindi));
        teacherAssignmentRepository.save(new TeacherAssignment(mathTeacher, sixMath));
        teacherAssignmentRepository.save(new TeacherAssignment(englishTeacher, sevenEnglish));
        teacherAssignmentRepository.save(new TeacherAssignment(scienceTeacher, eightScience));
        teacherAssignmentRepository.save(new TeacherAssignment(scienceTeacher, sixScience));
        teacherAssignmentRepository.save(new TeacherAssignment(englishTeacher, sevenSocialScience));
        teacherAssignmentRepository.save(new TeacherAssignment(mathTeacher, eightHindi));

        List<Student> students = studentRepository.saveAll(List.of(
                student(tenant, school, "JNV-KNP-001", "Aarav Sharma", gradeSix, sixA, "1", "2014-04-10", "MALE"),
                student(tenant, school, "JNV-KNP-002", "Isha Verma", gradeSix, sixA, "2", "2014-09-18", "FEMALE"),
                student(tenant, school, "JNV-KNP-003", "Naman Yadav", gradeSix, sixA, "3", "2014-12-05", "MALE"),
                student(tenant, school, "JNV-KNP-004", "Sneha Patel", gradeSix, sixA, "4", "2014-07-20", "FEMALE"),
                student(tenant, school, "JNV-KNP-005", "Kabir Khan", gradeSeven, sevenA, "1", "2013-01-22", "MALE"),
                student(tenant, school, "JNV-KNP-006", "Ananya Singh", gradeSeven, sevenA, "2", "2013-03-11", "FEMALE"),
                student(tenant, school, "JNV-KNP-007", "Dev Mishra", gradeSeven, sevenA, "3", "2013-08-02", "MALE"),
                student(tenant, school, "JNV-KNP-008", "Pihu Gupta", gradeSeven, sevenA, "4", "2013-10-17", "FEMALE"),
                student(tenant, school, "JNV-KNP-009", "Maya Iyer", gradeEight, eightA, "1", "2012-11-03", "FEMALE"),
                student(tenant, school, "JNV-KNP-010", "Vihaan Rao", gradeEight, eightA, "2", "2012-07-15", "MALE"),
                student(tenant, school, "JNV-KNP-011", "Ritika Tiwari", gradeEight, eightA, "3", "2012-09-25", "FEMALE"),
                student(tenant, school, "JNV-KNP-012", "Arjun Maurya", gradeEight, eightA, "4", "2012-05-06", "MALE")
        ));
        students.get(0).attachUser(studentLogin);
        parentStudentLinkRepository.save(new ParentStudentLink(tenant, school, students.get(0), parent, "Mother", parent.getEmail(), "+91-90000-10001", true));

        seedFees(tenant, school, schoolAdmin, students);
        seedAttendanceMonth(sixMath, sixA, mathTeacher, students.subList(0, 4));
        seedAttendanceMonth(sevenEnglish, sevenA, englishTeacher, students.subList(4, 8));
        seedAttendanceMonth(eightScience, eightA, scienceTeacher, students.subList(8, 12));
        seedHomework(gradeSix, sixA, math, mathTeacher, "Fractions and decimals practice");
        seedHomework(gradeSeven, sevenA, english, englishTeacher, "Reading comprehension - The Banyan Tree");
        seedHomework(gradeEight, eightA, science, scienceTeacher, "Light and sound worksheet");
        Exam exam = examRepository.save(new Exam(gradeSix, sixA, math, mathTeacher, "Monthly Test - Mathematics", LocalDate.now().plusDays(7), new BigDecimal("50.00")));
        examResultRepository.save(new ExamResult(exam, students.get(0), mathTeacher, new BigDecimal("43.00")));
        examResultRepository.save(new ExamResult(exam, students.get(1), mathTeacher, new BigDecimal("39.00")));
        examResultRepository.save(new ExamResult(exam, students.get(2), mathTeacher, new BigDecimal("41.00")));
        examResultRepository.save(new ExamResult(exam, students.get(3), mathTeacher, new BigDecimal("45.00")));
        exam.publish(mathTeacher, Instant.now());
        Notice notice = noticeRepository.save(new Notice(school, null, null, schoolAdmin, "Morning assembly and house duty roster", "JNV Kanpur demo data includes one month of attendance, fees, homework, exams, notices and timetable records.", NoticeAudience.ALL));
        notice.publish(schoolAdmin, Instant.now());
        seedTimetable(school, gradeSix, sixA, math, schoolAdmin, "Class VI Mathematics");
        timetableEntryRepository.save(new TimetableEntry(school, gradeSeven, sevenA, english, schoolAdmin, DayOfWeek.TUESDAY, LocalTime.of(10, 0), LocalTime.of(10, 45), "Class VII English"));
        timetableEntryRepository.save(new TimetableEntry(school, gradeEight, eightA, science, schoolAdmin, DayOfWeek.WEDNESDAY, LocalTime.of(11, 0), LocalTime.of(11, 45), "Class VIII Science"));
        timetableEntryRepository.save(new TimetableEntry(school, gradeSix, sixA, science, schoolAdmin, DayOfWeek.THURSDAY, LocalTime.of(12, 0), LocalTime.of(12, 45), "Class VI Science"));
        timetableEntryRepository.save(new TimetableEntry(school, gradeEight, eightA, hindi, schoolAdmin, DayOfWeek.FRIDAY, LocalTime.of(9, 0), LocalTime.of(9, 45), "Class VIII Hindi"));
        schoolDocumentRepository.save(new SchoolDocument(school, gradeSix, null, schoolAdmin, "Academic Calendar 2026-27", "jnv-academic-calendar.pdf", "demo/jnv-kanpur/academic-calendar.pdf"));
        schoolDocumentRepository.save(new SchoolDocument(school, null, null, schoolAdmin, "Hostel Duty Roster", "hostel-duty-roster.pdf", "demo/jnv-kanpur/hostel-duty-roster.pdf"));
        WebsitePage about = websitePageRepository.save(new WebsitePage(school, schoolAdmin, "about", "About " + school.getName(), school.getName() + " is a residential JNV-style CloudCampus demo school with academics, hostel routines, staff, students, fees and one month of operations data."));
        about.publish(schoolAdmin, Instant.now());
    }

    private UserAccount activeUser(Tenant tenant, String email, String displayName, UserRole role) {
        return userAccountRepository.findByTenantIdAndEmail(tenant.getId(), email)
                .orElseGet(() -> {
                    UserAccount user = new UserAccount(tenant, email, displayName, role);
                    user.activate(passwordEncoder.encode(DEMO_PASSWORD), displayName, Instant.now());
                    return userAccountRepository.save(user);
                });
    }

    private void grant(Tenant tenant, School school, UserAccount user, UserRole role, boolean primary) {
        if (!userSchoolAccessRepository.existsByUserIdAndSchoolId(user.getId(), school.getId())) {
            userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, user, role, primary));
        }
    }

    private void staffProfile(
            Tenant tenant,
            School school,
            UserAccount user,
            UserRole role,
            String employeeNumber,
            String fullName,
            String department,
            String designation
    ) {
        if (staffProfileRepository.findBySchoolIdAndUserId(school.getId(), user.getId()).isEmpty()) {
            staffProfileRepository.save(new StaffProfile(
                    tenant,
                    school,
                    user,
                    role,
                    employeeNumber.toUpperCase(Locale.ROOT),
                    fullName,
                    user.getEmail(),
                    department,
                    designation,
                    true
            ));
        }
    }

    private Student student(
            Tenant tenant,
            School school,
            String admissionNumber,
            String fullName,
            ClassLevel classLevel,
            Section section,
            String rollNumber,
            String dateOfBirth,
            String gender
    ) {
        return new Student(
                tenant,
                school,
                admissionNumber,
                fullName,
                classLevel,
                section,
                rollNumber,
                LocalDate.parse(dateOfBirth),
                gender,
                "Demo Guardian",
                "guardian." + admissionNumber.toLowerCase(Locale.ROOT) + "@demo.parent",
                "+91-90000-20000",
                Instant.now()
        );
    }

    private void seedFees(Tenant tenant, School school, UserAccount schoolAdmin, List<Student> students) {
        int index = 1;
        for (Student student : students) {
            FeeDemand demand = feeDemandRepository.save(new FeeDemand(
                    tenant,
                    school,
                    student,
                    "May mess and activity contribution",
                    new BigDecimal(index % 3 == 0 ? "9500.00" : "12500.00"),
                    LocalDate.now().minusDays(3).plusDays(index)
            ));
            if (index % 4 == 1) {
                demand.recordPayment(new BigDecimal("5000.00"));
                feePaymentRepository.save(new FeePayment(
                        tenant,
                        school,
                        demand,
                        student,
                        schoolAdmin,
                        new BigDecimal("5000.00"),
                        "cash",
                        "JNV-MESS-" + student.getAdmissionNumber(),
                        "RCPT-" + school.getCode() + "-" + String.format(Locale.ROOT, "%03d", index),
                        Instant.now().minusSeconds(86400L * (12 - Math.min(index, 11)))
                ));
            }
            index++;
        }
    }

    private void seedAttendanceMonth(
            ClassSubjectAssignment assignment,
            Section section,
            UserAccount teacher,
            List<Student> students
    ) {
        LocalDate startDate = LocalDate.now().minusDays(29);
        for (int day = 0; day < 30; day++) {
            LocalDate attendanceDate = startDate.plusDays(day);
            AttendanceSession session = attendanceSessionRepository.save(new AttendanceSession(
                    assignment.getClassLevel(),
                    section,
                    assignment.getSubject(),
                    teacher,
                    attendanceDate
            ));
            for (int index = 0; index < students.size(); index++) {
                AttendanceStatus status = AttendanceStatus.PRESENT;
                String remark = "Morning attendance";
                if ((day + index) % 17 == 0) {
                    status = AttendanceStatus.ABSENT;
                    remark = "Medical room follow-up";
                } else if ((day + index) % 11 == 0) {
                    status = AttendanceStatus.LATE;
                    remark = "Late after assembly";
                }
                attendanceRecordRepository.save(new AttendanceRecord(session, students.get(index), status, remark));
            }
        }
    }

    private void seedHomework(
            ClassLevel classLevel,
            Section section,
            Subject subject,
            UserAccount teacher,
            String title
    ) {
        for (int week = 0; week < 4; week++) {
            homeworkRepository.save(new Homework(
                    classLevel,
                    section,
                    subject,
                    teacher,
                    title + " - Week " + (week + 1),
                    "Complete the notebook exercise and revise the classroom discussion notes.",
                    LocalDate.now().minusDays(21L - (week * 7L))
            ));
        }
    }

    private void seedTimetable(
            School school,
            ClassLevel classLevel,
            Section section,
            Subject subject,
            UserAccount schoolAdmin,
            String title
    ) {
        timetableEntryRepository.save(new TimetableEntry(
                school,
                classLevel,
                section,
                subject,
                schoolAdmin,
                DayOfWeek.MONDAY,
                LocalTime.of(9, 0),
                LocalTime.of(9, 45),
                title
        ));
    }

    private record SchoolSeed(String code, String name, boolean primary) {
    }
}
