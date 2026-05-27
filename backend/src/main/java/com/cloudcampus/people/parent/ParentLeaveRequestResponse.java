package com.cloudcampus.people.parent;

import java.time.Instant;
import java.time.LocalDate;

public record ParentLeaveRequestResponse(
        String id,
        String tenantId,
        String schoolId,
        String studentId,
        String studentName,
        String parentUserId,
        String parentEmail,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        ParentLeaveRequestStatus status,
        String adminNote,
        String decidedByUserId,
        Instant createdAt,
        Instant decidedAt
) {

    static ParentLeaveRequestResponse from(ParentLeaveRequest request) {
        return new ParentLeaveRequestResponse(
                request.getId(),
                request.getTenant().getId(),
                request.getSchool().getId(),
                request.getStudent().getId(),
                request.getStudent().getFullName(),
                request.getParentUser().getId(),
                request.getParentUser().getEmail(),
                request.getStartDate(),
                request.getEndDate(),
                request.getReason(),
                request.getStatus(),
                request.getAdminNote(),
                request.getDecidedByUser() == null ? null : request.getDecidedByUser().getId(),
                request.getCreatedAt(),
                request.getDecidedAt()
        );
    }
}
