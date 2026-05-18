package com.cloudcampus.storage.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UploadAuditLogRepository extends JpaRepository<UploadAuditLog, UUID> {

    List<UploadAuditLog> findByDocumentIdOrderByOccurredAtDesc(UUID documentId);

    List<UploadAuditLog> findByTenantIdOrderByOccurredAtDesc(UUID tenantId);
}
