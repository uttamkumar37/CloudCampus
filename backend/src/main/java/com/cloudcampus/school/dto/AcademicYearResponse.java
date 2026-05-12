package com.cloudcampus.school.dto;

import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.AcademicYearStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AcademicYearResponse(
        UUID id,
        UUID schoolId,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        boolean isCurrent,
        AcademicYearStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static AcademicYearResponse from(AcademicYear y) {
        return new AcademicYearResponse(
                y.getId(), y.getSchoolId(), y.getName(),
                y.getStartDate(), y.getEndDate(), y.isCurrent(),
                y.getStatus(), y.getCreatedAt(), y.getUpdatedAt()
        );
    }
}
