package com.cloudcampus.school.dto;

import com.cloudcampus.school.entity.AcademicCalendarType;
import com.cloudcampus.school.entity.GradingScheme;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SchoolSettingsRequest(

        @NotBlank(message = "timezone is required")
        @Size(max = 60)
        String timezone,

        @NotBlank(message = "locale is required")
        @Size(max = 20)
        String locale,

        @NotNull(message = "academicCalendarType is required")
        AcademicCalendarType academicCalendarType,

        /** Bitmask 1–127: bit0=Sunday … bit6=Saturday. Mon–Fri = 62. */
        @Min(1) @Max(127)
        short workingDaysMask,

        @NotNull(message = "gradingScheme is required")
        GradingScheme gradingScheme,

        @Min(1) @Max(100)
        short minAttendancePct,

        @Min(1) @Max(500)
        short maxClassCapacity,

        boolean allowLateAttendance,

        @Min(0) @Max(120)
        short lateCutoffMinutes,

        @Size(max = 500)
        String schoolLogoUrl,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$",
                 message = "primaryColor must be a valid hex colour, e.g. #1A73E8")
        String primaryColor
) {}
