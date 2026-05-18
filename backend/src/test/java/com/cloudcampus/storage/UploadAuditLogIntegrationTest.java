package com.cloudcampus.storage;

import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.common.exception.UsageLimitExceededException;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.storage.dto.StorageQuotaResponse;
import com.cloudcampus.storage.audit.UploadAuditEvent;
import com.cloudcampus.storage.audit.UploadAuditLog;
import com.cloudcampus.storage.audit.UploadAuditLogRepository;
import com.cloudcampus.student.dto.StudentDocumentResponse;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.student.service.StudentDocumentService;
import com.cloudcampus.tenant.entity.TenantConfig;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

/**
 * TASK-010 - Upload audit logging integration tests.
 *
 * StorageService is mocked so no MinIO instance is required.
 * Verifies that UPLOAD, DOWNLOAD_URL, and DELETE events are persisted to
 * upload_audit_log with the correct tenant, school, actor, file type, and
 * correlation ID fields.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("TASK-010 - Upload Audit Log Integration Tests")
class UploadAuditLogIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    // Mock StorageService to avoid MinIO dependency in tests
    @MockitoBean
    StorageService storageService;

    @Autowired StudentDocumentService     documentService;
    @Autowired StorageQuotaService        quotaService;
    @Autowired UploadAuditLogRepository   auditRepo;
    @Autowired TenantRepository           tenantRepo;
    @Autowired TenantConfigRepository     tenantConfigRepo;
    @Autowired SchoolRepository           schoolRepo;
    @Autowired StudentRepository          studentRepo;

    private UUID tenantId;
    private UUID schoolId;
    private UUID studentId;
    private UUID actorId;

    private static final String CORRELATION_ID = "test-corr-" + UUID.randomUUID();

    @BeforeAll
    void seedData() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        tenantId = UUID.randomUUID();
        actorId  = UUID.randomUUID();

        tenantRepo.save(new Tenant(tenantId, "AUDIT-" + suffix, "Audit Test Tenant",
                TenantStatus.ACTIVE, Instant.now()));

        schoolId = UUID.randomUUID();
        schoolRepo.save(new School(schoolId, tenantId, "Audit Test School",
                "AUDIT-SCH-" + suffix, SchoolStatus.ACTIVE, Instant.now()));

        Student student = Student.create(tenantId, schoolId,
                "2025-AUDIT-" + suffix, "Alice", "Anderson", LocalDate.now());
        studentId = studentRepo.save(student).getId();
    }

    @BeforeEach
    void setupRequestContext() {
        RequestContext.setTenantId(tenantId.toString());
        RequestContext.setUserId(actorId);
        MDC.put(CorrelationId.MDC_KEY, CORRELATION_ID);

        tenantConfigRepo.save(new TenantConfig(tenantId, TenantConfigKey.MAX_STORAGE_BYTES, "0"));
        reset(storageService);
        given(storageService.presignedGetUrl(any())).willReturn("https://minio.test/presigned");
        willDoNothing().given(storageService).upload(any(), any());
        willDoNothing().given(storageService).delete(any());
    }

    @AfterEach
    void cleanup() {
        RequestContext.clearAll();
        MDC.remove(CorrelationId.MDC_KEY);
    }

    private MockMultipartFile pdfFile() {
        // Starts with %PDF- magic bytes so StorageService.validate() would pass
        // (validation is bypassed here because StorageService is mocked)
        return new MockMultipartFile(
                "file", "transcript.pdf", "application/pdf",
                "%PDF-1.4 test content".getBytes());
    }

    @Test
    @DisplayName("[audit] UPLOAD event is persisted with tenant, school, actor, file type, correlation ID")
    void upload_writesAuditRecord() {
        StudentDocumentResponse uploaded =
                documentService.upload(schoolId, studentId, "TRANSCRIPT", pdfFile());

        List<UploadAuditLog> logs = auditRepo.findByDocumentIdOrderByOccurredAtDesc(uploaded.id())
                .stream().filter(l -> l.getEvent() == UploadAuditEvent.UPLOAD).toList();

        assertThat(logs).as("UPLOAD audit record must be written").isNotEmpty();
        UploadAuditLog log = logs.get(0);

        assertThat(log.getTenantId()).isEqualTo(tenantId);
        assertThat(log.getSchoolId()).isEqualTo(schoolId);
        assertThat(log.getActorId()).isEqualTo(actorId);
        assertThat(log.getDocumentId()).as("document_id must be set after successful save").isNotNull();
        assertThat(log.getFileName()).isEqualTo("transcript.pdf");
        assertThat(log.getMimeType()).contains("pdf");
        assertThat(log.getSizeBytes()).isPositive();
        assertThat(log.getCorrelationId()).isEqualTo(CORRELATION_ID);
        assertThat(log.getOccurredAt()).isNotNull();
    }

    @Test
    @DisplayName("[audit] DOWNLOAD_URL event is persisted when presigned URL is generated")
    void presignedUrl_writesAuditRecord() {
        StudentDocumentResponse uploaded =
                documentService.upload(schoolId, studentId, "TRANSCRIPT", pdfFile());
        UUID documentId = uploaded.id();

        documentService.presignedUrl(schoolId, studentId, documentId);

        List<UploadAuditLog> downloadLogs = auditRepo.findByDocumentIdOrderByOccurredAtDesc(documentId)
                .stream().filter(l -> l.getEvent() == UploadAuditEvent.DOWNLOAD_URL).toList();

        assertThat(downloadLogs).as("DOWNLOAD_URL audit record must be written").isNotEmpty();
        UploadAuditLog log = downloadLogs.get(0);
        assertThat(log.getTenantId()).isEqualTo(tenantId);
        assertThat(log.getActorId()).isEqualTo(actorId);
        assertThat(log.getCorrelationId()).isEqualTo(CORRELATION_ID);
    }

    @Test
    @DisplayName("[audit] DELETE event is persisted after document is deleted")
    void delete_writesAuditRecord() {
        StudentDocumentResponse uploaded =
                documentService.upload(schoolId, studentId, "TRANSCRIPT", pdfFile());
        UUID documentId = uploaded.id();

        documentService.delete(schoolId, studentId, documentId);

        // Audit records survive even after the document row is deleted
        List<UploadAuditLog> allLogs = auditRepo.findByDocumentIdOrderByOccurredAtDesc(documentId);
        List<UploadAuditLog> deleteLogs = allLogs.stream()
                .filter(l -> l.getEvent() == UploadAuditEvent.DELETE).toList();

        assertThat(deleteLogs).as("DELETE audit record must survive document deletion").isNotEmpty();
        UploadAuditLog log = deleteLogs.get(0);
        assertThat(log.getTenantId()).isEqualTo(tenantId);
        assertThat(log.getActorId()).isEqualTo(actorId);
        assertThat(log.getFileName()).isEqualTo("transcript.pdf");
    }

    @Test
    @DisplayName("[audit] All three event types are captured for a full document lifecycle")
    void fullLifecycle_allThreeEventsRecorded() {
        StudentDocumentResponse uploaded =
                documentService.upload(schoolId, studentId, "ID_CARD", pdfFile());
        UUID documentId = uploaded.id();

        documentService.presignedUrl(schoolId, studentId, documentId);
        documentService.delete(schoolId, studentId, documentId);

        List<UploadAuditEvent> events = auditRepo.findByDocumentIdOrderByOccurredAtDesc(documentId)
                .stream().map(UploadAuditLog::getEvent).toList();

        assertThat(events)
                .as("All three lifecycle events must be recorded")
                .contains(UploadAuditEvent.UPLOAD, UploadAuditEvent.DOWNLOAD_URL, UploadAuditEvent.DELETE);
    }

    @Test
    @DisplayName("[quota] Upload is rejected before object storage write when tenant quota is exceeded")
    void upload_rejectsWhenTenantQuotaExceeded() {
        MockMultipartFile file = pdfFile();
        long current = quotaService.getUsage(tenantId).usedBytes();
        tenantConfigRepo.save(new TenantConfig(
                tenantId,
                TenantConfigKey.MAX_STORAGE_BYTES,
                Long.toString(current + file.getSize() - 1)));

        assertThatThrownBy(() -> documentService.upload(schoolId, studentId, "TRANSCRIPT", file))
                .isInstanceOf(UsageLimitExceededException.class)
                .hasMessageContaining(TenantConfigKey.MAX_STORAGE_BYTES.name());

        verify(storageService, never()).upload(any(), any());
    }

    @Test
    @DisplayName("[quota] Usage is queryable and reflects successful uploads")
    void quotaUsage_isQueryable() {
        MockMultipartFile file = pdfFile();
        StorageQuotaResponse before = quotaService.getUsage(tenantId);
        tenantConfigRepo.save(new TenantConfig(
                tenantId,
                TenantConfigKey.MAX_STORAGE_BYTES,
                Long.toString(before.usedBytes() + file.getSize())));

        documentService.upload(schoolId, studentId, "TRANSCRIPT", file);

        StorageQuotaResponse after = quotaService.getUsage(tenantId);
        assertThat(after.limitBytes()).isEqualTo(before.usedBytes() + file.getSize());
        assertThat(after.usedBytes()).isEqualTo(before.usedBytes() + file.getSize());
        assertThat(after.remainingBytes()).isZero();
        assertThat(after.utilizationPercent()).isEqualTo(100);
    }
}
