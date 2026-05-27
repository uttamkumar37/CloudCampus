package com.cloudcampus.people.student;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.operations.bulk.BulkJob;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_import_jobs")
public class StudentImportJob {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bulk_job_id", nullable = false, unique = true)
    private BulkJob bulkJob;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private UserAccount requestedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rowsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String validationErrorsJson = "[]";

    @Column(nullable = false)
    private Instant createdAt;

    private Instant processedAt;

    protected StudentImportJob() {
    }

    public StudentImportJob(Tenant tenant, School school, BulkJob bulkJob, UserAccount requestedBy, String rowsJson) {
        this.tenant = tenant;
        this.school = school;
        this.bulkJob = bulkJob;
        this.requestedBy = requestedBy;
        this.rowsJson = rowsJson;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void recordValidationErrors(String validationErrorsJson) {
        this.validationErrorsJson = validationErrorsJson == null || validationErrorsJson.isBlank()
                ? "[]"
                : validationErrorsJson;
        this.processedAt = Instant.now();
    }

    public void markProcessed() {
        this.validationErrorsJson = "[]";
        this.processedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public BulkJob getBulkJob() {
        return bulkJob;
    }

    public UserAccount getRequestedBy() {
        return requestedBy;
    }

    public String getRowsJson() {
        return rowsJson;
    }

    public String getValidationErrorsJson() {
        return validationErrorsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }
}
