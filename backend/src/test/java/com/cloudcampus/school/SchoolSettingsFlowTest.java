package com.cloudcampus.school;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SchoolSettingsFlowTest {

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
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminCanReadAndUpdateOnlyActiveSchoolSettings() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant("SCHOOL-SET-A", "School Settings Trust"));
        School school = schoolRepository.save(new School(tenant, "SET-A", "Settings School", true));
        UserAccount admin = activeUser(tenant, "settings-admin@example.com", UserRole.SCHOOL_ADMIN);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, admin, UserRole.SCHOOL_ADMIN, true));
        String token = jwtAccessTokenService.issueToken(admin.getId(), tenant.getId(), UserRole.SCHOOL_ADMIN, school.getId());

        mockMvc.perform(get("/v1/school-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.name").value("Settings School"));

        mockMvc.perform(patch("/v1/school-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "name": "Updated Settings School"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.name").value("Updated Settings School"));

        assertThat(schoolRepository.findById(school.getId())).get()
                .extracting(School::getName)
                .isEqualTo("Updated Settings School");
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.SCHOOL_UPDATED);
    }

    @Test
    void teacherCannotUpdateSchoolSettings() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant("SCHOOL-SET-B", "School Settings Trust B"));
        School school = schoolRepository.save(new School(tenant, "SET-B", "Settings School B", true));
        UserAccount teacher = activeUser(tenant, "settings-teacher@example.com", UserRole.TEACHER);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, teacher, UserRole.TEACHER, true));
        String token = jwtAccessTokenService.issueToken(teacher.getId(), tenant.getId(), UserRole.TEACHER, school.getId());

        mockMvc.perform(patch("/v1/school-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Blocked"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private UserAccount activeUser(Tenant tenant, String email, UserRole role) {
        UserAccount user = new UserAccount(tenant, email, email, role);
        user.activate(passwordEncoder.encode("SettingsStrong123!"), email, Instant.now());
        return userAccountRepository.save(user);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
