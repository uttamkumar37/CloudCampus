package com.cloudcampus.staff.dto;

import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.entity.StaffType;
import com.cloudcampus.student.entity.Gender;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Full staff profile response — used for GET /staff/{id} and POST (create).
 */
public record StaffResponse(

        UUID        id,
        UUID        schoolId,
        UUID        departmentId,
        String      employeeNumber,
        StaffType   staffType,
        StaffStatus status,
        String      firstName,
        String      lastName,
        LocalDate   dateOfBirth,
        Gender      gender,
        String      phone,
        String      email,
        String      address,
        String      photoUrl,
        String      qualification,
        String      specialization,
        LocalDate   joiningDate,
        Instant     createdAt,
        Instant     updatedAt
) {
    public static StaffResponse from(Staff s) {
        return new StaffResponse(
                s.getId(),
                s.getSchoolId(),
                s.getDepartmentId(),
                s.getEmployeeNumber(),
                s.getStaffType(),
                s.getStatus(),
                s.getFirstName(),
                s.getLastName(),
                s.getDateOfBirth(),
                s.getGender(),
                s.getPhone(),
                s.getEmail(),
                s.getAddress(),
                s.getPhotoUrl(),
                s.getQualification(),
                s.getSpecialization(),
                s.getJoiningDate(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
