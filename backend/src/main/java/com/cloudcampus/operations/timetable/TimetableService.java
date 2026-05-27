package com.cloudcampus.operations.timetable;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.academic.Subject;
import com.cloudcampus.academic.SubjectRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
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
public class TimetableService {

    private final TimetableEntryRepository timetableEntryRepository;
    private final SchoolRepository schoolRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public TimetableService(
            TimetableEntryRepository timetableEntryRepository,
            SchoolRepository schoolRepository,
            ClassLevelRepository classLevelRepository,
            SectionRepository sectionRepository,
            SubjectRepository subjectRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.timetableEntryRepository = timetableEntryRepository;
        this.schoolRepository = schoolRepository;
        this.classLevelRepository = classLevelRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public TimetableEntryResponse create(AuthenticatedUser actor, TimetableEntryRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new BadRequestException("Timetable end time must be after start time.");
        }
        School school = requireActiveSchoolAdminSchool(actor);
        ClassLevel classLevel = classLevelRepository.findById(request.classLevelId())
                .orElseThrow(() -> new NotFoundException("Class was not found."));
        requireSameActiveSchool(actor, school, classLevel.getSchool().getId(), "Class does not belong to the active school.");
        Section section = resolveSection(school, classLevel, request.sectionId());
        Subject subject = resolveSubject(actor, school, request.subjectId());
        TimetableEntry entry = timetableEntryRepository.save(new TimetableEntry(
                school,
                classLevel,
                section,
                subject,
                actor.user(),
                request.weekday(),
                request.startTime(),
                request.endTime(),
                request.title().trim()
        ));
        recordCreated(actor.user(), entry);
        return toResponse(entry);
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> list(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return timetableEntryRepository.findBySchoolIdOrderByWeekdayAscStartTimeAsc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TimetableEntryResponse read(AuthenticatedUser actor, String timetableEntryId) {
        TimetableEntry entry = timetableEntryRepository.findById(timetableEntryId)
                .orElseThrow(() -> new NotFoundException("Timetable entry was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), entry.getSchool().getId());
        return toResponse(entry);
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

    private void requireSameActiveSchool(AuthenticatedUser actor, School activeSchool, String objectSchoolId, String message) {
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), objectSchoolId);
        if (!activeSchool.getId().equals(objectSchoolId)) {
            throw new ForbiddenException(message);
        }
    }

    private Section resolveSection(School activeSchool, ClassLevel classLevel, String sectionId) {
        if (sectionId == null || sectionId.isBlank()) {
            return null;
        }
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Section was not found."));
        if (!section.getClassLevel().getId().equals(classLevel.getId())
                || !section.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Section does not belong to this class.");
        }
        return section;
    }

    private Subject resolveSubject(AuthenticatedUser actor, School activeSchool, String subjectId) {
        if (subjectId == null || subjectId.isBlank()) {
            return null;
        }
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NotFoundException("Subject was not found."));
        requireSameActiveSchool(actor, activeSchool, subject.getSchool().getId(), "Subject does not belong to the active school.");
        return subject;
    }

    private TimetableEntryResponse toResponse(TimetableEntry entry) {
        Section section = entry.getSection();
        Subject subject = entry.getSubject();
        return new TimetableEntryResponse(
                entry.getId(),
                entry.getTenant().getId(),
                entry.getSchool().getId(),
                entry.getClassLevel().getId(),
                entry.getClassLevel().getName(),
                section == null ? null : section.getId(),
                section == null ? null : section.getName(),
                subject == null ? null : subject.getId(),
                subject == null ? null : subject.getName(),
                entry.getWeekday(),
                entry.getStartTime(),
                entry.getEndTime(),
                entry.getTitle(),
                entry.getCreatedAt()
        );
    }

    private void recordCreated(UserAccount actor, TimetableEntry entry) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("classLevelId", entry.getClassLevel().getId());
        metadata.put("sectionId", entry.getSection() == null ? null : entry.getSection().getId());
        metadata.put("subjectId", entry.getSubject() == null ? null : entry.getSubject().getId());
        metadata.put("weekday", entry.getWeekday().name());
        auditLogService.record(
                entry.getTenant().getId(),
                entry.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.TIMETABLE_ENTRY_CREATED,
                "TimetableEntry",
                entry.getId(),
                "Timetable entry created",
                metadata
        );
    }
}
