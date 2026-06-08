package com.cloudcampus.platform.superadmin.control;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, String> {
}
