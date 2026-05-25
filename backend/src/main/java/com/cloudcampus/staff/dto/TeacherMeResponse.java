package com.cloudcampus.staff.dto;

import com.cloudcampus.school.entity.School;
import com.cloudcampus.staff.entity.Staff;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Lightweight identity snapshot for the authenticated teacher portal shell.
 */
public record TeacherMeResponse(
        UUID      staffId,
        String    firstName,
        String    lastName,
        String    email,
        String    phone,
        String    employeeNumber,
        String    staffType,
        String    status,
        UUID      departmentId,
        LocalDate joiningDate,
        UUID      schoolId,
        String    schoolName,
        String    photoUrl
) {
    public static TeacherMeResponse from(Staff staff, School school) {
        return new TeacherMeResponse(
                staff.getId(),
                staff.getFirstName(),
                staff.getLastName(),
                staff.getEmail(),
                staff.getPhone(),
                staff.getEmployeeNumber(),
                staff.getStaffType() != null ? staff.getStaffType().name() : null,
                staff.getStatus() != null ? staff.getStatus().name() : null,
                staff.getDepartmentId(),
                staff.getJoiningDate(),
                school.getId(),
                school.getName(),
                staff.getPhotoUrl()
        );
    }
}
