package com.cloudcampus.reports.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SchoolComparisonRow(
        UUID       schoolId,
        String     schoolName,
        String     schoolCode,
        UUID       academicYearId,
        String     academicYearName,
        long       activeStudents,
        long       totalSessions,
        double     attendanceRate,
        BigDecimal totalDue,
        BigDecimal totalPaid,
        double     feeCollectionRate
) {}
