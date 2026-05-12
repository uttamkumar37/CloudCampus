package com.cloudcampus.feature.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Per-tenant feature enablement record (maps to the `tenant_features` table from V3).
 *
 * Whether a feature is enabled for a specific tenant is determined by this row.
 * CORE features ({@link FeatureType#CORE}) are always considered enabled regardless
 * of this table — the service layer handles that logic so no row is required for them.
 */
@Entity
@Table(name = "tenant_features")
public class TenantFeature {

    @EmbeddedId
    private TenantFeatureId id;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    /**
     * Optional per-tenant configuration overrides for this feature.
     * For example: SMS provider API key, QR scanner timeout, etc.
     * Stored as JSONB — deserialized into Map<String, Object> by Jackson.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", columnDefinition = "jsonb")
    private Map<String, Object> config;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TenantFeature() {
    }

    public TenantFeature(UUID tenantId, String featureKey, boolean enabled) {
        this.id        = new TenantFeatureId(tenantId, featureKey);
        this.enabled   = enabled;
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Accessors ────────────────────────────────────────────────────────────

    public TenantFeatureId getId()           { return id; }
    public UUID getTenantId()                { return id.getTenantId(); }
    public String getFeatureKey()            { return id.getFeatureKey(); }
    public boolean isEnabled()               { return enabled; }
    public Map<String, Object> getConfig()   { return config; }
    public Instant getUpdatedAt()            { return updatedAt; }

    public void setEnabled(boolean enabled) {
        this.enabled   = enabled;
        this.updatedAt = Instant.now();
    }
}
