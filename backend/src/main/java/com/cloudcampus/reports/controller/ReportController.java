package com.cloudcampus.reports.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.ratelimit.RateLimit;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.reports.dto.AttendanceReportResponse;
import com.cloudcampus.reports.dto.FeeReportResponse;
import com.cloudcampus.reports.dto.PerformanceReportResponse;
import com.cloudcampus.reports.dto.ReportExportJobResponse;
import com.cloudcampus.reports.service.ReportCsvExportService;
import com.cloudcampus.reports.service.ReportCsvExportService.CsvExport;
import com.cloudcampus.reports.service.ReportExportJobService;
import com.cloudcampus.reports.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * School Admin Reports API (CC-1401, CC-1402, CC-1403).
 *
 * GET /v1/school-admin/schools/{schoolId}/reports/attendance?academicYearId=
 * GET /v1/school-admin/schools/{schoolId}/reports/attendance/export?academicYearId=  → text/csv
 * GET /v1/school-admin/schools/{schoolId}/reports/fees?academicYearId=
 * GET /v1/school-admin/schools/{schoolId}/reports/fees/export?academicYearId=        → text/csv
 * GET /v1/school-admin/schools/{schoolId}/reports/performance?examId=
 * GET /v1/school-admin/schools/{schoolId}/reports/performance/export?examId=         → text/csv
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/reports")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "Reports", description = "Attendance, fee and performance reports")
public class ReportController {

    private final ReportService reportService;
    private final ReportCsvExportService csvExportService;
    private final ReportExportJobService exportJobService;

    ReportController(ReportService reportService,
                     ReportCsvExportService csvExportService,
                     ReportExportJobService exportJobService) {
        this.reportService = reportService;
        this.csvExportService = csvExportService;
        this.exportJobService = exportJobService;
    }

    @GetMapping("/attendance")
    @RateLimit
    @Operation(summary = "Attendance report for a school + academic year (CC-1401)")
    public ResponseEntity<ApiResponse<AttendanceReportResponse>> attendanceReport(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                reportService.attendanceReport(schoolId, academicYearId)));
    }

    @GetMapping("/fees")
    @RateLimit
    @Operation(summary = "Fee collection report for a school + academic year (CC-1402)")
    public ResponseEntity<ApiResponse<FeeReportResponse>> feeReport(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                reportService.feeReport(schoolId, academicYearId)));
    }

    @GetMapping("/performance")
    @RateLimit
    @Operation(summary = "Student performance report for an exam (CC-1403)")
    public ResponseEntity<ApiResponse<PerformanceReportResponse>> performanceReport(
            @PathVariable UUID schoolId,
            @RequestParam UUID examId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                reportService.performanceReport(schoolId, examId)));
    }

    // ── CSV exports ───────────────────────────────────────────────────────────

    @PostMapping("/attendance/export-jobs")
    @RateLimit
    @Operation(summary = "Start async attendance CSV export job")
    public ResponseEntity<ApiResponse<ReportExportJobResponse>> createAttendanceExportJob(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                        exportJobService.createAttendance(schoolId, academicYearId)));
    }

    @PostMapping("/fees/export-jobs")
    @RateLimit
    @Operation(summary = "Start async fee collection CSV export job")
    public ResponseEntity<ApiResponse<ReportExportJobResponse>> createFeesExportJob(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                        exportJobService.createFees(schoolId, academicYearId)));
    }

    @PostMapping("/performance/export-jobs")
    @RateLimit
    @Operation(summary = "Start async performance CSV export job")
    public ResponseEntity<ApiResponse<ReportExportJobResponse>> createPerformanceExportJob(
            @PathVariable UUID schoolId,
            @RequestParam UUID examId) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                        exportJobService.createPerformance(schoolId, examId)));
    }

    @GetMapping("/jobs/{jobId}")
    @Operation(summary = "Get async report export job status")
    public ResponseEntity<ApiResponse<ReportExportJobResponse>> getExportJob(
            @PathVariable UUID schoolId,
            @PathVariable UUID jobId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                exportJobService.get(schoolId, jobId)));
    }

    @GetMapping("/jobs/{jobId}/download")
    @Operation(summary = "Download completed async report export")
    public ResponseEntity<byte[]> downloadExportJob(
            @PathVariable UUID schoolId,
            @PathVariable UUID jobId) {
        return csvResponse(exportJobService.download(schoolId, jobId));
    }

    @GetMapping("/attendance/export")
    @RateLimit
    @Operation(summary = "Export attendance report as CSV (CC-1401)")
    public ResponseEntity<byte[]> exportAttendance(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return csvResponse(csvExportService.attendance(schoolId, academicYearId));
    }

    @GetMapping("/fees/export")
    @RateLimit
    @Operation(summary = "Export fee collection report as CSV (CC-1402)")
    public ResponseEntity<byte[]> exportFees(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return csvResponse(csvExportService.fees(schoolId, academicYearId));
    }

    @GetMapping("/performance/export")
    @RateLimit
    @Operation(summary = "Export student performance report as CSV (CC-1403)")
    public ResponseEntity<byte[]> exportPerformance(
            @PathVariable UUID schoolId,
            @RequestParam UUID examId) {
        return csvResponse(csvExportService.performance(schoolId, examId));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static ResponseEntity<byte[]> csvResponse(CsvExport csv) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(csv.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + csv.filename() + "\"")
                .body(csv.bytes());
    }
}
