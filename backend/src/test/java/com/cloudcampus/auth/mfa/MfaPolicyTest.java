package com.cloudcampus.auth.mfa;

import com.cloudcampus.auth.entity.UserRole;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MfaPolicyTest {
    private final MfaPolicy policy = new MfaPolicy();

    @Test
    void mfaIsRequiredForAdministrativeRolesOnly() {
        assertThat(policy.requiredForRole(UserRole.SUPER_ADMIN)).isTrue();
        assertThat(policy.requiredForRole(UserRole.TENANT_ADMIN)).isTrue();
        assertThat(policy.requiredForRole(UserRole.SCHOOL_ADMIN)).isTrue();
        assertThat(policy.requiredForRole(UserRole.TEACHER)).isFalse();
        assertThat(policy.requiredForRole(UserRole.PARENT)).isFalse();
        assertThat(policy.requiredForRole(UserRole.STUDENT)).isFalse();
    }
}
