package com.cloudcampus.reports.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.reports.dto.AttendanceReportResponse;
import com.cloudcampus.reports.dto.FeeReportResponse;
import com.cloudcampus.reports.dto.PerformanceReportResponse;
import com.cloudcampus.reports.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * School Admin Reports API (CC-1401, CC-1402, CC-1403).
 *
 * GET /v1/school-admin/schools/{schoolId}/reports/attendance?academicYearId=
 * GET /v1/school-admin/schools/{schoolId}/reports/fees?academicYearId=
 * GET /v1/school-admin/schools/{schoolId}/reports/performance?examId=
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/reports")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "Reports", description = "Attendance, fee and performance reports")
public class ReportController {

    private final ReportService reportService;

    ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/attendance")
    @Operation(summary = "Attendance report for a school + academic year (CC-1401)")
    public ResponseEntity<ApiResponse<AttendanceReportResponse>> attendanceReport(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                reportService.attendanceReport(schoolId, academicYearId)));
    }

    @GetMapping("/fees")
    @Operation(summary = "Fee collection report for a school + academic year (CC-1402)")
    public ResponseEntity<ApiResponse<FeeReportResponse>> feeReport(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                reportService.feeReport(schoolId, academicYearId)));
    }

    @GetMapping("/performance")
    @Operation(summary = "Student performance report for an exam (CC-1403)")
    public ResponseEntity<ApiResponse<PerformanceReportResponse>> performanceReport(
            @PathVariable UUID schoolId,
            @RequestParam UUID examId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                reportService.performanceReport(schoolId, examId)));
    }
}
