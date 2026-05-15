package com.cloudcampus.student.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_documents")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentDocument {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "document_type", nullable = false, length = 60)
    private String documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "mime_type", nullable = false, length = 120)
    private String mimeType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "object_key", nullable = false, length = 512, updatable = false)
    private String objectKey;

    @Column(name = "uploaded_by", nullable = false, updatable = false)
    private UUID uploadedBy;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;

    protected StudentDocument() {}

    @PrePersist
    void onPersist() {
        if (id         == null) id         = UUID.randomUUID();
        if (uploadedAt == null) uploadedAt = Instant.now();
    }

    public static StudentDocument create(UUID tenantId, UUID schoolId, UUID studentId,
                                          String documentType, String fileName,
                                          String mimeType, long sizeBytes,
                                          String objectKey, UUID uploadedBy) {
        StudentDocument d = new StudentDocument();
        d.tenantId     = tenantId;
        d.schoolId     = schoolId;
        d.studentId    = studentId;
        d.documentType = documentType;
        d.fileName     = fileName;
        d.mimeType     = mimeType;
        d.sizeBytes    = sizeBytes;
        d.objectKey    = objectKey;
        d.uploadedBy   = uploadedBy;
        return d;
    }

    public UUID    getId()           { return id; }
    public UUID    getTenantId()     { return tenantId; }
    public UUID    getSchoolId()     { return schoolId; }
    public UUID    getStudentId()    { return studentId; }
    public String  getDocumentType() { return documentType; }
    public String  getFileName()     { return fileName; }
    public String  getMimeType()     { return mimeType; }
    public long    getSizeBytes()    { return sizeBytes; }
    public String  getObjectKey()    { return objectKey; }
    public UUID    getUploadedBy()   { return uploadedBy; }
    public Instant getUploadedAt()   { return uploadedAt; }
}
