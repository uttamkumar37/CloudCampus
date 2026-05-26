package com.cloudcampus.platform.tenantadmin.settings;

import java.time.Instant;

import com.cloudcampus.platform.tenant.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "tenant_settings")
public class TenantSettings {

    @Id
    @Column(name = "tenant_id", length = 36)
    private String tenantId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 180)
    private String displayName;

    @Column(length = 320)
    private String billingEmail;

    @Column(length = 320)
    private String supportEmail;

    @Column(nullable = false, length = 80)
    private String timezone;

    @Column(nullable = false, length = 20)
    private String locale;

    @Column(nullable = false)
    private Instant updatedAt;

    protected TenantSettings() {
    }

    public TenantSettings(Tenant tenant) {
        this.tenant = tenant;
        this.displayName = tenant.getName();
        this.timezone = "UTC";
        this.locale = "en-US";
    }

    public void update(String displayName, String billingEmail, String supportEmail, String timezone, String locale) {
        this.displayName = displayName.trim();
        this.billingEmail = blankToNull(billingEmail);
        this.supportEmail = blankToNull(supportEmail);
        this.timezone = timezone.trim();
        this.locale = locale.trim();
    }

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(java.util.Locale.ROOT);
    }

    public String getTenantId() {
        return tenantId;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getBillingEmail() {
        return billingEmail;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public String getTimezone() {
        return timezone;
    }

    public String getLocale() {
        return locale;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
