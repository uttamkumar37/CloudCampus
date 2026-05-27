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
        seedTenant("DEMO-ONE", "Green Valley Education Trust", 1, List.of(
                new SchoolSeed("GVPS", "Green Valley Public School", true)
        ));
        seedTenant("DEMO-TWO", "Northstar Learning Group", 2, List.of(
                new SchoolSeed("NS-CENTRAL", "Northstar Central School", true),
                new SchoolSeed("NS-WEST", "Northstar West School", false)
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
        UserAccount schoolAdmin = activeUser(tenant, "admin@" + prefix + ".demo", school.getName() + " Admin", UserRole.SCHOOL_ADMIN);
        UserAccount teacherOne = activeUser(tenant, "teacher.math@" + prefix + ".demo", "Asha Mathur", UserRole.TEACHER);
        UserAccount teacherTwo = activeUser(tenant, "teacher.english@" + prefix + ".demo", "Rohan Sen", UserRole.TEACHER);
        UserAccount finance = activeUser(tenant, "finance@" + prefix + ".demo", "Neha Finance", UserRole.FINANCE_STAFF);
        UserAccount staff = activeUser(tenant, "staff@" + prefix + ".demo", "Kiran Office", UserRole.STAFF);
        UserAccount parent = activeUser(tenant, "parent@" + prefix + ".demo", "Meera Parent", UserRole.PARENT);
        UserAccount studentLogin = activeUser(tenant, "student@" + prefix + ".demo", "Aarav Student", UserRole.STUDENT);

        grant(tenant, school, schoolAdmin, UserRole.SCHOOL_ADMIN, true);
        grant(tenant, school, teacherOne, UserRole.TEACHER, true);
        grant(tenant, school, teacherTwo, UserRole.TEACHER, true);
        grant(tenant, school, finance, UserRole.FINANCE_STAFF, true);
        grant(tenant, school, staff, UserRole.STAFF, true);

        staffProfile(tenant, school, teacherOne, UserRole.TEACHER, prefix + "-T001", "Asha Mathur", "Mathematics", "Senior Teacher");
        staffProfile(tenant, school, teacherTwo, UserRole.TEACHER, prefix + "-T002", "Rohan Sen", "English", "Teacher");
        staffProfile(tenant, school, finance, UserRole.FINANCE_STAFF, prefix + "-F001", "Neha Finance", "Finance", "Accounts Executive");
        staffProfile(tenant, school, staff, UserRole.STAFF, prefix + "-S001", "Kiran Office", "Administration", "Office Coordinator");

        AcademicYear year = academicYearRepository.save(new AcademicYear(school.getTenant(), school, "2026-27", LocalDate.of(2026, 4, 1), LocalDate.of(2027, 3, 31)));
        year.activate();
        ClassLevel gradeSix = classLevelRepository.save(new ClassLevel(year, "Grade 6", 6));
        ClassLevel gradeSeven = classLevelRepository.save(new ClassLevel(year, "Grade 7", 7));
        ClassLevel gradeEight = classLevelRepository.save(new ClassLevel(year, "Grade 8", 8));
        Section sixA = sectionRepository.save(new Section(gradeSix, "A", 40));
        Section sevenA = sectionRepository.save(new Section(gradeSeven, "A", 40));
        Section eightA = sectionRepository.save(new Section(gradeEight, "A", 40));
        Subject math = subjectRepository.save(new Subject(school, "MATH", "Mathematics"));
        Subject english = subjectRepository.save(new Subject(school, "ENG", "English"));
        Subject science = subjectRepository.save(new Subject(school, "SCI", "Science"));
        ClassSubjectAssignment sixMath = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeSix, math));
        ClassSubjectAssignment sevenEnglish = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeSeven, english));
        ClassSubjectAssignment eightScience = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(gradeEight, science));
        teacherAssignmentRepository.save(new TeacherAssignment(teacherOne, sixMath));
        teacherAssignmentRepository.save(new TeacherAssignment(teacherTwo, sevenEnglish));
        teacherAssignmentRepository.save(new TeacherAssignment(teacherOne, eightScience));

        List<Student> students = studentRepository.saveAll(List.of(
                student(tenant, school, school.getCode() + "-001", "Aarav Sharma", gradeSix, sixA, "1", "2014-04-10", "MALE"),
                student(tenant, school, school.getCode() + "-002", "Isha Verma", gradeSix, sixA, "2", "2014-09-18", "FEMALE"),
                student(tenant, school, school.getCode() + "-003", "Kabir Khan", gradeSeven, sevenA, "3", "2013-01-22", "MALE"),
                student(tenant, school, school.getCode() + "-004", "Maya Iyer", gradeEight, eightA, "4", "2012-11-03", "FEMALE"),
                student(tenant, school, school.getCode() + "-005", "Vihaan Rao", gradeEight, eightA, "5", "2012-07-15", "MALE")
        ));
        students.get(0).attachUser(studentLogin);
        parentStudentLinkRepository.save(new ParentStudentLink(tenant, school, students.get(0), parent, "Mother", parent.getEmail(), "+91-90000-10001", true));

        seedFees(tenant, school, schoolAdmin, students);
        seedAttendance(sixMath, sixA, teacherOne, students.subList(0, 2));
        homeworkRepository.save(new Homework(gradeSix, sixA, math, teacherOne, "Fractions practice", "Complete worksheet pages 12-14 and upload your solutions.", LocalDate.now().plusDays(3)));
        Exam exam = examRepository.save(new Exam(gradeSix, sixA, math, teacherOne, "Unit Test 1 - Mathematics", LocalDate.now().plusDays(7), new BigDecimal("50.00")));
        examResultRepository.save(new ExamResult(exam, students.get(0), teacherOne, new BigDecimal("43.00")));
        examResultRepository.save(new ExamResult(exam, students.get(1), teacherOne, new BigDecimal("39.00")));
        exam.publish(teacherOne, Instant.now());
        Notice notice = noticeRepository.save(new Notice(school, null, null, schoolAdmin, "Welcome to the 2026-27 academic year", "Classes, attendance, homework and fee workflows are ready for this demo school.", NoticeAudience.ALL));
        notice.publish(schoolAdmin, Instant.now());
        timetableEntryRepository.save(new TimetableEntry(school, gradeSix, sixA, math, schoolAdmin, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(9, 45), "Grade 6 Mathematics"));
        timetableEntryRepository.save(new TimetableEntry(school, gradeSeven, sevenA, english, schoolAdmin, DayOfWeek.TUESDAY, LocalTime.of(10, 0), LocalTime.of(10, 45), "Grade 7 English"));
        schoolDocumentRepository.save(new SchoolDocument(school, gradeSix, null, schoolAdmin, "Academic Calendar 2026-27", "academic-calendar.pdf", "demo/" + school.getCode().toLowerCase(Locale.ROOT) + "/academic-calendar.pdf"));
        WebsitePage about = websitePageRepository.save(new WebsitePage(school, schoolAdmin, "about", "About " + school.getName(), school.getName() + " is a demo CloudCampus school with academics, staff, students, fees and operations data."));
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
                    "Term " + index + " tuition fee",
                    new BigDecimal("12500.00"),
                    LocalDate.now().plusDays(15 + index)
            ));
            if (index == 1) {
                demand.recordPayment(new BigDecimal("5000.00"));
                feePaymentRepository.save(new FeePayment(
                        tenant,
                        school,
                        demand,
                        student,
                        schoolAdmin,
                        new BigDecimal("5000.00"),
                        "cash",
                        "DEMO-CASH-" + school.getCode(),
                        "RCPT-" + school.getCode() + "-001",
                        Instant.now()
                ));
            }
            index++;
        }
    }

    private void seedAttendance(
            ClassSubjectAssignment assignment,
            Section section,
            UserAccount teacher,
            List<Student> students
    ) {
        AttendanceSession session = attendanceSessionRepository.save(new AttendanceSession(
                assignment.getClassLevel(),
                section,
                assignment.getSubject(),
                teacher,
                LocalDate.now()
        ));
        attendanceRecordRepository.save(new AttendanceRecord(session, students.get(0), AttendanceStatus.PRESENT, "On time"));
        attendanceRecordRepository.save(new AttendanceRecord(session, students.get(1), AttendanceStatus.LATE, "Arrived after assembly"));
    }

    private record SchoolSeed(String code, String name, boolean primary) {
    }
}
