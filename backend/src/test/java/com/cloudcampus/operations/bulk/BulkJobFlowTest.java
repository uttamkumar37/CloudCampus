package com.cloudcampus.operations.bulk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.events.outbox.OutboxEventRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
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
class BulkJobFlowTest {

    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private BulkJobRepository bulkJobRepository;

    @Autowired
    private BulkJobService bulkJobService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminCanCreateListReadAndCancelDurableBulkJobWithAuditAndOutbox() throws Exception {
        SchoolUserContext context = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);

        JsonNode created = jsonBody(mockMvc.perform(post("/v1/school-admin/bulk-jobs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "jobType": "student_import",
                                  "totalRecords": 25,
                                  "inputFileReference": "imports/students.csv",
                                  "metadata": {
                                    "source": "school-admin-upload",
                                    "containsPassword": false
                                  }
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.schoolId").value(context.school().getId()))
                .andExpect(jsonPath("$.jobType").value("STUDENT_IMPORT"))
                .andExpect(jsonPath("$.status").value("QUEUED"))
                .andExpect(jsonPath("$.totalRecords").value(25))
                .andExpect(jsonPath("$.processedRecords").value(0))
                .andReturn());
        String bulkJobId = created.at("/id").asText();

        mockMvc.perform(get("/v1/school-admin/bulk-jobs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(bulkJobId))
                .andExpect(jsonPath("$[0].status").value("QUEUED"));

        mockMvc.perform(get("/v1/school-admin/bulk-jobs/{bulkJobId}", bulkJobId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(bulkJobId));

        mockMvc.perform(post("/v1/school-admin/bulk-jobs/{bulkJobId}/cancel", bulkJobId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        assertThat(bulkJobRepository.findById(bulkJobId))
                .get()
                .satisfies(job -> {
                    assertThat(job.getTenant().getId()).isEqualTo(context.tenant().getId());
                    assertThat(job.getSchool().getId()).isEqualTo(context.school().getId());
                    assertThat(job.getRequestedBy().getId()).isEqualTo(context.user().getId());
                    assertThat(job.getStatus()).isEqualTo(BulkJobStatus.CANCELLED);
                    assertThat(job.getMetadataJson()).contains("school-admin-upload");
                });

        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.BULK_JOB_CREATED, AuditAction.BULK_JOB_CANCELLED);
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .allSatisfy(auditLog -> assertThat(auditLog.getMetadataJson()).doesNotContain("students.csv"));

        assertThat(outboxEventRepository.findByAggregateTypeAndAggregateId("BulkJob", bulkJobId))
                .extracting(event -> event.getEventType())
                .contains("BulkJobCreated", "BulkJobCancelled");
        assertThat(outboxEventRepository.findByAggregateTypeAndAggregateId("BulkJob", bulkJobId))
                .allSatisfy(event -> assertThat(event.getPayloadJson()).doesNotContain("students.csv"));
    }

    @Test
    void schoolAdminCannotReadOrCancelAnotherSchoolsBulkJob() throws Exception {
        SchoolUserContext first = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);
        SchoolUserContext second = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);
        String secondJobId = jsonBody(mockMvc.perform(post("/v1/school-admin/bulk-jobs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(second.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "jobType": "student_import",
                                  "totalRecords": 4
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()).at("/id").asText();

        mockMvc.perform(get("/v1/school-admin/bulk-jobs/{bulkJobId}", secondJobId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/school-admin/bulk-jobs/{bulkJobId}/cancel", secondJobId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void nonSchoolAdminCannotCreateBulkJobForGrantedSchool() throws Exception {
        SchoolUserContext teacher = schoolUserContext(UserRole.TEACHER, UserRole.TEACHER);

        mockMvc.perform(post("/v1/school-admin/bulk-jobs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacher.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "jobType": "student_import",
                                  "totalRecords": 1
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(bulkJobRepository.findBySchoolIdOrderByRequestedAtDesc(teacher.school().getId())).isEmpty();
    }

    @Test
    void serviceProgressLifecyclePersistsDurableStateAndRejectsInvalidProgress() {
        SchoolUserContext context = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);
        AuthenticatedUser actor = new AuthenticatedUser(context.user(), context.school().getId());
        String bulkJobId = bulkJobService.create(
                actor,
                new BulkJobCreateRequest("student_import", 3, "input.csv", null)
        ).id();

        bulkJobService.markValidating(bulkJobId);
        bulkJobService.markProcessing(bulkJobId);
        bulkJobService.updateProgress(bulkJobId, new BulkJobProgressRequest(3, 2, 1, "errors/student-import.csv"));
        BulkJobResponse completed = bulkJobService.markCompleted(bulkJobId);

        assertThat(completed.status()).isEqualTo(BulkJobStatus.PARTIALLY_COMPLETED);
        assertThat(completed.processedRecords()).isEqualTo(3);
        assertThat(completed.successRecords()).isEqualTo(2);
        assertThat(completed.failedRecords()).isEqualTo(1);
        assertThat(completed.errorFileReference()).isEqualTo("errors/student-import.csv");
        assertThat(completed.startedAt()).isNotNull();
        assertThat(completed.completedAt()).isNotNull();

        assertThat(outboxEventRepository.findByAggregateTypeAndAggregateId("BulkJob", bulkJobId))
                .extracting(event -> event.getEventType())
                .contains("BulkJobCreated", "BulkJobStatusChanged");

        assertThatThrownBy(() -> bulkJobService.updateProgress(
                bulkJobId,
                new BulkJobProgressRequest(4, 4, 0, null)
        )).isInstanceOf(BadRequestException.class)
                .hasMessageContaining("terminal");
    }

    private SchoolUserContext schoolUserContext(UserRole userRole, UserRole schoolAccessRole) {
        int suffix = SEQUENCE.incrementAndGet();
        Tenant tenant = tenantRepository.save(new Tenant(
                "BULK-" + suffix,
                "Bulk Tenant " + suffix
        ));
        School school = schoolRepository.save(new School(
                tenant,
                "BULK-SCHOOL-" + suffix,
                "Bulk School " + suffix,
                true
        ));
        UserAccount user = new UserAccount(
                tenant,
                "bulk-" + userRole.name().toLowerCase() + "-" + suffix + "@example.com",
                "Bulk " + userRole.name(),
                userRole
        );
        user.activate(passwordEncoder.encode("BulkPassword123!"), "Bulk " + userRole.name(), Instant.now());
        userAccountRepository.save(user);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, user, schoolAccessRole, true));
        String token = jwtAccessTokenService.issueToken(user.getId(), tenant.getId(), userRole, school.getId());
        return new SchoolUserContext(tenant, school, user, token);
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record SchoolUserContext(Tenant tenant, School school, UserAccount user, String accessToken) {
    }
}
