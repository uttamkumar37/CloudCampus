package com.cloudcampus.attendance.dto;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * A single student's attendance mark within a bulk {@link MarkAttendanceRequest}.
 */
public record AttendanceRecordEntry(

        @NotNull
        UUID studentId,

        @NotNull
        AttendanceStatus status,

        @Size(max = 300)
        String remarks
) {}
