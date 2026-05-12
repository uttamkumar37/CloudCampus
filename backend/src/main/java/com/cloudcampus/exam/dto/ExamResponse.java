package com.cloudcampus.exam.dto;

import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamStatus;
import com.cloudcampus.exam.entity.ExamType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ExamResponse(
        UUID id,
        UUID tenantId,
        UUID schoolId,
        UUID academicYearId,
        String name,
        ExamType examType,
        ExamStatus status,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalMarks,
        BigDecimal passingMarks,
        String instructions,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt,
        List<ExamSubjectResponse> subjects
) {
    /** Summary response — no subjects list. */
    public static ExamResponse from(Exam e) {
        return new ExamResponse(
                e.getId(),
                e.getTenantId(),
                e.getSchoolId(),
                e.getAcademicYearId(),
                e.getName(),
                e.getExamType(),
                e.getStatus(),
                e.getStartDate(),
                e.getEndDate(),
                e.getTotalMarks(),
                e.getPassingMarks(),
                e.getInstructions(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                List.of()
        );
    }

    /** Detail response — includes subject schedule. */
    public static ExamResponse from(Exam e, List<ExamSubjectResponse> subjects) {
        return new ExamResponse(
                e.getId(),
                e.getTenantId(),
                e.getSchoolId(),
                e.getAcademicYearId(),
                e.getName(),
                e.getExamType(),
                e.getStatus(),
                e.getStartDate(),
                e.getEndDate(),
                e.getTotalMarks(),
                e.getPassingMarks(),
                e.getInstructions(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                subjects
        );
    }
}
