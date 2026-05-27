package com.cloudcampus.operations.exam;

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
class ExamFlowTest {

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
    private ExamRepository examRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void teacherRecordsMarksAndSchoolAdminPublishesResultsForParentAndStudent() throws Exception {
        JsonNode onboarding = onboard("exam-life-a", "exam-school-a", "exam-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        AcademicSetup setup = academicSetup(schoolAdminToken, "2026-2027", "Class 1");
        JsonNode subject = createSubject(schoolAdminToken, "math", "Mathematics");
        JsonNode classSubject = assignSubjectToClass(schoolAdminToken, setup.classLevelId(), subject.at("/id").asText());
        UserAccount teacher = createTeacher(tenant, "exam-teacher-a@example.com", "Exam Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), classSubject.at("/id").asText());
        String teacherToken = login("exam-teacher-a@example.com", "TeacherStrong123!").at("/accessToken").asText();
        Student student = studentRepository.save(new Student(
                tenant,
                school,
                "EXAM-100",
                "Exam Student",
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
        Section otherSection = sectionRepository.save(new Section(setup.classLevel(), "B", 40));
        Student otherSectionStudent = studentRepository.save(new Student(
                tenant,
                school,
                "EXAM-101",
                "Other Section Student",
                setup.classLevel(),
                otherSection,
                "2",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        ));

        JsonNode exam = createExam(
                schoolAdminToken,
                setup.classLevelId(),
                setup.sectionId(),
                subject.at("/id").asText(),
                "Term One Mathematics"
        );
        String examId = exam.at("/id").asText();
        assertThat(exam.at("/status").asText()).isEqualTo("DRAFT");
        assertThat(exam.at("/tenantId").asText()).isEqualTo(tenant.getId());
        assertThat(exam.at("/schoolId").asText()).isEqualTo(school.getId());

        mockMvc.perform(get("/v1/teacher/exams")
                        .queryParam("classLevelId", setup.classLevelId())
                        .queryParam("subjectId", subject.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(examId));

        mockMvc.perform(get("/v1/teacher/exams/{examId}/roster", examId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentId").value(student.getId()))
                .andExpect(jsonPath("$[0].fullName").value("Exam Student"))
                .andExpect(jsonPath("$[0].admissionNumber").value("EXAM-100"));

        mockMvc.perform(post("/v1/teacher/exams/{examId}/results", examId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "studentId": "%s",
                                  "marksObtained": 92.50
                                }
                                """.formatted(student.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].studentId").value(student.getId()))
                .andExpect(jsonPath("$.results[0].marksObtained").value(92.5));

        mockMvc.perform(get("/v1/teacher/exams/{examId}/roster", examId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentId").value(student.getId()))
                .andExpect(jsonPath("$[0].marksObtained").value(92.5));

        JsonNode parentLink = linkParent(schoolAdminToken, student.getId(), "exam-parent-a@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentExamStrong123!", "Exam Parent");
        String parentToken = login("exam-parent-a@example.com", "ParentExamStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/parent/children/{studentId}/results", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        JsonNode studentInvitation = inviteStudentLogin(schoolAdminToken, student.getId(), "exam-student-a@example.com");
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentExamStrong123!", "Exam Student");
        String studentToken = login("exam-student-a@example.com", "StudentExamStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/student/results")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(post("/v1/school-admin/exams/{examId}/publish", examId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.results[0].studentId").value(student.getId()));

        mockMvc.perform(get("/v1/parent/children/{studentId}/results", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(examId))
                .andExpect(jsonPath("$[0].results[0].studentId").value(student.getId()));
        mockMvc.perform(get("/v1/student/results")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(examId))
                .andExpect(jsonPath("$[0].results[0].marksObtained").value(92.5));

        assertThat(examRepository.findById(examId)).isPresent();
        assertThat(examResultRepository.findByExamIdOrderByStudentAdmissionNumberAsc(examId)).hasSize(1);
        assertThat(examResultRepository.findByExamIdAndStudentId(examId, otherSectionStudent.getId())).isEmpty();
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.EXAM_CREATED, AuditAction.EXAM_MARKS_RECORDED, AuditAction.EXAM_RESULTS_PUBLISHED);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getMetadataJson() == null ? "" : auditLog.getMetadataJson())
                .noneMatch(metadata -> metadata.contains("92.50"))
                .noneMatch(metadata -> metadata.contains("Term One Mathematics"));
    }

    @Test
    void schoolAdminCannotCreateReadRecordOrPublishAnotherSchoolsExam() throws Exception {
        JsonNode first = onboard("exam-life-b1", "exam-school-b1", "exam-admin-b1@example.com");
        JsonNode second = onboard("exam-life-b2", "exam-school-b2", "exam-admin-b2@example.com");
        String firstAdminToken = activateSchoolAdmin(first);
        String secondAdminToken = activateSchoolAdmin(second);
        Tenant secondTenant = tenantRepository.findById(second.at("/tenant/id").asText()).orElseThrow();
        School secondSchool = schoolRepository.findById(second.at("/school/id").asText()).orElseThrow();
        AcademicSetup secondSetup = academicSetup(secondAdminToken, "2026-2027", "Class 2");
        JsonNode secondSubject = createSubject(secondAdminToken, "sci", "Science");
        assignSubjectToClass(secondAdminToken, secondSetup.classLevelId(), secondSubject.at("/id").asText());
        Student secondStudent = studentRepository.save(new Student(
                secondTenant,
                secondSchool,
                "EXAM-200",
                "Other Exam Student",
                secondSetup.classLevel(),
                secondSetup.section(),
                "1",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        ));
        String secondExamId = createExam(
                secondAdminToken,
                secondSetup.classLevelId(),
                secondSetup.sectionId(),
                secondSubject.at("/id").asText(),
                "Other exam"
        ).at("/id").asText();

        mockMvc.perform(post("/v1/school-admin/exams")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "title": "Blocked exam",
                                  "examDate": "2026-07-11",
                                  "maxMarks": 100
                                }
                                """.formatted(
                                secondSetup.classLevelId(),
                                secondSetup.sectionId(),
                                secondSubject.at("/id").asText()
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/school-admin/exams/{examId}", secondExamId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/school-admin/exams/{examId}/results", secondExamId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "marksObtained": 80
                                }
                                """.formatted(secondStudent.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/school-admin/exams/{examId}/publish", secondExamId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void teacherParentAndStudentCannotAccessUnassignedResults() throws Exception {
        JsonNode onboarding = onboard("exam-life-c", "exam-school-c", "exam-admin-c@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        AcademicSetup assignedSetup = academicSetup(schoolAdminToken, "2026-2027", "Class 1");
        AcademicSetup unassignedSetup = academicSetup(schoolAdminToken, "2027-2028", "Class 2");
        JsonNode subject = createSubject(schoolAdminToken, "eng", "English");
        JsonNode assignedClassSubject = assignSubjectToClass(
                schoolAdminToken,
                assignedSetup.classLevelId(),
                subject.at("/id").asText()
        );
        assignSubjectToClass(schoolAdminToken, unassignedSetup.classLevelId(), subject.at("/id").asText());
        UserAccount teacher = createTeacher(tenant, "exam-teacher-c@example.com", "Exam Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), assignedClassSubject.at("/id").asText());
        String teacherToken = login("exam-teacher-c@example.com", "TeacherStrong123!").at("/accessToken").asText();
        Student linkedStudent = studentRepository.save(new Student(
                tenant,
                school,
                "EXAM-300",
                "Linked Exam Student",
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
                "EXAM-301",
                "Unlinked Exam Student",
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
        String unassignedExamId = createExam(
                schoolAdminToken,
                unassignedSetup.classLevelId(),
                unassignedSetup.sectionId(),
                subject.at("/id").asText(),
                "Unassigned exam"
        ).at("/id").asText();
        recordSchoolAdminMarks(schoolAdminToken, unassignedExamId, unlinkedStudent.getId(), 74);
        mockMvc.perform(post("/v1/school-admin/exams/{examId}/publish", unassignedExamId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/v1/teacher/exams/{examId}", unassignedExamId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/teacher/exams/{examId}/roster", unassignedExamId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/teacher/exams/{examId}/results", unassignedExamId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "marksObtained": 81
                                }
                                """.formatted(unlinkedStudent.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        JsonNode parentLink = linkParent(schoolAdminToken, linkedStudent.getId(), "exam-parent-c@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentExamStrong123!", "Exam Parent");
        String parentToken = login("exam-parent-c@example.com", "ParentExamStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/parent/children/{studentId}/results", unlinkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        JsonNode studentInvitation = inviteStudentLogin(schoolAdminToken, linkedStudent.getId(), "exam-student-c@example.com");
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentExamStrong123!", "Exam Student");
        String studentToken = login("exam-student-c@example.com", "StudentExamStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/student/results")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    private JsonNode createExam(
            String token,
            String classLevelId,
            String sectionId,
            String subjectId,
            String title
    ) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/exams")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "title": "%s",
                                  "examDate": "2026-07-10",
                                  "maxMarks": 100
                                }
                                """.formatted(classLevelId, sectionId, subjectId, title)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private void recordSchoolAdminMarks(String token, String examId, String studentId, int marks) throws Exception {
        mockMvc.perform(post("/v1/school-admin/exams/{examId}/results", examId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "marksObtained": %d
                                }
                                """.formatted(studentId, marks)))
                .andExpect(status().isOk());
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
                                  "parentFullName": "Exam Parent",
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
                                    "name": "Exam Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Exam School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Exam Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "ExamStrong123!", "Exam Admin");
        return login(email, "ExamStrong123!").at("/accessToken").asText();
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
