package com.cloudcampus.attendance.dto;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record AttendanceCreateRequest(
        @NotNull(message = "studentId is required")
        UUID studentId,

        @NotNull(message = "classId is required")
        UUID classId,

        @NotNull(message = "sectionId is required")
        UUID sectionId,

        @NotNull(message = "attendanceDate is required")
        @PastOrPresent(message = "attendanceDate must be in the past or present")
        LocalDate attendanceDate,

        @NotNull(message = "status is required")
        AttendanceStatus status,

        @Size(max = 255, message = "remarks must be at most 255 characters")
        String remarks,

        UUID markedByUserId
) {
}
