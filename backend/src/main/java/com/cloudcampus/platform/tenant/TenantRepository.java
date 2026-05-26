package com.cloudcampus.platform.tenant;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, String> {

    boolean existsByCode(String code);

    Optional<Tenant> findByCode(String code);
}
