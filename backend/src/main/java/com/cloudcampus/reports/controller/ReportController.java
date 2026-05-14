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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
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

    // ── CSV exports ───────────────────────────────────────────────────────────

    @GetMapping("/attendance/export")
    @Operation(summary = "Export attendance report as CSV (CC-1401)")
    public ResponseEntity<byte[]> exportAttendance(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {

        AttendanceReportResponse report = reportService.attendanceReport(schoolId, academicYearId);
        StringBuilder sb = new StringBuilder();
        sb.append("Student ID,Total Sessions,Present,Absent,Late,Excused,Attendance %\r\n");
        for (AttendanceReportResponse.Row r : report.rows()) {
            sb.append(csv(r.studentId()))
              .append(',').append(r.totalSessions())
              .append(',').append(r.presentCount())
              .append(',').append(r.absentCount())
              .append(',').append(r.lateCount())
              .append(',').append(r.excusedCount())
              .append(',').append(String.format("%.1f", r.attendancePercentage()))
              .append("\r\n");
        }
        return csvResponse(sb, "attendance-report.csv");
    }

    @GetMapping("/fees/export")
    @Operation(summary = "Export fee collection report as CSV (CC-1402)")
    public ResponseEntity<byte[]> exportFees(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId) {

        FeeReportResponse report = reportService.feeReport(schoolId, academicYearId);
        StringBuilder sb = new StringBuilder();
        sb.append("Total Records,Total Due (INR),Total Paid (INR),Pending,Partial,Paid,Waived,Collection Rate (%)\r\n");
        sb.append(report.totalRecords())
          .append(',').append(report.totalAmountDue())
          .append(',').append(report.totalAmountPaid())
          .append(',').append(report.pendingCount())
          .append(',').append(report.partialCount())
          .append(',').append(report.paidCount())
          .append(',').append(report.waivedCount())
          .append(',').append(String.format("%.1f", report.collectionRate()))
          .append("\r\n");
        return csvResponse(sb, "fee-report.csv");
    }

    @GetMapping("/performance/export")
    @Operation(summary = "Export student performance report as CSV (CC-1403)")
    public ResponseEntity<byte[]> exportPerformance(
            @PathVariable UUID schoolId,
            @RequestParam UUID examId) {

        PerformanceReportResponse report = reportService.performanceReport(schoolId, examId);
        StringBuilder sb = new StringBuilder();
        sb.append("Rank,Student ID,Marks Obtained,Marks Possible,Percentage,Grade,Passed\r\n");
        for (PerformanceReportResponse.Row r : report.rows()) {
            sb.append(r.rank() != null ? r.rank() : "")
              .append(',').append(csv(r.studentId()))
              .append(',').append(r.totalMarksObtained())
              .append(',').append(r.totalMarksPossible())
              .append(',').append(String.format("%.1f", r.percentage()))
              .append(',').append(csv(r.grade()))
              .append(',').append(r.passed() ? "Yes" : "No")
              .append("\r\n");
        }
        return csvResponse(sb, "performance-report.csv");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static ResponseEntity<byte[]> csvResponse(StringBuilder sb, String filename) {
        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(bytes);
    }

    /** Wraps a field in double-quotes and escapes embedded quotes. */
    private static String csv(Object value) {
        if (value == null) return "";
        String s = value.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
