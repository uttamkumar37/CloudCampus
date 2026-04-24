package com.campuscloud.homework.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HomeworkResponse(
        UUID id,
        String title,
        String instructions,
        UUID classId,
        UUID sectionId,
        UUID assignedByUserId,
        LocalDate dueDate,
        Instant createdAt
) {
}
