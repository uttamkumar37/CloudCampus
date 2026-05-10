package com.cloudcampus.tenant.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.Pagination;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class TenantServiceImpl implements TenantService {
    private final TenantRepository tenantRepository;

    public TenantServiceImpl(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    @Transactional
    public TenantResponse create(TenantCreateRequest request) {
        String code = request.code().trim().toLowerCase();
        if (tenantRepository.findByCode(code).isPresent()) {
            throw new BadRequestException("Tenant code already exists");
        }

        Tenant tenant = new Tenant(
                UUID.randomUUID(),
                code,
                request.name().trim(),
                TenantStatus.ACTIVE,
                Instant.now()
        );
        tenantRepository.save(tenant);
        return toResponse(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse get(UUID id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new NotFoundException("Tenant not found"));
        return toResponse(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TenantResponse> list(Pagination pagination) {
        var page = tenantRepository.findAll(PageRequest.of(
                pagination.offset() / pagination.limit(),
                pagination.limit(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        ));
        var items = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(items, pagination.offset(), pagination.limit(), page.getTotalElements());
    }

    private TenantResponse toResponse(Tenant tenant) {
        return new TenantResponse(tenant.getId(), tenant.getCode(), tenant.getName(), tenant.getStatus(), tenant.getCreatedAt());
    }
}

