package com.cloudcampus.operations.bulk;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.events.outbox.TransactionalOutboxService;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BulkJobService {

    private static final String JOB_TYPE_PATTERN = "^[A-Z0-9_:-]{3,80}$";

    private final BulkJobRepository bulkJobRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;
    private final TransactionalOutboxService transactionalOutboxService;
    private final ObjectMapper objectMapper;

    public BulkJobService(
            BulkJobRepository bulkJobRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService,
            TransactionalOutboxService transactionalOutboxService,
            ObjectMapper objectMapper
    ) {
        this.bulkJobRepository = bulkJobRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
        this.transactionalOutboxService = transactionalOutboxService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public BulkJobResponse create(AuthenticatedUser actor, BulkJobCreateRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        String jobType = normalizeJobType(request.jobType());
        int totalRecords = request.totalRecords() == null ? 0 : request.totalRecords();
        if (totalRecords < 0) {
            throw new BadRequestException("Bulk job total records cannot be negative.");
        }

        BulkJob job = bulkJobRepository.save(new BulkJob(
                school.getTenant(),
                school,
                actor.user(),
                jobType,
                totalRecords,
                normalizeOptional(request.inputFileReference()),
                metadataJson(request.metadata())
        ));
        recordAudit(actor.user(), job, AuditAction.BULK_JOB_CREATED, "Bulk job queued.");
        recordOutbox(job, "BulkJobCreated", "bulk-job:" + job.getId() + ":created", safePayload(job));
        return toResponse(job);
    }

    @Transactional(readOnly = true)
    public List<BulkJobResponse> list(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return bulkJobRepository.findBySchoolIdOrderByRequestedAtDesc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BulkJobResponse get(AuthenticatedUser actor, String bulkJobId) {
        BulkJob job = requireAccessibleJob(actor, bulkJobId);
        return toResponse(job);
    }

    @Transactional
    public BulkJobResponse cancel(AuthenticatedUser actor, String bulkJobId) {
        BulkJob job = requireAccessibleJob(actor, bulkJobId);
        job.cancel();
        recordAudit(actor.user(), job, AuditAction.BULK_JOB_CANCELLED, "Bulk job cancelled.");
        recordOutbox(job, "BulkJobCancelled", "bulk-job:" + job.getId() + ":cancelled", safePayload(job));
        return toResponse(job);
    }

    @Transactional
    public BulkJobResponse markValidating(String bulkJobId) {
        BulkJob job = requireJob(bulkJobId);
        job.markValidating();
        recordStatusChanged(job);
        return toResponse(job);
    }

    @Transactional
    public BulkJobResponse markProcessing(String bulkJobId) {
        BulkJob job = requireJob(bulkJobId);
        job.markProcessing();
        recordStatusChanged(job);
        return toResponse(job);
    }

    @Transactional
    public BulkJobResponse updateProgress(String bulkJobId, BulkJobProgressRequest request) {
        BulkJob job = requireJob(bulkJobId);
        job.updateProgress(
                request.processedRecords(),
                request.successRecords(),
                request.failedRecords(),
                normalizeOptional(request.errorFileReference())
        );
        recordStatusChanged(job);
        return toResponse(job);
    }

    @Transactional
    public BulkJobResponse markCompleted(String bulkJobId) {
        BulkJob job = requireJob(bulkJobId);
        job.markCompleted();
        recordStatusChanged(job);
        return toResponse(job);
    }

    @Transactional
    public BulkJobResponse markFailed(String bulkJobId, String error) {
        BulkJob job = requireJob(bulkJobId);
        job.markFailed(error);
        recordStatusChanged(job);
        return toResponse(job);
    }

    private School requireActiveSchoolAdminSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private BulkJob requireAccessibleJob(AuthenticatedUser actor, String bulkJobId) {
        BulkJob job = requireJob(bulkJobId);
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), job.getSchool().getId());
        return job;
    }

    private BulkJob requireJob(String bulkJobId) {
        return bulkJobRepository.findById(bulkJobId)
                .orElseThrow(() -> new NotFoundException("Bulk job was not found."));
    }

    private String normalizeJobType(String jobType) {
        String normalized = normalizeOptional(jobType);
        if (normalized == null) {
            throw new BadRequestException("Bulk job type is required.");
        }
        normalized = normalized.toUpperCase(Locale.ROOT).replace(' ', '_');
        if (!normalized.matches(JOB_TYPE_PATTERN)) {
            throw new BadRequestException("Bulk job type may include only letters, numbers, underscore, colon, or hyphen.");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String metadataJson(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Bulk job metadata must be JSON serializable.");
        }
    }

    private void recordAudit(UserAccount actor, BulkJob job, AuditAction action, String summary) {
        auditLogService.record(
                job.getTenant().getId(),
                job.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                "BulkJob",
                job.getId(),
                summary,
                safePayload(job)
        );
    }

    private void recordStatusChanged(BulkJob job) {
        recordOutbox(
                job,
                "BulkJobStatusChanged",
                null,
                safePayload(job)
        );
    }

    private void recordOutbox(BulkJob job, String eventType, String eventKey, Map<String, ?> payload) {
        transactionalOutboxService.record(
                job.getTenant().getId(),
                job.getSchool().getId(),
                "BulkJob",
                job.getId(),
                eventType,
                eventKey,
                payload
        );
    }

    private Map<String, ?> safePayload(BulkJob job) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("bulkJobId", job.getId());
        payload.put("tenantId", job.getTenant().getId());
        payload.put("schoolId", job.getSchool().getId());
        payload.put("jobType", job.getJobType());
        payload.put("requestedByUserId", job.getRequestedBy().getId());
        payload.put("status", job.getStatus().name());
        payload.put("totalRecords", job.getTotalRecords());
        payload.put("processedRecords", job.getProcessedRecords());
        payload.put("successRecords", job.getSuccessRecords());
        payload.put("failedRecords", job.getFailedRecords());
        payload.put("hasInputFileReference", job.getInputFileReference() != null);
        payload.put("hasErrorFileReference", job.getErrorFileReference() != null);
        return payload;
    }

    private BulkJobResponse toResponse(BulkJob job) {
        return new BulkJobResponse(
                job.getId(),
                job.getTenant().getId(),
                job.getSchool().getId(),
                job.getJobType(),
                job.getRequestedBy().getId(),
                job.getStatus(),
                job.getTotalRecords(),
                job.getProcessedRecords(),
                job.getSuccessRecords(),
                job.getFailedRecords(),
                job.getInputFileReference(),
                job.getErrorFileReference(),
                job.getLastError(),
                job.getRequestedAt(),
                job.getStartedAt(),
                job.getCompletedAt(),
                job.getCancelledAt(),
                job.getUpdatedAt()
        );
    }
}
