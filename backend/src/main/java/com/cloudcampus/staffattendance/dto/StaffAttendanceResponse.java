package com.cloudcampus.staffattendance.dto;

import com.cloudcampus.staffattendance.entity.StaffAttendance;
import com.cloudcampus.staffattendance.entity.StaffAttendanceStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record StaffAttendanceResponse(
        UUID                  id,
        UUID                  staffId,
        LocalDate             attendanceDate,
        StaffAttendanceStatus status,
        String                notes,
        UUID                  markedBy,
        Instant               updatedAt
) {
    public static StaffAttendanceResponse from(StaffAttendance sa) {
        return new StaffAttendanceResponse(
                sa.getId(), sa.getStaffId(), sa.getAttendanceDate(),
                sa.getStatus(), sa.getNotes(), sa.getMarkedBy(), sa.getUpdatedAt());
    }
}
