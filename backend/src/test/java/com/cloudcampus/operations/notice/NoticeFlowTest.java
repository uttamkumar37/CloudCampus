package com.cloudcampus.operations.notice;

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
import com.cloudcampus.academic.TeacherAssignment;
import com.cloudcampus.academic.TeacherAssignmentRepository;
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
class NoticeFlowTest {

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
    private NoticeRepository noticeRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminPublishesSchoolNoticeForTeacherParentAndStudentAudiences() throws Exception {
        JsonNode onboarding = onboard("notice-life-a", "notice-school-a", "notice-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        AcademicSetup setup = academicSetup(schoolAdminToken, "2026-2027", "Class 1");
        JsonNode subject = createSubject(schoolAdminToken, "eng", "English");
        JsonNode classSubject = assignSubjectToClass(schoolAdminToken, setup.classLevelId(), subject.at("/id").asText());
        UserAccount teacher = createTeacher(tenant, "notice-teacher-a@example.com", "Notice Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), classSubject.at("/id").asText());
        String teacherToken = login("notice-teacher-a@example.com", "TeacherStrong123!").at("/accessToken").asText();
        Student student = studentRepository.save(new Student(
                tenant,
                school,
                "NOTE-100",
                "Notice Student",
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
        JsonNode parentLink = linkParent(schoolAdminToken, student.getId(), "notice-parent-a@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentNoticeStrong123!", "Notice Parent");
        String parentToken = login("notice-parent-a@example.com", "ParentNoticeStrong123!").at("/accessToken").asText();
        JsonNode studentInvitation = inviteStudentLogin(schoolAdminToken, student.getId(), "notice-student-a@example.com");
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentNoticeStrong123!", "Notice Student");
        String studentToken = login("notice-student-a@example.com", "StudentNoticeStrong123!").at("/accessToken").asText();

        JsonNode notice = createNotice(
                schoolAdminToken,
                setup.classLevelId(),
                setup.sectionId(),
                "ALL",
                "Class one field trip",
                "Private notice body for class one."
        );
        String noticeId = notice.at("/id").asText();
        assertThat(notice.at("/tenantId").asText()).isEqualTo(tenant.getId());
        assertThat(notice.at("/schoolId").asText()).isEqualTo(school.getId());
        assertThat(notice.at("/status").asText()).isEqualTo("DRAFT");

        mockMvc.perform(get("/v1/teacher/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get("/v1/parent/children/{studentId}/notices", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get("/v1/student/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(post("/v1/school-admin/notices/{noticeId}/publish", noticeId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mockMvc.perform(get("/v1/teacher/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(noticeId));
        mockMvc.perform(get("/v1/parent/children/{studentId}/notices", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(noticeId));
        mockMvc.perform(get("/v1/student/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(noticeId));

        assertThat(noticeRepository.findById(noticeId)).isPresent();
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.NOTICE_CREATED, AuditAction.NOTICE_PUBLISHED);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getMetadataJson() == null ? "" : auditLog.getMetadataJson())
                .noneMatch(metadata -> metadata.contains("Private notice body"))
                .noneMatch(metadata -> metadata.contains("Class one field trip"));
    }

    @Test
    void schoolAdminCannotCreateReadOrPublishAnotherSchoolsNotice() throws Exception {
        JsonNode first = onboard("notice-life-b1", "notice-school-b1", "notice-admin-b1@example.com");
        JsonNode second = onboard("notice-life-b2", "notice-school-b2", "notice-admin-b2@example.com");
        String firstAdminToken = activateSchoolAdmin(first);
        String secondAdminToken = activateSchoolAdmin(second);
        AcademicSetup secondSetup = academicSetup(secondAdminToken, "2026-2027", "Class 2");
        String secondNoticeId = createNotice(
                secondAdminToken,
                secondSetup.classLevelId(),
                secondSetup.sectionId(),
                "ALL",
                "Second school notice",
                "Only second school may publish this."
        ).at("/id").asText();

        mockMvc.perform(post("/v1/school-admin/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "title": "Blocked notice",
                                  "body": "This should be rejected.",
                                  "audience": "ALL"
                                }
                                """.formatted(secondSetup.classLevelId(), secondSetup.sectionId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/school-admin/notices/{noticeId}", secondNoticeId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/school-admin/notices/{noticeId}/publish", secondNoticeId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void teacherParentAndStudentCannotAccessUnassignedNotices() throws Exception {
        JsonNode onboarding = onboard("notice-life-c", "notice-school-c", "notice-admin-c@example.com");
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
        UserAccount teacher = createTeacher(tenant, "notice-teacher-c@example.com", "Notice Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), assignedClassSubject.at("/id").asText());
        String teacherToken = login("notice-teacher-c@example.com", "TeacherStrong123!").at("/accessToken").asText();
        Student linkedStudent = studentRepository.save(new Student(
                tenant,
                school,
                "NOTE-300",
                "Linked Notice Student",
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
                "NOTE-301",
                "Unlinked Notice Student",
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
        String unassignedNoticeId = createNotice(
                schoolAdminToken,
                unassignedSetup.classLevelId(),
                unassignedSetup.sectionId(),
                "ALL",
                "Unassigned class notice",
                "Only unassigned class should see this."
        ).at("/id").asText();
        mockMvc.perform(post("/v1/school-admin/notices/{noticeId}/publish", unassignedNoticeId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/v1/teacher/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        JsonNode parentLink = linkParent(schoolAdminToken, linkedStudent.getId(), "notice-parent-c@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentNoticeStrong123!", "Notice Parent");
        String parentToken = login("notice-parent-c@example.com", "ParentNoticeStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/parent/children/{studentId}/notices", unlinkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/parent/children/{studentId}/notices", linkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        JsonNode studentInvitation = inviteStudentLogin(schoolAdminToken, linkedStudent.getId(), "notice-student-c@example.com");
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentNoticeStrong123!", "Notice Student");
        String studentToken = login("notice-student-c@example.com", "StudentNoticeStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/student/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void teacherNoticesAreScopedToAssignedSection() throws Exception {
        JsonNode onboarding = onboard("notice-life-section", "notice-school-section", "notice-admin-section@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        AcademicSetup setup = academicSetup(schoolAdminToken, "2026-2027", "Class 4");
        Section otherSection = sectionRepository.save(new Section(setup.classLevel(), "B", 40));
        JsonNode subject = createSubject(schoolAdminToken, "bio", "Biology");
        JsonNode classSubject = assignSubjectToClass(
                schoolAdminToken,
                setup.classLevelId(),
                subject.at("/id").asText()
        );
        UserAccount teacher = createTeacher(tenant, "notice-section-teacher@example.com", "Section Notice Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), classSubject.at("/id").asText());
        TeacherAssignment assignment = teacherAssignmentRepository
                .findByTeacherIdAndClassSubjectAssignmentId(teacher.getId(), classSubject.at("/id").asText())
                .orElseThrow();
        assignment.updateScope(setup.section(), "SECTION_TEACHER", true, teacher);
        teacherAssignmentRepository.saveAndFlush(assignment);
        String teacherToken = login("notice-section-teacher@example.com", "TeacherStrong123!").at("/accessToken").asText();

        String assignedNoticeId = createNotice(
                schoolAdminToken,
                setup.classLevelId(),
                setup.sectionId(),
                "ALL",
                "Assigned section notice",
                "Assigned section body."
        ).at("/id").asText();
        String otherSectionNoticeId = createNotice(
                schoolAdminToken,
                setup.classLevelId(),
                otherSection.getId(),
                "ALL",
                "Other section notice",
                "Other section body."
        ).at("/id").asText();
        mockMvc.perform(post("/v1/school-admin/notices/{noticeId}/publish", assignedNoticeId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/v1/school-admin/notices/{noticeId}/publish", otherSectionNoticeId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/v1/teacher/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(assignedNoticeId));
    }

    private JsonNode createNotice(
            String token,
            String classLevelId,
            String sectionId,
            String audience,
            String title,
            String body
    ) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/notices")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "title": "%s",
                                  "body": "%s",
                                  "audience": "%s"
                                }
                                """.formatted(classLevelId, sectionId, title, body, audience)))
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
                                  "parentFullName": "Notice Parent",
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
                                    "name": "Notice Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Notice School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Notice Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "NoticeStrong123!", "Notice Admin");
        return login(email, "NoticeStrong123!").at("/accessToken").asText();
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
