package com.cloudcampus.leave.dto;

import com.cloudcampus.leave.entity.LeaveRequest;
import com.cloudcampus.leave.entity.LeaveStatus;
import com.cloudcampus.leave.entity.LeaveType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveRequestResponse(
        UUID        id,
        UUID        staffId,
        LeaveType   leaveType,
        LocalDate   startDate,
        LocalDate   endDate,
        int         totalDays,
        String      reason,
        LeaveStatus status,
        UUID        reviewedBy,
        String      reviewNotes,
        Instant     reviewedAt,
        Instant     createdAt
) {
    public static LeaveRequestResponse from(LeaveRequest lr) {
        return new LeaveRequestResponse(
                lr.getId(), lr.getStaffId(), lr.getLeaveType(),
                lr.getStartDate(), lr.getEndDate(), lr.getTotalDays(),
                lr.getReason(), lr.getStatus(),
                lr.getReviewedBy(), lr.getReviewNotes(), lr.getReviewedAt(),
                lr.getCreatedAt());
    }
}
