package com.cloudcampus.tenant.mapper;

import com.cloudcampus.tenant.dto.SchoolSearchResponse;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.entity.Tenant;
import org.springframework.stereotype.Component;

@Component
public class TenantMapper {

    public TenantResponse toResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getTenantId(),
                tenant.getSlug(),
                tenant.getSchoolName(),
                tenant.getSchemaName(),
                tenant.getLogoUrl(),
                tenant.getPrimaryColor(),
                tenant.isActive(),
                tenant.getCreatedAt()
        );
    }

    public SchoolSearchResponse toSchoolSearch(Tenant tenant) {
        return new SchoolSearchResponse(
                tenant.getSlug(),
                tenant.getSchoolName(),
                tenant.getLogoUrl(),
                tenant.getPrimaryColor()
        );
    }
}
