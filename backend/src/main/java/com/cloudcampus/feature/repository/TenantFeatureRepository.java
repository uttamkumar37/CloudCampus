package com.cloudcampus.feature.repository;

import com.cloudcampus.feature.entity.TenantFeature;
import com.cloudcampus.feature.entity.TenantFeatureId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TenantFeatureRepository extends JpaRepository<TenantFeature, TenantFeatureId> {

    /**
     * Returns the feature keys that are explicitly enabled for a tenant.
     * Used to populate the Redis cache on a miss.
     */
    @Query("SELECT tf.id.featureKey FROM TenantFeature tf WHERE tf.id.tenantId = :tenantId AND tf.enabled = true")
    List<String> findEnabledKeysByTenantId(@Param("tenantId") UUID tenantId);

    List<TenantFeature> findAllByIdTenantId(UUID tenantId);
}
