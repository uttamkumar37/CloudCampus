package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.ContentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentBlockRepository extends JpaRepository<ContentBlock, UUID> {

    // Tenant-specific published block (highest version)
    @Query("""
        SELECT b FROM ContentBlock b
        WHERE b.tenantId = :tenantId AND b.blockKey = :key AND b.locale = :locale
          AND b.published = true
        ORDER BY b.version DESC
        LIMIT 1
    """)
    Optional<ContentBlock> findPublishedByTenantAndKey(
            @Param("tenantId") UUID tenantId,
            @Param("key") String key,
            @Param("locale") String locale);

    // Global published block (tenant_id IS NULL)
    @Query("""
        SELECT b FROM ContentBlock b
        WHERE b.tenantId IS NULL AND b.blockKey = :key AND b.locale = :locale
          AND b.published = true
        ORDER BY b.version DESC
        LIMIT 1
    """)
    Optional<ContentBlock> findPublishedGlobalByKey(
            @Param("key") String key,
            @Param("locale") String locale);

    // Batch fetch all published global blocks for given keys
    @Query("""
        SELECT b FROM ContentBlock b
        WHERE b.tenantId IS NULL AND b.blockKey IN :keys AND b.locale = :locale
          AND b.published = true
        ORDER BY b.blockKey, b.version DESC
    """)
    List<ContentBlock> findPublishedGlobalByKeys(
            @Param("keys") List<String> keys,
            @Param("locale") String locale);

    // All blocks for super-admin management (paginated via JPA Pageable)
    List<ContentBlock> findByTenantIdIsNullOrderByBlockKeyAscVersionDesc();

    List<ContentBlock> findByTenantIdOrderByBlockKeyAscVersionDesc(UUID tenantId);
}
