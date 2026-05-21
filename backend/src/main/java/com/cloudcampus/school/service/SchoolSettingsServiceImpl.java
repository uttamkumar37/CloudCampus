package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.SchoolSettingsRequest;
import com.cloudcampus.school.dto.SchoolSettingsResponse;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolSettings;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.repository.SchoolSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
class SchoolSettingsServiceImpl implements SchoolSettingsService {

    private final SchoolSettingsRepository repo;
    private final SchoolRepository schoolRepo;

    SchoolSettingsServiceImpl(SchoolSettingsRepository repo, SchoolRepository schoolRepo) {
        this.repo = repo;
        this.schoolRepo = schoolRepo;
    }

    @Override
    @Transactional
    public SchoolSettingsResponse get(UUID schoolId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return SchoolSettingsResponse.from(loadOrCreateDefaults(tenantId, schoolId));
    }

    @Override
    @Transactional
    public SchoolSettingsResponse update(UUID schoolId, SchoolSettingsRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        SchoolSettings settings = loadOrCreateDefaults(tenantId, schoolId);

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

    private SchoolSettings loadOrCreateDefaults(UUID tenantId, UUID schoolId) {
        return repo.findBySchoolIdAndTenantId(schoolId, tenantId)
                .orElseGet(() -> {
                    validateSchoolOwnership(tenantId, schoolId);
                    return repo.save(SchoolSettings.createDefaults(tenantId, schoolId));
                });
    }

    private void validateSchoolOwnership(UUID tenantId, UUID schoolId) {
        School school = schoolRepo.findByIdFiltered(schoolId)
                .orElseThrow(() -> new NotFoundException("School not found: " + schoolId));
        if (!tenantId.equals(school.getTenantId())) {
            throw new NotFoundException("School not found: " + schoolId);
        }
    }
}
