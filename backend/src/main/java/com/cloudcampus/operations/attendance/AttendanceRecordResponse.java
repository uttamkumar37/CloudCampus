package com.cloudcampus.operations.attendance;

public record AttendanceRecordResponse(
        String id,
        String studentId,
        String admissionNumber,
        String studentName,
        AttendanceStatus status,
        String remark
) {
}
