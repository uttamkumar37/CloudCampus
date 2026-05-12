package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.school.dto.SchoolSettingsRequest;
import com.cloudcampus.school.dto.SchoolSettingsResponse;
import com.cloudcampus.school.entity.SchoolSettings;
import com.cloudcampus.school.repository.SchoolSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
class SchoolSettingsServiceImpl implements SchoolSettingsService {

    private final SchoolSettingsRepository repo;

    SchoolSettingsServiceImpl(SchoolSettingsRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public SchoolSettingsResponse get(UUID schoolId) {
        return SchoolSettingsResponse.from(
                repo.findById(schoolId)
                    .orElseThrow(() -> new NotFoundException("School settings not found for school: " + schoolId))
        );
    }

    @Override
    @Transactional
    public SchoolSettingsResponse update(UUID schoolId, SchoolSettingsRequest req) {
        SchoolSettings settings = repo.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School settings not found for school: " + schoolId));

        settings.setTimezone(req.timezone());
        settings.setLocale(req.locale());
        settings.setAcademicCalendarType(req.academicCalendarType());
        settings.setWorkingDaysMask(req.workingDaysMask());
        settings.setGradingScheme(req.gradingScheme());
        settings.setMinAttendancePct(req.minAttendancePct());
        settings.setMaxClassCapacity(req.maxClassCapacity());
        settings.setAllowLateAttendance(req.allowLateAttendance());
        settings.setLateCutoffMinutes(req.lateCutoffMinutes());
        settings.setSchoolLogoUrl(req.schoolLogoUrl());
        settings.setPrimaryColor(req.primaryColor());

        return SchoolSettingsResponse.from(repo.save(settings));
    }

    @Override
    @Transactional
    public void initDefaults(UUID tenantId, UUID schoolId) {
        if (repo.existsById(schoolId)) {
            return; // Idempotent — already initialised.
        }
        repo.save(SchoolSettings.createDefaults(tenantId, schoolId));
    }
}
