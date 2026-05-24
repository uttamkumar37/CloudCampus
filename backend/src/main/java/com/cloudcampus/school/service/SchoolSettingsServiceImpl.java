package com.cloudcampus.school.service;

import com.cloudcampus.audit.entity.AuditAction;
import com.cloudcampus.audit.service.AuditLogService;
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

import java.util.Map;
import java.util.UUID;

@Service
class SchoolSettingsServiceImpl implements SchoolSettingsService {

    private final SchoolSettingsRepository repo;
    private final SchoolRepository schoolRepo;
    private final AuditLogService auditLog;

    SchoolSettingsServiceImpl(SchoolSettingsRepository repo, SchoolRepository schoolRepo, AuditLogService auditLog) {
        this.repo = repo;
        this.schoolRepo = schoolRepo;
        this.auditLog = auditLog;
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

        SchoolSettings saved = repo.save(settings);
        auditLog.logCriticalMutation(
                RequestContext.getUserId(),
                tenantId,
                AuditAction.CONFIG_SCHOOL_SETTINGS_UPDATED,
                "SchoolSettings",
                schoolId.toString(),
                "School settings updated",
                Map.of("schoolId", schoolId.toString()));
        return SchoolSettingsResponse.from(saved);
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
