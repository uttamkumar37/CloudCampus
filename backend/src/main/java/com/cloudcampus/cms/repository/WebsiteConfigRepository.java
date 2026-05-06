package com.cloudcampus.cms.repository;

import com.cloudcampus.cms.entity.WebsiteConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WebsiteConfigRepository extends JpaRepository<WebsiteConfig, UUID> {
    Optional<WebsiteConfig> findByTenantId(String tenantId);
}
