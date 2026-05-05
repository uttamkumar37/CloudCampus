package com.cloudcampus.auth;

import com.cloudcampus.IntegrationTestBase;
import com.cloudcampus.common.notification.NotificationChannel;
import com.cloudcampus.common.notification.NotificationService;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.tenant.service.TenantService;
import com.cloudcampus.user.entity.UserRole;
import com.cloudcampus.user.service.UserAccountProvisioningService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class CredentialUpdateAndFirstLoginIT extends IntegrationTestBase {

    private static final String TENANT_ID = "cred-it";
    private static final String TENANT_SLUG = "cred-it";
    private static final String TENANT_SCHEMA = "school_cred_it";
    private static boolean tenantCreated = false;

    private static final Pattern CREDENTIALS_PATTERN =
            Pattern.compile("Username:\\s*(.+)\\s*\\nPassword:\\s*(.+)\\s*\\n", Pattern.MULTILINE);
    private static final Pattern OTP_PATTERN = Pattern.compile("(\\d{6})");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private UserAccountProvisioningService userAccountProvisioningService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    private final List<String> sentMessages = new ArrayList<>();

    @BeforeEach
    void setUp() {
        if (!tenantCreated) {
            tenantService.createTenant(new TenantCreateRequest(
                                        TENANT_ID, TENANT_SLUG, "Credential IT School", TENANT_SCHEMA, null, "#10b981",
                                        "Credential Admin", "credential.admin", "credential.admin@example.com", "9000004001", "Admin@Test123"));
            tenantCreated = true;
        }

        sentMessages.clear();
        doAnswer(invocation -> {
            sentMessages.add(invocation.getArgument(3, String.class));
            return null;
        }).when(notificationService).send(any(NotificationChannel.class), anyString(), anyString(), anyString());

        TenantContext.setTenant(TENANT_SCHEMA);
        userAccountProvisioningService.createDefaultUserAccount(
                "Parent One",
                "Parent",
                null,
                "parent.one+" + System.nanoTime() + "@example.com",
                UserRole.PARENT
        );
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void firstLogin_blocksNonCredentialEndpoints_untilUpdated() throws Exception {
        String credsMessage = sentMessages.stream().findFirst().orElseThrow();
        Matcher m = CREDENTIALS_PATTERN.matcher(credsMessage);
        assertThat(m.find()).isTrue();
        String username = m.group(1).trim();
        String password = m.group(2).trim();

        String loginPayload = """
                {
                  "tenantSlug": "%s",
                  "username": "%s",
                  "password": "%s"
                }
                """.formatted(TENANT_SLUG, username, password);

        String token = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstLoginRequired").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(token);
        String accessToken = root.path("data").path("accessToken").asText();
        assertThat(accessToken).isNotBlank();

        String changePasswordPayload = """
                {
                  "currentPassword": "%s",
                  "newPassword": "NewPass1!"
                }
                """.formatted(password);

        mockMvc.perform(post("/api/v1/auth/change-password")
                        .header("X-Tenant-Slug", TENANT_SLUG)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changePasswordPayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("First login requires updating username and password"));

        sentMessages.clear();
        mockMvc.perform(post("/api/v1/auth/credentials/send-otp")
                        .header("X-Tenant-Slug", TENANT_SLUG)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"channel\":\"EMAIL\"}"))
                .andExpect(status().isOk());

        String otpMessage = sentMessages.stream().findFirst().orElseThrow();
        Matcher otpMatcher = OTP_PATTERN.matcher(otpMessage);
        assertThat(otpMatcher.find()).isTrue();
        String otp = otpMatcher.group(1);

        String updatePayload = """
                {
                  "channel": "EMAIL",
                  "otp": "%s",
                  "newUsername": "parent_new",
                  "newPassword": "NewPass1!"
                }
                """.formatted(otp);

        mockMvc.perform(post("/api/v1/auth/credentials/update")
                        .header("X-Tenant-Slug", TENANT_SLUG)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        String changeAfterPayload = """
                {
                  "currentPassword": "NewPass1!",
                  "newPassword": "NextPass1!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/change-password")
                        .header("X-Tenant-Slug", TENANT_SLUG)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changeAfterPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
