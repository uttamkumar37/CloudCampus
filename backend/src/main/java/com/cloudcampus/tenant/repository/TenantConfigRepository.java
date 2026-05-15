package com.cloudcampus.tenant.repository;

import com.cloudcampus.tenant.entity.TenantConfig;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantConfigRepository extends JpaRepository<TenantConfig, TenantConfig.PK> {

    List<TenantConfig> findAllByTenantId(UUID tenantId);

    Optional<TenantConfig> findByTenantIdAndConfigKey(UUID tenantId, TenantConfigKey key);
}
