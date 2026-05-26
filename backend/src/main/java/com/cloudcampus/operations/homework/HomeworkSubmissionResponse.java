package com.cloudcampus.operations.homework;

import java.time.Instant;

public record HomeworkSubmissionResponse(
        String id,
        String studentId,
        String studentName,
        String submittedByUserId,
        String content,
        Instant submittedAt
) {
}
