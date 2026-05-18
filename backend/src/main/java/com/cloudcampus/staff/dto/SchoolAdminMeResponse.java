package com.cloudcampus.staff.dto;

import com.cloudcampus.school.entity.School;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.tenant.entity.Tenant;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Profile snapshot for the currently authenticated school admin.
 * Returned by GET /v1/school-admin/me.
 */
public record SchoolAdminMeResponse(

        // ── Personal ──────────────────────────────────────────────────────
        UUID      staffId,
        String    firstName,
        String    lastName,
        String    email,
        String    phone,
        String    employeeNumber,
        String    staffType,
        LocalDate joiningDate,

        // ── School ────────────────────────────────────────────────────────
        UUID      schoolId,
        String    schoolName,
        String    schoolAddress,
        String    schoolPhone,
        String    schoolEmail,

        // ── Tenant ────────────────────────────────────────────────────────
        String    tenantCode
) {
    public static SchoolAdminMeResponse from(Staff staff, School school, Tenant tenant) {
        return new SchoolAdminMeResponse(
                staff.getId(),
                staff.getFirstName(),
                staff.getLastName(),
                staff.getEmail(),
                staff.getPhone(),
                staff.getEmployeeNumber(),
                staff.getStaffType() != null ? staff.getStaffType().name() : null,
                staff.getJoiningDate(),
                school.getId(),
                school.getName(),
                school.getAddress(),
                school.getPhone(),
                school.getEmail(),
                tenant.getCode()
        );
    }
}
