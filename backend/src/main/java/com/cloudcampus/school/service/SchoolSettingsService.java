package com.cloudcampus.school.service;

import com.cloudcampus.school.dto.SchoolSettingsRequest;
import com.cloudcampus.school.dto.SchoolSettingsResponse;

import java.util.UUID;

public interface SchoolSettingsService {

    /** Returns current settings; creates defaults if no row exists yet. */
    SchoolSettingsResponse get(UUID schoolId);

    /** Full update — replaces all configurable fields. */
    SchoolSettingsResponse update(UUID schoolId, SchoolSettingsRequest request);

    /**
     * Initialises a default settings row for a newly onboarded school.
     * Called internally by SchoolService during school creation.
     * Idempotent — no-op if a row already exists.
     */
    void initDefaults(UUID tenantId, UUID schoolId);
}
