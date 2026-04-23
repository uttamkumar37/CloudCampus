package com.campuscloud.attendance.dto;

import com.campuscloud.attendance.entity.AttendanceStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AttendanceResponse(
        UUID id,
        UUID studentId,
        UUID classId,
        UUID sectionId,
        LocalDate attendanceDate,
        AttendanceStatus status,
        String remarks,
        UUID markedByUserId,
        Instant createdAt
) {
}
