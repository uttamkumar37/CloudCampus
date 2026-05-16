package com.cloudcampus.tenant.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.Pagination;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.service.SchoolSettingsService;
import com.cloudcampus.tenant.dto.SuperAdminStatsResponse;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolSettingsService schoolSettingsService;
    private final TenantBootstrapService tenantBootstrapService;

    public TenantServiceImpl(TenantRepository tenantRepository, SchoolRepository schoolRepository,
                             SchoolSettingsService schoolSettingsService,
                             TenantBootstrapService tenantBootstrapService) {
        this.tenantRepository       = tenantRepository;
        this.schoolRepository       = schoolRepository;
        this.schoolSettingsService  = schoolSettingsService;
        this.tenantBootstrapService = tenantBootstrapService;
    }

    @Override
    @Transactional
    public TenantResponse create(TenantCreateRequest request) {
        String code = request.code().trim().toLowerCase();

        // Fast pre-check (common case — avoids pointless DB write on obvious duplicates).
        // The DataIntegrityViolationException catch below handles the concurrent-create race.
        if (tenantRepository.findByCode(code).isPresent()) {
            throw new ConflictException("Tenant code '" + code + "' already exists");
        }

        Tenant tenant = new Tenant(
                UUID.randomUUID(),
                code,
                request.name().trim(),
                TenantStatus.ACTIVE,
                Instant.now()
        );

        try {
            tenantRepository.save(tenant);
        } catch (DataIntegrityViolationException ex) {
            // C-02: Race condition safety net — two concurrent creates with the same code
            // both pass the pre-check above and then race to insert. The DB unique constraint
            // wins; we convert the constraint violation to a clean 409 Conflict.
            throw new ConflictException("Tenant code '" + code + "' already exists");
        }

        // Auto-create the default school for this tenant.
        // Every tenant starts with one school (code = "MAIN"). Additional schools
        // can be added later via the School management API.
        School defaultSchool = new School(
                UUID.randomUUID(),
                tenant.getId(),
                tenant.getName(),   // school name defaults to tenant name
                "MAIN",
                SchoolStatus.ACTIVE,
                tenant.getCreatedAt()
        );
        schoolRepository.save(defaultSchool);
        schoolSettingsService.initDefaults(tenant.getId(), defaultSchool.getId());
        tenantBootstrapService.bootstrap(tenant.getId(), defaultSchool.getId());

        return toResponse(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse get(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
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

    @Override
    @Transactional
    public TenantResponse suspend(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
        if (tenant.getStatus() == TenantStatus.SUSPENDED) {
            throw new BadRequestException("Tenant is already suspended");
        }
        tenant.setStatus(TenantStatus.SUSPENDED);
        return toResponse(tenantRepository.save(tenant));
    }

    @Override
    @Transactional
    public TenantResponse activate(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
        if (tenant.getStatus() == TenantStatus.ACTIVE) {
            throw new BadRequestException("Tenant is already active");
        }
        tenant.setStatus(TenantStatus.ACTIVE);
        return toResponse(tenantRepository.save(tenant));
    }

    @Override
    @Transactional(readOnly = true)
    public SuperAdminStatsResponse getStats() {
        long total     = tenantRepository.count();
        long active    = tenantRepository.countByStatus(TenantStatus.ACTIVE);
        long suspended = tenantRepository.countByStatus(TenantStatus.SUSPENDED);
        Instant startOfMonth = YearMonth.now().atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        long newThisMonth = tenantRepository.countByCreatedAtAfter(startOfMonth);
        return new SuperAdminStatsResponse(total, active, suspended, newThisMonth);
    }

    private TenantResponse toResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                tenant.getStatus(),
                tenant.getCreatedAt(),
                tenant.getUpdatedAt()
        );
    }
}

