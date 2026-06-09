package com.cloudcampus.academic;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AcademicAssignmentService {

    private final SubjectRepository subjectRepository;
    private final ClassLevelRepository classLevelRepository;
    private final ClassSubjectAssignmentRepository classSubjectAssignmentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final UserAccountRepository userAccountRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public AcademicAssignmentService(
            SubjectRepository subjectRepository,
            ClassLevelRepository classLevelRepository,
            ClassSubjectAssignmentRepository classSubjectAssignmentRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            UserAccountRepository userAccountRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.subjectRepository = subjectRepository;
        this.classLevelRepository = classLevelRepository;
        this.classSubjectAssignmentRepository = classSubjectAssignmentRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.userAccountRepository = userAccountRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public SubjectResponse createSubject(AuthenticatedUser actor, SubjectRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        String code = normalizeCode(request.code());
        String name = request.name().trim();
        subjectRepository.findBySchoolIdAndCode(school.getId(), code)
                .ifPresent(existing -> {
                    throw new ConflictException("Subject code already exists for this school.");
                });

        Subject subject = subjectRepository.save(new Subject(school, code, name));
        recordSubject(actor.user(), subject);
        return toSubjectResponse(subject);
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> subjects(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return subjectRepository.findBySchoolIdOrderByNameAsc(school.getId())
                .stream()
                .map(this::toSubjectResponse)
                .toList();
    }

    @Transactional
    public ClassSubjectAssignmentResponse assignSubjectToClass(
            AuthenticatedUser actor,
            ClassSubjectAssignmentRequest request
    ) {
        ClassLevel classLevel = requireClassLevelSchoolAdminAccess(actor, request.classLevelId());
        Subject subject = requireSubjectSchoolAdminAccess(actor, request.subjectId());
        if (!classLevel.getSchool().getId().equals(subject.getSchool().getId())) {
            throw new ForbiddenException("Subject and class must belong to the same school.");
        }

        classSubjectAssignmentRepository.findByClassLevelIdAndSubjectId(classLevel.getId(), subject.getId())
                .ifPresent(existing -> {
                    throw new ConflictException("Subject is already assigned to this class.");
                });

        ClassSubjectAssignment assignment = classSubjectAssignmentRepository.save(
                new ClassSubjectAssignment(classLevel, subject)
        );
        recordClassSubject(actor.user(), assignment);
        return toClassSubjectAssignmentResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<ClassSubjectAssignmentResponse> classSubjectAssignments(AuthenticatedUser actor, String classLevelId) {
        ClassLevel classLevel = requireClassLevelSchoolAdminAccess(actor, classLevelId);
        return classSubjectAssignmentRepository.findByClassLevelIdOrderBySubjectNameAsc(classLevel.getId())
                .stream()
                .map(this::toClassSubjectAssignmentResponse)
                .toList();
    }

    @Transactional
    public TeacherAssignmentResponse assignTeacher(AuthenticatedUser actor, TeacherAssignmentRequest request) {
        ClassSubjectAssignment classSubject = requireClassSubjectSchoolAdminAccess(actor, request.classSubjectAssignmentId());
        UserAccount teacher = userAccountRepository.findById(request.teacherUserId())
                .orElseThrow(() -> new NotFoundException("Teacher user was not found."));
        if (teacher.getRole() != UserRole.TEACHER) {
            throw new ForbiddenException("User is not a teacher.");
        }
        if (!teacher.getTenant().getId().equals(classSubject.getTenant().getId())) {
            throw new ForbiddenException("Teacher and class subject assignment must belong to the same tenant.");
        }

        teacherAssignmentRepository.findByTeacherIdAndClassSubjectAssignmentId(teacher.getId(), classSubject.getId())
                .ifPresent(existing -> {
                    throw new ConflictException("Teacher is already assigned to this class subject.");
                });

        schoolAccessService.grantTeacherAccessIfMissing(classSubject.getSchool(), teacher);
        TeacherAssignment assignment = teacherAssignmentRepository.save(new TeacherAssignment(teacher, classSubject));
        recordTeacherAssignment(actor.user(), assignment);
        return toTeacherAssignmentResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> teacherAssignmentsForClass(AuthenticatedUser actor, String classLevelId) {
        ClassLevel classLevel = requireClassLevelSchoolAdminAccess(actor, classLevelId);
        return teacherAssignmentRepository.findByClassSubjectAssignmentClassLevelIdOrderByTeacherDisplayNameAsc(classLevel.getId())
                .stream()
                .map(this::toTeacherAssignmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> myAssignments(AuthenticatedUser teacher) {
        String activeSchoolId = requireActiveTeacherSchoolId(teacher);
        return teacherAssignmentRepository.findByTeacherIdOrderByClassSubjectAssignmentClassLevelNameAscClassSubjectAssignmentSubjectNameAsc(
                        teacher.user().getId()
                )
                .stream()
                .filter(assignment -> assignment.isActive()
                        && assignment.getTenant().getId().equals(teacher.user().getTenant().getId())
                        && assignment.getSchool().getId().equals(activeSchoolId))
                .map(this::toTeacherAssignmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> myAssignmentsForClass(AuthenticatedUser teacher, String classLevelId) {
        String activeSchoolId = requireActiveTeacherSchoolId(teacher);
        List<TeacherAssignment> assignments = teacherAssignmentRepository
                .findByTeacherIdAndClassSubjectAssignmentClassLevelIdOrderByClassSubjectAssignmentSubjectNameAsc(
                        teacher.user().getId(),
                        classLevelId
                )
                .stream()
                .filter(assignment -> assignment.isActive()
                        && assignment.getTenant().getId().equals(teacher.user().getTenant().getId())
                        && assignment.getSchool().getId().equals(activeSchoolId))
                .toList();
        if (assignments.isEmpty()) {
            throw new ForbiddenException("Teacher is not assigned to this class.");
        }
        return assignments.stream().map(this::toTeacherAssignmentResponse).toList();
    }

    @Transactional(readOnly = true)
    public TeacherAssignment requireTeacherAssignment(AuthenticatedUser teacher, String classLevelId, String subjectId) {
        String activeSchoolId = requireActiveTeacherSchoolId(teacher);
        return teacherAssignmentRepository
                .findByTeacherIdAndClassSubjectAssignmentClassLevelIdAndClassSubjectAssignmentSubjectId(
                        teacher.user().getId(),
                        classLevelId,
                        subjectId
                )
                .filter(assignment -> assignment.isActive()
                        && assignment.getTenant().getId().equals(teacher.user().getTenant().getId())
                        && assignment.getSchool().getId().equals(activeSchoolId))
                .orElseThrow(() -> new ForbiddenException("Teacher is not assigned to this class subject."));
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

    private ClassLevel requireClassLevelSchoolAdminAccess(AuthenticatedUser actor, String classLevelId) {
        ClassLevel classLevel = classLevelRepository.findById(classLevelId)
                .orElseThrow(() -> new NotFoundException("Class was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), classLevel.getSchool().getId());
        return classLevel;
    }

    private Subject requireSubjectSchoolAdminAccess(AuthenticatedUser actor, String subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NotFoundException("Subject was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), subject.getSchool().getId());
        return subject;
    }

    private ClassSubjectAssignment requireClassSubjectSchoolAdminAccess(AuthenticatedUser actor, String assignmentId) {
        ClassSubjectAssignment assignment = classSubjectAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Class subject assignment was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), assignment.getSchool().getId());
        return assignment;
    }

    private void requireTeacher(AuthenticatedUser teacher) {
        if (teacher.user().getRole() != UserRole.TEACHER) {
            throw new ForbiddenException("Teacher access is required.");
        }
    }

    private String requireActiveTeacherSchoolId(AuthenticatedUser teacher) {
        requireTeacher(teacher);
        String activeSchoolId = teacher.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolTeacherAccess(teacher.user().getId(), activeSchoolId);
        return activeSchoolId;
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private void recordSubject(UserAccount actor, Subject subject) {
        auditLogService.record(
                subject.getTenant().getId(),
                subject.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SUBJECT_CREATED,
                "Subject",
                subject.getId(),
                "Subject created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", subject.getTenant().getId(),
                        "schoolId", subject.getSchool().getId(),
                        "subjectId", subject.getId(),
                        "code", subject.getCode(),
                        "name", subject.getName()
                )
        );
    }

    private void recordClassSubject(UserAccount actor, ClassSubjectAssignment assignment) {
        auditLogService.record(
                assignment.getTenant().getId(),
                assignment.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.CLASS_SUBJECT_ASSIGNED,
                "ClassSubjectAssignment",
                assignment.getId(),
                "Subject assigned to class.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", assignment.getTenant().getId(),
                        "schoolId", assignment.getSchool().getId(),
                        "classLevelId", assignment.getClassLevel().getId(),
                        "subjectId", assignment.getSubject().getId()
                )
        );
    }

    private void recordTeacherAssignment(UserAccount actor, TeacherAssignment assignment) {
        auditLogService.record(
                assignment.getTenant().getId(),
                assignment.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.TEACHER_ASSIGNED,
                "TeacherAssignment",
                assignment.getId(),
                "Teacher assigned to class subject.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", assignment.getTenant().getId(),
                        "schoolId", assignment.getSchool().getId(),
                        "teacherUserId", assignment.getTeacher().getId(),
                        "classSubjectAssignmentId", assignment.getClassSubjectAssignment().getId(),
                        "classLevelId", assignment.getClassSubjectAssignment().getClassLevel().getId(),
                        "subjectId", assignment.getClassSubjectAssignment().getSubject().getId()
                )
        );
    }

    private SubjectResponse toSubjectResponse(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getTenant().getId(),
                subject.getSchool().getId(),
                subject.getCode(),
                subject.getName(),
                subject.isActive()
        );
    }

    private ClassSubjectAssignmentResponse toClassSubjectAssignmentResponse(ClassSubjectAssignment assignment) {
        return new ClassSubjectAssignmentResponse(
                assignment.getId(),
                assignment.getTenant().getId(),
                assignment.getSchool().getId(),
                assignment.getClassLevel().getId(),
                assignment.getClassLevel().getName(),
                assignment.getSubject().getId(),
                assignment.getSubject().getCode(),
                assignment.getSubject().getName(),
                assignment.isActive()
        );
    }

    private TeacherAssignmentResponse toTeacherAssignmentResponse(TeacherAssignment assignment) {
        ClassSubjectAssignment classSubject = assignment.getClassSubjectAssignment();
        return new TeacherAssignmentResponse(
                assignment.getId(),
                assignment.getTenant().getId(),
                assignment.getSchool().getId(),
                assignment.getTeacher().getId(),
                assignment.getTeacher().getDisplayName(),
                classSubject.getId(),
                classSubject.getClassLevel().getId(),
                classSubject.getClassLevel().getName(),
                classSubject.getSubject().getId(),
                classSubject.getSubject().getCode(),
                classSubject.getSubject().getName(),
                assignment.isActive()
        );
    }
}
