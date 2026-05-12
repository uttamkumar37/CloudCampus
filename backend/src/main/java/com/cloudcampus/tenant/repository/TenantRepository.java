package com.cloudcampus.tenant.repository;

import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByCode(String code);
    long countByStatus(TenantStatus status);
    long countByCreatedAtAfter(Instant after);
}

