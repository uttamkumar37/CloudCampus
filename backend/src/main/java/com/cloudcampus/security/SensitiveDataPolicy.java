package com.cloudcampus.security;

import com.cloudcampus.auth.entity.UserRole;
import org.springframework.stereotype.Component;

@Component
public class SensitiveDataPolicy {
    public boolean canViewPayroll(UserRole role) {
        return role == UserRole.SUPER_ADMIN || role == UserRole.TENANT_ADMIN || role == UserRole.SCHOOL_ADMIN;
    }

    public boolean canViewStudentHealth(UserRole role, boolean ownsStudentRecord, boolean linkedParent) {
        return role == UserRole.SUPER_ADMIN
                || role == UserRole.TENANT_ADMIN
                || role == UserRole.SCHOOL_ADMIN
                || ownsStudentRecord
                || linkedParent;
    }

    public boolean canViewDocuments(UserRole role, boolean ownsRecord, boolean linkedParent) {
        return role == UserRole.SUPER_ADMIN
                || role == UserRole.TENANT_ADMIN
                || role == UserRole.SCHOOL_ADMIN
                || ownsRecord
                || linkedParent;
    }

    public boolean canViewParentIncome(UserRole role) {
        return role == UserRole.SUPER_ADMIN || role == UserRole.TENANT_ADMIN || role == UserRole.SCHOOL_ADMIN;
    }
}
