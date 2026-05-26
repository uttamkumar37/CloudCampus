package com.cloudcampus.people.staff;

import com.cloudcampus.identity.auth.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StaffProvisioningRequest(
        @NotBlank @Size(max = 180) String fullName,
        @NotBlank @Email @Size(max = 320) String email,
        @NotNull UserRole role,
        @Size(max = 80) String employeeNumber,
        @Size(max = 120) String department,
        @Size(max = 120) String designation,
        @NotNull Boolean portalLoginRequired
) {
}
