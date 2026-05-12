package com.cloudcampus.exam.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Per-subject result breakdown — embedded inside {@link ExamResultResponse}
 * when fetching an individual student's report card.
 *
 * Only populated in single-student detail calls; {@code null} in list views
 * to keep list payloads lean.
 */
public record SubjectResultLine(

    UUID       examSubjectId,
    String     subjectName,
    BigDecimal totalMarks,
    BigDecimal marksObtained,
    boolean    isAbsent,
    boolean    passed
) {}
