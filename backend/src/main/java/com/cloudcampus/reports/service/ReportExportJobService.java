package com.cloudcampus.reports.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.reports.dto.ReportExportJobResponse;
import com.cloudcampus.reports.service.ReportCsvExportService.CsvExport;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.function.Supplier;

@Service
public class ReportExportJobService {

    private static final Duration JOB_TTL = Duration.ofHours(1);

    private final ReportCsvExportService csvExportService;
    private final Executor reportExportExecutor;
    private final Map<UUID, ExportJob> jobs = new ConcurrentHashMap<>();

    public ReportExportJobService(
            ReportCsvExportService csvExportService,
            @Qualifier("reportExportExecutor") Executor reportExportExecutor) {
        this.csvExportService = csvExportService;
        this.reportExportExecutor = reportExportExecutor;
    }

    public ReportExportJobResponse createAttendance(UUID schoolId, UUID academicYearId) {
        return create(schoolId, "ATTENDANCE", () -> csvExportService.attendance(schoolId, academicYearId));
    }

    public ReportExportJobResponse createFees(UUID schoolId, UUID academicYearId) {
        return create(schoolId, "FEES", () -> csvExportService.fees(schoolId, academicYearId));
    }

    public ReportExportJobResponse createPerformance(UUID schoolId, UUID examId) {
        return create(schoolId, "PERFORMANCE", () -> csvExportService.performance(schoolId, examId));
    }

    public ReportExportJobResponse get(UUID schoolId, UUID jobId) {
        return toResponse(findJob(schoolId, jobId));
    }

    public CsvExport download(UUID schoolId, UUID jobId) {
        ExportJob job = findJob(schoolId, jobId);
        if (job.status != ExportStatus.COMPLETED) {
            throw new BadRequestException("Report export job is not complete");
        }
        return new CsvExport(job.filename, job.contentType, job.bytes);
    }

    private ReportExportJobResponse create(UUID schoolId, String type, Supplier<CsvExport> generator) {
        cleanupExpiredJobs();
        ExportJob job = new ExportJob(UUID.randomUUID(), schoolId, type);
        jobs.put(job.jobId, job);
        reportExportExecutor.execute(() -> run(job, generator));
        return toResponse(job);
    }

    private void run(ExportJob job, Supplier<CsvExport> generator) {
        job.status = ExportStatus.RUNNING;
        try {
            CsvExport csv = generator.get();
            job.filename = csv.filename();
            job.contentType = csv.contentType();
            job.bytes = csv.bytes();
            job.status = ExportStatus.COMPLETED;
        } catch (Exception ex) {
            job.errorMessage = ex.getMessage();
            job.status = ExportStatus.FAILED;
        } finally {
            job.completedAt = Instant.now();
        }
    }

    private ExportJob findJob(UUID schoolId, UUID jobId) {
        ExportJob job = jobs.get(jobId);
        if (job == null || !job.schoolId.equals(schoolId)) {
            throw new NotFoundException("Report export job not found");
        }
        return job;
    }

    private ReportExportJobResponse toResponse(ExportJob job) {
        String downloadUrl = job.status == ExportStatus.COMPLETED
                ? "/v1/school-admin/schools/%s/reports/jobs/%s/download".formatted(job.schoolId, job.jobId)
                : null;
        return new ReportExportJobResponse(
                job.jobId,
                job.type,
                job.status.name(),
                job.filename,
                job.contentType,
                job.createdAt,
                job.completedAt,
                job.errorMessage,
                downloadUrl);
    }

    private void cleanupExpiredJobs() {
        Instant cutoff = Instant.now().minus(JOB_TTL);
        jobs.values().removeIf(job -> job.createdAt.isBefore(cutoff));
    }

    private enum ExportStatus {
        QUEUED,
        RUNNING,
        COMPLETED,
        FAILED
    }

    private static final class ExportJob {
        private final UUID jobId;
        private final UUID schoolId;
        private final String type;
        private final Instant createdAt = Instant.now();
        private volatile ExportStatus status = ExportStatus.QUEUED;
        private volatile String filename;
        private volatile String contentType;
        private volatile byte[] bytes;
        private volatile Instant completedAt;
        private volatile String errorMessage;

        private ExportJob(UUID jobId, UUID schoolId, String type) {
            this.jobId = jobId;
            this.schoolId = schoolId;
            this.type = type;
        }
    }
}
