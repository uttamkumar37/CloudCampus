package com.cloudcampus.security;

import com.cloudcampus.auth.entity.UserRole;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SensitiveDataPolicyTest {
    private final SensitiveDataPolicy policy = new SensitiveDataPolicy();

    @Test
    void payrollIsRestrictedToAdministrativeRoles() {
        assertThat(policy.canViewPayroll(UserRole.SUPER_ADMIN)).isTrue();
        assertThat(policy.canViewPayroll(UserRole.SCHOOL_ADMIN)).isTrue();
        assertThat(policy.canViewPayroll(UserRole.TEACHER)).isFalse();
        assertThat(policy.canViewPayroll(UserRole.PARENT)).isFalse();
        assertThat(policy.canViewPayroll(UserRole.STUDENT)).isFalse();
    }

    @Test
    void studentHealthAllowsOwnersAndLinkedParents() {
        assertThat(policy.canViewStudentHealth(UserRole.STUDENT, true, false)).isTrue();
        assertThat(policy.canViewStudentHealth(UserRole.PARENT, false, true)).isTrue();
        assertThat(policy.canViewStudentHealth(UserRole.TEACHER, false, false)).isFalse();
    }
}
