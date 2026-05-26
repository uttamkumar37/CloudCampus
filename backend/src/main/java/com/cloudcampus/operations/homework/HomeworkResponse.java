package com.cloudcampus.operations.homework;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record HomeworkResponse(
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
        String instructions,
        LocalDate dueDate,
        HomeworkStatus status,
        String createdByUserId,
        String createdByRole,
        Instant createdAt,
        Instant publishedAt,
        List<HomeworkSubmissionResponse> submissions
) {
}
