package com.cloudcampus.exam.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request payload for recording one student's marks for a paper (CC-1102).
 */
public record MarksEntryRequest(

        @NotNull(message = "studentId is required")
        UUID studentId,

        /**
         * Marks scored. May be null only if isAbsent = true (absence is recorded
         * before marks are known). Set to 0 automatically when absent.
         */
        @DecimalMin(value = "0", message = "Marks must be ≥ 0")
        BigDecimal marksObtained,

        boolean isAbsent,

        String remarks
) {}
