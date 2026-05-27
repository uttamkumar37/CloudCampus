package com.cloudcampus.operations.attendance;

import java.time.Instant;
import java.time.LocalDate;

public record StudentAttendanceResponse(
        String id,
        String tenantId,
        String schoolId,
        String sessionId,
        String studentId,
        String studentName,
        String admissionNumber,
        String classLevelId,
        String className,
        String sectionId,
        String sectionName,
        String subjectId,
        String subjectCode,
        String subjectName,
        LocalDate attendanceDate,
        AttendanceStatus status,
        String remark,
        Instant recordedAt
) {
}
