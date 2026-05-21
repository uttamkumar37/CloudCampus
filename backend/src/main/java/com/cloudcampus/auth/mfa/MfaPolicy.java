package com.cloudcampus.auth.mfa;

import com.cloudcampus.auth.entity.UserRole;
import org.springframework.stereotype.Component;

@Component
public class MfaPolicy {
    public boolean requiredForRole(UserRole role) {
        return role == UserRole.SUPER_ADMIN || role == UserRole.TENANT_ADMIN || role == UserRole.SCHOOL_ADMIN;
    }

    public int verificationCodeTtlSeconds() {
        return 300;
    }

    public int maxAttempts() {
        return 5;
    }
}
