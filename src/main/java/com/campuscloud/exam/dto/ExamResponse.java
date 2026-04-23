package com.campuscloud.exam.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ExamResponse(
        UUID id,
        String title,
        LocalDate examDate,
        UUID classId,
        UUID sectionId,
        UUID subjectId,
        BigDecimal maxMarks,
        boolean active,
        Instant createdAt
) {
}
