package com.cloudcampus.operations.attendance;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record AttendanceSessionRequest(
        @NotBlank String classLevelId,
        String sectionId,
        @NotBlank String subjectId,
        @NotNull LocalDate attendanceDate,
        @NotEmpty List<@Valid AttendanceRecordRequest> records
) {
}
