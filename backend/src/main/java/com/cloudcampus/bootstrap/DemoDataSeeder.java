package com.cloudcampus.bootstrap;

import com.cloudcampus.academic.entity.SchoolClass;
import com.cloudcampus.academic.entity.Section;
import com.cloudcampus.academic.entity.Subject;
import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.seed", name = "demo-enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final String TENANT_ID = "sunrise-academy";
    private static final String TENANT_SCHEMA = "sunrise";
    private static final String TENANT_SLUG = "sunrise-academy";
    private static final String SCHOOL_NAME = "Sunrise Academy";

    private static final String DEFAULT_USER_PASSWORD = "Demo@2026!";

    private final TenantService tenantService;
    private final TenantRepository tenantRepository;

    private final PasswordEncoder passwordEncoder;
    private final UserAccountRepository userAccountRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedDemoData();
    }

    @Transactional
    void seedDemoData() {
        ensureTenant();

        String previousTenant = TenantContext.getTenant();
        try {
            TenantContext.setTenant(TENANT_SCHEMA);

            // Users
            UserAccount schoolAdmin = upsertUser("priya.sharma", "Priya Sharma", UserRole.SCHOOL_ADMIN, "priya@sunrise.edu", "9000000001");

            UserAccount t1 = upsertUser("sunita.aggarwal", "Sunita Aggarwal", UserRole.TEACHER, "sunita@sunrise.edu", "9000000101");
            UserAccount t2 = upsertUser("vikram.desai", "Vikram Desai", UserRole.TEACHER, "vikram@sunrise.edu", "9000000102");
            UserAccount t3 = upsertUser("lakshmi.krishnan", "Lakshmi Krishnan", UserRole.TEACHER, "lakshmi@sunrise.edu", "9000000103");

            UserAccount s1u = upsertUser("aarav.sharma1", "Aarav Sharma", UserRole.STUDENT, "aarav@sunrise.edu", "9000000201");
            UserAccount s2u = upsertUser("diya.patel2", "Diya Patel", UserRole.STUDENT, "diya@sunrise.edu", "9000000202");
            UserAccount s3u = upsertUser("kabir.singh3", "Kabir Singh", UserRole.STUDENT, "kabir@sunrise.edu", "9000000203");

            UserAccount p1 = upsertUser("ramesh.sharma1", "Ramesh Sharma", UserRole.PARENT, "ramesh@sunrise.edu", "9000000301");
            UserAccount p2 = upsertUser("sujata.patel2", "Sujata Patel", UserRole.PARENT, "sujata@sunrise.edu", "9000000302");

            // Academic
            SchoolClass grade1 = upsertClass("Grade 1", "G1");
            SchoolClass grade3 = upsertClass("Grade 3", "G3");
            SchoolClass grade5 = upsertClass("Grade 5", "G5");

            upsertSection(grade1, "A");
            upsertSection(grade1, "B");
            upsertSection(grade3, "A");
            upsertSection(grade3, "B");
            upsertSection(grade5, "A");

            upsertSubject("Mathematics", "MATH");
            upsertSubject("Science", "SCI");
            upsertSubject("English", "ENG");

            // Teachers
            upsertTeacher("SUN-T01", "Sunita", "Aggarwal", "sunita@sunrise.edu", "9000000101", LocalDate.now().minusYears(5), t1);
            upsertTeacher("SUN-T02", "Vikram", "Desai", "vikram@sunrise.edu", "9000000102", LocalDate.now().minusYears(4), t2);
            upsertTeacher("SUN-T03", "Lakshmi", "Krishnan", "lakshmi@sunrise.edu", "9000000103", LocalDate.now().minusYears(6), t3);

            // Students
            Student s1 = upsertStudent("SUN-S001", "Aarav", "Sharma", LocalDate.of(2015, 6, 10), Gender.MALE, "aarav@sunrise.edu", "9000000201", s1u);
            Student s2 = upsertStudent("SUN-S002", "Diya", "Patel", LocalDate.of(2015, 11, 2), Gender.FEMALE, "diya@sunrise.edu", "9000000202", s2u);
            Student s3 = upsertStudent("SUN-S003", "Kabir", "Singh", LocalDate.of(2014, 3, 22), Gender.MALE, "kabir@sunrise.edu", "9000000203", s3u);

            // Parent ↔ Student links
            upsertParentLink(p1, s1);
            upsertParentLink(p2, s2);

            log.info("Demo seed complete: tenantSchema={}, schoolAdmin={}, teachers=3, students=3, parents=2, classes=3",
                    TENANT_SCHEMA, schoolAdmin.getUsername());
        } finally {
            if (previousTenant == null) {
                TenantContext.clear();
            } else {
                TenantContext.setTenant(previousTenant);
            }
        }
    }

    private void ensureTenant() {
        Tenant existing = tenantRepository.findByTenantId(TENANT_ID).orElse(null);
        if (existing != null) {
            return;
        }

        TenantCreateRequest request = new TenantCreateRequest(
                TENANT_ID,
                TENANT_SLUG,
                SCHOOL_NAME,
                TENANT_SCHEMA,
                null,
            "#2563EB",
            "Demo School Admin",
            "ananya.principal",
            "ananya.principal@cloudcampus.demo",
            "9000000000",
            DEFAULT_USER_PASSWORD
        );
        tenantService.createTenant(request);
        log.info("Demo tenant created: tenantId={}, schema={}", TENANT_ID, TENANT_SCHEMA);
    }

    private UserAccount upsertUser(String username, String fullName, UserRole role, String email, String phone) {
        String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);
        return userAccountRepository.findByUsername(normalizedUsername)
                .orElseGet(() -> {
                    UserAccount user = new UserAccount();
                    user.setUsername(normalizedUsername);
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

    private void upsertTeacher(String employeeNo,
                              String firstName,
                              String lastName,
                              String email,
                              String phone,
                              LocalDate hireDate,
                              UserAccount linkedUser) {
        String normalizedEmployee = employeeNo.trim().toUpperCase(Locale.ROOT);
        if (teacherRepository.existsByEmployeeNo(normalizedEmployee)) {
            return;
        }
        Teacher teacher = new Teacher();
        teacher.setEmployeeNo(normalizedEmployee);
        teacher.setFirstName(firstName.trim());
        teacher.setLastName(lastName.trim());
        teacher.setEmail(email.trim().toLowerCase(Locale.ROOT));
        teacher.setPhone(phone);
        teacher.setHireDate(hireDate);
        teacher.setLinkedUser(linkedUser);
        teacher.setActive(true);
        teacherRepository.save(teacher);
    }

    private Student upsertStudent(String admissionNo,
                                  String firstName,
                                  String lastName,
                                  LocalDate dateOfBirth,
                                  Gender gender,
                                  String email,
                                  String phone,
                                  UserAccount linkedUser) {
        String normalizedAdmission = admissionNo.trim().toUpperCase(Locale.ROOT);
        return studentRepository.findByAdmissionNo(normalizedAdmission)
                .orElseGet(() -> {
                    Student student = new Student();
                    student.setAdmissionNo(normalizedAdmission);
                    student.setFirstName(firstName.trim());
                    student.setLastName(lastName.trim());
                    student.setDateOfBirth(dateOfBirth);
                    student.setGender(gender);
                    student.setEmail(email == null ? null : email.trim().toLowerCase(Locale.ROOT));
                    student.setPhone(phone);
                    student.setLinkedUser(linkedUser);
                    student.setActive(true);
                    return studentRepository.save(student);
                });
    }

    private void upsertParentLink(UserAccount parent, Student student) {
        if (parent == null || parent.getId() == null || student == null || student.getId() == null) {
            return;
        }
        if (parentStudentRepository.existsByParentUserIdAndStudentId(parent.getId(), student.getId())) {
            return;
        }
        ParentStudent link = new ParentStudent();
        link.setParentUserId(parent.getId());
        link.setStudentId(student.getId());
        parentStudentRepository.save(link);
    }

    private SchoolClass upsertClass(String name, String code) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        return schoolClassRepository.findByCode(normalizedCode)
                .orElseGet(() -> {
                    SchoolClass schoolClass = new SchoolClass();
                    schoolClass.setName(name.trim());
                    schoolClass.setCode(normalizedCode);
                    schoolClass.setActive(true);
                    return schoolClassRepository.save(schoolClass);
                });
    }

    private void upsertSection(SchoolClass schoolClass, String name) {
        if (schoolClass == null) {
            return;
        }
        if (sectionRepository.existsBySchoolClass_IdAndNameIgnoreCase(schoolClass.getId(), name.trim())) {
            return;
        }
        Section section = new Section();
        section.setSchoolClass(schoolClass);
        section.setName(name.trim());
        section.setActive(true);
        sectionRepository.save(section);
    }

    private void upsertSubject(String name, String code) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        if (subjectRepository.existsByCode(normalizedCode)) {
            return;
        }
        Subject subject = new Subject();
        subject.setName(name.trim());
        subject.setCode(normalizedCode);
        subject.setActive(true);
        subjectRepository.save(subject);
    }
}
