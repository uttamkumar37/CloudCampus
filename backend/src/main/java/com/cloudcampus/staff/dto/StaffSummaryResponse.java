package com.cloudcampus.staff.dto;

import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.entity.StaffType;

import java.util.UUID;

/**
 * Lightweight staff summary — used for listing endpoints (roster, timetable builder).
 */
public record StaffSummaryResponse(

        UUID        id,
        String      employeeNumber,
        String      firstName,
        String      lastName,
        StaffType   staffType,
        StaffStatus status,
        UUID        departmentId,
        String      photoUrl,
        String      email,
        String      phone
) {
    public static StaffSummaryResponse from(Staff s) {
        return new StaffSummaryResponse(
                s.getId(),
                s.getEmployeeNumber(),
                s.getFirstName(),
                s.getLastName(),
                s.getStaffType(),
                s.getStatus(),
                s.getDepartmentId(),
                s.getPhotoUrl(),
                s.getEmail(),
                s.getPhone()
        );
    }
}
