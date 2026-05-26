package com.cloudcampus.academic;

import java.time.LocalDate;

public record AcademicYearResponse(
        String id,
        String tenantId,
        String schoolId,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        AcademicYearStatus status
) {
}
