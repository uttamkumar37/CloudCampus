package com.cloudcampus.school;

import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SchoolSettingsService {

    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public SchoolSettingsService(
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public SchoolSettingsResponse get(AuthenticatedUser actor) {
        return toResponse(requireActiveAdminSchool(actor));
    }

    @Transactional
    public SchoolSettingsResponse update(AuthenticatedUser actor, SchoolSettingsRequest request) {
        School school = requireActiveAdminSchool(actor);
        String name = request.name() == null ? null : request.name().trim();
        if (name == null || name.isBlank()) {
            throw new BadRequestException("School name is required.");
        }
        String previousName = school.getName();
        if (!previousName.equals(name)) {
            school.rename(name);
            recordSchoolUpdated(actor.user(), school, previousName);
        }
        return toResponse(school);
    }

    private School requireActiveAdminSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private SchoolSettingsResponse toResponse(School school) {
        return new SchoolSettingsResponse(
                school.getTenant().getId(),
                school.getId(),
                school.getCode(),
                school.getName(),
                school.isPrimarySchool(),
                school.isActive(),
                school.getCreatedAt()
        );
    }

    private void recordSchoolUpdated(UserAccount actor, School school, String previousName) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_UPDATED,
                "School",
                school.getId(),
                "School settings updated.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "previousName", previousName,
                        "updatedName", school.getName()
                )
        );
    }
}
