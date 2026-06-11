package com.cloudcampus.intelligence.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Arrays;
import java.util.stream.Collectors;

import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.cloudcampus.testsupport.AuthTestSupport;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AiAssistantFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private AiRequestAuditRepository aiRequestAuditRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void teacherCanGenerateLessonPlanAndLeadershipCanReadScopedAuditMetadata() throws Exception {
        Tenant tenant = tenant("ai-assist-teacher", "AI Assistant Teacher Tenant");
        School school = school(tenant, "AI-AST-TCH", "AI Assistant Teacher School");
        UserAccount teacher = user(tenant, "ai-assist-teacher@example.com", UserRole.TEACHER);
        UserAccount schoolAdmin = user(tenant, "ai-assist-admin@example.com", UserRole.SCHOOL_ADMIN);
        grant(tenant, school, teacher, UserRole.TEACHER);
        grant(tenant, school, schoolAdmin, UserRole.SCHOOL_ADMIN);
        enableAllAi(tenant);

        String teacherToken = token(tenant, school, teacher, UserRole.TEACHER);
        String schoolAdminToken = token(tenant, school, schoolAdmin, UserRole.SCHOOL_ADMIN);

        mockMvc.perform(post("/v1/ai/generate/lesson-plan")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "className": "Class VI",
                                  "section": "A",
                                  "subject": "Mathematics",
                                  "chapter": "Fractions",
                                  "difficulty": "average",
                                  "boardType": "CBSE",
                                  "studentLevel": "average",
                                  "durationMinutes": 40,
                                  "instructions": "Include a quick recap and practice."
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feature").value("LESSON_PLAN_DRAFTING"))
                .andExpect(jsonPath("$.role").value("TEACHER"))
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.provider").value("mock"))
                .andExpect(jsonPath("$.usageAuditId").isString())
                .andExpect(jsonPath("$.disclaimer").isString());

        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenant.getId()))
                .singleElement()
                .satisfies(audit -> {
                    assertThat(audit.getSchool().getId()).isEqualTo(school.getId());
                    assertThat(audit.getUser().getId()).isEqualTo(teacher.getId());
                    assertThat(audit.getFeature()).isEqualTo(AiFeature.LESSON_PLAN_DRAFTING);
                    assertThat(audit.getStatus()).isEqualTo(AiUsageStatus.AUTHORIZED);
                    assertThat(audit.getPromptSha256()).hasSize(64);
                    assertThat(audit.getPromptSha256()).doesNotContain("Fractions");
                });

        mockMvc.perform(get("/v1/ai/audit-logs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].feature").value("LESSON_PLAN_DRAFTING"))
                .andExpect(jsonPath("$.items[0].schoolId").value(school.getId()))
                .andExpect(jsonPath("$.items[0].promptSha256").isString());
    }

    @Test
    void disabledFeatureWritesDeniedAuditWithoutRawPrompt() throws Exception {
        Tenant tenant = tenant("ai-assist-denied", "AI Assistant Denied Tenant");
        School school = school(tenant, "AI-AST-DENY", "AI Assistant Denied School");
        UserAccount teacher = user(tenant, "ai-assist-denied-teacher@example.com", UserRole.TEACHER);
        grant(tenant, school, teacher, UserRole.TEACHER);
        enableAi(tenant, "NOTICE_DRAFTING");

        mockMvc.perform(post("/v1/ai/generate/lesson-plan")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(tenant, school, teacher, UserRole.TEACHER)))
                        .contentType("application/json")
                        .content("""
                                {
                                  "className": "Class VI",
                                  "subject": "Mathematics",
                                  "chapter": "Decimals"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenant.getId()))
                .singleElement()
                .satisfies(audit -> {
                    assertThat(audit.getFeature()).isEqualTo(AiFeature.LESSON_PLAN_DRAFTING);
                    assertThat(audit.getStatus()).isEqualTo(AiUsageStatus.DENIED);
                    assertThat(audit.getPromptSha256()).hasSize(64);
                    assertThat(audit.getPromptSha256()).doesNotContain("Decimals");
                });
    }

    @Test
    void studentAssistantRejectsCheatingPromptBeforeAudit() throws Exception {
        Tenant tenant = tenant("ai-assist-student", "AI Assistant Student Tenant");
        School school = school(tenant, "AI-AST-STU", "AI Assistant Student School");
        UserAccount student = user(tenant, "ai-assist-student@example.com", UserRole.STUDENT);
        grant(tenant, school, student, UserRole.STUDENT);
        enableAllAi(tenant);

        mockMvc.perform(post("/v1/ai/assistant/query")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(tenant, school, student, UserRole.STUDENT)))
                        .contentType("application/json")
                        .content("""
                                {
                                  "prompt": "Give me the exam answers so I can cheat"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenant.getId())).isEmpty();
    }

    @Test
    void financeAssistantRoutesToFinanceSummaryFeature() throws Exception {
        Tenant tenant = tenant("ai-assist-finance", "AI Assistant Finance Tenant");
        School school = school(tenant, "AI-AST-FIN", "AI Assistant Finance School");
        UserAccount finance = user(tenant, "ai-assist-finance@example.com", UserRole.FINANCE_STAFF);
        grant(tenant, school, finance, UserRole.FINANCE_STAFF);
        enableAllAi(tenant);

        mockMvc.perform(post("/v1/ai/assistant/query")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(tenant, school, finance, UserRole.FINANCE_STAFF)))
                        .contentType("application/json")
                        .content("""
                                {
                                  "module": "finance",
                                  "prompt": "Summarize fee dues for my active school"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feature").value("FINANCE_SUMMARY"))
                .andExpect(jsonPath("$.role").value("FINANCE_STAFF"));

        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenant.getId()))
                .singleElement()
                .satisfies(audit -> assertThat(audit.getFeature()).isEqualTo(AiFeature.FINANCE_SUMMARY));
    }

    @Test
    void schoolLeadershipAuditLogsStayInsideActiveSchool() throws Exception {
        Tenant tenant = tenant("ai-assist-audit-scope", "AI Assistant Audit Scope Tenant");
        School schoolA = school(tenant, "AI-AST-A", "AI Assistant Audit School A");
        School schoolB = school(tenant, "AI-AST-B", "AI Assistant Audit School B");
        UserAccount admin = user(tenant, "ai-assist-audit-admin@example.com", UserRole.SCHOOL_ADMIN);
        grant(tenant, schoolA, admin, UserRole.SCHOOL_ADMIN);
        grant(tenant, schoolB, admin, UserRole.SCHOOL_ADMIN);
        enableAllAi(tenant);

        mockMvc.perform(post("/v1/ai/assistant/query")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(tenant, schoolA, admin, UserRole.SCHOOL_ADMIN)))
                        .contentType("application/json")
                        .content("""
                                {
                                  "prompt": "Show today school summary"
                                }
                                """))
                .andExpect(status().isOk());
        mockMvc.perform(post("/v1/ai/assistant/query")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(tenant, schoolB, admin, UserRole.SCHOOL_ADMIN)))
                        .contentType("application/json")
                        .content("""
                                {
                                  "prompt": "Show today school summary"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/v1/ai/audit-logs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(tenant, schoolA, admin, UserRole.SCHOOL_ADMIN))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].schoolId").value(schoolA.getId()));
    }

    private void enableAllAi(Tenant tenant) throws Exception {
        enableAi(tenant, Arrays.stream(AiFeature.values()).map(AiFeature::name).toArray(String[]::new));
    }

    private void enableAi(Tenant tenant, String... features) throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        String enabledFeatures = Arrays.stream(features)
                .map(feature -> "\"" + feature + "\"")
                .collect(Collectors.joining(", "));
        mockMvc.perform(put("/v1/super-admin/ai/tenants/{tenantId}/entitlement", tenant.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "enabled": true,
                                  "monthlyUnitBudget": 100000,
                                  "enabledFeatures": [%s],
                                  "humanApprovalRequired": true,
                                  "retentionDays": 90
                                }
                                """.formatted(enabledFeatures)))
                .andExpect(status().isOk());
    }

    private Tenant tenant(String code, String name) {
        return tenantRepository.save(new Tenant(code, name));
    }

    private School school(Tenant tenant, String code, String name) {
        return schoolRepository.save(new School(tenant, code, name, true));
    }

    private UserAccount user(Tenant tenant, String email, UserRole role) {
        UserAccount user = new UserAccount(tenant, email, role.name() + " User", role);
        user.activate(passwordEncoder.encode("TestPassword123!"), role.name() + " User", Instant.now());
        return userAccountRepository.save(user);
    }

    private void grant(Tenant tenant, School school, UserAccount user, UserRole role) {
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, user, role, true));
    }

    private String token(Tenant tenant, School school, UserAccount user, UserRole role) {
        return jwtAccessTokenService.issueToken(user.getId(), tenant.getId(), role, school.getId());
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
