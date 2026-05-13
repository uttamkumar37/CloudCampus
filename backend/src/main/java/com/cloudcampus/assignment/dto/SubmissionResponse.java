package com.cloudcampus.assignment.dto;

import com.cloudcampus.assignment.entity.AssignmentSubmission;
import com.cloudcampus.assignment.entity.SubmissionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SubmissionResponse(
        UUID id,
        UUID assignmentId,
        UUID studentId,
        SubmissionStatus status,
        String textResponse,
        Instant submittedAt,
        BigDecimal marksObtained,
        String feedback,
        UUID gradedBy,
        Instant gradedAt
) {
    public static SubmissionResponse from(AssignmentSubmission s) {
        return new SubmissionResponse(
                s.getId(), s.getAssignmentId(), s.getStudentId(),
                s.getStatus(), s.getTextResponse(), s.getSubmittedAt(),
                s.getMarksObtained(), s.getFeedback(),
                s.getGradedBy(), s.getGradedAt()
        );
    }
}
