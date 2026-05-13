package com.cloudcampus.feature.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Composite primary key for {@link TenantFeature}.
 * Maps to (tenant_id, feature_key) in the tenant_features table.
 */
@Embeddable
public class TenantFeatureId implements Serializable {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "feature_key", nullable = false, length = 100)
    private String featureKey;

    protected TenantFeatureId() {
    }

    public TenantFeatureId(UUID tenantId, String featureKey) {
        this.tenantId   = tenantId;
        this.featureKey = featureKey;
    }

    public UUID getTenantId()    { return tenantId; }
    public String getFeatureKey() { return featureKey; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TenantFeatureId other)) return false;
        return Objects.equals(tenantId, other.tenantId)
            && Objects.equals(featureKey, other.featureKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tenantId, featureKey);
    }
}
