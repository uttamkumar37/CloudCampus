package com.cloudcampus.domain.service;

import com.cloudcampus.domain.dto.DomainResponse;

import java.util.List;
import java.util.UUID;

public interface CustomDomainService {
    DomainResponse register(UUID tenantId, String domain);
    DomainResponse verify(UUID tenantId, UUID domainId);
    List<DomainResponse> list(UUID tenantId);
    void delete(UUID tenantId, UUID domainId);
}
