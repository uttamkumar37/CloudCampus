package com.cloudcampus.domain.repository;

import com.cloudcampus.domain.entity.CustomDomain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomDomainRepository extends JpaRepository<CustomDomain, UUID> {
    List<CustomDomain> findAllByTenantId(UUID tenantId);
    Optional<CustomDomain> findByIdAndTenantId(UUID id, UUID tenantId);
    Optional<CustomDomain> findByTenantIdAndDomain(UUID tenantId, String domain);
    Optional<CustomDomain> findByDomain(String domain);
    boolean existsByTenantIdAndDomain(UUID tenantId, String domain);
}
