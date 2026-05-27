package com.cloudcampus.operations.report;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.operations.bulk.BulkJob;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "report_export_jobs")
public class ReportExportJob {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private UserAccount requestedBy;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bulk_job_id", nullable = false)
    private BulkJob bulkJob;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 80)
    private ReportType reportType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportExportFormat format;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String parametersJson = "{}";

    @Column(nullable = false)
    private Instant requestedAt;

    private Instant completedAt;

    protected ReportExportJob() {
    }

    public ReportExportJob(
            School school,
            UserAccount requestedBy,
            BulkJob bulkJob,
            ReportType reportType,
            ReportExportFormat format,
            String parametersJson
    ) {
        this.tenant = school.getTenant();
        this.school = school;
        this.requestedBy = requestedBy;
        this.bulkJob = bulkJob;
        this.reportType = reportType;
        this.format = format;
        this.parametersJson = parametersJson == null || parametersJson.isBlank() ? "{}" : parametersJson;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (requestedAt == null) {
            requestedAt = Instant.now();
        }
    }

    public void markCompleted(Instant completedAt) {
        this.completedAt = completedAt;
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

    public UserAccount getRequestedBy() {
        return requestedBy;
    }

    public BulkJob getBulkJob() {
        return bulkJob;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public ReportExportFormat getFormat() {
        return format;
    }

    public String getParametersJson() {
        return parametersJson;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
