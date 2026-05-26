package com.cloudcampus.operations.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AttendanceRecordRequest(
        @NotBlank String studentId,
        @NotNull AttendanceStatus status,
        @Size(max = 180) String remark
) {
}
