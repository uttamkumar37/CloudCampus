package com.cloudcampus.finance.dto;

import com.cloudcampus.finance.entity.FeeFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateFeeStructureRequest(

        @NotNull(message = "Academic year is required")
        UUID academicYearId,

        /** Null = school-wide (applies to all classes). */
        UUID classId,

        @NotNull(message = "Fee category is required")
        UUID feeCategoryId,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.00", message = "Amount must be zero or greater")
        BigDecimal amount,

        LocalDate dueDate,

        FeeFrequency frequency
) {}
