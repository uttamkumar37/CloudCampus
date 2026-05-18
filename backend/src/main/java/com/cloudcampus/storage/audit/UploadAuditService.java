package com.cloudcampus.storage.audit;

import com.cloudcampus.common.web.CorrelationId;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Writes immutable audit records for file storage events (TASK-010).
 *
 * Called within the caller's active transaction so the audit record commits
 * or rolls back together with the operation it records: no orphan entries
 * for failed uploads or deletes.
 */
@Service
public class UploadAuditService {

    private final UploadAuditLogRepository repo;

    public UploadAuditService(UploadAuditLogRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void record(UploadAuditEvent event,
                       UUID tenantId, UUID schoolId, UUID actorId,
                       UUID documentId, String objectKey,
                       String fileName, String mimeType, Long sizeBytes) {
        repo.save(UploadAuditLog.create(
                event, tenantId, schoolId, actorId,
                documentId, objectKey,
                fileName, mimeType, sizeBytes,
                MDC.get(CorrelationId.MDC_KEY)));
    }
}
