package com.cloudcampus.attendance.dto;

import java.util.UUID;

/**
 * Attendance report for a single student over a date range.
 *
 * attendancePercentage = (present + late) / totalSessions × 100.
 * Late marks count towards presence (student was physically there).
 */
public record StudentAttendanceReport(

        UUID   studentId,
        long   totalSessions,
        long   presentCount,
        long   absentCount,
        long   lateCount,
        long   excusedCount,
        double attendancePercentage
) {
    /**
     * Build a report from raw counts.
     */
    public static StudentAttendanceReport of(UUID studentId,
                                              long present, long absent,
                                              long late, long excused) {
        long total = present + absent + late + excused;
        double pct = total == 0 ? 0.0
                : Math.round(((present + late) * 10_000.0 / total)) / 100.0;
        return new StudentAttendanceReport(studentId, total, present, absent, late, excused, pct);
    }
}
