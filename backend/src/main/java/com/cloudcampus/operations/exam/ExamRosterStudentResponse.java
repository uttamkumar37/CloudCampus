package com.cloudcampus.operations.exam;

import java.math.BigDecimal;
import java.time.Instant;

public record ExamRosterStudentResponse(
        String studentId,
        String admissionNumber,
        String fullName,
        String classLevelId,
        String className,
        String sectionId,
        String sectionName,
        String rollNumber,
        String resultId,
        BigDecimal marksObtained,
        Instant recordedAt
) {
}
