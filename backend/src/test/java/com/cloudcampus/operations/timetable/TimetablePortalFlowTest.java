package com.cloudcampus.operations.timetable;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.concurrent.atomic.AtomicInteger;

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
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.people.parent.ParentStudentLink;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.people.student.StudentUserLink;
import com.cloudcampus.people.student.StudentUserLinkRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TimetablePortalFlowTest {

    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private ClassLevelRepository classLevelRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ClassSubjectAssignmentRepository classSubjectAssignmentRepository;

    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @Autowired
    private TimetableEntryRepository timetableEntryRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentUserLinkRepository studentUserLinkRepository;

    @Autowired
    private ParentStudentLinkRepository parentStudentLinkRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void teacherParentAndStudentTimetableEndpointsReturnOnlyAuthorizedClassScope() throws Exception {
        Fixture fixture = fixture();
        String parentToken = token(fixture.parent(), UserRole.PARENT, fixture.school().getId());
        String unlinkedParentToken = token(fixture.unlinkedParent(), UserRole.PARENT, fixture.school().getId());
        String studentToken = token(fixture.studentUser(), UserRole.STUDENT, fixture.school().getId());
        String teacherToken = token(fixture.teacher(), UserRole.TEACHER, fixture.school().getId());

        mockMvc.perform(get("/v1/parent/children/{studentId}/timetable", fixture.student().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(fixture.entry().getId()))
                .andExpect(jsonPath("$[0].classLevelId").value(fixture.classLevel().getId()));
        mockMvc.perform(get("/v1/parent/children/{studentId}/timetable", fixture.student().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(unlinkedParentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/student/timetable")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(fixture.entry().getId()));
        mockMvc.perform(get("/v1/teacher/timetable")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(fixture.entry().getId()));
    }

    private Fixture fixture() {
        int suffix = SEQUENCE.incrementAndGet();
        Tenant tenant = tenantRepository.save(new Tenant("tt-portal-" + suffix, "Timetable Portal Tenant"));
        School school = schoolRepository.save(new School(tenant, "tt-school-" + suffix, "Timetable School", true));
        AcademicYear year = academicYearRepository.save(new AcademicYear(
                tenant,
                school,
                "2026-" + suffix,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2027, 3, 31)
        ));
        ClassLevel classLevel = classLevelRepository.save(new ClassLevel(year, "Class " + suffix, 1));
        Section section = sectionRepository.save(new Section(classLevel, "A", 40));
        Subject subject = subjectRepository.save(new Subject(school, "MATH" + suffix, "Mathematics"));
        ClassSubjectAssignment classSubject = classSubjectAssignmentRepository.save(new ClassSubjectAssignment(classLevel, subject));
        TimetableEntry entry = timetableEntryRepository.save(new TimetableEntry(
                school,
                classLevel,
                section,
                subject,
                createUser(tenant, "creator-" + suffix + "@example.com", "Creator", UserRole.SCHOOL_ADMIN),
                DayOfWeek.MONDAY,
                LocalTime.of(9, 0),
                LocalTime.of(9, 40),
                "Mathematics"
        ));
        UserAccount teacher = createUser(tenant, "teacher-" + suffix + "@example.com", "Teacher", UserRole.TEACHER);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, teacher, UserRole.TEACHER, true));
        teacherAssignmentRepository.save(new TeacherAssignment(teacher, classSubject));
        UserAccount parent = createUser(tenant, "parent-" + suffix + "@example.com", "Parent", UserRole.PARENT);
        UserAccount unlinkedParent = createUser(tenant, "unlinked-parent-" + suffix + "@example.com", "Other Parent", UserRole.PARENT);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, parent, UserRole.PARENT, true));
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, unlinkedParent, UserRole.PARENT, true));
        UserAccount studentUser = createUser(tenant, "student-" + suffix + "@example.com", "Student", UserRole.STUDENT);
        Student student = new Student(
                tenant,
                school,
                "TT-" + suffix,
                "Timetable Student",
                classLevel,
                section,
                "1",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        );
        student.attachUser(studentUser);
        studentRepository.save(student);
        studentUserLinkRepository.save(new StudentUserLink(student, studentUser, studentUser));
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, studentUser, UserRole.STUDENT, true));
        parentStudentLinkRepository.save(new ParentStudentLink(
                tenant,
                school,
                student,
                parent,
                "Guardian",
                parent.getEmail(),
                null,
                true
        ));
        return new Fixture(school, classLevel, entry, student, parent, unlinkedParent, studentUser, teacher);
    }

    private UserAccount createUser(Tenant tenant, String email, String displayName, UserRole role) {
        UserAccount user = new UserAccount(tenant, email, displayName, role);
        user.activate(passwordEncoder.encode("StrongPass123!"), displayName, Instant.now());
        return userAccountRepository.save(user);
    }

    private String token(UserAccount user, UserRole role, String activeSchoolId) {
        return jwtAccessTokenService.issueToken(user.getId(), user.getTenant().getId(), role, activeSchoolId);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record Fixture(
            School school,
            ClassLevel classLevel,
            TimetableEntry entry,
            Student student,
            UserAccount parent,
            UserAccount unlinkedParent,
            UserAccount studentUser,
            UserAccount teacher
    ) {
    }
}
