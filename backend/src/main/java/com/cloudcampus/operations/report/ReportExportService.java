package com.cloudcampus.operations.report;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.guard.AuthorizationGuard;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.operations.bulk.BulkJobCreateRequest;
import com.cloudcampus.operations.bulk.BulkJobProgressRequest;
import com.cloudcampus.operations.bulk.BulkJobRepository;
import com.cloudcampus.operations.bulk.BulkJobResponse;
import com.cloudcampus.operations.bulk.BulkJobService;
import com.cloudcampus.operations.bulk.BulkJobStatus;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportExportService {

    private static final String REPORT_JOB_TYPE = "REPORT_EXPORT";
    private static final String CSV_CONTENT_TYPE = "text/csv";

    private final ReportExportJobRepository reportExportJobRepository;
    private final ReportExportFileRepository reportExportFileRepository;
    private final StudentRepository studentRepository;
    private final FeeDemandRepository feeDemandRepository;
    private final BulkJobRepository bulkJobRepository;
    private final SchoolRepository schoolRepository;
    private final BulkJobService bulkJobService;
    private final AuditLogService auditLogService;
    private final AuthorizationGuard authorizationGuard;
    private final ObjectMapper objectMapper;

    public ReportExportService(
            ReportExportJobRepository reportExportJobRepository,
            ReportExportFileRepository reportExportFileRepository,
            StudentRepository studentRepository,
            FeeDemandRepository feeDemandRepository,
            BulkJobRepository bulkJobRepository,
            SchoolRepository schoolRepository,
            BulkJobService bulkJobService,
            AuditLogService auditLogService,
            AuthorizationGuard authorizationGuard,
            ObjectMapper objectMapper
    ) {
        this.reportExportJobRepository = reportExportJobRepository;
        this.reportExportFileRepository = reportExportFileRepository;
        this.studentRepository = studentRepository;
        this.feeDemandRepository = feeDemandRepository;
        this.bulkJobRepository = bulkJobRepository;
        this.schoolRepository = schoolRepository;
        this.bulkJobService = bulkJobService;
        this.auditLogService = auditLogService;
        this.authorizationGuard = authorizationGuard;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ReportExportResponse requestExport(RequestContext context, AuthenticatedUser actor, ReportExportRequest request) {
        School school = requireSchoolReportSchool(context);
        BulkJobResponse bulkJob = bulkJobService.createForSchoolLeadership(
                actor,
                new BulkJobCreateRequest(
                        REPORT_JOB_TYPE,
                        0,
                        null,
                        Map.of(
                                "reportType", request.reportType().name(),
                                "format", request.format().name()
                        )
                )
        );
        ReportExportJob exportJob = reportExportJobRepository.save(new ReportExportJob(
                school,
                actor.user(),
                requireBulkJobReference(bulkJob.id()),
                request.reportType(),
                request.format(),
                parametersJson(request.parameters())
        ));
        recordAudit(actor.user(), exportJob, AuditAction.REPORT_EXPORT_REQUESTED, "Report export requested.");
        return toResponse(exportJob);
    }

    @Transactional
    public ReportExportResponse requestFinanceExport(RequestContext context, AuthenticatedUser actor, ReportExportRequest request) {
        requireFinanceReportRequest(request);
        School school = requireFinanceReportExportSchool(context);
        BulkJobResponse bulkJob = bulkJobService.createForSchoolFinance(
                actor,
                new BulkJobCreateRequest(
                        REPORT_JOB_TYPE,
                        0,
                        null,
                        Map.of(
                                "reportType", request.reportType().name(),
                                "format", request.format().name()
                        )
                )
        );
        ReportExportJob exportJob = reportExportJobRepository.save(new ReportExportJob(
                school,
                actor.user(),
                requireBulkJobReference(bulkJob.id()),
                request.reportType(),
                request.format(),
                parametersJson(request.parameters())
        ));
        recordAudit(actor.user(), exportJob, AuditAction.REPORT_EXPORT_REQUESTED, "Finance report export requested.");
        return toResponse(exportJob);
    }

    @Transactional(readOnly = true)
    public List<ReportExportResponse> listExports(RequestContext context) {
        School school = requireSchoolReportSchool(context);
        return reportExportJobRepository.findBySchoolIdOrderByRequestedAtDesc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReportExportResponse> listFinanceExports(RequestContext context) {
        School school = requireFinanceReportViewSchool(context);
        return reportExportJobRepository.findBySchoolIdOrderByRequestedAtDesc(school.getId())
                .stream()
                .filter(exportJob -> exportJob.getReportType() == ReportType.FEE_DEMANDS)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReportExportResponse getExport(RequestContext context, String exportId) {
        ReportExportJob exportJob = requireAccessibleExport(context, exportId);
        return toResponse(exportJob);
    }

    @Transactional(readOnly = true)
    public ReportExportResponse getFinanceExport(RequestContext context, String exportId) {
        ReportExportJob exportJob = requireAccessibleFinanceExport(context, exportId);
        return toResponse(exportJob);
    }

    @Transactional
    public ReportExportFileResponse downloadExport(RequestContext context, AuthenticatedUser actor, String exportId) {
        ReportExportJob exportJob = requireAccessibleExport(context, exportId);
        if (exportJob.getBulkJob().getStatus() != BulkJobStatus.COMPLETED) {
            throw new ConflictException("Report export file is not ready.");
        }
        ReportExportFile file = reportExportFileRepository.findByReportExportJobId(exportJob.getId())
                .orElseThrow(() -> new NotFoundException("Report export file was not found."));
        recordAudit(actor.user(), exportJob, AuditAction.REPORT_EXPORT_DOWNLOADED, "Report export downloaded.");
        return new ReportExportFileResponse(
                file.getFileName(),
                file.getContentType(),
                file.getSizeBytes(),
                file.getChecksumSha256(),
                file.getContent()
        );
    }

    @Transactional
    public ReportExportFileResponse downloadFinanceExport(RequestContext context, AuthenticatedUser actor, String exportId) {
        ReportExportJob exportJob = requireAccessibleFinanceExport(context, exportId);
        if (exportJob.getBulkJob().getStatus() != BulkJobStatus.COMPLETED) {
            throw new ConflictException("Report export file is not ready.");
        }
        ReportExportFile file = reportExportFileRepository.findByReportExportJobId(exportJob.getId())
                .orElseThrow(() -> new NotFoundException("Report export file was not found."));
        recordAudit(actor.user(), exportJob, AuditAction.REPORT_EXPORT_DOWNLOADED, "Finance report export downloaded.");
        return new ReportExportFileResponse(
                file.getFileName(),
                file.getContentType(),
                file.getSizeBytes(),
                file.getChecksumSha256(),
                file.getContent()
        );
    }

    @Transactional
    public ReportExportResponse processExport(String exportId) {
        ReportExportJob exportJob = reportExportJobRepository.findById(exportId)
                .orElseThrow(() -> new NotFoundException("Report export was not found."));
        if (exportJob.getBulkJob().isTerminal()) {
            return toResponse(exportJob);
        }
        try {
            bulkJobService.markProcessing(exportJob.getBulkJob().getId());
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
                    exportJob.getRequestedBy(),
                    exportJob,
                    AuditAction.REPORT_EXPORT_COMPLETED,
                    "Report export completed."
            );
            return toResponse(exportJob);
        } catch (RuntimeException exception) {
            bulkJobService.markFailed(exportJob.getBulkJob().getId(), exception.getMessage());
            throw exception;
        }
    }

    private School requireSchoolReportSchool(RequestContext context) {
        UUID schoolId = authorizationGuard.requireSchoolReportExportAccess(context);
        return schoolRepository.findById(schoolId.toString())
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private School requireFinanceReportViewSchool(RequestContext context) {
        UUID schoolId = authorizationGuard.requireFinanceReportViewAccess(context);
        return schoolRepository.findById(schoolId.toString())
                .filter(School::isActive)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private School requireFinanceReportExportSchool(RequestContext context) {
        UUID schoolId = authorizationGuard.requireFinanceReportExportAccess(context);
        return schoolRepository.findById(schoolId.toString())
                .filter(School::isActive)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private ReportExportJob requireAccessibleExport(RequestContext context, String exportId) {
        authorizationGuard.requireSchoolReportExportVisible(context, exportId);
        ReportExportJob exportJob = reportExportJobRepository.findById(exportId)
                .orElseThrow(() -> new NotFoundException("Report export was not found."));
        return exportJob;
    }

    private ReportExportJob requireAccessibleFinanceExport(RequestContext context, String exportId) {
        authorizationGuard.requireFinanceReportExportVisible(context, exportId);
        return reportExportJobRepository.findById(exportId)
                .orElseThrow(() -> new NotFoundException("Report export was not found."));
    }

    private void requireFinanceReportRequest(ReportExportRequest request) {
        if (request.reportType() != ReportType.FEE_DEMANDS) {
            throw new BadRequestException("Finance exports only support fee demand reports.");
        }
    }

    private com.cloudcampus.operations.bulk.BulkJob requireBulkJobReference(String bulkJobId) {
        return bulkJobRepository.findById(bulkJobId)
                .orElseThrow(() -> new NotFoundException("Bulk job was not found."));
    }

    private String parametersJson(Map<String, Object> parameters) {
        if (parameters == null || parameters.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(parameters);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Report export parameters must be JSON serializable.");
        }
    }

    private GeneratedReport generateReport(ReportExportJob exportJob) {
        if (exportJob.getFormat() != ReportExportFormat.CSV) {
            throw new BadRequestException("Only CSV report exports are supported in the current scaffold.");
        }
        return switch (exportJob.getReportType()) {
            case STUDENT_DIRECTORY -> studentDirectory(exportJob);
            case FEE_DEMANDS -> feeDemands(exportJob);
            default -> throw new BadRequestException("This report type is not available for school-scoped export processing.");
        };
    }

    private GeneratedReport studentDirectory(ReportExportJob exportJob) {
        List<Student> students = studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(exportJob.getSchool().getId());
        StringBuilder csv = new StringBuilder("admission_number,full_name,class,section,active\n");
        for (Student student : students) {
            csv.append(csvRow(
                    student.getAdmissionNumber(),
                    student.getFullName(),
                    student.getClassLevel() == null ? "" : student.getClassLevel().getName(),
                    student.getSection() == null ? "" : student.getSection().getName(),
                    Boolean.toString(student.isActive())
            ));
        }
        return generatedCsv(exportJob, students.size(), csv.toString());
    }

    private GeneratedReport feeDemands(ReportExportJob exportJob) {
        List<FeeDemand> demands = feeDemandRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(exportJob.getSchool().getId());
        StringBuilder csv = new StringBuilder("admission_number,student_name,description,amount_due,amount_paid,outstanding,due_date,status\n");
        for (FeeDemand demand : demands) {
            csv.append(csvRow(
                    demand.getStudent().getAdmissionNumber(),
                    demand.getStudent().getFullName(),
                    demand.getDescription(),
                    money(demand.getAmountDue()),
                    money(demand.getAmountPaid()),
                    money(demand.outstandingAmount()),
                    demand.getDueDate().toString(),
                    demand.getStatus().name()
            ));
        }
        return generatedCsv(exportJob, demands.size(), csv.toString());
    }

    private GeneratedReport generatedCsv(ReportExportJob exportJob, int rowCount, String content) {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        return new GeneratedReport(
                fileName(exportJob),
                CSV_CONTENT_TYPE,
                bytes.length,
                sha256(bytes),
                content,
                rowCount
        );
    }

    private String fileName(ReportExportJob exportJob) {
        return exportJob.getReportType().name().toLowerCase() + "-" + exportJob.getId() + ".csv";
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

    private String money(BigDecimal amount) {
        return amount.stripTrailingZeros().toPlainString();
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 digest is unavailable.", exception);
        }
    }

    private void recordAudit(UserAccount actor, ReportExportJob exportJob, AuditAction action, String summary) {
        auditLogService.record(
                exportJob.getTenant().getId(),
                exportJob.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                "ReportExportJob",
                exportJob.getId(),
                summary,
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", exportJob.getTenant().getId(),
                        "schoolId", exportJob.getSchool().getId(),
                        "reportExportId", exportJob.getId(),
                        "bulkJobId", exportJob.getBulkJob().getId(),
                        "reportType", exportJob.getReportType().name(),
                        "format", exportJob.getFormat().name()
                )
        );
    }

    private ReportExportResponse toResponse(ReportExportJob exportJob) {
        ReportExportFile file = reportExportFileRepository.findByReportExportJobId(exportJob.getId()).orElse(null);
        return new ReportExportResponse(
                exportJob.getId(),
                exportJob.getTenant().getId(),
                exportJob.getSchool().getId(),
                exportJob.getRequestedBy().getId(),
                exportJob.getBulkJob().getId(),
                exportJob.getReportType(),
                exportJob.getFormat(),
                exportJob.getBulkJob().getStatus(),
                file == null ? null : file.getFileName(),
                file == null ? null : file.getContentType(),
                file == null ? null : file.getSizeBytes(),
                file == null ? null : file.getChecksumSha256(),
                exportJob.getRequestedAt(),
                exportJob.getCompletedAt()
        );
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
}
