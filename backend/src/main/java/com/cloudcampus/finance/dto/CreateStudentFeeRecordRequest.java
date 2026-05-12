package com.cloudcampus.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateStudentFeeRecordRequest(

        @NotNull(message = "Student is required")
        UUID studentId,

        @NotNull(message = "Fee structure is required")
        UUID feeStructureId,

        @NotNull(message = "Academic year is required")
        UUID academicYearId,

        @NotNull(message = "Amount due is required")
        @DecimalMin(value = "0.00", message = "Amount must be zero or greater")
        BigDecimal amountDue,

        @DecimalMin(value = "0.00", message = "Discount must be zero or greater")
        BigDecimal discount,

        LocalDate dueDate,

        String notes
) {}
