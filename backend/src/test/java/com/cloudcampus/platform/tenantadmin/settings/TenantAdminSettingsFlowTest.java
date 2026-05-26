package com.cloudcampus.platform.tenantadmin.settings;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
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
class TenantAdminSettingsFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private TenantSchoolLimitRepository tenantSchoolLimitRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StaffProfileRepository staffProfileRepository;

    @Autowired
    private TenantSettingsRepository tenantSettingsRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void tenantAdminReadsAndUpdatesOnlyOwnTenantSettings() throws Exception {
        TenantContext context = tenantWithAdmin("mul-settings-a", "tenant-admin-settings-a@example.com", 3);

        mockMvc.perform(get("/v1/tenant-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.tenantName").value("Tenant mul-settings-a"))
                .andExpect(jsonPath("$.displayName").value("Tenant mul-settings-a"))
                .andExpect(jsonPath("$.timezone").value("UTC"))
                .andExpect(jsonPath("$.locale").value("en-US"));

        mockMvc.perform(patch("/v1/tenant-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed-tenant",
                                  "displayName": "Mul Settings Trust",
                                  "billingEmail": "Billing@Example.com",
                                  "supportEmail": "Support@Example.com",
                                  "timezone": "Asia/Kolkata",
                                  "locale": "en-IN"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.displayName").value("Mul Settings Trust"))
                .andExpect(jsonPath("$.billingEmail").value("billing@example.com"))
                .andExpect(jsonPath("$.supportEmail").value("support@example.com"))
                .andExpect(jsonPath("$.timezone").value("Asia/Kolkata"))
                .andExpect(jsonPath("$.locale").value("en-IN"));

        assertThat(tenantSettingsRepository.findById(context.tenant().getId()))
                .hasValueSatisfying(settings -> {
                    assertThat(settings.getDisplayName()).isEqualTo("Mul Settings Trust");
                    assertThat(settings.getBillingEmail()).isEqualTo("billing@example.com");
                    assertThat(settings.getSupportEmail()).isEqualTo("support@example.com");
                });
        assertThat(tenantSettingsRepository.findById("spoofed-tenant")).isEmpty();
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.TENANT_SETTINGS_UPDATED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(context.tenantAdmin().getId());
                    assertThat(auditLog.getActorType()).isEqualTo("TENANT_ADMIN");
                    assertThat(auditLog.getSchoolId()).isNull();
                    assertThat(auditLog.getMetadataJson()).contains("Mul Settings Trust");
                    assertThat(auditLog.getMetadataJson()).doesNotContain("Billing@Example.com");
                    assertThat(auditLog.getMetadataJson()).doesNotContain("billing@example.com");
                    assertThat(auditLog.getMetadataJson()).doesNotContain("spoofed-tenant");
                });
    }

    @Test
    void tenantAdminUsageIsServerDerivedAndRejectsSpoofingAndWrongRoles() throws Exception {
        TenantContext context = tenantWithAdmin("mul-settings-b", "tenant-admin-settings-b@example.com", 3);
        School inactiveSchool = schoolRepository.save(new School(context.tenant(), "INACTIVE", "Inactive Branch", false));
        inactiveSchool.deactivate();
        schoolRepository.save(inactiveSchool);
        UserAccount schoolAdmin = userAccountRepository.save(new UserAccount(
                context.tenant(),
                "principal-settings@example.com",
                "Principal Settings",
                UserRole.SCHOOL_ADMIN
        ));
        schoolAdmin.activate(passwordEncoder.encode("Principal123!"), "Principal Settings", Instant.now());
        userAccountRepository.save(schoolAdmin);
        UserAccount teacher = userAccountRepository.save(new UserAccount(
                context.tenant(),
                "teacher-settings@example.com",
                "Teacher Settings",
                UserRole.TEACHER
        ));
        teacher.activate(passwordEncoder.encode("Teacher123!"), "Teacher Settings", Instant.now());
        userAccountRepository.save(teacher);
        studentRepository.save(new Student(context.tenant(), context.primarySchool(), "ADM-1", "Student One"));
        staffProfileRepository.save(new StaffProfile(
                context.tenant(),
                context.primarySchool(),
                teacher,
                UserRole.TEACHER,
                "EMP-1",
                "Teacher Settings",
                "teacher-settings@example.com",
                "Academics",
                "Teacher",
                true
        ));

        mockMvc.perform(get("/v1/tenant-admin/subscription/usage")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.planCode").value("SCAFFOLD"))
                .andExpect(jsonPath("$.maxSchools").value(3))
                .andExpect(jsonPath("$.schoolsUsed").value(2))
                .andExpect(jsonPath("$.activeSchools").value(1))
                .andExpect(jsonPath("$.remainingSchools").value(1))
                .andExpect(jsonPath("$.schoolAdmins").value(1))
                .andExpect(jsonPath("$.teachers").value(1))
                .andExpect(jsonPath("$.staff").value(1))
                .andExpect(jsonPath("$.students").value(1))
                .andExpect(jsonPath("$.schoolLimitReached").value(false));

        mockMvc.perform(get("/v1/tenant-admin/subscription/usage")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken()))
                        .header("X-Tenant-ID", "spoofed-tenant"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));

        var schoolAdminToken = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SCHOOL_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        mockMvc.perform(get("/v1/tenant-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/tenant-admin/subscription/usage"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    private TenantContext tenantWithAdmin(String tenantCode, String adminEmail, int maxSchools) {
        Tenant tenant = tenantRepository.save(new Tenant(tenantCode.toUpperCase(), "Tenant " + tenantCode));
        School primarySchool = schoolRepository.save(new School(tenant, "PRIMARY", "Primary School", true));
        tenantSchoolLimitRepository.save(new TenantSchoolLimit(tenant.getId(), maxSchools));
        UserAccount tenantAdmin = new UserAccount(
                tenant,
                adminEmail,
                "Tenant Admin",
                UserRole.TENANT_ADMIN
        );
        tenantAdmin.activate(passwordEncoder.encode("TenantAdmin123!"), "Tenant Admin", Instant.now());
        userAccountRepository.save(tenantAdmin);
        String token = jwtAccessTokenService.issueToken(
                tenantAdmin.getId(),
                tenant.getId(),
                UserRole.TENANT_ADMIN,
                null
        );
        return new TenantContext(tenant, primarySchool, tenantAdmin, token);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record TenantContext(Tenant tenant, School primarySchool, UserAccount tenantAdmin, String tenantAdminToken) {
    }
}
