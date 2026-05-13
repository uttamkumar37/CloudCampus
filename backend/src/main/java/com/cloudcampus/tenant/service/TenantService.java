package com.cloudcampus.tenant.service;

import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.Pagination;
import com.cloudcampus.tenant.dto.SuperAdminStatsResponse;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.TenantResponse;

import java.util.UUID;

public interface TenantService {
    TenantResponse create(TenantCreateRequest request);

    TenantResponse get(UUID id);

    PageResponse<TenantResponse> list(Pagination pagination);

    TenantResponse suspend(UUID id);

    TenantResponse activate(UUID id);

    SuperAdminStatsResponse getStats();
}

