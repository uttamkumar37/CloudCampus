package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.SchoolSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings, UUID> {
    // PK = schoolId; authenticated flows should also bind tenantId explicitly.
    Optional<SchoolSettings> findBySchoolIdAndTenantId(UUID schoolId, UUID tenantId);
}
