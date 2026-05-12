package com.cloudcampus.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request to bulk-mark attendance for a session.
 *
 * Each entry is an upsert: if a record already exists for the student it is
 * updated; otherwise a new record is created.
 *
 * Set {@code finalize = true} to lock the session after marking — no further
 * changes will be accepted once finalized.
 */
public record MarkAttendanceRequest(

        @NotNull
        @Size(min = 1, message = "At least one attendance record entry is required")
        List<@Valid @NotNull AttendanceRecordEntry> records,

        /** If true, the session is locked after marks are saved. */
        boolean lockSession
) {}
