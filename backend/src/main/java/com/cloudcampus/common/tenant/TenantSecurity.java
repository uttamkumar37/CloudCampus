package com.cloudcampus.common.tenant;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.repository.SchoolRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Central tenant-ownership assertions for path-scoped resources.
 */
@Component
public class TenantSecurity {

    private final SchoolRepository schoolRepository;

    public TenantSecurity(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    public void assertSchoolBelongsToTenant(UUID schoolId) {
        String tenantId = RequestContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            throw new NotFoundException("School not found");
        }

        if (!schoolRepository.existsByIdAndTenantId(schoolId, UUID.fromString(tenantId))) {
            throw new NotFoundException("School not found");
        }
    }
}
