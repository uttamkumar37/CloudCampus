package com.cloudcampus.storage.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable audit record for file storage events (TASK-010).
 *
 * Intentionally has NO Hibernate @Filter: audit records must be readable
 * across all tenants for security reviews and must survive document deletion.
 * No FK on document_id for the same reason.
 */
@Entity
@Table(name = "upload_audit_log")
public class UploadAuditLog {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "actor_id", nullable = false, updatable = false)
    private UUID actorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 30)
    private UploadAuditEvent event;

    @Column(name = "document_id", updatable = false)
    private UUID documentId;

    @Column(name = "object_key", nullable = false, updatable = false, length = 512)
    private String objectKey;

    @Column(name = "file_name", updatable = false, length = 255)
    private String fileName;

    @Column(name = "mime_type", updatable = false, length = 120)
    private String mimeType;

    @Column(name = "size_bytes", updatable = false)
    private Long sizeBytes;

    @Column(name = "correlation_id", updatable = false, length = 64)
    private String correlationId;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    protected UploadAuditLog() {}

    @PrePersist
    void onPersist() {
        if (id         == null) id         = UUID.randomUUID();
        if (occurredAt == null) occurredAt = Instant.now();
    }

    public static UploadAuditLog create(UploadAuditEvent event,
                                        UUID tenantId, UUID schoolId, UUID actorId,
                                        UUID documentId, String objectKey,
                                        String fileName, String mimeType, Long sizeBytes,
                                        String correlationId) {
        UploadAuditLog e = new UploadAuditLog();
        e.event         = event;
        e.tenantId      = tenantId;
        e.schoolId      = schoolId;
        e.actorId       = actorId;
        e.documentId    = documentId;
        e.objectKey     = objectKey;
        e.fileName      = fileName;
        e.mimeType      = mimeType;
        e.sizeBytes     = sizeBytes;
        e.correlationId = correlationId;
        return e;
    }

    public UUID             getId()            { return id; }
    public UUID             getTenantId()      { return tenantId; }
    public UUID             getSchoolId()      { return schoolId; }
    public UUID             getActorId()       { return actorId; }
    public UploadAuditEvent getEvent()         { return event; }
    public UUID             getDocumentId()    { return documentId; }
    public String           getObjectKey()     { return objectKey; }
    public String           getFileName()      { return fileName; }
    public String           getMimeType()      { return mimeType; }
    public Long             getSizeBytes()     { return sizeBytes; }
    public String           getCorrelationId() { return correlationId; }
    public Instant          getOccurredAt()    { return occurredAt; }
}
