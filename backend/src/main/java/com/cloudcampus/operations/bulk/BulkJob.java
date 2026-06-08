package com.cloudcampus.operations.bulk;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "bulk_jobs")
public class BulkJob {

    private static final Set<BulkJobStatus> TERMINAL_STATUSES = Set.of(
            BulkJobStatus.PARTIALLY_COMPLETED,
            BulkJobStatus.COMPLETED,
            BulkJobStatus.FAILED,
            BulkJobStatus.CANCELLED
    );

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(nullable = false, length = 80)
    private String jobType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private UserAccount requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BulkJobStatus status = BulkJobStatus.QUEUED;

    @Column(nullable = false)
    private int totalRecords;

    @Column(nullable = false)
    private int processedRecords;

    @Column(nullable = false)
    private int successRecords;

    @Column(nullable = false)
    private int failedRecords;

    @Column(length = 500)
    private String inputFileReference;

    @Column(length = 500)
    private String errorFileReference;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String metadataJson = "{}";

    @Column(length = 1000)
    private String lastError;

    @Column(nullable = false)
    private Instant requestedAt;

    private Instant startedAt;

    private Instant completedAt;

    private Instant cancelledAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    protected BulkJob() {
    }

    public BulkJob(
            Tenant tenant,
            School school,
            UserAccount requestedBy,
            String jobType,
            int totalRecords,
            String inputFileReference,
            String metadataJson
    ) {
        this.tenant = tenant;
        this.school = school;
        this.requestedBy = requestedBy;
        this.jobType = jobType;
        this.totalRecords = totalRecords;
        this.inputFileReference = inputFileReference;
        this.metadataJson = metadataJson == null || metadataJson.isBlank() ? "{}" : metadataJson;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        if (requestedAt == null) {
            requestedAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    public void markValidating() {
        requireNotTerminal();
        status = BulkJobStatus.VALIDATING;
        touch();
    }

    public void markProcessing() {
        requireNotTerminal();
        status = BulkJobStatus.PROCESSING;
        if (startedAt == null) {
            startedAt = Instant.now();
        }
        touch();
    }

    public void updateProgress(int processedRecords, int successRecords, int failedRecords, String errorFileReference) {
        requireNotTerminal();
        if (processedRecords < 0 || successRecords < 0 || failedRecords < 0) {
            throw new BadRequestException("Bulk job progress counts cannot be negative.");
        }
        if (successRecords + failedRecords != processedRecords) {
            throw new BadRequestException("Bulk job processed count must equal success plus failed records.");
        }
        if (totalRecords > 0 && processedRecords > totalRecords) {
            throw new BadRequestException("Bulk job processed count cannot exceed total records.");
        }
        this.processedRecords = processedRecords;
        this.successRecords = successRecords;
        this.failedRecords = failedRecords;
        if (errorFileReference != null && !errorFileReference.isBlank()) {
            this.errorFileReference = errorFileReference.trim();
        }
        if (status == BulkJobStatus.QUEUED || status == BulkJobStatus.VALIDATING) {
            markProcessing();
        } else {
            touch();
        }
    }

    public void markCompleted() {
        requireNotTerminal();
        status = failedRecords > 0 ? BulkJobStatus.PARTIALLY_COMPLETED : BulkJobStatus.COMPLETED;
        completedAt = Instant.now();
        touch();
    }

    public void markFailed(String error) {
        requireNotTerminal();
        status = BulkJobStatus.FAILED;
        lastError = trimToLength(error, 1000);
        completedAt = Instant.now();
        touch();
    }

    public void cancel() {
        requireNotTerminal();
        status = BulkJobStatus.CANCELLED;
        cancelledAt = Instant.now();
        completedAt = cancelledAt;
        touch();
    }

    public boolean isTerminal() {
        return TERMINAL_STATUSES.contains(status);
    }

    private void requireNotTerminal() {
        if (isTerminal()) {
            throw new BadRequestException("Bulk job is already in a terminal state.");
        }
    }

    private void touch() {
        updatedAt = Instant.now();
    }

    private String trimToLength(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
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

    public String getJobType() {
        return jobType;
    }

    public UserAccount getRequestedBy() {
        return requestedBy;
    }

    public BulkJobStatus getStatus() {
        return status;
    }

    public int getTotalRecords() {
        return totalRecords;
    }

    public int getProcessedRecords() {
        return processedRecords;
    }

    public int getSuccessRecords() {
        return successRecords;
    }

    public int getFailedRecords() {
        return failedRecords;
    }

    public String getInputFileReference() {
        return inputFileReference;
    }

    public String getErrorFileReference() {
        return errorFileReference;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public String getLastError() {
        return lastError;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
