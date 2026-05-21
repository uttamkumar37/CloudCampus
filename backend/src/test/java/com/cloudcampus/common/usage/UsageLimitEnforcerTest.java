package com.cloudcampus.common.usage;

import com.cloudcampus.common.exception.UsageLimitExceededException;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.entity.TenantConfig;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * T-09: Unit test for subscription / tenant limit enforcement.
 *
 * Covers all three limit checks that gate create-student / create-staff /
 * create-school paths:
 *
 *   • allows the operation when current < limit
 *   • throws UsageLimitExceededException when current == limit
 *   • throws UsageLimitExceededException when current > limit (defensive)
 *   • uses the tenant_configs override when present
 *   • falls back to TenantConfigKey.defaultValue when no override
 *
 * Why these matter:
 *   If any of these gates is wired incorrectly, a tenant can over-provision
 *   beyond their paid plan — which is direct revenue leakage.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UsageLimitEnforcer — subscription limit gating (T-09)")
class UsageLimitEnforcerTest {

    @Mock private TenantConfigRepository configRepo;
    @Mock private SchoolRepository       schoolRepo;
    @Mock private StudentRepository      studentRepo;
    @Mock private StaffRepository        staffRepo;

    @InjectMocks private UsageLimitEnforcer enforcer;

    private final UUID tenantId = UUID.randomUUID();
    private final UUID schoolId = UUID.randomUUID();

    @BeforeEach
    void noOverridesByDefault() {
        // Most tests want defaults to apply (no overrides in tenant_configs).
        lenient().when(configRepo.findByTenantIdAndConfigKey(any(), any())).thenReturn(Optional.empty());
    }

    @Test
    @DisplayName("student check: passes when count below default limit")
    void studentCheck_passesWhenBelowLimit() {
        when(studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE)).thenReturn(10L);
        assertThatCode(() -> enforcer.checkStudentLimit(tenantId, schoolId)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("student check: throws when count equals default limit")
    void studentCheck_throwsAtLimit() {
        long defaultLimit = Long.parseLong(TenantConfigKey.MAX_STUDENTS_PER_SCHOOL.getDefaultValue());
        when(studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE)).thenReturn(defaultLimit);

        assertThatThrownBy(() -> enforcer.checkStudentLimit(tenantId, schoolId))
                .isInstanceOf(UsageLimitExceededException.class)
                .hasMessageContaining("MAX_STUDENTS_PER_SCHOOL");
    }

    @Test
    @DisplayName("student check: tenant_configs override beats default")
    void studentCheck_respectsTenantOverride() {
        TenantConfig override = new TenantConfig(tenantId, TenantConfigKey.MAX_STUDENTS_PER_SCHOOL, "5");
        when(configRepo.findByTenantIdAndConfigKey(eq(tenantId), eq(TenantConfigKey.MAX_STUDENTS_PER_SCHOOL)))
                .thenReturn(Optional.of(override));
        when(studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE)).thenReturn(5L);

        assertThatThrownBy(() -> enforcer.checkStudentLimit(tenantId, schoolId))
                .isInstanceOf(UsageLimitExceededException.class);
    }

    @Test
    @DisplayName("staff check: passes when count below default limit")
    void staffCheck_passesWhenBelowLimit() {
        when(staffRepo.countBySchoolIdAndStatus(schoolId, StaffStatus.ACTIVE)).thenReturn(5L);
        assertThatCode(() -> enforcer.checkStaffLimit(tenantId, schoolId)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("staff check: throws when count equals default limit")
    void staffCheck_throwsAtLimit() {
        long defaultLimit = Long.parseLong(TenantConfigKey.MAX_STAFF_PER_SCHOOL.getDefaultValue());
        when(staffRepo.countBySchoolIdAndStatus(schoolId, StaffStatus.ACTIVE)).thenReturn(defaultLimit);

        assertThatThrownBy(() -> enforcer.checkStaffLimit(tenantId, schoolId))
                .isInstanceOf(UsageLimitExceededException.class)
                .hasMessageContaining("MAX_STAFF_PER_SCHOOL");
    }

    @Test
    @DisplayName("school check: throws when count equals default limit")
    void schoolCheck_throwsAtLimit() {
        long defaultLimit = Long.parseLong(TenantConfigKey.MAX_SCHOOLS.getDefaultValue());
        when(schoolRepo.countByTenantIdAndStatus(tenantId, SchoolStatus.ACTIVE)).thenReturn(defaultLimit);

        assertThatThrownBy(() -> enforcer.checkSchoolLimit(tenantId))
                .isInstanceOf(UsageLimitExceededException.class)
                .hasMessageContaining("MAX_SCHOOLS");
    }

    @Test
    @DisplayName("defensive: even if count is somehow above the limit, the check still throws")
    void studentCheck_throwsWhenOverLimit() {
        long defaultLimit = Long.parseLong(TenantConfigKey.MAX_STUDENTS_PER_SCHOOL.getDefaultValue());
        when(studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE)).thenReturn(defaultLimit + 50);

        assertThatThrownBy(() -> enforcer.checkStudentLimit(tenantId, schoolId))
                .isInstanceOf(UsageLimitExceededException.class);
    }
}
