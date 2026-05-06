package com.cloudcampus.tenant.service;

import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.SchoolSearchResponse;
import com.cloudcampus.tenant.dto.TenantResponse;

import java.util.List;

public interface TenantService {

    TenantResponse createTenant(TenantCreateRequest request);

    List<TenantResponse> getAllTenants();

    List<SchoolSearchResponse> searchSchools(String query);

    SchoolSearchResponse getSchoolBySlug(String tenantSlug);

    TenantResponse getTenantByTenantId(String tenantId);

    TenantResponse getTenantBySlug(String tenantSlug);

    TenantResponse updateTenantActiveStatus(String tenantId, boolean active);

    String resolveSchemaByTenantIdentifier(String identifier);

    TenantResponse getCurrentTenant();
}
