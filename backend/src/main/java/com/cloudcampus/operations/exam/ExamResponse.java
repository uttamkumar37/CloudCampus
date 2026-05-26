package com.cloudcampus.operations.exam;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ExamResponse(
        String id,
        String tenantId,
        String schoolId,
        String classLevelId,
        String className,
        String sectionId,
        String sectionName,
        String subjectId,
        String subjectCode,
        String subjectName,
        String title,
        LocalDate examDate,
        BigDecimal maxMarks,
        ExamStatus status,
        String createdByUserId,
        String publishedByUserId,
        Instant createdAt,
        Instant publishedAt,
        List<ExamResultResponse> results
) {
}
