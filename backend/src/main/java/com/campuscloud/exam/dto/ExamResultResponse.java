package com.campuscloud.exam.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ExamResultResponse(
        UUID id,
        UUID examId,
        UUID studentId,
        BigDecimal marksObtained,
        String grade,
        String remarks,
        boolean published,
        Instant createdAt
) {
}
