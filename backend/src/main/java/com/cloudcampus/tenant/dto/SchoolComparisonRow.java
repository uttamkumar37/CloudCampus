package com.cloudcampus.tenant.dto;

import java.math.BigDecimal;

public record SchoolComparisonRow(
        String schoolId,
        String schoolName,
        String schoolCode,
        String academicYearId,
        String academicYearName,
        long activeStudents,
        long totalSessions,
        double attendanceRate,
        BigDecimal totalDue,
        BigDecimal totalPaid,
        double feeCollectionRate
) {}
