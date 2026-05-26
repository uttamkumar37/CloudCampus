package com.cloudcampus.academic;

import java.util.List;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AcademicLifecycleService {

    private final AcademicYearRepository academicYearRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public AcademicLifecycleService(
            AcademicYearRepository academicYearRepository,
            ClassLevelRepository classLevelRepository,
            SectionRepository sectionRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.academicYearRepository = academicYearRepository;
        this.classLevelRepository = classLevelRepository;
        this.sectionRepository = sectionRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AcademicYearResponse createAcademicYear(AuthenticatedUser actor, AcademicYearRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        validateDates(request);
        String name = request.name().trim();
        academicYearRepository.findBySchoolIdAndName(school.getId(), name)
                .ifPresent(existing -> {
                    throw new ConflictException("Academic year already exists for this school.");
                });

        AcademicYear academicYear = academicYearRepository.save(new AcademicYear(
                school.getTenant(),
                school,
                name,
                request.startDate(),
                request.endDate()
        ));
        record(actor.user(), academicYear, AuditAction.ACADEMIC_YEAR_CREATED, "AcademicYear", academicYear.getId());
        if (request.activate()) {
            activateAcademicYear(actor, academicYear.getId());
        }
        return toAcademicYearResponse(academicYear);
    }

    @Transactional(readOnly = true)
    public List<AcademicYearResponse> academicYears(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return academicYearRepository.findBySchoolIdOrderByStartDateDesc(school.getId())
                .stream()
                .map(this::toAcademicYearResponse)
                .toList();
    }

    @Transactional
    public AcademicYearResponse activateAcademicYear(AuthenticatedUser actor, String academicYearId) {
        AcademicYear academicYear = requireAcademicYearAccess(actor, academicYearId);
        academicYearRepository.findBySchoolIdAndStatus(academicYear.getSchool().getId(), AcademicYearStatus.ACTIVE)
                .stream()
                .filter(existing -> !existing.getId().equals(academicYear.getId()))
                .forEach(AcademicYear::close);
        academicYear.activate();
        record(actor.user(), academicYear, AuditAction.ACADEMIC_YEAR_ACTIVATED, "AcademicYear", academicYear.getId());
        return toAcademicYearResponse(academicYear);
    }

    @Transactional
    public ClassLevelResponse createClassLevel(AuthenticatedUser actor, ClassLevelRequest request) {
        AcademicYear academicYear = requireAcademicYearAccess(actor, request.academicYearId());
        String name = request.name().trim();
        classLevelRepository.findByAcademicYearIdAndName(academicYear.getId(), name)
                .ifPresent(existing -> {
                    throw new ConflictException("Class already exists for this academic year.");
                });

        ClassLevel classLevel = classLevelRepository.save(new ClassLevel(
                academicYear,
                name,
                request.displayOrder()
        ));
        record(actor.user(), classLevel, AuditAction.CLASS_LEVEL_CREATED, "ClassLevel", classLevel.getId());
        return toClassLevelResponse(classLevel);
    }

    @Transactional(readOnly = true)
    public List<ClassLevelResponse> classLevels(AuthenticatedUser actor, String academicYearId) {
        AcademicYear academicYear = requireAcademicYearAccess(actor, academicYearId);
        return classLevelRepository.findByAcademicYearIdOrderByDisplayOrderAscNameAsc(academicYear.getId())
                .stream()
                .map(this::toClassLevelResponse)
                .toList();
    }

    @Transactional
    public SectionResponse createSection(AuthenticatedUser actor, SectionRequest request) {
        ClassLevel classLevel = requireClassLevelAccess(actor, request.classLevelId());
        String name = request.name().trim();
        sectionRepository.findByClassLevelIdAndName(classLevel.getId(), name)
                .ifPresent(existing -> {
                    throw new ConflictException("Section already exists for this class.");
                });

        Section section = sectionRepository.save(new Section(
                classLevel,
                name,
                request.capacity()
        ));
        record(actor.user(), section, AuditAction.SECTION_CREATED, "Section", section.getId());
        return toSectionResponse(section);
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> sections(AuthenticatedUser actor, String classLevelId) {
        ClassLevel classLevel = requireClassLevelAccess(actor, classLevelId);
        return sectionRepository.findByClassLevelIdOrderByNameAsc(classLevel.getId())
                .stream()
                .map(this::toSectionResponse)
                .toList();
    }

    private School requireActiveSchoolAdminSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private AcademicYear requireAcademicYearAccess(AuthenticatedUser actor, String academicYearId) {
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new NotFoundException("Academic year was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), academicYear.getSchool().getId());
        return academicYear;
    }

    private ClassLevel requireClassLevelAccess(AuthenticatedUser actor, String classLevelId) {
        ClassLevel classLevel = classLevelRepository.findById(classLevelId)
                .orElseThrow(() -> new NotFoundException("Class was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), classLevel.getSchool().getId());
        return classLevel;
    }

    private void validateDates(AcademicYearRequest request) {
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BadRequestException("Academic year end date must be after start date.");
        }
    }

    private void record(UserAccount actor, AcademicYear academicYear, AuditAction action, String entityType, String entityId) {
        auditLogService.record(
                academicYear.getTenant().getId(),
                academicYear.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                entityType,
                entityId,
                action.name(),
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", academicYear.getTenant().getId(),
                        "schoolId", academicYear.getSchool().getId(),
                        "academicYearId", academicYear.getId(),
                        "name", academicYear.getName(),
                        "status", academicYear.getStatus().name()
                )
        );
    }

    private void record(UserAccount actor, ClassLevel classLevel, AuditAction action, String entityType, String entityId) {
        auditLogService.record(
                classLevel.getTenant().getId(),
                classLevel.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                entityType,
                entityId,
                action.name(),
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", classLevel.getTenant().getId(),
                        "schoolId", classLevel.getSchool().getId(),
                        "academicYearId", classLevel.getAcademicYear().getId(),
                        "classLevelId", classLevel.getId(),
                        "name", classLevel.getName()
                )
        );
    }

    private void record(UserAccount actor, Section section, AuditAction action, String entityType, String entityId) {
        auditLogService.record(
                section.getTenant().getId(),
                section.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                entityType,
                entityId,
                action.name(),
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", section.getTenant().getId(),
                        "schoolId", section.getSchool().getId(),
                        "classLevelId", section.getClassLevel().getId(),
                        "sectionId", section.getId(),
                        "name", section.getName()
                )
        );
    }

    private AcademicYearResponse toAcademicYearResponse(AcademicYear academicYear) {
        return new AcademicYearResponse(
                academicYear.getId(),
                academicYear.getTenant().getId(),
                academicYear.getSchool().getId(),
                academicYear.getName(),
                academicYear.getStartDate(),
                academicYear.getEndDate(),
                academicYear.getStatus()
        );
    }

    private ClassLevelResponse toClassLevelResponse(ClassLevel classLevel) {
        return new ClassLevelResponse(
                classLevel.getId(),
                classLevel.getTenant().getId(),
                classLevel.getSchool().getId(),
                classLevel.getAcademicYear().getId(),
                classLevel.getName(),
                classLevel.getDisplayOrder(),
                classLevel.isActive()
        );
    }

    private SectionResponse toSectionResponse(Section section) {
        return new SectionResponse(
                section.getId(),
                section.getTenant().getId(),
                section.getSchool().getId(),
                section.getClassLevel().getId(),
                section.getName(),
                section.getCapacity(),
                section.isActive()
        );
    }
}
