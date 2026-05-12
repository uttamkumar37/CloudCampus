package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.SchoolSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings, UUID> {
    // PK = schoolId, so findById(schoolId) covers all lookup needs.
}
