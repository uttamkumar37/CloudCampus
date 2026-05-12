package com.cloudcampus.school.dto;

import com.cloudcampus.school.entity.AcademicCalendarType;
import com.cloudcampus.school.entity.GradingScheme;
import com.cloudcampus.school.entity.SchoolSettings;

import java.time.Instant;
import java.util.UUID;

public record SchoolSettingsResponse(
        UUID schoolId,
        String timezone,
        String locale,
        AcademicCalendarType academicCalendarType,
        short workingDaysMask,
        GradingScheme gradingScheme,
        short minAttendancePct,
        short maxClassCapacity,
        boolean allowLateAttendance,
        short lateCutoffMinutes,
        String schoolLogoUrl,
        String primaryColor,
        Instant updatedAt
) {
    public static SchoolSettingsResponse from(SchoolSettings s) {
        return new SchoolSettingsResponse(
                s.getSchoolId(),
                s.getTimezone(),
                s.getLocale(),
                s.getAcademicCalendarType(),
                s.getWorkingDaysMask(),
                s.getGradingScheme(),
                s.getMinAttendancePct(),
                s.getMaxClassCapacity(),
                s.isAllowLateAttendance(),
                s.getLateCutoffMinutes(),
                s.getSchoolLogoUrl(),
                s.getPrimaryColor(),
                s.getUpdatedAt()
        );
    }
}
