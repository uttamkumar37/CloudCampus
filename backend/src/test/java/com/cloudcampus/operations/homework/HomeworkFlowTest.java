package com.cloudcampus.operations.homework;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.cloudcampus.testsupport.AuthTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class HomeworkFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private ClassLevelRepository classLevelRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private HomeworkRepository homeworkRepository;

    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void teacherPublishesHomeworkParentAndStudentSeeItAndStudentSubmits() throws Exception {
        JsonNode onboarding = onboard("home-life-a", "home-school-a", "home-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        AcademicSetup setup = academicSetup(schoolAdminToken, "2026-2027", "Class 1");
        JsonNode subject = createSubject(schoolAdminToken, "eng", "English");
        JsonNode classSubject = assignSubjectToClass(schoolAdminToken, setup.classLevelId(), subject.at("/id").asText());
        UserAccount teacher = createTeacher(tenant, "home-teacher-a@example.com", "Homework Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), classSubject.at("/id").asText());
        String teacherToken = login("home-teacher-a@example.com", "TeacherStrong123!").at("/accessToken").asText();
        Student student = studentRepository.save(new Student(
                tenant,
                school,
                "HOME-100",
                "Homework Student",
                setup.classLevel(),
                setup.section(),
                "1",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        ));

        JsonNode homework = jsonBody(mockMvc.perform(post("/v1/teacher/homework")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "title": "Read chapter one",
                                  "instructions": "Answer questions one and two.",
                                  "dueDate": "2026-06-15"
                                }
                                """.formatted(
                                setup.classLevelId(),
                                setup.sectionId(),
                                subject.at("/id").asText()
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(tenant.getId()))
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.createdByUserId").value(teacher.getId()))
                .andExpect(jsonPath("$.createdByRole").value("TEACHER"))
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andReturn());
        String homeworkId = homework.at("/id").asText();

        mockMvc.perform(get("/v1/teacher/homework")
                        .queryParam("classLevelId", setup.classLevelId())
                        .queryParam("subjectId", subject.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(homeworkId));

        JsonNode parentLink = linkParent(schoolAdminToken, student.getId(), "home-parent-a@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentHomeStrong123!", "Homework Parent");
        String parentToken = login("home-parent-a@example.com", "ParentHomeStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/parent/children/{studentId}/homework", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(homeworkId))
                .andExpect(jsonPath("$[0].submissions.length()").value(0));

        JsonNode studentInvitation = inviteStudentLogin(schoolAdminToken, student.getId(), "home-student-a@example.com");
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentHomeStrong123!", "Homework Student");
        String studentToken = login("home-student-a@example.com", "StudentHomeStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/student/homework")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(homeworkId));

        mockMvc.perform(post("/v1/student/homework/{homeworkId}/submissions", homeworkId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "content": "My private homework answer"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.submissions[0].studentId").value(student.getId()))
                .andExpect(jsonPath("$.submissions[0].content").value("My private homework answer"));

        mockMvc.perform(post("/v1/student/homework/{homeworkId}/submissions", homeworkId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "content": "Duplicate answer"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        assertThat(homeworkRepository.findById(homeworkId)).isPresent();
        assertThat(homeworkSubmissionRepository.findByHomeworkIdOrderBySubmittedAtAsc(homeworkId)).hasSize(1);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.HOMEWORK_PUBLISHED, AuditAction.HOMEWORK_SUBMITTED);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getMetadataJson() == null ? "" : auditLog.getMetadataJson())
                .noneMatch(metadata -> metadata.contains("My private homework answer"))
                .noneMatch(metadata -> metadata.contains("Answer questions one and two."));
    }

    @Test
    void schoolAdminCannotCreateOrReadAnotherSchoolsHomework() throws Exception {
        JsonNode first = onboard("home-life-b1", "home-school-b1", "home-admin-b1@example.com");
        JsonNode second = onboard("home-life-b2", "home-school-b2", "home-admin-b2@example.com");
        String firstAdminToken = activateSchoolAdmin(first);
        String secondAdminToken = activateSchoolAdmin(second);
        AcademicSetup secondSetup = academicSetup(secondAdminToken, "2026-2027", "Class 2");
        JsonNode secondSubject = createSubject(secondAdminToken, "sci", "Science");
        assignSubjectToClass(secondAdminToken, secondSetup.classLevelId(), secondSubject.at("/id").asText());
        String secondHomeworkId = createSchoolHomework(
                secondAdminToken,
                secondSetup.classLevelId(),
                secondSetup.sectionId(),
                secondSubject.at("/id").asText(),
                "Other homework"
        ).at("/id").asText();

        mockMvc.perform(post("/v1/school-admin/homework")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "title": "Blocked homework",
                                  "instructions": "Do not create this.",
                                  "dueDate": "2026-06-16"
                                }
                                """.formatted(
                                secondSetup.classLevelId(),
                                secondSetup.sectionId(),
                                secondSubject.at("/id").asText()
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/school-admin/homework/{homeworkId}", secondHomeworkId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void teacherParentAndStudentCannotAccessUnassignedHomework() throws Exception {
        JsonNode onboarding = onboard("home-life-c", "home-school-c", "home-admin-c@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        AcademicSetup assignedSetup = academicSetup(schoolAdminToken, "2026-2027", "Class 1");
        AcademicSetup unassignedSetup = academicSetup(schoolAdminToken, "2027-2028", "Class 2");
        JsonNode subject = createSubject(schoolAdminToken, "math", "Mathematics");
        JsonNode assignedClassSubject = assignSubjectToClass(
                schoolAdminToken,
                assignedSetup.classLevelId(),
                subject.at("/id").asText()
        );
        assignSubjectToClass(schoolAdminToken, unassignedSetup.classLevelId(), subject.at("/id").asText());
        UserAccount teacher = createTeacher(tenant, "home-teacher-c@example.com", "Homework Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), assignedClassSubject.at("/id").asText());
        String teacherToken = login("home-teacher-c@example.com", "TeacherStrong123!").at("/accessToken").asText();
        Student linkedStudent = studentRepository.save(new Student(
                tenant,
                school,
                "HOME-300",
                "Linked Homework Student",
                assignedSetup.classLevel(),
                assignedSetup.section(),
                "1",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        ));
        Student unlinkedStudent = studentRepository.save(new Student(
                tenant,
                school,
                "HOME-301",
                "Unlinked Homework Student",
                unassignedSetup.classLevel(),
                unassignedSetup.section(),
                "1",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        ));
        String unassignedHomeworkId = createSchoolHomework(
                schoolAdminToken,
                unassignedSetup.classLevelId(),
                unassignedSetup.sectionId(),
                subject.at("/id").asText(),
                "Unassigned homework"
        ).at("/id").asText();

        mockMvc.perform(post("/v1/teacher/homework")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "title": "Blocked teacher homework",
                                  "instructions": "Teacher is not assigned here.",
                                  "dueDate": "2026-06-17"
                                }
                                """.formatted(
                                unassignedSetup.classLevelId(),
                                unassignedSetup.sectionId(),
                                subject.at("/id").asText()
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/teacher/homework/{homeworkId}", unassignedHomeworkId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        JsonNode parentLink = linkParent(schoolAdminToken, linkedStudent.getId(), "home-parent-c@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentHomeStrong123!", "Homework Parent");
        String parentToken = login("home-parent-c@example.com", "ParentHomeStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/parent/children/{studentId}/homework", unlinkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        JsonNode studentInvitation = inviteStudentLogin(schoolAdminToken, linkedStudent.getId(), "home-student-c@example.com");
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentHomeStrong123!", "Homework Student");
        String studentToken = login("home-student-c@example.com", "StudentHomeStrong123!").at("/accessToken").asText();
        mockMvc.perform(post("/v1/student/homework/{homeworkId}/submissions", unassignedHomeworkId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "content": "Should not submit"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private JsonNode createSchoolHomework(
            String token,
            String classLevelId,
            String sectionId,
            String subjectId,
            String title
    ) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/homework")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "title": "%s",
                                  "instructions": "Complete the worksheet.",
                                  "dueDate": "2026-06-20"
                                }
                                """.formatted(classLevelId, sectionId, subjectId, title)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private JsonNode createSubject(String token, String code, String name) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/subjects")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "%s",
                                  "name": "%s"
                                }
                                """.formatted(code, name)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private JsonNode assignSubjectToClass(String token, String classLevelId, String subjectId) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/class-subjects")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "subjectId": "%s"
                                }
                                """.formatted(classLevelId, subjectId)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private JsonNode assignTeacher(String token, String teacherUserId, String classSubjectAssignmentId) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/teacher-assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "teacherUserId": "%s",
                                  "classSubjectAssignmentId": "%s"
                                }
                                """.formatted(teacherUserId, classSubjectAssignmentId)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private JsonNode linkParent(String token, String studentId, String email) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/parent-links")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "parentEmail": "%s",
                                  "parentFullName": "Homework Parent",
                                  "relationship": "Father",
                                  "primaryContact": true
                                }
                                """.formatted(studentId, email)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private JsonNode inviteStudentLogin(String token, String studentId, String email) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/students/{studentId}/login-invitation", studentId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "%s"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private AcademicSetup academicSetup(String token, String academicYearName, String className) throws Exception {
        JsonNode academicYear = jsonBody(mockMvc.perform(post("/v1/school-admin/academic-years")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "%s",
                                  "startDate": "2026-04-01",
                                  "endDate": "2027-03-31",
                                  "activate": true
                                }
                                """.formatted(academicYearName)))
                .andExpect(status().isCreated())
                .andReturn());
        JsonNode classLevel = jsonBody(mockMvc.perform(post("/v1/school-admin/classes")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "academicYearId": "%s",
                                  "name": "%s",
                                  "displayOrder": 1
                                }
                                """.formatted(academicYear.at("/id").asText(), className)))
                .andExpect(status().isCreated())
                .andReturn());
        JsonNode section = jsonBody(mockMvc.perform(post("/v1/school-admin/sections")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "name": "A",
                                  "capacity": 40
                                }
                                """.formatted(classLevel.at("/id").asText())))
                .andExpect(status().isCreated())
                .andReturn());
        return new AcademicSetup(
                classLevel.at("/id").asText(),
                section.at("/id").asText(),
                classLevelRepository.findById(classLevel.at("/id").asText()).orElseThrow(),
                sectionRepository.findById(section.at("/id").asText()).orElseThrow()
        );
    }

    private UserAccount createTeacher(Tenant tenant, String email, String displayName) {
        UserAccount teacher = new UserAccount(tenant, email, displayName, UserRole.TEACHER);
        teacher.activate(passwordEncoder.encode("TeacherStrong123!"), displayName, Instant.now());
        return userAccountRepository.save(teacher);
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Homework Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Homework School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Homework Admin",
                                    "email": "%s"
                                  }
                                }
                                """.formatted(tenantCode, schoolCode, email)))
                .andExpect(status().isCreated())
                .andReturn();
        return jsonBody(result);
    }

    private String activateSchoolAdmin(JsonNode onboarding) throws Exception {
        String email = onboarding.at("/schoolAdminInvitation/email").asText();
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "HomeworkStrong123!", "Homework Admin");
        return login(email, "HomeworkStrong123!").at("/accessToken").asText();
    }

    private void acceptInvitation(String token, String password, String displayName) throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "%s",
                                  "displayName": "%s"
                                }
                                """.formatted(token, password, displayName)))
                .andExpect(status().isOk());
    }

    private JsonNode login(String email, String password) throws Exception {
        MvcResult loginStart = mockMvc.perform(post("/v1/auth/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode login = jsonBody(loginStart);
        if (!login.path("mfaRequired").asBoolean(false)) {
            return login;
        }
        MvcResult verified = mockMvc.perform(post("/v1/auth/mfa/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "challengeId": "%s",
                                  "code": "%s"
                                }
                                """.formatted(
                                login.at("/mfaChallengeId").asText(),
                                login.at("/mfaCode").asText()
                        )))
                .andExpect(status().isOk())
                .andReturn();
        return jsonBody(verified);
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String superAdminAccessToken() {
        return AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        ).accessToken();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record AcademicSetup(String classLevelId, String sectionId, ClassLevel classLevel, Section section) {
    }
}
