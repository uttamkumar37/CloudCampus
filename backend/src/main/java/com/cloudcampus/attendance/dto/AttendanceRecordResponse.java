package com.cloudcampus.attendance.dto;

import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.entity.AttendanceStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for a single attendance record entry.
 */
public record AttendanceRecordResponse(

        UUID             id,
        UUID             studentId,
        AttendanceStatus status,
        String           remarks,
        Instant          updatedAt
) {
    public static AttendanceRecordResponse from(AttendanceRecord r) {
        return new AttendanceRecordResponse(
                r.getId(),
                r.getStudentId(),
                r.getStatus(),
                r.getRemarks(),
                r.getUpdatedAt()
        );
    }
}
