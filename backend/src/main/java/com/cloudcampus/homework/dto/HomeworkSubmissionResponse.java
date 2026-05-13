package com.cloudcampus.homework.dto;

import com.cloudcampus.homework.entity.HomeworkSubmission;
import com.cloudcampus.homework.entity.SubmissionStatus;

import java.time.Instant;
import java.util.UUID;

public record HomeworkSubmissionResponse(
        UUID             id,
        UUID             homeworkId,
        UUID             studentId,
        String           notes,
        SubmissionStatus status,
        Instant          submittedAt,
        Instant          reviewedAt
) {
    public static HomeworkSubmissionResponse from(HomeworkSubmission s) {
        return new HomeworkSubmissionResponse(
                s.getId(), s.getHomeworkId(), s.getStudentId(),
                s.getNotes(), s.getStatus(), s.getSubmittedAt(), s.getReviewedAt()
        );
    }
}
