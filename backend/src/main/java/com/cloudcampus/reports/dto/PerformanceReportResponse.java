package com.cloudcampus.reports.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PerformanceReportResponse(
        UUID       schoolId,
        UUID       examId,
        long       totalStudents,
        long       passedCount,
        long       failedCount,
        BigDecimal classAverage,
        List<Row>  rows
) {
    public record Row(
            UUID       studentId,
            BigDecimal totalMarksObtained,
            BigDecimal totalMarksPossible,
            BigDecimal percentage,
            String     grade,
            Integer    rank,
            boolean    passed
    ) {}
}
