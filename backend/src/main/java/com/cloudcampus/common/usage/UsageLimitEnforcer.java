package com.cloudcampus.common.usage;

import com.cloudcampus.common.exception.UsageLimitExceededException;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Enforces per-tenant capacity limits configured in tenant_configs (CC-0312).
 *
 * Reads the configured ceiling from TenantConfigRepository (falls back to the
 * enum default when no explicit override exists), compares it to the current
 * active count, and throws {@link UsageLimitExceededException} (→ 422) when
 * the ceiling would be breached.
 *
 * Callers should invoke the relevant check method before persisting a new entity.
 * The check is not transactionally locked — a small window of over-provisioning
 * under concurrent burst traffic is acceptable at this tier.
 */
@Component
public class UsageLimitEnforcer {

    private final TenantConfigRepository configRepo;
    private final SchoolRepository       schoolRepo;
    private final StudentRepository      studentRepo;
    private final StaffRepository        staffRepo;

    public UsageLimitEnforcer(TenantConfigRepository configRepo,
                               SchoolRepository schoolRepo,
                               StudentRepository studentRepo,
                               StaffRepository staffRepo) {
        this.configRepo  = configRepo;
        this.schoolRepo  = schoolRepo;
        this.studentRepo = studentRepo;
        this.staffRepo   = staffRepo;
    }

    public void checkSchoolLimit(UUID tenantId) {
        long limit   = getLongLimit(tenantId, TenantConfigKey.MAX_SCHOOLS);
        long current = schoolRepo.countByTenantIdAndStatus(tenantId, SchoolStatus.ACTIVE);
        if (current >= limit) {
            throw new UsageLimitExceededException(TenantConfigKey.MAX_SCHOOLS.name(), current, limit);
        }
    }

    public void checkStudentLimit(UUID tenantId, UUID schoolId) {
        long limit   = getLongLimit(tenantId, TenantConfigKey.MAX_STUDENTS_PER_SCHOOL);
        long current = studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE);
        if (current >= limit) {
            throw new UsageLimitExceededException(TenantConfigKey.MAX_STUDENTS_PER_SCHOOL.name(), current, limit);
        }
    }

    public void checkStaffLimit(UUID tenantId, UUID schoolId) {
        long limit   = getLongLimit(tenantId, TenantConfigKey.MAX_STAFF_PER_SCHOOL);
        long current = staffRepo.countBySchoolIdAndStatus(schoolId, StaffStatus.ACTIVE);
        if (current >= limit) {
            throw new UsageLimitExceededException(TenantConfigKey.MAX_STAFF_PER_SCHOOL.name(), current, limit);
        }
    }

    private long getLongLimit(UUID tenantId, TenantConfigKey key) {
        return configRepo.findByTenantIdAndConfigKey(tenantId, key)
                .map(c -> Long.parseLong(c.getConfigValue()))
                .orElse(Long.parseLong(key.getDefaultValue()));
    }
}
