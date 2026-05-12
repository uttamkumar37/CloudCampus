package com.cloudcampus.finance.dto;

import com.cloudcampus.finance.entity.FeeFrequency;
import com.cloudcampus.finance.entity.FeeStructure;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FeeStructureResponse(
        UUID         id,
        UUID         schoolId,
        UUID         academicYearId,
        UUID         classId,
        UUID         feeCategoryId,
        String       categoryName,
        BigDecimal   amount,
        LocalDate    dueDate,
        FeeFrequency frequency,
        Instant      createdAt,
        Instant      updatedAt
) {
    public static FeeStructureResponse from(FeeStructure s, String categoryName) {
        return new FeeStructureResponse(
                s.getId(),
                s.getSchoolId(),
                s.getAcademicYearId(),
                s.getClassId(),
                s.getFeeCategoryId(),
                categoryName,
                s.getAmount(),
                s.getDueDate(),
                s.getFrequency(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
