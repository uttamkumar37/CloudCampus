package com.cloudcampus.reports.service;

import com.cloudcampus.reports.dto.AttendanceReportResponse;
import com.cloudcampus.reports.dto.FeeReportResponse;
import com.cloudcampus.reports.dto.PerformanceReportResponse;

import java.util.UUID;

public interface ReportService {

    AttendanceReportResponse attendanceReport(UUID schoolId, UUID academicYearId);

    FeeReportResponse feeReport(UUID schoolId, UUID academicYearId);

    PerformanceReportResponse performanceReport(UUID schoolId, UUID examId);
}
