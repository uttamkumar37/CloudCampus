package com.cloudcampus.platform.superadmin.control;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Collection;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.operations.bulk.BulkJobProgressRequest;
import com.cloudcampus.operations.bulk.BulkJobService;
import com.cloudcampus.operations.report.ReportExportFile;
import com.cloudcampus.operations.report.ReportExportFileRepository;
import com.cloudcampus.operations.report.ReportExportFormat;
import com.cloudcampus.operations.report.ReportExportJob;
import com.cloudcampus.operations.report.ReportExportJobRepository;
import com.cloudcampus.operations.report.ReportType;
import com.cloudcampus.platform.subscription.TenantInvoice;
import com.cloudcampus.platform.subscription.TenantInvoiceRepository;
import com.cloudcampus.platform.superadmin.stats.PlatformStats;
import com.cloudcampus.platform.superadmin.stats.PlatformStatsRepository;
import com.cloudcampus.platform.superadmin.stats.SchoolStats;
import com.cloudcampus.platform.superadmin.stats.SchoolStatsRepository;
import com.cloudcampus.platform.superadmin.stats.TenantStats;
import com.cloudcampus.platform.superadmin.stats.TenantStatsRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuperAdminReportExportProcessor {

    private static final int EXPORT_PAGE_SIZE = 500;
    private static final String CSV_CONTENT_TYPE = "text/csv";

    private final ReportExportJobRepository reportExportJobRepository;
    private final ReportExportFileRepository reportExportFileRepository;
    private final BulkJobService bulkJobService;
    private final AuditLogService auditLogService;
    private final PlatformStatsRepository platformStatsRepository;
    private final TenantRepository tenantRepository;
    private final TenantStatsRepository tenantStatsRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolStatsRepository schoolStatsRepository;
    private final TenantInvoiceRepository tenantInvoiceRepository;

    public SuperAdminReportExportProcessor(
            ReportExportJobRepository reportExportJobRepository,
            ReportExportFileRepository reportExportFileRepository,
            BulkJobService bulkJobService,
            AuditLogService auditLogService,
            PlatformStatsRepository platformStatsRepository,
            TenantRepository tenantRepository,
            TenantStatsRepository tenantStatsRepository,
            SchoolRepository schoolRepository,
            SchoolStatsRepository schoolStatsRepository,
            TenantInvoiceRepository tenantInvoiceRepository
    ) {
        this.reportExportJobRepository = reportExportJobRepository;
        this.reportExportFileRepository = reportExportFileRepository;
        this.bulkJobService = bulkJobService;
        this.auditLogService = auditLogService;
        this.platformStatsRepository = platformStatsRepository;
        this.tenantRepository = tenantRepository;
        this.tenantStatsRepository = tenantStatsRepository;
        this.schoolRepository = schoolRepository;
        this.schoolStatsRepository = schoolStatsRepository;
        this.tenantInvoiceRepository = tenantInvoiceRepository;
    }

    @Transactional
    public SuperAdminReportExportResponse processPlatformExport(String exportId) {
        ReportExportJob exportJob = requireExport(exportId);
        if (exportJob.getSchool() != null) {
            throw new BadRequestException("School-scoped report exports are processed by the school report service.");
        }
        if (exportJob.getBulkJob().isTerminal()) {
            return toResponse(exportJob);
        }

        try {
            bulkJobService.markProcessing(exportJob.getBulkJob().getId());
            recordAudit(exportJob, AuditAction.REPORT_EXPORT_STARTED, "Platform report export started.", Map.of());
            GeneratedReport generatedReport = generateReport(exportJob);
            reportExportFileRepository.save(new ReportExportFile(
                    exportJob,
                    generatedReport.fileName(),
                    generatedReport.contentType(),
                    generatedReport.sizeBytes(),
                    generatedReport.checksumSha256(),
                    generatedReport.content()
            ));
            bulkJobService.updateProgress(
                    exportJob.getBulkJob().getId(),
                    new BulkJobProgressRequest(generatedReport.rowCount(), generatedReport.rowCount(), 0, null)
            );
            bulkJobService.markCompleted(exportJob.getBulkJob().getId());
            exportJob.markCompleted(Instant.now());
            recordAudit(
                    exportJob,
                    AuditAction.REPORT_EXPORT_COMPLETED,
                    "Platform report export completed.",
                    Map.of("rowCount", generatedReport.rowCount())
            );
            return toResponse(exportJob);
        } catch (RuntimeException exception) {
            String safeError = safeError(exception);
            bulkJobService.markFailed(exportJob.getBulkJob().getId(), safeError);
            recordAudit(
                    exportJob,
                    AuditAction.REPORT_EXPORT_FAILED,
                    "Platform report export failed.",
                    Map.of("error", safeError)
            );
            throw exception;
        }
    }

    private ReportExportJob requireExport(String exportId) {
        return reportExportJobRepository.findById(exportId)
                .orElseThrow(() -> new NotFoundException("Report export was not found."));
    }

    private GeneratedReport generateReport(ReportExportJob exportJob) {
        if (exportJob.getFormat() != ReportExportFormat.CSV) {
            throw new BadRequestException("Only CSV platform report exports are supported.");
        }
        return switch (exportJob.getReportType()) {
            case PLATFORM_SUMMARY -> platformSummary(exportJob);
            case TENANT_DIRECTORY -> tenantDirectory(exportJob);
            case SCHOOL_DIRECTORY -> schoolDirectory(exportJob);
            case INVOICE_SUMMARY -> invoiceSummary(exportJob);
            case STUDENT_DIRECTORY, FEE_DEMANDS -> throw new BadRequestException("This report type is only available for school-scoped exports.");
        };
    }

    private GeneratedReport platformSummary(ReportExportJob exportJob) {
        PlatformStats stats = platformStatsRepository.findById(PlatformStats.PLATFORM_ID).orElse(null);
        StringBuilder csv = new StringBuilder("metric,value\n");
        Map<String, Object> rows = new LinkedHashMap<>();
        rows.put("totalTenantCount", stats == null ? tenantRepository.count() : stats.getTotalTenantCount());
        rows.put("activeTenantCount", stats == null ? "" : stats.getActiveTenantCount());
        rows.put("totalSchoolCount", stats == null ? schoolRepository.count() : stats.getTotalSchoolCount());
        rows.put("activeSchoolCount", stats == null ? schoolRepository.countByActiveTrue() : stats.getActiveSchoolCount());
        rows.put("totalStudentCount", stats == null ? "" : stats.getTotalStudentCount());
        rows.put("activeStudentCount", stats == null ? "" : stats.getActiveStudentCount());
        rows.put("totalStaffCount", stats == null ? "" : stats.getTotalStaffCount());
        rows.put("activeStaffCount", stats == null ? "" : stats.getActiveStaffCount());
        rows.put("totalUserCount", stats == null ? "" : stats.getTotalUserCount());
        rows.put("activeUserCount", stats == null ? "" : stats.getActiveUserCount());
        rows.put("pendingInvoiceCount", stats == null ? "" : stats.getPendingInvoiceCount());
        rows.put("overdueInvoiceCount", stats == null ? "" : stats.getOverdueInvoiceCount());
        rows.put("paidInvoiceCount", stats == null ? "" : stats.getPaidInvoiceCount());
        rows.put("failedNotificationCount", stats == null ? "" : stats.getFailedNotificationCount());
        rows.put("pendingOutboxCount", stats == null ? "" : stats.getPendingOutboxCount());
        rows.put("pendingReportExportCount", stats == null ? "" : stats.getPendingReportExportCount());
        rows.put("lastCalculatedAt", stats == null ? "" : stats.getLastCalculatedAt());
        rows.forEach((metric, value) -> csv.append(csvRow(metric, String.valueOf(value))));
        return generatedCsv(exportJob, rows.size(), csv.toString());
    }

    private GeneratedReport tenantDirectory(ReportExportJob exportJob) {
        StringBuilder csv = new StringBuilder("tenant_code,tenant_name,status,school_count,active_school_count,user_count,active_user_count,created_at\n");
        int rows = 0;
        int pageNumber = 0;
        Page<Tenant> page;
        do {
            page = tenantRepository.findAll(PageRequest.of(pageNumber++, EXPORT_PAGE_SIZE, Sort.by("name").ascending().and(Sort.by("code").ascending())));
            Map<String, TenantStats> statsByTenant = tenantStats(page.getContent().stream().map(Tenant::getId).toList());
            for (Tenant tenant : page.getContent()) {
                TenantStats stats = statsByTenant.get(tenant.getId());
                csv.append(csvRow(
                        tenant.getCode(),
                        tenant.getName(),
                        tenant.getStatus().name(),
                        Long.toString(stats == null ? 0 : stats.getSchoolCount()),
                        Long.toString(stats == null ? 0 : stats.getActiveSchoolCount()),
                        Long.toString(stats == null ? 0 : stats.getUserCount()),
                        Long.toString(stats == null ? 0 : stats.getActiveUserCount()),
                        tenant.getCreatedAt().toString()
                ));
                rows++;
            }
        } while (page.hasNext());
        return generatedCsv(exportJob, rows, csv.toString());
    }

    private GeneratedReport schoolDirectory(ReportExportJob exportJob) {
        StringBuilder csv = new StringBuilder("tenant_code,tenant_name,school_code,school_name,status,student_count,active_student_count,staff_count,active_staff_count,last_activity_at,created_at\n");
        int rows = 0;
        int pageNumber = 0;
        Page<School> page;
        do {
            page = schoolRepository.findAll(PageRequest.of(pageNumber++, EXPORT_PAGE_SIZE, Sort.by("name").ascending().and(Sort.by("code").ascending())));
            Map<String, SchoolStats> statsBySchool = schoolStats(page.getContent().stream().map(School::getId).toList());
            for (School school : page.getContent()) {
                SchoolStats stats = statsBySchool.get(school.getId());
                csv.append(csvRow(
                        school.getTenant().getCode(),
                        school.getTenant().getName(),
                        school.getCode(),
                        school.getName(),
                        school.isActive() ? "ACTIVE" : "INACTIVE",
                        Long.toString(stats == null ? 0 : stats.getStudentCount()),
                        Long.toString(stats == null ? 0 : stats.getActiveStudentCount()),
                        Long.toString(stats == null ? 0 : stats.getStaffCount()),
                        Long.toString(stats == null ? 0 : stats.getActiveStaffCount()),
                        stats == null || stats.getLastActivityAt() == null ? "" : stats.getLastActivityAt().toString(),
                        school.getCreatedAt().toString()
                ));
                rows++;
            }
        } while (page.hasNext());
        return generatedCsv(exportJob, rows, csv.toString());
    }

    private GeneratedReport invoiceSummary(ReportExportJob exportJob) {
        StringBuilder csv = new StringBuilder("invoice_number,tenant_name,plan_code,billing_cycle,amount_cents,currency,status,issued_at,due_at\n");
        int rows = 0;
        int pageNumber = 0;
        Page<TenantInvoice> page;
        do {
            page = tenantInvoiceRepository.findAll(PageRequest.of(pageNumber++, EXPORT_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "issuedAt")));
            for (TenantInvoice invoice : page.getContent()) {
                csv.append(csvRow(
                        invoice.getInvoiceNumber(),
                        invoice.getTenant().getName(),
                        invoice.getPlan().getCode(),
                        invoice.getBillingCycle().name(),
                        Long.toString(invoice.getAmountCents()),
                        invoice.getCurrency(),
                        invoice.getStatus().name(),
                        invoice.getIssuedAt().toString(),
                        invoice.getDueAt() == null ? "" : invoice.getDueAt().toString()
                ));
                rows++;
            }
        } while (page.hasNext());
        return generatedCsv(exportJob, rows, csv.toString());
    }

    private Map<String, TenantStats> tenantStats(Collection<String> tenantIds) {
        if (tenantIds.isEmpty()) {
            return Map.of();
        }
        return tenantStatsRepository.findByTenantIdIn(tenantIds)
                .stream()
                .collect(Collectors.toMap(TenantStats::getTenantId, stats -> stats));
    }

    private Map<String, SchoolStats> schoolStats(Collection<String> schoolIds) {
        if (schoolIds.isEmpty()) {
            return Map.of();
        }
        return schoolStatsRepository.findBySchoolIdIn(schoolIds)
                .stream()
                .collect(Collectors.toMap(SchoolStats::getSchoolId, stats -> stats));
    }

    private GeneratedReport generatedCsv(ReportExportJob exportJob, int rowCount, String content) {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        return new GeneratedReport(
                exportJob.getReportType().name().toLowerCase() + "-" + exportJob.getId() + ".csv",
                CSV_CONTENT_TYPE,
                bytes.length,
                sha256(bytes),
                content,
                rowCount
        );
    }

    private String csvRow(String... values) {
        StringBuilder row = new StringBuilder();
        for (int index = 0; index < values.length; index++) {
            if (index > 0) {
                row.append(',');
            }
            row.append(csvValue(values[index]));
        }
        return row.append('\n').toString();
    }

    private String csvValue(String value) {
        String safeValue = value == null ? "" : value;
        if (!safeValue.contains(",") && !safeValue.contains("\"") && !safeValue.contains("\n")) {
            return safeValue;
        }
        return "\"" + safeValue.replace("\"", "\"\"") + "\"";
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 digest is unavailable.", exception);
        }
    }

    private void recordAudit(ReportExportJob exportJob, AuditAction action, String summary, Map<String, ?> extraMetadata) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("actorRole", exportJob.getRequestedBy().getRole().name());
        metadata.put("tenantId", exportJob.getTenant().getId());
        metadata.put("reportExportId", exportJob.getId());
        metadata.put("bulkJobId", exportJob.getBulkJob().getId());
        metadata.put("reportType", exportJob.getReportType().name());
        metadata.put("format", exportJob.getFormat().name());
        metadata.putAll(extraMetadata);
        auditLogService.record(
                exportJob.getTenant().getId(),
                null,
                exportJob.getRequestedBy().getRole().name(),
                exportJob.getRequestedBy().getId(),
                action,
                "ReportExportJob",
                exportJob.getId(),
                summary,
                metadata
        );
    }

    private SuperAdminReportExportResponse toResponse(ReportExportJob job) {
        return new SuperAdminReportExportResponse(
                job.getId(),
                job.getTenant().getId(),
                job.getTenant().getName(),
                null,
                "Platform-wide",
                job.getReportType().name(),
                job.getFormat().name(),
                job.getBulkJob().getStatus().name(),
                job.getRequestedAt(),
                job.getCompletedAt()
        );
    }

    private String safeError(RuntimeException exception) {
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            message = exception.getClass().getSimpleName();
        }
        return message.lines()
                .map(String::trim)
                .filter(PredicateUtils::notBlank)
                .min(Comparator.comparingInt(String::length))
                .orElse("Report export failed.");
    }

    private record GeneratedReport(
            String fileName,
            String contentType,
            long sizeBytes,
            String checksumSha256,
            String content,
            int rowCount
    ) {
    }

    private static final class PredicateUtils {
        private PredicateUtils() {
        }

        private static boolean notBlank(String value) {
            return value != null && !value.isBlank();
        }
    }
}
