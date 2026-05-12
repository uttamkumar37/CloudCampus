package com.cloudcampus.finance.dto;

import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.StudentFeeRecord;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record StudentFeeRecordResponse(
        UUID       id,
        UUID       schoolId,
        UUID       studentId,
        UUID       feeStructureId,
        String     categoryName,
        UUID       academicYearId,
        BigDecimal amountDue,
        BigDecimal amountPaid,
        BigDecimal discount,
        BigDecimal balance,
        LocalDate  dueDate,
        FeeStatus  status,
        String     notes,
        Instant    createdAt,
        Instant    updatedAt
) {
    public static StudentFeeRecordResponse from(StudentFeeRecord r, String categoryName) {
        BigDecimal balance = r.getAmountDue()
                .subtract(r.getDiscount())
                .subtract(r.getAmountPaid());
        return new StudentFeeRecordResponse(
                r.getId(),
                r.getSchoolId(),
                r.getStudentId(),
                r.getFeeStructureId(),
                categoryName,
                r.getAcademicYearId(),
                r.getAmountDue(),
                r.getAmountPaid(),
                r.getDiscount(),
                balance,
                r.getDueDate(),
                r.getStatus(),
                r.getNotes(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
