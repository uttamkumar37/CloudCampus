package com.cloudcampus.platform.tenantadmin.settings;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantSettingsRepository extends JpaRepository<TenantSettings, String> {
}
