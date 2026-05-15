package com.cloudcampus.tenant.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "tenant_configs")
@IdClass(TenantConfig.PK.class)
public class TenantConfig {

    @Id
    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "config_key", nullable = false, length = 100)
    private TenantConfigKey configKey;

    @Column(name = "config_value", nullable = false, length = 500)
    private String configValue;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PreUpdate
    void touch() { updatedAt = Instant.now(); }

    // ── Constructors ─────────────────────────────────────────────────────────

    protected TenantConfig() {}

    public TenantConfig(UUID tenantId, TenantConfigKey configKey, String configValue) {
        this.tenantId    = tenantId;
        this.configKey   = configKey;
        this.configValue = configValue;
        this.updatedAt   = Instant.now();
    }

    // ── Getters / Setters ────────────────────────────────────────────────────

    public UUID             getTenantId()   { return tenantId; }
    public TenantConfigKey  getConfigKey()  { return configKey; }
    public String           getConfigValue(){ return configValue; }
    public Instant          getUpdatedAt()  { return updatedAt; }

    public void setConfigValue(String value) {
        this.configValue = value;
        this.updatedAt   = Instant.now();
    }

    // ── Composite PK ─────────────────────────────────────────────────────────

    public static class PK implements Serializable {
        private UUID           tenantId;
        private TenantConfigKey configKey;

        public PK() {}
        public PK(UUID tenantId, TenantConfigKey configKey) {
            this.tenantId  = tenantId;
            this.configKey = configKey;
        }

        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PK pk)) return false;
            return Objects.equals(tenantId, pk.tenantId) && configKey == pk.configKey;
        }

        @Override public int hashCode() {
            return Objects.hash(tenantId, configKey);
        }
    }
}
