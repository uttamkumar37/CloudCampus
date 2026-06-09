package com.cloudcampus.operations.notice;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
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
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public NoticeService(
            NoticeRepository noticeRepository,
            ClassLevelRepository classLevelRepository,
            SectionRepository sectionRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            StudentRepository studentRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.noticeRepository = noticeRepository;
        this.classLevelRepository = classLevelRepository;
        this.sectionRepository = sectionRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.studentRepository = studentRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public NoticeResponse createSchoolNotice(AuthenticatedUser actor, NoticeRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        ClassLevel classLevel = resolveClassLevel(actor, school, request.classLevelId());
        Section section = resolveSection(classLevel, request.sectionId());
        Notice notice = noticeRepository.save(new Notice(
                school,
                classLevel,
                section,
                actor.user(),
                request.title().trim(),
                request.body().trim(),
                request.audience()
        ));
        recordNoticeCreated(actor.user(), notice);
        return toResponse(notice);
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> schoolNotices(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return noticeRepository.findBySchoolIdOrderByCreatedAtDesc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NoticeResponse schoolNotice(AuthenticatedUser actor, String noticeId) {
        Notice notice = requireNotice(noticeId);
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), notice.getSchool().getId());
        return toResponse(notice);
    }

    @Transactional
    public NoticeResponse publishSchoolNotice(AuthenticatedUser actor, String noticeId) {
        Notice notice = requireNotice(noticeId);
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), notice.getSchool().getId());
        notice.publish(actor.user(), Instant.now());
        recordNoticePublished(actor.user(), notice);
        return toResponse(notice);
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> teacherNotices(AuthenticatedUser actor) {
        if (actor.user().getRole() != UserRole.TEACHER) {
            throw new ForbiddenException("Teacher access is required.");
        }
        String activeSchoolId = activeTeacherSchoolId(actor);
        if (activeSchoolId == null) {
            return List.of();
        }
        Set<String> assignedClassLevelIds = activeTeacherClassLevelIds(actor, activeSchoolId);
        return noticeRepository.findBySchoolIdInAndStatusAndAudienceInOrderByPublishedAtDescCreatedAtDesc(
                        List.of(activeSchoolId),
                        NoticeStatus.PUBLISHED,
                        List.of(NoticeAudience.ALL, NoticeAudience.TEACHERS)
                )
                .stream()
                .filter(notice -> notice.getClassLevel() == null
                        || assignedClassLevelIds.contains(notice.getClassLevel().getId()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> parentChildNotices(AuthenticatedUser actor, String studentId) {
        Student student = requireParentLinkedToStudent(actor, studentId);
        return visibleStudentNotices(student, List.of(NoticeAudience.ALL, NoticeAudience.PARENTS));
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> studentNotices(AuthenticatedUser actor) {
        Student student = requireStudentProfile(actor);
        return visibleStudentNotices(student, List.of(NoticeAudience.ALL, NoticeAudience.STUDENTS));
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

    private ClassLevel resolveClassLevel(AuthenticatedUser actor, School activeSchool, String classLevelId) {
        if (classLevelId == null || classLevelId.isBlank()) {
            return null;
        }
        ClassLevel classLevel = classLevelRepository.findById(classLevelId)
                .orElseThrow(() -> new NotFoundException("Class was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), classLevel.getSchool().getId());
        if (!classLevel.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Class does not belong to the active school.");
        }
        return classLevel;
    }

    private Section resolveSection(ClassLevel classLevel, String sectionId) {
        if (sectionId == null || sectionId.isBlank()) {
            return null;
        }
        if (classLevel == null) {
            throw new ForbiddenException("A class is required when targeting a section.");
        }
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Section was not found."));
        if (!section.getClassLevel().getId().equals(classLevel.getId())
                || !section.getSchool().getId().equals(classLevel.getSchool().getId())) {
            throw new ForbiddenException("Section does not belong to this class.");
        }
        return section;
    }

    private Student requireParentLinkedToStudent(AuthenticatedUser actor, String studentId) {
        if (actor.user().getRole() != UserRole.PARENT) {
            throw new ForbiddenException("Parent access is required.");
        }
        return parentStudentLinkRepository.findByParentUserIdAndStudentId(actor.user().getId(), studentId)
                .filter(link -> link.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getStudent().getTenant().getId().equals(actor.user().getTenant().getId()))
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

    private List<NoticeResponse> visibleStudentNotices(Student student, List<NoticeAudience> audiences) {
        if (!student.isActive()) {
            return List.of();
        }
        return noticeRepository.findVisibleForStudent(
                        student.getSchool().getId(),
                        student.getClassLevel() == null ? null : student.getClassLevel().getId(),
                        student.getSection() == null ? null : student.getSection().getId(),
                        audiences
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String activeTeacherSchoolId(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        boolean hasAssignment = teacherAssignmentRepository
                .findByTeacherIdOrderByClassSubjectAssignmentClassLevelNameAscClassSubjectAssignmentSubjectNameAsc(
                        actor.user().getId()
                )
                .stream()
                .anyMatch(assignment -> assignment.isActive()
                        && assignment.getTenant().getId().equals(actor.user().getTenant().getId())
                        && assignment.getSchool().getId().equals(activeSchoolId));
        return hasAssignment ? activeSchoolId : null;
    }

    private Set<String> activeTeacherClassLevelIds(AuthenticatedUser actor, String activeSchoolId) {
        return teacherAssignmentRepository
                .findByTeacherIdOrderByClassSubjectAssignmentClassLevelNameAscClassSubjectAssignmentSubjectNameAsc(
                        actor.user().getId()
                )
                .stream()
                .filter(assignment -> assignment.isActive()
                        && assignment.getTenant().getId().equals(actor.user().getTenant().getId())
                        && assignment.getSchool().getId().equals(activeSchoolId))
                .map(assignment -> assignment.getClassSubjectAssignment().getClassLevel().getId())
                .collect(Collectors.toSet());
    }

    private Notice requireNotice(String noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() -> new NotFoundException("Notice was not found."));
    }

    private NoticeResponse toResponse(Notice notice) {
        ClassLevel classLevel = notice.getClassLevel();
        Section section = notice.getSection();
        return new NoticeResponse(
                notice.getId(),
                notice.getTenant().getId(),
                notice.getSchool().getId(),
                classLevel == null ? null : classLevel.getId(),
                classLevel == null ? null : classLevel.getName(),
                section == null ? null : section.getId(),
                section == null ? null : section.getName(),
                notice.getTitle(),
                notice.getBody(),
                notice.getAudience(),
                notice.getStatus(),
                notice.getCreatedByUser().getId(),
                notice.getPublishedByUser() == null ? null : notice.getPublishedByUser().getId(),
                notice.getCreatedAt(),
                notice.getPublishedAt()
        );
    }

    private void recordNoticeCreated(UserAccount actor, Notice notice) {
        auditLogService.record(
                notice.getTenant().getId(),
                notice.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.NOTICE_CREATED,
                "Notice",
                notice.getId(),
                "Notice created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", notice.getTenant().getId(),
                        "schoolId", notice.getSchool().getId(),
                        "noticeId", notice.getId(),
                        "audience", notice.getAudience().name(),
                        "classLevelId", notice.getClassLevel() == null ? "" : notice.getClassLevel().getId(),
                        "sectionId", notice.getSection() == null ? "" : notice.getSection().getId()
                )
        );
    }

    private void recordNoticePublished(UserAccount actor, Notice notice) {
        auditLogService.record(
                notice.getTenant().getId(),
                notice.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.NOTICE_PUBLISHED,
                "Notice",
                notice.getId(),
                "Notice published.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", notice.getTenant().getId(),
                        "schoolId", notice.getSchool().getId(),
                        "noticeId", notice.getId(),
                        "audience", notice.getAudience().name()
                )
        );
    }
}
