package com.cloudcampus.operations.attendance;

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
class AttendanceFlowTest {

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
    private AttendanceSessionRepository attendanceSessionRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminSubmitsAttendanceForActiveSchoolAndAuditExcludesStudentNames() throws Exception {
        JsonNode onboarding = onboard("att-life-a", "att-school-a", "att-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        AcademicSetup setup = academicSetup(schoolAdminToken, "2026-2027", "Class 1");
        JsonNode subject = createSubject(schoolAdminToken, "math", "Mathematics");
        assignSubjectToClass(schoolAdminToken, setup.classLevelId(), subject.at("/id").asText());
        Student presentStudent = studentRepository.save(new Student(
                tenant,
                school,
                "ATT-100",
                "Present Student",
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
        Student absentStudent = studentRepository.save(new Student(
                tenant,
                school,
                "ATT-101",
                "Absent Student",
                setup.classLevel(),
                setup.section(),
                "2",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        ));

        JsonNode session = jsonBody(mockMvc.perform(post("/v1/school-admin/attendance/sessions")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "attendanceDate": "2026-06-01",
                                  "records": [
                                    {"studentId": "%s", "status": "PRESENT"},
                                    {"studentId": "%s", "status": "ABSENT", "remark": "Sick leave"}
                                  ]
                                }
                                """.formatted(
                                setup.classLevelId(),
                                setup.sectionId(),
                                subject.at("/id").asText(),
                                presentStudent.getId(),
                                absentStudent.getId()
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(tenant.getId()))
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.classLevelId").value(setup.classLevelId()))
                .andExpect(jsonPath("$.sectionId").value(setup.sectionId()))
                .andExpect(jsonPath("$.subjectCode").value("MATH"))
                .andExpect(jsonPath("$.presentCount").value(1))
                .andExpect(jsonPath("$.absentCount").value(1))
                .andExpect(jsonPath("$.records.length()").value(2))
                .andReturn());

        String sessionId = session.at("/id").asText();
        mockMvc.perform(get("/v1/school-admin/attendance/sessions")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(sessionId));
        mockMvc.perform(get("/v1/school-admin/attendance/sessions/{sessionId}", sessionId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sessionId));

        assertThat(attendanceSessionRepository.findById(sessionId)).isPresent();
        assertThat(attendanceRecordRepository.findBySessionIdOrderByStudentAdmissionNumberAsc(sessionId)).hasSize(2);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.ATTENDANCE_SUBMITTED);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getMetadataJson() == null ? "" : auditLog.getMetadataJson())
                .noneMatch(metadata -> metadata.contains("Present Student"))
                .noneMatch(metadata -> metadata.contains("Absent Student"));
    }

    @Test
    void schoolAdminCannotCreateOrReadAnotherSchoolsAttendance() throws Exception {
        JsonNode first = onboard("att-life-b1", "att-school-b1", "att-admin-b1@example.com");
        JsonNode second = onboard("att-life-b2", "att-school-b2", "att-admin-b2@example.com");
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
                "ATT-200",
                "Other Attendance Student",
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
        String secondSessionId = createAttendance(
                secondAdminToken,
                secondSetup.classLevelId(),
                secondSetup.sectionId(),
                secondSubject.at("/id").asText(),
                secondStudent.getId(),
                "2026-06-02"
        ).at("/id").asText();

        mockMvc.perform(post("/v1/school-admin/attendance/sessions")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "attendanceDate": "2026-06-03",
                                  "records": [
                                    {"studentId": "%s", "status": "PRESENT"}
                                  ]
                                }
                                """.formatted(
                                secondSetup.classLevelId(),
                                secondSetup.sectionId(),
                                secondSubject.at("/id").asText(),
                                secondStudent.getId()
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/school-admin/attendance/sessions/{sessionId}", secondSessionId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void teacherCanSubmitOnlyAssignedClassSubjectAttendance() throws Exception {
        JsonNode onboarding = onboard("att-life-c", "att-school-c", "att-admin-c@example.com");
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
        UserAccount teacher = createTeacher(tenant, "attendance-teacher@example.com", "Attendance Teacher");
        assignTeacher(schoolAdminToken, teacher.getId(), assignedClassSubject.at("/id").asText());
        String teacherToken = login("attendance-teacher@example.com", "TeacherStrong123!").at("/accessToken").asText();
        Student assignedStudent = studentRepository.save(new Student(
                tenant,
                school,
                "ATT-300",
                "Assigned Student",
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
        Student unassignedStudent = studentRepository.save(new Student(
                tenant,
                school,
                "ATT-301",
                "Unassigned Student",
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

        String assignedSessionId = jsonBody(mockMvc.perform(post("/v1/teacher/attendance/sessions")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "attendanceDate": "2026-06-04",
                                  "records": [
                                    {"studentId": "%s", "status": "PRESENT"}
                                  ]
                                }
                                """.formatted(
                                assignedSetup.classLevelId(),
                                assignedSetup.sectionId(),
                                subject.at("/id").asText(),
                                assignedStudent.getId()
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.submittedByUserId").value(teacher.getId()))
                .andExpect(jsonPath("$.submittedByRole").value("TEACHER"))
                .andReturn()).at("/id").asText();

        mockMvc.perform(get("/v1/teacher/attendance/sessions")
                        .queryParam("classLevelId", assignedSetup.classLevelId())
                        .queryParam("subjectId", subject.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(assignedSessionId));

        mockMvc.perform(post("/v1/teacher/attendance/sessions")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "attendanceDate": "2026-06-05",
                                  "records": [
                                    {"studentId": "%s", "status": "PRESENT"}
                                  ]
                                }
                                """.formatted(
                                unassignedSetup.classLevelId(),
                                unassignedSetup.sectionId(),
                                subject.at("/id").asText(),
                                unassignedStudent.getId()
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        String unassignedSessionId = createAttendance(
                schoolAdminToken,
                unassignedSetup.classLevelId(),
                unassignedSetup.sectionId(),
                subject.at("/id").asText(),
                unassignedStudent.getId(),
                "2026-06-05"
        ).at("/id").asText();

        mockMvc.perform(get("/v1/teacher/attendance/sessions/{sessionId}", unassignedSessionId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private JsonNode createAttendance(
            String token,
            String classLevelId,
            String sectionId,
            String subjectId,
            String studentId,
            String attendanceDate
    ) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/attendance/sessions")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "sectionId": "%s",
                                  "subjectId": "%s",
                                  "attendanceDate": "%s",
                                  "records": [
                                    {"studentId": "%s", "status": "PRESENT"}
                                  ]
                                }
                                """.formatted(classLevelId, sectionId, subjectId, attendanceDate, studentId)))
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
                                    "name": "Attendance Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Attendance School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Attendance Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "AttendanceStrong123!", "Attendance Admin");
        return login(email, "AttendanceStrong123!").at("/accessToken").asText();
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
