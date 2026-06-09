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
import com.cloudcampus.academic.TeacherAssignment;
import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
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
    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public TimetableService(
            TimetableEntryRepository timetableEntryRepository,
            SchoolRepository schoolRepository,
            ClassLevelRepository classLevelRepository,
            SectionRepository sectionRepository,
            SubjectRepository subjectRepository,
            StudentRepository studentRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.timetableEntryRepository = timetableEntryRepository;
        this.schoolRepository = schoolRepository;
        this.classLevelRepository = classLevelRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
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

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> teacherTimetable(AuthenticatedUser actor) {
        if (actor.user().getRole() != UserRole.TEACHER) {
            throw new ForbiddenException("Teacher access is required.");
        }
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        List<TeacherAssignment> assignments = teacherAssignmentRepository
                .findByTeacherIdOrderByClassSubjectAssignmentClassLevelNameAscClassSubjectAssignmentSubjectNameAsc(actor.user().getId())
                .stream()
                .filter(assignment -> assignment.isActive()
                        && assignment.getTenant().getId().equals(actor.user().getTenant().getId())
                        && assignment.getSchool().getId().equals(activeSchoolId))
                .toList();
        return assignments.stream()
                .flatMap(assignment -> timetableEntryRepository.findBySchoolIdAndClassLevelIdOrderByWeekdayAscStartTimeAsc(
                                assignment.getSchool().getId(),
                                assignment.getClassSubjectAssignment().getClassLevel().getId()
                        )
                        .stream()
                        .filter(entry -> entry.getSubject() == null
                                || entry.getSubject().getId().equals(assignment.getClassSubjectAssignment().getSubject().getId())))
                .distinct()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> parentChildTimetable(AuthenticatedUser actor, String studentId) {
        Student student = requireParentLinkedStudent(actor, studentId);
        return timetableForStudent(student);
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> studentTimetable(AuthenticatedUser actor) {
        return timetableForStudent(requireStudentProfile(actor));
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

    private List<TimetableEntryResponse> timetableForStudent(Student student) {
        if (student.getClassLevel() == null) {
            return List.of();
        }
        return timetableEntryRepository.findBySchoolIdAndClassLevelIdOrderByWeekdayAscStartTimeAsc(
                        student.getSchool().getId(),
                        student.getClassLevel().getId()
                )
                .stream()
                .filter(entry -> entry.getSection() == null
                        || (student.getSection() != null && entry.getSection().getId().equals(student.getSection().getId())))
                .map(this::toResponse)
                .toList();
    }

    private Student requireParentLinkedStudent(AuthenticatedUser actor, String studentId) {
        if (actor.user().getRole() != UserRole.PARENT) {
            throw new ForbiddenException("Parent access is required.");
        }
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required for parent access.");
        }
        return parentStudentLinkRepository.findByParentUserIdAndStudentId(actor.user().getId(), studentId)
                .filter(link -> link.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getStudent().getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getSchool().getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getSchool().getId().equals(activeSchoolId))
                .map(link -> link.getStudent())
                .orElseThrow(() -> new ForbiddenException("Parent is not linked to this child."));
    }

    private Student requireStudentProfile(AuthenticatedUser actor) {
        if (actor.user().getRole() != UserRole.STUDENT) {
            throw new ForbiddenException("Student access is required.");
        }
        Student student = studentRepository.findByUserId(actor.user().getId())
                .filter(candidate -> candidate.getTenant().getId().equals(actor.user().getTenant().getId()))
                .orElseThrow(() -> new ForbiddenException("Student profile is not linked to this user."));
        requireActiveStudentSchool(actor, student);
        return student;
    }

    private void requireActiveStudentSchool(AuthenticatedUser actor, Student student) {
        if (actor.activeSchoolId() == null || actor.activeSchoolId().isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        if (!student.getSchool().getId().equals(actor.activeSchoolId())) {
            throw new ForbiddenException("Student profile is not linked to the active school.");
        }
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
