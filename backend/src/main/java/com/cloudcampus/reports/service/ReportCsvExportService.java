package com.cloudcampus.reports.service;

import com.cloudcampus.reports.dto.AttendanceReportResponse;
import com.cloudcampus.reports.dto.FeeReportResponse;
import com.cloudcampus.reports.dto.PerformanceReportResponse;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class ReportCsvExportService {

    public static final String CSV_CONTENT_TYPE = "text/csv; charset=UTF-8";

    private final ReportService reportService;

    public ReportCsvExportService(ReportService reportService) {
        this.reportService = reportService;
    }

    public CsvExport attendance(UUID schoolId, UUID academicYearId) {
        AttendanceReportResponse report = reportService.attendanceReport(schoolId, academicYearId);
        StringBuilder sb = new StringBuilder();
        sb.append("Student Number,First Name,Last Name,Total Sessions,Present,Absent,Late,Excused,Attendance %\r\n");
        for (AttendanceReportResponse.Row r : report.rows()) {
            sb.append(csv(r.studentNumber()))
              .append(',').append(csv(r.firstName()))
              .append(',').append(csv(r.lastName()))
              .append(',').append(r.totalSessions())
              .append(',').append(r.presentCount())
              .append(',').append(r.absentCount())
              .append(',').append(r.lateCount())
              .append(',').append(r.excusedCount())
              .append(',').append(String.format("%.1f", r.attendancePercentage()))
              .append("\r\n");
        }
        return new CsvExport("attendance-report.csv", CSV_CONTENT_TYPE, bytes(sb));
    }

    public CsvExport fees(UUID schoolId, UUID academicYearId) {
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
        return new CsvExport("fee-report.csv", CSV_CONTENT_TYPE, bytes(sb));
    }

    public CsvExport performance(UUID schoolId, UUID examId) {
        PerformanceReportResponse report = reportService.performanceReport(schoolId, examId);
        StringBuilder sb = new StringBuilder();
        sb.append("Rank,Student Number,First Name,Last Name,Marks Obtained,Marks Possible,Percentage,Grade,Passed\r\n");
        for (PerformanceReportResponse.Row r : report.rows()) {
            sb.append(r.rank() != null ? r.rank() : "")
              .append(',').append(csv(r.studentNumber()))
              .append(',').append(csv(r.firstName()))
              .append(',').append(csv(r.lastName()))
              .append(',').append(r.totalMarksObtained())
              .append(',').append(r.totalMarksPossible())
              .append(',').append(String.format("%.1f", r.percentage()))
              .append(',').append(csv(r.grade()))
              .append(',').append(r.passed() ? "Yes" : "No")
              .append("\r\n");
        }
        return new CsvExport("performance-report.csv", CSV_CONTENT_TYPE, bytes(sb));
    }

    private static byte[] bytes(StringBuilder sb) {
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String csv(Object value) {
        if (value == null) return "";
        String s = value.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    public record CsvExport(String filename, String contentType, byte[] bytes) {
    }
}
