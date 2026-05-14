package com.cloudcampus.reports.dto;

import java.util.List;
import java.util.UUID;

public record AttendanceReportResponse(
        UUID   schoolId,
        UUID   academicYearId,
        long   totalSessions,
        List<Row> rows
) {
    public record Row(
            UUID   studentId,
            String studentNumber,
            String firstName,
            String lastName,
            long   totalSessions,
            long   presentCount,
            long   absentCount,
            long   lateCount,
            long   excusedCount,
            double attendancePercentage
    ) {}
}
