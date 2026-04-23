package com.campuscloud.tenant.service;

import com.campuscloud.tenant.dto.TenantCreateRequest;
import com.campuscloud.tenant.dto.TenantResponse;

import java.util.List;

public interface TenantService {

    TenantResponse createTenant(TenantCreateRequest request);

    List<TenantResponse> getAllTenants();

    TenantResponse getTenantByTenantId(String tenantId);
}
