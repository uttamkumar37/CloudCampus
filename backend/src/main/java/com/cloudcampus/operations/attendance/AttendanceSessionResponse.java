package com.cloudcampus.operations.attendance;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.cloudcampus.identity.auth.UserRole;

public record AttendanceSessionResponse(
        String id,
        String tenantId,
        String schoolId,
        String classLevelId,
        String classLevelName,
        String sectionId,
        String sectionName,
        String subjectId,
        String subjectCode,
        String subjectName,
        String submittedByUserId,
        UserRole submittedByRole,
        LocalDate attendanceDate,
        long presentCount,
        long absentCount,
        long lateCount,
        long excusedCount,
        Instant createdAt,
        List<AttendanceRecordResponse> records
) {
}
