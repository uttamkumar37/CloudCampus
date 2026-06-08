package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "platform_settings")
public class PlatformSettings {

    public static final String PLATFORM_ID = "platform";

    @Id
    @Column(length = 40)
    private String id = PLATFORM_ID;

    @Column(nullable = false, length = 160)
    private String platformName;

    @Column(nullable = false, length = 320)
    private String supportEmail;

    @Column(nullable = false, length = 80)
    private String defaultTimezone;

    @Column(nullable = false)
    private boolean maintenanceMode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_user_id")
    private UserAccount updatedBy;

    @Column(nullable = false)
    private Instant updatedAt;

    protected PlatformSettings() {
    }

    public PlatformSettings(
            String platformName,
            String supportEmail,
            String defaultTimezone,
            boolean maintenanceMode,
            UserAccount updatedBy
    ) {
        update(platformName, supportEmail, defaultTimezone, maintenanceMode, updatedBy, Instant.now());
    }

    public void update(
            String platformName,
            String supportEmail,
            String defaultTimezone,
            boolean maintenanceMode,
            UserAccount updatedBy,
            Instant updatedAt
    ) {
        this.id = PLATFORM_ID;
        this.platformName = platformName;
        this.supportEmail = supportEmail;
        this.defaultTimezone = defaultTimezone;
        this.maintenanceMode = maintenanceMode;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
    }

    public String getPlatformName() {
        return platformName;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public String getDefaultTimezone() {
        return defaultTimezone;
    }

    public boolean isMaintenanceMode() {
        return maintenanceMode;
    }
}
