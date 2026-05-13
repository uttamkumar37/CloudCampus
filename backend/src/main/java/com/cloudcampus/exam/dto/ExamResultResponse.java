package com.cloudcampus.exam.dto;

import com.cloudcampus.exam.entity.ExamResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Result record for one student in one exam.
 *
 * {@code subjects} is {@code null} in list views (ranked table) and
 * populated only in the single-student detail / report-card endpoint to
 * keep list payloads lean.
 *
 * CC-1103 (result generation) + CC-1104 (report card data model).
 */
public record ExamResultResponse(

    UUID           id,
    UUID           examId,
    UUID           studentId,
    UUID           schoolId,
    BigDecimal     totalMarksObtained,
    BigDecimal     totalMarksPossible,
    BigDecimal     percentage,
    String         grade,
    Integer        rank,
    boolean        passed,
    Instant        generatedAt,

    /** Null in list views; populated in single-student detail view. */
    List<SubjectResultLine> subjects
) {

    /** Build from entity without subject detail (list view). */
    public static ExamResultResponse from(ExamResult r) {
        return new ExamResultResponse(
            r.getId(),
            r.getExamId(),
            r.getStudentId(),
            r.getSchoolId(),
            r.getTotalMarksObtained(),
            r.getTotalMarksPossible(),
            r.getPercentage(),
            r.getGrade(),
            r.getRank(),
            r.isPassed(),
            r.getGeneratedAt(),
            null
        );
    }

    /** Build from entity with subject detail (report-card view). */
    public static ExamResultResponse fromWithSubjects(ExamResult r, List<SubjectResultLine> subjects) {
        return new ExamResultResponse(
            r.getId(),
            r.getExamId(),
            r.getStudentId(),
            r.getSchoolId(),
            r.getTotalMarksObtained(),
            r.getTotalMarksPossible(),
            r.getPercentage(),
            r.getGrade(),
            r.getRank(),
            r.isPassed(),
            r.getGeneratedAt(),
            subjects
        );
    }
}
