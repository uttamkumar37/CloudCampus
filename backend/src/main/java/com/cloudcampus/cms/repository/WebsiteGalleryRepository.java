package com.cloudcampus.cms.repository;

import com.cloudcampus.cms.entity.WebsiteGalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WebsiteGalleryRepository extends JpaRepository<WebsiteGalleryItem, UUID> {
    List<WebsiteGalleryItem> findByTenantIdOrderByDisplayOrderAsc(String tenantId);
    List<WebsiteGalleryItem> findByTenantIdAndVisibleTrueOrderByDisplayOrderAsc(String tenantId);
}
