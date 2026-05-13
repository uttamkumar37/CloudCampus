package com.cloudcampus.exam.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Bulk marks save request — one record per student in the paper (CC-1102).
 *
 * Sending all student marks at once allows the service to upsert atomically
 * within a single transaction.
 */
public record BulkMarksEntryRequest(

        @NotEmpty(message = "At least one marks entry is required")
        @Valid
        List<MarksEntryRequest> entries
) {}
