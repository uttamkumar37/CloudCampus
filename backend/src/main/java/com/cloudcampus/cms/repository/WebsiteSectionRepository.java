package com.cloudcampus.cms.repository;

import com.cloudcampus.cms.entity.WebsiteSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WebsiteSectionRepository extends JpaRepository<WebsiteSection, UUID> {
    List<WebsiteSection> findByTenantIdOrderByDisplayOrderAsc(String tenantId);
    List<WebsiteSection> findByTenantIdAndVisibleTrueOrderByDisplayOrderAsc(String tenantId);
    Optional<WebsiteSection> findByTenantIdAndSectionKey(String tenantId, String sectionKey);
}
