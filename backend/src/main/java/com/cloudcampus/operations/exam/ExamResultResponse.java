package com.cloudcampus.operations.exam;

import java.math.BigDecimal;
import java.time.Instant;

public record ExamResultResponse(
        String id,
        String studentId,
        String studentName,
        String recordedByUserId,
        BigDecimal marksObtained,
        Instant recordedAt
) {
}
