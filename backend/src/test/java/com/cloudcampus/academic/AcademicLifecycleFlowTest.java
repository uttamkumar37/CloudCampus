package com.cloudcampus.academic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLog;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.TenantRepository;
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
class AcademicLifecycleFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private ClassLevelRepository classLevelRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminCreatesAcademicYearClassAndSectionForActiveSchool() throws Exception {
        JsonNode onboarding = onboard("aca-life-a", "aca-school-a", "aca-admin-a@example.com");
        String token = activateSchoolAdmin(onboarding);
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();

        JsonNode academicYear = jsonBody(createAcademicYear(token, "2026-2027", "2026-04-01", "2027-03-31", true)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(tenantId))
                .andExpect(jsonPath("$.schoolId").value(schoolId))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn());

        JsonNode nextAcademicYear = jsonBody(createAcademicYear(token, "2027-2028", "2027-04-01", "2028-03-31", true)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn());

        mockMvc.perform(get("/v1/school-admin/academic-years")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(nextAcademicYear.at("/id").asText()))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$[1].id").value(academicYear.at("/id").asText()))
                .andExpect(jsonPath("$[1].status").value("CLOSED"));

        JsonNode classLevel = jsonBody(createClassLevel(token, nextAcademicYear.at("/id").asText(), "Class 1", 1)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.schoolId").value(schoolId))
                .andExpect(jsonPath("$.academicYearId").value(nextAcademicYear.at("/id").asText()))
                .andReturn());

        mockMvc.perform(get("/v1/school-admin/classes")
                        .queryParam("academicYearId", nextAcademicYear.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(classLevel.at("/id").asText()));

        JsonNode section = jsonBody(createSection(token, classLevel.at("/id").asText(), "A", 40)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.classLevelId").value(classLevel.at("/id").asText()))
                .andExpect(jsonPath("$.capacity").value(40))
                .andReturn());

        mockMvc.perform(get("/v1/school-admin/sections")
                        .queryParam("classLevelId", classLevel.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(section.at("/id").asText()));

        Map<AuditAction, AuditLog> auditByAction = auditLogRepository.findByTenantId(tenantId)
                .stream()
                .filter(auditLog -> schoolId.equals(auditLog.getSchoolId()))
                .filter(auditLog -> auditLog.getAction().name().startsWith("ACADEMIC_")
                        || auditLog.getAction() == AuditAction.CLASS_LEVEL_CREATED
                        || auditLog.getAction() == AuditAction.SECTION_CREATED)
                .collect(Collectors.toMap(AuditLog::getAction, Function.identity(), (left, right) -> right));
        assertThat(auditByAction).containsKeys(
                AuditAction.ACADEMIC_YEAR_CREATED,
                AuditAction.ACADEMIC_YEAR_ACTIVATED,
                AuditAction.CLASS_LEVEL_CREATED,
                AuditAction.SECTION_CREATED
        );
        assertThat(auditByAction.get(AuditAction.SECTION_CREATED).getActorId())
                .isEqualTo(onboarding.at("/schoolAdminInvitation/userId").asText());
    }

    @Test
    void invalidAcademicYearDatesAreRejected() throws Exception {
        JsonNode onboarding = onboard("aca-life-b", "aca-school-b", "aca-admin-b@example.com");
        String token = activateSchoolAdmin(onboarding);

        createAcademicYear(token, "Invalid Year", "2027-03-31", "2027-03-31", false)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

        assertThat(academicYearRepository.findBySchoolIdOrderByStartDateDesc(onboarding.at("/school/id").asText()))
                .isEmpty();
    }

    @Test
    void schoolAdminCannotUseAcademicObjectsFromAnotherSchool() throws Exception {
        JsonNode firstTenant = onboard("aca-life-c1", "aca-school-c1", "aca-admin-c1@example.com");
        JsonNode secondTenant = onboard("aca-life-c2", "aca-school-c2", "aca-admin-c2@example.com");
        String firstToken = activateSchoolAdmin(firstTenant);
        String secondToken = activateSchoolAdmin(secondTenant);

        JsonNode secondYear = jsonBody(createAcademicYear(secondToken, "2026-2027", "2026-04-01", "2027-03-31", true)
                .andExpect(status().isCreated())
                .andReturn());
        JsonNode secondClass = jsonBody(createClassLevel(secondToken, secondYear.at("/id").asText(), "Class 2", 2)
                .andExpect(status().isCreated())
                .andReturn());

        createClassLevel(firstToken, secondYear.at("/id").asText(), "Spoof Class", 1)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        createSection(firstToken, secondClass.at("/id").asText(), "Spoof Section", 30)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(classLevelRepository.findByAcademicYearIdAndName(secondYear.at("/id").asText(), "Spoof Class"))
                .isEmpty();
        assertThat(sectionRepository.findByClassLevelIdAndName(secondClass.at("/id").asText(), "Spoof Section"))
                .isEmpty();
    }

    private org.springframework.test.web.servlet.ResultActions createAcademicYear(
            String token,
            String name,
            String startDate,
            String endDate,
            boolean activate
    ) throws Exception {
        return mockMvc.perform(post("/v1/school-admin/academic-years")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType("application/json")
                .content("""
                        {
                          "tenantId": "spoofed-tenant",
                          "schoolId": "spoofed-school",
                          "name": "%s",
                          "startDate": "%s",
                          "endDate": "%s",
                          "activate": %s
                        }
                        """.formatted(name, startDate, endDate, activate)));
    }

    private org.springframework.test.web.servlet.ResultActions createClassLevel(
            String token,
            String academicYearId,
            String name,
            int displayOrder
    ) throws Exception {
        return mockMvc.perform(post("/v1/school-admin/classes")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType("application/json")
                .content("""
                        {
                          "tenantId": "spoofed-tenant",
                          "schoolId": "spoofed-school",
                          "academicYearId": "%s",
                          "name": "%s",
                          "displayOrder": %d
                        }
                        """.formatted(academicYearId, name, displayOrder)));
    }

    private org.springframework.test.web.servlet.ResultActions createSection(
            String token,
            String classLevelId,
            String name,
            int capacity
    ) throws Exception {
        return mockMvc.perform(post("/v1/school-admin/sections")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType("application/json")
                .content("""
                        {
                          "tenantId": "spoofed-tenant",
                          "schoolId": "spoofed-school",
                          "classLevelId": "%s",
                          "name": "%s",
                          "capacity": %d
                        }
                        """.formatted(classLevelId, name, capacity)));
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Academic Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Academic School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Academic Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "AcademicAdminStrong123!");
        return login(email, "AcademicAdminStrong123!").at("/accessToken").asText();
    }

    private void acceptInvitation(String token, String password) throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "%s",
                                  "displayName": "Academic Admin"
                                }
                                """.formatted(token, password)))
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
}
